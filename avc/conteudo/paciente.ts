/**
 * CONTEÚDO DA SUPERFÍCIE **PACIENTE** — quem é o paciente, e ⛔ nada além disso.
 *
 * ⛔ Dados puros. ⛔ Nenhum React, ⛔ nenhuma cor, ⛔ nenhuma decisão de tela (E-29).
 *
 * ── POR QUE ESTA SUPERFÍCIE EXISTE (autor, 2026-08-29) ─────────────────────
 *
 * Quatro defeitos seguidos foram encontrados usando o app, e eram **o mesmo
 * defeito**: alergia a contraste perguntada depois de já ter oferecido a
 * angiotomografia · hipodensidade num bloco de resultado de TC · imagem avançada
 * sem leitor · suspeita de HSA parecendo repetição. Todos são **fatos sobre quem
 * é o paciente** que foram parar em telas organizadas por **decisão**.
 *
 * Faltava o lugar onde o paciente é descrito **uma vez**.
 *
 * ── ⚠️⚠️ A REGRA QUE GOVERNA ESTE ARQUIVO E TODOS OS OUTROS ────────────────
 *
 * > **Propriedade do fato ⛔ NÃO é local de preenchimento.** Um fato tem um único
 * > id e uma única casa semântica. Qualquer superfície que precise dele pode
 * > mostrar o valor ou permitir preenchê-lo, sempre escrevendo **no mesmo fato e
 * > na mesma trilha**.
 *
 * ⚠️ E a regra que impede o escorregamento, nas palavras do autor:
 *
 * > *"Senão daqui a pouco começamos a mover fatos para a superfície que os
 * > utiliza e recriamos o problema: DOAC 'pertence à trombólise', mRS 'pertence
 * > à EVT', creatinina 'pertence ao contraste'. ⛔ Não. **O dado pertence à
 * > espécie dele; a decisão apenas o consome.**"*
 *
 * ── ⛔ O QUE ESTA SUPERFÍCIE NÃO É ─────────────────────────────────────────
 *
 * ⛔⛔ **⛔ NÃO É O PASSO 1, e ⛔ não é ficha para liberar o atendimento.** Ela pode
 * aparecer primeiro na navegação e ⛔ não é porta: com ela **inteiramente vazia**,
 * todas as outras superfícies abrem, ⛔ nenhuma some, e ⛔ nenhum bloqueio nasce.
 * É a condição que o autor impôs, e as doze marcas 🚫 são a razão — uma tela de
 * admissão antes do fluxo é a forma mais natural de reintroduzir atraso, e ela
 * ⛔ nem pareceria bloqueio: pareceria organização.
 *
 * ⛔ **⛔ Não entram aqui** (decisão do autor): PA · FC · SpO₂ · glicemia ·
 * consciência · via aérea · ausculta · laboratório · imagem. Esses são fatos do
 * **episódio atual**, repetíveis, e continuam em suas casas.
 *
 * ⛔ **⛔ Não existe lista aberta de comorbidade.** §0.3 proíbe texto livre para
 * valor clínico e **E-19** proíbe pergunta que a fonte ⛔ não sustenta. Os
 * antecedentes daqui são **exatamente** os que a Table 8 e F-10 nomeiam.
 */

import type { SuperficieId } from "../nucleo/tipos";
import type { Campo, CampoDeclarado, GrupoDeclarado, Grupo } from "./campo";
import { comCasa, NAO_SEI, SIM_NAO_NAO_SEI } from "./campo";
import { GRAUS_MRS_PREVIO, rotuloDoGrau } from "./mrs";

export type CampoP = CampoDeclarado;

/**
 * IDENTIFICAÇÃO — ⚠️ o **único** campo ⛔ não clínico do módulo.
 *
 * ⚠️⚠️ ELE É `natureza: "administrativo"` POR DECISÃO EXPLÍCITA, e ⛔ não por
 * afrouxamento: **E-30** exige que todo campo aponte para um slot `F-nn`, e essa
 * exigência ⛔ não pode cair para os outros 50 campos só porque um deles ⛔ não é
 * afirmação clínica. Declarar a natureza é o que mantém a regra de pé.
 *
 * ⚠️ **Dado pessoal, e o autor fixou o limite:** *"⛔ sem CPF, ⛔ sem
 * obrigatoriedade, e ⛔ sem qualquer efeito sobre o fluxo."* ⛔ Nenhuma derivação
 * o lê, e ⛔ nenhuma leitura muda por ele existir ou ⛔ não.
 */
