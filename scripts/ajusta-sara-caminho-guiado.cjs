const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(__dirname, '..', 'eap-decision-tree.ts');
const src = fs.readFileSync(file, 'utf8');

const oldBlock = `    sara_gravidade: {
      id: "sara_gravidade",
      type: "decision",
      title: "Gravidade da SARA e resposta",
      question: "A SARA é grave/refratária apesar da ventilação protetora?",
      summary: "Relação P/F: {pf_txt}.",
      evidence: [
        "SARA grave: P/F ≤ 100. Refratária: P/F ≤ 150 com FiO₂ ≥ 0,6 e PEEP ≥ 5 após 12–24 h de VM protetora.",
        "Manobras de resgate são indicadas na SARA grave/refratária — não aguardar deterioração extrema.",
      ],
      options: [
        { id: "grave", label: "Grave/refratária (P/F ≤ 150) — manobras de resgate", next: "sara_resgate" },
        { id: "controlada", label: "Controlada com VM protetora", next: "sara_destino" },
      ],
    },

`;

const newBlock = `    sara_gravidade: {
      id: "sara_gravidade",
      type: "decision",
      title: "Gravidade da SARA e resposta",
      question: "A SARA é grave/refratária apesar da ventilação protetora?",
      summary: "Relação P/F: {pf_txt}.",
      evidence: [
        "SARA grave: P/F ≤ 100. Refratária: P/F ≤ 150 com FiO₂ ≥ 0,6 e PEEP ≥ 5 após 12–24 h de VM protetora.",
        "Manobras de resgate são indicadas na SARA grave/refratária — não aguardar deterioração extrema.",
      ],
      options: [
        { id: "guiado", label: "Não sei — me guie", next: "sara_gravidade_guiada_pf" },
        { id: "grave", label: "Grave/refratária (P/F ≤ 150) — manobras de resgate", next: "sara_resgate" },
        { id: "controlada", label: "Controlada com VM protetora", next: "sara_destino" },
      ],
    },

    sara_gravidade_guiada_pf: {
      id: "sara_gravidade_guiada_pf",
      type: "decision",
      title: "Primeiro: qual é a relação P/F?",
      question: "A relação PaO₂/FiO₂ está ≤ 150?",
      summary: "A relação P/F define se vale checar os critérios de resgate agora.",
      evidence: [
        "P/F ≤ 100 corresponde a SARA grave pelos critérios de Berlim.",
        "P/F ≤ 150 é o limiar usado neste fluxo para avaliar prona/resgate quando o suporte de O₂ e PEEP também é alto.",
      ],
      options: [
        { id: "sim", label: "Sim — P/F ≤ 150", next: "sara_gravidade_guiada_suporte" },
        { id: "nao", label: "Não — P/F > 150", next: "sara_destino" },
        { id: "sem_dado", label: "Ainda não tenho P/F", next: "sara_dados" },
      ],
    },

    sara_gravidade_guiada_suporte: {
      id: "sara_gravidade_guiada_suporte",
      type: "decision",
      title: "Agora: quanto suporte está sendo necessário?",
      question: "O paciente está com FiO₂ ≥ 0,6 e PEEP ≥ 5 apesar da ventilação protetora?",
      summary: "P/F baixo isoladamente não basta para chamar o quadro de refratário neste fluxo; confira também FiO₂, PEEP e a resposta à estratégia protetora.",
      evidence: [
        "P/F ≤ 150 com FiO₂ ≥ 0,6 e PEEP ≥ 5 identifica o cenário em que este protocolo considera manobras de resgate.",
        "Se o suporte ainda é menor ou a estratégia acabou de ser ajustada, mantenha ventilação protetora e reavalie a tendência.",
      ],
      options: [
        { id: "sim", label: "Sim — suporte alto e P/F ≤ 150", next: "sara_resgate" },
        { id: "nao", label: "Não — ainda não preenche esse cenário", next: "sara_destino" },
      ],
    },

`;

if (!src.includes(oldBlock)) {
  throw new Error('Bloco sara_gravidade esperado não encontrado; mutação abortada.');
}
if (src.includes('sara_gravidade_guiada_pf')) {
  throw new Error('Caminho guiado de SARA já existe; mutação abortada para evitar duplicação.');
}

fs.writeFileSync(file, src.replace(oldBlock, newBlock));
console.log('SARA: caminho guiado inserido com substituição única e escopo fechado.');
