/**
 * DERIVAÇÕES DA SUPERFÍCIE B — Neurológico. Recalculadas a cada leitura,
 * ⛔ nunca gravadas.
 *
 * ⚠️⚠️ A REGRA QUE GOVERNA ESTE ARQUIVO INTEIRO É **E-46**: o sistema produz
 * **leitura intermediária**, ⛔ nunca veredito. ⛔ NÃO existe, e ⛔ não pode
 * existir, uma derivação que devolva `déficit incapacitante = SIM/NÃO`.
 *
 * As três formas que a spec autoriza (§2.8-5), e ⛔ nenhuma outra:
 *   · "há achados tipicamente associados a déficit claramente incapacitante";
 *   · "há achados que podem não ser claramente incapacitantes isoladamente";
 *   · "a avaliação funcional individual permanece necessária".
 *
 * ⛔ NENHUMA derivação aqui decide candidatura a reperfusão, e ⛔ nenhuma usa o
 * NIHSS total como classificador (🚫 do Bloco 3).
 */

import type { EstadoAvc } from "./estado";
import {
  numero,
  respondeuDesconhecido,
  rotuloGravado,
  ternario,
  type Leitura,
} from "./leitura";
import {
  IDS_ACHADOS_PODEM_NAO,
  IDS_ACHADOS_TIPICOS,
  POPULACAO_TABLE4,
} from "../conteudo/superficie-b";
import {
  ACHADOS_DERIVAVEIS,
  CAMPO_DE_ITEM,
  ITENS_NIHSS,
  MOTORES_POR_LADO,
} from "../conteudo/nihss";

/**
 * A leitura dos quadros da Table 4 — ⚠️ com DUAS declarações a mais que uma
 * leitura comum, e nenhuma delas é decoração.
 */
export type LeituraDosQuadros = Leitura & {
  /**
   * Qual das formas autorizadas por §2.8-5 esta leitura está usando.
   *
   * ⚠️ Existe para ser MEDIDO: sem um nome, a prova só poderia conferir texto, e
   * texto se reescreve sem que ninguém perceba que a semântica mudou.
   */
  readonly nivel:
    | "achados_tipicos"
    | "achados_que_podem_nao_ser"
    | "achados_marcados_fora_do_contexto"
    | "nenhum_achado_marcado"
    | "nada_informado";
  /**
   * ⚠️⚠️ **D-1** — em que contexto da fonte este paciente está, para efeito do
   * que o SISTEMA se autoriza a afirmar. ⛔ Não governa campo, ⛔ não governa
   * decisão: governa a leitura.
   */
  readonly contexto: ContextoDaFonte;
  /**
   * ⚠️⚠️ SEMPRE `false`, e ⛔ não pode deixar de ser.
   *
   * É o mesmo mecanismo de `bloqueiaTerapia: false` (E-49): a afirmação fica
   * ESCRITA no objeto, e a prova reprova o dia em que alguém a inverter. Um
   * veredito automático a partir da Table 4 é exatamente o que a fonte proíbe —
   * o quadro é *guidance*, e ⛔ nenhum exemplo dele vira critério absoluto.
   */
  readonly veredito: false;
};

/**
 * ⚠️⚠️ **D-1 · O CONTEXTO EM QUE A FONTE SUSTENTA A DECOMPOSIÇÃO.**
 *
 * A Table 4 declara a própria população — *"Among patients with NIHSS scores 0–5
 * at presentation"* — e a fonte ⛔ **não diz nada** sobre aplicar aqueles quadros
 * acima disso. Três estados, e ⛔ nenhum deles é "não sei" disfarçado:
 *
 *   · `dentro`            — o escore registrado cai na população da fonte;
 *   · `fora`              — cai fora dela, e ⛔ estender seria inventar regra;
 *   · `nao_estabelecido`  — o NIHSS ⛔ ainda não foi registrado, e ⛔ ninguém sabe
 *                           em qual dos dois o paciente está.
 *
 * ⚠️ `nao_estabelecido` ⛔ NÃO é tratado como `dentro`. Presumir o contexto
 * favorável seria extrapolar por omissão — exatamente o que a decisão do autor
 * proíbe. E ⛔ isso não vira exigência: ⛔ nada espera pelo NIHSS, ⛔ nada bloqueia,
 * e o médico decide igual.
 */
export type ContextoDaFonte = "dentro" | "fora" | "nao_estabelecido";

export function contextoDaTable4(estado: EstadoAvc): ContextoDaFonte {
  /**
   * ⚠️⚠️ O CONTEXTO SAI DO NIHSS **CALCULADO AQUI**, e ⛔ não do informado por
   * fora. O de fora pode ter sido medido em outro momento, por outra pessoa, com
   * o paciente noutro estado — e a população da Table 4 é *"NIHSS 0–5 **at
   * presentation**"*. Tomar o externo como contexto seria decidir o escopo da
   * fonte por um dado cuja hora ⛔ não é esta.
   *
   * ⚠️ Sem o cálculo aqui, o contexto fica **não estabelecido** — que é a saída
   * conservadora, e ⛔ não vira exigência: ⛔ nada espera pelo NIHSS.
   */
  const total = nihssCalculado(estado);
  if (total === undefined) return "nao_estabelecido";
  return total >= POPULACAO_TABLE4.nihssMin && total <= POPULACAO_TABLE4.nihssMax
    ? "dentro"
    : "fora";
}

