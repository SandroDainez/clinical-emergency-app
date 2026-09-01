#!/usr/bin/env node
/**
 * PROMETE: que o módulo AVC funcione como **uma máquina só** — que todo fato
 *   consumido por uma derivação tenha casa, tenha forma real de ser registrado,
 *   seja gravado no formato que a derivação lê, e chegue à superfície que o usa.
 *
 * NÃO PROMETE: que a medicina esteja certa. ⛔ Isso é das provas de superfície.
 *   ⛔ Também ⛔ não prova que a tela seja legível — isso é revisão humana.
 *
 * UNIVERSO: **derivado do artefato** (D-15) — os campos de TODAS as superfícies,
 *   o registro do módulo, e as fontes de `avc/nucleo/derivacoes-*.ts` e
 *   `components/avc/*.tsx` lidas SEM COMENTÁRIO (R-92).
 *
 * ── ⚠️⚠️ POR QUE ESTA TRAVA EXISTE ──────────────────────────────────────────
 *
 * ⚠️ **O MESMO DEFEITO MORDEU TRÊS VEZES**, sempre no vão entre duas camadas,
 * ⛔ e ⛔ nunca dentro de uma:
 *
 *   1 · os quatro achados de janela estendida entraram na Superfície C ⛔ e
 *      ⛔ nenhuma modalidade os oferecia — **inalcançáveis na tela**;
 *   2 · a ação de trombólise existia no conteúdo ⛔ e na derivação, ⛔ e ⛔ tela
 *      ⛔ nenhuma a renderizava;
 *   3 · renderizada, ela ficava **fora do registro do módulo** — o fato era
 *      gravado ⛔ sem instância, ⛔ e a leitura ⛔ não encontrava ⛔ nada.
 *
 * ⚠️⚠️ Os três passaram por provas de superfície verdes. ⛔ Prova de camada
 * ⛔ não vê o vão entre camadas — ⛔ e é exatamente ali que o defeito mora.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-alcance-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--rootDir", appDir, "--moduleResolution", "node",
  "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "conteudo", "campos.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-g.ts"),
], { cwd: appDir, stdio: "pipe" });

const mod = (n) => require(path.join(tmp, "avc", "conteudo", `${n}.js`));
const CAMPOS = mod("campos");
const SG = mod("superficie-g");
const SF = mod("superficie-f");
const SC = mod("superficie-c");

/* ── ⚠️ O UNIVERSO, DERIVADO — ⛔ nenhuma lista à mão ───────────────────── */

const POR_SUPERFICIE = {
  A: mod("superficie-a").TODOS_OS_CAMPOS_A,
  B: mod("superficie-b").TODOS_OS_CAMPOS_B,
  C: SC.TODOS_OS_CAMPOS_C,
  D: mod("superficie-d").TODOS_OS_CAMPOS_D,
  E: mod("superficie-e").TODOS_OS_CAMPOS_E,
  P: mod("paciente").TODOS_OS_CAMPOS_P,
  L: mod("laboratorio").TODOS_OS_CAMPOS_L,
  /** ⚠️ F e G declaram campos FORA do padrão de grupos — entram aqui na mão
   *  porque ⛔ não há lista genérica para derivar. */
  F: [...SF.ACAO_DE_TROMBOLISE, { id: SF.CAMPO_AGENTE.id, rotulo: SF.CAMPO_AGENTE.rotulo }],
  G: SG.FATOS_OPERACIONAIS,
};
const TODOS = Object.entries(POR_SUPERFICIE)
  .flatMap(([sup, cs]) => cs.map((c) => ({ ...c, sup })));

/** ⚠️ Fontes de derivação e de tela, SEM comentário — comentário ⛔ não executa. */
const derivacoes = fs.readdirSync(path.join(appDir, "avc", "nucleo"))
  .filter((f) => f.startsWith("derivacoes") || f === "leitura.ts")
  .map((f) => ({ nome: f, txt: lerFonte(path.join(appDir, "avc", "nucleo", f)) }));
const telas = fs.readdirSync(path.join(appDir, "components", "avc"))
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => ({ nome: f, txt: lerFonte(path.join(appDir, "components", "avc", f)) }));
const todaTela = telas.map((t) => t.txt).join("\n");
const todaDerivacao = derivacoes.map((d) => d.txt).join("\n");

// ── ⚠️ 0 · O UNIVERSO EXISTE (R-1) ───────────────────────────────────────
confere("o módulo tem campos, derivações e telas a conferir",
  TODOS.length >= 80 && derivacoes.length >= 6 && telas.length >= 8,
  "⛔ trava que roda sobre lista vazia fica verde sem medir nada");

