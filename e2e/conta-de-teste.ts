/**
 * ⚠️⚠️ CONTA DE TESTE DEDICADA — infraestrutura de validação autenticada.
 *
 * ⛔ A suíte padrão roda contra `dist/` produzido por `build:web:teste`, que
 * ⛔ **não** tem Supabase embutido: a guarda de `app/_layout.tsx` cai no ramo
 * local e ⛔ nenhuma tela autenticada é exercida. Isso mede a tela, ⛔ mas ⛔ não
 * mede a **produção real**, onde a guarda resolve sessão, perfil e status.
 *
 * ⚠️ Esta infraestrutura abre `/modulos/avc` **autenticado em produção**, com
 * uma conta criada só para isso.
 *
 * ⚠️⚠️ TRÊS REGRAS QUE ⛔ NÃO PODEM SER RELAXADAS:
 *
 * 1. ⛔ Credencial ⛔ nunca entra no repositório. Só variável de ambiente.
 *    ⛔ Nem em `.env`, ⛔ nem em fixture, ⛔ nem em comentário de exemplo —
 *    `scripts/prova-conta-de-teste.cjs` recusa o commit se entrar.
 * 2. ⛔ O `storageState` gravado carrega um **access token e um refresh token
 *    reais**. Ele mora fora da árvore do repositório (que ainda por cima é
 *    sincronizada pelo iCloud), pelo mesmo motivo de `outputDir`.
 * 3. ⛔ Sem as variáveis, o projeto autenticado ⛔ não existe — `test:all`
 *    continua exatamente como está. Ausência de conta ⛔ não é falha de suíte;
 *    ⛔ mas ⛔ também ⛔ não é aprovação: quem pede a validação autenticada
 *    recebe um erro que diz o que falta.
 */

/** ⚠️ Fora da árvore do repositório: o arquivo contém tokens vivos. */
export const CAMINHO_DO_ESTADO_AUTENTICADO =
  "/tmp/playwright-clinical-emergency/conta-de-teste.json";

export type CredenciaisDaContaDeTeste = { email: string; senha: string };

export function contaDeTesteConfigurada(): boolean {
  return Boolean(process.env.E2E_CONTA_TESTE_EMAIL && process.env.E2E_CONTA_TESTE_SENHA);
}

/**
 * ⚠️ Lê as credenciais ⛔ ou explica o que falta. ⛔ Um `?? ""` silencioso faria
 * o login falhar como "e-mail ou senha inválidos" — mentira sobre a causa.
 */
export function credenciaisDaContaDeTeste(): CredenciaisDaContaDeTeste {
  const email = process.env.E2E_CONTA_TESTE_EMAIL;
  const senha = process.env.E2E_CONTA_TESTE_SENHA;
  if (!email || !senha) {
    throw new Error(
      "⛔ Conta de teste não configurada. Defina E2E_CONTA_TESTE_EMAIL e " +
        "E2E_CONTA_TESTE_SENHA no ambiente (nunca no repositório) e rode de novo. " +
        "A conta precisa existir no Supabase com status='ativo'.",
    );
  }
  return { email, senha };
}

/**
 * ⚠️⚠️ A VALIDAÇÃO AUTENTICADA É ⛔ SEMPRE CONTRA UMA URL DECLARADA.
 *
 * ⛔ Cair no `localhost:4173` por omissão validaria o `dist` de teste
 * — ⛔ exatamente o artefato que esta infraestrutura existe para ⛔ não usar.
 */
export function baseUrlAutenticada(): string {
  const url = process.env.E2E_BASE_URL;
  if (!url) {
    throw new Error(
      "⛔ Validação autenticada exige E2E_BASE_URL apontando para a produção " +
        "(ex.: https://clinical-emergency-app.vercel.app). Sem isso, a suíte " +
        "mediria o dist local, que não tem Supabase.",
    );
  }
  return url.replace(/\/$/, "");
}
