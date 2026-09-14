#!/usr/bin/env node
/**
 * PROVA · 17ª RODADA DO AVC — vocabulário de resultado por transversal (AC-106), item pendente
 * com nome (AC-107), nenhum inglês no texto visível (AC-108), motivos de "não prosseguir" por
 * terapia (AC-109), um nome para a hemorragia intracraniana (AC-110) ⛔ marco de revisão como
 * declaração da equipe (AC-111). Decisões do autor, 2026-09-14 (`docs/decisoes.md`, 17ª rodada).
 *
 * PROMETE:
 *  · AC-106: cada transversal tem vocabulário próprio; deglutição = aprovada · reprovada · não
 *    realizada · não sei; mobilização = realizada · não realizada · contraindicada no momento ·
 *    não sei; nenhuma outra herda "aprovada/reprovada"; a conclusão lê o vocabulário da tarefa;
 *    a trava de via oral lê SÓ a deglutição.
 *  · AC-107: todo item do catálogo HIC/HSA (⛔ do caminho) tem identificação com o tema — ⛔ e a
 *    população quando houver; nenhuma tela desenha "conteúdo pendente de validação" sozinho.
 *  · AC-108: nenhuma tela desenha verbatim, verbo da fonte ⛔ citação fora do ⓘ; o Destino mostra
 *    a força traduzida; a trava e2e de texto visível procura inglês em pt-BR ⛔ em es.
 *  · AC-109: motivos da trombólise sem "Centro de referência recusou" ⛔ "Indisponível"; a
 *    trombectomia os mantém.
 *  · AC-110: "Hemorragia intracraniana (HIC)" na aba, no cabeçalho, no bloco do caminho, no plano ⛔
 *    na síntese; ⛔ "AVC hemorrágico" em código de tela ⛔ conteúdo.
 *  · AC-111: o rótulo do marco diz que é declaração da equipe.
 * NÃO PROMETE: o gesto a 375 px ⛔ o texto renderizado (isso é `e2e/avc-rodada17.spec.ts` ⛔
 *   `e2e/avc-procedencia-fora-do-card.spec.ts`); ⛔ valida conteúdo clínico — os vocabulários de TEV ⛔
 *   dispositivos são proposta registrada, pendente de validação do autor.
 * UNIVERSO: `components/avc/*.tsx`, `avc/conteudo/{plano-48h,validacao-do-catalogo,superficies,
 *   hemorragia-intracerebral,hemorragia-subaracnoidea,superficie-g}.ts`, `avc/nucleo/{plano-48h,
 *   caminho-hemorragico,sintese-do-caso}.ts`, `e2e/avc-procedencia-fora-do-card.spec.ts`.
 * FONTE: `docs/decisoes.md` — 17ª rodada.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rodada17-"));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
const arq = (...p) => path.join(appDir, ...p);
const fontes = [arq("avc", "nucleo", "estado.ts"), arq("avc", "nucleo", "relogio.ts"), arq("avc", "nucleo", "plano-48h.ts"),
  arq("avc", "nucleo", "caminho-hemorragico.ts"), arq("avc", "nucleo", "instancia.ts"), arq("avc", "nucleo", "problemas-ativos.ts"),
  arq("avc", "nucleo", "sintese-do-caso.ts"), arq("avc", "conteudo", "campos.ts"), arq("avc", "conteudo", "campo.ts"),
  arq("avc", "conteudo", "superficie-c.ts"), arq("avc", "conteudo", "plano-48h.ts"), arq("avc", "conteudo", "superficies.ts"),
  arq("avc", "conteudo", "hemorragia-intracerebral.ts"), arq("avc", "conteudo", "hemorragia-subaracnoidea.ts"),
  arq("avc", "conteudo", "validacao-do-catalogo.ts")];
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop", "--jsx", "react-jsx",
    "--moduleResolution", "node", "--skipLibCheck", "--resolveJsonModule", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => { try { return require(path.join(tmp, ...p)); } catch { return undefined; } };
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const P = emT("avc", "nucleo", "plano-48h.js");
const H = emT("avc", "nucleo", "caminho-hemorragico.js");
const I = emT("avc", "nucleo", "instancia.js");
const PA = emT("avc", "nucleo", "problemas-ativos.js");
const K = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const SC = emT("avc", "conteudo", "superficie-c.js");
const CP = emT("avc", "conteudo", "plano-48h.js");
const SUP = emT("avc", "conteudo", "superficies.js");
const HIC = emT("avc", "conteudo", "hemorragia-intracerebral.js");
const HSA = emT("avc", "conteudo", "hemorragia-subaracnoidea.js");
const V = emT("avc", "conteudo", "validacao-do-catalogo.js");

const MIN = 60_000;
const T0 = 1_800_000_000_000;
const tenta = (fn, padrao) => { try { return fn(); } catch (err) { return padrao === undefined ? `⛔ ${err.message}` : padrao; } };
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const telas = fs.readdirSync(arq("components", "avc")).filter((f) => f.endsWith(".tsx"));

/** ⚠️ Dentro de um ⓘ aberto: `<Recolhido>`/`<InfoDoCard>` ainda aberto, ⛔ ou depois de `aberto ? (` sem o fecho `) : null`. */
function dentroDoInfo(antes) {
  const abre = (antes.match(/<(Recolhido|InfoDoCard)\b/g) ?? []).length;
  const fecha = (antes.match(/<\/(Recolhido|InfoDoCard)>/g) ?? []).length + (antes.match(/<(Recolhido|InfoDoCard)\b[^<>]*\/>/g) ?? []).length;
  if (abre - fecha > 0) return true;
  /**
   * ⚠️ Ajuste de instrumento (17ª rodada, depois da implementação): a primeira versão procurava `) : null}` depois
   * de `aberto ? (` ⛔ e um ternário ANINHADO no detalhe aberto a enganava. ⚠️ Agora: depois do último
   * `aberto ? (`, ainda há `<View`/`<ClinicalCard` aberto (⛔ fechado).
   */
  const a = antes.lastIndexOf("aberto ? (");
  if (a < 0) return false;
  const trecho = antes.slice(a);
  return (trecho.match(/<(View|ClinicalCard)\b/g) ?? []).length - (trecho.match(/<\/(View|ClinicalCard)>/g) ?? []).length > 0;
}

