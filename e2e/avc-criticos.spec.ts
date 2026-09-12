import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * OS CRÍTICOS DO AVC — ⚠️ **pelo gesto real do médico** (commit 11 · 2026-09-12).
 *
 * ⚠️ Regra do projeto: *"toda fase nova ⛔ ou refatorada precisa de pelo menos
 * um teste que execute o **gesto real do médico**, ⛔ e ⛔ não apenas navegação
 * ⛔ ou presença de elementos"*. ⛔ A prova de núcleo (`prova-avc-criticos`)
 * mede o motor; ⛔ esta suíte mede **o que o médico vê ⛔ e toca** para os onze
 * achados validados como *release blockers* do PLANO-CORRECAO-AVC-CRITICOS.md.
 *
 * ⛔ Nenhum número clínico é afirmado aqui: ⛔ os horários são narrativos ⛔ e os
 * valores (INR 2,5 · 1,0) são os da auditoria, ⛔ não limites.
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
}

const aba = (page: Page, id: string) => page.getByTestId(`avc-aba-${id}`).click();

/** ⚠️ Horário **h horas atrás** — ⛔ e ⛔ nunca "agora" por omissão (§0.2). */
async function horaHa(page: Page, campo: string, horas: number) {
  await page.getByTestId(`avc-hora-${campo}`).click();
  for (let i = 0; i < horas; i += 1) {
    await page.getByTestId("avc-seletor-hora-h-menos").click();
  }
  await page.getByTestId("avc-seletor-hora-m-menos").click();
  await page.getByTestId("avc-seletor-hora-confirmar").click();
}

async function novoExame(page: Page, modalidade: string) {
  await page.getByTestId("avc-novo-estudo").click();
  await page.getByTestId(`avc-opcao-estudo_modalidade-${modalidade}`).click();
}

const TC = "Tomografia de crânio sem contraste";
const SEM_HEMORRAGIA = "Sem hemorragia intracraniana identificada";
const COM_HEMORRAGIA = "Hemorragia intracraniana identificada";

/**
 * ⚠️ O candidato IVT **completo** pela composição D1: déficit incapacitante ·
 * início há 2 h · TC sem hemorragia · juízo da rec. 10 respondido (*"⛔ não"*).
 */
async function candidatoCompleto(page: Page) {
  await aba(page, "neurologico");
  await horaHa(page, "hora_inicio_observado", 2);
  await page.getByTestId("avc-opcao-incapacitante_assumido-Incapacitante").click();
  await aba(page, "seguranca");
  await page.getByTestId("avc-opcao-motivo_para_suspeitar_alteracao_coagulacao-nao").click();
  await aba(page, "imagem");
  await novoExame(page, TC);
  await page.getByTestId(`avc-opcao-estudo_resultado-${SEM_HEMORRAGIA}`).click();
}

