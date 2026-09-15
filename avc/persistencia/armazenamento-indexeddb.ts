/**
 * ARMAZENAMENTO EM INDEXEDDB — o registro local-first do navegador (D-PEND-02).
 *
 * ⚠️ Schema v4 (`tipos.ts`). A abertura com `VERSAO_DO_SCHEMA` dispara a migração:
 * de 0 cria tudo; de 1 cria `rascunhos` e o índice `porCasoSeq`; de 1, 2 ou 3
 * reescreve cada evento com `migrarEvento`, sem tocar `dados` nem `seq`.
 *
 * ⚠️⚠️ `seq` É ATRIBUÍDO AQUI, NA GRAVAÇÃO, dentro de UMA transação readwrite: lê o
 * maior `seq` do caso pelo índice `[casoId, seq]` ⛔ e numera os eventos na ordem em
 * que entram. As requisições são encadeadas por callback — ⛔ sem `await` no meio da
 * transação, para ela ⛔ não se encerrar sozinha entre uma requisição e outra.
 * ID já gravado ⛔ é reescrito ⛔ nem renumerado: devolve o que está no log.
 *
 * ⛔ Limites reais (cota, limpeza de dados, sem backup) em `docs/avc/persistencia.md`.
 */
import {
  NOME_DO_BANCO,
  VERSAO_DO_SCHEMA,
  migrarEvento,
  type ArmazenamentoDoAtendimento,
  type CasoGuardado,
  type DadosDoCasoAberto,
  type EventoDoAtendimento,
  type EventoV1,
  type EventoV2,
  type EventoV3,
  type NovoEvento,
  type RascunhoDoAtendimento,
} from "./tipos";

function pedido<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function fim(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function abrirBanco(nome: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(nome, VERSAO_DO_SCHEMA);
    req.onupgradeneeded = (ev) => {
      const db = req.result;
      const tx = req.transaction as IDBTransaction;
      const de = ev.oldVersion;
      if (de < 1) {
        db.createObjectStore("casos", { keyPath: "casoId" });
        const eventos = db.createObjectStore("eventos", { keyPath: "id" });
        eventos.createIndex("porCaso", "casoId");
      }
      if (de < 2) {
        db.createObjectStore("rascunhos", { keyPath: ["casoId", "chave"] });
        tx.objectStore("eventos").createIndex("porCasoSeq", ["casoId", "seq"]);
      }
      /** v1, v2 e v3 → schema atual (v4, AC-13 reaberto item 4), evento a evento, sem tocar `dados` nem `seq`. */
      if (de >= 1 && de < VERSAO_DO_SCHEMA) {
        const cursor = tx.objectStore("eventos").openCursor();
        cursor.onsuccess = () => {
          const c = cursor.result;
          if (!c) return;
          c.update(migrarEvento(c.value as EventoV1 | EventoV2 | EventoV3));
          c.continue();
        };
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function indexedDbDisponivel(): boolean {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch {
    return false;
  }
}

export function criarArmazenamentoIndexedDb(nome: string = NOME_DO_BANCO): ArmazenamentoDoAtendimento {
  let banco: Promise<IDBDatabase> | undefined;
  const db = () => (banco ??= abrirBanco(nome));

  return {
    persistente: true,
    async anexarEventos(casoId, novos: readonly NovoEvento[]) {
      const d = await db();
      return new Promise<readonly EventoDoAtendimento[]>((resolve, reject) => {
        for (const e of novos) {
          if (e.casoId !== casoId) {
            reject(new Error("Evento de outro caso."));
            return;
          }
        }
        const tx = d.transaction(["eventos", "casos"], "readwrite");
        const eventos = tx.objectStore("eventos");
        const casos = tx.objectStore("casos");
        const gravados: EventoDoAtendimento[] = [];
        tx.oncomplete = () => resolve(gravados);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);

        const faixa = IDBKeyRange.bound([casoId, -Infinity], [casoId, Infinity]);
        const maior = eventos.index("porCasoSeq").openCursor(faixa, "prev");
        maior.onsuccess = () => {
          let seq = maior.result ? (maior.result.value as EventoDoAtendimento).seq : 0;
          const gravar = (i: number) => {
            if (i >= novos.length) return;
            const e = novos[i];
            const existe = eventos.get(e.id);
            existe.onsuccess = () => {
              if (existe.result !== undefined) {
                gravados.push(migrarEvento(existe.result as EventoDoAtendimento | EventoV1 | EventoV2 | EventoV3));
                gravar(i + 1);
                return;
              }
              /** ⚠️ A ordem nasce AQUI — ⛔ qualquer `seq` do produtor é ignorado. */
              const gravado = { ...(e as NovoEvento), seq: ++seq } as EventoDoAtendimento;
              const r = eventos.add(gravado);
              r.onsuccess = () => {
                gravados.push(gravado);
                if (e.tipo !== "caso_aberto") {
                  gravar(i + 1);
                  return;
                }
                const jaTem = casos.get(casoId);
                jaTem.onsuccess = () => {
                  if (jaTem.result === undefined) {
                    const caso: CasoGuardado = { casoId, abertoEm: (e.dados as DadosDoCasoAberto).abertoEm, encerradoEm: null };
                    casos.add(caso);
                  }
                  gravar(i + 1);
                };
              };
            };
          };
          gravar(0);
        };
      });
    },
    async lerEventos(casoId) {
      const d = await db();
      const tx = d.transaction("eventos", "readonly");
      const lidos = await pedido(tx.objectStore("eventos").index("porCaso").getAll(casoId));
      return (lidos as (EventoDoAtendimento | EventoV1 | EventoV2 | EventoV3)[]).map(migrarEvento).sort((a, b) => a.seq - b.seq);
    },
    async casoMaisRecenteNaoEncerrado() {
      const d = await db();
      const tx = d.transaction("casos", "readonly");
      const todos = (await pedido(tx.objectStore("casos").getAll())) as CasoGuardado[];
      const abertos = todos.filter((c) => c.encerradoEm === null || c.encerradoEm === undefined);
      abertos.sort((a, b) => b.abertoEm - a.abertoEm);
      return abertos[0]?.casoId;
    },
    async encerrarCaso(casoId, em) {
      const d = await db();
      const tx = d.transaction("casos", "readwrite");
      const loja = tx.objectStore("casos");
      const c = (await pedido(loja.get(casoId))) as CasoGuardado | undefined;
      if (c) loja.put({ ...c, encerradoEm: em });
      await fim(tx);
    },
    async gravarRascunho(r: RascunhoDoAtendimento) {
      const d = await db();
      const tx = d.transaction("rascunhos", "readwrite");
      tx.objectStore("rascunhos").put(r);
      await fim(tx);
    },
    async lerRascunhos(casoId) {
      const d = await db();
      const tx = d.transaction("rascunhos", "readonly");
      const todos = (await pedido(tx.objectStore("rascunhos").getAll())) as RascunhoDoAtendimento[];
      return todos.filter((r) => r.casoId === casoId);
    },
  };
}
