/**
 * CONFERÊNCIA COM A FONTE PRIMÁRIA — ⚠️ **transcrito ⛔ não é conferido**.
 *
 * ── ⚠️⚠️⚠️ ⛔ O ACHADO QUE CRIOU ESTE ARQUIVO — 2026-09-09 ─────────────────
 *
 * ⛔ ⛔ O módulo exibia, ⛔ na linha de decisão de um campo:
 *
 * > *"A fonte define hipodensidade clara como aquela cuja densidade é
 * > **⛔ maior** que a da substância branca contralateral ⛔ não acometida."*
 *
 * ⚠️ ⛔ A frase estava ⛔ **⛔ na transcrição verbatim**, ⛔ com página citada
 * (*Table 8, p. e367*). ⛔ O código ⛔ a preservou ⛔ fielmente. ⛔ A tradução
 * ⛔ a espelhou. ⛔ Duas telas ⛔ a renderizavam. ⛔ E ⛔ **⛔ uma trava verde
 * ⛔ a exigia**.
 *
 * ⛔ ⛔ ⛔ **⛔ Cinco camadas ⛔ confirmando ⛔ umas às outras, ⛔ e ⛔ nenhuma
 * ⛔ olhando o PDF.** ⚠️ Conferência do autor, 2026-09-09: ⛔ a frase
 * ⛔ **⛔ não existe** ⛔ na diretriz.
 *
 * ── ⚠️⚠️⚠️ ⛔ A REGRA QUE ⛔ NASCE DISSO ───────────────────────────────────
 *
 * ⚠️ Decisão do autor: *"«verbatim transcrito» ⛔ e «verbatim conferido na
 * fonte primária» ⛔ **⛔ são estados diferentes**… assim vocês param de tratar
 * o arquivo `fontes-verbatim` como verdade absoluta. ⛔ Ele vira ⛔ o que ⛔ de
 * fato é: ⛔ **⛔ uma transcrição intermediária ⛔ que ⛔ também pode conter
 * erro**"*.
 *
 * ⛔ ⛔ ⛔ **⛔ E ⛔ nada aqui ⛔ se infere.** ⚠️ ⛔ Página citada ⛔ **⛔ não** é
 * prova de que o texto existe — ⛔ foi ⛔ exatamente ⛔ uma página citada ⛔ que
 * fez ⛔ todo mundo ⛔ parar de conferir. ⛔ O estado ⛔ só muda ⛔ quando
 * ⛔ **⛔ uma pessoa ⛔ abre a fonte primária** ⛔ e diz ⛔ que abriu.
 */

/**
 * ⚠️⚠️ ⛔ OS QUATRO ESTADOS — ⛔ e ⛔ o padrão ⛔ é ⛔ o mais fraco ⛔ deles.
 */
export type EstadoDeConferencia =
  /**
   * ⛔ Alguém copiou da fonte ⛔ para `protocols/fontes-verbatim`. ⚠️ ⛔ É ⛔ o
   * que ⛔ **⛔ quase tudo** ⛔ é hoje — ⛔ e ⛔ o defeito da hipodensidade
   * ⛔ mostra ⛔ que ⛔ isto ⛔ **⛔ não** garante ⛔ existência ⛔ na fonte.
   */
  | "transcrito"
  /**
   * ⚠️ ⛔ Uma pessoa ⛔ **⛔ abriu o PDF** ⛔ e confirmou ⛔ o texto. ⛔ Exige
   * ⛔ quem, ⛔ quando ⛔ e ⛔ onde ⛔ olhou.
   */
  | "conferido_pdf"
  /**
   * ⚠️ ⛔ A conferência ⛔ **⛔ reprovou** ⛔ o que estava escrito, ⛔ e o texto
   * ⛔ foi corrigido. ⛔ O histórico ⛔ do que ⛔ havia antes ⛔ fica ⛔ na
   * transcrição, ⛔ e ⛔ não ⛔ se apaga.
   */
  | "corrigido_apos_conferencia"
  /**
   * ⛔ ⛔ Ninguém abriu a fonte ⛔ para ⛔ este item. ⚠️ ⛔ **⛔ Não é acusação**
   * — ⛔ é ⛔ o estado honesto ⛔ da maioria, ⛔ e ⛔ o que ⛔ permite
   * ⛔ **⛔ priorizar** ⛔ a auditoria.
   */
  | "nao_conferido";

