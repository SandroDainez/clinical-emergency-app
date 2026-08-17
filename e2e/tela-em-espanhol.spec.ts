import { expect, test } from "@playwright/test";

import { getClinicalModules } from "../clinical-modules";
import { abrirModulo, texto } from "./helpers";

/**
 * PROMETE: que, com o app em `es-419`, o PASSO DE ENTRADA de cada módulo não
 *   mostre nenhuma linha com marca de português. Mede a TELA RENDERIZADA — não o
 *   fonte, não o artefato compilado, não o dicionário.
 *
 * NÃO PROMETE, e este teto é o mais importante de ler:
 *   · ⚠️ VÊ SÓ O PASSO DE ENTRADA DOS 31 MÓDULOS, não o fluxo inteiro. Foi
 *     exatamente o passo de entrada que expôs as 10 linhas que originaram esta
 *     trava — e é também o limite dela: uma frase em português no passo 7 de um
 *     guia passa daqui sem ser vista.
 *   · não sabe espanhol. Tradução ERRADA passa; ela só vê português.
 *   · não vê texto que só aparece após interação (modal, acordeão fechado,
 *     painel que abre no toque).
 *
 * UNIVERSO: os módulos de `getClinicalModules()`, derivados da fonte do app, com
 *   `cea_active_locale = es-419` fixado antes do primeiro paint.
 *
 * ── POR QUE ESTA TRAVA EXISTE (2026-08-17) ─────────────────────────────────
 *
 * Duas travas de tradução já existiam e as duas passavam:
 *
 *   `test:i18n`             lê o FONTE            → texto novo sem tradução
 *   `test:traducao-runtime` lê o ARTEFATO COMPILADO → frase montada sem chave
 *
 * A verificação em produção, com o app em espanhol, achou DEZ linhas em português
 * na tela — nenhuma no universo das duas. Elas vivem em
 * `components/protocol-screen/*.tsx`, que a trava de runtime declara fora do seu
 * universo (o texto não vem de objeto exportado, e sim de render React).
 *
 * ⚠️ A ALTERNATIVA ERA ESCREVER A EXCLUSÃO COM O NÚMERO — "10 linhas em 6
 * módulos, fora de cobertura". Foi recusada: exclusão com número é honesta e
 * inútil, porque o número cresce sozinho a cada tela nova. Esta trava não
 * pergunta COMO a frase foi montada; pergunta o que está na tela. Por isso cobre
 * os quatro mecanismos de uma vez — crescimento no fim, crescimento no início,
 * chave órfã por edição, e chave que nunca existiu.
 */

const MODULOS = getClinicalModules();

/**
 * ⚠️ MARCAS QUE **NÃO EXISTEM** EM ESPANHOL — a lista inteira, declarada.
 *
 * O critério é estrito: só entra o que é impossível em espanhol correto. Cada
 * item afrouxado aqui devolve defeito inventado, e defeito inventado num
 * relatório de tradução manda alguém reescrever texto clínico que estava certo.
 *
 * ── O QUE JÁ PRODUZIU FALSO POSITIVO, e por isso está FORA ─────────────────
 *
 *   "dos"    — é espanhol. « Monitorización, DOS accesos venosos » foi marcada
 *              como português. Também « DOS grupos: desfibrilables… ».
 *   "das"    — mesmo caso, aparece em espanhol.
 *   "toque"  — é espanhol. « TOQUE para ver qué hacer antes de continuar »
 *              apareceu em 21 módulos e « Toque para decidir » em vários; as 22
 *              foram relatadas como defeito e NENHUMA era. Foi o que matou a
 *              hipótese inteira da "Classe 1".
 *   "salvar" — existe em espanhol.
 *   "pelo"   — existe em espanhol (cabelo).
 *   "usar"   — igual nos dois.
 *
 * Três marcas frouxas custaram 22 defeitos inexistentes num relatório. É o R-83
 * na camada do texto: o critério tem de dizer o que a coisa É.
 */
/**
 * Palavra inteira, com fronteira que ENTENDE ACENTO.
 *
 * ⚠️ `\b` do JavaScript é definido sobre `\w` = `[A-Za-z0-9_]`, e letra acentuada
 * NÃO é `\w`. As consequências mordem nos DOIS sentidos:
 *
 *   · `/\bé\b/` casa com o `é` DENTRO de "tambi**é**n" — há fronteira entre `i` e
 *     `é`, e outra entre `é` e `n`. Marcou 40+ linhas de espanhol CORRETO como
 *     português na primeira execução desta trava.
 *   · `/\baté\b/` NÃO casa em "até 15 cmH₂O" — o `\b` final exige caractere de
 *     palavra depois do `é`, e ali vem espaço. A marca ficava CEGA.
 *
 * A fronteira certa é "não vem letra nem número, nem antes nem depois", com
 * `\p{L}` e a flag `u`.
 */
