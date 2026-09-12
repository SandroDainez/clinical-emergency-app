/**
 * O VEREDITO DA TROMBÓLISE — o app **responde**, ⛔ e ⛔ não cala.
 *
 * ── ⚠️⚠️ O PEDIDO, E O QUE ELE MUDOU ───────────────────────────────────────
 *
 * > *"O APP DEVE SER CAPAZ DE DIZER SE ESTÁ INDICADO ⛔ OU ⛔ NÃO TROMBÓLISE COM
 * > OS CRITÉRIOS QUE TEM, ⛔ E DEPOIS CLARO QUE A DECISÃO FINAL É DO MÉDICO,
 * > ISSO TEM QUE FICAR CLARO."* — autor, 2026-09-06
 *
 * ⚠️ Até aqui o módulo **se recusava a concluir**. ⛔ A recusa protegia algo
 * real, ⛔ e ⛔ não some: `derivacoes-f.ts` proíbe **gravar** `elegivel_ivt` como
 * fato (**E-43**), porque veredito gravado dentro de um fato **congela** uma
 * conclusão que deveria mudar quando o dado muda — ⛔ e o congelado é o que
 * sobrevive à correção do dado.
 *
 * ⚠️⚠️ ESTE ARQUIVO ⛔ NÃO QUEBRA AQUELA REGRA, ⛔ e a diferença é o ponto:
 *
 *   · ⛔ **⛔ Nada aqui é gravado.** ⛔ Nenhum fato, ⛔ nenhum campo, ⛔ nenhuma
 *     trilha. É função **pura** sobre o estado, recalculada a cada leitura.
 *   · ⛔ **⛔ Nenhum número clínico nasce aqui.** Os critérios, os COR/LOE ⛔ e os
 *     verbos vêm de `RECOMENDACOES` (**E-29**, **E-31**).
 *   · ⚠️ O veredito **cita quem o sustenta**, ⛔ e por isso é conferível.
 *
 * ── ⚠️⚠️ AS QUATRO SAÍDAS, ⛔ E POR QUE ⛔ NÃO SÃO DUAS ──────────────────────
 *
 * ⛔ *"Indicada"* × *"⛔ não indicada"* seria uma armadilha: transformaria
 * **falta de dado** em **contraindicação**, ⛔ e alguém deixaria de trombolisar
 * porque um campo estava vazio (**E-37**: ⛔ não perguntado ≠ perguntado ⛔ e
 * ⛔ não sabido).
 *
 *   1. `contraindicada` — há **achado** que contraindica. ⛔ É resposta.
 *   2. `indicada` — ⛔ ao menos um critério fecha a favor, ⛔ e ⛔ nenhum contra.
 *   3. `incompleta` — ⛔ nada fecha ⛔ **porque faltam dados**, ⛔ e a saída
 *      **nomeia quais**. ⚠️ Isto ⛔ também é uma resposta — a mais honesta que
 *      existe quando o app ⛔ não sabe.
 *   4. `sem_criterios` — ⛔ nem os insumos mínimos existem ⛔ ainda.
 *
 * ── ⚠️⚠️ ⛔ E A DECISÃO ⛔ NÃO É DO APP ──────────────────────────────────────
 *
 * ⚠️ `RESSALVA_DO_VEREDITO` viaja **dentro** do veredito, ⛔ e ⛔ não como nota de
 * rodapé da tela: quem consome o veredito é obrigado a receber também a frase
 * que diz de quem é a decisão. ⛔ Separá-los permitiria exibir a conclusão ⛔ sem
 * ela.
 */
import type { EstadoAvc } from "./estado";
import { barreiraDeReperfusao } from "./derivacoes-c";
import { bloqueiosCorrigiveis, type BloqueioCorrigivel } from "./derivacoes-d";
import { recomendacoesDoEstado, type LeituraDaRecomendacao } from "./derivacoes-f";
import { RECOMENDACOES, type Insumo, type Recomendacao } from "../conteudo/superficie-f";