export const IDENTIFICACAO_P: readonly CampoP[] = [
  {
    id: "identificacao",
    rotulo: "Identificação",
    tipo: "texto",
    temporalidade: "estavel",
    natureza: "administrativo",
    ajuda: "Nome ou identificador local, para não trocar de paciente. Opcional.",
    /** ⚠️ Vazio, e ⛔ só é permitido porque a natureza é administrativa. */
    fonte: "",
    bloqueiaTerapia: false,
    nota: "Fica apenas neste aparelho e não interfere em nenhuma conduta.",
  },
  {
    id: "idade",
    rotulo: "Idade",
    tipo: "grandeza",
    temporalidade: "estavel",
    unidade: "anos",
    faixa: { min: 18, max: 110, passo: 1 },
    /**
     * ⚠️ **F-08 usa idade como critério**, com corte declarado: recs. 3 e 4
     * qualificam faixas com *"age <80 years"*. ⛔ O corte ⛔ não mora aqui — mora
     * na Reperfusão, que lê este fato.
     *
     * ⚠️ Faixa a partir de **18**: o V1 é **adulto** (§6.8), e a fonte ⛔ não foi
     * transcrita para pediatria — recs. 4 e 5 de §3.2 foram deliberadamente
     * deixadas de fora (E-17).
     */
    fonte: "F-08",
    bloqueiaTerapia: false,
    nota: "A fonte usa a idade em critérios de trombectomia. O corte pertence à superfície de reperfusão, e não a este registro.",
  },
] as const;

/**
 * DADOS BASAIS — ⚠️ **vieram da Superfície A** em 2026-08-29.
 *
 * ⚠️ Eles ⛔ não são estado clínico: o peso de um paciente ⛔ não muda entre a
 * chegada e a trombólise. Estavam em A porque a dose por peso é do fluxo; agora
 * moram onde pertencem, e **A continua podendo preenchê-los**.
 */
export const BASAIS_P: readonly CampoP[] = [
  {
    id: "peso",
    rotulo: "Peso",
    tipo: "grandeza",
    temporalidade: "estavel",
    unidade: "kg",
    faixa: { min: 30, max: 200, passo: 1 },
    /**
     * ⚠️⚠️ 🚫 MARCA #1 — *"Do not delay thrombolysis to obtain exact weight"*.
     * O peso alimenta dose e ⛔ **não** trava terapia: peso estimado é resposta
     * legítima, e é por isso que `peso_origem` existe (**E-14**).
     */
    fonte: "F-09",
    bloqueiaTerapia: false,
    nota: "A fonte diz para não atrasar a trombólise para obter peso exato. Peso estimado é resposta válida.",
  },
  {
    id: "peso_origem",
    rotulo: "Como o peso foi obtido",
    tipo: "escolha",
    temporalidade: "estavel",
    /** ⚠️ VOCABULÁRIO PRÓPRIO — a origem muda a confiança sem mudar o número (E-14). */
    opcoes: ["Informado pelo paciente ou família", "Estimado pela equipe", NAO_SEI],
    fonte: "F-09",
    bloqueiaTerapia: false,
  },
];

/**
 * ALERGIAS — ⚠️ **veio da Superfície C** em 2026-08-29, e o relato do autor
 * nomeia o defeito exato:
 *
 * > *"⛔ Não faz sentido aqui, principalmente depois que já sugeriu exames de
 * > imagem. Isso faz sentido na tela de identificação do paciente."*
 *
 * ⚠️ Perguntar sobre alergia ao contraste **depois** de oferecer o exame com
 * contraste é perguntar tarde. E as três travas de **PD-25** viajam junto,
 * inteiras: ⛔ nunca bloqueia a IVT, ⛔ nunca cria dependência de creatinina,
 * ⛔ nunca bloqueia superfície nenhuma.
 */
export const ALERGIAS_P: readonly CampoP[] = [
  {
    id: "alergia_contraste",
    rotulo: "Alergia prévia importante a contraste iodado",
    tipo: "escolha",
    temporalidade: "estavel",
    opcoes: SIM_NAO_NAO_SEI,
    ajuda: "Diz respeito apenas ao exame com contraste. Não interfere na trombólise.",
    fonte: "F-16",
    bloqueiaTerapia: false,
    nota: "A fonte do AVC não define conduta para alergia a contraste. Este registro fica na trilha do atendimento, e o manejo é decisão clínica e institucional.",
  },
];

