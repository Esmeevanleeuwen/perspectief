export type ArticleBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "heading";
      text: string;
    };

export type Article = {
  slug: string;
  researchSlug?: string;
  label: string;
  title: string;
  description: string;
  image: string;
  experiences: number;
  experts: number;
  provinces?: number;
  date: string;
  featured: boolean;
  featuredPosition?: "main" | "side";
  content: ArticleBlock[];
};

export const articles: Article[] = [
  {
    slug: "prestatiedruk",
    label: "ONDERZOEK",
    title: "Waarom ervaren steeds meer jongeren prestatiedruk?",
    description:
      "Een onderzoek naar de ervaringen van jongeren, de terugkerende patronen en de mogelijke oorzaken.",
    image: "/artikelsad.jpg",
    experiences: 438,
    experts: 12,
    provinces: 11,
    date: "18 juli 2026",
    featured: true,
    featuredPosition: "main",
    content: [
      {
        type: "paragraph",
        text: "Steeds meer jongeren geven aan druk te ervaren om te presteren. In dit onderzoek kijken we niet alleen naar losse ervaringen, maar vooral naar de patronen die daarin terugkomen.",
      },
      {
        type: "heading",
        text: "Waar komt die druk vandaan?",
      },
      {
        type: "paragraph",
        text: "Hier komt later de verdere inhoud van het artikel.",
      },
    ],
  },
  {
    slug: "leraren-onderwijs",
    label: "ONDERZOEK",
    title: "Waarom verlaten steeds meer leraren het onderwijs?",
    description:
      "Een onderzoek naar ervaringen binnen het onderwijs en de structuren die daarachter liggen.",
    image: "/class.jpg",
    experiences: 241,
    experts: 8,
    provinces: 9,
    date: "14 juli 2026",
    featured: true,
    featuredPosition: "side",
    content: [
      {
        type: "paragraph",
        text: "Waarom verlaten leraren het onderwijs? Hier komt later de volledige tekst van het onderzoek.",
      },
    ],
  },
  {
    slug: "woningonzekerheid",
    label: "ONDERZOEK",
    title: "Waarom groeit het gevoel van woningonzekerheid?",
    description:
      "Een onderzoek naar wonen, onzekerheid en de ervaringen die daarachter liggen.",
    image: "/huis.png",
    experiences: 517,
    experts: 16,
    provinces: 12,
    date: "8 juli 2026",
    featured: true,
    featuredPosition: "side",
    content: [
      {
        type: "paragraph",
        text: "Hier komt later het volledige onderzoek naar woningonzekerheid.",
      },
    ],
  },
  {
  slug: "de-statistiek-telt-hem-pas-als-hij-dood-is",
  researchSlug: "mannen-die-we-pas-zien-wanneer-ze-breken",
  label: "ANALYSE",
  title: "De statistiek telt hem uiteindelijk wel",
  description:
    "Waarom een man jarenlang economisch, digitaal en institutioneel zichtbaar kan zijn en zijn diepste kwetsbaarheid toch pas volledig wordt geregistreerd wanneer het te laat is.",
  image: "/artikelsad.jpg",
  experiences: 0,
  experts: 0,
  date: "23 augustus 2026",
  featured: false,
  content: [
    {
      type: "paragraph",
      text: "In 2025 overleden in Nederland 1.758 mensen door zelfdoding. 1.205 van hen waren man en 553 vrouw. Na standaardisering bedroeg het zelfdodingscijfer 13,4 per 100.000 mannen en 6,1 per 100.000 vrouwen. Dat getal vertelt niet waarom iemand stierf. Het vertelt zelfs nauwelijks wie iemand was. Maar het legt wel een harde grens bloot: uiteindelijk weet het systeem precies genoeg om hem als dode te tellen."
    },
    {
      type: "paragraph",
      text: "Daarvoor kan dezelfde man jarenlang door tientallen andere systemen zijn gezien. Zijn werkgever wist wanneer hij aanwezig was. Zijn bank wist wat er binnenkwam en uitging. Digitale platforms registreerden waar hij naar keek, hoe lang hij bleef hangen en waarop hij reageerde. Een webshop kon onthouden wat hij ooit in een winkelmandje legde. Een advertentienetwerk kon hem opnieuw bereiken omdat hij één product bekeek zonder het te kopen. Misschien wist een verzekeraar welke polis hij bezat, een gemeente op welk adres hij stond ingeschreven en een werkgever hoeveel uren hij die maand had gewerkt. Moderne systemen zijn op veel plaatsen buitengewoon goed geworden in het bewaren van kleine signalen."
    },
    {
      type: "heading",
      text: "En toch kan niemand weten wat hij vannacht dacht"
    },
    {
      type: "paragraph",
      text: "Dat is geen tegenstelling omdat al deze instellingen dezelfde informatie zouden moeten bezitten. Natuurlijk niet. Een werkgever hoort geen privégedachten te kennen en een advertentieplatform hoort geen therapeut te zijn. Het verschil maakt alleen zichtbaar hoe institutionele informatie ontstaat: systemen verzamelen vooral de informatie die noodzakelijk is voor hun eigen functie."
    },
    {
      type: "paragraph",
      text: "Een platform heeft belang bij gedrag dat een voorspelling beter maakt. Een werkgever heeft belang bij informatie over inzetbaarheid. Een bank heeft belang bij financiële betrouwbaarheid. Zorg heeft informatie over nood nodig, maar kan die nood niet eenvoudig observeren zolang zij niet via gedrag, een omgeving, een huisarts, een crisis of een expliciete hulpvraag zichtbaar wordt."
    },
    {
      type: "paragraph",
      text: "Daardoor kan een bizarre moderne situatie ontstaan waarin een machine vrij nauwkeurig leert welke video iemand waarschijnlijk nog dertig seconden laat kijken, terwijl niemand weet dat dezelfde persoon zichzelf steeds moeilijker door de nacht krijgt."
    },
    {
      type: "heading",
      text: "De fout is om dit simpelweg 'mannen praten niet' te noemen"
    },
    {
      type: "paragraph",
      text: "Zodra mannelijk hulpzoekgedrag wordt samengevat als een persoonlijk gebrek aan communicatie is een maatschappelijk probleem opnieuw teruggebracht tot een eigenschap van degene die eraan lijdt. Misschien speelt terughoudendheid bij sommige mannen werkelijk een rol. Maar daarna begint pas het onderzoek. Waarom ontstaat die terughoudendheid? Welke sociale consequenties verwachten mannen van kwetsbaarheid? Welke taal herkennen zij als hulp? Hoeveel initiatief vereist toegang tot zorg? Hoeveel cognitieve en administratieve capaciteit verwachten wij van iemand op het moment dat juist die capaciteit verminderd kan zijn?"
    },
    {
      type: "paragraph",
      text: "Het verschil is belangrijk. Wanneer een brug instort vragen we niet alleen waarom het laatste voertuig erop reed. We onderzoeken belasting, materiaal, onderhoud, ontwerp, waarschuwingen en omstandigheden. Wanneer een mens instort wordt opvallend snel gevraagd waarom hij niet eerder iets zei."
    },
    {
      type: "heading",
      text: "Een hulpvraag is ook een prestatie"
    },
    {
      type: "paragraph",
      text: "Om hulp te zoeken moet iemand eerst iets doen wat in beleidsmodellen gemakkelijk als vanzelfsprekend wordt behandeld. Hij moet herkennen dat wat hij ervaart niet alleen tijdelijk ongemak is. Hij moet woorden vinden. Hij moet accepteren dat hij het niet alleen oplost. Hij moet bepalen wie veilig genoeg is om het te vertellen. Hij moet weten waar hulp begint. Hij moet soms bellen, formulieren invullen, wachten, opnieuw uitleggen en toestaan dat een ander zijn toestand beoordeelt."
    },
    {
      type: "paragraph",
      text: "Voor iemand die gezond en georganiseerd is klinkt dat als een beperkte route. Voor iemand die uitgeput, depressief, angstig, beschaamd, verslaafd, financieel ontregeld of sociaal geïsoleerd is kan dezelfde route een reeks afzonderlijke drempels zijn."
    },
    {
      type: "paragraph",
      text: "Daarom is de afwezigheid van een hulpvraag nooit automatisch bewijs van de afwezigheid van behoefte. Soms meet een systeem vooral het vermogen om binnen te komen."
    },
    {
      type: "heading",
      text: "Wanneer iemand nodig is, werkt het systeem anders"
    },
    {
      type: "paragraph",
      text: "Vergelijk dat voorzichtig met commerciële werving of militaire rekrutering. Wanneer een organisatie mensen nodig heeft, hoeft zij niet te wachten totdat de juiste persoon zichzelf volledig begrijpt en uit eigen beweging verschijnt. Zij kan onderzoeken waarom potentiële deelnemers afhaken, campagnes aanpassen, informatie vereenvoudigen, reminders sturen en de route naar deelname verkorten."
    },
    {
      type: "paragraph",
      text: "Defensie beschreef in 2025 zelf dat geïnteresseerde jongeren soms niet solliciteerden omdat zij fysiek, mentaal of sociaal aan zichzelf twijfelden. Die twijfel werd onderzocht en daarna onderdeel van een campagne om de laatste drempel naar sollicitatie te verkleinen."
    },
    {
      type: "paragraph",
      text: "Daarmee wordt twijfel plotseling geen onveranderlijke persoonlijkheid meer. Zij wordt frictie."
    },
    {
      type: "paragraph",
      text: "En frictie wordt verwijderd omdat de organisatie iets nodig heeft."
    },
    {
      type: "heading",
      text: "Wie verwijdert de frictie wanneer hij iets nodig heeft?"
    },
    {
      type: "paragraph",
      text: "Dat is de pijnlijke institutionele vraag. Niet: waarom helpt niemand mannen? Dat zou aantoonbaar onjuist zijn. Hulpverlening, preventie, huisartsen, familie, vrienden en organisaties bestaan. De vraag is preciezer: hoeveel van onze beschermende infrastructuur wordt geactiveerd nadat de kwetsbare persoon zichzelf succesvol genoeg heeft gepresenteerd als iemand die bescherming nodig heeft?"
    },
    {
      type: "paragraph",
      text: "Economische systemen kunnen outbound zijn. Ze zoeken capaciteit, aandacht en koopkracht. Veel beschermingssystemen zijn noodzakelijk gedeeltelijk inbound. Ze reageren wanneer de behoefte zichtbaar wordt."
    },
    {
      type: "paragraph",
      text: "Voor de meeste mensen functioneert dat het grootste deel van hun leven goed genoeg. Maar precies bij de mensen die niet meer functioneren kan een systeem dat aanwezigheid verwacht de afwezigheid verwarren met een gebrek aan behoefte."
    },
    {
      type: "heading",
      text: "Dan wordt stilte zelf een selectiemechanisme"
    },
    {
      type: "paragraph",
      text: "Een man die niet verschijnt bij de hulpverlening produceert nauwelijks zorginformatie. Een man die niet solliciteert produceert daarentegen onmiddellijk een probleem voor een organisatie die personeel tekortkomt. Een consument die niet koopt kan via conversiedata worden onderzocht. Een werknemer die niet komt opdagen veroorzaakt een signaal. Maar iemand die thuis langzaam verdwijnt kan buiten vrijwel alle institutionele aandacht vallen zolang er niets gebeurt dat een ander systeem activeert."
    },
    {
      type: "paragraph",
      text: "Totdat hij sterft."
    },
    {
      type: "paragraph",
      text: "Dan verschijnt hij opnieuw."
    },
    {
      type: "paragraph",
      text: "Volledig telbaar."
    },
    {
      type: "paragraph",
      text: "Maar niet meer bereikbaar."
    }
  ],
},
  {
    slug: "ceuta-mei-2021",
    researchSlug: "tegenspraak",
    label: "CASUS",
    title: "Ceuta, mei 2021: wat gebeurt er wanneer een grens beleid wordt?",
    description:
      "Een menselijke casus binnen het onderzoek naar tegenspraak, informatie en besluitvorming.",
    image: "/onderzoek-tegenspraak.jpg",
    experiences: 0,
    experts: 0,
    date: "mei 2021",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "In mei 2021 bereikten in korte tijd duizenden mensen de Spaanse enclave Ceuta. De beelden tonen niet één verklaring, maar verschillende posities binnen dezelfde gebeurtenis: mensen onderweg, grensbewaking, hulpverlening, opvang en terugkeer.",
      },
      {
        type: "heading",
        text: "Van persoon naar categorie",
      },
      {
        type: "paragraph",
        text: "Tot aan de grens is iemand onderweg. Vanaf de grens wordt diezelfde persoon ook onderdeel van juridische en bestuurlijke categorieën. Leeftijd, nationaliteit, registratie, opvang en mogelijke terugkeer veranderen welke routes vervolgens beschikbaar zijn.",
      },
      {
        type: "heading",
        text: "Wat een foto wel en niet vertelt",
      },
      {
        type: "paragraph",
        text: "De foto maakt een menselijke werkelijkheid zichtbaar, maar vertelt op zichzelf niet waarom iedere persoon vertrok, welke juridische status iemand had of welke beslissing in een individueel geval gerechtvaardigd was. Die vragen moeten met aanvullende bronnen worden onderzocht.",
      },
      {
        type: "heading",
        text: "Waarom deze casus bij het onderzoek hoort",
      },
      {
        type: "paragraph",
        text: "De casus maakt zichtbaar hoe afstand kan ontstaan tussen de taal van beleid en de ervaring van mensen. Meridian gebruikt die spanning niet als conclusie, maar als onderzoeksvraag: welke informatie bereikt besluitvormers, welke informatie is publiek beschikbaar en hoe zijn menselijke gevolgen in de uiteindelijke afweging terug te vinden?",
      },
    ],
  },
];

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getFeaturedArticles() {
  return articles.filter((article) => article.featured);
}

export function getArticlesForResearch(researchSlug: string) {
  return articles.filter((article) => article.researchSlug === researchSlug);
}
