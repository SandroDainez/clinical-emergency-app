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

/**
 * R-53 — o fluxo pós-ROSC é ALCANÇÁVEL, e cada meta aparece no seu estado.
 *
 * Os seis estados `pos_rosc_*` existiam no motor e eram INALCANÇÁVEIS pela
 * navegação principal: em `pos_rosc` a única ação de documentação é `rearrest`,
 * e o fallback `actions[0]` a promovia a ação primária — o botão herói exibia
 * "Cuidar ROSC" (de `primaryActionLabel`) e executava re-parada (de
 * `getPrimaryDocumentationAction`). Rótulo e handler de fontes independentes.
 *
 * O teste percorre os seis e confirma a meta de cada um. Se alguém reintroduzir
 * o fallback destrutivo, o percurso trava no primeiro estado e isto falha.
 */
test.describe("R-53 · o fluxo pós-ROSC anda e mostra as metas", () => {
  test("os seis estados são alcançáveis e cada meta aparece no seu", async ({ page }) => {
    test.setTimeout(180_000);
    // Se a confirmação de re-parada aparecer, RECUSAR: o percurso não deve
    // depender dela, e um diálogo aceito reiniciaria a RCP e mascararia a falha.
    page.on("dialog", (d) => d.dismiss());

    await abrirModulo(page, "pcr-adulto");
    let a = await estadoAtual(page);
    for (const b of ["Confirmar", "Sem pulso", "Iniciar RCP", "Ver ritmo"]) {
      await press(page, b);
      a = await esperarEstadoDiferenteDe(page, a).catch(() => a);
    }
    await press(page, "ROSC");
    await page.waitForTimeout(900);

    const vistos: string[] = [];
    for (let i = 0; i < 8; i += 1) {
      const txt = await page.locator("body").innerText();
      const estado = (await estadoAtual(page)) ?? "";
      vistos.push(`${estado} :: ${/METAS/.test(txt) ? "com metas" : "sem metas"}`);

      if (/Via aérea, oxigenação/i.test(estado)) expect(txt).toMatch(/OXIGENAÇÃO/);
      if (/Hemodinâmica/i.test(estado)) {
        expect(txt, "a história do alvo de PAM 80 sumiu").toMatch(/AHA\/Neurocritical/);
        expect(txt, "a incerteza declarada da glicemia sumiu").toMatch(/INCERTO/);
      }
      if (/Controle neurológico/i.test(estado)) {
        expect(txt, "a distinção 36 h × 72 h sumiu").toMatch(/PREVENIR FEBRE/);
      }

      const anterior = estado;
      const cta = page
        .locator("div[tabindex]:visible, [role=button]:visible, button:visible")
        .filter({ hasText: /^\s*Cuidar ROSC\s*$/ })
        .first();
      if ((await cta.count()) === 0) break;
      await cta.click({ force: true });
      await esperarEstadoDiferenteDe(page, anterior).catch(() => {});
      await page.waitForTimeout(300);
    }

    expect(
      vistos.filter((v) => /Via aérea|Hemodinâmica|neurológico/i.test(v)).length,
      `o fluxo pós-ROSC não percorreu os estados de metas — visitados: ${vistos.join(" | ")}`
    ).toBeGreaterThanOrEqual(3);
  });
});

/**
 * OVACE → PCR: a rota inteira, na tela.
 *
 * A particularidade da RCP no engasgo vivia só no módulo de OVACE — a
 * superfície de onde a pessoa SAI. Este teste percorre a rota e confirma que
 * ela existe também do outro lado, onde o corpo estranho ainda está.
 */
test.describe("OVACE · a rota até a PCR leva a particularidade junto", () => {
  test("o módulo tem a sequência 2025 e a ponte; a PCR recebe o card", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/modulos/ovace-adulto");
    await page.waitForTimeout(1500);

    /**
     * ⚠️ A TELA VIROU COCKPIT COM ESTADOS (`refactor(ovace)`) — antes era linear
     * e uma leitura só via tudo. O teste ⛔ não afrouxou: ele PERCORRE os estados
     * e cobra cada texto onde ele de fato mora. Ler a tela inicial e exigir o
     * conteúdo da RCP passaria a testar a ausência de navegação, ⛔ e não a
     * presença do conteúdo.
     */
    const tela = () => page.locator("body").innerText();
    /**
     * ⚠️ TOCA EM BOTÃO, ⛔ e não em texto: "Perdeu a consciência" também aparece
     * DENTRO da frase de reavaliação ("Objeto saiu? Perdeu a consciência? Se
     * não: repita…"), que vem ANTES do botão na ordem do DOM. Um `text=` com
     * `.first()` pegava a frase ⛔ e o estado nunca mudava.
     */
    const tocar = async (rotulo: string) => {
      await page.getByRole("button", { name: rotulo, exact: true }).first().click();
      await page.waitForTimeout(600);
    };

    // Estado 1 · reconhecimento: a decisão que classifica a obstrução.
    expect(await tela(), "a decisão de classificação sumiu").toMatch(
      /A obstrução é leve, grave ou já houve inconsciência\?/
    );

    // Estado 2 · obstrução grave: a sequência 2025 — golpes ANTES das compressões.
    await tocar("Tosse fraca/ausente ou não consegue falar");
    const grave = await tela();
    expect(grave, "a sequência de 2025 sumiu — os golpes nas costas vêm primeiro").toMatch(/5 golpes nas costas/);
    expect(grave, "a compressão abdominal sumiu do ciclo 5 + 5").toMatch(/5 compressões ABDOMINAIS/);
    expect(grave, "a posição da compressão abdominal sumiu").toMatch(/ACIMA DO UMBIGO/);

    // Estado 3 · inconsciência: a particularidade da RCP no engasgo.
    await tocar("Perdeu a consciência");
    const inconsciente = await tela();
    expect(inconsciente, "a particularidade da RCP não aparece no módulo").toMatch(/A RCP É A PADRÃO/);
    expect(inconsciente, "a boca examinada antes das ventilações sumiu").toMatch(/APÓS CADA 30 COMPRESSÕES/);
    expect(inconsciente, "a ressalva de nunca varrer às cegas sumiu").toMatch(
      /NUNCA faça varredura digital às cegas/
    );

    // A ponte: navega para a PCR pré-marcando a hipóxia.
    await page.locator("text=Abrir PCR no adulto >> visible=true").first().click();
    await page.waitForTimeout(2500);

    const pcr = await page.locator("body").innerText();
    expect(
      pcr,
      "a PCR não recebeu o card do corpo estranho — a particularidade ficou na superfície de onde a pessoa saiu"
    ).toMatch(/VIA AÉREA POR CORPO ESTRANHO/);
    expect(pcr, "a particularidade chegou sem o texto").toMatch(/APÓS CADA 30 COMPRESSÕES/);
  });
});
