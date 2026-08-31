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
import type { Campo, CampoDeclarado, Grupo, GrupoDeclarado } from "./campo";
import { camposDoGrupo, comCasa, NAO_SEI, SIM_NAO_INCERTO } from "./campo";
import { CAMPO_DO_PACIENTE } from "./paciente";

/**
 * ⚠️ O que se ESCREVE aqui — a **casa** ⛔ não entra: ela é carimbada por
 * `comCasa()` no fim do arquivo, uma vez, para todos os campos do módulo.
 */
export type CampoC = CampoDeclarado;

/**
 * AS **DUAS** RESPOSTAS DO RESULTADO DA IMAGEM — ⚠️ **fonte única**.
 *
 * ⚠️⚠️ ELAS SÃO CONSTANTES, e ⛔ não literais repetidos, porque as derivações
 * comparam contra elas. Escritas duas vezes, bastaria alguém melhorar o texto da
 * tela para a derivação parar de reconhecer "hemorragia intracraniana" — e o
 * destino sumiria **em silêncio**, com a tela continuando bonita.
 *
 * ── ⚠️⚠️ ERAM QUATRO, E DUAS ⛔ NÃO ERAM RESULTADO (autor, 2026-08-30) ────────
 *
 * O campo trazia *"Ainda ⛔ não realizada"* e *"Realizada — resultado ainda ⛔ não
 * disponível"* como se fossem leituras radiológicas. ⛔ Elas ⛔ não são: são
 * **estado operacional do episódio**, e misturá-las no resultado tornava o campo
 * irrepresentável assim que passou a existir **mais de um estudo** — duas TCs, e
 * o app teria de dizer que a mesma tomografia foi e ⛔ não foi realizada.
 *
 * > *"⛔ Ainda ⛔ não realizada ⛔ ou realizada, resultado pendente ⛔ não são resultados
 * > de imagem."*
 *
 * ⚠️ A situação agora é **derivada** das instâncias — `situacaoDaTcSemContraste()`
 * —, e ⛔ nenhuma delas volta como valor gravável.
 */
export const RESULTADO_TC = {
  /**
   * ⚠️⚠️ **"IDENTIFICADA NO EXAME"**, e ⛔ não "sem hemorragia" — correção do autor,
   * 2026-08-30:
   *
   * > *"evita a leitura absoluta de 'sem hemorragia', como se a TC tivesse
   * > provado inexistência de qualquer hemorragia. A diretriz fala em usar NCCT
   * > ou RM para **avaliar e excluir** hemorragia intracraniana antes da
   * > reperfusão — ⛔ ou seja, estamos falando do que a **imagem demonstra** para
   * > aquela decisão, ⛔ não de uma afirmação ontológica sobre o paciente."*
   *
   * ⚠️ E ⛔ **não** *"visível"*: *"visível para quem?"*. **Identificada no exame**
   * diz que o que está registrado é a **interpretação daquele estudo**.
   *
   * ⚠️⚠️ O par ficou **simétrico**, e é isso que o separa do juízo clínico: os dois
   * valores descrevem ⛔ **só** o que o exame mostrou, e a *"suspeita clínica de
   * hemorragia subaracnóidea"* passa a ser visivelmente **outra espécie**.
   */
  semHemorragia: "Sem hemorragia intracraniana identificada",
  hemorragia: "Hemorragia intracraniana identificada",
} as const;

/**
 * ⛔⛔ ⛔ NENHUM VALOR DESTE CAMPO PODE DIZER "EXCLUÍDA" — trava do autor:
 *
 * > *"O médico registra o **achado**; quem deriva 'exclusão declarada para a
 * > decisão' é o **motor**, usando os estudos existentes."*
 *
 * ⚠️ *"Hemorragia excluída"* seria o **veredito gravado dentro do fato** — E-43 —,
 * e ⛔ pior: com dois estudos discordantes, o fato afirmaria uma exclusão que a
 * derivação recusa. A exclusão vive em `exclusaoDeHemorragia()`, e ⛔ em nenhum
 * outro lugar.
 */
