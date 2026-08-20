/**
 *
 * PROMETE: toda trava test:* do package.json está ligada ao test:all, ou tem isenção com motivo registrado.
 * NÃO PROMETE: que as travas ligadas funcionem — só que estejam ligadas. É meta-trava.
 * UNIVERSO: os scripts do package.json.

 * Meta-trava: toda trava tem de estar ligada ao pipeline.
 *
 * ── O DEFEITO QUE ORIGINOU ESTE SCRIPT ───────────────────────────────────────
 *
 * A auditoria construiu, ao longo de várias sessões, sete verificações que
 * QUEBRAM O BUILD por desenho: árvores de decisão, calculadoras, fatos
 * clínicos, sulfatação, motor, AVC, coronárias. Cada uma foi escrita, testada
 * por mutação, e declarada trava.
 *
 * Nenhuma delas estava no `test:all`.
 *
 * Sete portas trancadas num muro sem portão: existiam, pareciam proteger, e
 * ninguém as abria. É a mesma classe do defeito da dopamina — o número certo
 * no lugar certo, sem nada ligando um ao outro — e não se descobre lendo o
 * script, porque o script está impecável. Descobre-se olhando o pipeline.
 *
 * ── O QUE ESTE SCRIPT COBRA ──────────────────────────────────────────────────
 *
 * Todo script `test:*` do package.json aparece dentro do `test:all`.
 *
 * A trava nova que alguém escrever daqui a três semanas nasce ligada, ou o
 * build cai no mesmo dia — em vez de nascer solta e ser descoberta meses
 * depois, como estas sete.
 *
 * ── ISENÇÕES ─────────────────────────────────────────────────────────────────
 *
 * Uma isenção sem motivo escrito é um buraco. Cada uma abaixo diz por quê.
 * Isenção nova entra aqui com a razão, nunca no silêncio.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(appDir, "package.json"), "utf8"));
const scripts = pkg.scripts || {};

const ISENTOS = {
  // O próprio agregador — exigir que ele contenha a si mesmo é recursão, não regra.
  "test:all": "é o agregador",
  // `playwright --ui` abre uma janela interativa e fica esperando o humano.
  // Num pipeline, travaria para sempre. É a mesma suíte do test:e2e, que roda.
  "test:e2e:ui": "variante interativa do test:e2e — abre janela e aguarda o humano; a suíte roda em test:e2e",
  // ⚠️ ISENÇÃO TEMPORÁRIA, COM DATA E DONO (2026-08-20).
  //
  // A trava existe, roda e ACUSA UMA VIOLAÇÃO REAL: `trata_hipercalemia` tem 8
  // ações visíveis, e o teto da §7.4 é 7. Ligá-la ao test:all agora deixaria o
  // build vermelho por uma decisão CLÍNICA que não é minha — qual das oito sai
  // da tela, ou se o teto de 7 vale para uma conduta de três frentes.
  //
  // Enquanto o autor não decide, a trava fica rodável por fora
  // (`npm run test:tamanho-de-item`) e a dívida aparece aqui, escrita, em vez de
  // sumir num teto ajustado para caber no que existe (que é o que a D-35 chama
  // de "consertar o instrumento para agradar o código").
  //
  // ⚠️ ESTA LINHA SAI JUNTO COM A DECISÃO — ela não é permissão permanente.
  "test:tamanho-de-item": "⚠️ TEMPORÁRIO (2026-08-20): a trava acusa 8 ações em trata_hipercalemia (teto 7 da §7.4) e a escolha do que sai é do autor. Rodar por fora com `npm run test:tamanho-de-item` até a decisão.",
};

const alvo = scripts["test:all"];
if (!alvo) {
  console.error("❌ package.json não tem `test:all` — não existe pipeline para ligar as travas.");
  process.exit(1);
}

/**
 * `npm run test:motor` casa; `npm run test:motor-antigo` NÃO deve casar com
 * "test:motor". Sem a fronteira à direita, um nome que é prefixo de outro daria
 * falso "está registrado" — e a trava nasceria solta acreditando estar ligada.
 */
function estaRegistrado(nome) {
  return new RegExp(`\\brun ${nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w:-])`).test(alvo);
}

const soltos = [];
let ok = 0;

for (const nome of Object.keys(scripts)) {
  if (!nome.startsWith("test:")) continue;
  if (ISENTOS[nome]) continue;
  if (estaRegistrado(nome)) ok++;
  else soltos.push(nome);
}

console.log("\nPipeline — toda trava ligada ao test:all\n");

if (soltos.length) {
  for (const s of soltos) {
    console.log(`❌ "${s}" não está no test:all — trava que existe, parece proteger e não protege.`);
  }
  console.log(
    `\n   Acrescente \`npm run ${soltos[0]}\` ao test:all, ou registre a isenção com o motivo\n` +
    `   em ISENTOS, em scripts/valida-pipeline.cjs.\n`
  );
  process.exit(1);
}

console.log(
  `✅ ${ok} travas ligadas · ${Object.keys(ISENTOS).length - 1} isenção(ões) com motivo registrado\n`
);
process.exit(0);
