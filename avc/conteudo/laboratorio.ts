/**
 * CONTEÚDO DO PAINEL **LABORATÓRIO** — resultados do episódio.
 *
 * ⛔ Dados puros. ⛔ Nenhum React, ⛔ nenhuma cor, ⛔ nenhuma decisão de tela (E-29).
 *
 * ── POR QUE ELE É PAINEL, E ⛔ NÃO SUPERFÍCIE COM LETRA ────────────────────
 *
 * O resultado é do **episódio**, ⛔ não da decisão que o lê. A mesma plaqueta é
 * lida pela segurança da trombólise hoje e por qualquer outra regra amanhã —
 * enfiá-la em D seria o escorregamento que o autor nomeou: *"o dado pertence à
 * espécie dele; a decisão apenas o consome"* (**PD-28**).
 *
 * ── ⚠️⚠️ O QUE ESTE PAINEL EXERCITA PELA PRIMEIRA VEZ ─────────────────────
 *
 * É a primeira superfície **inteiramente de aferições**, e a primeira em que a
 * **ordem clínica pode ⛔ não existir**. Na pressão arterial a ordem era conhecida
 * por construção — cada instância nascia de um gesto, na ordem em que o médico o
 * fez. Aqui ⛔ não:
 *
 * > Uma coleta **externa com horário desconhecido** pode ser **digitada depois**
 * > da coleta local das 22h — e *"último digitado"* apontaria para a mais antiga.
 *
 * ⚠️ **A ordem de REGISTRO é sempre conhecida. A ordem CLÍNICA, ⛔ nem sempre.** E
 * ⛔ nenhuma derivação pode confundir as duas.
 *
 * ── ⛔ O QUE ⛔ NÃO ENTRA AQUI ──────────────────────────────────────────────
 *
 * ⛔ **Creatinina** — 🚫 #5: a fonte manda ⛔ **não atrasar** a imagem vascular para
 * obtê-la, e a maneira de ⛔ não exigir ⛔ não é escrever a frase: é ⛔ não existir o
 * campo. ⛔ **Glicemia** — é estado clínico atual, e mora na Superfície A.
 * ⛔ **Faixas de referência** — a fonte dá **cortes de decisão**, e ⛔ não faixas
 * de normalidade; são coisas diferentes. ⛔ **Conversão de unidade ⛔ não
 * declarada** — ver `plaquetas_unidade`.
 */

import type { SuperficieId } from "../nucleo/tipos";
import type { CampoDeclarado, GrupoDeclarado, Grupo, Campo } from "./campo";
import { comCasa, NAO_SEI } from "./campo";

export type CampoL = CampoDeclarado;

/** ⚠️ O tipo de instância deste painel. ⛔ Uma string só, e ⛔ não duas cópias. */
export const COLETA = "coleta";

/**
 * A COLETA — ⚠️ ela existe **antes** de qualquer resultado.
 *
 * *"Coleta realizada, resultados ainda pendentes"* é fato verdadeiro, e ⛔ não
 * campo vazio. É a mesma forma de **PD-22**, aplicada ao laboratório.
 */
export const COLETA_L: readonly CampoL[] = [
  {
    id: "coleta_procedencia",
    rotulo: "Procedência da coleta",
    tipo: "escolha",
    temporalidade: "estavel",
    instanciaDe: COLETA,
    opcoes: ["Este serviço", "Serviço externo", NAO_SEI],
    /**
     * ⚠️⚠️ **E-03 COM TRABALHO REAL.** *"INR 1,4, externa, horário desconhecido"*
     * é uma frase que o médico usa para decidir; *"INR 1,4, horário
     * desconhecido"* o deixa sem saber **por que** ninguém sabe a hora.
     */
    fonte: "F-10",
    bloqueiaTerapia: false,
  },
  {
    id: "coleta_hora",
    /**
     * ⚠️ **E-36**: o rótulo nomeia o que este tempo marca. E ele ⛔ **não declara
     * `relogio`** — é carimbo de coleta, ⛔ não marco de janela terapêutica
     * (**E-21**).
     *
     * ⚠️⚠️ **E-52 aqui é o caso normativo:** *"laboratório conhecido + horário de
     * coleta desconhecido"*. O INR 1,4 da transferência é **verdadeiro**; o
     * horário ⛔ não é sabido; os dois são representáveis ao mesmo tempo, e o app
     * ⛔ jamais fabrica um instante para poder ordenar.
     */
    rotulo: "Horário da coleta",
    tipo: "hora",
    temporalidade: "estavel",
    instanciaDe: COLETA,
    aceitaDesconhecido: true,
    ajuda: "Se não for possível determinar, registre que é desconhecido. Nada é estimado.",
    fonte: "F-10",
    bloqueiaTerapia: false,
  },
];

