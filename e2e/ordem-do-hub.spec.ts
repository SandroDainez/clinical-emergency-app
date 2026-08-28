import { expect, test } from "@playwright/test";

import { MODULE_AREA_LABELS } from "../constants/module-area-labels";
import { getClinicalModules } from "../clinical-modules";
import { fixarIdioma } from "./helpers";
import { IDS_DA_SECAO_PCR } from "../constants/secao-do-pcr";

/**
 * PROMETE: que na LISTA PRINCIPAL do hub os módulos de CONSULTA (tabela,
 *   calculadora) apareçam DEPOIS de todos os módulos de CENÁRIO, na ordem em que
 *   os cards são desenhados na tela; e que DENTRO da seção do PCR a mesma ordem
 *   valha entre os cards dela. Mede a POSIÇÃO VERTICAL renderizada.
 *
 * ── ⚠️ POR QUE A SEÇÃO DO PCR FICA FORA DA PRIMEIRA MEDIDA (2026-08-18) ────
 *
 * Esta trava reprovou quando a seção nasceu: `ritmos-acls` e `farmacologia-acls`
 * são CONSULTA e passaram a ficar acima dos 22 módulos de cenário. Antes de
 * mexer nela, a pergunta certa não é «como fazer passar», é **se a RAZÃO da
 * regra sobrevive no contexto novo**.
 *
 * A razão era: quem abre o hub tem um paciente, e quem quer tabela não tem —
 * então a tabela não pode roubar a posição de quem tem. **Dentro da seção do PCR
 * a pessoa tem as duas coisas**: o paciente em parada e a necessidade da tabela
 * para ele, agora. A razão não sobrevive; a regra é que era geral demais.
 *
 * Então o que se corrigiu foi o ESCOPO, com a razão escrita — e NÃO uma lista de
 * exceções, que é onde qualquer módulo inconveniente se esconderia depois:
 *
 *   · a LISTA PRINCIPAL é onde consulta COMPETE com cenário → medida;
 *   · a SEÇÃO DO PCR é onde a consulta É do cenário → medida à parte, com a
 *     mesma ordem valendo entre os cards dela.
 *
 * ⚠️ A segunda medida não é enfeite: sem ela, trocar-se-ia uma regra por
 * nenhuma dentro da seção.
 * NÃO PROMETE: a ordem entre os módulos de cenário (é alfabética, e isso é
 *   decisão de previsibilidade, não de clínica), nem a posição do card do PCR
 *   (é herói e vem primeiro por regra própria). Também não vê o que acontece
 *   depois de rolar — mede as coordenadas, que existem independentemente da
 *   dobra.
 * UNIVERSO: os módulos de `getClinicalModules()` cruzados com
 *   `MODULE_AREA_LABELS` — derivados da fonte, para que módulo novo entre sem
 *   ninguém lembrar.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-17) ────────────────────────────────────
 *
 * O bloco das etiquetas consertou o RÓTULO: `ritmos-acls` e `farmacologia-acls`
 * passaram a dizer CONSULTA. A POSIÇÃO seguiu dizendo o contrário — o hub ordenava
 * os 31 módulos por título, e o alfabeto punha `Farmacologia no ACLS` na 5ª
 * posição e `Ritmos de Parada` na 7ª, duas TABELAS no meio dos guias.
 *
 * Etiqueta e posição são lidas juntas, e quem abre o app com um paciente lê a
 * posição primeiro.
 *
 * ── ⚠️ POR QUE ESTA TRAVA MEDE A TELA, E NÃO O ARRAY ───────────────────────
 *
 * Porque eu tentei o array e errei. Reordenei `constants/module-groups.ts` — que
 * tem os módulos agrupados por tema — e relatei a queixa como resolvida. Aquele
 * arquivo NÃO desenha tela: existe para cobertura e validação, e o seu próprio
 * cabeçalho diz isso. A produção mostrou os cards ainda em ordem alfabética.
 *
 * A ordem que vale é a de `components/module-hub.tsx`. Uma trava sobre o array
 * teria passado verde com o defeito intacto na tela — é o R-85 e o R-83 juntos:
 * a razão estava escrita e eu agi sem ler, e medi a forma no lugar do objeto.
 */

