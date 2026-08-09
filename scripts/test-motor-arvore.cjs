/**
 * Trava do MOTOR de árvores: campo obrigatório é conferido no motor, não na tela.
 *
 * ── O DEFEITO ────────────────────────────────────────────────────────────────
 *
 * `canContinue` era calculado em `mapInputNode` e chegava apenas até
 * `disabled={!step.canContinue}` no botão de avançar. Validação que mora na
 * apresentação vale para quem passa pelo botão — e mais ninguém: comando de voz,
 * link direto, teste e código futuro entram por baixo dela.
 *
 * O motor então avançava com campo em branco, e o roteamento derivado LÊ esses
 * campos. Ausência de resposta não é resposta negativa: a pressão sistólica
 * vazia era lida como "não hipotenso" e o app concluía ESTÁVEL sem ninguém ter
 * medido a pressão.
 *
 * ── O QUE ESTE SCRIPT PROVA ──────────────────────────────────────────────────
 *
 * 1. avançar sem preencher obrigatório LANÇA;
 * 2. a mensagem nomeia o campo, para o erro ser diagnosticável;
 * 3. campo `optional` NÃO bloqueia — é o desenho dos critérios compostos, onde
 *    a ausência do par significa "não confirmado";
 * 4. preenchido o obrigatório, avança normalmente;
 * 5. nó de ação (sem campos) segue avançando sem exigir nada.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "motor-arvore-"));
execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
  "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
  path.join(appDir, "acls-bradycardia-tree.ts"),
  // O motor precisa ser compilado EXPLICITAMENTE: a árvore importa apenas o
  // TIPO de core/decision-tree, e tipo não gera JavaScript.
  path.join(appDir, "core", "decision-tree", "engine.ts")],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] });

const mod = require(path.join(tempDir, "acls-bradycardia-tree.js"));
const { DecisionTreeEngine } = require(path.join(tempDir, "core/decision-tree/engine.js"));
const arvore = Object.values(mod).find((v) => v && v.nodes && v.entryNodeId);

const falhas = [];
let ok = 0;
const checa = (d, c) => (c ? ok++ : falhas.push(d));

/** Leva o motor até o passo guiado de instabilidade. */
function ateOPassoGuiado() {
  const e = new DecisionTreeEngine(arvore);
  e.advance();                 // entry (ação)
  e.choose("guiado");          // assess_stability → instab_dados
  return e;
}

// 1 · sem nada preenchido, lança
{
  const e = ateOPassoGuiado();
  let lancou = null;
  try { e.advance(); } catch (err) { lancou = err.message; }
  checa("avançar sem preencher deveria LANÇAR", lancou !== null);
  // 2 · a mensagem nomeia o campo
  checa(`a mensagem deveria nomear o campo ausente — veio: ${lancou}`,
    lancou && /"pas"/.test(lancou) && /obrigatório/i.test(lancou));
}

// 3 · o par de confirmação (optional) NÃO bloqueia
{
  const e = ateOPassoGuiado();
  for (const [campo, valor] of [["pas", "120"], ["mental", "nao"], ["dorToracica", "nao"],
                                ["perfusao", "nao"], ["dispneia", "nao"]]) e.setValue(campo, valor);
  // perfusaoObjetiva e congestao ficam de fora de propósito: são `optional`
  let erro = null;
  try { e.advance(); } catch (err) { erro = err.message; }
  checa(`campo optional não deveria bloquear — lançou: ${erro}`, erro === null);
}

// 4 · obrigatório preenchido avança, e para o destino certo
{
  const e = ateOPassoGuiado();
  for (const [c, v] of [["pas", "80"], ["mental", "nao"], ["dorToracica", "nao"],
                        ["perfusao", "nao"], ["dispneia", "nao"]]) e.setValue(c, v);
  // O advance é envolvido de propósito: sem isto, um erro inesperado MATA o
  // script e o contador de falhas fica em zero — foi o que aconteceu ao mutar
  // `!f.optional` para `true`. A mutação era detectada e o relatório dizia
  // "0 falhas", porque o processo nem chegava a imprimir.
  let destino = null, erro = null;
  try { destino = e.advance(); } catch (err) { erro = err.message; }
  checa(`avançar com obrigatórios preenchidos não deveria lançar — lançou: ${erro}`, erro === null);
  checa(`hipotensão deveria levar à conclusão instável — foi para "${destino && destino.id}"`,
    destino !== null && destino.id === "instab_conclusao_instavel");
}

// 5 · nó de ação não exige campo nenhum
{
  const e = new DecisionTreeEngine(arvore);
  let erro = null;
  try { e.advance(); } catch (err) { erro = err.message; }
  checa(`nó de ação não deveria exigir campos — lançou: ${erro}`, erro === null);
}

// 6 · string vazia conta como ausente (não só `undefined`)
{
  const e = ateOPassoGuiado();
  for (const [c, v] of [["pas", ""], ["mental", "nao"], ["dorToracica", "nao"],
                        ["perfusao", "nao"], ["dispneia", "nao"]]) e.setValue(c, v);
  let lancou = null;
  try { e.advance(); } catch (err) { lancou = err.message; }
  checa("string vazia deveria contar como não preenchido", lancou !== null);
}

console.log("\nMotor de árvores — validação de campo obrigatório\n");
if (falhas.length) for (const f of falhas) console.log(`❌ ${f}`);
else console.log(`✅ ${ok} verificações — obrigatório barra no MOTOR, optional continua livre`);
console.log("");
fs.rmSync(tempDir, { recursive: true, force: true });
process.exit(falhas.length ? 1 : 0);
