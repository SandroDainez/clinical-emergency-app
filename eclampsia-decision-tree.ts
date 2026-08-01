import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

/**
 * Fluxo interativo de Pré-eclâmpsia e Eclâmpsia no adulto (gestante/puérpera).
 * Baseado em: ACOG Practice Bulletin 222 (2020, reafirmado 2023) · ISSHP 2018 ·
 * FIGO 2019 · Magpie Trial · ASPRE Trial · FEBRASGO 2021 · UpToDate 2024.
 *
 * Ordem: reconhecimento → CONVULSÃO ativa? (eclâmpsia → estabilizar) → classificar
 * (HAS gestacional / PE / PE grave / HELLP) → sulfato de magnésio (critérios de
 * gravidade) → crise hipertensiva (anti-HAS) → momento/via do parto → pós-parto.
 *
 * Valores por TOQUE com opção de valor próprio. NÃO substitui o julgamento clínico
 * nem o protocolo institucional; manejo exige equipe multidisciplinar.
 *
 * Fonte declarada: Diretriz Clínica para Pré-eclâmpsia — Projeto Todas as
 * Mães Importam / Guia Obstétrico, Escritório de Excelência do Einstein com o
 * Programa MSD para Mães, versão 02, aprovada em 20/11/2025. Base: Korkes et
 * al. 2025, ISSHP 2022, ACOG, Magpie Trial e as recomendações do Ministério da
 * Saúde (2024) para suplementação de cálcio.
 *
 * É diretriz brasileira e escrita para a realidade brasileira: traz o que fazer
 * sem bomba de infusão, sem monitor e fora do hospital — que é onde boa parte
 * das mortes maternas por pré-eclâmpsia acontece no país.
 */

/**
 * ESQUEMAS DE SULFATAÇÃO — fonte única.
 *
 * Estas linhas estavam copiadas em dois nós (eclâmpsia e PE grave), e as cópias
 * já tinham divergido: uma trazia o preparo da solução ("8 mL MgSO₄ 50% + 12 mL
 * SF"), a outra só o resultado ("20 mL a 20%"). Mesma dose, detalhe diferente —
 * e é justamente o preparo que falta a quem está à beira do leito com a ampola
 * na mão. Duas cópias de uma dose sempre acabam divergindo; a segunda a ser
 * corrigida é a que fica errada.
 *
 * Aqui ficam só os esquemas comuns a QUALQUER indicação de sulfatação. O que é
 * específico (repique de 2 g na convulsão, refratariedade) fica no nó que trata
 * daquela situação.
 */
const ESQUEMAS_MGSO4 = [
  "Pritchard (mais usado no Brasil) — ataque: 4 g IV lento (8 mL MgSO₄ 50% + 12 mL SF = 20 mL a 20%, em 15–20 min) + 10 g IM (5 g em cada glúteo). Manutenção: 5 g IM a cada 4 h.",
  "Zuspan (IV contínuo) — ataque: 4 g IV em 15–20 min → manutenção 1 g/h IV em bomba (250 mL a 50 mL/h); alguns protocolos aceitam até 2 g/h.",
  "SEM bomba de infusão — Zuspan adaptado: MgSO₄ 50% 10 mL + 10 mL de água destilada, em microbólus de 4 mL a cada hora, lentamente (≈ 1 g/h).",
  "Pritchard independe de bomba. Se 5 g em cada glúteo for volume demais: 2,5 g em 4 grupos musculares distintos no ataque, e 2,5 g em 2 grupos a cada 4 h na manutenção.",
  "Manter por 24 h após o parto OU após a última convulsão (o que ocorrer por último). Nível terapêutico 4–7 mEq/L.",
];