/**
 * ⚠️⚠️⚠️ O UNIVERSO DO VEREDITO — ⛔ filtrado por **domínio**, ⛔ e ⛔ nunca por
 * id ⛔ ou por texto (commit 4 · R2). ⚠️ Espelho exato de
 * `RECOMENDACOES_DE_ELEGIBILIDADE` da EVT.
 *
 * ⛔ Fora daqui — ⛔ e **⛔ ainda no catálogo, listadas ⛔ e citadas**: `agente`
 * (§4.6.2 rec. 1), `posologia` (§4.6.2 rec. 2) ⛔ e `principio` (§4.6.1 rec. 1).
 * ⛔ Nenhuma delas fala da **população**; ⛔ todas pressupõem a elegibilidade que
 * ⛔ este veredito existe para avaliar.
 */
export const RECOMENDACOES_DE_ELEGIBILIDADE_IVT: readonly Recomendacao[] =
  RECOMENDACOES.filter((r) => r.terapia === "ivt" && r.dominio === "elegibilidade");

/**
 * ⚠️⚠️ A FRASE QUE ⛔ NUNCA SAI DE PERTO DO VEREDITO.
 *
 * ⛔ Ela ⛔ não é aviso legal decorativo: ⛔ ela descreve o que o app fez —
 * **conferiu critérios contra o que foi registrado** — ⛔ e o que ele ⛔ não fez:
 * examinar o paciente.
 */
export const RESSALVA_DO_VEREDITO =
  "Conferência dos critérios da diretriz contra o que foi registrado. A decisão é do médico.";

/**
 * ⚠️⚠️ ⛔ NÃO EXISTE `contraindicada` AQUI — ⛔ e a ausência foi imposta por uma
 * prova, ⛔ não escolhida por gosto.
 *
 * ⛔ A primeira versão deste arquivo tinha `contraindicada`, ⛔ e
 * `prova-avc-apresentacao-f` reprovou: *"a palavra 'contraindicado' ⛔ NÃO
 * existe na tela — ⛔ COR 3 da fonte é `not recommended` / `No Benefit`, ⛔ e
 * converter inventa força que ela ⛔ não deu"*.
 *
 * ⚠️ A prova estava certa ⛔ e o código, errado. *"⛔ Não recomendado"* ⛔ e
 * *"contraindicado"* ⛔ não são sinônimos: o segundo é mais forte, ⛔ e a força
 * extra teria sido **fabricada pela tela**.
 *
 * ⚠️⚠️ POR ISSO SÃO **DOIS** DESFECHOS NEGATIVOS, ⛔ e ⛔ não um:
 *
 *   · `retida` — a imagem ⛔ não excluiu hemorragia. ⚠️ É o **bloqueio de
 *     classe** (**R2.1 / E-08**), ⛔ e a fonte é explícita: *"exclude
 *     intracranial hemorrhage **before initiating reperfusion interventions**"*
 *     (F-16 rec. 1 · **COR 1 · LOE A**).
 *   · `nao_recomendada` — há recomendação **COR 3** que alcança este caso.
 *     ⚠️ A tela usa o verbo da diretriz, ⛔ e ⛔ não uma tradução mais dura.
 */
export type TipoDeVeredito =
  | "retida"
  | "nao_recomendada"
  | "indicada"
  | "incompleta"
  | "sem_criterios";

/** ⚠️ Um motivo do veredito — ⛔ já legível, ⛔ e com a fonte junto. */
export type MotivoDoVeredito = {
  readonly id: string;
  /** ⚠️ O verbo **verbatim** da diretriz — ⛔ e ⛔ não a paráfrase da tela. */
  readonly verbo: string;
  readonly populacao: string;
  readonly cor: string;
  readonly loe: string;
  readonly slot: string;
  readonly localizacao: string;
};

export type VereditoDaTrombolise = {
  readonly tipo: TipoDeVeredito;
  /** ⚠️ A frase curta do veredito. ⛔ Ela ⛔ nunca diz "faça" ⛔ nem "⛔ não faça". */
  readonly frase: string;
  /** ⚠️ O que sustenta — recomendações que fecharam, com COR/LOE ⛔ e verbatim. */
  readonly sustentam: readonly MotivoDoVeredito[];
  /** ⚠️ O que contraindica — ⛔ achado, ⛔ e ⛔ nunca ausência. */
  readonly contra: readonly MotivoDoVeredito[];
  /**
   * ⚠️ O que **falta** para poder concluir — nomeado, ⛔ e ⛔ nunca "dados
   * insuficientes" genérico. ⚠️ Pendência sem nome é muro (**E-26**).
   */
  readonly faltam: readonly Insumo[];
  /**
   * ⚠️⚠️ CORRIGÍVEL ⛔ NÃO É CONTRAINDICAÇÃO — ⛔ e ⛔ por isso ⛔ não entra em
   * `contra`. ⚠️ PA acima da meta ⛔ e glicemia alterada **têm conserto**, ⛔ e
   * tratá-las como veredito negativo faria o app desaconselhar uma trombólise
   * que ⛔ só precisava de labetalol.
   */
  readonly corrigirAntes: readonly BloqueioCorrigivel[];
  /** ⚠️ ⛔ Sempre presente. ⛔ Quem exibe o veredito recebe isto junto. */
  readonly ressalva: string;
};

