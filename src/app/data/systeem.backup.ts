export type SystemSource = {
  id: string;
  title: string;
  type: string;
  description: string;
};

export type SystemSection = {
  id: string;
  title: string;
  paragraphs: string[];
  formula?: string;
  points?: string[];
};

export type SystemPage = {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  concepts: string[];
  sourceIds: string[];
  sections: SystemSection[];
};

export const systemSources: SystemSource[] = [
  {
    id: "theorie",
    title: "Evolutionaire uitwerking",
    type: "Theoretische basis",
    description:
      "De basis voor informatie, emotie, sociale intuïtie, groepsvorming, logica en collectieve informatieverwerking.",
  },
  {
    id: "meridian",
    title: "Meridian / Perspectief",
    type: "Platformmodel",
    description:
      "De vertaling van de theorie naar journalistiek, perspectieven, een knowledge graph en een infrastructuur voor begrip.",
  },
  {
    id: "techniek",
    title: "Technische uitwerking",
    type: "AI en systeemarchitectuur",
    description:
      "De technische uitwerking van persoonlijke informatieroutes, informational completeness, de state engine en de action graph.",
  },
  {
    id: "ontwerp",
    title: "Visuele uitwerking",
    type: "Ontwerp",
    description:
      "De visuele vertaling van perspectieven, verbindingen, kaarten, kunst en relationele informatie.",
  },
  {
    id: "identiteit",
    title: "Meridian Brand Identity",
    type: "Identiteit",
    description:
      "De visuele identiteit rond Meridian, het individu, verbinding en de wereld als netwerk.",
  },
];

