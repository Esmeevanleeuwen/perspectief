export type ResearchSection = {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  paragraphs: string[];
  points?: string[];
};

export type Research = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  featured: boolean;
  dimensions: string[];
  question: string;
  method: string;
  sections: ResearchSection[];
};

export const research: Research[] = [
  {
    slug: "tegenspraak",
    label: "ONDERZOEK",
    title: "Wat gebeurt er met tegenspraak?",
    summary:
      "Van waarschuwing en advies tot kabinetsbesluit: we reconstrueren welke informatie binnenkomt, welke informatie verandert en welke informatie onderweg uit beeld raakt.",
    image: "/onderzoek-tegenspraak.jpg",
    imageAlt:
      "Mensen bewegen in het donker langs een steile helling tijdens de gebeurtenissen rond Ceuta.",
    featured: true,
    dimensions: ["Adviezen", "Documenten", "Perspectieven", "Besluiten"],
    question:
      "Hoe wordt maatschappelijke tegenspraak verwerkt voordat beleid een besluit wordt?",
    method:
      "We volgen niet één mening, maar de route van informatie: van ervaring en waarschuwing naar document, afweging, besluit en gevolg.",
    sections: [
      {
        id: "vraag",
        eyebrow: "De vraag",
        title: "Tegenspraak is meer dan voor of tegen.",
        intro:
          "Een waarschuwing kan gehoord worden zonder te worden gevolgd. Een advies kan worden verwerkt zonder dat het voorstel verandert. En informatie kan openbaar zijn zonder werkelijk zichtbaar te worden.",
        paragraphs: [
          "Dit onderzoek probeert daarom niet vooraf te bewijzen dat een kabinet wel of niet luistert. We reconstrueren eerst wat er beschikbaar was, wie welke informatie aandroeg, hoe daarop werd gereageerd en welke argumenten uiteindelijk in het besluit terugkomen.",
          "Daarbij onderscheiden we de inhoud van een waarschuwing, de reactie erop en de uiteindelijke politieke keuze. Alleen zo wordt zichtbaar waar verschil van inzicht normaal onderdeel van besluitvorming is en waar de informatieroute zelf onduidelijk wordt.",
        ],
      },
      {
        id: "route",
        eyebrow: "De informatieroute",
        title: "Van signaal naar gevolg.",
        paragraphs: [
          "Voor ieder deelonderzoek volgen we dezelfde beweging. Een ervaring, gebeurtenis of waarschuwing wordt eerst een signaal. Dat signaal kan worden vastgelegd in een advies, rapport, Kamervraag, consultatiereactie of ander document. Daarna onderzoeken we waar het in de besluitvorming terechtkomt.",
          "Vervolgens kijken we of het argument aantoonbaar wordt meegenomen, gedeeltelijk wordt verwerkt, inhoudelijk wordt verworpen of niet meer goed te reconstrueren is. Pas daarna kijken we naar het besluit en de gevolgen ervan.",
        ],
        points: [
          "Signaal — wat wordt gezien of ervaren?",
          "Vastlegging — waar wordt het gedocumenteerd?",
          "Afweging — wie reageert erop en met welke argumenten?",
          "Besluit — wat verandert er daadwerkelijk?",
          "Gevolg — wat betekent dat voor mensen en instituties?",
        ],
      },
      {
        id: "menselijke-laag",
        eyebrow: "Menselijke laag",
        title: "Een systeem wordt zichtbaar in individuele gevolgen.",
        paragraphs: [
          "De foto bij dit onderzoek komt uit de gebeurtenissen rond Ceuta in mei 2021. Zij is hier niet bedoeld als bewijs voor één politieke conclusie, maar als ingang naar een menselijke informatielaag: achter categorieën als grens, migratie, opvang en terugkeer bevinden zich mensen die ieder een ander deel van hetzelfde systeem meemaken.",
          "Daarom koppelen we het brede onderzoek naar tegenspraak aan concrete artikelen en casussen. Zo kan een beleidsvraag worden teruggebracht naar de mensen die de gevolgen ervaren, terwijl hun ervaring vervolgens weer wordt verbonden met documenten, regels en besluiten.",
        ],
      },
      {
        id: "transparantie",
        eyebrow: "Transparantie",
        title: "Beschikbaar is niet hetzelfde als zichtbaar.",
        paragraphs: [
          "Bij ieder dossier kijken we niet alleen of informatie formeel openbaar is. We onderzoeken ook of zij vindbaar, tijdig beschikbaar, begrijpelijk en herleidbaar is naar de uiteindelijke afweging.",
          "Wanneer een belangrijk document bestaat maar pas laat beschikbaar komt, verspreid staat over meerdere systemen of nauwelijks aan een besluit is te koppelen, is dat een andere informatiepositie dan wanneer de volledige afweging direct zichtbaar is.",
        ],
        points: [
          "Bestaat de informatie?",
          "Is zij bewaard?",
          "Is zij openbaar?",
          "Is zij vindbaar?",
          "Is zij begrijpelijk?",
          "Is zij terug te vinden in de uiteindelijke afweging?",
        ],
      },
      {
        id: "grens",
        eyebrow: "Onderzoeksgrens",
        title: "Wat we niet weten blijft zichtbaar.",
        paragraphs: [
          "Een ontbrekende verbinding wordt niet automatisch geïnterpreteerd als opzet, manipulatie of negeren. Soms is een afweging mondeling gemaakt, valt informatie buiten een formeel dossier of is een document nog niet beschikbaar.",
          "Juist daarom markeert Meridian onzekerheid als onderdeel van het onderzoek. Een vraagteken is geen lege plek die met een vermoeden moet worden gevuld, maar een concrete aanwijzing voor wat nog moet worden onderzocht.",
        ],
      },
    ],
  },
];

export function getResearchBySlug(slug: string) {
  return research.find((item) => item.slug === slug);
}

export function getFeaturedResearch() {
  return research.find((item) => item.featured);
}
