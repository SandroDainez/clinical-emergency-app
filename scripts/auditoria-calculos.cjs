#!/usr/bin/env node
/**
 * CAMADA 4 — Auditoria de doses, diluições e cálculos.
 *
 * Dirige TODAS as calculadoras do app com valores-limite e observa o que sai. Não
 * confere se a fórmula é a certa segundo a diretriz — confere se ela se comporta:
 * um `NaN`, um `Infinity` ou um número negativo chegando à tela como dose é risco
 * clínico independente de qual fórmula deveria estar ali.
 *
 * Casos exercitados, seguindo a lista do plano:
 *
 *  - campo vazio, ausente e só espaço;
 *  - zero e negativo;
 *  - valores extremos (peso de 1 kg e de 400 kg, altura de 50 cm e 250 cm);
 *  - vírgula e ponto decimal (o app é pt-BR: "72,5" precisa valer);
 *  - texto onde se espera número;
 *  - casas decimais longas;
 *  - todos os presets declarados pela própria ferramenta.
 *
 * Para escores: verifica se `interpret` cobre a faixa inteira declarada em
 * `totalRange`, extremos inclusive — faixa com buraco significa paciente sem
 * classificação.
 *
 * Uso: node scripts/auditoria-calculos.cjs
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "auditoria-calc-"));

execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tempDir, path.join(appDir, "clinical-calculators-engine.ts"),
  ],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
);

const mod = require(path.join(tempDir, "clinical-calculators-engine.js"));
const ferramentas = mod.CALC_TOOLS ?? [];

const achados = [];
function registrar(ferramenta, gravidade, tipo, detalhe, entrada) {
  achados.push({ ferramenta, gravidade, tipo, detalhe, entrada });
}

/** Valores hostis por tipo de campo. */
function valoresDeTeste(input) {
  if (input.kind === "toggle" || input.kind === "select") {
    const opcoes = (input.options ?? []).map((o) => o.value);
    return [...opcoes, "", "valor_inexistente"];
  }
  return [
    "", " ", "0", "-1", "-0,5", "abc", "1e400",
    "0,0001", "72,5", "72.5", "1", "400", "9999999",
  ];
}

/** Percorre o resultado atrás de número inválido escrito em texto. */
function numerosSuspeitos(resultado) {
  const suspeitos = [];
  const visitar = (valor, caminho) => {
    if (valor == null) return;
    if (typeof valor === "number") {
      if (!Number.isFinite(valor)) suspeitos.push({ caminho, valor: String(valor) });
      return;
    }
    if (typeof valor === "string") {
      if (/\bNaN\b|\bInfinity\b|undefined|null/i.test(valor)) {
        suspeitos.push({ caminho, valor: valor.slice(0, 80) });
      }
      // Dose negativa escrita em texto: "-3,2 mL", "-15 mg".
      const neg = valor.match(/(^|\s)-\s*\d+(?:[.,]\d+)?\s*(mg|mcg|µg|g|mL|UI|mEq|mmol|kg|J)\b/i);
      if (neg) suspeitos.push({ caminho, valor: valor.slice(0, 80), negativo: true });
      return;
    }
    if (Array.isArray(valor)) {
      valor.forEach((v, i) => visitar(v, `${caminho}[${i}]`));
      return;
    }
    if (typeof valor === "object") {
      for (const [k, v] of Object.entries(valor)) visitar(v, caminho ? `${caminho}.${k}` : k);
    }
  };
  visitar(resultado, "");
  return suspeitos;
}

const formulas = ferramentas.filter((f) => f.kind === "formula");
const escores = ferramentas.filter((f) => f.kind === "score");

