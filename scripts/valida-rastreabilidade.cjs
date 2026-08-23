#!/usr/bin/env node
/**
 * PROMETE: que todo módulo com conteúdo clínico crítico tenha diretriz
 *   declarada em `guidelines_metadata.json`; que toda grafia de módulo usada
 *   por lá exista no mapa canônico; e — desde 2026-08-23 — que achado
 *   classificado como "erro" REPROVE o build. Antes ele saía com código 0 com
 *   1 erro no meio de 50 avisos, e o erro era o módulo renal fora do mapa.
 * NÃO PROMETE: que a diretriz declarada seja a certa, nem que esteja vigente.
 *   Ele confere que EXISTE declaração e que os nomes casam — a data de revisão
 *   continua saindo como aviso, não como reprovação.
 * UNIVERSO: `guidelines_metadata.json` × `lib/modulos-canonicos.ts`, com o
 *   número de módulos críticos impresso antes do resultado.
 *
 * CAMADA 9 — Rastreabilidade: cada módulo clínico sabe de qual diretriz veio?
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Por que isto vem ANTES da auditoria científica
 *
 * São 5.752 afirmações de risco crítico no app. Auditar cada uma exige saber
 * contra o que conferir. Hoje a resposta está espalhada: parte em
 * `protocols/guidelines_metadata.json`, parte escrita em comentário no topo do
 * arquivo, parte em lugar nenhum.
 *
 * Este script mede a cobertura e aponta os buracos. Ele não julga se a diretriz
 * citada é a certa nem se ela sustenta a afirmação — isso é a auditoria científica
 * em si, com as fontes abertas e olho médico.
 *
 * ## O que verifica
 *
 *  1. módulo com conteúdo clínico e NENHUMA diretriz declarada;
 *  2. diretriz cadastrada que não é usada por módulo nenhum;
 *  3. `modules_using` apontando para módulo que não existe;
 *  4. grafia de módulo que o mapa canônico ainda não conhece;
 *  5. diretriz vencida pela própria política de revisão do app.
 *
 * Uso: node scripts/valida-rastreabilidade.cjs
 */
const fs = require("node:fs");
// ⚠️ `lerCru` E NÃO `lerFonte`: aqui o COMENTÁRIO É O OBJETO. O que este
// instrumento colhe — de que módulo cada trava fala, que fonte cada bloco cita —
// está escrito nos cabeçalhos, não no código. Medir sem comentário apagou
// associações reais (anaphylaxis perdeu test:prazos; poisoning perdeu
// test:antidotos) sem mudar o código de saída, e por isso a comparação por exit
// code não viu. Ver scripts/lib/fonte.cjs.
const { lerCru } = require("./lib/fonte.cjs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rastreabilidade-"));

execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
    path.join(appDir, "lib", "modulos-canonicos.ts"),
  ],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
);
const canonico = require(path.join(tempDir, "modulos-canonicos.js"));

const metadados = JSON.parse(
  lerCru(path.join(appDir, "protocols", "guidelines_metadata.json"))
);
const inventarioPath = path.join(appDir, "auditoria", "inventario-clinico.json");
if (!fs.existsSync(inventarioPath)) {
  console.error("\n❌ Rode antes: npm run audit:inventario\n");
  process.exit(1);
}
const inventario = JSON.parse(fs.readFileSync(inventarioPath, "utf8"));

const achados = [];
const registrar = (gravidade, tipo, detalhe) => achados.push({ gravidade, tipo, detalhe });

// ── 1. Diretrizes por módulo canônico ───────────────────────────────────────
const diretrizesPorModulo = new Map();
const naoMapeadosNaMetadata = new Set();

for (const d of metadados.guidelines ?? []) {
  for (const usado of d.modules_using ?? []) {
    const id = canonico.idCanonicoDeModulo(usado);
    if (!id) {
      naoMapeadosNaMetadata.add(usado);
      continue;
    }
    if (!diretrizesPorModulo.has(id)) diretrizesPorModulo.set(id, []);
    diretrizesPorModulo.get(id).push(d);
  }
}

for (const grafia of naoMapeadosNaMetadata) {
  registrar(
    "erro", "modulo-desconhecido-na-metadata",
    `guidelines_metadata cita o módulo "${grafia}", que não existe no mapa canônico nem no registro de módulos`
  );
}

// ── 2. Módulos com conteúdo clínico crítico e sem diretriz ──────────────────
const criticosPorModulo = new Map();
const grafiasSemMapa = new Map();

for (const a of inventario.achados ?? []) {
  if (a.risco !== "crítico" && a.risco !== "alto") continue;
  if (a.camada === "traducao") continue; // tradução espelha a fonte; não é origem
  const id = canonico.idCanonicoDeModulo(a.modulo);
  if (!id) {
    if (!grafiasSemMapa.has(a.modulo)) grafiasSemMapa.set(a.modulo, 0);
    grafiasSemMapa.set(a.modulo, grafiasSemMapa.get(a.modulo) + 1);
    continue;
  }
  criticosPorModulo.set(id, (criticosPorModulo.get(id) ?? 0) + 1);
}

