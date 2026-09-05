const fs = require('node:fs');
const path = require('node:path');

const rel = 'avc-decision-tree.ts';
const file = path.resolve(__dirname, '..', rel);
let src = fs.readFileSync(file, 'utf8');

function replaceOnce(oldText, newText, label) {
  if (!src.includes(oldText)) throw new Error(`${label}: bloco esperado não encontrado`);
  const next = src.replace(oldText, newText);
  if (next === src) throw new Error(`${label}: nenhuma alteração aplicada`);
  src = next;
}

replaceOnce(`      actions: [
        "TC de crânio sem contraste imediatamente (exclui hemorragia). Não atrasar por outros exames.",
        "AngioTC + TC de perfusão se suspeita de oclusão de grande vaso (OGV) ou janela estendida (6–24 h).",
        "Aferir PA nos dois braços; ECG de 12 derivações.",
        "Aplicar a escala NIHSS para quantificar o déficit (interpretação no próximo passo).",
      ],
      next: "tc_resultado",`, `      actions: [
        "TC de crânio sem contraste imediatamente (exclui hemorragia). Não atrasar por outros exames.",
        "AngioTC + TC de perfusão se suspeita de oclusão de grande vaso (OGV) ou janela estendida (6–24 h).",
        "Aferir PA nos dois braços; ECG de 12 derivações.",
        "Aplicar a escala NIHSS para quantificar o déficit (interpretação no próximo passo).",
      ],
      interactions: [
        { id: "tc_sem_contraste_realizada", label: "TC de crânio sem contraste realizada", kind: "confirm" },
        { id: "angio_tc_status", label: "AngioTC / imagem vascular", kind: "choice", options: [
          { id: "realizada", label: "Realizada", value: "realizada" },
          { id: "solicitada", label: "Solicitada / em andamento", value: "solicitada" },
          { id: "nao_indicada", label: "Não indicada neste momento", value: "nao_indicada" },
          { id: "indisponivel", label: "Indicada, mas indisponível", value: "indisponivel" },
        ] },
        { id: "pa_dois_bracos_status", label: "PA aferida nos dois braços", kind: "choice", options: [
          { id: "sim", label: "Sim", value: "sim" },
          { id: "um_braco", label: "Apenas um braço", value: "um_braco" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
      ],
      next: "tc_resultado",`, 'TC operacional');

replaceOnce(`      actions: [
        "PA permissiva: se NÃO trombolisou, tratar apenas se > 220/120 mmHg (reduzir ~15% nas primeiras 24 h). Pós-trombólise: < 180/105.",
        "Antiagregante: AAS 160–300 mg em 24–48 h (após 24 h e TC sem hemorragia se houve trombólise); manutenção 81–100 mg/dia.",
        "AVC minor (NIHSS ≤ 3) ou AIT de alto risco (ABCD² ≥ 4): DAPT iniciada idealmente em 12–24 h — AAS 160–300 mg de ataque, depois 81–100 mg/dia + clopidogrel 300 mg de ataque, depois 75 mg/dia. Manter ambos por 21 dias e então monoterapia (POINT/CHANCE). FA: anticoagular em 4–14 dias.",
        "Glicemia 140–180; normotermia (≤ 37,5); rastrear disfagia antes da via oral; profilaxia de TVP (compressão pneumática).",
        "Investigar etiologia: carótidas, ECG/Holter, ecocardiograma. PA-alvo de prevenção após 24 h: < 130/80.",
      ],
      next: "isq_destino",`, `      actions: [
        "PA permissiva: se NÃO trombolisou, tratar apenas se > 220/120 mmHg (reduzir ~15% nas primeiras 24 h). Pós-trombólise: < 180/105.",
        "Antiagregante: AAS 160–300 mg em 24–48 h (após 24 h e TC sem hemorragia se houve trombólise); manutenção 81–100 mg/dia.",
        "AVC minor (NIHSS ≤ 3) ou AIT de alto risco (ABCD² ≥ 4): DAPT iniciada idealmente em 12–24 h — AAS 160–300 mg de ataque, depois 81–100 mg/dia + clopidogrel 300 mg de ataque, depois 75 mg/dia. Manter ambos por 21 dias e então monoterapia (POINT/CHANCE). FA: anticoagular em 4–14 dias.",
        "Glicemia 140–180; normotermia (≤ 37,5); rastrear disfagia antes da via oral; profilaxia de TVP (compressão pneumática).",
        "Investigar etiologia: carótidas, ECG/Holter, ecocardiograma. PA-alvo de prevenção após 24 h: < 130/80.",
      ],
      interactions: [
        { id: "isq_antitrombotico_status", label: "Estratégia antitrombótica", kind: "choice", options: [
          { id: "aas", label: "AAS iniciado / programado", value: "aas" },
          { id: "dapt", label: "DAPT iniciada / programada", value: "dapt" },
          { id: "aguarda_24h_pos_trombolise", label: "Aguardando 24 h + TC após trombólise", value: "aguarda_24h_pos_trombolise" },
          { id: "anticoagulacao_programada", label: "Anticoagulação programada por indicação específica", value: "anticoagulacao_programada" },
          { id: "contraindicado_adiado", label: "Contraindicado / adiado — motivo clínico", value: "contraindicado_adiado" },
          { id: "pendente", label: "Ainda pendente de definição", value: "pendente" },
        ] },
        { id: "isq_disfagia_status", label: "Rastreio de disfagia antes da via oral", kind: "choice", options: [
          { id: "concluido", label: "Concluído", value: "concluido" },
          { id: "via_oral_suspensa", label: "Via oral suspensa até avaliação", value: "via_oral_suspensa" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
        { id: "isq_tvp_status", label: "Profilaxia mecânica de TEV", kind: "choice", options: [
          { id: "iniciada", label: "Compressão pneumática iniciada", value: "iniciada" },
          { id: "nao_indicada", label: "Não indicada neste momento", value: "nao_indicada" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
        { id: "isq_etiologia_status", label: "Investigação etiológica", kind: "choice", options: [
          { id: "iniciada", label: "Iniciada", value: "iniciada" },
          { id: "programada", label: "Programada", value: "programada" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
      ],
      next: "isq_destino",`, 'suporte isquêmico operacional');

fs.writeFileSync(file, src);
console.log('AVC wave 3: TC e suporte isquêmico convertidos em ações rastreáveis.');
