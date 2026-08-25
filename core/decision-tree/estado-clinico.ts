import type { EstadoDaAcao, Medicao, TreeValues, ValorClinico, Veredito } from "./types";

/**
 * ESTADO CLÍNICO — os helpers puros da ficha viva.
 *
 * ⚠️ POR QUE ISTO É UM ARQUIVO SEPARADO DO ENGINE: são funções puras, sem
 * estado próprio, testáveis isoladamente e consumíveis tanto pelo motor
 * quanto pelas árvores (que precisam ler seleções múltiplas dentro de
 * `escolher`) e pelas telas. O engine guarda; estas funções interpretam.
 */

/**
 * ⚠️ O SEPARADOR É CANÔNICO E NÃO PODE APARECER EM VALOR CLÍNICO.
 *
 * `TreeValues` é `Record<string, string>` e sustenta os 30 módulos que já
 * existem — trocá-lo por `string | string[]` obrigaria a revisar todo
 * consumidor de valor do app, inclusive os validadores. A escolha aqui é a
 * conservadora: seleção múltipla vira uma string com separador, e ninguém
 * fora deste arquivo precisa saber disso.
 *
 * Usa-se `\\u001F` (Unit Separator, ASCII 31) de propósito: é caractere de
 * controle, não é digitável, não aparece em texto clínico e não colide com
 * vírgula, ponto e vírgula ou barra — que aparecem, e muito.
 */
const SEP = "";

/** Os valores marcados num campo de checklist. Vazio quando nada marcado. */
export function selecionados(values: TreeValues, campo: string): string[] {
  const bruto = values[campo];
  if (!bruto) return [];
  return bruto.split(SEP).filter(Boolean);
}

/** Marca/desmarca um valor num campo de checklist e devolve o novo bruto. */
export function alternarSelecao(brutoAtual: string | undefined, valor: string): string {
  const atuais = (brutoAtual ?? "").split(SEP).filter(Boolean);
  const i = atuais.indexOf(valor);
  if (i >= 0) atuais.splice(i, 1);
  else atuais.push(valor);
  return atuais.join(SEP);
}

/** true quando aquele valor está marcado. */
export function temSelecionado(values: TreeValues, campo: string, valor: string): boolean {
  return selecionados(values, campo).includes(valor);
}

/** true quando QUALQUER um dos valores está marcado — o teste mais comum. */
export function temAlgum(values: TreeValues, campo: string, valores: string[]): boolean {
  const s = selecionados(values, campo);
  return valores.some((v) => s.includes(v));
}

// ── Valor clínico com memória ──────────────────────────────────────────────

/**
 * Monta a visão "atual + trilha" a partir do histórico bruto do motor.
 *
 * ⚠️ A TRILHA É O PONTO. Sem ela, a tela de correção teria que perguntar de
 * novo o que já foi medido, e a re-medida apagaria a evidência de que havia
 * um impedimento — que é justamente o que o médico precisa ver depois:
 * 194/116 → tratamento → 168/96.
 */
export function valorClinico(historico: Medicao[] | undefined): ValorClinico | null {
  if (!historico || !historico.length) return null;
  const anteriores = historico.slice(0, -1);
  const ultima = historico[historico.length - 1];
  return { atual: ultima.valor, em: ultima.em, origem: ultima.origem, anteriores };
}

/**
 * A trilha em uma linha, para a tela: "194/116 → 168/96".
 * Devolve string vazia quando só houve uma medição — nada a mostrar.
 */
export function trilha(historico: Medicao[] | undefined, sufixo = ""): string {
  if (!historico || historico.length < 2) return "";
  return historico.map((m) => m.valor + sufixo).join(" → ");
}

// ── Ações clínicas ─────────────────────────────────────────────────────────

/**
 * O estado de execução derivado do veredito. Separado do veredito porque
 * "liberada" não é "feita": o app precisa distinguir a ação disponível e
 * ainda pendente da ação já realizada, e a contraindicada da não indicada.
 */
export function estadoDaAcao(veredito: Veredito | null, jaRealizada: boolean): EstadoDaAcao {
  if (jaRealizada) return "realizada";
  if (!veredito) return "nao_indicada";
  if (veredito.nivel === "vermelho") return "contraindicada";
  return "pendente";
}

/**
 * ⚠️ BLOQUEIO DE MEDICAÇÃO ≠ BLOQUEIO DO ATENDIMENTO (regra do autor,
 * 2026-08-25). Esta função responde só sobre AQUELA ação: um vermelho no
 * nitrato não pode impedir o médico de seguir a via de SCA. O fluxo continua;
 * o que não fica verde é o comando específico.
 */
export function acaoLiberada(veredito: Veredito | null): boolean {
  if (!veredito) return false;
  return veredito.nivel === "verde";
}

/**
 * O amarelo é o único que devolve a escolha ao médico — e ela fica
 * registrada. Vermelho não tem "prosseguir mesmo assim": o caminho é corrigir
 * o dado (quando houver correção) ou seguir sem a medicação.
 */
export function exigeDecisaoMedica(veredito: Veredito | null): boolean {
  return !!veredito && veredito.nivel === "amarelo" && !!veredito.decisao;
}
