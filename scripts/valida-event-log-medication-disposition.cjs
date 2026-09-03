#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const bridge = read("lib/clinical-runtime-bridge.ts");
const legacyAdapter = read("lib/clinical-events.ts");
const disposition = read("lib/clinical-disposition-runtime.ts");

const issues = [];
const requireText = (source, text, message) => {
  if (!source.includes(text)) issues.push(message);
};
const forbidText = (source, text, message) => {
  if (source.includes(text)) issues.push(message);
};

requireText(
  bridge,
  "export function recordMedicationGiven",
  "Clinical Runtime Bridge não expõe recordMedicationGiven"
);
requireText(
  bridge,
  'type: "medication_given"',
  "recordMedicationGiven não grava medication_given"
);
requireText(
  bridge,
  "medicationId: input.medicationId?.trim() || null",
  "medicationId deixou de aceitar desconhecido explícito"
);
requireText(
  bridge,
  "dose: input.dose?.trim() || null",
  "dose deixou de aceitar desconhecido explícito"
);

requireText(
  legacyAdapter,
  'normalizedData.medication = "antiarrhythmic_unspecified"',
  "Adapter legado voltou a promover antiarrítmico genérico a droga específica"
);
requireText(
  legacyAdapter,
  "delete normalizedData.dose",
  "Adapter legado ainda persiste dose inferida para antiarrítmico não identificado"
);
requireText(
  legacyAdapter,
  'label: "Antiarrítmico administrado"',
  "Event Log não preserva rótulo genérico quando o agente não foi capturado"
);
forbidText(
  legacyAdapter,
  'label: "Amiodarona administrada"',
  "Clinical Core voltou a registrar amiodarona a partir da ação genérica"
);

requireText(
  disposition,
  'transition.mode !== "terminal" || transition.destinationKind !== "external_service"',
  "Disposition pode ser emitido fora de transição terminal para serviço externo"
);
requireText(
  disposition,
  'type: "disposition"',
  "Runtime de destino não grava evento disposition"
);
requireText(
  disposition,
  "confirmExternalClinicalDisposition",
  "Destino terminal não exige chamada explícita de confirmação"
);

if (issues.length) {
  console.error("❌ Event Log: medicação/destino com regressões:\n");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log("✅ Event Log: administração confirmada sem falsa precisão e disposition apenas explícito/terminal externo.");
