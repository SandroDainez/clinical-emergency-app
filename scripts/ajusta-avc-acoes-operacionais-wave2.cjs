const fs = require('node:fs');
const path = require('node:path');

const rel = 'avc-decision-tree.ts';
const file = path.resolve(__dirname, '..', rel);
let src = fs.readFileSync(file, 'utf8');

function once(oldText, newText, label) {
  if (!src.includes(oldText)) throw new Error(`${label}: bloco esperado não encontrado`);
  const next = src.replace(oldText, newText);
  if (next === src) throw new Error(`${label}: nenhuma alteração aplicada`);
  src = next;
}

// TC: deixa de ser lista passiva e passa a registrar execução/resultado operacional.
once(`      actions: [
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
        { id: "tc_cranio_status", label: "TC de crânio sem contraste", kind: "choice", options: [
          { id: "realizada", label: "Realizada", value: "realizada" },
          { id: "em_andamento", label: "Em andamento", value: "em_andamento" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
        { id: "angiotc_perfusao_status", label: "AngioTC / perfusão", kind: "choice", options: [
          { id: "realizada", label: "Realizada", value: "realizada" },
          { id: "indicada_pendente", label: "Indicada — pendente", value: "indicada_pendente" },
          { id: "nao_indicada", label: "Não indicada neste momento", value: "nao_indicada" },
        ] },
        { id: "pa_aferida", label: "PA aferida", kind: "confirm" },
        { id: "ecg_status", label: "ECG 12 derivações", kind: "choice", options: [
          { id: "feito", label: "Realizado", value: "feito" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
      ],
      next: "tc_resultado",`, 'TC operacional');

// PA pré-trombólise: registrar resposta e impedir que o fluxo trombolise automaticamente se o alvo não foi atingido.
once(`      actions: [
        "METOPROLOL IV (1ª linha no Brasil): 5 mg a cada 10 min, a 1 mg/min, máximo 20 mg. Ampola de 5 mL com 1 mg/mL.",
        "OU ESMOLOL IV: 500 mcg/kg/min em 1 min → 50 mcg/kg/min por 4 min. Se a PA seguir inadequada, repetir o bólus de 500 mcg/kg/min e subir a manutenção para 100, depois 150, depois 200 mcg/kg/min (máximo). Atingido o alvo, manter em infusão contínua.",
        "NITROPRUSSIATO DE SÓDIO 0,5–8 mcg/kg/min, com reajuste a cada 10 min — indicado quando o betabloqueador está contraindicado (asma, insuficiência cardíaca, anormalidade grave da função cardíaca) ou quando a hipertensão não cede.",
        "⚠️ Labetalol, nicardipino e clevidipino são as escolhas da AHA, mas NÃO têm apresentação intravenosa comercializada no Brasil. A diretriz brasileira (SBDCV) trabalha com metoprolol, esmolol e nitroprussiato — é o que existe à beira do leito aqui.",
        "NÃO usar nitrato sublingual.",
        "Reaferir a PA — só liberar a trombólise com PA < 185/110 mmHg.",
        "Se a PA não baixar de forma sustentada, não trombolisar.",
      ],
      next: "trombolise",`, `      actions: [
        "METOPROLOL IV (1ª linha no Brasil): 5 mg a cada 10 min, a 1 mg/min, máximo 20 mg. Ampola de 5 mL com 1 mg/mL.",
        "OU ESMOLOL IV: 500 mcg/kg/min em 1 min → 50 mcg/kg/min por 4 min. Se a PA seguir inadequada, repetir o bólus de 500 mcg/kg/min e subir a manutenção para 100, depois 150, depois 200 mcg/kg/min (máximo). Atingido o alvo, manter em infusão contínua.",
        "NITROPRUSSIATO DE SÓDIO 0,5–8 mcg/kg/min, com reajuste a cada 10 min — indicado quando o betabloqueador está contraindicado (asma, insuficiência cardíaca, anormalidade grave da função cardíaca) ou quando a hipertensão não cede.",
        "⚠️ Labetalol, nicardipino e clevidipino são as escolhas da AHA, mas NÃO têm apresentação intravenosa comercializada no Brasil. A diretriz brasileira (SBDCV) trabalha com metoprolol, esmolol e nitroprussiato — é o que existe à beira do leito aqui.",
        "NÃO usar nitrato sublingual.",
        "Reaferir a PA — só liberar a trombólise com PA < 185/110 mmHg.",
        "Se a PA não baixar de forma sustentada, não trombolisar.",
      ],
      interactions: [
        { id: "pa_tratamento_status", label: "Tratamento da PA", kind: "choice", options: [
          { id: "iniciado", label: "Iniciado", value: "iniciado" },
          { id: "ajustado", label: "Ajustado / escalonado", value: "ajustado" },
          { id: "contraindicado", label: "Opção inicial contraindicada — alternativa usada", value: "alternativa" },
        ] },
        { id: "pas_pos_tratamento", label: "PAS após tratamento", kind: "number", min: 40, max: 300, step: 1, unit: "mmHg" },
        { id: "pad_pos_tratamento", label: "PAD após tratamento", kind: "number", min: 20, max: 160, step: 1, unit: "mmHg" },
      ],
      next: {
        possiveis: ["trombolise", "isq_trombectomia_check"],
        escolher: (values) => {
          const pas = toNumber(values.pas_pos_tratamento);
          const pad = toNumber(values.pad_pos_tratamento);
          return pas !== null && pad !== null && pas < 185 && pad < 110
            ? "trombolise"
            : "isq_trombectomia_check";
        },
      },`, 'PA pré-trombólise operacional');

