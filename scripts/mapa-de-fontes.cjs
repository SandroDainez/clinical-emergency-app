#!/usr/bin/env node
/**
 * MAPA DE FONTES — o que cada módulo declara, quando foi revisto, e o que está
 * atrás do que o autor declara vigente.
 *
 * ── POR QUE ISTO EXISTE ─────────────────────────────────────────────────────
 *
 * A página de assinatura exibia seis selos de diretriz escritos à mão, e eles
 * mentiam nas duas direções: para menos (AHA 2020 quando o app já usa 2025) e
 * para mais (promessa de "principais diretrizes mundiais" que ninguém conferiu).
 * Os selos passaram a ser gerados de `guidelines_metadata.json`; este relatório
 * é o outro lado da mesma moeda — ele mede a DISTÂNCIA entre o que o app declara
 * e o que o autor declara vigente.
 *
 * ⚠️ ELE NÃO CONFERE A LITERATURA, e a diferença é séria. A referência de
 * "vigente" é `auditoria/fontes-vigentes.json`, que é levantamento DO AUTOR.
 * Este script diz "atrás do que o autor declara vigente", nunca "atrás da
 * literatura" — confirmar publicação é trabalho de quem tem CRM.
 *
 * ⚠️ E ELE NÃO REPROVA. Trocar o selo de SSC 2021 para SSC 2026 sem revisar o
 * módulo de sepse criaria uma mentira nova no lugar da antiga: o selo diz o que
 * o módulo REALMENTE usa. A atualização de conteúdo é trabalho por módulo, com
 * o autor — este mapa existe para ele decidir a ordem.
 *
 * Uso: npm run mapa:fontes
 */
const fs = require("fs");
const path = require("path");
const { lerFonte } = require("./lib/fonte.cjs");

const app = path.resolve(__dirname, "..");
const meta = JSON.parse(fs.readFileSync(path.join(app, "protocols/guidelines_metadata.json"), "utf8"));
const vig = JSON.parse(fs.readFileSync(path.join(app, "auditoria/fontes-vigentes.json"), "utf8"));

const porId = new Map(meta.guidelines.map((g) => [g.id, g]));
const vigPorId = new Map(vig.vigentes.map((v) => [v.id_no_app, v]));

const L = (t = "") => console.log(t);
const mmAAAA = (iso) => (iso && /^\d{4}-\d{2}/.test(iso) ? iso.slice(5, 7) + "/" + iso.slice(0, 4) : "—");
// ⚠️ SCHEMA 2.0: o ano da BASE (publicação de fora) e a data da NOSSA revisão são
// campos diferentes. `null` no ano da base = não determinável pelo registro.
const anoBase = (g) => {
  const anos = (g.base ?? []).map((b) => b.ano).filter((a) => typeof a === "number");
  return anos.length ? Math.max(...anos) : null;
};
const rev = (g) => mmAAAA(g.nossa && g.nossa.revisadoEm);

L("\n════ MAPA DE FONTES ════\n");
L(`versão de conteúdo do app: ${meta.app_content_version} · última revisão completa: ${meta.last_full_review} · próxima prevista: ${meta.next_review_due}`);

// ── 1. Por módulo ───────────────────────────────────────────────────────────
const porModulo = new Map();
for (const g of meta.guidelines) {
  for (const m of g.modules_using ?? []) {
    if (!porModulo.has(m)) porModulo.set(m, []);
    porModulo.get(m).push(g);
  }
}
L(`\n── 1. FONTES POR MÓDULO (${porModulo.size} módulos) ──`);
for (const m of [...porModulo.keys()].sort()) {
  const gs = porModulo.get(m);
  const atrasadas = gs.filter((g) => {
    const v = vigPorId.get(g.id);
    return v && (v.situacao === "atrasado" || v.situacao === "atrasado_adocao_a_decidir" || v.situacao === "categoria_errada");
  });
  L(`\n${atrasadas.length ? "⚠️ " : "   "}${m}`);
  for (const g of gs) {
    const v = vigPorId.get(g.id);
    const marca = v
      ? { atrasado: "⚠️ ATRÁS", atrasado_adocao_a_decidir: "⚠️ ATRÁS (adoção a decidir)", categoria_errada: "⚠️ CATEGORIA ERRADA", verificar: "· verificar", app_a_frente_do_selo: "✅ app à frente do selo antigo" }[v.situacao] ?? ""
      : "";
    const ab = anoBase(g);
    L(`      base ${(ab ?? "SEM ANO").toString().padEnd(8)} · nossa ${rev(g).padEnd(8)} ${(g.nossa && g.nossa.versao ? String(g.nossa.versao).slice(0,18) : "").padEnd(20)} ${g.id.padEnd(36)} ${marca}`);
    if (v) L(`         vigente declarado pelo autor: ${v.vigente}`);
  }
}