const semDiretriz = [];
for (const [id, quantos] of [...criticosPorModulo.entries()].sort((a, b) => b[1] - a[1])) {
  const diretrizes = diretrizesPorModulo.get(id) ?? [];
  if (!diretrizes.length) {
    semDiretriz.push({ id, quantos });
    registrar(
      "erro", "modulo-sem-diretriz",
      `"${canonico.rotuloDeModulo(id) ?? id}" tem ${quantos} afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json`
    );
  }
}

// ── 3. Grafias que o mapa ainda não conhece ─────────────────────────────────
for (const [grafia, quantos] of [...grafiasSemMapa.entries()].sort((a, b) => b[1] - a[1])) {
  // "(interface)", "(navegação)" e afins não são módulos — são camadas.
  if (/^\(/.test(grafia)) continue;
  // Também não são módulos clínicos: o próprio registro de diretrizes e a tela
  // comercial. Aparecem porque contêm texto com número e unidade.
  if (/^(guidelines-metadata|paywall)$/.test(grafia)) continue;
  registrar(
    "aviso", "grafia-sem-mapa",
    `"${grafia}" (${quantos} afirmações críticas) não está no mapa canônico — acrescentar em lib/modulos-canonicos.ts`
  );
}

// ── 3b. O que os arquivos JÁ declaram como fonte ────────────────────────────
//
// Vários módulos citam a diretriz em comentário de cabeçalho ou em campo `source`
// ("Algoritmo ACLS de Taquicardia (AHA 2025)", "Baseado em diretrizes de anafilaxia
// (WAO/EAACI e AHA)"). Essa declaração existe mas não está ligada a
// guidelines_metadata.json — então nenhuma verificação a enxerga.
//
// Extrair e PROPOR é diferente de decidir: o script mostra o que o código afirma,
// e quem assina o conteúdo confirma. Dizer de qual diretriz um protocolo veio é
// afirmação clínica, não dedução de texto.
const NOMES_DE_DIRETRIZ =
  /\b(AHA|ACLS|ILCOR|ESC|ERC|RCUK|SSC|Surviving Sepsis|WAO|EAACI|ADA|AAN|ASA|ATS|SBC|AMIB|SBA|ABRAMEDE|NICE|KDIGO|IDSA|ARDSNet|Cockcroft|CKD-EPI|Sepsis-3|SOFA)\b[^\n"']{0,40}/g;

const declaracoesPorModulo = new Map();
for (const a of inventario.achados ?? []) {
  const id = canonico.idCanonicoDeModulo(a.modulo);
  if (!id || diretrizesPorModulo.has(id)) continue;
  if (!declaracoesPorModulo.has(id)) declaracoesPorModulo.set(id, new Map());
  const arquivo = path.join(appDir, a.arquivo);
  if (!fs.existsSync(arquivo)) continue;
  const mapa = declaracoesPorModulo.get(id);
  if (mapa.size > 0) continue; // basta uma leitura por módulo
  const conteudo = fs.readFileSync(arquivo, "utf8").slice(0, 4000);
  for (const m of conteudo.matchAll(NOMES_DE_DIRETRIZ)) {
    const texto = m[0].replace(/\s+/g, " ").trim();
    mapa.set(texto, (mapa.get(texto) ?? 0) + 1);
  }
}

// ── 4. Diretriz cadastrada e não usada ──────────────────────────────────────
for (const d of metadados.guidelines ?? []) {
  if (!(d.modules_using ?? []).length) {
    registrar("aviso", "diretriz-sem-uso", `"${d.id}" está cadastrada e nenhum módulo a declara`);
  }
}

// ── 5. Diretriz vencida pela política do próprio app ────────────────────────
const meses = Number(metadados.review_frequency_months ?? 12);
const hoje = new Date(metadados.last_full_review ?? "1970-01-01");
for (const d of metadados.guidelines ?? []) {
  if (!d.last_reviewed) {
    registrar("aviso", "sem-data-de-revisao", `"${d.id}" não registra data de última revisão`);
    continue;
  }
  const revisada = new Date(d.last_reviewed);
  const mesesDesde = (hoje.getTime() - revisada.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (mesesDesde > meses) {
    registrar(
      "aviso", "revisao-vencida",
      `"${d.id}" revisada em ${d.last_reviewed} — ${mesesDesde.toFixed(0)} meses, acima da política de ${meses}`
    );
  }
}

// ── Relatório ───────────────────────────────────────────────────────────────
const saidaDir = path.join(appDir, "auditoria");
fs.mkdirSync(saidaDir, { recursive: true });

const erros = achados.filter((a) => a.gravidade === "erro");
const avisos = achados.filter((a) => a.gravidade === "aviso");

const L = [];
L.push("# Camada 9 — Rastreabilidade do conteúdo clínico");
L.push("");
L.push("> Gerado por `node scripts/valida-rastreabilidade.cjs`. Nenhum código alterado.");
L.push("> Mede se cada módulo declara a diretriz de onde veio. NÃO julga se a diretriz");
L.push("> é a certa nem se sustenta a afirmação — isso é a auditoria científica.");
L.push("");
L.push(`- Módulos com conteúdo crítico: **${criticosPorModulo.size}**`);
L.push(`- Com diretriz declarada: **${criticosPorModulo.size - semDiretriz.length}**`);
L.push(`- **Sem diretriz declarada: ${semDiretriz.length}**`);
L.push(`- Diretrizes cadastradas: **${(metadados.guidelines ?? []).length}**`);
L.push("");
L.push("## Cobertura por módulo");
L.push("");
L.push("| módulo | afirmações críticas | diretrizes declaradas |");
L.push("|---|---:|---|");
for (const [id, quantos] of [...criticosPorModulo.entries()].sort((a, b) => b[1] - a[1])) {
  const ds = diretrizesPorModulo.get(id) ?? [];
  const rotulo = canonico.rotuloDeModulo(id) ?? id;
  L.push(`| ${rotulo} | ${quantos} | ${ds.length ? ds.map((d) => `\`${d.id}\``).join(", ") : "**— nenhuma —**"} |`);
}
L.push("");

const porTipo = new Map();
for (const a of achados) {
  if (!porTipo.has(a.tipo)) porTipo.set(a.tipo, []);
  porTipo.get(a.tipo).push(a);
}
for (const [tipo, itens] of [...porTipo.entries()].sort((a, b) => b[1].length - a[1].length)) {
  L.push(`### ${tipo} — ${itens[0].gravidade} (${itens.length})`);
  L.push("");
  for (const a of itens) L.push(`- ${a.detalhe}`);
  L.push("");
}

if (semDiretriz.length) {
  L.push("## Fonte que o próprio código já declara — para você confirmar");
  L.push("");
  L.push("> Estes módulos citam diretriz em comentário ou campo de origem, mas a citação");
  L.push("> não está ligada a `guidelines_metadata.json`. A coluna é o que o CÓDIGO");
  L.push("> afirma — **não é a minha conclusão de qual diretriz governa o módulo.**");
  L.push("> Confirme e eu preencho `modules_using`.");
  L.push("");
  L.push("| módulo | o que o código declara |");
  L.push("|---|---|");
  for (const { id } of semDiretriz) {
    const decl = declaracoesPorModulo.get(id);
    const texto = decl && decl.size
      ? [...decl.keys()].slice(0, 4).map((t) => `\`${t}\``).join(" · ")
      : "— nada declarado —";
    L.push(`| ${canonico.rotuloDeModulo(id) ?? id} | ${texto} |`);
  }
  L.push("");
}

L.push("---");
L.push("");
L.push("### O que fazer com isto");
L.push("");
L.push("Cada módulo sem diretriz declarada é um bloqueio para a auditoria científica:");
L.push("não se sabe contra qual documento conferir suas afirmações. Preencher");
L.push("`modules_using` em `protocols/guidelines_metadata.json` é o passo que destrava");
L.push("a Camada 2 daquele módulo — e é decisão de quem assina o conteúdo, porque");
L.push("dizer de qual diretriz um protocolo veio é afirmação clínica.");

fs.writeFileSync(path.join(saidaDir, "CAMADA-9-RASTREABILIDADE.md"), L.join("\n") + "\n");

console.log("");
console.log(`Módulos com conteúdo crítico: ${criticosPorModulo.size}`);
console.log(`  com diretriz declarada: ${criticosPorModulo.size - semDiretriz.length}`);
console.log(`  SEM diretriz declarada: ${semDiretriz.length}`);
console.log(`Erros: ${erros.length} · Avisos: ${avisos.length}`);
for (const [tipo, itens] of [...porTipo.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${tipo}: ${itens.length}`);
}
console.log(`\nSaída em auditoria/CAMADA-9-RASTREABILIDADE.md`);

// ⚠️ SE UM ACHADO IMPORTA, ELE REPROVA. SE NÃO REPROVA, É DECORAÇÃO.
//
// Este instrumento classificava achado como "erro" e saía com código 0. Em
// 2026-08-23 isso custou caro e de forma medida: ele avisava havia semanas que o módulo renal não estava no mapa canônico,
// como o ÚNICO erro entre 50 avisos, e o aviso passou.
// Uma lista de 50 avisos onde mora 1 erro é a forma mais confiável de esconder
// o erro. Aviso continua aviso; erro reprova.
if (erros.length) {
  console.error(`\n❌ ${erros.length} achado(s) classificado(s) como ERRO por este instrumento.`);
}
process.exit(erros.length ? 1 : 0);
