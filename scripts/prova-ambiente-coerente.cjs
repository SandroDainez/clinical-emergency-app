#!/usr/bin/env node
/**
 * TRAVA DO AMBIENTE — ⚠️ **um artefato, ⛔ uma verdade só**.
 *
 * PROMETE:
 *   · que ⛔ toda `EXPO_PUBLIC_*` citada no código do app esteja **classificada**
 *     — ⛔ ou ela decide o primeiro quadro, ⛔ ou ⛔ não decide, ⛔ e ⛔ o motivo
 *     fica escrito. ⛔ Variável nova ⛔ sem classificação **reprova**;
 *   · que ⛔ toda variável que **decide o primeiro quadro** ⛔ e que o ambiente do
 *     build define apareça, com o mesmo valor, ⛔ dentro do bundle do cliente;
 *   · que ⛔ nenhuma delas apareça no bundle quando o ambiente do build **⛔ não
 *     a define** — ⛔ conferível para quem declara `assinatura`;
 *   · o **canário do Supabase**: `guarda-cobertura` no HTML pré-renderizado
 *     ⛔ **↔** a forma do módulo `supabase` no bundle. ⛔ Os dois lados têm de
 *     dizer a mesma coisa sobre haver backend.
 *
 * NÃO PROMETE: que o valor esteja **certo** — ⛔ isso é configuração, ⛔ e ⛔ não
 *   coerência. ⛔ E ⛔ **⛔ não** promete achar divergência de variável ⛔ sem
 *   `assinatura` no caso "ambiente vazio, bundle sujo": ⛔ ⛔ não dá para provar a
 *   ausência de um literal que ⛔ ninguém sabe qual é. ⚠️ ⛔ Para essas, quem
 *   avisa é o canário.
 *
 * UNIVERSO: `dist/` (⛔ ou o diretório passado como argumento) × o ambiente que
 *   o build enxergou × as cinco pastas de código do app.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO QUE ISTO FECHA — ⛔ MEDIDO, 2026-09-08 ─────────────
 *
 * ⛔ ⛔ `EXPO_PUBLIC_*` é **inlinada na transformação**, ⛔ e por isso entra no
 * cache do Metro (`$TMPDIR/metro-cache`). ⚠️⚠️ ⛔ **A chave desse cache ⛔ não
 * inclui o valor da variável**: ⛔ o módulo ⛔ não mudou de conteúdo, ⛔ então o
 * Metro devolve a transformação antiga ⛔ com o literal antigo.
 *
 * ⛔ O **pré-render** avalia `process.env` ⛔ na hora de renderizar, ⛔ sem passar
 * por esse cache.
 *
 * ⚠️⚠️ ⛔ Resultado: **⛔ o mesmo artefato nasce com duas verdades** ⛔ sempre que
 * o cache foi aquecido sob ⛔ outro ambiente. ⛔ Medido nos dois sentidos:
 *
 *   ⛔ cache sem env → export **com** env, ⛔ sem `--clear`
 *        pré-render **vê** Supabase · bundle `null`
 *   ⛔ cache com env → export **sem** env, ⛔ sem `--clear`
 *        pré-render ⛔ **não** vê · bundle `createClient(<url>)`
 *
 * ⛔ ⛔ O segundo é o pior: ⛔ um build feito **de propósito sem ambiente** embarca
 * a URL do Supabase. ⚠️ ⛔ `EXPO_NO_DOTENV=1` sozinho ⛔ **⛔ não** protege disso.
 *
 * ⚠️ A correção é `--clear` em ⛔ todo export; ⛔ esta trava é o que garante que
 * ⛔ ela continue lá — ⛔ e que a classe inteira, ⛔ e ⛔ não o Supabase, siga
 * conferida.
 */
const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const dist = path.resolve(process.argv[2] ?? path.join(appDir, "dist"));

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/* ════════════════════════════════════════════════════════════════════════════
 * 1 · A CLASSIFICAÇÃO — ⚠️ ⛔ e ⛔ ela é **obrigatória**
 * ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⚠️⚠️ ⛔ DECIDEM O PRIMEIRO QUADRO — ⛔ lidas **durante o render**, ⛔ e por isso
 * capazes de fazer o HTML do build discordar do primeiro quadro do cliente.
 *
 * ⚠️ `assinatura` é opcional ⛔ e é o que permite conferir o caso
 * *"ambiente vazio, bundle sujo"*: ⛔ ela reconhece **o valor** dentro do
 * bundle ⛔ sem que ⛔ ninguém precise saber qual ele é.
 */
