import { expect, test, type Page } from "@playwright/test";
import { pressables, texto } from "./helpers";

/**
 * Contrato comum de TODA tela migrada para a UI 2.0 (Fases 3, 4 e 6).
 *
 * Parametrizado de propósito: cada tela nova entra na lista abaixo e herda as
 * quatro verificações. Duplicar spec por tela levaria a coberturas diferentes
 * entre módulos — e a que ficasse mais fraca seria justamente a que ninguém
 * revisou.
 *
 * A verificação central é a paridade de conteúdo: mesma rota, flag ligada e
 * desligada, texto clínico idêntico. É o que prova que a migração mexeu só na
 * apresentação — mais do que qualquer screenshot.
 */

type TelaMigrada = {
  /** Id do módulo em clinical-modules.ts (e valor da flag). */
  id: string;
  /** Título que o cabeçalho compacto deve mostrar. */
  titulo: string;
  /** Texto clínico que precisa existir nas duas versões — prova que carregou. */
  marcadorClinico: string;
  /**
   * Rótulos de NAVEGAÇÃO que existem só numa das versões porque a Fase 4
   * colapsou três cabeçalhos em um. Lista FECHADA por tela: excluir "o que
   * difere" transformaria o teste num carimbo.
   */
  rotulosDeCromado: string[];
};

const TELAS: TelaMigrada[] = [
  {
    id: "ritmos-acls",
    titulo: "Ritmos de Parada",
    marcadorClinico: "Fibrilação Ventricular",
    rotulosDeCromado: ["Voltar", "ACLS", "Módulos", "← Módulos", "Referência", "Ritmos de Parada"],
  },
  {
    id: "farmacologia-acls",
    titulo: "Farmacologia no ACLS",
    marcadorClinico: "Adrenalina",
    rotulosDeCromado: [
      "Voltar",
      "ACLS",
      "Módulos",
      "← Módulos",
      "Referência",
      "Farmacologia",
      "Farmacologia no ACLS",
    ],
  },
  {
    id: "pos-pcr-acls",
    titulo: "Cuidados Pós-PCR",
    // Título de domínio, que nenhuma das versões transforma em caixa alta —
    // "Metas imediatas" não serve: o estilo antigo aplica uppercase por CSS.
    marcadorClinico: "Ventilação e Oxigenação",
    rotulosDeCromado: [
      "Voltar",
      "ACLS",
      "Módulos",
      "← Módulos",
      "Referência",
      "Pós-PCR",
      "Cuidados Pós-PCR",
    ],
  },
  {
    id: "causas-reversiveis-acls",
    titulo: "Causas Reversíveis",
    marcadorClinico: "Hipovolemia",
    rotulosDeCromado: [
      "Voltar",
      "ACLS",
      "Módulos",
      "← Módulos",
      "Hs e Ts",
      "5 Hs e 5 Ts",
      "Causas Reversíveis",
    ],
  },
];

async function abrir(page: Page, id: string, v2: boolean) {
  await page.addInitScript(
    ([modulo, ligar]) => {
      try {
        window.localStorage.setItem("app-locale", "pt-BR");
        if (ligar) window.localStorage.setItem("ui-v2", modulo as string);
        // "off" explícito: a UI 2.0 agora é o PADRÃO, então remover a chave devolveria
        // a versão nova. Para comparar com a antiga é preciso desligá-la.
        else window.localStorage.setItem("ui-v2", "off");
      } catch {
        /* modo privado — cai na UI antiga */
      }
    },
    [id, v2]
  );
  await page.goto(`/modulos/${id}`);
  await expect
    .poll(async () => (await texto(page)).length, { timeout: 30_000 })
    .toBeGreaterThan(500);
}

/**
 * Conteúdo clínico do CORPO ROLÁVEL, sem cabeçalho nem landing.
 *
 * A landing fica montada sob todo módulo (`anchor: index` em app/_layout.tsx), e
 * o cabeçalho é justamente o que a Fase 4 reorganizou — na versão nova o título
 * saiu do corpo e foi para a linha de cabeçalho. Comparar cabeçalho contra corpo
 * mediria a mudança de projeto, não perda de conteúdo. O título é verificado em
 * teste próprio.
 */