/**
 * MEDICAÇÕES EM USO — ⚠️ e ⛔ NENHUM ITEM POR ANALOGIA.
 *
 * ⚠️⚠️ F-10 §2 é explícito: a Table 8 ⛔ **não tem célula própria** para varfarina
 * ⛔ nem para heparina, e *"⛔ não criar item por analogia com protocolo antigo"*.
 * As três entram porque a **regra do coagulograma** as nomeia — *"in patients
 * without recent use of warfarin or heparin"* —, e ⛔ não porque protocolos
 * antigos as listam.
 *
 * ⚠️ **Seleção múltipla, e ⛔ não escolha única:** varfarina em ponte com heparina
 * de baixo peso é paciente real, e a permissão de iniciar antes do coagulograma
 * depende de **as duas** serem representáveis ao mesmo tempo.
 */
export const MEDICACOES_P: readonly CampoP[] = [
  {
    id: "anticoagulante_em_uso",
    rotulo: "Anticoagulante em uso",
    tipo: "multipla",
    temporalidade: "estado",
    opcoes: [
      "Anticoagulante oral direto (DOAC)",
      "Varfarina ou outro antagonista da vitamina K",
      "Heparina ou heparina de baixo peso molecular",
      "Nenhum",
      NAO_SEI,
    ],
    exclusivas: ["Nenhum", NAO_SEI],
    fonte: "F-10",
    bloqueiaTerapia: false,
    nota: "A fonte separa quem não usa varfarina nem heparina: nesses pacientes a trombólise pode ser iniciada antes do resultado da coagulação, com suspensão se o resultado vier alterado.",
  },
  {
    id: "doac_ultima_dose",
    /**
     * ⚠️⚠️ **DATA E HORA**, e ⛔ não só hora — correção do autor, 2026-08-29:
     * *"Uma janela de 48 horas ⛔ não pode ser calculada com `08:00` sem data."*
     *
     * ⚠️ O **fato** já era data e hora (instante epoch); o que ⛔ não alcançava 48 h
     * era o **controle**, que só tinha hora ±1 e minuto ±1. Ver o seletor.
     *
     * ⛔⛔ E ISTO ⛔ NÃO AUTORIZA CALCULAR `< 48 h`. O marco de referência dessa
     * derivação é decisão da Superfície D, e continua em aberto.
     *
     * ⚠️ **E-52 aqui é o caso normativo:** *"última dose de DOAC desconhecida sem
     * instante artificial"*. O campo aceita desconhecido como **resposta**, e o
     * app ⛔ jamais inventa um horário para poder calcular.
     */
    rotulo: "Data e hora da última dose do anticoagulante",
    tipo: "hora",
    temporalidade: "estavel",
    aceitaDesconhecido: true,
    ajuda: "Se ninguém souber informar, registre que é desconhecido. Nada é estimado.",
    fonte: "F-10",
    bloqueiaTerapia: false,
    nota: "A fonte considera exposição recente a DOAC como as últimas 48 horas, e diz que a segurança da trombólise nesse cenário é desconhecida. Ela não contraindica, e o horário desconhecido não é exposição confirmada nem ausência de exposição.",
  },
  {
    id: "antiagregante_em_uso",
    rotulo: "Antiagregante em uso",
    tipo: "escolha",
    temporalidade: "estado",
    opcoes: ["Não", "Antiagregante simples", "Dupla antiagregação", NAO_SEI],
    /**
     * ⚠️⚠️ 🚫 MARCA #12 — **COR 1 · B-NR**: a IVT é recomendada **mesmo em uso**
     * de antiagregante simples ou duplo, com aumento declarado de sICH. ⛔ Isto
     * ⛔ não bloqueia, e ⛔ não se suspende nada para trombolisar.
     */
    fonte: "F-07",
    bloqueiaTerapia: false,
    nota: "A fonte recomenda a trombólise mesmo em uso de antiagregante simples ou duplo, declarando o aumento de risco de hemorragia sintomática em comparação com não usar antiagregante.",
  },
];

