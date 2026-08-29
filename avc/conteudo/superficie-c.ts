/**
 * CONTEÚDO DA SUPERFÍCIE C — Imagem.
 *
 * ⛔ Dados puros. ⛔ Nenhum React, ⛔ nenhuma cor, ⛔ nenhuma decisão de tela.
 * A medicina mora aqui e a superfície apenas a renderiza (E-29).
 *
 * ── O QUE ESTA SUPERFÍCIE É ───────────────────────────────────────────────
 *
 * É o **primeiro grande ponto de decisão** do módulo (§1.8): a imagem voltou, e
 * dela saem **três caminhos** — segue isquêmico · hemorragia intracraniana ·
 * suspeita de HSA. Duas dessas saídas **saem do módulo** (E-09).
 *
 * ⚠️⚠️ AQUI NASCE O ÚNICO BLOQUEIO DE CLASSE DO MÓDULO — **R2.1 / E-08**:
 * *"…exclude intracranial hemorrhage **before initiating reperfusion
 * interventions**"* (F-16, rec. 1, **COR 1 · LOE A**).
 *
 * ⚠️ E ele ⛔ **NÃO mora em campo nenhum** (decisão do autor, **PD-23**): ⛔ nenhum
 * campo desta superfície tem `bloqueiaTerapia: true`, e o tipo continua
 * literalmente `false`. O bloqueio é **estado derivado** (`derivacoes-c.ts`),
 * porque marcar o campo gravaria o veredito dentro do fato — **E-43**.
 *
 * ⚠️⚠️ AS TRÊS MARCAS 🚫 DESTE BLOCO (CONSOLIDACAO-CLINICA-AVC, Bloco 2):
 *   · 🚫 **creatinina antes da angioTC/CTP** — *"should not be delayed"*,
 *     **COR 1 · B-NR**. ⛔ Por isso ⛔ não existe campo de creatinina, de função
 *     renal ou de qualquer exame de laboratório nesta superfície;
 *   · 🚫 **angioTC/CTP/RM resultadas para liberar a IVT** na janela padrão;
 *   · 🚫 **"meta de 25 minutos"** como trava — é *"as rapidly as possible
 *     (eg…)"*, recomendação de **protocolo institucional** (R2.5, F-11). ⛔ Por
 *     isso o horário da tomografia é registro, e ⛔ nunca cronômetro, meta ou
 *     alerta de atraso.
 *
 * ⚠️ **O QUE ⛔ NÃO ENTRA NESTA RODADA**, por decisão do autor:
 *   · **PC-ASPECTS** — entra com a circulação posterior, na Reperfusão;
 *   · **mismatch DWI-FLAIR e penumbra** — só significam alguma coisa contra a
 *     regra de janela estendida (F-03), e ela mora onde a terapia mora. Trazidos
 *     para cá antes da regra, fariam esta tela parecer porta terapêutica.
 */

import type { SuperficieId } from "../nucleo/tipos";
import type { Campo } from "./campo";
import { NAO_SEI, SIM_NAO_INCERTO, SIM_NAO_NAO_SEI } from "./campo";

export type CampoC = Campo;

/**
 * AS QUATRO RESPOSTAS DO RESULTADO DA TOMOGRAFIA — ⚠️ **fonte única**.
 *
 * ⚠️⚠️ ELAS SÃO CONSTANTES, e ⛔ não literais repetidos, porque as derivações
 * comparam contra elas. Escritas duas vezes, bastaria alguém melhorar o texto da
 * tela para a derivação parar de reconhecer "hemorragia intracraniana" — e o
 * destino sumiria **em silêncio**, com a tela continuando bonita. É a mesma
 * família da I6: dois lugares decidindo, e quem decide é o errado.
 *
 * ⚠️⚠️ **UM CAMPO, QUATRO RESPOSTAS — e ⛔ não dois campos.** "TC realizada?"
 * seguido de "qual o resultado?" é a duplicação que o autor apontou na B
 * (*"informações semelhantes, meio duplicadas"*): as quatro respostas cobrem os
 * quatro estados reais do mundo, e o app ⛔ não repergunta o que já sabe (PD-20).
 */
