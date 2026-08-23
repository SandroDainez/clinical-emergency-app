#!/usr/bin/env node
/**
 * MEDIÇÃO — não é trava. Não reprova, não corrige, sem código de saída.
 *
 * ⚠️ A REGRA DO APP (autor, 2026-08-23), e ela não é de magnésio:
 *
 *   **O campo identifica obrigatoriamente `mg/dL`, `mEq/L` ou `mmol/L`.
 *   Armazenar uma unidade canônica e converter de forma programática e
 *   auditável. Não permitir que um valor seja interpretado sem unidade.**
 *
 * O magnésio é só o pior caso — três unidades em circulação, 1 mmol = 2 mEq =
 * 2,43 mg/dL. Mas nós já tropeçamos nisso **duas vezes**, e nenhuma delas foi no
 * magnésio: o **1,9 mmol/L virando 7** (D-90) e o **3,5 virando 14** (D-91).
 *
 * ⚠️ ENTRADA E CORTE TÊM QUE FALAR A MESMA LÍNGUA, e a língua tem que estar
 * escrita nos dois. O R-90 pôs o CORTE na unidade da fonte; falta a ENTRADA.
 *
 * ── O QUE ELE CONTA ─────────────────────────────────────────────────────────
 *
 * Campos de entrada numérica das calculadoras e das telas de protocolo, e se
 * cada um declara `unit`/unidade. ⚠️ Nem todo número clínico TEM unidade (peso
 * em kg tem; um escore não tem; uma contagem não tem) — por isso a lista sai
 * separada em COM, SEM e "sem unidade por natureza", e a última é julgamento
 * humano, não veredito do regex.
 */
const fs = require("fs"), path = require("path");
const RAIZ = path.resolve(__dirname, "..");

/** Sufixos que indicam grandeza SEM unidade por natureza. */
const SEM_UNIDADE_POR_NATUREZA = /\b(escore|score|pontos|contagem|idade|anos|n[ºo°]|quantidade|vezes|gcs|rass|nihss|sexo|sim|n[ãa]o)\b/i;

function arquivos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", ".expo", "scripts", "e2e", "auditoria"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) arquivos(p, acc);
    else if (/\.tsx?$/.test(e.name) && !/\.d\.ts$/.test(e.name)) acc.push(p);
  }
  return acc;
}

const comUnidade = [], semUnidade = [], porNatureza = [];
const TODOS = arquivos(RAIZ);
for (const arq of TODOS) {
  const txt = fs.readFileSync(arq, "utf8");
  // Campos declarados como entrada numérica: { id: "x", label: "…", kind: "number" … }
  for (const m of txt.matchAll(/\{[^{}]*kind:\s*"number"[^{}]*\}/g)) {
    const bloco = m[0];
    // ⚠️ A DECLARAÇÃO DE TIPO NÃO É UM CAMPO. O bloco
    // `{ id: string; label: string; unit?: string; kind: "number" … }` casava com
    // o regex e saía na lista como "campo sem unidade" — o instrumento acusando
    // a própria definição de campo.
    const id = (bloco.match(/id:\s*"([^"]+)"/) ?? [])[1];
    if (!id) continue;
    const label = (bloco.match(/label:\s*"([^"]+)"/) ?? [])[1] ?? "";
    const unidade = (bloco.match(/unit:\s*"([^"]+)"/) ?? [])[1] ?? null;
    const item = { arq: path.relative(RAIZ, arq), id, label, unidade };
    if (unidade) comUnidade.push(item);
    else if (SEM_UNIDADE_POR_NATUREZA.test(label) || SEM_UNIDADE_POR_NATUREZA.test(id)) porNatureza.push(item);
    else semUnidade.push(item);
  }
}

// ── SEGUNDA PASSAGEM: a unidade escondida no RÓTULO EM PROSA
//
// ⚠️ A primeira versão viu só 42 campos, todos das calculadoras — e concluiu "3
// sem unidade", número tranquilizador e incompleto. As telas de protocolo
// declaram entrada por `input("Peso (kg)", …)`: a unidade está lá, mas **dentro
// do texto do rótulo**, que é exatamente o que o autor recusou — *"a unidade é
// DO CAMPO, não do rótulo em prosa"*.
//
// Rótulo em prosa não é campo: ninguém consegue converter por ele, nenhuma trava
// consegue lê-lo, e traduzir a tela pode mudá-lo sem que nada perceba.
const noRotulo = [];
const UNIDADES = /\((mg\/dL|mEq\/L|mmol\/L|g\/dL|mL|kg|h|mcg\/kg\/min|UI|%|mmHg)\)/;
for (const arq of TODOS) {
  const txt = fs.readFileSync(arq, "utf8");
  for (const m of txt.matchAll(/input\(\s*"([^"]+)"/g)) {
    const u = m[1].match(UNIDADES);
    if (u) noRotulo.push({ arq: path.relative(RAIZ, arq), label: m[1], unidade: u[1] });
  }
}

const total = comUnidade.length + semUnidade.length + porNatureza.length;
console.log(`\nUNIVERSO (R-101): ${TODOS.length} arquivos varridos · ${total} campo(s) de entrada numérica encontrados`);
console.log(`  ⚠️ Só campos declarados com \`kind: "number"\` entram. Entrada montada de outro jeito não é vista — a contagem é PISO.\n`);
console.log(`COM unidade ${comUnidade.length} · ⚠️ SEM unidade ${semUnidade.length} · sem unidade POR NATUREZA ${porNatureza.length}\n`);

console.log(`════ ⚠️ SEM UNIDADE DECLARADA (${semUnidade.length}) ════`);
for (const i of semUnidade) console.log(`   ${i.arq} · ${i.id.padEnd(20)} « ${i.label} »`);
console.log(`\n════ sem unidade POR NATUREZA — julgamento humano, não veredito (${porNatureza.length}) ════`);
for (const i of porNatureza) console.log(`   ${i.arq} · ${i.id.padEnd(20)} « ${i.label} »`);
console.log(`\n════ ⚠️ UNIDADE SÓ NO RÓTULO EM PROSA (${noRotulo.length}) ════`);
console.log(`   A unidade existe, mas dentro do TEXTO — não é campo. Ninguém converte por ela,`);
console.log(`   nenhuma trava a lê, e traduzir a tela pode mudá-la sem que nada perceba.`);
for (const i of noRotulo) console.log(`   ${i.arq} · ${String(i.unidade).padEnd(12)} « ${i.label} »`);

console.log(`\nTOTAL A RESOLVER: ${semUnidade.length} sem unidade nenhuma + ${noRotulo.length} com a unidade só na prosa = ${semUnidade.length + noRotulo.length}`);
console.log(`\n⚠️ MEDIÇÃO: sem código de saída. Nada foi corrigido.\n`);
