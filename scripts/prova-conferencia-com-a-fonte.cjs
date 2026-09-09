/**
 * TRAVA DA CONFERÊNCIA — ⚠️ **transcrito ⛔ não é conferido**.
 *
 * PROMETE: que ⛔ *"conferido"* ⛔ exija **⛔ pessoa ⛔ e ⛔ data**; que
 *   ⛔ **⛔ nenhuma** página citada ⛔ seja tratada ⛔ como conferência; que
 *   ⛔ a definição fabricada da hipodensidade ⛔ **⛔ não volte** ⛔ à
 *   transcrição; ⛔ e que ⛔ a transcrição ⛔ **⛔ se declare** ⛔ intermediária.
 *
 * NÃO PROMETE: que ⛔ o conteúdo ⛔ esteja **⛔ certo**. ⚠️ ⛔ Ela ⛔ **⛔ não
 * lê o PDF** — ⛔ **⛔ nenhuma trava lê**. ⛔ O que ⛔ ela impede ⛔ é ⛔ que a
 * ⛔ **⛔ ausência** ⛔ de conferência ⛔ passe ⛔ por conferência. ⛔ O trabalho
 * ⛔ de abrir a fonte ⛔ continua ⛔ sendo ⛔ **⛔ humano**, ⛔ e ⛔ é ⛔ disso
 * que ⛔ este arquivo ⛔ trata.
 *
 * UNIVERSO: `avc/conteudo/conferencia.ts` ⛔ e `protocols/fontes-verbatim`.
 *
 * ── ⚠️⚠️⚠️ ⛔ POR QUE ⛔ ELA EXISTE ────────────────────────────────────────
 *
 * ⛔ ⛔ Uma frase inventada ⛔ sobreviveu ⛔ transcrita **⛔ com página**,
 * traduzida, renderizada ⛔ e ⛔ **⛔ exigida por uma trava verde**.
 * ⚠️ ⛔ Cinco camadas ⛔ confirmando ⛔ umas às outras.
 *
 * ⛔ ⛔ ⛔ **⛔ Suíte verde ⛔ é coerência interna, ⛔ e ⛔ não fidelidade à
 * fonte.** ⛔ As duas ⛔ se parecem ⛔ até ⛔ alguém abrir ⛔ o documento.
 */
const path = require("node:path");
const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
let falhas = 0;
let ok = 0;

