Ja. Ik zou nu **één vaste fictieve dataset nemen en die voor alle zes frames exact hetzelfde houden**. Alleen de representatie verandert. Daardoor kun je straks werkelijk vergelijken wat Network, NodeTrix, Sankey, Matrix, Chord en Time ieder zichtbaar maken.

Voor **01 — SAME DATA / NETWORK** zou ik hem niet als een standaard bolletjesnetwerk ontwerpen, maar als een hybride van **network graph + relationeel ERD + semantic zoom + evidence graph**.

Het frame moet tegelijk antwoord geven op:

> **Wat bestaat er? Wat hoort waarbij? Wat is direct verbonden? Welke tabellen voeden elkaar? Welke verbinding is feitelijk, afgeleid, sociaal of gedragsmatig? En waar kan ik verder inzoomen?**

Je lijst bevat hiervoor precies de relevante netwerkfamilies: gewone network graphs, directional network graphs, varianten met afbeeldingen en radial networks. 

---

# 01 — SAME DATA / NETWORK

## 1. De gedeelde testcase

Gebruik voor alle zes frames voorlopig één onderwerp:

# AI Regulation

Niet omdat dit inhoudelijk centraal moet blijven, maar omdat het genoeg soorten relaties heeft om het systeem te testen.

Dezelfde fictieve dataset bevat:

```text
EVENT
AI Regulation Act

TOPICS
AI
Privacy
Employment
Education
Elections

ARTICLES
Article 01
Article 02
Article 03

SOURCES
Source 01
Source 02
Source 03
Source 04

CLAIMS
Claim A
Claim B
Claim C

PLATFORMS
Meridian
Platform Alpha
Platform Beta

CONTEXTS
Artists
Students
Entrepreneurs
Privacy community

USERS
User 01
User 02
User 03
User 04
User 05

PERSPECTIVES
Perspective 01
Perspective 02
Perspective 03

NOTES
Note 01
Note 02

EXPOSURES
Exposure events

INTERACTIONS
Read
Save
Open source
Share

RESPONSES
Curious
Concerned
Confused

MISSIONS
Mission 01
```

Die data verandert de komende vijf frames **niet**.

---

# 2. De database eronder

Voordat je iets tekent zou ik deze hoofdtabellen definiëren:

```text
platforms
users
profiles

topics
events
articles
sources
claims

contexts
context_memberships

perspectives
notes

exposures
interactions
responses

missions

relations
```

En dan vooral één universele relationele laag:

```text
relations
```

met bijvoorbeeld:

```text
id

source_type
source_id

target_type
target_id

relation_family
relation_type

direction

weight
confidence
evidence_status

created_by
created_at
```

Dat is belangrijk, omdat je daarmee niet voor iedere nieuwe relatie een volledig nieuwe tabel hoeft te maken.

---

# 3. Maar niet álles moet in `relations`

Hier moet je vanaf het begin onderscheid maken.

### Structurele relatie

Bijvoorbeeld:

```text
article
→ topic
```

kan prima in:

```text
article_topics
```

### Operationele relatie

Bijvoorbeeld:

```text
user
→ article
→ read
```

hoort beter in:

```text
interactions
```

### Tijdelijke blootstelling

```text
user
→ article
→ shown
```

hoort in:

```text
exposures
```

### Universele semantische relatie

```text
claim A
→ contradicts
→ claim B
```

hoort juist in:

```text
relations
```

Dus:

```text
DATABASE
│
├── NORMAL TABLE RELATIONS
│
│   ├── article_topics
│   ├── article_sources
│   ├── context_memberships
│   └── mission_assignments
│
├── EVENT TABLES
│
│   ├── exposures
│   ├── interactions
│   └── responses
│
└── SEMANTIC GRAPH
    │
    └── relations
```

Dit is veel sterker dan proberen alles in één universele tabel te stoppen.

---

# 4. Het eerste frame wordt ongeveer zo opgebouwd

Niet meteen honderd nodes.

