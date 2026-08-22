import { nodes } from "./nodes";
import { relations } from "./relations";
import { truths } from "./truths";
import { systemFlows } from "./systems";
import type {
  MeridianNode,
  MeridianRelation,
  TruthClaim,
  TruthCompleteness,
  RealityLayer,
} from "./types";

export function getNode(id: string): MeridianNode | undefined {
  return nodes.find((node) => node.id === id);
}

export function getRelation(id: string): MeridianRelation | undefined {
  return relations.find((relation) => relation.id === id);
}

export function getTruth(id: string): TruthClaim | undefined {
  return truths.find((truth) => truth.id === id);
}

export function getRelationsForNode(nodeId: string): MeridianRelation[] {
  return relations.filter(
    (relation) => relation.from === nodeId || relation.to === nodeId
  );
}

export function getOutgoingRelations(nodeId: string): MeridianRelation[] {
  return relations.filter((relation) => relation.from === nodeId);
}

export function getIncomingRelations(nodeId: string): MeridianRelation[] {
  return relations.filter((relation) => relation.to === nodeId);
}

export function getRelatedNodes(nodeId: string): MeridianNode[] {
  const ids = new Set<string>();

  for (const relation of getRelationsForNode(nodeId)) {
    ids.add(relation.from === nodeId ? relation.to : relation.from);
  }

  return [...ids]
    .map((id) => getNode(id))
    .filter((node): node is MeridianNode => Boolean(node));
}

export function getTruthConflicts(claimId: string): TruthClaim[] {
  const claim = getTruth(claimId);
  if (!claim?.counterClaimIds) return [];

  return claim.counterClaimIds
    .map((id) => getTruth(id))
    .filter((truth): truth is TruthClaim => Boolean(truth));
}

export function getTruthsForNode(nodeId: string): TruthClaim[] {
  return truths.filter((truth) => truth.nodeIds.includes(nodeId));
}

export function getNodesForSystem(systemId: string): MeridianNode[] {
  const flow = systemFlows.find((item) => item.id === systemId);
  if (!flow) return [];

  return flow.steps
    .map((step) => getNode(step.nodeId))
    .filter((node): node is MeridianNode => Boolean(node));
}

export function calculateTruthCompleteness(
  claimId: string
): TruthCompleteness | undefined {
  const claim = getTruth(claimId);
  if (!claim) return undefined;

  const connectedTruths = [
    claim,
    ...getTruthConflicts(claimId),
  ];

  const representedLayers = Array.from(
    new Set(connectedTruths.map((truth) => truth.layer))
  ) as RealityLayer[];

  const hasCounterClaims =
    Boolean(claim.counterClaimIds && claim.counterClaimIds.length > 0);

  const hasMissingInformation =
    Boolean(claim.missingInformation && claim.missingInformation.length > 0);

  let score = 0.25;

  if (claim.status === "observed") score += 0.2;
  if (claim.sourceRefs?.length) score += 0.15;
  if (hasCounterClaims) score += 0.2;
  if (representedLayers.length >= 2) score += 0.1;
  if (!hasMissingInformation) score += 0.1;

  score = Math.min(1, Number(score.toFixed(2)));

  const warnings: string[] = [];

  if (!hasCounterClaims) {
    warnings.push(
      "Deze claim bevat nog geen expliciet gekoppelde tegenclaim of kwalificatie."
    );
  }

  if (hasMissingInformation) {
    warnings.push(
      "De claim bevat ontbrekende informatiedimensies en mag niet als volledige verklaring worden behandeld."
    );
  }

  if (representedLayers.length === 1) {
    warnings.push(
      "De claim is momenteel slechts vanuit één werkelijkheidslaag gemodelleerd."
    );
  }

  if (
    claim.status === "hypothesis" ||
    claim.status === "contested" ||
    claim.status === "unresolved"
  ) {
    warnings.push(
      `Bewijsstatus is ${claim.status}; toon dit expliciet in de interface.`
    );
  }

  return {
    claimId,
    score,
    hasCounterClaims,
    hasMissingInformation,
    representedLayers,
    warnings,
  };
}

/**
 * Detecteert een eenvoudige vorm van selectieve waarheidsvorming:
 * een selectie bevat uitsluitend claims uit één narratieve richting
 * terwijl bekende tegenclaims buiten de selectie blijven.
 */
export function detectSelectiveTruth(
  selectedClaimIds: string[]
): {
  selective: boolean;
  omittedCounterClaims: TruthClaim[];
  reason?: string;
} {
  const selected = selectedClaimIds
    .map((id) => getTruth(id))
    .filter((truth): truth is TruthClaim => Boolean(truth));

  const selectedIds = new Set(selected.map((truth) => truth.id));
  const omitted = new Map<string, TruthClaim>();

  for (const claim of selected) {
    for (const counterId of claim.counterClaimIds ?? []) {
      if (!selectedIds.has(counterId)) {
        const counter = getTruth(counterId);
        if (counter) omitted.set(counter.id, counter);
      }
    }
  }

  return {
    selective: omitted.size > 0,
    omittedCounterClaims: [...omitted.values()],
    reason:
      omitted.size > 0
        ? "De selectie bevat claims waarvan bekende tegenclaims of kwalificaties buiten beeld blijven."
        : undefined,
  };
}

/**
 * Geeft de volledige functionele keten terug voor een systeem.
 */
export function getSystemFlow(systemId: string) {
  return systemFlows.find((flow) => flow.id === systemId);
}