const palavra = (corpo: string) =>
  new RegExp(`(?<![\\p{L}\\p{N}])(?:${corpo})(?![\\p{L}\\p{N}])`, "iu");

const MARCAS_SO_DO_PORTUGUES: { marca: RegExp; porque: string }[] = [
  { marca: /[ãõ]/u, porque: "espanhol não tem til em a/o" },
  { marca: /ç[aãeoóuú]/iu, porque: "espanhol não tem cedilha" },
  { marca: /[aeiou]lh[aeiou]/iu, porque: "dígrafo lh — espanhol usa ll" },
  { marca: palavra("não"), porque: "espanhol: no" },
  { marca: palavra("você"), porque: "espanhol: usted" },
  { marca: palavra("então"), porque: "espanhol: entonces" },
  { marca: palavra("após"), porque: "espanhol: tras/después" },
  { marca: palavra("até"), porque: "espanhol: hasta" },
  { marca: palavra("é"), porque: "espanhol: es" },
  { marca: palavra("são"), porque: "espanhol: son" },
  { marca: palavra("também"), porque: "espanhol: también (com n)" },
  { marca: palavra("ainda"), porque: "espanhol: aún/todavía" },
  { marca: palavra("nenhum|nenhuma"), porque: "espanhol: ninguno/ninguna" },
  { marca: palavra("mesmas|mesmos"), porque: "espanhol: mismas/mismos" },
  { marca: palavra("deve"), porque: "espanhol: debe" },
  { marca: palavra("manter"), porque: "espanhol: mantener" },
  { marca: palavra("interromper"), porque: "espanhol: interrumpir" },
  { marca: palavra("reverte"), porque: "espanhol: revierte" },
  { marca: palavra("indução"), porque: "espanhol: inducción" },
  { marca: palavra("diluição"), porque: "espanhol: dilución" },
];

/** Os MOTIVOS que dispararam — não as regex. Quem lê a falha quer o porquê. */
function marcasDe(linha: string): string[] {
  return MARCAS_SO_DO_PORTUGUES.filter(({ marca }) => marca.test(linha)).map(
    ({ porque }) => porque
  );
}

test.describe("Tela em espanhol", () => {
  test("nenhum módulo mostra português no passo de entrada com o app em es-419", async ({
    page,
  }) => {
    const achados: string[] = [];
    let linhasVistas = 0;

    for (const mod of MODULOS) {
      await abrirModulo(page, mod.id, "es-419");

      const corpo = await texto(page);
      const linhas = corpo
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 3);
      linhasVistas += linhas.length;

      for (const linha of linhas) {
        const marcas = marcasDe(linha);
        if (!marcas.length) continue;
        achados.push(`${mod.id}: « ${linha.slice(0, 120)} »\n      ↳ ${marcas.join(" · ")}`);
      }
    }

    // ⚠️ VACUIDADE: universo vazio passa calado, e passar calado é o defeito.
    // Se o app não hidratou, `texto()` devolve quase nada e a trava aprovaria uma
    // tela em branco. Os 31 módulos somam mais de 800 linhas hoje.
    expect(
      linhasVistas,
      "poucas linhas lidas nos 31 módulos — a trava pode ter rodado sobre NADA"
    ).toBeGreaterThan(500);

    expect(
      achados,
      "PORTUGUÊS NA TELA COM O APP EM ESPANHOL.\n" +
        "As duas travas de dicionário podem estar verdes: elas leem fonte e artefato,\n" +
        "esta lê a TELA. Os mecanismos possíveis, na ordem em que aparecem:\n" +
        "  · a frase cresceu no FIM  → grave a chave da frase como ela fica em runtime\n" +
        "  · a frase cresceu no INÍCIO (bullet/seta/emoji colado) → tire o caractere de\n" +
        "    apresentação da string; a tradução provavelmente já existe (D-51)\n" +
        "  · o texto PT foi EDITADO e a chave ficou velha → regrave a chave (D-45)\n" +
        "  · nunca houve chave → traduza\n" +
        achados.join("\n")
    ).toEqual([]);
  });
});
