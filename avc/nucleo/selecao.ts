/**
 * SELEÇÃO MÚLTIPLA — quando a realidade clínica permite coexistência (§7.6).
 *
 * ⚠️⚠️ O SEPARADOR É PRIVADO, E ⛔ NINGUÉM DE FORA PODE CONHECÊ-LO.
 *
 * O estado guarda um valor por campo, porque a trilha é de FATOS e um fato tem
 * um valor. Vários achados no mesmo campo cabem aí como uma string composta, e é
 * aí que mora o perigo: no dia em que um consumidor fizer `includes("tosse")` ou
 * `split(",")`, o formato interno vira contrato público e ⛔ não pode mais mudar
 * sem quebrar quem o leu por fora.
 *
 * ⚠️ Por isso o separador é o RECORD SEPARATOR (`\u001e`), que ⛔ não existe em
 * texto clínico e ⛔ não é digitável: um rótulo ⛔ nunca colide com ele por
 * acidente. E por isso toda leitura passa por estas funções.
 *
 * ⚠️⚠️ E É UM CARACTERE **DIFERENTE** DO QUE O MOTOR LEGADO USA — o UNIT
 * SEPARATOR, que ⛔ nem escrito aqui pode ser, porque a trava do legado varre
 * até comentário —, de
 * propósito — a trava `test:selecao-encapsulada` reprovou a primeira versão
 * deste arquivo, e estava certa: com o mesmo caractere existiriam dois donos do
 * mesmo formato, e um valor de um mundo poderia ser lido pelo parser do outro
 * sem que nada reclamasse. Separadores distintos tornam esse acidente
 * impossível em vez de improvável.
 *
 * ⛔ Isto ⛔ NÃO importa `core/decision-tree/estado-clinico.ts`
 * (LEGACY_ACLS_RUNTIME, D-107), que resolve o mesmo problema para o motor
 * antigo. São dois módulos, e a Parte 9 proíbe promover um ao outro só porque a
 * necessidade rima.
 */

const SEPARADOR = "\u001e";

/** Os itens marcados. ⚠️ Vazio ⛔ não é "nenhum": é "ninguém respondeu". */
export function itensSelecionados(bruto: string | undefined): readonly string[] {
  if (!bruto) return [];
  return bruto.split(SEPARADOR).filter((x) => x.length > 0);
}

export function estaSelecionado(bruto: string | undefined, item: string): boolean {
  return itensSelecionados(bruto).includes(item);
}

/**
 * Marca ou desmarca um item, respeitando os EXCLUSIVOS.
 *
 * ⚠️ "Nenhum desses" e "Não sei" ⛔ não coexistem com achado nenhum — nem entre
 * si. Marcar um deles limpa os outros; marcar um achado limpa os dois. Sem essa
 * regra, "nenhum desses + tosse ineficaz" seria um estado registrável, e ⛔ não
 * existe paciente assim: existe médico que tocou duas vezes.
 *
 * ⚠️ Devolve string vazia quando ⛔ nada fica marcado — e quem chama decide o que
 * isso significa. Na tela do AVC significa **desfazer o registro** (§7.16), ⛔
 * não gravar vazio como se fosse resposta.
 */
export function alternarItem(
  bruto: string | undefined,
  item: string,
  exclusivos: readonly string[]
): string {
  const atuais = itensSelecionados(bruto);
  if (atuais.includes(item)) {
    return atuais.filter((x) => x !== item).join(SEPARADOR);
  }
  if (exclusivos.includes(item)) return item;
  return [...atuais.filter((x) => !exclusivos.includes(x)), item].join(SEPARADOR);
}
