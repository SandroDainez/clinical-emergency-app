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
import { corrigirFato, registrarFato } from "../nucleo/estado";
import { instanciaParaRegistrar, proximaInstancia, valorNaInstancia } from "../nucleo/instancia";
import type { Relogio } from "../nucleo/relogio";
import type { FatoRegistrado } from "../nucleo/tipos";
import { TODOS_OS_CAMPOS_L } from "./laboratorio";
import { TODOS_OS_CAMPOS_P } from "./paciente";
import { TODOS_OS_CAMPOS_A } from "./superficie-a";
import { TODOS_OS_CAMPOS_B } from "./superficie-b";
import { TODOS_OS_CAMPOS_C } from "./superficie-c";
import { TODOS_OS_CAMPOS_D } from "./superficie-d";
import { TODOS_OS_CAMPOS_E } from "./superficie-e";
import { ACAO_DE_TROMBOLISE } from "./superficie-f";

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
    ...TODOS_OS_CAMPOS_L,
    ...TODOS_OS_CAMPOS_A,
    ...TODOS_OS_CAMPOS_B,
    ...TODOS_OS_CAMPOS_C,
    /**
     * ⚠️⚠️ D E E PRECISAM ESTAR AQUI — e a razão apareceu como defeito: os campos
     * de E declaram `instanciaDe`, e `registrarComInstancia` descobre isso
     * **consultando este registro**. Fora dele, a ação era gravada **sem
     * instância**, e a leitura ⛔ não encontrava ação ⛔ nenhuma.
     */
    ...TODOS_OS_CAMPOS_D,
    ...TODOS_OS_CAMPOS_E,
    /**
     * ⚠️⚠️ E F CAIU NO MESMO VÃO — 2026-08-31.
     *
     * ⛔ A ação de trombólise declara `instanciaDe`, ⛔ e ficava fora daqui: o
     * fato era gravado **sem instância**, `valorNaInstancia` ⛔ não encontrava
     * ⛔ nada, ⛔ e a monitorização da Superfície G ⛔ nunca aparecia. ⚠️ O
     * comentário acima já descrevia o defeito — ⛔ e ele voltou porque o
     * registro é uma **lista à mão**, ⛔ e lista à mão se esquece.
     */
    ...ACAO_DE_TROMBOLISE.map((c) => ({ ...c, casa: "reperfusao" as const })),
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
  fato: Omit<FatoRegistrado, "horaRegistro" | "instancia" | "id">,
  relogio: Relogio,
  /**
   * ⚠️ A instância EXPLÍCITA, quando a tela já sabe qual é.
   *
   * ⚠️⚠️ O LABORATÓRIO EXIGIU ISTO: ele desenha **N coletas ao mesmo tempo**, e
   * um toque no INR da **terceira** ⛔ não pode cair na instância "aberta". Onde a
   * tela mostra várias, é ela quem sabe em qual o médico tocou; onde mostra uma
   * (a pressão arterial), a regra de completar a aberta continua valendo.
   */
  instancia?: string
): EstadoAvc {
  const campo = campoDoModulo(fato.campo);
  const tipo = campo?.instanciaDe;
  if (!tipo) return registrarFato(estado, fato, relogio);
  const alvo = instancia ?? instanciaParaRegistrar(estado, tipo);

  /**
   * ── ⛔ A INFERÊNCIA MORREU INTEIRA (autor, 2026-08-30) ─────────────────────
   *
   * ⚠️⚠️ Esta função já decidiu sozinha que um segundo valor na mesma instância
   * era **correção**, deduzindo pela `temporalidade` declarada. O autor a
   * removeu, e a razão fecha a questão:
   *
   * > *"`afericao` diz o que o fato **é**, mas ⛔ não consegue dizer sozinho **por
   * > que** o usuário está substituindo aquele valor."*
   *
   * ⚠️ E ⛔ nem para `estavel`, ⛔ nem para `atributoDe`. Trocar `mil/mm³` por
   * `/mm³` ⛔ **não** é mudar como o resultado aparece: é dizer que a declaração
   * anterior estava **errada**, e `80.000/mm³` vira `80/mm³` — leitura clínica
   * diferente. Isso exige gesto.
   *
   * ⛔ `atributoDe` continua garantindo que valor e unidade sejam lidos da
   * **mesma** instância. Ele ⛔ **não** concede exceção de correção implícita.
   *
   * ⚠️ Quem corrige agora é `corrigirNaInstancia`, e ⛔ só quando a tela disser
   * que o médico tocou em **Corrigir**.
   */
  return registrarFato(estado, { ...fato, instancia: alvo }, relogio);
}

/**
 * CORRIGE um fato **dentro da instância**, apontando qual declaração cai.
 *
 * ⚠️ A tela ⛔ não escolhe o alvo: ele é o **último fato vigente** daquele campo
 * naquela instância. Uma segunda correção aponta para a primeira correção, e a
 * cadeia inteira permanece na trilha (§3.1).
 *
 * ⚠️ ⛔ Sem alvo, ⛔ não há correção: corrigir o que ⛔ não foi declarado ⛔ não é
 * corrigir, é registrar. A tela ⛔ nem oferece o gesto nesse estado, e aqui a
 * função devolve o estado intacto em vez de inventar uma referência.
 */
export function corrigirNaInstancia(
  estado: EstadoAvc,
  fato: Omit<FatoRegistrado, "horaRegistro" | "instancia" | "id" | "tipo" | "corrigeFatoId">,
  relogio: Relogio,
  instancia?: string
): EstadoAvc {
  const campo = campoDoModulo(fato.campo);
  const tipo = campo?.instanciaDe;
  const alvo = tipo ? (instancia ?? instanciaParaRegistrar(estado, tipo)) : undefined;
  /**
   * ⚠️ Campo sem instância existe (o painel Paciente inteiro): aí o alvo é o
   * último fato do campo na trilha, e ⛔ não o de uma instância que ⛔ não há.
   */
  const anterior = alvo
    ? valorNaInstancia(estado, alvo, fato.campo)
    : [...estado.fatos].reverse().find((f) => f.campo === fato.campo && f.instancia === undefined);
  if (anterior === undefined) return estado;
  return corrigirFato(
    estado,
    { ...fato, instancia: alvo, corrigeFatoId: anterior.id },
    relogio
  );
}
