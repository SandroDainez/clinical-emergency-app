/**
 * DERIVAÇÕES DA SUPERFÍCIE C — Imagem. Recalculadas a cada leitura, ⛔ nunca
 * gravadas (§4.3).
 *
 * ⚠️⚠️ ESTE ARQUIVO CARREGA O ÚNICO BLOQUEIO DE CLASSE DO MÓDULO, e é preciso
 * dizer com precisão o que isso significa:
 *
 *   · **F-16, rec. 1 · COR 1 · LOE A** — *"…exclude intracranial hemorrhage
 *     **before initiating reperfusion interventions**"*. Isto é **E-08**: um
 *     bloqueio que governa uma CLASSE inteira de ações, e ⛔ não um campo;
 *   · o bloqueio é **derivado**, ⛔ nunca gravado, e ⛔ nunca propriedade de campo
 *     (**PD-23**, **E-43**) — ⛔ nenhum campo de C tem `bloqueiaTerapia: true`;
 *   · ⛔ **NADA MAIS EM C BLOQUEIA COISA ALGUMA.** Angiotomografia, ASPECTS,
 *     sítio da oclusão, efeito de massa, imagem avançada e alergia a contraste
 *     ⛔ não entram, ⛔ nem por dentro, em ⛔ nenhuma leitura sobre reperfusão.
 *
 * ⚠️⚠️ **E-23 É A ARMADILHA DESTE ARQUIVO.** "A tomografia ⛔ não foi registrada"
 * ⛔ **NÃO É** "⛔ não há hemorragia" — e ⛔ também ⛔ não é "há". São TRÊS estados
 * (E-37), e o único que libera a classe é o **positivo declarado**. A ausência
 * ⛔ não afirma hemorragia: ela apenas ⛔ não afirma a exclusão.
 */

import type { EstadoAvc } from "./estado";
import { valorAtual } from "./estado";
import { instanciasDe, valorNaInstancia } from "./instancia";
import {
  numero,
  respondeuDesconhecido,
  rotuloGravado,
  selecaoDe,
  ternario,
  type Leitura,
} from "./leitura";
import type { Pendencia } from "./tipos";
import {
  ESTUDO,
  MODALIDADE,
  MODALIDADES_VASCULARES,
  DESTINOS_DA_IMAGEM,
  FATO_ASSOCIADO,
  IDS_DOSSIE_ENDOVASCULAR,
  RESULTADO_TC,
  SAIDA_SEM_CONCLUSAO,
  campoDeC,
} from "../conteudo/superficie-c";

/**
 * ⚠️⚠️ UM ESTUDO, COMO AS LEITURAS O ENXERGAM.
 *
 * ⚠️ `modalidade` decide **o que ele pode responder**; `procedencia` e `hora`
 * qualificam sem mudar o achado; `resultado` é o achado que governa a classe.
 */
export type Estudo = {
  readonly id: string;
  readonly modalidade?: string;
  readonly procedencia?: string;
  readonly hora?: number;
  readonly horaConhecida: boolean;
  readonly horaDesconhecida: boolean;
  readonly resultado?: string;
};

const rotuloNa = (estado: EstadoAvc, inst: string, campo: string): string | undefined => {
  const f = valorNaInstancia(estado, inst, campo);
  if (f === undefined) return undefined;
  const v = String(f.valor);
  return v === "nao_perguntado" || v === "nao_sei" ? undefined : v;
};

/** Todos os estudos registrados, na ordem de REGISTRO — que é sempre conhecida (§3.2). */
export function estudos(estado: EstadoAvc): readonly Estudo[] {
  return instanciasDe(estado, ESTUDO).map((id) => {
    const f = valorNaInstancia(estado, id, "estudo_hora");
    const hora = typeof f?.valor === "number" ? f.valor : undefined;
    return {
      id,
      modalidade: rotuloNa(estado, id, "estudo_modalidade"),
      procedencia: rotuloNa(estado, id, "estudo_procedencia"),
      hora,
      horaConhecida: hora !== undefined,
      horaDesconhecida: String(f?.valor ?? "") === "nao_sei",
      resultado: rotuloNa(estado, id, "estudo_resultado"),
    };
  });
}

/**
 * ⚠️⚠️ **TC SEM CONTRASTE**, e ⛔ NÃO "qualquer tomografia" — correção do autor
 * (2026-08-30):
 *
 * > *"TC de perfusão ⛔ não pode fazer o app concluir que a TC sem contraste
 * > inicial está feita."*
 *
 * ⚠️ Sem esta precisão, a arquitetura de instâncias ficaria tecnicamente
 * correta e ainda assim **responderia à pergunta clínica errada**.
 */
export function tcsSemContraste(estado: EstadoAvc): readonly Estudo[] {
  return estudos(estado).filter((e) => e.modalidade === MODALIDADE.tcSemContraste);
}

export type OrdemEntreEstudos = "nenhuma" | "unica" | "estabelecida" | "nao_estabelecivel";

/**
 * A ORDEM CLÍNICA ENTRE ESTUDOS — ⚠️ e ela ⛔ **não** olha `horaRegistro`.
 *
 * ⚠️⚠️ Ordem de digitação ⛔ não é ordem clínica. Empate também ⛔ não estabelece
 * ordem: dois exames no mesmo instante ⛔ não se ordenam entre si.
 */
