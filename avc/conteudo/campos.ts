/**
 * O ÍNDICE DE CAMPOS DO MÓDULO — ⚠️ um lugar só para perguntar *"quem é este id?"*.
 *
 * ⚠️⚠️ ELE EXISTE PORQUE A CASA DEIXOU DE SER ÓBVIA (2026-08-29). Com
 * **PD-28** — propriedade do fato ⛔ não é local de preenchimento —, quem registra
 * um fato ⛔ não sabe de que módulo ele veio: a Superfície A grava `peso`, que
 * mora em Paciente. Sem um índice, cada tela precisaria conhecer todas as casas.
 *
 * ⛔ Isto ⛔ NÃO é motor genérico (§9.1): é a lista de campos de UM módulo.
 */

import type { Campo } from "./campo";
import type { EstadoAvc } from "../nucleo/estado";
import { registrarFato } from "../nucleo/estado";
import { instanciaParaRegistrar } from "../nucleo/instancia";
import type { Relogio } from "../nucleo/relogio";
import type { FatoRegistrado } from "../nucleo/tipos";
import { TODOS_OS_CAMPOS_P } from "./paciente";
import { TODOS_OS_CAMPOS_A } from "./superficie-a";
import { TODOS_OS_CAMPOS_B } from "./superficie-b";
import { TODOS_OS_CAMPOS_C } from "./superficie-c";

/**
 * TODOS os campos do módulo, de todas as casas.
 *
 * ⚠️ É **função**, e ⛔ não constante de topo de módulo: uma constante derivada de
 * quatro importações quebrou o app uma vez com
 * `Cannot access '...' before initialization` — a ordem de inicialização depende
 * do bundler, e ⛔ não do que está escrito no arquivo.
 */
export function todosOsCampos(): readonly Campo[] {
  return [
    ...TODOS_OS_CAMPOS_P,
    ...TODOS_OS_CAMPOS_A,
    ...TODOS_OS_CAMPOS_B,
    ...TODOS_OS_CAMPOS_C,
  ];
}

/** O campo com este id, venha ele de que casa vier. ⚠️ `undefined` se ⛔ não existe. */
export function campoDoModulo(id: string): Campo | undefined {
  return todosOsCampos().find((c) => c.id === id);
}

/**
 * REGISTRA UM FATO **JÁ COM A INSTÂNCIA CERTA** — ⚠️ e é a única porta que sabe
 * decidir isso.
 *
 * ── POR QUE ELA EXISTE, E ⛔ POR QUE ⛔ NÃO MORA NO NÚCLEO ────────────────────
 *
 * A regra *"este campo é metade de uma aferição composta"* é **conteúdo**:
 * depende de `instanciaDe`, declarado no campo. O núcleo (`estado.ts`) é
 * deliberadamente cego a conteúdo, e ⛔ não pode importá-lo.
 *
 * ⚠️⚠️ E ela ⛔ não pode ficar só na tela: a primeira versão carimbava a instância
 * dentro de `avc-modulo-screen`, e as **travas** — que registram fatos
 * diretamente — passaram a construir PAs **sem instância**, que a derivação lia
 * como "⛔ não informada". A regra escrita em dois lugares é a I6: as duas
 * "funcionam", e a que decide é a errada.
 */
export function registrarComInstancia(
  estado: EstadoAvc,
  fato: Omit<FatoRegistrado, "horaRegistro" | "instancia">,
  relogio: Relogio
): EstadoAvc {
  const tipo = campoDoModulo(fato.campo)?.instanciaDe;
  return registrarFato(
    estado,
    tipo ? { ...fato, instancia: instanciaParaRegistrar(estado, tipo) } : fato,
    relogio
  );
}
