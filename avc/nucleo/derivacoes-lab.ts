/**
 * DERIVAÇÕES DO PAINEL **LABORATÓRIO**. Recalculadas a cada leitura, ⛔ nunca
 * gravadas (§4.3).
 *
 * ── ⚠️⚠️ A REGRA QUE GOVERNA ESTE ARQUIVO INTEIRO ─────────────────────────
 *
 * > **O "valor atual" de um analito ⛔ só pode ser escolhido por regra temporal
 * > explícita. ⛔ Nunca por "último digitado".**
 * > E se ⛔ não houver ordem clínica confiável entre coletas, ⛔ **nenhuma** delas é
 * > chamada de "mais recente". — autor, 2026-08-30
 *
 * ⚠️ Na pressão arterial a ordem era conhecida por construção. Aqui ⛔ não: uma
 * coleta externa **sem horário** pode ser digitada **depois** da coleta local das
 * 22h. A ordem de **registro** é sempre conhecida; a ordem **clínica**, ⛔ nem
 * sempre — e confundi-las faria o app eleger a mais antiga.
 */

import type { EstadoAvc } from "./estado";
import type { Leitura } from "./leitura";
import type { Pendencia } from "./tipos";
import { instanciasDe, valorNaInstancia } from "./instancia";
import {
  ANALITOS_L,
  COLETA,
  FATOR_PARA_MM3,
  IDS_ANALITOS,
} from "../conteudo/laboratorio";

/** ⚠️ Uma coleta, como as leituras a enxergam. */
export type Coleta = {
  readonly id: string;
  readonly procedencia?: string;
  /** ⚠️ `undefined` cobre ⛔ não perguntado **e** desconhecido — `horaConhecida` separa. */
  readonly hora?: number;
  readonly horaConhecida: boolean;
  /** ⚠️ O horário foi PERGUNTADO e respondido como desconhecido (E-37). */
  readonly horaDesconhecida: boolean;
};

const numeroDe = (estado: EstadoAvc, coleta: string, campo: string): number | undefined => {
  const f = valorNaInstancia(estado, coleta, campo);
  return typeof f?.valor === "number" ? f.valor : undefined;
};

const rotuloDe = (estado: EstadoAvc, coleta: string, campo: string): string | undefined => {
  const f = valorNaInstancia(estado, coleta, campo);
  if (f === undefined) return undefined;
  const v = String(f.valor);
  return v === "nao_perguntado" || v === "nao_sei" ? undefined : v;
};

/** Todas as coletas abertas, na ordem de REGISTRO — que é sempre conhecida (§3.2). */
export function coletas(estado: EstadoAvc): readonly Coleta[] {
  return instanciasDe(estado, COLETA).map((id) => {
    const f = valorNaInstancia(estado, id, "coleta_hora");
    const hora = typeof f?.valor === "number" ? f.valor : undefined;
    return {
      id,
      procedencia: rotuloDe(estado, id, "coleta_procedencia"),
      hora,
      horaConhecida: hora !== undefined,
      horaDesconhecida: String(f?.valor ?? "") === "nao_sei",
    };
  });
}

/** ⚠️ As coletas que trazem este analito — e ⛔ só elas entram em qualquer ordem. */
export function coletasComAnalito(estado: EstadoAvc, analito: string): readonly Coleta[] {
  return coletas(estado).filter((c) => numeroDe(estado, c.id, analito) !== undefined);
}

export type OrdemEntreColetas = "nenhuma" | "unica" | "estabelecida" | "nao_estabelecivel";

/**
 * A ORDEM CLÍNICA ENTRE AS COLETAS QUE TRAZEM UM ANALITO.
 *
 * ⚠️⚠️ ⛔ NÃO OLHA PARA `horaRegistro`. Ordem de digitação ⛔ não é ordem clínica, e
 * usá-la seria exatamente o *"último digitado"* que o autor proibiu.
 */
export function ordemEntreColetas(estado: EstadoAvc, analito: string): OrdemEntreColetas {
  const comAnalito = coletasComAnalito(estado, analito);
  if (comAnalito.length === 0) return "nenhuma";
  if (comAnalito.length === 1) return "unica";
  if (!comAnalito.every((c) => c.horaConhecida)) return "nao_estabelecivel";
  const horas = comAnalito.map((c) => c.hora as number);
  /** ⚠️ Empate também ⛔ não estabelece ordem: duas coletas no mesmo instante. */
  return new Set(horas).size === horas.length ? "estabelecida" : "nao_estabelecivel";
}