Gebruik drie zones.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ 01 — SAME DATA / NETWORK                     LENS: ALL       TIME: NOW      │
├───────────────┬──────────────────────────────────────────────┬───────────────┤
│               │                                              │               │
│ DATA LAYERS   │             RELATIONAL FIELD                 │ INSPECTOR     │
│               │                                              │               │
│ ● Entities    │                 ○ AI                         │ AI Regulation │
│ ● Evidence    │                /   \                         │               │
│ ● People      │          ■ Article  ● Privacy                │ Type: Event   │
│ ● Behaviour   │             │       \                        │               │
│ ● Meaning     │          ✦ Source    ◆ Claim                 │ Connected to  │
│ ● Platform    │             │         \                      │               │
│               │             │          ◉ Context             │ Sources       │
│ TABLES        │             │             \                  │ Claims        │
│               │           ⬡ User ────────◆ Perspective      │ Contexts      │
│ articles      │                                              │ People        │
│ users         │                         ▣ Platform            │               │
│ relations     │                                              │ Evidence      │
│ sources       │                                              │ status        │
│ ...           │                                              │               │
├───────────────┴──────────────────────────────────────────────┴───────────────┤
│ TABLE RELATION PATH: event → article → source → claim → perspective → user │
└──────────────────────────────────────────────────────────────────────────────┘
```

De linkerzijde is dus niet alleen filter.

Hij laat ook zien **welke databasefamilies op dit moment zichtbaar zijn**.

---

# 5. Nodevorm = tabel/objectfamilie

Gebruik niet twintig kleuren.

Gebruik eerst vorm.

Bijvoorbeeld:

```text
●   event
○   topic

■   article
▰   external content

✦   source
◆   claim

⬡   user
◉   context

◇   perspective
▣   platform

⬢   organisation
```

Dus wanneer je uitzoomt zie je nog steeds:

> daar zitten veel mensen
> daar zit content
> daar zit bewijs

zonder ieder label te hoeven lezen.

---

# 6. Kleur = informatiedomein, niet tabel

Dit is belangrijk.

Als vorm al zegt **wat het object is**, kan kleur iets anders zeggen:

```text
navy
algemene informatie

blue
technology

orange
economy / material

violet
politics / institutions

green
environment

rose
human experience

grey
unclassified / structural
```

Dan kan bijvoorbeeld:

```text
Article
Source
User
Perspective
```

allemaal blauw zijn wanneer ze rond technologie gaan.

Dat maakt clusters visueel begrijpelijk.

---

# 7. De lijn moet veel informatie dragen

Ik zou edges ongeveer zo coderen.

### Direct vastgelegd

```text
━━━━━━━━━━━━
```

Bijvoorbeeld:

```text
Article ━━━━━ Source
```

### Normale relatie

```text
────────────
```

### Afgeleid uit data

```text
· · · · · ·
```

### Hypothese

```text
- - - ? - -
```

### Tegenstrijdigheid

```text
─╳─────────
```

### Informatiestroom

```text
───────▶
```

### Wederzijdse sociale relatie

```text
◀──────▶
```

Dan hoeft kleur niet alles op te lossen.

---

# 8. Dikte krijgt één betekenis

Gebruik dikte uitsluitend voor:

# relation strength

Dus bijvoorbeeld:

```text
weak

────────

medium

━━━━━━

strong

════════
```

Niet soms views, soms confidence, soms importance.

Één visuele eigenschap = één vaste betekenis.

---

# 9. Transparantie = confidence

Dan kun je nog een dimensie kwijt.

```text
100%
zeer duidelijk

60%
waarschijnlijk

25%
zwakke/inferred relatie
```

Visueel:

```text
A ━━━━━━━━━ B

A ──────── B

A · · · · B
```

Daardoor kun je onderliggende connecties laten zien zonder ze als bewezen feiten neer te zetten.

---

# 10. Animatie = actuele activiteit

Dit hoeft nog niet voor je Figma prototype te bewegen.

Maar geef het al aan.

Een stilstaande edge:

```text
A ───────── B
```

betekent:

> relatie bestaat.

Een bewegend punt:

```text
A ───•────▶ B
```

betekent:

> er beweegt momenteel informatie.

Veel flow:

```text
A ═•═•═•═•▶ B
```

Daardoor hoef je later niet iedere view of share als aparte edge te tekenen.

---

# 11. De netwerkstructuur zelf

Gebruik niet één centrale node met alles eromheen.

Maak eerder meerdere zwaartepunten.

Bijvoorbeeld:

```text
                           ○ Privacy
                         ╱     │
                    ◆ Claim A  │
                       │       │
