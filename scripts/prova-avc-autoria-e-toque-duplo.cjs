#!/usr/bin/env node
/**
 * PROVA · AUTORIA DO EVENTO (AC-40) E TOQUE DUPLO NO REGISTRO (A17 generalizado).
 *
 * (a) AC-40 — o autor de cada evento é o `user.id` da sessão Supabase quando ela
 *     existe; o ID do aparelho é só o recurso de quem ⛔ não tem sessão, ⛔ e fica
 *     MARCADO como tal no evento (`origemDoAutor`) ⛔ e na linha do tempo.
 *
 * (b) Toque duplo — a proteção deixa de morar só em `abrirNovaInstancia` e passa
 *     para o registro: um gesto que repete o gesto imediatamente anterior, ⛔ sem
 *     nada registrado entre os dois, ⛔ não acrescenta fato. Provado com ações
 *     diferentes (Glasgow pela calculadora, "Registrar ação", desfazer).
 *     ⛔ Sem janela de tempo: a regra ⛔ não lê relógio.
 *
 * Gesto real: `e2e/avc-autoria-e-toque-duplo.spec.ts`.
 *
 * PROMETE: que o autor de cada evento é o `user.id` da sessão Supabase quando ela
 * existe; que sem sessão o autor é o ID do aparelho, marcado `origemDoAutor =
 * aparelho`, e que sessão anônima é marcada à parte; que o schema sobe para 3 com
 * migração v1/v2 → v3 sem inventar autor; que a linha do tempo (histórico da A) e
 * a leitura da correção (Laboratório, Imagem) mostram a marca; que um gesto que
 * repete o imediatamente anterior, sem nada registrado entre os dois, ⛔ não
 * acrescenta fato — Glasgow pela calculadora, «Registrar ação» antes e depois de
 * a tela redesenhar, desfazer e «Registrar administração» —; que gestos
 * legítimos continuam registrando; e que o hook aplica a regra a toda mudança de
 * estado.
 * NÃO PROMETE: sessão Supabase real (aqui o cliente é falso, e o `dist` das provas
 * não tem backend); identidade de quem está com o aparelho na mão; sincronização;
 * nem que tocar de novo numa opção marcada seja protegido (isso desfaz, por
 * desenho). A ligação com as telas é conferida por leitura de fonte sem
 * comentário, ⛔ não por renderização.
 * UNIVERSO: `avc/persistencia/{autoria,tipos,log,armazenamento-memoria}.ts`,
 * `avc/nucleo/toque-duplo.ts`, `components/avc/use-atendimento-persistido.ts`,
 * `components/avc/{superficie-a,campos-clinicos}.tsx`, `components/avc/ui/index.tsx`.
 * FONTE: pedido do autor de 2026-09-13 (Entrega 2 · AC-40 e toque duplo);
 * `docs/avc/persistencia.md`.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "autoria-toque-"));
const alvos = [
  ["avc", "persistencia", "tipos.ts"],
  ["avc", "persistencia", "log.ts"],
  ["avc", "persistencia", "armazenamento-memoria.ts"],
  ["avc", "persistencia", "autoria.ts"],
  ["avc", "nucleo", "estado.ts"],
  ["avc", "nucleo", "relogio.ts"],
  ["avc", "nucleo", "instancia.ts"],
  ["avc", "nucleo", "toque-duplo.ts"],
  ["avc", "conteudo", "campos.ts"],
  ["avc", "conteudo", "campo.ts"],
  ["avc", "conteudo", "glasgow.ts"],
  ["avc", "conteudo", "superficie-e.ts"],
  ["avc", "conteudo", "superficie-f.ts"],
].map((p) => path.join(appDir, ...p)).filter((p) => fs.existsSync(p));
execFileSync(
  "npx",
  ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp, ...alvos],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
function carregar(nome, ...p) {
  try { return emT(...p); } catch (e) {
    conf(`${nome} existe`, false, `⛔ ${String(e && e.message).slice(0, 120)}`);
    return undefined;
  }
}
const fonte = (...p) => lerFonte(path.join(appDir, ...p));

const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const I = emT("avc", "nucleo", "instancia.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");
const G = emT("avc", "conteudo", "glasgow.js");
const SE = emT("avc", "conteudo", "superficie-e.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const T = emT("avc", "persistencia", "tipos.js");
const LOG = emT("avc", "persistencia", "log.js");
const MEM = emT("avc", "persistencia", "armazenamento-memoria.js");
const AUT = carregar("avc/persistencia/autoria.ts", "avc", "persistencia", "autoria.js");
const TD = carregar("avc/nucleo/toque-duplo.ts", "avc", "nucleo", "toque-duplo.js");

(async () => {
  const T0 = 1_800_000_000_000;
  const rel = R.relogioControlado(T0);
  let idN = 0;
  const gerarId = () => `ev-${++idN}`;

  /* ══ (a) AC-40 · quem é o autor ══════════════════════════════════════════ */
  if (AUT) {
    const comConta = AUT.autoriaDoEvento({ userId: "u-123", anonima: false }, "local:aparelho-1");
    conf("autoria · sessão Supabase com conta → autor é o `user.id`, origem «sessao»",
      comConta.autor === "u-123" && comConta.origemDoAutor === "sessao", `⛔ ${JSON.stringify(comConta)}`);
    const semSessao = AUT.autoriaDoEvento(undefined, "local:aparelho-1");
    conf("autoria · sem sessão → ID do aparelho, ⛔ marcado como «aparelho»",
      semSessao.autor === "local:aparelho-1" && semSessao.origemDoAutor === "aparelho", `⛔ ${JSON.stringify(semSessao)}`);
    const anonima = AUT.autoriaDoEvento({ userId: "anon-9", anonima: true }, "local:aparelho-1");
    conf("autoria · sessão anônima → `user.id`, ⛔ marcada como «sessao_anonima» (⛔ não é conta)",
      anonima.autor === "anon-9" && anonima.origemDoAutor === "sessao_anonima", `⛔ ${JSON.stringify(anonima)}`);

    const cliente = (resposta) => ({ auth: { getSession: async () => resposta } });
    const lida = await AUT.lerSessaoParaAutoria(cliente({ data: { session: { user: { id: "u-123" } } } }));
    conf("sessão · cliente com sessão → `user.id` lido", lida !== undefined && lida.userId === "u-123" && lida.anonima === false, `⛔ ${JSON.stringify(lida)}`);
    const lidaAnon = await AUT.lerSessaoParaAutoria(cliente({ data: { session: { user: { id: "anon-9", is_anonymous: true } } } }));
    conf("sessão · usuário anônimo é lido como anônimo", lidaAnon !== undefined && lidaAnon.anonima === true, `⛔ ${JSON.stringify(lidaAnon)}`);
    conf("sessão · sem sessão → nenhuma", (await AUT.lerSessaoParaAutoria(cliente({ data: { session: null } }))) === undefined, "⛔");
    conf("sessão · sem cliente Supabase configurado → nenhuma", (await AUT.lerSessaoParaAutoria(null)) === undefined, "⛔");
    const quebrado = { auth: { getSession: async () => { throw new Error("offline"); } } };
    conf("sessão · falha ao ler a sessão ⛔ não derruba: cai no aparelho", (await AUT.lerSessaoParaAutoria(quebrado)) === undefined, "⛔");

    conf("linha do tempo · o recurso do aparelho tem marca visível",
      /aparelho/.test(String(AUT.marcaDeAutoria(semSessao))) && /sem conta/.test(String(AUT.marcaDeAutoria(semSessao))),
      `⛔ ${AUT.marcaDeAutoria(semSessao)}`);
    conf("linha do tempo · sessão anônima tem marca visível", typeof AUT.marcaDeAutoria(anonima) === "string", `⛔ ${AUT.marcaDeAutoria(anonima)}`);
    conf("linha do tempo · autor de conta ⛔ não ganha marca de recurso", AUT.marcaDeAutoria(comConta) === undefined, `⛔ ${AUT.marcaDeAutoria(comConta)}`);
  }

  /* ══ (a) o evento carrega autor ⛔ e origem ═══════════════════════════════ */
  {
    const e0 = E.abrirAtendimento(rel);
    const e1 = E.registrarFato(e0, { campo: "peso", valor: 70 }, rel);
    const comConta = { autor: "u-123", origemDoAutor: "sessao" };
    const ctx = (autoria) => ({ casoId: "caso-a", ...autoria, autoria, agora: rel.agora(), gerarId });
    const evs = LOG.eventosDaTransicao(e0, e1, ctx(comConta));
    conf("evento · com sessão, todo evento leva `autor = user.id` ⛔ e `origemDoAutor = sessao`",
      evs.length > 0 && evs.every((e) => e.autor === "u-123" && e.origemDoAutor === "sessao"), `⛔ ${JSON.stringify(evs.map((e) => [e.autor, e.origemDoAutor]))}`);
    const evsAp = LOG.eventosDaTransicao(e0, e1, ctx({ autor: "local:aparelho-1", origemDoAutor: "aparelho" }));
    conf("evento · sem sessão, o evento leva o ID do aparelho ⛔ marcado `origemDoAutor = aparelho`",
      evsAp.every((e) => e.autor === "local:aparelho-1" && e.origemDoAutor === "aparelho"), `⛔ ${JSON.stringify(evsAp.map((e) => [e.autor, e.origemDoAutor]))}`);

    conf("schema · a origem do autor sobe o schema para 3", T.VERSAO_DO_SCHEMA === 3, `⛔ ${T.VERSAO_DO_SCHEMA}`);
    const migrar = T.migrarEvento ?? T.migrarEventoDeV1;
    const v2 = { id: "v2-a", casoId: "caso-v2", seq: 1, tipo: "fato", registradoEm: T0, observadoEm: null, autor: "local:antigo", versaoDoSchema: 2, dados: { fato: { id: "f1", campo: "peso", valor: 70, horaRegistro: T0 } } };
    const m2 = migrar(v2);
    conf("v2 → v3 · autor `local:` gravado pelo v2 vira origem «aparelho», ⛔ nada inventado",
      m2.versaoDoSchema === 3 && m2.origemDoAutor === "aparelho" && m2.autor === "local:antigo" && JSON.stringify(m2.dados) === JSON.stringify(v2.dados),
      `⛔ ${JSON.stringify(m2)}`);
    const v1 = { id: "v1-a", casoId: "caso-v1", seq: 1, tipo: "fato", registradoEm: T0, dados: { fato: { id: "f1", campo: "peso", valor: 70, horaRegistro: T0 } } };
    const m1 = migrar(v1);
    conf("v1 → v3 · evento sem autor fica «nao_registrado»", m1.versaoDoSchema === 3 && m1.origemDoAutor === "nao_registrado", `⛔ ${JSON.stringify(m1)}`);
    const arm = MEM.criarArmazenamentoEmMemoria({ dumpAnterior: { casos: [{ casoId: "caso-v2", abertoEm: T0, encerradoEm: null }], eventos: [v2] } });
    const lidos = await arm.lerEventos("caso-v2");
    conf("v2 → v3 · o armazenamento devolve o dump v2 já migrado", lidos.length === 1 && lidos[0].origemDoAutor === "aparelho", `⛔ ${JSON.stringify(lidos)}`);
  }

  /* ══ (a) ligação: a sessão chega ao hook ⛔ e a marca chega à tela ════════ */
  {
    const hook = fonte("components", "avc", "use-atendimento-persistido.ts");
    conf("hook · lê a sessão Supabase para a autoria", /lerSessaoParaAutoria\(/.test(hook) && /autoriaDoEvento\(/.test(hook), "⛔ use-atendimento-persistido não lê a sessão");
    for (const arq of ["superficie-a.tsx", "campos-clinicos.tsx", path.join("ui", "index.tsx")]) {
      const t = fonte("components", "avc", arq);
      conf(`linha do tempo · ${arq} mostra a marca de autoria`, /marcaDeAutoria\(/.test(t), `⛔ ${arq} não mostra autoria`);
    }
  }

  /* ══ (b) toque duplo no registro ═════════════════════════════════════════ */
  if (TD) {
    const gesto = (e, atualizar) => { const p = atualizar(e); return TD.repeteOGestoAnterior(e, p) ? e : p; };
    const fatos = (e, campo) => e.fatos.filter((f) => f.campo === campo);

    const glasgow = (e) => {
      let p = e;
      for (const [item, ponto] of Object.entries({ e: 3, v: 4, m: 5 })) p = E.registrarFato(p, { campo: G.CAMPO_DE_ITEM_GLASGOW(item), valor: ponto }, rel);
      p = E.registrarFato(p, { campo: "glasgow", valor: 12 }, rel);
      return E.registrarFato(p, { campo: G.CAMPO_DA_ORIGEM_DO_GLASGOW, valor: G.ORIGEM_DO_GLASGOW.calculado }, rel);
    };
    const base = E.abrirAtendimento(rel);
    const g1 = gesto(base, glasgow);
    const g2 = gesto(g1, glasgow);
    conf("toque duplo · Glasgow pela calculadora duas vezes → UM registro (5 fatos, ⛔ não 10)",
      g2 === g1 && fatos(g2, "glasgow").length === 1 && g2.fatos.length === 5, `⛔ ${g2.fatos.length} fatos`);

    const novaAcao = (instancia) => (e) => CAMPOS.registrarComInstancia(e, { campo: "acao_tipo", valor: "Anti-hipertensivo" }, rel, instancia);
    const a1 = gesto(base, novaAcao(I.proximaInstancia(base, SE.ACAO)));
    const aVelha = gesto(a1, novaAcao(I.proximaInstancia(base, SE.ACAO)));
    conf("toque duplo · «Registrar ação» antes da tela redesenhar → UMA ação", I.instanciasDe(aVelha, SE.ACAO).length === 1, `⛔ ${I.instanciasDe(aVelha, SE.ACAO).length}`);
    const aNova = gesto(a1, novaAcao(I.proximaInstancia(a1, SE.ACAO)));
    conf("toque duplo · «Registrar ação» depois de redesenhar → ⛔ ainda UMA ação", I.instanciasDe(aNova, SE.ACAO).length === 1, `⛔ ${I.instanciasDe(aNova, SE.ACAO).length}`);

    const comPeso = E.registrarFato(base, { campo: "peso", valor: 70 }, rel);
    const desfazer = (e) => CAMPOS.corrigirNaInstancia(e, { campo: "peso", valor: "nao_perguntado" }, rel);
    const d1 = gesto(comPeso, desfazer);
    const d2 = gesto(d1, desfazer);
    conf("toque duplo · desfazer duas vezes → UMA correção", d2.fatos.filter((f) => f.tipo === "correcao").length === 1, `⛔ ${d2.fatos.filter((f) => f.tipo === "correcao").length}`);

    const t1 = gesto(base, (e) => I.abrirNovaInstancia(e, SF.TROMBOLISE_IV, rel));
    const t2 = gesto(t1, (e) => I.abrirNovaInstancia(e, SF.TROMBOLISE_IV, rel));
    conf("toque duplo · «Registrar administração» duas vezes → UMA trombólise", I.instanciasDe(t2, SF.TROMBOLISE_IV).length === 1, "⛔");

    rel.avancar?.(10 * 60_000);
    const gTarde = gesto(g1, glasgow);
    conf("sem janela de tempo · a repetição imediata é a mesma com 10 min no relógio (⛔ a regra não lê relógio)", gTarde === g1, "⛔");

    /* controles: o que ⛔ não é toque duplo continua registrando */
    const entre = gesto(E.registrarFato(g1, { campo: "peso", valor: 70 }, rel), glasgow);
    conf("controle · Glasgow repetido DEPOIS de outro registro → registra", fatos(entre, "glasgow").length === 2, `⛔ ${fatos(entre, "glasgow").length}`);
    const preenchida = CAMPOS.registrarComInstancia(a1, { campo: "acao_estado", valor: "realizada" }, rel, I.instanciasDe(a1, SE.ACAO)[0]);
    const segunda = gesto(preenchida, novaAcao(I.proximaInstancia(preenchida, SE.ACAO)));
    conf("controle · segunda ação depois de preencher a primeira → registra", I.instanciasDe(segunda, SE.ACAO).length === 2, `⛔ ${I.instanciasDe(segunda, SE.ACAO).length}`);
    const outroValor = gesto(E.registrarFato(base, { campo: "peso", valor: 70 }, rel), (e) => E.registrarFato(e, { campo: "peso", valor: 72 }, rel));
    conf("controle · mesmo campo com OUTRO valor → registra", fatos(outroValor, "peso").length === 2, "⛔");
    conf("controle · gesto que ⛔ não acrescenta fato (superfície vista) ⛔ não é tratado como repetição", TD.repeteOGestoAnterior(base, E.verSuperficie(base, "imagem")) === false, "⛔");
  }
  {
    const hook = fonte("components", "avc", "use-atendimento-persistido.ts");
    conf("registro · o hook aplica a regra a TODA mudança de estado (`repeteOGestoAnterior`)", /repeteOGestoAnterior\(/.test(hook), "⛔ a proteção não está no registro");
  }

  console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · AUTORIA DO EVENTO E TOQUE DUPLO — ${ok} verde(s) · ${falhas} vermelho(s)`);
  process.exit(falhas === 0 ? 0 : 1);
})();
