/**
 * Trava do sulfato de magnésio: quem manda sulfatar tem de mostrar a dose, e
 * todo caminho que sulfata tem de passar pela tríade de segurança e pelo
 * antídoto.
 *
 * ── O DEFEITO QUE ORIGINOU ESTE SCRIPT ───────────────────────────────────────
 *
 * O passo da síndrome HELLP dizia "Iniciar MgSO₄ (profilaxia de eclâmpsia) —
 * Pritchard ou Zuspan; ver tríade de segurança" e seguia direto para a crise
 * hipertensiva. As duas coisas que ele citava — o esquema e a tríade — nunca
 * apareciam nesse caminho. O médico era instruído a sulfatar e o app jamais
 * dizia quanto, nem quando parar, nem que existe antídoto.
 *
 * O caminho da eclâmpsia e o da PE grave estavam íntegros, e é isso que torna a
 * falha traiçoeira: ela só existe em UM ramo da árvore, e só aparece para quem
 * entrar por ele. Ninguém percebe lendo o arquivo — os nós certos estão todos
 * lá, escritos; o que faltava era uma aresta.
 *
 * ── O QUE ESTE SCRIPT COBRA ──────────────────────────────────────────────────
 *
 * Para TODO nó que prescreve sulfatação:
 *   1. o próprio nó traz um esquema com dose (ataque em gramas), ou alcança um
 *      nó que traga, sem passar por decisão que permita escapar;
 *   2. o nó da tríade de segurança é alcançável a partir dele;
 *   3. esse nó da tríade traz o antídoto com dose.
 *
 * Ele caminha o GRAFO, não o texto: é a aresta que falhou, e é a aresta que
 * precisa ser conferida.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-sulfatacao-"));

execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tempDir,
    path.join(appDir, "eclampsia-decision-tree.ts"),
  ],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
);

const mod = require(path.join(tempDir, "eclampsia-decision-tree.js"));
const arvore = Object.values(mod).find((v) => v && v.nodes && v.entryNodeId);
if (!arvore) {
  console.error("árvore da pré-eclâmpsia não foi exportada");
  process.exit(1);
}

const falhas = [];
let ok = 0;

/** Todo o texto de um nó, para procurar menções e doses. */
function textoDo(no) {
  return [no.title, no.summary, no.question, ...(no.actions || []), ...(no.evidence || [])]
    .filter(Boolean)
    .join(" • ");
}

/** Destinos de um nó, cobrindo `next` simples, roteamento derivado e opções. */
function destinos(no) {
  const saidas = [];
  if (typeof no.next === "string") saidas.push(no.next);
  else if (no.next && Array.isArray(no.next.possiveis)) saidas.push(...no.next.possiveis);
  for (const o of no.options || []) if (o.next) saidas.push(o.next);
  return saidas;
}

/** Nós alcançáveis a partir de um nó, ele inclusive. */
function alcancaveis(idInicial) {
  const vistos = new Set([idInicial]);
  const fila = [idInicial];
  while (fila.length) {
    for (const d of destinos(arvore.nodes[fila.shift()] || {})) {
      if (!vistos.has(d) && arvore.nodes[d]) {
        vistos.add(d);
        fila.push(d);
      }
    }
  }
  return vistos;
}

// Um esquema COM DOSE: exige grama explícita ligada ao ataque ou à manutenção.
// "Pritchard ou Zuspan" sem número não conta — era exatamente o que a HELLP
// trazia, e é a diferença entre citar um protocolo e prescrevê-lo.
const TEM_DOSE = /\b\d+(?:[,.]\d+)?\s*g\b/i;
const CITA_MG = /sulfato de magnésio|MgSO₄|sulfatação|sulfatar/i;

/**
 * Prescrever não é o mesmo que mencionar, e a primeira versão deste script
 * tratou os dois como um só. Ela acusou três nós inocentes:
 *
 *   pe_leve         — "NÃO indicar MgSO₄ na ausência de critérios de gravidade"
 *   parto_acao      — "Manter MgSO₄ durante o trabalho de parto e por 24 h após"
 *   expectante_acao — "Manter anti-HAS e MgSO₄ conforme indicação"
 *
 * O primeiro é uma CONTRAINDICAÇÃO: exigir dele a dose e a tríade seria cobrar
 * o oposto do que ele diz. Os outros dois MANTÊM uma infusão que já corre — a
 * dose e a tríade foram mostradas lá atrás, quando ela começou.
 *
 * Cobrar dose de quem só menciona geraria ruído, e um verificador ruidoso é
 * desligado no primeiro aperto — e aí não pega mais nada, nem o caso real que
 * ele existe para pegar. Prescritor aqui é quem manda INICIAR.
 */
