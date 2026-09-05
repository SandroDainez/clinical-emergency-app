/**
 * RASCUNHO NUMÉRICO — quantos FATOS um gesto numérico escreve na trilha.
 *
 * ⚠️⚠️ ISTO ⛔ NÃO É ESTADO DE COMPONENTE EXTRAÍDO POR ARRUMAÇÃO. É a regra que
 * decide, para cada toque, se ele **vira fato** ou fica no rascunho — e a
 * trilha é append-only (§3.1): fato escrito ⛔ não volta atrás.
 *
 * ── ⚠️⚠️ AS DUAS NATUREZAS DE UM MESMO CONTROLE ─────────────────────────────
 *
 *   · **primeira medida** (`"direto"`) — uma glicemia sendo digitada. O valor
 *     que cai dentro da faixa É a medida, e gravá-lo na hora é o certo: ⛔ não
 *     existe "rascunho de glicemia" para o médico confirmar depois.
 *
 *   · **correção** (`"comConfirmacao"`) — um ASPECTS já registrado sendo
 *     trocado. ⛔ Aqui cada toque ⛔ NÃO é um fato: corrigir 1 → 7 com o `+`
 *     escreveria **seis correções**, e a auditoria leria que o médico corrigiu
 *     seis vezes. ⛔ Ele corrigiu **uma**.
 *
 * ⚠️ O defeito ⛔ não é hipotético: foi achado pelo e2e do sentinela do ASPECTS
 * em 2026-08-30, no controle antigo. ⚠️ Esta é a **mesma regra**, agora fora do
 * JSX — porque regra que mora dentro de um componente ⛔ não pode ser executada
 * por trava nenhuma, e a migração visual seguinte a reescreve de memória.
 *
 * ── ⚠️⚠️ O QUE ESTE MÓDULO ⛔ NÃO FAZ ────────────────────────────────────────
 *
 *   ⛔ ⛔ Não conhece campo, unidade, ⛔ nem medicina: recebe faixa e gesto.
 *   ⛔ ⛔ Não guarda estado — devolve o próximo rascunho ⛔ e o efeito, ⛔ e quem
 *      chama decide o que fazer com eles.
 *   ⛔ ⛔ Não sabe desenhar. ⛔ Nenhum pixel nasce aqui (E-29).
 */

/** ⚠️ A faixa é do CONTEÚDO clínico — este módulo ⛔ só a respeita. */
export type FaixaNumerica = { readonly min: number; readonly max: number; readonly passo: number };

/**
 * ⚠️⚠️ O MODO É EXPLÍCITO, ⛔ e ⛔ nunca inferido de "já tem valor".
 *
 * ⛔ Deduzir correção da presença de um valor gravado poria o app decidindo
 * sozinho que redigitar é corrigir — exatamente a semântica implícita que o
 * autor proibiu em 2026-08-30: *"o gesto precisa ser explícito"*.
 */
export type ModoDoRascunho = "direto" | "comConfirmacao";

export type GestoNumerico =
  /** ⚠️ O texto CRU da caixa — com letra, espaço ⛔ e o que mais o teclado mandar. */
  | { readonly tipo: "digitou"; readonly texto: string }
  /** ⚠️ `+` ⛔ e `−`: movimento RELATIVO, ⛔ e ⛔ nunca um valor de partida. */
  | { readonly tipo: "ajustou"; readonly delta: number }
  /** ⚠️ Saiu da caixa (blur). */
  | { readonly tipo: "saiu" }
  /** ⚠️ ⛔ Só existe em `comConfirmacao`: é o gesto que **grava**. */
  | { readonly tipo: "confirmou" }
  /** ⚠️ Desistiu da correção. */
  | { readonly tipo: "cancelou" };

/**
 * ⚠️ ⛔ Zero ⛔ ou um efeito por gesto. ⛔ Nunca dois — dois efeitos seriam dois
 * fatos, ⛔ e é isso que este módulo existe para impedir.
 */
export type EfeitoNumerico =
  | { readonly tipo: "nada" }
  | { readonly tipo: "medir"; readonly valor: number }
  | { readonly tipo: "desfazer" };

const NADA: EfeitoNumerico = { tipo: "nada" };

