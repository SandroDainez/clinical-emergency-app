/**
 * DERIVAÇÕES DA SUPERFÍCIE G · Destino.
 *
 * ⚠️⚠️ G **LÊ** o estado de A–F, ⛔ e ⛔ NÃO REDECLARA ⛔ NADA.
 *
 * ⛔ ⛔ Nenhum fato daqui é pergunta que outra superfície já faz. Os únicos fatos
 * que nascem em G são os **operacionais** — capacidade do serviço — ⛔ e eles
 * ⛔ não são clínicos.
 *
 * ── ⚠️⚠️ A BARREIRA G → F ────────────────────────────────────────────────────
 *
 * ⛔ ⛔ ⛔ Este módulo ⛔ **NÃO IMPORTA** `derivacoes-f`, ⛔ e ⛔ **não** existe
 * caminho de volta. ⚠️ A direção é uma só: **F ⛔ nunca sabe** o que G registrou.
 *
 * ⚠️ A trava `prova-avc-superficie-g` prova isso das duas formas: lendo a fonte
 * de F ⛔ e — o que importa mais — **executando** F com todos os fatos
 * operacionais preenchidos ⛔ e conferindo que as leituras ⛔ não mudam ⛔ nem um
 * caractere em relação ao estado vazio.
 */

import { destinoDaImagem } from "./derivacoes-c";
import { PA_POS_REPERFUSAO } from "../conteudo/antihipertensivos";
import { reavaliacaoPressoricaIncompleta, ultimaPressaoCompleta } from "./derivacoes";
/**
 * ⚠️⚠️ A DIREÇÃO É UMA SÓ. G lê de F a **ação** registrada — ⛔ e ⛔ NADA de G
 * volta para F. ⛔ Reimplementar a leitura aqui daria duas verdades sobre o
 * mesmo fato (I6); o que ⛔ **não** pode existir é o caminho inverso.
 */
import { acoesDeTrombolise, type AcaoDeTrombolise } from "./derivacoes-f";
import { valorAtual, type EstadoAvc } from "./estado";
import { ternario } from "./leitura";
import {
  DESTINOS_RECOMENDADOS,
  FATOS_OPERACIONAIS,
  LACUNA_POS_EVT,
  MONITORIZACAO_POS_IVT,
  REGRAS_DE_DESTINO,
  type DestinoRecomendado,
  type RegraOperacional,
} from "../conteudo/superficie-g";

/* ────────────────────────────────────────────────────────────────────────────
 * 1 · A SAÍDA DE FLUXO JÁ EXISTE — G A CONSOME, ⛔ E ⛔ NÃO A REFAZ
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ REUSO EXPLÍCITO DE `destinoDaImagem` (Superfície C).
 *
 * ⚠️ C já produz destino de saída de fluxo — hemorragia intracraniana e suspeita
 * de HSA — com `moduloExiste` declarado, para a tela poder dizer que o módulo
 * ⛔ ainda ⛔ não existe (E-09). ⛔ Reimplementar isso em G daria **duas
 * respostas para a mesma pergunta**, ⛔ e elas divergiriam na primeira mudança
 * (I6).
 *
 * ⚠️ G ⛔ não decide se há hemorragia: quem lê imagem é C.
 */
