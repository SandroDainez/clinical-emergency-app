/**
 * O NOME DE UM CAMPO — ⚠️ **um só**, ⛔ e ⛔ para o módulo inteiro.
 *
 * ── ⚠️⚠️⚠️ ⛔ POR QUE ESTE ARQUIVO EXISTE — relato do autor, 2026-09-09 ────
 *
 * ⛔ ⛔ Numa captura da Estabilização, o painel de leituras citava os seus
 * insumos ⛔ assim:
 *
 * > *"Insumos: Glicemia capilar, **deficit_focal**, **nihss_calculado**,
 * > **nihss_informado** · slot F-06"*
 *
 * ⚠️ ⛔ Um nome ⛔ e três **identificadores de programa** na mesma frase, ⛔ na
 * tela de um médico.
 *
 * ── ⚠️⚠️ ⛔ A CAUSA ───────────────────────────────────────────────────────
 *
 * ⛔ ⛔ Cada superfície montava o seu dicionário **⛔ com os próprios campos**:
 * a Estabilização, ⛔ com `TODOS_OS_CAMPOS_A`. ⚠️ Mas uma leitura ⛔ não cita
 * ⛔ só o que está ⛔ na tela em que aparece — ⛔ a glicemia de **A** decide
 * junto com o déficit de **B**. ⛔ O que vinha de fora ⛔ não tinha nome, ⛔ e o
 * `??` caía no `id`.
 *
 * ⚠️⚠️ ⛔ Um dicionário por tela ⛔ não é um dicionário: ⛔ é uma tela sabendo
 * ⛔ só de si. ⛔ O nome de um campo é do **módulo**.
 *
 * ── ⚠️⚠️ ⛔ E OS QUE ⛔ NÃO SÃO `Campo` ────────────────────────────────────
 *
 * ⛔ ⛔ `nihss_calculado` ⛔ e `nihss_informado` ⛔ não são campos declarados —
 * ⛔ são **procedência**, ⛔ como `glasgow_origem`. ⚠️ ⛔ Eles ⛔ não têm
 * `rotulo` para herdar, ⛔ e ⛔ por isso são escritos ⛔ aqui, ⛔ **⛔ uma vez**.
 */
import { TODOS_OS_CAMPOS_A } from "./superficie-a";
import { TODOS_OS_CAMPOS_B } from "./superficie-b";
import { TODOS_OS_CAMPOS_C } from "./superficie-c";
import { TODOS_OS_CAMPOS_D } from "./superficie-d";
import { TODOS_OS_CAMPOS_E } from "./superficie-e";
import { TODOS_OS_CAMPOS_L } from "./laboratorio";
import { TODOS_OS_CAMPOS_P } from "./paciente";

/**
 * ⚠️ ⛔ Os que ⛔ não vêm de um `Campo` — ⛔ e ⛔ cada linha diz **por que**
 * ⛔ ela ⛔ não vem.
 */
const FORA_DA_DECLARACAO: Readonly<Record<string, string>> = {
  /** ⚠️ Procedência do total do NIHSS — ⛔ item a item, ⛔ ou digitado. */
  nihss_calculado: "NIHSS somado pelos itens",
  nihss_informado: "NIHSS informado diretamente",
  /** ⚠️ ⛔ O mesmo par, ⛔ para o Glasgow (2026-09-08). */
  glasgow_origem: "Origem do Glasgow",
};

/**
 * ⚠️⚠️ ⛔ A PRIMEIRA DECLARAÇÃO **VENCE**, ⛔ e a ordem ⛔ não é aleatória:
 * ⛔ campos globais (peso, idade) vivem em `Paciente`, ⛔ e é ⛔ o nome ⛔ dela
 * que o médico já leu. ⛔ Um `id` repetido entre superfícies ⛔ é a mesma
 * pergunta, ⛔ e ⛔ não duas.
 */
const TODAS = [
  ...TODOS_OS_CAMPOS_P,
  ...TODOS_OS_CAMPOS_A,
  ...TODOS_OS_CAMPOS_B,
  ...TODOS_OS_CAMPOS_C,
  ...TODOS_OS_CAMPOS_D,
  ...TODOS_OS_CAMPOS_E,
  ...TODOS_OS_CAMPOS_L,
];

export const ROTULO_DO_CAMPO: Readonly<Record<string, string>> = (() => {
  const m: Record<string, string> = { ...FORA_DA_DECLARACAO };
  for (const c of TODAS) if (m[c.id] === undefined) m[c.id] = c.rotulo;
  return m;
})();

/**
 * ⚠️⚠️ ⛔ O `id` CRU CONTINUA SENDO A ÚLTIMA SAÍDA — ⛔ e ⛔ isso é de
 * propósito: ⛔ **sumir** com um insumo seria pior que mostrá-lo feio, ⛔ porque
 * a leitura ⛔ deixaria de dizer ⛔ de onde saiu (**E-30**).
 *
 * ⚠️ ⛔ Quem impede o `id` de chegar à tela é a trava, ⛔ e ⛔ não este `??`.
 */
export function rotuloDoCampo(id: string): string {
  return ROTULO_DO_CAMPO[id] ?? id;
}