export const PALAVRAS_DE_VEREDITO_PROIBIDAS: readonly string[] = ["excluí", "exclui", "descartad", "liberad"];

export const OPCOES_RESULTADO_TC: readonly string[] = [
  RESULTADO_TC.semHemorragia,
  RESULTADO_TC.hemorragia,
];

/**
 * ⚠️⚠️ **A INSTÂNCIA DE ESTUDO** — um exame, com a sua modalidade, a sua
 * procedência, o seu horário e os **seus** achados.
 *
 * ⚠️ Mesma máquina de `pa` e `coleta`: ⛔ nenhum motor genérico nasceu para isto
 * (§9.1). O que mudou é ⛔ só quem a usa.
 */
export const ESTUDO = "estudo";

/**
 * AS MODALIDADES QUE O MÓDULO RECONHECE.
 *
 * ⚠️ ⛔ Não é afirmação clínica: é **o nome do exame**. O que cada uma pode
 * responder está em `CAPACIDADES_DA_MODALIDADE`, e ⛔ nada é herdado por
 * categoria.
 */
export const MODALIDADE = {
  tcSemContraste: "Tomografia de crânio sem contraste",
  angioTc: "Angiotomografia",
  angioRm: "Angiorressonância",
  perfusaoTc: "Tomografia de perfusão",
  rm: "Ressonância magnética",
} as const;

export const OPCOES_MODALIDADE: readonly string[] = [
  MODALIDADE.tcSemContraste,
  MODALIDADE.angioTc,
  MODALIDADE.angioRm,
  MODALIDADE.perfusaoTc,
  MODALIDADE.rm,
  /**
   * ⚠️ **E-02**: ⛔ não saber qual exame foi feito é resposta — laudo externo
   * ambíguo acontece. ⚠️ E ela ⛔ não abre achado ⛔ nenhum: sem saber a modalidade,
   * o app ⛔ não sabe o que aquele exame pode responder, e ⛔ não inventa.
   */
  NAO_SEI,
];

/**
 * ⚠️⚠️ A MATRIZ EXPLÍCITA — **modalidade → achados que ela pode responder**.
 *
 * ── ⛔ POR QUE ⛔ NÃO É UMA REGRA ABSTRATA (autor, 2026-08-30) ─────────────────
 *
 * A primeira proposta era `parenquimatosa × vascular`. O autor a recusou com o
 * contraexemplo que a quebra:
 *
 * > *"`hipodensidade_clara` é o exemplo que quebra essa simplificação:
 * > hipodensidade é linguagem de **TC**, ⛔ não um achado genérico de qualquer
 * > imagem parenquimatosa."*
 *
 * ⚠️⚠️ E a consequência é a razão de a matriz ser **literal**: uma regra por
 * categoria faria **qualquer modalidade futura herdar perguntas semanticamente
 * erradas** ⛔ só por cair no balde certo. Aqui, modalidade nova ⛔ não herda ⛔ nada
 * — ela entra na tabela, ou ⛔ não oferece achado ⛔ nenhum.
 *
 * ⛔ **A RM ⛔ NÃO herda `hipodensidade_clara`.** E ASPECTS por RM, se um dia for
 * admitido, entra **declarado** aqui com a fonte que o admita — ⛔ nunca inferido
 * porque "também é parênquima".
 *
 * ⏳ **Perfusão abre vazia de propósito.** A instância pode existir — registrar
 * que o exame foi feito é legítimo —, e ⛔ nenhuma variável nasce antes de a
 * Reperfusão definir o que consome (F-03). Campo sem leitor é o defeito que
 * originou toda esta remodelagem.
 */
