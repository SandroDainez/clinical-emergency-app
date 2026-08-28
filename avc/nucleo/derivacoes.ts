/**
 * DERIVAÇÕES DA SUPERFÍCIE A — recalculadas a cada leitura, ⛔ nunca gravadas.
 *
 * ⚠️ REGRAS QUE GOVERNAM ESTE ARQUIVO INTEIRO:
 *   · §4.1 — o dado ⛔ não carrega a própria interpretação; a classificação mora aqui;
 *   · §4.3 — derivado ⛔ nunca é persistido como verdade clínica;
 *   · E-22 — toda derivação **declara os insumos** e a **fonte**; conclusão opaca não entra;
 *   · E-23 — ⛔ ausência de dado NUNCA vira dado negativo;
 *   · E-46 — leitura do sistema é **apoio**, ⛔ nunca veredito.
 *
 * ⛔ NENHUMA derivação aqui decide candidatura a reperfusão. A Superfície A
 * ⛔ não abre elegibilidade — isso é E, e ainda não existe.
 */

import type { EstadoAvc } from "./estado";
import { valorAtual } from "./estado";
import type { Vazio } from "./tipos";

/**
 * O resultado de uma derivação.
 *
 * ⚠️ `desconhecido` é um valor de PRIMEIRA CLASSE, ⛔ não a ausência de resposta.
 * Sem ele, "não sei" e "não" ocupariam o mesmo lugar — que é exatamente o erro
 * que **E-23** existe para impedir.
 */
export type Leitura = {
  readonly conclusao: "sim" | "nao" | "desconhecido";
  /** Frase de apoio, em PT. ⛔ Traduzida no render, nunca aqui. */
  readonly texto: string;
  /** Os campos que produziram esta leitura (E-22). */
  readonly insumos: readonly string[];
  /** O slot de fonte que a sustenta (E-30). */
  readonly fonte: string;
};

const VAZIOS: readonly string[] = ["nao_perguntado", "nao_sei"];

/** O valor numérico de um campo, ou `undefined` quando vazio ou não informado. */
function numero(estado: EstadoAvc, campo: string): number | undefined {
  const f = valorAtual(estado, campo);
  if (!f) return undefined;
  if (typeof f.valor === "number") return f.valor;
  return undefined;
}

/** `true`/`false`/`undefined` para campos de resposta. ⛔ Vazio nunca vira `false`. */
function ternario(estado: EstadoAvc, campo: string): boolean | undefined {
  const f = valorAtual(estado, campo);
  if (!f) return undefined;
  if (VAZIOS.includes(String(f.valor))) return undefined;
  return f.valor === "sim";
}

/**
 * SUPORTE DE VIA AÉREA — §4.1 rec. 1 · **COR 1 · LOE C-LD**
 *
 * ⚠️ Os dois gatilhos são **clínicos e nomeados pela fonte**: *"decreased
 * consciousness or bulbar dysfunction"*. ⛔ Não há escore, ⛔ não há corte.
 */
export function suporteDeViaAerea(estado: EstadoAvc): Leitura {
  const consc = ternario(estado, "consciencia_rebaixada");
  const bulbar = ternario(estado, "disfuncao_bulbar");
  const insumos = ["consciencia_rebaixada", "disfuncao_bulbar"];
  const fonte = "F-23";
  if (consc === true || bulbar === true) {
    return { conclusao: "sim", texto: "Suporte de via aérea e ventilação recomendados, conforme a necessidade", insumos, fonte };
  }
  if (consc === undefined || bulbar === undefined) {
    // ⚠️ E-23: um dos dois em branco ⛔ não permite concluir que não há indicação.
    return { conclusao: "desconhecido", texto: "Consciência ou função bulbar ainda não avaliadas", insumos, fonte };
  }
  return { conclusao: "nao", texto: "Sem os dois gatilhos que a fonte nomeia para suporte de via aérea", insumos, fonte };
}