/**
 * ⚠️⚠️ ⛔ AS ESPÉCIES DE AFIRMAÇÃO ⛔ QUE CABEM ⛔ NUM MESMO CARD.
 *
 * ⛔ ⛔ Cada uma ⛔ se confere ⛔ **⛔ separadamente**, ⛔ e ⛔ cada uma ⛔ pode
 * estar ⛔ num estado ⛔ diferente ⛔ da vizinha.
 */
export type TipoDeProposicao =
  | "escolha_do_agente"
  | "dose"
  | "corte"
  | "janela"
  | "forca_de_recomendacao"
  | "excecao"
  | "definicao"
  | "interpretacao";

export type Conferencia = {
  /** ⚠️ O slot da fonte (`F-07`) ⛔ ou o `id` do campo. */
  readonly alvo: string;
  /**
   * ── ⚠️⚠️⚠️ ⛔ A CHAVE É `alvo + proposicao` — 2026-09-09 ──────────────────
   *
   * ⚠️ Decisão do autor: *"o estado de conferência deveria ficar ⛔ **⛔ por
   * afirmação**, ⛔ não ⛔ só por slot inteiro… ⛔ um mesmo card ⛔ pode ter uma
   * dose correta ⛔ e uma definição errada; ⛔ marcar o slot inteiro como
   * «conferido» ⛔ pode ser otimista demais"*.
   *
   * ⛔ ⛔ ⛔ **⛔ E ⛔ o exemplo ⛔ apareceu ⛔ no mesmo dia.** ⛔ O slot `vka`
   * ⛔ carrega ⛔ **⛔ quatro** proposições: ⛔ o agente (4F-PCC ⛔ em vez de
   * plasma), ⛔ a vitamina K, ⛔ as **⛔ doses em UI/kg** ⛔ e ⛔ as **⛔ classes
   * de recomendação**. ⚠️ ⛔ A escolha do agente ⛔ está na transcrição; ⛔ as
   * doses ⛔ **⛔ não estão** — ⛔ a própria transcrição diz ⛔ que elas vivem
   * ⛔ na **Figura 2**, ⛔ que ⛔ **⛔ não foi transcrita**.
   *
   * ⛔ ⛔ Marcar `vka` ⛔ como conferido ⛔ cobriria ⛔ o número ⛔ que ⛔ ninguém
   * ⛔ viu.
   */
  readonly proposicao: TipoDeProposicao;
  readonly estado: EstadoDeConferencia;
  /**
   * ⚠️⚠️ ⛔ **⛔ QUEM ⛔ E ⛔ QUANDO** — ⛔ obrigatórios ⛔ fora de
   * `nao_conferido`. ⛔ *"Conferido"* ⛔ sem autor ⛔ é ⛔ a mesma promessa
   * ⛔ vazia ⛔ que ⛔ a página citada ⛔ era.
   */
  readonly por?: string;
  readonly quando?: string;
  /** ⚠️ ⛔ Onde ⛔ a pessoa ⛔ olhou — ⛔ e ⛔ o que ⛔ ela achou ⛔ lá. */
  readonly nota?: string;
};

/**
 * ⚠️⚠️ ⛔ O REGISTRO ⛔ COMEÇA **⛔ PEQUENO**, ⛔ e ⛔ isso ⛔ é ⛔ o ponto.
 *
 * ⛔ ⛔ ⛔ Um registro ⛔ que ⛔ nascesse ⛔ com ⛔ tudo ⛔ marcado
 * ⛔ `conferido_pdf` ⛔ seria ⛔ **⛔ a mesma mentira**, ⛔ em ⛔ formato novo.
 * ⚠️ ⛔ O que ⛔ está aqui ⛔ é ⛔ o que ⛔ **⛔ alguém ⛔ realmente ⛔ abriu**.
 */