/**
 * ── A DERIVAÇÃO A PARTIR DA ESCALA — decisão do autor, 2026-08-29, opção (a) ──
 *
 * ⚠️⚠️ O QUE ELA É: quando o NIHSS foi preenchido item a item, os achados que a
 * **própria Table 4 define como cortes de item** deixam de ser reperguntados —
 * a escala já os respondeu. É o que a transcrição de F-17 antecipou: *"a
 * decomposição ⛔ não deve reperguntar o que a escala já respondeu"*.
 *
 * ⚠️⚠️ O QUE ELA ⛔ NÃO É, e ⛔ não pode virar:
 *   · ⛔ decisão automática de déficit incapacitante — §2.8-2 proíbe transformar
 *     os itens em algoritmo de elegibilidade, e o julgamento final continua
 *     sendo `incapacitante · não incapacitante · incerto`, do médico;
 *   · ⛔ escrita no NIHSS — alterar o achado ⛔ NÃO altera a escala;
 *   · ⛔ inferência dos achados QUALITATIVOS: *"afasia leve mas ainda comunicando
 *     de forma significativa"*, *"hemiataxia leve mas ainda deambula"* ⛔ não são
 *     cortes de item, e o app ⛔ não os adivinha.
 */

/** A pontuação registrada de um item da escala, ou `undefined` se não respondido. */
export function pontoDoItem(estado: EstadoAvc, item: string): number | undefined {
  return numero(estado, CAMPO_DE_ITEM(item));
}

/** ⚠️ `true` quando TODOS os itens da escala foram respondidos. */
export function escalaPreenchida(estado: EstadoAvc): boolean {
  return ITENS_NIHSS.every((v) => pontoDoItem(estado, v.id) !== undefined);
}

/** O total somado dos itens respondidos, ou `undefined` se a escala não foi preenchida. */
export function totalDaEscala(estado: EstadoAvc): number | undefined {
  if (!escalaPreenchida(estado)) return undefined;
  return ITENS_NIHSS.reduce((soma, v) => soma + (pontoDoItem(estado, v.id) ?? 0), 0);
}

/**
 * ⚠️⚠️ OS DOIS NIHSS SÃO ENTIDADES DIFERENTES, e ⛔ um ⛔ nunca sobrescreve o outro
 * (decisão do autor, 2026-08-29).
 *
 * · **calculado aqui** — sai dos 15 itens, e é o ÚNICO que deriva achado;
 * · **informado por fora** — total recebido da regulação, do SAMU, de outro
 *   serviço. Informação clínica útil, com origem e horário — e ⛔ **nada mais**.
 *
 * ⛔⛔ Um total de fora ⛔ NÃO fabrica os itens que ⛔ não conhecemos: "NIHSS 12"
 * ⛔ não permite concluir hemianopsia, afasia, negligência nem paresia. Se
 * derivasse, o app estaria inventando um exame que ninguém fez aqui.
 */
export function nihssCalculado(estado: EstadoAvc): number | undefined {
  /**
   * ⚠️⚠️ OS ITENS MANDAM, e o total gravado é o registro do gesto.
   *
   * O total é DERIVÁVEL dos 15 itens, e §4.3 diz que derivado ⛔ não se persiste
   * como verdade. Ele é gravado assim mesmo porque é o que o médico CONFIRMOU
   * naquele instante — trilha, ⛔ não verdade. Se os dois existirem, quem responde
   * são os itens; ⛔ eles ⛔ não têm como divergir do total, porque a tela grava os
   * dois no mesmo gesto.
   */
  return totalDaEscala(estado) ?? numero(estado, "nihss_calculado");
}

export function nihssInformado(estado: EstadoAvc): number | undefined {
  return numero(estado, "nihss_informado");
}

/**
 * O valor que a ESCALA dá para um achado da Table 4 — `"sim"`, `"nao"` ou nada.
 *
 * ⚠️ E-23 aqui também: item ⛔ não respondido ⛔ não deriva. ⛔ Um "não" derivado de
 * silêncio seria a negativa silenciosa entrando por uma porta nova.
 */
export function achadoDerivado(estado: EstadoAvc, campo: string): "sim" | "nao" | undefined {
  const regra = ACHADOS_DERIVAVEIS.find((r) => r.campo === campo);
  if (!regra) return undefined;
  const pontos = regra.itens.map((i) => pontoDoItem(estado, i));
  if (pontos.some((p) => p === undefined)) return undefined;
  return pontos.some((p) => (p as number) >= regra.corte) ? "sim" : "nao";
}