// ── Fórmulas ────────────────────────────────────────────────────────────────
for (const f of formulas) {
  const inputs = f.inputs ?? [];

  // 1) Nenhum campo preenchido: tem de devolver null, nunca resultado.
  try {
    const r = f.compute({});
    if (r !== null && r !== undefined) {
      const susp = numerosSuspeitos(r);
      registrar(
        f.id, susp.length ? "erro" : "aviso", "resultado-sem-entrada",
        `devolveu resultado com nenhum campo preenchido${susp.length ? ` e com valor inválido (${susp[0].valor})` : ""}`,
        "{}"
      );
    }
  } catch (e) {
    registrar(f.id, "erro", "excecao", `lançou exceção com entrada vazia: ${String(e.message).slice(0, 90)}`, "{}");
  }

  // 2) Um campo hostil por vez, com os demais em valor plausível.
  const plausivel = {};
  for (const i of inputs) {
    if (i.kind === "toggle" || i.kind === "select") plausivel[i.id] = (i.options ?? [])[0]?.value ?? "";
    else if (/altura|height/i.test(i.id)) plausivel[i.id] = "170";
    else if (/peso|weight/i.test(i.id)) plausivel[i.id] = "70";
    else if (/idade|age/i.test(i.id)) plausivel[i.id] = "60";
    else plausivel[i.id] = "1";
  }

  for (const alvo of inputs) {
    for (const valor of valoresDeTeste(alvo)) {
      const entrada = { ...plausivel, [alvo.id]: valor };
      let r;
      try {
        r = f.compute(entrada);
      } catch (e) {
        registrar(
          f.id, "erro", "excecao",
          `campo "${alvo.id}" = ${JSON.stringify(valor)} lançou: ${String(e.message).slice(0, 80)}`,
          JSON.stringify(entrada)
        );
        continue;
      }
      if (r == null) continue;

      for (const s of numerosSuspeitos(r)) {
        registrar(
          f.id, "erro", s.negativo ? "valor-negativo" : "valor-invalido",
          `campo "${alvo.id}" = ${JSON.stringify(valor)} produziu ${s.caminho} = "${s.valor}"`,
          JSON.stringify(entrada)
        );
      }
    }
  }

  // 3) Vírgula e ponto têm de dar o MESMO resultado — o app é pt-BR e o teclado
  //    do celular manda vírgula. Divergir aqui é erro de dose silencioso.
  const numericos = inputs.filter((i) => i.kind === "number" || i.kind === undefined);
  for (const alvo of numericos) {
    const comVirgula = { ...plausivel, [alvo.id]: "72,5" };
    const comPonto = { ...plausivel, [alvo.id]: "72.5" };
    try {
      const a = JSON.stringify(f.compute(comVirgula));
      const b = JSON.stringify(f.compute(comPonto));
      if (a !== b) {
        registrar(
          f.id, "erro", "virgula-diferente-de-ponto",
          `campo "${alvo.id}": "72,5" e "72.5" produzem resultados diferentes`,
          JSON.stringify(comVirgula)
        );
      }
    } catch {
      /* exceção já registrada acima */
    }
  }
}

// ── Escores ─────────────────────────────────────────────────────────────────
for (const s of escores) {
  const vars = s.vars ?? [];
  const minimo = vars.reduce((acc, v) => acc + Math.min(...(v.options ?? []).map((o) => o.points ?? 0)), 0);
  const maximo = vars.reduce((acc, v) => acc + Math.max(...(v.options ?? []).map((o) => o.points ?? 0)), 0);

  for (let total = minimo; total <= maximo; total += 1) {
    let interp;
    try {
      interp = s.interpret(total);
    } catch (e) {
      registrar(s.id, "erro", "escore-excecao", `total ${total} lançou: ${String(e.message).slice(0, 80)}`, String(total));
      continue;
    }
    if (!interp || !String(interp.label ?? interp.title ?? "").trim()) {
      registrar(s.id, "erro", "escore-sem-classificacao", `total ${total} não recebe classificação`, String(total));
    }
  }

  // A faixa declarada bate com a faixa possível?
  // Normaliza antes de comparar: o app escreve faixa em pt-BR ("0–12,5") e usa
  // sinal Unicode ("−5 a +4"). Ler com /-?\d+/ quebrava a vírgula decimal em dois
  // números e ignorava o menos tipográfico — eram falsos positivos meus, não
  // divergência do app.
  // Cuidado com os dois papéis do traço: "–" entre números é INTERVALO ("0–12,5")
  // e "−" colado a um número é SINAL ("−5 a +4"). Trocar os dois por "-" fazia
  // "0–12,5" virar "-12.5" — eu mesmo introduzi esse erro ao consertar o anterior.
  const declarada = String(s.totalRange ?? "")
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1 a $2")
    .replace(/−/g, "-")
    .replace(/(\d),(\d)/g, "$1.$2");
  const nums = declarada.match(/-?\d+(?:\.\d+)?/g);
  if (nums && nums.length >= 2) {
    const dMin = Number(nums[0]);
    const dMax = Number(nums[nums.length - 1]);
    if (dMin !== minimo || dMax !== maximo) {
      registrar(
        s.id, "aviso", "faixa-declarada-divergente",
        `declara "${declarada}" mas as opções somam de ${minimo} a ${maximo}`,
        declarada
      );
    }
  }
}