export const CAPACIDADES_DA_MODALIDADE: Readonly<Record<string, readonly string[]>> = {
  [MODALIDADE.tcSemContraste]: [
    "estudo_resultado",
    "hipodensidade_clara",
    "aspects",
    "efeito_de_massa",
  ],
  [MODALIDADE.angioTc]: ["sitio_oclusao"],
  [MODALIDADE.angioRm]: ["sitio_oclusao"],
  /**
   * ⚠️⚠️ PERFUSÃO E RM DEIXARAM DE SER VAZIAS — 2026-08-31.
   *
   * ⛔ Os quatro achados de janela estendida entraram em C ⛔ e ⛔ NÃO foram
   * registrados aqui: existiam no conteúdo, nas derivações e nas provas, ⛔ e
   * ⛔ **nenhuma modalidade os oferecia** — inalcançáveis na tela. Achado pelo
   * e2e que responde um critério e confere que a falta some em F.
   *
   * ⚠️ A atribuição segue a fonte: DWI e FLAIR são sequências de **RM**;
   * penumbra se lê em estudo de **perfusão**.
   */
  [MODALIDADE.perfusaoTc]: [
    "penumbra_por_perfusao_automatizada",
    "penumbra_salvavel",
  ],
  [MODALIDADE.rm]: [
    "dwi_menor_que_um_terco",
    "flair_sem_alteracao_marcada",
  ],
};

/** ⚠️ Os achados que ESTA modalidade pode responder. ⛔ Desconhecida ⛔ não oferece nada. */
export function achadosDaModalidade(modalidade: string | undefined): readonly string[] {
  return modalidade ? (CAPACIDADES_DA_MODALIDADE[modalidade] ?? []) : [];
}

/** ⚠️ As modalidades que respondem ao resultado de hemorragia — hoje, uma. */
export const MODALIDADES_COM_RESULTADO: readonly string[] = OPCOES_MODALIDADE.filter((m) =>
  achadosDaModalidade(m).includes("estudo_resultado")
);