/**
 * A LATERALIDADE derivada dos itens motores — ⚠️ e SÓ quando ela é derivável.
 *
 * ⛔ Com os quatro itens motores zerados, o app ⛔ não deriva nada: um déficit
 * visual, sensitivo ou de linguagem tem lado, e os itens motores ⛔ não sabem
 * qual é. Chutar "sem lateralização" ali seria inventar exame.
 */
export function lateralidadeDerivada(estado: EstadoAvc): string | undefined {
  /**
   * ⚠️⚠️ PRESENÇA POR LADO, ⛔ NÃO DIFERENÇA DE SOMAS — correção conceitual do
   * autor, 2026-08-29.
   *
   * A versão anterior comparava a soma esquerda com a direita e chamava o
   * resultado de "lado predominante do déficit". ⛔ Isso ⛔ não é o que os itens
   * dizem: um paciente com afasia, hemianopsia e negligência importantes pode
   * ter motor quase normal, e a aritmética ⛔ não sabe disso. Diferença de somas
   * também transformaria 3×2 num "lado" quando os dois lados estão acometidos.
   *
   * O que os itens motores permitem afirmar é **lateralidade MOTORA**: há
   * déficit à esquerda, à direita, ou nos dois.
   *
   * ⚠️ Com os quatro itens zerados, ⛔ não se deriva nada — decisão do autor. A
   * ausência de déficit MOTOR ⛔ não é ausência de lateralidade: o lado pode
   * estar declarado num déficit que estes itens ⛔ não medem.
   */
  const pontos = (itens: readonly string[]) => itens.map((i) => pontoDoItem(estado, i));
  const esq = pontos(MOTORES_POR_LADO.esquerdo);
  const dir = pontos(MOTORES_POR_LADO.direito);
  if ([...esq, ...dir].some((p) => p === undefined)) return undefined;

  const temEsq = esq.some((p) => (p as number) > 0);
  const temDir = dir.some((p) => (p as number) > 0);
  if (temEsq && temDir) return "Bilateral";
  if (temEsq) return "Esquerda";
  if (temDir) return "Direita";
  return undefined;
}

/** O valor derivado de qualquer campo que a escala alcança. */
export function derivadoDaEscala(estado: EstadoAvc, campo: string): string | undefined {
  if (campo === "lateralidade") return lateralidadeDerivada(estado);
  return achadoDerivado(estado, campo);
}

/**
 * ⚠️⚠️ O VALOR QUE VALE: o registro do MÉDICO manda, e a escala preenche o
 * silêncio.
 *
 * ⚠️ Esta função é **fonte única do valor efetivo** — a tela desenha por ela e as
 * leituras concluem por ela. Se cada lado calculasse o seu, a tela poderia
 * mostrar um achado marcado enquanto o alerta o ignorava.
 */
export function valorEfetivo(estado: EstadoAvc, campo: string): string | undefined {
  const manual = rotuloGravado(estado, campo);
  if (manual !== undefined) return manual;
  if (respondeuDesconhecido(estado, campo)) return "nao_sei";
  return derivadoDaEscala(estado, campo);
}

/** ⚠️ O achado veio da escala, e ⛔ não do dedo do médico. */
export function veioDaEscala(estado: EstadoAvc, campo: string): boolean {
  return (
    rotuloGravado(estado, campo) === undefined &&
    !respondeuDesconhecido(estado, campo) &&
    derivadoDaEscala(estado, campo) !== undefined
  );
}

/**
 * AS DIVERGÊNCIAS ENTRE A ESCALA E O REGISTRO DO MÉDICO.
 *
 * ⚠️⚠️ ELAS PRECISAM SER IDENTIFICÁVEIS (decisão do autor) e ⛔ NÃO PODEM
 * BLOQUEAR NADA. Divergir da escala é julgamento clínico — o item do NIHSS
 * mede o que mede, e o médico está vendo o paciente.
 */
export function divergenciasComAEscala(estado: EstadoAvc): readonly string[] {
  const campos = [...ACHADOS_DERIVAVEIS.map((r) => r.campo), "lateralidade"];
  return campos.filter((campo) => {
    const manual = rotuloGravado(estado, campo);
    const daEscala = derivadoDaEscala(estado, campo);
    if (manual === undefined || daEscala === undefined) return false;
    return manual !== daEscala;
  });
}

/** ⚠️ `true` quando ALGUM dos campos foi respondido com "Sim". */
function algumSim(estado: EstadoAvc, ids: readonly string[]): boolean {
  /**
   * ⚠️ LÊ O VALOR EFETIVO: o achado que a ESCALA respondeu conta como
   * respondido — ⛔ ele não é "silêncio" só por não ter passado pelo dedo do
   * médico. É o que a decisão do autor pede ao derivar em vez de reperguntar.
   */
  return ids.some((id) => valorEfetivo(estado, id) === "sim");
}

