/**
 * valida-causas-reversiveis.cjs — a lib e o dono não podem divergir
 *
 * PROMETE: que `lib/causas-reversiveis.ts` (consumida pelo card da AESP em
 *   Ritmos de Parada) tenha EXATAMENTE os mesmos nomes, na mesma ordem, do
 *   módulo dono; e que cada causa do dono tenha intervenção específica.
 * NÃO PROMETE: que os nomes ou as intervenções estejam clinicamente certos —
 *   a conferência é de SINCRONIA e de PRESENÇA, não de fonte.
 * UNIVERSO: os dois arquivos.
 *
 * ── POR QUE ESTA TRAVA EXISTE ───────────────────────────────────────────────
 *
 * A lib foi criada copiando os dez nomes À MÃO do módulo dono. Conferido por
 * execução: nasceu sincronizada. Mas copiar à mão é como o app acumulou boa
 * parte dos defeitos desta auditoria, e a garantia não é o estado de hoje — é
 * o que impede a 11ª causa de nascer só de um lado.
 *
 * Mesmo argumento que criou lib/atropina.ts ANTES do segundo sítio.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const DONO = "components/protocol-screen/acls-reversible-causes-screen.tsx";
const LIB = "lib/causas-reversiveis.ts";
const falhas = [];
let ok = 0;

const dono = fs.readFileSync(path.join(appDir, DONO), "utf8");
const lib = fs.readFileSync(path.join(appDir, LIB), "utf8");

const nomesDono = [...dono.matchAll(/^\s+name: "([^"]+)"/gm)].map((m) => m[1]);
const nomesLib = [...lib.matchAll(/^\s+"([^"]+)",/gm)].map((m) => m[1]);

if (nomesDono.length !== 10) {
  falhas.push(`o dono tem ${nomesDono.length} causas — os 5 Hs e 5 Ts são DEZ. Ou a leitura cegou, ou uma causa sumiu.`);
} else ok++;

if (JSON.stringify(nomesDono) !== JSON.stringify(nomesLib)) {
  const soDono = nomesDono.filter((n) => !nomesLib.includes(n));
  const soLib = nomesLib.filter((n) => !nomesDono.includes(n));
  falhas.push(
    `${LIB} divergiu do dono.\n` +
    (soDono.length ? `    só no dono: ${soDono.join(", ")}\n` : "") +
    (soLib.length ? `    só na lib:  ${soLib.join(", ")}\n` : "") +
    (!soDono.length && !soLib.length ? `    mesmos nomes, ORDEM diferente — e a ordem é 5 Hs depois 5 Ts.\n` : "") +
    `    A lib é consumida pelo card da AESP em Ritmos de Parada: divergir ali é ensinar uma lista\n` +
    `    incompleta no meio de uma parada, que foi o defeito que ela existe para corrigir.`
  );
} else ok++;

// Cada causa precisa de intervenção ESPECÍFICA — o achado do Pré-requisito B.
for (const nome of nomesDono) {
  const i = dono.indexOf(`name: "${nome}"`);
  const bloco = dono.slice(i, i + 1200);
  const m = bloco.match(/intervention: "([^"]+)"/);
  if (!m) {
    falhas.push(`${nome}: sem campo \`intervention\` — causa sem conduta associada.`);
    continue;
  }
  // Genérica = só diz "tratar a causa" sem dizer COMO.
  if (/^(tratar|corrigir|identificar)[^,]{0,25}$/i.test(m[1].trim())) {
    falhas.push(`${nome}: intervenção genérica («${m[1]}») — sem o que FAZER, a causa vira lembrete.`);
  } else ok++;
}

console.log(`\nCausas reversíveis — a lib e o dono, sincronizados\n`);
console.log(`   ${nomesDono.length} causas no dono · ${nomesLib.length} na lib\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s) · ${ok} conferência(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — dez causas, mesma ordem nos dois, cada uma com conduta própria\n`);