export const RESULTADO_TC = {
  semHemorragia: "Sem hemorragia",
  hemorragia: "Hemorragia intracraniana",
  /**
   * ⚠️⚠️ **PD-22** — esta resposta é FATO VÁLIDO e ⛔ **não fecha a pendência**.
   *
   * ⛔ Ela ⛔ não é o mesmo "não sei" da última-vez-bem. Lá, "ninguém sabe dizer" é
   * fato **permanente** do mundo, e a pendência fecha porque a pergunta foi
   * respondida. Aqui o estado é **transitório**, com resolução esperada em
   * minutos — fechar a pendência tiraria da tela a tarefa mais importante do
   * atendimento, e a tela diria "resolvido" sobre o que ⛔ não está.
   */
  aguardando: "Realizada — resultado ainda não disponível",
  naoRealizada: "Ainda não realizada",
} as const;

export const OPCOES_RESULTADO_TC: readonly string[] = [
  RESULTADO_TC.semHemorragia,
  RESULTADO_TC.hemorragia,
  RESULTADO_TC.aguardando,
  RESULTADO_TC.naoRealizada,
];

/** Vocabulário próprio da imagem vascular. ⚠️ Lido por rótulo, ⛔ nunca por `ternario()`. */
export const ANGIO = {
  realizada: "Realizada",
  naoRealizada: "Ainda não realizada",
  /**
   * ⚠️⚠️ ISTO ⛔ NÃO É "NÃO REALIZADA", e a diferença é brasileira: **E-18**
   * declara a disponibilidade de angioTC, perfusão e software como ⛔ não
   * inferível da fonte americana (F-16 §9, F-03 §12). Sem esta opção, o médico
   * de um serviço que ⛔ não tem o exame é empurrado a registrar "ainda não
   * realizada" — que descreve espera onde ⛔ não há o que esperar.
   */
  indisponivel: "Não disponível neste serviço",
} as const;

export const OPCOES_ANGIO: readonly string[] = [
  ANGIO.realizada,
  ANGIO.naoRealizada,
  ANGIO.indisponivel,
  NAO_SEI,
];

/**
 * OS SÍTIOS QUE A FONTE NOMEIA — F-08, §4.7.2 recs. 1–8 e §4.7.3.
 *
 * ⚠️⚠️ **M2 DOMINANTE E M2 NÃO DOMINANTE NASCEM SEPARADOS**, e isso ⛔ não é
 * capricho de lista: entre os dois a fonte vai de **COR 2a** para **COR 3: No
 * Benefit · LOE A**. Achatar em "oclusão de M2" apagaria a distinção mais fina
 * do slot inteiro.
 *
 * ⛔ **O QUE ESTA LISTA ⛔ NÃO FAZ:** ⛔ nenhuma opção diz o que implica. Os cortes
 * — NIHSS ≥6, mRS prévio, ASPECTS, faixa de horas — são **limites de F-08** e
 * moram na Reperfusão. Aqui só se registra o que o laudo diz.
 */
export const OPCOES_SITIO_OCLUSAO: readonly string[] = [
  "Artéria carótida interna",
  "M1 da artéria cerebral média",
  "M2 dominante da artéria cerebral média",
  "M2 não dominante ou codominante",
  "Artéria cerebral média distal",
  "Artéria cerebral anterior",
  "Artéria cerebral posterior",
  "Artéria basilar ou circulação posterior",
  "Nenhuma oclusão identificada",
  "Não especificado no laudo",
  NAO_SEI,
];

/**
 * BLOCO 1 · A TOMOGRAFIA — o resultado, a suspeita de HSA e o horário.
 *
 * ⚠️⚠️ **PD-21 · POR QUE A SUSPEITA DE HSA É CAMPO PRÓPRIO** (decisão do autor,
 * 2026-08-29): uma tomografia **sem hemorragia** convivendo com **suspeita
 * clínica de HSA** é combinação real. Se as três saídas de §1.8 fossem opções
 * mutuamente exclusivas de um mesmo campo, essa combinação ficaria
 * **irrepresentável** — o médico marcaria "sem hemorragia" e a saída de HSA
 * sumiria da tela.
 *
 * ⚠️ **E os fatos coexistem; os DESTINOS, ⛔ não.** A resolução de saída única
 * está em `derivacoes-c.ts` — a estrutura guarda os dois fatos, e a tela ⛔ nunca
 * manda o médico para dois lugares ao mesmo tempo.
 */
