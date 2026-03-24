import type { AclsStateType } from "./domain";

type AclsProtocolState = {
  type: AclsStateType;
  text: string;
  speak?: string;
  details?: string[];
  next?: string;
  options?: Record<string, string>;
  timer?: number;
};

type AclsReversibleCauseDefinition = {
  id: string;
  label: string;
  actions: string[];
};

type AclsProtocolDefinition = {
  id: string;
  initialState: string;
  reversibleCauses?: AclsReversibleCauseDefinition[];
  states: Record<string, AclsProtocolState>;
};

type ProtocolValidationResult = {
  valid: boolean;
  errors: string[];
};

function isPositiveInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function validateAclsProtocolDefinition(protocol: AclsProtocolDefinition): ProtocolValidationResult {
  const errors: string[] = [];
  const stateIds = Object.keys(protocol.states);

  if (!protocol.id?.trim()) {
    errors.push("protocol.id é obrigatório.");
  }

  if (!protocol.initialState?.trim()) {
    errors.push("protocol.initialState é obrigatório.");
  } else if (!protocol.states[protocol.initialState]) {
    errors.push(`initialState inválido: ${protocol.initialState}`);
  }

  if (stateIds.length === 0) {
    errors.push("O protocolo precisa ter pelo menos um estado.");
  }

  const causeIds = new Set<string>();
  for (const cause of protocol.reversibleCauses ?? []) {
    if (causeIds.has(cause.id)) {
      errors.push(`Causa reversível duplicada: ${cause.id}`);
    }
    causeIds.add(cause.id);

    if (!cause.label?.trim()) {
      errors.push(`Causa reversível sem label: ${cause.id}`);
    }

    if (!Array.isArray(cause.actions) || cause.actions.length === 0) {
      errors.push(`Causa reversível sem ações: ${cause.id}`);
    }
  }

  for (const stateId of stateIds) {
    const state = protocol.states[stateId];

    if (!state.text?.trim()) {
      errors.push(`Estado ${stateId} sem text.`);
    }

    if (state.speak !== undefined && !state.speak.trim()) {
      errors.push(`Estado ${stateId} possui speak vazio.`);
    }

    if (state.details && !Array.isArray(state.details)) {
      errors.push(`Estado ${stateId} possui details inválido.`);
    }

    if (!["action", "question", "end"].includes(state.type)) {
      errors.push(`Estado ${stateId} possui type inválido: ${String(state.type)}`);
      continue;
    }

    if (state.timer !== undefined && !isPositiveInteger(state.timer)) {
      errors.push(`Estado ${stateId} possui timer inválido.`);
    }

    if (state.type === "question") {
      if (!state.options || Object.keys(state.options).length === 0) {
        errors.push(`Estado ${stateId} é question e precisa ter options.`);
      }

      if (state.next) {
        errors.push(`Estado ${stateId} é question e não pode ter next.`);
      }

      if (state.timer !== undefined) {
        errors.push(`Estado ${stateId} é question e não pode ter timer.`);
      }
    }

    if (state.type === "action") {
      if (state.options) {
        errors.push(`Estado ${stateId} é action e não pode ter options.`);
      }

      if (state.timer !== undefined && !state.next) {
        errors.push(`Estado ${stateId} tem timer e precisa ter next.`);
      }
    }

    if (state.type === "end") {
      if (state.next) {
        errors.push(`Estado ${stateId} é end e não pode ter next.`);
      }
      if (state.options) {
        errors.push(`Estado ${stateId} é end e não pode ter options.`);
      }
      if (state.timer !== undefined) {
        errors.push(`Estado ${stateId} é end e não pode ter timer.`);
      }
    }

    if (state.next && !protocol.states[state.next]) {
      errors.push(`Estado ${stateId} referencia next inexistente: ${state.next}`);
    }

    for (const [optionKey, nextStateId] of Object.entries(state.options ?? {})) {
      if (!optionKey.trim()) {
        errors.push(`Estado ${stateId} possui option vazia.`);
      }

      if (!protocol.states[nextStateId]) {
        errors.push(
          `Estado ${stateId} referencia estado inexistente em option "${optionKey}": ${nextStateId}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function assertValidAclsProtocolDefinition(protocol: AclsProtocolDefinition) {
  const validation = validateAclsProtocolDefinition(protocol);

  if (!validation.valid) {
    throw new Error(
      `Protocol ACLS inválido:\n${validation.errors.map((error) => `- ${error}`).join("\n")}`
    );
  }

  return protocol;
}

export type {
  AclsProtocolDefinition,
  AclsProtocolState,
  AclsReversibleCauseDefinition,
  ProtocolValidationResult,
};

export {
  assertValidAclsProtocolDefinition,
  validateAclsProtocolDefinition,
};
