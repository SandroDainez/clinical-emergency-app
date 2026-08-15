#!/usr/bin/env node
/**
 * PROMETE
 *   Que a sequência de 2025 (golpes ANTES das compressões) não regrida, que as
 *   exceções e o critério de gravidade continuem no módulo, e que a
 *   particularidade da RCP no engasgo exista NOS DOIS sítios da rota — o módulo
 *   de OVACE e o fluxo da PCR.
 *
 * NÃO PROMETE
 *   Que a técnica esteja completa: descrição de manobra é conteúdo, e foi
 *   auditada com fonte aberta. Aqui a garantia é de não-regressão e de
 *   distribuição pela rota.
 *
 * UNIVERSO
 *   O módulo de OVACE, a lib da particularidade, a tela do fluxo ACLS e a
 *   navegação entre módulos.
 *
 * ── O QUE ELA IMPEDE ────────────────────────────────────────────────────────
 *
 * 1. A INVERSÃO DA SEQUÊNCIA. Golpes primeiro é mudança de 2025, e o app
 *    declara segui-la. Quem "corrigir" para a compressão abdominal isolada
 *    estará escrevendo a diretriz de 2020 — e é o que a memória do curso antigo
 *    manda fazer.
 *
 * 2. A PERDA DA PARTICULARIDADE NA ROTA. Ela vivia SÓ no OVACE, a superfície de
 *    onde a pessoa SAIU — e não existia na PCR, onde ela está e onde o corpo
 *    estranho ainda está. R-48 na forma de rota.
 *
 * 3. A PROMOÇÃO INDEVIDA DA CAUSA. A hipóxia entra como SUSPEITA, nunca como
 *    abordada: ela só é abordada quando o objeto sair.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const MODULO = "components/protocol-screen/acls-choking-screen.tsx";
const LIB = "lib/ovace-na-pcr.ts";
const FLUXO = "components/protocol-screen/acls-protocol-screen.tsx";
const NAV = "lib/module-session-navigation.ts";

const falhas = [];
let ok = 0;

const limpo = (rel) =>
  fs
    .readFileSync(path.join(appDir, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const semImports = (rel) => limpo(rel).replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

const modulo = limpo(MODULO);
const lib = limpo(LIB);

// ── A. A sequência de 2025 ─────────────────────────────────────────────────
{
  const iGolpes = modulo.indexOf("golpes nas costas");
  const iCompressoes = modulo.indexOf("compressões abdominais");
  if (iGolpes < 0 || iCompressoes < 0) {
    falhas.push(
      `${MODULO}: não achei "golpes nas costas" e/ou "compressões abdominais" — a leitura cegou, ` +
      `e uma trava que não encontra o alvo não protege nada (R-15 item 2).`
    );
  } else if (iGolpes > iCompressoes) {
    falhas.push(
      `${MODULO}: as compressões abdominais aparecem ANTES dos golpes nas costas. A AHA 2025 ` +
      `inverteu a ordem — golpes primeiro. Escrever o contrário é a diretriz de 2020, que é ` +
      `exatamente o que a memória do curso antigo manda fazer.`
    );
  } else ok++;

  // O aviso da mudança é o que impede a regressão POR MEMÓRIA — some ele, e o
  // texto certo vira apenas uma opinião contra o que a pessoa aprendeu.
  if (!/Mudou em 2025/.test(modulo)) {
    falhas.push(`${MODULO}: sumiu o card "Mudou em 2025". Sem ele, o texto correto não avisa que CONTRARIA o curso antigo (R-45).`);
  } else ok++;
}

// ── B. Gravidade, e a conduta da LEVE ──────────────────────────────────────
{
  if (!/INCENTIVE A TOSSE/.test(modulo)) {
    falhas.push(
      `${MODULO}: sumiu a conduta da obstrução LEVE. Intervir numa leve PIORA — a tosse é mais ` +
      `eficaz que qualquer manobra, e o app precisa dizer para NÃO agir.`
    );
  } else ok++;

  const sinais = (modulo.match(/\{ sinal: "/g) || []).length;
  if (sinais < 5) {
    falhas.push(`${MODULO}: os sinais de obstrução grave caíram para ${sinais} — a fonte lista cinco.`);
  } else ok++;
}

// ── C. As exceções, e a âncora na RCP ──────────────────────────────────────
{
  for (const [nome, padrao] of [
    ["a exceção torácica (gestante/obeso)", /compressões são TORÁCICAS/],
    ["o critério funcional do abdome", /circundar o abdome/],
    ["a âncora na referência da RCP", /METADE INFERIOR DO ESTERNO/],
    ["a posição da compressão abdominal", /ACIMA DO UMBIGO/],
  ]) {
    if (!padrao.test(modulo)) {
      falhas.push(
        `${MODULO}: ${nome} sumiu. O módulo é superfície de AÇÃO — sem o "onde", quem nunca fez a ` +
        `manobra não a executa a partir deste texto (R-48).`
      );
    } else ok++;
  }
}

// ── D. A particularidade existe NOS DOIS SÍTIOS da rota ────────────────────
{
  for (const [nome, padrao] of [
    ["a declaração de que a RCP é a PADRÃO", /A RCP É A PADRÃO/],
    ["o quando (após cada 30 compressões)", /APÓS CADA 30 COMPRESSÕES/],
    ["a proibição da varredura às cegas", /NUNCA varredura digital às cegas/],
  ]) {
    if (!padrao.test(lib)) {
      falhas.push(
        `${LIB}: ${nome} sumiu. Sem "a RCP é a padrão", enumerar uma particularidade convida a ` +
        `supor que há outras — e alguém inventa variação de ritmo ou de relação 30:2.`
      );
    } else ok++;
  }

  // Import removido: import não é consumo (R-15 item 10).
  for (const rel of [MODULO, FLUXO]) {
    if (!/OVACE_NA_PCR/.test(semImports(rel))) {
      falhas.push(
        `${rel}: não consome OVACE_NA_PCR. A particularidade tem de existir nos DOIS lados da ` +
        `rota — quem entra na PCR pelo engasgo é justamente quem ainda tem o corpo estranho.`
      );
    } else ok++;
  }
}

// ── E. A ponte para a PCR, com a pré-marcação da causa ─────────────────────
{
  if (!/markProtocolSessionForResume\("pcr_adulto",\s*\["hipoxia"\]\)/.test(modulo)) {
    falhas.push(
      `${MODULO}: a ponte para a PCR perdeu a pré-marcação da hipóxia. A parada por engasgo tem ` +
      `CAUSA CONHECIDA, e o app não deve pedir que se procure o que a navegação já sabe.`
    );
  } else ok++;

  if (!/pcr-adulto/.test(modulo)) {
    falhas.push(`${MODULO}: sumiu o ponteiro para o PCR Adulto (R-33) — o passo manda iniciar RCP e não oferece caminho.`);
  } else ok++;

  // ⚠️ SUSPEITA, NUNCA ABORDADA.
  const nav = limpo(NAV);
  if (/"abordada"/.test(nav)) {
    falhas.push(
      `${NAV}: a pré-marcação passou a usar "abordada". No engasgo a hipóxia só está tratada ` +
      `quando o objeto SAI — marcar abordada faz o app declarar resolvida uma causa que ainda ` +
      `está matando o paciente.`
    );
  } else ok++;

  const app = limpo("components/clinical-app.tsx");
  if (!/updateReversibleCauseStatus\(causeId, "suspeita"\)/.test(app)) {
    falhas.push(`components/clinical-app.tsx: a pré-marcação deixou de entrar como "suspeita".`);
  } else ok++;
}

// ── F. A redundância deliberada continua sendo DUAS coisas ─────────────────
//
// Uma auditoria futura pode ler estado + texto como duplicação e "unificar".
// Não são o mesmo construto: a marcação é ESTADO (o app sabe), o texto é ENSINO
// (a pessoa sabe). Se um dos dois sumir, esta trava acusa — e a razão está
// escrita no ponto da redundância, em module-session-navigation.
{
  if (!/OVACE_CAUSA_JA_IDENTIFICADA/.test(semImports(MODULO))) {
    falhas.push(
      `${MODULO}: sumiu o texto que explica a causa já identificada. Ele NÃO é cópia da ` +
      `pré-marcação: a marcação é ESTADO, o texto é ENSINO. Se a sessão for retomada por outro ` +
      `caminho, ou se o mecanismo falhar, é o texto que continua ensinando.`
    );
  } else ok++;

  if (!/consumeCausasPreMarcadas/.test(semImports("components/clinical-app.tsx"))) {
    falhas.push(
      `components/clinical-app.tsx: sumiu o consumo da pré-marcação. Restaria só o texto — o ` +
      `app deixaria de SABER o que continua ensinando.`
    );
  } else ok++;
}

// ── G. Pós-desobstrução com verbo forte ────────────────────────────────────
{
  if (!/NECESSÁRIA MESMO EM QUEM FICOU ASSINTOMÁTICO/.test(modulo)) {
    falhas.push(
      `${MODULO}: o pós-desobstrução voltou a descrever risco em vez de indicar conduta. ` +
      `"Pode haver" não manda avaliar; e o app tende a terminar no sucesso.`
    );
  } else ok++;
}

console.log("\nEngasgo (OVACE) — sequência 2025, exceções e a particularidade nos dois lados da rota\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — golpes antes, exceções ancoradas, e a rota completa\n`);
process.exit(0);
