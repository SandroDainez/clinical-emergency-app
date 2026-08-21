#!/usr/bin/env node
/**
 * A FORÇA DA AFIRMAÇÃO — toda conduta diz que TIPO de coisa está afirmando.
 *
 * PROMETE: que todo nó de CONDUTA das árvores auditadas declare `procedencia`
 *   com `forca`, e que cada força carregue o que ela obriga — classe/grau na
 *   recomendação formal, tipo de documento na prática aceita, lacuna de
 *   evidência no mecanismo fisiológico. Nó sem procedência só passa se estiver
 *   na lista de PENDÊNCIAS DECLARADAS, com motivo.
 * NÃO PROMETE: que a força esteja CERTA. Nenhum script julga se uma conduta é
 *   recomendação formal ou plausibilidade — isso é leitura de fonte, e é do
 *   médico. A trava garante que alguém DECLAROU, e que o que se declara aparece
 *   na tela.
 * UNIVERSO: as árvores de ARVORES, compiladas, com piso no retrato.
 *
 * ── ⚠️ POR QUE A PENDÊNCIA É DECLARADA, E NÃO SILENCIOSA ───────────────────
 *
 * A ordem do autor foi explícita: "não invente a força de nenhuma conduta; onde
 * não estiver claro, marque como pendência e PARE — preencher por suposição é o
 * mesmo defeito com nome novo". Uma trava que aceitasse nó sem `procedencia` em
 * silêncio deixaria a maior parte do módulo sem classificação e sem ninguém
 * saber. Aqui, o que falta tem nome, motivo e sai no relatório.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { conferirUniverso } = require("./lib/universo.cjs");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "forca-"));

const ARVORES = ["ira-decision-tree.ts"];
const PENDENCIAS = path.join(app, "auditoria", "forca-pendente.json");

// ⚠️ ARVORES vazio não pode virar "nada a conferir": sem árvore, o `tsc` nem é
// chamado e o processo morre feio. Universo declarado, e falha limpa.
if (!ARVORES.length) {
  console.log("\n❌ nenhuma árvore declarada em ARVORES — isto é \"não consegui olhar\", não \"nenhuma conduta sem força\".\n");
  process.exit(1);
}

execFileSync(
  "npx",
  ["tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule", "--esModuleInterop",
   "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
   ...ARVORES.map((f) => path.join(app, f))],
  { cwd: app, stdio: ["ignore", "ignore", "inherit"] }
);

if (!fs.existsSync(PENDENCIAS)) {
  console.log(`\n❌ ${path.relative(app, PENDENCIAS)} não existe — sem a lista, "sem procedência" não tem como ser distinguido de "esquecido".\n`);
  process.exit(1);
}
const pendentes = JSON.parse(fs.readFileSync(PENDENCIAS, "utf8"));

const OBRIGA = {
  recomendacao_formal: { campo: "classeOuGrau", porque: "a classe/grau LITERAL da fonte" },
  pratica_aceita: { campo: "tipoDeDocumento", porque: "o tipo do documento (consenso, painel, revisão, bula)" },
  mecanismo_fisiologico: { campo: "lacunaDeEvidencia", porque: "a lacuna de evidência, escrita" },
  // ⚠️ DEFINIÇÃO NÃO SE GRADUA — exige VERSÃO, nunca classe. Uma diretriz não
  // recomenda que o estágio 3 seja o estágio 3: ela estabelece. O risco dela não
  // é evidência fraca, é versão desatualizada.
  definicao: { campo: "versao", porque: "a VERSÃO adotada (definição não tem classe)" },
};

/** Naturezas que NÃO fazem afirmação clínica e por isso não declaram força. */
const SEM_FORCA = {
  transicao: "roteia para outro módulo — a força é a das condutas de lá",
  organizacao_do_atendimento: "fluxo do atendimento, não recomendação graduada",
};