✦ Source A ━━━━━━━ ■ Article A │
                       │       │
                       ▼       │
                  ● AI Regulation
                    ╱    │      ╲
                   ╱     │       ╲
           ○ Employment  │       ○ Elections
                 │       │
                 │       ▼
                 │    ◉ Artists
                 │      ╱   ╲
                 │     ╱     ╲
              ◇ Perspective  ⬡ User
                                │
                                ▼
                              ▣ Alpha
```

Belangrijk:

**AI Regulation staat niet letterlijk altijd in het midden.**

De geselecteerde lens bepaalt het zwaartepunt.

---

# 12. Tabellen worden ook selecteerbare “containers”

Dit is wat ik zou toevoegen omdat jij specifiek tussen tabellen onderling wilt kunnen werken.

Aan de linkerkant:

```text
TABLES

▣ articles                128
▣ sources                 417
▣ claims                  286
▣ topics                   63
▣ users                 4.821
▣ contexts                 38
▣ perspectives            963
▣ exposures           182.411
▣ interactions         54.902
```

Wanneer je bijvoorbeeld:

```text
articles
```

en:

```text
sources
```

selecteert, verdwijnt al het andere.

Dan wordt je netwerk:

```text
ARTICLE A ━━━━━ SOURCE 1
    │  ╲
    │   ╲━━━━━ SOURCE 2
    │
ARTICLE B ━━━━━ SOURCE 3
```

Selecteer:

```text
contexts
+
users
```

dan:

```text
CONTEXT A
 ├── User 1
 ├── User 2
 └── User 4

CONTEXT B
 ├── User 3
 └── User 5
```

Dit betekent dat **dezelfde network-interface ook een relationele database explorer wordt**.

---

# 13. En tussen tabellen zelf teken je een tweede soort graph

Dus eigenlijk bestaat Frame 01 uit twee zoomniveaus.

## Object graph

```text
Article 27
→ Source 17
```

## Schema graph

```text
ARTICLES
→ ARTICLE_SOURCES
→ SOURCES
```

Je moet ertussen kunnen schakelen:

```text
[ DATA ] [ SCHEMA ]
```

---

# 14. SCHEMA-view

Wanneer je `SCHEMA` activeert:

```text
┌──────────────┐
│   articles   │
├──────────────┤
│ id           │
│ title        │
│ author_id    │
│ event_id     │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│ article_sources  │
├──────────────────┤
│ article_id       │
│ source_id        │
│ relation_type    │
└──────┬───────────┘
       │
       │ N:1
       ▼
┌──────────────┐
│   sources    │
├──────────────┤
│ id           │
│ url          │
│ publisher    │
└──────────────┘
```

En daarnaast:

```text
articles
    │
    ├──── article_topics ──── topics
    │
    ├──── perspectives ────── users
    │
    ├──── exposures ───────── users
    │
    └──── interactions ────── users
```

---

# 15. Ik zou tabellen in zes families groeperen

Niet zestig tabellen los laten zweven.

## A — Identity

```text
users
profiles
roles
capabilities
user_capabilities
```

## B — Knowledge

```text
articles
topics
events
claims
sources
```

## C — Meaning

```text
perspectives
responses
notes
interpretations
```

## D — Social

```text
contexts
context_memberships
messages
follows
```

## E — Behaviour

```text
exposures
interactions
actions
```

## F — System

```text
platforms
missions
relations
audit_logs
```

Visueel:

```text
╭ IDENTITY ─────────╮

 users ─ profiles
   │
 roles

╰───────────────────╯


╭ KNOWLEDGE ─────────────╮

 events ─ articles ─ sources
     ╲      │
      topics
           ╲
            claims

╰────────────────────────╯
```

En vervolgens edges **tussen** de families.

---

# 16. Dat geeft een veel belangrijker overzicht

Op hoog niveau zie je:

```text
IDENTITY
   │
   │ creates
   ▼
KNOWLEDGE
   │
   │ produces
   ▼
MEANING
   │
   │ changes
   ▼
BEHAVIOUR
   │
   │ reorganises
   ▼