async function conteudoClinico(page: Page, tela: TelaMigrada): Promise<string[]> {
  const bruto = await page.evaluate(
    `(() => {
      const marcador = ${JSON.stringify(tela.marcadorClinico)};
      const roladores = [...document.querySelectorAll("div")].filter(
        (e) => e.scrollHeight > e.clientHeight + 100 && e.clientHeight > 200
      );
      const corpo = roladores.find((e) => (e.innerText || "").includes(marcador));
      return (corpo ?? document.body).innerText;
    })()`
  );

  const cromado = new Set(tela.rotulosDeCromado);
  return String(bruto)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && !cromado.has(l));
}

for (const tela of TELAS) {
  test.describe(`Tela migrada — ${tela.id}`, () => {
    test("a flag desligada mantém a tela antiga", async ({ page }) => {
      await abrir(page, tela.id, false);
      const t = await texto(page);
      expect(t).toContain(tela.marcadorClinico);
    });

    test("a flag ligada renderiza a tela nova sem erro", async ({ page }) => {
      const erros: string[] = [];
      page.on("pageerror", (e) => erros.push(e.message));

      await abrir(page, tela.id, true);
      expect(await texto(page)).toContain(tela.marcadorClinico);
      expect(erros, "a tela migrada não deveria lançar exceção").toEqual([]);
    });

    test("o conteúdo clínico é idêntico nas duas versões", async ({ page }) => {
      await abrir(page, tela.id, false);
      const antiga = await conteudoClinico(page, tela);

      await abrir(page, tela.id, true);
      const nova = await conteudoClinico(page, tela);

      expect(antiga.length, "a tela antiga deveria ter conteúdo").toBeGreaterThan(5);

      // Comparação por conjunto: reorganizar a hierarquia visual é permitido,
      // perder ou inventar conteúdo clínico não é.
      expect(
        antiga.filter((l) => !nova.includes(l)),
        "conteúdo clínico perdido na migração"
      ).toEqual([]);
      expect(
        nova.filter((l) => !antiga.includes(l)),
        "conteúdo que só existe na versão nova"
      ).toEqual([]);
    });

    test("o cabeçalho é compacto e o conteúdo começa perto do topo", async ({ page }) => {
      await abrir(page, tela.id, true);

      // Fase 4: três camadas de cabeçalho (191 px, 27% da tela) viraram uma.
      const inicioDoConteudo = await page.evaluate(
        `(() => {
          const marcador = ${JSON.stringify(tela.marcadorClinico)};
          const roladores = [...document.querySelectorAll("div")].filter(
            (e) => e.scrollHeight > e.clientHeight + 100 && e.clientHeight > 200
          );
          const corpo = roladores.find((e) => (e.innerText || "").includes(marcador));
          return corpo ? Math.round(corpo.getBoundingClientRect().top) : -1;
        })()`
      );

      expect(Number(inicioDoConteudo)).toBeGreaterThan(0);
      expect(
        Number(inicioDoConteudo),
        "acima de 100 px significa camadas de cabeçalho empilhadas de volta"
      ).toBeLessThan(100);

      const t = await texto(page);
      expect(t, "o título do módulo deveria estar visível").toContain(tela.titulo);
    });

    test("todo tocável respeita o alvo de 44 px", async ({ page }) => {
      await abrir(page, tela.id, true);

      const alvos = pressables(page);
      const total = await alvos.count();
      const pequenos: string[] = [];

      for (let i = 0; i < total; i++) {
        const caixa = await alvos.nth(i).boundingBox();
        if (!caixa) continue;
        if (caixa.height < 43 || caixa.width < 43) {
          const rotulo = (await alvos.nth(i).innerText()).replace(/\n/g, " ").slice(0, 30);
          // Seta do cabeçalho do expo-router: 30×30, cromado do framework (L-004).
          if (/^←?\s*$/.test(rotulo)) continue;
          pequenos.push(`"${rotulo}" ${Math.round(caixa.width)}×${Math.round(caixa.height)}`);
        }
      }

      expect(pequenos, "alvo de toque abaixo de 44 px").toEqual([]);
    });
  });
}