/**
 * ⚠️ O NOME ⛔ NÃO PRESUME QUE EXISTA UM VIGENTE — renomeado por decisão do autor:
 * *"o próprio contrato admite um estado `sem_ordem`, no qual ⛔ não existe
 * resultado vigente conhecido"*.
 */
export type EstadoTemporal =
  | { readonly estado: "nao_informado" }
  | { readonly estado: "unico"; readonly coleta: Coleta; readonly valor: number }
  | {
      readonly estado: "vigente";
      readonly coleta: Coleta;
      readonly valor: number;
      readonly outras: readonly { readonly coleta: Coleta; readonly valor: number }[];
    }
  | {
      readonly estado: "sem_ordem";
      readonly candidatas: readonly { readonly coleta: Coleta; readonly valor: number }[];
    };

export function estadoTemporalDoAnalito(estado: EstadoAvc, analito: string): EstadoTemporal {
  const comAnalito = coletasComAnalito(estado, analito);
  const par = (c: Coleta) => ({ coleta: c, valor: numeroDe(estado, c.id, analito) as number });

  switch (ordemEntreColetas(estado, analito)) {
    case "nenhuma":
      return { estado: "nao_informado" };
    case "unica":
      return { estado: "unico", coleta: comAnalito[0], valor: par(comAnalito[0]).valor };
    case "nao_estabelecivel":
      /**
       * ⚠️⚠️ **⛔ O APP ⛔ NÃO ELEGE.** ⛔ Não elege a local por ser local, ⛔ não elege a
       * que tem horário por ter horário, ⛔ não elege a "pior" por segurança, e
       * ⛔ não fabrica horário para poder ordenar. Mostra as duas, e a escolha é
       * do médico — **situação individualizada** (§2.8).
       */
      return { estado: "sem_ordem", candidatas: comAnalito.map(par) };
    case "estabelecida": {
      const ordenadas = [...comAnalito].sort((a, b) => (b.hora as number) - (a.hora as number));
      return {
        estado: "vigente",
        coleta: ordenadas[0],
        valor: par(ordenadas[0]).valor,
        outras: ordenadas.slice(1).map(par),
      };
    }
  }
}

/** ⚠️ Por que este valor de plaquetas ⛔ não pode ser comparado com o corte. */
export type Comparabilidade =
  | { readonly comparavel: true; readonly emMm3: number }
  | { readonly comparavel: false; readonly razao: "unidade_nao_declarada" | "sem_valor" };

/**
 * PLAQUETAS EM UNIDADE CANÔNICA — ⚠️ derivado, e ⛔ **nunca gravado**.
 *
 * ⚠️⚠️ A TRILHA GUARDA `80 mil/mm³`, exatamente como foi digitado. `80.000/mm³`
 * existe ⛔ só aqui: gravá-lo faria a trilha afirmar um número que ninguém
 * escreveu (§4.3).
 *
 * ⚠️ **A unidade vem da MESMA INSTÂNCIA do valor**, e ⛔ nunca globalmente — sem
 * isso, a unidade de uma coleta se colaria ao valor de outra, que é o defeito
 * que o autor apontou ao pedir que a unidade fosse atributo da medida.
 *
 * ⛔ **⛔ SEM UNIDADE DECLARADA, ⛔ NÃO CONVERTE.** Converter é transformar; supor
 * unidade é inventar.
 */
export function plaquetasComparaveis(estado: EstadoAvc, coleta: string): Comparabilidade {
  const valor = numeroDe(estado, coleta, "plaquetas");
  if (valor === undefined) return { comparavel: false, razao: "sem_valor" };
  const unidade = rotuloDe(estado, coleta, "plaquetas_unidade");
  const fator = unidade === undefined ? undefined : FATOR_PARA_MM3[unidade];
  if (fator === undefined) return { comparavel: false, razao: "unidade_nao_declarada" };
  return { comparavel: true, emMm3: valor * fator };
}

/**
 * A PENDÊNCIA DO HORÁRIO — ⚠️ ela nasce **tarde**, e ⛔ não cedo.
 *
 * ── A CORREÇÃO DO AUTOR (2026-08-30) ──────────────────────────────────────
 *
 * > *"⛔ Não criar pendência simplesmente porque uma coleta externa ⛔ não tem
 * > horário. Isso reintroduziria o problema de pedir informação que naquele
 * > momento ninguém precisa usar."*
 *
 * ⚠️ É o princípio que já apareceu quatro vezes neste módulo: **⛔ não perguntar o
 * que ainda ⛔ não tem leitor.** Uma coleta externa sozinha, sem horário, ⛔ não
 * gera pendência alguma — ⛔ nada precisa da ordem.
 *
 * **As três condições, e ⛔ nenhuma sozinha basta:**
 *   1. há **duas ou mais** coletas com o **mesmo analito**;
 *   2. a ordem é **necessária** — o estado é `sem_ordem`;
 *   3. o horário daquela coleta está **⛔ ainda ⛔ não perguntado**.
 *
 * ⚠️ Respondido *"Sem essa informação"*, ela **fecha** e o estado permanece
 * `sem_ordem` — que é a verdade (**E-52**, **E-26**).
 */
