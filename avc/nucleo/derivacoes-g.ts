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

import { destinoDaImagem, estudos, type Estudo } from "./derivacoes-c";
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
  ANTITROMBOTICOS_POS_IVT,
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

/* ────────────────────────────────────────────────────────────────────────────
 * ⚠️⚠️⚠️ OS ANTITROMBÓTICOS PÓS-IVT — ⛔ ONDE O CASO ESTÁ, ⛔ E ⛔ NADA ALÉM
 *
 * ── ⚠️⚠️ ⛔ O DEGRAU QUE ESTA DERIVAÇÃO EXISTE PARA ⛔ NÃO PULAR ───────────
 *
 * ⚠️ Regra do autor, 2026-09-07, ao pé da letra:
 *
 * > *"Imagem solicitada ≠ imagem realizada. Imagem realizada ≠ resultado
 * >  conhecido. Resultado conhecido sem hemorragia ≠ decisão automática de
 * >  iniciar antitrombótico."*
 *
 * ⛔ ⛔ Por isso ⛔ **⛔ NENHUM** estado se chama *liberado*, *pode_iniciar* ⛔ ou
 * *indicado*, ⛔ e ⛔ **⛔ nenhuma** conduta sai daqui. ⚠️ O mais longe que esta
 * função vai é dizer *"o resultado está disponível"* — ⛔ e ⛔ a decisão
 * terapêutica ⛔ continua sendo do médico.
 *
 * ── ⚠️⚠️ ⛔ E ⛔ ELA ⛔ NÃO CRIOU CAMPO DE IMAGEM ──────────────────────────
 *
 * ⛔ A imagem de controle ⛔ não é um exame de outra espécie: ⛔ é **um estudo
 * posterior ao início da trombólise**. ⚠️ A instância de estudo já existe, com
 * modalidade, hora ⛔ e resultado — ⛔ e a escada da Fase 5 já foi provada ⛔ ali.
 * ────────────────────────────────────────────────────────────────────────── */

export type EstadoAntitrombotico =
  /** ⚠️ ⛔ Sem trombólise, a regra ⛔ não se aplica. ⛔ Isso ⛔ não é pendência. */
  | "fora_do_contexto_pos_ivt"
  /** ⚠️ Dentro das 24 h, ⛔ e ⛔ nenhuma imagem de controle ⛔ ainda. */
  | "antes_da_imagem_controle"
  /** ⚠️⚠️ Passadas as 24 h ⛔ e ⛔ nada registrado — ⛔ **agora** está pendente. */
  | "imagem_pendente"
  /** ⚠️ Estudo posterior à IVT, ⛔ e o laudo ⛔ ainda ⛔ não veio. */
  | "imagem_realizada_sem_resultado"
  /** ⚠️⚠️ O laudo existe. ⛔ **⛔ E ⛔ SÓ ISSO.** */
  | "resultado_disponivel"
  /** ⚠️⚠️ §4.8 rec. 2 — ⛔ risco incerto, ⛔ e ⛔ nunca rotina. */
  | "excecao_precoce_pode_ser_considerada";

export type LeituraAntitrombotica = {
  readonly estado: EstadoAntitrombotico;
  readonly frase: string;
  readonly ressalva: string;
  /** ⚠️ O resultado **como foi registrado**. ⛔ ⛔ Nunca interpretado. */
  readonly resultado?: string;
  readonly horasDesdeIvt?: number;
  /** ⚠️⚠️ COR/LOE ⛔ só quando há recomendação graduada em jogo. */
  readonly cor?: string;
  readonly loe?: string;
  readonly verbatim?: string;
  readonly localizacao?: string;
  /**
   * ⚠️⚠️⚠️ ⛔ A REGRA DOS 90 min CORRE **EM PARALELO**, ⛔ e ⛔ não substitui
   * ⛔ nenhum estado. ⛔ Ela é `3: Harm`, ⛔ e a das 24 h é `2b`.
   */
  readonly aspirinaIvNosNoventaMin: boolean;
};