export function ordemEntreEstudos(lista: readonly Estudo[]): OrdemEntreEstudos {
  if (lista.length === 0) return "nenhuma";
  if (lista.length === 1) return "unica";
  if (!lista.every((e) => e.horaConhecida)) return "nao_estabelecivel";
  const horas = lista.map((e) => e.hora as number);
  return new Set(horas).size === horas.length ? "estabelecida" : "nao_estabelecivel";
}

export type SituacaoDaTc =
  | "nenhuma_registrada"
  | "realizada_resultado_pendente"
  | "realizada_resultado_registrado";

/**
 * A SITUAÇÃO DA TC SEM CONTRASTE — ⚠️ **derivada**, e ⛔ nunca gravada (§4.3).
 *
 * ── ⚠️⚠️ ⛔ POR QUE ⛔ NÃO EXISTE MAIS UM CAMPO `tc_situacao` ─────────────────────
 *
 * Ele existia dentro de `tc_resultado`, como duas das quatro opções. Mantê-lo
 * como campo **e** derivar das instâncias criaria estado contraditório: o médico
 * responde *"ainda ⛔ não realizada"*, registra um estudo de TC depois, e a trilha
 * passa a afirmar as duas coisas.
 *
 * ⚠️⚠️ E a terceira linha é deliberada: ⛔ **nunca** *"ainda ⛔ não realizada"*, que é
 * afirmação sobre **o mundo** tirada da ausência de registro — o que **E-23**
 * proíbe. *"⛔ Nenhuma TC sem contraste registrada"* é afirmação sobre a **trilha**,
 * e é verdadeira.
 *
 * ⛔ E ⛔ não fecha pendência nenhuma (**PD-22**): o resultado pendente continua
 * sendo a tarefa mais importante do atendimento.
 */
export function situacaoDaTcSemContraste(estado: EstadoAvc): SituacaoDaTc {
  const tcs = tcsSemContraste(estado);
  if (tcs.length === 0) return "nenhuma_registrada";
  return tcs.some((e) => e.resultado !== undefined)
    ? "realizada_resultado_registrado"
    : "realizada_resultado_pendente";
}

/** ⚠️ A leitura da imagem declara o ESTADO NOMEADO, para a prova ⛔ não medir texto. */
export type LeituraDaExclusao = Leitura & {
  /**
   * ⚠️⚠️ TRÊS ESTADOS, e ⛔ nunca um booleano — pedido explícito do autor.
   *
   * `sem_informacao` cobre "⛔ ninguém respondeu", "ainda ⛔ não realizada" e
   * "realizada, resultado ⛔ não disponível": os três ⛔ não afirmam a exclusão, e
   * a **frase** distingue cada um. O que ⛔ não pode existir é um estado
   * intermediário lido como exclusão.
   */
  readonly exclusao:
    | "excluida"
    | "hemorragia_presente"
    | "divergente"
    | "sem_informacao";
  /** ⚠️ Os estudos que sustentam a leitura — a tela os nomeia (E-30). */
  readonly estudos: readonly string[];
};

const FONTE_EXCLUSAO = "F-16";
const INSUMOS_EXCLUSAO = ["estudo_resultado"];

/**
 * A EXCLUSÃO DE HEMORRAGIA — ⚠️ a leitura mais cara do módulo.
 *
 * ⚠️⚠️ ELA OLHA PARA **UM** CAMPO, e a prova mede isso: se algum dia ela passar a
 * ler `suspeita_hsa`, a disponibilidade da angio ou qualquer outro, um achado
 * que ⛔ não é hemorragia na tomografia passará a segurar a classe inteira de
 * reperfusão — exatamente o tipo de bloqueio inventado que as doze marcas 🚫
 * existem para impedir.
 *
 * ── ⚠️⚠️ A DIVERGÊNCIA, E ⛔ POR QUE ELA ⛔ NÃO ELEGE (autor, 2026-08-30) ────────
 *
 * Dois estudos podem discordar. A resposta do autor é **reter nos dois
 * sentidos**, e a razão é o que ele proibiu explicitamente:
 *
 * > *"fazer o app preferir 'local', 'mais novo', 'mais confiável' ou qualquer
 * > outro atributo sem regra explícita seria justamente criar uma hierarquia que
 * > ⛔ ninguém autorizou."*
 *
 * ⛔ ⛔ NÃO se prefere: estudo local, estudo externo, último registrado, estudo com
 * horário conhecido, ⛔ nem o "aparentemente mais recente" quando a ordem ⛔ não é
 * estabelecível.
 *
 * ⚠️ **A saída é adjudicação explícita.** Se o médico conclui que um laudo estava
 * errado, ele corrige aquele `estudo_resultado` **na mesma instância**, com
 * `corrigeFatoId`. A trilha guarda as duas declarações; a derivação passa a ler
 * a vigente. Se as vigentes deixam de divergir, a divergência sai sozinha — ⛔ sem
 * regra de precedência nenhuma.
 */
