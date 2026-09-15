import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * AC-02 · PERSISTÊNCIA LOCAL-FIRST (D-PEND-02) e SEGUNDA ABERTURA (D-PEND-03),
 * pelo gesto do médico, com IndexedDB real do navegador.
 *
 * Casos da spec (`docs/spec-avc.md`): A13 fechar e reabrir; A17 toque duplo.
 * A14, correção versionada e rascunho: `scripts/prova-avc-persistencia.cjs`.
 */

async function abrirNovo(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

async function aba(page: Page, id: string) {
  await page.getByTestId(`avc-aba-${id}`).click();
}

async function informarHora(page: Page, campo: string) {
  await page.getByTestId(`avc-hora-${campo}`).click();
  await page.getByTestId("avc-seletor-hora-m-menos").click();
  await page.getByTestId("avc-seletor-hora-confirmar").click();
}

async function registrarIvt(page: Page) {
  await aba(page, "reperfusao");
  await page.getByTestId("avc-nova-trombolise").click();
  await page.getByTestId("avc-opcao-ivt_estado-Administrada/concluída").click();
  await informarHora(page, "ivt_inicio");
}

/** O banco do atendimento como está no navegador: versão e todos os eventos. */
async function lerBanco(page: Page): Promise<{ versao: number; eventos: Record<string, unknown>[] }> {
  return page.evaluate(() => new Promise<{ versao: number; eventos: Record<string, unknown>[] }>((resolve, reject) => {
    const req = indexedDB.open("avc-atendimento");
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("eventos")) { const versao = db.version; db.close(); resolve({ versao, eventos: [] }); return; }
      const todos = db.transaction("eventos", "readonly").objectStore("eventos").getAll();
      todos.onsuccess = () => { const versao = db.version; db.close(); resolve({ versao, eventos: todos.result as Record<string, unknown>[] }); };
      todos.onerror = () => { db.close(); reject(todos.error); };
    };
  }));
}