export const TOMOGRAFIA_C: readonly CampoC[] = [
  {
    id: "tc_resultado",
    rotulo: "Tomografia sem contraste",
    tipo: "escolha",
    opcoes: OPCOES_RESULTADO_TC,
    fonte: "F-16",
    bloqueiaTerapia: false,
    nota: "A fonte recomenda imagem cerebral de emergência na avaliação inicial, para excluir hemorragia intracraniana antes de iniciar intervenções de reperfusão.",
  },
  {
    id: "suspeita_hsa",
    rotulo: "Suspeita de hemorragia subaracnóidea",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    ajuda: "Registra a suspeita clínica, que pode existir mesmo com tomografia sem hemorragia.",
    fonte: "F-16",
    bloqueiaTerapia: false,
    /**
     * ⚠️⚠️ A NOTA DIZ DE ONDE VEM A SAÍDA, e ⛔ não finge que é da fonte
     * americana: F-16 fala em **excluir hemorragia intracraniana**, e ⛔ não
     * define fluxo para suspeita de HSA. A saída específica é decisão da spec
     * (§1.8) — atribuí-la à AHA/ASA seria inventar procedência (**E-30**).
     */
    nota: "A saída específica para hemorragia subaracnóidea é uma decisão da especificação deste módulo. A fonte trata da exclusão de hemorragia intracraniana antes da reperfusão, e não define conduta para esta suspeita.",
  },
  {
    id: "hipodensidade_clara",
    /**
     * ⚠️⚠️ O ÚNICO ACHADO DE TC EM QUE A FONTE DÁ CRITÉRIO APLICÁVEL À BEIRA DO
     * LEITO — e ele estava fora da Superfície C até 2026-08-29.
     *
     * Verbatim (F-07, Table 8, faixa absoluta, p. e367):
     *
     *   *"Clear hypodensity is when the degree of hypodensity is greater than
     *   the density of contralateral unaffected white matter."*
     *
     * ⚠️ Por isso a definição vai em `ajuda` — **visível**, e ⛔ não atrás do ⓘ:
     * ela é o que muda a RESPOSTA de quem ⛔ não tem o termo na cabeça, que é
     * exatamente o critério de §7.3 para texto permanente.
     *
     * ⛔⛔ E ⛔ NÃO É ELEGIBILIDADE (instrução do autor). A Table 8 ⛔ não tem
     * COR/LOE em célula nenhuma, e a própria legenda declara esta faixa
     * *"unsupported by clinical evidence"* (**E-48**). O achado é **fato**; o que
     * a fonte diz sobre a trombólise é conteúdo da Superfície F.
     *
     * ⛔ E ⛔ NÃO É ASPECTS. São duas leituras diferentes da mesma tomografia, e
     * ⛔ nenhuma delas calcula a outra.
     */
    rotulo: "Hipodensidade clara na tomografia",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    ajuda: "A fonte define hipodensidade clara como aquela cuja densidade é maior que a da substância branca contralateral não acometida.",
    fonte: "F-07",
    bloqueiaTerapia: false,
    nota: "A fonte lista este achado na faixa que ela mesma chama de contraindicações absolutas — e declara essa faixa como não sustentada por evidência clínica, sem classe de recomendação em nenhuma célula. O que fazer com a trombólise é decisão da superfície de reperfusão.",
  },
  {
    id: "hora_tc",
    /**
     * ⚠️⚠️ **E-36 · O CONTROLE NOMEIA O QUE MARCA**, e este ⛔ NÃO alimenta relógio
     * clínico nenhum — ⛔ nem `ultima_vez_bem`, ⛔ nem `reconhecimento`, ⛔ nem
     * `t0_operacional`. Ele ⛔ não tem `relogio` declarado de propósito: um
     * horário de exame que virasse marco de janela produziria janela errada com
     * aparência de precisão (**E-21**).
     *
     * ⚠️⚠️ E ⛔ NÃO EXISTE CONTAGEM A PARTIR DELE. R2.5 e a marca 🚫 #3: *"as
     * rapidly as possible (eg, within 25 minutes)"* é recomendação de
     * **protocolo institucional**, ⛔ não meta deste paciente — e F-11 registra
     * como **achado negativo** que a fonte ⛔ não estabelece meta de porta-agulha.
     * ⛔ Nenhum cronômetro, ⛔ nenhuma meta, ⛔ nenhum aviso de atraso.
     */
    rotulo: "Horário da tomografia",
    tipo: "hora",
    ajuda: "Momento em que o exame foi feito. Não é marco de janela terapêutica.",
    fonte: "F-11",
    bloqueiaTerapia: false,
    nota: "Registro operacional, para auditoria e qualidade. A fonte recomenda que o serviço organize protocolos para a imagem ser feita o mais rápido possível, e isso é recomendação para o serviço, não meta deste paciente.",
  },
] as const;

