/**
 * VALIDAÇÃO DO CATÁLOGO DE HEMORRAGIA — UMA FONTE DE VERDADE (AC-95; autor, 2026-09-13, 16ª rodada).
 *
 * ⚠️ Catálogo HIC/HSA ⛔ caminho hemorrágico consomem ESTA função: nenhuma conduta com dois estados.
 * ⚠️ Contrato de uma regra (`docs/spec-avc.md` §12, correção de 12/09): força ⛔ `contextoDaFonte`,
 * além de fonte. Declarado pelo que o item já tem (resposta do autor):
 *  · COR + LOE de diretriz → força `recomendacao_formal`;
 *  · `contextoDaFonte` = a população declarada no item;
 *  · sem população → "conteúdo pendente de validação" nos dois lugares;
 *  · doses da figura 2 (esquemas de reversão por agente, ⛔ recomendação graduada) → pendentes.
 * ⛔ Nenhum número muda; ⛔ nenhum item novo.
 */
import { REVERSAO_POR_AGENTE, TEMAS_HIC, type EsquemaDeReversao, type Recomendacao } from "./hemorragia-intracerebral";
import { TEMAS_HSA } from "./hemorragia-subaracnoidea";

export type ValidacaoDoItem =
  | {
      readonly estado: "recomendacao_formal";
      readonly forca: "recomendacao_formal";
      readonly contextoDaFonte: string;
      readonly fonte: string;
    }
  | {
      readonly estado: "pendente_de_validacao";
      readonly motivo: "sem_contexto_da_fonte" | "dose_nao_graduada";
      readonly fonte: string;
    };

export type ItemDoCatalogo = Recomendacao | EsquemaDeReversao;

const ehEsquema = (x: ItemDoCatalogo): x is EsquemaDeReversao => "agente" in x;

export function validacaoDoItem(item: ItemDoCatalogo): ValidacaoDoItem {
  if (ehEsquema(item)) {
    return { estado: "pendente_de_validacao", motivo: "dose_nao_graduada", fonte: `H-02 · ${item.slot}` };
  }
  const fonte = `${item.localizacao} · ${item.slot}`;
  if (item.cor && item.loe && item.populacao) {
    return { estado: "recomendacao_formal", forca: "recomendacao_formal", contextoDaFonte: item.populacao, fonte };
  }
  return { estado: "pendente_de_validacao", motivo: "sem_contexto_da_fonte", fonte };
}

/** ⚠️ O rótulo PT da classe — um só, para catálogo ⛔ caminho (movido de `superficie-hemorragica.tsx`). */
export function rotuloDaClasse(cor: Recomendacao["cor"]): string {
  if (cor === "COR 1") return "Recomendado";
  if (cor === "COR 2a") return "Razoável";
  if (cor === "COR 2b") return "Pode ser considerado";
  if (cor === "COR 3: No Benefit") return "Sem benefício";
  return "Potencialmente danoso";
}

export type CondutaDoCaminho = "reversao_anticoagulante" | "alvo_pressorico" | "indicacao_cirurgica";

type Selecao = { readonly temas?: readonly string[]; readonly recs?: readonly string[]; readonly reversaoPorAgente?: boolean };

/** ⚠️ Os itens do catálogo que respondem a cada conduta do caminho — ⛔ texto próprio do caminho. */
const ITENS_POR_CONDUTA: Readonly<Record<CondutaDoCaminho, { readonly hic: Selecao; readonly hsa: Selecao }>> = {
  reversao_anticoagulante: { hic: { temas: ["reversao"], reversaoPorAgente: true }, hsa: { recs: ["reversao"] } },
  alvo_pressorico: { hic: { temas: ["pressao_arterial"] }, hsa: { recs: ["pa_curta"] } },
  indicacao_cirurgica: { hic: { temas: ["cirurgia"] }, hsa: { temas: ["aneurisma"] } },
};

export type ItemDaConduta = {
  readonly chave: string;
  readonly variante: "hic" | "hsa";
  readonly tituloDoTema: string;
  readonly item: ItemDoCatalogo;
  readonly validacao: ValidacaoDoItem;
};

/**
 * ⚠️ O tipo registrado escolhe o catálogo: intraparenquimatosa → HIC; subaracnóidea → HSA; subdural ⛔
 * outra → ⛔ há item no catálogo (a conduta fica pendente); não registrado ⛔ não sei → os dois.
 */
function variantesDoTipo(tipo: string | undefined): readonly ("hic" | "hsa")[] {
  if (tipo === "Intraparenquimatosa") return ["hic"];
  if (tipo === "Subaracnóidea") return ["hsa"];
  if (tipo === "Subdural" || tipo === "Outra") return [];
  return ["hic", "hsa"];
}

export function itensDaConduta(conduta: CondutaDoCaminho, tipo: string | undefined): readonly ItemDaConduta[] {
  const out: ItemDaConduta[] = [];
  for (const variante of variantesDoTipo(tipo)) {
    const sel = ITENS_POR_CONDUTA[conduta][variante];
    const temas = variante === "hic" ? TEMAS_HIC : TEMAS_HSA;
    if (variante === "hic" && sel.reversaoPorAgente) {
      const tituloDoTema = TEMAS_HIC.find((t) => t.id === "reversao")?.titulo ?? "";
      for (const r of REVERSAO_POR_AGENTE) out.push({ chave: `hic-reversao-${r.id}`, variante, tituloDoTema, item: r, validacao: validacaoDoItem(r) });
    }
    for (const t of temas) {
      const recs = t.recomendacoes.filter((r) => (sel.temas ?? []).includes(t.id) || (sel.recs ?? []).includes(r.id));
      for (const r of recs) out.push({ chave: `${variante}-${r.id}`, variante, tituloDoTema: t.titulo, item: r, validacao: validacaoDoItem(r) });
    }
  }
  return out;
}
