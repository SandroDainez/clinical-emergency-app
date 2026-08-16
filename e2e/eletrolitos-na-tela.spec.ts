import { expect, test } from "@playwright/test";
import { abrirModulo } from "./helpers";

/**
 * O que a tela dos ELETRÓLITOS ENTREGA — não o que o código declara.
 *
 * ── OS QUATRO SINTOMAS QUE ORIGINARAM (2026-08-16) ──────────────────────────
 *
 * O autor relatou quatro coisas nesta tela, e o levantamento mostrou que eram
 * um problema só — a tela não consumia o sistema de design que as outras
 * consomem:
 *
 *  1. CAIXA em vez de barra: o campo era um botão que abria um MODAL, com a
 *     barra lá dentro. Um toque a mais entre o médico e o número, num app de
 *     beira de leito.
 *  2. MODAL: morreu. Barra inline, no padrão canônico da árvore de decisão.
 *  3. CONTRASTE: o acento do eletrólito era usado como COR DE TEXTO sobre
 *     superfície escura — 1,60:1 em "Hiponatremia", 1,96:1 em "Aguardando
 *     valor" e "Atualizado". Eram dados clínicos ilegíveis: a classificação do
 *     distúrbio e o status da conduta.
 *  4. DISTINÇÃO ENTRE OS ÍONS: `glyph`, `accent`, `soft` e `border` existiam no
 *     dado desde sempre e morriam antes da tela — o círculo do rail mostrava o
 *     ÍNDICE (1, 2, 3…), que numa lista de eletrólitos não significa nada.
 *
 * ── POR QUE ESTA TRAVA MEDE O DOM ───────────────────────────────────────────
 *
 * Porque o defeito de layout NÃO APARECE no código: o `NumericStepper` estava
 * correto nos dois lugares, e mesmo assim ficava esmagado — nas Calculadoras
 * por causa do rótulo em `flex: 1`, aqui por causa da coluna de 48%. Só a
 * largura RENDERIZADA distingue uma barra utilizável de uma bolinha entre dois
 * botões.
 *
 * NÃO PROMETE contraste (é do `contraste-renderizado.spec.ts`) nem correção
 * clínica das faixas (é do `test:eletrolitos`).
 */

const LARGURA_MINIMA_DA_BARRA = 120;

test("os campos numéricos têm barra, e a barra é usável na largura real", async ({ page }) => {
  await abrirModulo(page, "correcoes-eletroliticas");

  const barras = page.locator('[role="slider"]');
  const quantas = await barras.count();
  expect(quantas, "a tela deveria ter barras nos campos numéricos").toBeGreaterThan(1);

  const estreitas: string[] = [];
  for (let i = 0; i < quantas; i++) {
    const caixa = await barras.nth(i).boundingBox();
    if (!caixa) continue;
    if (caixa.width < LARGURA_MINIMA_DA_BARRA) {
      estreitas.push(`barra ${i + 1}: ${Math.round(caixa.width)} px`);
    }
  }
  expect(
    estreitas,
    `barra esmagada — com menos de ${LARGURA_MINIMA_DA_BARRA} px sobra uma bolinha entre os botões −/+, ` +
      `que é o defeito visto nas Calculadoras Clínicas. O campo tem de ocupar a linha inteira.`
  ).toEqual([]);
});

test("o modal de seleção não volta: o valor se ajusta na própria tela", async ({ page }) => {
  await abrirModulo(page, "correcoes-eletroliticas");

  const texto = await page.evaluate(() => document.body.innerText);
  expect(
    texto,
    "'Selecionar' era o rótulo do botão-caixa que abria o modal — se voltou, o campo virou caixa de novo"
  ).not.toContain("Selecionar");

  // O modal tinha um botão "Confirmar" próprio; a barra inline não precisa dele.
  const confirmar = await page.getByText("Confirmar", { exact: true }).count();
  expect(confirmar, "botão de confirmar valor indica modal de seleção de volta").toBe(0);
});

test("o rail mostra o SÍMBOLO do íon, não o número da posição", async ({ page }) => {
  await abrirModulo(page, "correcoes-eletroliticas");

  const simbolos = ["Na", "K", "Ca", "Mg", "P", "Cl"];
  // O rail é identificado por CONTRATO (testID), não por heurística de DOM: a
  // primeira sonda procurava "1".."6" na página inteira e reprovava por causa
  // das listas numeradas de conduta; a segunda tentou achar o rail pelo texto e
  // não o encontrou no viewport de celular. Universo errado duas vezes — a
  // terceira pergunta ao próprio componente quem ele é.
  const achados = await page.evaluate(() => {
    const nos = Array.from(document.querySelectorAll('[data-testid^="rail-simbolo-"]'));
    return {
      presentes: nos.map((el) => (el.textContent || "").trim()),
      indices: nos
        .map((el) => (el.textContent || "").trim())
        .filter((t) => /^[1-9]$/.test(t)),
    };
  });

  expect(
    achados.presentes,
    "o médico procura o símbolo do íon na lista; o dado já trazia `icon` e `glyph`"
  ).toEqual(simbolos);
  expect(
    achados.indices,
    "índice de posição no círculo do rail — a ordem é arbitrária e não significa nada aqui"
  ).toEqual([]);
});