confere("⛔ nenhum id de campo se repete entre superfícies",
  new Set(TODOS.map((c) => c.id)).size === TODOS.length,
  `um fato tem UMA casa semântica; duas casas é duas verdades — ${
    TODOS.map((c) => c.id).filter((id, i, a) => a.indexOf(id) !== i).join(", ")}`);

// ══ ⚠️⚠️ 1 · O DEFEITO QUE MORDEU TRÊS VEZES ══════════════════════════════
{
  const registro = CAMPOS.todosOsCampos();
  const noRegistro = new Set(registro.map((c) => c.id));

  /**
   * ⚠️⚠️ ESTA É A CONFERÊNCIA QUE TERIA PEGO O TERCEIRO DEFEITO.
   *
   * ⛔ `registrarComInstancia` descobre `instanciaDe` **consultando o registro**.
   * Fora dele, o fato é gravado ⛔ sem instância, `valorNaInstancia` ⛔ não acha
   * ⛔ nada, ⛔ e a superfície consumidora ⛔ nunca mostra o bloco.
   */
  const instaveisFora = TODOS.filter((c) => c.instanciaDe && !noRegistro.has(c.id));
  confere("⚠️⚠️ TODO campo instanciável está no REGISTRO do módulo",
    instaveisFora.length === 0,
    `⛔ fora do registro, o fato é gravado SEM instância e a leitura ⛔ não o encontra — ${
      instaveisFora.map((c) => `${c.sup}:${c.id}`).join(", ")}`);

  /** ⚠️ O registro ⛔ não pode ter campo que ⛔ não existe em superfície ⛔ nenhuma. */
  const ids = new Set(TODOS.map((c) => c.id));
  const orfaosNoRegistro = registro.filter((c) => !ids.has(c.id));
  confere("⛔ o registro ⛔ NÃO tem campo órfão",
    orfaosNoRegistro.length === 0,
    `campo no registro sem casa é entrada que envelheceu — ${
      orfaosNoRegistro.map((c) => c.id).join(", ")}`);
}

// ══ ⚠️⚠️ 2 · TODO CAMPO DECLARADO É REGISTRÁVEL PELA TELA ═════════════════
{
  /**
   * ⚠️⚠️ O DEFEITO 1 E O 2, GENERALIZADOS.
   *
   * ⚠️ Um campo chega à tela por um de dois caminhos: dentro de um **grupo**
   * que o componente percorre, ou **nomeado** no componente. ⛔ Fora dos dois,
   * ⛔ ninguém pode respondê-lo — ⛔ e ⛔ nenhuma prova de superfície vê isso.
   */
  const gruposRenderizados = ["GRUPOS_A", "GRUPOS_B", "GRUPOS_C", "GRUPOS_D", "GRUPOS_E",
    "GRUPOS_P", "GRUPOS_L"].filter((g) => todaTela.includes(g) || todaTela.includes(g.replace("GRUPOS_", "GRUPOS")));
  confere("as telas percorrem os grupos das superfícies de campo",
    gruposRenderizados.length >= 4,
    "⛔ sem grupo percorrido, a conferência abaixo ficaria verde por vacuidade");

  const emGrupo = new Set(
    Object.entries({ A: "superficie-a", B: "superficie-b", C: "superficie-c",
      D: "superficie-d", E: "superficie-e", P: "paciente", L: "laboratorio" })
      .flatMap(([k, f]) => {
        const m = mod(f);
        const gs = m[`GRUPOS_${k}`] ?? [];
        return gs.flatMap((g) => [...(g.campos ?? []), ...(g.emprestados ?? [])].map((c) => c.id));
      })
  );

  /**
   * ⚠️⚠️ HÁ UM TERCEIRO CAMINHO: a tela percorre uma **lista de conteúdo**.
   *
   * ⚠️ F e G ⛔ não usam grupos — os componentes fazem `.map` sobre
   * `ACAO_DE_TROMBOLISE` e `FATOS_OPERACIONAIS`. ⛔ Exigir o id literal no
   * `.tsx` reprovaria renderização genérica, que é justamente a boa.
   */
  const LISTAS_RENDERIZADAS = {
    ACAO_DE_TROMBOLISE: SF.ACAO_DE_TROMBOLISE.map((c) => c.id),
    FATOS_OPERACIONAIS: SG.FATOS_OPERACIONAIS.map((c) => c.id),
    CAMPO_AGENTE: [SF.CAMPO_AGENTE.id],
  };
  /**
   * ⚠️⚠️ ⛔ CITAR O NOME ⛔ NÃO É PERCORRER A LISTA.
   *
   * ⛔ A primeira versão conferia se o nome aparecia no `.tsx` — ⛔ e o nome
   * aparece também numa anotação de tipo, num import ⛔ ou num comentário. ⚠️ O
   * que torna o campo alcançável é o **`.map`**, ⛔ e é ele que se mede.
   */
  const porLista = new Set(
    Object.entries(LISTAS_RENDERIZADAS)
      .filter(([nome]) => new RegExp(`${nome}\\s*\\.map\\(`).test(todaTela)
        || new RegExp(`${nome}\\.opcoes\\s*\\.map\\(`).test(todaTela))
      .flatMap(([, ids]) => ids)
  );
  confere("as telas percorrem as listas de conteúdo de F e G",
    porLista.size >= 4,
    "⛔ sem lista percorrida, a conferência abaixo ficaria verde por vacuidade");

  const inalcancaveis = TODOS.filter(
    (c) => !emGrupo.has(c.id) && !porLista.has(c.id) && !todaTela.includes(`"${c.id}"`)
  );
  confere("⚠️⚠️ TODO campo declarado tem como ser respondido na tela",
    inalcancaveis.length === 0,
    `⛔ campo que ⛔ nenhuma tela renderiza ⛔ não pode ser respondido por ⛔ ninguém — ${
      inalcancaveis.map((c) => `${c.sup}:${c.id}`).join(", ")}`);
}