/** ⚠️ ⛔ Só dígitos: ⛔ nem sinal, ⛔ nem espaço, ⛔ nem letra num campo clínico. */
function apenasDigitos(bruto: string): string {
  return bruto.replace(/[^0-9]/g, "");
}

/**
 * ⚠️ O número que o rascunho representa — ⛔ ou `undefined` quando ele ainda
 * ⛔ não é um número **de dentro da faixa**.
 *
 * ⚠️⚠️ É O QUE IMPEDE `1` E `17` DE VIRAREM MEDIDA ao digitar **178**: os
 * estados intermediários existem no rascunho, ⛔ e ⛔ não chegam à trilha.
 */
function numeroDoRascunho(rascunho: string | undefined, faixa: FaixaNumerica): number | undefined {
  if (rascunho === undefined || rascunho === "") return undefined;
  const n = Number(rascunho);
  if (!Number.isFinite(n)) return undefined;
  return n >= faixa.min && n <= faixa.max ? n : undefined;
}

/**
 * ⚠️ Há de onde o `−/+` partir?
 *
 * ⚠️⚠️ Exportada porque o **desenho** precisa da mesma resposta que a regra: o
 * botão inerte ⛔ e o ajuste que ⛔ não grava têm de ser a MESMA condição. ⛔ Duas
 * cópias dessa conta é como nasce um `+` clicável que ⛔ não faz nada — ou pior,
 * um `+` inerte sobre um valor que existia.
 */
export function temPartida(
  gravado: number | undefined,
  rascunho: string | undefined,
  faixa: FaixaNumerica
): boolean {
  return (numeroDoRascunho(rascunho, faixa) ?? gravado) !== undefined;
}

export type PassoDoRascunho = {
  /** ⚠️ O próximo rascunho. `undefined` = a caixa volta a espelhar o gravado. */
  readonly rascunho: string | undefined;
  readonly efeito: EfeitoNumerico;
};

/**
 * A TRANSIÇÃO. ⚠️ Pura, ⛔ e é por isso que existe trava executando-a.
 *
 * @param modo     ⚠️ `"comConfirmacao"` é o contrato de CORREÇÃO.
 * @param gravado  ⚠️ O que já está na trilha — ⛔ `undefined` é **não informado**,
 *                 ⛔ e ⛔ não zero (§0.2).
 * @param rascunho ⚠️ O texto em curso, ⛔ ou `undefined` se ⛔ não há nenhum.
 */
