import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, preencherNihssComSoma, responderPopulacaoAdulta } from "./helpers";

/**
 * 14ª rodada (autor, 2026-09-13): via aérea avançada com definitiva pelo tipo (AC-76), NIHSS
 * sob sedação como contexto (AC-77), marca de sedação no Glasgow (AC-78), os dois caminhos
 * do cartão A04, leve ≠ incapacitante ⛔ e o plano até 48 h (T08, C08).
 * ⛔ Nenhum conteúdo clínico novo: o gesto real ⛔ e a palavra exibida.
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

async function registrarViaAerea(page: Page, tipo: string) {
  await page.getByTestId("avc-aba-estabilizacao").click();
  await abrirEixosDaEstabilizacao(page);
  await page.getByTestId("avc-chamar-modulo-via_aerea").click();
  await page.getByTestId("avc-va-va_avancada-sim").click();
  await page.getByTestId(`avc-va-va_tipo-${tipo}`).click();
  await page.getByTestId("avc-va-hora-agora").click();
  await page.getByTestId("avc-va-va_sedacao-sim").click();
  await page.getByTestId("avc-va-registrar").click();
  await page.getByTestId("avc-modulo-voltar").click();
  await expect(page.getByTestId("avc-superficie-estabilizacao")).toBeVisible();
}

async function registrarIvt(page: Page) {
  await page.getByTestId("avc-aba-reperfusao").click();
  await page.getByTestId("avc-nova-trombolise").click();
  await page.getByTestId("avc-opcao-ivt_estado-Realizada").click();
  await informarHora(page, "ivt_inicio");
}

test.describe("AVC · 14ª rodada · via aérea avançada, sedação ⛔ plano até 48 h", () => {
  test("AC-76: supraglótico → «dispositivo supraglótico às HH:MM (não definitiva)»; IOT → «intubado às»", async ({ page }) => {
    await abrir(page);
    await registrarViaAerea(page, "Dispositivo supraglótico");
    await expect(page.getByTestId("avc-suporte-ativo")).toContainText(/dispositivo supraglótico às \d{2}:\d{2} \(não definitiva\)/);
    await expect(page.getByTestId("avc-suporte-ativo")).not.toContainText("intubado");
    await page.getByTestId("avc-aba-neurologico").click();
    await expect(page.getByTestId("avc-b-sugestao-un-10"), "⛔ item 10 ⛔ sugerido no supraglótico").toBeVisible();
  });

  test("AC-77: único NIHSS sob sedação → inconclusivo com avaliação especializada; «sedação suspensa = sim» → avaliado ⛔ marcado", async ({ page }) => {
    await abrir(page);
    await registrarViaAerea(page, "Intubação orotraqueal");
    await page.getByTestId("avc-aba-neurologico").click();
    await preencherNihssComSoma(page, 8);
    const bloco = page.getByTestId("avc-b-exames-nihss");
    await expect(bloco).toContainText("sob sedação");
    await expect(page.getByTestId("avc-b-nihss-inconclusivo-sedacao")).toContainText("inconclusivo — exame sob sedação; avaliação especializada");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-situacao-nihss"), "⛔ o exame sob sedação virou número").not.toContainText("NIHSS 8");
    await expect(page.getByTestId("avc-g-situacao-nihss")).toContainText("sob sedação");

    await page.getByTestId("avc-aba-neurologico").click();
    await page.locator('[data-testid^="avc-b-exame-sedacao-suspensa-"][data-testid$="-sim"]').first().click();
    await expect(bloco).toContainText("sedação suspensa para o exame");
    await expect(page.getByTestId("avc-b-nihss-inconclusivo-sedacao")).toHaveCount(0);
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-situacao-nihss"), "⛔ com sedação suspensa o exame ⛔ valeu").toContainText("NIHSS 8");
  });

  test("AC-78: Glasgow depois da via aérea avançada recebe a marca «sob sedação»", async ({ page }) => {
    await abrir(page);
    await registrarViaAerea(page, "Intubação orotraqueal");
    await page.getByTestId("avc-glasgow-abrir").click();
    for (const [item, pontos] of [["e", 1], ["v", 1], ["m", 4]] as const) {
      await page.getByTestId(`avc-glasgow-${item}-${pontos}`).click();
    }
    await page.getByTestId("avc-glasgow-usar").click();
    await expect(page.getByTestId("avc-a-exames-glasgow")).toContainText(/Glasgow 6 · \d{2}:\d{2} · sob sedação/);
  });

  test("A04: última vez bem desconhecida oferece os DOIS caminhos de §4.6.3, cada um com os dados que exige", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-neurologico").click();
    await page.getByTestId("avc-hora-desconhecido-hora_ultima_vez_bem").click();
    const rm = page.getByTestId("avc-b-caminho-ivt_inicio_desconhecido");
    const perfusao = page.getByTestId("avc-b-caminho-ivt_wakeup_ou_45_9");
    await expect(rm).toContainText("RM-DWI/FLAIR");
    await expect(perfusao).toContainText("perfusão automatizada");
    await expect(page.getByTestId("avc-b-caminho-ivt_wakeup_ou_45_9-exige-nao_elegivel_a_evt")).toContainText("F-31");
    await page.getByTestId("avc-b-caminho-ivt_wakeup_ou_45_9-exige-penumbra_por_perfusao_automatizada").click();
    await expect(page.getByTestId("avc-superficie-imagem"), "⛔ o dado de perfusão ⛔ abriu").toBeVisible();
  });

  test("leve ⛔ e incapacitante são perguntas distintas: responder uma ⛔ responde a outra", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-neurologico").click();
    const leve = page.getByTestId("avc-opcao-deficit_leve-Leve");
    await leve.scrollIntoViewIfNeeded();
    await leve.click();
    await expect(leve).toHaveAttribute("aria-checked", "true");
    /** ⚠️ Ajuste de instrumento (vermelho de `16b92ac`): «Incerto» grava `nao_sei` — é esse o id da opção. */
    for (const op of ["Incapacitante", "Não incapacitante", "nao_sei"]) {
      await expect(page.getByTestId(`avc-opcao-incapacitante_assumido-${op}`), `⛔ «Leve» marcou «${op}»`).toHaveAttribute("aria-checked", "false");
    }
  });

  test("plano · trombólise: agenda com «Próxima reavaliação», imagem de controle, antitrombótico retido (A15) ⛔ aviso de notificação", async ({ page }) => {
    await abrir(page);
    await registrarIvt(page);
    await page.getByTestId("avc-aba-destino").click();
    const plano = page.getByTestId("avc-plano-48h");
    await plano.scrollIntoViewIfNeeded();
    await expect(page.getByTestId("avc-plano-caminho-ivt")).toBeVisible();
    await expect(page.getByTestId("avc-plano-proxima-reavaliacao")).toContainText(/Próxima reavaliação: \d{2}:\d{2} \(em 1[3-5] min\)/);
    await expect(page.getByTestId("avc-plano-agenda")).toContainText("Imagem de controle");
    await expect(page.getByTestId("avc-plano-tarefa-ivt_antitromboticos")).toContainText("retida");
    await expect(page.getByTestId("avc-plano-tarefa-degluticao")).toContainText("conteúdo pendente de validação");
    await expect(page.getByTestId("avc-plano-sem-notificacao")).toBeVisible();
    expect(await plano.innerText(), "⛔ o plano libera por tempo").not.toMatch(/liberad|pode iniciar|autorizad/i);
  });

  test("plano · quatro caminhos com agendas diferentes (trombectomia, não reperfundir, hemorragia)", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-plano-sem-evento")).toBeVisible();
    await page.getByTestId("avc-plano-48h").scrollIntoViewIfNeeded();
    await informarHora(page, "evt_fim");
    const evt = page.getByTestId("avc-plano-caminho-evt");
    await expect(evt).toContainText("Monitorização pós-trombectomia");
    await expect(page.getByTestId("avc-plano-proxima-reavaliacao")).toContainText("sem intervalo transcrito");
    const textoEvt = await evt.innerText();

    /** ⚠️ Ajuste consciente (15ª rodada, AC-85): sem reperfusão abre pelos dois desfechos — aqui, a decisão global. */
    await page.getByTestId("avc-aba-reperfusao").click();
    await page.getByTestId("avc-f-decisao-global").scrollIntoViewIfNeeded();
    await page.getByTestId("avc-f-decisao-global").click();
    await page.getByTestId("avc-f-decisao-global-motivo-Decisão da equipe / limitação terapêutica").click();
    await page.getByTestId("avc-f-decisao-global-agora").click();
    await page.getByTestId("avc-aba-destino").click();
    const semRep = page.getByTestId("avc-plano-caminho-sem_reperfusao");
    await expect(semRep).toBeVisible();
    expect(await semRep.innerText()).not.toBe(textoEvt);

    await page.getByTestId("avc-aba-imagem").click();
    await page.getByTestId("avc-novo-estudo").click();
    await page.getByTestId("avc-opcao-estudo_modalidade-Tomografia de crânio sem contraste").click();
    await informarHora(page, "estudo_hora");
    await page.getByTestId("avc-opcao-estudo_resultado-Hemorragia intracraniana identificada").click();
    await page.getByTestId("avc-aba-destino").click();
    const hem = page.getByTestId("avc-plano-caminho-hemorragia");
    await expect(hem).toContainText("caminho próprio da hemorragia");
    await expect(page.getByTestId("avc-plano-tarefa-hemorragia_antitromboticos")).toContainText("retida");
  });

  test("plano · atraso com o relógio andando ⛔ deterioração que antecipa", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-09-13T10:00:00") });
    await abrir(page);
    await registrarIvt(page);
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-plano-proxima-reavaliacao")).toContainText("(em 1");
    await page.clock.fastForward("30:00");
    await page.getByTestId("avc-aba-neurologico").click();
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-plano-proxima-reavaliacao"), "⛔ atraso ⛔ dito").toContainText(/atrasada há 1[5-7] min/);
    await page.getByTestId("avc-piorou").click();
    await page.getByTestId("avc-piorou-registrar").click();
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-plano-proxima-reavaliacao")).toContainText("agora — antecipada por piora");
  });

  test("plano · cancelamento: trombólise cancelada antes do início ⛔ abre caminho; fim da trombectomia desfeito encerra o caminho ⛔ tira as tarefas da agenda", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-reperfusao").click();
    await page.getByTestId("avc-nova-trombolise").click();
    await page.getByTestId("avc-opcao-ivt_estado-Cancelada").click();
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-plano-caminho-ivt"), "⛔ trombólise cancelada abriu caminho").toHaveCount(0);
    await expect(page.getByTestId("avc-plano-encerrado-ivt")).toContainText("cancelada antes do início");

    await page.getByTestId("avc-plano-48h").scrollIntoViewIfNeeded();
    await informarHora(page, "evt_fim");
    await expect(page.getByTestId("avc-plano-caminho-evt")).toBeVisible();
    /**
     * ⚠️ Ajuste de instrumento (1ª execução no build da rodada): o campo de hora ⛔ tem «Limpar» com horário
     * gravado (D-PEND-19: «Limpar» só desfaz «Sem essa informação»). ⚠️ O gesto real de desfazer o evento é
     * «Sem essa informação» → «Limpar» — declarado como achado da 14ª rodada.
     */
    await page.getByTestId("avc-hora-desconhecido-evt_fim").click();
    await expect(page.getByTestId("avc-plano-caminho-evt")).toContainText("horário desconhecido");
    await page.getByTestId("avc-limpar-evt_fim").click();
    await expect(page.getByTestId("avc-plano-caminho-evt")).toHaveCount(0);
    await expect(page.getByTestId("avc-plano-encerrado-evt")).toContainText("encerrado");
    await expect(page.locator('[data-testid^="avc-plano-tarefa-evt_"]')).toHaveCount(0);
  });

  test.describe("fuso de Tóquio", () => {
    test.use({ timezoneId: "Asia/Tokyo" });
    test("plano · fuso: o intervalo até a próxima reavaliação ⛔ muda com o fuso do aparelho", async ({ page }) => {
      await abrir(page);
      await registrarIvt(page);
      await page.getByTestId("avc-aba-destino").click();
      const proxima = page.getByTestId("avc-plano-proxima-reavaliacao");
      await expect(proxima).toContainText(/\(em 1[3-5] min\)/);
      const hhmm = (await proxima.innerText()).match(/(\d{2}):(\d{2})/);
      const esperado = await page.evaluate(() => {
        const d = new Date(Date.now() + 14 * 60_000);
        return d.getHours() * 60 + d.getMinutes();
      });
      expect(hhmm, "⛔ sem horário").not.toBeNull();
      const mostrado = Number(hhmm![1]) * 60 + Number(hhmm![2]);
      expect(Math.abs(mostrado - esperado), "⛔ o horário exibido ⛔ é o do fuso do aparelho").toBeLessThanOrEqual(2);
    });
  });

  test("ES · suporte por tipo, caminhos A04 ⛔ plano em espanhol", async ({ page }) => {
    await abrir(page, "es-419");
    await registrarViaAerea(page, "Dispositivo supraglótico");
    await expect(page.getByTestId("avc-suporte-ativo")).toContainText("(no definitiva)");
    await registrarIvt(page);
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-plano-proxima-reavaliacao")).toContainText("Próxima reevaluación");
    /** ⚠️ Ajuste de instrumento: "segundo plano" também é espanhol — mede-se a frase ES. */
    await expect(page.getByTestId("avc-plano-sem-notificacao")).toContainText("Sin aviso");
  });
});