/** ⚠️ `true` quando NENHUM dos campos foi tocado — ⛔ diferente de todos "Não". */
function nenhumRespondido(estado: EstadoAvc, ids: readonly string[]): boolean {
  return ids.every((id) => valorEfetivo(estado, id) === undefined);
}

/**
 * EXAME NEUROLÓGICO — F-13.
 *
 * ⚠️⚠️ A RESPOSTA NEGATIVA ⛔ NÃO EXCLUI AVC, e isso ⛔ não é cautela retórica: a
 * fonte ⛔ **não define critério de suspeita** para o ambiente intra-hospitalar
 * (achado negativo de F-13), e a suspeita é condição operacional de entrada do
 * módulo (R1.1). Um "não" que fechasse o quadro seria regra inventada.
 */
export function exameNeurologico(estado: EstadoAvc): Leitura {
  const focal = ternario(estado, "deficit_focal");
  const insumos = ["deficit_focal"];
  const fonte = "F-13";
  if (focal === undefined) {
    return {
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "Exame neurológico ainda não registrado",
      texto: "A fonte recomenda medir o déficit com escala de gravidade, preferencialmente o NIHSS, na avaliação inicial",
      insumos,
      fonte,
    };
  }
  return focal
    ? {
        conclusao: "sim",
        tom: "informativo",
        curto: "Déficit focal observado",
        texto: "Déficit focal registrado no exame",
        insumos,
        fonte,
      }
    : {
        conclusao: "nao",
        tom: "informativo",
        curto: "Sem déficit focal observado no exame registrado",
        texto: "A fonte não define critério de suspeita, e esta resposta não exclui AVC",
        insumos,
        fonte,
      };
}

/**
 * NIHSS — ⚠️⚠️ A LEITURA É SOBRE **EXISTIR**, ⛔ NUNCA SOBRE O VALOR.
 *
 * ⛔ Este arquivo ⛔ não compara o total com corte nenhum, e ⛔ não devolve
 * gravidade. *"Use of the NIHSS score alone does not suffice"* — usar o total
 * como classificador é a primeira das duas marcas 🚫 do Bloco 3.
 *
 * ⚠️ A prova da superfície percorre **0 a 42** e exige que a leitura seja
 * IDÊNTICA em todos: é assim que um `if (total >= 15)` acrescentado de boa-fé
 * reprova, em vez de passar despercebido.
 */
export function nihssRegistrado(estado: EstadoAvc): Leitura {
  const calculado = nihssCalculado(estado);
  const informado = nihssInformado(estado);
  const insumos = ["nihss_calculado", "nihss_informado"];
  const fonte = "F-17";

  if (calculado === undefined && informado === undefined) {
    return {
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "NIHSS ainda não registrado",
      texto: "A fonte recomenda a escala para medir o déficit, e nenhum campo desta superfície atrasa terapia",
      insumos,
      fonte,
    };
  }

  /**
   * ⚠️⚠️ OS DOIS CONVIVEM, e a tela DIZ que convivem. ⛔ Nenhum corrige o outro:
   * um exame de fora e um exame aqui podem divergir legitimamente porque foram
   * feitos em momentos diferentes — e apagar um deles apagaria a evolução.
   */
  if (calculado !== undefined && informado !== undefined) {
    return {
      conclusao: "sim",
      tom: "informativo",
      curto: "Há um NIHSS informado por fora e um calculado aqui",
      texto: "Os dois ficam registrados, com origem e horário. Nenhum corrige o outro: podem ser observações de momentos diferentes",
      insumos,
      fonte,
    };
  }

  if (calculado === undefined) {
    return {
      conclusao: "sim",
      tom: "informativo",
      curto: "NIHSS informado por fora — os achados não são derivados dele",
      texto: "Um total trazido de fora não diz quais itens pontuaram, e por isso não preenche nenhum achado. O exame aqui é o que deriva",
      insumos,
      fonte,
    };
  }

  return {
    conclusao: "sim",
    tom: "informativo",
    curto: "NIHSS registrado — o total sozinho não classifica o déficit",
    texto: "O escore total entra como medida. Os itens da escala entram na avaliação do déficit, e o total sozinho não basta",
    insumos,
    fonte,
  };
}

/**
 * FUNCIONALIDADE PRÉVIA (mRS) — F-14, ⚠️ **contexto**, ⛔ nunca porta.
 *
 * ⛔ A leitura ⛔ não nomeia terapia elegível nem contraindicada: a fonte declara
 * incerteza na IVT (*"remain uncertain… on an individual basis"*, sem COR/LOE) e
 * usa o valor como **gradiente de força** na EVT — e ⛔ sequer nomeia um corte.
 */
