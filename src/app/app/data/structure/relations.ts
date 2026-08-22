import type { MeridianRelation } from "./types";

export const relations: MeridianRelation[] = [
  {
    id: "human-contains-body",
    from: "human-whole",
    to: "capacity-body",
    type: "contains",
    description: "Het lichaam is een deel van de mens, niet de volledige mens.",
    evidenceStatus: "derived",
  },
  {
    id: "human-contains-time",
    from: "human-whole",
    to: "capacity-time",
    type: "contains",
    description: "Tijd is een menselijke mogelijkheid die institutioneel kan worden gebonden.",
    evidenceStatus: "derived",
  },
  {
    id: "human-contains-attention",
    from: "human-whole",
    to: "capacity-attention",
    type: "contains",
    description: "Aandacht is slechts een deel van de volledige persoon.",
    evidenceStatus: "derived",
  },
  {
    id: "human-contains-vulnerability",
    from: "human-whole",
    to: "capacity-vulnerability",
    type: "contains",
    description: "Kwetsbaarheid bestaat ook wanneer zij nog niet als hulpvraag zichtbaar is.",
    evidenceStatus: "hypothesis",
  },

  {
    id: "employer-selects-body",
    from: "institution-employer",
    to: "capacity-body",
    type: "selects",
    description:
      "Voor lichamelijk werk wordt fysieke capaciteit relevant voor institutionele selectie.",
    evidenceStatus: "derived",
  },
  {
    id: "employer-selects-time",
    from: "institution-employer",
    to: "capacity-time",
    type: "selects",
    description:
      "Arbeid bindt tijd aan een productieve functie in ruil voor beloning.",
    evidenceStatus: "derived",
  },
  {
    id: "employer-converts-worker",
    from: "selection-usefulness",
    to: "function-worker",
    type: "converts",
    description:
      "De volledige persoon verschijnt institutioneel als werknemer wanneer arbeidsrelevante eigenschappen worden geselecteerd.",
    evidenceStatus: "derived",
  },
  {
    id: "worker-reward-income",
    from: "function-worker",
    to: "reward-income",
    type: "rewards",
    description: "Arbeid kan worden omgezet in inkomen.",
    evidenceStatus: "observed",
  },
  {
    id: "worker-exposes-risk",
    from: "function-worker",
    to: "risk-work",
    type: "exposes",
    description:
      "Bepaalde functies brengen een hogere blootstelling aan lichamelijk risico mee.",
    evidenceStatus: "observed",
    sourceRefs: ["mens-als-functie"],
    confidence: 0.95,
  },
  {
    id: "risk-classifies-accident",
    from: "risk-work",
    to: "classification-accident",
    type: "classifies",
    description:
      "Wanneer het risico werkelijkheid wordt, wordt de mens in veiligheidsregistratie als ongevalsslachtoffer verwerkt.",
    evidenceStatus: "derived",
  },

  {
    id: "platform-selects-attention",
    from: "institution-platform",
    to: "capacity-attention",
    type: "selects",
    description:
      "Gedrag en aandacht worden geselecteerd voor voorspelling en aanbeveling.",
    evidenceStatus: "observed",
    sourceRefs: ["mens-als-functie"],
  },
  {
    id: "attention-converts-consumer",
    from: "capacity-attention",
    to: "function-consumer",
    type: "converts",
    description:
      "De persoon verschijnt voor het platform als gebruiker, aandachtspatroon en voorspelde reactie.",
    evidenceStatus: "derived",
  },

  {
    id: "defense-selects-body",
    from: "institution-defense",
    to: "capacity-body",
    type: "selects",
    description:
      "Voor operationele functies selecteert Defensie relevante lichamelijke, cognitieve en sociale capaciteiten.",
    evidenceStatus: "observed",
    sourceRefs: ["mens-als-functie"],
  },
  {
    id: "defense-converts-soldier",
    from: "selection-usefulness",
    to: "function-soldier",
    type: "converts",
    description:
      "Inzetbaarheid wordt omgezet in een operationele rol.",
    evidenceStatus: "derived",
  },
  {
    id: "soldier-exposes-risk",
    from: "function-soldier",
    to: "risk-military",
    type: "exposes",
    description:
      "Operationele capaciteit brengt uiteindelijk materieel risico bij concrete lichamen.",
    evidenceStatus: "derived",
  },
  {
    id: "soldier-reward-meaning",
    from: "function-soldier",
    to: "reward-meaning",
    type: "rewards",
    description:
      "Kameraadschap, trots, betekenis en plicht kunnen niet-financiele opbrengsten van een militaire rol zijn.",
    evidenceStatus: "derived",
  },

  {
    id: "care-requires-visibility",
    from: "institution-care",
    to: "capacity-vulnerability",
    type: "requires_visibility",
    description:
      "Veel zorgprocessen kunnen pas beginnen wanneer behoefte voldoende zichtbaar of gemeld is.",
    evidenceStatus: "derived",
    sourceRefs: ["mens-als-functie"],
  },
  {
    id: "vulnerability-collapse",
    from: "capacity-vulnerability",
    to: "risk-psychological-collapse",
    type: "precedes",
    description:
      "Onzichtbare of onvoldoende beantwoorde nood kan voorafgaan aan ernstiger uitval; dit is geen universele causale regel.",
    evidenceStatus: "hypothesis",
  },
  {
    id: "collapse-suicide",
    from: "risk-psychological-collapse",
    to: "risk-suicide",
    type: "precedes",
    description:
      "Psychische uitval kan in sommige gevallen onderdeel zijn van een route naar zelfdoding, maar individuele causaliteit vereist afzonderlijk bewijs.",
    evidenceStatus: "hypothesis",
  },
  {
    id: "suicide-statistic",
    from: "risk-suicide",
    to: "classification-death-statistic",
    type: "classifies",
    description:
      "Na overlijden wordt de uitkomst scherp statistisch classificeerbaar.",
    evidenceStatus: "observed",
    sourceRefs: ["mens-als-functie"],
  },

  {
    id: "selfreliance-normalizes-silence",
    from: "norm-selfreliance",
    to: "selection-visibility",
    type: "hides",
    description:
      "Wanneer hulp vragen als verlies van zelfstandigheid wordt ervaren, kan nood minder snel zichtbaar worden; de omvang moet empirisch worden vastgesteld.",
    evidenceStatus: "hypothesis",
  },
  {
    id: "endurance-internalizes",
    from: "norm-endurance",
    to: "human-whole",
    type: "internalizes",
    description:
      "Een functionele norm kan onderdeel worden van zelfwaardering wanneer zij langdurig sociaal wordt beloond.",
    evidenceStatus: "hypothesis",
  },
  {
    id: "meaning-normalizes-endurance",
    from: "reward-meaning",
    to: "norm-endurance",
    type: "normalizes",
    description:
      "Betekenis en erkenning kunnen de eigenschappen die een functie vereist cultureel versterken.",
    evidenceStatus: "hypothesis",
  },

  {
    id: "statistics-classifies-human",
    from: "institution-statistics",
    to: "human-whole",
    type: "classifies",
    description:
      "Statistiek kan de volledige persoon alleen verwerken via geselecteerde categorieen.",
    evidenceStatus: "derived",
  },
  {
    id: "classification-hides-whole",
    from: "classification-death-statistic",
    to: "absence-full-person",
    type: "hides",
    description:
      "De classificatie bewaart de uitkomst maar niet automatisch de volledige voorafgaande levensloop.",
    evidenceStatus: "derived",
  },
  {
    id: "accident-hides-whole",
    from: "classification-accident",
    to: "absence-full-person",
    type: "hides",
    description:
      "De arbeidsongevalcategorie is noodzakelijk smaller dan de volledige menselijke gevolgen.",
    evidenceStatus: "derived",
  },

  {
    id: "truth-amplifies-privilege",
    from: "selection-truth",
    to: "narrative-privilege",
    type: "amplifies",
    description:
      "Een selectie die vooral voordeeldata behoudt kan een coherent narratief van algemene macht vormen.",
    evidenceStatus: "derived",
  },
  {
    id: "truth-amplifies-victim",
    from: "selection-truth",
    to: "narrative-hidden-victim",
    type: "amplifies",
    description:
      "Een selectie die vooral risicodata behoudt kan een coherent narratief van algemeen mannelijk slachtofferschap vormen.",
    evidenceStatus: "derived",
  },
  {
    id: "narratives-contradict",
    from: "narrative-privilege",
    to: "narrative-hidden-victim",
    type: "contradicts",
    description:
      "De narratieven botsen wanneer zij als totale verklaring worden gebruikt, hoewel afzonderlijke deelclaims tegelijk waar kunnen zijn.",
    evidenceStatus: "derived",
  },

  {
    id: "risk-externalizes-cost",
    from: "risk-work",
    to: "question-who-carries-cost",
    type: "externalizes",
    description:
      "Arbeidsopbrengst en latere lichamelijke of sociale kosten hoeven niet bij dezelfde actor terecht te komen.",
    evidenceStatus: "derived",
  },
  {
    id: "failure-question-remains",
    from: "risk-psychological-collapse",
    to: "question-what-remains",
    type: "follows",
    description:
      "Uitval maakt zichtbaar hoeveel identiteit eerder aan functioneren was gekoppeld.",
    evidenceStatus: "hypothesis",
  },
];
