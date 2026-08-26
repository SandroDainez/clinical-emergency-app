import { test, expect } from "@playwright/test";

/**
 * PROMETE: que o médico VÊ a cobrança do ECG de 12 derivações — que ela abre o
 *   módulo, que alcança quem entra por atalho, que a faixa persiste pelas telas
 *   seguintes enquanto o ECG estiver pendente, e que ela SOME quando o ECG fica
 *   pronto.
 * NÃO PROMETE: a aritmética dos estados nem a dominância das rotas — isso é
 *   `test:ecg-tempo`, que mede o motor. Aqui se mede o que aparece na tela.
 *
 * ── POR QUE ESTE ARQUIVO EXISTE, tendo a trava estrutural ─────────────────
 *
 * A trava prova que `alertaDoEcg` devolve o objeto certo. Isso é a regra. Que a
 * FAIXA APAREÇA depende do shell — de `getAlertaPersistente` ser chamado e de a
 * View ficar FORA do ScrollView. São coisas diferentes: o defeito de origem foi
 * exatamente uma informação correta que ninguém via, porque estava na quarta
 * linha de uma lista de oito. Uma faixa que só existisse no objeto repetiria o
 * defeito num lugar novo.
 */

// 375×667 — o alvo declarado pelo autor. Nenhuma decisão clínica abaixo da
// dobra, e a cobrança do ECG é o gatilho de uma.
test.use({ viewport: { width: 375, height: 667 } });

const corpo = (page: any) => page.locator("body").innerText();

// ⚠️ ESPERA PELO CONTEÚDO, NÃO PELO RELÓGIO. Com `waitForTimeout(4000)` este
// arquivo passava sozinho e falhava quando a suíte inteira rodava em paralelo:
// 4 s é uma promessa sobre a máquina, não sobre o app, e sob carga o bundle
// ainda não tinha montado. Falha por lentidão é indistinguível de falha por
// defeito — e é assim que uma trava vira ruído que se aprende a ignorar.
async function abrir(page: any) {
  await page.goto("/modulos/sindromes-coronarianas");
  await page.getByText(/Por onde você quer começar\?/i).first().waitFor({ timeout: 30_000 });
}

/** Entra pelo caminho pedido e espera a cobrança do ECG aparecer. */
async function entrarPor(page: any, atalho: RegExp) {
  await page.getByText(atalho).first().click();
  await page.getByText(/O ECG de 12 derivações já foi realizado\?/i).first().waitFor({ timeout: 30_000 });
}

test("a cobrança do ECG alcança quem entra pelo fluxo completo", async ({ page }) => {
  await abrir(page);
  await entrarPor(page, /Fluxo completo — dor torácica agora/i);

  const texto = await corpo(page);
  expect(texto).toContain("ECG de 12 derivações");
  expect(texto).toMatch(/já foi realizado/i);
  // A âncora é PERGUNTADA, não deduzida da abertura do módulo.
  expect(texto).toMatch(/primeiro contato médico/i);
  await page.screenshot({ path: "e2e/__screens__/ecg-tempo-1-tela.png" });
});

test("quem entra por atalho também é alcançado", async ({ page }) => {
  // ⚠️ O BECO DE ORIGEM. "STEMI já confirmado" pulava o `entry` inteiro, e o
  // lembrete do ECG morava numa linha do `entry`. Por este caminho ele não
  // existia — no dado mais sensível ao tempo do módulo.
  await abrir(page);
  await entrarPor(page, /STEMI já confirmado/i);

  expect(await corpo(page)).toMatch(/O ECG de 12 derivações já foi realizado\?/i);
  await page.screenshot({ path: "e2e/__screens__/ecg-tempo-2-atalho.png" });
});

test("pendente: a faixa aparece, persiste e não afirma atraso sem âncora", async ({ page }) => {
  await abrir(page);
  await entrarPor(page, /Fluxo completo — dor torácica agora/i);
  await page.getByText("Ainda não", { exact: true }).first().click();
  await page.getByText(/pendente — meta ≤10 min/i).first().waitFor({ timeout: 15_000 });

  const naTela = await corpo(page);
  expect(naTela).toMatch(/pendente/i);
  // Sem tempo informado, o app NÃO diz que está atrasado — ele diz que não sabe.
  expect(naTela).toMatch(/não está sendo medido/i);
  expect(naTela).not.toMatch(/ECG atrasado/i);
  await page.screenshot({ path: "e2e/__screens__/ecg-tempo-3-pendente.png" });

  // Avança para a próxima tela: a faixa tem de continuar lá.
  await page.getByText(/^Confirmar/).first().click();
  await page.getByText(/Suspeita de SCA/i).first().waitFor({ timeout: 15_000 });
  expect(await corpo(page)).toMatch(/ECG de 12 derivações: pendente/i);
  await page.screenshot({ path: "e2e/__screens__/ecg-tempo-4-persiste.png" });
});

test("feito: a faixa some", async ({ page }) => {
  await abrir(page);
  await entrarPor(page, /Fluxo completo — dor torácica agora/i);
  await page.getByText("Sim", { exact: true }).first().click();
  await page.getByText(/^Confirmar/).first().waitFor({ timeout: 15_000 });

  // A cobrança não sobrevive ao problema resolvido: "obtenha agora" para quem
  // já obteve é aviso sem ação possível.
  const texto = await corpo(page);
  expect(texto).not.toMatch(/ECG de 12 derivações: pendente/i);
  expect(texto).not.toMatch(/ECG atrasado/i);
  await page.screenshot({ path: "e2e/__screens__/ecg-tempo-5-feito.png" });
});
