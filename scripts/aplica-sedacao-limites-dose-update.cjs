#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const file = path.resolve(__dirname, "..", "sedation-engine.ts");
let src = fs.readFileSync(file, "utf8");

function replaceOnce(label, before, after) {
  const count = src.split(before).length - 1;
  if (count === 0 && src.includes(after)) return;
  if (count !== 1) throw new Error(`${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
}

replaceOnce(
  "propofol-ranges",
  `          { upTo: 20, tone: "green", label: "Sedação leve (RASS −1/−2)", indication: "Desmame de VM, procedimentos" },
          { upTo: 50, tone: "yellow", label: "Sedação moderada (RASS −2/−3)", indication: "UTI padrão" },
          { upTo: 80, tone: "orange", label: "Sedação profunda (RASS −3/−4)", indication: "SARA, status epilepticus" },
          { upTo: null, tone: "red", label: "Dose alta — risco de síndrome do propofol", indication: "Máx 80 mcg/kg/min por < 48 h" },`,
  `          { upTo: 20, tone: "green", label: "Sedação leve (RASS −1/−2)", indication: "Desmame de VM, procedimentos" },
          { upTo: 50, tone: "yellow", label: "Faixa usual de manutenção em UTI", indication: "5–50 mcg/kg/min, titulada à resposta" },
          { upTo: 66.7, tone: "orange", label: "Acima da faixa usual — ainda até 4 mg/kg/h", indication: "50–66,7 mcg/kg/min: intensificar vigilância hemodinâmica e reavaliar a menor dose eficaz" },
          { upTo: null, tone: "red", label: "Acima do limite recomendado em bula para sedação em UTI", indication: "> 66,7 mcg/kg/min (> 4 mg/kg/h): usar apenas se o benefício superar o risco e reavaliar continuamente" },`
);
replaceOnce(
  "propofol-pris",
  '        "Síndrome do propofol: doses > 5 mg/kg/h (≈ 83 mcg/kg/min) por > 48 h — monitorar triglicerídeos, CPK e pH/lactato.",',
  '        "Síndrome de infusão do propofol é associada sobretudo a dose alta e exposição prolongada; a bula brasileira limita sedação em UTI a 4 mg/kg/h (≈ 66,7 mcg/kg/min), salvo benefício > risco. Em uso prolongado/alta dose, monitorar triglicerídeos, CPK e pH/lactato.",'
);

replaceOnce(
  "midazolam-ranges",
  `          { upTo: 0.04, tone: "green", label: "Sedação leve (ansiolítico/hipnótico)", indication: "0,02–0,04 mg/kg/h — RASS −1" },
          { upTo: 0.1, tone: "yellow", label: "Sedação moderada — RASS −2/−3", indication: "0,04–0,10 mg/kg/h" },
          { upTo: 0.2, tone: "orange", label: "Sedação profunda — RASS −3/−4", indication: "0,10–0,20 mg/kg/h" },`,
  `          { upTo: 0.04, tone: "green", label: "Sedação leve (ansiolítico/hipnótico)", indication: "0,02–0,04 mg/kg/h — RASS −1" },
          { upTo: 0.1, tone: "yellow", label: "Faixa usual de manutenção em bula", indication: "0,02–0,10 mg/kg/h, titulada ao alvo de sedação" },
          { upTo: 0.2, tone: "orange", label: "Acima da faixa usual — sedação profunda", indication: "0,10–0,20 mg/kg/h: doses maiores podem ocasionalmente ser necessárias, com maior risco de acúmulo e despertar tardio" },`
);
replaceOnce(
  "midazolam-red",
  '{ upTo: null, tone: "red", label: "Acima do teto da SEDAÇÃO titulada por RASS", indication: "> 0,20 mg/kg/h — para SEDAR, preferir propofol/dexmedetomidina (acúmulo em 24–48 h). NÃO se aplica ao STATUS EPILÉPTICO REFRATÁRIO, que é outro objetivo: 0,05–2 mg/kg/h titulado por EEG, com IOT e meta de supressão da atividade elétrica." },',
  '{ upTo: null, tone: "red", label: "Dose muito alta para sedação titulada por RASS", indication: "> 0,20 mg/kg/h — não é um teto farmacológico universal; reavaliar indicação e acúmulo. NÃO se aplica ao STATUS EPILÉPTICO REFRATÁRIO, que é outro objetivo terapêutico e deve seguir protocolo próprio com IOT/EEG." },'
);
replaceOnce(
  "midazolam-info",
  '      "Infusão 0,02–0,2 mg/kg/h (≈ 1,4–14 mg/h em 70 kg). Bolus de sedação: 0,01–0,05 mg/kg.",',
  '      "Bula: manutenção usual 0,02–0,10 mg/kg/h; doses maiores podem ocasionalmente ser necessárias e devem ser tituladas individualmente. Bolus de sedação: 0,01–0,05 mg/kg.",'
);

replaceOnce(
  "dex-ranges",
  `          { upTo: 0.4, tone: "green", label: "Ansiolítico / adjuvante sem sedação significativa", indication: "0,2–0,4 mcg/kg/h" },
          { upTo: 0.7, tone: "yellow", label: "Sedação leve (RASS 0/−1) — preserva drive", indication: "0,4–0,7 mcg/kg/h" },
          { upTo: 1.0, tone: "orange", label: "Sedação moderada (RASS −1/−2)", indication: "0,7–1,0 mcg/kg/h" },
          { upTo: null, tone: "red", label: "Dose máxima — bradicardia/hipotensão", indication: "Até 1,5 mcg/kg/h" },`,
  `          { upTo: 0.4, tone: "green", label: "Ansiolítico / adjuvante sem sedação significativa", indication: "0,2–0,4 mcg/kg/h" },
          { upTo: 0.7, tone: "yellow", label: "Manutenção recomendada em bula brasileira", indication: "0,2–0,7 mcg/kg/h, titulada ao efeito clínico" },
          { upTo: 1.4, tone: "orange", label: "Acima da posologia recomendada — faixa estudada", indication: "0,7–1,4 mcg/kg/h: doses até 1,4 foram estudadas, mas ultrapassam a manutenção recomendada na bula; exigir justificativa/protocolo e vigilância de FC/PA" },
          { upTo: null, tone: "red", label: "Acima da faixa revisada", indication: "> 1,4 mcg/kg/h: reavaliar indicação e fonte antes de prosseguir" },`
);

fs.writeFileSync(file, src);
console.log("✅ Sedoanalgesia: semântica de faixas/limites corrigida para propofol, midazolam e dexmedetomidina.");