// Trombólise: registrar qual estratégia realmente foi administrada ou se não foi feita.
once(`      actions: [
        "Alteplase: dose total {alteplaseDose} mg (0,9 mg/kg, máx 90 mg) — {alteplaseBolus} mg em bolus em 1 min (10%) + {alteplaseInfusao} mg em infusão por 60 min.",`, `      actions: [
        "Alteplase: dose total {alteplaseDose} mg (0,9 mg/kg, máx 90 mg) — {alteplaseBolus} mg em bolus em 1 min (10%) + {alteplaseInfusao} mg em infusão por 60 min.",`, 'âncora trombólise');
once(`        "SEM antiagregante/anticoagulante/punções por 24 h. Deterioração/cefaleia/vômito → suspender e TC (suspeita de hemorragia).",
      ],
      next: "isq_trombectomia_check",`, `        "SEM antiagregante/anticoagulante/punções por 24 h. Deterioração/cefaleia/vômito → suspender e TC (suspeita de hemorragia).",
      ],
      interactions: [
        { id: "trombolise_status", label: "Trombólise IV", kind: "choice", options: [
          { id: "alteplase", label: "Alteplase administrada / iniciada", value: "alteplase" },
          { id: "tenecteplase", label: "Tenecteplase administrada", value: "tenecteplase" },
          { id: "nao_administrada", label: "Não administrada", value: "nao_administrada" },
          { id: "interrompida", label: "Interrompida por intercorrência", value: "interrompida" },
        ] },
        { id: "monitorizacao_pos_trombolise", label: "Monitorização pós-trombólise organizada", kind: "choice", options: [
          { id: "sim", label: "Sim", value: "sim" },
          { id: "nao_aplicavel", label: "Não aplicável — não trombolisou", value: "nao_aplicavel" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
      ],
      next: "isq_trombectomia_check",`, 'trombólise operacional');

// Trombectomia: registrar confirmação e logística real.
once(`      actions: [
        "Confirmar oclusão de grande vaso com angio-TC / angio-RM.",
        "Acionar a neurorradiologia intervencionista IMEDIATAMENTE.",
        "Transferir para centro com capacidade de trombectomia se necessário — não atrasar.",
        "Manter PA < 180/105 mmHg; reavaliar NIHSS continuamente.",
      ],
      next: "isq_suporte",`, `      actions: [
        "Confirmar oclusão de grande vaso com angio-TC / angio-RM.",
        "Acionar a neurorradiologia intervencionista IMEDIATAMENTE.",
        "Transferir para centro com capacidade de trombectomia se necessário — não atrasar.",
        "Manter PA < 180/105 mmHg; reavaliar NIHSS continuamente.",
      ],
      interactions: [
        { id: "lvo_confirmacao_status", label: "Oclusão de grande vaso", kind: "choice", options: [
          { id: "confirmada", label: "Confirmada", value: "confirmada" },
          { id: "imagem_pendente", label: "Imagem pendente", value: "imagem_pendente" },
        ] },
        { id: "neurorradio_acionada", label: "Neurorradiologia intervencionista acionada", kind: "confirm" },
        { id: "trombectomia_logistica", label: "Logística para trombectomia", kind: "choice", options: [
          { id: "local", label: "Centro atual realizará", value: "local" },
          { id: "transferencia", label: "Transferência acionada", value: "transferencia" },
          { id: "aguardando", label: "Aguardando definição / vaga", value: "aguardando" },
        ] },
      ],
      next: "isq_suporte",`, 'trombectomia operacional');