const DECIDEM_O_PRIMEIRO_QUADRO = {
  EXPO_PUBLIC_SUPABASE_URL: {
    motivo:
      "`lib/supabase.ts` decide `supabase !== null`, que é `backendClinicoDisponivel()`, " +
      "que é o primeiro ramo de `destinoDaGuarda` — muda o que a raiz desenha.",
    assinatura: /[a-z0-9]{15,}\.supabase\.co/,
  },
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: {
    motivo: "a outra metade da mesma decisão — sem ela o cliente também é `null`.",
  },
  EXPO_PUBLIC_UI_V2: {
    motivo:
      "`habilitadoPorAmbiente()` é lida DENTRO do render (`useUiV2Enabled`), " +
      "e escolhe a UI que o build desenha nas sete rotas ACLS.",
  },
  EXPO_PUBLIC_UI_V3: {
    motivo: "mesma forma de `EXPO_PUBLIC_UI_V2`, em `lib/ui-v3-flag.ts`.",
  },
};

/**
 * ⚠️ ⛔ FORA DO RENDER — ⛔ e o motivo ⛔ não é *"parece que não"*: ⛔ é onde a
 * função é chamada.
 */
const FORA_DO_RENDER = {
  EXPO_PUBLIC_HISTORICO: {
    motivo:
      "`historicoDisponivel()` só é chamada em `lib/clinical-session-history.ts`, " +
      "no caminho de dados — nenhum componente ramifica por ela ao desenhar.",
  },
};

/* ── ⚠️ A DESCOBERTA — ⛔ varre o código, ⛔ e ⛔ não confia na lista ────────── */

const PASTAS = ["app", "components", "lib", "acls", "design-system"];

function arquivos(dir) {
  const saida = [];
  const abs = path.join(appDir, dir);
  if (!fs.existsSync(abs)) return saida;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", "dist", ".git"].includes(e.name)) continue;
      saida.push(...arquivos(rel));
    } else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) {
      saida.push(rel);
    }
  }
  return saida;
}

/**
 * ⚠️⚠️ ⛔ SÓ LEITURA DE VERDADE CONTA: `process.env.EXPO_PUBLIC_X`.
 *
 * ⛔ Comentário que escreve *"`EXPO_PUBLIC_UI_V2=all`"* ⛔ não é leitura, ⛔ e
 * incluí-lo faria a catraca cobrar classificação de **exemplo de documentação**.
 */
const descobertas = new Map();
for (const f of PASTAS.flatMap(arquivos)) {
  const s = fs.readFileSync(path.join(appDir, f), "utf8");
  for (const m of s.matchAll(/process\.env\.(EXPO_PUBLIC_[A-Z0-9_]+)/g)) {
    if (!descobertas.has(m[1])) descobertas.set(m[1], new Set());
    descobertas.get(m[1]).add(f);
  }
}

