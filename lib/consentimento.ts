/**
 * CONSENTIMENTO DE USO — o aceite que precede ⛔ qualquer conteúdo clínico.
 *
 * ── ⚠️⚠️ POR QUE ISTO EXISTE ────────────────────────────────────────────────
 *
 * O app calcula **dose de trombolítico por peso**, com teto absoluto, ⛔ e
 * apresenta conduta de emergência. A landing (`intro-landing.tsx`) apresenta o
 * produto ⛔ e tem um botão "Começar agora" — ⛔ o que ela **⛔ não** é: registro
 * de que o profissional leu quem decide.
 *
 * ⚠️ A diferença ⛔ não é de tela, é de **responsabilidade**: "Começar agora" é
 * convite; *"Li e estou ciente"* é aceite. O app de ACLS que vive separado
 * (`acls-pcr-standalone`) sempre teve o segundo, ⛔ e este ⛔ não tinha.
 *
 * ── ⚠️ O QUE ESTE MÓDULO ⛔ NÃO FAZ ─────────────────────────────────────────
 *
 * ⛔ **⛔ NÃO** grava no servidor, ⛔ e ⛔ não amarra o aceite a um usuário. O aceite
 * é **por dispositivo**, ⛔ e de propósito: amarrá-lo à conta faria a tela sumir
 * num aparelho onde o médico ⛔ nunca leu o aviso — bastaria ele ter aceitado no
 * computador de casa. ⚠️ Quem usa o aparelho é quem precisa ter lido.
 *
 * ⛔ **⛔ NÃO** expira. Aceite ⛔ não caduca: o que caduca é a *versão do texto* —
 * ⛔ e é por isso que a chave carrega `VERSAO_DO_TEXTO`. Mudou o que se aceita,
 * muda a chave, ⛔ e o aceite é pedido de novo. ⚠️ Reescrever o aviso ⛔ sem subir
 * a versão faria o app afirmar que alguém concordou com um texto que ⛔ nunca viu.
 */
import { armazenamentoLocal } from "./armazenamento-local";

/**
 * ⚠️ SOBE JUNTO COM O TEXTO DO AVISO — ⛔ e ⛔ nunca sozinha.
 *
 * ⛔ Trocar a redação do consentimento ⛔ sem tocar aqui deixa em vigor um aceite
 * dado sobre outro texto.
 */
export const VERSAO_DO_TEXTO = "2026-09-05";

const CHAVE = `consentimento-clinico:${VERSAO_DO_TEXTO}`;

/**
 * ⚠️ AUSENTE ⛔ E ILEGÍVEL SÃO A MESMA COISA AQUI: **⛔ não aceito**.
 *
 * ⛔ Storage indisponível (modo privado, cota, aparelho novo) ⛔ não pode liberar
 * conteúdo clínico — o erro aceitável é pedir o aceite de novo, ⛔ e ⛔ nunca
 * presumi-lo.
 */
export function consentimentoAceito(): boolean {
  const disco = armazenamentoLocal();
  if (!disco) return false;
  try {
    return disco.ler(CHAVE) === "1";
  } catch {
    return false;
  }
}

export function registrarConsentimento(): void {
  const disco = armazenamentoLocal();
  if (!disco) return;
  try {
    disco.gravar(CHAVE, "1");
  } catch {
    /* sem disco o aceite é pedido de novo — ver o comentário acima */
  }
}

/** Usado pelos testes ⛔ e pela tela de desenvolvimento. */
export function esquecerConsentimento(): void {
  const disco = armazenamentoLocal();
  if (!disco) return;
  try {
    disco.apagar(CHAVE);
  } catch {
    /* nada */
  }
}
