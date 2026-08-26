import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

/**
 * Fluxo interativo das Síndromes Coronarianas Agudas (SCA) no adulto.
 * Ordem real de atendimento: chegada → gravidade → triagem rápida de
 * dissecção → estabilização/AAS → ECG ≤10 min → interpretação assistida (3
 * grupos funcionais, não um bucket único) → estratégia de reperfusão ou
 * estratificação → tratamento → exames → reavaliação pós-intervenção →
 * escalonamento → destino.
 *
 * Baseado na ACC/AHA/ACEP/NAEMSP/SCAI 2025 Guideline for the Management of
 * Patients With Acute Coronary Syndromes (Circulation, DOI
 * 10.1161/CIR.0000000000001309) — texto completo lido nesta sessão a partir
 * do PDF oficial. Onde a diretriz não cobre um achado (De Winter, Wellens,
 * Sgarbossa), a fonte é declarada como literatura complementar, nunca
 * atribuída à diretriz 2025 por engano. Doses de tenecteplase e enoxaparina
 * calculadas por peso.
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
import { vereditoAas, vereditoBetabloqueador, vereditoNitrato } from "./lib/vereditos-sca";
import { alertaDoEcg, FONTE_ECG_10MIN } from "./lib/ecg-tempo";
import { ENOXAPARINA_APRESENTACAO, ENOXAPARINA_REGIME_IAM } from "./lib/enoxaparina";
import { NITRATO_CONTRAINDICACAO_PDE5, NITRATO_OUTRAS_CONTRAINDICACOES, NITRATO_PDE5_USO_CRONICO } from "./lib/nitrato-contraindicacoes";
import { MORFINA_CONTRAINDICACOES, MORFINA_TETO } from "./lib/morfina-dispneia";
import { NITRATO_MONITORIZACAO, NITRATO_ALERTAS_SCA } from "./lib/nitrato-dose";
import {
  derivarJanelaReperfusao,
  derivarEstadoContraindicacao,
  META_ICP,
  FARMACOINVASIVA_TRANSFERIR,
  FARMACOINVASIVA_RESGATE,
  FARMACOINVASIVA_PRECOCE,
  podeFibrinolisar,
} from "./lib/reperfusao-stemi";
import { BETABLOQUEADOR_IV_SEPARADO, BETABLOQUEADOR_CONTRAINDICACAO } from "./lib/betabloqueador-agudo";
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
import {
  derivarNivelPosPortao,
  DISSECCAO_NIVEL_ROTULO,
  DISSECCAO_CONDUTA,
  DISSECCAO_EQUIPE,
  DISSECCAO_ANTITROMBOTICO,
  DISSECCAO_PERGUNTA_DISPONIBILIDADE,
  DISSECCAO_AGUARDANDO_TEXTO,
  DISSECCAO_EXAME_NAO_POSSIVEL_TEXTO,
  DISSECCAO_PERGUNTA_LAUDO,
  blocoAjudaLaudo,
  derivarResultadoLaudo,
  portaoGrupoA,
  portaoGrupoB,
  PORTAO_AJUDA_GRUPO_A,
  PORTAO_AJUDA_GRUPO_B,
  derivarPortaoGrupoA,
  derivarPortaoGrupoB,
} from "./lib/dissecao-triagem";
import {
  blocoConscienciaViaAerea,
  blocoRespiracao,
  blocoCirculacao,
  blocoRitmo,
  blocoIsquemiaEapPulso,
  avaliarAmeacaImediata,
  derivarCorrelacaoBre,
} from "./lib/instabilidade-coronariana";
import {
  LBBB_NAO_EQUIVALENTE_ISOLADO,
  LBBB_CITACAO_LITERAL_2025,
  SGARBOSSA_AUSENTE_NA_FONTE_2025,
  LBBB_SGARBOSSA_APOIO,
  LBBB_CORRELACAO_ATIVA,
  LBBB_ISOLADO_SEM_CORRELACAO,
} from "./lib/lbbb-sgarbossa";

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
    // ⚠️ HNF PERI-ICP (correção final 2026-08-25, auditoria item I8) — regime
    // DIFERENTE do HNF de `stemi_meds`/`nste_meds` (esse é bolus único
    // titulado por TCA na sala, sem infusão contínua nem teto fixo — por
    // isso não reaproveita `hnfBolus`/`hnfInf`, que são de outro protocolo).
    out.hnfIcpSemGpMin = round0(70 * peso);
    out.hnfIcpSemGpMax = round0(100 * peso);
    out.hnfIcpComGpMin = round0(50 * peso);
    out.hnfIcpComGpMax = round0(70 * peso);
  } else {
    out.enoxaPorPeso = "1 mg/kg";
    out.enoxa = "1 mg/kg (máx 100 mg nas 2 primeiras)";
    out.enoxa75PorPeso = "0,75 mg/kg";
    out.enoxa75 = "0,75 mg/kg (máx 75 mg nas 2 primeiras)";
    out.hnfBolus = "60 U/kg (máx 4000)";
    out.hnfInf = "12 U/kg/h (máx 1000)";
    out.tnk = "ajustada ao peso";
    out.tnkHalf = "metade da dose";
    out.hnfIcpSemGpMin = "70×peso";
    out.hnfIcpSemGpMax = "100×peso";
    out.hnfIcpComGpMin = "50×peso";
    out.hnfIcpComGpMax = "70×peso";
  }
  // ⚠️ NOMEIA A AMEAÇA (ajuste pedido, 2026-08-24): a tela de estabilização
  // não pode rotular tudo como "instabilidade hemodinâmica" — SpO₂ baixa é
  // ameaça RESPIRATÓRIA, pulso filiforme+hipoperfusão é outra coisa. Mesma
  // função de `avaliarAmeacaImediata` usada no roteamento, aqui só para o
  // texto — nenhum critério novo, nenhuma duplicação de lógica.
  const ameaca = avaliarAmeacaImediata(values);
  out.ameacaEncontrada = ameaca
    ? ameaca.rotulo
    : values.estabilidade_avaliada === "instavel"
      ? "reconhecida diretamente pelo avaliador, sem achados guiados registrados"
      : "achados coletados nos blocos de avaliação";

  // ⚠️ TOKENS DA INVESTIGAÇÃO DE SÍNDROME AÓRTICA AGUDA (correção final
  // 2026-08-25) — o nível já não vem de perguntar de novo (ver
  // `lib/dissecao-triagem.ts`): deriva direto dos campos que o Portão já
  // coletou. Só é lido quando `disseccao_investigacao` é de fato alcançado
  // (sempre via Portão, que já garantiu que a investigação deveria abrir).
  const nivelDisseccao = derivarNivelPosPortao(values);
  out.disseccaoNivel = DISSECCAO_NIVEL_ROTULO[nivelDisseccao];
  out.disseccaoConduta = DISSECCAO_CONDUTA[nivelDisseccao];
  out.disseccaoEquipe = DISSECCAO_EQUIPE[nivelDisseccao];
  out.disseccaoAntitrombotico = DISSECCAO_ANTITROMBOTICO[nivelDisseccao];

  // ⚠️ REPERFUSÃO — janela e contraindicação como ESTADO DERIVADO, não como
  // texto que o médico deveria ter lido. Ver lib/reperfusao-stemi.ts.
  out.janelaReperfusao = derivarJanelaReperfusao(values);
  out.estadoContraindicacao = derivarEstadoContraindicacao(values);
  out.metaIcp = values.cenarioIcp === "no_local" ? META_ICP.no_local : META_ICP.transferencia;
  // ⚠️ DERIVADO, NÃO GRAVADO POR OPÇÃO — a mesma função que é o oráculo das
  // pré-condições da fibrinólise diz se ela de fato aconteceu. Só é
  // verdadeira quando TODAS foram satisfeitas, inclusive o peso (que só é
  // coletado no nó de dose do próprio ramo). Isso mantém uma definição só de
  // "houve fibrinólise" — a mesma que a trava de caminhos usa.
  out.estrategiaFibrinolise = podeFibrinolisar(values) ? "sim" : "";

  // ⚠️ CONTEXTO DE BRE (correção final 2026-08-25) — só usado quando
  // `lbbb_correlacao` consegue derivar sem perguntar de novo; texto some
  // (string vazia) quando o dado não existe e a tela de fallback pergunta.
  const correlacaoBre = derivarCorrelacaoBre(values);
  out.lbbbCorrelacaoContexto =
    correlacaoBre === "ativa"
      ? "Já sabemos, deste caso: há dor isquêmica ativa e/ou instabilidade — segue para reperfusão."
      : correlacaoBre === "isolado"
        ? "Já sabemos, deste caso: sem dor isquêmica ativa nem instabilidade — BRE fica isolado."
        : "";

  return out;
}

/**
 * DEPOIS DE CADA BLOCO — não só do último (ajuste pedido, 2026-08-24: "assim
 * que houver informação suficiente para identificar uma ameaça imediata,
 * parar a coleta restante"). `avaliarAmeacaImediata` já classifica E já diz
 * para onde ir (`destino`); esta função só traduz o destino em id de nó.
 *
 * ⚠️ BLOCO 2 (2026-08-24) — "pulso ausente → PCR; arritmia instável → ramo
 * correspondente; choque → ramo de choque; via aérea ameaçada → via aérea;
 * insuficiência respiratória grave → suporte respiratório". Mesmo padrão já
 * usado em `ira-decision-tree.ts` (abcde_a/b/c) e `acls-bradycardia-tree.ts`
 * (`bradi_sem_pulso`): nós de transição apontando para o módulo dedicado.
 * Só o que é ESPECÍFICO deste módulo (dor isquêmica atual, edema pulmonar
 * cardiogênico) fica em `estabilizacao_ramo`, dentro do próprio fluxo.
 */
const DESTINO_PARA_NO: Record<Exclude<ReturnType<typeof avaliarAmeacaImediata>, null>["destino"], string> = {
  pcr: "coronariana_pcr_pulso_ausente",
  via_aerea: "coronariana_via_aerea_ameacada",
  respiratorio: "coronariana_suporte_respiratorio",
  choque: "coronariana_choque",
  arritmia_bradi: "coronariana_arritmia_bradi",
  arritmia_taqui: "coronariana_arritmia_taqui",
  estabilizacao_ramo: "estabilizacao_ramo",
  isquemia_em_curso: "coronariana_isquemia_em_curso",
};

/** Todos os destinos possíveis de uma ameaça — usado em `possiveis` dos 5 blocos. */
const DESTINOS_AMEACA_POSSIVEIS = Object.values(DESTINO_PARA_NO);

function destinoAposBloco(values: TreeValues, proximoBloco: string): string {
  const ameaca = avaliarAmeacaImediata(values);
  return ameaca ? DESTINO_PARA_NO[ameaca.destino] : proximoBloco;
}

/**
 * ⚠️ GRACE — POR QUE A APP NÃO CALCULA O ESCORE, SÓ A CATEGORIA A PARTIR DELE.
 *
 * Reproduzir o escore ponderado do GRACE 2.0 (idade, FC, PAS, creatinina,
 * Killip, PCR na admissão, desvio de ST, troponina → pontos) exigiria os
 * coeficientes exatos do nomograma, que não foram confirmados em fonte nesta
 * sessão. Codificar de memória violaria a regra do próprio pedido: "se a
 * diretriz não suportar... não codificar como automática".
 *
 * O que É seguro derivar: a categoria a partir do NÚMERO do escore, porque os
 * limiares (> 140 alto · 109–140 intermediário · < 109 baixo) já eram texto
 * sourced neste módulo antes desta mudança — só estavam em `evidence`, não
 * automatizados. Quem já tem o GRACE calculado (própria calculadora do app ou
 * outra) não precisa reclassificar manualmente a categoria.
 */
function categoriaPorGrace(score: number): string {
  if (score > 140) return "nste_invasiva_precoce";
  if (score >= 109) return "nste_invasiva_precoce";
  return "nste_seletiva";
}

/**
 * MUITO ALTO RISCO — critérios BOOLEANOS já sourced no módulo (não dependem
 * do escore numérico). Qualquer um presente deriva "invasiva imediata < 2h"
 * sem perguntar a categoria pronta.
 */
function derivaRiscoImediato(values: TreeValues): string {
  const achados = [
    values.grace_instabilidade,
    values.grace_dor_refrataria,
    values.grace_arritmia,
    values.grace_complicacao_mecanica,
    values.grace_ic_aguda,
    values.grace_st_dinamico,
  ];
  return achados.some((v) => v === "sim") ? "nste_invasiva_imediata" : "nste_risco";
}

