#!/usr/bin/env node
/**
 * PROMETE: que o bloqueio do nitrato por inibidor de PDE-5 seja decidido pela
 *   JANELA DO FÁRMACO contra o horário da última dose — e que nenhuma forma de
 *   "não sei" (qual fármaco, quando, ou se usou) vire liberação.
 * NÃO PROMETE: que as janelas em horas estejam certas — elas são a ACC/AHA 2025
 *   e são decisão clínica do autor, não desta trava. Nem o roteamento das telas
 *   (`test:dose-governada`) nem a alcançabilidade da pergunta.
 * UNIVERSO: `lib/pde5.ts`, `lib/vereditos-sca.ts` e os campos da árvore.
 *
 * ── A MODELAGEM ERRADA QUE ESTA TRAVA IMPEDE DE VOLTAR ──────────────────────
 *
 * Eu havia proposto uma categoria `pde5_cronico` = "contraindicação PERMANENTE
 * enquanto o paciente estiver em uso", tirada do texto do próprio módulo. O
 * autor barrou antes da implementação:
 *
 *   "A ACC/AHA 2025 fala em evitar nitratos após uso recente: 12 h avanafil,
 *    24 h sildenafil/vardenafil, 48 h tadalafil. Ela não cria uma categoria
 *    separada de uso crônico = contraindicação permanente. A lógica deve
 *    continuar baseada em fármaco + horário da última dose."
 *
 * ⚠️ A DIFERENÇA NÃO É DE RÓTULO. "Permanente" era inferência minha promovida a
 * regra — e uma vez escrita no app, viraria fonte para quem lesse. O uso
 * habitual muda a PROBABILIDADE de existir dose dentro da janela; não abole a
 * janela. Quem parou o fármaco há 30 h não tem contraindicação por esta via, e
 * a regra "para sempre" negaria nitrato a esse paciente.
 *
 * ── E O QUE NUNCA PODE VIRAR LIBERAÇÃO ──────────────────────────────────────
 *
 * Sem o fármaco, a janela aplicável é desconhecida: adotar a mais curta
 * liberaria tadalafila às 13 h. Sem o horário, não há o que comparar. Nos dois
 * casos o app não demonstrou segurança — e ausência de prova nunca é prova de
 * ausência. A única afirmação segura sem saber o fármaco é passadas 48 h.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const linhas = [];
let ok = 0;

function confere(descricao, condicao, porque) {
  if (condicao) ok++;
  else falhas.push(`${descricao}\n      ⚠️ ${porque}`);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pde5-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "lib", "vereditos-sca.ts"),
  path.join(appDir, "coronary-decision-tree.ts"),
], { cwd: appDir, stdio: "pipe" });

const { vereditoNitrato } = require(path.join(tmp, "lib", "vereditos-sca.js"));
const { JANELA_PDE5_H, JANELA_PDE5_DESCONHECIDA_H, lerPde5, janelaDe } = require(path.join(tmp, "lib", "pde5.js"));
const arv = Object.values(require(path.join(tmp, "coronary-decision-tree.js"))).find((v) => v && v.nodes);

const ESTAVEL = { pas: "130" };
const bloqueado = (v) => vereditoNitrato({ ...ESTAVEL, ...v }).nivel === "vermelho";

// ── A. CADA FÁRMACO TEM A SUA JANELA, E ELA É EXERCITADA NOS DOIS LADOS ────
{
  for (const [farmaco, janela] of Object.entries(JANELA_PDE5_H)) {
    const dentro = { pde5_recente: "sim", pde5_qual: farmaco, pde5_horas: String(janela - 1) };
    const fora = { pde5_recente: "sim", pde5_qual: farmaco, pde5_horas: String(janela) };

    confere(
      `${farmaco}: bloqueia a ${janela - 1} h (dentro da janela de ${janela} h)`,
      bloqueado(dentro),
      `liberou dentro da própria janela — a associação com nitrato causa hipotensão refratária.`
    );
    confere(
      `${farmaco}: libera a ${janela} h (fora da janela)`,
      !bloqueado(fora),
      `continuou bloqueando depois da janela. Negar nitrato a quem já saiu dela é o erro espelho, ` +
      `e foi o que a modelagem "contraindicação permanente" teria produzido.`
    );
    linhas.push(`  ${farmaco.padEnd(12)} bloqueia < ${String(janela).padStart(2)} h · libera ≥ ${janela} h`);
  }

  // ⚠️ AS JANELAS SÃO DIFERENTES ENTRE SI — senão a modelagem "por fármaco"
  // seria decorativa e um único número serviria.
  const distintas = new Set(Object.values(JANELA_PDE5_H));
  confere(
    "as janelas não colapsaram num número só",
    distintas.size >= 3,
    `só ${distintas.size} valor(es) distinto(s) entre os quatro fármacos. Se todas fossem iguais, ` +
    `perguntar QUAL fármaco seria um toque que não muda nada.`
  );

  // O caso que motivou a correção do autor: sildenafila 20 mg 3×/dia.
  confere(
    "uso habitual não vira contraindicação permanente — 30 h após a última dose de sildenafila libera",
    !bloqueado({ pde5_recente: "sim", pde5_qual: "sildenafila", pde5_horas: "30" }),
    `bloqueou 30 h depois da última dose de sildenafila (janela de ${JANELA_PDE5_H.sildenafila} h). ` +
    `Isso é a categoria "permanente" de volta: ela nega nitrato com base numa regra que a diretriz ` +
    `não cria, e o app viraria a fonte desse erro para quem o lê.`
  );
}

// ── B. NENHUM "NÃO SEI" LIBERA ─────────────────────────────────────────────
{
  const DUVIDAS = [
    ["não perguntado", {}],
    ["usou, não sabe qual, não sabe quando", { pde5_recente: "sim" }],
    ["usou, não sabe qual, há 13 h", { pde5_recente: "sim", pde5_qual: "nao_sei_qual", pde5_horas: "13" }],
    ["usou tadalafila, sem horário", { pde5_recente: "sim", pde5_qual: "tadalafila" }],
    ["não sabe se usou", { pde5_recente: "nao_sei" }],
    ["horário em branco", { pde5_recente: "sim", pde5_qual: "sildenafila", pde5_horas: "" }],
  ];
  for (const [rotulo, v] of DUVIDAS) {
    confere(
      `dúvida não libera: ${rotulo}`,
      bloqueado(v),
      `o nitrato ficou liberado. Ausência de prova não é prova de ausência — e aqui o desfecho do ` +
      `engano é hipotensão refratária em quem já está infartando.`
    );
  }

  // ⚠️ MAS A DÚVIDA SOBRE O FÁRMACO TEM UM LIMITE: passadas 48 h, nenhum dos
  // quatro continua na janela, e isso se afirma sem saber qual foi. Bloquear
  // para sempre por não saber o nome seria transformar a cautela em beco.
  confere(
    "não saber o fármaco não bloqueia para sempre — 50 h libera",
    !bloqueado({ pde5_recente: "sim", pde5_qual: "nao_sei_qual", pde5_horas: "50" }),
    `continuou bloqueado 50 h depois, acima das ${JANELA_PDE5_DESCONHECIDA_H} h da janela mais longa. ` +
    `Cautela que nunca termina vira portão: o médico não tem o que fazer para destravar.`
  );

  confere(
    "fármaco desconhecido usa a janela MAIS LONGA",
    janelaDe(undefined) === JANELA_PDE5_DESCONHECIDA_H && janelaDe("nao_sei_qual") === JANELA_PDE5_DESCONHECIDA_H,
    `a janela do desconhecido é ${janelaDe(undefined)} h. Usar a mais curta liberaria tadalafila às 13 h — ` +
    `escolher a hipótese conveniente é o oposto de não saber.`
  );

  confere(
    "não ter usado libera",
    !bloqueado({ pde5_recente: "nao" }),
    `bloqueou quem respondeu que NÃO usou — a trava viraria portão e o médico não teria o que responder.`
  );
}

// ── C. O ESTADO É DECLARADO, NÃO INFERIDO NO VEREDITO ──────────────────────
{
  const casos = [
    [{}, "nao_perguntado"],
    [{ pde5_recente: "nao" }, "sem_uso"],
    [{ pde5_recente: "sim", pde5_qual: "tadalafila", pde5_horas: "30" }, "dentro_da_janela"],
    [{ pde5_recente: "sim", pde5_qual: "tadalafila", pde5_horas: "50" }, "fora_da_janela"],
    [{ pde5_recente: "sim", pde5_qual: "tadalafila" }, "indeterminado"],
  ];
  for (const [v, esperado] of casos) {
    const s = lerPde5(v).estado;
    confere(
      `\`lerPde5\` classifica ${JSON.stringify(v)} como ${esperado}`,
      s === esperado,
      `veio "${s}". O veredito consome este estado; classificar errado aqui erra em todos os nós de uma vez.`
    );
  }
}

// ── D. A ÁRVORE PERGUNTA O QUE A REGRA CONSOME ─────────────────────────────
{
  const comCampo = (campo) =>
    Object.entries(arv.nodes).filter(([, n]) => (n.fields ?? []).some((f) => f.id === campo)).map(([id]) => id);

  const nosRecente = comCampo("pde5_recente");
  for (const campo of ["pde5_qual", "pde5_horas"]) {
    const nos = comCampo(campo);
    confere(
      `\`${campo}\` é perguntado onde \`pde5_recente\` é`,
      nos.length === nosRecente.length && nosRecente.every((n) => nos.includes(n)),
      `\`pde5_recente\` em ${nosRecente.length} nós, \`${campo}\` em ${nos.length}. Um nó que pergunta se usou ` +
      `mas não pergunta qual/quando produz "indeterminado" para sempre: o veredito bloqueia e o médico ` +
      `não tem onde responder — o beco que a regra do autor proíbe.`
    );
  }

  // ⚠️ E OS DOIS CAMPOS SÓ APARECEM PARA QUEM USOU. Perguntar "qual inibidor?"
  // a quem respondeu "não" é ruído — e ruído empurra o que importa para fora
  // da dobra, que é o defeito que a rodada de volume existe para atacar.
  for (const campo of ["pde5_qual", "pde5_horas"]) {
    const semGuarda = Object.entries(arv.nodes)
      .flatMap(([id, n]) => (n.fields ?? []).filter((f) => f.id === campo).map((f) => [id, f]))
      .filter(([, f]) => typeof f.showIf !== "function")
      .map(([id]) => id);
    confere(
      `\`${campo}\` só aparece para quem usou (\`showIf\`)`,
      semGuarda.length === 0,
      `sem guarda em: ${semGuarda.join(", ")}.`
    );
    const guardaCerta = Object.values(arv.nodes)
      .flatMap((n) => (n.fields ?? []).filter((f) => f.id === campo))
      .every((f) => f.showIf({ pde5_recente: "sim" }) === true && f.showIf({ pde5_recente: "nao" }) === false);
    confere(
      `a guarda de \`${campo}\` mostra no "sim" e esconde no "não"`,
      guardaCerta,
      `a guarda não reage a \`pde5_recente\` — ou mostra sempre, ou esconde sempre.`
    );
  }

  // Campo escondido não pode cobrar resposta.
  const camposOcultos = Object.values(arv.nodes)
    .flatMap((n) => (n.fields ?? []).filter((f) => typeof f.showIf === "function"));
  confere(
    "há campos com guarda para a conferência acima medir",
    camposOcultos.length >= 10,
    `só ${camposOcultos.length} campos com \`showIf\` — a trava pode ter rodado sobre nada (R-15 item 9).`
  );
}

// ── E. A CATEGORIA "PERMANENTE" NÃO VOLTA COMO REGRA ───────────────────────
//
// Por `lerFonte` (sem comentários): `lib/pde5.ts` CITA a formulação errada para
// explicar por que ela saiu, e uma leitura crua casaria com a explicação.
{
  const pde5 = lerFonte("lib/pde5.ts");
  const vereditos = lerFonte("lib/vereditos-sca.ts");
  confere(
    "nenhuma regra executável trata uso de PDE-5 como contraindicação permanente",
    !/permanente/i.test(pde5) && !/permanente/i.test(vereditos),
    `sobrou "permanente" em código executável. A diretriz dá janelas; "para sempre" seria uma ` +
    `categoria que ela não cria, escrita no app como se fosse fonte.`
  );
  confere(
    "as janelas vêm de `lib/pde5.ts`, não de números soltos no veredito",
    !/\b(12|24|48)\s*h\b/.test(vereditos.replace(/JANELA_PDE5_\w+/g, "")),
    `há janela em horas escrita à mão em \`vereditos-sca.ts\`. Duas cópias do mesmo número divergem ` +
    `em silêncio, e a que estiver errada é a que decide.`
  );
}

console.log("\nInibidor de PDE-5 — janela por fármaco, nunca contraindicação permanente\n");
for (const l of linhas) console.log(l);
console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — a janela decide; a dúvida nunca libera\n`);
process.exit(0);