// ══ ⚠️⚠️ 3 · ACHADO DE ESTUDO PRECISA DE MODALIDADE QUE O OFEREÇA ═════════
{
  /**
   * ⚠️⚠️ O DEFEITO 1, NA SUA FORMA EXATA.
   *
   * ⛔ Em C, o campo existe ⛔ e só aparece se **alguma modalidade o oferecer**.
   * Quatro campos entraram ⛔ sem serem registrados na matriz ⛔ e ficaram
   * invisíveis — presentes no conteúdo, na derivação ⛔ e nas provas.
   */
  const oferecidos = new Set(Object.values(SC.CAPACIDADES_DA_MODALIDADE).flat());
  const estruturais = ["estudo_modalidade", "estudo_procedencia", "estudo_hora"];
  const achados = SC.TODOS_OS_CAMPOS_C
    .filter((c) => c.instanciaDe === SC.ESTUDO && !estruturais.includes(c.id));
  confere("há achados de estudo a conferir",
    achados.length >= 5,
    "⛔ lista vazia deixaria a conferência abaixo sem medir nada");

  const semModalidade = achados.filter((c) => !oferecidos.has(c.id));
  confere("⚠️⚠️ TODO achado de estudo tem modalidade que o ofereça",
    semModalidade.length === 0,
    `⛔ achado que ⛔ nenhuma modalidade oferece é inalcançável na tela — ${
      semModalidade.map((c) => c.id).join(", ")}`);

  const oferecidosInexistentes = [...oferecidos]
    .filter((id) => !SC.TODOS_OS_CAMPOS_C.some((c) => c.id === id));
  confere("⛔ e ⛔ NENHUMA modalidade oferece campo que ⛔ não existe",
    oferecidosInexistentes.length === 0,
    `oferecer campo inexistente é promessa que a tela ⛔ não cumpre — ${oferecidosInexistentes.join(", ")}`);
}