// ── 2. Dívida ───────────────────────────────────────────────────────────────
L(`\n\n── 2. DÍVIDA DE FONTE, NA PRIORIDADE DECLARADA PELO AUTOR ──`);
vig.prioridade_declarada_pelo_autor.forEach((nome, i) => L(`   ${i + 1}. ${nome}`));
L("");
for (const v of vig.vigentes) {
  const g = porId.get(v.id_no_app);
  const usa = g ? (g.modules_using ?? []).join(", ") : "⚠️ id não existe no metadata";
  L(`   ${v.situacao === "app_a_frente_do_selo" ? "✅" : "⚠️ "} ${v.id_no_app}`);
  L(`      app usa:  base ${g ? (anoBase(g) ?? "SEM ANO") : "—"} · nossa versão ${g && g.nossa ? g.nossa.versao : "—"} (rev ${g ? rev(g) : "—"})`);
  L(`      vigente:  ${v.vigente}`);
  L(`      módulos:  ${usa}`);
  if (v.nota) L(`      nota:     ${v.nota}`);
  L("");
}

// ── 3. Fonte sem módulo — não vira selo ─────────────────────────────────────
const orfas = meta.guidelines.filter((g) => !(g.modules_using ?? []).length);
L(`── 3. FONTES DECLARADAS SEM MÓDULO QUE AS USE: ${orfas.length} ──`);
for (const g of orfas) L(`   · ${g.id}`);
L("   (não viram selo: selo é a promessa de que a fonte sustenta o que se vai usar)");

// ── 4. Módulo sem fonte ─────────────────────────────────────────────────────
// ⚠️ `lerFonte` e não `readFileSync`: comentário que CITA um id não é uso do id.
const canon = lerFonte(path.join(app, "clinical-modules.ts"));
const idsApp = [...canon.matchAll(/^\s{4}id:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
const cobertos = new Set([...porModulo.keys()].map((m) => m.replace(/_/g, "-")));
const semFonte = idsApp.filter((id) => !cobertos.has(id));
L(`\n── 4. MÓDULOS DO APP SEM FONTE DECLARADA: ${semFonte.length} de ${idsApp.length} ──`);
for (const id of semFonte) L(`   ⚠️ ${id}`);
const semAno = meta.guidelines.filter((g) => anoBase(g) === null);
L(`\n── 5. FONTES SEM ANO DE BASE DETERMINÁVEL: ${semAno.length} ──`);
L("   O selo NÃO exibe ano nestas — selo sem ano é honesto; selo com ano errado, não.");
for (const g of semAno) L(`   ⚠️ ${g.id.padEnd(38)} ${(g.base ?? []).map((b) => b.referencia).join(" · ").slice(0, 90)}`);

L("\n⚠️ Este mapa NÃO reprova e NÃO confere a literatura: 'vigente' é o que o autor declarou\n   em auditoria/fontes-vigentes.json. Trocar selo sem revisar o módulo criaria uma mentira\n   nova no lugar da antiga.\n");

// ── 6. Cues com texto e sem MP3 ─────────────────────────────────────────────
//
// ⚠️ POR QUE ESTA SEÇÃO MORA NO RELATÓRIO DE FONTES, E NÃO SÓ NO CÓDIGO.
//
// `CUES_SEM_MP3` é uma lista dentro de `speech-map.ts` — e lista dentro de código
// é BACKLOG SILENCIOSO. Foi assim que o `start_cpr` passou meses com o texto
// enriquecido, o MP3 espanhol regravado e o português NÃO: ninguém tinha onde
// ver que faltava gravação. A dívida de gravação sai aqui pelo mesmo motivo que
// a dívida de fonte: para existir num lugar que alguém lê sem procurar.
{
  const mapa = lerFonte(path.join(app, "acls/speech-map.ts"));
  const bloco = mapa.match(/const CUES_SEM_MP3 = new Set<string>\(\[([^\]]*)\]\)/);
  const chaves = bloco ? [...bloco[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
  L(`\n── 6. CUES COM TEXTO E SEM MP3: ${chaves.length} ──`);
  // ⚠️ VACUIDADE: lista não encontrada e lista vazia dizem coisas opostas, e o
  // relatório mostrava a mesma frase para as duas. Se alguém renomear a
  // constante, "nenhuma pendência" seria mentira tranquilizadora.
  if (!bloco) {
    L("   ⚠️ CUES_SEM_MP3 NÃO ENCONTRADA em acls/speech-map.ts — a lista mudou de nome ou");
    L("      de forma, e este relatório parou de enxergar a dívida de gravação. Conserte aqui.");
  } else if (!chaves.length) {
    L("   nenhuma — todas as cues emitidas têm gravação.");
  } else {
    L("   Não são emitidas enquanto não houver gravação: sem MP3 o app cai no TTS, e a");
    L("   troca de voz no meio da parada já foi relatada como defeito.");
    for (const k of chaves) {
      const t = mapa.match(new RegExp(`\\b${k}:\\s*"([^"]+)"`));
      L(`   ⚠️ ${k.padEnd(22)} texto a gravar: « ${t ? t[1] : "não encontrado em SPEECH_MAP"} »`);
    }
    L("   Para ligar: gravar (mesma voz), registrar em web-audio-cues.ts e no manifesto,");
    L("   e tirar a chave de CUES_SEM_MP3 — uma linha, sem flag para lembrar.");
  }
}

for (const a of vig.achados_de_brinde ?? []) {
  L(`── ACHADO REGISTRADO ──\n   ${a.o_que}\n   ${a.por_que_importa}\n   estado: ${a.estado}\n`);
}
