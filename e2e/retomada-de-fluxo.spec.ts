import { expect, test, type Page } from "@playwright/test";
import { pressables, texto } from "./helpers";

/**
 * Retomada de fluxo entre módulos.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Defeito relatado:
 *
 *   "estou em anafilaxia, vou para intubação em sequência rápida, depois não tem
 *    botão para voltar no ponto que eu estava de anafilaxia, se perde e tem que
 *    iniciar anafilaxia de novo"
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ## O que a sonda mostrou (e mudou o teste)
 *
 * Voltar com `router.back()` NÃO perde nada: a tela anterior segue montada na
 * pilha. O progresso morre quando a pilha é destruída — sair para o hub e
 * reabrir o módulo, ou o `router.replace` que o "← Anafilaxia" do módulo de
 * destino executa. É esse caminho que o teste percorre, com cliques reais.
 *
 * Nada de `page.goto` no meio do percurso: a sessão vive em memória
 * (lib/flow-session.ts) e uma carga de documento a apagaria — o teste passaria a
 * medir outra coisa. Recarregar a página apagar o progresso é comportamento
 * aceito e documentado: protocolo pela metade não deve ressuscitar.
 *
 * ## Duas armadilhas de medição, ambas já cobradas antes
 *
 * 1. `texto()` devolve `innerText`. O rótulo da barra tem `textTransform:
 *    uppercase`, então na tela é "VOCÊ ESTAVA AQUI" — comparação tem de ser
 *    insensível a caixa.
 * 2. A barra também escreve "Passo N". Ler o passo com um `/Passo (\d+)/` solto
 *    casava com a BARRA e não com o cabeçalho, e o teste dava verde sem o app
 *    ter retomado nada. O passo é lido do cabeçalho, pelo nome do módulo.
 */

const HUB = "/(tabs)";

async function irAoHub(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("app-locale", "pt-BR");
      window.localStorage.setItem("ui-v2", "all");
    } catch {
      /* modo privado */
    }
  });
  await page.goto(HUB);
  await expect.poll(async () => (await texto(page)).length, { timeout: 30_000 }).toBeGreaterThan(200);
}

async function abrirAnafilaxiaPeloHub(page: Page) {
  await pressables(page).filter({ hasText: /Anafilaxia/i }).first().click();
  await expect
    .poll(async () => (await texto(page)).includes("Passo"), { timeout: 30_000 })
    .toBe(true);
}

/** Passo do CABEÇALHO ("Anafilaxia · Passo N") — nunca o da barra de retomada. */
async function passoNoCabecalho(page: Page): Promise<number> {
  const achado = (await texto(page)).match(/Anafilaxia\s*·\s*Passo\s+(\d+)/);
  expect(achado, "o cabeçalho deveria exibir o módulo e o passo").not.toBeNull();
  return Number(achado![1]);
}

async function ofereceRetomada(page: Page): Promise<boolean> {
  return /você estava aqui/i.test(await texto(page));
}

/** Avança escolhendo a primeira opção que move o fluxo. */
async function avancar(page: Page, vezes: number) {
  for (let i = 0; i < vezes; i += 1) {
    const antes = await passoNoCabecalho(page);
    const opcao = pressables(page)
      .filter({ hasText: /^\s*(Sim|Não|Feito|Confirmar)/ })
      .first();
    if (!(await opcao.isVisible().catch(() => false))) return;
    await opcao.click();
    await expect
      .poll(async () => passoNoCabecalho(page), { timeout: 5_000, message: "o passo deveria avançar" })
      .toBeGreaterThan(antes);
  }
}

/** Sai do módulo para o hub pelo cabeçalho — o caminho que destrói a pilha. */
async function sairParaOHub(page: Page) {
  await pressables(page).filter({ hasText: /^←$/ }).first().click();
  await expect
    .poll(async () => (await texto(page)).includes("Passo"), { timeout: 15_000 })
    .toBe(false);
}

