#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const file = path.resolve(__dirname, "..", "lib", "clinical-target-semantics.ts");
let text = fs.readFileSync(file, "utf8");

const marker = '  {\n    id: "taquicardia-uti-pcr-contingencia",';
if (!text.includes(marker)) throw new Error("anchor de target semantics não encontrado");
if (text.includes('id: "abdome-cirurgia-sepse"')) {
  console.log("Lote 2 já aplicado; nenhuma alteração.");
  process.exit(0);
}

const block = `  {
    id: "abdome-cirurgia-sepse",
    fromProtocolId: "abdome_agudo",
    fromNodeId: "cirurgia",
    targetModuleId: "sepse-adulto",
    semantic: "reference",
    rationale: "Sepse abdominal com disfunção orgânica exige o protocolo etiológico de sepse, enquanto o nó mantém o destino cirúrgico/UTI.",
  },
  {
    id: "abdome-cirurgia-choque",
    fromProtocolId: "abdome_agudo",
    fromNodeId: "cirurgia",
    targetModuleId: "choque",
    semantic: "adjunctive_module",
    rationale: "A avaliação do perfil hemodinâmico e o suporte do choque ocorrem em paralelo ao controle do foco abdominal.",
  },
  {
    id: "abdome-cirurgia-vasoativos",
    fromProtocolId: "abdome_agudo",
    fromNodeId: "cirurgia",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Titulação vasoativa é suporte perioperatório especializado e não substitui o destino cirúrgico/UTI.",
  },
  {
    id: "dispneia-hipercapnica-vm",
    fromProtocolId: "insuficiencia_respiratoria",
    fromNodeId: "dx_hipercapnica",
    targetModuleId: "ventilacao-mecanica",
    semantic: "adjunctive_module",
    rationale: "A ventilação mecânica é suporte especializado no quadro hipercápnico; o nó respiratório continua responsável pelo destino UTI.",
  },
  {
    id: "ira-monitorizado-eletrólitos",
    fromProtocolId: "injuria_renal_aguda",
    fromNodeId: "destino_monitorizado",
    targetModuleId: "correcoes-eletroliticas",
    semantic: "adjunctive_module",
    rationale: "Correções eletrolíticas são uma tarefa terapêutica paralela durante a observação monitorizada da injúria renal.",
  },
  {
    id: "ira-monitorizado-calculadoras",
    fromProtocolId: "injuria_renal_aguda",
    fromNodeId: "destino_monitorizado",
    targetModuleId: "calculadoras-clinicas",
    semantic: "reference",
    rationale: "Calculadoras clínicas são ferramenta de consulta e não assumem o cuidado nem alteram o destino assistencial.",
  },
  {
    id: "ira-suporte-eletrólitos",
    fromProtocolId: "injuria_renal_aguda",
    fromNodeId: "destino_suporte",
    targetModuleId: "correcoes-eletroliticas",
    semantic: "adjunctive_module",
    rationale: "Correções eletrolíticas integram o suporte da injúria renal grave em paralelo ao destino UTI.",
  },
  {
    id: "ira-suporte-eap",
    fromProtocolId: "injuria_renal_aguda",
    fromNodeId: "destino_suporte",
    targetModuleId: "edema-agudo-pulmao",
    semantic: "reference",
    rationale: "O protocolo de edema agudo de pulmão é consultado quando congestão pulmonar compõe a injúria renal grave; não substitui o destino UTI.",
  },
  {
    id: "intoxicacoes-uti-isr",
    fromProtocolId: "intoxicacoes_exogenas",
    fromNodeId: "uti",
    targetModuleId: "isr-rapida",
    semantic: "adjunctive_module",
    rationale: "Proteção de via aérea é suporte especializado quando necessária na intoxicação grave, mantendo o destino UTI.",
  },
  {
    id: "intoxicacoes-uti-vasoativos",
    fromProtocolId: "intoxicacoes_exogenas",
    fromNodeId: "uti",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Suporte vasoativo é terapia paralela na intoxicação hemodinamicamente instável e não transfere a responsabilidade do caso.",
  },
  {
    id: "intoxicacoes-uti-eletrólitos",
    fromProtocolId: "intoxicacoes_exogenas",
    fromNodeId: "uti",
    targetModuleId: "correcoes-eletroliticas",
    semantic: "adjunctive_module",
    rationale: "Correções eletrolíticas são suporte específico dentro do manejo toxicológico e não substituem o protocolo de origem.",
  },
  {
    id: "politrauma-uti-vm",
    fromProtocolId: "politrauma",
    fromNodeId: "uti",
    targetModuleId: "ventilacao-mecanica",
    semantic: "adjunctive_module",
    rationale: "Parametrização ventilatória pós-intubação e na contusão pulmonar é suporte paralelo ao cuidado do trauma grave.",
  },
  {
    id: "politrauma-uti-vasoativos",
    fromProtocolId: "politrauma",
    fromNodeId: "uti",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Vasoativos são suporte hemodinâmico especializado dentro do destino UTI do trauma grave.",
  },
  {
    id: "politrauma-uti-sedoanalgesia",
    fromProtocolId: "politrauma",
    fromNodeId: "uti",
    targetModuleId: "sedoanalgesia",
    semantic: "adjunctive_module",
    rationale: "Sedoanalgesia e bloqueio neuromuscular são suporte paralelo no trauma grave e não substituem o protocolo de origem.",
  },
  {
    id: "choque-cardio-frio-seco-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_frio_seco",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Inotrópicos/vasopressores são suporte especializado dentro do manejo do choque cardiogênico frio e seco.",
  },
  {
    id: "choque-cardio-normotenso-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_normotenso",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "A titulação hemodinâmica é apoio especializado mesmo quando a pressão arterial ainda está preservada.",
  },
  {
    id: "choque-cardio-valvar-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_valvar",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Vasoativos/inotrópicos apoiam a estabilização da causa valvar sem substituir o manejo etiológico e o destino UTI.",
  },
  {
    id: "choque-cardio-bradi-acls",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_bradi",
    targetModuleId: "bradicardia-acls",
    semantic: "adjunctive_module",
    rationale: "O algoritmo de bradicardia executa o tratamento do ritmo em paralelo ao manejo do choque cardiogênico.",
  },
  {
    id: "choque-cardio-bradi-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardio_bradi",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Suporte vasoativo pode ser necessário enquanto o ritmo é tratado, sem substituir o destino UTI.",
  },
  {
    id: "choque-cardiogenico-sca",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardiogenico",
    targetModuleId: "sindromes-coronarianas",
    semantic: "reference",
    rationale: "O protocolo coronariano é referência etiológica quando síndrome coronariana é a causa do choque cardiogênico.",
  },
  {
    id: "choque-cardiogenico-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_cardiogenico",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Titulação de inotrópico/vasopressor é suporte paralelo no choque cardiogênico.",
  },
  {
    id: "choque-septico-sepse",
    fromProtocolId: "choque",
    fromNodeId: "dx_septico",
    targetModuleId: "sepse-adulto",
    semantic: "reference",
    rationale: "O módulo de sepse aprofunda antimicrobianos e controle de foco quando a etiologia do choque é séptica.",
  },
  {
    id: "choque-anafilatico-anafilaxia",
    fromProtocolId: "choque",
    fromNodeId: "dx_anafilatico",
    targetModuleId: "anafilaxia",
    semantic: "reference",
    rationale: "O protocolo de anafilaxia é a referência etiológica quando o choque é anafilático; o nó de choque já conserva o destino assistencial.",
  },
  {
    id: "choque-distributivo-outro-vasoativos",
    fromProtocolId: "choque",
    fromNodeId: "dx_distributivo_outro",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "Vasopressor é suporte especializado no choque distributivo de outra etiologia e não substitui a investigação causal.",
  },
`;

text = text.replace(marker, block + marker);
fs.writeFileSync(file, text);
console.log("✅ Lote 2 de target semantics aplicado: 24 contratos adicionados.");
