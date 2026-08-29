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
import { numero, selecaoDe, ternario, VAZIOS } from "./leitura";
import { NAO_SEI, SEM_ACHADOS } from "../conteudo/campo";
import type { Leitura } from "./leitura";
import type { Pendencia, Vazio } from "./tipos";

/**
 * ⚠️ `Leitura`, `numero()` e `ternario()` MORAM EM `./leitura` desde 2026-08-28.
 *
 * Saíram daqui quando a Superfície B nasceu: duas cópias de `ternario()` é a
 * forma mais direta de um "não sei" virar "não" numa superfície e não na outra.
 * O reexport mantém o endereço antigo funcionando para quem já importava daqui.
 */
export type { Leitura };
export { numero, ternario };

/**
 * SUPORTE DE VIA AÉREA — §4.1 rec. 1 · **COR 1 · LOE C-LD**
 *
 * ⚠️ Os dois gatilhos são **clínicos e nomeados pela fonte**: *"decreased
 * consciousness or bulbar dysfunction"*. ⛔ Não há escore, ⛔ não há corte.
 */
export function suporteDeViaAerea(estado: EstadoAvc): Leitura {
  const consc = ternario(estado, "consciencia_rebaixada");
  /**
   * ⚠️⚠️ A DIFICULDADE DE PROTEGER A VIA AÉREA VIROU SELEÇÃO MÚLTIPLA
   * (2026-08-28), e por isso ⛔ NÃO passa por `ternario()` — que devolveria
   * `false` para qualquer conjunto de achados, lendo cinco sinais presentes
   * como "não há".
   *
   * ⚠️ ⛔ NÃO HÁ CONTAGEM: **um** achado já é gatilho. A fonte nomeia
   * *"bulbar dysfunction"* e ⛔ não pede quantidade — exigir dois seria uma
   * regra minha, num lugar onde a consequência é aspiração.
   */
  const achados = selecaoDe(estado, "disfuncao_bulbar");
  const bulbar = achados.some((a) => a !== SEM_ACHADOS && a !== NAO_SEI)
    ? true
    : achados.includes(SEM_ACHADOS)
      ? false
      : undefined;
  const insumos = ["consciencia_rebaixada", "disfuncao_bulbar"];
  const fonte = "F-23";
  if (consc === true || bulbar === true) {
    return { conclusao: "sim", tom: "atencao", curto: "Via aérea pode estar ameaçada", texto: "Suporte de via aérea e ventilação recomendados, conforme a necessidade", insumos, fonte };
  }
  if (consc === undefined || bulbar === undefined) {
    // ⚠️ E-23: um dos dois em branco ⛔ não permite concluir que não há indicação.
    return { conclusao: "desconhecido", tom: "pendente", curto: "Via aérea ainda não avaliada", texto: "Consciência ou função bulbar ainda não avaliadas", insumos, fonte };
  }
  return { conclusao: "nao", tom: "informativo", curto: "Sem sinais de via aérea ameaçada", texto: "Sem os dois gatilhos que a fonte nomeia para suporte de via aérea", insumos, fonte };
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
    return { conclusao: "sim", tom: "atencao", curto: "O₂ suplementar — meta SpO₂ acima de 94%", texto: alvo, insumos, fonte };
  }
  if (hipoxia === false) {
    return {
      conclusao: "nao",
      tom: "informativo", curto: "Sem hipoxemia: O₂ suplementar não recomendado",
      texto: "Sem hipóxia, oxigênio suplementar não é recomendado para melhorar desfecho funcional",
      insumos,
      fonte,
    };
  }
  const comSpo2 = spo2 !== undefined
    ? "SpO₂ registrada, mas a presença de hipóxia ainda não foi informada"
    : "Presença de hipóxia ainda não informada";
  return { conclusao: "desconhecido", tom: "pendente", curto: "Hipoxemia ainda não informada", texto: comSpo2, insumos, fonte };
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
    return { conclusao: "desconhecido", tom: "pendente", curto: "SpO₂ ainda não informada", texto: "SpO₂ não informada", insumos, fonte };
  }
  return spo2 <= 94
    ? { conclusao: "sim", tom: "atencao", curto: "SpO₂ abaixo da meta de 94%", texto: "SpO₂ abaixo da meta de 94% que a fonte declara para o paciente com hipóxia", insumos, fonte }
    : { conclusao: "nao", tom: "informativo", curto: "SpO₂ acima da meta de 94%", texto: "SpO₂ acima da meta de 94%", insumos, fonte };
}