SOCIAL
   │
   │ becomes
   ▼
SYSTEM / ENVIRONMENT
   │
   └───────────────▶ IDENTITY / EXPOSURE
```

Dit begint al veel sterker jouw theorie te weerspiegelen.

---

# 17. Binnen iedere familie zie je weer hetzelfde

Bijvoorbeeld `Knowledge` openklappen:

```text
EVENT
   ↓
ARTICLE
   ↓
CLAIM
   ↓
SOURCE
```

Maar eigenlijk:

```text
               SOURCE
                  ▲
                  │
EVENT ──▶ ARTICLE ──▶ CLAIM
  │          │           │
  ▼          ▼           ▼
TOPIC     CONTEXT     RELATION
```

Dus ook lokaal ontstaat weer een netwerk.

---

# 18. Cross-table verbindingen

Dit zou ik expliciet op het frame zetten.

Bijvoorbeeld:

```text
users.id
     │
     ├──────── articles.author_id
     │
     ├──────── perspectives.user_id
     │
     ├──────── notes.user_id
     │
     ├──────── interactions.user_id
     │
     └──────── exposures.user_id
```

Of vanuit artikel:

```text
articles.id
     │
     ├──── article_sources.article_id
     ├──── article_topics.article_id
     ├──── perspectives.article_id
     ├──── exposures.node_id
     ├──── interactions.node_id
     └──── relations.source_id / target_id
```

Hiermee kun je in één oogopslag zien:

> welke tabel wordt het centrale kruispunt?

---

# 19. En ik zou voorkomen dat `articles` het kruispunt wordt

Waarschijnlijk moet het centrale structurele object uiteindelijk:

```text
nodes
```

of:

```text
entities
```

zijn.

Bijvoorbeeld:

```text
entities

id
entity_type
created_at
```

Dan:

```text
article
  └── entity_id

topic
  └── entity_id

event
  └── entity_id

source
  └── entity_id

perspective
  └── entity_id
```

En:

```text
relations

source_entity_id
target_entity_id
```

Dan kan werkelijk ieder type met ieder ander type verbonden worden.

---

# 20. Conceptueel dus

```text
                       ENTITY
                         │
       ┌─────────────────┼──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
    ARTICLE            EVENT              USER
       │                 │                  │
       ▼                 ▼                  ▼
  ARTICLE_DATA      EVENT_DATA         USER_DATA

                         │
                         ▼
                     RELATIONS
                    ╱    │     ╲
                   ╱     │      ╲
             evidence  social   causal
```

Dat is veel schaalbaarder.

---

# 21. Maar relationele eigenschappen blijven in echte tabellen

Dus niet alles als JSON in `entities`.

Bijvoorbeeld:

```text
entities
id = 123
type = article
```

en:

```text
articles
entity_id = 123
title
slug
status
author
```

Dat is veel beter dan:

```text
entities.data = {
  "title": "...",
  "author": "..."
}
```

voor alles.

---

# 22. Detailpanel rechts

Wanneer je een node selecteert:

```text
ARTICLE 27
```

moet rechts verschijnen:

```text
ARTICLE 27
Why AI regulation...

ENTITY
article

TABLE
articles

PRIMARY KEY
entity_id = 27


DIRECT RELATIONS

3 Sources
4 Topics
1 Event
27 Perspectives
843 Exposures


DERIVED RELATIONS

2 Context bridges
1 Similar article
3 Possible claims


BEHAVIOUR

12.481 shown
4.817 opened
942 sources opened
311 saved


[ TRACE RELATIONS ]
[ VIEW TABLE ]
[ OPEN STORY ]
```

Hierdoor verbind je **visueel ontwerp en databaseontwerp**.

---

# 23. Trace relations

Dit wordt één van de krachtigste functies.

Stel je kiest:

```text
User 183
```

en:

```text
Source 49
```

dan:

```text
TRACE PATH
```

kan opleveren:

```text
User 183
  ↓ saw
Article 27
  ↓ references
Claim 18
  ↓ supported_by
