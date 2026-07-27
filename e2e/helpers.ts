import { expect, type Page } from "@playwright/test";

/**
 * Helpers para dirigir um app React Native rodando em react-native-web.
 *
 * Por que existem: RN não renderiza `<button>`. `Pressable` vira
 * `div[tabindex="0"]` e `Text` vira `div`. Os seletores semânticos do Playwright
 * (getByRole) não encontram nada. O app também não tem `testID` em lugar nenhum,
 * então o contrato é por TEXTO VISÍVEL — o que combina com o plano UI 2.0, que
 * determina que o conteúdo textual não muda, só a hierarquia visual. Um teste
 * que quebra aqui indica mudança de comportamento, não de estilo.
 */

/**
 * Elementos tocáveis VISÍVEIS.
 *
 * O `:visible` não é detalhe: o primeiro `[tabindex="0"]` do documento é o
 * seletor de idioma dentro de um menu fechado. Sem o filtro, qualquer espera
 * cai nesse elemento oculto e o teste falha por motivo errado.
 */
export const pressables = (page: Page) => page.locator('[tabindex="0"]:visible');

/**
 * Aperta o primeiro tocável visível cujo texto começa com `texto`.
 *
 * A comparação ignora maiúsculas de propósito. O app escreve vários rótulos em
 * caixa alta por CSS, não no conteúdo: o DOM guarda "Ferramentas" e a tela
 * mostra "FERRAMENTAS". O `hasText` do Playwright compara com o `textContent`
 * (o do DOM), enquanto o que se lê na tela é o `innerText` (já transformado).
 * Sem o `i`, o teste procura o que está na tela e não acha o que está no DOM.
 */
export async function press(page: Page, texto: string) {
  const alvo = pressables(page)
    .filter({ hasText: new RegExp(`^\\s*${escapar(texto)}`, "i") })
    .first();
  await expect(alvo, `tocável "${texto}" deveria existir`).toBeVisible();
  await alvo.click();
}

/** Texto corrente da tela inteira, normalizado. */
export async function texto(page: Page): Promise<string> {
  return (await page.locator("body").innerText()).replace(/ /g, " ");
}

/**
 * Lê um valor do painel de acompanhamento pelo rótulo acima dele
 * (ex.: rotulo "CHOQUES" devolve "1").
 */
export async function valorDoPainel(page: Page, rotulo: string): Promise<string | null> {
  const t = await texto(page);
  const m = t.match(new RegExp(`${escapar(rotulo)}\\n([^\\n]+)`));
  return m ? m[1].trim() : null;
}

/** Estado clínico corrente exibido no painel. */
export async function estadoAtual(page: Page): Promise<string | null> {
  return valorDoPainel(page, "ESTADO ATUAL");
}

/** Todos os cronômetros mm:ss visíveis, na ordem em que aparecem. */
export async function cronometros(page: Page): Promise<string[]> {
  return (await texto(page)).match(/\d{2}:\d{2}/g) ?? [];
}

/** Converte mm:ss em segundos. */
export const emSegundos = (mmss: string) => {
  const [m, s] = mmss.split(":").map(Number);
  return m * 60 + s;
};

/**
 * Abre um módulo com idioma fixado em português.
 *
 * O idioma é fixado antes do primeiro render: o app é bilíngue e os seletores
 * de texto quebrariam se um teste herdasse "es-419" de outro.
 */
export async function abrirModulo(page: Page, moduloId: string) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("app-locale", "pt-BR");
    } catch {
      /* modo privado — o padrão já é pt-BR */
    }
  });
  await page.goto(`/modulos/${moduloId}`);
  // Espera o app hidratar: o bundle é grande e o primeiro paint vem vazio.
  await expect
    .poll(async () => (await texto(page)).length, {
      message: `módulo "${moduloId}" deveria renderizar conteúdo`,
      timeout: 30_000,
    })
    .toBeGreaterThan(200);
}

/** Espera o estado clínico mudar para outro valor e devolve o novo. */
export async function esperarEstadoDiferenteDe(page: Page, anterior: string | null) {
  await expect
    .poll(async () => estadoAtual(page), {
      message: `estado deveria sair de "${anterior}"`,
    })
    .not.toBe(anterior);
  return estadoAtual(page);
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