/**
 * ANTECEDENTES — ⚠️ **exatamente** os que as fontes nomeiam, e ⛔ nenhum a mais.
 *
 * ⚠️⚠️ AGRUPADOS POR SISTEMA, e ⛔ **NÃO POR FAIXA DA TABLE 8**. Agrupar por faixa
 * importaria o gradiente cromático da fonte para dentro da tela — que é o que
 * **E-48** e **P-07** proíbem. A faixa de cada item existe, e vive na
 * **interpretação** (Superfície D), ⛔ nunca no arranjo visual da pergunta.
 *
 * ⚠️⚠️ OS PARES DE **E-06** APARECEM COMO ITENS SEPARADOS, e é aqui que a lista
 * ganha ou perde fidelidade:
 *
 *   · neoplasia **extra-axial** — *"benefit likely outweighs risk"*
 *   · neoplasia **intra-axial** — *"potentially harmful and should not be administered"*
 *
 * Mesma palavra, sentidos opostos. Uma pergunta única "neoplasia intracraniana?"
 * destruiria a distinção que a fonte fez questão de escrever.
 */
export const ANTECEDENTES_INTRACRANIANOS_P: readonly CampoP[] = [
  {
    id: "antecedentes_intracranianos",
    rotulo: "Antecedentes intracranianos",
    tipo: "multipla",
    temporalidade: "estado",
    opcoes: [
      "Hemorragia intracraniana prévia",
      "AVC isquêmico nos últimos 3 meses",
      "Neoplasia intracraniana extra-axial",
      "Neoplasia intracraniana intra-axial",
      "Lesão medular aguda nos últimos 3 meses",
      "Aneurisma intracraniano não roto",
      "Malformação vascular intracraniana não rota",
      "Dissecção arterial cervical extracraniana",
      "Dissecção arterial intracraniana",
      "AVC durante procedimento angiográfico",
      "Doença de Moya-Moya",
      "Imunoterapia amiloide ou ARIA",
      "Nenhum destes",
      NAO_SEI,
    ],
    exclusivas: ["Nenhum destes", NAO_SEI],
    fonte: "F-07",
    bloqueiaTerapia: false,
    nota: "Lista da Table 8 da fonte. Ela não traz classe de recomendação em nenhuma célula, e declara a própria faixa mais restritiva como não sustentada por evidência clínica. O que cada achado significa é interpretado na superfície de segurança.",
  },
];

export const ANTECEDENTES_SISTEMICOS_P: readonly CampoP[] = [
  {
    id: "antecedentes_cardio_sistemicos",
    rotulo: "Antecedentes cardíacos e sistêmicos",
    tipo: "multipla",
    temporalidade: "estado",
    opcoes: [
      "Endocardite infecciosa",
      "Dissecção de arco aórtico",
      "Infarto com supradesnivelamento nos últimos 3 meses",
      "Infarto do miocárdio remoto",
      "Pericardite aguda",
      "Trombo em átrio ou ventrículo esquerdo",
      "Neoplasia sistêmica ativa",
      "Uso de droga recreativa",
      "Nenhum destes",
      NAO_SEI,
    ],
    exclusivas: ["Nenhum destes", NAO_SEI],
    fonte: "F-07",
    bloqueiaTerapia: false,
    nota: "Lista da Table 8 da fonte, que não traz classe de recomendação em nenhuma célula. O que cada achado significa é interpretado na superfície de segurança.",
  },
];

/**
 * PROCEDIMENTOS E SANGRAMENTOS RECENTES — ⚠️ **a janela vai no rótulo**.
 *
 * ⚠️⚠️ CINCO PARES DE **E-06** VIVEM AQUI, e a janela é o que separa cada um:
 *
 *   · sangramento GI/GU **em 21 dias** — *"may be at increased risk of harm"*
 *   · sangramento GI/GU **remoto e estável** — *"benefits generally are greater"*
 *   · neurocirurgia **< 14 dias** — *"potentially harmful"*
 *   · neurocirurgia **14 dias a 3 meses** — *"may be considered on an individual basis"*
 *
 * ⛔ Uma pergunta binária *"cirurgia prévia?"* destruiria as quatro distinções de
 * uma vez.
 */