// HIC inicial: captura o estado que será necessário nas decisões seguintes.
once(`      actions: [
        "Estabilizar: ABC, GCS, NIHSS. Cabeceira 30°. 2 acessos calibrosos. Labs: HMG, coagulograma (TP/TTPa/INR), plaquetas, função renal/hepática, tipagem, toxicológico (< 50 anos).",
        "Volume do hematoma (ABC/2 = A × B × C / 2, em cm): > 30 mL = maior mortalidade; > 60 mL hemisférico ou > 20 mL fossa posterior = prognóstico grave. Avaliar extensão intraventricular (SIV).",
        "CONTROLE PRESSÓRICO (AHA/ASA 2022): se PAS 150–220 → reduzir para alvo 140 mmHg em 1 h (INTERACT2/ATACH-2). NÃO reduzir abaixo de 130 nas primeiras 24 h. PAS > 220 → redução IV guiada por cateter arterial.",
        "Fármacos NO BRASIL: metoprolol IV ou esmolol IV; nitroprussiato de sódio quando o betabloqueador estiver contraindicado ou a PA não ceder. Labetalol, nicardipino e clevidipino IV — as escolhas citadas pela AHA — não têm apresentação intravenosa comercializada no país.",
        "AngioTC se jovem, sem HAS ou com 'spot sign' (prediz expansão do hematoma).",
      ],
      next: "hic_anticoag",`, `      actions: [
        "Estabilizar: ABC, GCS, NIHSS. Cabeceira 30°. 2 acessos calibrosos. Labs: HMG, coagulograma (TP/TTPa/INR), plaquetas, função renal/hepática, tipagem, toxicológico (< 50 anos).",
        "Volume do hematoma (ABC/2 = A × B × C / 2, em cm): > 30 mL = maior mortalidade; > 60 mL hemisférico ou > 20 mL fossa posterior = prognóstico grave. Avaliar extensão intraventricular (SIV).",
        "CONTROLE PRESSÓRICO (AHA/ASA 2022): se PAS 150–220 → reduzir para alvo 140 mmHg em 1 h (INTERACT2/ATACH-2). NÃO reduzir abaixo de 130 nas primeiras 24 h. PAS > 220 → redução IV guiada por cateter arterial.",
        "Fármacos NO BRASIL: metoprolol IV ou esmolol IV; nitroprussiato de sódio quando o betabloqueador estiver contraindicado ou a PA não ceder. Labetalol, nicardipino e clevidipino IV — as escolhas citadas pela AHA — não têm apresentação intravenosa comercializada no país.",
        "AngioTC se jovem, sem HAS ou com 'spot sign' (prediz expansão do hematoma).",
      ],
      interactions: [
        { id: "hic_pas", label: "PAS atual", kind: "number", min: 40, max: 300, step: 1, unit: "mmHg" },
        { id: "hic_pad", label: "PAD atual", kind: "number", min: 20, max: 160, step: 1, unit: "mmHg" },
        { id: "hic_gcs", label: "GCS atual", kind: "number", min: 3, max: 15, step: 1 },
        { id: "hic_labs_status", label: "Labs iniciais da HIC", kind: "choice", options: [
          { id: "coletados", label: "Coletados", value: "coletados" },
          { id: "parcial", label: "Parcial", value: "parcial" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
        { id: "hic_volume_status", label: "Volume/extensão do hematoma", kind: "choice", options: [
          { id: "avaliado", label: "Avaliado", value: "avaliado" },
          { id: "pendente", label: "Pendente", value: "pendente" },
          { id: "nao_disponivel", label: "Não disponível ainda", value: "nao_disponivel" },
        ] },
      ],
      next: "hic_anticoag",`, 'HIC inicial operacional');