/**
 * BLOCO 2 · O QUE A FRENTE ENDOVASCULAR USA.
 *
 * ⚠️⚠️ AGRUPADO PELO QUE CONSOME, e ⛔ não pelo aparelho que produz: o ASPECTS sai
 * da tomografia **sem contraste**, e está aqui porque quem o lê é a avaliação
 * para trombectomia. Agrupá-lo com o resultado da TC misturaria a **exclusão de
 * hemorragia** — que governa uma classe inteira — com dados que ⛔ não governam
 * nada nesta superfície.
 *
 * ⛔⛔ **NADA AQUI É REQUISITO PARA A TROMBÓLISE.** A advertência de modelagem de
 * F-08 é explícita: `EVT elegível = sim/não` ⛔ **não é fato armazenado**. Os
 * fatos são estes; a elegibilidade é derivada deles contra a regra vigente, na
 * Reperfusão (§4.3, **E-43**, **PD-24**).
 */
export const ENDOVASCULAR_C: readonly CampoC[] = [
  {
    id: "aspects",
    /**
     * ⚠️⚠️ **INFORMADO**, e ⛔ não calculado — decisão do autor, 2026-08-29: *"não
     * transformaria C em calculadora ASPECTS sem fonte/figura adequada"*.
     *
     * ⚠️ A Figure 2, que a rec. 1 referencia para o ASPECTS, ⛔ **não foi
     * transcrita** (F-16, §Achados que pertencem a outros slots). Escrever aqui
     * o que é ASPECTS, ou como se pontua, seria redação de memória — **E-31**.
     * O campo carrega o **nome** e ⛔ nada além. Dívida declarada: **D-111**.
     */
    /**
     * ⚠️⚠️ O RÓTULO DIZ DE ONDE O NÚMERO VEM — relato do autor, 2026-08-29:
     * *"o usuário ⛔ não sabe classificar isso"*.
     *
     * ── O DEFEITO QUE ISTO FECHA ────────────────────────────────────────────
     *
     * "ASPECTS informado" ⛔ não dizia informado **por quem**. Um campo numérico
     * que o médico ⛔ não sabe calcular produz **branco ou chute** — e o chute
     * alimenta a decisão de trombectomia na Superfície F. ⚠️ Campo que convida a
     * inventar é pior que campo ausente.
     */
    rotulo: "ASPECTS informado no laudo ou pela equipe",
    tipo: "grandeza",
    faixa: { min: 0, max: 10, passo: 1 },
    /**
     * ⚠️⚠️ **E-10 · O ZERO AQUI É RESPOSTA.** ASPECTS 0 é escore válido, e a
     * própria fonte tem faixa para ele (F-08, rec. 4: *"ASPECTS 0 to 2"*). Sem
     * porta explícita, registrá-lo exigiria passar por um `1` que ninguém mediu.
     */
    zeroValido: true,
    /**
     * ⚠️⚠️ A CONFISSÃO FICA **VISÍVEL**, e ⛔ não atrás do ⓘ (decisão do autor).
     *
     * ⚠️ A versão anterior dizia *"se disponível no laudo ou na avaliação"* — e
     * "na avaliação" é justamente a porta para estimar de memória. A frase agora
     * diz o que o app ⛔ NÃO faz, e de onde o número tem de vir.
     */
    ajuda: "O app ainda não calcula o ASPECTS nesta versão. Registre apenas o valor que vier do laudo ou da equipe, sem estimar.",
    fonte: "F-08",
    bloqueiaTerapia: false,
    nota: "Escore informado por quem leu a imagem. Este aplicativo não calcula ASPECTS, e os cortes que a fonte usa pertencem à avaliação para trombectomia. Quando a escala for implementada, o valor calculado aqui e o valor informado vão conviver, como já acontece com o NIHSS.",
  },
  {
    id: "efeito_de_massa",
    /** ⚠️ *"without significant mass effect on imaging"* — o **significativo** é da fonte (E-45). */
    rotulo: "Efeito de massa significativo na imagem",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-08",
    bloqueiaTerapia: false,
    nota: "A fonte usa a expressão efeito de massa significativo, sem definir medida. A leitura é de quem interpreta a imagem.",
  },
  {
    id: "suspeita_lvo",
    rotulo: "Suspeita de oclusão de grande vaso",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-16",
    bloqueiaTerapia: false,
    nota: "A fonte recomenda imagem vascular de emergência na suspeita de oclusão de grande vaso, o mais rápido possível, até 24 horas da última vez visto bem.",
  },
  {
    id: "angio_realizada",
    rotulo: "Angiotomografia de vasos cervicais e intracranianos",
    tipo: "escolha",
    opcoes: OPCOES_ANGIO,
    fonte: "F-16",
    bloqueiaTerapia: false,
    /**
     * ⚠️⚠️ A NOTA CARREGA A MARCA 🚫 #5, com o verbatim atrás dela: *"emergent
     * vascular imaging with contrast-enhanced CTA and/or CTP should not be
     * delayed to obtain serum creatinine concentration"* (**COR 1 · B-NR**).
     */
    nota: "A fonte diz que a imagem vascular de emergência não deve ser atrasada para obter a creatinina sérica.",
  },
  {
    id: "sitio_oclusao",
    rotulo: "Sítio da oclusão descrito no laudo",
    tipo: "escolha",
    opcoes: OPCOES_SITIO_OCLUSAO,
    /**
     * ⚠️ ONZE OPÇÕES, e ⛔ nenhuma delas se responde sem laudo em mãos. Abertas,
     * ocupavam **682 px** num celular de 375 — um quarto da superfície — entre
     * a pergunta que governa a reperfusão e o painel de leituras.
     *
     * ⛔ Recolher aqui ⛔ não esconde decisão (§7.3): ⛔ nada neste campo bloqueia,
     * e a resposta escolhida continua visível na linha fechada.
     */
    recolhivel: true,
    fonte: "F-08",
    bloqueiaTerapia: false,
    nota: "A fonte separa M2 dominante de M2 não dominante ou codominante, e a força da recomendação muda entre as duas. Registre como o laudo descreve.",
  },
  {
    id: "alergia_contraste",
    /**
     * ⚠️⚠️ ESTE CAMPO EXISTE POR DECISÃO DO AUTOR (2026-08-29), CONTRA A MINHA
     * PROPOSTA DE ⛔ NÃO TÊ-LO — e o argumento dele é a razão de o comentário
     * ser longo:
     *
     * *"Não esperar por creatinina é uma coisa; eliminar uma informação
     * relevante à ação contrastada é outra."*
     *
     * ⚠️ Eu havia proposto ⛔ nenhum campo de contraste nesta superfície, tratando
     * a marca 🚫 #5 como se ela apagasse tudo que toca o contraste. Ela ⛔ não
     * apaga: o que a fonte proíbe é **atrasar a imagem vascular esperando a
     * creatinina**, e isso ⛔ não diz nada sobre registrar uma alergia conhecida.
     *
     * ⚠️⚠️ AS TRÊS TRAVAS QUE O AUTOR FIXOU, e que as provas medem uma a uma:
     *   · ⛔ **nunca bloqueia a IVT** — ⛔ nenhuma leitura de exclusão de hemorragia
     *     olha para este campo;
     *   · ⛔ **nunca cria dependência de creatinina** — ⛔ não existe campo de
     *     laboratório nesta superfície, e este ⛔ não abre a porta para um;
     *   · ⛔ **⛔ não bloqueia a superfície C inteira**, e ⛔ não gera pendência: ele
     *     pertence à **segurança da ação específica** de imagem com contraste.
     *
     * ⚠️ É o princípio de dependência específica de **E-25**: condição
     * específica ↔ ação específica, ⛔ nunca superfície inteira.
     *
     * ⛔⛔ E ⛔ SEM CONDUTA INVENTADA: a fonte do AVC ⛔ não diz o que fazer diante
     * de alergia a contraste. O app **registra o fato** e se cala — o manejo é
     * decisão clínica e institucional. Dívida declarada: **D-115**.
     */
    rotulo: "Alergia prévia importante a contraste iodado",
    tipo: "escolha",
    opcoes: SIM_NAO_NAO_SEI,
    ajuda: "Diz respeito apenas ao exame com contraste. Não interfere na trombólise.",
    fonte: "F-16",
    bloqueiaTerapia: false,
    nota: "A fonte do AVC não define conduta para alergia a contraste. Este registro fica na trilha do atendimento, e o manejo é decisão clínica e institucional.",
  },
] as const;