export function exclusaoDeHemorragia(estado: EstadoAvc): LeituraDaExclusao {
  const comResultado = tcsSemContraste(estado).filter((e) => e.resultado !== undefined);
  const nomes = comResultado.map((e) => e.id);
  const base = { insumos: INSUMOS_EXCLUSAO, fonte: FONTE_EXCLUSAO, estudos: nomes };
  const valores = new Set(comResultado.map((e) => e.resultado));

  if (valores.size > 1) {
    return {
      ...base,
      exclusao: "divergente",
      conclusao: "desconhecido",
      tom: "atencao",
      curto: "Exames de imagem com resultados divergentes",
      texto:
        "Um exame descreve hemorragia e outro não. A reperfusão não é liberada enquanto os dois valerem, e o aplicativo não escolhe entre eles por procedência, horário ou ordem de registro. Corrigir o resultado do exame que estiver errado resolve a divergência",
    };
  }
  if (valores.has(RESULTADO_TC.hemorragia)) {
    return {
      ...base,
      exclusao: "hemorragia_presente",
      conclusao: "nao",
      tom: "atencao",
      curto: "Hemorragia intracraniana na tomografia",
      texto: "A reperfusão não é iniciada sem exclusão de hemorragia. O atendimento continua, e o motivo fica registrado",
    };
  }
  if (valores.has(RESULTADO_TC.semHemorragia)) {
    return {
      ...base,
      exclusao: "excluida",
      conclusao: "sim",
      tom: "informativo",
      curto: "Hemorragia intracraniana excluída pela tomografia",
      texto: "A fonte recomenda excluir hemorragia intracraniana antes de iniciar intervenções de reperfusão, e essa exclusão está registrada",
    };
  }

  /**
   * ⚠️ ⛔ SEM RESULTADO — e a frase fala da **trilha**, ⛔ nunca do mundo (E-23).
   * ⛔ "⛔ Não registrada" ⛔ não é "⛔ não realizada", e ⛔ nenhuma das duas é "sem
   * hemorragia".
   */
  const situacao = situacaoDaTcSemContraste(estado);
  return {
    ...base,
    exclusao: "sem_informacao",
    conclusao: "desconhecido",
    tom: situacao === "nenhuma_registrada" ? "atencao" : "pendente",
    curto:
      situacao === "nenhuma_registrada"
        ? "Nenhuma tomografia sem contraste registrada"
        : "Tomografia registrada, resultado ainda não informado",
    texto: "A exclusão de hemorragia ainda não pode ser afirmada. Isto não é o mesmo que ausência de hemorragia",
  };
}

/**
 * ⚠️⚠️ A CLASSE DE REPERFUSÃO ESTÁ RETIDA? — **E-08**, e a **única** função do
 * módulo que responde a esta pergunta.
 *
 * ⚠️ FONTE ÚNICA (I6): ela ⛔ não repete a regra, ⛔ ela LÊ o estado nomeado. Escrita
 * duas vezes, bastaria uma delas aprender um caso novo para as duas divergirem
 * — e a que decide seria a errada.
 *
 * ⚠️ `true` para TUDO que ⛔ não seja exclusão declarada. ⛔ Isso ⛔ não transforma
 * ausência em hemorragia (E-23): a leitura acima continua distinguindo os
 * estados. O que esta função diz é apenas que a **liberação** exige o positivo.
 *
 * ⚠️⚠️ **E É POR ISTO QUE A DIVERGÊNCIA RETÉM NOS DOIS SENTIDOS.** Divergente
 * ⛔ não é exclusão declarada — logo, retém. ⛔ Não há ramo novo, ⛔ nenhuma exceção
 * escrita: externo-com-hemorragia × local-sem dá **o mesmo** que o inverso,
 * porque a função ⛔ nunca soube distinguir procedência, e ⛔ não é aqui que ela vai
 * aprender.
 */
export function reperfusaoRetidaPelaImagem(estado: EstadoAvc): boolean {
  return exclusaoDeHemorragia(estado).exclusao !== "excluida";
}

/**
 * O DESTINO RESOLVIDO — ⚠️ **um só**, e ⛔ nunca dois concorrentes.
 *
 * ── A DECISÃO DO AUTOR (2026-08-29) ────────────────────────────────────────
 *
 * *"A estrutura pode guardar ambos os fatos, mas a UI precisa resolver isso de
 * forma clara. ⛔ Não quero uma tela dizendo ao médico: 'vá para AVC hemorrágico'
 * e 'vá para HSA' ao mesmo tempo."*
 *
 * ⚠️⚠️ FATOS COEXISTEM; DESTINOS, ⛔ NÃO. `tc_resultado` e `suspeita_hsa` são dois
 * campos independentes de propósito (**PD-21**) — uma tomografia sem hemorragia
 * com suspeita clínica de HSA precisa ser representável. Mas destino é a espécie
 * que **muda de quem o paciente é** (§2.9), e dois deles ao mesmo tempo ⛔ não
 * dão instrução nenhuma: dão duas.
 *
 * ── ⚠️⚠️ A PRIORIDADE FOI INVERTIDA PELO AUTOR — revisão de 2026-08-29 ──────
 *
 * A primeira versão fazia a **suspeita** de HSA prevalecer sobre a hemorragia
 * **identificada** na tomografia. O autor reviu a própria sugestão:
 *
 * > *"Uma suspeita ⛔ não deveria simplesmente sobrepor um achado de imagem
 * > confirmado. […] Isso evita transformar `suspeita_hsa = Sim` numa espécie de
 * > **override** de um fato radiológico confirmado."*
 *
 * ⚠️⚠️ E a razão é de **espécie de dado**, ⛔ não de gravidade: hemorragia na
 * tomografia é **dado observado na imagem**; suspeita de HSA é **hipótese
 * clínica**. Deixar a hipótese governar o destino inverteria a hierarquia de
 * evidência dentro da própria máquina — e o médico veria a tela mandá-lo para um
 * fluxo escolhido pelo que ele **suspeita**, sobre o que ele **viu**.
 *
 * ⚠️ **A regra que ficou:**
 *   · hemorragia identificada ⇒ saída **hemorrágica**, sempre;
 *   · havendo também suspeita de HSA, ela vem **associada** à mesma saída — com
 *     frase visível e `id` preservado para o subfluxo futuro;
 *   · suspeita de HSA **sem** hemorragia identificada ⇒ saída específica de HSA.
 *
 * ⛔ ⛔ Nenhum dos dois fatos se perde em ⛔ nenhuma das combinações, e a trilha
 * guarda os dois inteiros (§3.1).
 *
 * ⚠️ Devolve `undefined` quando ⛔ não há destino armado. ⛔ Isso ⛔ não é afirmação
 * sobre o paciente: destino só existe quando alguma coisa o arma, e a leitura
 * que distingue os vazios é `exclusaoDeHemorragia`.
 */
