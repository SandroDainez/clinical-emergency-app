import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, dispensarAcoesDaPiora, fixarIdioma, preencherNihssComSoma, responderPopulacaoAdulta } from "./helpers";

/**
 * 13ª rodada (autor, 2026-09-13, opção A): contrato de navegação com destinos
 * indisponíveis (C05), via aérea como conduta externa (A09) ⛔ e "Sem essa informação"
 * por marco (A04). ⛔ Nenhum botão simula execução; ⛔ nenhum conteúdo clínico novo.
 */

async function abrir(page: Page, idioma: "pt-BR" | "es-419" = "pt-BR") {
  await fixarIdioma(page, idioma);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

async function rolagem(page: Page, definir?: number): Promise<number> {
  return page.evaluate((y) => {
    let n = document.querySelector('[data-testid^="avc-superficie-"]') as HTMLElement | null;
    while (n && !(n.scrollHeight > n.clientHeight && /auto|scroll/.test(getComputedStyle(n).overflowY))) n = n.parentElement;
    if (!n) return -1;
    if (y !== undefined) { n.scrollTop = y; n.dispatchEvent(new Event("scroll")); }
    return n.scrollTop;
  }, definir);
}

async function chamarViaAerea(page: Page): Promise<number> {
  await page.getByTestId("avc-aba-estabilizacao").click();
  await abrirEixosDaEstabilizacao(page);
  const botao = page.getByTestId("avc-chamar-modulo-via_aerea");
  await botao.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const y = await rolagem(page);
  await botao.click();
  await expect(page.getByTestId("avc-modulo-indisponivel-via_aerea")).toBeVisible();
  return y;
}

const EXECUCAO = /\b(Intubar|Iniciar intubação|Executar|Administrar|Sedar|Aplicar)\b/;

test.describe("AVC · 13ª rodada · contrato de navegação ⛔ via aérea externa", () => {
  test("A09 completo: basal, chamada, registro, cuidados associados aninhados, retorno à origem com rolagem, suporte ativo, eixo A, basal preservado", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-neurologico").click();
    await preencherNihssComSoma(page, 4);

    const y = await chamarViaAerea(page);
    expect(y, "⛔ a origem ⛔ estava rolada — a condição ⛔ foi medida").toBeGreaterThan(200);
    const painel = page.getByTestId("avc-modulo-indisponivel-via_aerea");
    await expect(painel).toContainText("indisponível neste app");
    expect(await painel.innerText(), "⛔ o painel simula execução").not.toMatch(EXECUCAO);

    await page.getByTestId("avc-va-va_avancada-sim").click();
    await page.getByTestId("avc-va-va_tipo-Intubação orotraqueal").click();
    await page.getByTestId("avc-va-hora-agora").click();
    await page.getByTestId("avc-va-quem").fill("Dr. Plantão");
    await page.getByTestId("avc-va-va_sedacao-sim").click();
    await page.getByTestId("avc-va-va_ventilacao-sim").click();
    await page.getByTestId("avc-va-registrar").click();
    await expect(page.getByTestId("avc-va-registrado")).toBeVisible();

    await page.getByTestId("avc-chamar-modulo-ventilacao").click();
    await expect(page.getByTestId("avc-modulo-indisponivel-ventilacao"), "⛔ cuidado associado ⛔ abriu").toBeVisible();
    await expect(page.getByTestId("avc-modulo-pilha")).toContainText("Via aérea");
    await page.getByTestId("avc-modulo-voltar").click();
    await expect(page.getByTestId("avc-modulo-indisponivel-via_aerea"), "⛔ o retorno aninhado ⛔ voltou à via aérea").toBeVisible();
    await page.getByTestId("avc-modulo-voltar").click();

    await expect(page.getByTestId("avc-superficie-estabilizacao"), "⛔ ⛔ voltou ao AVC").toBeVisible();
    await expect.poll(() => rolagem(page), { message: "⛔ a rolagem da origem ⛔ foi preservada" }).toBeGreaterThan(y - 80);
    const retorno = page.getByTestId("avc-retorno-modulo");
    await expect(retorno).toContainText(/intubado às \d{2}:\d{2}/);
    await expect(retorno).toContainText("Resposta não medida no módulo");
    await expect(page.getByTestId("avc-suporte-ativo"), "⛔ cabeçalho sem suporte ativo").toContainText(/intubado às \d{2}:\d{2} · sedação em curso/);
    await expect(page.getByTestId("avc-ameaca-intervencao-via_aerea")).toContainText("Intervenção registrada · reavaliação pendente");

    await page.getByTestId("avc-aba-neurologico").click();
    await expect(page.getByTestId("avc-b-exames-nihss")).toContainText("anterior à sedação — basal preservado");
    await expect(page.getByTestId("avc-escala-sugestao-un-10").or(page.getByTestId("avc-b-sugestao-un-10")), "⛔ UN por intubação ⛔ sugerido").toHaveCount(1);
    await preencherNihssComSoma(page, 9);
    await expect(page.getByTestId("avc-b-exames-nihss")).toContainText("sob sedação — confundidor");
    await expect(page.getByTestId("avc-b-exames-nihss")).toContainText("anterior à sedação — basal preservado");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-situacao-nihss"), "⛔ o exame sob sedação substituiu o basal").toContainText("NIHSS 4");
  });

  test("«não sei» em cada campo mantém pendência, no retorno ⛔ na lista do atendimento", async ({ page }) => {
    await abrir(page);
    await chamarViaAerea(page);
    for (const c of ["va_avancada", "va_tipo", "va_sedacao", "va_ventilacao"]) {
      await page.getByTestId(`avc-va-${c}-nao_sei`).click();
    }
    await page.getByTestId("avc-va-hora-nao-sei").click();
    await page.getByTestId("avc-va-registrar").click();
    await page.getByTestId("avc-modulo-voltar").click();
    await expect(page.getByTestId("avc-retorno-modulo")).toContainText("Pendências");
    for (const c of ["va_avancada", "va_tipo", "va_hora", "va_sedacao", "va_ventilacao"]) {
      await expect(page.locator(`[data-testid^="avc-pendencia-"][data-testid$="${c}"]`), `⛔ «não sei» em ${c} sem pendência`).toHaveCount(1);
    }
  });

  test("cancelamento no meio: volta à origem, pilha vazia, ⛔ e o que foi registrado fica na trilha", async ({ page }) => {
    await abrir(page);
    await chamarViaAerea(page);
    await page.getByTestId("avc-va-quem").fill("Dr. Plantão");
    await page.getByTestId("avc-va-registrar").click();
    await page.getByTestId("avc-chamar-modulo-sedoanalgesia").click();
    await expect(page.getByTestId("avc-modulo-indisponivel-sedoanalgesia")).toBeVisible();
    await page.getByTestId("avc-modulo-cancelar").click();
    await expect(page.getByTestId("avc-modulo-indisponivel-via_aerea"), "⛔ cancelar o aninhado ⛔ voltou à via aérea").toBeVisible();
    await page.getByTestId("avc-modulo-cancelar").click();
    await expect(page.getByTestId("avc-superficie-estabilizacao")).toBeVisible();
    await expect(page.getByTestId("avc-retorno-modulo")).toContainText("Chamada cancelada");
    await expect(page.locator('[data-testid^="avc-modulo-indisponivel"]')).toHaveCount(0);
  });

  test("fechar ⛔ reabrir no meio da intervenção: o painel volta com a pilha", async ({ page }) => {
    await abrir(page);
    await chamarViaAerea(page);
    await page.getByTestId("avc-va-va_avancada-sim").click();
    await page.getByTestId("avc-va-registrar").click();
    await page.getByTestId("avc-chamar-modulo-ventilacao").click();
    await expect(page.getByTestId("avc-modulo-indisponivel-ventilacao")).toBeVisible();
    await page.waitForTimeout(600);
    await page.reload();
    await expect(page.getByTestId("avc-modulo-indisponivel-ventilacao"), "⛔ reabrir perdeu a intervenção em andamento").toBeVisible({ timeout: 30_000 });
    await page.getByTestId("avc-modulo-voltar").click();
    await expect(page.getByTestId("avc-modulo-indisponivel-via_aerea")).toBeVisible();
  });

  test("«Paciente piorou» a partir do painel de indisponível: piora registrada, intervenção continua na pilha", async ({ page }) => {
    await abrir(page);
    await chamarViaAerea(page);
    await expect(page.getByTestId("avc-piorou")).toBeInViewport();
    await page.getByTestId("avc-piorou").click();
    await page.getByTestId("avc-piorou-registrar").click();
    /** ⚠️ D-140: a tela de ações abre por cima ⛔ e é dispensada antes de seguir. */
    await dispensarAcoesDaPiora(page);
    await expect(page.getByTestId("avc-prioridade-reavaliar")).toBeVisible();
    const andamento = page.getByTestId("avc-chamada-em-andamento");
    await expect(andamento, "⛔ a piora apagou a intervenção em andamento").toContainText("Via aérea");
    await page.getByTestId("avc-chamada-voltar").click();
    await expect(page.getByTestId("avc-modulo-indisponivel-via_aerea")).toBeVisible();
  });

  test("Cronologia: «Sem essa informação» por marco; última vez bem desconhecida abre o caminho de início desconhecido (A04)", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-neurologico").click();
    for (const c of ["hora_chegada", "hora_ultima_vez_bem"]) {
      await expect(page.getByTestId(`avc-marco-${c}`).getByTestId(`avc-hora-desconhecido-${c}`), `⛔ «Sem essa informação» fora do marco ${c}`).toHaveCount(1);
    }
    await page.getByTestId("avc-hora-desconhecido-hora_chegada").click();
    await expect(page.getByTestId("avc-b-caminho-inicio-desconhecido"), "⛔ não saber a CHEGADA ⛔ é início desconhecido").toHaveCount(0);
    await page.getByTestId("avc-hora-desconhecido-hora_ultima_vez_bem").click();
    const caminho = page.getByTestId("avc-b-caminho-inicio-desconhecido");
    await expect(caminho).toContainText("não é substituído pela hora da descoberta");
    /**
     * ⚠️ Ajuste de instrumento (13ª rodada, antes do verde): o cartão da recomendação só
     * entra nas faixas da Reperfusão quando falta pouco para fechar. ⚠️ O caminho é medido
     * no próprio cartão A04: a recomendação existente ⛔ e o toque que leva a cada dado.
     */
    await expect(caminho).toContainText("início desconhecido, com RM-DWI/FLAIR compatível");
    await page.getByTestId("avc-b-caminho-ivt_inicio_desconhecido-exige-dwi_menor_que_um_terco").click();
    await expect(page.getByTestId("avc-superficie-imagem"), "⛔ o dado exigido ⛔ abriu").toBeVisible();
    await page.getByTestId("avc-aba-neurologico").click();
    await page.getByTestId("avc-b-abrir-inicio-desconhecido").click();
    await expect(page.getByTestId("avc-superficie-reperfusao")).toBeVisible();
  });

  test("ES · painel indisponível, suporte ativo ⛔ caminho de início desconhecido em espanhol", async ({ page }) => {
    await abrir(page, "es-419");
    await chamarViaAerea(page);
    await expect(page.getByTestId("avc-modulo-indisponivel-via_aerea")).toContainText("no disponible en esta app");
    await page.getByTestId("avc-va-va_avancada-sim").click();
    await page.getByTestId("avc-va-hora-agora").click();
    await page.getByTestId("avc-va-registrar").click();
    await page.getByTestId("avc-modulo-voltar").click();
    await expect(page.getByTestId("avc-suporte-ativo")).not.toContainText("intubado às");
  });
});