/**
 * BLOCO 3 · IMAGEM AVANÇADA — ⚠️ **nasce recolhido**.
 *
 * ⚠️⚠️ SÓ **QUAIS EXAMES JÁ FORAM FEITOS**, e ⛔ nenhum achado deles. O mismatch
 * DWI-FLAIR e a penumbra salvável só significam alguma coisa contra a regra de
 * **janela estendida** (F-03, recs. 1–3), e essa regra mora na Reperfusão.
 * Coletados aqui, antes da regra que os lê, fariam esta tela parecer o portão
 * que **R2.3** proíbe (**COR 1 · B-NR**: neuroimagem multimodal ⛔ não atrasa a
 * IVT).
 *
 * ⛔ Recolher aqui ⛔ não esconde conduta (§7.3, E-35): ⛔ nada neste bloco muda
 * decisão imediata, e o cabeçalho declara o que ele guarda.
 */
export const AVANCADA_C: readonly CampoC[] = [
  {
    id: "imagem_avancada",
    rotulo: "Exames avançados já realizados",
    tipo: "multipla",
    opcoes: [
      "Tomografia de perfusão",
      "Ressonância com difusão e FLAIR",
      "Ressonância com perfusão",
      "Nenhuma",
      NAO_SEI,
    ],
    /** ⚠️ "Nenhuma" e "Não sei" são estados do conjunto, ⛔ não exames ao lado dos outros. */
    exclusivas: ["Nenhuma", NAO_SEI],
    fonte: "F-03",
    bloqueiaTerapia: false,
    nota: "Registro do que já foi feito. Os achados que dependem da janela estendida entram junto com a regra que os interpreta.",
  },
] as const;