/**
 * GLICEMIA — os DOIS extremos que a fonte nomeia, com forças diferentes.
 *
 * ⚠️⚠️ ⛔ NÃO SÃO A MESMA REGRA, e ⛔ não podem ser achatados num "fora da faixa":
 *
 * · **`<60 mg/dL`** — §4.5 rec. 1, **COR 1 · LOE C-LD**: *"hypoglycemia (blood
 *   glucose <60 mg/dL) should be treated"*. É **limite**, com recomendação
 *   formal atrás dele;
 * · **`>400 mg/dL`** — §4.6.1, *Supportive Text* 5, ⚠️ **sem COR/LOE**:
 *   *"Severe hypo- and hyperglycemia is **typically defined** as <50 and >400
 *   mg/dL, respectively."* É **rótulo de gravidade**, com hedge, e o papel dele
 *   aqui é de **possível mimetizador** — §4.5 rec.: *"urgently treat severe
 *   hypoglycemia and hyperglycemia, **which may mimic acute stroke
 *   presentations**"*.
 *
 * ⛔⛔ O QUE ESTA LEITURA ⛔ NUNCA DIZ (instrução do autor, 2026-08-29):
 * ⛔ "contraindicação à trombólise" · ⛔ "não elegível" · ⛔ "aguardar
 * obrigatoriamente normalizar para continuar". Hiperglicemia grave ⛔ não
 * contraindica IVT e ⛔ não bloqueia superfície nenhuma — e, corrigida a
 * glicemia, se o déficit incapacitante persistir, a própria diretriz recomenda
 * IVT no paciente de outra forma elegível.
 *
 * ⛔⛔ E ⛔ NÃO ENTRA AQUI O `>180 mg/dL`: ele pertence ao **manejo** da
 * hiperglicemia no AVC — dado observacional, com o momento ideal em relação à
 * reperfusão declarado desconhecido pela própria fonte. Papel clínico
 * DIFERENTE do `>400` como mimetizador; misturá-los transformaria uma conduta
 * de suporte numa regra de mimetismo que a fonte ⛔ não escreveu.
 *
 * ⛔ Os outros dois números ⛔ também não entram: `<50` é o rótulo simétrico de
 * "grave", e `<40` é desfecho de segurança de ensaio (F-06).
 */
