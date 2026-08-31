/**
 * TROCA DE SESSÃO · a **decisão** de quando a sessão anônima pode ser
 * substituída pela sessão de uma conta — e ⛔ nada mais.
 *
 * ⛔ ⛔ ESTE ARQUIVO ⛔ NÃO IMPORTA ⛔ NADA. É de propósito: a regra abaixo é o
 * ponto onde o histórico do médico se preserva ⛔ ou se perde, e uma regra dessas
 * ⛔ não pode só ser **lida** numa varredura de fonte — ela precisa ser
 * **executada** contra falhas forçadas. Sem imports, a prova compila e roda
 * este módulo sozinho, ⛔ sem subir Supabase ⛔ nem rede.
 *
 * ── ⚠️⚠️ A REGRA, E O ERRO QUE ELA CORRIGE ─────────────────────────────────
 *
 * ⛔ A primeira versão dizia: *"falha no claim ⛔ nunca derruba o login"*. Isso
 * estava **errado**, e o erro era de raciocínio, ⛔ não de código: eu otimizei
 * para ⛔ não travar o médico numa emergência e ⛔ não enxerguei o preço.
 *
 * ⚠️⚠️ Se o claim falha e a sessão nova é instalada assim mesmo, as sessões
 * continuam pertencendo ao `old_uid` anônimo enquanto o cliente passa a ser
 * `new_uid`. ⛔ O histórico ⛔ não fica "para depois" — ele **desaparece naquele
 * instante**, e ⛔ sem ⛔ nenhum aviso, porque a RLS deixa de casar.
 *
 * ⚠️ Trocar por: **a sessão anônima permanece**. O médico continua vendo o que
 * registrou, e pode tentar entrar de novo. ⛔ Nada se perde numa tentativa.
 */

/**
 * ⚠️⚠️ ESTAS DUAS SÃO **REGRAS**, ⛔ e ⛔ não entrada e saída — por isso moram aqui,
 * ⛔ e ⛔ não na fiação.
 *
 * ⚠️ A prova por mutação mostrou o porquê: enquanto elas viviam junto do
 * `fetch`, duas regressões **sobreviviam** — tratar um claim que respondeu 500
 * como sucesso (e instalar a sessão, perdendo o histórico), e mandar o token de
 * uma conta **cadastrada** no cabeçalho de prova anônima. ⛔ Nenhuma das duas é
 * detectável varrendo fonte sem medir o nome das variáveis.
 */

/**
 * ⚠️⚠️ OS DESFECHOS DO CLAIM — quatro, ⛔ e ⛔ não dois.
 *
 * ⛔ `pendente` e `bloqueada` ⛔ NÃO podem compartilhar mensagem: dizer *"conta
 * aguardando aprovação"* para quem foi **bloqueado** é falso, e manda a pessoa
 * esperar por algo que ⛔ não vai acontecer.
 *
 * ⚠️ ⛔ Nenhum deles instala a sessão quando há sessão anônima ativa — a ação é a
 * mesma, a **explicação** é que muda.
 */
export type DesfechoDoClaim = "ok" | "conta_pendente" | "conta_indisponivel" | "falha";

/**
 * ⚠️⚠️ A LEITURA DA RESPOSTA É **REGRA**, ⛔ e ⛔ não entrada e saída.
 *
 * ⚠️ Ela mora aqui, junto das outras, porque foi ⛔ exatamente isto que a mutação
 * pegou da última vez: enquanto vivia junto do `fetch`, tratar um 500 como
 * sucesso **sobrevivia** à prova.
 *
 * ⛔ Falha fechada: ⛔ qualquer coisa que ⛔ não seja explicitamente reconhecida
 * vira `"falha"`, ⛔ e ⛔ nunca `"ok"`.
 */
export function desfechoDoClaim(
  resposta: { ok: boolean; status?: number } | undefined,
  corpo?: { error?: string } | null
): DesfechoDoClaim {
  if (resposta?.ok === true) return "ok";
  if (corpo?.error === "conta_pendente") return "conta_pendente";
  if (corpo?.error === "conta_indisponivel") return "conta_indisponivel";
  return "falha";
}

/**
 * ⚠️⚠️ ⛔ SÓ uma sessão **marcada como anônima** vira prova de posse.
 *
 * ⛔ Mandar o `access_token` de uma conta cadastrada no `X-Anon-Token` ⛔ não só
 * seria rejeitado pelo servidor (403) — ⛔ ele **exporia a credencial da conta**
 * a um endpoint que ⛔ não precisa dela, e faria ⛔ todo login comum falhar o claim.
 */
export function ehProvaAnonima(sessao: { is_anonymous?: boolean } | null | undefined): boolean {
  return sessao?.is_anonymous === true;
}

