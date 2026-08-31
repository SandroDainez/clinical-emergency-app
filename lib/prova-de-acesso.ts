/**
 * PROVA DE ACESSO · o *last-known-good* — e ⛔ o que ele **NÃO** autoriza.
 *
 * ── ⚠️⚠️ O PROBLEMA ───────────────────────────────────────────────────────
 *
 * A guarda passou a exigir a RPC `get_current_app_user` antes de desenhar
 * ⛔ qualquer rota clínica. ⚠️⚠️ Isso significa que **Supabase fora do ar deixa o
 * médico sem o motor de PCR** — um motor que é ⛔ inteiramente local e ⛔ não lê o
 * banco. ⛔ Disponibilidade degradando por uma checagem cujo dado protegido
 * ⛔ nem está em jogo.
 *
 * ⛔ ⛔ E a saída ⛔ NÃO pode ser *"RPC falhou → libera"*: aí uma conta **pendente**
 * ganha acesso ⛔ só derrubando a internet.
 *
 * ── ⚠️⚠️ A REGRA, E ELA É A LINHA INTEIRA ─────────────────────────────────
 *
 * ⚠️⚠️ **Autorização do motor local** = estado confirmado agora ⛔ **OU** prova
 * local válida.
 * ⚠️⚠️ **Autorização de dado remoto** = ⛔ **SEMPRE** estado confirmado agora,
 * mais RLS.
 *
 * ⛔ ⛔ ⛔ A PROVA ⛔ NUNCA VIRA CREDENCIAL. Ela ⛔ não abre histórico, ⛔ não abre
 * escrita, ⛔ não abre sync, ⛔ não vale para Edge Function, ⛔ não é enviada a
 * ⛔ lugar ⛔ nenhum. ⚠️ É um bilhete que ⛔ só o próprio aparelho lê, e que diz
 * ⛔ uma coisa: *"este `user_id` já esteve ativo aqui, ⛔ há pouco"*.
 *
 * ── ⚠️ O TRADE-OFF, ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ Durante a validade, uma conta **bloqueada no servidor** ainda usa o motor
 * local ⛔ se o app ⛔ não conseguir falar com o servidor. ⛔ Ela ⛔ não lê ⛔ nem
 * escreve ⛔ nada remoto. ⚠️ É decisão de produto: numa emergência, tirar a
 * calculadora de PCR da mão de quem foi autorizado ontem é pior que o risco de
 * ela usar o motor por mais algumas horas.
 *
 * ⚠️ E ⛔ assim que a RPC responder, o bloqueio vale na hora e a prova é destruída.
 *
 * ⚠️⚠️ A **regra** de validade ⛔ não mora aqui — ela é pura e vive em
 * `guarda-de-acesso.ts`, junto das outras regras de acesso, onde é
 * **executada** contra cada caso. ⛔ Aqui fica ⛔ só o armazenamento, que importa
 * `react-native` e ⛔ por isso ⛔ não compila isolado.
 */
import { Platform } from "react-native";
import { VALIDADE_DA_PROVA_MS, type ProvaLocal } from "./guarda-de-acesso";

const CHAVE = "cea_prova_de_acesso";

function armazem(): Storage | null {
  try {
    if (Platform.OS !== "web" || typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

/**
 * ⚠️⚠️ GRAVA ⛔ SÓ PARA `ativo` CONFIRMADO PELO SERVIDOR.
 *
 * ⛔ ⛔ Chamar isto em ⛔ qualquer outro estado transformaria a degradação numa
 * porta: bastaria uma conta pendente ser vista uma vez para virar prova.
 */
export function gravarProva(userId: string, agora: number): void {
  const a = armazem();
  if (!a) return;
  try {
    a.setItem(CHAVE, JSON.stringify({ userId, em: agora } satisfies ProvaLocal));
  } catch {
    /** ⛔ Aba privada ⛔ ou storage cheio: seguir ⛔ sem prova é falhar fechado. */
  }
}

export function lerProva(): ProvaLocal | null {
  const a = armazem();
  if (!a) return null;
  try {
    const cru = a.getItem(CHAVE);
    if (!cru) return null;
    const p = JSON.parse(cru);
    return typeof p?.userId === "string" && typeof p?.em === "number" ? p : null;
  } catch {
    return null;
  }
}

/**
 * ⚠️⚠️ DESTRÓI A PROVA. Chamada quando o servidor diz `pendente` ⛔ ou
 * `bloqueado`, e no logout — ⛔ trocar de identidade ⛔ não pode carregar
 * autorização anterior.
 */
export function invalidarProva(): void {
  const a = armazem();
  if (!a) return;
  try {
    a.removeItem(CHAVE);
  } catch {
    /* ⛔ nada a fazer */
  }
}
