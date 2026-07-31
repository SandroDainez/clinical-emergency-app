/**
 * Trava do FLUXO GUIADO — quando o app conclui em vez de perguntar.
 *
 * POR QUE ESTE SCRIPT EXISTE
 * --------------------------
 * "Há sinais de instabilidade ATRIBUÍVEIS à frequência baixa?" é pergunta de
 * especialista: pressupõe saber o que conta como sinal e saber atribuí-lo à
 * frequência. Quem não tem experiência trava aí — e travar num fluxo de
 * emergência é o pior desfecho possível de uma tela.
 *
 * O pedido do autor do app foi desmembrar a pergunta em observações simples que
 * qualquer um responde à beira do leito, e deixar o APP concluir.
 *
 * A conclusão é código. Código que decide conduta clínica precisa de teste, e o
 * teste precisa cobrir a REGRA, não um caminho feliz: cada sinal isolado tem de
 * bastar para concluir instabilidade, porque é assim que a diretriz define.
 *
 * O QUE ELE PROVA
 * ---------------
 * 1. Cada um dos cinco achados, SOZINHO, leva a "instável". Um `||` que virasse
 *    `&&` por descuido passaria despercebido sem isto.
 * 2. Nenhum achado leva a "estável".
 * 3. O limiar de PAS é o declarado (< 90), inclusive nas bordas 89/90.
 * 4. O roteamento derivado só devolve destinos que ele mesmo declarou em
 *    `possiveis` — é isso que mantém o grafo auditável estaticamente.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fluxo-guiado-"));

execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tempDir,
    path.join(appDir, "acls-bradycardia-tree.ts"),
  ],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
);

const mod = require(path.join(tempDir, "acls-bradycardia-tree.js"));
const arvore = Object.values(mod).find((v) => v && v.nodes && v.entryNodeId);
assert.ok(arvore, "árvore da bradicardia não foi exportada");

const no = arvore.nodes.instab_dados;
assert.ok(no, "nó guiado instab_dados não existe");
assert.equal(no.type, "input");
assert.ok(typeof no.next === "object", "instab_dados deveria ter roteamento derivado");

const { possiveis, escolher } = no.next;
const INSTAVEL = "instab_conclusao_instavel";
const ESTAVEL = "instab_conclusao_estavel";

let ok = 0;
const falhas = [];

function checar(descricao, valores, esperado) {
  const obtido = escolher(valores);
  if (!possiveis.includes(obtido)) {
    falhas.push(`${descricao}: destino "${obtido}" fora dos possíveis (${possiveis.join(", ")})`);
    return;
  }
  if (obtido !== esperado) {
    falhas.push(`${descricao}: esperava ${esperado}, obteve ${obtido}`);
    return;
  }
  ok++;
}

// Base: tudo negativo e pressão normal.
const semNada = { pas: "120", mental: "nao", perfusao: "nao", dorToracica: "nao", congestao: "nao" };

checar("nenhum achado", semNada, ESTAVEL);

// Cada sinal, SOZINHO, precisa bastar.
for (const sinal of ["mental", "perfusao", "dorToracica", "congestao"]) {
  checar(`só ${sinal}`, { ...semNada, [sinal]: "sim" }, INSTAVEL);
}
checar("só hipotensão", { ...semNada, pas: "80" }, INSTAVEL);

// Bordas do limiar declarado no próprio nó de origem: PAS < 90.
checar("PAS 89 — abaixo do limiar", { ...semNada, pas: "89" }, INSTAVEL);
checar("PAS 90 — no limiar, não abaixo", { ...semNada, pas: "90" }, ESTAVEL);
checar("PAS 91 — acima", { ...semNada, pas: "91" }, ESTAVEL);

// Combinações não podem inverter o resultado.
checar("hipotensão + sinal", { ...semNada, pas: "70", mental: "sim" }, INSTAVEL);
checar("todos os sinais", {
  pas: "60", mental: "sim", perfusao: "sim", dorToracica: "sim", congestao: "sim",
}, INSTAVEL);

// Vírgula decimal: o app grava o que o usuário digita, e pt-BR usa vírgula.
checar("PAS com vírgula", { ...semNada, pas: "88,5" }, INSTAVEL);

// Campo não informado não pode inventar hipotensão.
checar("PAS ausente, sem sinais", { mental: "nao", perfusao: "nao", dorToracica: "nao", congestao: "nao" }, ESTAVEL);

// Os dois destinos declarados precisam existir na árvore.
for (const destino of possiveis) {
  if (!arvore.nodes[destino]) falhas.push(`destino declarado "${destino}" não existe na árvore`);
  else ok++;
}

console.log("\nFluxo guiado — bradicardia\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
} else {
  console.log(`✅ ${ok} verificações da derivação de instabilidade`);
}
console.log("");

fs.rmSync(tempDir, { recursive: true, force: true });
process.exit(falhas.length ? 1 : 0);