export const coronaryDecisionTree: DecisionTreeDefinition = {
  id: "sca_acs_2025",
  version: "2025.1",
  label: "Síndromes Coronarianas",
  entryNodeId: "atalhos_coronarianas",
  derive: deriveCoronary,
  /**
   * `fmc_min` = há quantos minutos foi o primeiro contato médico. O motor
   * ancora `__marco_primeiroContatoMedico` em (agora − fmc_min), e não em
   * "agora": é o mesmo motivo de crises convulsivas e pré-eclâmpsia — contar da
   * tela responde "há quanto tempo o app está aberto".
   *
   * Declarar aqui, e não num `if` do runtime, também faz a âncora sobreviver a
   * sair e voltar do módulo: `exportarMarcos`/`restaurarMarcos` já tratam
   * qualquer `__marco_*`, e o replay da retomada não a desloca.
   */
  marcos: { fmc_min: "primeiroContatoMedico" },
  alertaPersistente: alertaDoEcg,
  nodes: {
    // ── 0. Atalhos internos (Etapa 6) ─────────────────────────────────────────
    //
    // ⚠️ NENHUM ATALHO INVENTA ESTADO CLÍNICO. Cada um pede só o dado mínimo
    // que ainda falta para o destino escolhido — nunca pula a triagem de
    // dissecção quando a AAS ainda não foi liberada por este fluxo.
    atalhos_coronarianas: {
      id: "atalhos_coronarianas",
      type: "decision",
      title: "Síndromes Coronarianas",
      question: "Por onde você quer começar?",
      summary: "O fluxo completo é o padrão. Os atalhos pulam etapas já feitas — nenhum deles inventa dado que falta.",
      // ⚠️ TODO ATALHO AGUDO PASSA POR `ecg_tempo` (2026-08-26). Antes, três
      // destes cinco caminhos pulavam o `entry` inteiro — e o lembrete do ECG
      // morava numa linha do `entry`. Por "Já tenho o ECG na mão", "STEMI já
      // confirmado" e "Só preciso das doses" o lembrete não existia.
      //
      // É o mesmo beco que deixou o PDE-5 escapar, agora no dado mais sensível
      // ao tempo do módulo. A correção não é repetir o texto em cinco lugares:
      // é fazer os cinco caminhos atravessarem o mesmo nó, e provar por
      // dominância que não sobrou desvio.
      options: [
        {
          id: "completo",
          label: "Fluxo completo — dor torácica agora",
          next: "ecg_tempo",
          grava: { campo: "atalho_escolhido", valor: "completo" },
        },
        {
          id: "ecg_pronto",
          label: "Já tenho o ECG na mão, ainda não liberei AAS",
          next: "ecg_tempo",
          // ⚠️ DÍVIDA DECLARADA: quem entra por aqui JÁ DISSE que o traçado
          // existe, e ainda assim a tela seguinte pergunta "o ECG já foi
          // realizado?". `grava` leva UM campo por opção, então não dá para
          // gravar `atalho_escolhido` e `ecg_realizado` na mesma escolha — e
          // derivar `ecg_realizado` colidiria com o campo de entrada de mesmo
          // nome. O conserto certo é o mecanismo de "campo já respondido não
          // volta como pergunta", que é a rodada de padronização; até lá, é um
          // toque a mais num caminho, e não um dado inventado.
          grava: { campo: "atalho_escolhido", valor: "ecg_pronto" },
        },
        {
          id: "reperfusao",
          label: "STEMI já confirmado — ir direto para reperfusão",
          next: "ecg_tempo",
          grava: { campo: "atalho_escolhido", valor: "reperfusao" },
        },
        {
          id: "antitromboticos",
          label: "Só preciso das doses/antitrombóticos",
          next: "ecg_tempo",
          grava: { campo: "atalho_escolhido", valor: "antitromboticos" },
        },
        {
          // ⚠️ ÚNICA SAÍDA QUE NÃO PASSA PELO TEMPO DO ECG, e a exceção é
          // declarada de propósito: a meta de ≤10 min conta do primeiro contato
          // na SUSPEITA de SCA. Quem vem tratar complicação de um infarto já
          // estabelecido não tem esse relógio correndo — cobrar o ECG inicial
          // ali seria a tela burocrática que esta rodada existe para evitar.
          // `test:ecg-tempo` conhece esta exceção pelo nome; se alguém criar
          // uma segunda, a trava reprova.
          id: "complicacoes",
          label: "Complicações pós-IAM",
          next: "destino_coronariana",
          grava: { campo: "atalho_escolhido", valor: "complicacoes" },
        },
      ],
    },

    // ── 0b. O RELÓGIO DO ECG ────────────────────────────────────────────────
    //
    // ECG de 12 derivações obtido E INTERPRETADO em até 10 min do primeiro
    // contato médico (ACC/AHA 2025). Ver `lib/ecg-tempo.ts` para o porquê de
    // cada decisão desta tela.
    //
    // ⚠️ NADA AQUI É OBRIGATÓRIO ALÉM DE UM TOQUE. Só `ecg_realizado` bloqueia
    // o "continuar", e ele é uma pergunta binária — é o "registrar" do ciclo
    // lembrar → registrar → medir. Os dois tempos são OPCIONAIS: quem está no
    // meio de uma emergência segue sem responder, e o app assume "não medido"
    // em vez de inventar zero.
    //
    // ⚠️ E ELA NÃO SEGURA A ESTABILIZAÇÃO. Paciente instável passa por aqui com
    // um toque e vai para o `entry`, onde a avaliação de gravidade acontece. A
    // faixa de aviso continua cobrando o ECG pelo resto do atendimento — que é
    // o comportamento certo: lembrar sem impedir.
    ecg_tempo: {
      id: "ecg_tempo",
      type: "input",
      title: "ECG de 12 derivações",
      summary: FONTE_ECG_10MIN,
      intro:
        "Meta: obter E INTERPRETAR em até 10 min do primeiro contato médico. Um ECG feito no prazo e lido depois não cumpriu a meta — o que muda a conduta é a leitura.",
      fields: [
        {
          id: "ecg_realizado",
          label: "O ECG de 12 derivações já foi realizado?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Ainda não" },
          ],
        },
        {
          // ⚠️ A ÂNCORA DE TODO O RESTO. Declarada em `marcos` acima: o motor
          // fixa o marco em (agora − este valor). Opcional de propósito —
          // sem ela o app diz "pendente" e NÃO afirma atraso, em vez de contar
          // da abertura da tela e mostrar zero para todo mundo.
          id: "fmc_min",
          label: "Há quantos minutos foi o primeiro contato médico?",
          unit: "min",
          optional: true,
          allowCustom: true,
          customLabel: "Outro",
          customKeyboard: "numeric",
          presets: [
            { value: "0", label: "Agora" },
            { value: "5", label: "~5 min" },
            { value: "10", label: "~10 min" },
            { value: "20", label: "~20 min" },
            { value: "40", label: "~40 min" },
            { value: "60", label: "1 h ou mais" },
          ],
        },
        {
          // O segundo tempo. Com os dois, o intervalo FMC→ECG sai por
          // subtração; com um só, `estadoDoEcg` devolve "feito_sem_medida" —
          // ausência declarada, nunca zero.
          id: "ecg_ha_min",
          label: "Se já foi feito: há quantos minutos ficou pronto e foi lido?",
          unit: "min",
          optional: true,
          allowCustom: true,
          customLabel: "Outro",
          customKeyboard: "numeric",
          presets: [
            { value: "0", label: "Agora" },
            { value: "5", label: "~5 min" },
            { value: "10", label: "~10 min" },
            { value: "20", label: "~20 min" },
            { value: "40", label: "~40 min" },
          ],
        },
      ],
      // Devolve cada atalho ao destino que ele pediu. `possiveis` lista os
      // destinos reais para a análise estática enxergar o grafo — sem isso, a
      // alcançabilidade quebraria e as travas de rota passariam a medir nada.
      next: {
        possiveis: ["entry", "ecg", "stemi_localizacao", "atalho_antitromboticos_tipo"],
        escolher: (values) => {
          switch (values.atalho_escolhido) {
            case "ecg_pronto":
              return "ecg";
            case "reperfusao":
              return "stemi_localizacao";
            case "antitromboticos":
              return "atalho_antitromboticos_tipo";
            default:
              return "entry";
          }
        },
      },
    },

    atalho_antitromboticos_tipo: {
      id: "atalho_antitromboticos_tipo",
      type: "decision",
      title: "Antitrombóticos — qual quadro?",
      question: "STEMI ou SCA sem supra?",
      summary: "A dose e a combinação dependem de qual foi o diagnóstico — não invento isso por você.",
      options: [
        { id: "stemi", label: "STEMI", next: "stemi_dados" },
        { id: "nste", label: "SCA sem supra", next: "nste_dados" },
      ],
    },

    // ── 1. Reconhecimento e medidas imediatas ─────────────────────────────────
    //
    // ⚠️ TEXTO ENXUTO DE PROPÓSITO (refinamento v3, 2026-08-24): era título
    // longo + frase de justificativa + 5 ações. A justificativa ("tempo é
    // músculo...") não é ação — foi para `porque` (camada secundária). O
    // título ficou só "Suspeita de SCA": o subtítulo repetia o que o
    // cabeçalho do módulo já diz.
    entry: {
      id: "entry",
      type: "action",
      title: "Suspeita de SCA",
      // ⚠️ LISTA VISUAL CURTA (2026-08-24, ajuste do Bloco 1) — pedido
      // explícito: itens escaneáveis, não frases compostas. Mesmo conteúdo
      // clínico de antes, só reparticionado — nada novo, nada removido.
      // "Não atrasar o ECG" saiu da última linha e virou a MENSAGEM ÚNICA
      // (`summary`), em vez de repetida dentro de uma frase.
      summary: "Não atrase o ECG enquanto completa história e exame.",
      actions: [
        "Monitor cardíaco contínuo",
        "PA (bilateral), FC, SpO₂",
        "2 acessos venosos; desfibrilador próximo",
        // ⚠️ "DA CHEGADA" SAIU (2026-08-26). A meta conta do PRIMEIRO CONTATO
    // MÉDICO — as duas coisas só coincidem no pronto-socorro, e no
    // pré-hospitalar ou no paciente já internado que passa a ter dor "chegada"
    // não significa nada. O item continua na lista porque é uma medida inicial;
    // quem cobra o tempo agora é `ecg_tempo` e a faixa persistente, não esta
    // linha perdida entre outras sete.
    // ⚠️ A META SAIU DAQUI, MEDIDA NA TELA (2026-08-26). Com a faixa
    // persistente no topo, "ECG de 12 derivações" passou a aparecer TRÊS vezes
    // no mesmo Passo 3: a faixa, o chip de trilha e este item. Repetir a mesma
    // meta em duas delas não reforça — dilui, e ensina a passar o olho.
    //
    // O item fica porque "repetir se a dor persistir ou mudar" é instrução
    // DIFERENTE, que a faixa não cobre: ela mede o primeiro ECG contra os 10
    // min e some quando ele fica pronto. A cobrança do tempo agora é da faixa e
    // do nó `ecg_tempo`; esta linha voltou a ser o que sempre deveria ter sido —
    // um item da lista de medidas iniciais.
    "ECG de 12 derivações (repetir se a dor persistir ou mudar de caráter)",
        // ⚠️ ALINHADO ACC/AHA 2025 (2026-08-24): se SpO₂ < 90%, O₂ para
        // elevar ≥ 90%; se SpO₂ ≥ 90%, sem uso rotineiro. Sem meta numérica
        // superior fixa — não confirmada em fonte nesta sessão.
        "Se SpO₂ < 90%: O₂ para elevar ≥ 90%. Se SpO₂ ≥ 90%: sem O₂ de rotina",
        "Coletar troponina",
        "Anamnese dirigida e exame",
      ],
      porque: [
        "Tempo é músculo — medidas iniciais e ECG em paralelo, sem atrasar o AAS por exames não indispensáveis.",
      ],
      next: "entrada_paciente",
    },

    // ── TELA 1 · ENTRADA DO PACIENTE ─────────────────────────────────────
    //
    // ⚠️ POR QUE ELA VEM DEPOIS DAS AÇÕES PARALELAS E ANTES DO ABCD, e não
    // como primeira tela do módulo: a regra mestra do app é que a
    // estabilização tem precedência sobre o protocolo. Uma tela de coleta na
    // frente de tudo faria o médico de um paciente em choque escolher idade
    // numa barra antes de o app perguntar sobre pulso. Aqui ela entra depois
    // de `entry` (monitor, ECG, acesso — que já dispararam) e imediatamente
    // antes do bloco de ameaça, que continua sendo quem manda.
    //
    // ⚠️ E POR ISSO TODO CAMPO É `optional` (padrão "dado importante ≠ tela
    // bloqueante"). Nada aqui pode segurar o caminho para o ABCD. O peso é o
    // exemplo do porquê: ele é indispensável para tenecteplase e enoxaparina,
    // mas exigi-lo AGORA atrasaria a avaliação de um paciente que talvez nem
    // chegue à fibrinólise. Ele é COLHIDO cedo e COBRADO tarde — o ramo da
    // fibrinólise tem o seu próprio nó obrigatório, e nenhum caminho alcança a
    // dose sem passar por ele.
    //
    // ⚠️ O QUE ISTO EVITA: reperguntar. Uma vez informados, peso e início dos
    // sintomas não voltam a ser pedidos — o motor lembra, e as telas seguintes
    // derivam a partir daqui.
    entrada_paciente: {
      id: "entrada_paciente",
      type: "input",
      title: "Entrada do paciente",
      intro:
        "Arraste o que souber e marque os sintomas presentes. Nada aqui trava o atendimento — pode seguir e completar depois.",
      fields: [
        {
          id: "idade",
          label: "Idade",
          unit: "anos",
          optional: true,
          customKeyboard: "numeric",
          presets: [{ value: "40", label: "40" }, { value: "55", label: "55" }, { value: "65", label: "65" }, { value: "75", label: "75" }, { value: "85", label: "85" }],
        },
        {
          id: "peso",
          label: "Peso",
          unit: "kg",
          optional: true,
          customKeyboard: "numeric",
          presets: [{ value: "50", label: "50" }, { value: "60", label: "60" }, { value: "70", label: "70" }, { value: "80", label: "80" }, { value: "90", label: "90" }, { value: "100", label: "100" }],
        },
        {
          id: "altura",
          label: "Altura",
          unit: "cm",
          optional: true,
          customKeyboard: "numeric",
          presets: [{ value: "150", label: "150" }, { value: "160", label: "160" }, { value: "170", label: "170" }, { value: "180", label: "180" }, { value: "190", label: "190" }],
        },
        {
          // ⚠️ O MESMO CAMPO QUE O RAMO DA REPERFUSÃO LÊ. Os rótulos são
          // idênticos aos de `tempo`/`estab_bloco5` de propósito: é
          // `derivarJanelaReperfusao` que os interpreta, e um rótulo diferente
          // aqui cairia silenciosamente em "indeterminada".
          id: "tempo_dor",
          label: "Quando os sintomas começaram?",
          optional: true,
          presets: [
            { value: "< 1 h", label: "< 1 h" },
            { value: "1–3 h", label: "1–3 h" },
            { value: "3–6 h", label: "3–6 h" },
            { value: "6–12 h", label: "6–12 h" },
            { value: "12–24 h", label: "12–24 h" },
            { value: "> 24 h", label: "> 24 h" },
            { value: "Indefinido", label: "Indefinido" },
          ],
        },
      ],
      next: "entrada_sintomas",
    },

    // ── TELA 1b · SINTOMAS ───────────────────────────────────────────────
    //
    // ⚠️ SEPARADA DA 1a POR MEDIÇÃO, NÃO POR GOSTO (2026-08-25). Com os cinco
    // campos juntos, o card media 1383 px num viewport de 667 — duas telas e
    // meia de rolagem — e o checklist só começava em y = 940. Numa emergência
    // isso é uma tela-livro: o médico rola procurando onde marcar o quadro do
    // paciente, e o que ele veio fazer fica fora de vista.
    //
    // Dividir custa um toque a mais, e o toque é legítimo pela regra da casa:
    // ele existe porque o usuário FORNECE INFORMAÇÃO nos dois passos.
    entrada_sintomas: {
      id: "entrada_sintomas",
      type: "input",
      // ⚠️ O TÍTULO NÃO REPETE O RÓTULO DO CAMPO. Na validação visual,
      // "Sintomas presentes" aparecia duas vezes seguidas — como título do
      // passo e como rótulo do único campo. Duas linhas para dizer a mesma
      // coisa, num viewport onde cada linha custa.
      title: "Quadro do paciente",
      intro: "Marque todos os que existem. Pode marcar vários.",
      fields: [
        {
          // ⚠️ ESTA PERGUNTA SUBIU PARA CÁ EM 2026-08-26, e o motivo é de
          // segurança: a primeira oferta possível de nitrato é
          // `estabilizacao_ramo`, alcançável já a partir do bloco 1 do ABCDE.
          // Ela estava no passo 10 (`terapia_check`) — ou seja, o app mandava
          // dar nitrato antes de saber isto.
          //
          // ⚠️ E NÃO É OPCIONAL POR DESCUIDO: é opcional porque não pode travar
          // o ABCDE. Mas quem não responder não recebe dose de nitrato — o
          // veredito trata "não perguntado" como impedimento, com motivo
          // explícito e corrigível. Ausência de resposta não é ausência de
          // contraindicação.
          id: "pde5_recente",
          label: "Uso recente de inibidor de PDE-5 (sildenafila, tadalafila)?",
          optional: true,
          presets: [
            { value: "nao", label: "Não" },
            { value: "sim", label: "Sim" },
            { value: "nao_sei", label: "Não sei" },
          ],
        },
        {
          // ⚠️ CHECKLIST, NÃO ESCOLHA ÚNICA. "Dor retroesternal + irradiação
          // para o braço + sudorese + náusea" é UM paciente, não quatro
          // alternativas — obrigar a escolher uma descartaria o resto do
          // quadro logo na entrada.
          id: "sintomas",
          label: "Sintomas presentes",
          optional: true,
          multiplo: true,
          presets: [
            { value: "Dor/pressão retroesternal", label: "Dor/pressão retroesternal" },
            { value: "Irradiação braço esquerdo", label: "Irradiação braço esquerdo" },
            { value: "Irradiação ambos os braços", label: "Irradiação ambos os braços" },
            { value: "Irradiação mandíbula", label: "Irradiação mandíbula" },
            { value: "Irradiação cervical", label: "Irradiação cervical" },
            { value: "Irradiação dorso/escápula", label: "Irradiação dorso/escápula" },
            { value: "Dispneia", label: "Dispneia" },
            { value: "Sudorese", label: "Sudorese" },
            { value: "Náuseas/vômitos", label: "Náuseas/vômitos" },
            { value: "Síncope/pré-síncope", label: "Síncope/pré-síncope" },
            { value: "Palpitação", label: "Palpitação" },
            { value: "Epigastralgia", label: "Epigastralgia" },
            { value: "Apresentação atípica", label: "Apresentação atípica" },
          ],
        },
      ],
      next: "avaliar_estabilidade",
    },


    // ── 1a. Estabilidade — achados observáveis são o CAMINHO PADRÃO
    // (correção de 2026-08-24, depois da validação física no celular). A
    // versão anterior oferecia "Sim/Não/Não sei" com peso igual — o
    // julgamento direto continuava sendo o primeiro botão, então quem não
    // sabia reconhecer instabilidade tinha que ADMITIR a dúvida antes de
    // chegar à descoberta guiada. Agora a ordem inverte: a primeira opção é
    // avaliar por achados; "já reconheço" é o atalho do experiente, não o
    // padrão.
    avaliar_estabilidade: {
      id: "avaliar_estabilidade",
      type: "decision",
      title: "Avaliação inicial · Estabilidade",
      question: "Avalie a estabilidade do paciente",
      summary: "Hipotensão, rebaixamento, choque ou IC aguda mudam a ordem: estabilizar antes de seguir a via de SCA.",
      options: [
        { id: "guiado", label: "Avaliar por achados observáveis", next: "estab_bloco1" },
        {
          id: "instavel",
          label: "Já reconheço — instável",
          next: "estabilizacao_ramo",
          grava: { campo: "estabilidade_avaliada", valor: "instavel" },
        },
        {
          id: "estavel",
          label: "Já reconheço — estável",
          next: "ecg",
          grava: { campo: "estabilidade_avaliada", valor: "estavel" },
        },
      ],
    },

    // ── 5 blocos clínicos, não 10 perguntas de uma vez (pedido explícito).
    // Cada bloco é um passo próprio — pequeno o bastante para caber sem
    // rolar em 375×667. Ver lib/instabilidade-coronariana.ts para a razão de
    // ser um arquivo próprio (zero risco aos outros 8 módulos que consomem
    // lib/instabilidade-guiada.ts).
    // ⚠️ EARLY EXIT DEPOIS DE CADA BLOCO (2026-08-24, ajuste pedido): não é
    // mais "qualquer achado isolado" — só uma ameaça `suficiente_para_
    // instabilidade` (ver lib/instabilidade-coronariana.ts) interrompe a
    // coleta dos blocos restantes. Ritmo irregular ou FC isolada NÃO
    // disparam; associados a outro sinal objetivo, disparam (achado
    // composto, avaliado em `avaliarAmeacaImediata`).
    estab_bloco1: {
      id: "estab_bloco1",
      type: "input",
      title: "Avaliação inicial · Consciência e via aérea",
      fields: blocoConscienciaViaAerea(),
      next: {
        possiveis: [...DESTINOS_AMEACA_POSSIVEIS, "estab_bloco2"],
        escolher: (values) => destinoAposBloco(values, "estab_bloco2"),
      },
    },
    estab_bloco2: {
      id: "estab_bloco2",
      type: "input",
      title: "Avaliação inicial · Respiração",
      fields: blocoRespiracao(),
      next: {
        possiveis: [...DESTINOS_AMEACA_POSSIVEIS, "estab_bloco3"],
        escolher: (values) => destinoAposBloco(values, "estab_bloco3"),
      },
    },
    estab_bloco3: {
      id: "estab_bloco3",
      type: "input",
      title: "Avaliação inicial · Circulação",
      fields: blocoCirculacao(),
      next: {
        possiveis: [...DESTINOS_AMEACA_POSSIVEIS, "estab_bloco4"],
        escolher: (values) => destinoAposBloco(values, "estab_bloco4"),
      },
    },
    estab_bloco4: {
      id: "estab_bloco4",
      type: "input",
      title: "Avaliação inicial · Ritmo",
      fields: blocoRitmo(),
      next: {
        possiveis: [...DESTINOS_AMEACA_POSSIVEIS, "estab_bloco5"],
        escolher: (values) => destinoAposBloco(values, "estab_bloco5"),
      },
    },
    estab_bloco5: {
      id: "estab_bloco5",
      type: "input",
      title: "Avaliação inicial · Isquemia, EAP e pulso",
      fields: blocoIsquemiaEapPulso(),
      // ⚠️ ÚLTIMO BLOCO — mesma função, mesmo critério de `destinoAposBloco`.
      // Se nada foi encontrado em nenhum dos 5 blocos, o resultado aqui é
      // "estável" (triagem_disseccao), sem repetir a pergunta "é instável?".
      next: {
        possiveis: [...DESTINOS_AMEACA_POSSIVEIS, "ecg"],
        escolher: (values) => destinoAposBloco(values, "ecg"),
      },
    },

    // ⚠️ PULSO CENTRAL AUSENTE NÃO É "GRAVIDADE DE SCA" — É PCR (ajuste
    // pedido, 2026-08-24: "ausência de pulso central → saída imediata para
    // PCR/ACLS, não para o ramo genérico de estabilização"). Mesmo padrão já
    // usado em `acls-bradycardia-tree.ts` (`bradi_sem_pulso`): transição com
    // `targets` apontando para o módulo dedicado de PCR.
    coronariana_pcr_pulso_ausente: {
      id: "coronariana_pcr_pulso_ausente",
      type: "transition",
      title: "Pulso central ausente — isto é PCR",
      summary: "Iniciar RCP imediatamente. A via de SCA aguarda até a parada ser revertida.",
      disposition: "icu",
      exitCriteria: [
        "Iniciar compressões AGORA — pulso central ausente é parada cardiorrespiratória, não é achado de gravidade da SCA.",
        "Seguir o algoritmo de PCR (ritmo chocável × não chocável) no módulo dedicado.",
        "Retomar a via de síndrome coronariana assim que a circulação espontânea retornar.",
      ],
      targets: [
        { moduleId: "pcr-adulto", label: "Abrir guia de PCR", reason: "Paciente sem pulso central — seguir o algoritmo de parada." },
      ],
    },

    // ⚠️ BLOCO 2 (2026-08-24) — QUATRO NOVOS RAMOS DE TRANSIÇÃO, mesmo padrão
    // de `coronariana_pcr_pulso_ausente` acima e de `ira-decision-tree.ts`
    // (abcde_a/b/c): via aérea, respiratório e choque/arritmia têm módulo
    // PRÓPRIO e mais completo do que um resumo aqui poderia oferecer — a via
    // de SCA fica esperando, com instrução explícita de retomar depois.
    coronariana_via_aerea_ameacada: {
      id: "coronariana_via_aerea_ameacada",
      type: "transition",
      title: "Via aérea ameaçada",
      summary: "Proteger a via aérea agora — a via de SCA aguarda.",
      disposition: "other_module",
      exitCriteria: [
        "Via aérea protegida ou o plano de proteção em curso.",
        "Volte a este módulo depois — a via de SCA continua esperando.",
      ],
      targets: [
        {
          moduleId: "isr-rapida",
          label: "Via aérea / intubação em sequência rápida",
          reason: "Via aérea não livre, ou piora aguda e importante da consciência (risco de perda de proteção de via aérea).",
        },
      ],
    },

    coronariana_suporte_respiratorio: {
      id: "coronariana_suporte_respiratorio",
      type: "transition",
      title: "Insuficiência respiratória grave",
      summary: "Suporte respiratório agora — a via de SCA aguarda.",
      disposition: "other_module",
      exitCriteria: [
        "Oxigenação/ventilação sustentadas.",
        "Volte a este módulo depois.",
      ],
      targets: [
        {
          moduleId: "insuficiencia-respiratoria",
          label: "Insuficiência respiratória",
          reason: "SpO₂ < 90% ou esforço respiratório importante (musculatura acessória / frases incompletas).",
        },
      ],
    },

    coronariana_choque: {
      id: "coronariana_choque",
      type: "transition",
      title: "Choque",
      summary: "Definir o tipo de choque e tratar — a via de SCA aguarda.",
      disposition: "other_module",
      exitCriteria: [
        "Perfusão e pressão sustentadas, com a causa em investigação.",
        "Volte a este módulo depois.",
      ],
      targets: [
        {
          moduleId: "choque",
          label: "Choque",
          reason: "PAS < 90 mmHg, ou pulso filiforme/ritmo irregular associado a sinais objetivos de hipoperfusão.",
        },
      ],
    },

    // ⚠️ ARRITMIA — DOIS NÓS, NÃO UM (bradicardia × taquicardia têm módulo
    // PRÓPRIO cada um no app; o ramo é escolhido pela FC já coletada no
    // bloco 4, limiar padrão de manual — < 60 bradicardia, ≥ 100 taquicardia
    // — não um número de guideline específico).
    coronariana_arritmia_bradi: {
      id: "coronariana_arritmia_bradi",
      type: "transition",
      title: "Arritmia instável — frequência baixa",
      summary: "Tratar a arritmia — a via de SCA aguarda.",
      disposition: "other_module",
      exitCriteria: [
        "Frequência e perfusão estabilizadas.",
        "Volte a este módulo depois.",
      ],
      targets: [
        // ⚠️ O MOTIVO VEM DO CASO, NÃO DE UM TEXTO FIXO (correção 2026-08-25,
        // achada pelo autor no celular). A frase anterior dizia "Ritmo
        // irregular + FC baixa + hipoperfusão" SEMPRE — inclusive para quem
        // havia informado ritmo REGULAR, e inclusive quando o gatilho não
        // olhou o ritmo. O app dava um motivo que não era o motivo, e isso
        // destrói a confiança no "porquê" que o app inteiro promete.
        { moduleId: "bradicardia-acls", label: "Bradicardia", reason: "{ameacaEncontrada}." },
      ],
    },

    coronariana_arritmia_taqui: {
      id: "coronariana_arritmia_taqui",
      type: "transition",
      title: "Arritmia instável — frequência alta",
      summary: "Tratar a arritmia — a via de SCA aguarda.",
      disposition: "other_module",
      exitCriteria: [
        "Frequência e perfusão estabilizadas.",
        "Volte a este módulo depois.",
      ],
      targets: [
        // ⚠️ Mesma correção do ramo de bradicardia — ver acima.
        { moduleId: "taquicardia-acls", label: "Taquicardia", reason: "{ameacaEncontrada}." },
      ],
    },

    // ⚠️ ESCOPO REDUZIDO (Bloco 2, 2026-08-24): antes cobria via aérea +
    // respiração + circulação genéricas — agora essas três têm ramo PRÓPRIO
    // acima, e dor isquêmica atual tem o SEU PRÓPRIO ramo abaixo
    // (`coronariana_isquemia_em_curso` — NÃO é ameaça fisiológica). Só edema
    // pulmonar COM repercussão real fica aqui: é o único achado deste bloco
    // que É de fato uma ameaça a estabilizar antes de seguir.
    estabilizacao_ramo: {
      id: "estabilizacao_ramo",
      type: "action",
      title: "Estabilizar antes de seguir",
      summary: "Ameaça identificada: {ameacaEncontrada}. Ação agora — a via de SCA continua assim que o paciente estiver estabilizado.",
      actions: [
        "Suporte ventilatório conforme necessidade (O₂, VNI se disponível e tolerado).",
        NITRATO_MONITORIZACAO,
        "Diurético IV conforme o protocolo do serviço — este app não fixa dose de furosemida nesta tela; ver módulo de Edema Agudo de Pulmão para o protocolo completo de diurético e resistência.",
        "Reavaliar a cada poucos minutos — só prosseguir para o portão de dissecção quando estabilizado.",
      ],
      // ⚠️ A DOSE SAIU DAQUI E FOI PARA O VEREDITO (2026-08-26, achado do
      // autor no celular): este nó imprimia dose de nitrato sem checagem, e é
      // alcançado ANTES da tela que perguntava as contraindicações. O app
      // mandava administrar e só depois perguntava se podia.
      vereditos: [{ id: "nitrato", avaliar: vereditoNitrato }],
      porque: [
        NITRATO_ALERTAS_SCA,
        "Edema pulmonar cardiogênico com repercussão real fica neste módulo porque é o próprio assunto da via de SCA — via aérea, respiratório, choque e arritmia têm módulo dedicado, mais completo do que um resumo aqui poderia oferecer. O protocolo COMPLETO de diurético (incluindo resistência) mora no módulo de Edema Agudo de Pulmão, que já cobre isso com mais profundidade do que caberia repetir aqui.",
        NITRATO_CONTRAINDICACAO_PDE5,
        NITRATO_OUTRAS_CONTRAINDICACOES,
      ],
      next: "ecg",
    },

    // ⚠️ NOVO (Bloco 2, correção 2026-08-24) — dor isquêmica atual, SOZINHA,
    // NÃO é ameaça fisiológica: o paciente pode estar hemodinamicamente
    // estável e só manter isquemia ativa. Chamar isso de "estabilizar antes
    // de seguir" é conceitualmente errado — a conduta certa é ACELERAR a via
    // coronariana, não tratar como se precisasse conter algo antes de
    // avançar. Nenhum tratamento foi administrado/confirmado antes deste
    // nó — por isso a ação é no PRESENTE ("iniciar"), nunca "reavaliar/
    // otimizar" (isso pressuporia uma terapia que ainda não existe).
    coronariana_isquemia_em_curso: {
      id: "coronariana_isquemia_em_curso",
      type: "action",
      title: "Isquemia em curso — acelerar a via coronariana",
      summary: "Ameaça identificada: {ameacaEncontrada}. Não é instabilidade — é isquemia ativa, e a prioridade é chegar ao ECG/classificação.",
      actions: [
        "Manter monitorização.",
        "Seguir imediatamente para ECG/classificação.",
        MORFINA_TETO,
        "Acelerar a estratégia de reperfusão/invasiva assim que o padrão de ECG for reconhecido.",
      ],
      // ⚠️ A DOSE SAIU DAQUI E FOI PARA O VEREDITO (2026-08-26, achado do
      // autor no celular): este nó imprimia dose de nitrato sem checagem, e é
      // alcançado ANTES da tela que perguntava as contraindicações. O app
      // mandava administrar e só depois perguntava se podia.
      vereditos: [{ id: "nitrato", avaliar: vereditoNitrato }],
      porque: [NITRATO_ALERTAS_SCA, NITRATO_CONTRAINDICACAO_PDE5, NITRATO_OUTRAS_CONTRAINDICACOES, MORFINA_CONTRAINDICACOES],
      next: "ecg",
    },

    // ── 1a. PORTÃO DE ENTRADA — trava de exceção (correção final 2026-08-25) ─
    // ⚠️ Substituiu a entrada direta na triagem de dissecção. A maioria dos
    // pacientes com SCA nunca vê os 3 blocos abaixo — só quem passa por este
    // portão. Ver lib/dissecao-triagem.ts para o porquê de cada regra.
    portao_grupo_a: {
      id: "portao_grupo_a",
      type: "input",
      title: "Triagem · Ameaça aórtica",
      // ⚠️ TEXTO LITERAL, NÃO TEMPLATE STRING — a varredura de tradução
      // (`scripts/varredura-pt.cjs`) só reconhece string literal estático;
      // interpolar `PORTAO_AVISO` aqui deixaria o aviso permanentemente em
      // português, mesmo no app em espanhol.
      intro:
        "Há algum destes achados de exame muito específicos, associados ao quadro agudo?\n\nPortão de segurança/navegação do módulo de SCA; não substitui ADD-RS nem avaliação clínica formal de síndrome aórtica aguda.",
      fields: portaoGrupoA(),
      next: {
        possiveis: ["disseccao_investigacao", "portao_ajuda_grupo_a", "portao_grupo_b"],
        escolher: (values) => {
          const r = derivarPortaoGrupoA(values);
          if (r === "abre") return "disseccao_investigacao";
          if (r === "ajuda") return "portao_ajuda_grupo_a";
          return "portao_grupo_b";
        },
      },
    },

    // ⚠️ "NÃO SEI" NUNCA VIRA "SIM" SOZINHO — esta tela existe para tentar
    // resolver a dúvida com critério mais objetivo antes de decidir. Se
    // continuar incerta mesmo assim, NÃO abre (mas o valor gravado marca
    // "desconhecido", não "afastado" — a diferença importa se alguém revisar
    // o caso depois).
    portao_ajuda_grupo_a: {
      id: "portao_ajuda_grupo_a",
      type: "decision",
      title: "Esclarecendo o achado",
      question: "Com um critério mais objetivo, algum desses achados se confirma?",
      evidence: [PORTAO_AJUDA_GRUPO_A],
      options: [
        { id: "confirma", label: "Sim, confirma", next: "disseccao_investigacao", grava: { campo: "portao_ajuda_a", valor: "confirmado" } },
        { id: "afasta", label: "Não", next: "portao_grupo_b", grava: { campo: "portao_ajuda_a", valor: "afastado" } },
        { id: "incerto", label: "Continua incerto", next: "portao_grupo_b", grava: { campo: "portao_ajuda_a", valor: "desconhecido" } },
      ],
    },

    // ⚠️ 1 DOMÍNIO SOZINHO NÃO ABRE — só a combinação de ≥2 domínios
    // independentes (mesmo os 5 itens de predisposição juntos contam como 1
    // domínio só, nunca multiplicam).
    portao_grupo_b: {
      id: "portao_grupo_b",
      type: "input",
      title: "Triagem · Ameaça aórtica (combinação)",
      intro: "Nenhum destes, sozinho, abre a investigação — só a combinação de 2 ou mais domínios independentes.",
      fields: portaoGrupoB(),
      next: {
        possiveis: ["disseccao_investigacao", "portao_ajuda_grupo_b", "aas_check"],
        escolher: (values) => {
          const r = derivarPortaoGrupoB(values);
          if (r === "abre") return "disseccao_investigacao";
          if (r === "ajuda") return "portao_ajuda_grupo_b";
          return "aas_check";
        },
      },
    },

    portao_ajuda_grupo_b: {
      id: "portao_ajuda_grupo_b",
      type: "decision",
      title: "Esclarecendo os achados",
      question: "Com critério mais objetivo, os achados em dúvida somam 2 domínios independentes?",
      evidence: [PORTAO_AJUDA_GRUPO_B],
      options: [
        { id: "confirma", label: "Sim, somam 2 ou mais", next: "disseccao_investigacao", grava: { campo: "portao_ajuda_b", valor: "confirmado" } },
        { id: "afasta", label: "Não", next: "aas_check", grava: { campo: "portao_ajuda_b", valor: "afastado" } },
        { id: "incerto", label: "Continua incerto", next: "aas_check", grava: { campo: "portao_ajuda_b", valor: "desconhecido" } },
      ],
    },

    // ⚠️ O PORTÃO BLOQUEIA O ANTITROMBÓTICO, NÃO O ECG (decisão do autor,
    // 2026-08-25). Antes, `portao_grupo_a` ficava entre as ameaças e o ECG —
    // o traçado ficava atrás de 2 a 4 telas de dissecção. Agora o portão é
    // atravessado JÁ DENTRO do ramo de tratamento, imediatamente antes da
    // primeira dose de antitrombótico, e devolve o usuário ao ponto exato de
    // onde veio. O ECG (e, no STEMI, o acionamento da reperfusão) acontece
    // antes e sem depender dele — que é o que ocorre na sala: ninguém
    // segura o ECG esperando descartar dissecção, mas ninguém dá AAS sem
    // ter pensado nela.
    // ── TELA 2c(i) · CONTRAINDICAÇÕES DO AAS ─────────────────────────────
    //
    // ⚠️ ISTO NÃO ATRASA O AAS — DESAMBIGUA. Antes, a ação dizia "AAS 300 mg
    // agora, SALVO alergia/sangramento ativo": a regra estava impressa e a
    // aplicação ficava por conta de quem lê, no meio da emergência. Uma tela
    // com duas perguntas objetivas troca a ressalva por um veredito.
    //
    // ⚠️ E "NÃO SEI" NÃO É "NÃO". Ele cai no amarelo, que devolve a escolha ao
    // médico e a registra — o único amarelo dos três fármacos, porque é o
    // único ponto em que não existe resposta única.
    aas_check: {
      id: "aas_check",
      type: "input",
      title: "Antes do AAS",
      intro: "Duas perguntas — o resto o app já sabe.",
      fields: [
        {
          id: "aas_alergia",
          label: "Alergia conhecida ao AAS?",
          presets: [
            { value: "nao", label: "Não" },
            { value: "sim", label: "Sim" },
            { value: "nao_sei", label: "Não sei" },
          ],
        },
        {
          id: "aas_sangramento",
          label: "Sangramento ativo?",
          presets: [
            { value: "nao", label: "Não" },
            { value: "sim", label: "Sim" },
            { value: "nao_sei", label: "Não sei" },
          ],
        },
      ],
      next: "aas_liberado",
    },

    aas_liberado: {
      id: "aas_liberado",
      type: "action",
      title: "AAS liberado",
      summary: "Síndrome aórtica aguda não é a via — siga para AAS conforme indicado.",
      // ⚠️ A RESSALVA SAIU DO TEXTO E VIROU VEREDITO. "salvo alergia/
      // sangramento ativo" era a regra impressa; agora o app a aplica com o
      // que acabou de perguntar, e a ação só fica disponível no verde.
      // ⚠️ SEM `actions`: a dose agora mora no veredito e só aparece no verde.
      actions: [],
      vereditos: [{ id: "aas", avaliar: vereditoAas }],
      next: "exame_direcionado",
    },

    // ⚠️ A TELA 2a ("COMPLEMENTO OBJETIVO") FOI REMOVIDA em 2026-08-25.
    //
    // Ela existia para coletar PAD e FR — dois números que a especificação
    // pedia e que eu pus numa tela própria sem olhar onde os seus pares já
    // estavam. O autor apontou o absurdo: a PA é UMA medida, lida de uma vez
    // no monitor, e o app pedia a sistólica no bloco de circulação e a
    // diastólica CINCO PASSOS adiante.
    //
    // Cada número voltou para o exame a que pertence:
    //   · PAD → bloco de Circulação, ao lado da PAS
    //   · FR  → bloco de Respiração, ao lado da SpO₂ e do esforço
    //
    // ⚠️ E A TELA INTEIRA DEIXOU DE EXISTIR — não foi renomeada nem esvaziada.
    // Um passo a menos no caminho crítico, sem perder um único dado.

    // ── TELA 2b · EXAME DIRECIONADO ──────────────────────────────────────
    //
    // ⚠️ A AUSCULTA NÃO É DECORATIVA AQUI — ela é ENTRADA DE DOIS VEREDITOS.
    // Pulmões limpos com hipotensão é o padrão que separa o infarto de VD da
    // falência de ventrículo esquerdo (no VE a mesma hipotensão vem com
    // congestão), e estertores entram na contraindicação do betabloqueador.
    // Sem isso, seriam dois checklists bonitos que não mudam nada.
    exame_direcionado: {
      id: "exame_direcionado",
      type: "input",
      title: "Exame direcionado",
      intro: "Marque o que encontrou. Pode marcar vários.",
      fields: [
        {
          id: "ausculta_cardiaca",
          label: "Ausculta cardíaca",
          optional: true,
          multiplo: true,
          presets: [
            { value: "Normal", label: "Normal" },
            { value: "Sopro novo", label: "Sopro novo" },
            { value: "B3", label: "B3" },
            { value: "Outros", label: "Outros" },
          ],
        },
        {
          id: "ausculta_pulmonar",
          label: "Ausculta pulmonar",
          optional: true,
          multiplo: true,
          presets: [
            { value: "Limpa", label: "Limpa" },
            { value: "Estertores", label: "Estertores" },
            { value: "Sibilos", label: "Sibilos" },
            { value: "Murmúrio diminuído", label: "Murmúrio diminuído" },
          ],
        },
      ],
      next: "terapia_check",
    },

    // ── TELA 2c(i) · O QUE O APP NÃO TEM COMO SABER ──────────────────────
    //
    // ⚠️ TRÊS PERGUNTAS, E SÓ AS QUE NÃO SE DERIVAM. Congestão, baixo débito e
    // bradicardia saem de dados já coletados; o supra inferior o médico ACABOU
    // de ver na tela do ECG. O que sobra é o que nenhum dado responde: PDE-5,
    // broncoespasmo e BAV/PR longo.
    //
    // ⚠️ E NÃO SE PERGUNTA "HÁ RISCO DE CHOQUE CARDIOGÊNICO?" (decisão do
    // autor, 2026-08-25): é conclusão clínica, não achado. Enquanto não houver
    // critério objetivo auditado, ele fica como pendência de fonte declarada —
    // não vira campo subjetivo novo.
    terapia_check: {
      id: "terapia_check",
      type: "input",
      title: "Antes de nitrato e betabloqueador",
      intro: "O que o app não tem como deduzir dos dados que você já deu.",
      fields: [
        {
          id: "supra_inferior",
          label: "O ECG mostra supra inferior (DII, DIII, aVF)?",
          presets: [
            { value: "nao", label: "Não" },
            { value: "sim", label: "Sim" },
            { value: "nao_sei", label: "Ainda não vi o ECG" },
          ],
        },
        {
          // ⚠️ REPETIDA AQUI DE PROPÓSITO, E NÃO É REPERGUNTA (2026-08-26). Os
          // atalhos do menu ("STEMI já confirmado", "só preciso das doses")
          // pulam a Tela 1 e chegam direto às medicações — por esses caminhos
          // o PDE-5 nunca teria sido perguntado, e o veredito bloquearia o
          // nitrato por falta de um dado que o médico não teve chance de dar.
          // Isso é o beco que a regra proíbe: o app dizendo "não posso" em vez
          // de perguntar.
          //
          // Quem veio pelo fluxo completo encontra o campo JÁ PREENCHIDO — o
          // motor guarda o valor e a tela o exibe com o aviso de aproveitado.
          id: "pde5_recente",
          label: "Uso recente de inibidor de PDE-5 (sildenafila, tadalafila)?",
          optional: true,
          presets: [
            { value: "nao", label: "Não" },
            { value: "sim", label: "Sim" },
            { value: "nao_sei", label: "Não sei" },
          ],
        },

        {
          id: "bb_bav",
          label: "BAV de 2º/3º grau sem marcapasso, ou PR > 240 ms no ECG?",
          presets: [
            { value: "nao", label: "Não" },
            { value: "sim", label: "Sim" },
            { value: "nao_sei", label: "Não sei — me ajude" },
          ],
        },
        {
          id: "bb_broncoespasmo",
          label: "Broncoespasmo ativo?",
          presets: [
            { value: "nao", label: "Não" },
            { value: "sim", label: "Sim" },
          ],
        },
      ],
      // ⚠️ A DÚVIDA SOBRE BAV/PR TEM CORREÇÃO — o ECG já está na mão — e por
      // isso ela desvia para a ajuda em vez de virar um "não" silencioso.
      next: {
        possiveis: ["bb_ajuda_pr", "terapia_vereditos"],
        escolher: (values) => (values.bb_bav === "nao_sei" ? "bb_ajuda_pr" : "terapia_vereditos"),
      },
    },

    bb_ajuda_pr: {
      id: "bb_ajuda_pr",
      type: "decision",
      title: "Onde olhar o PR e o BAV",
      question: "Depois de olhar o traçado: há BAV de 2º/3º grau sem marcapasso ou PR > 240 ms?",
      evidence: [
        "PR: do INÍCIO da onda P ao INÍCIO do QRS. Meça em DII, onde a P costuma ser mais nítida.",
        "A 25 mm/s, cada quadradinho pequeno = 40 ms e cada quadrado grande = 200 ms. PR > 240 ms = mais de um quadrado grande e um quadradinho.",
        "BAV de 2º grau: nem toda P conduz — ou o PR alarga progressivamente até falhar (Mobitz I), ou a P falha sem aviso (Mobitz II).",
        "BAV de 3º grau: P e QRS marcham independentes, cada um no seu ritmo.",
      ],
      // ⚠️ ESTA TELA TRANSFORMAVA DÚVIDA EM NEGAÇÃO (achado do autor,
      // 2026-08-26). Ela só existe para quem respondeu "não sei" — e oferecia
      // apenas "Sim" e "Não". Quem continuasse sem conseguir avaliar (PR no
      // limite, P difícil de ver, artefato no traçado) era obrigado a escolher,
      // e escolher "Não" LIBERAVA o betabloqueador.
      //
      // ⚠️ A AJUDA NÃO PODE SER A PORTA QUE APAGA A DÚVIDA. Enquanto o achado
      // permanecer indeterminado, `bb_bav` continua `nao_sei` e o veredito
      // continua bloqueando — que é o comportamento seguro e honesto.
      options: [
        { id: "nao", label: "Não — PR normal e sem BAV", next: "terapia_vereditos", gravidade: "favoravel", grava: { campo: "bb_bav", valor: "nao" } },
        { id: "sim", label: "Sim — há BAV ou PR > 240 ms", next: "terapia_vereditos", gravidade: "critica", grava: { campo: "bb_bav", valor: "sim" } },
        { id: "indeterminado", label: "Ainda não consegui determinar", next: "terapia_vereditos", gravidade: "neutra", grava: { campo: "bb_bav", valor: "nao_sei" } },
      ],
    },

    // ── TELA 2c(ii) · OS VEREDITOS ───────────────────────────────────────
    //
    // ⚠️ DOIS VEREDITOS INDEPENDENTES NA MESMA TELA, e é isso que a regra do
    // autor pede: um 🔴 no nitrato não pode arrastar o betabloqueador junto,
    // nem parar o atendimento. Cada ação responde pelos seus próprios
    // impedimentos, e o fluxo segue de qualquer jeito.
    terapia_vereditos: {
      id: "terapia_vereditos",
      type: "action",
      title: "Terapia anti-isquêmica",
      summary: "Cada fármaco responde pelos seus próprios impedimentos.",
      // ⚠️ SEM `actions`: imprimir a dose do nitrato ao lado do bloqueio do
      // nitrato é exatamente o defeito que o veredito existe para eliminar.
      actions: [],
      vereditos: [
        { id: "nitrato", avaliar: vereditoNitrato },
        { id: "betabloqueador", avaliar: vereditoBetabloqueador },
      ],
      porque: [NITRATO_MONITORIZACAO, BETABLOQUEADOR_IV_SEPARADO],
      // ⚠️ A CONTA NÃO MORA AQUI. O card diz "iniciar a 10 mcg/min"; quantos
      // mL/h isso é depende da concentração da bolsa, e essa conta já existe
      // com fonte de bula em `vasoactive-engine.ts`. Um toque leva até lá e
      // traz de volta a este mesmo ponto — sem avançar o protocolo.
      ferramenta: { moduleId: "drogas-vasoativas", label: "Abrir calculadora — nitroglicerina EV" },
      next: {
        possiveis: ["ecg_supra_qual", "ecg_sem_supra"],
        escolher: (values) => (values.ecg_supra_avaliado === "sei_sim" ? "ecg_supra_qual" : "ecg_sem_supra"),
      },
    },

    // ── Tela 2 — conduta enquanto investiga. Alcançada por 1–3 blocos
    // positivos OU por "inconclusiva" na tela 3 (loop de reavaliação). ──────
    disseccao_investigacao: {
      id: "disseccao_investigacao",
      type: "action",
      title: "Antes do AAS — investigando síndrome aórtica aguda",
      summary: "Nível: {disseccaoNivel}. AAS/antitrombótico aguarda o resultado.",
      actions: [
        "Manter monitorização contínua.",
        "{disseccaoAntitrombotico}",
        "{disseccaoConduta}",
        "Acionar equipe vascular/cirurgia cardíaca {disseccaoEquipe}.",
      ],
      next: "disseccao_resultado_disponibilidade",
    },

    // ══════════ Tela 3 — FATO DISPONÍVEL, não conclusão diagnóstica ══════════
    // ⚠️ REESCRITO (correção 2026-08-24): nunca pergunta "qual o resultado?" —
    // pergunta só o que É FATO (o exame já saiu? o laudo diz o quê?). "Tenho
    // o laudo mas não sei interpretar" tem saída própria em cada etapa —
    // decompõe em achados objetivos via blocoAjudaLaudo(), nunca pede
    // conclusão. `disseccao_estado` explicita o estado do ramo em cada nó
    // (grava onde o nó é uma decision; nós de Roteamento não gravam —
    // limitação conhecida do tipo Roteamento).
    disseccao_resultado_disponibilidade: {
      id: "disseccao_resultado_disponibilidade",
      type: "decision",
      title: "Resultado da investigação",
      question: DISSECCAO_PERGUNTA_DISPONIBILIDADE,
      options: [
        {
          id: "sim_tenho_laudo",
          label: "Sim, tenho o laudo",
          next: "disseccao_resultado_laudo",
          grava: { campo: "disseccao_estado", valor: "laudo_disponivel" },
        },
        {
          id: "sim_mas_nao_sei_ler",
          label: "Tenho o laudo, mas não sei interpretar",
          next: "disseccao_ajuda_laudo",
          grava: { campo: "disseccao_estado", valor: "laudo_precisa_ajuda" },
        },
        {
          id: "ainda_nao",
          label: "Ainda não",
          next: "disseccao_aguardando",
          grava: { campo: "disseccao_estado", valor: "aguardando_exame" },
        },
        {
          id: "nao_sera_possivel",
          label: "Não será possível fazer o exame agora",
          next: "disseccao_exame_nao_possivel",
          grava: { campo: "disseccao_estado", valor: "exame_nao_possivel" },
        },
      ],
    },

    disseccao_aguardando: {
      id: "disseccao_aguardando",
      type: "action",
      title: "Aguardando o resultado",
      summary: DISSECCAO_AGUARDANDO_TEXTO,
      actions: ["Volte a esta pergunta assim que o exame estiver pronto."],
      next: "disseccao_resultado_disponibilidade",
    },

    disseccao_exame_nao_possivel: {
      id: "disseccao_exame_nao_possivel",
      type: "action",
      title: "Exame não disponível agora",
      summary: DISSECCAO_EXAME_NAO_POSSIVEL_TEXTO,
      actions: ["Reavaliar disponibilidade e estabilidade periodicamente."],
      next: "disseccao_resultado_disponibilidade",
    },

    disseccao_resultado_laudo: {
      id: "disseccao_resultado_laudo",
      type: "decision",
      title: "Resultado da investigação",
      question: DISSECCAO_PERGUNTA_LAUDO,
      options: [
        {
          id: "confirma",
          label: "Confirma síndrome aórtica aguda (flap intimal, hematoma intramural, úlcera penetrante ou extensão)",
          next: "disseccao_confirmada",
          grava: { campo: "disseccao_estado", valor: "confirmada" },
        },
        {
          id: "afasta",
          label: "Afasta explicitamente síndrome aórtica aguda",
          next: "aas_check",
          grava: { campo: "disseccao_estado", valor: "afastada" },
        },
        {
          id: "inconclusivo",
          label: "Inconclusivo / não fecha diagnóstico",
          next: "disseccao_investigacao",
          grava: { campo: "disseccao_estado", valor: "inconclusiva" },
        },
        {
          id: "nao_sei_ler",
          label: "Não sei localizar essa informação no laudo",
          next: "disseccao_ajuda_laudo",
          grava: { campo: "disseccao_estado", valor: "laudo_precisa_ajuda" },
        },
      ],
    },

    // ⚠️ UMA PERGUNTA POR TELA (mesmo padrão dos blocos A/B/C da dissecção,
    // 2026-08-24 — evita a tela de 2 perguntas rolar). `blocoAjudaLaudo()`
    // continua devolvendo os 2 campos como unidade lógica; a árvore só
    // decide APRESENTAR um por vez.
    disseccao_ajuda_laudo: {
      id: "disseccao_ajuda_laudo",
      type: "input",
      title: "Vamos por partes",
      intro: "Responda pelos achados objetivos do laudo — o app deriva o resultado.",
      fields: [blocoAjudaLaudo()[0]],
      next: "disseccao_ajuda_laudo_afasta",
    },

    // ⚠️ Nó de Roteamento — não suporta `grava` (limitação do tipo). O estado
    // final continua registrado no destino alcançado (disseccao_confirmada /
    // aas_liberado / disseccao_investigacao já carregam o resultado no seu
    // próprio conteúdo).
    disseccao_ajuda_laudo_afasta: {
      id: "disseccao_ajuda_laudo_afasta",
      type: "input",
      title: "Vamos por partes",
      intro: "Mais um achado objetivo do laudo.",
      fields: [blocoAjudaLaudo()[1]],
      next: {
        possiveis: ["disseccao_confirmada", "aas_check", "disseccao_investigacao"],
        escolher: (values) => {
          const r = derivarResultadoLaudo(values);
          if (r === "confirmada") return "disseccao_confirmada";
          if (r === "afastada") return "aas_check";
          return "disseccao_investigacao";
        },
      },
    },

    disseccao_confirmada: {
      id: "disseccao_confirmada",
      type: "transition",
      title: "Síndrome aórtica aguda confirmada",
      summary: "A via de síndrome coronariana aguda deste módulo não se aplica.",
      disposition: "other_module",
      exitCriteria: [
        "NÃO administrar AAS nem qualquer antitrombótico.",
        "Manejo específico: protocolo de síndrome aórtica aguda do serviço (cirurgia vascular/cardíaca, controle rigoroso de PA/FC).",
        "⚠️ Este app não tem módulo dedicado de síndrome aórtica aguda — siga o protocolo/guideline específico do serviço.",
      ],
      targets: [],
    },

    tempo: {
      id: "tempo",
      type: "input",
      // ⚠️ CONDICIONAL, NÃO OBRIGATÓRIO NO CAMINHO (2026-08-25) — só é
      // alcançado quando `tempo_dor` NÃO foi coletado antes (campo opcional
      // no bloco de isquemia). Quem já respondeu passa direto para a decisão
      // de reperfusão.
      title: "Tempo desde o início dos sintomas",
      intro: "Agora este dado é necessário: ele define a elegibilidade e a urgência da reperfusão.",
      fields: [
        {
          id: "tempo_dor",
          label: "Início dos sintomas",
          presets: [
            { value: "< 1 h", label: "< 1 h" },
            { value: "1–3 h", label: "1–3 h" },
            { value: "3–6 h", label: "3–6 h" },
            { value: "6–12 h", label: "6–12 h" },
            { value: "12–24 h", label: "12–24 h" },
            { value: "> 24 h", label: "> 24 h" },
            { value: "intermitente / indefinido", label: "Indefinido" },
          ],
        },
      ],
      next: {
        possiveis: ["stemi_tempo_confiavel", "stemi_cenario_icp"],
        escolher: (values) =>
          values.tempo_dor === "intermitente / indefinido" && values.tempo_confiavel !== "sim"
            ? "stemi_tempo_confiavel"
            : "stemi_cenario_icp",
      },
    },

    // ── 2. ECG: reconhecimento assistido (Etapa 4) ────────────────────────────
    //
    // ⚠️ PERGUNTA SIMPLES PRIMEIRO, IMAGEM DEPOIS (2026-08-24, quarta correção
    // pós-validação física). O autor testou de novo e reportou: as opções
    // antigas ("Não — descartei os padrões sem supra" / "Não sei dizer — ver
    // os padrões que NÃO fazem supra") "confundem o usuário e não
    // correspondem ao raciocínio real durante o atendimento" — o raciocínio
    // clínico é primeiro SIM/NÃO/NÃO SEI sobre supra/BRE, e só DEPOIS, se
    // necessário, o app mostra os padrões visuais de apoio. As imagens de
    // território (anterior/inferior/lateral) e de BRE não somem — migraram
    // para `ecg_supra_qual`, alcançado só por "Sim".
    ecg: {
      id: "ecg",
      type: "decision",
      title: "ECG · Reconhecimento de oclusão",
      question: "O ECG mostra supra de ST ou BRE novo suspeito?",
      summary: "⚠️ Ausência de supra não exclui oclusão. Se não houver supra evidente, o app mostra os padrões de alto risco sem supra.",
      evidence: [
        OCLUSAO_SEM_SUPRA_ABERTURA,
        "Supra de ST ≥ 1 mm (0,1 mV) em ≥ 2 derivações contíguas.",
        "Em V2–V3: ≥ 2 mm (homens ≥ 40a), ≥ 2,5 mm (homens < 40a) ou ≥ 1,5 mm (mulheres).",
        "Sem supra de ST = SCA sem supra (NSTEMI ou angina instável) até definição pela troponina — ⚠️ MAS ANTES, descarte os padrões que ocluem sem elevar.",
      ],
      // ⚠️ SEM CARDS AQUI DE PROPÓSITO — pedido explícito: "somente depois,
      // se necessário, o app mostra os padrões visuais de apoio". Os cards
      // de território/BRE vivem em `ecg_supra_qual`.
      options: [
        { id: "sim", label: "Sim — há supra / BRE novo suspeito", next: "portao_grupo_a", grava: { campo: "ecg_supra_avaliado", valor: "sei_sim" } },
        { id: "nao", label: "Não — avaliei e não há supra", next: "portao_grupo_a", grava: { campo: "ecg_supra_avaliado", valor: "sei_nao" } },
        // ⚠️ "NÃO SEI" ≠ "NÃO" (decisão do autor, 2026-08-25) — antes as duas
        // opções tinham o MESMO destino, e o app tratava "avaliei e não há"
        // igual a "não sei interpretar". São estados clínicos diferentes: o
        // segundo pede ajuda de verdade, não o mesmo caminho com outro rótulo.
        { id: "nao_sei", label: "Não sei interpretar — me ajude", next: "ecg_ajuda_supra", grava: { campo: "ecg_supra_avaliado", valor: "nao_sei" } },
      ],
    },

    // ── 2a. Qual padrão de supra/BRE — só alcançado por "Sim" ────────────────
    //
    // ⚠️ DUAS TELAS DE 2 CARDS (2026-08-24, quarta correção pós-validação
    // física): os traçados de ECG reais engordaram os 4 cards o bastante para
    // empurrar "BRE novo" para fora de 375×667. Pedido explícito: "não
    // resolver comprimindo a imagem... se imagem + opções não cabem, dividir
    // em mais uma tela curta". 4 padrões → 2 telas de 2, mesma imagem grande.
    //
    // ⚠️ ROTEAMENTO CLÍNICO INALTERADO: supra por território → `stemi_
    // localizacao` (mesmo destino de sempre); BRE novo → `lbbb_correlacao`
    // (correlação clínica obrigatória, NUNCA equivalência automática — regra
    // protegida, não tocada). "Supra de ST ou BRE novo suspeito" no lugar de
    // "BRE/BRD novo": BRD isolado nunca teve lógica própria neste módulo
    // (busca confirma zero ocorrências) e não entra misturado com BRE.
    // ⚠️ AJUDA REAL, NÃO ROTA ALTERNATIVA (2026-08-25) — critérios objetivos
    // de supra, com os cards de padrão logo em seguida. Termina sempre numa
    // classificação, nunca em texto: quem entra aqui sai com "há supra" ou
    // "não há", e quem permanece incerto vai para os padrões sem supra COM O
    // ESTADO MARCADO como incerto — não como "avaliado e ausente".
    ecg_ajuda_supra: {
      id: "ecg_ajuda_supra",
      type: "decision",
      title: "ECG · Como reconhecer o supra",
      question: "Com estes critérios, o traçado tem supra de ST?",
      evidence: [
        "Supra de ST ≥ 1 mm (0,1 mV) em ≥ 2 derivações CONTÍGUAS — medido no ponto J, em relação à linha de base.",
        "Em V2–V3 o limiar é MAIOR: ≥ 2 mm (homens ≥ 40 anos), ≥ 2,5 mm (homens < 40 anos), ≥ 1,5 mm (mulheres).",
        "Contíguas = do mesmo território: V1–V4 (anterosseptal) · DII, DIII, aVF (inferior) · DI, aVL, V5–V6 (lateral).",
        "BRE novo/presumivelmente novo entra por outro caminho: não é equivalente automático — exige correlação clínica.",
        "⚠️ Ausência de supra NÃO exclui oclusão: os padrões da tela seguinte ocluem sem elevar o ST.",
      ],
      options: [
        { id: "tem", label: "Sim — atinge o critério acima", next: "portao_grupo_a", grava: { campo: "ecg_supra_avaliado", valor: "sei_sim" } },
        { id: "nao_tem", label: "Não — não atinge o critério", next: "portao_grupo_a", grava: { campo: "ecg_supra_avaliado", valor: "sei_nao" } },
        { id: "incerto", label: "Continua incerto", next: "portao_grupo_a", grava: { campo: "ecg_supra_avaliado", valor: "incerto" } },
      ],
    },

    ecg_supra_qual: {
      id: "ecg_supra_qual",
      type: "decision",
      title: "Qual o padrão?",
      question: "Toque no que mais se parece com o traçado.",
      comparativo: [
        {
          figura: "ecg_supra_anterior",
          rotulo: "Supra anterior/septal (V1–V4)",
          significado: "Critério de STEMI por território — Grupo A.",
          conduta: "Reperfusão emergente.",
          optionId: "anterior",
        },
        {
          figura: "ecg_supra_inferior",
          rotulo: "Supra inferior (DII, DIII, aVF)",
          significado: "Investigar V3R–V4R (VD) e V7–V9 (posterior) em paralelo.",
          conduta: "Reperfusão emergente.",
          optionId: "inferior",
        },
      ],
      options: [
        { id: "anterior", label: "Supra anterior/septal", next: "stemi_localizacao", grava: { campo: "stemiParede", valor: "anterior" } },
        { id: "inferior", label: "Supra inferior", next: "stemi_localizacao", grava: { campo: "stemiParede", valor: "inferior" } },
        { id: "outro", label: "Outro padrão", next: "ecg_supra_qual_2" },
        // ⚠️ NOVO (correção final 2026-08-25, auditoria SCA item I5) — supra já
        // está estabelecido (esta tela só é alcançada pelo "Sim" de `ecg`); não
        // saber o TERRITÓRIO exato não muda que a reperfusão está indicada, só
        // adia as derivações específicas de território (V3R–V4R/V7–V9) — por
        // isso segue para `stemi_localizacao` como as demais, com aviso.
        { id: "incerto", label: "Não sei / território incerto — mas há supra", next: "stemi_localizacao", grava: { campo: "stemiTerritorioIncerto", valor: "sim" } },
      ],
    },

    // ── TELA 2 — só por "Outro padrão" ─────────────────────────────────────
    ecg_supra_qual_2: {
      id: "ecg_supra_qual_2",
      type: "decision",
      title: "Qual o padrão?",
      question: "Toque no que mais se parece com o traçado.",
      comparativo: [
        {
          figura: "ecg_supra_lateral",
          rotulo: "Supra lateral (DI, aVL, V5–V6)",
          significado: "Critério de STEMI por território — Grupo A.",
          conduta: "Reperfusão emergente.",
          optionId: "lateral",
        },
        {
          figura: "ecg_bre_novo",
          rotulo: "BRE novo/presumivelmente novo",
          significado: "Não é equivalente automático de STEMI.",
          conduta: "Vai para correlação clínica — nunca direto para reperfusão.",
          optionId: "bre",
        },
      ],
      evidence: [LBBB_NAO_EQUIVALENTE_ISOLADO],
      options: [
        { id: "lateral", label: "Supra lateral", next: "stemi_localizacao", grava: { campo: "stemiParede", valor: "lateral" } },
        { id: "bre", label: "BRE novo, sem supra que atinja critério", next: "lbbb_correlacao" },
        // ⚠️ NOVO (correção final 2026-08-25, item I5) — mesma lógica de
        // `ecg_supra_qual`: supra já estabelecido, território incerto não
        // muda a indicação de reperfusão.
        { id: "incerto", label: "Não sei / território incerto — mas há supra", next: "stemi_localizacao", grava: { campo: "stemiTerritorioIncerto", valor: "sim" } },
      ],
    },

    // ── 2b. LBBB novo — correlação clínica, nunca equivalência automática ────
    // ⚠️ REESTRUTURADO (correção final 2026-08-25, item I3/B) — quando
    // `cor_dor_isquemica_atual`/`estabilidade_avaliada` já foram coletados
    // (fluxo completo, sem o atalho "ECG na mão"), esta tela NÃO pergunta de
    // novo: mostra o que já se sabe como CONTEXTO e segue direto. Só pergunta
    // quando o dado genuinamente não existe ainda.
    lbbb_correlacao: {
      id: "lbbb_correlacao",
      type: "action",
      title: "BRE novo — correlação clínica",
      summary: "⚠️ BRE novo isolado NÃO é equivalente automático de STEMI. {lbbbCorrelacaoContexto}",
      actions: ["Correlação com o que já foi avaliado neste caso — nenhuma pergunta nova."],
      porque: [LBBB_NAO_EQUIVALENTE_ISOLADO, LBBB_CITACAO_LITERAL_2025, SGARBOSSA_AUSENTE_NA_FONTE_2025, LBBB_SGARBOSSA_APOIO],
      next: {
        possiveis: ["stemi_localizacao", "lbbb_isolado", "lbbb_correlacao_pergunta"],
        escolher: (values) => {
          const r = derivarCorrelacaoBre(values);
          if (r === "ativa") return "stemi_localizacao";
          if (r === "isolado") return "lbbb_isolado";
          return "lbbb_correlacao_pergunta";
        },
      },
    },

    // ⚠️ FALLBACK — só alcançado quando nada sobre dor isquêmica atual ou
    // estabilidade foi coletado antes (ex.: atalho "já tenho o ECG na mão,
    // ainda não liberei AAS", que pula os blocos de estabilidade).
    lbbb_correlacao_pergunta: {
      id: "lbbb_correlacao_pergunta",
      type: "decision",
      title: "BRE novo — correlação clínica obrigatória",
      question: "Há dor isquêmica ativa e/ou instabilidade hemodinâmica associada?",
      summary: "⚠️ BRE novo isolado NÃO é equivalente automático de STEMI.",
      evidence: [LBBB_NAO_EQUIVALENTE_ISOLADO, LBBB_CITACAO_LITERAL_2025, SGARBOSSA_AUSENTE_NA_FONTE_2025, LBBB_SGARBOSSA_APOIO],
      options: [
        { id: "ativa", label: "Sim — dor ativa e/ou instabilidade", next: "stemi_localizacao" },
        { id: "isolado", label: "Não — BRE novo isolado, sem dor ativa nem instabilidade", next: "lbbb_isolado" },
        // ⚠️ NOVO (correção final 2026-08-25) — a versão anterior tinha um
        // "Não sei" que roteava IGUAL a "Não" (ajuda falsa, item I6 da
        // auditoria). Este substitui por ajuda real: critérios objetivos,
        // não "não sei = não".
        { id: "incerto", label: "Não sei — me ajude a avaliar", next: "lbbb_correlacao_ajuda" },
      ],
    },

    // ⚠️ AJUDA REAL (correção final 2026-08-25) — decompõe em achados
    // objetivos em vez de aceitar "não sei" como resposta.
    lbbb_correlacao_ajuda: {
      id: "lbbb_correlacao_ajuda",
      type: "decision",
      title: "Esclarecendo a correlação",
      question: "Com estes critérios mais objetivos, algum está presente?",
      evidence: [
        "Dor isquêmica ativa = dor torácica isquêmica presente NESTE MOMENTO, apesar de qualquer tratamento anti-isquêmico já em curso.",
        "Instabilidade associada = hipotensão, alteração aguda de consciência, ou sinais de hipoperfusão (pele fria/pálida/sudoreica) associados ao quadro atual.",
      ],
      options: [
        { id: "ativa", label: "Sim, algum dos dois está presente", next: "stemi_localizacao" },
        { id: "isolado", label: "Não, nenhum dos dois", next: "lbbb_isolado" },
      ],
    },

    // ⚠️ SEM "LIVRO" (2026-08-24) — `summary`/`actions` traziam o parágrafo
    // completo. Fica a ação; o parágrafo vai para `porque`.
    lbbb_isolado: {
      id: "lbbb_isolado",
      type: "action",
      title: "BRE novo isolado — sem via de reperfusão emergente",
      summary: "Sem via de reperfusão emergente por este achado isolado.",
      actions: [
        "Seguir via de troponina seriada/ECG seriado, como SCA sem supra.",
        "Reclassificar se surgir correlação clínica (dor ativa ou instabilidade).",
      ],
      porque: [LBBB_ISOLADO_SEM_CORRELACAO],
      next: "nste_trop",
    },

    // ════════════════════════ RAMO STEMI (GRUPO A) ═══════════════════════════
    // ⚠️ SEM "LIVRO" (2026-08-24) — `summary` trazia o parágrafo completo da
    // correlação BRE+dor ativa; foi para `porque`. As derivações extras de VD
    // (V3R–V4R), relevantes só aqui (inferior + suspeita de VD), também vão
    // para `porque` — não como link genérico solto noutra tela.
    stemi_localizacao: {
      id: "stemi_localizacao",
      type: "action",
      title: "STEMI confirmado — localizar a parede",
      // ⚠️ REDIGIDO (correção final 2026-08-25, item 5) — evitar ensinar que
      // todo padrão equivalente é literalmente um STEMI clássico; a urgência
      // é preservada, a linguagem fica mais precisa.
      summary: "Mesma urgência da reperfusão emergente — a dor ativa/instabilidade decidiu, não o BRE isolado.",
      enfase: "resultado_critico",
      actions: [
        "Anterior/septal (V1–V4): risco de disfunção de VE e bloqueios — atenção hemodinâmica.",
        "Inferior (DII, DIII, aVF): obter V3R–V4R para IAM de VD e V7–V9 para parede posterior.",
        "IAM de VD ou inferior com hipotensão: NÃO usar nitrato/morfina; fazer volume (cristaloide).",
        "Acionar a hemodinâmica/cardiologia AGORA, em paralelo às medicações.",
        "⚠️ Se chegou por atalho ('STEMI já confirmado'): confirme que a dissecção foi afastada antes de liberar antitrombótico/fibrinolítico — este fluxo pressupõe que sim.",
      ],
      porque: [LBBB_CORRELACAO_ATIVA, VD_QUANDO_PROCURAR, VD_DERIVACOES_COMO],
      // ⚠️ A DECISÃO DE REPERFUSÃO VEM AGORA (2026-08-25) — antes vinham
      // `stemi_dados` (peso) e `stemi_meds` (22 ações) ANTES da pergunta
      // "tem ICP em ≤120 min?". A fila de telas ensinava que a reperfusão
      // espera as doses; não espera. Peso e antitrombóticos passaram para
      // DEPOIS da decisão, declarados como paralelos ao preparo/transporte.
      // O tempo de sintomas só vira tela se ainda não tiver sido coletado.
      next: {
        possiveis: ["tempo", "stemi_tempo_confiavel", "stemi_cenario_icp"],
        escolher: (values) => {
          if (!values.tempo_dor) return "tempo";
          if (values.tempo_dor === "intermitente / indefinido" && values.tempo_confiavel !== "sim") return "stemi_tempo_confiavel";
          return "stemi_cenario_icp";
        },
      },
    },

    stemi_dados: {
      id: "stemi_dados",
      type: "input",
      title: "Peso para cálculo de dose",
      intro: "Toque no peso (ou adicione). Usado para enoxaparina, heparina e tenecteplase.",
      // ⚠️ NO RAMO DA ICP ISTO NÃO SEGURA A SALA (2026-08-25) — a hemodinâmica
      // já foi acionada no nó anterior. No ramo da FIBRINÓLISE, ao contrário,
      // o peso é pré-requisito real: sem ele não há dose de TNK.
      fields: [
        {
          // ⚠️ REPETIDA AQUI DE PROPÓSITO, E NÃO É REPERGUNTA (2026-08-26). Os
          // atalhos do menu ("STEMI já confirmado", "só preciso das doses")
          // pulam a Tela 1 e chegam direto às medicações — por esses caminhos
          // o PDE-5 nunca teria sido perguntado, e o veredito bloquearia o
          // nitrato por falta de um dado que o médico não teve chance de dar.
          // Isso é o beco que a regra proíbe: o app dizendo "não posso" em vez
          // de perguntar.
          //
          // Quem veio pelo fluxo completo encontra o campo JÁ PREENCHIDO — o
          // motor guarda o valor e a tela o exibe com o aviso de aproveitado.
          id: "pde5_recente",
          label: "Uso recente de inibidor de PDE-5 (sildenafila, tadalafila)?",
          optional: true,
          presets: [
            { value: "nao", label: "Não" },
            { value: "sim", label: "Sim" },
            { value: "nao_sei", label: "Não sei" },
          ],
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
      // ⚠️ DESTINO FIXO, NÃO ROTEAMENTO (2026-08-25) — a versão anterior
      // roteava daqui para `stemi_fibrinolise` OU `stemi_meds` conforme a
      // estratégia. Parecia econômico e ABRIU UM CAMINHO CLINICAMENTE
      // PROIBIDO: como a alcançabilidade é estática (segue `possiveis`, não
      // `escolher`), De Winter/posterior/T-hiperaguda/aVR — que chegam aqui
      // por `stemi_icp`/`stemi_transfer` — passavam a ALCANÇAR a fibrinólise,
      // que não é a via desses padrões. A trava pegou. O ramo da fibrinólise
      // tem agora o seu próprio nó de peso (`stemi_dados_fibrino`), e os dois
      // ramos ficam genuinamente separados no grafo.
      next: "stemi_meds",
    },

    // ⚠️ PESO DO RAMO DA FIBRINÓLISE — separado de propósito (ver o comentário
    // em `stemi_dados`). Aqui o peso É BLOQUEANTE de verdade: sem ele não há
    // dose de tenecteplase. É a diferença clínica que o autor exigiu explícita
    // — na ICP o peso corre em paralelo ao preparo; aqui ele é pré-requisito.
    stemi_dados_fibrino: {
      id: "stemi_dados_fibrino",
      type: "input",
      title: "Peso — dose do fibrinolítico",
      intro: "Toque no peso (ou adicione). A dose de tenecteplase é escalonada por peso.",
      fields: [
        {
          // ⚠️ TAMBÉM AQUI: o ramo da fibrinólise tem o SEU próprio nó de peso
          // (separado de `stemi_dados` por uma razão de segurança antiga — ver
          // o comentário deste nó), e por ele se alcança `stemi_meds` sem
          // passar por nenhuma outra pergunta de PDE-5.
          id: "pde5_recente",
          label: "Uso recente de inibidor de PDE-5 (sildenafila, tadalafila)?",
          optional: true,
          presets: [
            { value: "nao", label: "Não" },
            { value: "sim", label: "Sim" },
            { value: "nao_sei", label: "Não sei" },
          ],
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
            { value: "aferido", label: "Real (pesado)" },
          ],
        },
      ],
      next: "stemi_fibrinolise",
    },

    stemi_meds: {
      id: "stemi_meds",
      type: "action",
      title: "Tratamento · Antitrombóticos (STEMI)",
      summary: "Iniciar em paralelo à definição da reperfusão (não atrasar a reperfusão).",
      // ⚠️ AS DOSES DE NITRATO E BETABLOQUEADOR SAÍRAM DAS AÇÕES (2026-08-26).
      // Este card imprimia as duas sem checagem nenhuma — é o passo 17, e os
      // vereditos existiam só no passo 11. A mesma tela que lista antiagregante
      // e anticoagulante mandava dar nitrato sem saber a PA nem o PDE-5.
      //
      // Agora quem governa são os vereditos: a dose vive em
      // `Veredito.instrucao` e só aparece no verde.
      vereditos: [
        { id: "nitrato", avaliar: vereditoNitrato },
        { id: "betabloqueador", avaliar: vereditoBetabloqueador },
      ],
      actions: [
        "AAS já administrado (300 mg). Manter 81–100 mg/dia.",
        "2º antiplaquetário: se ICP primária → ticagrelor 180 mg OU prasugrel 60 mg — ACC/AHA 2025 recomenda ticagrelor/prasugrel PREFERENCIALMENTE ao clopidogrel na ICP. Se fibrinólise → clopidogrel; até 75 anos, ataque de 300 mg; 75 anos ou mais, SEM ataque — 75 mg direto.",
        PRASUGREL_RESTRICOES,
        "Anticoagulação: enoxaparina 1 mg/kg SC 12/12h = {enoxaPorPeso} mg (≥ 75a: 0,75 mg/kg = {enoxa75PorPeso} mg, sem bolus IV; ClCr < 30: 24/24h) OU HNF bolus {hnfBolus} U IV + {hnfInf} U/h (ajuste por TTPa).",
        "{avisoPeso}",
        "Estatina de alta intensidade: atorvastatina 40–80 mg VO (alternativa: rosuvastatina 20–40 mg).",
        "Nitrato e morfina só se necessário — dose abaixo, contraindicações valem para os dois:",
        NITRATO_MONITORIZACAO,
        MORFINA_TETO,
        "Contraindicações do nitrato e da morfina — quando NÃO usar:",
        NITRATO_ALERTAS_SCA,
        VD_CONTRAINDICA_PRE_CARGA,
        NITRATO_CONTRAINDICACAO_PDE5,
        NITRATO_PDE5_USO_CRONICO,
        NITRATO_OUTRAS_CONTRAINDICACOES,
        MORFINA_CONTRAINDICACOES,

        BETABLOQUEADOR_IV_SEPARADO,
        BETABLOQUEADOR_CONTRAINDICACAO,
      ],
      next: "reavaliacao_pos_intervencao",
    },

    // ⚠️ INÍCIO INDETERMINADO NÃO É "<12 h" (decisão do autor, 2026-08-25) —
    // e também não é ">12 h". É um terceiro estado, que NÃO abre a
    // fibrinólise. A reclassificação existe e é legítima; o que não vale é o
    // app assumir sozinho que "intermitente" significa dentro da janela.
    stemi_tempo_confiavel: {
      id: "stemi_tempo_confiavel",
      type: "decision",
      title: "REPERFUSÃO · Início dos sintomas",
      question: "Dá para estabelecer um início contínuo e confiável para ESTE episódio?",
      summary: "⚠️ Início indeterminado não libera fibrinólise — a incerteza não vira elegibilidade para uma terapia hemorrágica.",
      evidence: [
        "Dor intermitente que cessou e recomeçou: o que conta é o início do episódio ATUAL, contínuo, que motivou a vinda.",
        "Se o paciente acordou com a dor, o início é indeterminado — não se conta a partir de quando acordou.",
        "Sem um início confiável, a via é a estratégia invasiva/transferência, com avaliação especializada.",
      ],
      options: [
        { id: "sim", label: "Sim — consigo definir o início do episódio atual", next: "stemi_tempo_reclassificar", grava: { campo: "tempo_confiavel", valor: "sim" } },
        { id: "nao", label: "Não — permanece indeterminado", next: "stemi_tempo_indeterminado", grava: { campo: "tempo_confiavel", valor: "nao" } },
      ],
    },

    stemi_tempo_reclassificar: {
      id: "stemi_tempo_reclassificar",
      type: "input",
      title: "REPERFUSÃO · Início do episódio atual",
      intro: "Toque na janela do episódio atual, contínuo.",
      fields: [
        {
          id: "tempo_confirmado",
          label: "Início do episódio atual",
          presets: [
            { value: "< 1 h", label: "< 1 h" },
            { value: "1–3 h", label: "1–3 h" },
            { value: "3–6 h", label: "3–6 h" },
            { value: "6–12 h", label: "6–12 h" },
            { value: "12–24 h", label: "12–24 h" },
            { value: "> 24 h", label: "> 24 h" },
          ],
        },
      ],
      next: "stemi_cenario_icp",
    },

    stemi_tempo_indeterminado: {
      id: "stemi_tempo_indeterminado",
      type: "action",
      title: "Início indeterminado — fibrinólise não liberada",
      summary: "Sem início confiável, a via é a estratégia invasiva — não a fibrinólise.",
      enfase: "resultado_alerta",
      actions: [
        "Transferência urgente para centro com hemodinâmica.",
        "Acionar avaliação sênior/cardiologia para decidir a estratégia.",
        "Reavaliar a história: se o início do episódio atual ficar claro, voltar e reclassificar.",
      ],
      porque: [
        "Tratar incerteza temporal como se fosse janela aberta transformaria a dúvida em autorização para uma terapia hemorrágica. Tratar como fora da janela negaria reperfusão a quem talvez estivesse dentro dela. Por isso este é um terceiro estado, com via própria.",
      ],
      next: "stemi_transfer",
    },

    // ⚠️ A META NÃO É UMA FRASE SÓ (correção do autor, 2026-08-25) — quem já
    // está num serviço com hemodinâmica tem META de 90 min, não "ideal" de
    // 90; quem precisa transferir trabalha com o teto de 120 min.
    stemi_cenario_icp: {
      id: "stemi_cenario_icp",
      type: "decision",
      title: "REPERFUSÃO · Cenário",
      question: "Onde o paciente está agora?",
      summary: "A meta de tempo muda com o cenário — e é ela que decide a estratégia.",
      options: [
        { id: "no_local", label: "Serviço COM hemodinâmica — sem transferência", next: "stemi_reperfusao", grava: { campo: "cenarioIcp", valor: "no_local" } },
        { id: "transferencia", label: "Hospital SEM hemodinâmica — precisa transferir", next: "stemi_reperfusao", grava: { campo: "cenarioIcp", valor: "transferencia" } },
      ],
    },

    stemi_reperfusao: {
      id: "stemi_reperfusao",
      type: "decision",
      title: "Estratégia de reperfusão",
      question: "A ICP primária pode ser realizada dentro da meta de tempo?",
      summary: "Meta: 90 min no serviço com hemodinâmica · 120 min quando precisa transferir (primeiro contato médico até o dispositivo). {metaIcp}",
      evidence: [
        STEMI_RELOGIO_DECIDE,
        "ACC/AHA 2025, Classe 1 A: FMC-dispositivo ≤ 120 min → ICP primária é a estratégia preferida.",
        "ACC/AHA 2025, Classe 1 A: sintomas < 12 h e atraso previsto > 120 min de FMC, sem contraindicação → fibrinólise.",
        "Meta ideal de FMC-dispositivo: ≤ 90 min quando transporte direto a hospital com ICP for viável desde o pré-hospitalar.",
        "Reperfusão indicada até 12 h; entre 12–24 h, benefício não estabelecido — considerar se grande área em risco/instabilidade e ICP indisponível.",
      ],
      // ⚠️ O QUE JÁ ESTÁ CORRENDO ENQUANTO ESTA DECISÃO É TOMADA — não vira
      // tela, não vira fila. Ver `ParallelAction` em core/decision-tree/types.ts.
      emParalelo: [
        { id: "monitor_paralelo", tipo: "informa", label: "Monitorização, acessos e coleta seguem em curso." },
        { id: "equipe_paralelo", tipo: "aciona", label: "Equipe/hemodinâmica pode ser avisada já, antes mesmo desta resposta." },
      ],
      options: [
        { id: "icp", label: "Sim — dentro da meta", next: "stemi_icp", grava: { campo: "icpDentroDaMeta", valor: "sim" } },
        // ⚠️ "NÃO" NÃO CONCLUI FIBRINÓLISE (correção do autor, 2026-08-25) —
        // vai ao funil, que deriva pela janela temporal. A fibrinólise é só
        // UM dos quatro destinos possíveis a partir dali.
        { id: "fibrino", label: "Não — fora da meta", next: "stemi_via_sem_icp", grava: { campo: "icpDentroDaMeta", valor: "nao" } },
      ],
    },

    stemi_icp: {
      id: "stemi_icp",
      type: "action",
      title: "Angioplastia primária (ICP)",
      summary: "Reperfusão mecânica preferencial. Meta ideal de FMC-dispositivo ≤ 90 min.",
      actions: [
        "Acionar a sala de hemodinâmica imediatamente; transporte monitorizado.",
        "Confirmar dupla antiagregação antes do procedimento.",
        "HEPARINA NÃO FRACIONADA peri-ICP — bolus IV por peso, TITULADO POR TCA na sala:",
        "  • SEM inibidor de GP IIb/IIIa: {hnfIcpSemGpMin}–{hnfIcpSemGpMax} U (70–100 U/kg), alvo de TCA 250–300 s (Hemotec) ou 300–350 s (Hemochron).",
        "  • COM inibidor de GP IIb/IIIa: {hnfIcpComGpMin}–{hnfIcpComGpMax} U (50–70 U/kg), alvo de TCA 200–250 s.",
        "{avisoPeso}",
        "  • ⚠️ A dose é ponto de partida, não prescrição fechada: quem titula é o TCA medido na hemodinâmica.",
        "Manter monitorização, tratar arritmias e instabilidade durante o transporte.",
        "Não atrasar a ICP por exames complementares.",
      ],
      // ⚠️ AQUI ESTÁ A DIFERENÇA CLÍNICA QUE O AUTOR EXIGIU EXPLÍCITA
      // (2026-08-25): no ramo da ICP, peso e antitrombóticos NÃO são
      // dependência temporal da reperfusão — acontecem enquanto a sala é
      // preparada e o paciente transportado. As telas seguintes existem por
      // necessidade de interface (o app precisa capturar o peso para
      // calcular dose), mas o enquadramento diz que nada disso segura a
      // hemodinâmica. No ramo da FIBRINÓLISE é o oposto: lá contraindicação
      // e peso bloqueiam de verdade, porque sem eles não se administra.
      emParalelo: [
        { id: "peso_paralelo", tipo: "coleta", campo: "peso", label: "Peso para as doses — pode ser obtido durante o preparo." },
        { id: "antitromboticos_paralelo", tipo: "informa", label: "Antitrombóticos e adjuvantes: iniciar em paralelo, sem segurar a sala." },
        { id: "acessos_paralelo", tipo: "informa", label: "Acessos, exames e monitorização seguem durante o transporte." },
      ],
      next: "stemi_dados",
    },

    // ⚠️ O FUNIL — nenhuma pergunta, só derivação. Existe porque "ICP fora da
    // meta" NÃO significa "fibrinólise": significa que a janela temporal
    // passa a decidir. Três dos quatro destinos daqui NÃO fibrinolisam, e é
    // isso que torna estruturalmente impossível a apresentação tardia ou o
    // início indeterminado alcançarem o fibrinolítico.
    stemi_via_sem_icp: {
      id: "stemi_via_sem_icp",
      type: "action",
      title: "REPERFUSÃO · ICP fora da meta",
      summary: "Janela desde o início dos sintomas: {janelaReperfusao}. É ela que decide a via agora.",
      actions: ["Seguindo pela janela temporal — a fibrinólise não é automática."],
      next: {
        possiveis: ["stemi_fibrino_check", "stemi_12_24", "stemi_tardio_isquemia", "stemi_tempo_indeterminado"],
        escolher: (values) => {
          const j = derivarJanelaReperfusao(values);
          if (j === "<12h") return "stemi_fibrino_check";
          if (j === "12_24h") return "stemi_12_24";
          if (j === ">24h") return "stemi_tardio_isquemia";
          return "stemi_tempo_indeterminado";
        },
      },
    },

    stemi_12_24: {
      id: "stemi_12_24",
      type: "action",
      title: "12–24 h — a via é a transferência para ICP",
      summary: "≥ 12 h: nesta janela a ICP é razoável e a fibrinólise sai da rota automática — o benefício dela após 12 h não está estabelecido.",
      enfase: "resultado_alerta",
      actions: [
        "Transferência urgente para centro com hemodinâmica.",
        "Manter monitorização, antitrombóticos e tratamento anti-isquêmico durante o transporte.",
      ],
      porque: [
        "ACC/AHA 2025: entre 12 e 24 h, a ICP primária é razoável para melhorar desfechos. O benefício da fibrinólise após 12 h não está estabelecido de forma geral.",
        "⚠️ SITUAÇÃO EXCEPCIONAL — apresentação ≥ 12 h com instabilidade hemodinâmica ou grande território miocárdico em risco, quando a ICP oportuna é impossível: pode haver circunstâncias em que o benefício da fibrinólise supere o risco. Isto é DECISÃO ESPECIALIZADA INDIVIDUALIZADA — este app não prescreve fibrinólise automaticamente após 12 h, e por isso não há botão para ela aqui.",
      ],
      next: "stemi_transfer",
    },

    stemi_tardio_isquemia: {
      id: "stemi_tardio_isquemia",
      type: "decision",
      title: "> 24 h — há isquemia ou instabilidade AGORA?",
      question: "Isquemia persistente/recorrente, instabilidade hemodinâmica, IC aguda grave ou arritmia ameaçadora à vida?",
      summary: "Depois de 24 h, é o quadro atual — não o relógio — que decide se há indicação invasiva.",
      evidence: [
        "ACC/AHA 2025: > 24 h, com isquemia em curso ou arritmia ameaçadora à vida, a ICP é razoável.",
        "Choque/instabilidade hemodinâmica indica revascularização emergencial INDEPENDENTEMENTE do tempo desde o início.",
        "Paciente estável, assintomático, com artéria totalmente ocluída > 24 h e sem isquemia em curso, IC aguda grave ou arritmia ameaçadora: a ICP de rotina NÃO oferece benefício.",
      ],
      options: [
        { id: "sim", label: "Sim — algum destes está presente", next: "stemi_transfer" },
        { id: "nao", label: "Não — estável e assintomático", next: "stemi_tardio_estavel" },
        { id: "nao_sei", label: "Não sei — me ajude a avaliar", next: "stemi_tardio_ajuda" },
      ],
    },

    stemi_tardio_ajuda: {
      id: "stemi_tardio_ajuda",
      type: "decision",
      title: "Esclarecendo o quadro atual",
      question: "Com estes critérios objetivos, algum está presente?",
      evidence: [
        "Isquemia persistente/recorrente = dor isquêmica agora, ou supra que não regrediu, ou alterações dinâmicas novas.",
        "Instabilidade hemodinâmica = hipotensão, sinais de hipoperfusão ou necessidade de vasopressor.",
        "IC aguda grave = congestão pulmonar com desconforto/hipoxemia ou necessidade de suporte ventilatório.",
        "Arritmia ameaçadora à vida = TV sustentada, FV revertida, ou bloqueio de alto grau com repercussão.",
      ],
      options: [
        { id: "sim", label: "Sim, algum está presente", next: "stemi_transfer" },
        { id: "nao", label: "Não, nenhum deles", next: "stemi_tardio_estavel" },
      ],
    },

    stemi_tardio_estavel: {
      id: "stemi_tardio_estavel",
      type: "action",
      title: "> 24 h, estável — sem reperfusão de rotina",
      summary: "Sem isquemia em curso nem instabilidade, a reperfusão de rotina não oferece benefício.",
      actions: [
        "Não indicar ICP de rotina apenas pelo tempo decorrido.",
        "Avaliação cardiológica para estratégia individualizada.",
        "Manter monitorização, antitrombóticos e prevenção secundária.",
        "Reclassificar imediatamente se surgir dor, instabilidade, IC ou arritmia.",
      ],
      porque: [
        "ACC/AHA 2025: em paciente estável, assintomático, com artéria relacionada ao infarto totalmente ocluída há mais de 24 h e sem isquemia em curso, IC aguda grave ou arritmia ameaçadora à vida, a ICP de rotina não oferece benefício.",
      ],
      next: "reavaliacao_pos_intervencao",
    },

    stemi_fibrino_check: {
      id: "stemi_fibrino_check",
      type: "decision",
      title: "Contraindicações à fibrinólise",
      summary: STEMI_RELATIVA_PESA_O_TEMPO,
      question: "Há alguma contraindicação ABSOLUTA à fibrinólise?",
      evidence: [
        "Qualquer hemorragia intracraniana prévia; AVC isquêmico nos últimos 3 meses (exceto isquêmico agudo < 4,5 h).",
        "Lesão vascular cerebral estrutural ou neoplasia intracraniana maligna conhecida; TCE/trauma facial fechado significativo < 3 meses.",
        "Sangramento ativo ou diátese hemorrágica (exceto menstruação); suspeita de dissecção de aorta.",
        "Cirurgia intracraniana/intraespinhal < 2 meses; HAS grave não controlada/refratária (> 180/110).",
        "── CONTRAINDICAÇÕES RELATIVAS — não proíbem, mudam a conta ──",
        "HAS significativa na apresentação (> 180/110); AVC isquêmico > 3 meses; demência; RCP traumática/prolongada (> 10 min); cirurgia de grande porte < 3 semanas; sangramento interno recente (2–4 semanas); punção vascular não compressível; gestação; úlcera péptica ativa; anticoagulação oral em uso.",
        "⚠️ A ACC/AHA 2025 avisa: esta lista é orientativa para a decisão clínica e PODE NÃO SER exaustiva nem definitiva — não tratar como lista fechada.",
        "⚠️ COM RELATIVA E SEM ABSOLUTA, o que pesa é o TEMPO ATÉ A ICP: dentro de 120 min do primeiro contato → prefira ICP. Não sendo viável, STEMI extenso nas primeiras horas costuma justificar fibrinólise mesmo com relativa. Discuta com a hemodinâmica, mas NÃO ADIE a decisão esperando resposta.",
      ],
      options: [
        { id: "sem", label: "Sem contraindicação ABSOLUTA nem RELATIVA", next: "stemi_fibrino_confirma", grava: { campo: "ciAbsolutas", valor: "nao" } },
        { id: "com", label: "Há contraindicação ABSOLUTA", next: "stemi_transfer", grava: { campo: "ciAbsolutas", valor: "sim" } },
        { id: "relativa", label: "Há RELATIVA, sem absoluta", next: "stemi_fibrino_relativa", grava: { campo: "ciRelativas", valor: "sim" } },
        // ⚠️ "NÃO SEI" NÃO ATRAVESSA MAIS (correção do autor, 2026-08-25) —
        // antes esta opção abria a lista e a lista seguia RETO para a
        // administração: quem hesitava terminava trombolisando, o default
        // mais perigoso possível aqui. Agora a ajuda RECALCULA o estado.
        { id: "nao_sei", label: "Não sei dizer — me ajude item a item", next: "ci_sca_lista" },
      ],
    },

    // Passo curto que fecha a segunda dimensão (relativas) sem repetir a
    // lista — quem afirmou "nem absoluta nem relativa" só confirma.
    stemi_fibrino_confirma: {
      id: "stemi_fibrino_confirma",
      type: "action",
      title: "Contraindicações — confirmado",
      summary: "Nenhuma contraindicação absoluta nem relativa identificada.",
      actions: ["Elegível para fibrinólise: seguir para o peso e a dose."],
      next: "stemi_dados_fibrino",
    },

    // ⚠️ A AJUDA RECALCULA — não conclui. Qualquer item que permaneça em
    // dúvida devolve `nao_resolvido`, e `nao_resolvido` não tem aresta para
    // o fibrinolítico: vai para transferência.
    // ⚠️ A LISTA DEIXOU DE CONCLUIR (correção do autor, 2026-08-25). Ela era
    // um nó de ação que exibia os itens e seguia RETO para a administração:
    // quem respondia "não sei" terminava trombolisando. O conteúdo é o mesmo,
    // de fonte única; o que mudou é o destino — agora ela alimenta a pergunta
    // que RECALCULA o estado, e a dúvida não atravessa.
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
      next: "stemi_fibrino_ajuda",
    },

    stemi_fibrino_ajuda: {
      id: "stemi_fibrino_ajuda",
      type: "input",
      title: "Contraindicações — item a item",
      intro: "Responda pelos dois blocos. O app recalcula — a dúvida não libera a fibrinólise.",
      fields: [
        {
          id: "ciAbsolutas",
          label: "ABSOLUTAS — alguma presente? Hemorragia intracraniana prévia; AVC isquêmico < 3 meses (exceto agudo < 4,5 h); lesão vascular cerebral estrutural ou neoplasia intracraniana maligna; TCE/trauma facial fechado significativo < 3 meses; sangramento ativo ou diátese hemorrágica; suspeita de dissecção de aorta; cirurgia intracraniana/intraespinhal < 2 meses; HAS grave não controlada.",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "nao_sei", label: "Não sei" },
          ],
        },
        {
          id: "ciRelativas",
          label: "RELATIVAS — alguma presente? HAS significativa na apresentação (> 180/110); AVC isquêmico > 3 meses; demência; RCP traumática/prolongada; cirurgia de grande porte < 3 semanas; sangramento interno recente; punção vascular não compressível; gestação; úlcera péptica ativa; anticoagulação oral em uso.",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "nao_sei", label: "Não sei" },
          ],
        },
      ],
      next: {
        possiveis: ["stemi_dados_fibrino", "stemi_fibrino_relativa", "stemi_transfer"],
        escolher: (values) => {
          const e = derivarEstadoContraindicacao(values);
          if (e === "nenhuma") return "stemi_dados_fibrino";
          if (e === "relativa") return "stemi_fibrino_relativa";
          // `absoluta` e `nao_resolvido` compartilham o destino seguro.
          return "stemi_transfer";
        },
      },
    },

    // ⚠️ O MOTOR NÃO DECIDE AQUI (decisão do autor, 2026-08-25) — com
    // relativa e sem absoluta, quem pesa risco × benefício é o médico. O app
    // mostra o que pesa e exige a escolha explícita.
    stemi_fibrino_relativa: {
      id: "stemi_fibrino_relativa",
      type: "decision",
      title: "Contraindicação RELATIVA — decisão médica",
      question: "Diante do risco × benefício, qual a decisão?",
      summary: "Relativa não proíbe — muda a conta: se a ICP for viável dentro da meta (90/120 min), prefira a ICP. E quem faz a conta é você, não o app.",
      evidence: [
        STEMI_RELATIVA_PESA_O_TEMPO,
        "⚠️ COM RELATIVA E SEM ABSOLUTA, o que pesa é o TEMPO ATÉ A ICP: se a transferência para hemodinâmica for viável dentro da meta, prefira a ICP.",
        "STEMI extenso nas primeiras horas, com ICP inviável, costuma justificar a fibrinólise mesmo com relativa — mas a decisão é individual.",
      ],
      options: [
        { id: "fibrinolisar", label: "Fibrinolisar — benefício supera o risco", next: "stemi_dados_fibrino", grava: { campo: "decisaoRelativa", valor: "fibrinolisar" } },
        { id: "nao_fibrinolisar", label: "Não fibrinolisar — transferir para ICP", next: "stemi_transfer", grava: { campo: "decisaoRelativa", valor: "nao_fibrinolisar" } },
      ],
    },

    stemi_fibrinolise: {
      id: "stemi_fibrinolise",
      type: "action",
      title: "Fibrinólise — dose calculada",
      // ⚠️ VISÍVEL AQUI, NÃO SÓ NA TELA ANTERIOR (Etapa 2, 2026-08-24). A
      // checagem de contraindicação ABSOLUTA foi feita no nó anterior
      // (`stemi_fibrino_check`) — mas quem está prestes a CONFIRMAR a dose
      // não deveria depender só da memória do que respondeu um toque atrás.
      // Pedido do autor: "contraindicações que mudam diretamente a segurança
      // da ação devem permanecer visíveis antes da confirmação".
      summary: "⚠️ Contraindicação ABSOLUTA já revisada nesta sessão — se algo mudou desde então (novo sangramento, PA disparou, suspeita de dissecção), pare e reavalie antes de confirmar. Fibrinólise assim que possível, sempre seguida de estratégia fármaco-invasiva.",
      actions: [
        "Tenecteplase (TNK) {tnk} mg IV em bolus único.",
        TENECTEPLASE_REGIME_IAM,
        TENECTEPLASE_APRESENTACAO,
        "{avisoPeso}",
        "≥ 75 anos: meia dose ({tnkHalf} mg) SOMENTE em estratégia fármaco-invasiva com apresentação até 3 h do início dos sintomas (STREAM-2). Fora dessa condição, usar a DOSE INTEGRAL.",
        "Clopidogrel: 300 mg de ataque; 75 mg sem ataque se ≥ 75 anos.",
        "Enoxaparina < 75 anos: bolus IV de 30 mg + {enoxa} mg SC 12/12h (1 mg/kg, máx 100 mg nas duas primeiras doses; a partir da terceira, {enoxaPorPeso} mg).",
        "Enoxaparina ≥ 75 anos: SEM bolus IV; {enoxa75} mg SC 12/12h (0,75 mg/kg, máx 75 mg nas duas primeiras doses; a partir da terceira, {enoxa75PorPeso} mg).",
        "ClCr < 30 mL/min: espaçar a enoxaparina para 24/24h. HNF é alternativa.",
        ENOXAPARINA_REGIME_IAM,
        ENOXAPARINA_APRESENTACAO,
        "Transferir para centro com ICP: angiografia sistemática entre 2–24 h com intenção de ICP, MESMO com reperfusão aparentemente bem-sucedida (ACC/AHA 2025, Classe 1 B-R).",
      ],
      next: "stemi_pos_fibrinolise",
    },

    // ⚠️ ESTRATÉGIA FARMACOINVASIVA — o que faltava (correção do autor,
    // 2026-08-25). Antes, fibrinólise bem-sucedida ia direto para prevenção
    // secundária: o paciente ficava sem a transferência e sem a angiografia
    // precoce, que são Classe 1 na diretriz de 2025. As três recomendações
    // vivem estruturadas em `lib/reperfusao-stemi.ts` para poderem ser
    // auditadas automaticamente, não como texto solto.
    stemi_pos_fibrinolise: {
      id: "stemi_pos_fibrinolise",
      type: "action",
      title: "Fibrinólise feita — TRANSFERIR AGORA",
      summary: "A transferência para centro com ICP é imediata, não depende do resultado da lise.",
      enfase: "resultado_critico",
      actions: [
        "Acionar transferência para centro com hemodinâmica IMEDIATAMENTE.",
        FARMACOINVASIVA_TRANSFERIR,
        "Transporte monitorizado, com desfibrilador.",
      ],
      emParalelo: [
        { id: "adjuvantes_pos_lise", tipo: "informa", label: "Antitrombóticos adjuvantes e monitorização seguem durante o transporte." },
        { id: "reperfusao_watch", tipo: "informa", label: "Sinais de reperfusão vão sendo avaliados no caminho — não espere para transferir." },
      ],
      porque: [FARMACOINVASIVA_RESGATE, FARMACOINVASIVA_PRECOCE],
      next: "stemi_meds",
    },

    // Alcançado por "reperfusão bem-sucedida" na reavaliação.
    stemi_farmacoinvasiva: {
      id: "stemi_farmacoinvasiva",
      type: "action",
      title: "Reperfusão bem-sucedida — angiografia precoce",
      summary: "Sucesso da lise não encerra a via: a angiografia precoce é parte da estratégia.",
      actions: [
        "Programar angiografia entre 2 e 24 h após a fibrinólise, com intenção de ICP quando indicada.",
        FARMACOINVASIVA_PRECOCE,
        "Manter monitorização, antitrombóticos e ECG seriado até a angiografia.",
      ],
      next: "prevencao_secundaria",
    },

    stemi_transfer: {
      id: "stemi_transfer",
      type: "action",
      title: "Transferência urgente para ICP",
      summary: "Fibrinólise contraindicada (ou padrão fora da fibrinólise) → reperfusão mecânica é a via.",
      actions: [
        "Acionar transferência imediata para centro com hemodinâmica (ICP de resgate/primária).",
        "Transporte monitorizado com desfibrilador; manter antitrombóticos conforme serviço.",
        "Comunicar a hemodinâmica de destino para reduzir o tempo até o dispositivo.",
        "Tratar instabilidade hemodinâmica/elétrica durante o transporte.",
      ],
      next: "stemi_dados",
    },

    // ════════════════════ RAMO SCA SEM SUPRA DE ST ═══════════════════════════
    //
    // ⚠️ TRÊS TELAS DE 2 CARDS (2026-08-24, quarta correção pós-validação
    // física). Os traçados reais engordaram até 3 cards + 3 saídas o
    // bastante para reintroduzir scroll — pedido explícito: "não resolver
    // comprimindo a imagem... se imagem + opções não cabem, dividir em mais
    // uma tela curta". 6 padrões (De Winter/Posterior/T-hiperagudas/aVR/
    // Wellens A/Wellens B) → 3 telas de 2, imagem grande mantida.
    //
    // TELA 1 (`ecg_sem_supra`): De Winter + Posterior.
    // TELA 2 (`ecg_padroes_t_avr`, só por "Outro padrão"): T hiperagudas + aVR.
    // TELA 3 (`ecg_padroes_wellens`, só por "Outro padrão" da tela 2): Wellens A + B.
    // Cada uma das 3 primeiras telas tem "Nenhum desses" e "Não sei / preciso
    // de ajuda" sempre visíveis — não é preciso navegar até o fim para sair.
    //
    // ⚠️ ROTEAMENTO INALTERADO — mesmos destinos de sempre (De Winter/
    // posterior/T-hiperaguda → `ecg_grupoB_oclusao`; aVR → `ecg_avr_conduta`;
    // Wellens A/B → `wellens_conduta`, nunca `stemi_*`; nenhum → `nste_trop`
    // nas três telas).
    ecg_sem_supra: {
      id: "ecg_sem_supra",
      type: "decision",
      title: "ECG · Padrões sem supra",
      question: "Compare com estes 2 padrões.",
      // ⚠️ REDIGIDO (correção final 2026-08-25, item 5) — "mesma urgência do
      // STEMI — sala AGORA" ensinava que o padrão É um STEMI clássico; ele
      // não é (De Winter/Posterior não têm supra). Preserva a urgência sem
      // ensinar equivalência incorreta.
      // ⚠️ A PRECEDÊNCIA ("antes de") PRECISA FICAR VISÍVEL, NÃO SÓ NO
      // `evidence` RECOLHIDO (`scripts/valida-prazo-visivel.cjs`) — o título
      // antigo ("Antes de chamar de 'sem supra'") carregava esse sinal; ao
      // renomear o título para o padrão fase·subfase, o sinal precisa
      // migrar para cá, não desaparecer.
      summary: "⚠️ Avalie estes padrões ANTES de classificar como \"sem supra\" — três dos cinco são estratégia invasiva emergente.",
      // ⚠️ TEXTO COMPLETO DE CADA PADRÃO VIVE AQUI — "Ver critérios", camada
      // secundária, não a tela principal. O card mostra só 1 frase de
      // reconhecimento + consequência.
      evidence: [
        ECG_DUVIDA_O_QUE_FAZER,
        OMI_ENQUADRAMENTO,
        OCLUSAO_DE_WINTER,
        OCLUSAO_POSTERIOR,
        DERIVACOES_POSTERIORES_COMO,
      ],
      comparativo: [
        {
          figura: "ecg_de_winter",
          rotulo: "De Winter",
          significado: "ST ascendente + T altas/simétricas nas precordiais.",
          conduta: "Padrão de alto risco — avaliação invasiva emergente.",
          // ⚠️ O CARD É O PRÓPRIO BOTÃO (2026-08-24) — toca aqui, escolhe
          // "de_winter" abaixo, sem repetir o nome como linha de texto.
          optionId: "de_winter",
          // ⚠️ FOTO DE REFERÊNCIA REAL (Bloco 4, 2026-08-24) — substitui o
          // traçado sintético. Fornecida pelo autor; não gerada. Id resolvido
          // em `assets-ecg-referencias.ts` (o `require()` do arquivo de
          // imagem fica lá, não aqui — este arquivo precisa continuar
          // require()ável por Node puro, fora do Metro, para os validadores).
          imagemReal: "de-winter",
        },
        {
          figura: "ecg_posterior",
          rotulo: "Posterior",
          significado: "Infra V1–V3 / R alta.",
          // ⚠️ TEXTO EXATO PEDIDO — mesmo destino/urgência clínica (Grupo B,
          // `ecg_grupoB_oclusao`); a conduta completa (mesma urgência do
          // STEMI) fica em `evidence` (`OCLUSAO_POSTERIOR`).
          conduta: "Suspeitar de oclusão posterior — obter V7–V9.",
          optionId: "posterior",
          imagemReal: "posterior",
        },
      ],
      options: [
        { id: "de_winter", label: "De Winter", next: "ecg_grupoB_oclusao" },
        { id: "posterior", label: "Posterior", next: "ecg_grupoB_oclusao" },
        { id: "outro_padrao", label: "Outro padrão", next: "ecg_padroes_t_avr" },
        { id: "nenhum", label: "Nenhum desses", next: "nste_trop" },
        { id: "incerto", label: "Não sei / preciso de ajuda", next: "ecg_sem_supra_duvida" },
      ],
    },

    // ── TELA 2 — só por "Outro padrão" da tela 1 ───────────────────────────
    ecg_padroes_t_avr: {
      id: "ecg_padroes_t_avr",
      type: "decision",
      title: "ECG · Outros padrões sem supra",
      question: "Compare com estes 2.",
      // ⚠️ REESCRITO (Bloco 4, correção 2026-08-24) — "aVR aqui é sala
      // urgente, mas sem fibrinólise" era forte demais como regra
      // automática: supra em aVR + infra difuso é isquemia subendocárdica
      // global de alto risco, mas a urgência da estratégia invasiva depende
      // do contexto clínico (instabilidade, alterações dinâmicas, troponina,
      // risco global) — não é "sala agora" isolado do achado de ECG.
      summary: "Padrão de alto risco — exige avaliação invasiva urgente conforme contexto clínico.",
      evidence: [OCLUSAO_T_HIPERAGUDA, OCLUSAO_AVR_TRONCO],
      comparativo: [
        {
          figura: "ecg_t_hiperaguda",
          rotulo: "T hiperagudas",
          significado: "T larga, simétrica, desproporcional ao QRS.",
          // ⚠️ TEXTO EXATO PEDIDO — mesmo destino (`ecg_grupoB_oclusao`); a
          // conduta completa fica em `evidence` (`OCLUSAO_T_HIPERAGUDA`).
          conduta: "Alto risco — reavaliar ECG / estratégia invasiva conforme contexto.",
          optionId: "t_hiperaguda",
          // ⚠️ FOTO DE REFERÊNCIA REAL (Bloco 4, 2026-08-24) — recorte V2–V4
          // da referência fornecida pelo autor, cabeçalho de paciente e
          // setas/texto originais removidos (inpainting só sobre os pixels
          // vermelhos; traçado preto intocado). Aprovada sem ajuste.
          imagemReal: "t-hiperaguda",
        },
        {
          // ⚠️ TEXTO AJUSTADO (pedido explícito): não rotular como "tronco/
          // multiarterial" de forma CONCLUSIVA — isso é o que o ECG SUGERE,
          // não o que ele PROVA sozinho. A associação com tronco/multiarterial/
          // DA proximal fica em "Por quê?" (`OCLUSAO_AVR_TRONCO`, em `evidence`).
          figura: "ecg_avr_tronco",
          rotulo: "aVR + infra difuso",
          // ⚠️ REESCRITO (correção 2026-08-24) — troca de "Padrão de isquemia
          // subendocárdica/global de alto risco" (linguagem de conclusão) por
          // descrição do achado observável, aprovada pelo autor.
          significado: "Supra em aVR com depressão difusa do ST.",
          // ⚠️ TEXTO EXATO APROVADO PELO AUTOR — não encurtar.
          conduta: "Avaliação invasiva urgente; não é indicação automática de fibrinólise.",
          optionId: "avr",
          // ⚠️ FOTO DE REFERÊNCIA REAL (Bloco 4, correção 2026-08-24) —
          // recorte de aVR, I, II, V4 (removidos V5/V6, ilustração e título,
          // pedido explícito: "não uma miniatura... imagem deve ocupar
          // praticamente toda a largura útil do card"). Traçado intocado.
          imagemReal: "avr-infra-difuso",
        },
      ],
      options: [
        { id: "t_hiperaguda", label: "T hiperagudas", next: "ecg_grupoB_oclusao" },
        { id: "avr", label: "aVR + infra difuso", next: "ecg_avr_conduta" },
        { id: "outro_padrao", label: "Outro padrão", next: "ecg_padroes_wellens" },
        { id: "nenhum", label: "Nenhum desses", next: "nste_trop" },
        { id: "incerto", label: "Não sei / preciso de ajuda", next: "ecg_sem_supra_duvida" },
      ],
    },

    // ── TELA 3 — só por "Outro padrão" da tela 2 ───────────────────────────
    ecg_padroes_wellens: {
      id: "ecg_padroes_wellens",
      type: "decision",
      title: "Wellens — reperfusão espontânea",
      question: "Compare com estes 2.",
      summary: "⚠️ NÃO é indicação de fibrinólise automática.",
      evidence: [WELLENS_NAO_E_OCLUSAO, WELLENS_NUNCA_ERGOMETRICO],
      comparativo: [
        {
          // ⚠️ TEXTO AJUSTADO (pedido explícito): "sem dor ativa" saiu do
          // card — não é critério obrigatório de reconhecimento visual, é
          // dado de CONTEXTO avaliado depois, em `wellens_conduta`.
          figura: "ecg_wellens_a",
          rotulo: "Wellens A",
          significado: "T bifásica em V2–V4, contexto compatível.",
          conduta: "Alto risco, sem reperfusão emergente. Nunca teste ergométrico.",
          optionId: "wellens_a",
        },
        {
          figura: "ecg_wellens_b",
          rotulo: "Wellens B",
          significado: "T profundamente invertida e simétrica em V2–V4, contexto compatível.",
          conduta: "Alto risco, sem reperfusão emergente. Nunca teste ergométrico.",
          optionId: "wellens_b",
        },
      ],
      options: [
        { id: "wellens_a", label: "Wellens A", next: "wellens_conduta", grava: { campo: "padrao_alto_risco", valor: "sim" } },
        { id: "wellens_b", label: "Wellens B", next: "wellens_conduta", grava: { campo: "padrao_alto_risco", valor: "sim" } },
        { id: "nenhum", label: "Nenhum desses", next: "nste_trop" },
        { id: "incerto", label: "Não sei / preciso de ajuda", next: "ecg_sem_supra_duvida" },
      ],
    },

    // ── Grupo B — oclusão fortemente sugestiva, estratégia invasiva EMERGENTE,
    // fibrinólise NÃO é a via padrão (literatura mostra eficácia inconsistente
    // no De Winter; não há via de fibrinólise estabelecida para estes padrões).
    //
    // ⚠️ SEM "LIVRO" (2026-08-24, correção de composição): `summary`/`actions`
    // traziam o parágrafo inteiro de `OCLUSAO_ACHEI_UM_PADRAO` (~400
    // caracteres) como texto PRINCIPAL. Regra do autor: "na tela principal só
    // pergunta/achado/critério curto/consequência curta/ação — o resto vai
    // para Por quê?". O parágrafo completo (com as ressalvas de aVR/Wellens)
    // agora vive em `porque`, atrás do toque "Por que isto".
    ecg_grupoB_oclusao: {
      id: "ecg_grupoB_oclusao",
      type: "action",
      title: "Oclusão coronariana de alto risco — sala agora",
      // ⚠️ REDIGIDO (correção final 2026-08-25, item 5) — mesmo princípio.
      summary: "Padrão sugestivo de oclusão coronariana aguda — ICP/transferência, não fibrinólise.",
      enfase: "resultado_alerta",
      actions: [
        "Reperfusão indicada com a mesma urgência do STEMI.",
        "Acionar a hemodinâmica AGORA — o relógio conta a partir de agora.",
      ],
      porque: [OCLUSAO_ACHEI_UM_PADRAO],
      next: "grupoB_reperfusao",
    },

    grupoB_reperfusao: {
      id: "grupoB_reperfusao",
      type: "decision",
      title: "Via de reperfusão",
      question: "ICP disponível a tempo (mesmo critério de FMC-dispositivo)?",
      summary: "⚠️ Sem opção de fibrinólise aqui — a literatura não sustenta essa via para De Winter/posterior/T hiperaguda com a mesma confiança do STEMI clássico.",
      options: [
        { id: "sim", label: "Sim — ICP disponível a tempo", next: "stemi_icp" },
        { id: "nao", label: "Não — transferir", next: "stemi_transfer" },
      ],
    },

    // ⚠️ TÍTULO SEM CONCLUSÃO (2026-08-24) — "tronco/multiarterial provável"
    // saiu do título pela mesma razão que saiu do card: é o que o ECG SUGERE,
    // não o que ele PROVA sozinho. O parágrafo completo (associação com
    // tronco/multiarterial/DA proximal) vai para `porque`, não para o texto
    // principal.
    ecg_avr_conduta: {
      id: "ecg_avr_conduta",
      type: "action",
      title: "Sala urgente — fibrinólise fora",
      summary: "Avaliação invasiva urgente; não é indicação automática de fibrinólise.",
      enfase: "resultado_alerta",
      actions: [
        "Acionar hemodinâmica/cirurgia cardíaca com urgência.",
        "Não é candidato a trombolítico.",
      ],
      porque: [OCLUSAO_AVR_TRONCO],
      next: "stemi_transfer",
    },

    // ── Wellens: NUNCA reperfusão emergente, nunca fibrinólise ────────────────
    // ⚠️ SEM "LIVRO" (2026-08-24) — os dois parágrafos completos
    // (WELLENS_NAO_E_OCLUSAO/WELLENS_NUNCA_ERGOMETRICO) saíram de
    // `summary`/`actions` e foram para `porque`. O que fica na tela principal
    // é a ação: internar, notificar, nunca ergométrico.
    wellens_conduta: {
      id: "wellens_conduta",
      type: "action",
      title: "Wellens — alto risco, sem reperfusão emergente",
      summary: "NÃO é oclusão em curso — sem reperfusão emergente, nunca teste ergométrico.",
      enfase: "resultado_alerta",
      actions: [
        "Internar; notificar cardiologia intervencionista.",
        "Coronariografia NÃO emergencial durante a internação.",
        "Nunca teste ergométrico.",
      ],
      porque: [
        WELLENS_NAO_E_OCLUSAO,
        WELLENS_NUNCA_ERGOMETRICO,
        "⚠️ Prazo exato para o cateterismo não confirmado em fonte nesta sessão — não fixar número; seguir o protocolo do serviço.",
      ],
      // ⚠️ RESTAURADO (2026-08-25) — antes ia direto a `nste_dados`, PULANDO a
      // troponina. A auditoria não achou nenhuma justificativa clínica escrita
      // para o pulo; o que ele de fato evitava era o Wellens cair na saída
      // "sem elevação → baixo risco" e sair para casa — estenose crítica de DA
      // rotulada como baixo risco. A correção certa não é remover a troponina
      // (ela é seriada e a curva muda conduta), e sim impedir o rebaixamento:
      // `padrao_alto_risco` foi gravado ao reconhecer Wellens, e a saída de
      // baixo risco de `nste_trop` fica escondida enquanto essa flag existir.
      next: "nste_trop",
    },

    ecg_sem_supra_duvida: {
      id: "ecg_sem_supra_duvida",
      type: "action",
      title: "Traçado duvidoso — o seguinte é que resolve",
      summary: "Duvidar não impede repetir o ECG, colher troponina nem manter o paciente. Impede apenas liberar.",
      actions: [OCLUSAO_NAO_TENHO_CERTEZA],
      next: "nste_trop",
    },

    nste_trop: {
      id: "nste_trop",
      type: "decision",
      title: "Troponina e alterações isquêmicas",
      question: "Troponina elevada (ou curva ascendente) e/ou alterações isquêmicas dinâmicas?",
      summary:
        "⏱ A TROPONINA É SERIADA, E O PROTOCOLO TEM HORA: 0 h/1 h (ou 0 h/3 h, conforme o ensaio disponível). Uma dosagem isolada não confirma nem descarta — o que define NSTEMI é a ELEVAÇÃO OU QUEDA significativa entre as duas.",
      evidence: [
        "Troponina de alta sensibilidade com elevação/queda significativa = NSTEMI.",
        "Infra de ST ≥ 0,5 mm ou inversão de T profunda dinâmica reforçam isquemia.",
        "Protocolo 0 h/1 h (ou 0 h/3 h): troponina seriada para confirmar/descartar.",
        "Sem elevação e ECG sem alteração = avaliar angina instável vs causa não isquêmica (HEART score).",
      ],
      options: [
        { id: "positivo", label: "Sim — troponina+/ST dinâmico (NSTE-ACS)", next: "nste_risco_criterios", grava: { campo: "viaDeTratamento", valor: "nste" } },
        {
          id: "negativo",
          label: "Não — sem elevação / ECG normal",
          next: "nste_baixo",
          // ⚠️ REGRA UNIVERSAL DO MOTOR (decisão do autor, 2026-08-25):
          // evidência de alto risco já estabelecida permanece ativa até ser
          // resolvida por decisão clínica válida — um exame posterior NÃO a
          // apaga em silêncio. Troponina negativa não rebaixa quem já teve
          // padrão de oclusão reconhecido no ECG.
          showIf: (v) => v.padrao_alto_risco !== "sim",
        },
        {
          id: "negativo_alto_risco",
          label: "Não — sem elevação, mas padrão de alto risco já reconhecido no ECG",
          next: "nste_risco_criterios",
          showIf: (v) => v.padrao_alto_risco === "sim",
          grava: { campo: "viaDeTratamento", valor: "nste" },
        },
      ],
    },

    nste_dados: {
      id: "nste_dados",
      type: "input",
      title: "Peso para cálculo de dose",
      intro: "Toque no peso (ou adicione). Usado para enoxaparina e heparina.",
      // ⚠️ A estratégia invasiva já foi definida e acionada no nó anterior —
      // peso e antitrombóticos correm em paralelo, não a atrasam.
      fields: [
        {
          // ⚠️ REPETIDA AQUI DE PROPÓSITO, E NÃO É REPERGUNTA (2026-08-26). Os
          // atalhos do menu ("STEMI já confirmado", "só preciso das doses")
          // pulam a Tela 1 e chegam direto às medicações — por esses caminhos
          // o PDE-5 nunca teria sido perguntado, e o veredito bloquearia o
          // nitrato por falta de um dado que o médico não teve chance de dar.
          // Isso é o beco que a regra proíbe: o app dizendo "não posso" em vez
          // de perguntar.
          //
          // Quem veio pelo fluxo completo encontra o campo JÁ PREENCHIDO — o
          // motor guarda o valor e a tela o exibe com o aviso de aproveitado.
          id: "pde5_recente",
          label: "Uso recente de inibidor de PDE-5 (sildenafila, tadalafila)?",
          optional: true,
          presets: [
            { value: "nao", label: "Não" },
            { value: "sim", label: "Sim" },
            { value: "nao_sei", label: "Não sei" },
          ],
        },
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
      title: "Tratamento · Antitrombóticos (sem supra)",
      summary: "Tratar enquanto se define o tempo da estratégia invasiva.",
      // ⚠️ AS DOSES DE NITRATO E BETABLOQUEADOR SAÍRAM DAS AÇÕES (2026-08-26).
      // Este card imprimia as duas sem checagem nenhuma — é o passo 17, e os
      // vereditos existiam só no passo 11. A mesma tela que lista antiagregante
      // e anticoagulante mandava dar nitrato sem saber a PA nem o PDE-5.
      //
      // Agora quem governa são os vereditos: a dose vive em
      // `Veredito.instrucao` e só aparece no verde.
      vereditos: [
        { id: "nitrato", avaliar: vereditoNitrato },
        { id: "betabloqueador", avaliar: vereditoBetabloqueador },
      ],
      actions: [
        "AAS já administrado (300 mg). Manter 81–100 mg/dia.",
        "2º antiplaquetário: ticagrelor 180 mg (manutenção 90 mg 12/12h) — preferir após definição anatômica; clopidogrel 300–600 mg como alternativa.",
        "ACC/AHA 2025: pré-tratamento com P2Y12 ANTES da anatomia só se a angiografia for demorar > 24 h (clopidogrel ou ticagrelor, classe 2b) — não é rotina.",
        "ACC/AHA 2025: se NSTEMI tratado APENAS clinicamente (sem ICP), a dupla recomendada é AAS + TICAGRELOR (classe 1).",
        "Anticoagulação: enoxaparina {enoxa} mg SC 12/12h (≥ 75a: {enoxa75} mg; ClCr < 30: 24/24h) OU fondaparinux 2,5 mg SC/dia OU HNF bolus {hnfBolus} U IV + {hnfInf} U/h (ajuste por TTPa).",
        "{avisoPeso}",
        "Nitrato, se dor/HAS/IC e sem contraindicação:",
        NITRATO_MONITORIZACAO,
        "Contraindicações do nitrato — quando NÃO usar:",
        NITRATO_ALERTAS_SCA,
        VD_CONTRAINDICA_PRE_CARGA,
        NITRATO_CONTRAINDICACAO_PDE5,
        NITRATO_PDE5_USO_CRONICO,
        NITRATO_OUTRAS_CONTRAINDICACOES,

        BETABLOQUEADOR_IV_SEPARADO,
        BETABLOQUEADOR_CONTRAINDICACAO,
        "Estatina de alta intensidade: atorvastatina 40–80 mg VO (alternativa: rosuvastatina 20–40 mg).",
        "Morfina só se dor refratária apesar de anti-isquêmico otimizado:",
        MORFINA_TETO,
        MORFINA_CONTRAINDICACOES,
      ],
      next: "reavaliacao_pos_intervencao",
    },

    // ── 3. Estratificação de risco — derivação automática (Etapa 5) ──────────
    //
    // ⚠️ NÃO PERGUNTA A CATEGORIA PRONTA quando o app já tem dados/critérios
    // suficientes. Primeiro checa os critérios BOOLEANOS de "muito alto risco"
    // (já sourced, evidence do módulo desde antes desta mudança) — qualquer um
    // presente deriva "invasiva imediata" sem perguntar categoria.
    nste_risco_criterios: {
      id: "nste_risco_criterios",
      type: "input",
      title: "Reavaliação · Critérios de muito alto risco",
      // ⚠️ REAVALIAÇÃO EXPLÍCITA (correção final 2026-08-25, item B) — não é
      // repetir a pergunta de instabilidade do Bloco 2: é checar de novo AGORA,
      // depois de ECG/medicação, porque o quadro pode ter mudado desde então.
      // A interface precisa deixar isso claro — daí o texto abaixo.
      intro: "Qualquer um destes deriva invasiva IMEDIATA (< 2h) automaticamente. Reavaliação AGORA, não repetição — o quadro pode ter mudado desde a avaliação inicial.",
      fields: [
        {
          id: "grace_instabilidade",
          label: "Instabilidade hemodinâmica/choque — agora, neste momento (reavaliação)",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "grace_dor_refrataria",
          label: "Dor refratária ao tratamento máximo",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "grace_arritmia",
          label: "Arritmia ventricular ameaçadora/PCR",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "grace_complicacao_mecanica",
          label: "Complicação mecânica",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "grace_ic_aguda",
          label: "IC aguda com isquemia — agora, neste momento (reavaliação)",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "grace_st_dinamico",
          label: "Alterações dinâmicas de ST-T recorrentes (supra intermitente)",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
      ],
      next: {
        possiveis: ["nste_invasiva_imediata", "nste_risco"],
        escolher: derivaRiscoImediato,
      },
    },

    nste_risco: {
      id: "nste_risco",
      type: "decision",
      title: "Estratificação de risco — GRACE",
      question: "Você já tem o escore GRACE calculado?",
      summary: "Se já tiver o número, o app deriva a categoria — não pede para reclassificar manualmente.",
      evidence: [
        "⚠️ O app NÃO CALCULA o escore GRACE: os coeficientes do nomograma (idade, FC, PAS, creatinina, Killip, PCR na admissão, desvio de ST, troponina → pontos) não foram confirmados em fonte nesta sessão. Ele só deriva a CATEGORIA a partir do número que você já tem.",
      ],
      options: [
        { id: "tenho", label: "Sim — tenho o número", next: "nste_risco_grace_valor" },
        { id: "nao_tenho", label: "Não — classificar manualmente", next: "nste_risco_manual" },
      ],
    },

    nste_risco_grace_valor: {
      id: "nste_risco_grace_valor",
      type: "input",
      title: "Escore GRACE",
      intro: "Toque no valor (ou adicione). O app deriva a categoria pelos limiares já usados neste módulo.",
      fields: [
        {
          id: "grace_score",
          label: "GRACE",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["100", "125", "150", "175", "200"].map((v) => ({ value: v, label: v })),
        },
      ],
      next: {
        possiveis: ["nste_invasiva_precoce", "nste_seletiva"],
        escolher: (values: TreeValues) => {
          const score = toNumber(values.grace_score);
          if (score === null) return "nste_invasiva_precoce"; // dado ausente: lado seguro
          return categoriaPorGrace(score);
        },
      },
    },

    // Fallback manual — mantido para quem não tem o GRACE calculado.
    nste_risco_manual: {
      id: "nste_risco_manual",
      type: "decision",
      title: "Estratificação de risco → tempo da coronariografia",
      question: "Qual a categoria de risco do paciente?",
      summary: "Escore GRACE 2.0 (idade, FC, PAS, creatinina, Killip, PCR na admissão, desvio de ST, troponina). GRACE > 140 = alto; 109–140 = intermediário; < 109 = baixo.",
      evidence: [
        "ALTO (< 24 h): NSTEMI confirmado por troponina, alterações dinâmicas de ST/T, GRACE > 140.",
        "INTERMEDIÁRIO (< 72 h): DM, TFG < 60, FE < 40%/IC, angina pós-IAM, ICP/CRM prévia, GRACE 109–140.",
        "BAIXO: sem os critérios acima — angiografia razoável antes da alta (ACC/AHA 2025, Classe 2a B-R), não obrigatória em < 72 h.",
        "Classificação de Killip (prognóstico): I sem IC (~6%); II B3/crepitantes < 50% ou JVP elevada (~17%); III EAP (~38%); IV choque cardiogênico (~67–81%).",
      ],
      options: [
        { id: "alto", label: "Alto — invasiva precoce (< 24 h)", next: "nste_invasiva_precoce" },
        { id: "intermediario", label: "Intermediário — invasiva (< 72 h)", next: "nste_invasiva_precoce" },
        { id: "baixo", label: "Baixo — angiografia antes da alta", next: "nste_seletiva" },
      ],
    },

    nste_invasiva_imediata: {
      id: "nste_invasiva_imediata",
      type: "action",
      title: "Estratégia invasiva IMEDIATA (< 2 h)",
      summary: "ACC/AHA 2025, Classe 1 C-LD. Conduta semelhante ao STEMI pela instabilidade.",
      actions: [
        "Acionar a hemodinâmica imediatamente — coronariografia/ICP em < 2 h.",
        "Estabilizar em paralelo: arritmias, IC aguda, choque (considerar suporte).",
        "Manter dupla antiagregação e anticoagulação conforme o serviço.",
        "Transporte monitorizado com desfibrilador.",
      ],
      next: "nste_dados",
    },

    nste_invasiva_precoce: {
      id: "nste_invasiva_precoce",
      type: "action",
      title: "Estratégia invasiva precoce/programada",
      summary: "ACC/AHA 2025, Classe 2a B-R (< 24 h). Coronariografia conforme a categoria de risco.",
      actions: [
        "Programar coronariografia: < 24 h (alto risco) ou < 72 h (intermediário).",
        "Manter monitorização contínua, troponina e ECG seriados.",
        "Otimizar terapia antitrombótica e anti-isquêmica enquanto aguarda.",
        "Reclassificar para invasiva imediata se surgir instabilidade ou dor refratária.",
      ],
      next: "nste_dados",
    },

    nste_seletiva: {
      id: "nste_seletiva",
      type: "action",
      title: "Estratégia seletiva — angiografia antes da alta",
      summary: "ACC/AHA 2025, Classe 2a B-R: para NSTE-ACS não-alto-risco com intenção invasiva, razoável realizar angiografia antes da alta hospitalar.",
      actions: [
        "Programar coronariografia antes da alta, sem a urgência das categorias alto/muito alto.",
        "Manter monitorização, troponina e ECG seriados enquanto aguarda.",
        "Reclassificar para invasiva precoce/imediata se surgir novo critério de risco.",
      ],
      next: "nste_dados",
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

    // ── 4. Reavaliação pós-intervenção formal (Etapa 7) ───────────────────────
    reavaliacao_pos_intervencao: {
      id: "reavaliacao_pos_intervencao",
      type: "decision",
      title: "Reavaliação · Resposta ao tratamento",
      question: "Resposta clínica e do ECG após a reperfusão/estratégia invasiva?",
      summary:
        "⏱ Se houve fibrinólise, reavalie por volta de 60–90 min (uso corrente, não confirmado no texto da diretriz 2025 — use o protocolo do seu serviço) — não deixe passar a janela sem checar. Sucesso = melhora sintomática + resolução do supra (ACC/AHA 2025: <50% de resolução em derivações anteriores ou <70% em inferiores = falha) + estabilidade. Se ICP: fluxo restabelecido + melhora sintomática confirmam.",
      // ⚠️ PESO POR GRAVIDADE REAL, NÃO POR ORDEM (Etapa 2, 2026-08-24):
      // "complicação" (choque cardiogênico, complicação mecânica) é mais
      // ameaçadora à vida do que "fibrinólise sem sucesso" (grave, mas o
      // paciente pode estar estável aguardando resgate) — por isso é ela que
      // recebe `gravidade: "critica"` aqui, não a falha de reperfusão. Ver
      // `DecisionOption.gravidade`: o peso vem do conteúdo deste nó, não de
      // uma regra fixa que trataria toda "falha" como a pior opção sempre.
      options: [
        // ⚠️ QUEM FOI FIBRINOLISADO NÃO VAI DIRETO À PREVENÇÃO SECUNDÁRIA
        // (correção do autor, 2026-08-25) — a angiografia precoce de 2–24 h
        // é Classe 1 e faz parte da estratégia farmacoinvasiva. Antes, o
        // sucesso da lise encerrava a via aqui, e o paciente ficava sem a
        // transferência e sem a angiografia.
        { id: "melhora", label: "Melhora sintomática, sem instabilidade", next: "stemi_farmacoinvasiva", gravidade: "favoravel", showIf: (v) => v.estrategiaFibrinolise === "sim" },
        { id: "melhora_sem_lise", label: "Melhora sintomática, sem instabilidade", next: "prevencao_secundaria", gravidade: "favoravel", showIf: (v) => v.estrategiaFibrinolise !== "sim" },
        {
          id: "falha_fibrinolise",
          label: "Fibrinólise sem sucesso — supra não resolveu, dor ou instabilidade persistem",
          next: "icp_resgate",
          gravidade: "alerta",
        },
        { id: "complicacao", label: "Complicação (arritmia, choque, mecânica)", next: "destino_coronariana", gravidade: "critica" },
        { id: "sem_certeza", label: "Não tenho certeza — repetir ECG e reavaliar", next: "reavaliacao_pos_intervencao", gravidade: "neutra" },
      ],
    },

    icp_resgate: {
      id: "icp_resgate",
      type: "action",
      title: "ICP de resgate",
      summary: "ACC/AHA 2025, Classe 1 B-R: falha de reperfusão → angiografia imediata com ICP de resgate.",
      actions: [
        "Indicada por: ausência de melhora sintomática, resolução do supra <50% (derivações anteriores) ou <70% (inferiores), ou instabilidade hemodinâmica/elétrica.",
        "Angiografia imediata, com intenção de ICP.",
      ],
      next: "prevencao_secundaria",
    },

    // ── Prevenção secundária / prescrição na alta (compartilhado SCA confirmada) ─
    prevencao_secundaria: {
      id: "prevencao_secundaria",
      type: "action",
      title: "Prevenção secundária — 5 classes obrigatórias na alta",
      summary: "Todo IAM deve sair com pelo menos 5 classes. Revisão com cardiologista em 2–4 semanas.",
      actions: [
        "1) AAS 100 mg/dia, indefinidamente — vale para todos.",
        "2) P2Y12 — A ESCOLHA DEPENDE DE COMO A ARTÉRIA FOI ABERTA, e este passo recebe tanto quem foi à hemodinâmica quanto quem foi trombolisado:",
        "  • SE HOUVE ICP COM STENT → ticagrelor 90 mg 12/12h ou prasugrel, por 12 meses (DES).",
        "  • SE FOI FIBRINÓLISE E O PACIENTE AINDA NÃO FOI CATETERIZADO → CLOPIDOGREL. É o único P2Y12 com evidência em paciente lisado (CLARITY-TIMI 28 e COMMIT). NÃO usar ticagrelor nem prasugrel aqui — e o prasugrel, além disso, não tem indicação sem stent. Dose por IDADE: até 75 anos, ataque de 300 mg; 75 anos ou mais, SEM ataque — 75 mg direto.",
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
      title: "Destino · Estratégia invasiva/UTI",
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
      title: "Destino · Observação/alta",
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
