#!/usr/bin/env node
/**
 * PROMETE: que a representação serializada da seleção múltipla seja detalhe
 *   PRIVADO de `core/decision-tree/estado-clinico.ts` — que nenhum outro
 *   arquivo do app conheça o separador, faça `split` do valor bruto de um campo
 *   múltiplo ou procure substring dentro dele.
 * NÃO PROMETE: que os helpers estejam clinicamente certos (test:nucleo) nem que
 *   todo campo múltiplo esteja declarado como tal.
 * UNIVERSO: todo .ts/.tsx do app fora de node_modules.
 *
 * ── POR QUE ESTA TRAVA EXISTE ───────────────────────────────────────────────
 *
 * A escolha de guardar seleção múltipla como string com separador foi
 * deliberada: `TreeValues` é `Record<string,string>` e sustenta 30 módulos,
 * todo `escolher` de roteamento e todos os validadores — trocar o tipo
 * obrigaria a revisar cada consumidor, e um esquecido vira rota clínica errada.
 *
 * ⚠️ MAS A ESCOLHA SÓ É SEGURA ENQUANTO FOR INVISÍVEL (exigência do autor,
 * 2026-08-25): "nenhum módulo, componente, validador ou regra clínica deveria
 * fazer `value.includes(...)` ou manipular esse separador diretamente. Caso
 * contrário, daqui a alguns meses aparece um bug clínico impossível de
 * rastrear."
 *
 * O bug que ele descreve é concreto: `values.queixas.includes("dor")` casa
 * também com "dor torácica pleurítica" e com "sem dor" — dois quadros
 * diferentes, um deles o oposto do procurado. `temSelecionado()` compara item
 * inteiro e não tem esse modo de falhar. Por isso a leitura é obrigada a passar
 * pelos helpers, e esta trava é o que obriga.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const CASA_DOS_HELPERS = path.join("core", "decision-tree", "estado-clinico.ts");
const falhas = [];
let ok = 0;
let arquivosVarridos = 0;

const IGNORAR = new Set(["node_modules", ".git", ".expo", "dist", "web-build", "playwright-report", "test-results"]);

function* arquivos(dir) {
  for (const nome of fs.readdirSync(dir)) {
    if (IGNORAR.has(nome)) continue;
    const p = path.join(dir, nome);
    const st = fs.statSync(p);
    if (st.isDirectory()) yield* arquivos(p);
    else if (/\.tsx?$/.test(nome)) yield p;
  }
}

// O separador, montado em runtime: escrevê-lo literalmente aqui faria ESTE
// arquivo ser o primeiro a violar a própria regra.
const SEPARADOR = String.fromCharCode(31);

/**
 * Campos declarados `multiplo: true` — o alvo da regra B.
 *
 * ⚠️ AS ÁRVORES DE PROVA CONTAM (`scripts/*.cjs`). Enquanto nenhuma tela
 * clínica declarar campo múltiplo, a regra B ficaria sem alvo e passaria sobre
 * nada — o defeito que este projeto mais combate. Incluir a árvore de prova dá
 * alvo desde já; e o auto-teste no fim do arquivo garante que o detector
 * realmente detecta, com campo de produção ou sem ele.
 */
function camposMultiplos() {
  const campos = new Set();
  const fontes = [...arquivos(appDir)];
  for (const nome of fs.readdirSync(path.join(appDir, "scripts"))) {
    if (nome.endsWith(".cjs")) fontes.push(path.join(appDir, "scripts", nome));
  }
  for (const p of fontes) {
    const fonte = fs.readFileSync(p, "utf8");
    if (!/multiplo:\s*true/.test(fonte)) continue;
    // O `id` do campo aparece antes do `multiplo` dentro do mesmo objeto. A
    // busca não pode parar na primeira `}` — `presets` traz chaves aninhadas —,
    // então o que delimita é o PRÓXIMO `id:`, que já seria outro campo.
    for (const m of fonte.matchAll(/id:\s*"([^"]+)"(?:(?!\bid:)[\s\S])*?multiplo:\s*true/g)) campos.add(m[1]);
  }
  return campos;
}

const MULTIPLOS = camposMultiplos();

/**
 * O detector de leitura crua — UMA definição, usada tanto na varredura quanto
 * no auto-teste.
 *
 * ⚠️ DUPLICAR O REGEX ANULARIA O AUTO-TESTE: ele passaria a provar que uma
 * cópia funciona, enquanto a que varre o app poderia estar cega. Foi assim que
 * a primeira versão desta trava nasceu quebrada — o auto-teste é que denunciou.
 *
 * Casa `values.campo.`, `v.campo?.`, `values["campo"].` — as três formas em que
 * um consumidor lê o valor bruto antes de aplicar o método proibido.
 */
const METODOS_PROIBIDOS = ["includes", "split", "indexOf", "match"];
function detector(campo, metodo) {
  return new RegExp(`\\bv(?:alues)?(?:\\.|\\[")${campo}("\\])?\\s*\\??\\.\\s*${metodo}\\s*\\(`);
}