export const CONFERENCIAS: readonly Conferencia[] = [
  {
    alvo: "hipodensidade_clara",
    proposicao: "definicao",
    estado: "corrigido_apos_conferencia",
    por: "Sandro Dainez",
    quando: "2026-09-09",
    nota:
      "PDF AHA/ASA 2026. A definição por comparação com a substância branca contralateral não existe na Table 8 (e364–e367) e não é sustentada pela guideline. A fonte usa frank hypodensity, explicada no apoio como severe hypoattenuation as seen with subacute stroke. A cláusula fabricada foi removida da transcrição, com histórico preservado.",
  },
  /**
   * ── ⚠️⚠️⚠️ ⛔ SUSPEITA ABERTA — 2026-09-09 ──────────────────────────────
   *
   * ⛔ ⛔ As **⛔ doses em UI/kg** do slot `vka` ⛔ **⛔ não aparecem** ⛔ em
   * transcrição ⛔ nenhuma. ⚠️ ⛔ E a transcrição da HIC 2022 ⛔ diz, ⛔ na
   * linha 29, ⛔ que a dose de 4F-PCC por INR ⛔ está ⛔ na **Figura 2** —
   * ⛔ que ⛔ **⛔ não foi transcrita**.
   *
   * ⛔ ⛔ ⛔ O app ⛔ tem ⛔ as duas coisas ⛔ ao mesmo tempo: ⛔ uma linha
   * dizendo *"a dose varia com o INR (Figura 2)"* ⛔ e ⛔ **⛔ outra dando
   * números**.
   *
   * ── ⚠️⚠️⚠️ ⛔ **⛔ NÃO HÁ MISMATCH DE AGENTE** — 2026-09-09 ─────────────
   *
   * ⛔ ⛔ ⛔ Houve **⛔ suspeita**, ⛔ levantada pelo autor: ⛔ o achado ⛔ foi
   * ⛔ relatado ⛔ como sendo ⛔ do slot `dabigatrana`, ⛔ e ⛔ *"INR ≥2,0:
   * 4F-PCC… vitamina K"* ⛔ **⛔ num slot de dabigatrana**
   * ⛔ seria ⛔ conteúdo deslocado — ⛔ dos erros ⛔ mais perigosos ⛔ possíveis.
   *
   * ⚠️⚠️ ⛔ **⛔ Era defeito ⛔ do extrator ⛔ da auditoria**, ⛔ e ⛔ não do
   * app: ⛔ ele pegava ⛔ o `id` ⛔ do bloco **⛔ seguinte** ⛔ à frase.
   * ⛔ O texto ⛔ sempre esteve ⛔ no slot `vka`.
   *
   * ⛔ ⛔ Mapa conferido ⛔ em 2026-09-09, ⛔ e ⛔ os três ⛔ **⛔ alinhados**:
   *
   *   · `vka` (varfarina)        → 4F-PCC ⛔ preferível a plasma + vitamina K
   *   · `dabigatrana`            → **idarucizumabe**
   *   · `inibidor_xa` (Xa)       → **andexanet alfa**
   *
   * ⚠️ ⛔ A suspeita ⛔ **⛔ se reduz ⛔ à dose**, ⛔ e ⛔ o alinhamento
   * agente↔conduta ⛔ **⛔ não** ⛔ está mais ⛔ em questão.
   *
   * ── ⚠️⚠️ ⛔ E O QUE ⛔ **⛔ NÃO** CONTA COMO CONFERÊNCIA ────────────────
   *
   * ⛔ ⛔ Materiais **⛔ secundários ⛔ do próprio projeto** sustentam
   * 4F-PCC ⛔ de ~25–50 UI/kg ⛔ conforme INR/produto, ⛔ e ~10–20 UI/kg
   * ⛔ para INR 1,3–1,9. ⚠️ ⛔ **⛔ Isso ⛔ não é conferência ⛔ da AHA/ASA
   * HIC 2022** — ⛔ é ⛔ material ⛔ que ⛔ o projeto ⛔ produziu, ⛔ e ⛔ a
   * hipodensidade ⛔ mostrou ⛔ o que ⛔ acontece ⛔ quando ⛔ material
   * intermediário ⛔ vira ⛔ prova.
   *
   * ⛔ ⛔ ⛔ **⛔ A pendência real ⛔ é ⛔ uma só:** ⛔ conferir a **Figura 2**
   * da diretriz ⛔ **⛔ primária**. ⛔ Só ⛔ depois ⛔ dela ⛔ `dose` ⛔ e
   * `forca_de_recomendacao` ⛔ podem ⛔ virar `conferido_pdf`.
   *
   * ⛔ ⛔ ⛔ **⛔ Nada aqui é corrigido ⛔ antes ⛔ disso.**
   */
  {
    alvo: "vka",
    proposicao: "escolha_do_agente",
    estado: "transcrito",
    nota: "4F-PCC preferível a plasma, com vitamina K IV: está na transcrição da HIC 2022 (linhas 93 e 99).",
  },
  /**
   * ── ⚠️⚠️⚠️ ⛔ CONFERIDO ⛔ NA FONTE PRIMÁRIA — 2026-09-09 ────────────────
   *
   * ⚠️ ⛔ A pendência ⛔ **⛔ fechou**: o autor abriu a **Figura 2** da
   * AHA/ASA HIC 2022 — *Management of anticoagulant-related hemorrhage* —
   * ⛔ e ⛔ o texto do app ⛔ **⛔ corresponde**:
   *
   *   · INR 1,3–1,9 → `4-F PCC 10–20 IU/kg` · **Classe 2b**
   *   · INR ≥2,0    → `4-F PCC 25–50 IU/kg` · **Classe 1**
   *   · ambos       → `IV Vitamin K`        · **Classe 1**
   *
   * ⛔ ⛔ ⛔ **⛔ Nada da redação clínica mudou** — ⛔ e ⛔ é ⛔ isso que
   * ⛔ `conferido_pdf` ⛔ significa ⛔ aqui: ⛔ **⛔ alguém olhou ⛔ e estava
   * certo**. ⚠️ ⛔ O estado ⛔ registra ⛔ o ato de conferir, ⛔ e ⛔ não ⛔ o
   * ato de corrigir.
   *
   * ⚠️⚠️ ⛔ E ⛔ o número ⛔ **⛔ continua ausente ⛔ da transcrição**: ⛔ ele
   * vive ⛔ numa **⛔ figura**, ⛔ que ⛔ o arquivo `fontes-verbatim` ⛔ não
   * transcreve. ⛔ Se ⛔ alguém ⛔ rodar o auditor ⛔ amanhã, ⛔ ele ⛔ vai
   * apontar ⛔ de novo — ⛔ **⛔ e ⛔ deve**. ⛔ O que ⛔ responde ⛔ por ⛔ ele
   * ⛔ é ⛔ este registro, ⛔ e ⛔ não ⛔ o silêncio ⛔ do auditor.
   */
  {
    alvo: "vka",
    proposicao: "dose",
    estado: "conferido_pdf",
    por: "Sandro Dainez",
    quando: "2026-09-09",
    nota:
      "AHA/ASA 2022 HIC, Figure 2 (Management of anticoagulant-related hemorrhage). INR 1,3-1,9 -> 4-F PCC 10-20 IU/kg; INR >=2,0 -> 4-F PCC 25-50 IU/kg; ambos -> IV Vitamin K. O texto do app corresponde; nada foi alterado. O número não aparece na transcrição porque vive numa FIGURA, que fontes-verbatim não transcreve — o auditor vai continuar apontando, e é este registro que responde por ele.",
  },
  {
    alvo: "vka",
    proposicao: "forca_de_recomendacao",
    estado: "conferido_pdf",
    por: "Sandro Dainez",
    quando: "2026-09-09",
    nota:
      "AHA/ASA 2022 HIC, Figure 2. Classe 2b para INR 1,3-1,9; Classe 1 para INR >=2,0; Classe 1 para vitamina K IV. Corresponde ao que o app exibe.",
  },
];

/**
 * ⚠️ ⛔ O estado de **uma afirmação** — ⛔ e o padrão ⛔ é ⛔ o mais fraco.
 *
 * ⛔ ⛔ Pedir ⛔ só o `alvo` ⛔ devolveria ⛔ o estado ⛔ de ⛔ **⛔ alguma**
 * proposição ⛔ dele, ⛔ que ⛔ é ⛔ a otimização ⛔ que ⛔ este arquivo
 * ⛔ existe ⛔ para ⛔ impedir.
 */
export function conferenciaDe(
  alvo: string,
  proposicao: TipoDeProposicao
): EstadoDeConferencia {
  return (
    CONFERENCIAS.find((c) => c.alvo === alvo && c.proposicao === proposicao)?.estado ??
    "nao_conferido"
  );
}

/** ⚠️ ⛔ O que ⛔ ainda ⛔ espera ⛔ alguém ⛔ abrir a fonte. */
export function pendentesDeConferencia(): readonly Conferencia[] {
  return CONFERENCIAS.filter((c) => c.estado === "nao_conferido" || c.estado === "transcrito");
}
