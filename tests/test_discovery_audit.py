"""Offline contract and integration tests. No live HTTP or account access."""
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from contextlib import redirect_stdout
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('audit',ROOT/'scripts/discovery_audit.py')
audit=importlib.util.module_from_spec(spec);spec.loader.exec_module(audit)
URL=audit.ORIGIN+'/artikelen/test-artikel'
DATE='2026-09-21T10:00:00Z'
KEY=json.loads((ROOT/'src/lib/publishing/discovery-config.json').read_text())['key']
def xml(entries=None):
    entries={URL:DATE} if entries is None else entries
    return '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{url}</loc><lastmod>{date}</lastmod></url>' for url,date in entries.items())+'</urlset>'
def html(url=URL,extra='',content='Een openbare artikeltekst.'):
    return f'<html><head><title>Titel</title><meta name="description" content="Korte beschrijving"><link rel="canonical" href="{url}">{extra}<script type="application/ld+json">{{"@type":["Article","CreativeWork"]}}</script><script type="application/ld+json">{{"@type":"BreadcrumbList"}}</script></head><body><article><h1>Titel</h1>{content}</article></body></html>'
class Tests(unittest.TestCase):
    def test_url_restrictions(self):
        self.assertTrue(audit.article_url(URL))
        for url in [audit.ORIGIN+'/admin/a',URL+'?draft=1',URL+'#secret','https://evil.test/artikelen/x',audit.ORIGIN+'@evil.test/artikelen/x']:
            self.assertFalse(audit.article_url(url))
    def test_sitemap_parser(self):
        self.assertEqual(audit.sitemap_entries(xml()),{URL:DATE})
        for value in ['<!DOCTYPE a>'+xml(),xml({'https://evil.test/artikelen/a':DATE}),xml().replace('</urlset>',f'<url><loc>{URL}</loc></url></urlset>')]:
            with self.assertRaises(ValueError):audit.sitemap_entries(value)
    def test_schema_arrays_are_supported_and_not_indexing_proof(self):
        result=audit.audit_page(URL,200,html(),{},URL)
        self.assertEqual(result['errors'],[]);self.assertEqual(result['indexed'],'unknown')
        self.assertFalse(any('Article-gegevens ontbreken' in x for x in result['warnings']))
        self.assertTrue(any('auteur' in x for x in result['warnings']))
    def test_noindex_errors(self):
        for content,headers in [(html(extra='<meta name="robots" content="noindex,follow">'),{}),(html(),{'x-robots-tag':'noindex'}),(html(extra='<meta name="googlebot" content="none">'),{})]:
            self.assertTrue(any('geblokkeerd' in x for x in audit.audit_page(URL,200,content,headers)['errors']))
    def test_http_and_canonical_and_empty_body_are_errors(self):
        for status,content in [(404,html()),(200,html(url='https://evil.test/x')),(200,'<title>A</title>')]:
            self.assertTrue(audit.audit_page(URL,status,content,{})['errors'])
    def test_duplicate_block_is_warning_not_a_mutation(self):
        text='Dezelfde lange tekst. '*20
        source=html(content=f'<section id="section-a"><p>{text}</p></section><section id="section-b"><p>{text}</p></section>')
        result=audit.audit_page(URL,200,source,{})
        self.assertEqual(result['errors'],[]);self.assertTrue(any('Dubbel tekstblok' in x for x in result['warnings']));self.assertEqual(source.count(text),2)
    def test_javascript_payload_is_not_counted_as_article_body(self):
        result=audit.audit_page(URL,200,html(content='<script>fakearticle</script>').replace('<h1>Titel</h1>',''),{})
        self.assertTrue(any('artikeltekst' in x for x in result['errors']))
    def test_new_changed_and_unchanged_fingerprints(self):
        state={URL:{'fingerprint':audit.fingerprint(DATE)}}
        self.assertEqual(audit.changed_urls({URL:DATE},state),[])
        self.assertEqual(audit.changed_urls({URL:'new'},state),[URL])
    def run_sweep(self,*,submit=False,state=None,entries=None,reply=200,page_status=200,page_html=None,proof=KEY):
        folder=tempfile.TemporaryDirectory();self.addCleanup(folder.cleanup);root=Path(folder.name)
        statefile=root/'state.json';reportfile=root/'report.json'
        if state is not None:statefile.write_text(json.dumps({'schema':1,'origin':audit.ORIGIN,'urls':state}))
        def download(url):
            if url.endswith('/artikelen/sitemap.xml'):return 200,xml(entries),{},url
            if url.endswith('/robots.txt'):return 200,'User-agent: *\nAllow: /',{},url
            if url.endswith('/feed.xml'):return 200,'<rss version="2.0"><channel/></rss>',{},url
            if url.endswith('.txt'):return 200,proof,{},url
            return page_status,page_html if page_html is not None else html(url),{},url
        args=['--state',str(statefile),'--report',str(reportfile)]+(['--submit'] if submit else [])
        with patch.object(audit,'download',side_effect=download),patch.object(audit,'send',return_value=reply) as send,redirect_stdout(io.StringIO()):
            code=audit.main(args);calls=send.call_args_list
        return code,json.loads(reportfile.read_text()),json.loads(statefile.read_text()) if statefile.exists() else None,calls
    def test_default_dry_run_does_not_submit_or_write_state(self):
        code,report,state,calls=self.run_sweep()
        self.assertEqual(code,0);self.assertIsNone(state);self.assertEqual(calls,[]);self.assertEqual(report['mode'],'audit_only')
    def test_received_is_not_indexed_and_duplicate_sweep_is_skipped(self):
        code,report,state,calls=self.run_sweep(submit=True)
        self.assertEqual(code,0);self.assertEqual(len(calls),1);self.assertEqual(report['notifications'][0]['indexed'],'unknown')
        code,report,state,calls=self.run_sweep(submit=True,state=state['urls'])
        self.assertEqual(calls,[])
    def test_pending_key_status_is_reported_separately(self):
        code,report,state,calls=self.run_sweep(submit=True,reply=202)
        self.assertEqual(report['notifications'][0]['meaning'],'key_validation_pending');self.assertEqual(report['indexed'],'unknown')
    def test_failed_submission_remains_retryable(self):
        code,report,state,calls=self.run_sweep(submit=True,reply=429)
        self.assertEqual(code,1);self.assertEqual(state['urls'],{});self.assertEqual(report['notifications'][0]['meaning'],'retry_needed')
    def test_wrong_key_blocks_submission(self):
        code,report,state,calls=self.run_sweep(submit=True,proof='wrong')
        self.assertEqual(code,1);self.assertEqual(calls,[])
    def test_broken_article_never_notified(self):
        code,report,state,calls=self.run_sweep(submit=True,page_status=500)
        self.assertEqual(code,1);self.assertEqual(calls,[])
    def test_previously_known_url_can_be_removed_after_verified_404(self):
        state={URL:{'fingerprint':audit.fingerprint(DATE)}}
        code,report,state,calls=self.run_sweep(submit=True,state=state,entries={},page_status=404)
        self.assertEqual(code,0);self.assertEqual(report['removed'],[URL]);self.assertEqual(state['urls'],{})
    def test_sitemap_disappearance_is_not_sufficient_to_assume_removal(self):
        old={URL:{'fingerprint':audit.fingerprint(DATE)}}
        code,report,state,calls=self.run_sweep(submit=True,state=old,entries={})
        self.assertEqual(code,1);self.assertEqual(calls,[]);self.assertEqual(state['urls'],old)
    def test_outside_origin_redirect_is_refused(self):
        with self.assertRaises(ValueError):audit.SameOriginRedirect().redirect_request(None,None,302,'',{},'https://evil.test/x')
    def test_submit_cannot_send_a_private_url(self):
        config=json.loads((ROOT/'src/lib/publishing/discovery-config.json').read_text())
        with self.assertRaises(ValueError):audit.send(config,[audit.ORIGIN+'/admin/content/secret'])
if __name__=='__main__':unittest.main()
