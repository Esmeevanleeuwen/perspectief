import type { SystemFlow } from "./types";

export const systemFlows: SystemFlow[] = [
  {
    id: "labor",
    title: "Arbeid",
    description:
      "De mens wordt niet als geheel gekocht; geselecteerde tijd en capaciteit worden tijdelijk functioneel gemaakt.",
    question:
      "Waar gaan de opbrengsten heen en waar landen de lichamelijke, sociale en tijdskosten?",
    steps: [
      { nodeId: "human-whole", role: "input" },
      { nodeId: "capacity-time", role: "selection" },
      { nodeId: "capacity-body", role: "selection" },
      { nodeId: "function-worker", role: "conversion" },
      { nodeId: "reward-income", role: "output" },
      { nodeId: "risk-work", role: "cost" },
      { nodeId: "classification-accident", role: "reclassification" },
    ],
  },
  {
    id: "market",
    title: "Markt en platform",
    description:
      "De mens verschijnt als combinatie van behoefte, aandacht, gedrag en waarschijnlijkheid.",
    question:
      "Wanneer wordt een menselijke spanning een economisch bruikbare voorspelling?",
    steps: [
      { nodeId: "human-whole", role: "input" },
      { nodeId: "capacity-attention", role: "selection" },
      { nodeId: "capacity-belonging", role: "selection" },
      { nodeId: "function-consumer", role: "conversion" },
    ],
  },
  {
    id: "defense",
    title: "Defensie",
    description:
      "Menselijke capaciteiten worden geselecteerd, getraind en in een operationele rol geplaatst.",
    question:
      "Hoe wordt abstracte veiligheid omgezet in concreet gedragen menselijk risico?",
    steps: [
      { nodeId: "human-whole", role: "input" },
      { nodeId: "capacity-body", role: "selection" },
      { nodeId: "capacity-belonging", role: "selection" },
      { nodeId: "function-soldier", role: "conversion" },
      { nodeId: "reward-meaning", role: "output" },
      { nodeId: "risk-military", role: "cost" },
    ],
  },
  {
    id: "care",
    title: "Zorg",
    description:
      "Kwetsbaarheid moet eerst voldoende herkenbaar worden voordat zij institutioneel kan worden verwerkt.",
    question:
      "Hoeveel functioneren vereist een systeem van iemand op het moment dat functioneren zelf afneemt?",
    steps: [
      { nodeId: "human-whole", role: "input" },
      { nodeId: "capacity-vulnerability", role: "selection" },
      { nodeId: "selection-visibility", role: "selection" },
      { nodeId: "function-patient", role: "conversion" },
      { nodeId: "risk-psychological-collapse", role: "failure" },
      { nodeId: "risk-suicide", role: "failure" },
      { nodeId: "classification-death-statistic", role: "reclassification" },
    ],
  },
  {
    id: "statistics",
    title: "Statistische werkelijkheid",
    description:
      "Vergelijkbaarheid vereist reductie: het individuele leven wordt omgezet in categorieen.",
    question:
      "Welke informatie verdwijnt wanneer een mens correct wordt geclassificeerd?",
    steps: [
      { nodeId: "human-whole", role: "input" },
      { nodeId: "institution-statistics", role: "selection" },
      { nodeId: "classification-accident", role: "conversion" },
      { nodeId: "classification-death-statistic", role: "conversion" },
      { nodeId: "absence-full-person", role: "cost" },
    ],
  },
  {
    id: "truth-selection",
    title: "Selectieve waarheidsvorming",
    description:
      "De politieke conclusie kan veranderen zonder dat een enkel feit hoeft te worden vervalst; het is voldoende andere premissen te selecteren.",
    question:
      "Welke ware informatie ontbreekt voordat een conclusie als totale verklaring wordt behandeld?",
    steps: [
      { nodeId: "selection-truth", role: "selection" },
      { nodeId: "narrative-privilege", role: "conversion" },
      { nodeId: "narrative-hidden-victim", role: "conversion" },
      { nodeId: "absence-full-person", role: "cost" },
    ],
  },
];