export type DestinoResolvido = {
  readonly saida: "suspeita_hsa" | "hemorragia_intracraniana";
  readonly rotulo: string;
  readonly modulo: string;
  readonly moduloExiste: boolean;
  readonly oQueAcontece: string;
  /**
   * ⚠️ Os fatos que COEXISTEM com esta saída, e que ⛔ não viram segundo destino.
   *
   * ⚠️ `id` é para a máquina — é o que o subfluxo de HSA vai procurar quando
   * existir —, `frase` é para o médico. Uma lista só de frases obrigaria o
   * subfluxo a casar texto traduzível; uma lista só de ids deixaria a tela muda.
   */
  readonly associados: readonly { readonly id: string; readonly frase: string }[];
  readonly insumos: readonly string[];
  readonly fonte: string;
};

export function destinoDaImagem(estado: EstadoAvc): DestinoResolvido | undefined {
  const insumos = ["estudo_resultado", "suspeita_hsa"];
  const hsa = ternario(estado, "suspeita_hsa") === true;
  /**
   * ⚠️⚠️ **QUALQUER** estudo que descreva hemorragia manda para a saída
   * hemorrágica — inclusive na divergência. ⛔ Um achado de hemorragia ⛔ não
   * desacontece porque outro exame ⛔ não o viu, e escolher entre os dois seria a
   * hierarquia silenciosa que o autor proibiu.
   */
  const hemorragia = tcsSemContraste(estado).some(
    (e) => e.resultado === RESULTADO_TC.hemorragia
  );

  /**
   * ⚠️⚠️ A HEMORRAGIA IDENTIFICADA VEM PRIMEIRO, e a ordem destes dois `if` É a
   * decisão — ⛔ não um detalhe de escrita. Invertê-los devolve o override que o
   * autor removeu: a hipótese passando por cima do achado de imagem.
   */
  if (hemorragia) {
    return {
      saida: "hemorragia_intracraniana",
      ...DESTINOS_DA_IMAGEM.hemorragia,
      /**
       * ⚠️ A LINHA ASSOCIADA, e ⛔ não um segundo cartão: o médico lê UMA saída, e
       * vê a suspeita junto dela — sem ser mandado para dois lugares, e sem que
       * a suspeita desapareça.
       */
      associados: hsa ? [FATO_ASSOCIADO.suspeitaHsa] : [],
      insumos,
    };
  }
  if (hsa) {
    return {
      saida: "suspeita_hsa",
      ...DESTINOS_DA_IMAGEM.hsa,
      associados: [],
      insumos,
    };
  }
  return undefined;
}

/**
 * A SUSPEITA DE HSA — ⚠️ e o que fazer com **Incerto**.
 *
 * ⚠️⚠️ "INCERTO" ⛔ NÃO VIRA "NÃO" (**E-23**) e ⛔ não arma a saída. Ele produz uma
 * **pendência nomeada**, e ⛔ nada além disso: ⛔ não retém reperfusão, ⛔ não
 * fecha campo, ⛔ não muda ⛔ nenhuma outra leitura.
 */
export function suspeitaDeHsa(estado: EstadoAvc): Leitura {
  const insumos = ["suspeita_hsa"];
  const fonte = "spec §1.8";
  const valor = ternario(estado, "suspeita_hsa");
  const incerto = respondeuDesconhecido(estado, "suspeita_hsa");

  if (valor === true) {
    return {
      conclusao: "sim",
      tom: "atencao",
      curto: "Suspeita clínica de hemorragia subaracnóidea registrada",
      texto: "Este atendimento segue pelo fluxo específico da hemorragia subaracnóidea. O motivo fica registrado, e o atendimento continua",
      insumos,
      fonte,
    };
  }
  if (incerto) {
    return {
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "Suspeita clínica de hemorragia subaracnóidea em aberto",
      texto: "Incerto fica registrado como resposta, não vira ausência de suspeita, e não retém nada do atendimento",
      insumos,
      fonte,
    };
  }
  if (valor === false) {
    return {
      conclusao: "nao",
      tom: "informativo",
      curto: "Sem suspeita de hemorragia subaracnóidea",
      texto: "Resposta registrada. A saída específica para hemorragia subaracnóidea não está armada",
      insumos,
      fonte,
    };
  }
  return {
    conclusao: "desconhecido",
    tom: "pendente",
    curto: "Suspeita clínica de hemorragia subaracnóidea ainda não avaliada",
    texto: "Ainda não perguntado é diferente de sem suspeita, e nada no atendimento espera por esta resposta",
    insumos,
    fonte,
  };
}