export const eclampsiaDecisionTree: DecisionTreeDefinition = {
  id: "pre_eclampsia_eclampsia_2024",
  version: "2024.1",
  label: "Pré-eclâmpsia / Eclâmpsia",
  entryNodeId: "entry",
  nodes: {
    // ── 1. Reconhecimento ──────────────────────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Distúrbio hipertensivo na gestação — reconhecimento",
      summary: "PE com critérios de gravidade e eclâmpsia são emergências obstétricas. Acionar equipe multidisciplinar.",
      actions: [
        "Gestante/puérpera (até 6 semanas) com PA ≥ 140/90 mmHg após 20 semanas — suspeitar de pré-eclâmpsia (PE).",
        "Monitorização: PA seriada (ambos os braços, Korotkoff V), SpO₂, FC, ECG; CTG fetal contínuo; 2 acessos venosos.",
        "Acionar OBSTETRÍCIA e ANESTESIOLOGIA imediatamente. Decúbito lateral esquerdo.",
        "Exames: HMG com plaquetas, TGO/TGP, bilirrubinas, LDH, creatinina/ureia, ácido úrico, coagulograma, esfregaço, proteinúria; tipagem e reserva.",
        "FORA DO HOSPITAL (UBS, USF, UPA, ambulância): o bundle começa ALI. Dois acessos calibrosos, dose de ataque do MgSO₄ e anti-hipertensivo se PA ≥ 160/110 — antes e durante o transporte, não depois dele.",
        "Sem chegada ao hospital antes da próxima dose: manutenção por Pritchard (10 g IM no ataque, depois 5 g IM a cada 4 h) ou Zuspan adaptado em microbólus. A sulfatação não pode ser interrompida pelo transporte.",
        "Solicitar vaga em maternidade de alto risco pela regulação, com transporte avançado, relatório das condutas já realizadas e as condições clínicas e obstétricas descritas.",
        "Deflagra o bundle: gestante ≥ 20 semanas ou puérpera com PA ≥ 140/90 + um sintoma (cefaleia, escotomas, epigastralgia, dor no hipocôndrio direito, oligúria, dor torácica, edema pulmonar) OU deterioração laboratorial; ou PA ≥ 160/110 em duas aferições em 10 min; ou convulsão/rebaixamento; ou HELLP.",
      ],
      next: "convulsao",
    },

    // ── 2. Convulsão ativa? (estabilização primeiro) ───────────────────────────
    convulsao: {
      id: "convulsao",
      type: "decision",
      title: "Há convulsão (eclâmpsia)?",
      question: "A paciente está convulsionando ou teve convulsão (eclâmpsia)?",
      evidence: [
        "Eclâmpsia = convulsão tônico-clônica generalizada em gestante com PE, sem outra causa neurológica.",
        "Pode ocorrer sem PA muito elevada (20% com PA < 160/110). Anteparto 50%, intraparto 25%, pós-parto 25% (até 48 h).",
        "O parto é o tratamento definitivo, mas NÃO deve ocorrer durante a convulsão ativa — estabilizar primeiro.",
      ],
      options: [
        { id: "sim", label: "Sim — eclâmpsia (convulsão)", next: "ecl_protecao" },
        { id: "nao", label: "Não — sem convulsão", next: "classificacao" },
      ],
    },

    // ── RAMO ECLÂMPSIA ─────────────────────────────────────────────────────────
    ecl_protecao: {
      id: "ecl_protecao",
      type: "action",
      title: "Eclâmpsia — proteção e via aérea",
      summary: "Proteger a paciente durante a convulsão; não tentar conter nem colocar objetos na boca.",
      actions: [
        "Decúbito lateral esquerdo (previne aspiração + reduz compressão da veia cava). Proteger a cabeça de traumatismo.",
        "NÃO introduzir objetos na boca. Aspirar secreções se necessário.",
        "O₂ máscara 8–10 L/min durante e após a convulsão; alvo SpO₂ ≥ 95%.",
        "IOT se convulsão > 5 min, apneia pós-ictal prolongada, GCS ≤ 8 persistente ou hipóxia refratária. Via aérea da gestante é DIFÍCIL (edema de mucosas, Mallampati alto) — ter videolaringoscópio pronto.",
        "Monitorização: PA, SpO₂, ECG, CTG fetal contínuo. 2 acessos calibrosos; coletar exames.",
      ],
      next: "ecl_magnesio",
    },

    ecl_magnesio: {
      id: "ecl_magnesio",
      type: "action",
      title: "Sulfato de magnésio — IMEDIATAMENTE",
      summary: "Anticonvulsivante de 1ª linha (Magpie). Superior a diazepam e fenitoína.",
      actions: [
        "⚠️ INICIAR o ataque mesmo SEM monitorização instalada e em qualquer ambiente assistencial — a dose de ataque, quando correta, NÃO provoca intoxicação. Esperar monitor é o erro que mata.",
        ...ESQUEMAS_MGSO4,
        "SE JÁ em MgSO₄ e nova convulsão: dose adicional de 2 g IV em 3–5 min.",
        "Convulsão REFRATÁRIA (persiste após 2ª dose de MgSO₄): diazepam 10 mg IV (ou midazolam) → fenitoína 15–20 mg/kg IV (máx 50 mg/min, monitor cardíaco) → propofol + IOT + avaliação neurológica urgente.",
      ],
      next: "mg_seguranca",
    },

    // ── Segurança do magnésio (compartilhado) ──────────────────────────────────
    mg_seguranca: {
      id: "mg_seguranca",
      type: "action",
      title: "Tríade de segurança do MgSO₄ + antídoto",
      summary: "Checar ANTES de cada dose de manutenção. Gluconato de cálcio à beira leito SEMPRE.",
      actions: [
        "Tríade ANTES de cada dose: reflexo patelar PRESENTE (ausência = nível tóxico > 7 mEq/L); FR ≥ 16 rpm; diurese ≥ 25 mL/h (Mg é excretado pelos rins).",
        "Concentração TERAPÊUTICA: 4–7 mEq/L. O reflexo patelar desaparece entre 8 e 10 mEq/L; a partir de 12 mEq/L há risco de PARADA RESPIRATÓRIA.",
        // SUSPENDER e ANTIDOTAR não são o mesmo gatilho, e tratá-los como um só
        // leva a antidotar cedo demais ou tarde demais. Os limiares da tríade
        // (FR ≥ 16, diurese ≥ 25 mL/h) mandam PARAR a infusão e investigar; o
        // cálcio é para toxicidade instalada.
        "QUANDO SUSPENDER: qualquer parâmetro da tríade alterado — reflexo patelar ausente, FR < 16 rpm ou diurese < 25 mL/h. Suspender, dosar magnesemia e função renal, reavaliar.",
        "QUANDO DAR O ANTÍDOTO: toxicidade instalada — reflexo patelar ABOLIDO, depressão respiratória (bradipneia, respiração superficial, queda de SpO₂), ou parada respiratória. Sonolência, fala arrastada, náuseas e rubor com calor são sinais de alerta que precedem esse quadro.",
        "ANTÍDOTO: gluconato de cálcio 1 g IV (10 mL a 10%) em 3–5 min; repetir a cada 15 min se necessário. Em PCR: RCP + gluconato de cálcio + obstetrícia de urgência.",
        "Dar o antídoto NÃO encerra o caso: o magnésio continua no organismo e o cálcio tem ação curta. Manter a paciente monitorizada, com via aérea à mão, e reavaliar a indicação de retomar a sulfatação com a obstetrícia.",
        "Manter à beira do leito, SEMPRE: 1 ampola de gluconato de cálcio 10% (10 mL), 10 mL de água destilada, seringa de 20 mL e agulha. Kit conferido e lacrado em todo setor que atende gestante.",
        "Cronograma de monitorização: PA, FR e reflexo patelar a cada 20 min na 1ª hora após o início da sulfatação; depois de hora em hora por 24 h. Diurese a cada 2 h por 24 h.",
        "Vitalidade fetal por cardiotocografia ou ultrassom em até 30 min APÓS o início da dose de ataque — evitar durante a infusão do ataque.",
        "Reduzir/suspender a dose se oligúria (Mg acumula na insuficiência renal).",
      ],
      next: "crise_has_check",
    },

    // ── 3. Classificação (sem convulsão) ───────────────────────────────────────
    classificacao: {
      id: "classificacao",
      type: "decision",
      title: "Classificação do distúrbio hipertensivo",
      question: "Qual o quadro? (define a necessidade de MgSO₄ e a urgência)",
      evidence: [
        "HAS gestacional: PA ≥ 140/90 após 20 sem SEM proteinúria nem critério de gravidade.",
        "Pré-eclâmpsia (PE): PA ≥ 140/90 após 20 sem + proteinúria ≥ 300 mg/24h (ou P/Cr ≥ 0,3) OU dano a órgão-alvo (proteinúria não é obrigatória — ACOG 2020).",
        "PE COM critérios de gravidade: PAS ≥ 160 ou PAD ≥ 110; plaquetas ≤ 50.000, CIVD ou hemólise; TGO/TGP ≥ 2× o corte do laboratório ou em ascensão; epigastralgia ou dor no hipocôndrio direito; creatinina ≥ 1,0 mg/dL em ascensão; oligúria; edema pulmonar; cefaleia nova sem outra causa; alterações visuais; convulsão, rebaixamento, cegueira ou AVC.",
        "Lesão de órgão-alvo (define a PE, sem exigir gravidade): plaquetas ≤ 150.000, TGO ≥ 40, creatinina ≥ 1,0, oligúria, comprometimento placentário (DPP, restrição de crescimento, Doppler alterado, óbito fetal).",
        "⚠️ O VALOR da proteinúria NÃO é critério de deterioração clínica — proteinúria alta não classifica gravidade, e proteinúria baixa não a afasta.",
        "Comprometimento placentário grave: descolamento prematuro de placenta, diástole zero ou reversa na artéria umbilical, óbito fetal.",
        "SINECLÂMPSIA: rebaixamento do nível de consciência ou coma na pré-eclâmpsia, sem convulsão observada — conduzir COMO eclâmpsia.",
        "HELLP exige os TRÊS simultaneamente — hemólise (DHL ≥ 600 UI/L, ou haptoglobina < 25 mg/dL, ou Hb < 8, ou bilirrubina indireta ≥ 1,2, ou esquizócitos/equinócitos), TGO ou TGP ≥ 70 UI/L (ou 2× o LSN), e plaquetas < 100.000 (atenção a valores maiores com queda > 20%).",
        "⚠️ Uma alteração isolada, ou apenas duas das três, NÃO é HELLP: classificar como pré-eclâmpsia com sinais de agravamento. A distinção importa — HELLP tem morbimortalidade materna e perinatal maior.",
        "Pode ocorrer sem HAS ou proteinúria em 10–20% dos casos.",
      ],
      options: [
        { id: "has_gest", label: "HAS gestacional / PE sem gravidade", next: "pe_leve" },
        { id: "pe_grave", label: "PE COM critérios de gravidade", next: "pe_grave_mgso4" },
        { id: "hellp", label: "Síndrome HELLP", next: "hellp_manejo" },
      ],
    },

    pe_leve: {
      id: "pe_leve",
      type: "action",
      title: "HAS gestacional / PE sem gravidade",
      summary: "Vigilância rigorosa — pode evoluir para gravidade a qualquer momento.",
      actions: [
        "NÃO indicar MgSO₄ na ausência de critérios de gravidade. Anti-HAS apenas se PA ≥ 160/110 (emergência).",
        "Vigilância materna: PA seriada, sintomas de gravidade (cefaleia, distúrbio visual, dor epigástrica), labs seriados (plaquetas, enzimas, Cr, ácido úrico).",
        "Vigilância fetal: CTG, USG com Doppler (RCIU, oligoâmnio, diástole zero/reversa = grave).",
        "Reavaliar continuamente — surgimento de QUALQUER critério de gravidade reclassifica para PE grave (MgSO₄ + anti-HAS).",
        "Prevenção para a gestação em curso e as próximas — CÁLCIO elementar 1.000 mg/dia a partir da 12ª semana até o parto (recomendação universal do Ministério da Saúde 2024 no Brasil, por baixa ingesta populacional; reduz a incidência em até 55%).",
        "AAS 100 mg/dia, à noite, iniciado ATÉ 16 semanas, para quem tem rastreio positivo — pelo menos 1 fator de risco ALTO (hipertensão crônica, diabetes tipo 1 ou 2, doença renal crônica, doença autoimune, pré-eclâmpsia em gestação anterior, gestação múltipla, reprodução assistida) OU pelo menos 2 fatores MODERADOS.",
        "CÁLCIO para TODAS: 1 g/dia de cálcio elementar a partir da 12ª semana até o parto — suplementação universal recomendada pelo Ministério da Saúde por baixa ingesta da população brasileira. Reduz a incidência de pré-eclâmpsia em até 55%.",
        "⚠️ Deixar de rastrear e de prescrever a profilaxia em gestante de alto risco pode configurar negligência de cuidado — a diretriz brasileira registra isso explicitamente.",
        "Fatores de risco MODERADO: idade ≥ 35 anos, nuliparidade, raça/cor preta ou parda, condição socioeconômica desfavorável, história familiar de pré-eclâmpsia (mãe ou irmã), obesidade (IMC > 30), intervalo > 10 anos desde a última gestação, desfecho adverso em gestação prévia (DPP, restrição de crescimento, prematuridade, óbito fetal).",
      ],
      next: "parto_timing",
    },

    pe_grave_mgso4: {
      id: "pe_grave_mgso4",
      type: "action",
      // Nó COMPARTILHADO por PE grave e HELLP — daí o título não citar só a PE
      // grave. A HELLP mandava sulfatar e seguia direto para a crise
      // hipertensiva, sem nunca mostrar dose nem antídoto: o médico lia "iniciar
      // MgSO₄ — Pritchard ou Zuspan" e o app jamais dizia quanto era.
      title: "Sulfato de magnésio — profilaxia da eclâmpsia (PE grave / HELLP)",
      summary: "Iniciar MgSO₄ em TODA PE com critérios de gravidade e em TODA HELLP — não aguardar a convulsão.",
      actions: [
        ...ESQUEMAS_MGSO4,
        "Magpie Trial: MgSO₄ reduziu eclâmpsia em 58% e mortalidade materna em 45% na PE grave.",
      ],
      next: "mg_seguranca",
    },

    hellp_manejo: {
      id: "hellp_manejo",
      type: "action",
      title: "Síndrome HELLP — manejo",
      summary: "Variante grave da PE. Iniciar MgSO₄, corrigir coagulopatia e planejar o parto.",
      actions: [
        "Iniciar MgSO₄ (profilaxia de eclâmpsia) — os esquemas e a tríade de segurança vêm nos próximos passos.",
        "Controle da PA se ≥ 160/110 (ver crise hipertensiva). Transfusão de plaquetas: alvo ≥ 50.000 (parto vaginal) / ≥ 80–100.000 (cesárea).",
        "Coagulopatia/CID: PFC se TP/TTPa > 1,5×; crioprecipitado se fibrinogênio < 150 mg/dL.",
        "Dor intensa em HDD/epigástrio + queda de Hb + choque → suspeitar de hematoma subcapsular hepático (USG/TC) — risco de ruptura, mortalidade > 50%.",
        "Parto: HELLP completo (Classe I) → parto em todas as idades gestacionais (≥ 34 sem imediato; < 34 sem estabilizar + corticoide 48 h se sem complicações graves). Dexametasona 12 mg IV/12h × 2 (maturação fetal < 34 sem).",
      ],
      // Segue para a sulfatação, não direto para a crise hipertensiva: a HELLP
      // tem indicação de MgSO₄ como qualquer PE grave, e pular esse nó era
      // prescrever sulfato sem dose e sem antídoto.
      next: "pe_grave_mgso4",
    },

    // ── 4. Crise hipertensiva ──────────────────────────────────────────────────
    crise_has_check: {
      id: "crise_has_check",
      type: "decision",
      title: "Crise hipertensiva",
      question: "A PA está ≥ 160/110 mmHg (emergência hipertensiva)?",
      evidence: [
        "PA ≥ 160/110 persistente (confirmada em 15 min) = emergência hipertensiva na gestação — tratar o mais rápido possível, idealmente em ≤ 30 min e no máximo em 60 min (ACOG).",
        "HAS grave não tratada associa-se a AVC hemorrágico materno — principal causa de morte na eclâmpsia.",
        "Meta: PAS 140–150 e PAD 90–100 mmHg. NÃO reduzir a PA abruptamente (risco de sofrimento fetal).",
      ],
      options: [
        { id: "sim", label: "Sim — PA ≥ 160/110", next: "anti_has" },
        { id: "nao", label: "Não — PA < 160/110", next: "parto_timing" },
      ],
    },

    anti_has: {
      id: "anti_has",
      type: "action",
      title: "Anti-hipertensivo de emergência",
      summary: "Meta PAS 140–150 / PAD 90–100 — e NUNCA reduzir mais de 20% da PA inicial.",
      actions: [
        "HIDRALAZINA (1ª linha no Brasil): 5 mg IV em 1–2 min; repetir 5–10 mg a cada 20 min (máx 20–30 mg). Pré-hidratar SF 250–500 mL se oligúrica.",
        "LABETALOL (1ª linha EUA/Europa): 20 mg IV → 40 → 80 mg a cada 10–20 min (máx 300 mg). Contraindicado em asma, bradiarritmia, ICC descompensada. (Sem IV no Brasil; VO 100–400 mg 8/8h.)",
        "NIFEDIPINA oral (liberação imediata): 10 mg VO, repetir a cada 20–30 min (máx 30 mg). NÃO usar via sublingual (hipotensão abrupta).",
        "Refratário (UTI): nitroprussiato 0,3–0,5 mcg/kg/min IV (evitar > 4 h — toxicidade por cianeto fetal; proteger da luz).",
        "⚠️ NÃO reduzir a PA em mais de 20% da medida inicial — queda abrupta compromete a perfusão placentária.",
        "EVITAR: IECA/BRA (fetotóxicos), atenolol, diuréticos de rotina (exceto edema pulmonar → furosemida).",
      ],
      next: "parto_timing",
    },

    // ── 5. Momento e via do parto ──────────────────────────────────────────────
    parto_timing: {
      id: "parto_timing",
      type: "decision",
      title: "Momento do parto",
      question: "Qual a situação para definir o timing do parto?",
      summary: "O parto é o ÚNICO tratamento definitivo da PE. PE por si só NÃO é indicação de cesárea.",
      evidence: [
        "PE SEM gravidade ≥ 37 sem: parto indicado (HYPITAT). 34–36+6 sem: manejo expectante pode ser considerado em centro experiente (LATE trial).",
        "PE COM gravidade ≥ 34 sem: parto após estabilização materna (1–4 h para controle de PA + MgSO₄). NÃO prolongar além de 34 sem.",
        "PE COM gravidade < 34 sem: manejo expectante APENAS em centro terciário (UTI materna/neonatal) após 48 h de corticoide, na ausência de sofrimento fetal, eclâmpsia, HELLP, edema pulmonar, abrupto, PA incontrolável ou sintomas cerebrais persistentes.",
        "Eclâmpsia: parto após estabilização (mín 30 min pós-convulsão). NÃO cesárea durante convulsão ativa. Via vaginal preferível se condições obstétricas favoráveis.",
      ],
      options: [
        { id: "parto_indicado", label: "Indicação de parto (estabilizar e resolver)", next: "parto_acao" },
        { id: "expectante", label: "Manejo expectante (< 34 sem, centro terciário)", next: "expectante_acao" },
        { id: "fetal_agudo", label: "Sofrimento fetal agudo / instabilidade materna", next: "parto_emergencia" },
      ],
    },

    parto_acao: {
      id: "parto_acao",
      type: "action",
      title: "Parto após estabilização materna",
      summary: "Estabilizar PA e MgSO₄ antes; a via é por indicação obstétrica.",
      actions: [
        "Estabilizar primeiro: PA controlada (< 160/110), MgSO₄ em curso, CTG avaliado.",
        "Resolução ANTES DE 32 SEMANAS: se possível, aguardar pelo menos 4 h do início da dose de ataque do MgSO₄ antes do nascimento, para neuroproteção fetal — sem gerar atraso que aumente o risco materno.",
        "Via de parto por indicação OBSTÉTRICA — PE não é indicação de cesárea; preferir vaginal se condições favoráveis (indução se Bishop ≥ 6).",
        "Corticoide para maturação fetal se < 34 sem e parto previsto em ≤ 7 dias: betametasona 12 mg IM/24h × 2 (ou dexametasona 6 mg IM/12h × 4) — NÃO retardar parto de emergência para completar.",
        "Manter MgSO₄ durante o trabalho de parto e por 24 h após.",
      ],
      next: "pos_parto",
    },

    expectante_acao: {
      id: "expectante_acao",
      type: "action",
      title: "Manejo expectante — < 34 semanas (centro terciário)",
      summary: "Apenas com UTI materna/neonatal e ausência de gatilhos de parto imediato.",
      actions: [
        "Corticoide para maturação fetal: betametasona 12 mg IM/24h × 2 doses.",
        "Vigilância materna intensiva (PA, sintomas, labs seriados) e fetal (CTG, Doppler) em centro terciário.",
        "INTERROMPER o expectante e indicar parto se: sofrimento fetal, eclâmpsia, HELLP, edema pulmonar, descolamento de placenta, PA incontrolável ou sintomas cerebrais persistentes.",
        "Manter anti-HAS e MgSO₄ conforme indicação; reavaliar diariamente.",
      ],
      next: "pos_parto",
    },

    parto_emergencia: {
      id: "parto_emergencia",
      type: "action",
      title: "Parto de emergência",
      summary: "Sofrimento fetal grave ou instabilidade materna refratária.",
      actions: [
        "Bradicardia fetal > 10 min ou sofrimento fetal agudo → cesárea de emergência (após mín 30 min pós-convulsão na eclâmpsia, se possível).",
        "Bradicardia transitória pós-convulsão (3–5 min): aguardar recuperação antes de indicar cesárea.",
        "Anestesia: regional preferida se estável e plaquetas ≥ 70–80.000; anestesia geral se rebaixamento, eclâmpsia refratária, edema pulmonar grave ou contraindicação à regional (via aérea difícil — preparar).",
        "Corrigir coagulopatia (plaquetas, PFC) antes/durante conforme HELLP/CID.",
      ],
      next: "pos_parto",
    },

    // ── 6. Pós-parto ────────────────────────────────────────────────────────────
    pos_parto: {
      id: "pos_parto",
      type: "transition",
      title: "Pós-parto e UTI — manejo e alta",
      summary: "MgSO₄ por 24 h; vigiar complicações; controlar PA; planejar alta e prevenção futura.",
      disposition: "icu",
      exitCriteria: [
        "Manter MgSO₄ por 24 h após o parto ou após a última convulsão. Eclâmpsia pós-parto pode ocorrer até 48 h; se > 48 h → investigar trombose de seio venoso cerebral.",
        "Anti-HAS pós-parto se PA ≥ 150/100: nifedipina LP 30–60 mg/dia, metildopa, labetalol ou enalapril 5–20 mg/dia (seguro na amamentação). AINE com cautela (eleva PA, piora função renal).",
        "Vigiar complicações graves: edema pulmonar (furosemida + VNI), LRA, hematoma hepático, CID, AVC hemorrágico (TC + controle de PA), PRES, descolamento de placenta.",
        "Metas: PA 140–150/90–100 com tratamento; diurese ≥ 25 mL/h; fluidos IV máx 80–125 mL/h (evitar sobrecarga). Alta com PA < 150/100 em 2 aferições; retorno em 1 semana; orientar sinais de alarme.",
        "Prevenção futura — CÁLCIO É UNIVERSAL NO BRASIL: 1 g/dia de cálcio elementar (2 comprimidos de carbonato de cálcio 1.250 mg) a partir da 12ª semana até o parto, para TODA gestante, porque a população brasileira tem baixa ingesta (Ministério da Saúde, 2024). Não é condicionado a comprovar baixa ingestão.",
        "AAS 100 mg/dia, preferencialmente À NOITE, iniciado ATÉ 16 semanas, nas gestantes de alto risco: reduz 62% da pré-eclâmpsia antes de 37 semanas e 80% antes de 34 semanas.",
        "Risco cardiovascular materno aumentado a longo prazo — a pré-eclâmpsia é marcador, e o acompanhamento não termina no puerpério.",
      ],
      targets: [],
    },
  },
};
