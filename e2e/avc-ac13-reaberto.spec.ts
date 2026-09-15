/**
 * AC-13 REABERTO (autor, 2026-09-14; `docs/decisoes.md`, seção "AC-13 reaberto"), pelo gesto do médico.
 *
 * Item 1: «Não sei» na situação da trombólise não pode aparecer como "sem trombólise". A tela declara
 * a exposição desconhecida e preserva a conduta atual: a conduta final diante dela ainda não foi decidida.
 */
import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, registrarMarcoAgora, responderPopulacaoAdulta } from "./helpers";

async function tromboliseCom(page: Page, ...rotulos: string[]) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-reperfusao").click();
  await page.getByTestId("avc-nova-trombolise").click();
  for (const r of rotulos) await page.getByTestId(`avc-opcao-ivt_estado-${r}`).click();
}

test.describe("AVC · AC-13 reaberto · item 1 · exposição desconhecida", () => {
  test("«Não sei» → o Destino declara a exposição desconhecida, sem monitorização nem ordem pós-trombólise", async ({ page }) => {
    await tromboliseCom(page, "nao_sei");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-situacao-trombolise-desconhecida")).toBeVisible();
    await expect(page.getByTestId("avc-g-exposicao-desconhecida")).toBeVisible();
    await expect(page.getByTestId("avc-g-monitorizacao")).toHaveCount(0);
    await expect(page.getByTestId("avc-g-antitrombotico-ordem")).toHaveCount(0);
  });

  test("«Iniciada» e depois «Não sei» → continua exposta: a monitorização pós-trombólise aparece", async ({ page }) => {
    await tromboliseCom(page, "Iniciada", "nao_sei");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-monitorizacao")).toBeVisible();
    await expect(page.getByTestId("avc-g-exposicao-desconhecida")).toHaveCount(0);
  });

  test("«Não sei» com o portão fechado → a Reperfusão declara a situação desconhecida", async ({ page }) => {
    await tromboliseCom(page, "nao_sei");
    await expect(page.getByTestId("avc-f-exposicao-desconhecida")).toBeVisible();
  });

  test("«Não sei» com PA acima da meta → os alvos pressóricos declaram a exposição desconhecida", async ({ page }) => {
    await tromboliseCom(page, "nao_sei");
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    for (const [id, v] of [["pas", "200"], ["pad", "120"]] as const) {
      const c = page.getByTestId(`avc-num-caixa-${id}`);
      await c.fill(v);
      await c.blur();
    }
    await expect(page.getByTestId("avc-a-alvos-exposicao-desconhecida")).toBeVisible();
  });
});

test.describe("AVC · AC-13 reaberto · item 2 · a trilha fiel", () => {
  test("«Iniciada» e «Limpar» → a trilha mostra a limpeza, nenhuma situação vigente, e a exposição continua", async ({ page }) => {
    await tromboliseCom(page, "Iniciada");
    await page.getByTestId("avc-limpar-ivt_estado").click();
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-0")).toContainText("Iniciada");
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-1")).toContainText("Campo limpo");
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1")).not.toContainText("situação vigente");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-monitorizacao")).toBeVisible();
  });

  test("«Iniciada» e «Foi engano — corrigir» na trilha → o registro fica invalidado e o Destino declara a exposição desconhecida", async ({ page }) => {
    await tromboliseCom(page, "Iniciada");
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    await page.getByTestId("avc-transicoes-corrigir-trombolise_iv_1-0").click();
    await page.getByTestId("avc-confirmar-engano-sim").click();
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-0")).toContainText("invalidado por correção");
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-1")).toContainText("registrado por engano");
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1")).not.toContainText("situação vigente");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-exposicao-desconhecida")).toBeVisible();
    await expect(page.getByTestId("avc-g-monitorizacao")).toHaveCount(0);
  });

  test("«Manter o registro» no diálogo ⛔ muda nada", async ({ page }) => {
    await tromboliseCom(page, "Iniciada");
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    await page.getByTestId("avc-transicoes-corrigir-trombolise_iv_1-0").click();
    await page.getByTestId("avc-confirmar-engano-manter").click();
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-1")).toHaveCount(0);
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-0")).toContainText("situação vigente");
  });
});