// Reversão: registra agente e se a reversão foi realmente executada.
once(`      actions: [
        "Warfarina/AVK: complexo protrombínico de 4 fatores (PCC4) POR FAIXA DE INR — INR 2–<4: 25 UI/kg (máx 2.500 UI); INR 4–6: 35 UI/kg (máx 3.500 UI); INR > 6: 50 UI/kg (máx 5.000 UI).",
        "Associar vitamina K 10 mg IV em infusão lenta. Reavaliar INR 15–60 min após o PCC e de forma seriada. Conferir a bula do produto: a unidade é de fator IX.",
        "Heparina não fracionada (HNF): sulfato de protamina 1 mg / 100 UI de heparina (máx 50 mg).",
        "Dabigatrana: idarucizumabe (Praxbind®) 5 g IV (2 × 2,5 g).",
        "Rivaroxabana / Apixabana / Edoxabana (anti-Xa): andexanet alfa OU CCP 4 fatores 50 UI/kg IV.",
        "Suspender o anticoagulante; reavaliar coagulação após a reversão.",
      ],
      next: "hic_pic",`, `      actions: [
        "Warfarina/AVK: complexo protrombínico de 4 fatores (PCC4) POR FAIXA DE INR — INR 2–<4: 25 UI/kg (máx 2.500 UI); INR 4–6: 35 UI/kg (máx 3.500 UI); INR > 6: 50 UI/kg (máx 5.000 UI).",
        "Associar vitamina K 10 mg IV em infusão lenta. Reavaliar INR 15–60 min após o PCC e de forma seriada. Conferir a bula do produto: a unidade é de fator IX.",
        "Heparina não fracionada (HNF): sulfato de protamina 1 mg / 100 UI de heparina (máx 50 mg).",
        "Dabigatrana: idarucizumabe (Praxbind®) 5 g IV (2 × 2,5 g).",
        "Rivaroxabana / Apixabana / Edoxabana (anti-Xa): andexanet alfa OU CCP 4 fatores 50 UI/kg IV.",
        "Suspender o anticoagulante; reavaliar coagulação após a reversão.",
      ],
      interactions: [
        { id: "hic_anticoagulante_agente", label: "Anticoagulante identificado", kind: "choice", options: [
          { id: "avk", label: "Warfarina / AVK", value: "avk" },
          { id: "hnf", label: "Heparina não fracionada", value: "hnf" },
          { id: "dabigatrana", label: "Dabigatrana", value: "dabigatrana" },
          { id: "anti_xa", label: "Inibidor de fator Xa", value: "anti_xa" },
          { id: "outro", label: "Outro / ainda não definido", value: "outro" },
        ] },
        { id: "hic_reversao_status", label: "Reversão", kind: "choice", options: [
          { id: "administrada", label: "Administrada", value: "administrada" },
          { id: "em_curso", label: "Em curso", value: "em_curso" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
        { id: "hic_coagulacao_reavaliacao", label: "Reavaliação de coagulação", kind: "choice", options: [
          { id: "realizada", label: "Realizada", value: "realizada" },
          { id: "programada", label: "Programada / aguardando", value: "programada" },
        ] },
      ],
      next: "hic_pic",`, 'reversão HIC operacional');

// PIC/convulsão: permite registrar positivo, negativo ou pendência sem obrigar intervenção não indicada.
once(`      actions: [
        "Sinais de hipertensão intracraniana: osmoterapia — manitol 20% 0,5–1 g/kg IV em 20 min OU SF 3% 150 mL. Alvo osmolalidade 300–320 mOsm/L; evitar hiponatremia.",
        "Convulsões CLÍNICAS: tratar imediatamente (levetiracetam, lacosamida ou fenitoína). Profilaxia anticonvulsivante de rotina NÃO é recomendada (AHA/ASA 2022).",
        "Glicemia 140–180; normotermia (≤ 37,5); cabeceira 30°; evitar hipotensão e hipóxia.",
        "Profilaxia de TEV: meia elástica/compressão; heparina SC apenas após 24–48 h de estabilidade imagiológica.",
      ],
      next: "hic_cirurgia",`, `      actions: [
        "Sinais de hipertensão intracraniana: osmoterapia — manitol 20% 0,5–1 g/kg IV em 20 min OU SF 3% 150 mL. Alvo osmolalidade 300–320 mOsm/L; evitar hiponatremia.",
        "Convulsões CLÍNICAS: tratar imediatamente (levetiracetam, lacosamida ou fenitoína). Profilaxia anticonvulsivante de rotina NÃO é recomendada (AHA/ASA 2022).",
        "Glicemia 140–180; normotermia (≤ 37,5); cabeceira 30°; evitar hipotensão e hipóxia.",
        "Profilaxia de TEV: meia elástica/compressão; heparina SC apenas após 24–48 h de estabilidade imagiológica.",
      ],
      interactions: [
        { id: "hic_pic_status", label: "Sinais de hipertensão intracraniana", kind: "choice", options: [
          { id: "presentes", label: "Presentes", value: "presentes" },
          { id: "ausentes", label: "Ausentes", value: "ausentes" },
          { id: "incerto", label: "Incerto / em avaliação", value: "incerto" },
        ] },
        { id: "hic_osmoterapia_status", label: "Osmoterapia", kind: "choice", options: [
          { id: "administrada", label: "Administrada", value: "administrada" },
          { id: "nao_indicada", label: "Não indicada", value: "nao_indicada" },
          { id: "pendente", label: "Indicada — pendente", value: "pendente" },
        ] },
        { id: "hic_convulsao_status", label: "Convulsão clínica", kind: "choice", options: [
          { id: "ausente", label: "Ausente", value: "ausente" },
          { id: "tratada", label: "Presente — tratada", value: "tratada" },
          { id: "presente_pendente", label: "Presente — tratamento pendente", value: "presente_pendente" },
        ] },
      ],
      next: "hic_cirurgia",`, 'PIC HIC operacional');