/**
 * OXIGÊNIO — §4.1 recs. 2 e 5.
 *
 * ⚠️⚠️ **`>94%` É META, ⛔ NÃO É CORTE DE HIPÓXIA.** A fonte diz: *"In patients
 * with AIS **with hypoxia**, supplemental oxygen should be provided **to maintain**
 * oxygen saturation (SpO₂) >94%"* — e ⛔ **não define corte numérico de hipóxia**
 * em lugar nenhum do documento.
 *
 * É a distinção **meta ≠ limite** de §6.1. Derivar "SpO₂ 93 → hipóxia" seria
 * inventar um limite a partir de uma meta.
 *
 * ⚠️ E o outro lado tem força própria: §4.1 rec. 5 (**COR 3: No benefit · B-R**)
 * desaconselha O₂ em quem **não** tem hipóxia. Por isso ⛔ SpO₂ sozinha nunca
 * indica oxigênio aqui.
 */
export function oxigenio(estado: EstadoAvc): Leitura {
  const hipoxia = ternario(estado, "hipoxia");
  const spo2 = numero(estado, "spo2");
  const insumos = ["hipoxia", "spo2"];
  const fonte = "F-23";
  if (hipoxia === true) {
    const alvo = "Oxigênio suplementar recomendado, com meta de SpO₂ maior que 94%";
    return { conclusao: "sim", texto: alvo, insumos, fonte };
  }
  if (hipoxia === false) {
    return {
      conclusao: "nao",
      texto: "Sem hipóxia, oxigênio suplementar não é recomendado para melhorar desfecho funcional",
      insumos,
      fonte,
    };
  }
  const comSpo2 = spo2 !== undefined
    ? "SpO₂ registrada, mas a presença de hipóxia ainda não foi informada"
    : "Presença de hipóxia ainda não informada";
  return { conclusao: "desconhecido", texto: comSpo2, insumos, fonte };
}

/**
 * SpO₂ EM RELAÇÃO À META — ⚠️ isto ⛔ NÃO é diagnóstico de hipóxia.
 *
 * Diz apenas se o valor registrado está abaixo da meta que a fonte declara para
 * quem já tem hipóxia. É informação de acompanhamento, ⛔ não gatilho de conduta.
 */
export function spo2AbaixoDaMeta(estado: EstadoAvc): Leitura {
  const spo2 = numero(estado, "spo2");
  const insumos = ["spo2"];
  const fonte = "F-23";
  if (spo2 === undefined) {
    return { conclusao: "desconhecido", texto: "SpO₂ não informada", insumos, fonte };
  }
  return spo2 <= 94
    ? { conclusao: "sim", texto: "SpO₂ abaixo da meta de 94% que a fonte declara para o paciente com hipóxia", insumos, fonte }
    : { conclusao: "nao", texto: "SpO₂ acima da meta de 94%", insumos, fonte };
}

/**
 * HIPOGLICEMIA — §4.5 rec. 1 · **COR 1 · LOE C-LD**
 *
 * ⚠️ Aqui `<60 mg/dL` é **limite** de verdade, ⛔ não meta: a fonte diz
 * *"hypoglycemia (blood glucose <60 mg/dL) should be treated"*.
 *
 * ⛔ Os outros dois números do documento ⛔ NÃO são usados aqui: `<50` é rótulo de
 * "grave" em texto de apoio, e `<40` é desfecho de segurança de ensaio. Cada um
 * com a sua finalidade (F-06).
 */
export function hipoglicemia(estado: EstadoAvc): Leitura {
  const g = numero(estado, "glicemia");
  const insumos = ["glicemia"];
  const fonte = "F-06";
  if (g === undefined) {
    // ⚠️ E-23: glicemia desconhecida ⛔ NÃO é glicemia normal.
    return { conclusao: "desconhecido", texto: "Glicemia não informada — desconhecida não é normal", insumos, fonte };
  }
  return g < 60
    ? { conclusao: "sim", texto: "Hipoglicemia: a fonte recomenda tratar para evitar complicações", insumos, fonte }
    : { conclusao: "nao", texto: "Glicemia acima do limite que a fonte manda tratar", insumos, fonte };
}

