/**
 * MATRIZ DE ACESSO · a prova de que **o banco aplica a regra** — ⛔ e ⛔ não de que
 * a regra está escrita.
 *
 * ⛔⛔ ⛔ NÃO EXECUTA SOZINHO. Exige `MATRIZ_CONFIRMO=sim` no ambiente, e ⛔ aborta
 * se a migration de fechamento ⛔ não estiver aplicada.
 *
 * ── ⚠️⚠️ POR QUE ESTE ARQUIVO EXISTE SEPARADO DAS TRAVAS ──────────────────
 *
 * `valida-fechamento-clinico` mede o **texto** da migration: que ⛔ não concede ao
 * `anon`, que exige posse e conta ativa, que ⛔ não cria DELETE. ⚠️ Isso prova a
 * **forma da regra** — ⛔ e ⛔ nada sobre o banco.
 *
 * ⚠️⚠️ Teste local prova *"a regra está escrita certo"*. ⛔ Só o teste
 * pós-aplicação prova *"o banco está aplicando"*. ⛔ Precisamos dos dois, e
 * confundir um com o outro é como uma exposição sobrevive a uma auditoria.
 *
 * ── ⚠️⚠️ A REGRA QUE GOVERNA O DESENHO ────────────────────────────────────
 *
 * ⛔ ⛔ **O service role ⛔ NUNCA participa de uma asserção.** Ele arruma e
 * desarruma o cenário; ⛔ quem afirma é sempre o JWT da própria identidade,
 * passando pela chave publicável — ⛔ exatamente como o app faz.
 *
 * ⚠️ Usar service role para "simular" permissão de cliente ⛔ não testa RLS:
 * ⛔ ele passa por cima dela ⛔ por definição, e o teste ficaria verde sobre um
 * banco aberto.
 *
 * ── ⚠️ FIXTURES ───────────────────────────────────────────────────────────
 *
 * ⚠️ E-mails em `.invalid` (RFC 2606): ⛔ nenhum e-mail real pode ser alcançado.
 * ⚠️ Sessões marcadas por `module_key`, e apagadas **antes** dos usuários —
 * a FK é `on delete set null`, então apagar o usuário primeiro transformaria a
 * fixture em **órfã**, poluindo ⛔ exatamente a contagem que a matriz confere.
 *
 * ⛔ ⛔ ⛔ NENHUM dado clínico real é lido, alterado ⛔ ou reaproveitado.
 * ⛔ ⛔ ⛔ NENHUM JWT, senha ⛔ ou chave é impresso — ⛔ nem em erro.
 */
const MARCA = "matriz-de-acesso-efemera";
const DOMINIO = "matriz-acesso.invalid";

const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