/**
 * A HIPODENSIDADE CLARA — ⚠️ **fato com critério**, e ⛔ nunca elegibilidade.
 *
 * ⚠️⚠️ ESTA LEITURA É A QUE MAIS FACILMENTE VIRARIA VEREDITO, e por três razões
 * que se somam: o achado está na faixa que a fonte chama de **absoluta**, a
 * expressão dela é *"should not be administered"*, e o médico já chegou aqui
 * decidindo sobre reperfusão.
 *
 * ⛔⛔ E MESMO ASSIM ELA ⛔ NÃO CONCLUI, porque **E-48**: a Table 8 ⛔ não tem
 * COR/LOE em célula nenhuma, e a própria legenda declara esta faixa
 * *"unsupported by clinical evidence"*. Item de Table 8 é **situação a
 * considerar**, ⛔ não regra — e o que se faz com a trombólise é conteúdo da
 * Superfície F, que ainda ⛔ não existe.
 *
 * ⚠️ Por isso a leitura **nomeia o achado e a fonte**, e ⛔ para aí. ⛔ Ela ⛔ não
 * diz "⛔ não trombolisar", ⛔ não diz "contraindicado", e ⛔ não entra em
 * `exclusaoDeHemorragia` — a prova varre as duas coisas.
 *
 * ⛔ E ⛔ NÃO É ASPECTS. São duas leituras diferentes da mesma tomografia, e
 * ⛔ nenhuma delas calcula a outra.
 */
export function hipodensidadeClara(estado: EstadoAvc): Leitura {
  const insumos = ["hipodensidade_clara"];
  const fonte = "F-07";
  const valor = ternario(estado, "hipodensidade_clara");
  const incerto = respondeuDesconhecido(estado, "hipodensidade_clara");

  if (valor === true) {
    return {
      conclusao: "sim",
      tom: "atencao",
      curto: "Hipodensidade clara registrada na tomografia",
      texto: "A fonte lista este achado entre as contraindicações que ela mesma chama de absolutas, e declara essa faixa como não sustentada por evidência clínica. A decisão sobre a reperfusão não é tomada nesta superfície",
      insumos,
      fonte,
    };
  }
  if (valor === false) {
    return {
      conclusao: "nao",
      tom: "informativo",
      curto: "Sem hipodensidade clara na tomografia",
      texto: "Resposta registrada, comparando com a densidade da substância branca contralateral não acometida",
      insumos,
      fonte,
    };
  }
  if (incerto) {
    return {
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "Hipodensidade clara em aberto",
      texto: "Incerto fica registrado como resposta, e não vira ausência do achado",
      insumos,
      fonte,
    };
  }
  return {
    conclusao: "desconhecido",
    tom: "informativo",
    curto: "Hipodensidade clara ainda não avaliada",
    texto: "Ainda não perguntado é diferente de ausente, e nada no atendimento espera por esta resposta",
    insumos,
    fonte,
  };
}

/** ⚠️ O estado nomeado da imagem vascular — três, e ⛔ nunca um booleano. */
export type LeituraVascular = Leitura & {
  readonly vascular: "registrada" | "pendente" | "indisponivel" | "sem_informacao";
};

/**
 * A IMAGEM VASCULAR — **R2.4**, F-16 rec. 8 (**COR 1 · LOE A**).
 *
 * ⚠️⚠️ ELA ⛔ NÃO ESPERA CREATININA, e a maneira de garantir isso ⛔ não é escrever
 * a frase: é ⛔ **não existir campo de laboratório nesta superfície**. A prova
 * varre os campos de C atrás de qualquer termo renal e reprova se achar um.
 *
 * ⚠️ **INDISPONÍVEL NO SERVIÇO FECHA A PENDÊNCIA**, e isso é **E-26**: pendência
 * que ⛔ não tem como ser resolvida é muro, ⛔ não tarefa. Onde ⛔ não há o exame,
 * cobrar o exame ⛔ não é vigilância — é ruído permanente na tela de quem ⛔ não
 * pode fazer nada a respeito.
 */
