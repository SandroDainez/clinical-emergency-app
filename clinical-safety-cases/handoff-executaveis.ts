import { appendClinicalEvent, clearClinicalEventLog } from "../lib/clinical-event-log";
import {
  clearClinicalHandoffs,
  consumeClinicalHandoff,
  listPendingClinicalHandoffs,
} from "../lib/clinical-handoff-runtime";
import { prepareAndPublishClinicalHandoff } from "../lib/clinical-handoff-orchestrator";
import { clearClinicalObservations, recordClinicalObservation } from "../lib/clinical-observations";
import { prepareRegisteredTargetHandoff } from "../lib/clinical-target-handoff-runtime";
import {
  PCR_TERMINAL_HANDOFF_CONTEXTS,
  type PcrTerminalHandoffContextContract,
} from "../lib/pcr-terminal-handoff-context";

export type ExecutableClinicalHandoffCase = {
  id: string;
  run: () => string[];
};

function resetHandoffState(): void {
  clearClinicalEventLog();
  clearClinicalObservations();
  clearClinicalHandoffs();
}

function getPcrContract(source: "tachycardia" | "bradycardia"): PcrTerminalHandoffContextContract {
  const contract = PCR_TERMINAL_HANDOFF_CONTEXTS.find((item) => item.source === source);
  if (!contract) throw new Error(`Contrato de PCR ausente para ${source}`);
  return contract;
}

function expectedFactIds(contract: PcrTerminalHandoffContextContract): readonly string[] {
  return [
    ...contract.requiredFacts,
    ...(contract.optionalFacts ?? []).filter((id) => !contract.requiredFacts.includes(id)),
  ];
}