// Neurocirurgia HIC: registra acionamento e estado da indicação.
once(`      actions: [
        "INDICADA: HIC cerebelar com deterioração neurológica, compressão de tronco, hidrocefalia obstrutiva OU volume ≥ 15 mL — evacuação imediata, com DVE se necessário; hematoma lobar superficial com deterioração neurológica; DVE para hidrocefalia aguda por sangue intraventricular.",
        "SEM benefício: hematoma profundo (tálamo/putâmen) sem deterioração — STICH I e II negativos.",
        "Acionar neurocirurgia para avaliação à beira leito; repetir TC se deterioração.",
        "Reavaliar continuamente o nível de consciência e o efeito de massa.",
      ],
      next: "hic_destino",`, `      actions: [
        "INDICADA: HIC cerebelar com deterioração neurológica, compressão de tronco, hidrocefalia obstrutiva OU volume ≥ 15 mL — evacuação imediata, com DVE se necessário; hematoma lobar superficial com deterioração neurológica; DVE para hidrocefalia aguda por sangue intraventricular.",
        "SEM benefício: hematoma profundo (tálamo/putâmen) sem deterioração — STICH I e II negativos.",
        "Acionar neurocirurgia para avaliação à beira leito; repetir TC se deterioração.",
        "Reavaliar continuamente o nível de consciência e o efeito de massa.",
      ],
      interactions: [
        { id: "hic_neurocirurgia_acionada", label: "Neurocirurgia acionada", kind: "confirm" },
        { id: "hic_indicacao_cirurgica", label: "Indicação neurocirúrgica", kind: "choice", options: [
          { id: "presente", label: "Presente", value: "presente" },
          { id: "ausente", label: "Ausente neste momento", value: "ausente" },
          { id: "em_avaliacao", label: "Em avaliação", value: "em_avaliacao" },
        ] },
      ],
      next: "hic_destino",`, 'neurocirurgia HIC operacional');