function estadoComTc(resultado) {
  const rel = R.relogioControlado(T0);
  const inst = I.nomeDaInstancia(SC.ESTUDO, 1);
  let x = K.registrarComInstancia(E.abrirAtendimento(rel), { campo: "estudo_modalidade", valor: CAMPO.valorDaOpcao("Tomografia de crânio sem contraste") }, rel, inst);
  x = K.registrarComInstancia(x, { campo: "estudo_hora", valor: T0 }, rel, inst);
  return { rel, e: K.registrarComInstancia(x, { campo: "estudo_resultado", valor: CAMPO.valorDaOpcao(resultado) }, rel, inst) };
}

/* ══ 1 · AC-106 · VOCABULÁRIO POR TRANSVERSAL ═════════════════════════════ */
{
  const V17 = CP?.RESULTADOS_POR_TAREFA;
  conf("existe um vocabulário por tarefa (⛔ um só para todas)", V17 !== undefined && CP?.RESULTADOS_DA_TAREFA === undefined, "⛔ vocabulário único");
  conf("deglutição: aprovada · reprovada · não realizada · não sei", igual(V17?.degluticao, ["Aprovada", "Reprovada", "Não realizada", "Não sei"]), `⛔ ${JSON.stringify(V17?.degluticao)}`);
  conf("mobilização: realizada · não realizada · contraindicada no momento · não sei", igual(V17?.mobilizacao, ["Realizada", "Não realizada", "Contraindicada no momento", "Não sei"]), `⛔ ${JSON.stringify(V17?.mobilizacao)}`);
  const outras = (CP?.TAREFAS_TRANSVERSAIS ?? []).map((t) => t.id).filter((id) => CP?.CAMPO_DO_RESULTADO?.[id] !== undefined && id !== "degluticao");
  conf("⚠️ nenhuma outra transversal com resultado herda aprovada/reprovada (vocabulário próprio)",
    outras.length >= 3 && outras.every((id) => Array.isArray(V17?.[id]) && !V17[id].includes("Aprovada") && !V17[id].includes("Reprovada") && !igual(V17[id], V17.degluticao)),
    `⛔ ${outras.map((id) => `${id}=${JSON.stringify(V17?.[id])}`).join(" · ")}`);
  const campos = CP?.CAMPOS_DE_RESULTADO_DO_PLANO ?? [];
  conf("… cada campo de resultado oferece o vocabulário da SUA tarefa",
    campos.filter((c) => CP.TAREFA_DO_RESULTADO[c.id] !== "hemorragia_caminho_proprio").every((c) => igual(c.opcoes, V17?.[CP.TAREFA_DO_RESULTADO[c.id]])),
    `⛔ ${campos.map((c) => `${c.id}=${JSON.stringify(c.opcoes)}`).join(" · ")}`);
  const crit = (CP?.TAREFAS_TRANSVERSAIS ?? []).filter((t) => outras.includes(t.id)).map((t) => t.criterioDeConclusao);
  conf("… critério das outras transversais ⛔ fala em aprovada/reprovada", crit.length >= 3 && crit.every((c) => !/aprovad|reprovad/i.test(c)), `⛔ ${crit.join(" | ")}`);

  const { rel, e } = estadoComTc("Sem hemorragia intracraniana identificada");
  const comEvt = E.registrarFato(e, { campo: "evt_fim", valor: T0, horaClinica: T0 }, rel);
  const estadoDa = (x, id) => tenta(() => P.planoAte48h(x, T0 + MIN).transversais.find((t) => t.id === id)?.estado, "erro");
  const com = (campo, rotulo) => E.registrarFato(comEvt, { campo, valor: CAMPO.valorDaOpcao(rotulo) }, rel);
  conf("mobilização «Realizada» conclui", estadoDa(com("plano_mobilizacao", "Realizada"), "mobilizacao") === "concluida", `⛔ ${estadoDa(com("plano_mobilizacao", "Realizada"), "mobilizacao")}`);
  conf("… «Contraindicada no momento» ⛔ conclui (retida)", estadoDa(com("plano_mobilizacao", "Contraindicada no momento"), "mobilizacao") === "retida", `⛔ ${estadoDa(com("plano_mobilizacao", "Contraindicada no momento"), "mobilizacao")}`);
  conf("… «Não realizada» ⛔ «Não sei» ficam pendentes", ["Não realizada", "Não sei"].every((r) => estadoDa(com("plano_mobilizacao", r), "mobilizacao") === "pendente"), "⛔");
  conf("… um «Aprovada» fora do vocabulário da mobilização ⛔ conclui", estadoDa(com("plano_mobilizacao", "Aprovada"), "mobilizacao") !== "concluida", "⛔ vocabulário da deglutição concluiu a mobilização");

  const trava = (x) => tenta(() => P.travaDeViaOral(x)?.motivo, "erro");
  conf("⚠️ trava de via oral: resultado da mobilização ⛔ muda a trava", trava(com("plano_mobilizacao", "Realizada")) === "sem_registro", `⛔ ${trava(com("plano_mobilizacao", "Realizada"))}`);
  conf("… deglutição «Aprovada» tira a trava; «Reprovada» a mantém", trava(com("plano_degluticao", "Aprovada")) === undefined && trava(com("plano_degluticao", "Reprovada")) === "reprovada", "⛔");
  const nucleo = lerFonte(arq("avc", "nucleo", "plano-48h.ts"));
  const corpo = nucleo.slice(nucleo.indexOf("export function travaDeViaOral"), nucleo.indexOf("\n}", nucleo.indexOf("export function travaDeViaOral")));
  const lidos = [...corpo.matchAll(/resultadoDaTarefa\(estado,\s*"([a-z_]+)"\)/g)].map((m) => m[1]);
  conf("… a trava lê SÓ a deglutição", igual(lidos, ["degluticao"]) && !/mobilizacao|"tev"|dispositivos/.test(corpo), `⛔ ${lidos}`);
  const doc = fs.readFileSync(arq("docs", "avc", "revisao", "plano-48h.md"), "utf8");
  conf("… o vocabulário proposto das demais transversais está registrado no pacote de revisão", /AC-106/.test(doc) && outras.every((id) => (V17?.[id] ?? []).every((r) => doc.includes(r.toLowerCase()) || doc.includes(r))), "⛔ proposta sem registro");
}

