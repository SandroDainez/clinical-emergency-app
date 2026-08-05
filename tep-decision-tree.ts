import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";
import {
  INTRO_GUIADA,
  OPCAO_GUIADA,
  camposDeInstabilidade,
  roteamentoDeInstabilidade,
} from "./lib/instabilidade-guiada";

/**
 * Fluxo interativo de Tromboembolia Pulmonar (TEP) no adulto.
 * Baseado em: ESC 2019 (TEP) · AHA Scientific Statement 2011 (updated) · ACCP/CHEST
 * 2022 (VTE) · ASH 2020 · UpToDate 2024.
 *
 * Ordem: reconhecimento → ESTABILIDADE (instável → alto risco/trombólise direto) →
 * probabilidade pré-teste (Wells) → D-dímero/AngioTC → estratificação de risco
 * (disfunção VD + biomarcadores + sPESI) → anticoagulação/reperfusão → destino.
 *
 * Valores por TOQUE com opção de valor próprio. Doses de HNF, enoxaparina e
 * trombolítico acelerado calculadas pelo peso.
 * NÃO substitui o julgamento clínico nem o protocolo institucional.
 */

function toNumber(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round0(n: number): string {
  return Math.round(n).toString();
}

function deriveTep(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  const peso = toNumber(values.peso);
  if (peso && peso > 0) {
    out.hnfBolus = round0(Math.min(80 * peso, 10000)); // 80 U/kg, máx 10.000
    out.hnfInf = round0(18 * peso); // 18 U/kg/h
    out.enoxa = round0(1 * peso); // 1 mg/kg SC 12/12h
    // NÃO existe mais dose acelerada calculada aqui.
    //
    // O capítulo clínico de TEP v1.3 é explícito: "A diretriz de ressuscitação AHA
    // 2025 não estabelece uma dose única de alteplase para esse cenário. Portanto,
    // não apresente 0,6 mg/kg, máximo 50 mg, nem 50 mg em bolus como dose padrão
    // de PCR."
    //
    // O app calculava exatamente 0,6 mg/kg com teto de 50 — entregava pronto o
    // número que a fonte manda não apresentar. Valor calculado tem força de
    // recomendação: quem lê não distingue "o app calculou" de "está validado".
  } else {
    out.hnfBolus = "80 U/kg (máx 10.000)";
    out.hnfInf = "18 U/kg/h";
    out.enoxa = "1 mg/kg";
  }
  return out;
}

export const tepDecisionTree: DecisionTreeDefinition = {
  id: "tep_2024",
  version: "2024.1",
  label: "Tromboembolia Pulmonar",
  entryNodeId: "entry",
  derive: deriveTep,
  nodes: {
    // ── 1. Reconhecimento ──────────────────────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Suspeita de TEP — reconhecimento",
      summary: "3ª causa de doença cardiovascular aguda. Mortalidade 1–3% (baixo risco) a 15–65% (maciço com choque).",
      actions: [
        "Apresentação: dispneia súbita (73–80%), dor pleurítica, taquicardia, taquipneia, síncope (alto risco), hipotensão/choque (maciço), sinais de TVP.",
        "Monitor, oximetria, PA, FC, 2 acessos venosos; O₂ se SpO₂ < 90% (alvo ≥ 94% com suporte no risco intermediário/alto).",
        "ECG (taquicardia sinusal, S1Q3T3, BRD novo, inversão de T V1–V4), gasometria, troponina, BNP, D-dímero (conforme probabilidade).",
        "Fatores de risco: cirurgia/trauma/imobilização recente, câncer ativo, TVP/TEP prévios, estrogênio, gestação/puerpério, trombofilia.",
      ],
      next: "dados",
    },

    dados: {
      id: "dados",
      type: "input",
      title: "Dados iniciais",
      intro: "Toque nos valores (ou adicione). PAS define a estabilidade; o peso calcula as doses.",
      fields: [
        {
          id: "pas",
          label: "PA sistólica",
          unit: "mmHg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["70", "85", "90", "100", "120", "140"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "fc",
          label: "Frequência cardíaca",
          unit: "bpm",
          allowCustom: true,
          customKeyboard: "numeric",
          optional: true,
          presets: ["70", "90", "110", "130", "150"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "peso",
          label: "Peso estimado (kg)",
          unit: "kg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["50", "60", "70", "80", "90", "100"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "pesoOrigem",
          label: "Este peso é",
          optional: true,
          presets: [
            { value: "estimado", label: "Estimado" },
            { value: "real", label: "Real (pesado)" },
          ],
        },
      ],
      next: "estabilidade",
    },

    // ── 2. Estabilidade — decisão-chave ────────────────────────────────────────
    estabilidade: {
      id: "estabilidade",
      type: "decision",
      title: "Estabilidade hemodinâmica",
      question: "Há instabilidade hemodinâmica (choque ou hipotensão)?",
      summary: "PAS informada: {pas} mmHg · FC {fc}.",
      evidence: [
        "ALTO RISCO (maciço) = PAS < 90 mmHg ou queda ≥ 40 mmHg por > 15 min, ou necessidade de vasopressor — mortalidade > 15%.",
        "Se instável: iniciar anticoagulação com HNF e considerar trombólise IMEDIATAMENTE — não aguardar AngioTC se a instabilidade impedir.",
        "Se estável: seguir o algoritmo diagnóstico (probabilidade pré-teste → D-dímero/AngioTC).",
      ],
      options: [
        { id: "guiado", label: OPCAO_GUIADA, next: "tep_instab_dados" },
        { id: "instavel", label: "Instável — choque/hipotensão (alto risco)", next: "ar_suporte" },
        { id: "estavel", label: "Estável", next: "prob" },
      ],
    },

    // ── Caminho guiado ────────────────────────────────────────────────────────
    //
    // No TEP esta decisão vale mais do que em qualquer outro módulo: ela separa
    // quem vai direto para trombólise de quem segue o algoritmo diagnóstico. E
    // "instabilidade" aqui costuma ser lida como hipotensão franca, quando o TEP
    // de alto risco pode se apresentar com pressão ainda mantida às custas de
    // vasoconstrição — e com má perfusão já instalada.
    tep_instab_dados: {
      id: "tep_instab_dados",
      type: "input",
      title: "Vamos verificar juntos",
      intro: INTRO_GUIADA,
      fields: camposDeInstabilidade(),
      next: roteamentoDeInstabilidade({
        instavel: "ar_suporte",
        limitrofe: "tep_limitrofe",
        estavel: "prob",
      }),
    },

    tep_limitrofe: {
      id: "tep_limitrofe",
      type: "action",
      title: "Achado isolado — ainda NÃO é alto risco",
      summary:
        "Não fecha critério de instabilidade, mas também não afasta TEP grave. Siga a investigação SEM soltar a vigilância.",
      actions: [
        "O achado isolado não classifica como alto risco — a definição exige PAS < 90 mmHg, queda ≥ 40 mmHg por mais de 15 min, ou necessidade de vasopressor.",
        "SEGUIR o algoritmo diagnóstico: probabilidade pré-teste, D-dímero conforme a probabilidade, AngioTC.",
        "PROCURAR o risco intermediário-alto, que é o que descompensa: disfunção de VD na AngioTC ou no ecocardiograma, com troponina ou BNP elevados. Esse paciente fica em ambiente monitorizado, com trombólise de resgate pactuada.",
        "Ecocardiograma à beira do leito é o exame que mais muda a conduta aqui: VD dilatado, septo retificado e veia cava sem colapso apontam sobrecarga aguda mesmo com pressão normal.",
        "REAVALIAR de perto. A deterioração no TEP é abrupta: se aparecer hipotensão, alteração do estado mental ou necessidade de vasopressor, passa a ser alto risco e a trombólise entra em discussão imediata.",
      ],
      next: "prob",
    },

    // ── RAMO ALTO RISCO (maciço) ───────────────────────────────────────────────
    ar_suporte: {
      id: "ar_suporte",
      type: "action",
      title: "TEP alto risco — suporte + anticoagulação imediata",
      summary: "Emergência com risco de morte. Suporte hemodinâmico cauteloso + HNF JÁ.",
      actions: [
        "Suporte: O₂ (IOT se insuficiência respiratória grave); fluidos CAUTELOSOS — SF 0,9% 500 mL (máx 500–1.000 mL): sobrecarga piora a função do VD.",
        "Vasopressor: norepinefrina 0,1–1 mcg/kg/min para PAM ≥ 65. Dobutamina 2–10 mcg/kg/min se baixo débito com PA mantida. Evitar hipóxia/hipercapnia.",
        "HNF IV imediata: bolus {hnfBolus} U (80 U/kg, máx 10.000) + {hnfInf} U/h (18 U/kg/h); alvo TTPa 60–100 s. Iniciar ANTES da AngioTC se risco de morte iminente.",
        "HNF é o anticoagulante de escolha no alto risco (permite interrupção rápida se for trombolisar).",
        "AHA/ACC 2026: preferir cateter nasal de ALTO FLUXO ao cateter comum na hipoxemia moderada-grave; EVITAR sedação profunda e ventilação mecânica sempre que possível (risco de colapso hemodinâmico).",
        "AHA/ACC 2026: VA-ECMO é razoável no choque cardiogênico refratário por TEP.",
        "Anticoagulação de manutenção: DOAC preferido a antagonista da vitamina K (AHA/ACC 2026); HBPM preferida à HNF na maioria das categorias C–E, exceto quando se planeja trombólise ou há instabilidade que exija reversão rápida."
      ],
      next: "ar_diagnostico",
    },

    ar_diagnostico: {
      id: "ar_diagnostico",
      type: "action",
      title: "Confirmação diagnóstica rápida",
      summary: "Confirmar sem atrasar a reperfusão.",
      actions: [
        "AngioTC se a hemodinâmica permitir (< 5–10 min de estabilização).",
        "AngioTC impossível: ecocardiograma à beira leito — dilatação/disfunção de VD + sinal de McConnell + TVP ao ultrassom = suficiente para indicar trombólise em extremis.",
        "Não retardar a reperfusão por exames se o colapso for iminente.",
      ],
      next: "ar_trombolise_check",
    },

    ar_trombolise_check: {
      id: "ar_trombolise_check",
      type: "decision",
      title: "Trombólise sistêmica — contraindicações",
      question: "Há contraindicação ABSOLUTA à trombólise?",
      evidence: [
        "Trombólise sistêmica é PRIMEIRA LINHA no TEP de alto risco se não houver contraindicação absoluta.",
        "Absolutas: AVC hemorrágico (qualquer tempo) ou isquêmico < 3 meses; neoplasia intracraniana; TCE grave/cirurgia intracraniana/espinhal recente; sangramento ativo; suspeita de dissecção de aorta; punção em sítio não compressível < 7 dias.",
        "Em PCR ou colapso iminente, contraindicações RELATIVAS tornam-se aceitáveis (benefício supera risco).",
      ],
      options: [
        { id: "sem", label: "Sem contraindicação absoluta", next: "ar_trombolise" },
        { id: "com", label: "Há contraindicação absoluta", next: "ar_alternativas" },
      ],
    },

    ar_trombolise: {
      id: "ar_trombolise",
      type: "action",
      title: "Trombólise sistêmica — dose",
      summary: "Suspender a HNF durante a infusão de alteplase; reiniciar SEM bólus quando o TTPa estiver abaixo de 2× o limite superior da normalidade.",
      actions: [
        "Alteplase (rt-PA) 100 mg IV em 2 h: 10 mg em bólus (1–2 min) → 90 mg em infusão por 2 h.",
        "⚠️ Peso abaixo de 65 kg: a dose TOTAL não deve exceder 1,5 mg/kg.",
        "Reconstituir apenas conforme a bula da apresentação disponível. NÃO misturar nem administrar outro medicamento — inclusive heparina — no mesmo frasco, solução ou acesso venoso da alteplase.",
        // ── PCR por TEP ────────────────────────────────────────────────────
        //
        // A versão anterior dizia apenas que a AHA não estabelece dose e que era
        // preciso ter protocolo institucional. Verdadeiro, e inútil à beira do
        // leito: quem está com a seringa na mão às 3 h da manhã, num serviço sem
        // protocolo escrito, ficava sem número nenhum. "Não há dose estabelecida"
        // não é conduta — e o vazio empurra para a improvisação, que é pior do
        // que um esquema descrito com a fonte declarada.
        //
        // O esquema abaixo NÃO é recomendação da AHA. É o mais usado e o mais
        // descrito na literatura de PCR por TEP, e vem rotulado como tal.
        "PCR atribuída ao TEP: a AHA 2025 NÃO estabelece dose única de alteplase nesse cenário — a recomendação é fibrinolisar, sem fixar esquema.",
        "NA PRÁTICA, quando NÃO há protocolo institucional: alteplase 50 mg IV em BÓLUS durante a RCP é o esquema mais usado e mais descrito. Pode-se repetir 50 mg 15–20 min depois se a parada persistir. É o que orienta o ERC e o que aparece nas séries publicadas — não é dose chancelada pela AHA. Registre a decisão e a fonte no prontuário.",
        "Se houver ROSC sem ter completado 100 mg, o restante pode ser infundido em 1 h, conforme a resposta e o risco hemorrágico.",
        "Por que o bólus de 50 mg e não os 100 mg em 2 h: em parada não existe circulação para sustentar uma infusão de 2 h, e a diretriz de TEP de 2026 (AHA/ACC/CHEST) registra que doses de 25–50 mg têm eficácia comparável para recuperar o VD com menos sangramento grave, inclusive intracraniano, do que 100 mg.",
        "MANTER RCP por 60–90 MIN após a fibrinólise antes de considerar encerrar — o trombolítico precisa de tempo e de compressões para chegar ao trombo. Encerrar aos 20 min desperdiça a droga que acabou de ser dada. (ERC; não há evidência de alta qualidade sobre a duração ideal.)",
        "Alternativa citada em diretriz de TEP (não de PCR): regime acelerado 0,6 mg/kg em 15 min, máximo 50 mg.",
        "Havendo protocolo institucional validado, ele prevalece sobre o que está acima.",
        "Alternativas: estreptoquinase 250.000 UI em 30 min → 100.000 UI/h × 12–24 h; uroquinase 4.400 UI/kg em 10 min → 4.400 UI/kg/h × 12–24 h.",
        "SUSPENDER a HNF durante a infusão; reiniciar sem bólus quando o TTPa estiver ABAIXO DE 2× o limite superior da normalidade do laboratório, ajustando pelo nomograma institucional. Não administrar heparina pelo mesmo acesso da alteplase.",
        "Monitorização pós-trombólise: hemodinâmica, estado neurológico, oxigenação e sítios de punção continuamente; melhora esperada em 30–60 min; repetir ECO em 2–4 h.",
        "Sangramento grave: INTERROMPER imediatamente alteplase e heparina, suspender intervenções invasivas evitáveis e acionar o protocolo de hemorragia grave do serviço.",
        "Complicação hemorrágica grave: suspender, plasma fresco congelado + ácido tranexâmico 1 g IV.",
      ],
      next: "destino_uti",
    },

    ar_alternativas: {
      id: "ar_alternativas",
      type: "action",
      title: "Alternativas à trombólise — alto risco",
      summary: "Contraindicação à trombólise ou falha — reperfusão mecânica.",
      actions: [
        "Embolectomia cirúrgica: contraindicação absoluta à trombólise ou falha; cirurgia cardíaca com CEC (melhor sem PCR prolongado). Acionar cirurgia cardiovascular precocemente.",
        "Trombólise cateter-dirigida (CDT): alteplase 1–2 mg/h intra-arterial pulmonar via cateter — menor dose, menor sangramento; centro de hemodinâmica.",
        "Trombectomia mecânica percutânea (AngioJet, FlowTriever, Aspirex): em centros com experiência.",
        "ECMO venoarterial (VA-ECMO): TEP maciço com PCR/colapso refratário — ponte para cirurgia/trombólise.",
        "Manter HNF e suporte hemodinâmico durante a abordagem.",
      ],
      next: "destino_uti",
    },

    // ── 3. Probabilidade pré-teste (estável) ───────────────────────────────────
    prob: {
      id: "prob",
      type: "decision",
      title: "Probabilidade pré-teste — Wells",
      question: "Qual a probabilidade pré-teste pelo escore de Wells?",
      evidence: [
        "Escore de Wells (pontos): sinais clínicos de TVP = 3; diagnóstico alternativo menos provável que TEP = 3; FC ≥ 100 = 1,5; imobilização ≥ 3 dias OU cirurgia nas últimas 4 semanas = 1,5; TVP/TEP prévios = 1,5; hemoptise = 1; câncer ativo = 1. Máximo 12,5.",
        "Wells dicotômico: ≤ 4 = TEP IMPROVÁVEL (baixa/intermediária) → D-dímero. > 4 = TEP PROVÁVEL (alta) → AngioTC direto (NÃO pedir D-dímero).",
        "Wells em três faixas: < 2 baixa · 2–6 moderada · > 6 alta probabilidade.",
        "Wells SIMPLIFICADO: todos os itens valem 1 ponto, e ≥ 2 já indica TEP provável.",
        "Alternativa — Genebra simplificado: TVP/TEP prévios 1; FC 74–94 = 1 e FC ≥ 94 = 2; cirurgia ou fratura no último mês 1; hemoptise 1; câncer ativo 1; dor unilateral em membro inferior 1; dor à palpação venosa profunda ou edema unilateral 1; idade > 65 anos 1. Corte: ≤ 2 TEP improvável, > 2 TEP provável.",
        "PERC — quem tem BAIXA probabilidade e cumpre os OITO critérios tem TEP descartado SEM exame adicional: idade < 50 anos · FC < 100 bpm · SpO₂ ≥ 95% · sem hemoptise · sem uso de estrogênio · sem TEP/TVP prévios · sem empastamento de panturrilha · sem trauma ou cirurgia com internação nas últimas 4 semanas. Basta UM critério falhar para o PERC não se aplicar.",
      ],
      options: [
        { id: "improvavel", label: "Wells ≤ 4 — TEP improvável", next: "ddimero" },
        { id: "provavel", label: "Wells > 4 — TEP provável", next: "angiotc" },
      ],
    },

    ddimero: {
      id: "ddimero",
      type: "decision",
      title: "D-dímero",
      question: "O D-dímero é positivo (acima do corte)?",
      evidence: [
        "Corte padrão < 500 ng/mL (ou < 0,5 mg/L FEU) exclui TEP em probabilidade baixa/intermediária (sensibilidade 95–99%).",
        "Ajuste por idade (> 50 anos, ADJUST-PE): corte = idade × 10 ng/mL (ex.: 70 anos → 700).",
        "AHA/ACC 2026: escore YEARS recomendado para decidir a necessidade de imagem — inclusive na GESTANTE; D-dímero ajustado por idade nos de probabilidade baixa/intermediária.",
        "D-dímero eleva-se em infecção, neoplasia, gestação, cirurgia recente, idosos — baixa especificidade.",
      ],
      options: [
        { id: "negativo", label: "Negativo — abaixo do corte", next: "excluido" },
        { id: "positivo", label: "Positivo — acima do corte", next: "angiotc" },
      ],
    },

    angiotc: {
      id: "angiotc",
      type: "decision",
      title: "AngioTC de tórax",
      question: "A AngioTC confirmou o TEP?",
      evidence: [
        "AngioTC é o padrão-ouro (sensibilidade 83–90%, especificidade 94–96%); visualiza até ramos subsegmentares.",
        "Contraindicação relativa: TFG < 30 (nefropatia por contraste), alergia grave ao iodo, gestação — alternativa: cintilografia V/Q.",
        "TEP subsegmentar isolado: anticoagular na maioria (ESC 2019/ACCP 2022); vigilância sem anticoagular só se baixo risco + CUS negativo + seguimento garantido.",
      ],
      options: [
        { id: "confirmado", label: "Sim — TEP confirmado", next: "estratificacao" },
        { id: "negativo", label: "Não — TEP excluído", next: "excluido" },
      ],
    },

    excluido: {
      id: "excluido",
      type: "transition",
      title: "TEP excluído",
      summary: "D-dímero negativo em baixa probabilidade ou AngioTC negativa excluem TEP com segurança.",
      disposition: "discharge",
      exitCriteria: [
        "TEP excluído pelo algoritmo (D-dímero negativo em probabilidade baixa/intermediária ou AngioTC negativa).",
        "Investigar e tratar diagnósticos alternativos (SCA, pneumonia, pneumotórax, dissecção, causa musculoesquelética).",
        "Reavaliar se surgir instabilidade ou novos achados; considerar CUS de MMII se suspeita de TVP persistir.",
      ],
      targets: [],
    },

    // ── 4. Estratificação de risco (TEP confirmado, estável) ───────────────────
    estratificacao: {
      id: "estratificacao",
      type: "decision",
      title: "Estratificação de risco (ESC 2019 · categorias AHA/ACC 2026)",
      question: "Qual a categoria de risco (disfunção de VD + biomarcadores + sPESI)?",
      evidence: [
        "Disfunção de VD: dilatação/hipocinesia ao ECO ou relação VD/VE > 0,9 na AngioTC. Biomarcadores: troponina e/ou BNP elevados.",
        "sPESI (1 ponto cada): idade > 80, câncer, doença cardiopulmonar crônica, FC ≥ 110, PAS < 100, SpO₂ < 90%. sPESI = 0 → baixo risco (mortalidade 30 dias ~1%); ≥ 1 → risco elevado (~10,9%).",
        "Intermediário-ALTO: disfunção de VD E biomarcadores elevados (ambos). Intermediário-BAIXO: VD ou biomarcador (apenas um) ou nenhum, com sPESI ≥ 1. BAIXO: sPESI = 0, sem disfunção de VD, troponina normal.",
        "AHA/ACC 2026 — nova classificação A–E: A subclínico (assintomático) · B baixa gravidade · C gravidade elevada (biomarcador e/ou disfunção de VD → internar) · D falência incipiente (instabilidade TRANSITÓRIA) · E falência cardiopulmonar (hipotensão/choque persistente). Equivalência: A–B ≈ baixo risco, C ≈ intermediário, D–E ≈ alto risco.",
        "AHA/ACC 2026: acionar o time de resposta a TEP (PERT) nos casos C–E — melhora a agilidade do cuidado."
      ],
      options: [
        { id: "int_alto", label: "Intermediário-alto (VD + biomarcadores)", next: "anticoag_intensivo" },
        { id: "int_baixo", label: "Intermediário-baixo", next: "anticoag" },
        { id: "baixo", label: "Baixo risco (sPESI = 0)", next: "ambulatorial_check" },
      ],
    },

    anticoag_intensivo: {
      id: "anticoag_intensivo",
      type: "action",
      title: "Intermediário-alto — anticoagulação plena + vigilância",
      summary: "Anticoagulação plena + monitorização intensiva; trombólise de resgate se deteriorar.",
      actions: [
        "Anticoagulação plena imediata: HNF IV (bolus {hnfBolus} U + {hnfInf} U/h, alvo TTPa 60–100 s) — preferir HNF pela possibilidade de trombólise de resgate; OU enoxaparina {enoxa} mg SC 12/12h.",
        "Monitorização intensiva (UTI): PA, FC, SpO₂ contínuos; repetir troponina/BNP e ECO.",
        "TROMBÓLISE DE RESGATE imediata se houver deterioração hemodinâmica (passar para o ramo de alto risco).",
        "⚠️ NÃO trombolisar de rotina o paciente NORMOTENSO apenas por disfunção de VD e troponina elevada: no PEITHO a tenecteplase reduziu a descompensação hemodinâmica, mas AUMENTOU hemorragia grave e AVC hemorrágico. A trombólise aqui é de resgate, não profilática.",
        "Considerar CDT (cateter-dirigida) em centros com experiência se risco de deterioração.",
      ],
      next: "destino_uti",
    },

    ambulatorial_check: {
      id: "ambulatorial_check",
      type: "decision",
      title: "Baixo risco — tratamento ambulatorial?",
      question: "O paciente preenche TODOS os critérios para alta precoce/ambulatorial?",
      evidence: [
        "Critérios (HOME-PE/Hestia): sPESI = 0, sem disfunção de VD ao ECO, troponina normal.",
        "Hemodinâmica estável (PAS ≥ 100, FC < 110, SpO₂ ≥ 90% em ar ambiente); sem dor intensa/síncope; sem sangramento ou contraindicação à anticoagulação.",
        "Sem TVP iliofemoral extensa/phlegmasia; suporte social adequado, adesão e acesso à emergência; seguimento em 5–7 dias.",
        "Regra de Hestia: qualquer critério presente (O₂, PA < 100, analgesia IV, câncer em tratamento, sangramento, TFG < 30, gestação, dor torácica grave) = internação.",
      ],
      options: [
        { id: "sim", label: "Sim — elegível a ambulatorial", next: "anticoag_ambulatorial" },
        { id: "nao", label: "Não — internar", next: "anticoag" },
      ],
    },

    // ── 5. Anticoagulação ──────────────────────────────────────────────────────
    anticoag: {
      id: "anticoag",
      type: "action",
      title: "Anticoagulação — escolha do agente",
      summary: "Iniciar IMEDIATAMENTE. NOACs são preferidos (ESC 2019 — Classe I).",
      actions: [
        "NOAC 1ª linha — Rivaroxabana 15 mg VO 12/12h × 21 dias → 20 mg/dia (com refeição); OU Apixabana 10 mg VO 12/12h × 7 dias → 5 mg 12/12h. Evitar se TFG < 15, gestação.",
        "Alternativas NOAC (requerem parenteral inicial 5–10 dias): Dabigatrana 150 mg 12/12h; Edoxabana 60 mg/dia (30 mg se ≤ 60 kg ou TFG 15–50).",
        "Esquema clássico: enoxaparina {enoxa} mg SC 12/12h + varfarina (alvo INR 2,0–3,0; sobrepor ≥ 5 dias e até INR ≥ 2 por 24 h).",
        "Situações especiais — gestante: HBPM (NOAC contraindicado); câncer ativo: HBPM ou NOAC (rivaroxabana/apixabana); TIH: argatrobana/fondaparinux (suspender toda heparina); IRA TFG < 30: HNF preferida.",
        "DURAÇÃO: provocado por fator transitório → 3 meses; não provocado/recorrente/trombofilia de alto risco → indefinido (reavaliar risco de sangramento); câncer ativo → enquanto ativo.",
        "FILTRO DE VEIA CAVA: não usar de rotina junto à anticoagulação. Considerar apenas em TEP/TVP agudo com contraindicação absoluta TEMPORÁRIA à anticoagulação — e já com plano de retirada assim que ela puder ser reiniciada.",
        "PESO E OBESIDADE: usar peso real para HBPM, sem teto empírico; considerar anti-Xa em casos selecionados. Em obesidade extrema (IMC > 40 kg/m² ou peso > 120 kg), apixabana e rivaroxabana podem ser consideradas conforme bula; os dados de dabigatrana e edoxabana são menos robustos nesse grupo. Não reduzir dose apenas pelo peso.",
      ],
      next: "destino_internacao",
    },

    anticoag_ambulatorial: {
      id: "anticoag_ambulatorial",
      type: "action",
      title: "Anticoagulação ambulatorial — baixo risco",
      summary: "NOAC oral é ideal para alta precoce (sem necessidade de parenteral).",
      actions: [
        "Rivaroxabana 15 mg VO 12/12h × 21 dias → 20 mg/dia OU Apixabana 10 mg VO 12/12h × 7 dias → 5 mg 12/12h — não exigem ponte parenteral.",
        "Orientar sinais de alarme (piora da dispneia, dor torácica, síncope, sangramento) e retorno imediato à emergência.",
        "Garantir seguimento ambulatorial em 5–7 dias e acesso à emergência.",
        "Duração mínima 3 meses; reavaliar conforme o fator (provocado × não provocado).",
      ],
      next: "destino_ambulatorial",
    },

    // ── 6. Destinos ─────────────────────────────────────────────────────────────
    destino_uti: {
      id: "destino_uti",
      type: "transition",
      title: "UTI — TEP de alto risco / intermediário-alto",
      summary: "Monitorização intensiva e vigilância de deterioração.",
      disposition: "icu",
      exitCriteria: [
        "UTI com monitorização contínua de PA, FC, SpO₂; ECO seriado (24–48 h pós-trombólise ou se deterioração).",
        "Metas: SpO₂ ≥ 94% com suporte; HNF com TTPa 60–100 s; repetir troponina/BNP em 6–12 h.",
        "Trombólise de resgate imediata se deterioração no intermediário-alto; transição para anticoagulação oral após estabilização.",
        "Investigar HPTEC (hipertensão pulmonar tromboembólica crônica) no seguimento se dispneia persistir > 3 meses (cintilografia V/Q).",
      ],
      targets: [],
    },

    destino_internacao: {
      id: "destino_internacao",
      type: "transition",
      title: "Internação — risco intermediário-baixo",
      summary: "Anticoagulação plena com vigilância clínica.",
      disposition: "observation",
      exitCriteria: [
        "Internação com anticoagulação plena e vigilância clínica (PA, FC, SpO₂, sinais de deterioração).",
        "Reclassificar para UTI/trombólise de resgate se houver instabilidade.",
        "Planejar duração da anticoagulação (3 meses se provocado; indefinido se não provocado/alto risco).",
        "Pesquisar trombofilia se TEP não provocado < 50 anos, recorrente ou de localização inusual (coletar antes da anticoagulação ou ≥ 4 sem após).",
      ],
      targets: [],
    },

    destino_ambulatorial: {
      id: "destino_ambulatorial",
      type: "transition",
      title: "Alta precoce / tratamento ambulatorial",
      summary: "Baixo risco selecionado — reduz custos sem aumentar mortalidade (HOME-PE).",
      disposition: "discharge",
      exitCriteria: [
        "Alta com NOAC oral, orientações de sinais de alarme e retorno imediato.",
        "Seguimento ambulatorial garantido em 5–7 dias; acesso à emergência.",
        "Duração mínima de 3 meses; reavaliar fator provocador × não provocado.",
        "Reforçar adesão; investigar causa de base (câncer oculto conforme idade/risco).",
      ],
      targets: [],
    },
  },
};
