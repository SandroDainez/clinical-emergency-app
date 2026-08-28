import { expect, test } from "@playwright/test";
import { abrirModulo } from "./helpers";

/**
 * "AINDA NÃO INFORMADO" e "INFORMADO E IGUAL AO PADRÃO" SÃO OPOSTOS.
 *
 * ── POR QUE ISTO EXISTE ─────────────────────────────────────────────────────
 *
 * A barra precisa partir de algum ponto, e parte do meio da faixa. Enquanto
 * ninguém arrastou, o número grande na tela NÃO é um valor medido — e um valor
 * plausível exibido sem origem se lê como valor medido. É o mesmo defeito do
 * peso não confirmado nas Vasoativas.
 *
 * Por isso o campo avisa. ⚠️ E o aviso tem de SUMIR no instante em que o médico
 * toca a barra, MESMO QUE ELE PARE NO VALOR INICIAL: se o aviso ficasse preso
 * até o número mudar, a tela ensinaria que "não informado" e "informado, e por
 * acaso igual ao padrão" são a mesma coisa. São opostos — um é ausência de
 * medida, o outro é uma medida.
 *
 * O caso limite é real: um paciente de 70 kg com a barra partindo de 70.
 *
 * ── O DEFEITO É DO MECANISMO, NÃO DESTA TELA ────────────────────────────────
 *
 * A varredura achou TRÊS campos com o mesmo buraco, todos inferindo "informado"
 * do valor gravado:
 *
 *   · Eletrólitos — 9 campos, o aviso preso;
 *   · Vasoativas — o peso, que foi o PRECEDENTE deste aviso;
 *   · Sedoanalgesia — o peso, e aqui com consequência clínica: `weightMissing`
 *     BLOQUEIA o cálculo, então o paciente de 70 kg que soltasse a barra no
 *     ponto de partida (70) ficava sem dose.
 *
 * Por isso a correção é no COMPONENTE (`onConfirmar` no `NumericStepper`), não
 * em cada tela — corrigir tela a tela criaria mais uma variante do padrão de
 * entrada, que é o problema que este bloco existe para acabar.
 *
 * NÃO PROMETE que o valor gravado esteja certo (isso é do `test:eletrolitos`),
 * nem nada sobre contraste ou layout.
 */

const AVISO = "Ainda NÃO informado";