/** ⚠️ As modalidades vasculares — usadas pela leitura de imagem vascular. */
export const MODALIDADES_VASCULARES: readonly string[] = OPCOES_MODALIDADE.filter((m) =>
  achadosDaModalidade(m).includes("sitio_oclusao")
);

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
export const ESTUDO_C: readonly CampoC[] = [
  {
    id: "estudo_modalidade",
    temporalidade: "estavel",
    instanciaDe: ESTUDO,
    /**
     * ⚠️⚠️ SEM ELA, DOIS ESTUDOS SÃO INDISTINGUÍVEIS — e é ela que decide o que o
     * estudo pode responder (`CAPACIDADES_DA_MODALIDADE`).
     */
    rotulo: "Modalidade do exame",
    tipo: "escolha",
    opcoes: OPCOES_MODALIDADE,
    fonte: "F-16",
    bloqueiaTerapia: false,
  },
  {
    id: "estudo_procedencia",
    temporalidade: "estavel",
    instanciaDe: ESTUDO,
    /** ⚠️ **E-03**: de onde veio o exame muda a leitura sem mudar o achado. */
    rotulo: "Procedência do exame",
    tipo: "escolha",
    opcoes: ["Este serviço", "Serviço externo", NAO_SEI],
    fonte: "F-16",
    bloqueiaTerapia: false,
  },
  {
    id: "estudo_hora",
    temporalidade: "estavel",
    instanciaDe: ESTUDO,
    /**
     * ⚠️⚠️ **E-36 · O CONTROLE NOMEIA O QUE MARCA**, e este ⛔ NÃO alimenta relógio
     * clínico nenhum — ⛔ nem `ultima_vez_bem`, ⛔ nem `reconhecimento`, ⛔ nem
     * `t0_operacional`. Ele ⛔ não tem `relogio` declarado de propósito: um
     * horário de exame que virasse marco de janela produziria janela errada com
     * aparência de precisão (**E-21**).
     *
     * ⚠️⚠️ E ⛔ NÃO EXISTE CONTAGEM A PARTIR DELE. R2.5 e a marca 🚫 #3: *"as
     * rapidly as possible (eg, within 25 minutes)"* é recomendação de
     * **protocolo institucional**, ⛔ não meta deste paciente. ⛔ Nenhum cronômetro,
     * ⛔ nenhuma meta, ⛔ nenhum aviso de atraso.
     *
     * ⚠️ **Era `hora_tc`** e passou a servir qualquer modalidade (2026-08-30):
     * "hora da TC" mente num estudo de ressonância.
     *
     * ⛔ E **⛔ nenhum estudo exige horário conhecido**: resultado conhecido convive
     * com horário desconhecido, como no Laboratório.
     */
    rotulo: "Horário do exame",
    tipo: "hora",
    aceitaDesconhecido: true,
    ajuda: "Momento em que o exame foi feito. Não é marco de janela terapêutica.",
    fonte: "F-11",
    bloqueiaTerapia: false,
    nota: "Registro operacional, para auditoria e qualidade. A fonte recomenda que o serviço organize protocolos para a imagem ser feita o mais rápido possível, e isso é recomendação para o serviço, não meta deste paciente.",
  },
  {
    id: "estudo_resultado",
    temporalidade: "afericao",
    instanciaDe: ESTUDO,
    /**
     * ⚠️⚠️ O ACHADO QUE GOVERNA A CLASSE INTEIRA — **R2.1 / E-08**, e ele pertence
     * ao **estudo que o produziu**, e ⛔ não ao episódio.
     *
     * ⚠️ Duas TCs podem discordar. A divergência é **legível** e retém a
     * reperfusão nos dois sentidos; ⛔ ela ⛔ não é resolvida por procedência,
     * horário ⛔ nem ordem de digitação — ver `exclusaoDeHemorragia()`.
     */
    rotulo: "Resultado do exame",
    tipo: "escolha",
    opcoes: OPCOES_RESULTADO_TC,
    /** ⚠️ Diz que isto é **achado do exame**, e ⛔ não o juízo que corre em paralelo. */
    ajuda: "Registra o achado deste exame. Não substitui o juízo clínico registrado separadamente, como suspeita clínica de hemorragia subaracnóidea.",
    fonte: "F-16",
    bloqueiaTerapia: false,
    nota: "A fonte recomenda imagem cerebral de emergência na avaliação inicial, para excluir hemorragia intracraniana antes de iniciar intervenções de reperfusão.",
  },
  {
    id: "hipodensidade_clara",
    temporalidade: "afericao",
    instanciaDe: ESTUDO,
    /**
     * ⚠️⚠️ O ÚNICO ACHADO DE TC EM QUE A FONTE DÁ CRITÉRIO APLICÁVEL À BEIRA DO
     * LEITO.
     *
     * Verbatim (F-07, Table 8, faixa absoluta, p. e367):
     *
     *   *"Clear hypodensity is when the degree of hypodensity is greater than
     *   the density of contralateral unaffected white matter."*
     *
     * ⚠️ Por isso a definição vai em `ajuda` — **visível**, e ⛔ não atrás do ⓘ.
     *
     * ⛔⛔ E ⛔ NÃO É ELEGIBILIDADE. A Table 8 ⛔ não tem COR/LOE em célula nenhuma, e
     * a própria legenda declara esta faixa *"unsupported by clinical
     * evidence"* (**E-48**). O achado é **fato**; o que a fonte diz sobre a
     * trombólise é conteúdo da Superfície F.
     *
     * ⛔⛔ **E ⛔ NÃO É HERDADO POR CATEGORIA.** Hipodensidade é linguagem de
     * **tomografia**: a RM ⛔ não a oferece, e ⛔ nenhuma modalidade futura a ganha
     * por ser "de parênquima" — ver `CAPACIDADES_DA_MODALIDADE`.
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
    id: "aspects",
    temporalidade: "afericao",
    instanciaDe: ESTUDO,
    /**
     * ⚠️⚠️ **INFORMADO**, e ⛔ não calculado — decisão do autor: *"⛔ não
     * transformaria C em calculadora ASPECTS sem fonte/figura adequada"*.
     * A Figure 2 ⛔ não foi transcrita. Dívida declarada: **D-111**, slot **F-28**.
     *
     * ⚠️ O rótulo diz de onde o número vem: campo numérico que o médico ⛔ não sabe
     * calcular produz **branco ou chute**, e o chute alimenta a trombectomia.
     */
    rotulo: "ASPECTS informado no laudo ou pela equipe",
    tipo: "grandeza",
    faixa: { min: 0, max: 10, passo: 1 },
    /**
     * ⚠️⚠️ **E-10 · O ZERO AQUI É RESPOSTA.** ASPECTS 0 é escore válido, e a
     * própria fonte tem faixa para ele (F-08, rec. 4: *"ASPECTS 0 to 2"*).
     */
    zeroValido: true,
    ajuda: "O app ainda não calcula o ASPECTS nesta versão. Registre apenas o valor que vier do laudo ou da equipe, sem estimar.",
    fonte: "F-08",
    bloqueiaTerapia: false,
    nota: "Escore informado por quem leu a imagem. Este aplicativo não calcula ASPECTS, e os cortes que a fonte usa pertencem à avaliação para trombectomia.",
  },
  {
    id: "efeito_de_massa",
    temporalidade: "afericao",
    instanciaDe: ESTUDO,
    /** ⚠️ *"without significant mass effect on imaging"* — o **significativo** é da fonte (E-45). */
    rotulo: "Efeito de massa significativo na imagem",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-08",
    bloqueiaTerapia: false,
    nota: "A fonte usa a expressão efeito de massa significativo, sem definir medida. A leitura é de quem interpreta a imagem. Definição operacional: slot F-29, ainda sem fonte candidata.",
  },
  {
    /**
     * ⚠️⚠️ DOIS COMPONENTES, ⛔ e ⛔ não um booleano.
     *
     * §4.6.3 rec. 1 exige *"an MRI-DWI lesion **smaller than one-third of the
     * MCA territory**"* **e** *"**no marked signal change** on FLAIR"*.
     *
     * ⛔ Colapsá-los apagaria **qual dos dois** falta — e apagaria que o segundo
     * é uma **ausência**, que ⛔ não pode ser presumida (E-02).
     */
    id: "dwi_menor_que_um_terco",
    temporalidade: "afericao",
    instanciaDe: ESTUDO,
    rotulo: "Lesão em DWI menor que um terço do território da ACM",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-03",
    bloqueiaTerapia: false,
    nota: "Critério da recomendação de janela estendida por início desconhecido.",
  },
  {
    id: "flair_sem_alteracao_marcada",
    temporalidade: "afericao",
    instanciaDe: ESTUDO,
    /** ⚠️ A pergunta é pela **ausência** — é assim que a fonte a escreve. */
    rotulo: "Ausência de alteração de sinal marcada no FLAIR",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-03",
    bloqueiaTerapia: false,
    nota: "A fonte pede ausência de alteração marcada. Não responder não equivale a ausência.",
  },
  {
    /**
     * ⚠️⚠️ O MÉTODO DIFERE ENTRE AS RECOMENDAÇÕES — e ⛔ isso ⛔ não pode ser
     * achatado.
     *
     * §4.6.3 **rec. 2** exige *"salvageable ischemic penumbra detected on
     * **automated perfusion imaging**"*. §4.6.3 **rec. 3** diz apenas
     * *"with salvageable ischemic penumbra"*, ⛔ **sem qualificar o método**.
     *
     * ⛔ Um insumo só imporia à rec. 3 uma exigência que a fonte ⛔ não fez.
     */
    id: "penumbra_salvavel",
    temporalidade: "afericao",
    instanciaDe: ESTUDO,
    rotulo: "Penumbra isquêmica salvável",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-03",
    bloqueiaTerapia: false,
    nota: "Ausência de estudo de perfusão não significa ausência de penumbra.",
  },
  {
    id: "penumbra_por_perfusao_automatizada",
    temporalidade: "afericao",
    instanciaDe: ESTUDO,
    rotulo: "Penumbra detectada em perfusão automatizada",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-03",
    bloqueiaTerapia: false,
    nota: "Exigido pela recomendação de janela estendida em wake-up e 4,5 a 9 horas. A recomendação de 4,5 a 24 horas não qualifica o método.",
  },
  {
    id: "sitio_oclusao",
    temporalidade: "afericao",
    instanciaDe: ESTUDO,
    rotulo: "Sítio da oclusão descrito no laudo",
    tipo: "escolha",
    opcoes: OPCOES_SITIO_OCLUSAO,
    /**
     * ⚠️ ONZE OPÇÕES, e ⛔ nenhuma delas se responde sem laudo em mãos. Abertas,
     * ocupavam **682 px** num celular de 375. ⛔ Recolher aqui ⛔ não esconde
     * decisão (§7.3): ⛔ nada neste campo bloqueia.
     */
    recolhivel: true,
    fonte: "F-08",
    bloqueiaTerapia: false,
    nota: "A fonte separa M2 dominante de M2 não dominante ou codominante, e a força da recomendação muda entre as duas. Registre como o laudo descreve.",
  },
] as const;

