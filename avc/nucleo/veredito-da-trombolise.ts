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
 *     verbos vêm de `RECOMENDACOES` ⛔ e de `CRITERIOS_DA_INDICACAO_IVT`
 *     (**E-29**, **E-31**).
 *   · ⚠️ O veredito **cita quem o sustenta**, ⛔ e por isso é conferível.
 *
 * ── ⚠️⚠️⚠️ D1 · A CONCLUSÃO É **COMPOSTA**, ⛔ E ⛔ NÃO DE UMA RECOMENDAÇÃO SÓ
 *    (commit 6 · 2026-09-12 · AVC-01)
 *
 * ⛔ ⛔ A primeira versão fechava `indicada` com **qualquer** recomendação
 * favorável `aplicavel`. ⚠️ Medido: **só peso** ⇒ indicada (§4.6.2 rec. 1
 * pressupõe elegibilidade ⛔ e exige só peso); **só "Incapacitante"** ⇒
 * indicada (§4.6.1 rec. 1 é princípio de condução). ⛔ Uma recomendação que
 * **pressupõe** elegibilidade estava **estabelecendo** elegibilidade.
 *
 * ⚠️ Decisão do autor: *"'Trombólise indicada' … deve ser uma DERIVAÇÃO
 * COMPOSTA ⛔ E EXPLICÁVEL do estado clínico, ⛔ usando somente regras já
 * sustentadas pelas fontes ⛔ e pelo contrato. ⛔ Não atribua à guideline a
 * frase individual. A conclusão individual é derivação determinística do
 * aplicativo a partir das regras-fonte aplicáveis."*
 *
 * ⚠️ Os critérios moram em `CRITERIOS_DA_INDICACAO_IVT` (dados, ⛔ com verbatim
 * ⛔ e leitor já existente): elegibilidade clínica · temporal · classe de
 * imagem · segurança. ⛔ As rotas de janela estendida (2a/2b) sustentam ⛔ só
 * quando **todos** os seus requisitos estão satisfeitos (**HR-2**).
 *
 * ── ⚠️⚠️ AS SEIS SAÍDAS, ⛔ E POR QUE ⛔ NÃO SÃO DUAS ────────────────────────
 *
 * ⛔ *"Indicada"* × *"⛔ não indicada"* seria uma armadilha: transformaria
 * **falta de dado** em **contraindicação**, ⛔ e alguém deixaria de trombolisar
 * porque um campo estava vazio (**E-37**: ⛔ não perguntado ≠ perguntado ⛔ e
 * ⛔ não sabido).
 *
 *   1. `retida` — a imagem ⛔ não excluiu hemorragia (bloqueio de classe).
 *   2. `nao_recomendada` — há recomendação **COR 3** de população que alcança.
 *   3. `indicada` — a composição fechou: rota ∧ classe ∧ segurança.
 *   4. `nao_sustentada` — algum critério **respondeu contra** (fora da janela
 *      ⛔ sem rota estendida que alcance; déficit assumido como ⛔ não
 *      incapacitante ⛔ sem outra rota; impeditivo de segurança). ⚠️ É
 *      **resposta**, ⛔ e ⛔ nunca *"contraindicada"*: ⛔ a palavra ⛔ não é da
 *      fonte para esses casos.
 *   5. `incompleta` — ⛔ nada fecha ⛔ **porque faltam dados**, ⛔ e a saída
 *      **nomeia quais**.
 *   6. `sem_criterios` — ⛔ nem os insumos mínimos existem ⛔ ainda.
 *
 * ── ⚠️⚠️ ⛔ E A DECISÃO ⛔ NÃO É DO APP ──────────────────────────────────────
 *
 * ⚠️ `RESSALVA_DO_VEREDITO` viaja **dentro** do veredito, ⛔ e ⛔ não como nota de
 * rodapé da tela: quem consome o veredito é obrigado a receber também a frase
 * que diz de quem é a decisão. ⛔ Separá-los permitiria exibir a conclusão ⛔ sem
 * ela. ⚠️ E `autoria` diz de quem é a **composição**: do aplicativo, ⛔ nunca da
 * guideline.
 */