export function funcionalidadePrevia(estado: EstadoAvc): Leitura {
  const grau = rotuloGravado(estado, "mrs_previo");
  const insumos = ["mrs_previo"];
  const fonte = "F-14";
  if (grau === undefined) {
    return {
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "Funcionalidade prévia ainda não registrada",
      texto: "Contexto clínico estruturado, e a fonte não nomeia valor de corte",
      insumos,
      fonte,
    };
  }
  return {
    conclusao: "sim",
    tom: "informativo",
    curto: "Funcionalidade prévia registrada",
    texto: "Contexto clínico estruturado. O peso da informação muda conforme a terapia considerada, e a fonte não nomeia valor de corte",
    insumos,
    fonte,
  };
}

/**
 * A PERGUNTA FUNCIONAL — ⚠️ a estrutura principal do julgamento (§2.8-3).
 *
 * ⚠️⚠️ ⛔ A LEITURA ⛔ NÃO TRADUZ A RESPOSTA EM VEREDITO. "A resposta funcional
 * aponta limitação" ⛔ não é "déficit incapacitante": quem decide isso é o médico,
 * no campo da decisão, e a decisão dele pode divergir desta leitura sem erro.
 */
export function avaliacaoFuncional(estado: EstadoAvc): Leitura {
  const preservada = ternario(estado, "funcional_avd_trabalho");
  const insumos = ["funcional_avd_trabalho"];
  const fonte = "F-17";
  if (preservada === undefined) {
    return {
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "Pergunta funcional ainda não respondida",
      texto: "A avaliação funcional individual permanece necessária, e é a estrutura principal do julgamento",
      insumos,
      fonte,
    };
  }
  return preservada
    ? {
        conclusao: "nao",
        tom: "informativo",
        curto: "A resposta funcional não aponta limitação para as atividades habituais",
        texto: "A avaliação funcional individual permanece necessária, considerando as circunstâncias individuais",
        insumos,
        fonte,
      }
    : {
        conclusao: "sim",
        tom: "atencao",
        curto: "A resposta funcional aponta limitação para as atividades habituais",
        texto: "A avaliação funcional individual permanece necessária, considerando as circunstâncias individuais",
        insumos,
        fonte,
      };
}

/**
 * DEAMBULAÇÃO E DEGLUTIÇÃO — F-17, Table 4: *"the ability to ambulate and
 * swallow independently should be assessed"*.
 *
 * ⚠️ São as duas capacidades que a fonte manda avaliar POR NOME para dimensionar
 * o déficit. ⛔ Não são critério, e ⛔ não decidem nada sozinhas.
 */
export function deambulacaoEDegluticao(estado: EstadoAvc): Leitura {
  const anda = ternario(estado, "deambulacao_independente");
  const engole = ternario(estado, "degluticao_independente");
  const insumos = ["deambulacao_independente", "degluticao_independente"];
  const fonte = "F-17";
  if (anda === false || engole === false) {
    return {
      conclusao: "sim",
      tom: "atencao",
      curto: "Deambulação ou deglutição independente comprometida",
      texto: "A fonte pede avaliar especificamente a capacidade de deambular e de deglutir de forma independente",
      insumos,
      fonte,
    };
  }
  if (anda === undefined || engole === undefined) {
    // ⚠️ E-23: uma das duas em branco ⛔ não autoriza concluir que ambas estão preservadas.
    return {
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "Deambulação e deglutição ainda não avaliadas",
      texto: "A fonte pede avaliar especificamente a capacidade de deambular e de deglutir de forma independente",
      insumos,
      fonte,
    };
  }
  return {
    conclusao: "nao",
    tom: "informativo",
    curto: "Deambulação e deglutição independentes preservadas",
    texto: "As duas capacidades que a fonte manda avaliar por nome estão preservadas",
    insumos,
    fonte,
  };
}

/**
 * OS QUADROS DA TABLE 4 — ⚠️⚠️ **leitura intermediária**, ⛔ nunca veredito.
 *
 * ⚠️ A ORDEM DAS BRANCH IMPORTA CLINICAMENTE: um achado tipicamente incapacitante
 * ⛔ não é cancelado por um achado da outra coluna. Os dois coexistem no mesmo
 * paciente, e a fonte ⛔ não manda subtrair um do outro.
 *
 * ⚠️ `conclusao` permanece `desconhecido` em TODAS as saídas de propósito: o
 * campo existe para dizer o que o SISTEMA concluiu, e aqui ele ⛔ não conclui
 * nada — quem conclui é o médico. Quem carrega a informação é `nivel`.
 */
