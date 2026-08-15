import { expect, test } from "@playwright/test";
import { abrirModulo, esperarEstadoDiferenteDe, estadoAtual, press } from "./helpers";

/**
 * R-50 — O CONTEÚDO CHEGA À TELA, NO ESTADO EM QUE IMPORTA?
 *
 * Três correções desta auditoria estavam no arquivo, passavam em toda
 * conferência de texto, e NÃO APARECIAM. Nenhuma trava de conteúdo pegaria:
 * elas leem a fonte, e a fonte estava certa.
 *
 *   · FV fina — anexada aos `details` do motor. `toConciseDetails` corta em 3, e
 *     esta tela renderiza só `details[0]`. Dois truncamentos em série.
 *   · Apresentação da adrenalina — posta no card "PRÓXIMA EPINEFRINA", que por
 *     construção exige `administeredCount > 0`: só apareceria DEPOIS da 1ª
 *     dose, que é justamente a que alguém aspira sem saber que é a ampola
 *     inteira. A segunda tentativa caiu noutro caminho de render que também não
 *     era o exibido.
 *   · Card do Pós-PCR no ROSC — tirado do acordeão "RECURSOS ADICIONAIS" e
 *     posto DENTRO do painel "Ferramentas", que também é recolhido. Duplamente
 *     escondido.
 *
 * Nos três casos eu conhecia UM truncamento, corrigi para ele, e havia outro
 * adiante. Recolhimento e corte se acumulam em camadas — por isso a asserção é
 * de TELA RENDERIZADA, e no estado que importa, nunca no mais simples.
 *
 * ⚠️ ESTE ARQUIVO É LENTO DE PROPÓSITO (~2 min): a epinefrina só é oferecida no
 * rcp_2, depois do ciclo real de 2 minutos. Encurtar o cenário devolveria o
 * falso verde — a única forma de ver o botão é chegar até ele.
 */
test.describe("R-50 · o conteúdo chega à tela", () => {
  test("a ressalva da FV fina aparece na checagem de ritmo", async ({ page }) => {
    await abrirModulo(page, "pcr-adulto");
    let a = await estadoAtual(page);
    for (const b of ["Confirmar", "Sem pulso", "Iniciar RCP", "Ver ritmo"]) {
      await press(page, b);
      a = await esperarEstadoDiferenteDe(page, a).catch(() => a);
    }
    await expect(
      page.getByText(/aumente o GANHO do monitor/i).first(),
      "FV fina invisível no estado que decide chocável × não chocável"
    ).toBeVisible();
  });

  test("a apresentação da adrenalina aparece na 1ª dose OFERECIDA", async ({ page }) => {
    test.setTimeout(300_000);
    await abrirModulo(page, "pcr-adulto");
    let a = await estadoAtual(page);
    for (const b of ["Confirmar", "Sem pulso", "Iniciar RCP", "Ver ritmo", "Chocável", "Bifásico", "Afastar todos"]) {
      await press(page, b);
      a = await esperarEstadoDiferenteDe(page, a).catch(() => a);
    }
    // 2º ciclo: o app só oferece a epinefrina no rcp_2, após o ciclo de 2 min.
    for (let i = 0; i < 150; i += 1) {
      if (/Ver ritmo|Verificar ritmo/i.test(await page.locator("body").innerText())) break;
      await page.waitForTimeout(1000);
    }
    for (const b of ["Ver ritmo", "Chocável", "Afastar todos"]) {
      await press(page, b).catch(() => {});
      await page.waitForTimeout(800);
    }

    const txt = await page.locator("body").innerText();
    expect(txt, "o app não chegou a oferecer a epinefrina — cenário quebrado, não conteúdo ausente").toMatch(
      /Epinefrina/i
    );
    expect(
      txt,
      "a apresentação não aparece na dose OFERECIDA — é aqui que alguém aspira a ampola"
    ).toMatch(/UMA ampola inteira/i);
  });

  test("o card de Pós-PCR aparece no ROSC, sem abrir nenhum painel", async ({ page }) => {
    await abrirModulo(page, "pcr-adulto");
    let a = await estadoAtual(page);
    for (const b of ["Confirmar", "Sem pulso", "Iniciar RCP", "Ver ritmo"]) {
      await press(page, b);
      a = await esperarEstadoDiferenteDe(page, a).catch(() => a);
    }
    await press(page, "ROSC");
    await page.waitForTimeout(1200);
    // `>> visible=true`: a landing fica MONTADA sob todo módulo (anchor: index
    // em app/_layout.tsx), e um locator sem esse filtro pegava uma cópia oculta
    // dela — o teste falhava com "hidden" sobre um cartão que estava na tela,
    // medindo 296×15. Falso NEGATIVO, o espelho do falso verde: cuidado igual.
    await expect(
      page.locator("text=Cuidados pós-PCR >> visible=true").first(),
      "o ponteiro do Pós-PCR não aparece no ROSC sem abrir acordeão"
    ).toBeVisible();
  });
});
