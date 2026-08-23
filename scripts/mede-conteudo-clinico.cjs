#!/usr/bin/env node
/**
 * MEDIÇÃO — não é trava. Não reprova nada, não corrige nada.
 *
 * ⚠️ O QUE ELE MEDE, dito antes do número (R-101: todo total carrega o universo):
 *
 *   1. NOME DE FÁRMACO — ocorrência de um token do vocabulário. O vocabulário
 *      NÃO foi digitado por mim: sai do próprio repositório, colhendo a palavra
 *      que aparece imediatamente antes de uma dose. Fármaco que nunca aparece
 *      colado numa dose fica FORA do vocabulário — e por isso a contagem é PISO,
 *      nunca teto.
 *   2. DOSE LITERAL — número + unidade dentro de string.
 *   3. LIMIAR NUMÉRICO — comparação com número dentro de string.
 *   4. TEXTO CLÍNICO EM COMPONENTE — string longa dentro de app/ ou components/,
 *      isto é, conteúdo clínico morando na camada de tela em vez de no dado.
 *
 * ⚠️ ATRIBUIÇÃO: pelo NOME DO ARQUIVO contra os apelidos de
 * `lib/modulos-canonicos.ts` — que é onde o repositório já registra que
 * `sepsis-decision-tree` e `sepse-adulto` são a mesma coisa. Arquivo que não
 * casa com apelido nenhum sai em NÃO ATRIBUÍDO (infraestrutura, telas
 * compartilhadas, libs) — não é somado a módulo nenhum.
 */
const fs = require("fs"), path = require("path");
const RAIZ = path.resolve(__dirname, "..");

const UNIDADE = "(?:mg\\/kg\\/min|mcg\\/kg\\/min|µg\\/kg\\/min|mg\\/kg\\/h|mg\\/kg|mcg\\/kg|µg\\/kg|UI\\/kg|mL\\/kg|mg|mcg|µg|g|UI|mL|L|mEq|mmol)";
const DOSE = new RegExp(`\\b\\d+(?:[.,]\\d+)?\\s*${UNIDADE}\\b`, "gi");
const LIMIAR = /(?:[<>≤≥]\s*=?\s*\d|\bmenor que \d|\bmaior que \d|\babaixo de \d|\bacima de \d)/gi;
const NOME_ANTES_DE_DOSE = new RegExp(`([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ-]{4,})\\s*(?:\\(|\\s)\\s*\\d+(?:[.,]\\d+)?\\s*${UNIDADE}\\b`, "gi");
const PARADAS = new Set(["dose","doses","total","cada","até","ate","para","com","cerca","máximo","maximo","mínimo","minimo","cerca","cada","cerca","bolus","inicial","usual","máxima","maxima","repetir","cerca","aproximadamente","adicional","seguida","infusão","infusao","diluir","ampola","frasco","volume","peso","altura","idade","valor","limite","meta","alvo","média","media","soma","fração","fracao"]);

function arquivos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", ".expo", "scratchpad", "auditoria", "scripts", "e2e"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) arquivos(p, acc);
    else if (/\.tsx?$/.test(e.name) && !/\.d\.ts$/.test(e.name)) acc.push(p);
  }
  return acc;
}
const TODOS = arquivos(RAIZ);
const src = new Map(TODOS.map((f) => [f, fs.readFileSync(f, "utf8")]));

// ── strings: só o conteúdo literal, sem código em volta
function literais(texto) {
  const out = [];
  for (const m of texto.matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g))
    out.push(m[1] ?? m[2] ?? m[3] ?? "");
  return out;
}

// ── 1. vocabulário colhido DO REPOSITÓRIO
const VOCAB = new Set();
for (const texto of src.values())
  for (const s of literais(texto))
    for (const m of s.matchAll(NOME_ANTES_DE_DOSE)) {
      const nome = m[1].toLowerCase();
      if (!PARADAS.has(nome) && !/^\d/.test(nome)) VOCAB.add(nome);
    }

// ── ATRIBUIÇÃO PELO MAPA CANÔNICO, não pelo meu palpite de grafo.
//
// ⚠️ A primeira versão deste script atribuía arquivo a módulo caminhando o grafo
// de imports a partir da engine. Deu 22 dos 31 módulos com ZERO arquivo e
// "texto em componente" zerado no repositório inteiro — número que só podia
// estar errado. Era R-87 dentro do próprio instrumento: media o meu palpite de
// alcance, não os arquivos. `lib/modulos-canonicos.ts` já existe e já sabe que
// `sepsis-decision-tree` é `sepse-adulto`; a atribuição passou a sair dele.
const APELIDOS = [];
{
  const canon = src.get(path.join(RAIZ, "lib", "modulos-canonicos.ts"));
  for (const m of canon.matchAll(/id: "([^"]+)",[\s\S]{0,200}?apelidos: \[([^\]]*)\]/g)) {
    const id = m[1];
    const nomes = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]).concat(id);
    for (const n of nomes) APELIDOS.push({ id, apelido: n.replace(/_/g, "-") });
  }
  // O apelido mais LONGO ganha: "acls-post-rosc" antes de "acls".
  APELIDOS.sort((a, b) => b.apelido.length - a.apelido.length);
}
// ⚠️ BURACO DE UNIVERSO, dito e não tapado: `clinical-modules.ts` roteia 31
// módulos; o mapa canônico conhece 30. O que falta é `injuria-renal-aguda` — o
// módulo inteiro da auditoria de agosto. Todo instrumento que caminha pelo mapa
// canônico está CEGO para ele. Aqui ele entra por apelido provisório declarado
// NESTA LINHA, e não no mapa, para que o buraco continue visível até ser
// corrigido lá.
const FORA_DO_MAPA = { id: "injuria-renal-aguda", apelidos: ["ira", "injuria-renal-aguda", "renal"] };
for (const a of FORA_DO_MAPA.apelidos) APELIDOS.push({ id: FORA_DO_MAPA.id, apelido: a });
APELIDOS.sort((a, b) => b.apelido.length - a.apelido.length);
const ROTEADOS = [...src.get(path.join(RAIZ, "clinical-modules.ts")).matchAll(/^    id: "([^"]+)"/gm)].map((m) => m[1]);
const NO_MAPA = new Set(APELIDOS.map((a) => a.id));
const SEM_ENTRADA = ROTEADOS.filter((id) => !NO_MAPA.has(id));