export const systemPages: SystemPage[] = [
  {
    slug: "informatie-en-betekenis",
    eyebrow: "Fundament",
    title: "Informatie en betekenis",
    summary:
      "Informatie is niet simpelweg alles wat aanwezig is. Een verschil wordt pas betekenisvol wanneer het iets verandert in waarneming, verwachting of handelen.",
    concepts: [
      "informatie",
      "relevantie",
      "waarneming",
      "betekenis",
      "selectie",
      "verwachting",
    ],
    sourceIds: ["theorie", "meridian"],
    sections: [
      {
        id: "relevant-verschil",
        title: "Informatie begint bij een relevant verschil",
        paragraphs: [
          "Een organisme bevindt zich voortdurend in een omgeving waarin meer gebeurt dan het tegelijk kan verwerken. Waarneming moet daarom selecteren.",
          "Een verandering die wel aanwezig is maar intern niets verandert, functioneert op dat moment niet als betekenisvolle informatie. Informatie ontstaat wanneer een verschil aandacht, lichamelijke toestand, verwachting of handelingsrichting verandert.",
          "Betekenis zit daardoor niet alleen in de gebeurtenis zelf. Zij ontstaat in de verhouding tussen de gebeurtenis en degene die haar waarneemt.",
        ],
        formula:
          "omgeving → waarneming → relevantieselectie → verandering → betekenis → handelingsmogelijkheid",
      },
      {
        id: "onvolledig-beeld",
        title: "Niemand ontvangt het volledige beeld",
        paragraphs: [
          "Iedere waarneming is noodzakelijk een selectie. Niet iedereen bevindt zich op dezelfde plaats, ziet dezelfde gevolgen of ontvangt dezelfde informatie.",
          "Dat betekent niet automatisch dat iedere interpretatie even juist is. Het betekent wel dat verschillende posities toegang kunnen geven tot verschillende delen van dezelfde werkelijkheid.",
          "Meridian begint daarom niet bij de veronderstelling dat één persoon of één artikel het gehele systeem kan bevatten.",
        ],
      },
      {
        id: "toekomst",
        title: "Betekenis bevat een verwachting",
        paragraphs: [
          "Informatie wordt relevant omdat zij verbonden raakt met wat er mogelijk gaat gebeuren. Een organisme hoeft niet eerst volledige zekerheid te hebben om zich op een verandering voor te bereiden.",
          "Waarneming bevat daarom altijd een toekomstige richting: wat betekent deze verandering mogelijk voor de bestaande verhouding?",
        ],
      },
    ],
  },

  {
    slug: "emotie-en-sociale-intuitie",
    eyebrow: "Menselijke verwerking",
    title: "Emotie en sociale intuïtie",
    summary:
      "Emotie kan worden begrepen als geïntegreerde informatie: meerdere signalen worden samengebracht tot een gevoelde verandering van een verhouding.",
    concepts: [
      "emotie",
      "sociale intuïtie",
      "informatie",
      "groep",
      "verwachting",
      "relatie",
      "ervaring",
    ],
    sourceIds: ["theorie", "meridian"],
    sections: [
      {
        id: "emotie",
        title: "Emotie als geïntegreerde informatie",
        paragraphs: [
          "Emotie ontstaat niet pas nadat een situatie volledig rationeel is geanalyseerd. Verschillende informatiedelen kunnen eerst gezamenlijk een verandering veroorzaken in aandacht, lichaam, verwachting en handelingsbereidheid.",
          "De afzonderlijke oorzaak van een gevoel hoeft daardoor nog niet duidelijk te zijn, terwijl de verandering in de ervaren verhouding wel werkelijk aanwezig kan zijn.",
        ],
        formula:
          "meerdere veranderingen → geïntegreerde betekenis → verwachting → handelingsrichting",
      },
      {
        id: "oorzaak",
        title: "Een gevoel en zijn verklaring zijn niet hetzelfde",
        paragraphs: [
          "Een emotionele toestand kan correct aangeven dat een verhouding is veranderd zonder automatisch te bewijzen waardoor die verandering is ontstaan.",
          "Daarom maakt Meridian onderscheid tussen de waargenomen verandering, de betekenis die iemand eraan geeft en de causale verklaring die vervolgens wordt gevormd.",
        ],
        points: [
          "Wat werd waargenomen?",
          "Wat veranderde er voor iemand?",
          "Welke verklaring wordt daaraan gekoppeld?",
          "Welk bewijs ondersteunt die verklaring?",
        ],
      },
      {
        id: "sociale-intuitie",
        title: "Sociale intuïtie voorspelt relaties",
        paragraphs: [
          "In groepen wordt het gedrag van anderen zelf informatie. Mensen reageren niet alleen op wat iemand nu doet, maar ook op wat die reactie waarschijnlijk betekent voor de volgende toestand van de verhouding.",
          "Door herhaling ontstaan geïntegreerde verwachtingen over acceptatie, conflict, samenwerking, afwijzing en andere relationele gevolgen.",
        ],
        formula:
          "waarneming → verwachting van reactie → eigen aanpassing → nieuwe reactie → aangepaste verwachting",
      },
    ],
  },

  {
    slug: "groepsverwerking-en-logica",
    eyebrow: "Collectieve betekenis",
    title: "Groepsverwerking en logica",
    summary:
      "Groepen verwerken informatie door elkaars reacties voortdurend opnieuw als informatie te gebruiken. Dat maakt samenwerking mogelijk, maar kan ook bepalen welke informatie zichtbaar blijft.",
    concepts: [
      "groep",
      "logica",
      "norm",
      "informatie",
      "collectieve betekenis",
      "selectie",
      "sociale intuïtie",
    ],
    sourceIds: ["theorie"],
    sections: [
      {
        id: "groep",
        title: "De groep als informatieverwerkend systeem",
        paragraphs: [
          "Een groep bestaat niet alleen uit individuen die naast elkaar staan. De verwerking van het ene individu verandert de informatieomgeving van de anderen.",
          "Een reactie wordt expressie, expressie wordt door anderen waargenomen en hun reactie wordt vervolgens opnieuw informatie voor de oorspronkelijke persoon.",
        ],
        formula:
          "externe verandering → individuele verwerking → expressie → sociale terugkoppeling → aangepaste verwerking",
      },
      {
        id: "collectieve-selectie",
        title: "Niet alle informatie bereikt de groep",
        paragraphs: [
          "Wat iemand waarneemt is niet automatisch beschikbaar voor de groep. Informatie kan verdwijnen wanneer zij niet wordt uitgesproken, niet wordt herkend of geen sociale bevestiging krijgt.",
          "Collectieve betekenis is daarom niet simpelweg de optelsom van alles wat individuen weten. Zij bestaat uit informatie die door voldoende sociale terugkoppelingen heen behouden blijft.",
        ],
      },
      {
        id: "normen",
        title: "Normen als gecomprimeerde sociale geschiedenis",
        paragraphs: [
          "Wanneer dezelfde sociale consequenties vaak worden herhaald, hoeven ze niet iedere keer opnieuw te gebeuren. De verwachte reactie wordt vooraf onderdeel van de betekenis van een mogelijke handeling.",
          "Een norm bewaart zo de gezamenlijke richting van eerdere sociale reacties, ook wanneer de oorspronkelijke reden daarvoor later minder zichtbaar wordt.",
        ],
      },
      {
        id: "logica",
        title: "Logica werkt binnen beschikbare informatie",
        paragraphs: [
          "Formele logica kan bepalen wat uit bepaalde uitgangspunten volgt. Zij bepaalt echter niet vanzelf welke informatie in die uitgangspunten terecht is gekomen.",
          "Een conclusie kan daarom logisch correct volgen uit premissen terwijl de informatieruimte waarin die premissen zijn gevormd onvolledig is.",
          "Meridian probeert daarom niet alleen conclusies zichtbaar te maken, maar ook de informatie, aannames en relaties waaruit zij voortkomen.",
        ],
        formula:
          "waarneming → selectie → uitgangspunten → logische afleiding → conclusie → vergelijking met werkelijkheid",
      },
    ],
  },

  {
    slug: "perspectieven-en-journalistiek",
    eyebrow: "Journalistieke methode",
    title: "Perspectieven en journalistiek",
    summary:
      "Een perspectief is geen vervanging van feiten. Het is informatie over wat vanuit een bepaalde positie zichtbaar, voelbaar of ervaarbaar wordt.",
    concepts: [
      "perspectief",
      "journalistiek",
      "ervaring",
      "feit",
      "bewijs",
      "onzekerheid",
      "informatie",
    ],
    sourceIds: ["meridian"],
    sections: [
      {
        id: "perspectief",
        title: "Niemand ziet het volledige verhaal",
        paragraphs: [
          "Mensen bevinden zich op verschillende posities binnen grotere maatschappelijke systemen. Daardoor worden verschillende gevolgen, relaties en signalen zichtbaar.",
          "Een beleidsmaker kan institutionele processen zien die voor een burger verborgen blijven. Een burger kan gevolgen ervaren die nauwelijks in formele data voorkomen. Een deskundige kan mechanismen herkennen die uit individuele ervaring alleen niet af te leiden zijn.",
          "Geen van deze informatieposities vormt zelfstandig het gehele beeld.",
        ],
      },
      {
        id: "ervaring-feit",
        title: "Ervaring en feit blijven verschillende informatietypen",
        paragraphs: [
          "Wanneer iemand zegt dat hij zich niet gehoord voelt of een bepaald gevolg ervaart, is dat informatie over zijn ervaring.",
          "Daaruit volgt niet automatisch dat iedere causale verklaring die deze persoon eraan koppelt eveneens feitelijk juist is.",
          "Door die lagen van elkaar te scheiden kan ervaring serieus worden genomen zonder journalistieke verificatie los te laten.",
        ],
      },
      {
        id: "methode",
        title: "Van ervaringen naar onderzoek",
        paragraphs: [
          "Meridian verzamelt perspectieven om patronen, verschillen en ontbrekende informatie zichtbaar te maken.",
          "Daarna kan worden onderzocht welke feitelijke beweringen uit die ervaringen ontstaan, welk onafhankelijk bewijs beschikbaar is en waar onzekerheid blijft bestaan.",
        ],
        points: [
          "Ervaringen verzamelen",
          "Terugkerende patronen herkennen",
          "Tegenstrijdige perspectieven vergelijken",
          "Feitelijke beweringen afzonderen",
          "Bronnen, data en deskundigen onderzoeken",
          "Feit, ervaring, interpretatie en onzekerheid zichtbaar scheiden",
        ],
      },
      {
        id: "doel",
        title: "Zelfstandige betekenisvorming",
        paragraphs: [
          "Het doel is niet dat alle gebruikers uiteindelijk dezelfde mening krijgen.",
          "Het doel is dat iemand beter kan zien waar zijn eigen begrip vandaan komt, welke informatie nog ontbreekt en waarom iemand vanuit een andere informatiepositie tot een andere conclusie kan komen.",
        ],
      },
    ],
  },

  {
    slug: "kennisgraaf",
    eyebrow: "Informatiearchitectuur",
    title: "De kennisgraaf",
    summary:
      "Meridian behandelt een artikel niet als het eindpunt van informatie. Gebeurtenissen, onderwerpen, personen, plaatsen, perspectieven en bronnen vormen samen een netwerk.",
    concepts: [
      "knowledge graph",
      "relaties",
      "nodes",
      "onderwerpen",
      "bronnen",
      "geografie",
      "informatie",
      "perspectief",
    ],
    sourceIds: ["meridian", "ontwerp"],
    sections: [
      {
        id: "pagina-naar-relatie",
        title: "Van pagina's naar relaties",
        paragraphs: [
          "Een klassieke nieuwswebsite bestaat voornamelijk uit losse documenten. Meridian draait die verhouding om.",
          "De fundamentele laag bestaat uit informatieobjecten en hun relaties. Pagina's zijn tijdelijke manieren om delen van dat netwerk aan een gebruiker te tonen.",
        ],
      },
      {
        id: "nodes",
        title: "Alles kan een knooppunt zijn",
        paragraphs: [
          "Een node kan een gebeurtenis, persoon, organisatie, plaats, wet, argument, bron, perspectief, historisch proces, kunstwerk of artikel zijn.",
          "De betekenis van zo'n node wordt niet alleen bepaald door de eigen inhoud, maar ook door de relaties met andere onderdelen van het systeem.",
        ],
      },
      {
        id: "kaart",
        title: "De kaart als interface",
        paragraphs: [
          "Geografie is binnen Meridian geen losse kaart naast de website. Plaatsen zijn zelf onderdelen van het informatienetwerk.",
          "Een gebruiker moet kunnen bewegen van een landelijke ontwikkeling naar een gemeente, organisatie of lokale ervaring, maar ook kunnen uitzoomen naar Europese, mondiale of historische structuren.",
        ],
      },
      {
        id: "relaties",
        title: "Relaties zijn belangrijker dan tags",
        paragraphs: [
          "Een traditioneel label vertelt vooral waar iets onder valt. Een relatie vertelt waarom twee dingen met elkaar verbonden zijn.",
          "Dat maakt het mogelijk om niet alleen vergelijkbare informatie te vinden, maar ook oorzaken, gevolgen, conflicten, historische verbindingen en ontbrekende schakels.",
        ],
      },
    ],
  },

  {
    slug: "ai-en-personalisatie",
    eyebrow: "AI",
    title: "AI en persoonlijke informatieroutes",
    summary:
      "De AI van Meridian moet niet voorspellen welke overtuiging iemand moet krijgen, maar welke informatie, relatie of context iemand nodig heeft om zijn eigen onderzoek voort te zetten.",
    concepts: [
      "AI",
      "personalisatie",
      "informational completeness",
      "state engine",
      "knowledge graph",
      "aanbevelingen",
      "autonomie",
    ],
    sourceIds: ["meridian", "techniek"],
    sections: [
      {
        id: "geen-overtuiger",
        title: "AI als planner, niet als overtuiger",
        paragraphs: [
          "De AI is niet bedoeld om gebruikers ideologisch te classificeren of te bepalen welke politieke richting iemand zou moeten volgen.",
          "Het systeem probeert vast te stellen wat iemand op dit moment probeert te begrijpen en welke relevante informatielaag nog ontbreekt.",
        ],
      },
      {
        id: "tijdelijke-toestand",
        title: "Een tijdelijke informatiebehoefte",
        paragraphs: [
          "In plaats van permanente psychologische profielen kan Meridian onderwerp-specifieke toestanden gebruiken.",
          "Iemand kan bij het ene onderwerp vooral bewijs controleren en bij een ander onderwerp juist zoeken naar oplossingen.",
        ],
        points: [
          "exploring",
          "comparing",
          "checking_evidence",
          "seeking_alternatives",
          "seeking_solution",
          "ready_to_contribute",
          "ready_for_action",
        ],
      },
      {
        id: "completeness",
        title: "Informational completeness",
        paragraphs: [
          "Een klassiek aanbevelingssysteem ziet interesse in een onderwerp en toont vervolgens meer van hetzelfde.",
          "Meridian kan juist onderzoeken welke belangrijke dimensie binnen dat onderwerp nog ontbreekt.",
          "Wie veel over gevolgen heeft gelezen maar nauwelijks institutionele oorzaken heeft bekeken, hoeft niet nog een artikel over dezelfde gevolgen te krijgen.",
        ],
        points: [
          "Feiten",
          "Geschiedenis",
          "Oorzaken",
          "Gevolgen",
          "Belangen",
          "Tegenargumenten",
          "Persoonlijke ervaringen",
          "Instituties",
          "Oplossingen",
          "Onzekerheden",
        ],
      },
      {
        id: "architectuur",
        title: "De automatische route",
        paragraphs: [
          "Gebruikersinteracties kunnen worden vertaald naar een tijdelijke informatiebehoefte. De knowledge graph bepaalt vervolgens welke routes inhoudelijk beschikbaar zijn.",
          "Een rankinglaag kan daarbij rekening houden met relevantie, bewijs, diversiteit, onzekerheid en expliciete gebruikersintentie.",
        ],
        formula:
          "interactie → state engine → knowledge graph → ontbrekende context → mogelijke routes → gebruiker kiest",
      },
      {
        id: "te-vroeg",
        title: "De AI moet ook kunnen zeggen: nog niet",
        paragraphs: [
          "Wanneer emotionele betrokkenheid hoog is maar causale zekerheid en perspectiefdiversiteit laag zijn, hoeft de volgende stap geen actie te zijn.",
          "Het systeem kan dan eerst ontbrekende context tonen. Daarmee wordt informatiediepte belangrijker dan maximale mobilisatie.",
        ],
      },
    ],
  },

  {
    slug: "actie-en-participatie",
    eyebrow: "Van begrip naar handelen",
    title: "Actie en participatie",
    summary:
      "Actie volgt binnen Meridian niet direct uit emotionele intensiteit. Eerst wordt zichtbaar waar werkelijke handelingsruimte bestaat.",
    concepts: [
      "actie",
      "action graph",
      "agency",
      "participatie",
      "macht",
      "instituties",
      "AI",
      "oplossingen",
    ],
    sourceIds: ["meridian", "techniek"],
    sections: [
      {
        id: "volgorde",
        title: "Eerst begrijpen, daarna handelen",
        paragraphs: [
          "Veel mobilisatiesystemen bewegen rechtstreeks van emotie naar actie. Meridian wil juist ruimte laten tussen betrokkenheid en handelen.",
          "De gebruiker moet kunnen onderzoeken wat een probleem veroorzaakt, welke verklaringen bestaan en waar daadwerkelijke invloed mogelijk is.",
        ],
        formula:
          "informatie → perspectieven → relaties → onzekerheid → verklaring → handelingsruimte → vrijwillige keuze",
      },
      {
        id: "agency",
        title: "Agency ontstaat wanneer invloed zichtbaar wordt",
        paragraphs: [
          "Een probleem kan belangrijk voelen terwijl iemand tegelijkertijd geen mogelijkheid ziet om er iets aan te veranderen.",
          "Wanneer de structuur van een probleem én een geloofwaardige route naar invloed zichtbaar worden, kan machteloosheid veranderen in handelingsvermogen.",
        ],
      },
      {
        id: "action-graph",
        title: "De action graph",
        paragraphs: [
          "Naast de knowledge graph kan een tweede netwerk beschrijven waar binnen een maatschappelijk systeem daadwerkelijk iets veranderd kan worden.",
          "Hiermee wordt niet alleen zichtbaar wat met elkaar samenhangt, maar ook waar beslissingsmacht ligt.",
        ],
        formula:
          "probleem → mechanisme → beslissingsmacht → actor → beslissingsmoment → mogelijke interventie",
      },
      {
        id: "vrijwillig",
        title: "De gebruiker houdt de keuze",
        paragraphs: [
          "Meridian kan verschillende mogelijke handelingen tonen en uitleggen waarom ze relevant zijn.",
          "Pas nadat iemand zelf een richting heeft gekozen, kan AI helpen om praktische frictie te verminderen, bijvoorbeeld door informatie te verzamelen of een volgende stap duidelijk te maken.",
        ],
      },
    ],
  },

  {
    slug: "ontwerp-en-identiteit",
    eyebrow: "Visuele taal",
    title: "Ontwerp en identiteit",
    summary:
      "Het visuele systeem probeert dezelfde filosofie uit te drukken als de inhoud: afzonderlijke punten krijgen betekenis door hun onderlinge verbindingen.",
    concepts: [
      "ontwerp",
      "identiteit",
      "netwerk",
      "verbinding",
      "individu",
      "wereld",
      "kunst",
      "kaart",
    ],
    sourceIds: ["ontwerp", "identiteit", "meridian"],
    sections: [
      {
        id: "punten",
        title: "Van punt naar groter beeld",
        paragraphs: [
          "De terugkerende punten en verbindingen zijn geen losse decoratie. Zij verbeelden dat afzonderlijke waarnemingen beperkt zijn en dat een groter beeld ontstaat wanneer relaties zichtbaar worden.",
          "Het individu blijft daarbij zichtbaar als eigen punt. Verbinding betekent niet dat verschillen verdwijnen.",
        ],
      },
      {
        id: "identiteit",
        title: "Individu, verbinding en wereld",
        paragraphs: [
          "De Meridian-identiteit bouwt visueel op van het individuele punt naar verbinding en uiteindelijk naar een netwerk.",
          "Het hoofdlogo fungeert als middelpunt waarin verschillende perspectieven samenkomen, terwijl eenvoudigere vormen voor andere onderdelen van het platform gebruikt kunnen worden.",
        ],
      },
      {
        id: "visuele-rust",
        title: "Rust in plaats van voortdurende urgentie",
        paragraphs: [
          "De visuele taal gebruikt veel ruimte, lichte achtergronden, donker marine en warme accenten.",
          "Het doel is niet om iedere gebeurtenis maximaal urgent te laten voelen, maar ruimte te geven om verbanden te ontdekken.",
        ],
      },
      {
        id: "kunst",
        title: "Kunst als tweede informatielaag",
        paragraphs: [
          "Niet alle betekenis hoeft letterlijk te worden uitgelegd. Beeld, kunst en symboliek kunnen relaties voelbaar maken die later inhoudelijk verder onderzocht worden.",
          "Daarom kan Meridian naast journalistieke uitleg ook visuele en culturele vormen gebruiken die meerdere interpretaties openlaten.",
        ],
      },
    ],
  },
];