/* ══ 2 · AC-107 · PENDENTE COM NOME ════════════════════════════════════════ */
{
  /**
   * ⚠️ Ajuste de instrumento (17ª rodada, depois da implementação): a identificação é medida pelas PARTES
   * (`partesDaIdentificacao`). A frase montada no conteúdo foi reprovada pela trava `test:frase-composta` (D-19):
   * a tela compõe as partes com `tr()`. ⚠️ O que se mede é o mesmo — tema, população ⛔ unicidade.
   */
  conf("existe a identificação única do item (tema ⛔ população)", typeof V?.partesDaIdentificacao === "function", "⛔ ausente");
  if (typeof V?.partesDaIdentificacao === "function" && HIC && HSA) {
    const cat = [...HIC.TEMAS_HIC.map((t) => ["hic", t]), ...HSA.TEMAS_HSA.map((t) => ["hsa", t])]
      .flatMap(([variante, t]) => t.recomendacoes.map((r) => ({ variante, t, r, p: tenta(() => V.partesDaIdentificacao(r, t.titulo, variante), {}) })));
    for (const x of cat) x.id = `${x.p.tema} · ${x.p.variante} · ${x.p.ordem}/${x.p.total}${x.p.populacao ? ` · ${x.p.populacao}` : ""}`;
    conf("todo item do catálogo tem identificação com o tema", cat.length > 0 && cat.every((x) => x.p.tema === x.t.titulo && x.p.ordem >= 1 && x.p.ordem <= x.p.total), `⛔ ${cat.filter((x) => x.p.tema !== x.t.titulo).map((x) => x.r.id).join(", ")}`);
    conf("… com a população quando houver", cat.filter((x) => x.r.populacao).every((x) => x.p.populacao === x.r.populacao), "⛔ população omitida");
    const porTema = new Map();
    for (const x of cat) porTema.set(`${x.variante}|${x.id}`, (porTema.get(`${x.variante}|${x.id}`) ?? 0) + 1);
    conf("⚠️ dois itens do mesmo catálogo ⛔ têm a mesma identificação (cartões consecutivos distinguíveis)", [...porTema.values()].every((n) => n === 1),
      `⛔ ${[...porTema.entries()].filter(([, n]) => n > 1).map(([k, n]) => `${k}×${n}`).slice(0, 4).join(" · ")}`);
    const cam = ["reversao_anticoagulante", "alvo_pressorico", "indicacao_cirurgica"].flatMap((c) => tenta(() => V.itensDaConduta(c, undefined), []));
    conf("… o caminho hemorrágico usa a mesma identificação (esquema de reversão: o agente)", cam.length > 0 && cam.every((x) => ("agente" in x.item && x.item.agente) || (x.partes && x.partes.tema === x.tituloDoTema)), "⛔ item do caminho sem identificação");
  }
  const sozinho = /<Text[^>]*>\s*\{\s*tr\("conteúdo pendente de validação"\)\s*\}\s*<\/Text>|:\s*tr\("conteúdo pendente de validação"\)\s*\}/;
  const achados = telas.filter((n) => sozinho.test(lerFonte(arq("components", "avc", n))));
  conf("⚠️ nenhuma tela desenha «conteúdo pendente de validação» como texto único", achados.length === 0, `⛔ ${achados.join(", ")}`);
}