{
  const semClasse = [...descobertas.keys()].filter(
    (v) => !(v in DECIDEM_O_PRIMEIRO_QUADRO) && !(v in FORA_DO_RENDER)
  );
  conf(
    "⚠️⚠️⚠️ ⛔ TODA `EXPO_PUBLIC_*` descoberta está **classificada**",
    semClasse.length === 0,
    `⛔ ${semClasse.join(", ")}\n      ⛔ classifique em DECIDEM_O_PRIMEIRO_QUADRO ⛔ ou FORA_DO_RENDER, ⛔ com motivo`
  );

  /** ⚠️ ⛔ E o contrário: classificação para variável que ⛔ ninguém lê é lixo. */
  const orfas = [...Object.keys(DECIDEM_O_PRIMEIRO_QUADRO), ...Object.keys(FORA_DO_RENDER)]
    .filter((v) => !descobertas.has(v));
  conf(
    "⚠️ ⛔ e ⛔ nenhuma classificação aponta para variável que o código ⛔ não lê",
    orfas.length === 0,
    `⛔ ${orfas.join(", ")}`
  );

  const duplas = Object.keys(DECIDEM_O_PRIMEIRO_QUADRO).filter((v) => v in FORA_DO_RENDER);
  conf(
    "⚠️ ⛔ e ⛔ nenhuma está nas **duas** listas",
    duplas.length === 0,
    `⛔ ${duplas.join(", ")}`
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 * 2 · O AMBIENTE QUE O BUILD ENXERGOU
 * ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⚠️⚠️ ⛔ A RESOLUÇÃO É A MESMA DO EXPORT, ⛔ e ⛔ não uma aproximação:
 * `process.env` vence; ⛔ e, ⛔ sem `EXPO_NO_DOTENV`, os arquivos `.env*` entram
 * ⛔ por baixo, na ordem que o Expo usa.
 *
 * ⚠️ ⛔ Por isso esta prova roda **logo depois do build**, ⛔ no mesmo shell:
 * ⛔ ela precisa ver o ambiente que o build viu.
 */
function ambienteDoBuild() {
  const env = { ...process.env };
  if (process.env.EXPO_NO_DOTENV) return env;
  for (const arquivo of [".env.local", ".env"]) {
    const f = path.join(appDir, arquivo);
    if (!fs.existsSync(f)) continue;
    for (const linha of fs.readFileSync(f, "utf8").split("\n")) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      if (env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

const AMBIENTE = ambienteDoBuild();

/* ════════════════════════════════════════════════════════════════════════════
 * 3 · O BUNDLE DO CLIENTE
 * ══════════════════════════════════════════════════════════════════════════ */

const web = path.join(dist, "_expo", "static", "js", "web");
if (!fs.existsSync(web)) {
  console.log(`\n❌ ⛔ ${dist} ⛔ não parece um export — ⛔ rode o build antes.\n`);
  process.exit(1);
}
const entry = fs.readdirSync(web).find((f) => f.startsWith("entry-"));
const bundle = fs.readFileSync(path.join(web, entry), "utf8");

/**
 * ⚠️⚠️ ⛔ NENHUMA `process.env.EXPO_PUBLIC_*` SOBREVIVE NO BUNDLE — ⛔ e ⛔ isso
 * ⛔ não é curiosidade: ⛔ é o que **prova** que o valor foi **inlinado**, ⛔ e
 * ⛔ portanto que ele é congelável por cache.
 */
conf(
  "⚠️⚠️ o bundle ⛔ não carrega `process.env.EXPO_PUBLIC_*` — ⛔ tudo foi inlinado",
  !/process\.env\.EXPO_PUBLIC_/.test(bundle),
  "⛔ sobrou leitura em tempo de execução — ⛔ o modelo desta trava mudou"
);

/**
 * ⚠️⚠️⚠️ ⛔ ESTA PROVA PRECISA ENXERGAR O AMBIENTE **DO BUILD** — ⛔ e ⛔ ela
 * ⛔ não tem como adivinhá-lo.
 *
 * ⛔ `build:web:teste` põe `EXPO_NO_DOTENV=1` **dentro do próprio script**, ⛔ e
 * ⛔ essa variável ⛔ não atravessa para o `npm run` seguinte. ⚠️ Rodar ⛔ sem
 * ⛔ ela depois desse build faria a prova ler o `.env.local` ⛔ e acusar
 * divergência ⛔ que ⛔ não existe. ⛔ Por isso o `test:all` chama
 * `EXPO_NO_DOTENV=1 npm run test:ambiente`.
 *
 * ⚠️⚠️ ⛔ E ⛔ há como **conferir** se a regra bate: ⛔ o HTML pré-renderizado
 * ⛔ já diz o que o build enxergou. ⛔ Se ele discordar da resolução desta
 * prova, ⛔ o problema é a **invocação**, ⛔ e ⛔ não o artefato — ⛔ e dizer isso
 * é melhor que reprovar um build são.
 */
function preRenderViuSupabase() {
  const rota = path.join(dist, "modulos", "pcr-adulto.html");
  if (!fs.existsSync(rota)) return undefined;
  return fs.readFileSync(rota, "utf8").includes("guarda-cobertura");
}

const REGRA_BATE = (() => {
  const html = preRenderViuSupabase();
  if (html === undefined) return true;
  const doAmbiente =
    (AMBIENTE.EXPO_PUBLIC_SUPABASE_URL ?? "").trim() !== "" &&
    (AMBIENTE.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim() !== "";
  if (html === doAmbiente) return true;
  console.log(
    `\n  ⚠️ AVISO — a regra de ambiente desta prova ⛔ não é a do build.\n` +
      `      pré-render ${html ? "viu" : "não viu"} Supabase · ` +
      `esta execução resolve o ambiente como ${doAmbiente ? "definido" : "vazio"}.\n` +
      `      ⛔ As conferências por variável ficam de fora; ⛔ o canário continua valendo.\n` +
      `      ⚠️ Depois de \`build:web:teste\`, rode \`EXPO_NO_DOTENV=1 npm run test:ambiente\`.`
  );
  return false;
})();

for (const [nome, decl] of Object.entries(DECIDEM_O_PRIMEIRO_QUADRO)) {
  if (!REGRA_BATE) break;
  const valor = AMBIENTE[nome];
  const definida = valor !== undefined && String(valor).trim() !== "";

  if (definida) {
    /**
     * ⚠️⚠️ ⛔ O AMBIENTE DEFINE ⛔ E O BUNDLE ⛔ NÃO TEM: ⛔ é o cenário
     * *"cache aquecido sem env"* — ⛔ o pré-render vai enxergar ⛔ e o cliente
     * ⛔ não.
     */
    conf(
      `⚠️⚠️⚠️ \`${nome}\` — ⛔ o ambiente define, ⛔ e o **bundle carrega o mesmo valor**`,
      bundle.includes(String(valor)),
      `⛔ o valor está no ambiente do build ⛔ e ⛔ NÃO está no bundle.\n` +
        `      ⛔ É transformação do Metro reaproveitada de outro ambiente — ⛔ falta \`--clear\`.`
    );
  } else if (decl.assinatura) {
    /**
     * ⚠️⚠️ ⛔ O AMBIENTE ⛔ NÃO DEFINE ⛔ E O BUNDLE CARREGA: ⛔ é o inverso, ⛔ e
     * é o pior — ⛔ um build feito **sem ambiente** embarcando valor de outro.
     */
    conf(
      `⚠️⚠️⚠️ \`${nome}\` — ⛔ o ambiente ⛔ não define, ⛔ e o bundle ⛔ **não carrega valor**`,
      !decl.assinatura.test(bundle),
      `⛔ o bundle carrega um valor que ⛔ este build ⛔ não tinha.\n` +
        `      ⛔ Cache do Metro aquecido COM ambiente ⛔ e reaproveitado SEM — ⛔ falta \`--clear\`.`
    );
  } else {
    ok++; /** ⚠️ ⛔ Sem `assinatura` ⛔ não dá para provar ausência — ⛔ e ⛔ isto está dito acima. */
  }
}

/* ════════════════════════════════════════════════════════════════════════════
 * 4 · O CANÁRIO DO SUPABASE — ⚠️ HTML **↔** BUNDLE
 * ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⚠️⚠️⚠️ ⛔ ELE MEDE OS **DOIS LADOS DO MESMO ARTEFATO**, ⛔ e ⛔ é por isso que
 * ⛔ ele pega ⛔ até o que ⛔ não tem `assinatura`.
 *
 * ⛔ `destinoDaGuarda` devolve `modo_local` ⛔ quando ⛔ não há backend — ⛔ e
 * ⛔ nesse destino ⛔ nada cobre a tela. ⚠️ Com backend, o estado inicial é
 * `carregando`, ⛔ e a **cobertura** é desenhada.
 *
 * ⚠️ Então: `guarda-cobertura` no HTML **é a assinatura de que o pré-render
 * enxergou Supabase** — ⛔ e a forma do módulo no bundle diz o que o cliente
 * enxergou. ⛔ Os dois têm de concordar.
 */
{
  const rota = path.join(dist, "modulos", "pcr-adulto.html");
  conf("⚠️ o HTML pré-renderizado existe", fs.existsSync(rota), `⛔ ${rota}`);

  if (fs.existsSync(rota)) {
    const html = fs.readFileSync(rota, "utf8");
    const preRenderViu = html.includes("guarda-cobertura");

    const i = bundle.indexOf('Object.defineProperty(e,"supabase"');
    conf("⚠️ o módulo `supabase` foi encontrado no bundle", i >= 0, "⛔ a forma do módulo mudou");
    const trecho = i >= 0 ? bundle.slice(i, i + 700) : "";
    const clienteViu = /createClient\)\("http/.test(trecho);

    conf(
      "⚠️⚠️⚠️ ⛔ CANÁRIO — `guarda-cobertura` no HTML **↔** módulo `supabase` no bundle",
      preRenderViu === clienteViu,
      `⛔ pré-render ${preRenderViu ? "VIU" : "não viu"} Supabase ⛔ e o cliente ` +
        `${clienteViu ? "VIU" : "não viu"}.\n` +
        `      ⛔ **Um artefato, duas verdades** — ⛔ é exatamente o contrato que esta trava guarda.`
    );
  }
}

/* ── ⚠️ O RETRATO, para quem for ler a saída ──────────────────────────────── */

if (process.env.AMBIENTE_VERBOSO) {
  console.log("\n  Classificadas:");
  for (const v of [...descobertas.keys()].sort()) {
    const onde = v in DECIDEM_O_PRIMEIRO_QUADRO ? "primeiro quadro" : "fora do render";
    const def = AMBIENTE[v] !== undefined && String(AMBIENTE[v]).trim() !== "";
    console.log(`    ${v.padEnd(38)} ${onde.padEnd(16)} ambiente=${def ? "definida" : "vazia"}`);
  }
}

console.log(
  falhas === 0
    ? `\n✅ ambiente coerente — ${ok} conferências, ${descobertas.size} variáveis classificadas · ${path.basename(dist)}\n`
    : `\n❌ ${falhas} falha(s) · ${ok} ok · ${path.basename(dist)}\n`
);
process.exit(falhas === 0 ? 0 : 1);
