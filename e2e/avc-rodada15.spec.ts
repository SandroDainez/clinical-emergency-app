import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, preencherNihssComSoma, responderPopulacaoAdulta } from "./helpers";

/**
 * 15ª rodada (autor, 2026-09-13): AC-81, AC-82, AC-83 pela instrução NIH, AC-85 com dois
 * desfechos, AC-88 com resultado ⛔ trava de via oral, defeitos das capturas da 14ª rodada ⛔
 * caminho hemorrágico (A07). ⛔ Nenhum conteúdo clínico novo: o gesto real ⛔ a palavra exibida.
 */

async function abrir(page: Page, idioma: "pt-BR" | "es-419" = "pt-BR") {
  await fixarIdioma(page, idioma);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

async function informarHora(page: Page, campo: string) {
  await page.getByTestId(`avc-hora-${campo}`).click();
  await page.getByTestId("avc-seletor-hora-m-menos").click();
  await page.getByTestId("avc-seletor-hora-confirmar").click();
}

async function registrarViaAerea(page: Page, r: { tipo: string; hora: "agora" | "nao-sei"; sedacao: "sim" | "nao" | "nao_sei" }) {
  await page.getByTestId("avc-aba-estabilizacao").click();
  await abrirEixosDaEstabilizacao(page);
  await page.getByTestId("avc-chamar-modulo-via_aerea").click();
  await page.getByTestId("avc-va-va_avancada-sim").click();
  await page.getByTestId(`avc-va-va_tipo-${r.tipo}`).click();
  await page.getByTestId(`avc-va-hora-${r.hora}`).click();
  await page.getByTestId(`avc-va-va_sedacao-${r.sedacao}`).click();
  await page.getByTestId("avc-va-registrar").click();
  await page.getByTestId("avc-modulo-voltar").click();
  await expect(page.getByTestId("avc-superficie-estabilizacao")).toBeVisible();
}

async function registrarIvt(page: Page, estado: "Realizada" | "Iniciada" = "Realizada") {
  await page.getByTestId("avc-aba-reperfusao").click();
  await page.getByTestId("avc-nova-trombolise").click();
  await page.getByTestId(`avc-opcao-ivt_estado-${estado}`).click();
  await informarHora(page, "ivt_inicio");
}

async function tcComHemorragia(page: Page) {
  await page.getByTestId("avc-aba-imagem").click();
  await page.getByTestId("avc-novo-estudo").click();
  await page.getByTestId("avc-opcao-estudo_modalidade-Tomografia de crânio sem contraste").click();
  await informarHora(page, "estudo_hora");
  await page.getByTestId("avc-opcao-estudo_resultado-Hemorragia intracraniana identificada").click();
}

test.describe("AVC · 15ª rodada · decisões do autor ⛔ caminho hemorrágico", () => {
  test("AC-81: «Outra» → cabeçalho «via aérea avançada às HH:MM (tipo não determinado)»", async ({ page }) => {
    await abrir(page);
    await registrarViaAerea(page, { tipo: "Outra", hora: "agora", sedacao: "sim" });
    await expect(page.getByTestId("avc-suporte-ativo")).toContainText(/via aérea avançada às \d{2}:\d{2} \(tipo não determinado\)/);
  });

  test("AC-82: sem horário da via aérea, o exame pede «informe o horário da via aérea para recuperar o exame basal»", async ({ page }) => {
    await abrir(page);
    await registrarViaAerea(page, { tipo: "Intubação orotraqueal", hora: "nao-sei", sedacao: "sim" });
    await page.getByTestId("avc-aba-neurologico").click();
    await preencherNihssComSoma(page, 5);
    await expect(page.getByTestId("avc-b-exames-nihss")).toContainText("Informe o horário da via aérea para recuperar o exame basal");
    await expect(page.locator('[data-testid="avc-pendencia-recuperar_basal_va_hora"], [data-testid$="-recuperar_basal_va_hora"]').first()).toBeAttached();
  });

  test("AC-83: via aérea sem sedação → lembrete NIH no 1b, sem UN no 1b, UN no 10; exame marcado «com via aérea avançada, sem sedação» ⛔ válido", async ({ page }) => {
    await abrir(page);
    await registrarViaAerea(page, { tipo: "Intubação orotraqueal", hora: "agora", sedacao: "nao" });
    await page.getByTestId("avc-aba-neurologico").click();
    await page.getByTestId("avc-escala-abrir-nihss_calculado").click();
    await expect(page.getByTestId("avc-escala-lembrete-1b")).toContainText("intubado que não fala recebe 1");
    await expect(page.getByTestId("avc-escala-opcao-1b-UN"), "⛔ 1b aceita UN contra a instrução NIH").toHaveCount(0);
    await expect(page.getByTestId("avc-escala-opcao-10-UN")).toHaveCount(1);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await page.getByTestId("avc-aba-neurologico").click();
    await preencherNihssComSoma(page, 7);
    await expect(page.getByTestId("avc-b-exames-nihss")).toContainText("com via aérea avançada, sem sedação");
    await expect(page.getByTestId("avc-b-nihss-inconclusivo-sedacao")).toHaveCount(0);
  });

  test("AC-85: trombólise negativa com trombectomia pendente ⛔ abre sem reperfusão ⛔ nomeia o que falta; a decisão global registra os dois ⛔ abre", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-reperfusao").click();
    const bloco = page.getByTestId("avc-f-desfechos");
    await bloco.scrollIntoViewIfNeeded();
    await page.getByTestId("avc-opcao-ivt_nao_prosseguir_motivo-Sem indicação").click();
    await informarHora(page, "ivt_nao_prosseguir_hora");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-plano-caminho-sem_reperfusao"), "⛔ abriu com a EVT pendente").toHaveCount(0);
    await expect(page.getByTestId("avc-plano-pendencia-sem_reperfusao")).toContainText("trombectomia");

    await page.getByTestId("avc-aba-reperfusao").click();
    await page.getByTestId("avc-f-decisao-global").scrollIntoViewIfNeeded();
    await page.getByTestId("avc-f-decisao-global").click();
    await page.getByTestId("avc-f-decisao-global-motivo-Recusa do paciente ou família").click();
    await page.getByTestId("avc-f-decisao-global-agora").click();
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-plano-caminho-sem_reperfusao")).toBeVisible();
    await expect(page.getByTestId("avc-plano-pendencia-sem_reperfusao")).toHaveCount(0);
  });

  test("AC-88: triagem de deglutição com resultado; reprovada ⛔ mantém «Nada por via oral» no cabeçalho; aprovada tira", async ({ page }) => {
    await abrir(page);
    await registrarIvt(page);
    await expect(page.getByTestId("avc-trava-via-oral")).toContainText("Nada por via oral");
    await page.getByTestId("avc-aba-destino").click();
    const tarefa = page.getByTestId("avc-plano-tarefa-degluticao");
    await tarefa.scrollIntoViewIfNeeded();
    await page.getByTestId("avc-opcao-plano_degluticao-Reprovada").click();
    await expect(page.getByTestId("avc-trava-via-oral")).toContainText("reprovada");
    await page.getByTestId("avc-opcao-plano_degluticao-Aprovada").click();
    await expect(page.getByTestId("avc-trava-via-oral")).toHaveCount(0);
  });

  test("capturas da 14ª rodada: intervalo longo em horas ⛔ agenda que recalcula com a tela parada (AC-89)", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-09-13T10:00:00") });
    await abrir(page);
    await registrarIvt(page);
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-plano-agenda")).toContainText(/em 2[34] h/);
    await expect(page.getByTestId("avc-plano-agenda"), "⛔ minutos crus").not.toContainText(/em \d{3,} min/);
    const antes = await page.getByTestId("avc-plano-proxima-reavaliacao").innerText();
    await page.clock.runFor(2 * 60_000);
    await expect.poll(() => page.getByTestId("avc-plano-proxima-reavaliacao").innerText(), { message: "⛔ a próxima reavaliação ficou parada" }).not.toBe(antes);
  });

  test("A07: hemorragia na imagem abre o caminho próprio: abas reduzidas, IVT/EVT bloqueadas com motivo, tipo, anticoagulante, neurocirurgia, condutas pendentes", async ({ page }) => {
    await abrir(page);
    await tcComHemorragia(page);
    for (const aba of ["estabilizacao", "neurologico", "imagem", "destino"]) await expect(page.getByTestId(`avc-aba-${aba}`)).toBeVisible();
    for (const aba of ["reperfusao", "seguranca", "laboratorio"]) await expect(page.getByTestId(`avc-aba-${aba}`), `⛔ aba ${aba} no caminho hemorrágico`).toHaveCount(0);
    await page.getByTestId("avc-aba-destino").click();
    const caminho = page.getByTestId("avc-hem-caminho");
    await expect(caminho).toBeVisible();
    /** ⚠️ Defeito achado na captura da própria rodada: o título seguia "AVC isquêmico agudo". */
    await expect(page.getByText("AVC isquêmico agudo", { exact: true }), "⛔ título isquêmico no caminho hemorrágico").toHaveCount(0);
    /** ⚠️ Título curto: "… — caminho hemorrágico" truncava a 375 px (captura da rodada). */
    await expect(page.getByText("Hemorragia intracraniana", { exact: true }).first()).toBeVisible();
    await expect(page.getByTestId("avc-hem-bloqueio")).toContainText(/trombólise e trombectomia isquêmicas bloqueadas/i);
    await page.getByTestId("avc-opcao-hem_tipo-Intraparenquimatosa").click();
    await expect(page.getByTestId("avc-hem-anticoagulante")).toContainText("Anticoagulante em uso");
    for (const id of ["reversao_anticoagulante", "alvo_pressorico", "indicacao_cirurgica"]) {
      await expect(page.getByTestId(`avc-hem-conduta-${id}`)).toContainText("conteúdo pendente de validação");
    }
    expect(await caminho.innerText(), "⛔ número clínico no caminho").not.toMatch(/\d+\s*(mg|UI|mmHg|mL)/i);
    await page.getByTestId("avc-g-registrar-neuro-marco").click();
    await page.getByTestId("avc-g-neuro-marco-tipo-Contatada").click();
    await page.getByTestId("avc-g-neuro-marco-agora").click();
    await expect(page.getByTestId("avc-g-neuro-marcos")).toContainText("Contatada");
  });

  test("A07 · complicação: hemorragia depois de trombólise iniciada leva ao mesmo caminho ⛔ pede o registro da interrupção, que fica registrada", async ({ page }) => {
    await abrir(page);
    await registrarIvt(page, "Iniciada");
    await tcComHemorragia(page);
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-hem-caminho")).toBeVisible();
    await expect(page.getByTestId("avc-hem-infusao")).toContainText("Infusão em curso");
    await page.getByTestId("avc-hem-registrar-interrupcao").click();
    await expect(page.getByTestId("avc-hem-infusao")).toContainText(/Infusão interrompida às \d{2}:\d{2}/);
    await expect(page.getByTestId("avc-hem-registrar-interrupcao")).toHaveCount(0);
  });

  test("A07 · troca de idioma no meio: o caminho hemorrágico continua aberto ⛔ passa a espanhol", async ({ page }) => {
    /**
     * ⚠️ Ajuste de instrumento (1ª execução no build da rodada): `fixarIdioma` usa `addInitScript`, que
     * regrava pt-BR a CADA carregamento ⛔ desfazia a escolha feita no hub. ⚠️ Aqui o idioma parte do
     * padrão (pt-BR) ⛔ muda só pelo gesto; o consentimento vem do `storageState` da configuração.
     */
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/modulos/avc");
    await responderPopulacaoAdulta(page);
    await tcComHemorragia(page);
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-hem-caminho")).toBeVisible();
    await page.waitForTimeout(600);
    await page.goto("/");
    await page.getByLabel("Español").first().click();
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-destino").click({ timeout: 30_000 });
    await expect(page.getByTestId("avc-hem-caminho"), "⛔ a troca de idioma perdeu o caminho").toBeVisible();
    await expect(page.getByTestId("avc-hem-conduta-reversao_anticoagulante")).toContainText("contenido pendiente de validación");
    await expect(page.getByTestId("avc-aba-reperfusao")).toHaveCount(0);
  });

  test("ES · trava de via oral ⛔ sem reperfusão em espanhol", async ({ page }) => {
    await abrir(page, "es-419");
    await registrarIvt(page);
    await expect(page.getByTestId("avc-trava-via-oral")).toContainText("Nada por vía oral");
  });
});