export function imagemVascular(estado: EstadoAvc): LeituraVascular {
  const insumos = ["suspeita_lvo", "angio_disponibilidade", "estudo_modalidade"];
  const fonte = "F-16";
  /**
   * ⚠️⚠️ A REALIZAÇÃO É **DERIVADA**, e ⛔ não perguntada — `angio_realizada`
   * dissolveu-se em 2026-08-30. Ou existe instância de estudo vascular, ou ⛔ não
   * existe; repreguntar seria cobrar o que a trilha já sabe.
   *
   * ⛔⛔ **E ausência de estudo ⛔ NUNCA significa indisponibilidade** (E-23). O que
   * ⛔ nenhuma instância consegue dizer — *"⛔ não disponível neste serviço"* —
   * continua sendo fato perguntado, e é ⛔ só isso que sobrou do campo antigo.
   */
  const temEstudoVascular = estudos(estado).some(
    (e) => e.modalidade !== undefined && MODALIDADES_VASCULARES.includes(e.modalidade)
  );
  const disponibilidade = rotuloGravado(estado, "angio_disponibilidade");
  const suspeita = ternario(estado, "suspeita_lvo");

  if (temEstudoVascular) {
    return {
      vascular: "registrada",
      conclusao: "sim",
      tom: "informativo",
      curto: "Estudo vascular registrado",
      texto: "A fonte diz que a imagem vascular de emergência não deve ser atrasada para obter a creatinina sérica",
      insumos,
      fonte,
    };
  }
  if (disponibilidade === "Não disponível neste serviço") {
    return {
      vascular: "indisponivel",
      conclusao: "nao",
      tom: "informativo",
      curto: "Angiotomografia não disponível neste serviço",
      texto: "Registro do que o serviço tem. Nada no atendimento espera por um exame que não está disponível aqui",
      insumos,
      fonte,
    };
  }
  if (suspeita === true) {
    return {
      vascular: "pendente",
      conclusao: "desconhecido",
      tom: "pendente",
      curto: "Imagem vascular ainda não registrada, com suspeita de oclusão de grande vaso",
      texto: "A fonte recomenda imagem vascular de emergência o mais rápido possível na suspeita de oclusão de grande vaso, até 24 horas da última vez visto bem. Isto não retém a trombólise",
      insumos,
      fonte,
    };
  }
  return {
    vascular: "sem_informacao",
    conclusao: "desconhecido",
    tom: "informativo",
    curto: "Nenhum estudo vascular registrado",
    texto: "Nada no atendimento espera por este registro. Não haver estudo registrado não é o mesmo que o exame não estar disponível",
    insumos,
    fonte,
  };
}

/**
 * ⚠️ O DOSSIÊ DA FRENTE ENDOVASCULAR — **PD-24**: descreve **quais dados
 * existem**, e ⛔ nunca conclui elegibilidade.
 */
export type LeituraDoDossie = Leitura & {
  /** Campos com resposta que carrega a informação. */
  readonly registrados: readonly string[];
  /** ⚠️ Respondidos COM a saída sem conclusão — ⛔ não é o mesmo que ⛔ não perguntado (E-37). */
  readonly semConclusao: readonly string[];
  /** ⚠️ Ainda ⛔ não perguntados. ⛔ Isto ⛔ NÃO é lista de requisitos. */
  readonly naoPerguntados: readonly string[];
  /** ⚠️ Achado → estudo que o produziu. Ver o comentário no laço. */
  readonly origens: Readonly<Record<string, string>>;
};

/**
 * ⚠️⚠️ A ADVERTÊNCIA DE MODELAGEM DE F-08, AO PÉ DA LETRA:
 *
 * > ⛔ *"`EVT elegível = sim/não` ⛔ NÃO é fato armazenado. Os fatos são: idade ·
 * > NIHSS · mRS prévio · sítio da oclusão · ASPECTS · tempo desde o marco ·
 * > achados de imagem · efeito de massa. Elegibilidade é derivada."*
 *
 * ⚠️⚠️ ESTA LEITURA FALA DO **DOSSIÊ**, ⛔ NUNCA DO PACIENTE. `conclusao` é
 * `desconhecido` **sempre**, por construção — do mesmo jeito que
 * `achadosDosQuadros()` da Superfície B devolve `veredito: false` sempre. Ela
 * ⛔ não diz "elegível", ⛔ não diz "não elegível", ⛔ não diz "insuficiente para
 * tratar".
 *
 * ⚠️ `naoPerguntados` é o que a frente endovascular **vai perguntar**, ⛔ e não o
 * que falta para poder tratar. Ausência aqui ⛔ **nunca** vira não-elegibilidade,
 * e ⛔ nenhum item desta lista gera pendência — cinco pendências nasceriam de uma
 * tela só, e uma parede de tarefas é o oposto de uma tarefa acionável.
 */
