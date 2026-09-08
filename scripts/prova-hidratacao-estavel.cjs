#!/usr/bin/env node
/**
 * TRAVA DA HIDRATAÇÃO — ⚠️ **⛔ ninguém ramifica por largura dentro do render**.
 *
 * PROMETE:
 *   · que `useWindowDimensions` do `react-native` seja importado em **⛔ um
 *     único arquivo** — `lib/dimensoes-da-janela.ts`;
 *   · que esse arquivo continue **esperando a montagem na web**, ⛔ que é a
 *     propriedade inteira: ⛔ sem a espera ⛔ ele vira o import direto de novo,
 *     ⛔ só que com nome bonito.
 *
 * NÃO PROMETE: que ⛔ nenhuma outra fonte de divergência exista — data, `Math.
 *   random`, `typeof window`. ⛔ Quem varre isso é o e2e `hidratacao-limpa`,
 *   ⛔ que abre as rotas ⛔ e escuta o erro do React.
 *
 * UNIVERSO: `app/` × `components/` × `lib/` × `acls/`.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO QUE ISTO FECHA (2026-09-08) ────────────────────────
 *
 * ⛔ ⛔ **React #418 em ⛔ toda rota `/modulos/*`**, em produção.
 *
 * ⛔ `react-native-web` inicia `Dimensions` em **`width: 0`** ⛔ e ⛔ só a
 * atualiza quando há DOM. ⚠️ ⛔ No pré-render do `expo export` ⛔ não há DOM —
 * ⛔ então **toda** comparação `width < N` é verdadeira no HTML do build, ⛔ e
 * ⛔ falsa no navegador de qualquer telefone real.
 *
 * ⛔ ⛔ O React descartava o HTML do build ⛔ e redesenhava tudo: ⛔ o app
 * ⛔ parecia funcionar, ⛔ e a hidratação estava morta em ⛔ todos os módulos.
 *
 * ⚠️ ⛔ Nove chamadas ramificavam por largura. ⛔ Uma basta para o erro voltar.
 */
const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const CASA = path.join("lib", "dimensoes-da-janela.ts");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/** ⚠️ Varre o código do app — ⛔ e ⛔ não `node_modules` ⛔ nem o build. */
function arquivos(dir) {
  const saida = [];
  for (const e of fs.readdirSync(path.join(appDir, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", "dist", ".git", "__snapshots__"].includes(e.name)) continue;
      saida.push(...arquivos(rel));
    } else if (/\.(ts|tsx)$/.test(e.name)) {
      saida.push(rel);
    }
  }
  return saida;
}

const todos = ["app", "components", "lib", "acls", "design-system"]
  .filter((d) => fs.existsSync(path.join(appDir, d)))
  .flatMap((d) => arquivos(d));

/* ══ ⚠️⚠️⚠️ 1 · UMA CASA SÓ ═══════════════════════════════════════════════ */

{
  const infratores = todos.filter((f) => {
    if (f === CASA) return false;
    const s = fs.readFileSync(path.join(appDir, f), "utf8");
    /**
     * ⚠️ ⛔ Só o import **do `react-native`** conta: ⛔ quem importa o hook desta
     * casa está ⛔ exatamente fazendo o certo.
     */
    return /useWindowDimensions/.test(s) && !/from "\.{1,2}[^"]*dimensoes-da-janela"/.test(s);
  });
  conf(
    "⚠️⚠️⚠️ `useWindowDimensions` mora em **⛔ um** arquivo",
    infratores.length === 0,
    `⛔ ${infratores.join(", ")}\n      ⛔ ramificar por largura no render mata a hidratação do build estático`
  );
}

/* ══ ⚠️⚠️ 2 · E A CASA CONTINUA ESPERANDO A MONTAGEM ════════════════════ */

/**
 * ⚠️⚠️ ⛔ SEM ISTO A CASA ⛔ NÃO VALE ⛔ NADA: ⛔ um `return real` direto
 * devolveria o defeito inteiro ⛔ com a trava ⛔ ainda passando.
 */
{
  const s = fs.readFileSync(path.join(appDir, CASA), "utf8");
  conf(
    "⚠️⚠️ a casa devolve o valor do **pré-render** até montar",
    /DIMENSOES_DO_PRERENDER/.test(s) && /montado \? real : DIMENSOES_DO_PRERENDER/.test(s),
    "⛔ a espera sumiu — ⛔ o primeiro quadro do cliente voltou a discordar do build"
  );
  conf(
    "⚠️ ⛔ e ⛔ só a **web** espera — ⛔ nativo ⛔ não tem pré-render",
    /Platform\.OS === "web"/.test(s),
    "⛔ sem o recorte, o nativo perde um quadro de layout sem motivo"
  );
  /**
   * ⚠️⚠️ ⛔ O ZERO ⛔ NÃO É ESCOLHA NOSSA — ⛔ é o valor inicial do
   * `react-native-web`. ⛔ Trocá-lo aqui ⛔ não muda o build: ⛔ só faz os dois
   * voltarem a discordar.
   */
  const rnw = path.join(appDir, "node_modules", "react-native-web", "dist", "exports", "Dimensions", "index.js");
  if (fs.existsSync(rnw)) {
    const fonte = fs.readFileSync(rnw, "utf8");
    const inicial = fonte.slice(fonte.indexOf("var dimensions = {"), fonte.indexOf("var listeners"));
    conf(
      "⚠️⚠️⚠️ o `width: 0` do pré-render foi **conferido na dependência**",
      /width:\s*0/.test(inicial),
      "⛔ o `react-native-web` mudou o valor inicial — ⛔ a constante desta casa ficou errada"
    );
  }
}

console.log(
  falhas === 0
    ? `\n✅ hidratação estável — ${ok} conferências, ${todos.length} arquivos varridos\n`
    : `\n❌ ${falhas} falha(s) · ${ok} ok\n`
);
process.exit(falhas === 0 ? 0 : 1);