test.describe("AVC · críticos — o gesto real", () => {
  /* ══ AVC-01 · SÓ PESO ⛔ NÃO É ELEGIBILIDADE ══════════════════════════ */

  test("só o peso ⛔ NÃO libera a decisão de prosseguir", async ({ page }) => {
    await abrir(page);
    await aba(page, "paciente");
    const peso = page.getByTestId("avc-campo-peso").locator("input").first();
    await peso.fill("70");
    await peso.blur();

    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-portao-estado-informacao_incompleta")).toBeVisible();
    /** ⚠️ ⛔ O gesto prospectivo ⛔ não é oferecido; ⛔ o registro retrospectivo segue livre. */
    await expect(page.getByTestId("avc-campo-ivt_indicacao_confirmada")).toHaveCount(0);
    await expect(page.getByTestId("avc-nova-trombolise")).toBeVisible();
    /** ⚠️ O que falta é dito em português, ⛔ nunca em slug. */
    const conteudo = page.getByTestId("avc-superficie-f-conteudo");
    await expect(conteudo).not.toContainText(/deficit_incapacitante|estudo_resultado|classe_imagem|\bundefined\b/);
    await expect(page.getByTestId("avc-f-veredito-tipo")).not.toContainText(/indicada/i);
  });

  /* ══ AVC-03 · TENECTEPLASE ⛔ NÃO É TENECTEPLASE 0,4 mg/kg ═══════════ */

  test("escolher tenecteplase ⛔ NÃO transforma o portão em «não recomendada»", async ({ page }) => {
    await abrir(page);
    await candidatoCompleto(page);
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-campo-ivt_indicacao_confirmada")).toBeVisible();
    await expect(page.getByTestId("avc-f-veredito-tipo")).toContainText(/Trombólise indicada/);

    await page.getByTestId("avc-f-agente-Tenecteplase").click();
    await expect(page.getByTestId("avc-campo-ivt_indicacao_confirmada")).toBeVisible();
    await expect(page.getByTestId("avc-f-portao-estado-nao_recomendada")).toHaveCount(0);
    await expect(page.getByTestId("avc-f-veredito-tipo")).toContainText(/Trombólise indicada/);
    /** ⚠️ ⛔ E o alerta posológico de 0,4 mg/kg ⛔ continua visível para quem considera TNK. */
    await expect(page.getByTestId("avc-superficie-f-conteudo")).toContainText(/0,4 mg\/kg/);
  });

  /* ══ AVC-05 · HEMORRAGIA RETÉM A CLASSE — ⛔ TAMBÉM NA EVT ═══════════ */

  test("TC com hemorragia: a EVT mostra a classe retida ⛔ e ⛔ nenhuma faixa de «não aguardar»", async ({ page }) => {
    await abrir(page);
    await aba(page, "neurologico");
    await horaHa(page, "hora_inicio_observado", 1);
    await page.getByTestId("avc-bloco-abrir-nihss-de-fora").click();
    await page.getByTestId("avc-degrau-nihss_informado-mais-10").click();
    await page.getByTestId("avc-abrir-mrs_previo").click();
    await page.getByTestId("avc-opcao-mrs_previo-0 · assintomático").click();
    await page.getByTestId("avc-opcao-incapacitante_assumido-Incapacitante").click();

    await aba(page, "imagem");
    await novoExame(page, "Angiotomografia");
    await page.getByTestId("avc-abrir-sitio_oclusao").click();
    await page.getByTestId("avc-opcao-sitio_oclusao-M1 da artéria cerebral média").click();
    await novoExame(page, TC);
    await page.getByTestId(`avc-opcao-estudo_resultado-${COM_HEMORRAGIA}`).click();
    await page.getByTestId("avc-num-caixa-aspects").fill("8");
    await page.getByTestId("avc-num-caixa-aspects").blur();

    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-portao-estado-bloqueado_seguranca")).toBeVisible();
    await expect(page.getByTestId("avc-f-evt-classe-hemorragia_presente")).toBeVisible();
    await expect(page.getByTestId("avc-f-evt-sem-esperar")).toHaveCount(0);
    await expect(page.getByTestId("avc-f-evt")).toContainText(/Reperfusão retida pela imagem/);
    /** ⚠️ ⛔ E a palavra proibida ⛔ não aparece. */
    await expect(page.getByTestId("avc-superficie-f-conteudo")).not.toContainText(/contraindicad/i);
  });

  /* ══ AVC-04 · COLETAS DISCORDANTES ⛔ NÃO LIBERAM ═════════════════════ */

  test("INR 2,5 numa coleta ⛔ e 1,0 noutra: reconciliação pendente, ⛔ e ⛔ não liberação", async ({ page }) => {
    await abrir(page);
    await candidatoCompleto(page);

    await aba(page, "imagem");
    await page.getByTestId("avc-nova-coleta").click();
    await page.getByTestId("avc-numerico-inr").fill("2,5");
    await page.getByTestId("avc-numerico-inr").blur();
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-portao-estado-bloqueado_seguranca")).toBeVisible();

    await aba(page, "imagem");
    await page.getByTestId("avc-nova-coleta").click();
    await page.getByTestId("avc-numerico-inr").fill("1,0");
    await page.getByTestId("avc-numerico-inr").blur();
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-portao-estado-reconciliacao_pendente")).toBeVisible();
    await expect(page.getByTestId("avc-campo-ivt_indicacao_confirmada")).toHaveCount(0);
    await expect(page.getByTestId("avc-f-portao")).toContainText(/INR/);
  });

  /* ══ AVC-07 · INTERROMPIDA ⛔ NÃO APAGA A EXPOSIÇÃO ══════════════════ */

  test("trombólise iniciada → interrompida: o Destino mantém o contexto pós-IVT", async ({ page }) => {
    await abrir(page);
    await aba(page, "reperfusao");
    await page.getByTestId("avc-nova-trombolise").click();
    await page.getByTestId("avc-opcao-ivt_estado-Iniciada").click();
    await horaHa(page, "ivt_inicio", 1);

    await aba(page, "destino");
    await expect(page.getByTestId("avc-g-monitorizacao")).toBeVisible();

    await aba(page, "reperfusao");
    await page.getByTestId("avc-opcao-ivt_estado-Interrompida").click();

    await aba(page, "destino");
    /** ⚠️ A Table 7 continua de pé — ⛔ com hora conhecida, a faixa é a da **fase**, ⛔ e a exposição segue afirmada. */
    await expect(page.getByTestId("avc-g-monitorizacao")).toBeVisible();
    await expect(page.getByTestId("avc-g-fase-atual")).toBeVisible();
    await expect(page.getByTestId("avc-g-conduta")).toContainText(/Interrompida após o início — houve exposição/);
    await expect(page.getByTestId("avc-g-antitromboticos")).toBeVisible();
  });

  /* ══ AVC-13 · FORMULÁRIO ABERTO ⛔ NÃO É CONDUTA ══════════════════════ */

  test("abrir «Registrar administração» ⛔ sem preencher ⛔ não cria conduta ⛔ nem exposição", async ({ page }) => {
    await abrir(page);
    await aba(page, "reperfusao");
    await page.getByTestId("avc-nova-trombolise").click();
    await expect(page.getByTestId("avc-f-trombolise-trombolise_iv_1")).toBeVisible();
    await expect(page.getByTestId("avc-f-discrepancia")).toHaveCount(0);

    await aba(page, "destino");
    await expect(page.getByTestId("avc-g-sintese-conduta")).toHaveCount(0);
    await expect(page.getByTestId("avc-g-monitorizacao")).toHaveCount(0);
  });

  /* ══ AVC-09 · IVT ⛔ SEM HORA = EXPOSIÇÃO COM INTERVALO INDETERMINADO ═ */

  test("trombólise iniciada ⛔ sem horário: o antitrombótico ⛔ não diz «fora do contexto»", async ({ page }) => {
    await abrir(page);
    await aba(page, "reperfusao");
    await page.getByTestId("avc-nova-trombolise").click();
    await page.getByTestId("avc-opcao-ivt_estado-Iniciada").click();

    await aba(page, "destino");
    await expect(page.getByTestId("avc-g-fase-sem-horario")).toBeVisible();
    await expect(page.getByTestId("avc-g-antitrombotico-estado-sem_horario_ivt")).toBeVisible();
    await expect(page.getByTestId("avc-g-antitrombotico-aspirina-iv-indeterminada")).toBeVisible();
  });

  /* ══ AVC-12 · «SEM ESSA INFORMAÇÃO» APAGA O RELÓGIO DO TOPO ═════════ */

  test("última vez bem → «sem essa informação»: o cabeçalho ⛔ não mostra mais «há 2 h»", async ({ page }) => {
    await abrir(page);
    await aba(page, "neurologico");
    await horaHa(page, "hora_ultima_vez_bem", 2);
    await aba(page, "imagem");
    await expect(page.getByTestId("avc-relogio-do-topo")).toContainText(/\dh\d\d/);

    await aba(page, "neurologico");
    await page.getByTestId("avc-hora-desconhecido-hora_ultima_vez_bem").click();
    await aba(page, "imagem");
    await expect(page.getByTestId("avc-relogio-do-topo")).not.toContainText(/\dh\d\d/);
  });
});
