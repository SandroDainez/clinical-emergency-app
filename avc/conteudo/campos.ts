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
import { instanciaParaRegistrar, valorNaInstancia } from "../nucleo/instancia";
import type { Relogio } from "../nucleo/relogio";
import type { FatoRegistrado } from "../nucleo/tipos";
import { TODOS_OS_CAMPOS_L } from "./laboratorio";
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
    ...TODOS_OS_CAMPOS_L,
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
   * ⚠️⚠️ REDECLARAR UM VALOR **ESTÁVEL** NA MESMA INSTÂNCIA É **CORREÇÃO**.
   *
   * ── O CASO QUE FIXOU ISTO (autor, 2026-08-30) ─────────────────────────────
   *
   * > *"coleta 1: `plaquetas = 80`, unidade `mil/mm³`; depois o médico percebe
   * > que o laudo era `/mm³` e corrige a unidade. A trilha precisa preservar que
   * > a unidade anterior foi corrigida."*
   *
   * ⚠️ **Estável** quer dizer: ⛔ não varia com o tempo, por natureza. A unidade em
   * que um laudo foi impresso ⛔ não "evolui". Logo, um segundo valor estável na
   * **mesma** aferição ⛔ só pode ser a primeira declaração redescrita — ou o
   * médico leu a unidade errada, ou digitou errado.
   *
   * ⚠️⚠️ Sem a marca, a trilha mostrava **duas declarações lado a lado** e ⛔ não
   * dizia que a segunda corrige a primeira — e ⚠️ erro de unidade em plaquetas é
   * justamente o que produz um valor **mil vezes** fora do real.
   *
   * ── ⛔ POR QUE ⛔ NÃO VALE PARA `afericao` ────────────────────────────────────
   *
   * ⚠️⚠️ A primeira versão desta regra marcava **qualquer** segundo valor na
   * instância, e a trava da Superfície A a reprovou — com razão: `PA 198/114`
   * seguida de `168/96` **25 minutos depois** é **medida nova**, e chamá-la de
   * correção transformaria evolução clínica real em conserto de digitação.
   *
   * ⛔ Onde a aferição pode legitimamente se repetir, a ambiguidade ⛔ **não** se
   * resolve por inferência — ela precisa do gesto explícito de §3.4. Estável ⛔ não
   * tem essa ambiguidade: ⛔ não há segunda aferição de algo que ⛔ não varia.
   *
   * ⛔ ⛔ NADA é apagado: `corrigirFato` é append-only, e a unidade errada
   * permanece na trilha, marcada, porque apagá-la esconderia que houve erro.
   */
  const redeclaraEstavel =
    campo?.temporalidade === "estavel" && valorNaInstancia(estado, alvo, fato.campo) !== undefined;
  if (redeclaraEstavel && fato.tipo === undefined) {
    return corrigirFato(
      estado,
      {
        ...fato,
        instancia: alvo,
        /**
         * ⚠️ O motivo diz **o que aconteceu**, e ⛔ não inventa um porquê: a tela
         * ⛔ não perguntou, e afirmar uma razão que ninguém deu seria **E-52** —
         * dado desconhecido substituído por valor fabricado.
         */
        motivo: "Redeclarado na mesma aferição; motivo não perguntado",
      },
      relogio
    );
  }

  return registrarFato(estado, { ...fato, instancia: alvo }, relogio);
}
