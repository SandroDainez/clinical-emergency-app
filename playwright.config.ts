import { defineConfig, devices } from "@playwright/test";
/**
 * ⚠️ A VERSÃO VEM DA FONTE, ⛔ e ⛔ não é redigitada aqui: se `VERSAO_DO_TEXTO`
 * subir ⛔ e esta cópia ficasse para trás, a suíte continuaria "aceitando" uma
 * versão que ⛔ não existe mais — ⛔ e o aviso de que o texto mudou se perderia.
 */
import { VERSAO_DO_TEXTO } from "./lib/consentimento";

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
    /**
     * ⚠️⚠️ CONSENTIMENTO PRÉ-ACEITO EM TODA A SUÍTE — ⛔ e ⛔ não spec a spec.
     *
     * O aceite ("Li e estou ciente") precede ⛔ todo conteúdo clínico. Sem isto,
     * ⛔ cada teste de módulo mediria a **parede**, ⛔ e ⛔ não a tela que veio
     * medir — ⛔ e a primeira tentativa (pré-aceitar dentro de `fixarIdioma`)
     * deixou 10 testes de fora, os que fazem `page.goto` direto.
     *
     * ⚠️ `storageState` injeta o localStorage ⛔ antes do primeiro quadro, em
     * ⛔ todos os testes, ⛔ sem depender de disciplina de import.
     *
     * ⚠️⚠️ A CHAVE CARREGA A VERSÃO, ⛔ de propósito: mudou o texto do aviso ⛔ e
     * subiu `VERSAO_DO_TEXTO`, esta chave para de casar ⛔ e a suíte bate na
     * parede de novo — que é o aviso que se quer. ⛔ Um "aceita qualquer versão"
     * esconderia a mudança.
     *
     * ⛔ `e2e/consentimento.spec.ts` ANULA isto com `test.use`, ⛔ porque é ele
     * quem mede a parede.
     */
    storageState: {
      cookies: [],
      origins: [
        {
          origin: process.env.E2E_BASE_URL || "http://localhost:4173",
          localStorage: [{ name: `consentimento-clinico:${VERSAO_DO_TEXTO}`, value: "1" }],
        },
      ],
    },
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