/** ⚠️ COR 3 = *"is not recommended"* / *"potentially harmful"* na fonte. */
function ehCor3(cor: string): boolean {
  return cor.startsWith("3");
}

function motivo(l: LeituraDaRecomendacao): MotivoDoVeredito {
  return {
    id: l.id,
    verbo: l.verbo,
    populacao: l.populacao,
    cor: l.cor,
    loe: l.loe,
    slot: l.slot,
    localizacao: l.localizacao,
  };
}

/**
 * ⚠️⚠️ A ORDEM DE PRECEDÊNCIA — ⛔ ela ⛔ não é estilo, ⛔ e ⛔ nenhum ramo pode
 * trocar de lugar ⛔ sem mudar medicina.
 *
 *   1. ⚠️ **Hemorragia na imagem vence tudo.** É o único bloqueio de CLASSE do
 *      módulo (**R2.1 / E-08**, F-16 rec. 1 · **COR 1 · LOE A**): *"exclude
 *      intracranial hemorrhage **before initiating reperfusion
 *      interventions**"*. ⛔ Nenhum critério favorável sobrevive a ele.
 *   2. ⚠️ **COR 3 que se aplica** — achado que a diretriz desaconselha.
 *   3. ⚠️ **Critério favorável que fechou.**
 *   4. ⚠️ **Falta dado** — ⛔ e a saída nomeia qual.
 */
/**
 * ⚠️⚠️ `agoraMs` É **OBRIGATÓRIO** — commit 3 · 2026-09-12 (AVC-02, R2).
 *
 * ⛔ Este veredito chamava `recomendacoesDoEstado(estado)` ⛔ sem relógio, ⛔ e
 * a janela ⛔ nunca era insumo da IVT: ⛔ um início há **72 h** saía `indicada`.
 * ⚠️ A mesma regra que `veredito-da-trombectomia` ⛔ já cumpria: *"um veredito
 * ⛔ não pode [ficar sem relógio], ⛔ porque a janela é um dos critérios
 * (**E-21**)"*. ⛔ Quem **decide** exige `agora`; ⛔ quem ⛔ só lista pode ⛔ não
 * ter. ⛔ O instante vem de quem chama (tela lê `relogio.agora()` uma vez por
 * render; provas usam `relogioControlado`) — ⛔ nunca de `Date.now()` ⛔ aqui.
 *
 * ⚠️ Neste commit a assinatura muda ⛔ e ⛔ **⛔ nenhum resultado clínico** muda
 * ⛔ ainda: ⛔ as recomendações IVT ⛔ só passam a declarar `criterios.janela`
 * no commit 5.
 */
