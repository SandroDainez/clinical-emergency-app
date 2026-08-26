import { test, expect } from "@playwright/test";

/**
 * PROMETE: que abrir a ferramenta auxiliar (a calculadora de vasoativos) a
 *   partir do nó de terapia da SCA leve ao módulo certo e que a volta
 *   REAPRESENTE o mesmo nó, com o mesmo conteúdo clínico — sem avançar e sem
 *   reiniciar.
 * NÃO PROMETE: o estado interno do motor após o ciclo — isso é
 *   `test:ferramenta-auxiliar`, que mede valores, trilha, decisões e ações.
 *   Aqui se mede o que o médico VÊ.
 *
 * ── POR QUE ESTE ARQUIVO EXISTE, tendo a trava estrutural ─────────────────
 *
 * A trava prova que `motor.getCurrentNode()` volta a `terapia_vereditos`. Isso
 * é o motor. A REAPRESENTAÇÃO depende do shell — de `retomar()` chamar `sync()`
 * com o passo restaurado. São duas coisas diferentes, e o autor perguntou
 * exatamente pela segunda: "deve reapresentar terapia_vereditos".
 */

test.use({ viewport: { width: 390, height: 780 } });

const texto = (page: any) => page.locator("body").innerText();

async function irAteTerapia(page: any) {
  await page.goto("http://localhost:8099/modulos/sindromes-coronarianas");
  await page.waitForTimeout(4000);
  await page.getByText(/Já tenho o ECG na mão/i).first().click();
  await page.waitForTimeout(1400);

  for (let i = 0; i < 16; i++) {
    const t = await texto(page);
    if (/Terapia anti-isquêmica/.test(t)) return true;

    const ehInput = (await page.getByTestId("passo-de-entrada").count()) > 0;
    if (ehInput) {
      for (let volta = 0; volta < 8; volta++) {
        const chips = page.getByText("Não", { exact: true });
        const n = await chips.count();
        for (let k = 0; k < n; k++) { try { await chips.nth(k).click({ timeout: 500 }); } catch {} }
        // o bloco de ritmo não tem "Não" — responde "Sinusal"
        const sinusal = page.getByText("Sinusal", { exact: true });
        if (await sinusal.count()) { try { await sinusal.first().click({ timeout: 500 }); } catch {} }
        // nem a cobrança do ECG, que responde "Ainda não" (tela nova de
        // 2026-08-26, atravessada por todo atalho agudo)
        const semEcg = page.getByText("Ainda não", { exact: true });
        if (await semEcg.count()) { try { await semEcg.first().click({ timeout: 500 }); } catch {} }
        await page.waitForTimeout(200);
        if (!(await texto(page)).includes("Falta")) break;
        await page.mouse.wheel(0, 320);
        await page.waitForTimeout(220);
      }
    } else {
      const linhas = (await texto(page)).split("\n").map((l: string) => l.trim())
        .filter((l: string) => /^Não/.test(l) && !/não sei|Não sei/i.test(l));
      if (linhas.length) {
        try {
          const op = page.getByText(linhas[0], { exact: true }).first();
          await op.scrollIntoViewIfNeeded({ timeout: 800 });
          await op.click({ timeout: 1200 });
          await page.waitForTimeout(1000);
          continue;
        } catch {}
      }
    }
    let clicou = false;
    for (const rx of [/Confirmar — continuar/, /Confirmar e continuar/]) {
      const b = page.getByText(rx).first();
      if (await b.count()) {
        try { await b.scrollIntoViewIfNeeded({ timeout: 700 }); await b.click({ timeout: 1200 }); clicou = true; break; } catch {}
      }
    }
    if (!clicou) return false;
    await page.waitForTimeout(1000);
  }
  return false;
}

test("abrir a calculadora e voltar reapresenta o mesmo passo", async ({ page }) => {
  const chegou = await irAteTerapia(page);
  expect(chegou, "o roteiro precisa alcançar o nó de terapia para provar algo").toBe(true);

  const antes = await texto(page);
  expect(antes).toContain("Terapia anti-isquêmica");

  // ── ida ────────────────────────────────────────────────────────────────
  const botao = page.getByTestId("ferramenta-drogas-vasoativas");
  await expect(botao, "o botão da ferramenta deveria estar no nó de terapia").toHaveCount(1);
  await botao.scrollIntoViewIfNeeded();
  await botao.click();
  await page.waitForTimeout(2500);

  expect(page.url(), "deveria abrir a calculadora de vasoativos").toContain("drogas-vasoativas");
  expect(page.url(), "e levar a origem, para haver caminho de volta").toContain("from_module");

  // ── volta PELO CAMINHO DO APP ─────────────────────────────────────────
  //
  // ⚠️ NÃO É `goBack()` DO NAVEGADOR, e a diferença é real: `goBack` recarrega
  // a página, e a sessão de fluxo vive num Map em MEMÓRIA — por decisão
  // deliberada, documentada em `lib/flow-session.ts` ("fechar o app apaga
  // tudo; um protocolo pela metade não deve ressuscitar no dia seguinte, com
  // outro paciente na frente"). O caminho de volta do app é o botão de
  // origem, que o `from_module` desenha e que navega sem recarregar.
  // O botão de origem é a seta do cabeçalho, desenhada porque o
  // `from_module` chegou na URL.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.mouse.click(28, 30);   // a seta do cabeçalho
  await page.waitForTimeout(3500);

  const depois = await texto(page);

  // ⚠️ VOLTA DE FERRAMENTA REAPRESENTA DIRETO — sem a confirmação de retomada
  // (decisão do autor, 2026-08-25). Voltar de outro MÓDULO continua
  // perguntando, e é certo que pergunte: pode ter passado tempo, pode ser
  // outro paciente. Mas o médico que tocou "abrir calculadora" e voltou dez
  // segundos depois não precisa confirmar que quer continuar o que estava
  // fazendo — isso é fricção sem risco.
  expect(depois, "não deveria mostrar a confirmação de retomada").not.toMatch(/VOCÊ ESTAVA AQUI/i);
  expect(depois, "deveria reapresentar o nó de terapia direto").toContain("Terapia anti-isquêmica");
  expect(depois, "com os vereditos recalculados na tela").toMatch(/Nitrato|Betabloqueador/);

  // E o passo é o MESMO — não avançou nem reiniciou.
  expect(depois, "não pode ter avançado nem voltado ao passo 1").not.toMatch(/Passo 1\b/);
});

// ⚠️ A CONTRAPROVA — que os módulos clínicos NÃO ganharam a volta automática —
// não cabe aqui, e o motivo é técnico: reproduzi-la exigiria sair e voltar sem
// recarregar a página, porque a sessão de fluxo vive num Map em memória e um
// `goto` a mata. Ela é coberta em dois lugares:
//
//   · `e2e/retomada-de-fluxo.spec.ts` prova, no app real, que a confirmação
//     "VOCÊ ESTAVA AQUI / Continuar" continua aparecendo na navegação normal;
//   · `test:ferramenta-auxiliar` prova estruturalmente que `return_mode=
//     auxiliary` só é produzido pelo caminho da ferramenta, e que a retomada
//     automática só acontece com esse marcador presente.