const RESSALVA_ANTITROMBOTICA =
  "A ordem vem da Table 7. A decisão terapêutica é do médico.";

const HORAS_DA_IMAGEM_DE_CONTROLE = MONITORIZACAO_POS_IVT.imagemDeControle.prazoHoras;

const REC = (id: string) =>
  ANTITROMBOTICOS_POS_IVT.recomendacoes.find((r) => r.id === id);

/**
 * ⚠️⚠️ O ESTUDO **POSTERIOR À TROMBÓLISE** — ⛔ e ⛔ a TC que a precedeu ⛔ não
 * serve: ⛔ um exame anterior ⛔ não avalia uma infusão que veio depois dele.
 *
 * ⚠️ ⛔ Sem hora registrada, o estudo ⛔ **⛔ não** é assumido como de controle:
 * ⛔ assumir daria por cumprida uma imagem que ⛔ ninguém datou (**E-23**).
 *
 * ── ⚠️⚠️ ⛔ E ⛔ ELE VEM DE `estudos()`, ⛔ DE C ─────────────────────────────
 *
 * ⛔ ⛔ Minha primeira versão varria as instâncias aqui, com `instanciasDe` ⛔ e
 * `valorNaInstancia`. ⚠️ ⛔ A prova da Superfície G reprovou, ⛔ e estava certa:
 * ⛔ **G lê, ⛔ e ⛔ não reimplementa** — ⛔ duas leituras do mesmo fato
 * divergiriam no dia em que *"hora desconhecida"* ganhasse tratamento
 * (**I6**). ⛔ A leitura já existia, ⛔ e já distingue `horaDesconhecida`.
 */
function estudoDeControle(
  estado: EstadoAvc,
  inicioIvtMs: number
): Estudo | undefined {
  const posteriores = estudos(estado).filter(
    (x) => x.horaConhecida && x.hora !== undefined && x.hora >= inicioIvtMs
  );
  /** ⚠️ Entre dois estudos de controle, o que **tem laudo** responde. */
  return posteriores.find((x) => x.resultado !== undefined) ?? posteriores[0];
}

