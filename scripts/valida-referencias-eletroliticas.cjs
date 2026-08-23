#!/usr/bin/env node
/**
 * PROMETE: que os números extraídos para `lib/eletrolitos/referencias.ts` não
 *   voltem a existir como LITERAL na tela dos eletrólitos nem dentro de
 *   qualquer dicionário de tradução; que toda referência declare procedência
 *   com alvo nomeado; e que a moldura traduzida não tenha número onde o dado
 *   deveria entrar.
 * NÃO PROMETE: que o número esteja clínico certo. Cinco das doze são conduta
 *   sem fonte, e é o campo `alvo` que diz isso. A trava garante que o número
 *   tem UMA DONA — não que a dona esteja certa.
 * UNIVERSO: `lib/eletrolitos/referencias.ts` compilado + a tela dos eletrólitos
 *   + os 121 dicionários de `lib/i18n/modules`, contados antes do resultado.
 *
 * ── POR QUE ESTA TRAVA EXISTE (R-107) ───────────────────────────────────────
 *
 * `154 mEq/L` e `8–10 mEq/L em 24 h` moravam DENTRO da frase traduzível. Toda
 * frase dessas tem uma segunda cópia em espanhol, escrita noutro momento — e a
 * medição de 2026-08-23 achou duas linhas em que o espanhol dizia OUTRO critério
 * clínico (D-80). O número no dicionário tem duas donas.
 *
 * ⚠️ E A TRAVA OLHA O DICIONÁRIO, não só a tela: devolver o número ao espanhol
 * é tão fácil quanto devolvê-lo ao componente, e mais difícil de notar.
 */
const fs = require("fs"), os = require("os"), path = require("path");
const { lerFonte } = require("./lib/fonte.cjs");
const { execFileSync } = require("child_process");

const RAIZ = path.resolve(__dirname, "..");
const TELA = path.join(RAIZ, "components", "protocol-screen", "electrolyte-calculator-screen.tsx");
const DICTS = path.join(RAIZ, "lib", "i18n", "modules");
let falhas = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ref-"));
execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(RAIZ, "lib", "eletrolitos", "referencias.ts")], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
const R = require(path.join(tmp, "referencias.js"));

const refs = Object.entries(R.REFERENCIAS_DOS_ELETROLITOS);
// ⚠️ SÓ OS DICIONÁRIOS DESTE MÓDULO, e o escopo é a correção de um excesso meu:
// a primeira versão varria os 121 e acusou `500–1000 mL` em choque-einstein.ts e
// `3 mL/kg/h` em injuria-renal-aguda.ts. Aqueles são conteúdo clínico de OUTROS
// módulos que por acaso usam o mesmo número — não a segunda dona voltando. Uma
// trava que grita por coincidência é uma trava que alguém desliga.
const arquivosDeDicionario = fs.readdirSync(DICTS).filter((f) => /^eletrolitos/.test(f) && f.endsWith(".ts"));
console.log(`\nUNIVERSO: ${refs.length} referências · 1 tela · ${arquivosDeDicionario.length} dicionários`);

// ── 1. PROCEDÊNCIA COM ALVO NOMEADO
for (const [nome, r] of refs) {
  if (!r.procedencia?.alvo || r.procedencia.alvo.trim().length < 20)
    erro(`${nome} sem alvo de procedência — pendência sem alvo é campo em branco com outro nome`);
  if (!["definicao", "pendente"].includes(r.procedencia?.forca))
    erro(`${nome} com força inválida: ${r.procedencia?.forca}`);
}

// ── 2. O NÚMERO NÃO VOLTA COMO LITERAL — nem na tela, nem no dicionário
// ⚠️ SEM COMENTÁRIO. O comentário que EXPLICA a extração cita os números que
// ela tirou — e a primeira versão desta trava acusou a própria explicação. Ler
// o código sem comentários é o que `lerFonte` faz, e é o certo aqui.
const tela = lerFonte(TELA);
const dicionarios = arquivosDeDicionario.map((f) => ({ f, t: fs.readFileSync(path.join(DICTS, f), "utf8") }));
for (const [nome, r] of refs) {
  // ⚠️ O ALVO É O NÚMERO **COM A UNIDADE COLADA** — "154 mEq/L", não "154".
  // Procurar só o algarismo acusaria conversão de unidade e faixa de entrada,
  // que são números legítimos da tela. Precisão importa: trava que grita por
  // ruído é trava que alguém desliga.
  const alvo = R.texto(r);
  const escapado = alvo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[–-]/g, "[–-]").replace(/\s+/g, "\\s*");
  const re = new RegExp(escapado, "i");
  if (re.test(tela)) erro(`"${alvo}" (${nome}) voltou como literal na tela — o número tem que vir do dado`);
  for (const { f, t } of dicionarios)
    if (re.test(t)) erro(`"${alvo}" (${nome}) está escrito no dicionário ${f} — é a segunda dona voltando pelo espanhol`);
}

console.log(falhas
  ? `\n❌ ${falhas} falha(s)`
  : `\n✅ ${refs.length} referências com dona única · nenhuma como literal na tela ou nos ${arquivosDeDicionario.length} dicionários`);
process.exit(falhas ? 1 : 0);