/**
 * OS DOIS DESTINOS DA IMAGEM — ⚠️ **E-09**: destino para módulo inexistente é
 * **destino declarado**, ⛔ nunca beco.
 *
 * ⚠️⚠️ ELES ⛔ NÃO SÃO "ESTADO DERIVADO": destino é a **nona espécie** (§2.9), e a
 * diferença é que ele ⛔ não descreve o paciente — ele muda **de quem ele é**.
 * O paciente com hemorragia ⛔ não pode cair em estado sem comportamento porque o
 * módulo de AVC hemorrágico ainda ⛔ não existe.
 *
 * ⚠️ **A PROCEDÊNCIA DE CADA UM É DIFERENTE, e ⛔ não se mistura (E-30):**
 *   · a hemorragia sai da **fonte** — F-16 rec. 1, COR 1 · LOE A;
 *   · a HSA sai da **spec** — §1.8, decisão de recorte deste módulo. A fonte
 *     americana ⛔ não define fluxo para suspeita de HSA, e pendurar a saída nela
 *     seria inventar procedência.
 */
export const DESTINOS_DA_IMAGEM = {
  hsa: {
    id: "suspeita_hsa",
    rotulo: "Suspeita de hemorragia subaracnóidea",
    modulo: "Fluxo de hemorragia subaracnóidea",
    /** ⚠️ ⛔ NÃO EXISTE — e dizer isso na tela é o que E-09 exige. */
    moduloExiste: false,
    oQueAcontece:
      "Este atendimento segue pelo fluxo específico da hemorragia subaracnóidea. O motivo fica registrado, e o atendimento continua.",
    fonte: "spec §1.8",
  },
  hemorragia: {
    id: "hemorragia_intracraniana",
    /**
     * ⚠️ "IDENTIFICADA" — redação do autor na revisão de 2026-08-29. Ela nomeia
     * o que distingue este achado da suspeita que pode conviver com ele: um foi
     * **visto na imagem**, a outra é hipótese clínica.
     */
    rotulo: "Hemorragia intracraniana identificada",
    modulo: "Módulo de AVC hemorrágico",
    moduloExiste: false,
    oQueAcontece:
      "A reperfusão não é iniciada sem exclusão de hemorragia. O motivo fica registrado, e o atendimento continua.",
    fonte: "F-16",
  },
} as const;

