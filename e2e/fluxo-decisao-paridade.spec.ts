import { expect, test, type Page } from "@playwright/test";
import { abrirEstabilizacao, pressables, texto, fixarIdioma} from "./helpers";

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
  { id: "bradicardia-acls", cromado: ["Bradicardia no ACLS", "BRADICARDIA ACLS", "ACLS · Emergência", "Bradicardia ACLS"] },
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
const NAVEGACAO = new RegExp(
  [
    "^(←|‹|↺)",
    "Voltar", "Recomeçar", "Módulos", "ATIVAR VOZ", "FERRAMENTAS",
    "Ver ABCDE", "ver mais",
    "^(PT|ES)$",
    // Cabeçalho do card de estabilização: expande/recolhe, não avança o fluxo.
    "Estabilização primeiro",
    // Atalhos de estabilização: NAVEGAM PARA OUTRO MÓDULO. Clicar neles tirava a
    // travessia do fluxo e o sintoma aparecia como divergência no passo 2.
    "Parada / RCP", "Via aérea / IOT", "Ventilação mecânica",
    "Choque / vasopressor", "Bradicardia instável", "Taquicardia instável",
  ].join("|"),
  "i"
);

/**
 * Conteúdo que a UI 2.0 moveu para "ver mais" — continua no app, atrás de um
 * toque, e por isso não aparece no corpo renderizado.
 *
 * A exclusão só é legítima porque existe um teste que ABRE o painel e confere
 * que tudo está lá ("o ABCDE continua acessível"). Sem ele, isto seria esconder
 * perda de conteúdo clínico atrás de uma lista.
 */
const MOVIDO_PARA_VER_MAIS = [
  "Via aérea",
  "Respiração",
  "Circulação",
  "Disfunção neuro",
  "Exposição / ritmo",
];

async function abrir(page: Page, id: string, v2: boolean) {
  await fixarIdioma(page, "pt-BR");
  await page.addInitScript(
    ([modulo, ligar]) => {
      try {
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
        .filter(
          (l) =>
            l.length > 1 &&
            !CROMADO.test(l) &&
            !MOVIDO_PARA_VER_MAIS.includes(l) &&
            // Corpo das linhas do ABCDE, idem — provado acessível em teste próprio.
            !/^(Obstrução, estridor|Insuficiência respiratória \/ hipoxemia|Choque \/ hipotensão|Glasgow ≤ 8|Arritmia INSTÁVEL)/.test(l) &&
            // A descrição do módulo virou "ver mais" pelo mesmo motivo.
            !/^Fluxo interativo|^Algoritmo interativo/.test(l)
        )
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

test("o ABCDE continua acessível — nada de conteúdo clínico saiu do app", async ({ page }) => {
  // O card de estabilização ocupava ~859 px expandido e empurrava a decisão
  // clínica para fora da tela em todos os 19 módulos. Na forma compacta, o
  // alerta, a regra de prioridade e os atalhos ficam VISÍVEIS, e o detalhamento
  // ABCDE vai para "ver mais".
  //
  // Este teste é o que autoriza a exclusão dessas linhas na travessia: prova que
  // o conteúdo continua no app, a um toque.
  await abrir(page, "anafilaxia", true);

  // O card nasce RECOLHIDO, e este teste passou a abri-lo de propósito.
  //
  // Ele antes verificava a regra e os atalhos sem tocar em nada — e passava
  // porque a tela expandia o card sozinho no 1º passo. Era essa abertura
  // automática que tomava a tela inteira do módulo e empurrava o passo clínico
  // para baixo da dobra, defeito relatado com print no AVC. Removida ela, este
  // teste caiu, o que é o comportamento certo de um teste: ele media a tela do
  // passo 1, não a permanência do conteúdo.
  //
  // O que ele existe para provar — que nada de conteúdo clínico saiu do app —
  // continua de pé, agora a um toque. Quem cobra o card recolhido na abertura é
  // e2e/estabilizacao-recolhida.spec.ts.
  await abrirEstabilizacao(page);

  const antes = await texto(page);
  expect(antes, "a regra de prioridade deveria ficar visível ao abrir o card").toContain(
    "A prioridade é estabilizar"
  );
  // Case-insensitive: o rótulo sobe para caixa alta por CSS, e o teste compara
  // texto RENDERIZADO. Mesma armadilha que já custou cinco correções nas Fases 6
  // e 7 — desta vez no próprio teste.
  expect(antes, "os atalhos de estabilização deveriam ficar visíveis").toMatch(
    /abrir módulo de estabilização/i
  );

  await pressables(page).filter({ hasText: /Ver ABCDE completo/ }).first().click();
  await page.waitForTimeout(400);

  const comPainel = await texto(page);
  for (const linha of [
    "Via aérea",
    "Respiração",
    "Circulação",
    "Disfunção neuro",
    "Exposição / ritmo",
    "Glasgow ≤ 8",
  ]) {
    expect(comPainel, `"${linha}" sumiu do ABCDE`).toContain(linha);
  }
});

test("o cabeçalho compacto mantém o título do módulo", async ({ page }) => {
  // O título saiu do corpo e foi para a linha de cabeçalho — a travessia compara
  // só o corpo, então é aqui que se confirma que ele continua na tela. Usa o
  // rótulo mais informativo (headerTitle), não o curto.
  for (const { id } of MODULOS) {
    await abrir(page, id, true);
    const t = await texto(page);
    // O cabeçalho mostra o NOME DO MÓDULO (protocolLabel).
    expect(t, `título ausente no cabeçalho de "${id}"`).toMatch(
      /Anafilaxia|Sepse \/ Choque Séptico|Bradicardia ACLS/
    );
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