// HSA: captura gravidade e investigação do aneurisma.
once(`      actions: [
        "Diagnóstico: TC sem contraste (sensibilidade ~98% nas primeiras 6 h). TC negativa com alta suspeita → punção lombar (xantocromia). AngioTC/arteriografia para localizar o aneurisma.",
        "Hunt-Hess (gravidade clínica): I assintomático/cefaleia leve (~1%) · II cefaleia intensa + rigidez nucal, sem déficit (~5%) · III sonolência/confusão/déficit leve (~15%) · IV estupor/hemiplegia/descerebração (~40%) · V coma (~70–80%).",
        "Fisher modificada (risco de vasoespasmo): 1 sem sangue (~24%) · 2 HSA fina (~33%) · 3 HSA espessa (~33%) · 4 HSA com sangue intraventricular (~40%).",
        "Estabilizar: ABC, cabeceira 30°, 2 acessos, controle da PA, analgesia. Manter EUVOLEMIA (hipovolemia predispõe vasoespasmo).",
      ],
      next: "hsa_manejo",`, `      actions: [
        "Diagnóstico: TC sem contraste (sensibilidade ~98% nas primeiras 6 h). TC negativa com alta suspeita → punção lombar (xantocromia). AngioTC/arteriografia para localizar o aneurisma.",
        "Hunt-Hess (gravidade clínica): I assintomático/cefaleia leve (~1%) · II cefaleia intensa + rigidez nucal, sem déficit (~5%) · III sonolência/confusão/déficit leve (~15%) · IV estupor/hemiplegia/descerebração (~40%) · V coma (~70–80%).",
        "Fisher modificada (risco de vasoespasmo): 1 sem sangue (~24%) · 2 HSA fina (~33%) · 3 HSA espessa (~33%) · 4 HSA com sangue intraventricular (~40%).",
        "Estabilizar: ABC, cabeceira 30°, 2 acessos, controle da PA, analgesia. Manter EUVOLEMIA (hipovolemia predispõe vasoespasmo).",
      ],
      interactions: [
        { id: "hsa_hunt_hess", label: "Hunt-Hess", kind: "choice", options: [
          { id: "i", label: "I", value: "1" },
          { id: "ii", label: "II", value: "2" },
          { id: "iii", label: "III", value: "3" },
          { id: "iv", label: "IV", value: "4" },
          { id: "v", label: "V", value: "5" },
        ] },
        { id: "hsa_fisher", label: "Fisher modificada", kind: "choice", options: [
          { id: "1", label: "1", value: "1" },
          { id: "2", label: "2", value: "2" },
          { id: "3", label: "3", value: "3" },
          { id: "4", label: "4", value: "4" },
        ] },
        { id: "hsa_aneurisma_status", label: "Localização do aneurisma", kind: "choice", options: [
          { id: "localizado", label: "Localizado", value: "localizado" },
          { id: "imagem_pendente", label: "Imagem vascular pendente", value: "imagem_pendente" },
          { id: "nao_visualizado", label: "Não visualizado ainda", value: "nao_visualizado" },
        ] },
      ],
      next: "hsa_manejo",`, 'HSA inicial operacional');

// HSA manejo: registra nimodipino e tratamento do aneurisma.
once(`      actions: [
        "NIMODIPINO 60 mg VO a cada 4 h por 21 dias (nível I, AHA/ASA 2023) — reduz o déficit isquêmico tardio por vasoespasmo. Vigiar hipotensão.",
        "Tratamento do aneurisma: clipagem cirúrgica × coiling endovascular — decisão multidisciplinar (neurocirurgia + neurorradiologia). Ocluir completamente, preferencialmente em até 24 h, para evitar ressangramento.",
        "Cuidados gerais: euvolemia, evitar hipóxia/hipotermia/hipotensão. Estatina de rotina NÃO recomendada na HSA.",
        "Vigiar vasoespasmo (déficit isquêmico tardio), hidrocefalia (DVE se necessário) e hiponatremia.",
      ],
      next: "hsa_destino",`, `      actions: [
        "NIMODIPINO 60 mg VO a cada 4 h por 21 dias (nível I, AHA/ASA 2023) — reduz o déficit isquêmico tardio por vasoespasmo. Vigiar hipotensão.",
        "Tratamento do aneurisma: clipagem cirúrgica × coiling endovascular — decisão multidisciplinar (neurocirurgia + neurorradiologia). Ocluir completamente, preferencialmente em até 24 h, para evitar ressangramento.",
        "Cuidados gerais: euvolemia, evitar hipóxia/hipotermia/hipotensão. Estatina de rotina NÃO recomendada na HSA.",
        "Vigiar vasoespasmo (déficit isquêmico tardio), hidrocefalia (DVE se necessário) e hiponatremia.",
      ],
      interactions: [
        { id: "hsa_nimodipino_status", label: "Nimodipino", kind: "choice", options: [
          { id: "iniciado", label: "Iniciado", value: "iniciado" },
          { id: "contraindicado", label: "Não administrado por contraindicação/hipotensão", value: "contraindicado" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
        { id: "hsa_aneurisma_tratamento", label: "Tratamento do aneurisma", kind: "choice", options: [
          { id: "coiling", label: "Coiling definido / realizado", value: "coiling" },
          { id: "clipagem", label: "Clipagem definida / realizada", value: "clipagem" },
          { id: "programado", label: "Programado / aguardando procedimento", value: "programado" },
          { id: "avaliacao", label: "Em avaliação multidisciplinar", value: "avaliacao" },
        ] },
      ],
      next: "hsa_destino",`, 'HSA manejo operacional');

fs.writeFileSync(file, src);
console.log('AVC wave 2: ações de imagem, reperfusão, HIC e HSA convertidas em interações rastreáveis.');
