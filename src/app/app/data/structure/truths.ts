import type { TruthClaim } from "./types";

export const truths: TruthClaim[] = [
  {
    id: "truth-men-income",
    title: "Jonge mannen ontvangen gemiddeld meer jaarinkomen",
    claim:
      "In de in het brondossier genoemde jonge leeftijdsgroepen lag gemiddeld bruto jaarinkomen van mannelijke werknemers hoger.",
    layer: "material",
    status: "observed",
    scope: "group",
    nodeIds: ["function-worker", "reward-income"],
    counterClaimIds: ["truth-hourly-wage", "truth-work-hours", "truth-work-risk"],
    missingInformation: [
      "Beroepsverdeling",
      "Contractvorm",
      "Opleiding",
      "Carrierefase",
      "Niet-betaalde zorgtijd",
    ],
    sourceRefs: ["mens-als-functie"],
  },
  {
    id: "truth-hourly-wage",
    title: "Het uurloonverschil is veel kleiner",
    claim:
      "In de aangehaalde jonge leeftijdsgroepen waren gemiddelde uurlonen vrijwel gelijk en in de genoemde cijfers marginaal hoger voor vrouwen.",
    layer: "material",
    status: "observed",
    scope: "group",
    nodeIds: ["function-worker", "reward-income"],
    counterClaimIds: ["truth-men-income"],
    sourceRefs: ["mens-als-functie"],
  },
  {
    id: "truth-work-hours",
    title: "Jonge mannen werken gemiddeld meer betaalde uren",
    claim:
      "Een belangrijk deel van het hogere gemiddelde jaarinkomen hangt samen met meer betaalde arbeidsuren.",
    layer: "material",
    status: "observed",
    scope: "group",
    nodeIds: ["capacity-time", "function-worker", "reward-income"],
    counterClaimIds: ["truth-men-income"],
    sourceRefs: ["mens-als-functie"],
  },
  {
    id: "truth-work-risk",
    title: "Mannen zijn sterk oververtegenwoordigd bij ernstige arbeidsongevallen",
    claim:
      "Het brondossier beschrijft een structurele mannelijke oververtegenwoordiging, mede door beroeps- en sectorverdeling.",
    layer: "material",
    status: "observed",
    scope: "group",
    nodeIds: ["capacity-body", "risk-work", "classification-accident"],
    counterClaimIds: ["truth-men-income"],
    missingInformation: [
      "Exacte blootstellingsuren per beroep",
      "Functiespecifieke risicocijfers",
      "Langdurige lichamelijke slijtage buiten meldingsplichtige ongevallen",
    ],
    sourceRefs: ["mens-als-functie"],
  },
  {
    id: "truth-suicide-men",
    title: "Mannen zijn sterk oververtegenwoordigd in zelfdoding",
    claim:
      "Volgens de in het dossier opgenomen CBS-cijfers overleden in 2025 1.205 mannen en 553 vrouwen door zelfdoding.",
    layer: "material",
    status: "observed",
    scope: "group",
    nodeIds: ["risk-suicide", "classification-death-statistic"],
    missingInformation: [
      "Individuele causaliteit",
      "Hulpzoekgeschiedenis van iedere overledene",
      "Relatie tussen specifieke sociale normen en individueel overlijden",
    ],
    sourceRefs: ["mens-als-functie"],
  },
  {
    id: "truth-defense-men",
    title: "De huidige militaire populatie is sterk mannelijk",
    claim:
      "De in het dossier opgenomen cijfers voor maart 2026 tonen een grote mannelijke meerderheid onder beroepsmilitairen.",
    layer: "material",
    status: "observed",
    scope: "institution",
    nodeIds: ["institution-defense", "function-soldier", "risk-military"],
    missingInformation: [
      "Functiespecifieke operationele blootstelling",
      "Toekomstige verandering in personeelsverhouding",
    ],
    sourceRefs: ["mens-als-functie"],
  },

  {
    id: "truth-system-hates-men",
    title: "Het systeem beschouwt mannen als wegwerplichaam",
    claim:
      "Er bestaat een coherent systeem dat mannen als groep intrinsiek minder waardevol vindt en daarom doelbewust lichamelijk risico op hen afwentelt.",
    layer: "symbolic",
    status: "unresolved",
    scope: "system",
    nodeIds: ["narrative-hidden-victim"],
    counterClaimIds: ["truth-functional-selection"],
    missingInformation: [
      "Direct bewijs van een centrale actor of gedeelde intentie",
      "Bewijs dat waargenomen uitkomsten niet beter door functie- en populatieselectie worden verklaard",
    ],
  },
  {
    id: "truth-functional-selection",
    title: "Functionele selectie is voldoende om veel patronen te verklaren",
    claim:
      "Verschillende instituties kunnen onafhankelijk dezelfde eigenschappen selecteren wanneer die lokaal bruikbaar zijn; een centrale anti-mannelijke intentie is daarvoor niet noodzakelijk.",
    layer: "epistemic",
    status: "derived",
    scope: "system",
    nodeIds: [
      "selection-usefulness",
      "institution-employer",
      "institution-defense",
      "institution-platform",
    ],
    counterClaimIds: ["truth-system-hates-men"],
    sourceRefs: ["mens-als-functie"],
  },

  {
    id: "truth-privilege-total",
    title: "Mannelijk voordeel verklaart de totale positie van mannen",
    claim:
      "Omdat mannen op bepaalde dimensies gemiddeld voordeel hebben, kunnen overige mannelijke risico's grotendeels als secundair worden behandeld.",
    layer: "symbolic",
    status: "contested",
    scope: "group",
    nodeIds: ["narrative-privilege"],
    counterClaimIds: [
      "truth-work-risk",
      "truth-suicide-men",
      "truth-defense-men",
    ],
    missingInformation: [
      "Een universele maat waarmee voordelen en risico's over verschillende domeinen vergelijkbaar worden",
    ],
  },

  {
    id: "truth-victim-total",
    title: "Mannelijk slachtofferschap verklaart de totale positie van mannen",
    claim:
      "Omdat mannen op bepaalde ernstige risico-indicatoren sterk vertegenwoordigd zijn, kunnen hun voordelen en verantwoordelijkheid als ondergeschikt worden behandeld.",
    layer: "symbolic",
    status: "contested",
    scope: "group",
    nodeIds: ["narrative-hidden-victim"],
    counterClaimIds: [
      "truth-men-income",
      "truth-functional-selection",
    ],
    missingInformation: [
      "Een universele maat waarmee slachtofferschap, macht, voordeel en verantwoordelijkheid tot één positie kunnen worden gereduceerd",
    ],
  },

  {
    id: "truth-silence-no-need",
    title: "Geen hulpvraag betekent geen hulpbehoefte",
    claim:
      "Wanneer iemand zich niet bij zorg of omgeving meldt, is er onvoldoende reden om aan te nemen dat onzichtbare behoefte bestaat.",
    layer: "epistemic",
    status: "contested",
    scope: "individual",
    nodeIds: ["selection-visibility", "institution-care"],
    counterClaimIds: ["truth-visibility-filter"],
  },
  {
    id: "truth-visibility-filter",
    title: "Zichtbaarheid is zelf een filter",
    claim:
      "Een systeem dat pas kan reageren nadat behoefte zichtbaar wordt, meet mede het vermogen van mensen om hun behoefte zichtbaar te maken.",
    layer: "epistemic",
    status: "derived",
    scope: "system",
    nodeIds: ["selection-visibility", "institution-care", "capacity-vulnerability"],
    counterClaimIds: ["truth-silence-no-need"],
    sourceRefs: ["mens-als-functie"],
  },
];
