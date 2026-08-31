import { defineConfig, devices } from "@playwright/test";

/**
 * E2E de não-regressão (Fase 0.2 do plano UI 2.0).
 *
 * Roda contra o build web exportado (dist/), servido por scripts/serve-dist.cjs.
 * O app é React Native rodando via react-native-web: `Pressable` vira
 * `div[tabindex="0"]`, não `<button>` — por isso os helpers em e2e/helpers.ts.
 *
 *   npm run build:web && npm run test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  /**
   * ⚠️⚠️ ARTEFATOS FORA DO REPOSITÓRIO — e ⛔ não é arrumação.
   *
   * ⛔ O repositório vive em `~/Documents`, sincronizado pelo iCloud. O
   * Playwright escrevia em `test-results/` a cada execução, e o iCloud criava
   * **cópias de conflito** — `test-results 2/`, ` 3/`, ` 4/`, ` 5/` — durante a
   * própria suíte.
   *
   * ⚠️⚠️ E pasta duplicada é pior que arquivo: `/test-results/` está no
   * `.gitignore`, ⛔ mas `test-results 5/` ⛔ **não casa com esse padrão** — então
   * entraria no commit ⛔ inteira, com os artefatos dentro.
   *
   * ⚠️ Escrever fora da árvore sincronizada corta o problema na origem, em vez
   * de apagar a cópia depois de cada rodada.
   */
  outputDir: "/tmp/playwright-clinical-emergency",
  // Estado clínico é sequencial (timers, máquina de estados): sem paralelismo
  // dentro do arquivo para o teste ler o que ele mesmo produziu.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Emergência é mobile-first: o contrato é validado no tamanho real de uso.
    ...devices["Pixel 7"],
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "node scripts/serve-dist.cjs 4173",
        url: "http://localhost:4173",
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