export function saidaDeFluxo(estado: EstadoAvc) {
  return destinoDaImagem(estado);
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2 · O CONTEXTO OPERACIONAL — LIDO SÓ POR G
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ ⛔ TRÊS ESTADOS, ⛔ E O VAZIO ⛔ NÃO É "NÃO".
 *
 * ⛔ `undefined` = ⛔ ainda ⛔ não perguntado. `"incerto"` = perguntei ⛔ e ⛔
 * ninguém soube. ⛔ Colapsar os dois apagaria que a pergunta já foi feita (E-37).
 */
export type Disponibilidade = "disponivel" | "indisponivel" | "incerto";

export type LeituraOperacional = {
  readonly id: string;
  readonly rotulo: string;
  readonly estado: Disponibilidade | undefined;
  /**
   * ⚠️⚠️ ⛔ SEMPRE `"indisponibilidade_operacional"` — ⛔ e ⛔ NUNCA outra coisa.
   *
   * ⛔ Este campo existe para que a tela ⛔ não possa rotular a ausência de
   * recurso como contraindicação ⛔ nem como inelegibilidade: o único rótulo que
   * o tipo admite já vem escrito.
   */
  readonly quandoAusente: "indisponibilidade_operacional";
};

export function contextoOperacional(estado: EstadoAvc): readonly LeituraOperacional[] {
  return FATOS_OPERACIONAIS.map((f) => {
    const v = ternario(estado, f.id);
    const respondido = valorAtual(estado, f.id) !== undefined;
    return {
      id: f.id,
      rotulo: f.rotulo,
      estado:
        v === true
          ? ("disponivel" as const)
          : v === false
            ? ("indisponivel" as const)
            : respondido
              ? ("incerto" as const)
              : undefined,
      quandoAusente: "indisponibilidade_operacional" as const,
    };
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3 · A MONITORIZAÇÃO PÓS-IVT — ⛔ SÓ DEPOIS DE HAVER IVT
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ G CONSOME A **AÇÃO** REGISTRADA EM F — ⛔ e ⛔ NUNCA A INDICAÇÃO.
 *
 * ⚠️ A casa semântica da administração é F: lá moram a decisão do agente e a
 * ação. G lê o resultado ⛔ e ⛔ **não escreve** ⛔ nem corrige ⛔ nada.
 *
 * ⚠️⚠️ A regra temporal é o conteúdo: a Table 7 começa *"during **and** after"*
 * a administração. ⛔ Esperar `realizada` atrasaria justamente a vigilância que
 * deve ocorrer **durante a infusão** — por isso `iniciada` já torna a
 * monitorização pertinente.
 *
 * ⛔ ⛔ `cancelada` ⛔ **não** é administração. ⚠️ A regra de E vale inteira aqui:
 * ação considerada e abandonada ⛔ não conta como tratamento realizado.
 */
export type PertinenciaDaMonitorizacao = {
  readonly pertinente: boolean;
  readonly motivo: "iniciada" | "realizada" | "sem_administracao_registrada";
  readonly acao: AcaoDeTrombolise | undefined;
};

/**
 * ⚠️⚠️ ⛔ ESTA FUNÇÃO ⛔ NÃO OLHA O RELÓGIO — ⛔ e ⛔ isso ⛔ não é omissão.
 *
 * ⛔ Ela responde **se houve IVT**, ⛔ e portanto se existe contexto pós-trombólise.
 * ⛔ O tempo decorrido ⛔ **não** entra: 24 h encerram as fases da Table 7, ⛔ e
 * ⛔ **não** encerram o contexto. ⚠️ Se o horário faltar ⛔ ou se já tiverem
 * passado 30 h, o paciente **continua** sendo alguém que recebeu trombólise.
 *
 * ⛔ ⛔ Fazer a pertinência depender do tempo faria o app **desistir de mostrar**
 * o contexto pós-trombólise justamente quando o horário falta — que é quando
 * mais se precisa saber que ele existe.
 */
export function pertinenciaDaMonitorizacao(estado: EstadoAvc): PertinenciaDaMonitorizacao {
  /**
   * ⚠️ ⛔ Uma trombólise cancelada ⛔ não apaga uma anterior iniciada, ⛔ e uma
   * iniciada depois de uma cancelada vale. A trilha guarda as duas.
   */
  const conta = acoesDeTrombolise(estado)
    .filter((a) => a.estado === "iniciada" || a.estado === "realizada");
  const acao = conta[conta.length - 1];
  if (!acao) {
    return { pertinente: false, motivo: "sem_administracao_registrada", acao: undefined };
  }
  return { pertinente: true, motivo: acao.estado as "iniciada" | "realizada", acao };
}

/**
 * ⚠️⚠️ PERTINÊNCIA ⛔ NÃO É FASE — e essa é a distinção inteira.
 *
 * ⛔ Com a ação registrada ⛔ e o horário ausente, G **sabe** que a monitorização
 * se aplica ⛔ e ⛔ **não sabe** em que fase da Table 7 o paciente está. ⚠️ ⛔ Não
 * assume zero, ⛔ não assume "agora": mostra a pendência do horário.
 */
export type FaseAtual =
  | { readonly tipo: "fase"; readonly deHoras: number; readonly ateHoras: number; readonly aCadaMin: number }
  | { readonly tipo: "sem_horario"; readonly campo: string }
  /**
   * ⚠️⚠️ **FORA DA JANELA DA TABELA** — ⛔ e ⛔ NÃO "fora da monitorização".
   *
   * ⛔ Passadas 24 h, a Table 7 ⛔ deixa de fornecer uma **fase** — ⛔ e ⛔ não
   * deixa de haver contexto pós-trombólise. ⚠️ O nome carrega o limite: o que
   * acaba é a tabela, ⛔ e ⛔ não a pertinência. ⛔ A fonte ⛔ não publica duração
   * além de 24 h, ⛔ e ⛔ inventar uma seria E-31.
   */
  | { readonly tipo: "fora_da_janela_da_tabela" };

export function faseDaMonitorizacao(estado: EstadoAvc, agoraMs: number): FaseAtual | undefined {
  const p = pertinenciaDaMonitorizacao(estado);
  if (!p.pertinente || !p.acao) return undefined;
  /** ⚠️⚠️ ⛔ SEM O INÍCIO, ⛔ NENHUMA FASE — ⛔ e ⛔ nenhum substituto. */
  if (p.acao.inicioMs === undefined) return { tipo: "sem_horario", campo: "ivt_inicio" };
  const horas = (agoraMs - p.acao.inicioMs) / 3_600_000;
  const f = MONITORIZACAO_POS_IVT.fases.find((x) => horas >= x.deHoras && horas < x.ateHoras);
  return f
    ? { tipo: "fase", deHoras: f.deHoras, ateHoras: f.ateHoras, aCadaMin: f.aCadaMin }
    : { tipo: "fora_da_janela_da_tabela" };
}

/** ⚠️ A tabela — devolvida ⛔ só quando a monitorização é pertinente. */
export function monitorizacaoPosIvt(estado: EstadoAvc): typeof MONITORIZACAO_POS_IVT | undefined {
  return pertinenciaDaMonitorizacao(estado).pertinente ? MONITORIZACAO_POS_IVT : undefined;
}


/* ────────────────────────────────────────────────────────────────────────────
 * 3b · O CONTROLE PRESSÓRICO PÓS-IVT
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ── ⚠️⚠️ ⛔ O QUE ESTA DERIVAÇÃO RESPONDE, ⛔ E ⛔ SÓ ISSO ─────────────────
 *
 * ⚠️ Escopo dado pelo autor, 2026-09-07 (**item 1**):
 *
 * > *"A PA vigente está ⛔ ou ⛔ não dentro do alvo pressórico aplicável a este
 * >  contexto pós-IVT?"*
 *
 * ⛔ ⛔ Ela ⛔ **não** diz o que tratar, ⛔ com que fármaco, ⛔ com que
 * intensidade, ⛔ nem o que vai acontecer. ⚠️ ⛔ E ⛔ **não** diz que a PA está
 * *"controlada"*: ⛔ é o estado da **medida atual**, ⛔ e ⛔ não da evolução.
 *
 * ── ⚠️⚠️ ⛔ *"DENTRO DO ALVO AGORA"* ⛔ NÃO É *"24 h CONTROLADAS"* ─────────
 *
 * ⚠️ Regra do autor (**item 8**): ⛔ uma PA 170/98 agora significa
 * `dentro_do_alvo` — ⛔ e ⛔ **não** *"PA controlada nas últimas 24 horas"*.
 * ⛔ Afirmar manutenção exigiria a **série inteira** do período, ⛔ e ⛔ o app
 * ⛔ não a tem.
 *
 * ⛔ ⛔ É a regra permanente da Fase 7 aplicada ao tempo: **estado intermediário
 * ⛔ nunca é evidência concluída**.
 */
export type EstadoPressoricoPosIvt =
  /** ⚠️ Houve IVT, ⛔ e ⛔ o horário ⛔ não foi registrado — ⛔ sem janela, ⛔ sem regra. */
  | "sem_horario_ivt"
  /** ⚠️ ⛔ Passadas 24 h: a recomendação graduada ⛔ **deixa de definir** este alvo. */
  | "fora_da_janela"
  /** ⚠️ ⛔ Nenhuma aferição completa — ⛔ e ⛔ ausência ⛔ não é normalidade (**§0.2**). */
  | "sem_pa"
  /** ⚠️ Aferição começada ⛔ e ⛔ não terminada (Fase 7) — ⛔ nem dentro, ⛔ nem fora. */
  | "afericao_incompleta"
  /** ⚠️ ⛔ As **duas** metades estritamente abaixo do alvo. */
  | "dentro_do_alvo"
  | "acima_do_alvo";

export type LeituraPressoricaPosIvt = {
  readonly estado: EstadoPressoricoPosIvt;
  readonly pas?: number;
  readonly pad?: number;
  /** ⚠️ O alvo **deste contexto** — ⛔ e ⛔ nunca *"a meta"* genérica. */
  readonly alvo: { readonly pas: number; readonly pad: number; readonly frase: string };
  readonly contexto: string;
  readonly fonte: string;
  readonly cor: string;
  readonly loe: string;
  /** ⚠️ Horas desde o início da IVT — `undefined` ⛔ quando o horário falta. */
  readonly horasDesdeIvt?: number;
};

/** ⚠️ A janela em que **F-04** define este alvo — ⛔ e ⛔ ela é da fonte. */
const HORAS_DO_ALVO_POS_IVT = 24;

/**
 * ⚠️⚠️ ⛔ DEVOLVE `undefined` QUANDO ⛔ NÃO HÁ CONTEXTO PÓS-IVT — ⛔ e ⛔ isso
 * ⛔ não é um estado: ⛔ é a ausência da pergunta. ⛔ Aplicar o alvo pós-IVT a
 * quem ⛔ não recebeu trombólise seria usar a regra fora do contexto que a
 * fonte define (**item 6**).
 */
export function estadoPressoricoPosIvt(
  estado: EstadoAvc,
  agoraMs: number
): LeituraPressoricaPosIvt | undefined {
  const p = pertinenciaDaMonitorizacao(estado);
  if (!p.pertinente || !p.acao) return undefined;

  const c = PA_POS_REPERFUSAO.consumidores.alvoTerapeuticoPosIvt;
  const base = {
    alvo: { pas: PA_POS_REPERFUSAO.pas, pad: PA_POS_REPERFUSAO.pad, frase: c.frase },
    contexto: c.contexto,
    fonte: c.fonte,
    cor: c.cor,
    loe: c.loe,
  } as const;

  /** ⚠️⚠️ ⛔ SEM O INÍCIO, ⛔ NENHUMA JANELA — ⛔ e ⛔ nenhum substituto. */
  if (p.acao.inicioMs === undefined) return { ...base, estado: "sem_horario_ivt" };

  const horasDesdeIvt = (agoraMs - p.acao.inicioMs) / 3_600_000;
  if (horasDesdeIvt >= HORAS_DO_ALVO_POS_IVT) {
    return { ...base, estado: "fora_da_janela", horasDesdeIvt };
  }

  /**
   * ⚠️⚠️ ⛔ A AFERIÇÃO PELA METADE ⛔ NÃO CLASSIFICA — regra da Fase 7, ⛔ e ⛔ ela
   * vale igual aqui: ⛔ meia medida ⛔ não é nova normalidade, ⛔ não é ausência
   * de medida ⛔ e ⛔ não é resolução.
   */
  if (reavaliacaoPressoricaIncompleta(estado) !== undefined) {
    return { ...base, estado: "afericao_incompleta", horasDesdeIvt };
  }

  /** ⚠️ ⛔ E as duas metades vêm da **mesma** aferição (**D-120**). */
  const pa = ultimaPressaoCompleta(estado);
  if (pa === undefined) return { ...base, estado: "sem_pa", horasDesdeIvt };

  /**
   * ⚠️⚠️ ⛔ **ESTRITAMENTE ABAIXO**, ⛔ e ⛔ as **duas** condições. ⛔ Trocar `<`
   * por `≤` incluiria ⛔ exatamente 180/105 no alvo — ⛔ e há prova de fronteira
   * para 179/104 · 180/104 · 179/105 · 180/105 · 181/106.
   */
  const dentro = pa.pas < PA_POS_REPERFUSAO.pas && pa.pad < PA_POS_REPERFUSAO.pad;
  return {
    ...base,
    estado: dentro ? "dentro_do_alvo" : "acima_do_alvo",
    pas: pa.pas,
    pad: pa.pad,
    horasDesdeIvt,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * 4 · A LEITURA DA SUPERFÍCIE
 * ────────────────────────────────────────────────────────────────────────── */

export type LeituraDaSuperficieG = {
  /** ⚠️ ⛔ Nenhum é condicional a dado ⛔ nenhum: a fonte ⛔ não os condiciona. */
  readonly recomendados: readonly DestinoRecomendado[];
  readonly operacionais: readonly RegraOperacional[];
  readonly contexto: readonly LeituraOperacional[];
  readonly saida: ReturnType<typeof destinoDaImagem>;
  readonly monitorizacao: typeof MONITORIZACAO_POS_IVT | undefined;
  readonly lacunaPosEvt: typeof LACUNA_POS_EVT;
};

/**
 * ⚠️⚠️ ⛔ NENHUM DESTINO É AUTOMÁTICO.
 *
 * ⛔ A fonte **recomenda** a unidade de AVC; ⛔ ela ⛔ não encaminha ⛔ ninguém.
 * ⚠️ Esta função devolve o que a fonte diz ⛔ e o contexto do serviço — ⛔ e
 * ⛔ **não** um veredito de para onde o paciente vai. Quem decide é o médico.
 *
 * ⚠️ Os destinos ⛔ não são filtrados por dado ⛔ nenhum porque **a fonte ⛔ não
 * os condiciona**: §5.1 vale para AVC isquêmico agudo, ⛔ sem critério adicional.
 * ⛔ Inventar um filtro aqui seria estreitar uma recomendação COR 1.
 */
export function leituraDaSuperficieG(estado: EstadoAvc): LeituraDaSuperficieG {
  return {
    recomendados: DESTINOS_RECOMENDADOS,
    operacionais: REGRAS_DE_DESTINO,
    contexto: contextoOperacional(estado),
    saida: saidaDeFluxo(estado),
    monitorizacao: monitorizacaoPosIvt(estado),
    lacunaPosEvt: LACUNA_POS_EVT,
  };
}