test("o aviso some ao TOCAR a barra, mesmo parando no valor inicial", async ({ page }) => {
  await abrirModulo(page, "correcoes-eletroliticas");

  const barra = page.locator('[role="slider"]').first();
  await barra.scrollIntoViewIfNeeded();
  const caixa = await barra.boundingBox();
  expect(caixa, "a barra do primeiro campo deveria estar na tela").not.toBeNull();

  const antes = await page.evaluate(() => document.body.innerText);
  expect(antes, "antes de qualquer toque o campo tem de se declarar não informado").toContain(AVISO);

  // Pressiona e solta EXATAMENTE onde o polegar já está: nenhum movimento,
  // nenhuma mudança de número. É o gesto de quem confirma o valor de partida.
  const alvo = await page.evaluate(() => {
    const el = document.querySelector('[role="slider"]');
    const r = el!.getBoundingClientRect();
    // O polegar fica na posição proporcional ao valor; o valor inicial é o meio.
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.move(alvo.x, alvo.y);
  await page.mouse.down();
  await page.mouse.up();

  const depois = await page.evaluate(() => document.body.innerText);
  const quantos = (depois.match(new RegExp(AVISO, "g")) ?? []).length;
  const quantosAntes = (antes.match(new RegExp(AVISO, "g")) ?? []).length;

  expect(
    quantos,
    `o aviso continuou em ${quantos} campo(s) (eram ${quantosAntes}) depois de tocar a barra. ` +
      `Tocar e parar no valor inicial É informar — se o aviso só sai quando o número muda, a tela ` +
      `trata "não informado" e "informado e igual ao padrão" como a mesma coisa, e são opostos.`
  ).toBeLessThan(quantosAntes);
});

test("campo NUNCA tocado continua marcado como não informado", async ({ page }) => {
  // ⚠️ O CASO INVERSO, e sem ele a trava é inútil: uma "correção" que marcasse
  // todos os campos como informados passaria no teste de cima com louvor.
  await abrirModulo(page, "correcoes-eletroliticas");

  const texto = await page.evaluate(() => document.body.innerText);
  const quantos = (texto.match(new RegExp(AVISO, "g")) ?? []).length;

  expect(
    quantos,
    "sem nenhum toque, TODOS os campos numéricos têm de se declarar não informados — " +
      "o número na tela é ponto de partida, não medida"
  ).toBeGreaterThan(0);
});

/**
 * ⚠️ ESTE TESTE DOCUMENTA, MAS NÃO GUARDA — e a distinção é medida, não suposta.
 *
 * Ao remover o `onSlidingComplete` do componente (a mutação que reproduz o
 * defeito), o teste dos Eletrólitos falhou e ESTE PASSOU. Investigado: no campo
 * de peso o polegar está a 18% da trilha, e o `Slider` do react-native-web
 * emite `onValueChange` já ao pressionar sobre ele — o valor 70 é gravado pelo
 * caminho antigo, sem passar pela confirmação.
 *
 * Ou seja: ele prova que a tela se comporta certo HOJE, e não pegaria a
 * regressão do mecanismo. Quem guarda o mecanismo é o primeiro teste deste
 * arquivo. Fica registrado em vez de removido porque o comportamento em si —
 * peso confirmável em 70 kg — vale a conferência; o que não vale é acreditar
 * que ele cobre mais do que cobre (R-15 item 8).
 */
test("o peso das Vasoativas confirma no ponto de partida — 70 kg existe", async ({ page }) => {
  // O precedente que motivou o aviso dos Eletrólitos tinha o mesmo buraco.
  await abrirModulo(page, "drogas-vasoativas");

  const antes = await page.evaluate(() => document.body.innerText);
  expect(antes).toContain("Peso ainda NÃO confirmado");

  const barra = page.locator('[role="slider"]').first();
  await barra.scrollIntoViewIfNeeded();
  // ⚠️ MIRA NO POLEGAR, NÃO NO MEIO DA TRILHA. A primeira versão clicava no
  // centro: como o peso parte de 70 numa faixa de 30 a 250, o centro fica em
  // ~140 e o clique MUDAVA o valor — o teste passava mesmo com o defeito
  // presente, o que a mutação revelou. Só o toque sobre o valor atual, sem
  // mudança de número, exercita o caso que importa.
  const alvo = await page.evaluate(() => {
    const el = document.querySelector('[role="slider"]')!;
    const r = el.getBoundingClientRect();
    const valor = Number(el.getAttribute("aria-valuenow") ?? "70");
    const min = Number(el.getAttribute("aria-valuemin") ?? "30");
    const max = Number(el.getAttribute("aria-valuemax") ?? "250");
    const fracao = max > min ? (valor - min) / (max - min) : 0.5;
    return { x: r.x + r.width * fracao, y: r.y + r.height / 2 };
  });
  await page.mouse.move(alvo.x, alvo.y);
  await page.mouse.down();
  await page.mouse.up();

  const depois = await page.evaluate(() => document.body.innerText);
  expect(
    depois,
    "soltar a barra sobre o valor de partida É confirmar o peso — e o paciente de 70 kg existe"
  ).not.toContain("Peso ainda NÃO confirmado");
});

/**
 * ⚠️ TESTE REMOVIDO EM 2026-08-27 — "Sedoanalgesia: peso solto no ponto de
 * partida PRODUZ dose". Era a TERCEIRA severidade desta série, e a mais grave:
 * ali o defeito bloqueava CONDUTA, não um aviso. Sem peso confirmado a taxa da
 * bomba saía como "—", e o paciente de 70 kg ficava sem dose enquanto na tela
 * parecia apenas "o app não calculou".
 *
 * A Sedoanalgesia saiu com a arquitetura clínica antiga. Nenhum módulo
 * sobrevivente tem a forma que este teste precisa — peso no ponto de partida
 * alimentando cálculo na mesma tela —, e escrevê-lo sobre um módulo que não
 * calcula por peso seria um teste que passa sem exercitar o risco.
 *
 * A REGRA continua travada em `scripts/valida-valor-nao-informado.cjs`
 * (`test:valor-informado`, 8 conferências verdes): a tela não pode imprimir
 * número que ninguém informou. O que ficou sem prova de ponta a ponta é o elo
 * VALOR SOLTO → DOSE PRODUZIDA, e ele volta a ser medível no primeiro módulo da
 * arquitetura nova que dose por quilo.
 *
 * Registrado como **D-106** em `auditoria/DIVIDAS-CONHECIDAS.md`.
 */
