import { supabase } from "./supabase";

type AclsAiInsight = {
  summary: string;
  focusNow: string[];
  pendingActions: string[];
  attentionChecks: string[];
  rationale: string;
  safetyNote: string;
};

type AclsAiRequestContext = {
  stateId: string;
  stateText: string;
  clinicalIntent?: string;
  presentationCueId?: string;
  suggestedNextStep?: {
    input: string;
    label: string;
    rationale?: string;
  } | null;
  timers: {
    duration: number;
    remaining: number;
  }[];
  documentationActions: { id: string; label: string }[];
  medicationSnapshot?: {
    adrenaline: {
      status: string;
      recommendedCount: number;
      administeredCount: number;
      pendingConfirmation: boolean;
      lastRecommendedAt?: number;
      lastAdministeredAt?: number;
      nextDueAt?: number;
    };
    antiarrhythmic: {
      status: string;
      recommendedCount: number;
      administeredCount: number;
      pendingConfirmation: boolean;
      lastRecommendedAt?: number;
      lastAdministeredAt?: number;
      nextDueAt?: number;
    };
  };
  operationalMetrics?: {
    cyclesCompleted: number;
    totalPcrDurationMs?: number;
    timeSinceLastAdrenalineMs?: number;
    timeSinceLastShockMs?: number;
    nextAdrenalineDueInMs?: number;
  };
  encounterSummary: {
    shockCount: number;
    adrenalineAdministeredCount: number;
    adrenalineSuggestedCount: number;
    antiarrhythmicAdministeredCount: number;
    antiarrhythmicSuggestedCount: number;
    advancedAirwaySecured?: boolean;
    currentStateId: string;
    currentStateText: string;
    lastEvents: string[];
  };
  heuristicTopThree: { id: string; label: string; explanation: string }[];
  reversibleCauses: {
    id: string;
    label: string;
    status: string;
    evidence: string[];
    actionsTaken: string[];
    responseObserved: string[];
  }[];
  clinicalLogTail: { title: string; details?: string }[];
};

function isAclsAiEnabled() {
  return process.env.EXPO_PUBLIC_ACLS_AI_ENABLED === "true";
}

function getAclsAiFunctionName() {
  return process.env.EXPO_PUBLIC_ACLS_AI_FUNCTION_NAME || "acls-assistant";
}

async function requestAclsAiInsight(
  context: AclsAiRequestContext
): Promise<AclsAiInsight | null> {
  if (!isAclsAiEnabled()) {
    return null;
  }

  const { data, error } = await supabase.functions.invoke(getAclsAiFunctionName(), {
    body: { context },
  });

  if (error) {
    throw error;
  }

  if (!data?.ok || !data?.insight) {
    return null;
  }

  return data.insight as AclsAiInsight;
}

export type { AclsAiInsight, AclsAiRequestContext };
export { getAclsAiFunctionName, isAclsAiEnabled, requestAclsAiInsight };
