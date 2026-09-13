/**
 * ARMAZENAMENTO EM MEMÓRIA — ⛔ NÃO PERSISTENTE (`persistente: false`).
 *
 * ⚠️ Serve às provas e ao nativo enquanto o SQLite ⛔ não existe. Obedece à mesma
 * interface e às mesmas regras do IndexedDB: `seq` atribuído NA GRAVAÇÃO; ID já
 * gravado é ignorado, ⛔ nunca reescrito ⛔ nem renumerado; rascunho mora fora do
 * log; dump de v1 é migrado ao carregar.
 */
import {
  migrarEvento,
  type ArmazenamentoDoAtendimento,
  type CasoGuardado,
  type DadosDoCasoAberto,
  type EventoDoAtendimento,
  type EventoV1,
  type EventoV2,
  type RascunhoDoAtendimento,
} from "./tipos";

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

export function criarArmazenamentoEmMemoria(opcoes?: {
  dumpV1?: { casos: readonly CasoGuardado[]; eventos: readonly EventoV1[] };
  /** ⚠️ Dump de qualquer schema anterior (v1 ⛔ ou v2), migrado ao carregar. */
  dumpAnterior?: { casos: readonly CasoGuardado[]; eventos: readonly (EventoV1 | EventoV2)[] };
}): ArmazenamentoDoAtendimento {
  const casos = new Map<string, CasoGuardado>();
  const eventos = new Map<string, EventoDoAtendimento>();
  const rascunhos = new Map<string, RascunhoDoAtendimento>();

  for (const dump of [opcoes?.dumpV1, opcoes?.dumpAnterior]) {
    if (!dump) continue;
    for (const c of dump.casos) casos.set(c.casoId, clone(c));
    for (const e of dump.eventos) eventos.set(e.id, migrarEvento(clone(e)));
  }

  const ultimoSeq = (casoId: string) =>
    [...eventos.values()].filter((e) => e.casoId === casoId).reduce((m, e) => Math.max(m, e.seq), 0);

  return {
    persistente: false,
    async anexarEventos(casoId, novos) {
      let seq = ultimoSeq(casoId);
      const gravados: EventoDoAtendimento[] = [];
      for (const e of novos) {
        if (e.casoId !== casoId) throw new Error("Evento de outro caso.");
        const existente = eventos.get(e.id);
        if (existente !== undefined) {
          gravados.push(clone(existente));
          continue;
        }
        /** ⚠️ A ordem nasce AQUI, na gravação — ⛔ qualquer `seq` do produtor é ignorado. */
        const gravado: EventoDoAtendimento = { ...clone(e), seq: ++seq };
        eventos.set(e.id, gravado);
        gravados.push(clone(gravado));
        if (e.tipo === "caso_aberto" && !casos.has(casoId)) {
          casos.set(casoId, { casoId, abertoEm: (e.dados as DadosDoCasoAberto).abertoEm, encerradoEm: null });
        }
      }
      return gravados;
    },
    async lerEventos(casoId) {
      return [...eventos.values()].filter((e) => e.casoId === casoId).sort((a, b) => a.seq - b.seq).map(clone);
    },
    async casoMaisRecenteNaoEncerrado() {
      const abertos = [...casos.values()].filter((c) => c.encerradoEm === null);
      abertos.sort((a, b) => b.abertoEm - a.abertoEm);
      return abertos[0]?.casoId;
    },
    async encerrarCaso(casoId, em) {
      const c = casos.get(casoId);
      if (c) casos.set(casoId, { ...c, encerradoEm: em });
    },
    async gravarRascunho(r) {
      rascunhos.set(`${r.casoId}|${r.chave}`, clone(r));
    },
    async lerRascunhos(casoId) {
      return [...rascunhos.values()].filter((r) => r.casoId === casoId).map(clone);
    },
  };
}
