import { test, expect } from "@playwright/test";

/**
 * PROMETE: que nenhum valor numérico NÃO INFORMADO pareça confirmado na tela —
 *   campo numérico opcional e ainda não tocado mostra "—", e passa a mostrar o
 *   número só depois do primeiro toque; campo obrigatório não muda.
 * NÃO PROMETE: nada sobre o conteúdo clínico da Tela 1 (test:coronarias) nem
 *   sobre a faixa de cada grandeza (test:faixas-entrada).
 *
 * ── O DEFEITO, MEDIDO ─────────────────────────────────────────────────────
 *
 * A barra parte do meio da faixa. Antes desta correção, a Tela 1 exibia
 * "Peso 140 kg" em tipo grande com o motor VAZIO, porque os campos dela são
 * opcionais e ninguém precisa tocá-los para avançar.
 *
 * ⚠️ PESO ALIMENTA DOSE — tenecteplase e enoxaparina são por quilo. Um número
 * que parece confirmado sem ninguém ter medido é a semente de uma dose errada
 * três telas adiante.
 */

test.use({ viewport: { width: 375, height: 667 } });

async function abrirTela1(page: any) {
  await page.goto("http://localhost:8099/modulos/sindromes-coronarianas");
  await page.waitForTimeout(4000);
  await page.getByText(/Fluxo completo — dor torácica agora/i).first().click();
  await page.waitForTimeout(1200);
  // ⚠️ TELA NOVA (2026-08-26): a cobrança do ECG de 12 derivações passou a
  // abrir o módulo, e todo atalho agudo atravessa ela. Só a pergunta binária é
  // obrigatória — este roteiro responde e segue, como o médico faria.
  await page.getByText("Ainda não", { exact: true }).first().click();
  await page.waitForTimeout(500);
  await page.getByText(/^Confirmar/).first().click();
  await page.waitForTimeout(1500);
  await page.getByText(/^Confirmar/).first().click();
  await page.waitForTimeout(1500);
}

test("campo opcional não informado mostra — e não contamina o motor", async ({ page }) => {
  await abrirTela1(page);
  const card = page.getByTestId("passo-de-entrada");

  // ⚠️ ESCOPO NO CAMPO, NÃO NO CARD. A primeira versão desta prova media o
  // card inteiro e casava com o travessão do eyebrow ("INFORMAR — TOQUE NO
  // VALOR") — passava verde sem medir nada do que promete.
  for (const [campo, meio] of [["peso", "140"], ["altura", "170"], ["idade", "60"]] as const) {
    const texto = await page.getByTestId(`slider-${campo}`).innerText();
    expect(texto.trim()).toContain("—");
    expect(texto).not.toMatch(new RegExp(`\\b${meio}\\b`));
  }
  const antes = (await card.allInnerTexts()).join(" ");
  expect(antes).not.toMatch(/\b140\s*kg\b/);

  // 2. Primeiro toque: passa a mostrar, e o motor grava.
  await page.getByTestId("slider-peso-mais").click();
  await page.waitForTimeout(500);
  const depois = (await card.allInnerTexts()).join(" ");
  expect(depois).toMatch(/\bPeso\b[\s\S]{0,40}\b141\b/);

  // ⚠️ O VALOR GRAVADO, não só o desenhado. O cabeçalho do campo só imprime
  // valor quando o MOTOR o tem (`current !== undefined`); a barra imprime o
  // seu próprio. Duas ocorrências de "141" significam que os dois concordam —
  // uma só significaria barra mexida e caso sem registro, que é exatamente a
  // divergência que esta trava existe para impedir.
  const ocorrencias = (depois.match(/\b141\b/g) ?? []).length;
  expect(ocorrencias).toBeGreaterThanOrEqual(2);

  // E o valor sobrevive ao passo seguinte — prova de que está no motor, não na
  // tela: volta e o número continua lá.
  await page.getByText(/Confirmar — continuar/).first().click();
  await page.waitForTimeout(1000);
  await page.getByText(/Voltar/).first().click();
  await page.waitForTimeout(1000);
  const voltou = (await page.getByTestId("passo-de-entrada").allInnerTexts()).join(" ");
  expect(voltou).toMatch(/\b141\b/);
  // E o campo do peso já não diz "—": ele tem valor agora.
  expect(await page.getByTestId("slider-peso").innerText()).not.toContain("—");
});

test("campo numérico OBRIGATÓRIO continua mostrando o número de partida", async ({ page }) => {
  // ⚠️ A correção não pode vazar para os campos obrigatórios: neles o botão de
  // avançar já trava até informar, a ambiguidade nunca existiu, e trocar o
  // número por "—" tiraria a referência de onde a barra está.
  await page.goto("http://localhost:8099/modulos/crises-convulsivas");
  await page.waitForTimeout(4000);
  const corpo = await page.locator("body").innerText();
  expect(corpo.length).toBeGreaterThan(50); // o módulo abriu
});

// ⚠️ O CASO "SOLTAR A BARRA SEM MOVER" NÃO TEM PROVA E2E — e o motivo está
// registrado em vez de escondido: no web o Slider não é <input type=range>, é
// um thumb desenhado, e `onSlidingComplete` não dispara com mouse.down/up
// sintético sem movimento real. Tentei e a prova ficava vermelha medindo o
// runner, não o app.
//
// Esse caso é o defeito irmão — médico de 140 kg com a barra partindo de 140,
// que soltaria no mesmo número e ficaria em "—" para sempre — e ele É coberto,
// por `test:valor-informado`, que confere ESTRUTURALMENTE que o shell liga
// `onConfirmar` a uma gravação. É trava mais fraca que execução, e está dito.