export function informacaoParaAFrenteEndovascular(estado: EstadoAvc): LeituraDoDossie {
  const registrados: string[] = [];
  const semConclusao: string[] = [];
  const naoPerguntados: string[] = [];

  /**
   * ⚠️⚠️ CADA ITEM DIZ **DE QUAL ESTUDO** VEIO — 2026-08-30.
   *
   * ⚠️ Antes a lista dizia *"ASPECTS registrado"* sem dizer em qual exame. Com
   * dois estudos na tela, isso é informação incompleta na frente que decide
   * trombectomia.
   */
  const origens: Record<string, string> = {};
  const listaDeEstudos = estudos(estado);

  for (const id of IDS_DOSSIE_ENDOVASCULAR) {
    const naquele = listaDeEstudos.find(
      (e) => valorNaInstancia(estado, e.id, id)?.valor !== undefined
        && valorNaInstancia(estado, e.id, id)?.valor !== "nao_perguntado"
    );
    if (naquele === undefined) {
      naoPerguntados.push(id);
      continue;
    }
    origens[id] = naquele.id;
    const fato = valorNaInstancia(estado, naquele.id, id);
    if (fato === undefined || fato.valor === "nao_perguntado") {
      naoPerguntados.push(id);
      continue;
    }
    /**
     * ⚠️⚠️ O RAMO É ESCOLHIDO PELO **TIPO DO CAMPO**, e ⛔ não por um `else`
     * otimista no fim — correção achada por mutação, 2026-08-29.
     *
     * A primeira versão terminava em `else registrados.push(id)`: qualquer valor
     * que ⛔ não casasse com a saída declarada caía em "tenho o dado". ⚠️ Um
     * catch-all que sempre cai para o lado otimista ⛔ não é conservador — ele
     * transforma valor inesperado em informação registrada, e a lista passa a
     * dizer que existe um dado que ninguém conferiu.
     *
     * ⚠️ E o ASPECTS é grandeza: ⛔ não tem "saída sem conclusão" — ou o número foi
     * informado, ou ⛔ não foi. **E-10**: zero é resposta, e é a mais grave.
     */
    if (campoDeC(id).tipo === "grandeza") {
      if (typeof fato.valor === "number") registrados.push(id);
      else semConclusao.push(id);
      continue;
    }
    const saida = SAIDA_SEM_CONCLUSAO[id];
    const rotulo = String(fato.valor);
    if (rotulo === "nao_sei" || (saida !== undefined && rotulo === saida)) {
      semConclusao.push(id);
    } else {
      registrados.push(id);
    }
  }

  return {
    registrados,
    semConclusao,
    naoPerguntados,
    origens,
    /** ⚠️⚠️ SEMPRE `desconhecido`. ⛔ Esta leitura ⛔ não conclui, por construção. */
    conclusao: "desconhecido",
    tom: "informativo",
    curto:
      registrados.length === 0
        ? "Nenhum dado de imagem registrado para a avaliação endovascular"
        : `Dados de imagem registrados para a avaliação endovascular: ${registrados.length} de ${IDS_DOSSIE_ENDOVASCULAR.length}`,
    texto: "Esta lista diz quais dados já foram registrados. O que ainda não foi registrado não impede o atendimento",
    insumos: IDS_DOSSIE_ENDOVASCULAR,
    fonte: "F-08",
  };
}

/**
 * A ALERGIA A CONTRASTE — ⚠️ **fato registrado**, e ⛔ nada mais.
 *
 * ── A DECISÃO DO AUTOR (2026-08-29), contra a minha proposta ───────────────
 *
 * *"Não esperar por creatinina é uma coisa; eliminar uma informação relevante à
 * ação contrastada é outra."*
 *
 * ⚠️⚠️ AS TRÊS TRAVAS, e ⛔ nenhuma delas é frase — todas são medidas:
 *   · ⛔ **nunca bloqueia a IVT**: `exclusaoDeHemorragia` ⛔ não a lê, e a prova
 *     confere que a leitura é idêntica com e sem alergia registrada;
 *   · ⛔ **nunca cria dependência de creatinina**: ⛔ não existe campo renal em C;
 *   · ⛔ **⛔ não bloqueia C**: ⛔ não gera pendência, e ⛔ nenhuma outra leitura muda.
 *
 * ⛔⛔ E ⛔ NENHUMA CONDUTA: a fonte do AVC ⛔ não diz o que fazer diante de alergia
 * a contraste. Escrever pré-medicação, alternativa de exame ou qualquer manejo
 * aqui seria conteúdo clínico sem fonte — **E-31**.
 */
export function alergiaAContraste(estado: EstadoAvc): Leitura {
  const insumos = ["alergia_contraste"];
  const fonte = "F-16";
  const valor = ternario(estado, "alergia_contraste");
  const naoSei = respondeuDesconhecido(estado, "alergia_contraste");

  if (valor === true) {
    return {
      conclusao: "sim",
      tom: "atencao",
      curto: "Alergia importante a contraste iodado registrada",
      texto: "Diz respeito apenas ao exame com contraste, e não interfere na trombólise. A fonte do AVC não define conduta para este caso",
      insumos,
      fonte,
    };
  }
  if (valor === false) {
    return {
      conclusao: "nao",
      tom: "informativo",
      curto: "Sem alergia importante a contraste iodado relatada",
      texto: "Resposta registrada. Diz respeito apenas ao exame com contraste",
      insumos,
      fonte,
    };
  }
  if (naoSei) {
    return {
      conclusao: "desconhecido",
      tom: "informativo",
      curto: "Alergia a contraste iodado desconhecida",
      texto: "Desconhecido fica registrado como resposta. Diz respeito apenas ao exame com contraste, e não interfere na trombólise",
      insumos,
      fonte,
    };
  }
  return {
    conclusao: "desconhecido",
    /** ⚠️ `informativo`, e ⛔ nunca `pendente`: ⛔ não falta nada, e ⛔ nada espera por isto. */
    tom: "informativo",
    /**
     * ⚠️ O `curto` é a ÚNICA frase que vai ao painel — ele precisa se bastar. Sem
     * a segunda metade, "ainda ⛔ não registrada" lê-se como tarefa pendente num
     * campo que ⛔ não é tarefa nenhuma. É o mesmo ajuste que a consulta a
     * paciente e família recebeu na Superfície B.
     */
    curto: "Alergia a contraste iodado ainda não registrada, e nada espera por ela",
    texto: "Diz respeito apenas ao exame com contraste, e não interfere na trombólise",
    insumos,
    fonte,
  };
}