/**
 * CRISE NO INÍCIO — ⚠️ contexto, ⛔ NUNCA exclusão.
 *
 * A fonte trata crise em **três contextos distintos** (F-24), e o do início é o
 * de **mimetizador possível**: o risco de transformação hemorrágica ao tratar um
 * mimetizador é descrito como muito baixo (F-17).
 *
 * ⛔ A recomendação de anticonvulsivante é para crise **não provocada APÓS** o
 * AVC — ⛔ não para esta. E ⛔ profilaxia é **COR 3: No Benefit**.
 */
export function criseNoInicio(estado: EstadoAvc): Leitura {
  const crise = ternario(estado, "crise_no_inicio");
  const insumos = ["crise_no_inicio"];
  const fonte = "F-24";
  if (crise === undefined) {
    return { conclusao: "desconhecido", texto: "Ocorrência de crise no início ainda não informada", insumos, fonte };
  }
  return crise
    ? {
        conclusao: "sim",
        texto: "Crise no início entra como contexto e possível mimetizador — não exclui AVC nem indica anticonvulsivante por si",
        insumos,
        fonte,
      }
    : { conclusao: "nao", texto: "Sem crise no início", insumos, fonte };
}

/**
 * PESO — ⚠️ a **origem** muda a confiança sem mudar o número (E-14).
 *
 * ⛔ E ele **não trava nada**: Table 7, verbatim — *"Do not delay thrombolysis to
 * obtain exact weight — timely treatment is critical."* (F-09)
 */
export function peso(estado: EstadoAvc): Leitura {
  const p = numero(estado, "peso");
  const origem = valorAtual(estado, "peso_origem");
  const insumos = ["peso", "peso_origem"];
  const fonte = "F-09";
  if (p === undefined) {
    return {
      conclusao: "desconhecido",
      texto: "Peso não informado — pendência que não atrasa terapia tempo-dependente",
      insumos,
      fonte,
    };
  }
  const o = origem && !VAZIOS.includes(String(origem.valor)) ? String(origem.valor) : undefined;
  return {
    conclusao: "sim",
    texto: o ? `Peso informado, origem: ${o}` : "Peso informado, sem origem declarada",
    insumos,
    fonte,
  };
}

/**
 * PRESSÃO ARTERIAL — ⚠️ registra e **NÃO conclui**.
 *
 * ⛔⛔ A Superfície A **não define candidatura à IVT**, e por isso ⛔ não aplica
 * nenhuma meta pressórica. O mesmo valor tem significados opostos conforme o
 * paciente seja ou não candidato a reperfusão (**E-06**), e a candidatura nasce
 * na Superfície E — que ainda não existe.
 *
 * ⚠️ Aplicar aqui o alvo do candidato produziria tratamento que a fonte
 * classifica como **sem benefício, LOE A**, em quem não é candidato.
 */
export function pressaoArterial(estado: EstadoAvc): Leitura {
  const pas = numero(estado, "pas");
  const pad = numero(estado, "pad");
  const insumos = ["pas", "pad"];
  const fonte = "F-04";
  if (pas === undefined || pad === undefined) {
    return { conclusao: "desconhecido", texto: "Pressão arterial não informada", insumos, fonte };
  }
  return {
    conclusao: "sim",
    texto: "Pressão registrada — o significado depende do contexto de reperfusão, ainda não definido",
    insumos,
    fonte,
  };
}

/** Todas as leituras da Superfície A, em ordem de apresentação. */
export function leiturasDaSuperficieA(estado: EstadoAvc): readonly (Leitura & { id: string })[] {
  return [
    { id: "via_aerea", ...suporteDeViaAerea(estado) },
    { id: "oxigenio", ...oxigenio(estado) },
    { id: "spo2_meta", ...spo2AbaixoDaMeta(estado) },
    { id: "hipoglicemia", ...hipoglicemia(estado) },
    { id: "pressao", ...pressaoArterial(estado) },
    { id: "peso", ...peso(estado) },
    { id: "crise", ...criseNoInicio(estado) },
  ];
}

export type { Vazio };
