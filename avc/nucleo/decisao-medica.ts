/**
 * DECISÃO MÉDICA REGISTRADA — ARQ-APOIO-01, F1 (autor, 2026-09-15; AP-1, AP-2, AP-3, AP-7, AP-10).
 *
 * ⚠️⚠️ O sistema DERIVA o estado ("critérios registrados incompatíveis com trombólise IV segundo a fonte"); o médico
 * DECIDE ("não prosseguir" · "prosseguir após avaliação médica"). ⛔ Um nunca é gravado como o outro: esta trilha guarda
 * só decisões feitas por gesto humano (`origem: "clinico"`), ⛔ e registrar uma decisão ⛔ muda o estado derivado.
 * ⚠️ A exceção já decidida é o julgamento do D-139-3 (DOAC, microssangramentos, itens individualizados): ali a própria
 * fonte faz do julgamento registrado o critério, e a derivação de D continua lendo o valor gravado.
 *
 * ⚠️ Mesma instância do julgamento (`julgamento_<alvo>`) ⛔ os mesmos valores gravados («Prosseguir» / «Não prosseguir»,
 * AP-7). Cada decisão leva, ANTES do valor, os fatos que a acompanham: justificativa (obrigatória para prosseguir num
 * alerta crítico, AP-2), médico responsável ⛔ registro profissional (autoria humana atestada, AP-3) ⛔ o retrato dos
 * critérios pendentes naquele instante. Mudar a decisão é registro novo; o anterior continua na trilha.
 */
import { registrarComInstancia } from "../conteudo/campos";
import {
  CAMPO_DO_JULGAMENTO,
  DECISAO_DO_JULGAMENTO,
  ID_DA_DECISAO,
  JULGAMENTO,
  ORIGEM_DA_IDENTIFICACAO,
  instanciaDoJulgamento,
  rotuloDoAlvoDoJulgamento,
} from "../conteudo/superficie-f";
import type { EstadoAvc } from "./estado";
import type { Relogio } from "./relogio";

/** ⚠️ Um critério pendente como estava na tela no instante da decisão — ⛔ recalculado depois. */
export type CriterioNoMomento = {
  readonly id: string;
  readonly rotulo: string;
  readonly categoria: string;
  readonly critico: boolean;
};

export type IdentificacaoDoMedico = "sessao_autenticada" | "atestacao";

export type DadosDaDecisaoMedica = {
  readonly decisao: "prosseguir" | "nao_prosseguir";
  readonly justificativa: string;
  readonly medico: string;
  readonly registroProfissional: string;
  /** ⚠️ Invariante 3: gravada no fato — sessão autenticada com nome ⛔ atestação. */
  readonly identificacao: IdentificacaoDoMedico;
  readonly criterios: readonly CriterioNoMomento[];
};

export type DecisaoMedicaRegistrada = {
  readonly fatoId: string;
  readonly alvo: string;
  readonly rotuloDoAlvo: string;
  readonly decisao: "prosseguir" | "nao_prosseguir";
  /** ⚠️ AP-3: só gesto humano entra aqui; ⛔ estado derivado pelo motor ⛔ vira decisão. */
  readonly origem: "clinico";
  readonly justificativa?: string;
  readonly medico?: string;
  readonly registroProfissional?: string;
  readonly identificacao?: IdentificacaoDoMedico;
  /** ⚠️ O retrato gravado no instante da decisão — ⛔ «criterios», que a tela ⛔ recalcula (I6). */
  readonly criteriosNoMomento: readonly CriterioNoMomento[];
  /** ⚠️ Lido do retrato: o alvo era alerta crítico no instante da decisão. ⛔ Sem retrato, ⛔ presumido. */
  readonly critico: boolean;
  /**
   * ⚠️⚠️ Invariante 3 (autor, 2026-09-15): a decisão gravada só é COMPLETA com todos os requisitos presentes no fato.
   * ⛔ Médico ausente ⛔ é médico identificado; ⛔ CRM ausente ⛔ é válido; ⛔ justificativa vazia ⛔ é justificativa.
   */
  readonly completa: boolean;
  readonly falta: readonly string[];
  /**
   * ⚠️⚠️ ARQ-APOIO-01 F2 · D-139-3 por COMPLETUDE (autor, 2026-09-15): «Prosseguir» incompleto ⛔ libera e requer
   * revalidação — um novo registro completo. ⛔ Pela idade: o dado ⛔ distingue com segurança um julgamento antigo de
   * uma decisão incompleta criada por chamada direta. «Não prosseguir» incompleto continua impedindo, marcado incompleto.
   */
  readonly requerRevalidacao: boolean;
  readonly horaRegistro: number;
  /** ⚠️ O último registro do alvo — ⛔ os anteriores continuam, ⛔ sobrescritos. */
  readonly vigente: boolean;
};