Source 49
```

Of:

```text
User
→ Context
→ Article
→ Event
→ Source
```

Dit maakt de graph letterlijk een manier om causale/informatieve routes te onderzoeken.

---

# 24. Eén heel belangrijk onderscheid

De graph moet altijd expliciet onderscheid maken tussen:

### Database relation

```text
articles.author_id
→ users.id
```

en:

### World relation

```text
Person A
→ works_for
→ Organisation B
```

Die zijn totaal verschillend.

Ik zou daarom in je ontwerp linksboven een switch zetten:

```text
RELATION TYPE

[ WORLD ]
[ DATABASE ]
[ BOTH ]
```

Bij `WORLD` zie je de inhoudelijke werkelijkheid.

Bij `DATABASE` de tabellen.

Bij `BOTH` overlappen ze.

**Dit is volgens mij een van de meest interessante onderdelen van jouw hele masterboard.**

---

# 25. BOTH-view

Bijvoorbeeld:

```text
WORLD

⬡ Esmee ─── wrote ─── ■ Article 27


DATABASE

users.id
   │
   ▼
articles.author_id
```

Je kunt dat letterlijk boven elkaar tekenen:

```text
⬡ Esmee
   │
   │ wrote
   ▼
■ Article 27
   │
   │
   ├ · · · database relation · · ·
   │
users.id ───────── articles.author_id
```

Daardoor zie je:

> de technische relatie bestaat omdat er in de werkelijke informatiewereld een relatie bestaat.

Dat is precies het soort overlap tussen wireframe/ERD/conceptmap dat je zoekt.

---

# 26. Bottom strip: dezelfde data die later naar de andere frames gaat

Onderaan Frame 01 zou ik dit al zetten:

```text
CURRENT DATA PROJECTION

Entities                 6.942
Relations               21.418
Interactions            54.902
Exposures              182.411
Contexts                     38

CURRENT REPRESENTATION
NETWORK


NEXT REPRESENTATIONS

02 NodeTrix
03 Sankey
04 Matrix
05 Chord
06 Time
```

Zo maak je duidelijk:

**de data blijft hetzelfde. Alleen de projectie verandert.**

---

# 27. Het frame volledig samengevat

Ik zou Frame 01 uiteindelijk ongeveer deze zones geven:

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ 01 SAME DATA / NETWORK      WORLD | DATABASE | BOTH            TIME: NOW     │
├───────────────┬───────────────────────────────────────────────┬───────────────┤
│ LAYERS        │                                               │ INSPECTOR     │
│               │                                               │               │
│ entities      │          WORLD NETWORK                        │ selected node │
│ evidence      │                                               │               │
│ behaviour     │              ● Event                          │ metadata      │
│ social        │             ╱ │ ╲                             │ relations     │
│ meaning       │       ■ Article ○ Topic                       │ table         │
│ platform      │        │      ╲                               │ confidence    │
│               │       ✦ Source ◇ Perspective                  │ activity      │
│ TABLES        │                    │                          │               │
│               │                   ⬡ User                      │ TRACE         │
│ users         │                    │                          │               │
│ articles      │                   ▣ Platform                  │ → Article     │
│ sources       │                                               │ → Source      │
│ contexts      │                                               │ → User        │
│ relations     │                                               │               │
├───────────────┴───────────────────────────────────────────────┴───────────────┤
│ DATABASE PATH                                                               │
│ users.id → articles.author_id → article_sources → sources.id                │
├───────────────────────────────────────────────────────────────────────────────┤
│ entities 6.9k | relations 21k | events 237k        NEXT: 02 NODETRIX →      │
└───────────────────────────────────────────────────────────────────────────────┘
```

## En de belangrijkste regel voor dit eerste frame

**Niet proberen alle informatie tegelijk zichtbaar te maken.**

Frame 01 moet vooral vier dingen extreem goed laten zien:

1. **welke objecten bestaan;**
2. **hoe individuele objecten inhoudelijk verbonden zijn;**
3. **welke tabellen deze objecten technisch dragen;**
4. **hoe een inhoudelijke relatie terug te volgen is naar een database-relatie en andersom.**

Pas in **02 — SAME DATA / NODETRIX** veranderen we precies dezelfde data zodat de interne structuur van dichte groepen en tabellen zichtbaar wordt zonder duizenden gekruiste lijnen. Dat tweede frame moet dus letterlijk uit dit eerste voortkomen, niet opnieuw beginnen.