/**
 * AS PENDÊNCIAS DA IMAGEM — ⚠️ **específicas, de alcance global e ⛔ não
 * bloqueantes** (correção de redação pedida pelo autor, 2026-08-29).
 *
 * ⚠️⚠️ AS TRÊS PALAVRAS SÃO INDEPENDENTES, e trocar uma pela outra é o erro
 * documental que ele apontou:
 *   · **específica** — tem dono e diz o que a resolve (E-26);
 *   · **de alcance global** — aparece de qualquer superfície (E-07);
 *   · ⛔ **não bloqueante** — ⛔ nenhuma delas retém terapia tempo-dependente (E-49).
 *
 * ⚠️⚠️ E A DISTINÇÃO QUE SUSTENTA A SUPERFÍCIE INTEIRA: **a pendência ⛔ NÃO é o
 * bloqueio**. A pendência é tarefa; o bloqueio de classe é `exclusaoDeHemorragia`
 * — estado derivado, com autoridade em F-16 rec. 1. Eles coincidem no tempo e
 * ⛔ **não** na natureza, e é por isso que ⛔ nenhum campo de C ganha
 * `bloqueiaTerapia: true`.
 */
export function pendenciasDaImagem(estado: EstadoAvc): readonly Pendencia[] {
  const abertas: Pendencia[] = [];
  const situacao = situacaoDaTcSemContraste(estado);

  /**
   * ⚠️⚠️ **PD-22** — a pendência fecha com resultado CONCLUSIVO, e ⛔ não com
   * "alguém registrou o exame". Um estudo aberto sem resultado ⛔ **não** fecha:
   * seria a tela dizendo "resolvido" sobre a coisa mais importante do
   * atendimento, que ⛔ não está resolvida.
   */
  if (situacao !== "realizada_resultado_registrado") {
    abertas.push({
      id: "tc_resultado",
      rotulo: "Tomografia de crânio",
      dono: "imagem",
      campo: "estudo_resultado",
      resolvePor:
        situacao === "realizada_resultado_pendente"
          ? "Registrar o resultado quando o laudo estiver disponível"
          : "Registrar a tomografia de crânio sem contraste e o seu resultado",
    });
  }

  /**
   * ⚠️⚠️ A PENDÊNCIA DE HORÁRIO NASCE **TARDE** — mesma disciplina do
   * Laboratório. Um estudo externo sem horário, sozinho, ⛔ não gera pendência
   * alguma: ⛔ nada precisa da ordem. Ela só aparece quando **dois** estudos
   * trazem resultado e a ordem entre eles ⛔ não é estabelecível.
   */
  const comResultado = tcsSemContraste(estado).filter((e) => e.resultado !== undefined);
  if (comResultado.length > 1 && ordemEntreEstudos(comResultado) === "nao_estabelecivel") {
    comResultado
      .filter((e) => !e.horaConhecida && !e.horaDesconhecida)
      .forEach((e) =>
        abertas.push({
          id: `estudo_hora_${e.id}`,
          rotulo: `Horário do exame — ${e.procedencia ?? "procedência não informada"}`,
          dono: "imagem",
          campo: "estudo_hora",
          resolvePor: "Registrar o horário, ou que não foi possível determinar",
        })
      );
  }

  if (respondeuDesconhecido(estado, "suspeita_hsa")) {
    abertas.push({
      id: "suspeita_hsa",
      rotulo: "Suspeita clínica de hemorragia subaracnóidea",
      dono: "imagem",
      campo: "suspeita_hsa",
      resolvePor: "Registrar a conclusão sobre a suspeita",
    });
  }

  if (imagemVascular(estado).vascular === "pendente") {
    abertas.push({
      id: "imagem_vascular",
      rotulo: "Imagem vascular",
      dono: "imagem",
      campo: "angio_disponibilidade",
      resolvePor: "Registrar o estudo vascular, ou que ele não está disponível neste serviço",
    });
  }

  return abertas;
}

/**
 * QUAIS EXAMES FORAM REALIZADOS — ⚠️ **as instâncias respondem**, e ⛔ não um
 * campo agregado.
 *
 * ── ⛔ O CAMPO `imagem_avancada` FOI REMOVIDO INTEIRO (autor, 2026-08-30) ─────
 *
 * ⚠️⚠️ **Inclusive a opção "Nenhuma".** Ela era uma **negativa agregada sem
 * leitor**: a regra de janela estendida que a consumiria mora na Reperfusão, que
 * ⛔ não existe.
 *
 * > *"Guardar uma negativa agregada sem leitor é voltar ao mesmo problema que
 * > iniciou toda essa remodelagem."*
 *
 * ⏳ Quando F precisar saber se houve CTP ou RM difusão/FLAIR, consulta as
 * instâncias. Se a **ausência** de um exame passar a ter significado clínico
 * próprio, F pede a informação — ⛔ sem ressuscitar campo agregado artificial.
 */
export function modalidadesRealizadas(estado: EstadoAvc): readonly string[] {
  return estudos(estado)
    .map((e) => e.modalidade)
    .filter((m): m is string => m !== undefined);
}

/** Todas as leituras da Superfície C, em ordem de apresentação. */
export function leiturasDaSuperficieC(estado: EstadoAvc): readonly (Leitura & { id: string })[] {
  return [
    { id: "exclusao_hemorragia", ...exclusaoDeHemorragia(estado) },
    { id: "suspeita_hsa", ...suspeitaDeHsa(estado) },
    { id: "hipodensidade_clara", ...hipodensidadeClara(estado) },
    { id: "imagem_vascular", ...imagemVascular(estado) },
    { id: "frente_endovascular", ...informacaoParaAFrenteEndovascular(estado) },
    { id: "alergia_contraste", ...alergiaAContraste(estado) },
  ];
}