function texto(valor: unknown): string | undefined {
  return typeof valor === "string" && valor.trim() !== "" && valor !== "nao_perguntado" ? valor.trim() : undefined;
}

function criteriosGravados(valor: string | undefined): readonly CriterioNoMomento[] {
  if (valor === undefined) return [];
  try {
    const lista: unknown = JSON.parse(valor);
    if (!Array.isArray(lista)) return [];
    return lista
      .filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null && typeof c.id === "string" && typeof c.rotulo === "string")
      .map((c) => ({ id: c.id as string, rotulo: c.rotulo as string, categoria: String(c.categoria ?? ""), critico: c.critico === true }));
  } catch {
    return [];
  }
}

type Acompanhantes = { justificativa?: string; medico?: string; registroProfissional?: string; identificacao?: string; criterios?: string };

/**
 * ⚠️⚠️ OS REQUISITOS DA DECISÃO — uma regra só, usada pela tela antes de gravar ⛔ pela leitura do que já foi gravado
 * (invariante 3: núcleo ⛔ tela concordam). ⛔ Nada é inferido: o que ⛔ está no fato, falta.
 * · médico responsável, sempre;
 * · origem da identificação, sempre; com atestação, também o registro profissional (CRM/UF);
 * · o retrato dos critérios do instante (sem ele ⛔ se sabe se o alerta era crítico);
 * · justificativa quando a decisão é prosseguir num alerta crítico.
 */
export function requisitosFaltantes(d: {
  readonly decisao: "prosseguir" | "nao_prosseguir";
  readonly justificativa?: string;
  readonly medico?: string;
  readonly registroProfissional?: string;
  readonly identificacao?: IdentificacaoDoMedico;
  readonly critico: boolean;
  readonly comRetrato: boolean;
}): readonly string[] {
  const vazio = (v: string | undefined) => v === undefined || v.trim() === "";
  const falta: string[] = [];
  if (vazio(d.medico)) falta.push("Médico responsável");
  if (d.identificacao === undefined) falta.push("Origem da identificação do médico");
  if (d.identificacao === "atestacao" && vazio(d.registroProfissional)) falta.push("Registro profissional (CRM/UF)");
  if (!d.comRetrato) falta.push("Critérios pendentes no momento da decisão");
  if (d.critico && d.decisao === "prosseguir" && vazio(d.justificativa)) falta.push("Justificativa da decisão médica");
  return falta;
}

