#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const src = fs.readFileSync(path.resolve(__dirname, "..", "sedation-engine.ts"), "utf8");
const fail = (m) => { console.error(`❌ Sedação limites de dose: ${m}`); process.exit(1); };
const expect = (c, m) => { if (!c) fail(m); };

// Propofol — separar faixa usual, limite recomendado de bula e risco de PRIS.
expect(src.includes('upTo: 66.7'), "limite de 4 mg/kg/h (~66,7 mcg/kg/min) do propofol não está representado");
expect(src.includes("Acima do limite recomendado em bula para sedação em UTI"), "propofol acima de 4 mg/kg/h não está rotulado como excedendo a recomendação de bula");
expect(!src.includes('indication: "Máx 80 mcg/kg/min por < 48 h"'), "80 mcg/kg/min voltou a ser apresentado como máximo seguro do propofol");
expect(src.includes("a bula brasileira limita sedação em UTI a 4 mg/kg/h"), "alerta de propofol não distingue limite de bula de risco de síndrome de infusão");

// Midazolam — 0,02–0,10 mg/kg/h é a faixa usual de bula; 0,20 não é teto universal.
expect(src.includes("Faixa usual de manutenção em bula"), "faixa usual de manutenção do midazolam não está identificada");
expect(src.includes("Bula: manutenção usual 0,02–0,10 mg/kg/h"), "faixa usual 0,02–0,10 mg/kg/h do midazolam ausente");
expect(!src.includes("Acima do teto da SEDAÇÃO titulada por RASS"), "0,20 mg/kg/h voltou a ser chamado de teto farmacológico do midazolam");
expect(src.includes("não é um teto farmacológico universal"), "guard rail de 0,20 mg/kg/h do midazolam perdeu a distinção de teto universal");

// Dexmedetomidina — recomendação brasileira 0,2–0,7; exposição estudada até 1,4 não é 'dose máxima'.
expect(src.includes("Manutenção recomendada em bula brasileira"), "dexmedetomidina não identifica 0,2–0,7 mcg/kg/h como manutenção recomendada");
expect(src.includes("0,7–1,4 mcg/kg/h: doses até 1,4 foram estudadas"), "faixa estudada de dexmedetomidina acima da recomendação de bula não está explicitada");
expect(!src.includes('label: "Dose máxima — bradicardia/hipotensão"'), "dexmedetomidina voltou a chamar 1,5 mcg/kg/h de dose máxima recomendada");
expect(src.includes("> 1,4 mcg/kg/h: reavaliar indicação e fonte antes de prosseguir"), "dexmedetomidina acima da faixa revisada não exige reavaliação");

console.log("✅ Sedoanalgesia: faixa usual, recomendação de bula e guard rails permanecem semanticamente separados em propofol, midazolam e dexmedetomidina.");