export function proximoPasso({
  modo,
  faixa,
  gravado,
  rascunho,
  gesto,
}: {
  readonly modo: ModoDoRascunho;
  readonly faixa: FaixaNumerica;
  readonly gravado: number | undefined;
  readonly rascunho: string | undefined;
  readonly gesto: GestoNumerico;
}): PassoDoRascunho {
  const confirmando = modo === "comConfirmacao";

  switch (gesto.tipo) {
    case "digitou": {
      const limpo = apenasDigitos(gesto.texto);

      /**
       * ⚠️⚠️ APAGAR ⛔ NÃO É ZERO — é **desfazer**. ⛔ Gravar 0 aqui poria uma
       * glicemia de 0 mg/dL na trilha porque ⛔ alguém limpou o campo.
       *
       * ⚠️⚠️ E EM CORREÇÃO ⛔ NEM DESFAZ: dentro de um gesto abandonável,
       * esvaziar a caixa é **rascunho vazio**, ⛔ e ⛔ não a decisão de apagar o
       * fato que está na trilha. ⛔ Quem quer apagar cancela e desfaz — ⛔ e
       * ⛔ não descobre que apagou ao tocar em "Cancelar".
       */
      if (limpo === "") {
        if (confirmando) return { rascunho: "", efeito: NADA };
        return { rascunho: "", efeito: gravado === undefined ? NADA : { tipo: "desfazer" } };
      }

      /**
       * ⚠️⚠️ AQUI MORA A DIFERENÇA INTEIRA. ⛔ Em correção, dígito ⛔ NÃO grava:
       * corrigir 1 para 10 passaria por **1 → 10** e escreveria dois fatos,
       * sendo que o primeiro é o valor que já estava lá.
       */
      if (confirmando) return { rascunho: limpo, efeito: NADA };

      const n = numeroDoRascunho(limpo, faixa);
      if (n === undefined || n === gravado) return { rascunho: limpo, efeito: NADA };
      return { rascunho: limpo, efeito: { tipo: "medir", valor: n } };
    }

    case "ajustou": {
      /**
       * ⚠️⚠️ INERTE ⛔ SEM VALOR DE PARTIDA — ⛔ e isto ⛔ não é polimento. ⛔ Um
       * `+` partindo do nada gravaria o piso da faixa como se fosse medida:
       * **peso 30 kg**, **glicemia 20**, que ⛔ ninguém mediu (§0.2).
       */
      const base = numeroDoRascunho(rascunho, faixa) ?? gravado;
      if (base === undefined) return { rascunho, efeito: NADA };

      const alvo = Math.min(faixa.max, Math.max(faixa.min, base + gesto.delta));

      /** ⚠️⚠️ Em correção o ajuste move o RASCUNHO — ⛔ seis toques ⛔ não são seis fatos. */
      if (confirmando) return { rascunho: String(alvo), efeito: NADA };

      if (alvo === gravado) return { rascunho: undefined, efeito: NADA };
      return { rascunho: undefined, efeito: { tipo: "medir", valor: alvo } };
    }

    case "saiu": {
      /**
       * ⚠️⚠️ EM CORREÇÃO, SAIR DA CAIXA ⛔ NÃO PODE LIMPAR O RASCUNHO — ⛔ e a
       * razão é um defeito de ordem de eventos, ⛔ não uma preferência.
       *
       * ⛔ Tocar em **Confirmar** tira o foco da caixa PRIMEIRO. ⚠️ Se o blur
       * apagasse o rascunho, o "Confirmar" seguinte gravaria o valor **antigo**
       * — o médico veria 7 na tela, tocaria em confirmar, ⛔ e a trilha
       * receberia 1. ⚠️ É o parente do defeito que o e2e *"cancelar ⛔ não grava
       * nada"* achou em 2026-08-30, quando o blur gravava antes do cancelamento
       * chegar.
       */
      if (confirmando) return { rascunho, efeito: NADA };
      /** ⚠️ Fora da correção, rascunho fora da faixa ⛔ não vira valor: some. */
      return { rascunho: undefined, efeito: NADA };
    }

    case "confirmou": {
      /**
       * ⚠️ ⛔ Fora do modo de confirmação ⛔ não existe gesto de confirmar: a
       * medida já foi gravada quando caiu na faixa. ⛔ Aceitar aqui gravaria
       * **de novo** o que já está na trilha.
       */
      if (!confirmando) return { rascunho, efeito: NADA };

      const n = numeroDoRascunho(rascunho, faixa);
      /**
       * ⚠️⚠️ RASCUNHO VAZIO ⛔ OU FORA DA FAIXA ⛔ NÃO VIRA CORREÇÃO. ⛔ Cair no
       * `gravado` aqui escreveria uma "correção" do valor para ele mesmo — um
       * fato na trilha dizendo que houve erro onde ⛔ não houve.
       */
      if (n === undefined) return { rascunho, efeito: NADA };
      /** ⚠️ Confirmar o MESMO número ⛔ também ⛔ não é correção. */
      if (n === gravado) return { rascunho: undefined, efeito: NADA };

      /** ⚠️⚠️ **UM** fato — ⛔ e o rascunho morre com ele. */
      return { rascunho: undefined, efeito: { tipo: "medir", valor: n } };
    }

    case "cancelou":
      /** ⚠️⚠️ Cancelar ⛔ NÃO grava. Corrigir precisa ser abandonável, ⛔ senão é armadilha. */
      return { rascunho: undefined, efeito: NADA };
  }
}

/**
 * O TEXTO QUE A CAIXA MOSTRA. ⚠️ Fica aqui porque é a mesma regra de três
 * estados — gravado / em rascunho / intocado —, ⛔ e duplicá-la no componente
 * abriria a porta para o intocado mostrar `0`.
 */
export function textoDaCaixa(gravado: number | undefined, rascunho: string | undefined): string {
  if (rascunho !== undefined) return rascunho;
  return gravado === undefined ? "" : String(gravado);
}