/** Texto da tela sem a barra de retomada, para comparar conteúdo clínico. */
function semABarra(bruto: string): string {
  return bruto
    .replace(/VOCÊ ESTAVA AQUI[\s\S]*?Começar do início/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

test("reabre o módulo e retoma no ponto onde estava", async ({ page }) => {
  await irAoHub(page);
  await abrirAnafilaxiaPeloHub(page);

  await avancar(page, 2);
  const passoAntes = await passoNoCabecalho(page);
  expect(passoAntes, "o teste precisa ter avançado para provar algo").toBeGreaterThan(1);
  const conteudoAntes = semABarra(await texto(page));

  await sairParaOHub(page);
  await abrirAnafilaxiaPeloHub(page);

  // Sem retomar, o fluxo começa do início — comportamento seguro por padrão.
  expect(await passoNoCabecalho(page), "deveria abrir no passo 1").toBe(1);
  expect(await ofereceRetomada(page), "deveria oferecer a retomada").toBe(true);
  expect(await texto(page), `a oferta deveria apontar o passo ${passoAntes}`).toMatch(
    new RegExp(`Passo\\s+${passoAntes}\\s*·`)
  );

  await pressables(page).filter({ hasText: /^Continuar$/ }).first().click();

  await expect
    .poll(async () => passoNoCabecalho(page), {
      timeout: 5_000,
      message: "o cabeçalho deveria voltar ao passo salvo",
    })
    .toBe(passoAntes);

  expect(await ofereceRetomada(page), "a barra deveria sair após retomar").toBe(false);

  // E é a MESMA etapa, não uma parecida: barra apontando o passo certo com
  // conteúdo de outro nó seria pior que barra nenhuma.
  expect(semABarra(await texto(page)), "o conteúdo clínico da etapa deveria ser o mesmo").toBe(
    conteudoAntes
  );
});

test("começar do início descarta o progresso e não reaparece", async ({ page }) => {
  await irAoHub(page);
  await abrirAnafilaxiaPeloHub(page);
  await avancar(page, 2);

  await sairParaOHub(page);
  await abrirAnafilaxiaPeloHub(page);
  expect(await ofereceRetomada(page)).toBe(true);

  await pressables(page).filter({ hasText: /^Começar do início$/ }).first().click();

  await expect.poll(async () => ofereceRetomada(page), { timeout: 5_000 }).toBe(false);
  expect(await passoNoCabecalho(page), "deveria seguir do início").toBe(1);

  // Descartar é definitivo: uma segunda ida e volta não ressuscita a oferta.
  await sairParaOHub(page);
  await abrirAnafilaxiaPeloHub(page);
  expect(await ofereceRetomada(page), "progresso descartado não deveria voltar").toBe(false);
});

test("no passo 1 não oferece retomada", async ({ page }) => {
  // Sem progresso não há o que retomar, e oferecer seria ruído numa tela que já
  // disputa espaço com o card de estabilização.
  await irAoHub(page);
  await abrirAnafilaxiaPeloHub(page);
  expect(await passoNoCabecalho(page)).toBe(1);

  await sairParaOHub(page);
  await abrirAnafilaxiaPeloHub(page);

  expect(await ofereceRetomada(page), "passo 1 não deveria oferecer retomada").toBe(false);
});

test("reiniciar o fluxo apaga a sessão salva", async ({ page }) => {
  // Tocar em "Recomeçar" é declarar que o caso anterior não interessa mais.
  await irAoHub(page);
  await abrirAnafilaxiaPeloHub(page);
  await avancar(page, 2);

  await pressables(page).filter({ hasText: /Recomeçar/i }).first().click();
  await expect.poll(async () => passoNoCabecalho(page), { timeout: 5_000 }).toBe(1);

  await sairParaOHub(page);
  await abrirAnafilaxiaPeloHub(page);
  expect(await ofereceRetomada(page), "fluxo reiniciado não deveria oferecer retomada").toBe(false);
});

test("o atalho de estabilização marca o módulo de origem na rota", async ({ page }) => {
  // `from_module` é o que permite ao destino oferecer a volta para a origem. Os
  // atalhos deste shell empurravam a rota crua — era metade do defeito.
  await irAoHub(page);
  await abrirAnafilaxiaPeloHub(page);
  await avancar(page, 1);

  await pressables(page).filter({ hasText: /Via aérea \/ IOT/i }).first().click();
  await expect
    .poll(() => page.url(), { timeout: 15_000, message: "deveria navegar para o outro módulo" })
    .toContain("isr-rapida");

  expect(page.url(), "o destino deveria receber a origem").toContain("from_module=anafilaxia");
});

test("nunca fica sem caminho de volta ao ponto — por qualquer rota", async ({ page }) => {
  /**
   * A INVARIANTE que resolve o defeito relatado, e a única afirmação que vale a
   * pena travar aqui.
   *
   * Se a tela anterior continua montada, o passo está intacto e não há nada a
   * oferecer. Se ela remontou, a barra tem de estar lá apontando o passo certo.
   * Uma das duas, sempre — o que o usuário não pode encontrar é a terceira
   * possibilidade: passo 1, sem barra, progresso perdido.
   *
   * Testar assim em vez de fixar "back() preserva a pilha" foi decisão
   * deliberada: eu ASSUMI que preservava, medi num caminho (módulo aberto
   * direto) e vi que sim, e num outro (aberto pelo hub) vi que não. Prender o
   * teste ao comportamento interno do expo-router o tornaria frágil e, pior,
   * deixaria de cobrir o que interessa clinicamente.
   */
  await irAoHub(page);
  await abrirAnafilaxiaPeloHub(page);
  await avancar(page, 2);
  const passoAntes = await passoNoCabecalho(page);

  await pressables(page).filter({ hasText: /Via aérea \/ IOT/i }).first().click();
  await expect.poll(() => page.url(), { timeout: 15_000 }).toContain("isr-rapida");

  await page.goBack();
  await expect
    .poll(async () => (await texto(page)).includes("Passo"), { timeout: 15_000 })
    .toBe(true);

  const passoDepois = await passoNoCabecalho(page);
  if (passoDepois === passoAntes) {
    // Pilha preservada: nada a retomar.
    expect(await ofereceRetomada(page), "nada a retomar quando nada se perdeu").toBe(false);
    return;
  }

  // Remontou: a barra é obrigatória, e tem de levar de volta ao passo certo.
  expect(
    await ofereceRetomada(page),
    `remontou no passo ${passoDepois} sem oferecer volta ao ${passoAntes}`
  ).toBe(true);
  await pressables(page).filter({ hasText: /^Continuar$/ }).first().click();
  await expect
    .poll(async () => passoNoCabecalho(page), { timeout: 5_000 })
    .toBe(passoAntes);
});
