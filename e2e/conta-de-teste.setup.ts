import { expect, test as setup } from "@playwright/test";

import {
  CAMINHO_DO_ESTADO_AUTENTICADO,
  baseUrlAutenticada,
  credenciaisDaContaDeTeste,
} from "./conta-de-teste";

/**
 * ⚠️⚠️ ESTE ARQUIVO ⛔ NÃO É UM TESTE DE PRODUTO — é o portão.
 *
 * ⛔ Ele roda ⛔ antes dos specs autenticados (`dependencies` no
 * `playwright.config.ts`) e grava o `storageState` que eles reutilizam. Se ele
 * falhar, ⛔ nenhum spec autenticado roda — que é o certo: rodar sem sessão
 * mediria a **tela de login**, ⛔ e ⛔ não a superfície clínica, ⛔ e passaria
 * verde por medir a coisa errada.
 */
setup("autenticar a conta de teste e gravar o estado", async ({ page }) => {
  const { email, senha } = credenciaisDaContaDeTeste();
  const base = baseUrlAutenticada();

  await page.goto(`${base}/`);

  /**
   * ⚠️ A landing vem ⛔ antes do formulário (`showIntro = true`). O botão é
   * alcançado por `testID`, ⛔ e ⛔ não pelo texto « Entrar » — que muda em
   * espanhol ⛔ e existe duas vezes na mesma tela.
   */
  await page.getByTestId("intro-entrar").click();

  const campoEmail = page.getByTestId("entrada-email");
  await expect(campoEmail).toBeVisible();
  await campoEmail.fill(email);
  await page.getByTestId("entrada-senha").fill(senha);
  await page.getByTestId("entrada-enviar").click();

  /**
   * ⚠️⚠️ O ERRO DA TELA É LIDO ⛔ ANTES DO TIMEOUT DE NAVEGAÇÃO.
   *
   * ⛔ Sem isto, uma conta `pendente` — que é o estado em que ⛔ toda conta
   * nasce — falharia como « timeout esperando /(tabs) », ⛔ escondendo a
   * mensagem que diz exatamente o que fazer.
   */
  /**
   * ⚠️⚠️ ⛔ E O SINAL DE SUCESSO ⛔ **⛔ NÃO** É A URL. ⛔ `router.replace("/(tabs)")`
   * ⛔ leva a `/` — ⛔ **⛔ a mesma URL da porta**. ⛔ Um `waitForURL(/\/$/)`
   * resolveria ⛔ na hora, ⛔ **⛔ antes** de a tela mudar, ⛔ e a corrida
   * ⛔ nunca leria o erro. ⚠️ O que ⛔ só acontece ⛔ ao entrar é o formulário
   * ⛔ **⛔ sair do DOM**.
   */
  const erro = page.getByTestId("entrada-erro");
  const desfecho = await Promise.race([
    campoEmail.waitFor({ state: "detached", timeout: 25_000 }).then(() => "entrou" as const),
    erro.waitFor({ state: "visible", timeout: 25_000 }).then(() => "erro" as const),
  ]).catch(() => "indefinido" as const);

  if (desfecho === "erro") {
    throw new Error(`⛔ Login da conta de teste recusado pela aplicação: « ${await erro.innerText()} »`);
  }
  if (desfecho === "indefinido") {
    throw new Error(
      "⛔ O login não avançou nem recusou em 25 s. Verifique se E2E_BASE_URL aponta " +
        "para um build com Supabase embutido (`build:web`, ⛔ não `build:web:teste`).",
    );
  }

  /**
   * ⚠️ A prova de que entrou ⛔ não é a URL: é a guarda deixando passar uma
   * rota **clínica**, que é o que a validação autenticada vem exercer.
   */
  await page.goto(`${base}/modulos/avc`);
  await expect(page.getByTestId("avc-superficie-paciente-conteudo")).toBeVisible({ timeout: 25_000 });
  expect(page.url()).toContain("/modulos/avc");

  await page.context().storageState({ path: CAMINHO_DO_ESTADO_AUTENTICADO });
});