export function glicemia(estado: EstadoAvc): Leitura {
  const g = numero(estado, "glicemia");
  const insumos = ["glicemia"];
  const fonte = "F-06";
  if (g === undefined) {
    // ⚠️ E-23: glicemia desconhecida ⛔ NÃO é glicemia normal.
    return {
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "Glicemia ainda não informada",
      texto: "Glicemia não informada — desconhecida não é normal",
      insumos,
      fonte,
    };
  }
  if (g < 60) {
    return {
      conclusao: "sim",
      tom: "atencao",
      curto: "Hipoglicemia: abaixo de 60 mg/dL, a fonte manda tratar",
      texto: "A fonte recomenda tratar a hipoglicemia, e reavaliar o déficit depois de normalizada a glicemia",
      insumos,
      fonte,
    };
  }
  if (g > 400) {
    return {
      conclusao: "sim",
      tom: "atencao",
      /**
       * ⚠️ "GRAVE" CARREGA O HEDGE DA FONTE. O verbatim diz *typically defined*
       * — ⛔ não é limite absoluto universal, e a leitura ⛔ não pode endurecê-lo.
       */
      curto: "Hiperglicemia grave — pode mimetizar déficit neurológico",
      texto: "A fonte define hiperglicemia grave tipicamente acima de 400 mg/dL e a trata como possível mimetizador. Corrigir a alteração glicêmica e reavaliar o déficit depois da correção",
      insumos,
      fonte,
    };
  }
  return {
    conclusao: "nao",
    tom: "informativo",
    /**
     * ⚠️ A FRASE ⛔ NÃO PODE AFIRMAR MAIS DO QUE AS REGRAS IMPLEMENTADAS —
     * decisão do autor, 2026-08-29. "Sem hipoglicemia nem hiperglicemia grave"
     * soava como um veredito glicêmico geral; o que o app conferiu foram os
     * DOIS cortes que ele aplica, e ⛔ nada além disso.
     */
    curto: "Sem hipoglicemia significativa nem hiperglicemia grave pelos critérios aplicados aqui",
    texto: "Entre os dois extremos que a fonte nomeia para o AVC agudo: acima de 60 mg/dL, que é o limite abaixo do qual ela manda tratar, e abaixo do valor que ela tipicamente define como hiperglicemia grave",
    insumos,
    fonte,
  };
}

/**
 * ⚠️ Compatibilidade de nome: a regra do `<60` continua consultável por si.
 * ⛔ Não é uma segunda implementação — chama a mesma leitura (I6).
 */
export function hipoglicemia(estado: EstadoAvc): Leitura {
  return glicemia(estado);
}

/**
 * A REAVALIAÇÃO DO DÉFICIT DEPOIS DA CORREÇÃO GLICÊMICA.
 *
 * ⚠️⚠️ ELA EXISTE PORQUE A FONTE MANDA REAVALIAR, ⛔ não porque falta um campo:
 * *"clinical deficits should be assessed after correction of glucose to
 * evaluate thrombolytic eligibility"* (§4.6.1, *Supportive Text* 5) e *"clinical
 * deficits should be assessed after correction of glucose"* na hipoglicemia
 * como mimetizador (§4.6.1 r6, **COR 1 · C-LD**).
 *
 * ⚠️⚠️ É DERIVADA DA TRILHA, ⛔ NÃO DE UM SINALIZADOR GRAVADO: houve glicemia
 * fora dos extremos nomeados, veio depois uma glicemia dentro deles (a
 * correção), e ⛔ nenhum registro neurológico é POSTERIOR a essa correção. É a
 * §3.1 pagando: a trilha guarda a ordem dos fatos, e a ordem é a regra.
 *
 * ⛔ ELA ⛔ NÃO BLOQUEIA NADA. Ela lembra — e o que lembra ⛔ não impede: o déficit
 * que persistir depois da correção ⛔ não deixa de ser elegível por isso.
 */
/**
 * OS CINCO ESTADOS DA REAVALIAÇÃO — ⚠️ **fonte única**.
 *
 * ⚠️⚠️ A LEITURA E A PENDÊNCIA LEEM DAQUI, e ⛔ não cada uma da sua conta. Duas
 * cópias desta lógica é a I6 aplicada a tempo em vez de dose: as duas
 * "funcionariam", e num dia qualquer a pendência diria que falta reavaliar
 * enquanto o alerta diria que já foi — com o médico decidindo por uma delas.
 */
export type EstadoDaReavaliacao =
  | "sem_glicemia"
  | "sem_alteracao"
  | "alterada_agora"
  | "corrigida_sem_exame"
  | "reavaliado";