test.describe("AVC · AC-13 reaberto · item 5 · retrocesso", () => {
  test("«Iniciada» e depois «Prescrita» → pede confirmação; «Não registrar» ⛔ grava nada", async ({ page }) => {
    await tromboliseCom(page, "Iniciada");
    await page.getByTestId("avc-opcao-ivt_estado-Prescrita").click();
    const dialogo = page.getByTestId("avc-confirmar-ordem");
    await expect(dialogo).toBeVisible();
    await expect(dialogo).toContainText("Prescrita");
    await expect(dialogo).toContainText("Iniciada");
    await page.getByTestId("avc-confirmar-ordem-cancelar").click();
    await expect(dialogo).toHaveCount(0);
    await expect(page.getByTestId("avc-transicoes-abrir-trombolise_iv_1")).toContainText("(1)");
  });

  test("«Iniciada», «Prescrita» e «Registrar como correção» → a trilha marca a correção fora da ordem e a exposição continua", async ({ page }) => {
    await tromboliseCom(page, "Iniciada");
    await page.getByTestId("avc-opcao-ivt_estado-Prescrita").click();
    await page.getByTestId("avc-confirmar-ordem-corrigir").click();
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    const nova = page.getByTestId("avc-transicoes-trombolise_iv_1-1");
    await expect(nova).toContainText("Prescrita");
    await expect(nova).toContainText("fora da ordem causal");
    await expect(nova).toContainText("registrado como correção");
    await expect(nova).toContainText("situação vigente");
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-0")).not.toContainText("fora da ordem causal");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-monitorizacao")).toBeVisible();
  });

  test("avanço na ordem ⛔ pede confirmação", async ({ page }) => {
    await tromboliseCom(page, "Prescrita", "Iniciada");
    await expect(page.getByTestId("avc-confirmar-ordem")).toHaveCount(0);
    await expect(page.getByTestId("avc-transicoes-abrir-trombolise_iv_1")).toContainText("(2)");
  });
});

test.describe("AVC · AC-13 reaberto · item 6 · toque repetido", () => {
  test("«Iniciada» tocada duas vezes → a trilha fica com uma transição", async ({ page }) => {
    await tromboliseCom(page, "Iniciada", "Iniciada");
    await expect(page.getByTestId("avc-transicoes-abrir-trombolise_iv_1")).toContainText("(1)");
  });

  test("«Iniciada», «Limpar» e «Iniciada» de novo → três linhas: marcar de novo não é duplicação", async ({ page }) => {
    await tromboliseCom(page, "Iniciada");
    await page.getByTestId("avc-limpar-ivt_estado").click();
    await page.getByTestId("avc-opcao-ivt_estado-Iniciada").click();
    await expect(page.getByTestId("avc-transicoes-abrir-trombolise_iv_1")).toContainText("(3)");
  });
});

test.describe("AVC · AC-13 reaberto · item 5 · estados terminais", () => {
  test("«Cancelada» e depois «Iniciada» → pede confirmação; confirmada, a trilha marca a reabertura fora da ordem", async ({ page }) => {
    await tromboliseCom(page, "Cancelada");
    await page.getByTestId("avc-opcao-ivt_estado-Iniciada").click();
    const dialogo = page.getByTestId("avc-confirmar-ordem");
    await expect(dialogo).toBeVisible();
    await expect(dialogo).toContainText("Cancelada");
    await page.getByTestId("avc-confirmar-ordem-corrigir").click();
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-1")).toContainText("fora da ordem causal");
  });

  test("«Administrada/concluída» e depois «Interrompida» → pede confirmação; «Não registrar» não grava nada", async ({ page }) => {
    await tromboliseCom(page, "Administrada/concluída");
    await page.getByTestId("avc-opcao-ivt_estado-Interrompida").click();
    await expect(page.getByTestId("avc-confirmar-ordem")).toBeVisible();
    await page.getByTestId("avc-confirmar-ordem-cancelar").click();
    await expect(page.getByTestId("avc-transicoes-abrir-trombolise_iv_1")).toContainText("(1)");
  });
});

