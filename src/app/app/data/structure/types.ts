export type NodeKind =
  | "human"
  | "capacity"
  | "institution"
  | "function"
  | "selection"
  | "reward"
  | "risk"
  | "failure"
  | "classification"
  | "norm"
  | "narrative"
  | "evidence"
  | "absence"
  | "question";

export type RealityLayer =
  | "material"
  | "symbolic"
  | "experiential"
  | "epistemic";

export type EvidenceStatus =
  | "observed"
  | "derived"
  | "hypothesis"
  | "contested"
  | "unresolved";

export type RelationType =
  | "contains"
  | "selects"
  | "converts"
  | "rewards"
  | "exposes"
  | "depends_on"
  | "classifies"
  | "reclassifies"
  | "normalizes"
  | "hides"
  | "amplifies"
  | "contradicts"
  | "qualifies"
  | "supports"
  | "externalizes"
  | "internalizes"
  | "precedes"
  | "follows"
  | "requires_visibility";

export type MeridianNode = {
  id: string;
  kind: NodeKind;
  title: string;
  short: string;
  layer: RealityLayer;
  concepts: string[];
  systemIds?: string[];
  sourceRefs?: string[];
};

export type MeridianRelation = {
  id: string;
  from: string;
  to: string;
  type: RelationType;
  description: string;
  evidenceStatus: EvidenceStatus;
  sourceRefs?: string[];
  confidence?: number;
};

export type TruthClaim = {
  id: string;
  title: string;
  claim: string;
  layer: RealityLayer;
  status: EvidenceStatus;
  scope: "individual" | "group" | "institution" | "system";
  nodeIds: string[];
  supportRelationIds?: string[];
  counterClaimIds?: string[];
  missingInformation?: string[];
  sourceRefs?: string[];
};

export type SystemFlowStep = {
  nodeId: string;
  role:
    | "input"
    | "selection"
    | "conversion"
    | "output"
    | "cost"
    | "failure"
    | "reclassification";
};

export type SystemFlow = {
  id: string;
  title: string;
  description: string;
  steps: SystemFlowStep[];
  question: string;
};

export type TruthCompleteness = {
  claimId: string;
  score: number;
  hasCounterClaims: boolean;
  hasMissingInformation: boolean;
  representedLayers: RealityLayer[];
  warnings: string[];
};