/** ⚠️ Todas as decisões médicas registradas, na ordem da trilha — cada uma com os fatos gravados junto dela. */
export function decisoesMedicasRegistradas(estado: EstadoAvc): readonly DecisaoMedicaRegistrada[] {
  const prefixo = `${JULGAMENTO}_`;
  const pendentes = new Map<string, Acompanhantes>();
  const lidas: Omit<DecisaoMedicaRegistrada, "vigente">[] = [];
  for (const f of estado.fatos) {
    const instancia = f.instancia;
    if (instancia === undefined || !instancia.startsWith(prefixo)) continue;
    const a: Acompanhantes = pendentes.get(instancia) ?? {};
    if (f.campo === ID_DA_DECISAO.justificativa) a.justificativa = texto(f.valor);
    else if (f.campo === ID_DA_DECISAO.medico) a.medico = texto(f.valor);
    else if (f.campo === ID_DA_DECISAO.registroProfissional) a.registroProfissional = texto(f.valor);
    else if (f.campo === ID_DA_DECISAO.identificacao) a.identificacao = texto(f.valor);
    else if (f.campo === ID_DA_DECISAO.criteriosNoMomento) a.criterios = texto(f.valor);
    else if (
      f.campo === CAMPO_DO_JULGAMENTO.id
      && (f.valor === DECISAO_DO_JULGAMENTO.prosseguir || f.valor === DECISAO_DO_JULGAMENTO.naoProsseguir)
    ) {
      const alvo = instancia.slice(prefixo.length);
      const criterios = criteriosGravados(a.criterios);
      const decisao = f.valor === DECISAO_DO_JULGAMENTO.prosseguir ? "prosseguir" : "nao_prosseguir";
      const identificacao: IdentificacaoDoMedico | undefined =
        a.identificacao === ORIGEM_DA_IDENTIFICACAO.sessao ? "sessao_autenticada"
        : a.identificacao === ORIGEM_DA_IDENTIFICACAO.atestacao ? "atestacao"
        : undefined;
      const critico = criterios.find((c) => c.id === alvo)?.critico === true;
      const falta = requisitosFaltantes({
        decisao,
        justificativa: a.justificativa,
        medico: a.medico,
        registroProfissional: a.registroProfissional,
        identificacao,
        critico,
        comRetrato: a.criterios !== undefined,
      });
      lidas.push({
        fatoId: f.id,
        alvo,
        rotuloDoAlvo: criterios.find((c) => c.id === alvo)?.rotulo ?? rotuloDoAlvoDoJulgamento(alvo),
        decisao,
        origem: "clinico",
        ...(a.justificativa !== undefined ? { justificativa: a.justificativa } : {}),
        ...(a.medico !== undefined ? { medico: a.medico } : {}),
        ...(a.registroProfissional !== undefined ? { registroProfissional: a.registroProfissional } : {}),
        ...(identificacao !== undefined ? { identificacao } : {}),
        criteriosNoMomento: criterios,
        critico,
        completa: falta.length === 0,
        falta,
        requerRevalidacao: decisao === "prosseguir" && falta.length > 0,
        horaRegistro: f.horaRegistro,
      });
      pendentes.set(instancia, {});
      continue;
    }
    pendentes.set(instancia, a);
  }
  return lidas.map((d, i) => ({ ...d, vigente: !lidas.slice(i + 1).some((x) => x.alvo === d.alvo) }));
}

/**
 * ⚠️ O que falta para a decisão poder ser registrada (AP-2, AP-3) — a MESMA regra da leitura (`requisitosFaltantes`).
 * ⛔ Nenhum botão cinza: a tela escreve esta lista. Com sessão nominal a identificação é a sessão; sem ela, atestação.
 */
export function faltaNaDecisao(
  dados: Pick<DadosDaDecisaoMedica, "decisao" | "justificativa" | "medico" | "registroProfissional">,
  contexto: { readonly critico: boolean; readonly sessaoNominal: boolean }
): readonly string[] {
  return requisitosFaltantes({
    ...dados,
    identificacao: contexto.sessaoNominal ? "sessao_autenticada" : "atestacao",
    critico: contexto.critico,
    comRetrato: true,
  });
}

/** ⚠️ Grava a decisão: primeiro o que a acompanha, por último o valor — a leitura agrupa por essa ordem. */
export function registrarDecisaoMedica(estado: EstadoAvc, alvo: string, dados: DadosDaDecisaoMedica, relogio: Relogio): EstadoAvc {
  const instancia = instanciaDoJulgamento(alvo);
  let e = estado;
  const gravarTexto = (campo: string, valor: string) => {
    const t = valor.trim();
    if (t !== "") e = registrarComInstancia(e, { campo, valor: t }, relogio, instancia);
  };
  gravarTexto(ID_DA_DECISAO.justificativa, dados.justificativa);
  gravarTexto(ID_DA_DECISAO.medico, dados.medico);
  gravarTexto(ID_DA_DECISAO.registroProfissional, dados.registroProfissional);
  e = registrarComInstancia(
    e,
    {
      campo: ID_DA_DECISAO.identificacao,
      valor: dados.identificacao === "sessao_autenticada" ? ORIGEM_DA_IDENTIFICACAO.sessao : ORIGEM_DA_IDENTIFICACAO.atestacao,
    },
    relogio,
    instancia
  );
  e = registrarComInstancia(e, { campo: ID_DA_DECISAO.criteriosNoMomento, valor: JSON.stringify(dados.criterios) }, relogio, instancia);
  return registrarComInstancia(
    e,
    {
      campo: CAMPO_DO_JULGAMENTO.id,
      valor: dados.decisao === "prosseguir" ? DECISAO_DO_JULGAMENTO.prosseguir : DECISAO_DO_JULGAMENTO.naoProsseguir,
    },
    relogio,
    instancia
  );
}