export function estadoDaReavaliacao(estado: EstadoAvc): EstadoDaReavaliacao {
  const medidas = estado.fatos.filter(
    (f) => f.campo === "glicemia" && typeof f.valor === "number"
  );
  const foraDosExtremos = (v: number) => v < 60 || v > 400;

  if (medidas.length === 0) return "sem_glicemia";
  if (!medidas.some((f) => foraDosExtremos(f.valor as number))) return "sem_alteracao";

  const ultima = medidas[medidas.length - 1];
  if (foraDosExtremos(ultima.valor as number)) return "alterada_agora";

  /**
   * ⚠️ CORRIGIDA. A pergunta passa a ser de ORDEM: houve exame neurológico
   * DEPOIS da correção? ⛔ Um exame anterior ⛔ não responde — ele descreve o
   * paciente de antes, que é justamente o que o mimetizador pode ter alterado.
   */
  const neurologicoDepois = estado.fatos.some(
    (f) =>
      /**
       * ⚠️ OS DOIS NIHSS CONTAM COMO EXAME POSTERIOR — o calculado aqui e o
       * informado por fora —, porque a pergunta é *"houve reavaliação depois da
       * correção?"*. ⛔ O que o externo ⛔ não pode é DERIVAR achado (isso é
       * `derivacoes-b`); registrar que alguém reavaliou, ele pode.
       */
      (f.campo === "deficit_focal"
        || f.campo === "nihss_calculado"
        || f.campo === "nihss_informado") &&
      f.horaRegistro > ultima.horaRegistro
  );
  return neurologicoDepois ? "reavaliado" : "corrigida_sem_exame";
}

/**
 * ⚠️⚠️ A PENDÊNCIA DERIVADA — decisão do autor, 2026-08-29: o estado
 * *"corrigida, e ainda sem exame posterior"* ⛔ não pode ser só um alerta; ele
 * tem de aparecer nas **Pendências do atendimento**, com dono e destino.
 *
 * ⚠️⚠️ ELA ⛔ NÃO É "CAMPO VAZIO", e é por isso que ⛔ não pode passar por
 * `pendenciasAbertas()`: `deficit_focal` pode já ter valor — de ANTES da
 * correção — e a pendência tem de continuar aberta mesmo assim. Aqui o que
 * resolve é a **ordem**, ⛔ não a presença.
 *
 * ⛔ E ela ⛔ não bloqueia nada: pendência é lembrete com endereço (E-07), e
 * ⛔ nenhuma superfície fecha por causa dela. ⛔ Ela também ⛔ não significa
 * contraindicação nem inelegibilidade — o déficit que persistir depois da
 * correção ⛔ não deixa de ser elegível por isso.
 */
export function pendenciasDerivadas(estado: EstadoAvc): readonly Pendencia[] {
  if (estadoDaReavaliacao(estado) !== "corrigida_sem_exame") return [];
  return [
    {
      id: "reavaliar_deficit_pos_glicemia",
      rotulo: "Reavaliar déficit neurológico após correção da glicemia",
      dono: "neurologico",
      /**
       * ⚠️ O campo é o endereço do TOQUE, ⛔ não o critério de fechamento: quem
       * fecha esta pendência é um registro POSTERIOR à correção, e isso quem
       * mede é `estadoDaReavaliacao`.
       */
      campo: "deficit_focal",
      resolvePor: "Registrar o exame neurológico depois da correção",
    },
  ];
}

