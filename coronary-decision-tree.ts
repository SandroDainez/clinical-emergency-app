import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

/**
 * Fluxo interativo das Síndromes Coronarianas Agudas (SCA) no adulto.
 * Ordem real de atendimento: dor torácica → medidas imediatas + AAS → ECG ≤10 min
 * → classificação STEMI x SCA sem supra de ST → terapia antitrombótica/anti-isquêmica
 * → reperfusão (ICP primária x fibrinólise) ou estratégia invasiva por risco → destino.
 *
 * Baseado nas diretrizes AHA/ACC (2021 Chest Pain; 2013/2025 STEMI) e ESC 2023
 * (Acute Coronary Syndromes). Doses de tenecteplase e enoxaparina calculadas por peso.
 *
 * Valores coletados por TOQUE (seletores rápidos) com opção de valor próprio.
 * NÃO substitui o julgamento clínico nem o protocolo institucional. A decisão e a
 * responsabilidade finais são do profissional assistente.
 */

function toNumber(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round0(n: number): string {
  return Math.round(n).toString();
}

/** Tenecteplase por faixa de peso (bolus IV único). */
function tnkByWeight(peso: number): number {
  if (peso < 60) return 30;
  if (peso < 70) return 35;
  if (peso < 80) return 40;
  if (peso < 90) return 45;
  return 50;
}

import { PRASUGREL_RESTRICOES } from "./lib/prasugrel-restricoes";
import {
  OCLUSAO_ACHEI_UM_PADRAO,
  OCLUSAO_NAO_TENHO_CERTEZA,
  DERIVACOES_POSTERIORES_COMO,
  ECG_DUVIDA_O_QUE_FAZER,
  OCLUSAO_AVR_TRONCO,
  OCLUSAO_DE_WINTER,
  OCLUSAO_POSTERIOR,
  OCLUSAO_SEM_SUPRA_ABERTURA,
  OCLUSAO_T_HIPERAGUDA,
  OMI_ENQUADRAMENTO,
  VD_CONTRAINDICA_PRE_CARGA,
  VD_DERIVACOES_COMO,
  VD_QUANDO_PROCURAR,
  WELLENS_NAO_E_OCLUSAO,
  WELLENS_NUNCA_ERGOMETRICO,
} from "./lib/oclusao-sem-supra";
import { TENECTEPLASE_APRESENTACAO, TENECTEPLASE_REGIME_IAM } from "./lib/tenecteplase";
import { ENOXAPARINA_APRESENTACAO, ENOXAPARINA_REGIME_IAM } from "./lib/enoxaparina";
import { NITRATO_CONTRAINDICACAO_PDE5, NITRATO_OUTRAS_CONTRAINDICACOES, NITRATO_PDE5_USO_CRONICO } from "./lib/nitrato-contraindicacoes";
import { MORFINA_CONTRAINDICACOES, MORFINA_TETO } from "./lib/morfina-dispneia";
import { avisoDePeso } from "./lib/peso-estimado";
import {
  CI_COMUM_HEMORRAGIA_INTRACRANIANA,
  STEMI_RELATIVA_PESA_O_TEMPO,
  STEMI_RELOGIO_DECIDE,
  CI_COMUM_SANGRAMENTO_ATIVO,
  CI_O_QUE_FAZER_COM_A_DUVIDA,
  CI_SCA_EXCECAO_AVC_AGUDO,
  CI_SCA_LISTA,
} from "./lib/contraindicacao-trombolise";

function deriveCoronary(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  // Reforço na LINHA DA DOSE: este módulo tem dose com TETO absoluto
  // (enoxaparina 100 mg — 75 mg no ≥ 75 anos — · HNF 4.000 U em bolus e
  // 1.000 U/h na infusão), e a faixa do shell sozinha não põe a ressalva
  // junto do miligrama.
  out.avisoPeso = avisoDePeso(values.pesoOrigem);
  const peso = toNumber(values.peso);
  if (peso && peso > 0) {
    // Enoxaparina com fibrinólise. O TETO vale para as DUAS PRIMEIRAS doses — as
    // seguintes seguem 1 mg/kg sem limite. Por isso são dois valores e não um: o
    // app mostrava só a dose por peso e, num paciente de 120 kg, entregava 120 mg
    // onde o máximo é 100.
    out.enoxaPorPeso = round0(1.0 * peso);
    out.enoxa = round0(Math.min(1.0 * peso, 100)); // máx 100 mg nas 2 primeiras
    out.enoxa75PorPeso = round0(0.75 * peso);
    out.enoxa75 = round0(Math.min(0.75 * peso, 75)); // ≥75 anos: máx 75 mg nas 2 primeiras
    out.hnfBolus = round0(Math.min(60 * peso, 4000)); // 60 U/kg, máx 4000
    out.hnfInf = round0(Math.min(12 * peso, 1000)); // 12 U/kg/h, máx 1000/h
    out.tnk = tnkByWeight(peso).toString();
    // Meia dose NÃO é regra para todo ≥75 anos: vale só em estratégia
    // farmacoinvasiva com apresentação até 3 h (STREAM-2). A fonte veta a
    // extrapolação, e o app extrapolava.
    out.tnkHalf = (tnkByWeight(peso) / 2).toString();
  } else {
    out.enoxaPorPeso = "1 mg/kg";
    out.enoxa = "1 mg/kg (máx 100 mg nas 2 primeiras)";
    out.enoxa75PorPeso = "0,75 mg/kg";
    out.enoxa75 = "0,75 mg/kg (máx 75 mg nas 2 primeiras)";
    out.hnfBolus = "60 U/kg (máx 4000)";
    out.hnfInf = "12 U/kg/h (máx 1000)";
    out.tnk = "ajustada ao peso";
    out.tnkHalf = "metade da dose";
  }
  return out;
}

export const coronaryDecisionTree: DecisionTreeDefinition = {
  id: "sca_acs_2023",
  version: "2023.1",
  label: "Síndromes Coronarianas",
  entryNodeId: "entry",
  derive: deriveCoronary,
  nodes: {
    // ── 1. Reconhecimento e medidas imediatas ─────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Suspeita de SCA — dor torácica / equivalente anginoso",
      summary: "Tempo é músculo. Medidas iniciais e ECG em paralelo, sem atrasar.",
      actions: [
        "Monitor cardíaco contínuo, oximetria, PA, 2 acessos venosos; desfibrilador próximo.",
        "ECG de 12 derivações em ATÉ 10 min da chegada (repetir se dor persistir/mudar).",
        "AAS 300 mg mastigável agora (162–325 mg), salvo alergia/sangramento ativo.",
        "O₂ apenas se SpO₂ < 90% ou desconforto respiratório. Coletar troponina.",
        "Anamnese dirigida e exame em paralelo (não atrasar o ECG nem o AAS).",
      ],
      next: "tempo",
    },

    tempo: {
      id: "tempo",
      type: "input",
      title: "Tempo desde o início dos sintomas",
      intro: "Toque na janela. Define a elegibilidade e a urgência da reperfusão no STEMI.",
      fields: [
        {
          id: "tempo_dor",
          label: "Início dos sintomas",
          presets: [
            { value: "< 1 h", label: "< 1 h" },
            { value: "1–3 h", label: "1–3 h" },
            { value: "3–6 h", label: "3–6 h" },
            { value: "6–12 h", label: "6–12 h" },
            { value: "> 12 h", label: "> 12 h" },
            { value: "intermitente / indefinido", label: "Indefinido" },
          ],
        },
      ],
      next: "ecg",
    },

    // ── 2. ECG: classificação primária ────────────────────────────────────────
    ecg: {
      id: "ecg",
      type: "decision",
      title: "ECG de 12 derivações",
      question: "Há supradesnivelamento de ST (ou BRE/BRD novo) com critério?",
      // ── O NÓ MAIS DENSO DO APP NÃO TINHA CONTEÚDO DEMAIS ──────────────────
      //
      // Tinha o conteúdo do VIZINHO colado dentro dele. Dos 15 itens de
      // `evidence`, DEZ eram as mesmas constantes consumidas por
      // `ecg_sem_supra` — 3.564 caracteres duplicados, a um toque de distância.
      //
      // ⚠️ E O EFEITO ERA PERVERSO: quem responde "não sei dizer" chega ao
      // `ecg_sem_supra`, onde os cinco padrões são AÇÕES e renderizam ABERTAS.
      // Quem não responde nada tinha os mesmos cinco padrões debaixo de "Ver
      // critérios (15)" — onde ninguém abre, porque quinze itens não se leem
      // numa emergência. O conteúdo bom estava no lugar certo E no errado, e
      // era a cópia errada que inflava o nó.
      //
      // O que sobe: OCLUSAO_SEM_SUPRA_ABERTURA, que é a linha que MANDA usar a
      // terceira opção. Sem ela, o botão "não sei dizer" é um botão sem motivo.
      //
      // O que fica em `evidence`: os limiares em milímetros e a definição de
      // "sem supra". São CRITÉRIO — consulta-se, não se lê antes de decidir —,
      // e quatro itens continuam recolhidos, corretamente.
      //
      // ⚠️ ESTE NÓ NÃO ENTRA NA CONTA DOS "ABRIRAM SOZINHOS". Ele sai do
      // problema por DEDUPLICAÇÃO, não por abertura, e a diferença está
      // registrada para não inflar o resultado do bloco.
      summary: OCLUSAO_SEM_SUPRA_ABERTURA,
      evidence: [
        "Supra de ST ≥ 1 mm (0,1 mV) em ≥ 2 derivações contíguas.",
        "Em V2–V3: ≥ 2 mm (homens ≥ 40a), ≥ 2,5 mm (homens < 40a) ou ≥ 1,5 mm (mulheres).",
        "BRE novo / presumidamente novo com critérios de Sgarbossa; BRD novo com clínica isquêmica.",
        "Sem supra de ST = SCA sem supra (NSTEMI ou angina instável) até definição pela troponina — ⚠️ MAS ANTES, descarte os padrões abaixo.",
      ],
      options: [
        { id: "stemi", label: "Sim — supra de ST / BRE-BRD novo (STEMI)", next: "stemi_localizacao" },
        { id: "nste", label: "Não — descartei os padrões sem supra", next: "nste_trop" },
        {
          // ⚠️ O default sob dúvida é classificar como "sem supra" e seguir
          // pela via do NSTEMI — perdendo a sala de hemodinâmica de quem tem
          // oclusão sem supra. E o conteúdo que resolve JÁ EXISTE neste nó, em
          // `evidence`, que a tela renderiza RECOLHIDO atrás de "Ver critérios
          // (15)". Quem hesita não abre um acordeão para descobrir o que
          // precisa procurar.
          id: "nao_sei",
          label: "Não sei dizer — ver os padrões que NÃO fazem supra",
          next: "ecg_sem_supra",
        },
      ],
    },

    // ════════════════════════ RAMO STEMI ═════════════════════════════════════
    stemi_localizacao: {
      id: "stemi_localizacao",
      type: "action",
      title: "STEMI confirmado — localizar a parede",
      summary: "Localizar o infarto orienta complicações e cuidados específicos.",
      actions: [
        "Anterior/septal (V1–V4): risco de disfunção de VE e bloqueios — atenção hemodinâmica.",
        "Inferior (DII, DIII, aVF): obter V3R–V4R para IAM de VD e V7–V9 para parede posterior.",
        "IAM de VD ou inferior com hipotensão: NÃO usar nitrato/morfina; fazer volume (cristaloide).",
        "Acionar a hemodinâmica/cardiologia AGORA, em paralelo às medicações.",
      ],
      next: "stemi_dados",
    },

    stemi_dados: {
      id: "stemi_dados",
      type: "input",
      title: "Peso para cálculo de dose",
      intro: "Toque no peso (ou adicione). Usado para enoxaparina, heparina e tenecteplase.",
      fields: [
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
      next: "stemi_meds",
    },

    stemi_meds: {
      id: "stemi_meds",
      type: "action",
      title: "Terapia antitrombótica e adjuvante — STEMI",
      summary: "Iniciar em paralelo à definição da reperfusão (não atrasar a reperfusão).",
      actions: [
        "AAS já administrado (300 mg). Manter 81–100 mg/dia.",
        "2º antiplaquetário: se ICP primária → ticagrelor 180 mg OU prasugrel 60 mg — ACC/AHA 2025 recomenda ticagrelor/prasugrel PREFERENCIALMENTE ao clopidogrel na ICP. Se fibrinólise → clopidogrel; até 75 anos, ataque de 300 mg; 75 anos ou mais, SEM ataque — 75 mg direto.",
        PRASUGREL_RESTRICOES,
        "Anticoagulação: enoxaparina 1 mg/kg SC 12/12h = {enoxaPorPeso} mg (≥ 75a: 0,75 mg/kg = {enoxa75PorPeso} mg, sem bolus IV; ClCr < 30: 24/24h) OU HNF bolus {hnfBolus} U IV + {hnfInf} U/h (ajuste por TTPa).",
        "{avisoPeso}",
        "Estatina de alta intensidade: atorvastatina 40–80 mg VO (alternativa: rosuvastatina 20–40 mg).",
        "Nitrato e morfina só se necessário — e as contraindicações abaixo valem para os dois:",
        VD_CONTRAINDICA_PRE_CARGA,
        NITRATO_CONTRAINDICACAO_PDE5,
        NITRATO_PDE5_USO_CRONICO,
        NITRATO_OUTRAS_CONTRAINDICACOES,
        MORFINA_TETO,
        MORFINA_CONTRAINDICACOES,
        "Betabloqueador VO nas primeiras 24 h se SEM IC aguda, baixo débito, BAV ou broncoespasmo.",
      ],
      next: "stemi_reperfusao",
    },

    stemi_reperfusao: {
      id: "stemi_reperfusao",
      type: "decision",
      title: "Estratégia de reperfusão",
      question: "Angioplastia primária (ICP) disponível com tempo porta-balão ≤ 120 min?",
      summary: STEMI_RELOGIO_DECIDE,
      evidence: [
        "Se a ICP não for possível em ≤ 120 min e o início for ≤ 12 h → fibrinólise, com meta de até 10 min entre o diagnóstico e a agulha (ESC). Cada rede deve medir o próprio intervalo.",
        "Reperfusão indicada até 12 h; entre 12–24 h apenas se isquemia/instabilidade persistente.",
      ],
      options: [
        { id: "icp", label: "Sim — ICP primária em ≤ 120 min", next: "stemi_icp" },
        { id: "fibrino", label: "Não — ICP indisponível em tempo", next: "stemi_fibrino_check" },
      ],
    },

    stemi_icp: {
      id: "stemi_icp",
      type: "action",
      title: "Angioplastia primária (ICP)",
      summary: "Reperfusão mecânica preferencial. Meta porta-balão ≤ 90 min.",
      actions: [
        "Acionar a sala de hemodinâmica imediatamente; transporte monitorizado.",
        "Confirmar dupla antiagregação antes do procedimento.",
        // ANTICOAGULAÇÃO PERI-ICP — a árvore dizia só "conforme serviço".
        //
        // O número existia no app apenas num COMENTÁRIO desta função ("HNF
        // 10.000 U"), que nunca é renderizado — e esse teto não se confirma em
        // fonte: ACC/AHA/SCAI dá a dose por peso guiada por TCA, sem teto
        // absoluto. Escrito aqui sem o 10.000, que era resíduo sem lastro.
        //
        // E o essencial não é o miligrama: é que a dose peri-ICP é TITULADA
        // POR TCA na sala, não fixa. Dar a dose sem o alvo de TCA seria
        // entregar metade da instrução.
        "HEPARINA NÃO FRACIONADA peri-ICP — bolus IV por peso, TITULADO POR TCA na sala:",
        "  • SEM inibidor de GP IIb/IIIa: 70–100 U/kg, alvo de TCA 250–300 s (Hemotec) ou 300–350 s (Hemochron).",
        "  • COM inibidor de GP IIb/IIIa: 50–70 U/kg, alvo de TCA 200–250 s.",
        "  • ⚠️ A dose é ponto de partida, não prescrição fechada: quem titula é o TCA medido na hemodinâmica. Fonte: ACC/AHA/SCAI (diretriz de ICP) — a ESC 2023 mantém a HNF como anticoagulante preferencial no IAMCSST (classe I).",
        "Manter monitorização, tratar arritmias e instabilidade durante o transporte.",
        "Não atrasar a ICP por exames complementares.",
      ],
      next: "prevencao_secundaria",
    },

    stemi_fibrino_check: {
      id: "stemi_fibrino_check",
      type: "decision",
      title: "Contraindicações à fibrinólise",
      summary: STEMI_RELATIVA_PESA_O_TEMPO,
      question: "Há alguma contraindicação ABSOLUTA à fibrinólise?",
      evidence: [
        "Qualquer hemorragia intracraniana prévia; AVC isquêmico nos últimos 3 meses (exceto < 4,5 h).",
        "Neoplasia ou malformação vascular intracraniana conhecida; TCE/trauma facial grave < 3 meses.",
        "Sangramento ativo (exceto menstruação); suspeita de dissecção de aorta.",
        "Cirurgia intracraniana ou espinhal < 2 meses; HAS grave não controlável (> 185/110).",
        "── CONTRAINDICAÇÕES RELATIVAS — não proíbem, mudam a conta ──",
        "Hipertensão grave na apresentação (> 180/110) que RESPONDE ao tratamento; AVC isquêmico há mais de 3 meses; demência; RCP prolongada (> 10 min) ou traumática; cirurgia de grande porte < 3 semanas; sangramento interno nas últimas 2–4 semanas; punção vascular não compressível; gestação; úlcera péptica ativa; anticoagulação oral em uso.",
        "⚠️ COM RELATIVA E SEM ABSOLUTA, A DECISÃO É DE RISCO-BENEFÍCIO, e o que pesa é o TEMPO ATÉ A ICP: se a transferência para hemodinâmica for viável dentro de 120 min do primeiro contato, prefira a ICP e evite a lise. Se NÃO for, um STEMI extenso nas primeiras horas costuma justificar a fibrinólise mesmo com relativa — o risco de não reperfundir é maior que o de sangrar. Discuta com a hemodinâmica, mas NÃO ADIE a decisão esperando resposta.",
      ],
      options: [
        { id: "sem", label: "Sem contraindicação ABSOLUTA", next: "stemi_fibrinolise" },
        { id: "com", label: "Há contraindicação ABSOLUTA", next: "stemi_transfer" },
        { id: "nao_sei", label: "Não sei dizer — abrir a lista", next: "ci_sca_lista" },
      ],
    },

    ci_sca_lista: {
      id: "ci_sca_lista",
      type: "action",
      title: "Contraindicações à fibrinólise — confira item a item",
      actions: [
        CI_COMUM_HEMORRAGIA_INTRACRANIANA,
        CI_COMUM_SANGRAMENTO_ATIVO,
        CI_SCA_LISTA,
        CI_SCA_EXCECAO_AVC_AGUDO,
        CI_O_QUE_FAZER_COM_A_DUVIDA,
      ],
      next: "stemi_fibrinolise",
    },

    stemi_fibrinolise: {
      id: "stemi_fibrinolise",
      type: "action",
      title: "Fibrinólise — dose calculada",
      summary: "Fibrinólise em até 10 min do diagnóstico (meta ESC). Sempre seguida de estratégia fármaco-invasiva.",
      actions: [
        "Tenecteplase (TNK) {tnk} mg IV em bolus único.",
        TENECTEPLASE_REGIME_IAM,
        TENECTEPLASE_APRESENTACAO,
        "{avisoPeso}",
        "≥ 75 anos: meia dose ({tnkHalf} mg) SOMENTE em estratégia fármaco-invasiva com apresentação até 3 h do início dos sintomas (STREAM-2). Fora dessa condição — apresentação após 3 h ou fibrinólise sem estratégia fármaco-invasiva — usar a DOSE INTEGRAL.",
        "Clopidogrel: 300 mg de ataque; 75 mg sem ataque se ≥ 75 anos.",
        "Enoxaparina < 75 anos: bolus IV de 30 mg + {enoxa} mg SC 12/12h (1 mg/kg, máx 100 mg nas duas primeiras doses; a partir da terceira, 1 mg/kg = {enoxaPorPeso} mg).",
        "Enoxaparina ≥ 75 anos: SEM bolus IV; {enoxa75} mg SC 12/12h (0,75 mg/kg, máx 75 mg nas duas primeiras doses; a partir da terceira, 0,75 mg/kg = {enoxa75PorPeso} mg).",
        "ClCr < 30 mL/min: espaçar a enoxaparina para 24/24h. HNF é alternativa.",
        ENOXAPARINA_REGIME_IAM,
        ENOXAPARINA_APRESENTACAO,
        "Transferir para centro com ICP: angiografia entre 2–24 h se reperfusão bem-sucedida.",
        "ICP de resgate IMEDIATA se falha (redução do supra de ST < 50% em 60–90 min, dor ou instabilidade).",
      ],
      next: "prevencao_secundaria",
    },

    stemi_transfer: {
      id: "stemi_transfer",
      type: "action",
      title: "Transferência urgente para ICP",
      summary: "Fibrinólise contraindicada → reperfusão mecânica é a única opção.",
      actions: [
        "Acionar transferência imediata para centro com hemodinâmica (ICP de resgate/primária).",
        "Transporte monitorizado com desfibrilador; manter antitrombóticos conforme serviço.",
        "Comunicar a hemodinâmica de destino para reduzir o tempo até o balão.",
        "Tratar instabilidade hemodinâmica/elétrica durante o transporte.",
      ],
      next: "prevencao_secundaria",
    },

    // ════════════════════ RAMO SCA SEM SUPRA DE ST ═══════════════════════════
    /**
     * ⚠️ RAMO PONTEIRO — nenhuma linha de conteúdo clínico nova.
     *
     * Os cinco padrões de oclusão sem supra já existiam, já eram constantes de
     * `lib/oclusao-sem-supra.ts` e já estavam neste módulo — em `evidence` do
     * nó `ecg`, atrás do "Ver critérios (15)" recolhido.
     *
     * O defeito não era de conteúdo nem de lugar: era de ALCANCE. Quem hesita
     * em "há supra?" precisa exatamente disto, e não sabe que precisa abrir.
     * Este nó consome as MESMAS constantes — duas superfícies, uma fonte.
     */
    ecg_sem_supra: {
      id: "ecg_sem_supra",
      type: "action",
      title: "Antes de chamar de \"sem supra\" — os padrões que ocluem sem elevar",
      summary: ECG_DUVIDA_O_QUE_FAZER,
      // ── ORDEM POR CUSTO DO ERRO (item 4) ─────────────────────────────────
      //
      // A ordem antiga era de escrita, não de leitura: os dois blocos de
      // PROCEDIMENTO ("como fazer V7–V9", "como fazer V3R–V4R") ficavam
      // interleaved entre os padrões — 805 caracteres de técnica no meio de uma
      // varredura. Quem está varrendo padrão não está montando derivação.
      //
      // Agora: primeiro os TRÊS que são oclusão aguda AGORA (De Winter, posterior,
      // T hiperaguda), depois o aVR (tronco — sala urgente, fibrinólise FORA),
      // depois o WELLENS, e por último o VD, que é modificador de um inferior já
      // reconhecido, não um padrão a caçar.
      actions: [
        OCLUSAO_SEM_SUPRA_ABERTURA,
        OCLUSAO_DE_WINTER,
        OCLUSAO_POSTERIOR,
        OCLUSAO_T_HIPERAGUDA,
        OCLUSAO_AVR_TRONCO,
        WELLENS_NAO_E_OCLUSAO,
        WELLENS_NUNCA_ERGOMETRICO,
        VD_QUANDO_PROCURAR,
        // ⚠️ VEIO DO `ecg` NA DEDUPLICAÇÃO (2026-08-17), E NÃO FOI APAGADO.
        //
        // O enquadramento OMI/NOMI era o 15º item de `evidence` do nó da
        // triagem, e a proposta dizia que ele "pertence ao nó dos padrões". Ao
        // remover os 15, a constante ficou com UMA ocorrência no arquivo — só a
        // linha de `import`. Ou seja: sairia da tela do app inteiro.
        //
        // Import não é consumo, e a recíproca vale aqui: uma constante que só
        // aparece no import é conteúdo APAGADO, não conteúdo movido. Quem
        // dedupica precisa contar os consumos DEPOIS, não antes.
      ],
      next: "ecg_sem_supra_saida",
    },

    // ── A SAÍDA DA VARREDURA ────────────────────────────────────────────────
    //
    // ⚠️ O DEFEITO QUE ORIGINOU (2026-08-17): `ecg_sem_supra` é o destino do
    // "Não sei dizer" da pergunta do supra, lista CINCO padrões — e não tinha
    // opção nenhuma. Era `action` com `next: "nste_trop"`.
    //
    // O médico varria os cinco, reconhecia um De Winter — que é sala AGORA — e o
    // app o levava para a troponina do mesmo jeito. Varredura sem saída é a mesma
    // família do `vascular`: decisão não perguntada, agora na SAÍDA.
    ecg_sem_supra_saida: {
      id: "ecg_sem_supra_saida",
      type: "decision",
      title: "Depois de varrer — o que você viu no traçado",
      question: "Achou algum destes padrões no ECG?",
      summary:
        "⚠️ RECONHECER UM DELES MUDA O DESTINO. De Winter, posterior isolado e T hiperaguda têm a mesma urgência do STEMI — não são \"sem supra\".",
      // ⚠️ O `OMI_ENQUADRAMENTO` MUDOU DE LUGAR, NÃO SAIU (item 3). Ele tinha UM
      // único consumo no app, dentro da varredura — tirá-lo de lá sem destino
      // seria apagar conteúdo, não realocá-lo.
      //
      // Aqui ele fica melhor: o médico ACABOU de ver cinco padrões que ocluem sem
      // elevar, e é exatamente neste ponto que a pergunta "então por que o app
      // ainda chama isto de sem supra?" aparece. E como é UM item em `evidence`,
      // renderiza ABERTO (C1: `curta = itens.length <= 2`).
      evidence: [OMI_ENQUADRAMENTO],
      options: [
        { id: "ecg_achei", label: "SIM — reconheci um dos padrões", next: "ecg_sem_supra_achei" },
        // ⚠️ A TERCEIRA SAÍDA É A QUE FALTARIA, e é a mais provável aqui: quem
        // chegou a este nó já disse "não sei dizer" uma vez. Obrigá-lo a escolher
        // entre achei e não achei é obrigá-lo a mentir para seguir.
        { id: "ecg_incerto", label: "NÃO TENHO CERTEZA — o traçado é duvidoso", next: "ecg_sem_supra_duvida" },
        { id: "ecg_nao", label: "NÃO — nenhum deles, o traçado é mesmo sem supra", next: "nste_trop" },
        // ⚠️ A QUARTA SAÍDA É O PROCEDIMENTO (item 2). Os 805 caracteres de "como
        // fazer V7–V9" e "como fazer V3R–V4R" saíram da varredura e viraram passo
        // próprio, alcançado por QUEM PRECISA REGISTRAR — e que volta para cá
        // depois, porque só então tem o traçado para responder.
        { id: "ecg_derivacoes", label: "Preciso registrar as derivações extras (V7–V9 ou V3R–V4R)", next: "ecg_derivacoes_extras" },
      ],
    },

    ecg_derivacoes_extras: {
      id: "ecg_derivacoes_extras",
      type: "action",
      title: "Como registrar as derivações extras",
      summary:
        "V7–V9 quando houver suspeita de posterior; V3R–V4R em TODO infarto inferior. Registre e volte ao traçado.",
      actions: [DERIVACOES_POSTERIORES_COMO, VD_DERIVACOES_COMO],
      // volta para a pergunta — só com o traçado na mão é que ela se responde
      next: "ecg_sem_supra_saida",
    },

    ecg_sem_supra_achei: {
      id: "ecg_sem_supra_achei",
      type: "action",
      title: "Padrão de oclusão reconhecido — o relógio conta a partir de agora",
      summary: "A conduta passa a ser a do STEMI: reperfusão indicada, com a mesma urgência.",
      actions: [OCLUSAO_ACHEI_UM_PADRAO],
      next: "stemi_reperfusao",
    },

    ecg_sem_supra_duvida: {
      id: "ecg_sem_supra_duvida",
      type: "action",
      title: "Traçado duvidoso — o seguinte é que resolve",
      // ⚠️ DEFAULT ASSIMÉTRICO: as três coisas que a dúvida NÃO impede.
      summary: "Duvidar não impede repetir o ECG, colher troponina nem manter o paciente. Impede apenas liberar.",
      actions: [OCLUSAO_NAO_TENHO_CERTEZA],
      next: "nste_trop",
    },

    nste_trop: {
      id: "nste_trop",
      type: "decision",
      title: "Troponina e alterações isquêmicas",
      question: "Troponina elevada (ou curva ascendente) e/ou alterações isquêmicas dinâmicas?",
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
        "⏱ A TROPONINA É SERIADA, E O PROTOCOLO TEM HORA: 0 h/1 h (ou 0 h/3 h, conforme o ensaio disponível). Uma dosagem isolada não confirma nem descarta — o que define NSTEMI é a ELEVAÇÃO OU QUEDA significativa entre as duas.",
      evidence: [
        "Troponina de alta sensibilidade com elevação/queda significativa = NSTEMI.",
        "Infra de ST ≥ 0,5 mm ou inversão de T profunda dinâmica reforçam isquemia.",
        "Protocolo 0 h/1 h (ou 0 h/3 h): troponina seriada para confirmar/descartar.",
        "Sem elevação e ECG sem alteração = avaliar angina instável vs causa não isquêmica (HEART score).",
      ],
      options: [
        { id: "positivo", label: "Sim — troponina+/ST dinâmico (NSTE-ACS)", next: "nste_dados" },
        { id: "negativo", label: "Não — sem elevação / ECG normal", next: "nste_baixo" },
      ],
    },

    nste_dados: {
      id: "nste_dados",
      type: "input",
      title: "Peso para cálculo de dose",
      intro: "Toque no peso (ou adicione). Usado para enoxaparina e heparina.",
      fields: [
        {
          id: "peso",
          label: "Peso estimado (kg)",
          unit: "kg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["50", "60", "70", "80", "90", "100"].map((v) => ({ value: v, label: v })),
        },
      ],
      next: "nste_meds",
    },

    nste_meds: {
      id: "nste_meds",
      type: "action",
      title: "Terapia antitrombótica e anti-isquêmica — SCA sem supra",
      summary: "Tratar enquanto se define o tempo da estratégia invasiva.",
      actions: [
        "AAS já administrado (300 mg). Manter 81–100 mg/dia.",
        "2º antiplaquetário: ticagrelor 180 mg (manutenção 90 mg 12/12h) — preferir após definição anatômica; clopidogrel 300–600 mg como alternativa.",
        "ACC/AHA 2025: pré-tratamento com P2Y12 ANTES da anatomia só se a angiografia for demorar > 24 h (clopidogrel ou ticagrelor, classe 2b) — não é rotina.",
        "ACC/AHA 2025: se NSTEMI tratado APENAS clinicamente (sem ICP), a dupla recomendada é AAS + TICAGRELOR (classe 1).",
        "Anticoagulação: enoxaparina {enoxa} mg SC 12/12h (≥ 75a: {enoxa75} mg) OU fondaparinux 2,5 mg SC/dia OU HNF bolus {hnfBolus} U + {hnfInf} U/h.",
        "{avisoPeso}",
        "Anti-isquêmico: nitrato (SL/IV) se dor/HAS/IC e sem contraindicação; betabloqueador VO se sem IC aguda/BAV/broncoespasmo.",
        "Estatina de alta intensidade: atorvastatina 40–80 mg VO (alternativa: rosuvastatina 20–40 mg). Morfina 2–4 mg só se dor refratária.",
      ],
      next: "nste_risco",
    },

    nste_risco: {
      id: "nste_risco",
      type: "decision",
      title: "Estratificação de risco → tempo da coronariografia",
      question: "Qual a categoria de risco do paciente?",
      summary: "Define a urgência da estratégia invasiva (ESC 2020/2023). Use o escore GRACE 2.0.",
      evidence: [
        "Escore GRACE 2.0 (idade, FC, PAS, creatinina, Killip, PCR na admissão, desvio de ST, troponina) — superior ao TIMI para mortalidade. Calcular: GRACE > 140 = alto (> 3% mortalidade); 109–140 = intermediário (1–3%); < 109 = baixo (< 1%).",
        "MUITO ALTO (invasiva imediata < 2 h): instabilidade hemodinâmica/choque, dor refratária ao tratamento máximo, arritmia ventricular ameaçadora/PCR, complicação mecânica, IC aguda com isquemia, alterações dinâmicas de ST-T recorrentes (sobretudo supra de ST intermitente).",
        "ALTO (< 24 h): NSTEMI confirmado por troponina, alterações dinâmicas de ST/T, GRACE > 140.",
        "INTERMEDIÁRIO (< 72 h): DM, TFG < 60, FE < 40%/IC, angina pós-IAM, ICP/CRM prévia, GRACE 109–140.",
        "Classificação de Killip (prognóstico): I sem IC (~6%); II B3/crepitantes < 50% ou JVP elevada (~17%); III EAP (~38%); IV choque cardiogênico (~67–81%).",
      ],
      options: [
        { id: "muito_alto", label: "Muito alto — invasiva imediata (< 2 h)", next: "nste_invasiva_imediata" },
        { id: "alto", label: "Alto — invasiva precoce (< 24 h)", next: "nste_invasiva_precoce" },
        { id: "intermediario", label: "Intermediário — invasiva (< 72 h)", next: "nste_invasiva_precoce" },
      ],
    },

    nste_invasiva_imediata: {
      id: "nste_invasiva_imediata",
      type: "action",
      title: "Estratégia invasiva IMEDIATA (< 2 h)",
      summary: "Conduta semelhante ao STEMI pela instabilidade.",
      actions: [
        "Acionar a hemodinâmica imediatamente — coronariografia/ICP em < 2 h.",
        "Estabilizar em paralelo: arritmias, IC aguda, choque (considerar suporte).",
        "Manter dupla antiagregação e anticoagulação conforme o serviço.",
        "Transporte monitorizado com desfibrilador.",
      ],
      next: "prevencao_secundaria",
    },

    nste_invasiva_precoce: {
      id: "nste_invasiva_precoce",
      type: "action",
      title: "Estratégia invasiva precoce/programada",
      summary: "Coronariografia conforme a categoria de risco (< 24 h alto; < 72 h intermediário).",
      actions: [
        "Programar coronariografia: < 24 h (alto risco) ou < 72 h (intermediário).",
        "Manter monitorização contínua, troponina e ECG seriados.",
        "Otimizar terapia antitrombótica e anti-isquêmica enquanto aguarda.",
        "Reclassificar para invasiva imediata se surgir instabilidade ou dor refratária.",
      ],
      next: "prevencao_secundaria",
    },

    nste_baixo: {
      id: "nste_baixo",
      type: "action",
      title: "Baixo risco — seriar e estratificar",
      summary: "Sem elevação de troponina e ECG sem alteração isquêmica.",
      actions: [
        "Repetir troponina e ECG (protocolo 0 h/1 h ou 0 h/3 h) e aplicar HEART score.",
        "Se troponina permanece negativa e HEART baixo: considerar teste não invasivo de isquemia ou angio-TC de coronárias.",
        "Manter AAS; só escalar antitrombóticos se confirmar SCA.",
        "Investigar e tratar diagnósticos diferenciais (dissecção, TEP, pericardite, causas não cardíacas).",
      ],
      next: "nste_baixo_destino",
    },

    // ── Prevenção secundária / prescrição na alta (compartilhado SCA confirmada) ─
    prevencao_secundaria: {
      id: "prevencao_secundaria",
      type: "action",
      title: "Prevenção secundária — 5 classes obrigatórias na alta",
      summary: "Todo IAM deve sair com pelo menos 5 classes. Revisão com cardiologista em 2–4 semanas.",
      actions: [
        "1) AAS 100 mg/dia, indefinidamente — vale para todos.",
        // R-40 · este nó recebe os CINCO caminhos de reperfusão (3 de STEMI e
        // 2 de NSTEMI). A escolha do P2Y12 depende de COMO a artéria foi
        // aberta, e a condição vem ANTES da prescrição: quem foi trombolisado
        // e ainda não cateterizou lia "ticagrelor ou prasugrel" como se fosse
        // a regra dele. A árvore SABIA a distinção no nó agudo e a perdeu aqui,
        // no ponto de convergência.
        "2) P2Y12 — A ESCOLHA DEPENDE DE COMO A ARTÉRIA FOI ABERTA, e este passo recebe tanto quem foi à hemodinâmica quanto quem foi trombolisado:",
        "  • SE HOUVE ICP COM STENT → ticagrelor 90 mg 12/12h ou prasugrel, por 12 meses (DES).",
        "  • SE FOI FIBRINÓLISE E O PACIENTE AINDA NÃO FOI CATETERIZADO → CLOPIDOGREL. É o único P2Y12 com evidência em paciente lisado (CLARITY-TIMI 28 e COMMIT). NÃO usar ticagrelor nem prasugrel aqui — e o prasugrel, além disso, não tem indicação sem stent. Dose por IDADE: até 75 anos, ataque de 300 mg; 75 anos ou mais, SEM ataque — 75 mg direto, porque o CLARITY recrutou apenas até 75 anos e o ataque nunca foi testado acima disso.",
        "  • APÓS a angiografia da estratégia fármaco-invasiva, com stent implantado, a troca para ticagrelor passa a ser possível — a decisão é do serviço que fez o cateterismo.",
        PRASUGREL_RESTRICOES,
        "DURAÇÃO DA DAPT: 12 meses é o padrão PÓS-STENT; prolongar ou encurtar conforme risco isquêmico × hemorrágico.",
        "3) Betabloqueador (metoprolol succinato 25–200 mg/dia ou bisoprolol) — obrigatório se FE < 40% ou IC; alvo FC 55–60.",
        "4) IECA (ramipril/lisinopril) ou BRA (valsartana se intolerância) — especialmente FE < 40%, HAS, DM, DRC.",
        "5) Estatina de alta intensidade (atorvastatina 40–80 mg ou rosuvastatina 20–40 mg) já — meta LDL < 55 mg/dL (ESC); se não atingir, ezetimiba ± inibidor de PCSK9.",
        "Antagonista de aldosterona (espironolactona/eplerenona 25–50 mg) se FE ≤ 40% + IC ou DM, sem hipercalemia (K⁺ < 5,0) nem IRA (EPHESUS).",
        "IBP durante a DAPT se ≥ 1 fator de risco de sangramento GI. NTG SL de resgate + orientação. Reabilitação cardíaca.",
        "Ecocardiograma 2–4 semanas pós-IAM: se FE ≤ 35% persistente após 40 dias + NYHA II–III → avaliar CDI (MADIT-II/SCD-HeFT); FE ≤ 35% + BRE + QRS ≥ 130 → TRC-D.",
      ],
      next: "destino_coronariana",
    },

    destino_coronariana: {
      id: "destino_coronariana",
      type: "transition",
      title: "Unidade Coronariana / UTI",
      summary: "Monitorização pós-reperfusão/revascularização e vigilância de complicações.",
      disposition: "icu",
      exitCriteria: [
        "Internação em unidade coronariana/UTI com monitorização contínua de ECG, PA e SpO₂.",
        "Vigiar complicações: choque cardiogênico (norepi + dobutamina, ICP da culpada), IC aguda (Killip II–IV), FV/TV (desfibrilar + amiodarona), FA nova, BAV total (IAM inferior — marcapasso se sintomático), complicações mecânicas (CIV, IM aguda, ruptura — cirurgia de emergência), pericardite pós-IAM (AAS, evitar AINE/corticoide).",
        "Metas: LDL < 55, PA < 130/80, FC repouso 55–65, glicemia 140–180, K⁺ < 5,0 (se IECA + antialdosterona).",
        "Manter as 5 classes da prevenção secundária; ecocardiograma para função de VE; planejar seguimento.",
      ],
      targets: [],
    },

    nste_baixo_destino: {
      id: "nste_baixo_destino",
      type: "transition",
      title: "Observação / alta com seguimento",
      summary: "Baixo risco com investigação negativa.",
      disposition: "observation",
      exitCriteria: [
        "Troponina seriada negativa + ECG sem alterações isquêmicas + HEART baixo → observação/alta segura.",
        "Programar teste não invasivo de isquemia ou angio-TC de coronárias ambulatorial.",
        "Manter AAS; orientar retorno imediato se recorrência de dor.",
        "Reavaliar e reclassificar a qualquer alteração de ECG, troponina ou instabilidade.",
      ],
      targets: [],
    },
  },
};

/**
 * ── ESTRATÉGIA INVASIVA — FONTE ÚNICA, DONA AQUI ────────────────────────────
 *
 * A tela do HEART dizia "coronariografia precoce" na faixa alta. O HEART foi
 * validado para RISCO DE MACE em 6 semanas e para DISPOSIÇÃO (alta precoce ×
 * observação) — esses desfechos ele tem. A indicação e o TEMPO da estratégia
 * invasiva não saem dele: dependem de supradesnivelamento, instabilidade
 * hemodinâmica ou elétrica, dor refratária e do GRACE, que o HEART não contém.
 */
export const ESTRATEGIA_INVASIVA_NAO_SAI_DO_HEART =
  "⚠️ O HEART estima risco de MACE e apoia a DISPOSIÇÃO — não indica coronariografia nem define o tempo dela. A estratégia invasiva e sua urgência dependem de supradesnivelamento de ST, instabilidade hemodinâmica ou elétrica, dor refratária e da estratificação pelo GRACE, que este escore não contém. Abrir o módulo Síndromes Coronarianas.";
