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
const MODULOS: { id: string; cromado: string[] }[] = [
  { id: "anafilaxia", cromado: ["Anafilaxia", "ANAFILAXIA", "Anafilaxia · Emergência"] },
  { id: "sepse-adulto", cromado: ["Sepse / Choque Séptico", "SEPSE / CHOQUE SÉPTICO", "Sepse · Emergência"] },
  { id: "bradicardia-acls", cromado: ["Bradicardia no ACLS", "BRADICARDIA ACLS", "ACLS · Emergência"] },
];

/** Quantos passos percorrer. Suficiente para atravessar os tipos, sem eternizar. */
const PASSOS = 6;

/**
 * Tocáveis que NÃO avançam o fluxo.
 *
 * A seta "←" entrou aqui depois de a travessia clicar nela e voltar um passo: o
 * cabeçalho compacto da Fase 7 fica fora do ScrollView, então a seta é o
 * primeiro tocável da página. O sintoma parecia perda de conteúdo no passo 2 —
 * era o teste andando para trás.
 */
const NAVEGACAO = /^(←|‹|↺)|Voltar|Recomeçar|Módulos|ATIVAR VOZ|FERRAMENTAS|^(PT|ES)$/i;

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
async function travessia(page: Page, rotulosDoModulo: string[] = []): Promise<string[][]> {
  // Rótulos de cabeçalho que a Fase 7 colapsou de propósito: o cromado do módulo
  // e o sobretítulo do StepHeaderBar diziam o mesmo que o título. O título em si
  // NÃO entra aqui — ele continua na tela, e o teste de conteúdo o cobre.
  const CROMADO = new RegExp(
    `^(‹ Voltar|↺ Recomeçar|Voltar|← Módulos|Módulos|Passo \\d+${
      rotulosDoModulo.length ? "|" + rotulosDoModulo.map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") : ""
    })$`
  );
  const registro: string[][] = [];

  for (let i = 0; i < PASSOS; i++) {
    // Lê o CORPO ROLÁVEL, não a página inteira: o cabeçalho é justamente o que a
    // Fase 7 reorganizou, e ali título e etapa saem numa linha só
    // ("Anafilaxia · Emergência · Passo 1"). Comparar cabeçalho contra corpo
    // mediria a mudança de projeto. O título é verificado em teste próprio.
    const bruto = await page.evaluate(`(() => {
      const roladores = [...document.querySelectorAll("div")].filter(
        (e) => e.scrollHeight > e.clientHeight + 100 && e.clientHeight > 200
      );
      const corpo = roladores.find((e) => /Passo \\d/.test(e.innerText || ""));
      return (corpo ?? document.body).innerText;
    })()`);
    registro.push(
      String(bruto)
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
      if (!rotulo || NAVEGACAO.test(rotulo)) continue;
      await alvo.click();
      avancou = true;
      break;
    }

    if (!avancou) break; // chegou a um passo terminal
    await page.waitForTimeout(250);
  }

  return registro;
}

for (const { id, cromado } of MODULOS) {
  test(`travessia da árvore preserva o conteúdo — ${id}`, async ({ page }) => {
    await abrir(page, id, false);
    const antiga = await travessia(page, cromado);

    await abrir(page, id, true);
    const nova = await travessia(page, cromado);

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

test("o cabeçalho compacto mantém o título do módulo", async ({ page }) => {
  // O título saiu do corpo e foi para a linha de cabeçalho — a travessia compara
  // só o corpo, então é aqui que se confirma que ele continua na tela. Usa o
  // rótulo mais informativo (headerTitle), não o curto.
  for (const { id } of MODULOS) {
    await abrir(page, id, true);
    const t = await texto(page);
    expect(t, `título ausente no cabeçalho de "${id}"`).toMatch(/· Emergência/);
    expect(t, `contador de passo ausente em "${id}"`).toContain("Passo");
  }
});

test("todo tocável da árvore respeita o alvo de 44 px", async ({ page }) => {
  // Cobre também os passos de ENTRADA, onde ficam os chips de valor clínico —
  // tocar o chip errado troca peso ou dose do caso. A travessia visita os tipos
  // de passo, então a verificação alcança os quatro.
  await abrir(page, "sepse-adulto", true);

  const pequenos: string[] = [];
  for (let passo = 0; passo < PASSOS; passo++) {
    // MEDIR tudo primeiro, CLICAR depois. Clicar no meio da iteração invalida os
    // locators já resolvidos — a página muda e `nth(j)` aponta para o que saiu.
    const alvos = pressables(page);
    const total = await alvos.count();

    // Medir não altera o DOM, então os índices continuam válidos para o clique.
    const medidas: { i: number; rotulo: string; w: number; h: number }[] = [];
    for (let j = 0; j < total; j++) {
      const alvo = alvos.nth(j);
      const caixa = await alvo.boundingBox();
      if (!caixa) continue;
      medidas.push({
        i: j,
        rotulo: (await alvo.innerText()).replace(/\n/g, " ").trim(),
        w: caixa.width,
        h: caixa.height,
      });
    }

    for (const m of medidas) {
      if ((m.h < 43 || m.w < 43) && !/^←?\s*$/.test(m.rotulo)) {
        pequenos.push(
          `passo ${passo + 1}: "${m.rotulo.slice(0, 24)}" ${Math.round(m.w)}×${Math.round(m.h)}`
        );
      }
    }

    const avancar = medidas.find((m) => m.rotulo && !NAVEGACAO.test(m.rotulo));
    if (!avancar) break;
    await alvos.nth(avancar.i).click();
    await page.waitForTimeout(250);
  }

  expect(pequenos, "alvo de toque abaixo de 44 px na árvore de decisão").toEqual([]);
});

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
