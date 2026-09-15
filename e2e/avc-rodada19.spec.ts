import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * 19ª rodada (autor, 2026-09-14; `docs/decisoes.md`, C7 ⛔ D8): o julgamento registrado no motivo do portão da IVT.
 * ⚠️ O gesto real: DOAC com hora da última dose desconhecida → «Não prosseguir» → o portão nomeia a DECISÃO
 * (⛔ contraindicação) → «Prosseguir» é novo registro ⛔ e retira ⛔ só o motivo do DOAC.
 */

async function doacSemHora(page: Page, idioma: "pt-BR" | "es-419" = "pt-BR") {
  await fixarIdioma(page, idioma);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await expect(page.getByTestId("avc-superficie-paciente-conteudo")).toBeVisible();
  await page.getByTestId("avc-item-anticoagulante_em_uso-Anticoagulante oral direto (DOAC)").click();
  await page.getByTestId("avc-hora-desconhecido-doac_ultima_dose").click();
  await page.getByTestId("avc-aba-reperfusao").click();
  await expect(page.getByTestId("avc-f-portao-motivo-doac")).toBeVisible();
}

test.describe("AVC · 19ª rodada · julgamento registrado no portão da IVT", () => {
  test("DOAC: «Não prosseguir» nomeia a decisão; «Prosseguir» é novo registro e retira o motivo", async ({ page }) => {
    await doacSemHora(page);
    const naoProsseguir = page.getByTestId("avc-f-julgamento-doac-nao-prosseguir");
    await naoProsseguir.scrollIntoViewIfNeeded();
    /**
     * ⚠️ Revisão das capturas a 375 px (antes do commit): em PT, «Prosseguir» dividia a linha com o rótulo e
     * «Não prosseguir» caía sozinho na linha de baixo. Os dois gestos da mesma decisão ficam lado a lado.
     */
    const caixaSim = await page.getByTestId("avc-f-julgamento-doac-prosseguir").boundingBox();
    const caixaNao = await naoProsseguir.boundingBox();
    expect(Math.abs((caixaSim?.y ?? 0) - (caixaNao?.y ?? -100)), "os dois gestos na mesma linha").toBeLessThan(4);
    await naoProsseguir.click();

    const estado = page.getByTestId("avc-f-portao-estado-decisao_de_nao_prosseguir");
    await expect(estado).toContainText("Decisão clínica registrada: não prosseguir com a trombólise");
    await expect(estado, "⛔ a decisão ⛔ é contraindicação").not.toContainText(/contraindica/i);
    await expect(page.getByTestId("avc-f-portao-dado-doac")).toContainText("Decisão clínica registrada: não prosseguir");

    await page.getByTestId("avc-f-julgamento-doac-prosseguir").click();
    await expect(page.getByTestId("avc-f-portao-motivo-doac")).toHaveCount(0);
    await expect(page.getByTestId("avc-f-portao-estado-decisao_de_nao_prosseguir")).toHaveCount(0);
  });

  /**
   * ⚠️ Decisão do autor (2026-09-14, conclusão do D-139-3, itens 2 ⛔ 3): «não prosseguir» vigente é o motivo principal
   * (a TC ⛔ registrada segue como adicional); decisão vigente + autor + data/hora na trilha expansível, ⛔ no card.
   */
  test("«não prosseguir» vigente é o motivo principal; a trilha mostra decisão, autor e data/hora", async ({ page }) => {
    await doacSemHora(page);
    await page.getByTestId("avc-f-julgamento-doac-nao-prosseguir").click();
    const motivos = page.locator('[data-testid^="avc-f-portao-motivo-"]');
    await expect(motivos.first()).toHaveAttribute("data-testid", "avc-f-portao-motivo-doac");
    expect(await motivos.count(), "os outros motivos continuam visíveis").toBeGreaterThan(1);

    const abrir = page.getByTestId("avc-f-julgamentos-abrir");
    await abrir.scrollIntoViewIfNeeded();
    await abrir.click();
    const primeiro = page.getByTestId("avc-f-julgamentos-0");
    await expect(primeiro).toContainText("Não prosseguir");
    await expect(primeiro).toContainText("decisão vigente");
    await expect(primeiro).toContainText(/\d{2}\/\d{2} \d{2}:\d{2}/);
    await expect(primeiro).toContainText("Autoria não identificada");

    await page.getByTestId("avc-f-julgamento-doac-prosseguir").click();
    const segundo = page.getByTestId("avc-f-julgamentos-1");
    await expect(segundo).toContainText("Prosseguir");
    await expect(segundo).toContainText("decisão vigente");
    await expect(primeiro, "⛔ sobrescrita: o registro anterior continua, ⛔ vigente").toContainText("Não prosseguir");
    await expect(primeiro).not.toContainText("decisão vigente");
    await expect(motivos.first()).not.toHaveAttribute("data-testid", "avc-f-portao-motivo-doac");
  });

  test("o motivo do DOAC mostra os dois gestos em espanhol", async ({ page }) => {
    await doacSemHora(page, "es-419");
    await expect(page.getByTestId("avc-f-julgamento-doac-prosseguir")).toHaveText("Continuar");
    await expect(page.getByTestId("avc-f-julgamento-doac-nao-prosseguir")).toHaveText("No continuar");
  });
});

