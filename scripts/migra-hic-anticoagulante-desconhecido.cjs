#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const target = path.resolve(__dirname, "../avc-decision-tree.ts");
if (!fs.existsSync(target)) throw new Error(`Árvore de AVC não encontrada: ${target}`);

let source = fs.readFileSync(target, "utf8");
const original = source;

const oldOptions = `      options: [\n        { id: "sim", label: "Sim — em anticoagulante", next: "hic_reversao" },\n        { id: "nao", label: "Não anticoagulado", next: "hic_pic" },\n      ],\n    },\n\n    hic_reversao: {`;

const newOptions = `      options: [\n        { id: "sim", label: "Sim — em anticoagulante", next: "hic_reversao" },\n        { id: "nao", label: "Não anticoagulado", next: "hic_pic" },\n        { id: "nao_sei", label: "Não sei — descobrir agora", next: "hic_anticoag_descoberta" },\n      ],\n    },\n\n    hic_anticoag_descoberta: {\n      id: "hic_anticoag_descoberta",\n      type: "action",\n      title: "Anticoagulante desconhecido — descobrir sem atrasar o cuidado",\n      summary:\n        "Ausência de história não significa ausência de anticoagulação. Trate a informação como pendente e procure o agente/última dose rapidamente.",\n      actions: [\n        "BUSCAR EM PARALELO: familiar/cuidador, lista de medicamentos, prontuário, receita eletrônica, farmácia habitual e embalagens trazidas com o paciente.",\n        "REGISTRAR, se obtido: nome do anticoagulante, dose, horário da última tomada e função renal — esses dados mudam a probabilidade de efeito anticoagulante residual e a escolha do reversor.",\n        "COLETAR AGORA: TP/INR, TTPa, hemograma/plaquetas e função renal. Se disponível, usar teste específico para DOAC conforme o agente suspeito (atividade anti-Xa calibrada para inibidores de Xa; teste baseado em trombina/tempo de trombina diluído para dabigatrana).",
        "NÃO USAR TP/INR/TTPa NORMAIS PARA 'EXCLUIR' DOAC: testes rotineiros podem ser pouco sensíveis e não medem de forma confiável o nível de anticoagulação de todos os agentes.",
        "SE o anticoagulante e uma exposição clinicamente relevante forem identificados ou fortemente suspeitos, a reversão é tempo-dependente e não deve aguardar exames adicionais que atrasem o tratamento.",
        "SE o agente continuar realmente desconhecido, não escolher um antídoto específico às cegas: acionar neurologia/hematologia/farmácia clínica conforme disponibilidade enquanto mantém o manejo neurocrítico e continua a investigação.",
        "Assim que houver informação suficiente, volte à pergunta e classifique como anticoagulado ou não anticoagulado — não encerre a dúvida por falta de história.",
      ],\n      next: "hic_anticoag",\n    },\n\n    hic_reversao: {`;

function replaceExactlyOnce(from, to) {
  const first = source.indexOf(from);
  if (first < 0) {
    if (source.includes('id: "hic_anticoag_descoberta"')) return;
    throw new Error("Contexto esperado de hic_anticoag não encontrado; abortando sem alterar arquivo.");
  }
  if (source.indexOf(from, first + from.length) >= 0) {
    throw new Error("Contexto de hic_anticoag apareceu mais de uma vez; abortando.");
  }
  source = source.replace(from, to);
}

replaceExactlyOnce(oldOptions, newOptions);

if (source === original) {
  console.log("Ramo de anticoagulante desconhecido já integrado; nenhuma alteração necessária.");
  process.exit(0);
}

const required = [
  '{ id: "nao_sei", label: "Não sei — descobrir agora", next: "hic_anticoag_descoberta" }',
  'id: "hic_anticoag_descoberta"',
  'next: "hic_anticoag"',
  "NÃO USAR TP/INR/TTPa NORMAIS PARA 'EXCLUIR' DOAC",
  "não escolher um antídoto específico às cegas",
];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`Invariante ausente após migração: ${token}`);
}

fs.writeFileSync(target, source, "utf8");
console.log("Ramo seguro 'não sei' adicionado à decisão de anticoagulação na HIC.");
