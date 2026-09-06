#!/usr/bin/env node
/**
 * TRAVA DA AFORDÂNCIA — ⛔ o que se toca ⛔ NÃO pode parecer texto.
 *
 * PROMETE: que ⛔ nenhum `<Pressable>` do módulo AVC seja desenhado ⛔ sem
 *   **corpo** (preenchimento) ⛔ nem **borda** — as duas marcas que fazem um
 *   alvo se distinguir de um parágrafo.
 *
 * NÃO PROMETE: que a cor seja bonita, que o alvo seja grande o bastante ⛔ nem
 *   que o rótulo diga a coisa certa. ⛔ Isso é `valida-contraste`,
 *   `valida-rotulos-clinicos` ⛔ e o olho do autor.
 *
 * UNIVERSO: `components/avc/**.tsx`.
 *
 * ── ⚠️⚠️ POR QUE ESTA TRAVA EXISTE ─────────────────────────────────────────
 *
 * ⛔ O autor relatou **seis vezes**, entre 2026-09-05 ⛔ e 09-06, que os
 * controles do módulo *"parecem texto ⛔ e ⛔ não botões"*. ⚠️ Nas **cinco**
 * primeiras eu consertei ⛔ só o pedaço que aparecia na captura que ⛔ ele tinha
 * mandado — ⛔ e ⛔ na captura seguinte havia outro.
 *
 * ⚠️⚠️ ⛔ ISSO ⛔ NÃO É UM PROBLEMA DE GOSTO: ⛔ é uma classe de defeito, ⛔ e
 * classe de defeito se fecha com varredura, ⛔ e ⛔ não com remendo. ⚠️ Enquanto
 * ⛔ nada varria, cada tela nova nascia com a chance de repetir o erro — ⛔ e o
 * autor ⛔ é quem pagava, uma captura por vez.
 *
 * ── ⚠️ COMO ELA LÊ ─────────────────────────────────────────────────────────
 *
 * ⚠️ Para cada `<Pressable>`, ela junta os estilos citados no bloco de abertura
 * (`e.foo`, `s.foo`) ⛔ e procura, nas declarações do próprio arquivo,
 * `backgroundColor` ⛔ ou `border*`. ⛔ Sem ⛔ nenhum dos dois, é achado.
 *
 * ⚠️⚠️ ⛔ ELA ⛔ NÃO ENXERGA DENTRO DE COMPONENTE FILHO — ⛔ e é ⛔ por isso que a
 * lista de EXCEÇÕES existe, ⛔ com o motivo escrito ⛔ e o filho nomeado. ⛔ Uma
 * exceção ⛔ sem motivo é a trava sendo desligada em silêncio.
 */
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const DIRS = ["components/avc", "components/avc/ui", "components/avc/sistema"];

/**
 * ⚠️⚠️ EXCEÇÕES — ⛔ cada uma nomeia **quem desenha a moldura no lugar dela**.
 *
 * ⛔ ⛔ Não é *"este é feio ⛔ e tudo bem"*: é *"a moldura existe, ⛔ e mora no
 * filho"*. ⚠️ Se o filho perder a moldura, quem quebra é a trava DELE.
 */
const EXCECOES = [
  {
    testID: "avc-coleta-abrir-",
    porque: "a moldura é do <CabecalhoDeBloco aberto>, que a trava de campos-clinicos protege",
  },
  {
    testID: "avc-bloco-abrir-",
    porque: "idem — o cabeçalho recolhível desenha fundo, borda e o sinal ▸/▾",
  },
  {
    testID: "avc-hora-",
    porque: "a linha do relógio já é um cartão (`rel`), e o ALVO com moldura é o valor (`relValorToque`)",
  },
  {
    testID: "avc-passo-",
    porque: "a moldura entra em `trilhaItemTocavel`, dentro do item — e só quando há `onTocar`",
  },
];

function estilosDeclarados(txt) {
  const out = {};
  const linhas = txt.split("\n");
  for (let i = 0; i < linhas.length; i++) {
    const m = linhas[i].match(/^(\s{4,6})([A-Za-z0-9_]+):\s*\{(.*)$/);
    if (!m) continue;
    const indentacao = m[1].length;
    let corpo = m[3];
    if (!/\},?\s*$/.test(m[3])) {
      for (let j = i + 1; j < linhas.length; j++) {
        if (new RegExp(`^\\s{${indentacao}}\\},?$`).test(linhas[j])) break;
        corpo += "\n" + linhas[j];
      }
    }
    out[m[2]] = corpo;
  }
  return out;
}

const MARCA_DE_ALVO = /backgroundColor|borderWidth|borderTopWidth|borderLeftWidth|borderColor/;

const achados = [];
let pressionaveis = 0;
let isentos = 0;

for (const dir of DIRS) {
  for (const nome of fs.readdirSync(path.join(raiz, dir))) {
    if (!nome.endsWith(".tsx")) continue;
    const rel = `${dir}/${nome}`;
    const txt = fs.readFileSync(path.join(raiz, rel), "utf8");
    const estilos = estilosDeclarados(txt);
    const linhas = txt.split("\n");

    linhas.forEach((linha, i) => {
      if (!/<Pressable/.test(linha)) return;
      pressionaveis++;

      /** ⚠️ O bloco de abertura da tag — até o `>` sozinho ⛔ ou o `/>`. */
      let bloco = "";
      for (let j = i; j < Math.min(i + 45, linhas.length); j++) {
        bloco += linhas[j] + "\n";
        if (/^\s*>\s*$/.test(linhas[j]) || /\/>\s*$/.test(linhas[j])) break;
      }

      const citados = [...bloco.matchAll(/\b[es]\.([A-Za-z0-9_]+)/g)].map((m) => m[1]);
      const temMarca = citados.some((c) => estilos[c] !== undefined && MARCA_DE_ALVO.test(estilos[c]));
      if (temMarca) return;

      const testID = (bloco.match(/testID=\{?[`"]([^`"$]*)/) || [])[1] || "";
      const isento = EXCECOES.find((x) => testID.startsWith(x.testID));
      if (isento) { isentos++; return; }

      achados.push(
        `${rel}:${i + 1}\n      testID=${testID || "(sem testID)"} · estilos=[${citados.join(", ") || "nenhum"}]`
      );
    });
  }
}

if (achados.length > 0) {
  console.log(`\n❌ AFORDÂNCIA — ${achados.length} controle(s) desenhado(s) como texto:\n`);
  achados.forEach((a, i) => console.log(`  ${i + 1}. ${a}\n`));
  console.log(
    "⚠️ Um controle sem preenchimento NEM borda é lido como parágrafo — e foi\n" +
    "   exatamente isso que o autor relatou seis vezes. Dê corpo e borda a ele\n" +
    "   (ver `design-system/afordancia.ts`), ou declare a exceção NOMEANDO o\n" +
    "   componente filho que desenha a moldura no lugar dele.\n"
  );
  process.exit(1);
}

console.log(
  `✅ AFORDÂNCIA — ${pressionaveis} controle(s) conferido(s) · ` +
  `${isentos} com moldura no filho (exceção declarada)`
);