/**
 * AC-03r (autor, 2026-09-14; `docs/decisoes.md` §7 e C8): data do parto e janela operacional LOCAL de 14 dias.
 * ⚠️ O seletor de data é tolerante a ±1 dia aqui (13 ⛔ 14 retêm; 15 ⛔ 16 liberam); os limites exatos são da prova.
 */
/**
 * Instrumento (2026-09-15): o relógio do navegador fica fixo nos testes do AC-03r. O seletor de data parte de `agora`;
 * com o relógio real, «hora −1» entre 00:00 e 00:59 cruzava a meia-noite e o parto caía N+1 dias antes. Com o instante
 * fixo ao meio-dia, a data e a hora do parto derivam dele: N dias antes, às 11:00. Cenários e expectativas não mudam.
 */
const AGORA_FIXO_AC03R = new Date(2026, 8, 15, 12, 0, 0);
const HORA_DO_PARTO = "11";
const MINUTO_DO_PARTO = "00";

/** Confere, antes de confirmar, que o seletor chegou à hora derivada do instante fixo. */
async function horaDerivadaDoInstanteFixo(page: Page) {
  await expect(page.getByTestId("avc-seletor-hora-h-numero")).toHaveText(HORA_DO_PARTO);
  await expect(page.getByTestId("avc-seletor-hora-m-numero")).toHaveText(MINUTO_DO_PARTO);
}

async function puerperaNoPortao(page: Page) {
  await page.clock.setFixedTime(AGORA_FIXO_AC03R);
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-opcao-faixa_etaria-18 anos ou mais").click();
  await page.getByTestId("avc-opcao-gestacao_puerperio-Puérpera").click();
  await expect(page.getByTestId("avc-campo-data_do_parto")).toBeVisible();
}

async function partoHaDias(page: Page, dias: number) {
  await page.getByTestId("avc-hora-data_do_parto").click();
  await expect(page.getByTestId("avc-seletor-hora")).toBeVisible();
  await page.getByTestId("avc-seletor-data-escolher").click();
  for (let i = 0; i < dias; i += 1) await page.getByTestId("avc-seletor-data-passo-menos").click();
  /**
   * ⚠️ Ajuste de instrumento (depois de implementar): mover só o dia ⛔ seleciona o valor, e «Confirmar» fica inativo.
   * O gesto real toca a hora — o mesmo que `e2e/avc-controle-de-data` faz para o DOAC. Com o relógio fixo ao meio-dia,
   * a hora vai a 11:00 no mesmo dia.
   */
  await page.getByTestId("avc-seletor-hora-h-menos").click();
  await horaDerivadaDoInstanteFixo(page);
  await page.getByTestId("avc-seletor-hora-confirmar").click();
  /** ⚠️ Decisão do autor: a hora só vale confirmada na pergunta separada. */
  await page.getByTestId("avc-opcao-parto_hora_conhecida-sim").click();
}