/**
 * O FATO QUE COEXISTE COM A SAÍDA — ⚠️ e que ⛔ **não** é um segundo destino.
 *
 * ⚠️⚠️ Existe um só hoje, e ele é exatamente o caso que o autor reviu em
 * 2026-08-29: hemorragia intracraniana **identificada** convivendo com
 * **suspeita** de HSA. A saída permanece hemorrágica, e a suspeita ⛔ não some —
 * fica associada, visível, e **marcada com o id** para o subfluxo de HSA
 * reconhecê-la quando existir.
 *
 * ⚠️ `id` é para a máquina, `frase` é para o médico. Guardar só a frase deixaria
 * o subfluxo futuro dependendo de casar texto traduzível; guardar só o id
 * deixaria a tela sem o que dizer.
 */
export const FATO_ASSOCIADO = {
  suspeitaHsa: {
    id: "suspeita_hsa",
    frase: "Há também suspeita de hemorragia subaracnóidea.",
  },
} as const;

/**
 * ⚠️ A ORDEM DESTE ARRANJO É A ORDEM DA TELA, e é clínica (§7.3).
 *
 * A tomografia primeiro, porque é ela que governa a classe inteira de reperfusão;
 * os achados endovasculares depois, porque alimentam **uma** frente; a imagem
 * avançada por último e recolhida, porque é exceção.
 *
 * ⛔ Reordenar isto por conveniência de layout é mudar prioridade clínica.
 */
export const GRUPOS_C: readonly {
  id: string;
  titulo: string;
  campos: readonly CampoC[];
  nota?: string;
  recolhido?: true;
}[] = [
  {
    id: "tomografia",
    titulo: "Tomografia de crânio",
    campos: TOMOGRAFIA_C,
  },
  {
    id: "endovascular",
    titulo: "Achados que a frente endovascular usa",
    campos: ENDOVASCULAR_C,
    /**
     * ⚠️⚠️ A REDAÇÃO É DO AUTOR (2026-08-29), e a segunda frase é a correção que
     * ele fez questão de fixar: *"'estes exames' pode ser lido incluindo a TC
     * simples, e essa é justamente a imagem que precisamos para excluir
     * hemorragia antes da reperfusão"*.
     *
     * ⚠️ A distinção é clínica, ⛔ não de estilo: **imagem adicional** ⛔ não é
     * sinônimo de **imagem**. A tomografia que exclui hemorragia é COR 1 · A e
     * precede a reperfusão; a imagem adicional é o que R2.3 manda ⛔ não esperar.
     */
    nota: "Não atrase a trombólise por exames de imagem adicionais quando ela já estiver indicada pelos critérios aplicáveis. A tomografia necessária para excluir hemorragia não é exame adicional.",
  },
  {
    id: "imagem-avancada",
    titulo: "Imagem avançada",
    campos: AVANCADA_C,
    recolhido: true,
    nota: "Registro do que já foi feito. Os achados que dependem da janela estendida entram junto com a regra que os interpreta.",
  },
] as const;