export function getSystemPage(slug: string) {
  return systemPages.find((page) => page.slug === slug);
}

export function getSystemSource(id: string) {
  return systemSources.find((source) => source.id === id);
}

export function getRelatedSystemPages(
  currentPage: SystemPage,
  amount = 3
) {
  return systemPages
    .filter((page) => page.slug !== currentPage.slug)
    .map((page) => {
      const sharedConcepts = page.concepts.filter((concept) =>
        currentPage.concepts.includes(concept)
      );

      return {
        page,
        sharedConcepts,
        score: sharedConcepts.length,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, amount);
}

/*
 * Deze functie kan later direct gebruikt worden door RAG,
 * embeddings, Supabase of een graph database.
 *
 * De website en AI gebruiken daardoor dezelfde bron.
 */
export function getMeridianAIKnowledge() {
  return systemPages.map((page) => ({
    id: page.slug,
    title: page.title,
    summary: page.summary,
    concepts: page.concepts,
    content: page.sections
      .map((section) =>
        [
          section.title,
          ...section.paragraphs,
          section.formula ?? "",
          ...(section.points ?? []),
        ]
          .filter(Boolean)
          .join("\n")
      )
      .join("\n\n"),
    relations: getRelatedSystemPages(page, 5).map((relation) => ({
      slug: relation.page.slug,
      title: relation.page.title,
      sharedConcepts: relation.sharedConcepts,
    })),
    sources: page.sourceIds
      .map(getSystemSource)
      .filter(Boolean),
  }));
}