const MODULOS = getClinicalModules();
const SO_CONSULTA = new Set(["CONSULTA", "Calculadoras"]);
const ehConsulta = (id: string) => SO_CONSULTA.has(MODULE_AREA_LABELS[id] ?? "");

test.describe("Ordem do hub", () => {
  test("consulta vem depois de cenário, na tela", async ({ page }) => {
    // ⚠️ VACUIDADE: sem esta conferência, um hub que não renderiza card nenhum
    // passaria — a lista de consulta ficaria vazia e "nenhuma antes" seria trivial.
    const esperados = MODULOS.filter((m) => !ehConsulta(m.id)).length;
    // ⚠️ PISO BAIXADO 20 → 5 EM 2026-08-27. A reestruturação removeu a arquitetura
    // clínica antiga e o app ficou com 12 módulos, 9 deles de cenário. A queda é de
    // conteúdo removido, não de leitura quebrada — o piso continua fazendo o que
    // existe para fazer: impedir que a lista vazia torne "nenhuma consulta antes de
    // cenário" uma verdade trivial. Sobe de volta com a arquitetura nova.
    expect(esperados, "deveria haver módulos de cenário para comparar").toBeGreaterThan(5);

    await fixarIdioma(page, "pt-BR");
    await page.goto("/(tabs)");
    await expect
      .poll(async () => (await page.locator("body").innerText()).length, { timeout: 30_000 })
      .toBeGreaterThan(500);

    const titulos = MODULOS.map((m) => ({ id: m.id, title: m.title, consulta: ehConsulta(m.id) }));
    const posicoes = await page.evaluate((alvos) => {
      // ⚠️ NÃO CASAR `innerText === title` EM FOLHA. Consertado em 2026-08-18,
      // ANTES da migração para a UI 2.0, e por causa dela.
      //
      // A leitura antiga exigia que o título inteiro coubesse em UM nó folha.
      // Isso é verdade só enquanto o card usa `numberOfLines={1}`: a UI 2.0 põe o
      // título em duas linhas a 123 px, e o RN Web parte o texto em nós. Nenhum
      // `innerText` casaria, `posicoes` cairia para perto de zero e a trava
      // reprovaria por VACUIDADE — dizendo "a leitura quebrou" no meio de uma
      // migração em que tudo está mudando, que é onde esse recado não é lido.
      //
      // Agora a busca é pelo CARD (o ancestral tocável), e o texto é o texto
      // ACUMULADO dele, normalizado. Um título em duas linhas, em três nós ou com
      // espaço duplo continua casando, e a posição medida é a do card — que é o
      // objeto de que a promessa fala, não a do nó de texto.
      const norm = (t: string) => t.replace(/\s+/g, " ").trim();
      const achados: { id: string; y: number }[] = [];
      const cards = Array.from(
        document.querySelectorAll('[role="button"], [tabindex], div,span')
      );
      for (const el of cards) {
        const t = norm((el as HTMLElement).innerText || "");
        if (!t || t.length > 400) continue;
        const alvo = alvos.find((a) => t === norm(a.title) || t.startsWith(norm(a.title)));
        if (!alvo || achados.some((x) => x.id === alvo.id)) continue;
        achados.push({ id: alvo.id, y: Math.round(el.getBoundingClientRect().top) });
      }
      return achados;
    }, titulos);

    // ⚠️ VACUIDADE: card não encontrado não pode virar aprovação silenciosa.
    //
    // ⚠️ 2026-08-27: o piso ABSOLUTO era 25, e o app passou a ter 12 módulos. Em vez
    // de só baixar o número, a conferência virou RELATIVA — TODO card do catálogo tem
    // de ser localizado. Isso é mais forte que o piso antigo, não mais fraco: com 30
    // módulos, `> 25` deixava cinco sumirem em silêncio. O piso absoluto pequeno
    // continua abaixo apenas para o caso degenerado de o catálogo em si esvaziar.
    expect(
      posicoes.length,
      `só ${posicoes.length} dos ${MODULOS.length} cards foram localizados no hub — ` +
        "a leitura pode ter quebrado, e uma comparação sobre 2 cards passa por acaso"
    ).toBe(MODULOS.length);
    expect(MODULOS.length, "o catálogo do hub esvaziou").toBeGreaterThan(5);

    // ⚠️ A SEÇÃO DO PCR SAI DA PRIMEIRA MEDIDA — e é medida logo abaixo. Ver o
    // cabeçalho: a razão da regra não sobrevive lá dentro, então o escopo é que
    // se corrigiu. A lista dos ids vem da MESMA fonte que desenha a seção, para
    // que um módulo que entre nela não escape das duas medidas por descuido.
    const naSecao = new Set<string>(IDS_DA_SECAO_PCR);
    const principal = posicoes.filter((p) => !naSecao.has(p.id));
    const consulta = principal.filter((p) => ehConsulta(p.id));
    const cenario = principal.filter((p) => !ehConsulta(p.id) && p.id !== "pcr-adulto");
    expect(consulta.length, "nenhum módulo de CONSULTA encontrado na tela").toBeGreaterThan(0);

    const maisBaixoCenario = Math.max(...cenario.map((c) => c.y));
    const errados = consulta.filter((c) => c.y < maisBaixoCenario);

    expect(
      errados.map((e) => `${e.id} (y=${e.y})`),
      "MÓDULO DE CONSULTA ANTES DE MÓDULO DE CENÁRIO no hub.\n" +
        "Quem abre o app tem um paciente; quem quer tabela vai buscá-la.\n" +
        `O cenário mais baixo está em y=${maisBaixoCenario}.\n` +
        "⚠️ A ordem vale em `components/module-hub.tsx` — reordenar\n" +
        "`constants/module-groups.ts` não muda a tela (foi o erro cometido)."
    ).toEqual([]);

    // ── DENTRO DA SEÇÃO, A MESMA ORDEM ────────────────────────────────────
    //
    // Sem esta asserção, escopar a primeira teria trocado uma regra por nenhuma:
    // `ritmos-acls` e `farmacologia-acls` poderiam subir para o topo da seção,
    // acima da bradicardia e do engasgo, e nada reprovaria.
    const daSecao = posicoes.filter((p) => naSecao.has(p.id));
    expect(
      daSecao.length,
      `só ${daSecao.length} dos ${naSecao.size} cards da seção do PCR foram ` +
        "localizados — a leitura pode ter quebrado"
    ).toBeGreaterThan(naSecao.size - 2);

    const consultaNaSecao = daSecao.filter((p) => ehConsulta(p.id));
    const cenarioNaSecao = daSecao.filter((p) => !ehConsulta(p.id));
    expect(consultaNaSecao.length, "nenhuma consulta na seção do PCR").toBeGreaterThan(0);
    expect(cenarioNaSecao.length, "nenhum cenário na seção do PCR").toBeGreaterThan(0);

    const maisBaixoNaSecao = Math.max(...cenarioNaSecao.map((c) => c.y));
    expect(
      consultaNaSecao.filter((c) => c.y < maisBaixoNaSecao).map((e) => `${e.id} (y=${e.y})`),
      "CONSULTA ANTES DE CENÁRIO DENTRO DA SEÇÃO DO PCR.\n" +
        "A regra vale aqui também: quem está na parada precisa primeiro do que\n" +
        "conduz o atendimento, e depois da tabela que ele consulta durante ele.\n" +
        `O cenário mais baixo da seção está em y=${maisBaixoNaSecao}.`
    ).toEqual([]);
  });
});
