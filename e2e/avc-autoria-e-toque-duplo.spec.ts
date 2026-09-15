import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * AC-40 · AUTORIA DO EVENTO e TOQUE DUPLO NO REGISTRO, pelo gesto do médico.
 *
 * ⚠️ O `dist` das provas roda ⛔ sem backend: ⛔ não há sessão Supabase, então o
 * caminho exercido aqui é o do RECURSO — o ID do aparelho, marcado como tal no
 * evento ⛔ e na linha do tempo. O caminho com sessão é provado no módulo
 * (`scripts/prova-avc-autoria-e-toque-duplo.cjs`, cliente Supabase falso).
 */

type Evento = { tipo: string; autor?: string; origemDoAutor?: string; dados: { fato?: { campo: string }; superficie?: string } };

async function eventos(page: Page): Promise<Evento[]> {
  return page.evaluate(() => new Promise<Evento[]>((resolve, reject) => {
    const req = indexedDB.open("avc-atendimento");
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("eventos")) { db.close(); resolve([]); return; }
      const todos = db.transaction("eventos", "readonly").objectStore("eventos").getAll();
      todos.onsuccess = () => { db.close(); resolve(todos.result as Evento[]); };
      todos.onerror = () => reject(todos.error);
    };
  }));
}

const fatosDo = (evs: Evento[], campo: string) => evs.filter((e) => e.tipo === "fato" && e.dados.fato?.campo === campo);

/**
 * ⚠️ A fila grava EM ORDEM: quando o evento de um gesto POSTERIOR já está no
 * log, tudo o que veio antes também está. ⛔ Sem espera por tempo.
 */
async function esperarGravacaoAte(page: Page, superficie: string) {
  await page.getByTestId(`avc-aba-${superficie}`).click();
  await expect.poll(async () => (await eventos(page)).some((e) => e.tipo === "superficie_vista" && e.dados.superficie === superficie), { timeout: 15_000 }).toBe(true);
}

async function abrirAvc(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

test.describe("AVC · autoria do evento (AC-40)", () => {
  test("sem sessão, a correção do laboratório leva o ID do aparelho ⛔ MARCADO — no log e na leitura", async ({ page }) => {
    await abrirAvc(page);
    await page.getByTestId("avc-aba-imagem").click();
    await expect(page.getByTestId("avc-superficie-laboratorio-conteudo")).toBeVisible();
    await page.getByTestId("avc-nova-coleta").click();
    await page.getByTestId("avc-numerico-inr").fill("1,4");
    await page.getByTestId("avc-numerico-inr").blur();
    await page.getByTestId("avc-corrigir-inr").click();
    await page.getByTestId("avc-numerico-mais-inr").click();
    await expect(page.getByTestId("avc-valor-inr")).toContainText("1,5");

    await expect(page.getByTestId("avc-correcao-inr")).toContainText("Autoria não identificada");

    await esperarGravacaoAte(page, "paciente");
    const evs = await eventos(page);
    expect(fatosDo(evs, "inr").length, "a medida e a correção do INR estão no log").toBe(2);
    for (const e of evs) {
      expect(e.origemDoAutor, `evento ${e.tipo} sem origem do autor`).toBe("aparelho");
      expect(String(e.autor)).toMatch(/^local:/);
    }
  });

  test("sem sessão, o histórico das aferições marca o autor como o aparelho", async ({ page }) => {
    await abrirAvc(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-num-caixa-glicemia").fill("38");
    await page.getByTestId("avc-num-caixa-glicemia").blur();
    await page.getByTestId("avc-a-nova-medida-glicemia_alterada").click();
    await page.getByTestId("avc-num-caixa-glicemia").fill("96");
    await page.getByTestId("avc-num-caixa-glicemia").blur();
    await page.getByTestId("avc-historico-abrir-glicemia").click();
    await expect(page.getByTestId("avc-historico-glicemia-1")).toContainText("Autoria não identificada");
  });
});

test.describe("AVC · toque duplo no registro, para toda ação", () => {
  test("«Registrar ação» tocado duas vezes registra UMA ação — ⛔ também depois de recarregar", async ({ page }) => {
    await abrirAvc(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-num-caixa-pas").fill("198");
    await page.getByTestId("avc-num-caixa-pad").fill("112");
    await page.getByTestId("avc-aba-correcoes").click();

    const registrar = page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta");
    await registrar.click();
    await registrar.click();
    await expect(page.getByTestId("avc-e-acao-acao_1")).toBeVisible();
    await expect(page.getByTestId("avc-e-acao-acao_2")).toHaveCount(0);

    await esperarGravacaoAte(page, "paciente");
    expect(fatosDo(await eventos(page), "acao_tipo").length, "o log registrou duas ações").toBe(1);

    await page.reload();
    await expect(page.getByTestId("avc-caso-recuperado")).toBeVisible({ timeout: 30_000 });
    await page.getByTestId("avc-aba-correcoes").click();
    await expect(page.getByTestId("avc-e-acao-acao_1")).toBeVisible();
    await expect(page.getByTestId("avc-e-acao-acao_2")).toHaveCount(0);
  });

  test("Glasgow: «Usar» tocado duas vezes ANTES de a tela redesenhar registra UM Glasgow", async ({ page }) => {
    await abrirAvc(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-glasgow-abrir").click();
    await page.getByTestId("avc-glasgow-e-3").click();
    await page.getByTestId("avc-glasgow-v-4").click();
    await page.getByTestId("avc-glasgow-m-5").click();
    await expect(page.getByTestId("avc-glasgow-total")).toContainText("12");

    /**
     * ⚠️ Dois `click()` no MESMO tique: é o dedo que toca duas vezes antes de o
     * React redesenhar — o segundo toque ainda vê o botão ⛔ e a escolha antiga.
     */
    await page.getByTestId("avc-glasgow-usar").evaluate((b) => {
      (b as HTMLElement).click();
      (b as HTMLElement).click();
    });

    await esperarGravacaoAte(page, "paciente");
    const evs = await eventos(page);
    expect(fatosDo(evs, "glasgow").length, "o log registrou o Glasgow duas vezes").toBe(1);
    expect(fatosDo(evs, "glasgow_e").length).toBe(1);
  });
});