export function achadosDosQuadros(estado: EstadoAvc): LeituraDosQuadros {
  // ⚠️ O NIHSS entra nos insumos porque é ele que DIZ O CONTEXTO (E-22) — e ⛔ não
  // porque classifique coisa alguma: dentro do contexto, o valor dele ⛔ não muda
  // uma vírgula da leitura.
  const insumos = ["nihss_calculado", ...IDS_ACHADOS_TIPICOS, ...IDS_ACHADOS_PODEM_NAO];
  const contexto = contextoDaTable4(estado);
  const base = { conclusao: "desconhecido", veredito: false, contexto, insumos, fonte: "F-17" } as const;

  /**
   * ⚠️⚠️ **D-1 NA PRÁTICA.** Há achado marcado e o paciente ⛔ NÃO está na
   * população da Table 4 (ou ⛔ ninguém sabe se está): o app **registra e se
   * cala**. ⛔ Nenhuma frase normativa da fonte é reutilizada aqui — nem a da
   * esquerda nem a da direita —, porque nenhuma delas foi escrita para este
   * paciente.
   *
   * ⚠️ O que ⛔ NÃO acontece, e é o ponto inteiro da decisão: o campo continua
   * respondido, a resposta continua na trilha, e a decisão do médico continua
   * disponível e sem interferência. O limite é do SISTEMA, ⛔ não do médico.
   */
  if (contexto !== "dentro"
      && (algumSim(estado, IDS_ACHADOS_TIPICOS) || algumSim(estado, IDS_ACHADOS_PODEM_NAO))) {
    return {
      ...base,
      nivel: "achados_marcados_fora_do_contexto",
      tom: "informativo",
      curto: "Achados registrados, e o sistema não estende a leitura da fonte a este contexto",
      texto: contexto === "fora"
        ? "O quadro da fonte foi escrito para NIHSS 0 a 5 na apresentação, e a avaliação funcional individual permanece necessária"
        : "O quadro da fonte foi escrito para NIHSS 0 a 5 na apresentação, o NIHSS ainda não foi registrado, e nada aqui espera por ele",
    };
  }

  if (algumSim(estado, IDS_ACHADOS_TIPICOS)) {
    return {
      ...base,
      nivel: "achados_tipicos",
      tom: "atencao",
      curto: "Há achados tipicamente considerados claramente incapacitantes",
      texto: "Isto é orientação da fonte, não critério absoluto, e a avaliação funcional individual permanece necessária",
    };
  }
  if (algumSim(estado, IDS_ACHADOS_PODEM_NAO)) {
    return {
      ...base,
      nivel: "achados_que_podem_nao_ser",
      tom: "informativo",
      curto: "Há achados que podem não ser claramente incapacitantes isoladamente",
      texto: "Podem não ser não significa não são, e a avaliação funcional individual permanece necessária",
    };
  }
  /**
   * ⚠️⚠️ VARRE OS ONZE ACHADOS, ⛔ NÃO `insumos` — e a diferença apareceu na
   * trava: desde que o NIHSS entrou nos insumos (para declarar de onde vem o
   * contexto, E-22), varrer `insumos` fazia um NIHSS registrado, sozinho, contar
   * como "alguém respondeu alguma coisa nos quadros". O resultado era um
   * paciente sem nenhum achado tocado sendo lido como "nenhum achado marcado" —
   * silêncio virando resposta negativa, que é E-23 ao contrário.
   */
  if (nenhumRespondido(estado, [...IDS_ACHADOS_TIPICOS, ...IDS_ACHADOS_PODEM_NAO])) {
    return {
      ...base,
      nivel: "nada_informado",
      tom: "pendente",
      curto: "Achados dos quadros ainda não informados",
      texto: "Esta decomposição é apoio ao julgamento, e a avaliação funcional individual permanece necessária",
    };
  }
  return {
    ...base,
    nivel: "nenhum_achado_marcado",
    tom: "informativo",
    curto: "Nenhum dos achados dos quadros foi marcado como presente",
    texto: "A avaliação funcional individual permanece necessária, considerando as circunstâncias individuais",
  };
}

/**
 * A DECISÃO ASSUMIDA, E A DIVERGÊNCIA — §2.8 passos 4 a 7.
 *
 * ⚠️⚠️ **A DIVERGÊNCIA TEM UMA DIREÇÃO SÓ, e isso é fidelidade à fonte.**
 *
 * Decidir "não incapacitante" havendo achado da coluna *typically disabling* é
 * divergência da orientação — e fica registrada, sem bloquear nada. O caminho
 * inverso ⛔ NÃO é divergência: a coluna da direita diz *"may not be clearly
 * disabling **in an individual patient**"*, e decidir "incapacitante" diante
 * dela é exatamente a circunstância individual que a fonte manda considerar.
 * Acusar divergência ali achataria o hedge que E-45 manda preservar.
 */
