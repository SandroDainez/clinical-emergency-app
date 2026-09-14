#!/usr/bin/env node
/**
 * PROVA · 16ª RODADA DO AVC — procedência fora do card em TODAS as superfícies, uma fonte de
 * verdade para as condutas de hemorragia (AC-95), "Centro de referência recusou" (AC-98),
 * pendência de sedação não registrada (AC-91), trava de via oral pelo caminho definido
 * (AC-92) ⛔ textos (plural, concordância, prefixo). Decisões do autor, 2026-09-13
 * (`docs/decisoes.md`, 16ª rodada).
 *
 * PROMETE:
 *  · Procedência: nenhuma tela do AVC (`components/avc/*.tsx`, TODOS os arquivos) renderiza
 *    "Fonte", "Conclusão", "Fonte candidata" ⛔ ou "slot" fora de um bloco de ajuda (ⓘ); a
 *    trava e2e da 8ª rodada cobre toda superfície do registro (`SUPERFICIES`), ⛔ uma lista.
 *  · AC-95: cada item do catálogo HIC/HSA tem UM estado de validação (`validacaoDoItem`):
 *    recomendação formal (COR+LOE, com população como contexto da fonte) ⛔ ou pendente (sem
 *    contexto; doses da figura 2); o catálogo ⛔ o caminho hemorrágico consomem a mesma função.
 *  · AC-98: "Recusada" → "Centro de referência recusou".
 *  · AC-91: via aérea avançada, sedação não registrada ⛔ exame → pendência "Sedação não
 *    registrada — informe para liberar o exame como basal".
 *  · AC-92: a trava de via oral vale com o caminho definido pela imagem (com ⛔ sem hemorragia),
 *    sem depender do plano de 48 h; antes do laudo, ⛔ há trava.
 *  · Textos: plural por contagem; "Terapia antitrombótica: retida…"; pendências do caminho
 *    hemorrágico sem o prefixo dentro do próprio caminho.
 * NÃO PROMETE: o gesto a 375 px ⛔ o texto visível renderizado (isso é
 *   `e2e/avc-procedencia-fora-do-card.spec.ts` ⛔ `e2e/avc-rodada16.spec.ts`); ⛔ valida conteúdo
 *   clínico — ⛔ há dose, alvo ⛔ ou indicação nova.
 * UNIVERSO: `components/avc/*.tsx`, `avc/conteudo/{hemorragia-intracerebral,
 *   hemorragia-subaracnoidea,validacao-do-catalogo,caminho-hemorragico,plano-48h,superficies}.ts`,
 *   `avc/nucleo/{via-aerea-externa,plano-48h,caminho-hemorragico}.ts`,
 *   `e2e/avc-procedencia-fora-do-card.spec.ts`.
 * FONTE: `docs/decisoes.md` — 16ª rodada; `docs/spec-avc.md` §12 (contrato de uma regra).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rodada16-"));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
const arq = (...p) => path.join(appDir, ...p);
const fontes = [arq("avc", "nucleo", "estado.ts"), arq("avc", "nucleo", "relogio.ts"), arq("avc", "nucleo", "via-aerea-externa.ts"),
  arq("avc", "nucleo", "plano-48h.ts"), arq("avc", "nucleo", "caminho-hemorragico.ts"), arq("avc", "nucleo", "instancia.ts"),
  arq("avc", "nucleo", "problemas-ativos.ts"), arq("avc", "conteudo", "campos.ts"), arq("avc", "conteudo", "campo.ts"),
  arq("avc", "conteudo", "superficie-c.ts"), arq("avc", "conteudo", "superficie-f.ts"), arq("avc", "conteudo", "plano-48h.ts"),
  arq("avc", "conteudo", "caminho-hemorragico.ts"), arq("avc", "conteudo", "superficies.ts"),
  arq("avc", "conteudo", "hemorragia-intracerebral.ts"), arq("avc", "conteudo", "hemorragia-subaracnoidea.ts")];
const validacao = arq("avc", "conteudo", "validacao-do-catalogo.ts");
if (fs.existsSync(validacao)) fontes.push(validacao);
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop", "--jsx", "react-jsx",
    "--moduleResolution", "node", "--skipLibCheck", "--resolveJsonModule", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => { try { return require(path.join(tmp, ...p)); } catch { return undefined; } };
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const VA = emT("avc", "nucleo", "via-aerea-externa.js");
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

/* ══ 1 · PROCEDÊNCIA FORA DO CARD — TODAS AS TELAS ════════════════════════ */
{
  const telas = fs.readdirSync(arq("components", "avc")).filter((f) => f.endsWith(".tsx"));
  conf("o universo são TODOS os .tsx do AVC (⛔ uma lista)", telas.length >= 20 && telas.includes("plano-48h.tsx") && telas.includes("caminho-hemorragico.tsx"), `⛔ ${telas.length}`);
  /**
   * ⚠️ Um rótulo de procedência só é permitido dentro de bloco de ajuda: função `Detalhe*`/`Info*`,
   * ⛔ ou entre a abertura de um ⓘ (`<Recolhido`, `<InfoDoCard`, `aberto ? (` de detalhe) ⛔ o fecho.
   * ⚠️ Heurística de fonte — a prova de verdade é o texto renderizado (e2e da 8ª rodada ampliado).
   */
  const ROTULOS = /tr\("(Fonte|Fonte candidata|Conclusão|slot|Slot)"\)/g;
  const fora = [];
  for (const nome of telas) {
    const txt = lerFonte(arq("components", "avc", nome));
    for (const m of txt.matchAll(ROTULOS)) {
      const antes = txt.slice(0, m.index);
      const funcao = [...antes.matchAll(/function\s+([A-Za-z0-9_]+)\s*\(/g)].pop()?.[1] ?? "";
      if (/^(Detalhe|Info)/.test(funcao)) continue;
      /**
       * ⚠️ Ajuste de instrumento (vermelho da 16ª rodada, antes de implementar): a primeira versão exigia
       * a janela terminar em `>` e ⛔ casava nunca. ⚠️ Agora: dentro de um `<Recolhido>`/`<InfoDoCard>`
       * ainda aberto, ⛔ ou num detalhe condicional (`… ? (` com testID `avc-detalhe-`/`-detalhe-${`).
       */
      const abre = (antes.match(/<(Recolhido|InfoDoCard)\b/g) ?? []).length;
      const fecha = (antes.match(/<\/(Recolhido|InfoDoCard)>/g) ?? []).length
        + (antes.match(/<(Recolhido|InfoDoCard)\b[^<>]*\/>/g) ?? []).length;
      if (abre - fecha > 0) continue;
      const janela = antes.slice(-1500);
      const detalhe = /\?\s*\(\s*<View[^>]*testID=\{?[`"](avc-detalhe-|[^`"]*-detalhe-)/.test(janela);
      if (detalhe) continue;
      fora.push(`${nome}: ${m[0]}`);
    }
  }
  conf("⚠️ nenhuma tela renderiza «Fonte», «Conclusão», «Fonte candidata» ⛔ «slot» fora do ⓘ", fora.length === 0, `⛔ ${fora.join(" · ")}`);

  const spec = lerFonte(arq("e2e", "avc-procedencia-fora-do-card.spec.ts"));
  conf("a trava e2e reprova «Fonte:», «Conclusão:», «a localizar», «não transcrita», «Fonte candidata» ⛔ «slot»",
    /Fonte\\s\*:|Fonte\\s\*\\:/.test(spec) || (/Fonte/.test(spec.match(/const PROIBIDAS = \/[^\n]*/)?.[0] ?? "") && /Conclus/.test(spec.match(/const PROIBIDAS = \/[^\n]*/)?.[0] ?? "")
      && /a localizar/.test(spec.match(/const PROIBIDAS = \/[^\n]*/)?.[0] ?? "") && /slot/.test(spec.match(/const PROIBIDAS = \/[^\n]*/)?.[0] ?? "")),
    `⛔ ${spec.match(/const PROIBIDAS = \/[^\n]*/)?.[0]}`);
  conf("a trava e2e percorre as abas da barra ⛔ de uma lista fixa", /\[data-testid\^="avc-aba-"\]/.test(spec) && !/for \(const aba of \["paciente"/.test(spec), "⛔ lista fixa de abas");
  const ids = (SUP?.SUPERFICIES ?? []).map((s) => s.id);
  const naBarra = new Set((SUP?.SEQUENCIA_OFICIAL ?? []).map((s) => s.id));
  const foraDaBarra = ids.filter((id) => !naBarra.has(id));
  conf("⚠️ toda superfície fora da barra é visitada pela trava e2e (cobertura pelo registro, ⛔ lista)",
    ids.length > 0 && foraDaBarra.every((id) => new RegExp(`superficie-${id}\\b|avc-superficie-${id}|visita\\("${id}"`).test(spec)),
    `⛔ sem visita: ${foraDaBarra.filter((id) => !new RegExp(`superficie-${id}\\b|avc-superficie-${id}|visita\\("${id}"`).test(spec)).join(", ")}`);
  conf("… ⛔ as telas das capturas (plano nos quatro caminhos ⛔ caminho hemorrágico) estão na trava",
    /avc-plano-48h/.test(spec) && /avc-hem-caminho/.test(spec) && /avc-f-decisao-global/.test(spec) && /evt_fim/.test(spec), "⛔ capturas fora da trava");
}

/* ══ 2 · AC-95 · UMA FONTE DE VERDADE ═════════════════════════════════════ */
conf("existe a validação única do catálogo", V?.validacaoDoItem !== undefined && V?.itensDaConduta !== undefined, "⛔ ausente");
if (V?.validacaoDoItem !== undefined && HIC && HSA) {
  const recsHic = HIC.TEMAS_HIC.flatMap((t) => t.recomendacoes);
  const recsHsa = HSA.TEMAS_HSA.flatMap((t) => t.recomendacoes);
  const todos = [...recsHic, ...recsHsa];
  const estados = todos.map((r) => V.validacaoDoItem(r));
  conf("cada recomendação tem UM estado: recomendacao_formal ⛔ pendente_de_validacao", estados.every((x) => x.estado === "recomendacao_formal" || x.estado === "pendente_de_validacao"), "⛔ estado fora do contrato");
  conf("formal = COR+LOE ⛔ população (contexto da fonte), com fonte (slot ⛔ localização)",
    todos.every((r, i) => (estados[i].estado === "recomendacao_formal") === (Boolean(r.cor && r.loe) && Boolean(r.populacao)))
      && estados.filter((x) => x.estado === "recomendacao_formal").every((x) => x.forca === "recomendacao_formal" && x.contextoDaFonte && x.fonte),
    "⛔ regra divergente");
  const pa = V.validacaoDoItem(recsHic.find((r) => r.id === "pa_alvo"));
  const tit = V.validacaoDoItem(recsHic.find((r) => r.id === "pa_titulacao"));
  conf("pa_alvo (com população) é formal; pa_titulacao (sem população) é pendente", pa.estado === "recomendacao_formal" && tit.estado === "pendente_de_validacao", `⛔ ${pa.estado} · ${tit.estado}`);
  conf("⚠️ doses da figura 2 (reversão por agente, ⛔ graduadas) → pendentes", HIC.REVERSAO_POR_AGENTE.every((r) => V.validacaoDoItem(r).estado === "pendente_de_validacao"), "⛔ esquema de reversão formal");
  const cam = (tipo) => tenta(() => V.itensDaConduta("alvo_pressorico", tipo), []);
  conf("o caminho consome os MESMOS itens do catálogo, com o mesmo estado (alvo pressórico · HIC)",
    cam("Intraparenquimatosa").length > 0 && cam("Intraparenquimatosa").every((x) => x.variante === "hic" && x.validacao.estado === V.validacaoDoItem(x.item).estado),
    `⛔ ${JSON.stringify(cam("Intraparenquimatosa").map((x) => [x.item.id, x.validacao.estado]))}`);
  conf("… subaracnóidea usa o catálogo da HSA; tipo não registrado usa os dois; subdural ⛔ tem item no catálogo",
    cam("Subaracnóidea").every((x) => x.variante === "hsa") && new Set(cam(undefined).map((x) => x.variante)).size === 2 && cam("Subdural").length === 0,
    `⛔ ${cam("Subdural").length}`);
  const telaCat = lerFonte(arq("components", "avc", "superficie-hemorragica.tsx"));
  const telaCam = lerFonte(arq("components", "avc", "caminho-hemorragico.tsx"));
  conf("⚠️ catálogo ⛔ caminho chamam a mesma função de validação", /validacaoDoItem\(/.test(telaCat) && (/itensDaConduta\(/.test(telaCam) || /validacaoDoItem\(/.test(telaCam)), "⛔ duas fontes de estado");
  conf("⛔ o conteúdo do caminho ⛔ declara «pendente» por conta própria", !/conteudo:\s*"pendente_de_validacao"/.test(lerFonte(arq("avc", "conteudo", "caminho-hemorragico.ts"))), "⛔ estado próprio no caminho");
}

/* ══ 3 · AC-98 · AC-91 · AC-92 ════════════════════════════════════════════ */
{
  /** ⚠️ Ajuste consciente (17ª rodada, AC-109): motivos por terapia — o AC-98 vale na lista da trombectomia. */
  const motivos = CP?.MOTIVOS_DE_DESFECHO_NEGATIVO_EVT ?? [];
  conf("AC-98: «Recusada» vira «Centro de referência recusou»; «Recusa do paciente ou família» fica",
    motivos.includes("Centro de referência recusou") && !motivos.includes("Recusada") && motivos.includes("Recusa do paciente ou família"), `⛔ ${motivos}`);

  const pend = (sedacao, comExame) => tenta(() => {
    const rel = R.relogioControlado(T0);
    let e = VA.registrarViaAereaExterna(E.abrirAtendimento(rel), { avancada: "sim", tipo: "Intubação orotraqueal", observado: T0, ...(sedacao === undefined ? {} : { sedacao }) }, rel);
    rel.avancar(10 * MIN);
    if (comExame) e = E.registrarFato(e, { campo: "nihss_calculado", valor: 6 }, rel);
    return PA.pendenciasDoCaso(e).map((p) => [p.id, p.rotulo]);
  }, []);
  conf("AC-91: sedação NÃO registrada + exame → «Sedação não registrada — informe para liberar o exame como basal»",
    pend(undefined, true).some(([id, r]) => id === "informar_sedacao_va" && r === "Sedação não registrada — informe para liberar o exame como basal"), `⛔ ${JSON.stringify(pend(undefined, true))}`);
  conf("… ⛔ com sedação registrada (sim, não ⛔ não sei) ⛔ sem exame", ["sim", "nao", "nao_sei"].every((s) => !pend(s, true).some(([id]) => id === "informar_sedacao_va")) && !pend(undefined, false).some(([id]) => id === "informar_sedacao_va"), "⛔ pendência indevida");

  const rel = R.relogioControlado(T0);
  const tc = (resultado) => {
    const inst = I.nomeDaInstancia(SC.ESTUDO, 1);
    let x = K.registrarComInstancia(E.abrirAtendimento(rel), { campo: "estudo_modalidade", valor: CAMPO.valorDaOpcao("Tomografia de crânio sem contraste") }, rel, inst);
    x = K.registrarComInstancia(x, { campo: "estudo_hora", valor: T0 }, rel, inst);
    return resultado === undefined ? x : K.registrarComInstancia(x, { campo: "estudo_resultado", valor: CAMPO.valorDaOpcao(resultado) }, rel, inst);
  };
  const trava = (e) => tenta(() => P.travaDeViaOral(e), "erro");
  conf("⚠️ AC-92: TC sem hemorragia (caminho isquêmico), SEM plano aberto → trava de via oral",
    tenta(() => P.planoAte48h(tc("Sem hemorragia intracraniana identificada"), T0).caminhos.length, -1) === 0 && trava(tc("Sem hemorragia intracraniana identificada"))?.motivo === "sem_registro",
    `⛔ ${JSON.stringify(trava(tc("Sem hemorragia intracraniana identificada")))}`);
  conf("… TC com hemorragia (caminho hemorrágico) → trava", trava(tc("Hemorragia intracraniana identificada"))?.motivo === "sem_registro", "⛔");
  conf("… TC sem laudo ⛔ nada registrado → ⛔ caminho definido, ⛔ trava", trava(tc(undefined)) === undefined && trava(E.abrirAtendimento(rel)) === undefined, `⛔ ${JSON.stringify(trava(tc(undefined)))}`);
  conf("… aprovada tira a trava", trava(E.registrarFato(tc("Sem hemorragia intracraniana identificada"), { campo: "plano_degluticao", valor: "Aprovada" }, rel)) === undefined, "⛔");
}

/* ══ 4 · TEXTOS ═══════════════════════════════════════════════════════════ */
{
  const tela = lerFonte(arq("components", "avc", "avc-modulo-screen.tsx"));
  conf("plural por contagem: «1 registro» ⛔ «4 registros» (⛔ «registro(s)»)",
    !/registro\(s\)/.test(tela) && /"registro de conduta externa"/.test(tela) && /"registros de conduta externa"/.test(tela), "⛔ plural preguiçoso");
  const rot = [...(CP?.TAREFAS_DO_CAMINHO?.ivt ?? []), ...(CP?.TAREFAS_DO_CAMINHO?.hemorragia ?? [])].filter((t) => /antitromb/.test(t.id)).map((t) => t.rotulo);
  conf("concordância: tarefas antitrombóticas no feminino («Terapia antitrombótica: retida…»)",
    rot.length === 2 && rot.every((r) => /^Terapia antitrombótica: retida/.test(r)), `⛔ ${rot.join(" | ")}`);
  const rel = R.relogioControlado(T0);
  const inst = I.nomeDaInstancia(SC.ESTUDO, 1);
  let hem = K.registrarComInstancia(E.abrirAtendimento(rel), { campo: "estudo_modalidade", valor: CAMPO.valorDaOpcao("Tomografia de crânio sem contraste") }, rel, inst);
  hem = K.registrarComInstancia(hem, { campo: "estudo_hora", valor: T0 }, rel, inst);
  hem = K.registrarComInstancia(hem, { campo: "estudo_resultado", valor: CAMPO.valorDaOpcao("Hemorragia intracraniana identificada") }, rel, inst);
  const c = tenta(() => H.caminhoHemorragico(hem), {});
  conf("pendências DENTRO do caminho sem o prefixo «Caminho hemorrágico:»",
    Array.isArray(c.pendenciasNoCaminho) && c.pendenciasNoCaminho.length > 0 && c.pendenciasNoCaminho.every((p) => !/^Caminho hemorrágico:/.test(p.rotulo)),
    `⛔ ${JSON.stringify(c.pendenciasNoCaminho)}`);
  /** ⚠️ Ajuste consciente (17ª rodada, AC-110): o contexto é dito pelo nome único do caminho. */
  conf("… na lista geral do atendimento o contexto continua dito", PA.pendenciasDoCaso(hem).some((p) => /^Hemorragia intracraniana \(HIC\):/.test(p.rotulo)), "⛔ perdeu o contexto na lista geral");
  const telaCam = lerFonte(arq("components", "avc", "caminho-hemorragico.tsx"));
  conf("… a tela do caminho usa as pendências curtas", /pendenciasNoCaminho/.test(telaCam), "⛔ tela usa as longas");
}

console.log(`\nprova-avc-rodada16: ${ok} ok · ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