for (const p of arquivos(appDir)) {
  arquivosVarridos++;
  const rel = path.relative(appDir, p);
  const fonte = fs.readFileSync(p, "utf8");
  const ehACasa = rel === CASA_DOS_HELPERS;

  // ── A. O SEPARADOR EM SI ────────────────────────────────────────────────
  //
  // Nem literal, nem escapado, nem por fromCharCode/codePoint: as três formas
  // significam a mesma coisa, e proibir só a primeira é convite ao contorno.
  const formas = [
    [SEPARADOR, "o separador literal"],
    ["\\u001F", "o separador escapado (\\u001F)"],
    ["\\u001f", "o separador escapado em minúscula"],
    ["fromCharCode(31)", "o separador via String.fromCharCode(31)"],
    ["\\x1F", "o separador escapado em hexadecimal"],
  ];
  for (const [forma, nome] of formas) {
    if (!fonte.includes(forma)) continue;
    if (ehACasa) continue;
    falhas.push(
      `${rel} conhece ${nome}.\n` +
      `      ⚠️ A representação da seleção múltipla é detalhe privado de ${CASA_DOS_HELPERS}. ` +
      `Um segundo arquivo que a conhece é um segundo lugar para corrigir no dia em que ela mudar — ` +
      `e o que fica para trás falha em silêncio, devolvendo seleção vazia ou item partido ao meio.`
    );
  }

  // ── B. LEITURA CRUA DE CAMPO MÚLTIPLO ───────────────────────────────────
  //
  // ⚠️ O MODO DE FALHA É CLÍNICO, não estético. `values.queixas.includes("dor")`
  // casa com "dor torácica" E com "sem dor" — o segundo é o oposto do que a
  // regra procura, e nada no código denuncia isso.
  if (ehACasa) continue;
  for (const campo of MULTIPLOS) {
    const padroes = METODOS_PROIBIDOS.map((m) => [detector(campo, m), `\`${campo}\` lido com .${m}()`]);
    for (const [padrao, descricao] of padroes) {
      if (!padrao.test(fonte)) continue;
      falhas.push(
        `${rel}: ${descricao} — leitura crua de campo de seleção múltipla.\n` +
        `      ⚠️ Substring casa com o item errado: procurar "dor" encontra "dor torácica" e também ` +
        `"sem dor". Use \`temSelecionado(values, "${campo}", "…")\` ou \`temAlgum(...)\`, que comparam ` +
        `item inteiro.`
      );
    }
  }
  ok++;
}

// ── C. Vacuidade ───────────────────────────────────────────────────────────
if (arquivosVarridos < 50) {
  falhas.push(`só ${arquivosVarridos} arquivos varridos — a varredura pode ter rodado sobre nada (R-15 item 9).`);
}
if (!MULTIPLOS.size) {
  falhas.push(
    "nenhum campo `multiplo: true` encontrado no app nem nas árvores de prova.\n" +
    "      ⚠️ A conferência B não teve alvo — ela passaria mesmo com leitura crua em toda parte."
  );
}

// ── C-bis. AUTO-TESTE DO DETECTOR ──────────────────────────────────────────
//
// ⚠️ A PERGUNTA QUE ESTA TRAVA TEM DE RESPONDER SOBRE SI MESMA: "você
// reprovaria se houvesse violação?" Sem isto, um regex quebrado por um ajuste
// de nome de variável deixaria a trava verde para sempre — e verde por não
// enxergar nada é pior do que trava nenhuma, porque dá garantia falsa.
{
  const campo = [...MULTIPLOS][0];
  if (campo) {
    // Cada isca usa uma FORMA DE LEITURA diferente de propósito — ponto,
    // encadeamento opcional e colchete —, para que a trava prove que enxerga
    // as três, e não só a que aparece no exemplo do comentário.
    const iscas = [
      [`const tem = values.${campo}.includes("dor");`, "includes"],
      [`const partes = values.${campo}.split("|");`, "split"],
      [`if (v.${campo}?.indexOf("dor") >= 0) {}`, "indexOf"],
      [`const m = values["${campo}"].match(/dor/);`, "match"],
    ];
    iscas.forEach(([isca, metodo]) => {
      const nome = `.${metodo}()`;
      if (!detector(campo, metodo).test(isca)) {
        falhas.push(
          `o detector de \`${nome}\` NÃO reconheceu a violação de teste:\n        ${isca}\n` +
          `      ⚠️ A trava está cega para o que promete pegar — verde por não enxergar, que é ` +
          `garantia falsa.`
        );
      } else ok++;
    });
  }
}
// E os helpers oficiais têm de existir com o nome que os consumidores usam.
{
  const casa = fs.readFileSync(path.join(appDir, CASA_DOS_HELPERS), "utf8");
  for (const h of ["selecionados", "temSelecionado", "temAlgum", "alternarSelecao"]) {
    if (!new RegExp(`export function ${h}\\b`).test(casa)) {
      falhas.push(`o helper oficial \`${h}\` sumiu de ${CASA_DOS_HELPERS} — sem ele o consumidor volta a ler cru.`);
    } else ok++;
  }
  if (/export const SEP\b/.test(casa)) {
    falhas.push(
      "`SEP` voltou a ser exportado.\n" +
      "      ⚠️ Exportá-lo é convidar o consumidor a fazer `split(SEP)` — a regra deixa de ser " +
      "encapsulamento e vira convenção, que ninguém consegue cobrar."
    );
  } else ok++;
}

console.log("\nEncapsulamento da seleção múltipla — a representação é privada\n");
console.log(`  ${arquivosVarridos} arquivos varridos · campos múltiplos: ${[...MULTIPLOS].join(", ") || "(nenhum)"}\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — nenhum consumidor conhece o separador\n`);
process.exit(0);