export const PROCEDIMENTOS_P: readonly CampoP[] = [
  {
    id: "procedimentos_recentes",
    rotulo: "Procedimentos, traumas e sangramentos recentes",
    tipo: "multipla",
    temporalidade: "estado",
    opcoes: [
      "Neurocirurgia nos últimos 14 dias",
      "Neurocirurgia entre 14 dias e 3 meses",
      "Traumatismo craniano moderado a grave nos últimos 14 dias",
      "Traumatismo craniano moderado a grave entre 14 dias e 3 meses",
      "Cirurgia de grande porte fora do sistema nervoso nos últimos 10 dias",
      "Trauma de grande porte fora do sistema nervoso nos últimos 14 dias",
      "Sangramento gastrointestinal ou geniturinário nos últimos 21 dias",
      "Sangramento gastrointestinal ou geniturinário remoto e estável",
      "Punção arterial em vaso não compressível nos últimos 7 dias",
      "Punção dural nos últimos 7 dias",
      "Nenhum destes",
      NAO_SEI,
    ],
    exclusivas: ["Nenhum destes", NAO_SEI],
    fonte: "F-07",
    bloqueiaTerapia: false,
    nota: "As janelas são as da própria fonte, e o mesmo antecedente muda de sentido conforme a janela. O que cada um significa é interpretado na superfície de segurança.",
  },
];

/**
 * MICROSSANGRAMENTOS — ⚠️ a pergunta é *"há informação PRÉVIA?"*, e ⛔ jamais
 * *"há microssangramento?"*.
 *
 * ⚠️⚠️ A SEGUNDA PERGUNTA INDUZ A RESSONÂNCIA QUE A REC. 11 (**COR 1 · B-NR**)
 * MANDA ⛔ NÃO OBTER — *"IVT be administered without first obtaining MRI to
 * exclude CMBs"*. É a marca 🚫 #3, e é a razão de o rótulo ser este.
 *
 * ⚠️⚠️ E É O ÚNICO PONTO DO MÓDULO EM QUE **DESCONHECIDO É ESTADO TERMINAL
 * ACEITÁVEL** — por recomendação de classe 1. ⛔ Ele ⛔ não gera pendência, e
 * ⛔ nada espera por ele.
 */
export const MICROSSANGRAMENTOS_P: readonly CampoP[] = [
  {
    id: "informacao_previa_cmb",
    rotulo: "Informação prévia sobre microssangramentos cerebrais",
    tipo: "escolha",
    temporalidade: "estavel",
    opcoes: [
      "Não há informação prévia",
      "Ressonância prévia com 1 a 10",
      "Ressonância prévia com mais de 10",
      NAO_SEI,
    ],
    ajuda: "Só registra o que já se sabe. Não é preciso obter ressonância para responder.",
    fonte: "F-07",
    bloqueiaTerapia: false,
    nota: "A fonte recomenda administrar a trombólise sem obter ressonância para excluir microssangramentos. Não haver informação prévia é resposta completa, com recomendação de classe 1, e nada espera por ela.",
  },
];

/**
 * FUNCIONALIDADE PRÉVIA — ⚠️ **veio da Superfície B** em 2026-08-29.
 *
 * ⚠️ É função basal **ANTES deste AVC** — antecedente, ⛔ não exame do episódio.
 * Mudou de dono e ⛔ **não** mudou de experiência: **B continua exibindo e
 * preenchendo o mesmo fato**, com os mesmos descritores e o mesmo controle
 * recolhível. ⛔ Nenhuma segunda versão (decisão do autor).
 */
export const FUNCIONAL_PREVIA_P: readonly CampoP[] = [
  {
    id: "mrs_previo",
    rotulo: "mRS prévio (funcionalidade basal)",
    tipo: "grau",
    temporalidade: "estavel",
    opcoes: [...GRAUS_MRS_PREVIO.map(rotuloDoGrau), NAO_SEI],
    ajuda: "Estado funcional ANTES deste AVC. Não é o mRS que este AVC vai produzir.",
    fonte: "F-27",
    bloqueiaTerapia: false,
    nota: "Descritores do Quadro 4 das diretrizes da SBACV. A versão brasileira do mRS é culturalmente adaptada, e a avaliação estruturada melhora a concordância entre avaliadores (Cincura 2009). A fonte do AVC não nomeia valor de corte.",
  },
];