/**
 * OS QUATRO ANALITOS — ⚠️ **os que a fonte nomeia**, e ⛔ nenhum a mais.
 *
 * Verbatim (F-10 §3, Table 8, faixa absoluta, p. e367):
 *
 * > *"…patients with platelets <100,000/mm³, INR>1.7, aPTT>40s, or PT>15s…"*
 *
 * ⛔⛔ **OS CORTES ⛔ NÃO MORAM AQUI.** Eles são **derivação clínica**, e vivem na
 * Superfície D — que interpreta. O campo declara a **grandeza**, e ⛔ nada além.
 *
 * ⚠️⚠️ **E `faixa` AQUI É LIMITE TÉCNICO DE ENTRADA**, largo de propósito, que
 * ⛔ **não aparece na tela**, ⛔ não vira mensagem de "valor máximo" e ⛔ não
 * alimenta derivação. Reforçado pelo autor em 2026-08-30: *"o corte pode ser
 * INR > 1,7; isso ⛔ não significa que o INR máximo registrável seja 8"*.
 */
export const ANALITOS_L: readonly CampoL[] = [
  {
    id: "inr",
    /** ⚠️ ⛔ SEM UNIDADE: o INR é uma **razão**. Escrever "mg/dL" ao lado seria absurdo. */
    rotulo: "INR",
    tipo: "numerico",
    temporalidade: "afericao",
    instanciaDe: COLETA,
    /** ⚠️ Passo decimal — o INR é reportado com uma casa. */
    faixa: { min: 0.1, max: 30, passo: 0.1 },
    fonte: "F-10",
    bloqueiaTerapia: false,
    nota: "A fonte usa o INR entre os limiares de decisão da trombólise. O corte pertence à superfície de segurança, e não a este registro.",
  },
  {
    id: "plaquetas",
    rotulo: "Plaquetas",
    tipo: "numerico",
    temporalidade: "afericao",
    instanciaDe: COLETA,
    /**
     * ⚠️⚠️ **ZERO É VALOR**, e ⛔ não ausência — correção do autor, 2026-08-30:
     *
     * > *"Um laboratório pode reportar contagem de plaquetas igual a zero ou
     * > extremamente próxima disso. Raro ⛔ não significa impossível."*
     *
     * ⚠️ O critério da porta do zero passou a ser **zero é possível para a
     * grandeza** — e ⛔ nunca *"na prática ⛔ não chega a zero"*. Um campo sem porta
     * tornaria irregistrável um resultado verdadeiro: **E-52** reaparecendo pelo
     * componente numérico.
     */
    zeroValido: true,
    /**
     * ⚠️ Técnico e largo — e o **passo é 1**.
     *
     * ⚠️⚠️ O passo aqui é o **incremento do ajuste**, e as duas unidades convivem
     * no mesmo campo: `80 mil/mm³` e `80.000/mm³` são digitações legítimas. Um
     * passo de mil tornaria o `±` inútil numa delas — e, pior, prenderia o valor
     * digitado a uma grade que ⛔ não é a do laudo.
     */
    faixa: { min: 0, max: 3_000_000, passo: 1 },
    ajuda: "Informe a unidade do laudo antes do valor.",
    fonte: "F-10",
    bloqueiaTerapia: false,
    nota: "A fonte expressa o limiar em plaquetas por mm³. O valor fica registrado na unidade informada, e a conversão existe apenas para comparação.",
  },
  {
    id: "plaquetas_unidade",
    rotulo: "Unidade das plaquetas",
    tipo: "escolha",
    temporalidade: "estavel",
    instanciaDe: COLETA,
    /**
     * ⚠️⚠️ **ATRIBUTO DA MEDIDA**, e ⛔ não medida independente. `80` **+**
     * `mil/mm³` constituem **uma** aferição, e a derivação lê a unidade **da
     * mesma instância** do valor.
     *
     * ⚠️ O laboratório brasileiro reporta as duas formas, e um médico que digita
     * **80** querendo 80.000 cria um valor **mil vezes maior** que o real — acima
     * do corte, e ⛔ sem parecer errado. É a mesma família do aviso que a
     * calculadora de osmolalidade já carrega sobre BUN × ureia.
     *
     * ⛔⛔ E **⛔ SEM UNIDADE DECLARADA ⛔ NÃO SE COMPARA.** Converter é transformar;
     * **supor unidade é inventar** — distinção fixada pelo autor.
     */
    atributoDe: "plaquetas",
    opcoes: ["/mm³", "mil/mm³ (×10³/µL)", NAO_SEI],
    fonte: "F-10",
    bloqueiaTerapia: false,
  },
  {
    id: "aptt",
    rotulo: "aPTT (segundos)",
    tipo: "numerico",
    temporalidade: "afericao",
    instanciaDe: COLETA,
    unidade: "s",
    faixa: { min: 1, max: 400, passo: 1 },
    fonte: "F-10",
    bloqueiaTerapia: false,
  },
  {
    id: "tp",
    /**
     * ⚠️⚠️ **"(segundos)" NO RÓTULO**, por decisão do autor — e ⛔ não é redundância.
     *
     * O TP é reportado de três formas: **segundos**, **INR** e **atividade de
     * protrombina em %**. O corte da fonte é `> 15 s`. Sem a unidade no rótulo,
     * uma atividade de **70%** entra como **70 s** — quatro vezes o limiar, com
     * cara de resultado.
     */
    rotulo: "TP (segundos)",
    tipo: "numerico",
    temporalidade: "afericao",
    instanciaDe: COLETA,
    unidade: "s",
    faixa: { min: 1, max: 400, passo: 0.1 },
    ajuda: "Em segundos. Atividade de protrombina em % e INR não entram aqui.",
    fonte: "F-10",
    bloqueiaTerapia: false,
  },
];