test.describe("AVC · 19ª rodada · AC-03r · data do parto e janela local de 14 dias", () => {
  test("13 dias: fora do escopo, e a janela é dita regra local — ⛔ AHA", async ({ page }) => {
    await puerperaNoPortao(page);
    await partoHaDias(page, 13);
    const fora = page.getByTestId("avc-portao-fora-do-escopo");
    await expect(fora).toContainText("Fora do escopo validado — encaminhar");
    await expect(page.getByTestId("avc-portao-populacao")).toContainText("regra local");
    /** ⚠️ Ajuste de instrumento (antes de implementar): reprova a atribuição, ⛔ a rotulagem «não é recomendação da AHA/ASA». */
    await expect(page.getByTestId("avc-portao-populacao")).not.toContainText("AHA 2019");
    await expect(page.getByTestId("avc-portao-populacao")).not.toContainText("fonte AHA");
  });

  test("15 dias: a janela local não retém; ⛔ muda ao fechar e reabrir o caso", async ({ page, context }) => {
    await puerperaNoPortao(page);
    await partoHaDias(page, 15);
    await expect(page.getByTestId("avc-portao-populacao")).toHaveCount(0);

    const outra = await context.newPage();
    await outra.clock.setFixedTime(AGORA_FIXO_AC03R);
    await page.close();
    await fixarIdioma(outra, "pt-BR");
    await outra.goto("/modulos/avc");
    await expect(outra.getByTestId("avc-caso-recuperado")).toBeVisible({ timeout: 30_000 });
    await expect(outra.getByTestId("avc-portao-populacao")).toHaveCount(0);
  });

  /** ⚠️ Pedido do autor (antes do commit do AC-03r): a data necessária ⛔ resolvida é pendência — ⛔ «Nada pendente aqui». */
  test("puérpera sem data e com «Sem essa informação»: o cabeçalho do Paciente mostra a pendência", async ({ page }) => {
    await puerperaNoPortao(page);
    const cabecalho = page.getByTestId("avc-fase-pendentes");
    await expect(cabecalho).toContainText("a resolver aqui");
    await expect(cabecalho).not.toContainText("Nada pendente aqui");
    await page.getByTestId("avc-hora-desconhecido-data_do_parto").click();
    await expect(cabecalho).toContainText("a resolver aqui");
  });

  /**
   * ⚠️ Refinamento do autor (após `078b41f`): só a data ⛔ inventa horário — o dia inteiro é o intervalo. A hora só é
   * pedida quando o dia cruza 14 × 24 h. Ajuste consciente: o teste «15 dias só data retém» deu lugar a 14 · 3 · 20 dias.
   */
  async function dataSemHora(page: Page, dias: number) {
    await page.getByTestId("avc-hora-data_do_parto").click();
    await page.getByTestId("avc-seletor-data-escolher").click();
    for (let i = 0; i < dias; i += 1) await page.getByTestId("avc-seletor-data-passo-menos").click();
    await page.getByTestId("avc-seletor-hora-h-menos").click();
    await horaDerivadaDoInstanteFixo(page);
    await page.getByTestId("avc-seletor-hora-confirmar").click();
    await page.getByTestId("avc-opcao-parto_hora_conhecida-Não, só a data").click();
  }

  test("14 dias com hora «Não, só a data»: o horário decide — ⛔ libera, e pede a hora", async ({ page }) => {
    await puerperaNoPortao(page);
    await dataSemHora(page, 14);
    await expect(page.getByTestId("avc-portao-fora-do-escopo")).toContainText("hora do parto desconhecida");
    await expect(page.getByTestId("avc-fase-pendentes")).toContainText("a resolver aqui");
  });

  test("3 dias com hora «Não, só a data»: dentro da regra local em qualquer horário, ⛔ pede a hora", async ({ page }) => {
    await puerperaNoPortao(page);
    await dataSemHora(page, 3);
    await expect(page.getByTestId("avc-portao-fora-do-escopo")).toContainText("dentro da janela de 14 dias");
    await expect(page.getByTestId("avc-portao-fora-do-escopo")).toContainText("hora desconhecida");
    await expect(page.getByTestId("avc-fase-pendentes")).toContainText("Nada pendente aqui");
  });

  test("20 dias com hora «Não, só a data»: além em qualquer horário — o portão ⛔ retém", async ({ page }) => {
    await puerperaNoPortao(page);
    await dataSemHora(page, 20);
    await expect(page.getByTestId("avc-portao-populacao")).toHaveCount(0);
  });

  test("data do parto desconhecida: ⛔ libera o protocolo adulto", async ({ page }) => {
    await puerperaNoPortao(page);
    await page.getByTestId("avc-hora-desconhecido-data_do_parto").click();
    await expect(page.getByTestId("avc-portao-fora-do-escopo")).toContainText("data do parto desconhecida");
    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-portao-populacao")).toBeVisible();
    await expect(page.getByTestId("avc-f-raia-ivt")).toHaveCount(0);
  });
});