/**
 * OS JUÍZOS DO EPISÓDIO — ⚠️ casa **C**, e ⛔ **sem instância de estudo**.
 *
 * ── ⚠️⚠️ ⛔ POR QUE ⛔ NÃO SÃO DE PACIENTE (autor, 2026-08-30) ──────────────────
 *
 * > *"O critério que criamos para Paciente era: isso continuaria verdadeiro se o
 * > paciente ⛔ não tivesse este AVC? Suspeita de HSA e suspeita de LVO são juízos
 * > do **episódio agudo**. Elas podem surgir, desaparecer ou ser revistas
 * > durante aquele atendimento."*
 *
 * ⚠️ E ⛔ também ⛔ não são achados: `suspeita_hsa` existe **justamente quando a TC
 * ⛔ não mostra hemorragia**. Presa ao estudo, ela viraria achado da tomografia —
 * o oposto do que ela é.
 */
export const EPISODIO_C: readonly CampoC[] = [
  {
    id: "suspeita_hsa",
    temporalidade: "estado",
    /**
     * ⚠️⚠️ **"CLÍNICA" NO RÓTULO** — relato do autor, 2026-08-30:
     *
     * > *"isso ⛔ não combina muito porque hemorragia subaracnóidea é hemorragia e
     * > em cima fala TC com ou sem hemorragia, isso ficou muito estranho aqui"*
     *
     * ⚠️ E ele está certo: lidos em sequência, *"Sem hemorragia"* (resultado do
     * exame) e *"Suspeita de hemorragia subaracnóidea"* (juízo do médico)
     * pareciam **a mesma pergunta respondida duas vezes, em contradição**.
     *
     * ⚠️⚠️ Os dois ⛔ **não** falam da mesma coisa: um diz **o que o exame mostrou**,
     * o outro diz **o que o médico suspeita do paciente**. O rótulo agora nomeia
     * a espécie — *suspeita clínica* —, e a ajuda diz que ela é registrada **à
     * parte** do exame, ⛔ sem afirmar ⛔ nada sobre sensibilidade de tomografia, que
     * ⛔ **nenhuma** fonte transcrita aqui sustenta (**E-31**).
     */
    rotulo: "Suspeita clínica de hemorragia subaracnóidea",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    ajuda: "Juízo clínico sobre o paciente, registrado à parte do que o exame mostrou. Um exame sem hemorragia visível não encerra a suspeita.",
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
    id: "suspeita_lvo",
    temporalidade: "estado",
    rotulo: "Suspeita de oclusão de grande vaso",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-16",
    bloqueiaTerapia: false,
    nota: "A fonte recomenda imagem vascular de emergência na suspeita de oclusão de grande vaso, o mais rápido possível, até 24 horas da última vez visto bem.",
  },
  {
    id: "angio_disponibilidade",
    temporalidade: "estado",
    /**
     * ⚠️⚠️ O QUE SOBROU DE `angio_realizada`, E ⛔ POR QUE ELE ⛔ NÃO MORREU INTEIRO.
     *
     * ⚠️ A **realização** passou a ser derivada: ou existe instância de estudo
     * vascular, ou ⛔ não existe. Perguntar de novo seria repreguntar o que a
     * trilha já sabe.
     *
     * ⛔⛔ Mas *"⛔ não disponível neste serviço"* ⛔ **nenhuma instância consegue
     * dizer**. **E-18** declara a disponibilidade de angioTC, perfusão e software
     * ⛔ não inferível da fonte americana (F-16 §9, F-03 §12) — e **E-23** proíbe
     * ler ausência de estudo como indisponibilidade. ⛔ Sem este campo, o médico de
     * um serviço que ⛔ não tem o exame ⛔ não teria como dizê-lo.
     *
     * ⚠️ Nomeado pela **pergunta**, e ⛔ não pela negativa: um `angio_indisponivel`
     * com opção "Disponível" seria campo negativo respondido no positivo.
     */
    rotulo: "Angiotomografia neste serviço",
    tipo: "escolha",
    opcoes: ["Disponível", "Não disponível neste serviço", NAO_SEI],
    fonte: "F-16",
    bloqueiaTerapia: false,
    nota: "A fonte diz que a imagem vascular de emergência não deve ser atrasada para obter a creatinina sérica. A disponibilidade local não é inferível da fonte.",
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
    temporalidade: "estado",
    rotulo: "Suspeita clínica de hemorragia subaracnóidea",
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
    temporalidade: "estado",
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
const GRUPOS_C_DECLARADOS: readonly GrupoDeclarado[] = [
  {
    id: "estudos",
    titulo: "Exames de imagem",
    campos: ESTUDO_C,
    /**
     * ⚠️⚠️ A REDAÇÃO É DO AUTOR (2026-08-29): *"'estes exames' pode ser lido
     * incluindo a TC simples, e essa é justamente a imagem que precisamos para
     * excluir hemorragia antes da reperfusão"*.
     *
     * ⚠️ **Imagem adicional** ⛔ não é sinônimo de **imagem**. A tomografia que
     * exclui hemorragia é COR 1 · A e precede a reperfusão; a imagem adicional é
     * o que R2.3 manda ⛔ não esperar.
     */
    nota: "Não atrase a trombólise por exames de imagem adicionais quando ela já estiver indicada pelos critérios aplicáveis. A tomografia necessária para excluir hemorragia não é exame adicional.",
  },
  {
    id: "episodio",
    titulo: "Juízo clínico e disponibilidade",
    campos: EPISODIO_C,
    /**
     * ⛔⛔ A ALERGIA A CONTRASTE ⛔ NÃO É DESENHADA AQUI — autor, 2026-08-30:
     *
     * > *"⛔ no A já coleta sobre alergias e no C de novo, ⛔ só deixamos no A"*
     *
     * ⚠️ Ela era **emprestada** de Paciente e aparecia nas duas telas. Emprestar
     * ⛔ não duplica o **fato** — a trilha é a mesma —, mas duplica a **pergunta**:
     * o médico responde no painel, chega em C e vê a mesma coisa por responder.
     * ⚠️⚠️ E a segunda pergunta é pior que redundante: ela faz duvidar da primeira.
     *
     * ⚠️ A **leitura** continua em C (`alergiaAContraste`), porque ler ⛔ não é
     * coletar: quem está diante da angiotomografia precisa ver o que já se sabe.
     */
  },
];

/**
 * ⚠️⚠️ A CASA É CARIMBADA AQUI, e ⛔ não escrita campo a campo (2026-08-29).
 *
 * ⚠️ Um campo que declarasse a própria casa poderia declarar a casa errada — e
 * casa errada é a duplicação de fatos voltando com outro nome. Carimbada pelo
 * módulo, ela ⛔ não tem como discordar do arquivo que a define.
 */
export const GRUPOS_C: readonly Grupo[] = comCasa("imagem", GRUPOS_C_DECLARADOS);

export const TODOS_OS_CAMPOS_C: readonly Campo[] = GRUPOS_C.flatMap((g) => [...g.campos]);

/**
 * ⚠️⚠️ O QUE A TELA DESENHA — os campos **próprios** mais os **emprestados**.
 *
 * ⚠️ As duas listas existem porque respondem perguntas diferentes:
 *   · `TODOS_OS_CAMPOS_C` responde *"de quem é o fato"* — e é ela que as
 *     travas de fonte, de bloqueio e de propriedade única varrem;
 *   · `CAMPOS_NA_TELA_C` responde *"o que o médico vê aqui"* — e é ela que
 *     a tela e o e2e usam.
 *
 * ⛔ Confundi-las devolveria a duplicação: um campo emprestado contado como
 * próprio teria **duas casas**.
 */
export const CAMPOS_NA_TELA_C: readonly Campo[] = GRUPOS_C.flatMap((g) => camposDoGrupo(g));

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
export const IDS_DOSSIE_ENDOVASCULAR: readonly string[] = ["aspects", "efeito_de_massa", "sitio_oclusao"];

/**
 * A SAÍDA SEM CONCLUSÃO DE CADA ESCOLHA — ⚠️ **E-02 / E-37**, declarada campo a
 * campo, e ⛔ não deduzida.
 *
 * ⚠️⚠️ POR QUE UM MAPA EXPLÍCITO EM VEZ DE PROCURAR "Não sei": porque a saída
 * sem conclusão ⛔ nem sempre se chama "Não sei" — em três campos ela é
 * *"Incerto"*, que é a incerteza **do observador** diante da imagem. Uma trava
 * que procurasse a palavra exigiria uma opção que ⛔ não faz sentido clínico, ou
 * aceitaria um campo sem saída nenhuma.
 *
 * ⚠️⚠️ **`estudo_resultado` ⛔ NÃO TEM SAÍDA SEM CONCLUSÃO — e ⛔ isso ⛔ não é
 * esquecimento.** Ele tem **duas** opções, e o estado *"realizada, resultado
 * ainda ⛔ não disponível"* ⛔ deixou de ser valor gravável em 2026-08-30: ele é
 * **derivado** de existir estudo sem resultado (`situacaoDaTcSemContraste`).
 * ⛔ Pôr uma terceira opção aqui devolveria a mistura que a instância desfez.
 *
 * ⚠️ A prova exige que toda escolha e múltipla de C **que não esteja na lista de
 * exceção** esteja neste mapa, e que a opção declarada exista entre as opções do
 * campo. Esquecer um campo reprova.
 */
export const SAIDA_SEM_CONCLUSAO: Readonly<Record<string, string>> = {
  suspeita_hsa: "Incerto",
  hipodensidade_clara: "Incerto",
  efeito_de_massa: "Incerto",
  suspeita_lvo: "Incerto",
  /**
   * ⚠️ Os quatro achados da janela estendida. A saída é "Incerto" ⛔ e ⛔ não
   * `NAO_SEI` porque a pergunta é de **leitura de imagem**: o estudo pode estar
   * na tela ⛔ e mesmo assim a resposta ⛔ não fechar. E-37 — "olhei e ⛔ não dá
   * para afirmar" ⛔ não é "⛔ ainda ⛔ não perguntei".
   */
  dwi_menor_que_um_terco: "Incerto",
  flair_sem_alteracao_marcada: "Incerto",
  penumbra_salvavel: "Incerto",
  penumbra_por_perfusao_automatizada: "Incerto",
  estudo_procedencia: NAO_SEI,
  estudo_modalidade: NAO_SEI,
  angio_disponibilidade: NAO_SEI,
  sitio_oclusao: NAO_SEI,
};

/**
 * ⚠️ Os campos de escolha de C que ⛔ **não** têm saída sem conclusão, com o
 * motivo — a prova lê esta lista, e ⛔ não a adivinha.
 */
export const SEM_SAIDA_DECLARADA: readonly { id: string; motivo: string }[] = [
  {
    id: "estudo_resultado",
    motivo:
      "o estado 'resultado ainda não disponível' é derivado de existir estudo sem resultado, e não um valor gravável",
  },
];

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
  { id: "estudo_resultado", motivo: "hemorragia identificada ⛔ não é 'sim', e sem hemorragia ⛔ não é 'não'" },
  { id: "estudo_modalidade", motivo: "o nome do exame decide o que ele pode responder, e ⛔ não é binário" },
  { id: "estudo_procedencia", motivo: "de onde veio o exame muda a leitura sem mudar o achado (E-03)" },
  { id: "angio_disponibilidade", motivo: "indisponível no serviço é diferente de ainda não realizado" },
  { id: "sitio_oclusao", motivo: "sítio anatômico ⛔ não é resposta binária" },
];

export const SUPERFICIE_C: SuperficieId = "imagem";
