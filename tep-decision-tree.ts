import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";
import {
  INTRO_GUIADA,
  OPCAO_GUIADA,
  camposDeInstabilidade,
  roteamentoDeInstabilidade,
} from "./lib/instabilidade-guiada";
import { HNF_APRESENTACAO } from "./lib/heparina-nao-fracionada";
import { ENOXAPARINA_APRESENTACAO, ENOXAPARINA_REGIME_TEV } from "./lib/enoxaparina";

/**
 * Fluxo interativo de Tromboembolia Pulmonar (TEP) no adulto.
 * Base clínica principal atual: AHA/ACC/Multisociety 2026 para classificação, diagnóstico, anticoagulação e terapias avançadas. ESC 2019 é mantida apenas como referência histórica/linguagem legada quando necessário.
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

import { avisoDePeso } from "./lib/peso-estimado";

import { DOBUTAMINA_ATE_20, DOBUTAMINA_FAIXA_USUAL, DOBUTAMINA_INICIO } from "./lib/dobutamina";
import { TEP_CHOQUE_NORMOTENSO, TEP_CHOQUE_NORMOTENSO_PROCEDENCIA } from "./lib/choque-normotenso-tep";
import { NA_DUVIDA_TEP_RISCO } from "./lib/na-duvida";
import {
  CI_COMUM_HEMORRAGIA_INTRACRANIANA,
  CI_COMUM_SANGRAMENTO_ATIVO,
  CI_O_QUE_FAZER_COM_A_DUVIDA,
  CI_TEP_JANELA_DIVERGE,
  CI_TEP_LISTA,
} from "./lib/contraindicacao-trombolise";
function deriveTep(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  // Reforço na LINHA DA DOSE: este módulo tem dose com TETO absoluto
  // (HNF 10.000 U em bolus), e a faixa do shell sozinha não põe a ressalva
  // junto do miligrama.
  out.avisoPeso = avisoDePeso(values.pesoOrigem);
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
  version: "2026.1",
  label: "Tromboembolia Pulmonar",
  entryNodeId: "entry",
  derive: deriveTep,
  nodes: {
    // ── 1. Reconhecimento ──────────────────────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Suspeita de TEP — reconhecimento",
      summary: "TEP agudo: confirmar o diagnóstico e classificar pela gravidade AHA/ACC 2026 (A–E), porque categoria e evolução clínica determinam destino e necessidade de terapia avançada.",
      actions: [
        "Apresentação possível: dispneia súbita, dor pleurítica, taquicardia/taquipneia, síncope, sinais de TVP e, nos casos graves, hipoperfusão, hipotensão ou choque. Não use os termos maciço/submaciço como classificação principal; prefira categorias AHA/ACC 2026.",
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
        "AHA/ACC 2026: D = falência cardiopulmonar incipiente (D1: hipotensão transitória/recorrente de curta duração ou responsiva a volume; D2: hipoperfusão/choque normotensivo). E = falência cardiopulmonar (E1: hipotensão recorrente ou persistente com choque cardiogênico; E2: choque refratário ou parada cardíaca). Reclassifique dinamicamente com a evolução.",
        // ⚠️ O CONSTRUTO QUE FALTAVA. `grep "normotens"` neste módulo
        // retornava ZERO, enquanto o conceito já existia em Choque e no EAP
        // — e é aqui que a diretriz de 2026 o introduziu. Só a EXISTÊNCIA e
        // a conduta, sem os critérios numéricos, que esperam a primária.
        TEP_CHOQUE_NORMOTENSO,
        TEP_CHOQUE_NORMOTENSO_PROCEDENCIA,
        "Se houver indicação de anticoagulação e não houver contraindicação, iniciar anticoagulação terapêutica precocemente. AHA/ACC 2026: quando anticoagulação parenteral inicial for necessária nas categorias C1–E1, preferir HBPM à HNF; se a imagem estiver atrasada em suspeita C2 ou superior e o risco hemorrágico for baixo, anticoagulação terapêutica pode ser iniciada antes da confirmação. Não atrasar terapia avançada necessária por busca de imagem no colapso iminente.",
        "Se estável: seguir o algoritmo diagnóstico (probabilidade pré-teste → D-dímero/AngioTC).",
      ],
      options: [
        { id: "guiado", label: OPCAO_GUIADA, next: "tep_instab_dados" },
        { id: "instavel", label: "Instabilidade/falência cardiopulmonar — avaliar D/E", next: "ar_suporte" },
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
        isquemicoIsolado: "tep_dor_isquemica",
      }),
    },

    // Dor isquêmica ISOLADA não faz TEP de alto risco. A dor do TEP é
    // tipicamente PLEURÍTICA — piora com a inspiração —, e dor em aperto com
    // irradiação aponta para o coração, não para a artéria pulmonar.
    //
    // Antes este caso caía em `ar_suporte`, que é a via do TEP maciço e leva à
    // discussão de trombólise. Trombolisar por dor torácica isquêmica num
    // paciente que pode estar infartando é o pior desfecho possível desta tela.
    tep_dor_isquemica: {
      id: "tep_dor_isquemica",
      type: "action",
      title: "Dor isquêmica isolada — pense no coração antes do pulmão",
      summary:
        "Sem hipotensão, sem alteração do estado mental e sem má perfusão, dor em aperto com irradiação não classifica TEP de alto risco.",
      actions: [
        "ECG DE 12 DERIVAÇÕES AGORA e troponina. É o que separa síndrome coronariana de TEP — e os dois entram na mesma queixa.",
        "O ECG do TEP costuma ser inespecífico: taquicardia sinusal é o mais comum. S1Q3T3 é pouco frequente. Já supradesnivelamento de ST em parede contígua é coronariano até prova em contrário.",
        "⚠️ NÃO trombolisar por dor torácica. A trombólise do TEP se decide por instabilidade hemodinâmica com TEP confirmado ou fortemente suspeito — nunca pelo tipo da dor.",
        "A dor do TEP é tipicamente PLEURÍTICA: piora à inspiração profunda, muitas vezes lateral, podendo vir com atrito pleural. Dor em aperto retroesternal com irradiação para braço ou mandíbula é outro território.",
        "Os dois podem coexistir, e o TEP pode elevar troponina por sobrecarga de ventrículo direito — por isso o ecocardiograma à beira do leito ajuda: disfunção de VD com coronárias normais aponta o pulmão.",
        "SEGUIR o algoritmo diagnóstico do TEP em paralelo — a suspeita não fica descartada por haver dor isquêmica.",
      ],
      next: "prob",
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
      summary: "Emergência com risco de morte. Suporte hemodinâmico cauteloso + anticoagulação terapêutica quando indicada e não contraindicada.",
      actions: [
        "SUPORTE RESPIRATÓRIO: na hipoxemia moderada-grave, preferir cânula nasal de alto fluxo ao cateter nasal convencional. Evitar sedação profunda e ventilação mecânica salvo indicação clínica forte, porque indução e pressão positiva podem precipitar colapso do VD. Se intubação for inevitável, ter vasopressor/inotrópico e estratégia de resgate hemodinâmico imediatamente disponíveis.",
        "HEMODINÂMICA AHA/ACC 2026: norepinefrina é geralmente o vasopressor de escolha quando há hipotensão/choque; associar inotrópico conforme baixo débito e perfusão. A diretriz alerta que, acima de cerca de 15 mcg/min de norepinefrina, a resistência vascular pulmonar pode aumentar; em vez de apenas escalar mais a dose, considerar segundo vasopressor conforme o contexto. Volume NÃO é rotina: apenas se houver preocupação clínica com pré-carga reduzida, em pequenos bolus de até 500 mL com reavaliação imediata; evitar cargas maiores ou indiscriminadas por risco de sobrecarga do VD.",
        DOBUTAMINA_INICIO,
        DOBUTAMINA_FAIXA_USUAL,
        DOBUTAMINA_ATE_20,
        "Anticoagulação parenteral: AHA/ACC 2026 recomenda HBPM sobre HNF nas categorias C1–E1 quando terapia parenteral inicial é necessária. Se HBPM for inadequada por contraindicação específica ou se o protocolo institucional definir HNF em situação excepcional, usar esquema e monitorização apropriados. Em suspeita C2 ou superior, com baixo risco hemorrágico e atraso de imagem, a anticoagulação terapêutica pode preceder a confirmação.",
        HNF_APRESENTACAO,
        "{avisoPeso}",
        "TEP de alto risco, por si só, NÃO torna HNF o anticoagulante parenteral preferido. AHA/ACC 2026 recomenda HBPM sobre HNF nas categorias C1–E1 e também após trombólise ou procedimento endovascular; durante a própria infusão trombolítica, a evidência é insuficiente para preferir HBPM a HNF, portanto seguir o protocolo periprocedural específico.",
        "AHA/ACC 2026: em categorias C–E, sedação profunda e ventilação mecânica devem ser evitadas salvo indicação clínica. Se houver necessidade de sedação para intubação, vasopressores, inotrópicos e/ou VA-ECMO devem estar prontamente disponíveis conforme recursos. Em C2–E, vasodilatador pulmonar inalatório pode ser considerado para reduzir a pós-carga do VD; não confundir com vasodilatação sistêmica indiscriminada.",
        "AHA/ACC 2026: VA-ECMO é razoável no choque cardiogênico refratário por TEP.",
        "Anticoagulação: DOAC é preferido a antagonista da vitamina K quando elegível. Para anticoagulação parenteral inicial, AHA/ACC 2026 recomenda HBPM sobre HNF nas categorias C1–E1; planejamento de trombólise ou procedimento endovascular NÃO cria exceção automática a favor de HNF. Após trombólise ou procedimento endovascular, HBPM também é preferida; durante a infusão trombolítica, seguir o protocolo específico porque não há evidência suficiente para escolher HBPM sobre HNF nesse intervalo."
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
        "Se a AngioTC for inviável pela instabilidade: usar ecocardiografia/POCUS à beira leito para avaliar disfunção de VD e diagnósticos alternativos e ultrassom venoso quando útil. Ecocardiograma, inclusive sinal de McConnell, NÃO confirma nem exclui TEP isoladamente; no colapso iminente, a decisão de reperfusão deve integrar probabilidade clínica, achados disponíveis, contraindicações e impossibilidade de imagem definitiva, sem transformar um único achado ecográfico em confirmação diagnóstica.",
        "Não retardar a reperfusão por exames se o colapso for iminente.",
      ],
      next: "ar_trombolise_check",
    },

    ar_trombolise_check: {
      id: "ar_trombolise_check",
      type: "decision",
      title: "Trombólise sistêmica — contraindicações",
      question: "O risco hemorrágico é aceitável para trombólise sistêmica neste cenário?",
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 5 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 5, tirar um não abre
      // nada — abaixaria para 4 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "⚠️ EM PCR OU COLAPSO IMINENTE, A RELAÇÃO RISCO–BENEFÍCIO MUDA, mas não transforme isso numa regra automática de ignorar contraindicações. AHA 2025 considera fibrinólise razoável no TEP confirmado como causa da parada e possível no TEP suspeito; a decisão deve integrar probabilidade de TEP, risco hemorrágico, alternativas disponíveis e possibilidade de embolectomia/ECLS.",
      evidence: [
        "AHA/ACC 2026: em E1–E2, com risco hemorrágico aceitável e quando terapia avançada está sendo considerada, trombólise sistêmica + anticoagulação é razoável sobre anticoagulação isolada; em D1–D2 pode ser considerada para prevenir deterioração. Em C3 o benefício é incerto; em A1–C2 não usar trombólise sistêmica sobre anticoagulação devido ao maior risco de sangramento grave e hemorragia intracraniana.",
        "ANTES DA LISE: conferir a lista detalhada de contraindicações abaixo e a bula/protocolo do produto utilizado. Não transformar uma janela histórica de 3 ou 6 meses para AVC prévio em regra universal se a própria bula vigente apenas disser AVC recente.",
        "── CONTRAINDICAÇÕES RELATIVAS — não proíbem, mudam a conta ──",
        "RISCO HEMORRÁGICO: além das contraindicações da bula, pesar cirurgia/procedimento maior recente, doença cerebrovascular, sangramento gastrointestinal/geniturinário recente, trauma, pericardite, endocardite, doença hepática/renal com defeito hemostático, gravidez, retinopatia hemorrágica, idade avançada e anticoagulação oral. A decisão depende da categoria AHA/ACC, gravidade, possibilidade de alternativa e risco de sangramento.",
        "⚠️ PCR/colapso iminente exige decisão individual rápida: contraindicações relativas não devem funcionar como veto mecânico, mas também não desaparecem. No TEP confirmado em parada, AHA 2025 considera fibrinólise, embolectomia cirúrgica e embolectomia mecânica opções razoáveis; em TEP apenas suspeito, fibrinólise pode ser considerada. Se houver recurso, discutir embolectomia/ECLS conforme o cenário.",
      ],
      options: [
        { id: "sem", label: "Risco hemorrágico aceitável para trombólise", next: "ar_trombolise" },
        { id: "com", label: "Risco hemorrágico inaceitável / contraindicação maior", next: "ar_alternativas" },
        { id: "nao_sei", label: "Risco incerto — revisar contraindicações", next: "ci_tep_lista" },
      ],
    },

    ci_tep_lista: {
      id: "ci_tep_lista",
      type: "action",
      title: "Contraindicações à trombólise — confira item a item",
      actions: [
        CI_COMUM_HEMORRAGIA_INTRACRANIANA,
        CI_COMUM_SANGRAMENTO_ATIVO,
        CI_TEP_LISTA,
        CI_TEP_JANELA_DIVERGE,
        CI_O_QUE_FAZER_COM_A_DUVIDA,
      ],
      next: "ar_trombolise",
    },

    ar_trombolise: {
      id: "ar_trombolise",
      type: "action",
      clinicalActionId: "administrar_trombolise_sistemica_tep",
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
        "DOSE NA PCR: AHA 2025 não define um esquema ótimo. ERC 2025 relata sobrevivência/ROSC com alteplase 50 mg IV em bólus, com ou sem 50 mg adicionais após 30 min, ou 0,6–1,0 mg/kg IV (máx. 100 mg), mas afirma que a evidência é insuficiente para recomendar uma estratégia de dose ótima. Se houver protocolo institucional validado, siga-o e registre a estratégia utilizada.",
        "Após ROSC, NÃO complete automaticamente uma dose total de 100 mg apenas porque foi iniciado um esquema durante a parada: a estratégia ótima de fibrinólise na PCR não está estabelecida. Reavaliar sangramento, hemodinâmica, diagnóstico e necessidade de terapia adicional conforme protocolo/equipe especializada.",
        "⚠️ NÃO extrapolar os estudos de dose reduzida do TEP agudo fora da parada para afirmar que 50 mg em bólus é a dose estabelecida da PCR. AHA/ACC 2026 admite que doses sistêmicas menores podem reduzir sangramento em TEP agudo, mas isso não resolve a estratégia ótima durante RCP.",
        "DURAÇÃO DA RCP APÓS FIBRINÓLISE: ERC 2025 recomenda continuar RCP por pelo menos 60–90 min. AHA 2025 considera a duração ótima incerta; portanto registre o horário da fibrinólise e evite encerrar precocemente sem considerar essa diferença entre diretrizes e o contexto clínico.",
        "Não apresente o regime acelerado de TEP fora da parada como alternativa equivalente e validada para PCR; os esquemas observados durante RCP e a evidência sobre dose ótima continuam heterogêneos.",
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
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 6 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 6, tirar um não abre
      // nada — abaixaria para 5 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "O QUE O WELLS DECIDE É O PRÓXIMO EXAME, NÃO O DIAGNÓSTICO: ≤ 4 significa TEP improvável e o caminho é o D-dímero; > 4 significa TEP provável e o caminho é a angioTC DIRETO. ⚠️ COM WELLS > 4 NÃO SE PEDE D-DÍMERO — um resultado negativo ali não descarta, e o exame só adia a imagem.",
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
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 4 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 4, tirar um não abre
      // nada — abaixaria para 3 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "⚠️ ACIMA DOS 50 ANOS O CORTE NÃO É 500 — É A IDADE VEZES 10 (ADJUST-PE): aos 70 anos, 700 ng/mL. Usar o corte fixo nesta faixa transforma em positivo quem já estava descartado, e manda para a angioTC quem não precisava.",
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
      // ⚠️ ESTE `summary` NASCEU DE UM ITEM DE `evidence` (2026-08-17).
      // `ListaDeCriterios` recolhe por CONTAGEM (`itens.length <= 2` fica
      // aberto): o nó tinha TRÊS itens e estava inteiro atrás do "Ver
      // critérios". Subir o item que MUDA CONDUTA trouxe junto, de graça,
      // os outros dois — que agora aparecem sem toque.
      summary:
        "TEP SUBSEGMENTAR ISOLADO TAMBÉM É TEP: anticoagule na maioria dos casos. Vigilância sem anticoagular só se baixo risco, com ultrassom de membros negativo e seguimento garantido.",
      evidence: [
        "AngioTC é o padrão-ouro (sensibilidade 83–90%, especificidade 94–96%); visualiza até ramos subsegmentares.",
        "Contraindicação relativa: TFG < 30 (nefropatia por contraste), alergia grave ao iodo, gestação — alternativa: cintilografia V/Q.",
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
      title: "Classificação clínica AHA/ACC 2026",
      question: "Qual categoria AHA/ACC 2026 melhor descreve o paciente confirmado e atualmente sem falência cardiopulmonar persistente?",
      summary: NA_DUVIDA_TEP_RISCO,
      evidence: [
        "Disfunção de VD: dilatação/hipocinesia ao ECO ou relação VD/VE > 0,9 na AngioTC. Biomarcadores: troponina e/ou BNP elevados.",
        "sPESI (1 ponto cada): idade > 80, câncer, doença cardiopulmonar crônica, FC ≥ 110, PAS < 100, SpO₂ < 90%. sPESI = 0 → baixo risco (mortalidade 30 dias ~1%); ≥ 1 → risco elevado (~10,9%).",
        "Categorias 2026 no paciente sintomático sem falência cardiopulmonar: B = baixo escore de gravidade; C = escore de gravidade elevado. Dentro de C: C1 = VD e biomarcadores normais; C2 = VD anormal OU pelo menos um biomarcador anormal; C3 = VD anormal E pelo menos um biomarcador anormal.",
        "AHA/ACC 2026: A = TEP incidental assintomático; B = sintomático com baixo escore de gravidade; C = sintomático com escore elevado; D = falência cardiopulmonar incipiente, inclusive choque normotensivo; E = falência cardiopulmonar. Os termos baixo/intermediário/alto risco da ESC 2019 podem aparecer como linguagem legada, mas não devem dirigir a decisão quando a categoria A–E estiver disponível.",
        "AHA/ACC 2026: acionar o time de resposta a TEP (PERT) nos casos C–E — melhora a agilidade do cuidado."
      ],
      options: [
        { id: "int_alto", label: "C3 — gravidade elevada + VD e biomarcador anormais", next: "anticoag_intensivo" },
        { id: "int_baixo", label: "C1/C2 — gravidade elevada", next: "anticoag" },
        { id: "baixo", label: "B — baixa gravidade (ex.: sPESI = 0/Hestia = 0)", next: "ambulatorial_check" },
      ],
    },

    anticoag_intensivo: {
      id: "anticoag_intensivo",
      type: "action",
      title: "Categoria C3 — anticoagulação + vigilância de deterioração",
      summary: "Categoria C3 exige hospitalização e vigilância próxima. Trombólise sistêmica não é rotina: sua utilidade é incerta enquanto o paciente permanece C3; se deteriorar, reclassifique para D/E e reavalie terapia avançada.",
      actions: [
        "Anticoagulação terapêutica sem contraindicação. AHA/ACC 2026: se for necessária anticoagulação parenteral inicial em C1–E1, preferir HBPM à HNF; escolher exceções de forma explícita conforme função renal, sangramento e contexto periprocedural.",
        "{avisoPeso}",
        "Monitorização intensiva (UTI): PA, FC, SpO₂ contínuos; repetir troponina/BNP e ECO.",
        "Se houver deterioração, RECLASSIFICAR imediatamente para D1/D2/E1/E2 conforme hipotensão, hipoperfusão e choque; acionar PERT/equipe de referência e reavaliar trombólise sistêmica, cateter, trombectomia ou cirurgia conforme categoria e risco hemorrágico.",
        "⚠️ Categoria C3: NÃO usar trombólise sistêmica de rotina. AHA/ACC 2026 considera incerta a utilidade da trombólise sistêmica em C3; a decisão só deve avançar após reavaliação clínica, risco hemorrágico e eventual progressão para D/E.",
        "Em C2–C3, o benefício de trombólise dirigida por cateter ou trombectomia mecânica sobre anticoagulação isolada permanece incerto; não oferecer como escalada automática apenas pela categoria.",
      ],
      next: "destino_uti",
    },

    ambulatorial_check: {
      id: "ambulatorial_check",
      type: "decision",
      title: "Baixo risco — tratamento ambulatorial?",
      question: "O paciente preenche TODOS os critérios para alta precoce/ambulatorial?",
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 4 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 4, tirar um não abre
      // nada — abaixaria para 3 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "ALTA PRECOCE exige baixo risco validado e viabilidade clínica/social. AHA/ACC 2026 recomenda usar Hestia, PESI e/ou sPESI; não transforme uma combinação fixa de três exames em regra universal de alta.",
      evidence: [
        "AHA/ACC 2026: categorias A/B podem ser candidatas a manejo ambulatorial quando Hestia, PESI e/ou sPESI indicarem baixo risco e houver acesso imediato à anticoagulação, seguimento rápido e ausência de barreiras clínicas ou sociais.",
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
      summary: "AHA/ACC 2026: anticoagulação é a base do tratamento. Se elegível para via oral, preferir DOAC a antagonista da vitamina K; quando terapia parenteral inicial for necessária em C1–E1, preferir HBPM a HNF, salvo contraindicação/contexto específico.",
      actions: [
        "NOAC 1ª linha — Rivaroxabana 15 mg VO 12/12h × 21 dias → 20 mg/dia (com refeição); OU Apixabana 10 mg VO 12/12h × 7 dias → 5 mg 12/12h. Evitar se TFG < 15, gestação.",
        "Alternativas NOAC (requerem parenteral inicial 5–10 dias): Dabigatrana 150 mg 12/12h; Edoxabana 60 mg/dia (30 mg se ≤ 60 kg ou TFG 15–50).",
        "Esquema clássico: enoxaparina {enoxa} mg SC 12/12h + varfarina (alvo INR 2,0–3,0; sobrepor ≥ 5 dias e até INR ≥ 2 por 24 h).",
        // ⚠️ R-48 PELA DISTRIBUIÇÃO, e o caso inverte a intuição: o ajuste renal
        // da enoxaparina EXISTE nas coronárias — onde ela é ADJUVANTE da
        // fibrinólise — e FALTAVA aqui, onde ela é a anticoagulação de
        // MANUTENÇÃO e o paciente a recebe por dias. Estava presente onde
        // importa menos e ausente onde importa mais. A lacuna não estava no
        // módulo menos maduro.
        ENOXAPARINA_REGIME_TEV,
        ENOXAPARINA_APRESENTACAO,
        "SITUAÇÕES ESPECIAIS: gestação exige anticoagulante compatível com a gestação; em síndrome antifosfolípide trombótica estabelecida, AHA/ACC 2026 recomenda antagonista da vitamina K sobre DOAC. Na doença renal grave (ClCr <30 mL/min), se HBPM for utilizada, é razoável monitorar anti-Xa para orientar ajuste e reduzir sangramento; escolher agente e dose conforme função renal, bula e contexto, sem transformar ClCr <30 isoladamente em regra automática de HNF para todo TEP.",
        "DURAÇÃO AHA/ACC 2026: a fase inicial de tratamento dura 3–6 meses. Se o primeiro TEP ocorreu por fator MAIOR reversível, em geral interromper ao fim dessa fase; sem fator maior reversível ou com fator persistente, considerar/continuar fase estendida além de 3–6 meses, reavaliando periodicamente recorrência versus sangramento. Não transformar “provocado = 3 meses” ou “não provocado = indefinido” em regra automática sem classificar o fator de risco.",
        "FILTRO DE VEIA CAVA AHA/ACC 2026: NÃO usar de rotina em paciente terapeuticamente anticoagulado. Se anticoagulação não puder ser tolerada e filtro for necessário, preferir filtro recuperável e programar retirada assim que o risco de TEP diminuir e a anticoagulação puder ser retomada. Em TEP recorrente apesar de anticoagulação terapêutica ótima, o filtro pode ser considerado; em categorias D–E submetidas a terapia avançada, o benefício do filtro de rotina é incerto.",
        "OBESIDADE AHA/ACC 2026: em IMC >30 kg/m², DOAC é razoável sobre antagonista da vitamina K quando não contraindicado. Em obesidade classe III (IMC >40 kg/m²) tratada com HBPM, redução de dose pode ser razoável para reduzir sangramento; não crie automaticamente um teto universal. Em peso >150 kg ou IMC >40 kg/m², o benefício de monitorar anti-Xa rotineiramente para evitar níveis supraterapêuticos não está estabelecido.",
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
        "Fase inicial de anticoagulação: 3–6 meses. Definir eventual fase estendida pela presença de fator maior reversível, ausência de fator maior reversível, fator persistente, recorrência e risco hemorrágico; reavaliar periodicamente se continuar além da fase inicial.",
      ],
      next: "destino_ambulatorial",
    },

    // ── 6. Destinos ─────────────────────────────────────────────────────────────
    destino_uti: {
      id: "destino_uti",
      type: "transition",
      title: "Monitorização intensiva — categorias C3/D/E conforme gravidade",
      summary: "Monitorização intensiva e vigilância de deterioração.",
      disposition: "icu",
      exitCriteria: [
        "UTI com monitorização contínua de PA, FC, SpO₂; ECO seriado (24–48 h pós-trombólise ou se deterioração).",
        "Monitorar oxigenação, perfusão, pressão, sinais de falência de VD e anticoagulação conforme o agente utilizado; repetir biomarcadores e imagem de VD quando isso puder mudar estratificação ou conduta.",
        "Se houver deterioração, reclassificar pela categoria AHA/ACC 2026 e discutir terapia avançada conforme D/E, risco hemorrágico, recursos e PERT/equipe de referência; não usar a antiga etiqueta intermediário-alto como autorização automática para trombólise.",
        "SEGUIMENTO PÓS-TEP: perguntar por dispneia e limitação funcional em TODAS as consultas por pelo menos 1 ano. Se sintomas persistirem após cerca de 3 meses de anticoagulação terapêutica, avaliar doença pulmonar tromboembólica crônica (CTEPD) e outras causas; não fazer imagem de controle rotineira apenas para documentar resolução em paciente assintomático de baixa suspeita.",
      ],
      targets: [],
    },

    destino_internacao: {
      id: "destino_internacao",
      type: "transition",
      title: "Internação — categorias C1/C2",
      summary: "Anticoagulação plena com vigilância clínica.",
      disposition: "observation",
      exitCriteria: [
        "Internação com anticoagulação plena e vigilância clínica (PA, FC, SpO₂, sinais de deterioração).",
        "Reclassificar para UTI/trombólise de resgate se houver instabilidade.",
        "Planejar a duração: fase inicial 3–6 meses; ao final, decidir interrupção versus fase estendida conforme fator maior reversível, fatores persistentes/ausentes, recorrência e risco de sangramento. Reavaliar periodicamente se mantida além da fase inicial.",
        "Pesquisar trombofilia se TEP não provocado < 50 anos, recorrente ou de localização inusual (coletar antes da anticoagulação ou ≥ 4 sem após).",
      ],
      targets: [],
    },

    destino_ambulatorial: {
      id: "destino_ambulatorial",
      type: "transition",
      title: "Alta precoce / tratamento ambulatorial — categorias A/B selecionadas",
      summary: "Baixo risco selecionado — reduz custos sem aumentar mortalidade (HOME-PE).",
      disposition: "discharge",
      exitCriteria: [
        "Alta com NOAC oral, orientações de sinais de alarme e retorno imediato.",
        "Garantir contato/seguimento clínico na primeira semana após a alta para educação, adesão, barreiras à anticoagulação e sangramento; programar também consulta até 3 meses.",
        "A fase inicial dura 3–6 meses; ao final, decidir se haverá fase estendida conforme fatores reversíveis/persistentes, recorrência e risco hemorrágico, com reavaliação periódica se mantida.",
        "Reforçar adesão; investigar causa de base (câncer oculto conforme idade/risco).",
      ],
      targets: [],
    },
  },
};

/**
 * ── QUEM NÃO PODE FAZER ANGIOTC — FONTE ÚNICA, DONA AQUI ────────────────────
 *
 * A tela do Wells manda "AngioTC diretamente" no provável, e ISSO ESTÁ CERTO:
 * escolher a via diagnóstica é o desfecho para o qual o escore foi construído e
 * validado. O que faltava era o outro lado — o escore não sabe se a paciente
 * está grávida, qual a função renal, nem se há alergia a contraste, e são
 * exatamente essas três que mudam o exame.
 */
export const ANGIOTC_QUANDO_NAO_DA =
  "⚠️ Antes de pedir a AngioTC: gestação, função renal e alergia a contraste mudam o exame, e o escore não pergunta nenhuma das três. Na gestante, começar por doppler venoso de membros inferiores (se positivo, trata sem irradiar) e, se negativo, discutir cintilografia de perfusão ou AngioTC com protocolo de dose reduzida. Na injúria renal ou na alergia ao contraste, a cintilografia V/Q é a alternativa. Abrir o módulo TEP.";