test.describe("AVC · persistência do atendimento", () => {
  test("A13 · fechar e reabrir preserva os fatos ⛔ e a trombólise registrada", async ({ page, context }) => {
    await abrirNovo(page);
    await aba(page, "paciente");
    await page.getByTestId("avc-num-caixa-peso").fill("70");
    await page.getByTestId("avc-num-caixa-peso").blur();
    await registrarIvt(page);
    await aba(page, "destino");
    await expect(page.getByTestId("avc-g-antitromboticos")).toBeVisible();

    /** ⚠️ FECHAR de verdade: a aba some, ⛔ e outra aba abre o módulo do zero. */
    const outra = await context.newPage();
    await page.close();
    await fixarIdioma(outra, "pt-BR");
    await outra.goto("/modulos/avc");

    await expect(outra.getByTestId("avc-caso-recuperado")).toBeVisible({ timeout: 30_000 });
    await expect(outra.getByTestId("avc-portao-populacao")).toHaveCount(0);
    await aba(outra, "paciente");
    await expect(outra.getByTestId("avc-num-caixa-peso")).toHaveValue("70");
    await aba(outra, "reperfusao");
    await expect(outra.getByTestId("avc-f-trombolise-trombolise_iv_1")).toBeVisible();
    await expect(outra.getByTestId("avc-f-trombolise-trombolise_iv_2")).toHaveCount(0);
    await aba(outra, "destino");
    await expect(outra.getByTestId("avc-g-antitromboticos")).toBeVisible();
  });

  test("A17 · toque duplo em «Registrar administração» abre UMA só, ⛔ também depois de recarregar", async ({ page }) => {
    await abrirNovo(page);
    await aba(page, "reperfusao");
    /**
     * ⚠️ DOIS TOQUES seguidos, ⛔ e ⛔ não `dblclick`: medido em 2026-09-13, o
     * `dblclick` do Playwright ⛔ não reproduziu o defeito no código anterior (o
     * teste só caiu no reload). Dois toques imediatos são o que o dedo do médico faz.
     */
    const registrar = page.getByTestId("avc-nova-trombolise");
    await registrar.click();
    await registrar.click();
    await expect(page.getByTestId("avc-f-trombolise-trombolise_iv_1")).toBeVisible();
    await expect(page.getByTestId("avc-f-trombolise-trombolise_iv_2")).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId("avc-caso-recuperado")).toBeVisible({ timeout: 30_000 });
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-trombolise-trombolise_iv_1")).toBeVisible();
    await expect(page.getByTestId("avc-f-trombolise-trombolise_iv_2")).toHaveCount(0);
  });

  test("D-PEND-03 · segunda abertura do mesmo caso no mesmo dispositivo é bloqueada, com aviso", async ({ page, context }) => {
    await abrirNovo(page);
    const segunda = await context.newPage();
    await fixarIdioma(segunda, "pt-BR");
    await segunda.goto("/modulos/avc");
    await expect(segunda.getByTestId("avc-caso-aberto-em-outra-aba")).toBeVisible({ timeout: 30_000 });
    await expect(segunda.getByTestId("avc-caso-aberto-em-outra-aba")).toContainText(/outra aba/i);
    await expect(segunda.getByTestId("avc-portao-populacao")).toHaveCount(0);
    await expect(segunda.getByTestId("avc-superficie-paciente-conteudo")).toHaveCount(0);
  });

  test("schema v1 → v4 · dados gravados por v1 são migrados e recuperados", async ({ page }) => {
    const T0 = Date.now() - 10 * 60_000;
    await fixarIdioma(page, "pt-BR");
    await page.goto("/");
    await page.evaluate(async (t0) => {
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open("avc-atendimento", 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          db.createObjectStore("casos", { keyPath: "casoId" });
          const ev = db.createObjectStore("eventos", { keyPath: "id" });
          ev.createIndex("porCaso", "casoId");
        };
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(["casos", "eventos"], "readwrite");
          tx.objectStore("casos").put({ casoId: "caso-v1", abertoEm: t0, encerradoEm: null });
          const eventos = tx.objectStore("eventos");
          const fato = (n: number, campo: string, valor: unknown) => ({
            id: `v1-${n}`, casoId: "caso-v1", seq: n, tipo: "fato", registradoEm: t0 + n,
            dados: { fato: { id: `f${n}`, campo, valor, horaRegistro: t0 + n } },
          });
          eventos.put({ id: "v1-0", casoId: "caso-v1", seq: 0, tipo: "caso_aberto", registradoEm: t0,
            dados: { abertoEm: t0, relogiosClinicos: { t0_operacional: t0 }, superficieVista: "paciente", eixosConcluidos: [] } });
          eventos.put(fato(1, "faixa_etaria", "18 anos ou mais"));
          eventos.put(fato(2, "gestacao_puerperio", "Não gestante e não puérpera"));
          eventos.put(fato(3, "peso", 70));
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => reject(tx.error);
        };
      });
    }, T0);

    await page.goto("/modulos/avc");
    await expect(page.getByTestId("avc-caso-recuperado")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("avc-portao-populacao")).toHaveCount(0);
    await aba(page, "paciente");
    await expect(page.getByTestId("avc-num-caixa-peso")).toHaveValue("70");
    const versao = await page.evaluate(() => new Promise<number>((resolve) => {
      const req = indexedDB.open("avc-atendimento");
      req.onsuccess = () => { const v = req.result.version; req.result.close(); resolve(v); };
    }));
    expect(versao, "o banco foi migrado para o schema 4 (AC-13 reaberto, item 4)").toBe(4);
  });

  test("schema v4 · banco novo abre na v4 e todo evento declara nomeDoAutor (sem conta: null)", async ({ page }) => {
    await abrirNovo(page);
    await expect.poll(async () => (await lerBanco(page)).eventos.length, { timeout: 10_000 }).toBeGreaterThan(0);
    const { versao, eventos } = await lerBanco(page);
    expect(versao, "banco novo aberto no schema 4").toBe(4);
    expect(eventos.every((e) => e.versaoDoSchema === 4 && "nomeDoAutor" in e && e.nomeDoAutor === null),
      "sem conta, todo evento novo grava nomeDoAutor = null").toBe(true);
  });

  test("schema v3 → v4 · migra sem perda, eventos antigos ficam sem nome e retomar não reescreve a autoria antiga", async ({ page }) => {
    const T0 = Date.now() - 10 * 60_000;
    await fixarIdioma(page, "pt-BR");
    await page.goto("/");
    const semeados = await page.evaluate(async (t0) => {
      const base = (n: number, tipo: string, dados: unknown) => ({
        id: `v3-${n}`, casoId: "caso-v3", seq: n, tipo, registradoEm: t0 + n, observadoEm: null,
        autor: "u-antigo", origemDoAutor: "sessao", versaoDoSchema: 3, dados,
      });
      const eventos = [
        base(1, "caso_aberto", { abertoEm: t0, relogiosClinicos: { t0_operacional: t0 }, superficieVista: "paciente", eixosConcluidos: [] }),
        base(2, "fato", { fato: { id: "f1", campo: "faixa_etaria", valor: "18 anos ou mais", horaRegistro: t0 + 2 } }),
        base(3, "fato", { fato: { id: "f2", campo: "gestacao_puerperio", valor: "Não gestante e não puérpera", horaRegistro: t0 + 3 } }),
        base(4, "fato", { fato: { id: "f3", campo: "peso", valor: 70, horaRegistro: t0 + 4 } }),
      ];
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open("avc-atendimento", 3);
        req.onupgradeneeded = () => {
          const db = req.result;
          db.createObjectStore("casos", { keyPath: "casoId" });
          const ev = db.createObjectStore("eventos", { keyPath: "id" });
          ev.createIndex("porCaso", "casoId");
          ev.createIndex("porCasoSeq", ["casoId", "seq"]);
          db.createObjectStore("rascunhos", { keyPath: ["casoId", "chave"] });
        };
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(["casos", "eventos"], "readwrite");
          tx.objectStore("casos").put({ casoId: "caso-v3", abertoEm: t0, encerradoEm: null });
          for (const e of eventos) tx.objectStore("eventos").put(e);
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => reject(tx.error);
        };
      });
      return eventos;
    }, T0);

    /** Sem perda: cada evento v3 volta com os mesmos campos; só `versaoDoSchema` passa a 4 e `nomeDoAutor` a null. */
    const antigosIntactos = (lidos: Record<string, unknown>[]) => semeados.every((s) => {
      const m = lidos.find((e) => e.id === s.id);
      if (m === undefined) return false;
      const { nomeDoAutor, versaoDoSchema, ...resto } = m;
      const { versaoDoSchema: _anterior, ...original } = s;
      return nomeDoAutor === null && versaoDoSchema === 4 && JSON.stringify(resto) === JSON.stringify(original);
    });

    await page.goto("/modulos/avc");
    await expect(page.getByTestId("avc-caso-recuperado")).toBeVisible({ timeout: 30_000 });
    await aba(page, "paciente");
    await expect(page.getByTestId("avc-num-caixa-peso")).toHaveValue("70");
    const migrado = await lerBanco(page);
    expect(migrado.versao, "banco v3 aberto no schema 4").toBe(4);
    expect(antigosIntactos(migrado.eventos), "eventos v3 migrados sem perda, com nomeDoAutor = null").toBe(true);

    /** Retomar com o usuário atual e registrar algo novo: a autoria antiga não é reescrita. */
    await page.reload();
    await aba(page, "paciente");
    await expect(page.getByTestId("avc-num-caixa-peso")).toHaveValue("70");
    await page.getByTestId("avc-num-caixa-peso").fill("72");
    await page.getByTestId("avc-num-caixa-peso").blur();
    await expect.poll(async () => (await lerBanco(page)).eventos.some((e) => JSON.stringify(e.dados ?? {}).includes("\"valor\":72")), { timeout: 10_000 }).toBe(true);
    const retomado = await lerBanco(page);
    expect(antigosIntactos(retomado.eventos), "retomar com o usuário atual não reescreve a autoria dos eventos antigos").toBe(true);
    const novos = retomado.eventos.filter((e) => !semeados.some((s) => s.id === e.id));
    expect(novos.length).toBeGreaterThan(0);
    expect(novos.every((e) => e.versaoDoSchema === 4 && e.nomeDoAutor === null && e.autor !== "u-antigo"),
      "eventos novos gravam o snapshot da sessão atual (sem conta: sem nome), sem herdar o autor antigo").toBe(true);
  });
});