// ══ ⚠️⚠️ 4 · A DERIVAÇÃO LÊ NO FORMATO EM QUE O ESTADO GRAVA ══════════════
{
  /**
   * ⚠️⚠️ O DEFEITO DA SUPERFÍCIE F, GENERALIZADO PARA O MÓDULO.
   *
   * ⛔ A tela grava `valorDaOpcao(op)`. Para Sim/Não/Não sei/Incerto isso é
   * `"sim"`, `"nao"`, `"nao_sei"` — ⛔ **nunca** o rótulo. Uma derivação que
   * compare `=== "Sim"` fica eternamente falsa no app real, ⛔ enquanto as
   * provas passam se injetarem o rótulo direto no estado.
   */
  const SLUGADOS = /(===|!==)\s*"(Sim|Não|Não sei|Incerto)"/g;
  const culpadas = derivacoes
    .map((d) => ({ nome: d.nome, achados: d.txt.match(SLUGADOS) ?? [] }))
    .filter((d) => d.achados.length > 0);
  confere("⚠️⚠️ ⛔ NENHUMA derivação compara o RÓTULO de Sim/Não/Incerto",
    culpadas.length === 0,
    `⛔ o estado guarda o slug — a comparação fica eternamente falsa no app real — ${
      culpadas.map((d) => `${d.nome}: ${d.achados.join(" ")}`).join(" · ")}`);

  /**
   * ⚠️⚠️ ⛔ E ⛔ NINGUÉM REESCREVE O TERNÁRIO SOBRE O ACESSOR PADRÃO.
   *
   * ⚠️ A primeira versão contava ocorrências de `=== "sim"` ⛔ e reprovava duas
   * leituras **legítimas** — `leitura.ts` (a canônica) ⛔ e uma que usa
   * `valorEfetivo`, que é outro conceito. ⛔ Contar ocorrência ⛔ não é medir o
   * defeito; o defeito é **destrinchar o ternário à mão** sobre `valorAtual`.
   */
  const AMAO = /valorAtual\([^)]*\)\??\.valor\s*(===|!==)\s*"(sim|nao|nao_sei)"/g;
  const aMao = derivacoes
    .map((d) => ({ nome: d.nome, achados: d.txt.match(AMAO) ?? [] }))
    .filter((d) => d.achados.length > 0);
  confere("⚠️⚠️ ⛔ NENHUMA derivação destrincha o ternário à mão sobre valorAtual",
    aMao.length === 0,
    `⛔ a leitura canônica é \`ternario()\` — reescrevê-la é a duplicação que a I6 proíbe — ${
      aMao.map((d) => d.nome).join(", ")}`);
}