export function decisaoDoMedico(estado: EstadoAvc): Leitura {
  const decisao = rotuloGravado(estado, "incapacitante_assumido");
  const insumos = ["incapacitante_assumido", ...IDS_ACHADOS_TIPICOS];
  const fonte = "F-17";

  /**
   * ⚠️⚠️ "INCERTO" É DECISÃO, ⛔ NÃO É AUSÊNCIA DE DECISÃO — §2.8-6 lista TRÊS:
   * `incapacitante · não incapacitante · incerto`.
   *
   * ── O DEFEITO QUE ISTO CORRIGE (achado ao escrever a trava, 2026-08-28) ──
   *
   * "Incerto" grava `nao_sei`, e `rotuloGravado()` devolve `undefined` para os
   * vazios — deliberadamente, porque em quase todo campo `nao_sei` É ausência
   * de conclusão. Aqui ⛔ não é: o médico OLHOU, PENSOU e concluiu que não dá
   * para concluir, e essa conclusão é dele.
   *
   * ⚠️ Colapsar as duas apagaria da tela a diferença entre "o médico ainda não
   * chegou nesta pergunta" e "o médico decidiu que o caso é incerto" — que é o
   * colapso que **E-23** e **E-37** proíbem, aqui na espécie mais cara: a
   * autoria do julgamento (§2.8-5, §2.8-6).
   */
  const incerto = respondeuDesconhecido(estado, "incapacitante_assumido");
  if (incerto) {
    return {
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "Déficit assumido como incerto pelo médico",
      texto: "Incerto é uma das três decisões que a spec prevê, fica registrada como decisão, e não bloqueia o atendimento",
      insumos,
      fonte,
    };
  }

  if (decisao === undefined) {
    return {
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "Decisão sobre o déficit ainda não assumida",
      texto: "A leitura do sistema é apoio ao julgamento, e a decisão permanece do médico",
      insumos,
      fonte,
    };
  }
  /**
   * ⚠️⚠️ **D-1 TAMBÉM AQUI, e este é o caminho por onde a extrapolação voltaria
   * pela porta dos fundos.**
   *
   * Divergência é divergir DA LEITURA DO SISTEMA. Fora da população da Table 4 o
   * sistema ⛔ não emite leitura normativa nenhuma — logo ⛔ não há do que
   * divergir, e acusar divergência ali seria aplicar o quadro fora do escopo
   * exatamente como se ele valesse.
   */
  if (
    contextoDaTable4(estado) === "dentro"
    && decisao === "Não incapacitante"
    && algumSim(estado, IDS_ACHADOS_TIPICOS)
  ) {
    return {
      conclusao: "sim",
      tom: "atencao",
      curto: "Decisão registrada, e ela diverge da leitura do sistema",
      texto: "Há achados tipicamente considerados claramente incapacitantes. Divergir não é erro, não bloqueia o atendimento, e a divergência fica registrada",
      insumos,
      fonte,
    };
  }
  return {
    conclusao: "sim",
    tom: "informativo",
    curto: "Decisão sobre o déficit registrada pelo médico",
    texto: "A decisão do médico fica guardada, e a leitura do sistema continua sendo recalculada ao lado dela",
    insumos,
    fonte,
  };
}

/**
 * ⚠️⚠️ A SUPERFÍCIE É PULÁVEL — **R3.10**, e é a segunda marca 🚫 do Bloco 3.
 *
 * *"Once deficits have been determined to be disabling, delaying IVT is
 * potentially harmful, given the powerful impact of time from onset of symptoms
 * to treatment on clinical outcomes."*
 *
 * ⚠️ Por isso esta leitura ⛔ não tem estado "faltam campos": ela existe para dizer
 * que a falta ⛔ não é motivo de espera. Uma tela que cobrasse a decomposição
 * completa fabricaria o atraso que a fonte chama de potencialmente prejudicial.
 */
export function decomposicaoNaoAtrasa(estado: EstadoAvc): Leitura {
  const decisao = rotuloGravado(estado, "incapacitante_assumido");
  const insumos = ["incapacitante_assumido"];
  const fonte = "F-17";
  if (decisao === "Incapacitante") {
    return {
      conclusao: "sim",
      tom: "atencao",
      curto: "Déficit assumido como incapacitante — não atrasar a terapia para completar esta superfície",
      texto: "Uma vez determinado que o déficit é incapacitante, a fonte diz que atrasar a trombólise é potencialmente prejudicial",
      insumos,
      fonte,
    };
  }
  return {
    conclusao: "sim",
    tom: "informativo",
    curto: "Esta superfície é apoio ao julgamento e pode ser deixada incompleta",
    texto: "Nenhum campo desta superfície é obrigatório, e nenhum deles atrasa terapia tempo-dependente",
    insumos,
    fonte,
  };
}

/**
 * ⚠️⚠️ **D-5 · A CONSULTA A PACIENTE E FAMÍLIA — registro, ⛔ nunca requisito.**
 *
 * *"The clinician should make this determination in consultation with the
 * patient and available family."*
 *
 * ⚠️ ESTA LEITURA ⛔ NÃO COBRA NADA. Ela existe para o oposto: dizer, na tela,
 * que a conversa é opcional e que ⛔ nada espera por ela. Uma leitura que
 * dissesse "consulta pendente" transformaria orientação em espera, e espera aqui
 * é a família de dano que as doze marcas 🚫 existem para impedir.
 *
 * ⚠️ E ela é FOLHA: ⛔ nenhuma outra leitura olha para este campo. A prova varre
 * todas as leituras com e sem consulta e exige que ⛔ nenhuma mude — porque
 * "requisito" ⛔ não precisa estar escrito para existir; basta uma leitura reagir.
 */