export function vereditoDaTrombolise(estado: EstadoAvc, agoraMs: number): VereditoDaTrombolise {
  const corrigirAntes = bloqueiosCorrigiveis(estado);
  const base = { corrigirAntes, ressalva: RESSALVA_DO_VEREDITO };

  /* ── 1 · o bloqueio de classe ──────────────────────────────────────────── */

  /**
   * ⚠️⚠️ ⛔ LIDO DA **BARREIRA DE CLASSE**, ⛔ e ⛔ não de uma releitura da imagem
   * (R1, commit 2 · 2026-09-12). ⛔ Este arquivo reimplementava metade da regra
   * — ⛔ só `hemorragia_presente | divergente` — ⛔ e a outra metade
   * (`sem_imagem`, `resultado_pendente`) caía no catálogo como se a classe
   * estivesse aberta. ⚠️ Agora há **uma** função de classe (**I6**), ⛔ e ⛔ o que
   * este veredito decide é ⛔ só **como nomear** cada retenção:
   *
   *   · achado positivo ⛔ ou divergência ⇒ `retida` (⛔ é resposta);
   *   · ⛔ sem imagem ⛔ ou ⛔ sem laudo ⇒ segue para o catálogo ⛔ e sai
   *     `incompleta` — ⛔ ausência ⛔ não é hemorragia (**E-23**), ⛔ mas ⛔ também
   *     ⛔ nunca libera: ⛔ o portão consulta a barreira ⛔ por conta própria.
   */
  const barreira = barreiraDeReperfusao(estado);
  if (
    barreira.estado === "retida"
    && (barreira.motivo === "hemorragia_presente" || barreira.motivo === "divergente")
  ) {
    return {
      ...base,
      tipo: "retida",
      /**
       * ⚠️ A frase vem da própria leitura da imagem — ⛔ e ⛔ não é reescrita
       * aqui. ⚠️ Divergência ⛔ e hemorragia dizem coisas diferentes, ⛔ e cada
       * uma já tem a sua.
       */
      frase: barreira.curto,
      sustentam: [],
      contra: [],
      faltam: [],
    };
  }

  const leituras = recomendacoesDoEstado(estado, agoraMs);
  /**
   * ⚠️ ⛔ Só IVT **de elegibilidade** (commit 4): trombectomia é outra terapia,
   * ⛔ e agente, posologia ⛔ e princípio ⛔ não decidem candidatura.
   */
  const permitidos = new Set(RECOMENDACOES_DE_ELEGIBILIDADE_IVT.map((r) => r.id));
  const ivt = leituras.filter((l) => permitidos.has(l.id));

  /* ── 2 · o que a diretriz desaconselha, ⛔ e que se aplica a este caso ──── */

  const contra = ivt.filter((l) => ehCor3(l.cor) && l.correspondencia === "aplicavel");
  if (contra.length > 0) {
    return {
      ...base,
      tipo: "nao_recomendada",
      /**
       * ⚠️ *"⛔ não recomenda"* — ⛔ e ⛔ nunca *"contraindica"*. ⚠️ A diferença
       * entre os dois é a força, ⛔ e a força é da fonte.
       */
      frase: "A diretriz não recomenda a trombólise neste caso",
      sustentam: [],
      contra: contra.map(motivo),
      faltam: [],
    };
  }

  /* ── 3 · o que fechou a favor ──────────────────────────────────────────── */

  const aFavor = ivt.filter((l) => !ehCor3(l.cor) && l.correspondencia === "aplicavel");
  if (aFavor.length > 0) {
    return {
      ...base,
      tipo: "indicada",
      frase: "Os critérios registrados sustentam a trombólise",
      sustentam: aFavor.map(motivo),
      contra: [],
      faltam: [],
    };
  }

  /* ── 4 · ⛔ nada fechou **porque falta dado** ───────────────────────────── */

  /**
   * ⚠️⚠️ ⛔ SÓ AS FALTAS DAS RECOMENDAÇÕES **FAVORÁVEIS**, ⛔ e ⛔ não de todas.
   *
   * ⛔ Incluir o que falta para avaliar uma COR 3 mandaria o médico colher dado
   * para confirmar uma recomendação **negativa** — ⛔ e a tela pediria trabalho
   * que ⛔ não abre caminho ⛔ nenhum.
   *
   * ⛔ `nao_avaliavel` (dívida de fonte) ⛔ também ⛔ não entra: ⛔ nenhum dado do
   * paciente destrava uma fonte que o app ⛔ não tem.
   */
  const faltam: Insumo[] = [];
  for (const l of ivt) {
    if (ehCor3(l.cor)) continue;
    if (l.correspondencia !== "potencialmente_aplicavel") continue;
    for (const i of l.faltam) if (!faltam.includes(i)) faltam.push(i);
  }

  if (faltam.length > 0) {
    return {
      ...base,
      tipo: "incompleta",
      frase: "Ainda não dá para concluir: faltam dados",
      sustentam: [],
      contra: [],
      faltam,
    };
  }

  return {
    ...base,
    tipo: "sem_criterios",
    /**
     * ⚠️ ⛔ Nem "sim" ⛔ nem "não": ⛔ nenhum critério da diretriz alcançou este
     * caso ⛔ ainda. ⚠️ Dizer *"⛔ não indicada"* aqui seria inventar um achado a
     * partir de silêncio (**E-23**).
     */
    frase: "Nenhum critério da diretriz alcança este caso ainda",
    sustentam: [],
    contra: [],
    faltam: [],
  };
}