/** ⚠️ O que o mundo de fora sabe fazer. ⛔ Nenhuma delas é implementada aqui. */
export type PortasDeTroca = {
  /** A sessão instalada agora — e se ela é anônima. */
  sessaoAtual: () => Promise<{ token?: string; anonima: boolean }>;
  /** Obtém a sessão da conta ⛔ **sem instalar**. */
  autenticar: (
    email: string,
    senha: string
  ) => Promise<{ sessao?: unknown; erro?: string }>;
  /**
   * ⚠️⚠️ Transfere a posse — **e é o servidor que descobre se pode**.
   *
   * ⛔ O cliente ⛔ NÃO antecipa o `status` da conta destino. Se antecipasse,
   * voltaria a ser autoridade sobre a própria autorização — o mesmo defeito do
   * `old_user_id`, com outra roupa. ⚠️ Por isso o claim é **sempre chamado**, e
   * é a resposta dele que diz se a conta é `pendente`, indisponível ⛔ ou apta.
   */
  reivindicar: (
    tokenDaConta: unknown,
    tokenAnonimo: string
  ) => Promise<{ desfecho: DesfechoDoClaim; transferidas: number }>;
  /** ⚠️⚠️ O ponto de ⛔ não-retorno: a partir daqui a sessão anônima morreu. */
  instalar: (sessao: unknown) => Promise<{ erro?: string }>;
};

export type ResultadoDaTroca = {
  erro?:
    | "credenciais_invalidas"
    | "sem_configuracao"
    | "falha_de_rede"
    | "claim_falhou"
    | "conta_pendente"
    | "conta_indisponivel";
  transferidas: number;
  /** ⚠️ Para a tela decidir a mensagem — ⛔ e para a prova medir o essencial. */
  sessaoTrocada: boolean;
};

/**
 * ⚠️⚠️ TODA PORTA É CHAMADA POR AQUI — e ⛔ nenhuma exceção dela escapa.
 *
 * ⚠️ A prova encontrou isto: um `reivindicar` que **estoura** ⛔ não instalava a
 * sessão nova (⛔ certo), mas deixava a exceção subir crua até a tela — que
 * ficaria ⛔ sem mensagem e ⛔ sem estado. ⛔ Falha de rede ⛔ não pode ser mais
 * permissiva ⛔ nem mais silenciosa que falha declarada.
 *
 * ⛔ O `catch` ⛔ não registra ⛔ nada: há token anônimo no escopo do chamador.
 */
async function tentar<T>(op: () => Promise<T>, seFalhar: T): Promise<T> {
  try {
    return await op();
  } catch {
    return seFalhar;
  }
}

export async function trocarDeSessao(
  portas: PortasDeTroca,
  email: string,
  senha: string
): Promise<ResultadoDaTroca> {
  const atual = await portas.sessaoAtual();
  const tokenAnonimo = atual.anonima ? atual.token : undefined;

  const autenticado = await tentar(() => portas.autenticar(email, senha), {
    erro: "falha_de_rede",
  });
  /**
   * ⚠️ FALHA 1 · a conta ⛔ não autenticou.
   * ⛔ `instalar` ⛔ não é chamada — ⛔ não há o que instalar, e a sessão anônima
   * ⛔ nem foi tocada.
   */
  if (!autenticado.sessao) {
    return {
      erro: (autenticado.erro as ResultadoDaTroca["erro"]) ?? "credenciais_invalidas",
      transferidas: 0,
      sessaoTrocada: false,
    };
  }

  /**
   * ⚠️ ⛔ SEM SESSÃO ANÔNIMA ⛔ NÃO HÁ O QUE PRESERVAR.
   *
   * ⚠️ É o login comum — o médico abriu o app e entrou direto. ⛔ Exigir um claim
   * aqui inventaria uma dependência que ⛔ não existe, e deixaria o login refém de
   * uma função que ⛔ nem precisa ser chamada.
   */
  if (!tokenAnonimo) {
    const r = await tentar(() => portas.instalar(autenticado.sessao), { erro: "falha_de_rede" });
    return {
      erro: r.erro ? "falha_de_rede" : undefined,
      transferidas: 0,
      sessaoTrocada: !r.erro,
    };
  }

  const claim = await tentar(() => portas.reivindicar(autenticado.sessao, tokenAnonimo), {
    desfecho: "falha" as DesfechoDoClaim,
    transferidas: 0,
  });
  /**
   * ⚠️⚠️ FALHA 2 · O CLAIM FALHOU — E É AQUI QUE SE PARA.
   *
   * ⛔ ⛔ `instalar` ⛔ NÃO É CHAMADA. A sessão anônima **permanece instalada**, o
   * médico continua lendo o que registrou, e a tentativa pode ser repetida.
   *
   * ⚠️ Prosseguir seria trocar um incômodo — *"tente entrar de novo"* — por um
   * dano: o trabalho da emergência preso numa identidade que o app acabou de
   * abandonar.
   */
  if (claim.desfecho !== "ok") {
    /**
     * ⚠️⚠️ TRÊS RAZÕES, UMA AÇÃO. ⛔ `instalar` ⛔ não é chamada em ⛔ nenhuma delas.
     *
     * ⚠️ A distinção existe ⛔ só para a mensagem — e ela **importa**: mandar quem
     * foi bloqueado esperar aprovação é uma mentira que custa uma espera inteira.
     */
    const erro =
      claim.desfecho === "conta_pendente"
        ? ("conta_pendente" as const)
        : claim.desfecho === "conta_indisponivel"
          ? ("conta_indisponivel" as const)
          : ("claim_falhou" as const);
    return { erro, transferidas: 0, sessaoTrocada: false };
  }

  /** ⚠️ ⛔ Só agora — posse confirmada — a sessão anônima pode ser substituída. */
  const r = await tentar(() => portas.instalar(autenticado.sessao), { erro: "falha_de_rede" });
  return {
    erro: r.erro ? "falha_de_rede" : undefined,
    transferidas: claim.transferidas,
    sessaoTrocada: !r.erro,
  };
}
