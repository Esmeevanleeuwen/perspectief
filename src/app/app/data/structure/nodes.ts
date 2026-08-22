import type { MeridianNode } from "./types";

export const nodes: MeridianNode[] = [
  {
    id: "human-whole",
    kind: "human",
    title: "De volledige mens",
    short:
      "De persoon zoals hij bestaat voordat een instituut bepaalt welk deel van hem relevant is.",
    layer: "experiential",
    concepts: ["mens", "continuiteit", "identiteit", "ervaring"],
    systemIds: ["labor", "market", "defense", "care", "statistics"],
  },

  {
    id: "capacity-body",
    kind: "capacity",
    title: "Lichamelijke capaciteit",
    short:
      "Kracht, aanwezigheid, uithoudingsvermogen en lichamelijke inzetbaarheid.",
    layer: "material",
    concepts: ["lichaam", "arbeid", "risico"],
    systemIds: ["labor", "defense"],
  },
  {
    id: "capacity-time",
    kind: "capacity",
    title: "Tijd",
    short:
      "Beschikbare levensduur die door arbeid, zorg, training of andere functies kan worden gebonden.",
    layer: "material",
    concepts: ["tijd", "arbeidsduur", "beschikbaarheid"],
    systemIds: ["labor", "defense"],
  },
  {
    id: "capacity-attention",
    kind: "capacity",
    title: "Aandacht",
    short:
      "Waarneembare betrokkenheid die digitaal kan worden gemeten, voorspeld en gemonetariseerd.",
    layer: "material",
    concepts: ["aandacht", "gedrag", "data"],
    systemIds: ["market"],
  },
  {
    id: "capacity-vulnerability",
    kind: "capacity",
    title: "Kwetsbaarheid",
    short:
      "Menselijke nood die pas institutioneel bruikbaar wordt wanneer zij voldoende zichtbaar wordt.",
    layer: "experiential",
    concepts: ["hulpvraag", "psychische nood", "zichtbaarheid"],
    systemIds: ["care"],
  },
  {
    id: "capacity-belonging",
    kind: "capacity",
    title: "Behoefte aan betekenis en verbondenheid",
    short:
      "Kameraadschap, erkenning, status, identiteit en het gevoel nodig te zijn.",
    layer: "experiential",
    concepts: ["betekenis", "groep", "erkenning"],
    systemIds: ["market", "defense", "labor"],
  },

  {
    id: "institution-employer",
    kind: "institution",
    title: "Werkgever",
    short: "Selecteert arbeidscapaciteit en zet die om in productie.",
    layer: "material",
    concepts: ["arbeid", "productie", "loon"],
    systemIds: ["labor"],
  },
  {
    id: "institution-platform",
    kind: "institution",
    title: "Digitaal platform",
    short:
      "Selecteert gedragsinformatie om waarschijnlijkheden, aanbevelingen en commerciële waarde te produceren.",
    layer: "material",
    concepts: ["platform", "algoritme", "targeting"],
    systemIds: ["market"],
  },
  {
    id: "institution-defense",
    kind: "institution",
    title: "Defensie",
    short:
      "Selecteert inzetbaarheid en zet mensen, training en techniek om in operationele capaciteit.",
    layer: "material",
    concepts: ["defensie", "inzetbaarheid", "mobilisatie"],
    systemIds: ["defense"],
  },
  {
    id: "institution-care",
    kind: "institution",
    title: "Hulp- en zorgsysteem",
    short:
      "Kan pas reageren op kwetsbaarheid wanneer die als voldoende herkenbare behoefte binnenkomt.",
    layer: "material",
    concepts: ["zorg", "hulpvraag", "toegang"],
    systemIds: ["care"],
  },
  {
    id: "institution-statistics",
    kind: "institution",
    title: "Statistische registratie",
    short:
      "Reduceert levens tot categorieen die vergelijkbaar en telbaar worden.",
    layer: "epistemic",
    concepts: ["statistiek", "categorie", "meting"],
    systemIds: ["statistics"],
  },

  {
    id: "selection-usefulness",
    kind: "selection",
    title: "Functionele selectie",
    short:
      "Het systeem kiest niet de volledige mens maar de eigenschap die binnen de eigen functie verschil maakt.",
    layer: "epistemic",
    concepts: ["selectie", "bruikbaarheid", "reductie"],
  },
  {
    id: "selection-visibility",
    kind: "selection",
    title: "Selectie op zichtbaarheid",
    short:
      "Wat niet wordt gemeld, gemeten, geuit of herkend kan buiten institutionele verwerking blijven.",
    layer: "epistemic",
    concepts: ["zichtbaarheid", "hulp", "informatie"],
  },
  {
    id: "selection-truth",
    kind: "selection",
    title: "Selectieve waarheidsvorming",
    short:
      "Ware informatie kan een onvolledig wereldbeeld produceren wanneer slechts een deel van de relevante feiten de conclusie mag structureren.",
    layer: "epistemic",
    concepts: ["waarheid", "selectie", "premissen", "framing"],
  },

  {
    id: "function-worker",
    kind: "function",
    title: "Werknemer",
    short:
      "De mens gerepresenteerd als beschikbare arbeid, tijd en productiviteit.",
    layer: "material",
    concepts: ["arbeid", "functie"],
    systemIds: ["labor"],
  },
  {
    id: "function-consumer",
    kind: "function",
    title: "Consument / gebruiker",
    short:
      "De mens gerepresenteerd als vraag, aandacht, gedrag en voorspelbare reactie.",
    layer: "material",
    concepts: ["markt", "consument", "gedrag"],
    systemIds: ["market"],
  },
  {
    id: "function-soldier",
    kind: "function",
    title: "Militaire functie",
    short:
      "De mens gerepresenteerd als inzetbaarheid binnen een operationele structuur.",
    layer: "material",
    concepts: ["militair", "risico", "inzetbaarheid"],
    systemIds: ["defense"],
  },
  {
    id: "function-patient",
    kind: "function",
    title: "Patient / hulpvrager",
    short:
      "De mens nadat kwetsbaarheid herkenbaar genoeg is geworden om als zorgbehoefte verwerkt te worden.",
    layer: "material",
    concepts: ["patient", "hulpvraag", "zorg"],
    systemIds: ["care"],
  },

  {
    id: "reward-income",
    kind: "reward",
    title: "Inkomen",
    short:
      "Materiele beloning die kan samengaan met verlies van tijd en blootstelling aan risico.",
    layer: "material",
    concepts: ["loon", "inkomen", "beloning"],
    systemIds: ["labor"],
  },
  {
    id: "reward-meaning",
    kind: "reward",
    title: "Betekenisbeloning",
    short:
      "Niet-financiele opbrengst: trots, kameraadschap, identiteit, erkenning, plicht of status.",
    layer: "symbolic",
    concepts: ["betekenis", "status", "identiteit"],
  },

  {
    id: "risk-work",
    kind: "risk",
    title: "Lichamelijk arbeidsrisico",
    short:
      "Letsel en sterfte die ongelijk verdeeld kunnen raken door beroeps- en functieselectie.",
    layer: "material",
    concepts: ["arbeidsongeval", "risico", "lichaam"],
    systemIds: ["labor"],
    sourceRefs: ["mens-als-functie"],
  },
  {
    id: "risk-military",
    kind: "risk",
    title: "Operationeel militair risico",
    short:
      "Materieel gevaar dat uiteindelijk terechtkomt bij de lichamen die de operationele populatie vormen.",
    layer: "material",
    concepts: ["oorlog", "militair", "lichaam"],
    systemIds: ["defense"],
    sourceRefs: ["mens-als-functie"],
  },
  {
    id: "risk-psychological-collapse",
    kind: "risk",
    title: "Psychische uitval",
    short:
      "Het punt waarop functioneren afneemt maar de hulpbehoefte nog niet noodzakelijk zichtbaar is voor een instelling.",
    layer: "experiential",
    concepts: ["psychische gezondheid", "uitval", "hulp"],
    systemIds: ["care"],
  },
  {
    id: "risk-suicide",
    kind: "risk",
    title: "Zelfdoding",
    short:
      "Een uiterste uitkomst die statistisch scherp zichtbaar wordt, terwijl de voorafgaande menselijke route niet uit het cijfer zelf volgt.",
    layer: "material",
    concepts: ["zelfdoding", "sterfte", "mannen"],
    systemIds: ["care", "statistics"],
    sourceRefs: ["mens-als-functie"],
  },

  {
    id: "norm-selfreliance",
    kind: "norm",
    title: "Zelfredzaamheid",
    short:
      "Een functioneel nuttige eigenschap die buiten haar oorspronkelijke context een algemene norm voor de persoon kan worden.",
    layer: "symbolic",
    concepts: ["zelfredzaamheid", "mannelijkheid", "norm"],
  },
  {
    id: "norm-endurance",
    kind: "norm",
    title: "Uithoudingsvermogen als identiteit",
    short:
      "De verschuiving van 'ik kan dit dragen' naar 'ik moet dit kunnen dragen om waardevol te zijn'.",
    layer: "symbolic",
    concepts: ["kracht", "mannelijkheid", "internalisering"],
  },

  {
    id: "classification-accident",
    kind: "classification",
    title: "Arbeidsongeval",
    short:
      "De institutionele categorie waarin menselijk letsel als gebeurtenis binnen arbeid verschijnt.",
    layer: "epistemic",
    concepts: ["categorie", "arbeid", "slachtoffer"],
  },
  {
    id: "classification-offender",
    kind: "classification",
    title: "Dader",
    short:
      "Een noodzakelijke categorie voor verantwoordelijkheid die niet automatisch de volledige levensgeschiedenis beschrijft.",
    layer: "epistemic",
    concepts: ["dader", "verantwoordelijkheid", "causaliteit"],
  },
  {
    id: "classification-victim",
    kind: "classification",
    title: "Slachtoffer",
    short:
      "Een categorie van geleden schade die evenmin de volledige morele of causale werkelijkheid van een persoon bevat.",
    layer: "epistemic",
    concepts: ["slachtoffer", "schade", "categorie"],
  },
  {
    id: "classification-death-statistic",
    kind: "classification",
    title: "Sterftestatistiek",
    short:
      "Het moment waarop het eindpunt perfect telbaar wordt zonder dat het cijfer de voorafgaande betekenis bevat.",
    layer: "epistemic",
    concepts: ["statistiek", "sterfte", "reductie"],
  },

  {
    id: "narrative-privilege",
    kind: "narrative",
    title: "Narratief van voordeel",
    short:
      "Selecteert data over macht, inkomen of meerderheidspositie en loopt risico andere dimensies als context te behandelen.",
    layer: "symbolic",
    concepts: ["privilege", "macht", "selectie"],
  },
  {
    id: "narrative-hidden-victim",
    kind: "narrative",
    title: "Narratief van de verborgen mannelijke slachtoffers",
    short:
      "Selecteert data over risico en verlies en loopt risico verantwoordelijkheid of voordeel als onbelangrijk te behandelen.",
    layer: "symbolic",
    concepts: ["mannen", "slachtofferschap", "selectie"],
  },

  {
    id: "absence-full-person",
    kind: "absence",
    title: "De ontbrekende volledige persoon",
    short:
      "Geen enkel gespecialiseerd systeem bezit vanzelf de totale levensloop waarin al zijn categorieen weer samenkomen.",
    layer: "epistemic",
    concepts: ["ontbrekende informatie", "mens", "fragmentatie"],
  },

  {
    id: "question-who-carries-cost",
    kind: "question",
    title: "Wie draagt de kosten?",
    short:
      "Waar eindigt het risico wanneer opbrengst, betekenis en schade niet bij dezelfde actor terechtkomen?",
    layer: "epistemic",
    concepts: ["externaliteit", "risico", "waarde"],
  },
  {
    id: "question-what-remains",
    kind: "question",
    title: "Wat blijft over wanneer de functie verdwijnt?",
    short:
      "Onderzoeksvraag naar de grens tussen functionele waarde en geinternaliseerde menselijke waarde.",
    layer: "experiential",
    concepts: ["identiteit", "uitval", "waarde"],
  },
];
