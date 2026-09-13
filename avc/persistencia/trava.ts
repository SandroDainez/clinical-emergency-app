/**
 * TRAVA DO CASO — segunda abertura do mesmo caso no mesmo aparelho (D-PEND-03).
 *
 * ⚠️ Decisão do autor (2026-09-13): multiusuário fora do escopo; a segunda
 * abertura do mesmo caso é DETECTADA ⛔ e BLOQUEADA, com aviso — ⛔ nunca
 * conciliada, ⛔ nunca sobrescrita em silêncio.
 *
 * ⚠️ No navegador usa Web Locks (`navigator.locks`, com `ifAvailable`): a trava
 * some sozinha quando a aba fecha. ⛔ Sem Web Locks, cai para a trava em memória,
 * que só protege a própria aba — limite declarado em `docs/avc/persistencia.md`.
 */

export const MENSAGEM_CASO_ABERTO_EM_OUTRA_ABA =
  "Este atendimento já está aberto em outra aba deste aparelho. Continue nela para não registrar o mesmo caso em dois lugares.";

export type TravaAdquirida = { liberar(): Promise<void> };

export interface RegistroDeTravas {
  /** ⚠️ `undefined` quando a trava já é de outra aba — ⛔ nunca espera por ela. */
  adquirir(nome: string): Promise<TravaAdquirida | undefined>;
}

export function criarRegistroDeTravasEmMemoria(): RegistroDeTravas {
  const ocupadas = new Set<string>();
  return {
    async adquirir(nome) {
      if (ocupadas.has(nome)) return undefined;
      ocupadas.add(nome);
      return { liberar: async () => { ocupadas.delete(nome); } };
    },
  };
}

type WebLocks = {
  request(
    nome: string,
    opcoes: { ifAvailable: boolean },
    cb: (lock: unknown) => Promise<void> | undefined
  ): Promise<unknown>;
};

export function criarRegistroDeTravasDoNavegador(): RegistroDeTravas {
  const locks = (globalThis as { navigator?: { locks?: WebLocks } }).navigator?.locks;
  if (locks === undefined || typeof locks.request !== "function") return criarRegistroDeTravasEmMemoria();
  return {
    adquirir(nome) {
      return new Promise((resolve) => {
        void locks.request(nome, { ifAvailable: true }, (lock) => {
          if (lock === null || lock === undefined) {
            resolve(undefined);
            return undefined;
          }
          return new Promise<void>((soltar) => {
            resolve({ liberar: async () => soltar() });
          });
        });
      });
    },
  };
}