function confere(nome, condicao, porque) {
  if (condicao) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const REG = lerFonte(path.join(appDir, "avc", "conteudo", "conferencia.ts"));

/* ══ ⚠️⚠️⚠️ 1 · OS QUATRO ESTADOS EXISTEM ═════════════════════════════ */

{
  const estados = ["transcrito", "conferido_pdf", "corrigido_apos_conferencia", "nao_conferido"];
  const faltando = estados.filter((e) => !new RegExp(`"${e}"`).test(REG));
  confere(
    "⚠️ os quatro estados de conferência existem",
    faltando.length === 0,
    `⛔ faltam: ${faltando.join(", ")} — ⛔ sem eles, *"transcrito"* ⛔ volta a significar *"conferido"*`
  );

  /**
   * ⚠️⚠️ ⛔ E O PADRÃO É **⛔ O MAIS FRACO**. ⛔ Um registro ⛔ cujo padrão
   * fosse `conferido_pdf` ⛔ marcaria ⛔ como conferido ⛔ tudo que ⛔ ninguém
   * ⛔ olhou — ⛔ que é ⛔ exatamente ⛔ o defeito ⛔ que ⛔ ele veio fechar.
   */
  confere(
    "⚠️⚠️ ⛔ o padrão de quem ⛔ não está no registro é `nao_conferido`",
    /\?\?\s*"nao_conferido"/.test(REG),
    "⛔ padrão otimista ⛔ transformaria o silêncio ⛔ em atestado"
  );
}

/* ══ ⚠️⚠️⚠️ 2 · *"CONFERIDO"* EXIGE PESSOA E DATA ════════════════════ */

{
  /**
   * ⚠️⚠️ ⛔ *"Conferido"* ⛔ sem autor ⛔ é ⛔ a mesma promessa vazia ⛔ que a
   * ⛔ página citada ⛔ era: ⛔ ⛔ ninguém ⛔ a quem perguntar ⛔ **⛔ o que
   * ⛔ exatamente ⛔ foi visto**.
   */
  const blocos = REG.split(/\{\s*\n\s*alvo:/).slice(1);
  const ruins = [];
  for (const b of blocos) {
    const alvo = (b.match(/^\s*"([^"]+)"/) ?? [])[1] ?? "?";
    const estado = (b.match(/estado:\s*"([^"]+)"/) ?? [])[1] ?? "?";
    if (estado === "nao_conferido" || estado === "transcrito") continue;
    if (!/por:\s*"/.test(b) || !/quando:\s*"/.test(b)) ruins.push(`${alvo} (${estado})`);
  }
  confere(
    "⚠️⚠️ ⛔ todo item conferido declara **quem** e **quando**",
    ruins.length === 0,
    `⛔ ${ruins.join(", ")} — ⛔ conferência ⛔ sem autor ⛔ é ⛔ atestado ⛔ sem responsável`
  );
}

/* ══ ⚠️⚠️⚠️ 2b · A CHAVE É `alvo + proposicao` ═════════════════════════ */

{
  /**
   * ⚠️⚠️ ⛔ Decisão do autor, 2026-09-09: ⛔ um card ⛔ pode ter ⛔ *"uma dose
   * correta ⛔ e uma definição errada"*. ⛔ Conferir ⛔ o **⛔ slot** ⛔ cobre
   * ⛔ o que ⛔ ninguém ⛔ olhou.
   */
  /**
   * ⚠️ ⛔ Medido ⛔ **⛔ no array**, ⛔ e ⛔ não no arquivo: ⛔ o comentário de
   * topo ⛔ cita ⛔ o formato antigo ⛔ para explicar ⛔ o que mudou, ⛔ e ⛔ a
   * primeira versão desta trava ⛔ acusou ⛔ o próprio exemplo.
   */
  const arr = REG.slice(REG.indexOf("CONFERENCIAS: readonly"));
  const semProposicao = [...arr.matchAll(/alvo: "([^"]+)",\s*\n\s*estado:/g)].map((m) => m[1]);
  confere(
    "⚠️⚠️ ⛔ toda conferência declara **qual proposição** cobre",
    semProposicao.length === 0,
    `⛔ ${semProposicao.join(", ")} — ⛔ conferência ⛔ por slot inteiro ⛔ é ⛔ otimista: ⛔ ela ⛔ atesta ⛔ o vizinho ⛔ que ⛔ ninguém viu`
  );

  confere(
    "⚠️ a busca exige alvo **e** proposição",
    /c\.alvo === alvo && c\.proposicao === proposicao/.test(REG),
    "⛔ buscar ⛔ só por alvo ⛔ devolveria ⛔ o estado ⛔ de ⛔ alguma ⛔ proposição ⛔ dele"
  );

  /**
   * ── ⚠️⚠️⚠️ ⛔ A REGRA, ⛔ E ⛔ NÃO O ESTADO DO DIA — 2026-09-09 ──────────
   *
   * ⛔ ⛔ ⛔ **⛔ A primeira versão ⛔ desta conferência ⛔ estava errada.**
   * ⛔ Ela exigia ⛔ `vka + dose === "nao_conferido"` — ⛔ ou seja, ⛔ ela
   * ⛔ **⛔ congelava a pendência**. ⚠️ ⛔ Quando o autor abriu a Figura 2 ⛔ e
   * confirmou o texto, ⛔ a trava ⛔ **⛔ reprovou a conferência** ⛔ e ⛔ pediu
   * ⛔ que a pendência ⛔ voltasse.
   *
   * ⛔ ⛔ ⛔ **⛔ É a mesma família ⛔ da trava da hipodensidade**, ⛔ ao
   * contrário: ⛔ lá ⛔ ela exigia ⛔ que o erro ⛔ ficasse; ⛔ aqui ⛔ ela
   * exigia ⛔ que ⛔ a ignorância ⛔ ficasse.
   *
   * ⚠️ ⛔ O que ⛔ se mede ⛔ é ⛔ a **⛔ regra**: ⛔ um número ⛔ que ⛔ **⛔ não
   * está ⛔ na transcrição** ⛔ precisa ⛔ de ⛔ **⛔ registro com pessoa ⛔ e
   * data** — ⛔ `nao_conferido` ⛔ (⛔ ainda ⛔ ninguém olhou) ⛔ ou
   * `conferido_pdf` ⛔ (⛔ alguém olhou, ⛔ e ⛔ disse ⛔ quem).
   * ⛔ **⛔ O que ⛔ não pode ⛔ é ⛔ `transcrito`** — ⛔ porque ⛔ ele
   * ⛔ **⛔ não está** ⛔ transcrito.
   */
  const doseVka = /alvo: "vka",\s*\n\s*proposicao: "dose",\s*\n\s*estado: "(\w+)"/.exec(REG);
  confere(
    "⚠️⚠️ ⛔ a dose do `vka` ⛔ não pode ser dada como *transcrita*",
    doseVka?.[1] === "nao_conferido" || doseVka?.[1] === "conferido_pdf" ||
      doseVka?.[1] === "corrigido_apos_conferencia",
    `⛔ está "${doseVka?.[1]}" — ⛔ 25–50 UI/kg ⛔ e 10–20 UI/kg ⛔ **⛔ não estão** ⛔ na transcrição: ⛔ eles vivem ⛔ na **Figura 2**, ⛔ que ⛔ não foi transcrita. ⛔ Só ⛔ conferência humana ⛔ responde ⛔ por eles`
  );
}

/* ══ ⚠️⚠️⚠️ 3 · A DEFINIÇÃO FABRICADA ⛔ NÃO VOLTA ═══════════════════ */

{
  const dir = path.join(appDir, "protocols", "fontes-verbatim");
  const FRASE = /degree of hypodensity is greater than the density of contralateral/i;
  const culpados = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => {
      const txt = lerFonte(path.join(dir, f));
      /**
       * ⚠️⚠️ ⛔ A CITAÇÃO ⛔ **⛔ DENTRO DA NOTA DE CORREÇÃO** ⛔ é ⛔ legítima
       * — ⛔ ela ⛔ **⛔ é** o histórico. ⛔ O que ⛔ não pode ⛔ é ⛔ a frase
       * ⛔ voltar ⛔ como ⛔ **⛔ conteúdo da tabela**.
       */
      const semNota = txt.replace(/> ### ⚠️⚠️⚠️ CORREÇÃO DE TRANSCRIÇÃO[\s\S]*?\n\n/g, "");
      return FRASE.test(semNota);
    });
  confere(
    "⚠️⚠️ ⛔ a definição fabricada ⛔ não voltou à transcrição",
    culpados.length === 0,
    `⛔ ${culpados.join(", ")} — ⛔ ela ⛔ já sobreviveu ⛔ a cinco camadas ⛔ uma vez`
  );

  confere(
    "⚠️ a correção ficou registrada, com o texto removido à vista",
    /CORREÇÃO DE TRANSCRIÇÃO/.test(
      lerFonte(path.join(dir, "aha-asa-2026-avc-isquemico.md"))
    ),
    "⛔ apagar ⛔ sem registrar ⛔ deixaria ⛔ a próxima pessoa ⛔ reescrever ⛔ o mesmo erro"
  );
}

/* ══ ⚠️⚠️⚠️ 4 · A TRANSCRIÇÃO ⛔ SE DECLARA INTERMEDIÁRIA ═══════════ */

{
  const f = lerFonte(path.join(appDir, "protocols", "fontes-verbatim", "aha-asa-2026-avc-isquemico.md"));
  confere(
    "⚠️⚠️ a transcrição diz que **⛔ não é a fonte**",
    /não é a fonte|transcrição intermediária/i.test(f),
    "⛔ tratada como verdade absoluta, ⛔ ela ⛔ vira ⛔ a quinta camada ⛔ que ⛔ ninguém confere"
  );
}

/* ══ ⚠️⚠️⚠️ 5 · `NAO_E_TELA` ⛔ NÃO ISENTA TEXTO DE TELA ════════════════ */

{
  /**
   * ⚠️⚠️ ⛔ Regra do autor, 2026-09-09: ⛔ a isenção ⛔ vale ⛔ **⛔ só** para
   * arquivo ⛔ de auditoria, prompt interno, log ⛔ ou erro técnico —
   * ⛔ **⛔ nunca** ⛔ para rótulo, ajuda, leitura, recomendação, mensagem de
   * decisão ⛔ ou consentimento.
   *
   * ⛔ ⛔ ⛔ **⛔ A isenção ⛔ é a saída fácil.** ⛔ Um texto que ⛔ não traduz
   * ⛔ some do radar do espanhol — ⛔ e ⛔ um médico ⛔ que usa o app ⛔ em ES
   * ⛔ lê ⛔ **⛔ um vazio ⛔ onde havia conduta**.
   */
  /**
   * ⚠️⚠️ ⛔ **⛔ CRU**, ⛔ e ⛔ não por `lerFonte` — 2026-09-09.
   *
   * ⛔ ⛔ `lerFonte` ⛔ **⛔ tira os comentários**: ⛔ é ⛔ o que ⛔ deixa as
   * outras travas ⛔ imunes a ⛔ texto de documentação. ⚠️ ⛔ Aqui ⛔ o que
   * ⛔ se mede ⛔ **⛔ é o comentário** — ⛔ o motivo ⛔ de cada isenção ⛔ e a
   * regra ⛔ escrita ⛔ no topo da lista.
   *
   * ⛔ ⛔ A primeira versão ⛔ usava `lerFonte` ⛔ e ⛔ acusou ⛔ **⛔ todas** as
   * isenções ⛔ de ⛔ não ter motivo — ⛔ inclusive ⛔ as que tinham.
   */
  const varredura = fs.readFileSync(
    path.join(appDir, "scripts", "varredura-pt.cjs"),
    "utf8"
  );
  const bloco = varredura.slice(
    varredura.indexOf("const NAO_E_TELA"),
    varredura.indexOf("]);", varredura.indexOf("const NAO_E_TELA"))
  );
  const isentos = [...bloco.matchAll(/^\s*"([^"]+)",/gm)].map((m) => m[1]);

  /**
   * ⛔ Caminhos ⛔ que ⛔ **⛔ são** ⛔ tela clínica, ⛔ por construção.
   *
   * ⚠️⚠️ ⛔ `components/` ⛔ **⛔ não** ⛔ entra inteiro: ⛔ a primeira versão
   * desta trava ⛔ acusou `components/audio-session.ts`, ⛔ que ⛔ tem
   * `console.log` ⛔ e ⛔ **⛔ nome de voz do TTS** (*"google português"* ⛔ é
   * identificador do navegador, ⛔ e ⛔ não frase). ⛔ Pasta ⛔ não é
   * ⛔ natureza: ⛔ o que ⛔ o médico lê ⛔ está ⛔ nos `.tsx` ⛔ de tela ⛔ e
   * ⛔ no conteúdo clínico.
   */
  const PROIBIDO_ISENTAR = [
    /^components\/(?!dev\/).*\.tsx$/,
    /^avc\/conteudo\/superficie/,
    /^avc\/conteudo\/(paciente|laboratorio|antihipertensivos|correcao-glicemica|hemorragia)/,
    /^avc\/nucleo\/derivacoes/,
    /^lib\/consentimento/,
  ];
  const indevidos = isentos.filter(
    (f) => PROIBIDO_ISENTAR.some((re) => re.test(f)) && f !== "avc/conteudo/conferencia.ts"
  );
  confere(
    "⚠️⚠️ ⛔ `NAO_E_TELA` ⛔ não isenta rótulo, ajuda, leitura ⛔ nem consentimento",
    indevidos.length === 0,
    `⛔ ${indevidos.join(", ")} — ⛔ isentar tela ⛔ deixa o médico ⛔ em espanhol ⛔ lendo ⛔ um vazio ⛔ onde havia conduta`
  );

  /** ⚠️ ⛔ A linha ⛔ imediatamente acima ⛔ tem de ser comentário. */
  const semMotivo = isentos.filter((f) => {
    const linhas = bloco.split("\n");
    const i = linhas.findIndex((l) => l.includes(`"${f}"`));
    return i <= 0 || !/^\s*(\/\/|\*)/.test(linhas[i - 1]);
  });
  confere(
    "⚠️ toda isenção declara o motivo",
    semMotivo.length === 0,
    `⛔ ${semMotivo.join(", ")} — ⛔ sem motivo escrito, ⛔ a lista ⛔ vira gaveta de exceção`
  );

  confere(
    "⚠️ a regra do que ⛔ NÃO pode ser isentado está escrita no varredor",
    /pode isentar/i.test(varredura) && /renderiz[áa]vel ao usu[áa]rio/i.test(varredura),
    "⛔ regra que ⛔ só vive ⛔ numa trava ⛔ não é lida ⛔ por quem edita a lista"
  );
}

if (falhas > 0) {
  console.log(`\n❌ CONFERÊNCIA COM A FONTE — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`\n✅ CONFERÊNCIA COM A FONTE — ${ok}/${ok} conferências · transcrito ⛔ não é conferido\n`);