const falhas = [];
let condutas = 0;
let classificados = 0;
const porForca = { recomendacao_formal: 0, pratica_aceita: 0, mecanismo_fisiologico: 0, definicao: 0 };
const porNatureza = {};
const semDeclaracao = [];
let nosLidos = 0;

for (const arq of ARVORES) {
  const mod = require(path.join(tmp, arq.replace(/\.ts$/, ".js")));
  for (const arv of Object.values(mod)) {
    if (!arv || typeof arv !== "object" || !arv.nodes) continue;
    const nos = Object.values(arv.nodes);
    nosLidos += nos.length;

    for (const n of nos) {
      if (n.type !== "action") continue;

      // ⚠️ NEM TODO NÓ DE AÇÃO FAZ AFIRMAÇÃO CLÍNICA. Transição e organização do
      // atendimento saem da conta ANTES de virar pendência: exigir força delas
      // produziria declaração falsa.
      if (n.natureza && SEM_FORCA[n.natureza]) {
        porNatureza[n.natureza] = (porNatureza[n.natureza] ?? 0) + 1;
        if (n.procedencia) {
          falhas.push(
            `${arq} · ${n.id}: natureza "${n.natureza}" NÃO declara força — e este nó declarou. ` +
            `Ou é conduta, ou não é.`
          );
        }
        continue;
      }

      condutas += 1;
      const p = n.procedencia;

      if (!p) {
        const declarada = pendentes.pendentes?.[n.id];
        if (!declarada) {
          falhas.push(
            `${arq} · ${n.id}: conduta SEM \`procedencia\` e SEM pendência declarada.\n` +
            `        ⚠️ Ou declara a força (com o que ela obriga), ou entra em auditoria/forca-pendente.json com o motivo.`
          );
        } else {
          semDeclaracao.push({ no: n.id, motivo: declarada });
        }
        continue;
      }

      classificados += 1;
      if (!OBRIGA[p.forca]) {
        falhas.push(`${arq} · ${n.id}: força "${p.forca}" não existe.`);
        continue;
      }
      porForca[p.forca] += 1;

      const { campo, porque } = OBRIGA[p.forca];
      if (!p[campo]) {
        falhas.push(
          `${arq} · ${n.id}: força "${p.forca}" sem \`${campo}\` — falta ${porque}.`
        );
      }
      if (!p.fonte) falhas.push(`${arq} · ${n.id}: \`procedencia\` sem \`fonte\`.`);
    }
  }
}

fs.rmSync(tmp, { recursive: true, force: true });

console.log("\nA força da afirmação — que TIPO de coisa cada conduta diz\n");
const universoOk = conferirUniverso("valida-forca-da-afirmacao", "nos_da_arvore", nosLidos);
console.log(`   condutas: ${condutas} · classificadas: ${classificados} · pendentes declaradas: ${semDeclaracao.length}`);
console.log(
  `   fora da conta — transição ${porNatureza.transicao ?? 0} · organização do atendimento ${porNatureza.organizacao_do_atendimento ?? 0}`
);
console.log(
  `   recomendação formal ${porForca.recomendacao_formal} · prática aceita ${porForca.pratica_aceita} · mecanismo fisiológico ${porForca.mecanismo_fisiologico} · definição ${porForca.definicao}`
);

if (semDeclaracao.length) {
  console.log("\n   ℹ️  pendentes — declaradas, com motivo:");
  for (const s of semDeclaracao) console.log(`      ${s.no}: ${s.motivo}`);
}

if (!universoOk) {
  console.log("❌ universo insuficiente — as contagens acima NÃO significam cobertura.\n");
  process.exit(1);
}

if (falhas.length) {
  console.log(`\n❌ ${falhas.length} conduta(s) sem a declaração exigida:\n`);
  for (const f of falhas) console.log("   " + f);
  console.log("");
  process.exit(1);
}
console.log("\n✅ toda conduta declara a força, e cada força carrega o que obriga\n");
