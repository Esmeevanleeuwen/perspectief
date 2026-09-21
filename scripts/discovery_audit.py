#!/usr/bin/env python3
"""Public-only discovery audit and retry sweep. Python standard library; no credentials.
Default is read-only. --submit sends only new/changed/removed public article URLs
via IndexNow, never private drafts and never a Google Indexing API request.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import sys
from html.parser import HTMLParser
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
MAX_BYTES = 8_000_000
ORIGIN = "https://meridiancollective.nl"
ENDPOINT = "https://api.indexnow.org/indexnow"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

def utcnow() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()

def article_url(url: str) -> bool:
    p = urlsplit(url)
    return (f"{p.scheme}://{p.netloc}" == ORIGIN and not p.query and not p.fragment
            and re.fullmatch(r"/artikelen/[a-z0-9]+(?:-[a-z0-9]+)*", p.path) is not None)

def sitemap_entries(xml: str) -> dict[str, str]:
    if "<!DOCTYPE" in xml.upper() or "<!ENTITY" in xml.upper():
        raise ValueError("XML met entiteiten/DTD niet toegestaan")
    root = ET.fromstring(xml)
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    if root.tag != ns + "urlset":
        raise ValueError("Geen geldige artikelsitemap")
    result = {}
    for item in root.findall(ns + "url"):
        url = (item.findtext(ns + "loc") or "").strip()
        if not article_url(url):
            raise ValueError("Onverwacht adres in artikelsitemap; geen meldingen verzonden")
        if url in result:
            raise ValueError("Dubbele URL in artikelsitemap")
        result[url] = (item.findtext(ns + "lastmod") or "").strip()
    if len(result) > 500:
        raise ValueError("Meer dan 500 artikelen: verdeel de controles over batches voordat je deze sweep uitbreidt")
    return result

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.meta = {}
        self.canonicals = []
        self.links = []
        self.images = []
        self.title = ""
        self.h1 = 0
        self.article = False
        self.body = []
        self.article_text = []
        self.script = None
        self.schemas = []
        self.schema_errors = 0
        self.section = None
        self.sections = []
    def handle_starttag(self, tag, attributes):
        a = dict(attributes)
        if tag == "meta":
            key = (a.get("name") or a.get("property") or "").lower()
            self.meta.setdefault(key, []).append(a.get("content", ""))
        if tag == "link" and "canonical" in (a.get("rel") or "").lower().split():
            self.canonicals.append(a.get("href", ""))
        if tag == "a": self.links.append(a.get("href", ""))
        if tag == "img": self.images.append(a)
        if tag == "h1": self.h1 += 1
        if tag == "article": self.article = True
        if tag == "script" and a.get("type") == "application/ld+json": self.script = []
        if tag == "section" and (a.get("id") or "").startswith("section-"):
            self.section = {"id": a["id"], "text": [], "depth": len(self.stack)}
        if tag not in VOID: self.stack.append(tag)
    def handle_data(self, value):
        tag = self.stack[-1] if self.stack else ""
        if tag == "title": self.title += value
        if tag == "script":
            if self.script is not None: self.script.append(value)
            return
        if tag in {"style", "noscript"}: return
        if self.article:
            self.body.append(value)
            if "header" not in self.stack and "h1" not in self.stack: self.article_text.append(value)
        if self.section is not None: self.section["text"].append(value)
    def handle_endtag(self, tag):
        if tag == "script" and self.script is not None:
            try: self.schemas.append(json.loads("".join(self.script)))
            except (ValueError, TypeError): self.schema_errors += 1
            self.script = None
        if tag in self.stack:
            index = len(self.stack) - 1 - self.stack[::-1].index(tag)
            if self.section is not None and tag == "section" and self.section["depth"] == index:
                self.sections.append(self.section)
                self.section = None
            self.stack = self.stack[:index]
        if tag == "article": self.article = False

def schema_objects(value):
    if isinstance(value, list):
        for item in value: yield from schema_objects(item)
    elif isinstance(value, dict):
        yield value
        if "@graph" in value: yield from schema_objects(value["@graph"])

def schema_type(obj: dict, wanted: set[str]) -> bool:
    value = obj.get("@type")
    return value in wanted if isinstance(value, str) else isinstance(value, list) and any(isinstance(x, str) and x in wanted for x in value)

def noindex(page: Page, headers: dict) -> bool:
    values = page.meta.get("robots", []) + page.meta.get("googlebot", []) + [headers.get("x-robots-tag", "")]
    return any(re.search(r"(?:^|[:,;\s])(?:noindex|none)(?:$|[,;\s])", value, re.I) for value in values)

def audit_page(url: str, status: int, html: str, headers: dict, final_url: str | None = None) -> dict:
    page = Page(); page.feed(html)
    result = {"url": url, "status": status, "errors": [], "warnings": [], "indexed": "unknown"}
    errors, warnings = result["errors"], result["warnings"]
    if status != 200: errors.append(f"HTTP {status}")
    if final_url and final_url != url: errors.append("URL verwijst door; controleer de sitemap")
    if noindex(page, headers): errors.append("Indexering wordt geblokkeerd met noindex/none")
    if page.canonicals != [url]: errors.append("Ontbrekende, dubbele of afwijkende canonical")
    if not "".join(page.article_text).strip(): errors.append("Geen leesbare artikeltekst in HTML")
    if not page.title.strip(): warnings.append("Paginatitel ontbreekt")
    if page.h1 != 1: warnings.append(f"Aantal H1-koppen: {page.h1}")
    descriptions = page.meta.get("description", [])
    if not descriptions or not descriptions[0].strip(): warnings.append("Zoekbeschrijving ontbreekt")
    elif len(descriptions[0]) > 220: warnings.append("Lange zoekbeschrijving; controleer leesbaarheid van het fragment")
    objects = [x for data in page.schemas for x in schema_objects(data)]
    articles = [x for x in objects if schema_type(x, {"Article", "NewsArticle", "BlogPosting"})]
    if not articles: warnings.append("Article-gegevens ontbreken")
    elif not articles[0].get("author"): warnings.append("Geen openbare auteur vastgelegd; niet automatisch invullen")
    if not any(schema_type(x, {"BreadcrumbList"}) for x in objects): warnings.append("BreadcrumbList ontbreekt")
    if page.schema_errors: warnings.append("Ongeldige JSON-LD")
    seen = {}
    for section in page.sections:
        text = " ".join("".join(section["text"]).split())
        if len(text) > 100 and text in seen:
            warnings.append(f"Dubbel tekstblok: {seen[text]} en {section['id']}")
        seen[text] = section["id"]
    body = " ".join(page.body)
    raw_urls = set(re.findall(r"https?://[^\s<>]+", body))
    if any(raw.rstrip(".,;!") not in page.links for raw in raw_urls):
        warnings.append("Mogelijk niet-aanklikbare bronadressen; controleer de bronverwijzingen")
    if any(image.get("src", "").startswith("http") and urlsplit(image["src"]).netloc != urlsplit(ORIGIN).netloc for image in page.images):
        warnings.append("Externe afbeelding: controleer beschikbaarheid en gebruiksrechten")
    result.update({"title": page.title, "description_length": len(descriptions[0]) if descriptions else 0,
                   "canonical": page.canonicals, "word_count": len(body.split())})
    return result

class SameOriginRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if urlsplit(newurl).scheme != "https" or urlsplit(newurl).netloc != urlsplit(ORIGIN).netloc:
            raise ValueError("Redirect buiten het vastgelegde domein geblokkeerd")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def download(url: str) -> tuple[int, str, dict, str]:
    if not url.startswith(ORIGIN + "/"):
        raise ValueError("Alleen het vastgelegde productiedomein mag worden gelezen")
    opener = build_opener(SameOriginRedirect())
    request = Request(url, headers={"User-Agent": "MeridianDiscoveryAudit/1.0", "Accept": "text/html,application/xml,text/plain"})
    try: response = opener.open(request, timeout=20)
    except HTTPError as error: response = error
    with response:
        body = response.read(MAX_BYTES + 1)
        if len(body) > MAX_BYTES: raise ValueError("Antwoord groter dan de controlelimiet")
        return response.code, body.decode("utf-8", errors="replace"), {k.lower(): v for k,v in response.headers.items()}, response.url

def fingerprint(lastmod: str) -> str:
    return hashlib.sha256(lastmod.encode()).hexdigest()

def changed_urls(entries: dict, state: dict) -> list[str]:
    return [url for url, modified in entries.items() if state.get(url, {}).get("fingerprint") != fingerprint(modified)]

def send(config: dict, urls: list[str]) -> int:
    if not urls or len(urls) > 1000 or not all(article_url(url) for url in urls):
        raise ValueError("Onveilige of te grote meldingsbatch")
    if config.get("endpoint") != ENDPOINT or config.get("origin") != ORIGIN or config.get("host") != urlsplit(ORIGIN).netloc:
        raise ValueError("Onverwachte IndexNow-configuratie")
    payload = {"host": config["host"], "key": config["key"], "keyLocation": f"{ORIGIN}/{config['key']}.txt", "urlList": urls}
    request = Request(ENDPOINT, data=json.dumps(payload).encode(), method="POST", headers={"Content-Type": "application/json; charset=utf-8"})
    # Never follow an indexing-provider redirect with this body.
    class NoRedirect(HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs): return None
    try:
        with build_opener(NoRedirect()).open(request, timeout=20) as response: return response.code
    except HTTPError as error: return error.code

def atomic_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)

def main(argv=None) -> int:
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--submit", action="store_true")
    args.add_argument("--state", type=Path, default=ROOT / ".seo-discovery/state.json")
    args.add_argument("--report", type=Path, default=ROOT / ".seo-discovery/report.json")
    options = args.parse_args(argv)
    report = {"checked_at": utcnow(), "origin": ORIGIN, "mode": "submit" if options.submit else "audit_only", "indexed": "unknown", "pages": [], "errors": [], "notifications": []}
    state = {}
    try:
        config = json.loads((ROOT / "src/lib/publishing/discovery-config.json").read_text())
        if not re.fullmatch(r"[a-f0-9]{32}", config.get("key", "")): raise ValueError("Ongeldige verificatiesleutel")
        if options.state.exists():
            saved = json.loads(options.state.read_text())
            if saved.get("schema") != 1 or saved.get("origin") != ORIGIN: raise ValueError("Onbekende bewaarde staat; eerst handmatig controleren")
            state = saved["urls"]
            if not isinstance(state, dict) or not all(article_url(url) for url in state): raise ValueError("Onveilige adressen in bewaarde staat")
        status, xml, _, _ = download(ORIGIN + "/artikelen/sitemap.xml")
        if status != 200: raise ValueError(f"Artikelsitemap geeft HTTP {status}; geen meldingen verzonden")
        entries = sitemap_entries(xml)
        status, robots, _, _ = download(ORIGIN + "/robots.txt")
        if status != 200: raise ValueError("robots.txt niet bereikbaar; geen meldingen verzonden")
        rules = RobotFileParser(); rules.parse(robots.splitlines())
        rss_status, rss, _, _ = download(ORIGIN + "/feed.xml")
        if rss_status != 200: report["errors"].append(f"RSS-feed: HTTP {rss_status}")
        else:
            if "<!ENTITY" in rss.upper() or "<!DOCTYPE" in rss.upper(): raise ValueError("Onverwachte XML in RSS-feed")
            ET.fromstring(rss)
        candidates = set(changed_urls(entries, state))
        ready = []
        for url in entries:
            try:
                code, html, headers, final_url = download(url)
                result = audit_page(url, code, html, headers, final_url)
                if not entries[url]: result["warnings"].append("lastmod ontbreekt; wijzigingsdetectie is beperkt")
                if not rules.can_fetch("Googlebot", url): result["errors"].append("Googlebot geblokkeerd in robots.txt")
                if not rules.can_fetch("bingbot", url): result["errors"].append("Bingbot geblokkeerd in robots.txt")
                if result["errors"]: report["errors"].append(f"Artikelcontrole mislukt: {url}")
                elif url in candidates: ready.append(url)
                report["pages"].append(result)
            except Exception as error:
                report["errors"].append(f"Controle mislukt: {url}: {type(error).__name__}")
        # Only previously submitted public URLs can become removal notifications.
        removals = []
        for url in state.keys() - entries.keys():
            try:
                code, html, headers, final_url = download(url)
                page = Page(); page.feed(html)
                if code in (404,410) or (code == 200 and (noindex(page, headers) or final_url != url or (page.canonicals and page.canonicals != [url]))):
                    removals.append(url)
                else: report["errors"].append(f"Verdwenen uit sitemap zonder bewezen intrekking: {url}")
            except Exception: report["errors"].append(f"Intrekking nog niet bevestigd: {url}")
        report["changed"] = ready; report["removed"] = removals
        if options.submit and (ready or removals):
            code, proof, _, _ = download(f"{ORIGIN}/{config['key']}.txt")
            if code != 200 or proof.strip() != config["key"]: raise ValueError("IndexNow-sleutelbestand niet live; geen meldingen verzonden")
            urls = ready + removals
            for start in range(0, len(urls), 1000):
                batch = urls[start:start+1000]
                http_status = send(config, batch)
                report["notifications"].append({"urls": batch, "http_status": http_status, "meaning": "received" if http_status == 200 else "key_validation_pending" if http_status == 202 else "retry_needed", "indexed": "unknown"})
                if http_status not in (200,202):
                    report["errors"].append(f"IndexNow HTTP {http_status}; volgende sweep probeert opnieuw")
                    continue
                for url in batch:
                    if url in entries: state[url] = {"fingerprint": fingerprint(entries[url]), "received_at": utcnow(), "http_status": http_status}
                    else: state.pop(url, None)
            atomic_json(options.state, {"schema": 1, "origin": ORIGIN, "urls": state})
        elif options.submit and not options.state.exists():
            atomic_json(options.state, {"schema": 1, "origin": ORIGIN, "urls": state})
    except Exception as error:
        report["errors"].append(f"{type(error).__name__}: {error}")
    atomic_json(options.report, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as file:
            file.write(f"## Vindbaarheid\nGecontroleerd: {len(report['pages'])} artikelen. Fouten: {len(report['errors'])}.\n\nIndexeringsstatus Google/Bing: **onbekend**. Een ontvangen IndexNow-melding is geen indexeringsbewijs.\n")
    return int(bool(report["errors"]))

if __name__ == "__main__": sys.exit(main())
