import { expect, test } from "@playwright/test";

/**
 * PROMETE: que o **HTML do build** — ⛔ o primeiro quadro, ⛔ antes de ⛔ qualquer
 *   JavaScript — ⛔ já seja a **UI 2.0** nas sete rotas da família ACLS.
 *
 * NÃO PROMETE: que a UI 2.0 esteja certa. ⛔ Quem mede conteúdo clínico são os
 *   e2e de cada módulo; ⛔ quem mede hidratação é `hidratacao-limpa`.
 *
 * UNIVERSO: o HTML servido em `/modulos/*` — ⛔ buscado por **requisição**, ⛔ e
 *   ⛔ não por navegador: ⛔ um `page.goto` já teria rodado o efeito ⛔ e trocado
 *   a tela, ⛔ e ⛔ o teste mediria o **segundo** quadro achando que é o primeiro.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO QUE ISTO FECHA (2026-09-08) ────────────────────────
 *
 * ⛔ ⛔ `isUiV2Enabled` (⛔ depois da montagem) usava `PADRAO = "all"`; ⛔ a
 * leitura de ambiente usava `"off"`. ⚠️ ⛔ As duas respondiam a **mesma**
 * pergunta com respostas **opostas**.
 *
 * ⛔ Consequência: ⛔ o build ⛔ e o primeiro quadro do cliente desenhavam a UI
 * **antiga** — ⛔ que ⛔ nenhum usuário via —, ⛔ e o efeito trocava **o módulo
 * inteiro** logo depois. ⚠️ ⛔ Todo módulo ACLS pagava um **render descartado**
 * ⛔ em cima de aparelho de plantão.
 */

/**
 * ⚠️⚠️⚠️ ⛔ O MARCADOR FOI **MEDIDO**, ⛔ E ⛔ NÃO ESCOLHIDO DE MEMÓRIA.
 *
 * ⛔ ⛔ A primeira versão desta trava usava *"AHA ACLS"* — ⛔ e ⛔ ela reprovou
 * seis rotas **corretas**. ⚠️ *"AHA ACLS"* é **citação de fonte**
 * (*"Baseado em AHA ACLS 2025"*), ⛔ e ⛔ ela existe nas duas UIs. ⛔ A frase
 * parecia marcador ⛔ porque, em `pcr-adulto`, ⛔ ela também era o eyebrow do
 * hero antigo.
 *
 * ⚠️⚠️ ⛔ O marcador de verdade veio de **diferença de HTML** entre os dois
 * builds: ⛔ a **única** frase que some nas **sete** rotas é `Voltar` — ⛔ o
 * rótulo do cabeçalho antigo. ⛔ O `Header` da UI 2.0 desenha `←`.
 *
 * ⚠️ ⛔ E ⛔ ele é **de rota**, ⛔ e ⛔ não do app: ⛔ o AVC tem cabeçalho próprio
 * ⛔ e escreve *"‹ Voltar"* ⛔ legitimamente.
 */
const CABECALHO_ANTIGO = ">Voltar<";

/** ⚠️ As sete que mudaram — ⛔ medidas por diferença de HTML, ⛔ e ⛔ não supostas. */
const ROTAS_ACLS = [
  "/modulos/pcr-adulto",
  "/modulos/bradicardia-acls",
  "/modulos/taquicardia-acls",
  "/modulos/ritmos-acls",
  "/modulos/farmacologia-acls",
  "/modulos/causas-reversiveis-acls",
  "/modulos/pos-pcr-acls",
] as const;

test.describe("o primeiro quadro já é a UI 2.0", () => {
  for (const rota of ROTAS_ACLS) {
    test(`⛔ ${rota} — o HTML do build ⛔ NÃO traz o cabeçalho antigo`, async ({ request, baseURL }) => {
      const r = await request.get(`${baseURL}${rota}`);
      expect(r.status()).toBe(200);
      const html = await r.text();

      /** ⚠️ ⛔ É pré-render de verdade — ⛔ e ⛔ não uma casca vazia. */
      expect(html.length, `${rota}: HTML curto demais para ser pré-render`).toBeGreaterThan(20_000);
      expect(
        html.includes(CABECALHO_ANTIGO),
        `${rota} traz o cabeçalho da UI antiga no HTML do build`
      ).toBe(false);
    });
  }

  /**
   * ⚠️⚠️ ⛔ E ⛔ NÃO BASTA A AUSÊNCIA: ⛔ uma página em branco também ⛔ não traz
   * o cabeçalho antigo. ⛔ Tem de trazer o painel **novo**.
   */
  test("⛔ e o HTML do build traz o painel da UI 2.0", async ({ request, baseURL }) => {
    const html = await (await request.get(`${baseURL}/modulos/pcr-adulto`)).text();
    for (const frase of ["Tempo de parada", "CHOQ", "EPI"]) {
      expect(html.includes(frase), `/modulos/pcr-adulto não traz «${frase}»`).toBe(true);
    }
    /** ⚠️ ⛔ E as métricas do hero antigo ⛔ não voltaram junto. */
    for (const frase of ["ACLS · Emergência", "ACLS para decisão e registro"]) {
      expect(html.includes(frase), `/modulos/pcr-adulto traz «${frase}», do hero antigo`).toBe(false);
    }
  });

  /**
   * ⚠️⚠️⚠️ ⛔ E O AVC ⛔ NÃO FOI TOCADO — ⛔ ele ⛔ não consulta esta flag, ⛔ e a
   * medição de HTML confirmou: ⛔ o pré-render dele ficou **idêntico**.
   *
   * ⚠️ ⛔ Por isso ⛔ aqui a garantia é **positiva**: ⛔ o cabeçalho dele continua
   * ⛔ ali, ⛔ com a palavra que o marcador acima proíbe nas outras sete.
   */
  test("⛔ o AVC continua fora desta flag, ⛔ e com o cabeçalho dele", async ({ request, baseURL }) => {
    const r = await request.get(`${baseURL}/modulos/avc`);
    expect(r.status()).toBe(200);
    const html = await r.text();
    expect(html.includes("AVC isquêmico agudo"), "/modulos/avc perdeu o próprio título").toBe(true);
    expect(html.includes("Voltar"), "/modulos/avc perdeu o próprio cabeçalho").toBe(true);
  });
});