const GRUPOS_L_DECLARADOS: readonly GrupoDeclarado[] = [
  { id: "coleta", titulo: "Coleta", campos: COLETA_L },
  {
    id: "analitos",
    titulo: "Resultados",
    campos: ANALITOS_L,
    nota: "Os limiares que a fonte usa para decidir pertencem à superfície de segurança. Aqui se registra o que o laudo diz.",
  },
];

export const GRUPOS_L: readonly Grupo[] = comCasa("laboratorio", GRUPOS_L_DECLARADOS);

export const TODOS_OS_CAMPOS_L: readonly Campo[] = GRUPOS_L.flatMap((g) => [...g.campos]);

/** ⚠️ Os quatro analitos que a fonte nomeia — derivado, e ⛔ não listado à mão. */
export const IDS_ANALITOS: readonly string[] = ANALITOS_L
  .filter((c) => c.tipo === "numerico")
  .map((c) => c.id);

/** As duas unidades que o laudo brasileiro usa. ⚠️ Fonte única do de-para. */
export const UNIDADE_PLAQUETAS = {
  porMm3: "/mm³",
  milPorMm3: "mil/mm³ (×10³/µL)",
} as const;

/**
 * O FATOR DE CONVERSÃO PARA A UNIDADE CANÔNICA (`/mm³`).
 *
 * ⚠️⚠️ **CONVERSÃO EXATA ⛔ NÃO É VALOR FABRICADO** — correção do autor,
 * 2026-08-30: *"transformação determinística do mesmo valor físico"*. O que é
 * proibido é **inferir unidade que o usuário ⛔ não informou**.
 */
export const FATOR_PARA_MM3: Readonly<Record<string, number>> = {
  [UNIDADE_PLAQUETAS.porMm3]: 1,
  [UNIDADE_PLAQUETAS.milPorMm3]: 1000,
};

export const SAIDA_SEM_CONCLUSAO_L: Readonly<Record<string, string>> = {
  coleta_procedencia: NAO_SEI,
  plaquetas_unidade: NAO_SEI,
};

export const VOCABULARIO_PROPRIO_L: readonly { id: string; motivo: string }[] = [
  { id: "coleta_procedencia", motivo: "de onde veio a coleta muda a leitura sem mudar o valor (E-03)" },
  { id: "plaquetas_unidade", motivo: "unidade é apresentação da medida, e não resposta binária" },
];

export const SUPERFICIE_L: SuperficieId = "laboratorio";
