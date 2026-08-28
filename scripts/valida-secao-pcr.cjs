#!/usr/bin/env node
/**
 * PROMETE: que a seção «Dentro do módulo PCR Adulto» — a lista que DESENHA a tela, em
 *   `constants/secao-do-pcr.ts` — seja exatamente o grupo "Reanimação" de
 *   `constants/module-groups.ts` menos o herói; que todo id exista de fato; e que
 *   nenhum card da seção deixe de aparecer no hub (seção agrupa, não some).
 *
 * NÃO PROMETE: a ordem dentro da seção (é a do encontro, decisão de produto), nem
 *   o desenho do card. A ordem cenário→consulta DENTRO da seção é medida por
 *   `e2e/ordem-do-hub`, na tela renderizada.
 *
 * UNIVERSO: `constants/secao-do-pcr.ts` (a lista que desenha), o grupo
 *   "Reanimação" de `constants/module-groups.ts` (a lista de cobertura) e os ids
 *   de `clinical-modules.ts` — os três derivados da fonte, para que módulo novo
 *   entre sem ninguém lembrar.
 *
 * ── POR QUE DUAS LISTAS, E NÃO UMA ─────────────────────────────────────────
 *
 * `module-groups.ts` declara no cabeçalho que serve a COBERTURA E VALIDAÇÃO e
 * NÃO desenha tela. Em 2026-08-17 alguém o usou como se desenhasse e relatou uma
 * correção que não chegou a nenhum pixel. Ler dali para montar a seção repetiria
 * o erro invertido. Então a tela tem fonte própria — e a coerência entre as duas
 * é TRAVADA aqui em vez de combinada por comentário (R-92: o que não reprova não
 * impede).
 */
const path = require("path");
const { lerFonte, lerCru } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
const falhas = [];
let ok = 0;

const fonteSecao = lerFonte(path.join(appDir, "constants/secao-do-pcr.ts"));
// ⚠️ `lerCru` para a RAZÃO da exclusão: ela vive em comentário, e aqui o
// comentário É o objeto da medida. Ver scripts/lib/fonte.cjs.
const secaoComComentario = lerCru(path.join(appDir, "constants/secao-do-pcr.ts"));
const fonteGrupos = lerFonte(path.join(appDir, "constants/module-groups.ts"));
const fonteModulos = lerFonte(path.join(appDir, "clinical-modules.ts"));

const idsDaSecao = [...fonteSecao.matchAll(/"([a-z0-9-]+)",/g)].map((m) => m[1])
  .filter((id) => id !== "pcr-adulto");
const heroi = /ID_DO_HEROI = "([a-z0-9-]+)"/.exec(fonteSecao)?.[1];
const grupoReanimacao = /subtitle: "Parada cardiorrespiratória e ACLS",[\s\S]*?ids: \[([^\]]+)\]/
  .exec(fonteGrupos)?.[1];
const idsDoGrupo = grupoReanimacao
  ? [...grupoReanimacao.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1])
  : [];
const idsDoApp = new Set([...fonteModulos.matchAll(/\n\s*id: "([a-z0-9-]+)",/g)].map((m) => m[1]));

// ⚠️ VACUIDADE (R-15 item 9): leitura quebrada não pode virar aprovação.
if (idsDaSecao.length < 4 || idsDoGrupo.length < 5 || idsDoApp.size < 10 || !heroi) {
  console.log(
    `\n❌ leitura quebrada — seção ${idsDaSecao.length}, grupo ${idsDoGrupo.length}, ` +
    `app ${idsDoApp.size}, herói ${heroi ?? "não achado"}\n`
  );
  process.exit(1);
}

// ── 1. A seção é o grupo menos o herói, nos dois sentidos ──────────────────
// ⚠️ A EXCLUSÃO É LIDA DA FONTE, não escrita aqui — senão a trava viraria o
// lugar onde qualquer módulo inconveniente se esconde (R-93). E ela é conferida:
// exclusão sem razão declarada no arquivo não passa.
const excluidos = [...(/EXCLUIDOS_DA_SECAO[^=]*=\s*\[([^\]]*)\]/.exec(fonteSecao)?.[1] ?? "")
  .matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
const esperados = idsDoGrupo.filter((id) => id !== heroi && !excluidos.includes(id));
const faltando = esperados.filter((id) => !idsDaSecao.includes(id));
const sobrando = idsDaSecao.filter((id) => !esperados.includes(id));
if (faltando.length || sobrando.length) {
  falhas.push(
    `a seção do PCR divergiu do grupo "Reanimação".\n` +
    (faltando.length ? `      FALTAM na tela: ${faltando.join(", ")}\n` : "") +
    (sobrando.length ? `      SOBRAM na tela: ${sobrando.join(", ")}\n` : "") +
    `      ⚠️ Módulo novo do ACLS entra no grupo e não na seção — e some da seção sem\n` +
    `      ninguém perceber, porque a tela não lê o grupo (e não deve ler: ele não desenha).`
  );
} else ok++;

// ── 2. Todo id da seção existe mesmo ───────────────────────────────────────
const inexistentes = idsDaSecao.filter((id) => !idsDoApp.has(id));
if (inexistentes.length) {
  falhas.push(
    `${inexistentes.length} id(s) da seção não existem em clinical-modules: ${inexistentes.join(", ")}.\n` +
    `      ⚠️ O card simplesmente não é desenhado — falha silenciosa, a tela renderiza sem ele.`
  );
} else ok++;

// ── 3b. Toda exclusão tem de estar na lista principal e ter razão escrita ──
//
// Tirar um módulo da seção não pode significar tirá-lo do app. E uma exclusão
// sem motivo escrito é uma lista de exceções disfarçada.
for (const id of excluidos) {
  if (!idsDoApp.has(id)) {
    falhas.push(`\`${id}\` foi excluído da seção mas não existe em clinical-modules — ele sumiu do app.`);
  } else ok++;
  const janela = secaoComComentario.slice(0, secaoComComentario.indexOf("EXCLUIDOS_DA_SECAO"));
  if (!janela.includes(id.split("-")[0].toUpperCase()) && !/CLÍNICA|clínica/.test(janela)) {
    falhas.push(
      `a exclusão de \`${id}\` não tem razão declarada acima de EXCLUIDOS_DA_SECAO.\n` +
      `      ⚠️ Exclusão sem razão escrita é lista de exceções — o lugar onde um módulo\n` +
      `      inconveniente se esconde depois (R-93).`
    );
  } else ok++;
}

// ── 3. O herói não entra na seção ──────────────────────────────────────────
if (idsDaSecao.includes(heroi)) {
  falhas.push(`o herói \`${heroi}\` está na seção — ele É o módulo que a seção acompanha, não um item dela.`);
} else ok++;

console.log("\nA seção do PCR é o grupo de reanimação menos o herói\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — ${idsDaSecao.length} cards na seção, todos existentes, herói fora\n`);
process.exit(0);