// ── Relatório ───────────────────────────────────────────────────────────────
const saidaDir = path.join(appDir, "auditoria");
fs.mkdirSync(saidaDir, { recursive: true });

const erros = achados.filter((a) => a.gravidade === "erro");
const avisos = achados.filter((a) => a.gravidade === "aviso");
const porTipo = new Map();
for (const a of achados) {
  if (!porTipo.has(a.tipo)) porTipo.set(a.tipo, []);
  porTipo.get(a.tipo).push(a);
}

const L = [];
L.push("# Camada 4 — Auditoria de doses, diluições e cálculos");
L.push("");
L.push("> Gerado por `node scripts/auditoria-calculos.cjs`. Nenhum código alterado.");
L.push("> Verifica COMPORTAMENTO das fórmulas com valores-limite, não se a fórmula é a");
L.push("> recomendada pela diretriz — isso é a Camada 2.");
L.push("");
L.push(`- Fórmulas exercitadas: **${formulas.length}**`);
L.push(`- Escores exercitados: **${escores.length}**`);
L.push(`- Erros: **${erros.length}** · Avisos: **${avisos.length}**`);
L.push("");
if (achados.length) {
  L.push("## Achados por tipo");
  L.push("");
  L.push("| tipo | gravidade | ocorrências | ferramentas |");
  L.push("|---|---|---:|---:|");
  for (const [tipo, itens] of [...porTipo.entries()].sort((a, b) => b[1].length - a[1].length)) {
    L.push(`| ${tipo} | ${itens[0].gravidade} | ${itens.length} | ${new Set(itens.map((i) => i.ferramenta)).size} |`);
  }
  L.push("");
  for (const [tipo, itens] of [...porTipo.entries()].sort((a, b) => b[1].length - a[1].length)) {
    L.push(`### ${tipo} (${itens.length})`);
    L.push("");
    L.push("| ferramenta | detalhe |");
    L.push("|---|---|");
    for (const a of itens.slice(0, 50)) L.push(`| \`${a.ferramenta}\` | ${a.detalhe} |`);
    if (itens.length > 50) L.push(`| … | mais ${itens.length - 50} |`);
    L.push("");
  }
} else {
  L.push("Nenhum achado.");
}

fs.writeFileSync(path.join(saidaDir, "CAMADA-4-CALCULOS.md"), L.join("\n") + "\n");
fs.writeFileSync(path.join(saidaDir, "camada-4-calculos.json"), JSON.stringify({ achados }, null, 1));

console.log(`\nFórmulas: ${formulas.length} · Escores: ${escores.length}`);
console.log(`Erros: ${erros.length} · Avisos: ${avisos.length}`);
for (const [tipo, itens] of [...porTipo.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${tipo}: ${itens.length}`);
}
console.log(`\nSaída em auditoria/CAMADA-4-CALCULOS.md`);