export function consultaAoPacienteEFamilia(estado: EstadoAvc): Leitura {
  const com = rotuloGravado(estado, "consulta_paciente_familia");
  const naoSei = respondeuDesconhecido(estado, "consulta_paciente_familia");
  const insumos = ["consulta_paciente_familia"];
  const fonte = "F-17";
  if (com === undefined && !naoSei) {
    return {
      conclusao: "desconhecido",
      // ⚠️ `informativo`, ⛔ nunca `pendente`: pendente é vocabulário de coisa que
      // falta, e aqui ⛔ não falta nada.
      tom: "informativo",
      /**
       * ⚠️ A TELA CLÍNICA ⛔ NÃO DOCUMENTA ARQUITETURA — ajuste do autor,
       * 2026-08-29: *"'não é requisito para decidir nem para reperfundir' é
       * correto como regra interna, mas para o médico soa como documentação de
       * arquitetura"*. A regra inteira continua na spec e nas travas; aqui fica
       * o que ele precisa saber.
       */
      curto: "Discussão com paciente ou família ainda não registrada, e é opcional",
      texto: "A fonte orienta determinar o déficit em conversa com o paciente e a família disponível. Não impede continuar o atendimento",
      insumos,
      fonte,
    };
  }
  return {
    conclusao: "sim",
    tom: "informativo",
    curto: "Discussão com paciente ou família registrada",
    texto: "Registro guardado com a hora na trilha do atendimento. Não impede continuar o atendimento",
    insumos,
    fonte,
  };
}

/**
 * A DIVERGÊNCIA ENTRE A ESCALA E O REGISTRO DO MÉDICO — ⚠️ identificável, e
 * ⛔ nunca bloqueante (decisão do autor, 2026-08-29).
 *
 * ⚠️ `tom: "informativo"`, ⛔ não `atencao`: divergir da escala ⛔ não é erro a
 * corrigir. O item do NIHSS mede o que mede, e quem está vendo o paciente é o
 * médico — o que a tela deve é DIZER que os dois discordam, ⛔ não pedir que um
 * ceda.
 */
export function divergenciaDaEscala(estado: EstadoAvc): Leitura {
  const divergentes = divergenciasComAEscala(estado);
  const insumos = ["nihss_calculado", ...ACHADOS_DERIVAVEIS.map((r) => r.campo), "lateralidade"];
  const fonte = "F-17";
  /**
   * ⚠️⚠️ SEM ESCALA PREENCHIDA ⛔ NÃO HÁ O QUE COMPARAR — e a trava pegou isto: a
   * primeira versão dizia "sem divergência" com o estado VAZIO, que é afirmar
   * concordância entre dois lados que ⛔ não existem (**E-23**). É o mesmo erro
   * que já cometi na reavaliação glicêmica, na mesma semana.
   */
  const haDerivado = [...ACHADOS_DERIVAVEIS.map((r) => r.campo), "lateralidade"].some(
    (campo) => derivadoDaEscala(estado, campo) !== undefined
  );
  if (!haDerivado) {
    return {
      conclusao: "desconhecido",
      tom: "informativo",
      curto: "A escala ainda não foi preenchida, e nada é derivado dela",
      texto: "Com o NIHSS preenchido item a item, os achados que a fonte define por corte de item passam a vir da escala",
      insumos,
      fonte,
    };
  }

  if (divergentes.length === 0) {
    return {
      conclusao: "nao",
      tom: "informativo",
      curto: "Sem divergência entre a escala e o registro do médico",
      texto: "Os achados registrados coincidem com o que os itens do NIHSS respondem, ou ainda não foram alterados",
      insumos,
      fonte,
    };
  }
  return {
    conclusao: "sim",
    tom: "informativo",
    curto: "Há achado registrado diferente do que a escala deriva",
    texto: "O NIHSS permanece como foi preenchido, e o registro do médico prevalece na avaliação. A divergência fica identificável e não bloqueia nada",
    insumos,
    fonte,
  };
}

/** Todas as leituras da Superfície B, em ordem de apresentação. */
export function leiturasDaSuperficieB(estado: EstadoAvc): readonly (Leitura & { id: string })[] {
  return [
    { id: "decomposicao_nao_atrasa", ...decomposicaoNaoAtrasa(estado) },
    { id: "avaliacao_funcional", ...avaliacaoFuncional(estado) },
    { id: "achados_quadros", ...achadosDosQuadros(estado) },
    { id: "deambulacao_degluticao", ...deambulacaoEDegluticao(estado) },
    { id: "decisao_medico", ...decisaoDoMedico(estado) },
    { id: "consulta_paciente_familia", ...consultaAoPacienteEFamilia(estado) },
    { id: "exame_neurologico", ...exameNeurologico(estado) },
    { id: "nihss", ...nihssRegistrado(estado) },
    { id: "divergencia_escala", ...divergenciaDaEscala(estado) },
    { id: "funcionalidade_previa", ...funcionalidadePrevia(estado) },
  ];
}