export const EXECUTABLE_CLINICAL_HANDOFF_CASES: readonly ExecutableClinicalHandoffCase[] = [
  {
    id: "tachy-pulseless-handoff-complete-consume-once",
    run: () => {
      resetHandoffState();
      const contract = getPcrContract("tachycardia");
      const now = 1_800_000_000_000;

      recordClinicalObservation({ id: "ritmo_pre_parada", value: "TV monomórfica", recordedAt: now - 30_000, source: "manual", originModule: contract.fromModule });
      recordClinicalObservation({ id: "energia_ultima_cardioversao", value: "150 J", recordedAt: now - 20_000, source: "manual", originModule: contract.fromModule });
      recordClinicalObservation({ id: "numero_cardioversoes", value: "2", recordedAt: now - 15_000, source: "derived", originModule: contract.fromModule });
      appendClinicalEvent({ id: "evt-antiarr", type: "medication_given", occurredAt: now - 10_000, module: contract.fromModule, label: "Antiarrítmico em curso", data: { antiarritmico_em_curso: "amiodarona" } });
      appendClinicalEvent({ id: "evt-pulso", type: "decision_made", occurredAt: now - 5_000, module: contract.fromModule, label: "Perda de pulso", data: { tempo_perda_pulso: now - 5_000 } });
      appendClinicalEvent({ id: "evt-causa", type: "decision_made", occurredAt: now - 4_000, module: contract.fromModule, label: "Causa reversível suspeita", data: { suspeita_causa_reversivel: "isquemia" } });

      const result = prepareAndPublishClinicalHandoff({ contract, now });
      const issues: string[] = [];
      if (result.status !== "complete") issues.push(`esperado complete, recebido ${result.status}`);
      if (listPendingClinicalHandoffs().length !== 1) issues.push("handoff com contexto disponível não foi publicado exatamente uma vez");

      const consumed = consumeClinicalHandoff("pcr-adulto", contract.transitionId);
      if (!consumed) issues.push("PCR não consumiu o payload publicado");
      else {
        const expectedIds = expectedFactIds(contract);
        if (consumed.facts.length !== expectedIds.length) issues.push("payload consumido perdeu fatos preserváveis disponíveis");
        for (const factId of expectedIds) {
          if (!consumed.facts.some((fact) => fact.id === factId)) issues.push(`payload perdeu ${factId}`);
        }
        const rhythm = consumed.facts.find((fact) => fact.id === "ritmo_pre_parada");
        if (rhythm?.value !== "TV monomórfica") issues.push("ritmo pré-parada não foi preservado");
        if (rhythm?.recordedAt !== now - 30_000) issues.push("timestamp do ritmo não foi preservado");
      }
      if (consumeClinicalHandoff("pcr-adulto", contract.transitionId)) issues.push("payload foi consumido mais de uma vez");
      return issues;
    },
  },
  {
    id: "brady-pulseless-partial-context-published-with-missing-optional",
    run: () => {
      resetHandoffState();
      const contract = getPcrContract("bradycardia");
      const now = 1_800_000_100_000;

      recordClinicalObservation({ id: "ritmo_pre_parada", value: "BAV total", recordedAt: now - 30_000, source: "manual", originModule: contract.fromModule });
      appendClinicalEvent({ id: "evt-atropina", type: "medication_given", occurredAt: now - 20_000, module: contract.fromModule, label: "Atropina", data: { atropina_administrada: true } });
      appendClinicalEvent({ id: "evt-pulso-bradi", type: "decision_made", occurredAt: now - 5_000, module: contract.fromModule, label: "Perda de pulso", data: { tempo_perda_pulso: now - 5_000 } });

      const result = prepareAndPublishClinicalHandoff({ contract, now });
      const issues: string[] = [];
      if (result.status !== "complete") {
        issues.push(`contexto parcial PCR deve ser publicável; recebido ${result.status}`);
        return issues;
      }
      if (!result.missingOptionalFacts.includes("marcapasso_em_uso")) {
        issues.push("falta de marcapasso_em_uso não permaneceu explícita como opcional ausente");
      }
      if (result.missingFacts.length !== 0) {
        issues.push("PCR não deve transformar fatos preserváveis opcionais em obrigatórios");
      }
      if (listPendingClinicalHandoffs().length !== 1) {
        issues.push("contexto parcial verdadeiro não foi publicado para PCR");
      }

      const consumed = consumeClinicalHandoff("pcr-adulto", contract.transitionId);
      if (!consumed) return [...issues, "PCR não consumiu contexto parcial publicado"];
      if (!consumed.facts.some((fact) => fact.id === "ritmo_pre_parada" && fact.value === "BAV total")) {
        issues.push("ritmo disponível não atravessou no contexto parcial");
      }
      if (!consumed.facts.some((fact) => fact.id === "atropina_administrada" && fact.value === true)) {
        issues.push("atropina disponível não atravessou no contexto parcial");
      }
      if (consumed.facts.some((fact) => fact.id === "marcapasso_em_uso")) {
        issues.push("fato ausente foi fabricado no payload parcial");
      }
      return issues;
    },
  },
  {
    id: "tachy-handoff-observation-wins-over-event",
    run: () => {
      resetHandoffState();
      const contract = getPcrContract("tachycardia");
      const now = 1_800_000_200_000;
      const factIds = expectedFactIds(contract);

      for (const factId of factIds) {
        recordClinicalObservation({ id: factId, value: `obs:${factId}`, recordedAt: now - 10_000, source: "manual", originModule: contract.fromModule });
        appendClinicalEvent({ id: `evt:${factId}`, type: "observation_recorded", occurredAt: now - 1_000, module: contract.fromModule, label: factId, data: { [factId]: `event:${factId}` } });
      }

      const result = prepareAndPublishClinicalHandoff({ contract, now });
      const issues: string[] = [];
      if (result.status !== "complete") return [`esperado complete, recebido ${result.status}`];
      const consumed = consumeClinicalHandoff("pcr-adulto", contract.transitionId);
      if (!consumed) return ["payload não disponível para consumo"];
      if (consumed.facts.length !== factIds.length) issues.push("payload não preservou todos os fatos disponíveis do contrato");
      for (const fact of consumed.facts) {
        if (fact.value !== `obs:${fact.id}`) issues.push(`observação não teve prioridade para ${fact.id}`);
      }
      return issues;
    },
  },
  {
    id: "target-contingency-does-not-promote-to-handoff",
    run: () => {
      resetHandoffState();
      const attempt = prepareRegisteredTargetHandoff({
        fromProtocolId: "acls_tachycardia_2025",
        fromNodeId: "unstable_disposition",
        targetModuleId: "pcr-adulto",
        now: 1_800_000_300_000,
      });
      const issues: string[] = [];
      if (attempt.matched) issues.push("target de contingência foi promovido indevidamente a handoff registrado");
      if (!attempt.canProceedToDestination) issues.push("target comum foi bloqueado pelo resolver de handoff");
      if (listPendingClinicalHandoffs().length !== 0) issues.push("target de contingência publicou payload indevidamente");
      return issues;
    },
  },
  {
    id: "terminal-target-resolves-and-publishes-before-navigation",
    run: () => {
      resetHandoffState();
      const now = 1_800_000_400_000;
      appendClinicalEvent({
        id: "evt-terminal-pulse-loss",
        type: "decision_made",
        occurredAt: now - 1_000,
        module: "acls_tachycardia_2025",
        label: "Perdeu o pulso",
        data: { tempo_perda_pulso: now - 1_000 },
      });

      const attempt = prepareRegisteredTargetHandoff({
        fromProtocolId: "acls_tachycardia_2025",
        fromNodeId: "unstable_sem_pulso",
        targetModuleId: "pcr-adulto",
        now,
      });
      const issues: string[] = [];
      if (!attempt.matched) return ["target terminal sem pulso não resolveu contrato de handoff"];
      if (!attempt.canProceedToDestination) issues.push("handoff PCR terminal bloqueou a navegação");
      if (!attempt.readiness.contextPublished) issues.push("contexto disponível não foi publicado antes da navegação");
      if (listPendingClinicalHandoffs().length !== 1) issues.push("resolver terminal não publicou exatamente um payload");
      const consumed = consumeClinicalHandoff("pcr-adulto", attempt.contract.transitionId);
      if (!consumed?.facts.some((fact) => fact.id === "tempo_perda_pulso" && fact.value === now - 1_000)) {
        issues.push("payload terminal não preservou o horário disponível da perda de pulso");
      }
      return issues;
    },
  },
];

export function runExecutableClinicalHandoffCases(): string[] {
  const issues: string[] = [];
  for (const testCase of EXECUTABLE_CLINICAL_HANDOFF_CASES) {
    for (const issue of testCase.run()) issues.push(`${testCase.id}: ${issue}`);
  }
  return issues;
}