export const TODOS_OS_CAMPOS_C: readonly CampoC[] = GRUPOS_C.flatMap((g) => [...g.campos]);

/** O campo de C com este id. ⚠️ ⛔ Sem piso silencioso: id inválido é erro de programação. */
export function campoDeC(id: string): CampoC {
  const achado = TODOS_OS_CAMPOS_C.find((c) => c.id === id);
  if (!achado) throw new Error(`campoDeC: id desconhecido "${id}"`);
  return achado;
}

/**
 * OS CAMPOS QUE A FRENTE ENDOVASCULAR VAI PERGUNTAR — ⚠️ derivado do bloco,
 * ⛔ nunca listado à mão.
 *
 * ⚠️⚠️ A ALERGIA A CONTRASTE ⛔ NÃO ENTRA AQUI, e a exclusão é a trava do autor:
 * ela pertence à **segurança da ação de imagem com contraste**, ⛔ não ao dossiê
 * de elegibilidade. Dentro desta lista, "ainda não registrada" apareceria como
 * informação que falta para a trombectomia — e ⛔ não é.
 */
export const IDS_DOSSIE_ENDOVASCULAR: readonly string[] = ENDOVASCULAR_C
  .filter((c) => c.id !== "alergia_contraste")
  .map((c) => c.id);

/**
 * A SAÍDA SEM CONCLUSÃO DE CADA ESCOLHA — ⚠️ **E-02 / E-37**, declarada campo a
 * campo, e ⛔ não deduzida.
 *
 * ⚠️⚠️ POR QUE UM MAPA EXPLÍCITO EM VEZ DE PROCURAR "Não sei": porque em
 * `tc_resultado` a saída sem conclusão ⛔ **não se chama** "Não sei" — chama-se
 * *"Realizada — resultado ainda não disponível"*, que é a incerteza **com
 * procedência**: o exame foi feito, e o laudo ⛔ não saiu. Uma trava que
 * procurasse a palavra passaria a exigir uma opção que ⛔ não faz sentido clínico
 * aqui, ou aceitaria um campo sem saída nenhuma.
 *
 * ⚠️ A prova exige que **TODA** escolha e múltipla de C esteja neste mapa, e que
 * a opção declarada exista entre as opções do campo. Esquecer um campo reprova.
 */
export const SAIDA_SEM_CONCLUSAO: Readonly<Record<string, string>> = {
  tc_resultado: RESULTADO_TC.aguardando,
  suspeita_hsa: "Incerto",
  hipodensidade_clara: "Incerto",
  efeito_de_massa: "Incerto",
  suspeita_lvo: "Incerto",
  angio_realizada: NAO_SEI,
  sitio_oclusao: NAO_SEI,
  alergia_contraste: NAO_SEI,
  imagem_avancada: NAO_SEI,
};

/**
 * OS CAMPOS DE VOCABULÁRIO PRÓPRIO — declarados COM MOTIVO, um a um.
 *
 * ⚠️⚠️ Neles o valor gravado é o próprio rótulo, e ⛔ nenhum é `"sim"`. Lidos por
 * `ternario()`, TODOS virariam `false` — "Hemorragia intracraniana" seria
 * indistinguível de "não há hemorragia", que é a negativa silenciosa mais cara
 * que este módulo poderia produzir. A prova confere que ⛔ nenhuma derivação de C
 * os lê por ali.
 */
export const VOCABULARIO_PROPRIO_C: readonly { id: string; motivo: string }[] = [
  { id: "tc_resultado", motivo: "quatro respostas do mundo real, e ⛔ nenhuma é sim ou não" },
  { id: "angio_realizada", motivo: "indisponível no serviço é diferente de ainda não realizada" },
  { id: "sitio_oclusao", motivo: "sítio anatômico ⛔ não é resposta binária" },
];

export const SUPERFICIE_C: SuperficieId = "imagem";