export function estadoAntitromboticoPosIvt(
  estado: EstadoAvc,
  agoraMs: number
): LeituraAntitrombotica {
  const p = pertinenciaDaMonitorizacao(estado);
  const inicio = p.pertinente ? p.acao?.inicioMs : undefined;

  /**
   * ⚠️⚠️ ⛔ SEM TROMBÓLISE ⛔ OU ⛔ SEM O HORÁRIO DELA, ⛔ a regra ⛔ não se
   * aplica — ⛔ e ⛔ isso ⛔ **⛔ não** é o mesmo que estar pendente.
   */
  if (!p.pertinente || inicio === undefined) {
    return {
      estado: "fora_do_contexto_pos_ivt",
      frase: "A ordem da imagem de controle vale após a trombólise.",
      ressalva: RESSALVA_ANTITROMBOTICA,
      aspirinaIvNosNoventaMin: false,
    };
  }

  const minutosDesdeIvt = (agoraMs - inicio) / 60_000;
  const horasDesdeIvt = minutosDesdeIvt / 60;

  /**
   * ⚠️⚠️⚠️ A REGRA DOS 90 min, ⛔ **calculada à parte** — ⛔ ela ⛔ não decide o
   * estado, ⛔ e ⛔ o estado ⛔ não a encerra. ⛔ As duas janelas correm juntas.
   */
  const r90 = REC("aspirina_iv_90min");
  const aspirinaIvNosNoventaMin =
    r90 !== undefined && minutosDesdeIvt >= 0 && minutosDesdeIvt < r90.janela.minutos;

  const base = { ressalva: RESSALVA_ANTITROMBOTICA, horasDesdeIvt, aspirinaIvNosNoventaMin };
  const controle = estudoDeControle(estado, inicio);

  /**
   * ⚠️⚠️⚠️ A EXCEÇÃO VEM ANTES DOS DEGRAUS DA IMAGEM — ⛔ e ⛔ só dentro das
   * 24 h: ⛔ ela é *"in the **first 24 hours** after IVT"*.
   *
   * ⛔ ⛔ E ⛔ ela ⛔ **⛔ não** nasce sozinha: ⛔ exige o julgamento
   * **registrado**. ⚠️ Uma exceção oferecida a todo paciente vira rotina — ⛔ e
   * a fonte a reserva a *"concomitant conditions"*.
   */
  const r24 = REC("antiagregante_24h_pos_ivt");
  /**
   * ⚠️⚠️ ⛔ `ternario()`, ⛔ e ⛔ **⛔ NÃO** `=== "Sim"`.
   *
   * ⛔ ⛔ O estado ⛔ nunca guarda `"Sim"`: a tela grava o valor de
   * `valorDaOpcao()`, que é `"sim"`. ⚠️ ⛔ Comparar com o rótulo deixaria a
   * exceção **⛔ nunca nascer** no app real — ⛔ e a prova só a pegou porque
   * registra do jeito que a tela registra.
   *
   * ⚠️ ⛔ O defeito é o mesmo que `derivacoes-f.ts` ⛔ já documenta, ⛔ e a
   * leitura correta ⛔ já existia em `leitura.ts`. ⛔ Escrever outra aqui teria
   * sido a duplicação que a **I6** proíbe.
   */
  const julgamento = ternario(estado, "condicao_concomitante_antiagregante");
  if (
    r24 !== undefined
    && minutosDesdeIvt < r24.janela.minutos
    && julgamento === true
    && controle?.resultado === undefined
  ) {
    return {
      ...base,
      estado: "excecao_precoce_pode_ser_considerada",
      frase: r24.frase,
      cor: r24.cor,
      loe: r24.loe,
      verbatim: r24.verbatim,
      localizacao: r24.localizacao,
    };
  }

  if (controle === undefined) {
    /** ⚠️⚠️ ⛔ Antes do prazo ⛔ nada está atrasado — ⛔ e o nome diz isso. */
    return horasDesdeIvt < HORAS_DA_IMAGEM_DE_CONTROLE
      ? {
          ...base,
          estado: "antes_da_imagem_controle",
          /**
           * ⚠️⚠️ ⛔ ELA DIZ **ONDE O CASO ESTÁ**, ⛔ e ⛔ NÃO repete a ordem.
           *
           * ⛔ ⛔ Minha primeira versão devolvia ⛔ aqui o próprio texto da
           * Table 7 — ⛔ e a tela mostrava a **mesma frase duas vezes
           * seguidas**, ⛔ uma como estado ⛔ e outra como ordem. ⚠️ Visto na
           * revisão de 375 px.
           *
           * ⚠️ ⛔ E ⛔ *"⛔ ainda ⛔ não registrada"* ⛔ é diferente de *"⛔ não
           * feita"*: ⛔ o app sabe o que foi **anotado**, ⛔ e ⛔ não o que
           * aconteceu no aparelho.
           */
          frase:
            "Dentro das primeiras 24 horas após a trombólise. Imagem de controle ainda não registrada.",
        }
      : {
          ...base,
          estado: "imagem_pendente",
          frase:
            "Aguardando imagem de controle de 24 horas antes de considerar antiagregante ou anticoagulante.",
        };
  }

  if (controle.resultado === undefined) {
    return {
      ...base,
      estado: "imagem_realizada_sem_resultado",
      frase: "Imagem realizada; resultado ainda não disponível.",
    };
  }

  /**
   * ⚠️⚠️⚠️ ⛔ **⛔ O RESULTADO, ⛔ E ⛔ NADA ALÉM DELE.**
   *
   * ⛔ ⛔ *"Sem hemorragia"* ⛔ **⛔ não** é *"pode iniciar"*. ⚠️ A frase abaixo
   * ⛔ não contém verbo de conduta ⛔ de propósito, ⛔ e ⛔ há trava que o mede.
   */
  return {
    ...base,
    estado: "resultado_disponivel",
    resultado: controle.resultado,
    frase: "Resultado da imagem de controle registrado.",
  };
}