// ══ ⚠️⚠️ 5 · TODO CAMPO CONSUMIDO EXISTE ══════════════════════════════════
{
  /**
   * ⚠️⚠️ O ELO FINAL: a derivação lê um id que ⛔ **existe** como campo.
   *
   * ⛔ Ler um id inexistente ⛔ não quebra ⛔ nada: devolve `undefined` para
   * sempre, ⛔ e o critério fica eternamente ausente ⛔ sem erro ⛔ nenhum.
   */
  const LEITURAS = /(?:valorAtual|escolha|ternario|selecaoDe|numero)\(\s*estado\s*,\s*"([a-z_0-9]+)"/g;
  const NA_INSTANCIA = /valorNaInstancia\(\s*estado\s*,\s*[a-zA-Z]+\s*,\s*"([a-z_0-9]+)"/g;
  const ids = new Set(TODOS.map((c) => c.id));
  const lidos = new Set();
  for (const d of derivacoes) {
    for (const m of d.txt.matchAll(LEITURAS)) lidos.add(m[1]);
    for (const m of d.txt.matchAll(NA_INSTANCIA)) lidos.add(m[1]);
  }
  confere("há campos sendo lidos pelas derivações",
    lidos.size >= 15,
    "⛔ sem leituras, a conferência abaixo ficaria verde sem medir nada");

  const fantasmas = [...lidos].filter((id) => !ids.has(id));
  confere("⚠️⚠️ TODO campo lido por derivação EXISTE como campo declarado",
    fantasmas.length === 0,
    `⛔ ler id inexistente devolve undefined para sempre — critério eternamente ausente, ⛔ sem erro — ${
      fantasmas.join(", ")}`);
}

// ══ ⚠️⚠️ 6 · CONTRATOS TRANSVERSAIS DO MÓDULO ═════════════════════════════
{
  /** ⚠️⚠️ ⛔ NENHUM RELÓGIO É FUNDIDO COM OUTRO. */
  const comRelogio = TODOS.filter((c) => c.relogio);
  confere("há relógios a conferir",
    comRelogio.length >= 5,
    "⛔ lista vazia não mede fusão nenhuma");
  confere("⚠️⚠️ ⛔ NENHUM relógio é compartilhado por dois campos",
    new Set(comRelogio.map((c) => c.relogio)).size === comRelogio.length,
    `⛔ dois campos no mesmo relógio fundem duas contagens que a fonte mantém separadas — ${
      comRelogio.map((c) => `${c.id}:${c.relogio}`).join(", ")}`);

  /** ⚠️⚠️ ⛔ NENHUM campo BLOQUEIA terapia — a decisão é do médico. */
  confere("⚠️ ⛔ nenhum campo declara bloquear terapia",
    TODOS.every((c) => c.bloqueiaTerapia !== true),
    "⛔ o app ⛔ não impede conduta; ele mostra o que a fonte diz");

  /**
   * ⚠️⚠️ OPERACIONAL ⛔ NÃO É ELEGIBILIDADE — a fronteira, no módulo inteiro.
   */
  confere("⚠️⚠️ ⛔ NENHUM fato operacional é lido por derivação clínica",
    SG.IDS_OPERACIONAIS.every((id) =>
      derivacoes.filter((d) => d.nome !== "derivacoes-g.ts")
        .every((d) => !d.txt.includes(id))),
    "⛔ disponibilidade é LOCALIZAÇÃO, ⛔ nunca contraindicação clínica (F-03 §12)");

  /** ⚠️⚠️ DECISÃO ⛔ NÃO É AÇÃO — os dois agentes coexistem. */
  confere("⚠️⚠️ o agente em consideração e o administrado são campos DIFERENTES",
    SF.CAMPO_AGENTE.id === "agente_trombolitico"
    && SF.ACAO_DE_TROMBOLISE.some((c) => c.id === "ivt_agente_administrado"),
    "⛔ um campo só obrigaria a sobrescrever a decisão anterior, ⛔ e a trilha perderia que ela existiu");

  /** ⚠️⚠️ ⛔ NENHUMA TELA escreve cor em hexadecimal. */
  const comHex = telas.filter((t) => /#[0-9a-fA-F]{3,8}\b/.test(t.txt));
  confere("⚠️ ⛔ nenhuma tela nova do AVC escreve cor em hexadecimal",
    comHex.every((t) => !["superficie-f.tsx", "superficie-g.tsx"].includes(t.nome)),
    `cor fora do design system é duplicação — ${comHex.map((t) => t.nome).join(", ")}`);

  /**
   * ⚠️⚠️ A PALAVRA PROIBIDA, NO MÓDULO INTEIRO.
   *
   * ⛔ COR 3 da fonte é *not recommended* / *No Benefit*. ⛔ Converter inventa
   * força que ela ⛔ não deu (E-45).
   */
  const comVeredito = telas.filter((t) => /contraindicad/i.test(t.txt));
  confere("⚠️⚠️ ⛔ NENHUMA tela do AVC escreve 'contraindicado'",
    comVeredito.length === 0,
    `⛔ *not recommended* ⛔ não é contraindicação — ${comVeredito.map((t) => t.nome).join(", ")}`);
}

// ══ ⚠️⚠️ 7 · O REPOSITÓRIO ⛔ NÃO GUARDA SAÍDA DE COMPILAÇÃO ═══════════════
{
  /**
   * ⚠️⚠️ ACHADO NA AUDITORIA FINAL: doze `.js` compilados apareceram ao lado dos
   * seus `.ts`, na raiz ⛔ e em `lib/`. ⛔ Saíram de uma execução de trava cujo
   * `--rootDir` ⛔ não continha toda a cadeia de imports: o `tsc` falhou ⛔ e
   * **emitiu mesmo assim**, ao lado da fonte.
   *
   * ⛔ Commitados, eles viram um segundo módulo que ⛔ ninguém importa ⛔ e que
   * envelhece em silêncio — ⛔ e o bundler pode preferi-los ao `.ts`.
   */
  const raizes = ["lib", "core", "acls", "avc", "."];
  const gemeos = [];
  const varre = (dir, prof) => {
    if (prof > 2) return;
    for (const e of fs.readdirSync(path.join(appDir, dir), { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      const rel = path.join(dir, e.name);
      if (e.isDirectory()) varre(rel, prof + 1);
      else if (e.name.endsWith(".js") && fs.existsSync(path.join(appDir, rel.replace(/\.js$/, ".ts")))) {
        gemeos.push(rel);
      }
    }
  };
  for (const r of raizes) varre(r, 0);
  confere("⚠️⚠️ ⛔ NENHUM `.js` compilado convive com o seu `.ts`",
    gemeos.length === 0,
    `⛔ saída de compilação no repositório vira segundo módulo que envelhece calado — ${gemeos.join(", ")}`);
}

// ── relatório ────────────────────────────────────────────────────────────
fs.rmSync(tmp, { recursive: true, force: true });
if (falhas.length > 0) {
  console.error(`\n❌ ALCANÇABILIDADE DO MÓDULO AVC — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(
  `✅ ALCANÇABILIDADE DO MÓDULO AVC — ${ok}/${ok} conferências · ${TODOS.length} campos · ${derivacoes.length} derivações · ${telas.length} telas`
);
