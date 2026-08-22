import { getNode, getRelationsForNode, getTruthsForNode } from "./engine";

/**
 * Een perspectief is hier geen mening.
 * Het is de informatie die zichtbaar wordt wanneer je vanaf één node naar
 * dezelfde werkelijkheid kijkt.
 */
export function buildPerspective(nodeId: string) {
  const node = getNode(nodeId);

  if (!node) return undefined;

  const relations = getRelationsForNode(nodeId);
  const truths = getTruthsForNode(nodeId);

  return {
    node,
    relations,
    truths,
    blindSpots: inferBlindSpots(nodeId),
  };
}

function inferBlindSpots(nodeId: string): string[] {
  switch (nodeId) {
    case "institution-employer":
      return [
        "Volledige psychische toestand buiten functioneren",
        "Relationele gevolgen van werkbelasting",
        "Menselijke waarde buiten productiviteit",
      ];

    case "institution-platform":
      return [
        "Waarom gedrag werkelijk betekenis heeft voor de gebruiker",
        "Niet-gemeten ervaringen buiten het platform",
        "Menselijke gevolgen die geen engagement-signaal produceren",
      ];

    case "institution-defense":
      return [
        "Volledige identiteit buiten operationele rol",
        "Toekomstige menselijke kosten die niet in actuele inzetbaarheid zitten",
      ];

    case "institution-care":
      return [
        "Kwetsbaarheid die nog niet als hulpvraag zichtbaar werd",
        "Mensen die de toegangsdrempel niet bereiken",
      ];

    case "institution-statistics":
      return [
        "Individuele causaliteit",
        "Niet-geregistreerde gebeurtenissen",
        "Betekenis die verloren gaat bij categorisering",
      ];

    default:
      return [
        "Informatie buiten de geselecteerde positie",
        "Relaties die niet in deze node zijn gemodelleerd",
      ];
  }
}