const modulos = [...new Set(APELIDOS.map((a) => a.id))].map((id) => ({ id, arquivos: new Set() }));
const SEM_DONO = new Set();
for (const f of TODOS) {
  const nome = path.basename(f).replace(/\.tsx?$/, "").replace(/_/g, "-");
  const dir = path.relative(RAIZ, path.dirname(f)).replace(/_/g, "-");
  const achado = APELIDOS.find((a) => nome === a.apelido || nome.startsWith(a.apelido + "-") || nome.endsWith("-" + a.apelido) || dir.split("/").includes(a.apelido));
  if (achado) modulos.find((m) => m.id === achado.id).arquivos.add(f);
  else SEM_DONO.add(f);
}
const COMPARTILHADO = SEM_DONO;

function medir(arqs) {
  const c = { nomes: 0, doses: 0, limiares: 0, textoEmComponente: 0 };
  for (const f of arqs) {
    const naTela = /(^|\/)(app|components)\//.test(path.relative(RAIZ, f));
    for (const s of literais(src.get(f))) {
      for (const p of VOCAB) if (new RegExp(`\\b${p.replace(/[-]/g, "\\-")}`, "i").test(s)) { c.nomes++; break; }
      c.doses += (s.match(DOSE) ?? []).length;
      c.limiares += (s.match(LIMIAR) ?? []).length;
      if (naTela && s.trim().length >= 25 && /[a-zà-ÿ]{4}.*\s.*\s/i.test(s)) c.textoEmComponente++;
    }
  }
  return c;
}

const linhas = modulos.map((m) => ({ id: m.id, n: m.arquivos.size, ...medir([...m.arquivos]) }));
const comp = medir([...COMPARTILHADO]);
const N_COMP = COMPARTILHADO.size;

console.log(`\n⚠️ COBERTURA DO MAPA: ${ROTEADOS.length} módulos roteados em clinical-modules.ts · ${new Set(APELIDOS.map((a) => a.id)).size - 1} com entrada em lib/modulos-canonicos.ts · 1 entrando por apelido provisório declarado no script (injuria-renal-aguda) · ${SEM_ENTRADA.length} sem cobertura nenhuma`);
console.log(`\nUNIVERSO (R-101): ${modulos.length} módulos · ${TODOS.length} arquivos .ts/.tsx varridos · ${VOCAB.size} nomes no vocabulário colhido do repositório\n`);
console.log("módulo".padEnd(26) + "arq".padStart(4) + "nomes".padStart(7) + "doses".padStart(7) + "limiar".padStart(7) + "txt/tela".padStart(9));
console.log("-".repeat(60));
const soma = { nomes: 0, doses: 0, limiares: 0, textoEmComponente: 0, n: 0 };
for (const l of linhas.sort((a, b) => (b.doses + b.limiares + b.textoEmComponente) - (a.doses + a.limiares + a.textoEmComponente))) {
  console.log(l.id.padEnd(26) + String(l.n).padStart(4) + String(l.nomes).padStart(7) + String(l.doses).padStart(7) + String(l.limiares).padStart(7) + String(l.textoEmComponente).padStart(9));
  for (const k of Object.keys(soma)) soma[k] += l[k];
}
console.log("-".repeat(60));
const GRUPOS = { "lib/i18n (traduções)": /^lib\/i18n\//, "components/protocol-screen": /^components\/protocol-screen\//, "components (demais)": /^components\//, "lib (demais)": /^lib\//, "app (telas)": /^app\//, "outros": /./ };
console.log("-".repeat(60));
for (const [rotulo, re] of Object.entries(GRUPOS)) {
  const g = [...COMPARTILHADO].filter((f) => re.test(path.relative(RAIZ, f)));
  g.forEach((f) => COMPARTILHADO.delete(f));
  if (!g.length) continue;
  const c = medir(g);
  console.log(("  ↳ " + rotulo).padEnd(26) + String(g.length).padStart(4) + String(c.nomes).padStart(7) + String(c.doses).padStart(7) + String(c.limiares).padStart(7) + String(c.textoEmComponente).padStart(9));
}
console.log("NÃO ATRIBUÍDO (infra+telas)".padEnd(26) + String(N_COMP).padStart(4) + String(comp.nomes).padStart(7) + String(comp.doses).padStart(7) + String(comp.limiares).padStart(7) + String(comp.textoEmComponente).padStart(9));
console.log("TOTAL".padEnd(26) + String(soma.n + N_COMP).padStart(4) + String(soma.nomes + comp.nomes).padStart(7) + String(soma.doses + comp.doses).padStart(7) + String(soma.limiares + comp.limiares).padStart(7) + String(soma.textoEmComponente + comp.textoEmComponente).padStart(9));
console.log("\n⚠️ MEDIÇÃO, não reprovação: este script não tem saída de erro. Contagens são PISO (vocabulário colhido, não digitado).\n");