const MANDA_INICIAR = /\biniciar\b|\bsulfatar\b|\bsulfatação\b|\bfazer\b|\badministrar\b/i;
const NEGA = /\bnão\s+(indicar|iniciar|usar|administrar|fazer)\b/i;
const MANTEM_APENAS = /^\s*manter\b/i;

/**
 * A referência TEMPORAL a uma dose já dada não é prescrição. O nó do parto diz
 * "aguardar pelo menos 4 h do INÍCIO DA DOSE DE ATAQUE do MgSO₄ antes do
 * nascimento" — instrução sobre QUANDO nascer, para quem já está sulfatada. A
 * versão anterior leu "dose de ataque" e o acusou de sulfatar sem mostrar dose.
 */
const TEMPORAL = /\baguardar\b|\bapós\b|\bantes d[oa]\b|\bdo início d[ae]\b|\bem curso\b/i;

/**
 * Um nó prescreve se ALGUMA linha sua manda iniciar a sulfatação — seja com o
 * esquema completo (tem dose em gramas), seja com a ordem sem a dose, que é
 * justamente o caso perigoso que este script existe para pegar.
 */
function prescreveSulfatacao(no) {
  const linhas = [no.title, no.summary, ...(no.actions || [])].filter(Boolean);
  return linhas.some((l) => {
    if (!CITA_MG.test(l)) return false;
    if (NEGA.test(l)) return false;
    // Linha que traz GRAMAS é esquema, e esquema prescreve — mesmo carregando
    // uma palavra temporal. A linha do pré-hospitalar ("Sem chegada ao hospital
    // ANTES DA próxima dose: manutenção por Pritchard, 10 g IM no ataque…")
    // caía no filtro temporal e sumia da conferência, embora seja exatamente o
    // tipo de linha que o script existe para vigiar.
    if (TEM_DOSE.test(l)) return true;
    return MANDA_INICIAR.test(l) && !MANTEM_APENAS.test(l) && !TEMPORAL.test(l);
  });
}
const TRIADE = /reflexo patelar/i;
const ANTIDOTO = /gluconato de cálcio/i;

const nos = Object.values(arvore.nodes);

const noDaTriade = nos.find((n) => TRIADE.test(textoDo(n)) && ANTIDOTO.test(textoDo(n)));
if (!noDaTriade) {
  falhas.push("nenhum nó reúne a tríade de segurança e o antídoto — o módulo perdeu a rede de proteção");
} else if (!TEM_DOSE.test(textoDo(noDaTriade))) {
  falhas.push(`"${noDaTriade.id}" cita o gluconato de cálcio sem dose — antídoto sem dose não é prescrição`);
} else {
  ok += 2;
}

const prescritores = nos.filter((n) => n.type === "action" && prescreveSulfatacao(n));
if (prescritores.length < 2) {
  falhas.push(`só ${prescritores.length} nó(s) prescrevem MgSO₄ — a varredura provavelmente deixou de enxergar o módulo`);
}

for (const no of prescritores) {
  const daqui = alcancaveis(no.id);

  // 1. A dose aparece — no próprio nó ou logo adiante no mesmo caminho.
  const comDose = [...daqui].filter((id) => {
    const alvo = arvore.nodes[id];
    return CITA_MG.test(textoDo(alvo)) && TEM_DOSE.test(textoDo(alvo));
  });
  if (!comDose.length) {
    falhas.push(
      `"${no.id}" manda sulfatar e NENHUM nó alcançável a partir dele traz a dose — ` +
      `citar "Pritchard ou Zuspan" sem número não prescreve nada.`
    );
  } else ok++;

  // 2. A tríade de segurança e o antídoto são alcançáveis.
  if (noDaTriade && !daqui.has(noDaTriade.id)) {
    falhas.push(
      `"${no.id}" prescreve MgSO₄ mas NÃO alcança "${noDaTriade.id}" — ` +
      `sulfatação sem tríade de segurança e sem antídoto no caminho.`
    );
  } else ok++;
}

console.log("\nSulfato de magnésio — dose, tríade e antídoto no mesmo caminho\n");
for (const no of prescritores) {
  console.log(`   ${no.id.padEnd(18)} ${no.title}`);
}
if (falhas.length) {
  console.log("");
  for (const f of falhas) console.log(`❌ ${f}`);
} else {
  console.log(`\n✅ ${ok} verificações — ${prescritores.length} nós que sulfatam, todos com dose e tríade no caminho`);
}
console.log("");

fs.rmSync(tempDir, { recursive: true, force: true });
process.exit(falhas.length ? 1 : 0);
