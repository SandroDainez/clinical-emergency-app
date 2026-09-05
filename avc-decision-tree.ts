import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

/**
 * Fluxo interativo do AVC agudo no adulto — isquêmico, hemorrágico intracerebral (HIC)
 * e hemorragia subaracnóidea (HSA).
 * Baseado em: AHA/ASA 2019 (AVC isquêmico) · AHA/ASA 2022 (HIC) · AHA/ASA 2023 (HSA) ·
 * ESO 2021/2022 · ECASS III · DAWN/DEFUSE-3 · INTERACT2/ATACH-2 · SBN/AVCBrasil 2023.
 *
 * Valores por TOQUE (seletores rápidos) com opção de valor próprio. A dose do
 * trombolítico é calculada pelo peso. Escalas (NIHSS, Hunt-Hess, Fisher) trazem o
 * significado de cada faixa.
 *
 * NÃO substitui o julgamento clínico. Conduta final é do profissional assistente.
 */

function toNumber(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round1(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace(".", ",");
}

import { avisoDePeso } from "./lib/peso-estimado";
import {
  IMAGEM_ATE_QUANDO,
  IMAGEM_DWI_FLAIR,
  IMAGEM_PERFUSAO,
  IMAGEM_QUEM_VAI_PARA_TROMBECTOMIA_SAI,
  IMAGEM_SEM_NENHUM_DOS_EXAMES,
} from "./lib/trombolise-guiada-por-imagem";
import { TENECTEPLASE_APRESENTACAO, TENECTEPLASE_REGIME_AVC } from "./lib/tenecteplase";
import { TENECTEPLASE_AVC_WEIGHT_BASED } from "./lib/drug-knowledge/tenecteplase";
import {
  CI_AVC_LISTA,
  CI_AVC_PRESSAO_E_ALVO,
  CI_COMUM_HEMORRAGIA_INTRACRANIANA,
  CI_COMUM_SANGRAMENTO_ATIVO,
  CI_O_QUE_FAZER_COM_A_DUVIDA,
} from "./lib/contraindicacao-trombolise";
import {
  AVC_IMAGEM_SUMMARY,
  LVO_ANGIOTC_O_QUE_RESPONDE,
  LVO_COMO_SABER,
  LVO_ESCALAS_FORA_DE_ESCOPO,
  LVO_NAO_ESPERE_A_IMAGEM,
  LVO_NIHSS_SEM_LIMIAR,
} from "./lib/oclusao-grande-vaso";

function deriveAvc(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  // Reforço na LINHA DA DOSE: este módulo tem dose com TETO absoluto
  // (alteplase 90 mg · tenecteplase 25 mg), e a faixa do shell sozinha não
  // põe a ressalva junto do miligrama.
  out.avisoPeso = avisoDePeso(values.pesoOrigem);
  const peso = toNumber(values.peso);
  if (peso && peso > 0) {
    const alteplase = Math.min(0.9 * peso, 90);
    const bolus = alteplase * 0.1;
    out.alteplaseDose = round1(alteplase);
    out.alteplaseBolus = round1(bolus);
    out.alteplaseInfusao = round1(alteplase - bolus);
    out.tnkDose = round1(
      Math.min(
        TENECTEPLASE_AVC_WEIGHT_BASED.doseMgPerKg * peso,
        TENECTEPLASE_AVC_WEIGHT_BASED.maxDoseMg
      )
    );
  } else {
    out.alteplaseDose = "0,9 mg/kg (máx 90)";
    out.alteplaseBolus = "10% da dose";
    out.alteplaseInfusao = "90% da dose";
    out.tnkDose = "0,25 mg/kg (máx 25)";
  }
  return out;
}

export const avcDecisionTree: DecisionTreeDefinition = {
  id: "avc_agudo_2024",
  version: "2024.1",
  label: "AVC Agudo",
  entryNodeId: "entry",
  derive: deriveAvc,
  nodes: {
    // ── Reconhecimento e medidas iniciais ────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Reconhecimento — suspeita de AVC (FAST)",
      summary: "Déficit neurológico focal súbito. Tempo é cérebro — ~1,9 milhão de neurônios/min. Agir em paralelo.",
      actions: [
        "FAST: registrar achados observáveis e o estado do último momento visto bem (LKW).",
        "Acionar o CÓDIGO AVC e a equipe de neurologia/imagem imediatamente.",
        "ABC: registrar SpO₂, necessidade de O₂, monitorização, ECG e acessos venosos.",
        "Glicemia capilar AGORA — registrar o valor e se hipoglicemia precisou de tratamento.",
        "Registrar coleta dos exames iniciais e NIHSS basal.",
      ],
      interactions: [
        { id: "fast_face", label: "FAST · Face", kind: "choice", options: [
          { id: "normal", label: "Normal", value: "normal" },
          { id: "assimetria", label: "Assimetria facial", value: "assimetria" },
        ] },
        { id: "fast_arms", label: "FAST · Arms", kind: "choice", options: [
          { id: "normal", label: "Sem queda", value: "normal" },
          { id: "direita", label: "Queda à direita", value: "queda_direita" },
          { id: "esquerda", label: "Queda à esquerda", value: "queda_esquerda" },
          { id: "bilateral", label: "Queda bilateral", value: "queda_bilateral" },
        ] },
        { id: "fast_speech", label: "FAST · Speech", kind: "choice", options: [
          { id: "normal", label: "Normal", value: "normal" },
          { id: "disartria", label: "Disartria", value: "disartria" },
          { id: "afasia", label: "Afasia", value: "afasia" },
          { id: "nao_avaliavel", label: "Não avaliável", value: "nao_avaliavel" },
        ] },
        { id: "lkw_status", label: "Último momento visto bem (LKW)", kind: "choice", options: [
          { id: "conhecido", label: "Horário/janela conhecido", value: "conhecido" },
          { id: "desconhecido", label: "Desconhecido / ao acordar", value: "desconhecido" },
        ] },
        { id: "codigo_avc_acionado", label: "Código AVC acionado", kind: "confirm" },
        { id: "neurologia_acionada", label: "Neurologia acionada", kind: "confirm" },
        { id: "imagem_acionada", label: "Equipe de imagem acionada", kind: "confirm" },
        { id: "spo2", label: "SpO₂", kind: "number", min: 50, max: 100, step: 1, unit: "%" },
        { id: "oxigenio_status", label: "Oxigênio suplementar", kind: "choice", options: [
          { id: "nao_indicado", label: "Não indicado", value: "nao_indicado" },
          { id: "iniciado", label: "Iniciado", value: "iniciado" },
        ] },
        { id: "monitor_instalado", label: "Monitorização instalada", kind: "confirm" },
        { id: "ecg_status", label: "ECG 12 derivações", kind: "choice", options: [
          { id: "feito", label: "Realizado", value: "feito" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
        { id: "acessos_venosos", label: "Acessos venosos", kind: "choice", options: [
          { id: "zero", label: "0", value: "0" },
          { id: "um", label: "1", value: "1" },
          { id: "dois", label: "2", value: "2" },
        ] },
        { id: "glicemia", label: "Glicemia capilar", kind: "number", min: 20, max: 1200, step: 1, unit: "mg/dL" },
        { id: "hipoglicemia_tratada", label: "Hipoglicemia tratada?", kind: "choice", options: [
          { id: "nao_aplicavel", label: "Não aplicável (glicemia ≥ 60)", value: "nao_aplicavel" },
          { id: "sim", label: "Sim — tratamento realizado", value: "sim" },
          { id: "pendente", label: "Ainda pendente", value: "pendente" },
        ] },
        { id: "labs_iniciais", label: "HMG, INR/TTPa, eletrólitos, função renal e troponina", kind: "choice", options: [
          { id: "coletados", label: "Coletados", value: "coletados" },
          { id: "parcial", label: "Coleta parcial", value: "parcial" },
          { id: "pendente", label: "Pendente", value: "pendente" },
        ] },
        { id: "nihss", label: "NIHSS basal", kind: "number", min: 0, max: 42, step: 1 },
      ],
      next: "tempo",
    },

    tempo: {
      id: "tempo",
      type: "input",
      title: "Tempo desde o início (último momento visto bem)",
      intro: "Toque na janela de tempo. Define a elegibilidade para reperfusão.",
      fields: [
        {
          id: "janela",
          label: "Janela de tempo (LKW)",
          presets: [
            { value: "< 3 h", label: "< 3 h" },
            { value: "3–4,5 h", label: "3–4,5 h" },
            { value: "4,5–6 h", label: "4,5–6 h" },
            { value: "6–24 h", label: "6–24 h" },
            { value: "desconhecido / ao acordar", label: "Desconhecido / ao acordar" },
          ],
        },
      ],
      next: "tc",
    },

    tc: {
      id: "tc",
      type: "action",
      title: "TC de crânio SEM contraste — URGENTE",
      summary: "Meta porta-imagem ≤ 20–25 min. A TC define hemorrágico vs isquêmico.",
      actions: [
        "TC de crânio sem contraste imediatamente (exclui hemorragia). Não atrasar por outros exames.",
        "AngioTC + TC de perfusão se suspeita de oclusão de grande vaso (OGV) ou janela estendida (6–24 h).",
        "Aferir PA nos dois braços; ECG de 12 derivações.",
        "Aplicar a escala NIHSS para quantificar o déficit (interpretação no próximo passo).",
      ],
      next: "tc_resultado",
    },

    tc_resultado: {
      id: "tc_resultado",
      type: "decision",
      title: "Resultado da TC de crânio",
      question: "O que a TC mostrou?",
      // ⚠️ ESTE `summary` NASCEU DE UM ITEM DE `evidence` (2026-08-17).
      // `ListaDeCriterios` recolhe por CONTAGEM (`itens.length <= 2` fica
      // aberto): o nó tinha TRÊS itens e estava inteiro atrás do "Ver
      // critérios". Subir o item que MUDA CONDUTA trouxe junto, de graça,
      // os outros dois — que agora aparecem sem toque.
      summary:
        "⚠️ HEMORRAGIA INTRAPARENQUIMATOSA = HIC, E NÃO SE TROMBOLISA. É contraindicação absoluta, e a TC existe neste ponto exatamente para respondê-la.",
      evidence: [
        "Sem sangramento em quadro focal agudo = AVC isquêmico até prova em contrário.",
        "Sangue no espaço subaracnóideo (cisternas/sulcos) = HSA — pensar em aneurisma; cefaleia 'a pior da vida'.",
      ],
      options: [
        { id: "isquemico", label: "Sem hemorragia (isquêmico)", next: "isq_dados" },
        { id: "hic", label: "Hemorragia intracerebral (HIC)", next: "hic_inicial" },
        { id: "hsa", label: "Hemorragia subaracnóidea (HSA)", next: "hsa_inicial" },
      ],
    },

    // ═══════════════════════ RAMO ISQUÊMICO ══════════════════════════════════
    isq_dados: {
      id: "isq_dados",
      type: "input",
      title: "Dados para elegibilidade",
      intro: "Toque nos valores (ou adicione o seu). Usados para PA, glicemia e cálculo de dose.",
      fields: [
        {
          id: "pas",
          label: "PA sistólica",
          unit: "mmHg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["110", "130", "150", "170", "185", "200", "220"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "pad",
          label: "PA diastólica",
          unit: "mmHg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["70", "90", "100", "110", "120"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "glicemia",
          label: "Glicemia",
          unit: "mg/dL",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["50", "80", "110", "150", "200", "300", "400"].map((v) => ({ value: v, label: v })),
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
      next: "isq_nihss",
    },

    isq_nihss: {
      id: "isq_nihss",
      type: "input",
      title: "Gravidade — NIHSS (0 a 42)",
      intro:
        "O NIHSS é um exame de 15 itens, não uma estimativa. Se ainda não foi pontuado, abra a calculadora aqui mesmo — ela pergunta item por item e lança o total no campo. Se você já tem o número, arraste a barra.",
      fields: [
        {
          id: "nihss",
          label: "NIHSS total",
          allowCustom: true,
          customKeyboard: "numeric",
          customLabel: "Escore exato",
          // Calcula no próprio passo. Mandar abrir "Calculadoras clínicas" no
          // meio do AVC fazia quem não sabe o escore abandonar o fluxo.
          calculadora: "nihss",
          // Rótulo com o significado clínico, não só o número: o usuário do
          // plantão não tem por que saber de cor o que 15 quer dizer. O valor
          // gravado é o MEIO de cada faixa — quem tem o escore exato usa a
          // barra ou "Outro…", e o texto de apoio diz isso.
          // ⚠️ OS RÓTULOS SEGUEM NIHSS_FAIXAS (avc/nihss.ts), FAIXA POR FAIXA.
          //
          // Estes presets tinham "5–15 · moderado" — que FUNDE duas faixas da
          // fonte única (5–9 "leve a moderado" e 10–15 "moderado") e recria
          // exatamente o defeito que ela foi criada para matar: o comentário
          // de avc/nihss.ts registra que "um NIHSS 7 saía 'AVC leve a
          // moderado' numa tela e 'moderado' na outra". O bug voltou pelo
          // rótulo do preset, não pelo cálculo — e por isso passou.
          //
          // Fonte única não protege só o número: protege o RÓTULO que o
          // número recebe, porque é o rótulo que atravessa a passagem de
          // plantão.
          presets: [
            { value: "0", label: "0 · sem déficit mensurável" },
            { value: "3", label: "1–4 · AVC leve" },
            { value: "7", label: "5–9 · AVC leve a moderado" },
            { value: "12", label: "10–15 · AVC moderado" },
            { value: "18", label: "16–20 · AVC moderado a grave" },
            { value: "30", label: "21–42 · AVC grave" },
          ],
        },
      ],
      next: "isq_janela",
    },

    // Este passo PERGUNTAVA "o início foi há ≤ 4,5 horas?" logo abaixo de um
    // resumo que já dizia "Janela atual: 3–4,5 h". Perguntar o que a tela acabou
    // de informar é ruído — e, num fluxo de AVC, ruído custa minuto.
    //
    // As cinco opções de janela são todas inequívocas quanto ao limite de 4,5 h,
    // então a resposta é DERIVÁVEL. O passo virou conclusão: diz em que janela o
    // paciente está, o que isso significa, e segue sozinho.
    isq_janela: {
      id: "isq_janela",
      type: "action",
      title: "Janela: {janela}",
      summary: "NIHSS {nihss}. O app já sabe a janela pelo que você informou — não precisa responder de novo.",
      actions: [
        "Trombólise IV até 4,5 h do início em pacientes elegíveis (ECASS III).",
        "0–3 h: critérios padrão. 3–4,5 h: critérios adicionais (cautela se > 80 anos, NIHSS > 25, DM + AVC prévio, anticoagulante).",
        "AHA/ASA 2026 — janela ESTENDIDA: 4,5–9 h do último-visto-bem, ou AVC ao acordar (até 9 h do ponto médio do sono), quando há mismatch em neuroimagem avançada (DWI-FLAIR ou perfusão).",
        "AHA/ASA 2026: trombolisar déficit INCAPACITANTE na janela de 4,5 h independentemente do NIHSS. Déficit NÃO incapacitante (ex.: sintoma sensitivo isolado) não se beneficia — preferir dupla antiagregação.",
        "Início desconhecido / ao acordar: considerar protocolo guiado por imagem (RM DWI-FLAIR) em centro especializado.",
      ],
      next: {
        possiveis: ["isq_contraindicacoes", "isq_imagem_avancada", "isq_trombectomia_check"],
        escolher: (v) => {
          const janela = String(v.janela ?? "").trim();
          // Dentro de 4,5 h: contraindicações da trombólise IV, como sempre.
          if (janela === "< 3 h" || janela === "3–4,5 h") return "isq_contraindicacoes";

          // ⚠️ FORA DAS 4,5 h, QUEM DECIDE É A IMAGEM — e este caminho não
          // existia. A rota antiga mandava tudo para a trombectomia; o paciente
          // do WAKE-UP (2/3 SEM oclusão de grande vaso) saía do fluxo sem
          // receber nada, e o próprio app já dizia no texto que ele é elegível.
          //
          // "4,5–6 h" está INTEIRAMENTE dentro dos 9 h da janela estendida —
          // vai para a imagem sem ressalva. "6–24 h" é a faixa que CRUZA os
          // 9 h, e por isso o critério temporal está escrito no nó de imagem,
          // que é onde ele decide.
          if (janela === "4,5–6 h" || janela === "6–24 h" || janela === "desconhecido / ao acordar") {
            return "isq_imagem_avancada";
          }

          // Sem janela informada: mesma conduta do início indeterminado. Errar
          // para o lado de EXIGIR IMAGEM antes do trombolítico continua sendo o
          // erro aceitável — o que mudou é que agora há um caminho depois dela.
          return "isq_imagem_avancada";
        },
      },
    },

    // ⚠️ NÓ NOVO — a rota antiga mandava TODAS as janelas acima de 4,5 h direto
    // para a trombectomia, inclusive "ao acordar". O paciente do WAKE-UP (2/3
    // sem oclusão de grande vaso) sumia do fluxo sem receber nada.
    isq_imagem_avancada: {
      id: "isq_imagem_avancada",
      type: "decision",
      title: "Janela estendida — trombólise guiada por imagem",
      question: "Há mismatch em neuroimagem avançada?",
      // ⚠️ A precedência e o prazo NA SUPERFÍCIE VISÍVEL — constante INTEIRA,
      // não concatenada: texto composto escapa da varredura de tradução (D-35).
      summary: AVC_IMAGEM_SUMMARY,
      evidence: [
        IMAGEM_QUEM_VAI_PARA_TROMBECTOMIA_SAI,
        IMAGEM_DWI_FLAIR,
        IMAGEM_PERFUSAO,
        IMAGEM_ATE_QUANDO,
        IMAGEM_SEM_NENHUM_DOS_EXAMES,
      ],
      options: [
        { id: "mismatch", label: "Sim — há mismatch e não é candidato a trombectomia", next: "isq_contraindicacoes" },
        { id: "sem_mismatch", label: "Não há mismatch, ou não há o exame", next: "isq_trombectomia_check" },
      ],
    },

    isq_contraindicacoes: {
      id: "isq_contraindicacoes",
      type: "decision",
      title: "Contraindicações à trombólise IV",
      question: "Há alguma contraindicação ABSOLUTA à trombólise?",
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 8 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 8, tirar um não abre
      // nada — abaixaria para 7 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "⚠️ AS RELATIVAS NÃO PROÍBEM — MUDAM A CONTA, E QUEM DECIDE É O TAMANHO DO DÉFICIT. Quanto mais incapacitante o quadro, mais a balança pende para trombolisar; déficit leve e não incapacitante é o caso em que ela pende para não. As listas de absolutas e relativas estão nos critérios abaixo.",
      evidence: [
        "Hemorragia na TC ou hipodensidade extensa (> 1/3 do território de ACM; ASPECTS ≤ 5 = risco hemorrágico alto).",
        "AVC isquêmico ou TCE grave nos últimos 3 meses; cirurgia intracraniana/espinhal recente.",
        "História de hemorragia intracraniana; neoplasia/MAV/aneurisma intracraniano.",
        "Sangramento ativo; plaquetas < 100.000; INR > 1,7 / TTPa elevado; uso de DOAC nas últimas 48 h.",
        "PA > 185/110 mmHg não controlável; glicemia < 50 mg/dL não corrigida.",
        "── CONTRAINDICAÇÕES RELATIVAS — não proíbem, mudam a conta ──",
        "Déficit leve e NÃO incapacitante; melhora rápida e sustentada; crise convulsiva no início (se o déficit for atribuível ao pós-ictal); cirurgia de grande porte ou trauma grave < 14 dias; sangramento geniturinário ou digestivo < 21 dias; IAM < 3 meses; punção arterial em sítio não compressível < 7 dias; gestação; PA que responde ao anti-hipertensivo.",
        "⚠️ COM RELATIVA E SEM ABSOLUTA, a decisão é de risco-benefício e depende do TAMANHO DO DÉFICIT: quanto mais incapacitante, mais a balança pende para trombolisar. Déficit leve e não incapacitante é a única relativa que costuma decidir sozinha CONTRA — nele o benefício não se demonstrou, e a conduta é dupla antiagregação. Não adie a decisão para consultar: registre o raciocínio e siga.",
      ],
      options: [
        { id: "nao", label: "Sem contraindicação ABSOLUTA", next: "isq_pa_check" },
        { id: "sim", label: "Há contraindicação ABSOLUTA", next: "isq_trombectomia_check" },
        { id: "nao_sei", label: "Não sei dizer — abrir a lista", next: "ci_avc_lista" },
      ],
    },

    ci_avc_lista: {
      id: "ci_avc_lista",
      type: "action",
      title: "Contraindicações ao alteplase — confira item a item",
      actions: [
        CI_COMUM_HEMORRAGIA_INTRACRANIANA,
        CI_COMUM_SANGRAMENTO_ATIVO,
        CI_AVC_LISTA,
        CI_AVC_PRESSAO_E_ALVO,
        CI_O_QUE_FAZER_COM_A_DUVIDA,
      ],
      next: "isq_pa_check",
    },

    isq_pa_check: {
      id: "isq_pa_check",
      type: "decision",
      title: "Pressão arterial antes da trombólise",
      question: "A PA está < 185/110 mmHg?",
      summary: "PA informada: {pas}/{pad} mmHg.",
      evidence: [
        "Para trombolisar, a PA deve estar < 185/110 mmHg.",
        "Após a trombólise, manter < 180/105 mmHg por 24 horas.",
      ],
      options: [
        { id: "sim", label: "Sim — < 185/110", next: "trombolise" },
        { id: "nao", label: "Não — ≥ 185/110", next: "isq_pa_tratar" },
      ],
    },

    isq_pa_tratar: {
      id: "isq_pa_tratar",
      type: "action",
      title: "Reduzir a PA antes da trombólise",
      summary: "Alvo < 185/110 mmHg para liberar o trombolítico.",
      actions: [
        "METOPROLOL IV (1ª linha no Brasil): 5 mg a cada 10 min, a 1 mg/min, máximo 20 mg. Ampola de 5 mL com 1 mg/mL.",
        "OU ESMOLOL IV: 500 mcg/kg/min em 1 min → 50 mcg/kg/min por 4 min. Se a PA seguir inadequada, repetir o bólus de 500 mcg/kg/min e subir a manutenção para 100, depois 150, depois 200 mcg/kg/min (máximo). Atingido o alvo, manter em infusão contínua.",
        "NITROPRUSSIATO DE SÓDIO 0,5–8 mcg/kg/min, com reajuste a cada 10 min — indicado quando o betabloqueador está contraindicado (asma, insuficiência cardíaca, anormalidade grave da função cardíaca) ou quando a hipertensão não cede.",
        "⚠️ Labetalol, nicardipino e clevidipino são as escolhas da AHA, mas NÃO têm apresentação intravenosa comercializada no Brasil. A diretriz brasileira (SBDCV) trabalha com metoprolol, esmolol e nitroprussiato — é o que existe à beira do leito aqui.",
        "NÃO usar nitrato sublingual.",
        "Reaferir a PA — só liberar a trombólise com PA < 185/110 mmHg.",
        "Se a PA não baixar de forma sustentada, não trombolisar.",
      ],
      next: "trombolise",
    },

    trombolise: {
      id: "trombolise",
      type: "action",
      clinicalActionId: "administrar_trombolise_iv",
      title: "Trombólise IV — dose calculada",
      summary: "Iniciar o quanto antes (meta porta-agulha ≤ 60 min).",
      actions: [
        "Alteplase: dose total {alteplaseDose} mg (0,9 mg/kg, máx 90 mg) — {alteplaseBolus} mg em bolus em 1 min (10%) + {alteplaseInfusao} mg em infusão por 60 min.",
        "{avisoPeso}",
        "Tenecteplase {tnkDose} mg IV em BOLUS ÚNICO (0,25 mg/kg, máx 25 mg) — AHA/ASA 2026 endossa alteplase OU tenecteplase na janela de 4,5 h; o bolus único simplifica a administração e é prático como ponte pré-trombectomia.",
        TENECTEPLASE_REGIME_AVC,
        TENECTEPLASE_APRESENTACAO,
        "Monitorização pós-trombólise (24 h): PA < 180/105, glicemia 140–180, temperatura ≤ 37,5 °C, SpO₂ ≥ 94%. TC de controle em 24 h.",
        "AHA/ASA 2026: NÃO baixar a PAS de forma intensiva para < 140 mmHg, mesmo após reperfusão completa — não melhora desfecho e pode causar dano.",
        "SEM antiagregante/anticoagulante/punções por 24 h. Deterioração/cefaleia/vômito → suspender e TC (suspeita de hemorragia).",
      ],
      next: "isq_trombectomia_check",
    },

    /**
     * ⚠️ O COMO, quando o QUANDO já existe — mesmo padrão do RUSH no Choque.
     *
     * O app dizia "se há oclusão de grande vaso, trombectomia" e nunca dizia
     * como saber. E o R-48 quase se repetiu aqui: os sinais corticais JÁ SÃO
     * COLETADOS neste módulo, nos itens 2, 3, 9 e 11 do NIHSS. O ramo nomeia os
     * itens em vez de repetir a lista — quem acabou de pontuar não reexamina o
     * paciente, olha a própria pontuação.
     */
    lvo_como_saber: {
      id: "lvo_como_saber",
      type: "action",
      title: "Como reconhecer a oclusão de grande vaso",
      summary: LVO_COMO_SABER,
      actions: [
        LVO_NIHSS_SEM_LIMIAR,
        LVO_ANGIOTC_O_QUE_RESPONDE,
        LVO_NAO_ESPERE_A_IMAGEM,
        LVO_ESCALAS_FORA_DE_ESCOPO,
      ],
      next: "isq_trombectomia_check",
    },

    isq_trombectomia_check: {
      id: "isq_trombectomia_check",
      type: "decision",
      title: "Trombectomia mecânica (OGV)",
      question: "O paciente é candidato à trombectomia mecânica?",
      summary: "NIHSS informado: {nihss}.",
      evidence: [
        "Oclusão de grande vaso: ACI intracraniana, ACM (M1, M2) ou basilar à angio-TC/angio-RM.",
        "NIHSS ≥ 6, ASPECTS ≥ 6, independência funcional prévia (mRS 0–1).",
        "AHA/ASA 2026: elegibilidade AMPLIADA — inclui pacientes com core isquêmico maior; oclusão de BASILAR tem recomendação forte para trombectomia em até 24 h quando NIHSS ≥ 10.",
        "Até 6 h do início; entre 6–24 h apenas com critérios de mismatch por imagem (DAWN / DEFUSE-3).",
        "Trombectomia + trombólise quando ambos elegíveis (bridging — NÃO substituir uma pela outra).",
      ],
      options: [
        { id: "sim", label: "Sim — oclusão de grande vaso", next: "trombectomia" },
        { id: "nao", label: "Não / sem grande vaso", next: "isq_suporte" },
        { id: "nao_sei", label: "Não sei dizer — como reconhecer a oclusão", next: "lvo_como_saber" },
      ],
    },

    trombectomia: {
      id: "trombectomia",
      type: "action",
      title: "Acionar trombectomia mecânica",
      summary: "A trombectomia não exclui a trombólise — fazer ambas se elegível (bridging).",
      actions: [
        "Confirmar oclusão de grande vaso com angio-TC / angio-RM.",
        "Acionar a neurorradiologia intervencionista IMEDIATAMENTE.",
        "Transferir para centro com capacidade de trombectomia se necessário — não atrasar.",
        "Manter PA < 180/105 mmHg; reavaliar NIHSS continuamente.",
      ],
      next: "isq_suporte",
    },

    isq_suporte: {
      id: "isq_suporte",
      type: "action",
      title: "Cuidados de suporte e antitrombóticos — AVC isquêmico",
      summary: "Suporte + prevenção secundária precoce.",
      actions: [
        "PA permissiva: se NÃO trombolisou, tratar apenas se > 220/120 mmHg (reduzir ~15% nas primeiras 24 h). Pós-trombólise: < 180/105.",
        "Antiagregante: AAS 160–300 mg em 24–48 h (após 24 h e TC sem hemorragia se houve trombólise); manutenção 81–100 mg/dia.",
        "AVC minor (NIHSS ≤ 3) ou AIT de alto risco (ABCD² ≥ 4): DAPT iniciada idealmente em 12–24 h — AAS 160–300 mg de ataque, depois 81–100 mg/dia + clopidogrel 300 mg de ataque, depois 75 mg/dia. Manter ambos por 21 dias e então monoterapia (POINT/CHANCE). FA: anticoagular em 4–14 dias.",
        "Glicemia 140–180; normotermia (≤ 37,5); rastrear disfagia antes da via oral; profilaxia de TVP (compressão pneumática).",
        "Investigar etiologia: carótidas, ECG/Holter, ecocardiograma. PA-alvo de prevenção após 24 h: < 130/80.",
      ],
      next: "isq_destino",
    },

    isq_destino: {
      id: "isq_destino",
      type: "transition",
      title: "Unidade de AVC / UTI neurológica",
      summary: "Monitorização neurológica e investigação etiológica.",
      disposition: "icu",
      exitCriteria: [
        "Internar em unidade de AVC ou UTI com NIHSS seriado.",
        "Metas: glicemia 140–180, temperatura ≤ 37,5, SpO₂ ≥ 94%, PaCO₂ 35–45 (se intubado), Na⁺ 135–145, cabeceira 30°.",
        "TC de controle em 24 h (obrigatória após trombólise) antes de antiagregar.",
        "Investigar etiologia e iniciar prevenção secundária (antitrombótico, estatina, controle de PA < 130/80).",
      ],
      targets: [],
    },

    // ═══════════════════════ RAMO HIC (intracerebral) ════════════════════════
    hic_inicial: {
      id: "hic_inicial",
      type: "action",
      title: "HIC — estabilização e controle pressórico",
      summary: "Mortalidade 30–40% em 30 dias. NÃO trombolisar nem antiagregar. PA agressiva + reversão + neurocirurgia.",
      actions: [
        "Estabilizar: ABC, GCS, NIHSS. Cabeceira 30°. 2 acessos calibrosos. Labs: HMG, coagulograma (TP/TTPa/INR), plaquetas, função renal/hepática, tipagem, toxicológico (< 50 anos).",
        "Volume do hematoma (ABC/2 = A × B × C / 2, em cm): > 30 mL = maior mortalidade; > 60 mL hemisférico ou > 20 mL fossa posterior = prognóstico grave. Avaliar extensão intraventricular (SIV).",
        "CONTROLE PRESSÓRICO (AHA/ASA 2022): se PAS 150–220 → reduzir para alvo 140 mmHg em 1 h (INTERACT2/ATACH-2). NÃO reduzir abaixo de 130 nas primeiras 24 h. PAS > 220 → redução IV guiada por cateter arterial.",
        "Fármacos NO BRASIL: metoprolol IV ou esmolol IV; nitroprussiato de sódio quando o betabloqueador estiver contraindicado ou a PA não ceder. Labetalol, nicardipino e clevidipino IV — as escolhas citadas pela AHA — não têm apresentação intravenosa comercializada no país.",
        "AngioTC se jovem, sem HAS ou com 'spot sign' (prediz expansão do hematoma).",
      ],
      next: "hic_anticoag",
    },

    hic_anticoag: {
      id: "hic_anticoag",
      type: "decision",
      title: "Reversão de anticoagulação",
      question: "O paciente usa anticoagulante?",
      evidence: [
        "Reversão é EMERGÊNCIA na HIC — quanto antes, menor a expansão do hematoma.",
        "Identificar o agente define o reversor específico.",
      ],
      options: [
        { id: "sim", label: "Sim — em anticoagulante", next: "hic_reversao" },
        { id: "nao", label: "Não anticoagulado", next: "hic_pic" },
        { id: "nao_sei", label: "Não sei — me ajude", next: "hic_anticoag_descoberta" },
      ],
    },

    hic_anticoag_descoberta: {
      id: "hic_anticoag_descoberta",
      type: "action",
      title: "Descobrir anticoagulação",
      summary: "Obter a informação que falta e retornar à decisão de reversão.",
      guidedDiscoveryOrigin: "hic_anticoag",
      actions: [],
      natureza: "organizacao_do_atendimento",
      next: "hic_anticoag",
    },

    hic_reversao: {
      id: "hic_reversao",
      type: "action",
      title: "Reversão por agente — EMERGÊNCIA",
      summary: "Reverter conforme o anticoagulante em uso. Alvo INR < 1,3.",
      actions: [
        "Warfarina/AVK: complexo protrombínico de 4 fatores (PCC4) POR FAIXA DE INR — INR 2–<4: 25 UI/kg (máx 2.500 UI); INR 4–6: 35 UI/kg (máx 3.500 UI); INR > 6: 50 UI/kg (máx 5.000 UI).",
        "Associar vitamina K 10 mg IV em infusão lenta. Reavaliar INR 15–60 min após o PCC e de forma seriada. Conferir a bula do produto: a unidade é de fator IX.",
        "Heparina não fracionada (HNF): sulfato de protamina 1 mg / 100 UI de heparina (máx 50 mg).",
        "Dabigatrana: idarucizumabe (Praxbind®) 5 g IV (2 × 2,5 g).",
        "Rivaroxabana / Apixabana / Edoxabana (anti-Xa): andexanet alfa OU CCP 4 fatores 50 UI/kg IV.",
        "Suspender o anticoagulante; reavaliar coagulação após a reversão.",
      ],
      next: "hic_pic",
    },

    hic_pic: {
      id: "hic_pic",
      type: "action",
      title: "Manejo de PIC, convulsões e suporte",
      summary: "Neuroproteção e prevenção de lesão secundária.",
      actions: [
        "Sinais de hipertensão intracraniana: osmoterapia — manitol 20% 0,5–1 g/kg IV em 20 min OU SF 3% 150 mL. Alvo osmolalidade 300–320 mOsm/L; evitar hiponatremia.",
        "Convulsões CLÍNICAS: tratar imediatamente (levetiracetam, lacosamida ou fenitoína). Profilaxia anticonvulsivante de rotina NÃO é recomendada (AHA/ASA 2022).",
        "Glicemia 140–180; normotermia (≤ 37,5); cabeceira 30°; evitar hipotensão e hipóxia.",
        "Profilaxia de TEV: meia elástica/compressão; heparina SC apenas após 24–48 h de estabilidade imagiológica.",
      ],
      next: "hic_cirurgia",
    },

    hic_cirurgia: {
      id: "hic_cirurgia",
      type: "action",
      title: "Avaliação neurocirúrgica",
      summary: "Acionar neurocirurgia; indicações são seletivas (STICH I/II negativos para hematoma profundo).",
      actions: [
        "INDICADA: HIC cerebelar com deterioração neurológica, compressão de tronco, hidrocefalia obstrutiva OU volume ≥ 15 mL — evacuação imediata, com DVE se necessário; hematoma lobar superficial com deterioração neurológica; DVE para hidrocefalia aguda por sangue intraventricular.",
        "SEM benefício: hematoma profundo (tálamo/putâmen) sem deterioração — STICH I e II negativos.",
        "Acionar neurocirurgia para avaliação à beira leito; repetir TC se deterioração.",
        "Reavaliar continuamente o nível de consciência e o efeito de massa.",
      ],
      next: "hic_destino",
    },

    hic_destino: {
      id: "hic_destino",
      type: "transition",
      title: "Neurocirurgia + UTI neurológica",
      summary: "Cuidado neurointensivo com controle pressórico contínuo.",
      disposition: "icu",
      exitCriteria: [
        "UTI / unidade de AVC com monitorização neurológica seriada (GCS, pupilas).",
        "Metas: PAS ~140 (não < 130 nas 24 h), glicemia 140–180, temperatura ≤ 37,5, Na⁺ 135–145, cabeceira 30°, osmolalidade 300–320 com osmoterapia.",
        "Controle contínuo da PA e da coagulação; TC de controle se deterioração.",
        "Avaliação neurocirúrgica conforme indicação; profilaxia de TEV após 24–48 h.",
      ],
      targets: [],
    },

    // ═══════════════════════ RAMO HSA (subaracnóidea) ════════════════════════
    hsa_inicial: {
      id: "hsa_inicial",
      type: "action",
      title: "HSA — diagnóstico e gravidade (Hunt-Hess / Fisher)",
      summary: "Cefaleia súbita intensa ('a pior da vida'). Pensar em aneurisma. NÃO trombolisar.",
      actions: [
        "Diagnóstico: TC sem contraste (sensibilidade ~98% nas primeiras 6 h). TC negativa com alta suspeita → punção lombar (xantocromia). AngioTC/arteriografia para localizar o aneurisma.",
        "Hunt-Hess (gravidade clínica): I assintomático/cefaleia leve (~1%) · II cefaleia intensa + rigidez nucal, sem déficit (~5%) · III sonolência/confusão/déficit leve (~15%) · IV estupor/hemiplegia/descerebração (~40%) · V coma (~70–80%).",
        "Fisher modificada (risco de vasoespasmo): 1 sem sangue (~24%) · 2 HSA fina (~33%) · 3 HSA espessa (~33%) · 4 HSA com sangue intraventricular (~40%).",
        "Estabilizar: ABC, cabeceira 30°, 2 acessos, controle da PA, analgesia. Manter EUVOLEMIA (hipovolemia predispõe vasoespasmo).",
      ],
      next: "hsa_manejo",
    },

    hsa_manejo: {
      id: "hsa_manejo",
      type: "action",
      title: "HSA — nimodipino e tratamento do aneurisma",
      summary: "Nimodipino previne vasoespasmo (nível I). Ocluir o aneurisma preferencialmente em até 24 h.",
      actions: [
        "NIMODIPINO 60 mg VO a cada 4 h por 21 dias (nível I, AHA/ASA 2023) — reduz o déficit isquêmico tardio por vasoespasmo. Vigiar hipotensão.",
        "Tratamento do aneurisma: clipagem cirúrgica × coiling endovascular — decisão multidisciplinar (neurocirurgia + neurorradiologia). Ocluir completamente, preferencialmente em até 24 h, para evitar ressangramento.",
        "Cuidados gerais: euvolemia, evitar hipóxia/hipotermia/hipotensão. Estatina de rotina NÃO recomendada na HSA.",
        "Vigiar vasoespasmo (déficit isquêmico tardio), hidrocefalia (DVE se necessário) e hiponatremia.",
      ],
      next: "hsa_destino",
    },

    hsa_destino: {
      id: "hsa_destino",
      type: "transition",
      title: "UTI neurológica + neurocirurgia/neurorradiologia",
      summary: "Cuidado neurointensivo com prevenção de ressangramento e vasoespasmo.",
      disposition: "icu",
      exitCriteria: [
        "UTI neurológica com monitorização seriada (GCS, déficit focal, sinais de vasoespasmo).",
        "Oclusão do aneurisma preferencialmente em até 24 h; nimodipino 21 dias.",
        "Metas: euvolemia, Na⁺ 135–145, glicemia 140–180, temperatura ≤ 37,5, cabeceira 30°.",
        "Acionar neurocirurgia/neurorradiologia para clipagem ou coiling.",
      ],
      targets: [],
    },
  },
};