/* ══ 3 · AC-108 · SEM INGLÊS VISÍVEL ═══════════════════════════════════════ */
{
  const fora = [];
  for (const nome of telas) {
    const txt = lerFonte(arq("components", "avc", nome));
    for (const m of txt.matchAll(/\{[^{}]*?(\.verbatim|\.verbo|CITACAO_[A-Z]+|\bcitacao)\b[^{}]*\}/g)) {
      if (/^\{\s*(const|let)\b/.test(m[0]) || /[=:]\s*$/.test(txt.slice(Math.max(0, m.index - 3), m.index))) continue;
      if (/^\s*from\b/.test(txt.slice(m.index + m[0].length))) continue;
      if (dentroDoInfo(txt.slice(0, m.index))) continue;
      fora.push(`${nome}: ${m[0].slice(0, 60)}`);
    }
  }
  conf("⚠️ nenhuma tela desenha verbatim, verbo da fonte ⛔ citação fora do ⓘ", fora.length === 0, `⛔ ${fora.join(" · ")}`);
  const g = lerFonte(arq("components", "avc", "superficie-g.tsx"));
  conf("… o Destino mostra a força traduzida da recomendação", /rotuloDaForca\(|rotuloDaClasse\(/.test(g), "⛔ sem força traduzida");
  const spec = lerFonte(arq("e2e", "avc-procedencia-fora-do-card.spec.ts"));
  conf("a trava e2e de texto visível procura inglês (conteúdo, ⛔ só chave) em pt-BR ⛔ em es",
    /const INGLES = \//.test(spec) && /es-419/.test(spec) && /inglesVisivel\(/.test(spec), "⛔ trava de idioma só por chave");
  conf("… ⛔ o pendente sem nome (trava genérica)", /pendenteSemNome\(/.test(spec), "⛔ sem trava genérica do AC-107");
}

/* ══ 4 · AC-109 · MOTIVOS POR TERAPIA ══════════════════════════════════════ */
{
  const c = (id) => (CP?.CAMPOS_DE_DESFECHO ?? []).find((x) => x.id === id)?.opcoes ?? [];
  const ivt = c("ivt_nao_prosseguir_motivo");
  const evt = c("evt_desfecho_motivo");
  conf("⚠️ trombólise: ⛔ «Centro de referência recusou» ⛔ «Indisponível»", ivt.length > 0 && !ivt.includes("Centro de referência recusou") && !ivt.includes("Indisponível"), `⛔ ${ivt.join(" · ")}`);
  conf("… trombectomia mantém os dois", evt.includes("Centro de referência recusou") && evt.includes("Indisponível"), `⛔ ${evt.join(" · ")}`);
  conf("… a decisão global cabe nas duas listas", (CP?.MOTIVOS_DA_DECISAO_GLOBAL ?? []).every((m) => ivt.includes(m) && evt.includes(m)), "⛔ decisão global sem opção");
}

/* ══ 5 · AC-110 · UM NOME ══════════════════════════════════════════════════ */
{
  const NOME = "Hemorragia intracraniana (HIC)";
  conf("a aba (registro de superfícies) diz «Hemorragia intracraniana (HIC)»", SUP?.SUPERFICIES?.find((s) => s.id === "hic")?.titulo === NOME, `⛔ ${SUP?.SUPERFICIES?.find((s) => s.id === "hic")?.titulo}`);
  const tela = lerFonte(arq("components", "avc", "avc-modulo-screen.tsx"));
  conf("… o cabeçalho (catálogo ⛔ caminho) usa o mesmo nome", tela.includes(`hic: "${NOME}"`) && !/"Hemorragia intracraniana"\s*:/.test(tela) && !/\?\s*"Hemorragia intracraniana"\s*:/.test(tela), "⛔ dois nomes no cabeçalho");
  conf("… o bloco do caminho ⛔ o plano usam o mesmo nome",
    lerFonte(arq("components", "avc", "caminho-hemorragico.tsx")).includes(`tr("${NOME}")`) && CP?.TITULO_DO_CAMINHO?.hemorragia === NOME, `⛔ plano: ${CP?.TITULO_DO_CAMINHO?.hemorragia}`);
  const { e } = estadoComTc("Hemorragia intracraniana identificada");
  const geral = tenta(() => PA.pendenciasDoCaso(e).filter((p) => /^hem_/.test(p.id)).map((p) => p.rotulo), []);
  conf("… a pendência na lista geral começa pelo mesmo nome", geral.length > 0 && geral.every((r) => r.startsWith(`${NOME}:`)), `⛔ ${geral.join(" | ")}`);
  const sintese = lerFonte(arq("avc", "nucleo", "sintese-do-caso.ts"));
  conf("… a síntese usa o mesmo nome", sintese.includes(NOME) && !/hemorragia intracerebral"/.test(sintese), "⛔ síntese com outro nome");
  const velhos = [...telas.map((n) => ["components/avc/" + n, lerFonte(arq("components", "avc", n))]),
    ...fs.readdirSync(arq("avc", "conteudo")).filter((f) => f.endsWith(".ts")).map((n) => ["avc/conteudo/" + n, lerFonte(arq("avc", "conteudo", n))])]
    .filter(([, t]) => /AVC hemorrágico/.test(t)).map(([n]) => n);
  conf("⚠️ ⛔ «AVC hemorrágico» em código de tela ⛔ conteúdo", velhos.length === 0, `⛔ ${velhos.join(", ")}`);
}

/* ══ 6 · AC-111 · DECLARAÇÃO DA EQUIPE ═════════════════════════════════════ */
{
  const campo = (CP?.CAMPOS_DE_RESULTADO_DO_PLANO ?? []).find((c) => c.id === "plano_hemorragia_revisada");
  const tarefa = (CP?.TAREFAS_DO_CAMINHO?.hemorragia ?? []).find((t) => t.id === "hemorragia_caminho_proprio");
  conf("⚠️ o rótulo do marco diz que é declaração da equipe", /declara/i.test(campo?.rotulo ?? ""), `⛔ ${campo?.rotulo}`);
  conf("… ⛔ o critério também (o app ⛔ confere o conteúdo revisado)", /declara/i.test(tarefa?.criterioDeConclusao ?? ""), `⛔ ${tarefa?.criterioDeConclusao}`);
}

console.log(`\nprova-avc-rodada17: ${ok} ok · ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