export function pendenciasDoLaboratorio(estado: EstadoAvc): readonly Pendencia[] {
  const precisamDeOrdem = IDS_ANALITOS.filter(
    (a) => estadoTemporalDoAnalito(estado, a).estado === "sem_ordem"
  );
  if (precisamDeOrdem.length === 0) return [];

  const semHoraPerguntada = coletas(estado).filter((c) => !c.horaConhecida && !c.horaDesconhecida);
  return semHoraPerguntada.map((c) => ({
    id: `coleta_hora_${c.id}`,
    rotulo: c.procedencia ? `Horário da coleta — ${c.procedencia}` : "Horário da coleta",
    dono: "laboratorio" as const,
    campo: "coleta_hora",
    resolvePor: "Registrar o horário, ou que não foi possível determinar",
  }));
}

/**
 * A LEITURA DE UM ANALITO — ⚠️ ela **descreve**, e ⛔ não conclui sobre conduta.
 *
 * ⛔ Os cortes de F-10 ⛔ não moram aqui: eles são interpretação de segurança, e
 * vivem na Superfície D. Este painel diz **o que foi colhido, quando e por
 * quem** — e, quando ⛔ não dá para ordenar, diz isso também.
 */
export function leituraDoAnalito(estado: EstadoAvc, analito: string): Leitura {
  const t = estadoTemporalDoAnalito(estado, analito);
  const insumos = [analito, "coleta_hora"];
  const fonte = "F-10";
  /**
   * ⚠️⚠️ A LEITURA DIZ DE QUEM ELA FALA.
   *
   * ⚠️ `Resultado registrado` cabe em INR, plaquetas, aPTT e TP. Sem o sujeito,
   * a tela mostrava quatro linhas idênticas — e o médico ⛔ não saberia qual
   * analito está sem ordem entre as coletas.
   */
  const sujeito = ANALITOS_L.find((c) => c.id === analito)?.rotulo ?? analito;

  if (t.estado === "nao_informado") {
    return {
      conclusao: "desconhecido",
      tom: "informativo",
      sujeito,
      curto: "Resultado ainda não informado",
      texto: "Nenhuma coleta registrada com este resultado",
      insumos,
      fonte,
    };
  }
  if (t.estado === "sem_ordem") {
    return {
      conclusao: "desconhecido",
      tom: "atencao",
      sujeito,
      curto: "Dois resultados sem ordem estabelecida entre as coletas",
      texto: "Os dois ficam registrados, e nenhum é tratado como o mais recente. Informar o horário que falta estabelece a ordem, sem apagar nada",
      insumos,
      fonte,
    };
  }
  return {
    conclusao: "sim",
    tom: "informativo",
    sujeito,
    curto: "Resultado registrado",
    texto: "O resultado fica na trilha com a procedência e o horário da coleta",
    insumos,
    fonte,
  };
}

/**
 * As leituras que a **tela** mostra — uma por analito **que alguém informou**.
 *
 * ── POR QUE O ⛔ NÃO-INFORMADO FICA DE FORA ────────────────────────────────
 *
 * ⚠️⚠️ `leituraDoAnalito` continua descrevendo os quatro estados, e ⛔ nada foi
 * apagado do núcleo. O que ⛔ não vai à tela é a linha "Resultado ainda ⛔ não
 * informado": num painel recém-aberto ela enchia os Alertas com **três frases
 * sobre exames que ninguém pediu**, e ⚠️ ruído dessa natureza **esconde** a única
 * linha que importa — a de ordem ⛔ não estabelecida.
 *
 * ⚠️ Omitir ⛔ **não** é afirmar ausência (**E-23**): o próprio campo já mostra
 * "⛔ não informado", e a pendência aparece quando a ordem passa a ser necessária.
 */
export function leiturasDoLaboratorio(estado: EstadoAvc): readonly (Leitura & { id: string })[] {
  return IDS_ANALITOS.map((a) => ({ id: a, ...leituraDoAnalito(estado, a) })).filter(
    (l) => estadoTemporalDoAnalito(estado, l.id).estado !== "nao_informado"
  );
}