import type { EstadoAvc } from "./estado";
import { barreiraDeReperfusao, type BarreiraDeReperfusao } from "./derivacoes-c";
import {
  bloqueiosCorrigiveis,
  impedimentosDeSeguranca,
  type BloqueioCorrigivel,
} from "./derivacoes-d";
import {
  horasEMinutos,
  msDesdeCampoDoEstado,
  recomendacoesDoEstado,
  valorDoInsumo,
  valorDaJanela,
  type LeituraDaRecomendacao, conflitoDeMarcos } from "./derivacoes-f";
import { camposDoMarco } from "./apresentacao-f";
import {
  CRITERIOS_DA_INDICACAO_IVT,
  RECOMENDACOES,
  type CriterioDaIndicacao,
  type PapelDoCriterio,
  type Recomendacao,
} from "../conteudo/superficie-f";
import type { SuperficieId } from "./tipos";

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
 * ⚠️⚠️ DE QUEM É A COMPOSIÇÃO — ⛔ do aplicativo, ⛔ e ⛔ nunca da guideline.
 *
 * ⚠️ Decisão do autor: *"Não atribua à guideline a frase individual 'este
 * paciente deve trombolisar' se essa frase ⛔ não existir."* ⛔ Cada critério
 * cita a sua regra-fonte; ⛔ a junção deles é derivação de **nível 3** (§6.9).
 */
export const AUTORIA_DO_VEREDITO =
  "Conclusão composta pelo aplicativo a partir das regras-fonte citadas em cada critério. Nenhuma recomendação isolada afirma esta frase.";

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
 * ⚠️⚠️ POR ISSO SÃO **TRÊS** DESFECHOS NEGATIVOS, ⛔ e ⛔ não um:
 *
 *   · `retida` — a imagem ⛔ não excluiu hemorragia. ⚠️ É o **bloqueio de
 *     classe** (**R2.1 / E-08**), ⛔ e a fonte é explícita: *"exclude
 *     intracranial hemorrhage **before initiating reperfusion interventions**"*
 *     (F-16 rec. 1 · **COR 1 · LOE A**).
 *   · `nao_recomendada` — há recomendação **COR 3** que alcança este caso.
 *     ⚠️ A tela usa o verbo da diretriz, ⛔ e ⛔ não uma tradução mais dura.
 *   · `nao_sustentada` — um critério da composição **respondeu contra**.
 *     ⚠️ É resposta do aplicativo (nível 3), ⛔ e ⛔ ela nomeia o critério.
 */
export type TipoDeVeredito =
  | "retida"
  | "nao_recomendada"
  | "indicada"
  | "nao_sustentada"
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

/**
 * ⚠️⚠️ O ESTADO DE UM CRITÉRIO — ⛔ **quatro**, ⛔ e ⛔ não dois.
 *
 * ⛔ `ausente` ⛔ nunca vira `contradito` (**E-23**); `em_julgamento` é a
 * situação que a fonte manda o médico ponderar (⛔ entra no commit 7).
 */
/** ⚠️ `em_reconciliacao` (O4, 2026-09-12): dois marcos conhecidos ⛔ e incompatíveis — ⛔ nem sim ⛔ nem não. */
export type EstadoDoCriterio = "satisfeito" | "contradito" | "ausente" | "em_julgamento" | "em_reconciliacao";

/**
 * ⚠️⚠️ UM CRITÉRIO **AVALIADO** — ⛔ e é ⛔ isto que torna a conclusão explicável
 * (**E-22**): papel · estado · valor legível · fonte · onde resolver.
 */
