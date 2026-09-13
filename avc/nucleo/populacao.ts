/**
 * PORTÃO DE POPULAÇÃO — AC-03 de `docs/avc/auditoria-vs-spec.md`.
 *
 * Fonte: `protocols/fontes-verbatim/escopo-populacional-avc.md` (slot F-37):
 * [CORREÇÃO 12/09] *"Identificar e encaminhar; nunca aplicar regra adulta em
 * silêncio"* e a instrução escrita do autor de 2026-09-13.
 *
 * ⚠️ O que este arquivo decide: se a população do caso está **validada** para o
 * módulo (adulto, não gestante, não puérpera), **fora do escopo**, ou ainda **sem
 * resposta**. ⛔ O que ele NÃO decide: nenhuma conduta. Fora do escopo, a única
 * saída é encaminhar.
 *
 * ⚠️ Desconhecido ⛔ não é negativo: "não sei" na idade ⛔ não vira adulto, e
 * "não sei" na gestação ⛔ não vira "não gestante" (escolha do autor, 2026-09-13).
 */
import type { EstadoAvc } from "./estado";
import { valorAtual } from "./estado";
import type { SuperficieId } from "./tipos";
import { valorDaOpcao } from "../conteudo/campo";
import { FAIXA_ETARIA, GESTACAO_PUERPERIO } from "../conteudo/paciente";

export const MENSAGEM_FORA_DO_ESCOPO = "Fora do escopo validado — encaminhar";

export type EstadoDaPopulacao = "adulto_validado" | "fora_do_escopo" | "pergunta_pendente";
export type MotivoForaDoEscopo = "menor_de_18" | "gestante" | "puerpera";

export type LeituraDaPopulacao = {
  readonly estado: EstadoDaPopulacao;
  /** Por que o caso está fora do escopo. Vazio quando não está. */
  readonly motivos: readonly MotivoForaDoEscopo[];
  /** Quais perguntas ainda não têm resposta que decida. */
  readonly faltam: readonly ("faixa_etaria" | "gestacao_puerperio")[];
};

/**
 * ⚠️ O que abre antes de a população ser validada — escolha do autor
 * (2026-09-13): estabilização e ameaças imediatas ⛔ não esperam pela pergunta.
 */
export const SUPERFICIES_LIVRES_DO_PORTAO: readonly SuperficieId[] = ["estabilizacao"];

export function estadoDaPopulacao(estado: EstadoAvc): LeituraDaPopulacao {
  const faixa = valorAtual(estado, "faixa_etaria")?.valor;
  const gestacao = valorAtual(estado, "gestacao_puerperio")?.valor;

  const motivos: MotivoForaDoEscopo[] = [];
  if (faixa === valorDaOpcao(FAIXA_ETARIA.menor)) motivos.push("menor_de_18");
  if (gestacao === valorDaOpcao(GESTACAO_PUERPERIO.gestante)) motivos.push("gestante");
  if (gestacao === valorDaOpcao(GESTACAO_PUERPERIO.puerpera)) motivos.push("puerpera");

  const faltam: ("faixa_etaria" | "gestacao_puerperio")[] = [];
  const faixaDecide = faixa === valorDaOpcao(FAIXA_ETARIA.adulto) || faixa === valorDaOpcao(FAIXA_ETARIA.menor);
  const gestacaoDecide = [GESTACAO_PUERPERIO.nenhuma, GESTACAO_PUERPERIO.gestante, GESTACAO_PUERPERIO.puerpera]
    .map(valorDaOpcao)
    .includes(String(gestacao));
  if (!faixaDecide) faltam.push("faixa_etaria");
  if (!gestacaoDecide) faltam.push("gestacao_puerperio");

  if (motivos.length > 0) return { estado: "fora_do_escopo", motivos, faltam };
  if (faltam.length > 0) return { estado: "pergunta_pendente", motivos, faltam };
  return { estado: "adulto_validado", motivos, faltam };
}

/** ⚠️ `true` quando a superfície fica atrás do portão neste caso. */
export function superficieRetidaPeloPortao(estado: EstadoAvc, superficie: SuperficieId): boolean {
  if (SUPERFICIES_LIVRES_DO_PORTAO.includes(superficie)) return false;
  return estadoDaPopulacao(estado).estado !== "adulto_validado";
}

/** ⚠️ Dose calculada por peso só existe para a população validada. */
export function exibeDosePorPeso(estado: EstadoAvc): boolean {
  return estadoDaPopulacao(estado).estado === "adulto_validado";
}
