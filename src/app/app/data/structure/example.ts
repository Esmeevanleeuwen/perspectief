import {
  buildPerspective,
  calculateTruthCompleteness,
  detectSelectiveTruth,
  getSystemFlow,
} from "./index";

// Voorbeeld: toon dezelfde werkelijkheid vanuit een werkgever.
export const employerPerspective = buildPerspective("institution-employer");

// Voorbeeld: beoordeel of één claim voldoende tegeninformatie bevat.
export const suicideTruthCompleteness = calculateTruthCompleteness(
  "truth-suicide-men"
);

// Voorbeeld: dit hoort als selectief gemarkeerd te worden,
// omdat alleen één kant van de arbeidsverhouding wordt gekozen.
export const oneSidedSelection = detectSelectiveTruth([
  "truth-men-income",
]);

// Voorbeeld: volledige arbeid-keten.
export const laborFlow = getSystemFlow("labor");