export type CriterioAvaliado = {
  readonly id: string;
  readonly papel: PapelDoCriterio;
  readonly rotulo: string;
  readonly estado: EstadoDoCriterio;
  /** ⚠️ O valor **como o médico o lê** — ⛔ e ⛔ nunca um número cru. */
  readonly valor?: string;
  readonly fonte: string;
  readonly localizacao: string;
  readonly verbatim: string;
  readonly oQueFalta: string;
  readonly leva: SuperficieId;
  readonly campo?: string;
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
   *
   * ⚠️ Ids de insumo ⛔ ou de campo — `acaoPendente()` traduz os dois.
   */
  readonly faltam: readonly string[];
  /**
   * ⚠️⚠️ OS CRITÉRIOS DA COMPOSIÇÃO, ⛔ um a um (D1). ⛔ É ⛔ aqui que o médico
   * confere **por que** o app concluiu o que concluiu.
   */
  readonly criteriosAvaliados: readonly CriterioAvaliado[];
  /** ⚠️ **Nível 3** de construção (§6.9): derivação do aplicativo, ⛔ não citação. */
  readonly nivelDeConstrucao: 3;
  readonly autoria: string;
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

/* ────────────────────────────────────────────────────────────────────────────
 * ⚠️⚠️⚠️ A AVALIAÇÃO DOS CRITÉRIOS — ⛔ cada um lido pelo leitor que **já existe**
 * ────────────────────────────────────────────────────────────────────────── */

function base(c: CriterioDaIndicacao) {
  return {
    id: c.id,
    papel: c.papel,
    rotulo: c.rotulo,
    fonte: c.slot,
    localizacao: c.localizacao,
    verbatim: c.verbatim,
    oQueFalta: c.oQueFalta,
    leva: c.leva,
    campo: c.campo,
  };
}

/** ⚠️ O tempo decorrido pelo primeiro marco da janela que estiver registrado — ⛔ para o médico ler. */
function tempoLegivel(
  estado: EstadoAvc,
  c: CriterioDaIndicacao,
  agoraMs: number
): string | undefined {
  for (const j of c.janelas ?? []) {
    for (const campo of camposDoMarco(j.marco)) {
      const ms = msDesdeCampoDoEstado(estado, campo, agoraMs);
      if (ms !== undefined) return horasEMinutos(Math.round(ms / 60_000));
    }
  }
  return undefined;
}

function avaliarCriterio(
  estado: EstadoAvc,
  c: CriterioDaIndicacao,
  agoraMs: number,
  barreira: BarreiraDeReperfusao
): CriterioAvaliado {
  const b = base(c);

  switch (c.papel) {
    case "elegibilidade_clinica": {
      /** ⚠️ O mesmo leitor do insumo — ⛔ *"Incerto"* permanece indeterminado. */
      const v = valorDoInsumo(estado, "deficit_incapacitante");
      if (v === "satisfaz") return { ...b, estado: "satisfeito", valor: "Incapacitante" };
      if (v === "contradiz") {
        return {
          ...b,
          estado: "contradito",
          valor: "Não incapacitante",
          oQueFalta: "Déficit assumido como não incapacitante",
        };
      }
      return { ...b, estado: "ausente" };
    }

    case "temporal": {
      /**
       * ⚠️⚠️ MARCOS INCOMPATÍVEIS (O4): ⛔ última vez bem ⛔ e início observado
       * conhecidos ⛔ e opostos quanto à janela. ⛔ Nenhum é escolhido; ⛔ o
       * critério fica em reconciliação ⛔ e nomeia os dois campos.
       */
      const conflito = conflitoDeMarcos(estado, c.janelas ?? [], agoraMs);
      if (conflito !== undefined) {
        return {
          ...b,
          estado: "em_reconciliacao",
          oQueFalta:
            "Última vez visto bem e início observado do déficit respondem de forma oposta à janela. Corrija ou desfaça o registro errado; o aplicativo não escolhe entre eles",
        };
      }
      /** ⚠️ ⛔ A MESMA função que as recomendações usam (**I6**); ⛔ o marco é o da fonte (HR-1). */
      const v = valorDaJanela(estado, c.janelas ?? [], agoraMs);
      const valor = tempoLegivel(estado, c, agoraMs);
      if (v === "satisfaz") return { ...b, estado: "satisfeito", valor };
      if (v === "contradiz") {
        return {
          ...b,
          estado: "contradito",
          valor,
          oQueFalta: "Fora da janela padrão; só uma recomendação de janela estendida alcançaria o caso",
        };
      }
      return { ...b, estado: "ausente" };
    }

    case "classe_imagem": {
      if (barreira.estado === "liberada") {
        return { ...b, estado: "satisfeito", valor: "Sem hemorragia intracraniana identificada" };
      }
      /**
       * ⚠️ Achado positivo/divergência ⛔ nunca chega aqui — o veredito devolve
       * `retida` antes. ⛔ O que resta é **falta de exclusão**: ausência, ⛔ e
       * ⛔ nunca hemorragia (**E-23**).
       */
      return { ...b, estado: "ausente", oQueFalta: barreira.oQueFalta };
    }

    case "seguranca": {
      /**
       * ⚠️⚠️ A SEGURANÇA **TIPADA** (R3, commit 7) — ⛔ e o critério ⛔ só traduz
       * o efeito que D ⛔ já declarou:
       *
       *   · `impede` ⇒ **contradito** (corte cruzado, item ⛔ não corrigível);
       *   · `impede_ate_reconciliar` · `impede_ate_resultado` · `aguarda_juizo`
       *     ⇒ **ausente** — ⛔ falta o gesto que resolve, ⛔ e ⛔ ele é nomeado;
       *   · `exige_julgamento` ⇒ **em_julgamento** — ⛔ nunca contradito
       *     (**HR-4**), ⛔ e ⛔ nunca satisfeito por omissão;
       *   · `condicao_resolutiva` · `informa` ⇒ ⛔ não retêm.
       *
       * ⛔ Exame ⛔ não colhido **sem** motivo de suspeita ⛔ não é impeditivo
       * (🚫 marca 2) — ⛔ é **E-47**, ⛔ e o portão o mostra como condição.
       */
      const impedimentos = impedimentosDeSeguranca(estado);
      const dado = (efeitos: readonly string[]) =>
        impedimentos.filter((i) => efeitos.includes(i.efeito));
      const impedem = dado(["impede"]);
      if (impedem.length > 0) {
        return {
          ...b,
          estado: "contradito",
          valor: impedem.map((i) => (i.dado ? `${i.rotulo} ${i.dado}` : i.rotulo)).join(" · "),
          oQueFalta: "Há impeditivo de segurança registrado",
        };
      }
      const pendentes = dado(["impede_ate_reconciliar", "impede_ate_resultado", "aguarda_juizo"]);
      if (pendentes.length > 0) {
        const p = pendentes[0];
        return {
          ...b,
          estado: "ausente",
          valor: p.dado ? `${p.rotulo} — ${p.dado}` : p.rotulo,
          oQueFalta: p.oQueFalta,
          leva: p.leva,
          campo: p.campo,
        };
      }
      const julgamentos = dado(["exige_julgamento"]);
      if (julgamentos.length > 0) {
        return {
          ...b,
          estado: "em_julgamento",
          valor: julgamentos.map((i) => i.rotulo).join(" · "),
          oQueFalta: julgamentos[0].oQueFalta,
          leva: julgamentos[0].leva,
          campo: julgamentos[0].campo,
        };
      }
      return { ...b, estado: "satisfeito" };
    }
  }
}

/** ⚠️ Uma rota de janela estendida que **sustenta** — ⛔ todos os requisitos dela satisfeitos (HR-2). */
function criterioDaRota(l: LeituraDaRecomendacao): CriterioAvaliado {
  return {
    id: l.id,
    papel: "rota_estendida",
    rotulo: "Recomendação de janela estendida aplicável",
    estado: "satisfeito",
    valor: l.populacao,
    fonte: l.slot,
    localizacao: l.localizacao,
    verbatim: l.verbo,
    oQueFalta: "",
    leva: "reperfusao",
  };
}

/**
 * ⚠️⚠️ A ORDEM DE PRECEDÊNCIA — ⛔ ela ⛔ não é estilo, ⛔ e ⛔ nenhum ramo pode
 * trocar de lugar ⛔ sem mudar medicina.
 *
 *   1. ⚠️ **Hemorragia na imagem vence tudo.** É o único bloqueio de CLASSE do
 *      módulo (**R2.1 / E-08**, F-16 rec. 1 · **COR 1 · LOE A**).
 *   2. ⚠️ **COR 3 de população que se aplica** — achado que a diretriz desaconselha.
 *   3. ⚠️ **A composição fechou** — rota ∧ classe ∧ segurança.
 *   4. ⚠️ **Critério respondeu contra**, ⛔ e ⛔ nenhuma rota alcança.
 *   5. ⚠️ **Falta dado** — ⛔ e a saída nomeia qual.
 *
 * ⚠️⚠️ `agoraMs` É **OBRIGATÓRIO** — commit 3 (AVC-02, R2). ⛔ Quem **decide**
 * exige relógio (**E-21**); ⛔ o instante vem de quem chama, ⛔ nunca de
 * `Date.now()` ⛔ aqui.
 */
export function vereditoDaTrombolise(estado: EstadoAvc, agoraMs: number): VereditoDaTrombolise {
  const corrigirAntes = bloqueiosCorrigiveis(estado);
  const barreira = barreiraDeReperfusao(estado);
  const comum = {
    corrigirAntes,
    ressalva: RESSALVA_DO_VEREDITO,
    autoria: AUTORIA_DO_VEREDITO,
    nivelDeConstrucao: 3 as const,
  };

  /* ── 1 · o bloqueio de classe ──────────────────────────────────────────── */

  /**
   * ⚠️⚠️ ⛔ LIDO DA **BARREIRA DE CLASSE** (R1, commit 2), ⛔ e ⛔ não de uma
   * releitura da imagem. ⛔ Achado positivo ⛔ ou divergência ⇒ `retida` (⛔ é
   * resposta); ⛔ sem imagem ⛔ ou ⛔ sem laudo ⇒ a composição fica `incompleta`
   * — ⛔ ausência ⛔ não é hemorragia (**E-23**), ⛔ mas ⛔ também ⛔ nunca libera.
   */
  if (
    barreira.estado === "retida"
    && (barreira.motivo === "hemorragia_presente" || barreira.motivo === "divergente")
  ) {
    return {
      ...comum,
      tipo: "retida",
      /** ⚠️ A frase vem da própria leitura da imagem — ⛔ e ⛔ não é reescrita aqui. */
      frase: barreira.curto,
      sustentam: [],
      contra: [],
      faltam: [],
      criteriosAvaliados: [],
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
      ...comum,
      tipo: "nao_recomendada",
      /** ⚠️ *"⛔ não recomenda"* — ⛔ e ⛔ nunca *"contraindica"*. A força é da fonte. */
      frase: "A diretriz não recomenda a trombólise neste caso",
      sustentam: [],
      contra: contra.map(motivo),
      faltam: [],
      criteriosAvaliados: [],
    };
  }

  /* ── 3 · a composição (D1) ─────────────────────────────────────────────── */

  const avaliados = CRITERIOS_DA_INDICACAO_IVT.map((c) => avaliarCriterio(estado, c, agoraMs, barreira));
  const por = (papel: PapelDoCriterio) => avaliados.find((c) => c.papel === papel)!;
  const clinica = por("elegibilidade_clinica");
  const temporal = por("temporal");
  const classe = por("classe_imagem");
  const seguranca = por("seguranca");

  /**
   * ⚠️⚠️ ROTAS ESTENDIDAS (**HR-2**): ⛔ só `aplicavel` sustenta — ⛔ todos os
   * `exige` satisfeitos, ⛔ inclusive a janela da própria recomendação.
   * ⛔ `nao_avaliavel` (F-31) ⛔ nunca sustenta; `potencialmente_aplicavel` ⛔ só
   * nomeia o que falta.
   */
  const favoraveis = ivt.filter((l) => !ehCor3(l.cor));
  const rotasQueSustentam = favoraveis.filter((l) => l.correspondencia === "aplicavel");
  const rotasPotenciais = favoraveis.filter((l) => l.correspondencia === "potencialmente_aplicavel");

  const rotaPadrao = clinica.estado === "satisfeito" && temporal.estado === "satisfeito";
  const rotaSustenta = rotaPadrao || rotasQueSustentam.length > 0;

  /** ⚠️ Os critérios que a tela lista: ⛔ a rota que sustentou, ⛔ ou os dois da rota padrão. */
  const criteriosDaRota: CriterioAvaliado[] =
    !rotaPadrao && rotasQueSustentam.length > 0
      ? rotasQueSustentam.map(criterioDaRota)
      : [clinica, temporal];
  const criterios: CriterioAvaliado[] = [...criteriosDaRota, classe, seguranca];

  if (rotaSustenta && classe.estado === "satisfeito" && seguranca.estado === "satisfeito") {
    return {
      ...comum,
      tipo: "indicada",
      frase: "Os critérios registrados sustentam a trombólise",
      sustentam: rotasQueSustentam.map(motivo),
      contra: [],
      faltam: [],
      criteriosAvaliados: criterios,
    };
  }

  /* ── 4 · critério que respondeu CONTRA, ⛔ e ⛔ nenhuma rota alcança ────── */

  /**
   * ⚠️⚠️ ⛔ *"Fora da janela"* ⛔ e *"⛔ não incapacitante"* ⛔ só fecham o
   * veredito quando **⛔ nenhuma** rota estendida ⛔ ainda pode alcançar o caso
   * (**HR-2**: *"falta de qualquer requisito pertinente mantém incompleta"*).
   * ⚠️ Segurança contradita fecha sempre — ⛔ e o portão a mostra na camada dela.
   */
  const rotaContradita =
    !rotaSustenta
    && (clinica.estado === "contradito" || temporal.estado === "contradito")
    && rotasPotenciais.length === 0;
  if (seguranca.estado === "contradito" || rotaContradita) {
    return {
      ...comum,
      tipo: "nao_sustentada",
      frase: "Os critérios registrados não sustentam a trombólise",
      sustentam: [],
      contra: [],
      faltam: [],
      criteriosAvaliados: criterios,
    };
  }

  /* ── 5 · ⛔ nada fechou **porque falta dado** ───────────────────────────── */

  /**
   * ⚠️⚠️ ⛔ SÓ AS FALTAS **PERTINENTES**: ⛔ os critérios da rota padrão ⛔ ainda
   * ⛔ não respondidos, ⛔ a classe ⛔ e ⛔ as rotas estendidas que **⛔ ainda
   * alcançam** o caso. ⛔ Incluir o que falta para avaliar uma COR 3 mandaria o
   * médico colher dado para confirmar uma recomendação **negativa**.
   */
  const faltam: string[] = [];
  const nomear = (id: string) => { if (!faltam.includes(id)) faltam.push(id); };
  if (!rotaSustenta) {
    if (clinica.estado === "ausente") nomear("deficit_incapacitante");
    if (temporal.estado === "ausente") nomear("janela");
    for (const l of rotasPotenciais) for (const i of l.faltam) nomear(i);
  }
  /** ⚠️ O campo vem do próprio critério (dado em `superficie-f`) — ⛔ este arquivo ⛔ não lê imagem. */
  if (classe.estado === "ausente" && classe.campo) nomear(classe.campo);
  /** ⚠️ Segurança pendente (reconciliar · resultado · juízo) — ⛔ o campo vem do próprio impedimento. */
  if (seguranca.estado === "ausente" && seguranca.campo) nomear(seguranca.campo);

  /**
   * ⚠️⚠️ MARCOS INCOMPATÍVEIS (O4): ⛔ não é *"faltam dados"* — ⛔ os dois
   * existem ⛔ e se contradizem. ⛔ *"janela"* sai da lista de faltas, porque
   * ⛔ "informar o horário" ⛔ não é o gesto que resolve; ⛔ o motivo do portão
   * nomeia os campos ⛔ e o gesto (corrigir ⛔ ou desfazer).
   */
  if (temporal.estado === "em_reconciliacao") {
    return {
      ...comum,
      tipo: "incompleta",
      frase: "Ainda não dá para concluir: os marcos temporais registrados são incompatíveis",
      sustentam: [],
      contra: [],
      faltam: faltam.filter((i) => i !== "janela"),
      criteriosAvaliados: criterios,
    };
  }

  if (faltam.length > 0 || avaliados.some((c) => c.estado === "ausente")) {
    return {
      ...comum,
      tipo: "incompleta",
      frase: "Ainda não dá para concluir: faltam dados",
      sustentam: [],
      contra: [],
      faltam,
      criteriosAvaliados: criterios,
    };
  }

  /**
   * ⚠️⚠️ ⛔ SÓ O JULGAMENTO INDIVIDUAL FALTA (**HR-4**): ⛔ nenhum dado está
   * ausente, ⛔ nenhum contradito — ⛔ e ⛔ mesmo assim o app ⛔ não conclui
   * *"indicada"*: ⛔ a fonte manda o médico ponderar, ⛔ e ⛔ isso ⛔ não se
   * converte em liberação automática. ⛔ Também ⛔ não é *"faltam dados"*.
   */
  if (seguranca.estado === "em_julgamento") {
    return {
      ...comum,
      tipo: "incompleta",
      frase: "Ainda não dá para concluir: há situação que a fonte manda avaliar individualmente",
      sustentam: rotasQueSustentam.map(motivo),
      contra: [],
      faltam: [],
      criteriosAvaliados: criterios,
    };
  }

  return {
    ...comum,
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
    criteriosAvaliados: criterios,
  };
}
