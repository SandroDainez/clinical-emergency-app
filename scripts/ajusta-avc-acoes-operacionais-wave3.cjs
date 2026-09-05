const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(__dirname, '..', 'avc-decision-tree.ts');
let src = fs.readFileSync(file, 'utf8');

const oldText = `      actions: [
        "PA permissiva: se NÃO trombolisou, tratar apenas se > 220/120 mmHg (reduzir ~15% nas primeiras 24 h). Pós-trombólise: < 180/105.",
        "Antiagregante: AAS 160–300 mg em 24–48 h (após 24 h e TC sem hemorragia se houve trombólise); manutenção 81–100 mg/dia.",
        "AVC minor (NIHSS ≤ 3) ou AIT de alto risco (ABCD² ≥ 4): DAPT iniciada idealmente em 12–24 h — AAS 160–300 mg de ataque, depois 81–100 mg/dia + clopidogrel 300 mg de ataque, depois 75 mg/dia. Manter ambos por 21 dias e então monoterapia (POINT/CHANCE). FA: anticoagular em 4–14 dias.",
        "Glicemia 140–180; normotermia (≤ 37,5); rastrear disfagia antes da via oral; profilaxia de TVP (compressão pneumática).",
        "Investigar etiologia: carótidas, ECG/Holter, ecocardiograma. PA-alvo de prevenção após 24 h: < 130/80.",
      ],
      next: "isq_destino",`;

const newText = `      actions: [
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
      next: "isq_destino",`;

if (!src.includes(oldText)) throw new Error('isq_suporte: bloco esperado não encontrado');
src = src.replace(oldText, newText);
fs.writeFileSync(file, src);
console.log('AVC wave 3: suporte isquêmico convertido em ação rastreável.');