/**
 * AC-13 (autor, 2026-09-14; `docs/decisoes.md`, 19ª rodada §8): os 8 estados da ação, «não sei» separado, exposição
 * por estado ⛔ transições com horário ⛔ autoria.
 */
async function trombolisePorEstados(page: Page, ...rotulos: string[]) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-reperfusao").click();
  await page.getByTestId("avc-nova-trombolise").click();
  for (const r of rotulos) await page.getByTestId(`avc-opcao-ivt_estado-${r}`).click();
}

test.describe("AVC · 19ª rodada · AC-13 · estados da ação", () => {
  test("as 8 situações e «Não sei» aparecem como opções; «Realizada» não aparece", async ({ page }) => {
    await trombolisePorEstados(page);
    for (const r of ["Indicada", "Decidida", "Prescrita", "Preparada", "Iniciada", "Administrada/concluída", "Interrompida", "Cancelada", "nao_sei"]) {
      await expect(page.getByTestId(`avc-opcao-ivt_estado-${r}`)).toBeVisible();
    }
    await expect(page.getByTestId("avc-opcao-ivt_estado-Realizada")).toHaveCount(0);
  });

  test("«Prescrita» → «Preparada» não é exposição: o Destino não mostra conduta de trombólise", async ({ page }) => {
    await trombolisePorEstados(page, "Prescrita", "Preparada");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-superficie-g-conteudo")).toBeVisible();
    await expect(page.getByTestId("avc-g-conduta")).toHaveCount(0);
  });

  test("«Preparada» → «Interrompida» é exposição; a trilha mostra as duas transições com horário e autoria", async ({ page }) => {
    await trombolisePorEstados(page, "Preparada", "Interrompida");
    /** ⚠️ AC-13 reaberto, item 5: «Interrompida» sem «Iniciada» contraria a ordem decidida — pede confirmação e entra como correção. */
    await page.getByTestId("avc-confirmar-ordem-corrigir").click();
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    const primeira = page.getByTestId("avc-transicoes-trombolise_iv_1-0");
    const segunda = page.getByTestId("avc-transicoes-trombolise_iv_1-1");
    await expect(primeira).toContainText("Preparada");
    await expect(segunda).toContainText("Interrompida");
    await expect(segunda).toContainText("situação vigente");
    await expect(segunda).toContainText("fora da ordem causal");
    await expect(primeira).toContainText(/\d{2}:\d{2}/);
    await expect(segunda).toContainText("Autoria não identificada");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-conduta")).toContainText("Interrompida após o início — houve exposição");
  });
});
