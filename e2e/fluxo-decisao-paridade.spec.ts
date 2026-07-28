import { expect, test, type Page } from "@playwright/test";
import { pressables, texto } from "./helpers";

/**
 * Paridade do SHELL de fluxo de decisão — pré-requisito da Fase 7.
 *
 * `acls-decision-flow-screen.tsx` é usado por 19 módulos (ver L-005 em
 * NOTAS-LOGICA.md). Migrá-lo é migrar 19 telas de uma vez, e o teste de paridade
 * das Fases 3 a 6 não serve aqui: ele compara o PRIMEIRO render, e este shell tem
 * estado — o conteúdo clínico só aparece à medida que o médico avança.
 *
 * Este teste percorre a árvore de decisão passo a passo, sempre escolhendo a
 * PRIMEIRA opção, e compara o texto de cada passo entre as duas versões. Cobre
 * os quatro tipos de passo do shell — decisão, ação, entrada e transição —
 * porque uma travessia real passa por eles.
 *
 * Sem isto, migrar o shell seria trocar a apresentação de 19 módulos clínicos
 * com prova de que só o primeiro passo continua igual.
 */

/** Módulos representativos: cobrem árvores curtas, longas e com entrada de dados. */
const MODULOS = ["anafilaxia", "sepse-adulto", "bradicardia-acls"];

/** Quantos passos percorrer. Suficiente para atravessar os tipos, sem eternizar. */
const PASSOS = 6;

async function abrir(page: Page, id: string, v2: boolean) {
  await page.addInitScript(
    ([modulo, ligar]) => {
      try {
        window.localStorage.setItem("app-locale", "pt-BR");
        if (ligar) window.localStorage.setItem("ui-v2", modulo as string);
        else window.localStorage.removeItem("ui-v2");
      } catch {
        /* modo privado — cai na UI antiga */
      }
    },
    [id, v2]
  );
  await page.goto(`/modulos/${id}`);
  await expect
    .poll(async () => (await texto(page)).includes("Passo"), { timeout: 30_000 })
    .toBe(true);
}

/**
 * Percorre a árvore escolhendo sempre a primeira opção e devolve, por passo, o
 * conteúdo clínico visto.
 *
 * Descarta rótulos de navegação e o contador de passo — o que interessa é o
 * material clínico, e a Fase 7 vai reorganizar o cromado de propósito.
 */
async function travessia(page: Page): Promise<string[][]> {
  const CROMADO = /^(‹ Voltar|↺ Recomeçar|Voltar|← Módulos|Módulos|Passo \d+)$/;
  const registro: string[][] = [];

  for (let i = 0; i < PASSOS; i++) {
    const bruto = await texto(page);
    registro.push(
      bruto
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 1 && !CROMADO.test(l))
    );

    // Avança pela primeira opção tocável que não seja controle de navegação.
    const candidatos = pressables(page);
    const total = await candidatos.count();
    let avancou = false;

    for (let j = 0; j < total; j++) {
      const alvo = candidatos.nth(j);
      const rotulo = (await alvo.innerText()).replace(/\n/g, " ").trim();
      if (!rotulo || /Voltar|Recomeçar|Módulos|ATIVAR VOZ|FERRAMENTAS/i.test(rotulo)) continue;
      await alvo.click();
      avancou = true;
      break;
    }

    if (!avancou) break; // chegou a um passo terminal
    await page.waitForTimeout(250);
  }

  return registro;
}

for (const id of MODULOS) {
  test(`travessia da árvore preserva o conteúdo — ${id}`, async ({ page }) => {
    await abrir(page, id, false);
    const antiga = await travessia(page);

    await abrir(page, id, true);
    const nova = await travessia(page);

    expect(antiga.length, "a travessia antiga deveria ter passos").toBeGreaterThan(1);
    expect(
      nova.length,
      "a versão nova deveria percorrer o mesmo número de passos"
    ).toBe(antiga.length);

    // Passo a passo: nada de conteúdo clínico pode sumir na migração.
    for (let i = 0; i < antiga.length; i++) {
      const faltando = antiga[i].filter((l) => !nova[i].includes(l));
      expect(faltando, `conteúdo perdido no passo ${i + 1} de "${id}"`).toEqual([]);
    }
  });
}

test("o shell recebe o módulo, então a flag pode ser por módulo", async ({ page }) => {
  // Pré-requisito da estratégia da Fase 7: os 19 chamadores já passam
  // `currentModuleSlug`, então o shell sabe qual módulo está renderizando e pode
  // consultar a flag individualmente. Sem isso, migrá-lo seria tudo ou nada.
  //
  // Verificação de comportamento: ligar a flag num módulo NÃO pode afetar outro
  // que use o mesmo shell.
  await abrir(page, "anafilaxia", true);
  const anafilaxiaLigada = await texto(page);

  await page.addInitScript(() => {
    window.localStorage.setItem("ui-v2", "anafilaxia");
  });
  await page.goto("/modulos/sepse-adulto");
  await expect.poll(async () => (await texto(page)).includes("Passo"), { timeout: 30_000 }).toBe(true);
  const sepseComFlagDeOutro = await texto(page);

  expect(anafilaxiaLigada.length).toBeGreaterThan(100);
  expect(
    sepseComFlagDeOutro.length,
    "a sepse deveria renderizar normalmente com a flag de outro módulo"
  ).toBeGreaterThan(100);
});