const GRUPOS_P_DECLARADOS: readonly GrupoDeclarado[] = [
  { id: "identificacao", titulo: "Identificação", campos: IDENTIFICACAO_P },
  { id: "basais", titulo: "Dados basais", campos: BASAIS_P },
  { id: "alergias", titulo: "Alergias", campos: ALERGIAS_P },
  { id: "medicacoes", titulo: "Medicações em uso", campos: MEDICACOES_P },
  /**
   * ⚠️⚠️ OS TRÊS BLOCOS DE ANTECEDENTE NASCEM RECOLHIDOS — medido em 375×812:
   * abertos, eles somavam **2.226 px** dos 4.630 da superfície, quase metade
   * dela, para listas que a maioria dos pacientes responde com "nenhum destes".
   *
   * ⚠️ **§7.3 permite, e a razão ⛔ não é contagem** (que E-35 proíbe como
   * critério): é **espécie de conteúdo**. Antecedente é conteúdo de **exceção**,
   * consultado quando existe — o mesmo argumento do "NIHSS trazido de fora" na
   * Superfície B. O cabeçalho declara o que guarda, e ⛔ nada aqui muda decisão
   * imediata.
   *
   * ⛔ E ⛔ NÃO SE RECOLHE O QUE DECIDE AGORA: identificação, dados basais,
   * alergias, medicações em uso, microssangramentos e funcionalidade prévia
   * nascem **abertos**. A prova confere isso bloco a bloco.
   */
  {
    id: "antecedentes-intracranianos",
    titulo: "Antecedentes intracranianos",
    campos: ANTECEDENTES_INTRACRANIANOS_P,
    recolhido: true,
  },
  {
    id: "antecedentes-sistemicos",
    titulo: "Antecedentes cardíacos e sistêmicos",
    campos: ANTECEDENTES_SISTEMICOS_P,
    recolhido: true,
  },
  {
    id: "procedimentos",
    titulo: "Procedimentos e sangramentos recentes",
    campos: PROCEDIMENTOS_P,
    recolhido: true,
  },
  { id: "microssangramentos", titulo: "Microssangramentos cerebrais", campos: MICROSSANGRAMENTOS_P },
  { id: "funcional-previa", titulo: "Funcionalidade prévia", campos: FUNCIONAL_PREVIA_P },
];

export const GRUPOS_P: readonly Grupo[] = comCasa("paciente", GRUPOS_P_DECLARADOS);

export const TODOS_OS_CAMPOS_P: readonly Campo[] = GRUPOS_P.flatMap((g) => [...g.campos]);

/**
 * A SAÍDA SEM CONCLUSÃO DE CADA ESCOLHA — **E-02 / E-37**, declarada campo a
 * campo, como na Superfície C.
 */
export const SAIDA_SEM_CONCLUSAO_P: Readonly<Record<string, string>> = {
  peso_origem: NAO_SEI,
  alergia_contraste: NAO_SEI,
  anticoagulante_em_uso: NAO_SEI,
  antiagregante_em_uso: NAO_SEI,
  antecedentes_intracranianos: NAO_SEI,
  antecedentes_cardio_sistemicos: NAO_SEI,
  procedimentos_recentes: NAO_SEI,
  informacao_previa_cmb: NAO_SEI,
  mrs_previo: NAO_SEI,
};

/**
 * OS CAMPOS DE VOCABULÁRIO PRÓPRIO — ⚠️ declarados com MOTIVO, um a um.
 *
 * ⚠️ Neles o valor gravado é o próprio rótulo, e ⛔ nenhum é `"sim"`. Lidos por
 * `ternario()`, TODOS virariam `false`.
 */
export const VOCABULARIO_PROPRIO_P: readonly { id: string; motivo: string }[] = [
  { id: "peso_origem", motivo: "origem muda a confiança sem mudar o número (E-14)" },
  { id: "antiagregante_em_uso", motivo: "simples e dupla são forças diferentes na fonte" },
  { id: "informacao_previa_cmb", motivo: "três estados com classe de recomendação própria" },
  { id: "mrs_previo", motivo: "escala com grau 0 válido (E-10), e o rótulo traz o descritor" },
];

/**
 * O CAMPO DE PACIENTE COM ESTE ID — ⚠️ a porta pela qual outras superfícies o
 * tomam emprestado.
 *
 * ⚠️⚠️ ⛔ SEM PISO SILENCIOSO: id inexistente é **erro de programação** e grita.
 * Devolver `undefined` faria a superfície emprestada renderizar um campo a
 * menos, calada — e um campo que some da tela ⛔ não é medido por trava de
 * conteúdo, é medido por ninguém.
 */
export function CAMPO_DO_PACIENTE(id: string): Campo {
  const achado = TODOS_OS_CAMPOS_P.find((c) => c.id === id);
  if (!achado) throw new Error(`CAMPO_DO_PACIENTE: id desconhecido "${id}"`);
  return achado;
}

export const SUPERFICIE_P: SuperficieId = "paciente";