export function reavaliacaoAposCorrecao(estado: EstadoAvc): Leitura {
  const insumos = ["glicemia", "deficit_focal", "nihss_calculado", "nihss_informado"];
  const fonte = "F-06";
  const situacao = estadoDaReavaliacao(estado);

  /**
   * ⚠️⚠️ SEM GLICEMIA NENHUMA, ⛔ NÃO SE NEGA NADA — a trava pegou isto: a
   * primeira versão devolvia "sem alteração glicêmica" com o estado VAZIO, que é
   * afirmar sobre um dado que ninguém informou (**E-23**). Sem medida, o que se
   * sabe é que ⛔ não se sabe.
   */
  if (situacao === "sem_glicemia") {
    return {
      conclusao: "desconhecido",
      tom: "informativo",
      curto: "Reavaliação após correção depende da glicemia, ainda não informada",
      texto: "Ela passa a valer quando houver hipoglicemia ou hiperglicemia grave registrada",
      insumos,
      fonte,
    };
  }

  if (situacao === "sem_alteracao") {
    return {
      conclusao: "nao",
      tom: "informativo",
      curto: "Sem alteração glicêmica que peça reavaliar o déficit",
      texto: "A reavaliação do déficit após correção vale quando houve hipoglicemia ou hiperglicemia grave",
      insumos,
      fonte,
    };
  }

  if (situacao === "alterada_agora") {
    return {
      conclusao: "desconhecido",
      tom: "atencao",
      curto: "Corrigir a glicemia e reavaliar o déficit depois da correção",
      texto: "A alteração glicêmica ainda está registrada. Depois de corrigida, o déficit precisa ser reavaliado",
      insumos,
      fonte,
    };
  }

  return situacao === "reavaliado"
    ? {
        conclusao: "sim",
        tom: "informativo",
        curto: "Déficit reavaliado depois da correção glicêmica",
        texto: "Há registro neurológico posterior à correção da glicemia",
        insumos,
        fonte,
      }
    : {
        conclusao: "desconhecido",
        tom: "atencao",
        curto: "Glicemia corrigida — reavaliar o déficit agora",
        texto: "A fonte pede avaliar o déficit depois da correção da glicemia. Isto não impede nem atrasa nenhuma terapia",
        insumos,
        fonte,
      };
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
    return {
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "Crise convulsiva no início do quadro ainda não informada",
      texto: "Ocorrência de crise convulsiva no início do quadro ainda não informada",
      insumos,
      fonte,
    };
  }
  return crise
    ? {
        conclusao: "sim",
        tom: "informativo", curto: "Houve crise convulsiva no início: é contexto, e não exclui AVC",
        texto: "Crise no início entra como contexto e possível mimetizador — não exclui AVC nem indica anticonvulsivante por si",
        insumos,
        fonte,
      }
    : {
        conclusao: "nao",
        tom: "informativo",
        /**
         * ⚠️ "Sem crise no início" ⛔ não dizia QUAL crise — relato do autor,
         * 2026-08-29. Na lista de alertas, longe do campo, a palavra sozinha
         * ⛔ não se sustenta: crise hipertensiva? crise de agitação? A frase
         * nomeia o achado inteiro.
         */
        curto: "Sem crise convulsiva no início do quadro",
        texto: "Sem crise convulsiva no início do quadro",
        insumos,
        fonte,
      };
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
      tom: "atencao", curto: "Peso ainda não informado — não atrasar terapia tempo-dependente",
      texto: "Peso não informado — pendência que não atrasa terapia tempo-dependente",
      insumos,
      fonte,
    };
  }
  const o = origem && !VAZIOS.includes(String(origem.valor)) ? String(origem.valor) : undefined;
  return {
    conclusao: "sim",
    tom: "informativo",
    curto: o ? `Peso informado (${o})` : "Peso informado, sem origem declarada",
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
 * na superfície de **Reperfusão** — que ainda não existe.
 *
 * ⚠️ A superfície é nomeada pelo NOME, ⛔ não pela letra: em 2026-08-28 ela
 * deixou de ser "E" e passou a ser "F", e um comentário preso à letra passaria
 * a mandar o leitor à superfície errada.
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
    return { conclusao: "desconhecido", tom: "pendente", curto: "PA ainda não informada", texto: "Pressão arterial não informada", insumos, fonte };
  }
  return {
    conclusao: "sim",
    tom: "informativo", curto: "PA registrada — a meta depende da reperfusão, ainda não definida",
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
    { id: "glicemia", ...glicemia(estado) },
    { id: "reavaliacao_glicemia", ...reavaliacaoAposCorrecao(estado) },
    { id: "pressao", ...pressaoArterial(estado) },
    { id: "peso", ...peso(estado) },
    { id: "crise", ...criseNoInicio(estado) },
  ];
}

export type { Vazio };