test.describe("AVC · AC-13 reaberto · item 3 · horário clínico", () => {
  test("«Administrada/concluída» → a trilha separa horário clínico não informado do horário do registro; «Horário desconhecido» resolve", async ({ page }) => {
    await tromboliseCom(page, "Administrada/concluída");
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    const linha = page.getByTestId("avc-transicoes-trombolise_iv_1-0");
    await expect(linha).toContainText("Horário clínico não informado");
    await expect(linha).toContainText("Registrado às");
    await page.getByTestId("avc-horario-clinico-desconhecido-trombolise_iv_1-0").click();
    await expect(linha).toContainText("Horário clínico desconhecido");
    await expect(linha).not.toContainText("Horário clínico não informado");
  });

  test("«Iniciada» e «Interrompida» → «Informar horário» grava o horário clínico ligado à interrupção", async ({ page }) => {
    await tromboliseCom(page, "Iniciada", "Interrompida");
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    await page.getByTestId("avc-horario-clinico-informar-trombolise_iv_1-1").click();
    await page.getByTestId("avc-seletor-hora-agora").click();
    await page.getByTestId("avc-seletor-hora-confirmar").click();
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-1")).toContainText(/Horário clínico: .*\d{2}:\d{2}/);
  });

  test("«Iniciada» → o horário clínico vem só do início da administração; declarar o início desconhecido resolve", async ({ page }) => {
    await tromboliseCom(page, "Iniciada");
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    const linha = page.getByTestId("avc-transicoes-trombolise_iv_1-0");
    await expect(linha).toContainText("Horário clínico não informado");
    await expect(page.getByTestId("avc-horario-clinico-informar-trombolise_iv_1-0")).toHaveCount(0);
    await page.getByTestId("avc-hora-desconhecido-ivt_inicio").click();
    await expect(linha).toContainText("Horário clínico desconhecido");
  });

  test("«Indicada» não pede horário clínico; «Prescrita» aceita horário opcional", async ({ page }) => {
    await tromboliseCom(page, "Indicada", "Prescrita");
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-0")).not.toContainText("Horário clínico");
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-0")).toContainText("Registrado às");
    await expect(page.getByTestId("avc-horario-clinico-informar-trombolise_iv_1-1")).toBeVisible();
  });
});

test.describe("AVC · AC-13 reaberto · item 4 · autoria", () => {
  test("sem conta, a trilha diz «Autoria não identificada» e nunca mostra identificador técnico", async ({ page }) => {
    await tromboliseCom(page, "Iniciada");
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    const linha = page.getByTestId("avc-transicoes-trombolise_iv_1-0");
    await expect(linha).toContainText("Autoria não identificada");
    await expect(linha).not.toContainText("local:");
    await expect(linha).not.toContainText("sem conta");
    await expect(linha).not.toContainText(/respons/i);
  });

  test("a linha do tempo do Destino mostra a autoria da piora pela mesma regra", async ({ page }) => {
    await tromboliseCom(page, "Administrada/concluída");
    await page.getByTestId("avc-aba-destino").click();
    await page.getByTestId("avc-piorou").click();
    await page.getByTestId("avc-piorou-texto").fill("rebaixou o nível de consciência");
    await page.getByTestId("avc-piorou-registrar").click();
    await page.getByTestId("avc-aba-destino").click();
    const autoria = page.getByTestId("avc-g-linha-do-tempo").locator('[data-testid^="avc-g-tempo-autoria-"]');
    await expect(autoria.first()).toHaveText("Autoria não identificada");
  });

  test("os marcos da transferência mostram a autoria pela mesma regra", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    await responderPopulacaoAdulta(page);
    await page.getByTestId("avc-aba-destino").click();
    await registrarMarcoAgora(page, "Solicitada");
    const autoria = page.getByTestId("avc-g-marcos").locator('[data-testid^="avc-g-marco-autoria-"]');
    await expect(autoria.first()).toHaveText("Autoria não identificada");
  });
});