/** ⚠️ Portas do mundo — declaradas para que a lógica seja legível sem elas. */
const URL = process.env.SUPABASE_URL;
const PUBLICA = process.env.SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** ⛔ Corpo de erro ⛔ nunca é ecoado: ele pode conter o token enviado. */
async function rest(caminho, { token, metodo = "GET", corpo, prefer } = {}) {
  const h = { apikey: PUBLICA, "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  if (prefer) h.Prefer = prefer;
  const r = await fetch(`${URL}/rest/v1/${caminho}`, {
    method: metodo,
    headers: h,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const dados = await r.json().catch(() => null);
  return { status: r.status, dados: Array.isArray(dados) ? dados : [] };
}

/**
 * ⚠️⚠️ O CAMINHO DE QUEM ⛔ NÃO TEM SESSÃO — e ele ⛔ **não aceita token**.
 *
 * ⛔ Depender de alguém passar `{ token: undefined }` é frágil: basta um
 * refactor herdar o header de uma etapa anterior e o teste "sem JWT" passa a
 * medir um cliente **autenticado**. ⚠️ É lugar clássico de falso negativo — o
 * teste fica verde ⛔ exatamente onde deveria gritar.
 *
 * ⚠️ Aqui ⛔ não há parâmetro de token para errar: a assinatura ⛔ não o admite.
 */
async function semSessao(caminho, { metodo = "GET", corpo } = {}) {
  const r = await fetch(`${URL}/rest/v1/${caminho}`, {
    method: metodo,
    headers: { apikey: PUBLICA, "Content-Type": "application/json" },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const dados = await r.json().catch(() => null);
  return { status: r.status, dados: Array.isArray(dados) ? dados : [] };
}

/** ⚠️ Login pela chave **publicável** — o caminho do app, ⛔ não o do servidor. */
async function entrar(email, senha) {
  const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: PUBLICA },
    body: JSON.stringify({ email, password: senha }),
  });
  if (!r.ok) return null;
  return (await r.json())?.access_token ?? null;
}

/** ⛔ Service role: ⛔ SÓ para arrumar e desarrumar cenário. ⛔ Nunca para afirmar. */
async function admin(caminho, metodo, corpo) {
  const r = await fetch(`${URL}/${caminho}`, {
    method: metodo,
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  return { status: r.status, dados: await r.json().catch(() => null) };
}

/** ⚠️ Contagem via service role: é integridade global, ⛔ não permissão. */
async function contarOrfas() {
  const r = await admin(
    "rest/v1/clinical_sessions?select=id&user_id=is.null&limit=100000", "GET"
  );
  return Array.isArray(r.dados) ? r.dados.length : null;
}

const IDENTIDADES = [
  { nome: "pendente", status: "pendente" },
  { nome: "bloqueado", status: "bloqueado" },
  { nome: "ativoA", status: "ativo" },
  { nome: "ativoB", status: "ativo" },
];

async function principal() {
  if (process.env.MATRIZ_CONFIRMO !== "sim") {
    console.log("\n⛔ MATRIZ DE ACESSO — execução deliberada.\n");
    console.log("   Rode SOMENTE depois de aplicar a migration de fechamento:");
    console.log("     MATRIZ_CONFIRMO=sim node scripts/matriz-de-acesso.cjs\n");
    console.log("   Exige SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY.\n");
    process.exit(0);
  }
  if (!URL || !PUBLICA || !SERVICE) {
    console.log("\n❌ faltam variáveis de ambiente\n");
    process.exit(1);
  }

  /**
   * ⚠️⚠️ ABORTA SE A MIGRATION ⛔ NÃO ESTIVER APLICADA.
   *
   * ⛔ Sem esta guarda, rodar antes do fechamento daria **verde enganoso** em
   * metade da matriz: com `using (true)`, "sem JWT lê tudo" ⛔ não é violação
   * detectada — é o estado que estamos tentando eliminar.
   */
  const semJwt = await semSessao("clinical_sessions?select=id&limit=1");
  if (semJwt.dados.length > 0) {
    console.log("\n⛔ ABORTADO — a leitura pública ainda funciona.");
    console.log("   A migration de fechamento ⛔ não foi aplicada. A matriz ⛔ não é válida agora.\n");
    process.exit(1);
  }

  /**
   * ⚠️⚠️ BASELINE DE ÓRFÃS — a matriz precisa provar **duas** coisas: que a
   * autorização está correta, e que **ela própria ⛔ não causou dano**.
   *
   * ⛔ Conferir apenas *"existem órfãs"* ⛔ não prova a segunda. Se a limpeza
   * errar a ordem, as fixtures viram órfãs novas — e a checagem de existência
   * ficaria **verde justamente por causa do dano**.
   */
  const orfasAntes = await contarOrfas();
  if (orfasAntes === null) {
    console.log("\n❌ ⛔ não foi possível ler o baseline de órfãs — abortado ⛔ antes de criar ⛔ qualquer fixture\n");
    process.exit(1);
  }

  const senha = `Ef3mera-${Math.round(Number(process.env.MATRIZ_SEMENTE ?? "20260831"))}!`;
  const criados = [];
  const sessoes = [];

  try {
    // ── ⚠️ CENÁRIO (service role) ──────────────────────────────────────────
    for (const id of IDENTIDADES) {
      const email = `${MARCA}-${id.nome}@${DOMINIO}`;
      const r = await admin("auth/v1/admin/users", "POST", {
        email, password: senha, email_confirm: true,
      });
      const uid = r.dados?.id;
      if (!uid) throw new Error(`⛔ falha ao criar fixture ${id.nome}`);
      criados.push({ ...id, email, uid });
      await admin(
        `rest/v1/app_users?id=eq.${uid}`, "PATCH", { status: id.status }
      );
    }

    const tokens = {};
    for (const c of criados) tokens[c.nome] = await entrar(c.email, senha);
    confere("as quatro identidades autenticam",
      IDENTIDADES.every((i) => tokens[i.nome]),
      "⛔ sem token ⛔ não há como medir o que cada uma alcança");

    // ── ⚠️⚠️ ATIVO A e B criam as PRÓPRIAS sessões ────────────────────────
    //
    // ⛔ O service role ⛔ não pode criar estas fixtures: o trigger de carimbo faz
    // `new.user_id := auth.uid()`, e para ele `auth.uid()` é **nulo** — as
    // sessões nasceriam órfãs, poluindo ⛔ exatamente a contagem que a matriz
    // confere. ⚠️ E criá-las autenticado **é** o teste positivo de INSERT.
    for (const quem of ["ativoA", "ativoB"]) {
      const r = await rest("clinical_sessions", {
        token: tokens[quem], metodo: "POST", prefer: "return=representation",
        corpo: { module_key: `${MARCA}-${quem}`, status: "started" },
      });
      confere(`⚠️ ${quem} ATIVO consegue inserir a própria sessão`,
        r.status === 201 && r.dados.length === 1,
        "⛔ uma regra que ⛔ só sabe recusar tornaria o app inútil — este é o positivo obrigatório");
      if (r.dados[0]) sessoes.push({ quem, id: r.dados[0].id, dono: r.dados[0].user_id });
    }

    const sA = sessoes.find((s) => s.quem === "ativoA");
    const sB = sessoes.find((s) => s.quem === "ativoB");
    const uidA = criados.find((c) => c.nome === "ativoA")?.uid;
    confere("⚠️⚠️ o servidor carimbou o dono, ⛔ e ⛔ não o cliente",
      sA && sA.dono === uidA,
      "⛔ se o cliente escolhesse o `user_id`, escolheria o de outro");

    // ── ⚠️⚠️ AS RECUSAS ───────────────────────────────────────────────────
    for (const [rotulo, token] of [
      ["⛔ sem JWT", undefined],
      ["⛔ pendente", tokens.pendente],
      ["⛔ bloqueado", tokens.bloqueado],
    ]) {
      const leitura = await rest("clinical_sessions?select=id", { token });
      confere(`⚠️⚠️ ${rotulo} → SELECT devolve ZERO`,
        leitura.dados.length === 0,
        "⛔ é ⛔ exatamente assim que `/session-history` entregava 697 sessões por URL");

      const escrita = await rest("clinical_sessions", {
        token, metodo: "POST", prefer: "return=representation",
        corpo: { module_key: `${MARCA}-negado`, status: "started" },
      });
      confere(`⚠️⚠️ ${rotulo} → INSERT NEGADO`,
        escrita.status >= 400,
        "⛔ autorização ⛔ só no `using` deixaria a conta pendente inserindo");

      const ev = await rest("clinical_session_events?select=id", { token });
      confere(`⚠️ ${rotulo} → eventos também zero`,
        ev.dados.length === 0,
        "eventos derivam da sessão pai — inacessível o pai, inacessível o evento");
    }

    // ── ⚠️⚠️ POSSE ENTRE ATIVOS ───────────────────────────────────────────
    const vistasPorA = await rest("clinical_sessions?select=id,user_id", { token: tokens.ativoA });
    confere("⚠️⚠️ ativo A vê a PRÓPRIA sessão",
      vistasPorA.dados.some((s) => s.id === sA?.id),
      "⛔ sem isto o fechamento teria quebrado o produto, ⛔ não protegido o dado");
    confere("⚠️⚠️ ⛔ ativo A ⛔ NÃO vê a sessão de B",
      !vistasPorA.dados.some((s) => s.id === sB?.id),
      "⛔ isolamento entre contas é o que a posse existe para garantir");
    confere("⛔ ⛔ e A ⛔ não vê ⛔ NENHUMA linha de outro dono",
      vistasPorA.dados.every((s) => s.user_id === uidA),
      "⛔ uma única linha alheia já é vazamento");

    const alvoB = await rest(`clinical_sessions?select=id&id=eq.${sB?.id}`, { token: tokens.ativoA });
    confere("⛔ nem pedindo a sessão de B pelo id",
      alvoB.dados.length === 0,
      "filtro do cliente ⛔ não é autorização — quem nega é a RLS");

    // ── ⚠️⚠️ AS ÓRFÃS ─────────────────────────────────────────────────────
    const orfasParaA = await rest("clinical_sessions?select=id&user_id=is.null", { token: tokens.ativoA });
    confere("⚠️⚠️ ⛔ as legadas sem dono são INVISÍVEIS ao cliente",
      orfasParaA.dados.length === 0,
      "linha sem dono virar linha de todos ⛔ **é** o vazamento, escrito de outro jeito");

    const orfasNoBanco = await admin(
      "rest/v1/clinical_sessions?select=id&user_id=is.null&limit=1000", "GET"
    );
    confere("⚠️ mas continuam PRESENTES no banco",
      Array.isArray(orfasNoBanco.dados) && orfasNoBanco.dados.length > 0,
      "⛔ elas ⛔ não deviam sumir — ⛔ só deixar de ser alcançáveis por cliente sem dono válido");

  } finally {
    /**
     * ── ⚠️⚠️ DESARRUMA — sessões ANTES dos usuários ─────────────────────
     *
     * ⛔ A FK é `on delete set null`: apagar o usuário primeiro transformaria a
     * fixture em **órfã permanente**, somando ⛔ exatamente à contagem que esta
     * matriz confere. ⚠️ A ordem ⛔ não é estilo — é o invariante.
     *
     * ⚠️⚠️ E TOLERA SETUP PARCIAL: se algo falhou depois de criar A e antes de
     * criar B, a limpeza ainda roda. ⛔ Cada passo tem `catch` próprio, porque
     * um erro **aqui** substituiria o erro **original** — e o original é o que
     * explica a falha.
     */
    const sujeira = [];
    try {
      await admin(`rest/v1/clinical_sessions?module_key=like.${MARCA}*`, "DELETE");
    } catch {
      sujeira.push("sessões-fixture");
    }
    for (const c of criados) {
      try {
        await admin(`auth/v1/admin/users/${c.uid}`, "DELETE");
      } catch {
        sujeira.push(`usuário ${c.nome}`);
      }
    }

    /** ⚠️⚠️ A PROVA DE ⛔ NÃO-DANO: a contagem volta ⛔ EXATAMENTE ao baseline. */
    const orfasDepois = await contarOrfas().catch(() => null);
    confere("⚠️⚠️ a matriz ⛔ NÃO deixou órfã ⛔ nenhuma para trás",
      orfasDepois === orfasAntes,
      `baseline ${orfasAntes}, agora ${orfasDepois} — ⛔ se a limpeza errar a ordem, as fixtures viram órfãs novas e o dano passa despercebido`);

    if (sujeira.length) {
      console.log(`\n  ⚠️⚠️ LIMPEZA INCOMPLETA: ${sujeira.join(", ")} — remova à mão.`);
    }
  }

  if (falhas.length) {
    console.log(`\n❌ MATRIZ DE ACESSO — ${falhas.length} falha(s), ${ok} ok\n`);
    falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    process.exit(1);
  }
  console.log(`\n✅ MATRIZ DE ACESSO — ${ok}/${ok} conferências · fixtures removidas\n`);
}

principal().catch((e) => {
  /** ⛔ Mensagem seca: o erro pode carregar cabeçalho ⛔ ou token. */
  console.log(`\n❌ MATRIZ DE ACESSO — erro de execução: ${String(e.message).slice(0, 120)}\n`);
  process.exit(1);
});
