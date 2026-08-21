#!/usr/bin/env node
/**
 * TODO PRESET NUMÉRICO DO APP — a varredura que nunca existiu (R-99).
 *
 * PROMETE: listar TODO campo de entrada com preset numérico nas árvores do app,
 *   classificado em três colunas — escala de digitação · valor clínico COM fonte
 *   declarada · valor clínico SEM fonte —, com universo impresso ao lado.
 * NÃO PROMETE: dizer se o valor está clinicamente certo, nem corrigir nada. Esta
 *   é MEDIÇÃO. A correção é por módulo, com o autor, como sempre.
 * UNIVERSO: todas as árvores `*-tree.ts` do app, compiladas, com piso no retrato.
 *
 * ── ⚠️ POR QUE ESTA VARREDURA NASCEU TARDE ─────────────────────────────────
 *
 * O R-99 registrou três instâncias do mesmo defeito — número correto em ALGUM
 * contexto entrando sem declarar de onde veio. As duas primeiras eram TEXTO. A
 * terceira era INTERFACE: `[7,0] [7,15] [7,25] [7,35]` no campo de pH, com o
 * primeiro degrau sendo o limiar recém-removido por não ter procedência.
 *
 * **Ninguém audita um botão** — e por isso ninguém nunca tinha olhado, em 31
 * módulos. Este defeito, ao contrário do R-98, TEM número escrito: é barato de
 * medir e não depende de julgamento.
 *
 * ── ⚠️ A REGRA DE OMISSÃO ──────────────────────────────────────────────────
 *
 * O que não está declarado em `auditoria/presets-declarados.json` cai em SEM
 * FONTE. Ausência de declaração é ausência de procedência — nunca presunção de
 * que exista uma em algum lugar.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { conferirUniverso } = require("./lib/universo.cjs");
const { lerFonte } = require("./lib/fonte.cjs");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "presets-"));
const REGISTRO = path.join(app, "auditoria", "presets-declarados.json");

const arquivos = fs.readdirSync(app).filter((f) => /-(decision-)?tree\.ts$/.test(f)).sort();
if (!arquivos.length) {
  console.log("\n❌ nenhuma árvore encontrada — o varredor quebrou. Isto é \"não consegui olhar\".\n");
  process.exit(1);
}
if (!fs.existsSync(REGISTRO)) {
  console.log("\n❌ auditoria/presets-declarados.json não existe — sem ele, todo preset ficaria sem classificação.\n");
  process.exit(1);
}
const registro = JSON.parse(fs.readFileSync(REGISTRO, "utf8"));
const ESCALA = new Map((registro.escala ?? []).map((e) => [e.campo, e.porque]));
const COM_FONTE = new Map((registro.com_fonte ?? []).map((e) => [`${e.campo}`, e]));

execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
  "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  ...arquivos.map((f) => path.join(app, f)),
], { cwd: app, stdio: ["ignore", "ignore", "inherit"] });

const numerico = (v) => {
  const cru = String(v ?? "").trim();
  if (cru === "") return null; // "não tenho esse valor" NÃO é preset numérico
  const n = Number(cru.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

const linhas = { escala: [], com_fonte: [], sem_fonte: [] };
let arvores = 0, nos = 0, campos = 0, presets = 0;

for (const arq of arquivos) {
  const saida = path.join(tmp, arq.replace(/\.ts$/, ".js"));
  if (!fs.existsSync(saida)) continue;
  for (const arv of Object.values(require(saida))) {
    if (!arv || typeof arv !== "object" || !arv.nodes) continue;
    arvores += 1;
    for (const no of Object.values(arv.nodes)) {
      nos += 1;
      for (const campo of no.fields ?? []) {
        campos += 1;
        const valores = (campo.presets ?? []).map((p) => numerico(p.value)).filter((n) => n !== null);
        presets += (campo.presets ?? []).length;
        if (!valores.length) continue;
        const linha = {
          modulo: arq.replace(/\.ts$/, ""),
          no: no.id,
          campo: campo.id,
          valores: valores.join(" · "),
          unidade: campo.unit || "",
        };
        if (ESCALA.has(campo.id)) linhas.escala.push({ ...linha, porque: ESCALA.get(campo.id) });
        else if (COM_FONTE.has(campo.id)) linhas.com_fonte.push({ ...linha, fonte: COM_FONTE.get(campo.id).fonte });
        else linhas.sem_fonte.push(linha);
      }
    }
  }
}

fs.rmSync(tmp, { recursive: true, force: true });

// ── AS TELAS FORA DE ÁRVORE ────────────────────────────────────────────────
//
// ⚠️ O UNIVERSO NÃO É SÓ ÁRVORE, E DIZER "31 MÓDULOS" VARRENDO 20 É R-87. Onze
// dos 31 módulos não têm árvore: são telas próprias, calculadoras e painéis — e
// é exatamente lá que moram campos numéricos, como o de eletrólitos, de onde
// saíram as doses da hipercalemia.
//
// O que a varredura alcança HOJE nessas telas: os PLACEHOLDERS numéricos do
// motor de calculadoras ("ex: 175"). Eles são classe própria — exemplo de
// digitação, mais fraco que botão, e ainda assim um número sugerido. Os demais
// campos daquelas telas são livres, e isso está declarado no registro.
// ⚠️ `lerFonte` E NÃO `readFileSync`: comentário não renderiza nada, e um
// placeholder citado num comentário não é um placeholder na tela. Contá-lo
// inflaria o universo com coisa que o usuário nunca vê.
const engineSrc = lerFonte(path.join(app, "clinical-calculators-engine.ts"));
const placeholders = [...engineSrc.matchAll(/id:\s*"([a-zA-Z0-9_]+)"[^}]*?placeholder:\s*"ex:\s*([^"]+)"/g)]
  .map((m) => ({ campo: m[1], exemplo: m[2] }));
const semArvore = registro.modulos_sem_arvore ?? [];
const comCampo = semArvore.filter((m) => m.tem_campo_numerico);

console.log("\nTODO PRESET NUMÉRICO DO APP — medição, não correção (R-99)\n");
console.log(
  `   universo: ${arvores} árvores + ${semArvore.length} telas fora de árvore · ${nos} nós · ` +
  `${campos} campos de entrada · ${presets} presets · ${placeholders.length} placeholders de calculadora`
);
console.log(`   dos ${semArvore.length} módulos SEM árvore, ${comCampo.length} têm campo numérico e ${semArvore.length - comCampo.length} não têm (declarado, um a um)`);
const okA = conferirUniverso("mapa-de-presets", "arvores", arvores);
const okC = conferirUniverso("mapa-de-presets", "campos_de_entrada", campos);
const okT = conferirUniverso("mapa-de-presets", "telas_sem_arvore", semArvore.length);
const okP = conferirUniverso("mapa-de-presets", "placeholders_de_calculadora", placeholders.length);

const bloco = (titulo, itens, extra) => {
  console.log(`\n── ${titulo}: ${itens.length} ──`);
  if (!itens.length) { console.log("   nenhum."); return; }
  for (const l of itens) {
    console.log(`   ${l.modulo} · ${l.no} · ${l.campo}${l.unidade ? ` (${l.unidade})` : ""}`);
    console.log(`      [${l.valores}]${extra && extra(l) ? `  — ${extra(l)}` : ""}`);
  }
};
bloco("ESCALA DE DIGITAÇÃO (não é corte clínico)", linhas.escala, (l) => l.porque);
bloco("VALOR CLÍNICO COM FONTE DECLARADA", linhas.com_fonte, (l) => l.fonte);
bloco("⚠️ VALOR CLÍNICO SEM FONTE DECLARADA — a lista que interessa", linhas.sem_fonte);

console.log(`\n── PLACEHOLDERS NUMÉRICOS DAS CALCULADORAS (fora de árvore): ${placeholders.length} ──`);
console.log("   Classe própria: são EXEMPLO de digitação (\"ex: 175\"), mais fracos que botão — mas");
console.log("   ainda assim número sugerido, e nenhum deles tem procedência declarada.");
for (const ph of placeholders.slice(0, 8)) console.log(`   ${ph.campo}: ex: ${ph.exemplo}`);
if (placeholders.length > 8) console.log(`   … e mais ${placeholders.length - 8}`);

console.log("\n── MÓDULOS SEM ÁRVORE, UM A UM ──");
for (const m of semArvore) {
  console.log(`   ${m.tem_campo_numerico ? "campo numérico SIM" : "campo numérico não"} · ${m.modulo}`);
  console.log(`      ${m.onde} — ${m.o_que}`);
}

console.log(
  `\n   TOTAIS · escala ${linhas.escala.length} · com fonte ${linhas.com_fonte.length} · SEM FONTE ${linhas.sem_fonte.length}`
);
console.log("   ⚠️ Esta varredura NÃO corrige e NÃO julga o valor. A correção é por módulo, com o autor.");
console.log("   ⚠️ O que não está declarado cai em SEM FONTE: ausência de declaração é ausência de procedência.\n");

if (!okA || !okC || !okT || !okP) {
  console.log("❌ universo abaixo do piso — as contagens acima NÃO significam cobertura.\n");
  process.exit(1);
}
