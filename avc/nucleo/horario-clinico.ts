/**
 * HORÁRIO CLÍNICO DAS TRANSIÇÕES DA TROMBÓLISE — AC-13 reaberto, item 3 (autor, 2026-09-14; `docs/decisoes.md`, seção
 * "AC-13 reaberto", §9, §10 e §11, com a checagem E-49 aprovada).
 *
 * Horário clínico é quando a situação aconteceu no paciente; horário do registro é quando ela entrou no sistema. Um
 * nunca preenche o outro.
 *  · Iniciada: a única fonte é `ivt_inicio`. Informado, é conhecido; declarado desconhecido, é desconhecido declarado.
 *  · Administrada/concluída e Interrompida: exigem resolução documental, informar o horário ou declarar desconhecido,
 *    por um fato de horário ligado explicitamente à transição (`referenteAoFatoId`), ou pelo horário clínico que o
 *    próprio registro já trouxe (a interrupção registrada pelo caminho hemorrágico).
 *  · Prescrita, Preparada e Cancelada: horário opcional; a ausência não gera pendência.
 *  · Indicada e Decidida: sem horário clínico no V1.
 *
 * E-49: nada aqui participa do portão da IVT, do veredito da trombectomia nem da leitura da última dose de DOAC. A
 * pendência é só documental e a ausência do horário não altera elegibilidade.
 */
import { ROTULO_DO_ESTADO_DA_ACAO, informacaoDoEstadoDaAcao, type EstadoDaAcaoRegistrado } from "../conteudo/superficie-e";
import { CAMPO_DO_HORARIO_CLINICO, TROMBOLISE_IV } from "../conteudo/superficie-f";
import type { EstadoAvc } from "./estado";
import { fatosDaInstancia, instanciasDe, valorNaInstancia } from "./instancia";
import type { FatoRegistrado, Pendencia } from "./tipos";
import { CAMPOS_DE_SITUACAO_DA_RODADA, idsInvalidadosPorCorrecao } from "./transicoes-da-acao";

export type ExigenciaDoHorarioClinico = "obrigatorio" | "opcional" | "nao_pedido";

export const EXIGENCIA_DO_HORARIO_CLINICO: Readonly<Record<EstadoDaAcaoRegistrado, ExigenciaDoHorarioClinico>> = {
  indicado: "nao_pedido",
  decidido: "nao_pedido",
  prescrito: "opcional",
  preparado: "opcional",
  iniciado: "obrigatorio",
  administrado_concluido: "obrigatorio",
  interrompido: "obrigatorio",
  cancelado: "opcional",
};

export type FonteDoHorarioClinico = "ivt_inicio" | "registro_da_situacao" | "horario_informado";

export type HorarioClinico =
  | { readonly tipo: "nao_pedido" }
  | { readonly tipo: "conhecido"; readonly ms: number; readonly fonte: FonteDoHorarioClinico }
  | { readonly tipo: "desconhecido_declarado"; readonly fonte: FonteDoHorarioClinico }
  | { readonly tipo: "nao_informado" };

/** O último fato de horário ligado a esta transição. Informar de novo corrige o anterior, e o mais recente vale. */
export function horarioInformadoDaTransicao(estado: EstadoAvc, fato: FatoRegistrado): FatoRegistrado | undefined {
  if (fato.instancia === undefined) return undefined;
  return fatosDaInstancia(estado, fato.instancia)
    .filter((f) => f.campo === CAMPO_DO_HORARIO_CLINICO.id && f.referenteAoFatoId === fato.id)
    .slice(-1)[0];
}

export function horarioClinicoDaTransicao(estado: EstadoAvc, fato: FatoRegistrado): HorarioClinico {
  if (fato.instancia === undefined || !CAMPOS_DE_SITUACAO_DA_RODADA.has(fato.campo)) return { tipo: "nao_pedido" };
  const info = informacaoDoEstadoDaAcao(fato.valor);
  if (info.tipo !== "registrado" || EXIGENCIA_DO_HORARIO_CLINICO[info.estado] === "nao_pedido") return { tipo: "nao_pedido" };
  if (info.estado === "iniciado") {
    /** Iniciada: `ivt_inicio` é a única fonte. Não existe segundo horário para o mesmo instante. */
    const inicio = valorNaInstancia(estado, fato.instancia, "ivt_inicio")?.valor;
    if (typeof inicio === "number" && Number.isFinite(inicio)) return { tipo: "conhecido", ms: inicio, fonte: "ivt_inicio" };
    if (inicio === "nao_sei") return { tipo: "desconhecido_declarado", fonte: "ivt_inicio" };
    return { tipo: "nao_informado" };
  }
  if (typeof fato.horaClinica === "number" && Number.isFinite(fato.horaClinica)) {
    return { tipo: "conhecido", ms: fato.horaClinica, fonte: "registro_da_situacao" };
  }
  const informado = horarioInformadoDaTransicao(estado, fato)?.valor;
  if (typeof informado === "number" && Number.isFinite(informado)) return { tipo: "conhecido", ms: informado, fonte: "horario_informado" };
  if (informado === "nao_sei") return { tipo: "desconhecido_declarado", fonte: "horario_informado" };
  /** Sem horário clínico, a transição fica sem horário clínico; o horário do registro continua separado, na trilha. */
  return { tipo: "nao_informado" };
}

/**
 * A transição recebe o gesto de horário na trilha. Iniciada não recebe (a fonte é `ivt_inicio`), Indicada e Decidida
 * não recebem (sem horário no V1), e o registro que já trouxe horário clínico próprio também não.
 */
export function aceitaGestoDeHorarioClinico(estado: EstadoAvc, fato: FatoRegistrado): boolean {
  if (fato.instancia === undefined || !CAMPOS_DE_SITUACAO_DA_RODADA.has(fato.campo)) return false;
  const info = informacaoDoEstadoDaAcao(fato.valor);
  if (info.tipo !== "registrado" || info.estado === "iniciado") return false;
  if (EXIGENCIA_DO_HORARIO_CLINICO[info.estado] === "nao_pedido") return false;
  return !(typeof fato.horaClinica === "number" && Number.isFinite(fato.horaClinica));
}

const ROTULO_DA_PENDENCIA: Readonly<Partial<Record<EstadoDaAcaoRegistrado, string>>> = {
  administrado_concluido: "Informar o horário clínico da administração concluída ou declarar desconhecido",
  interrompido: "Informar o horário clínico da interrupção ou declarar desconhecido",
};

export const RESOLVE_O_HORARIO_CLINICO = "Informar o horário ou declarar desconhecido";

/**
 * Pendência documental do horário clínico: uma por transição válida (não corrigida por engano) de estado obrigatório
 * sem horário clínico. Iniciada pede `ivt_inicio`, uma vez por instância. Nunca trava registro, portão ou conduta.
 */
export function pendenciasDoHorarioClinico(estado: EstadoAvc): readonly Pendencia[] {
  const pendencias: Pendencia[] = [];
  for (const instancia of instanciasDe(estado, TROMBOLISE_IV)) {
    const doCampo = fatosDaInstancia(estado, instancia).filter((f) => f.campo === "ivt_estado");
    const invalidados = idsInvalidadosPorCorrecao(doCampo);
    let inicioPedido = false;
    for (const f of doCampo) {
      const info = informacaoDoEstadoDaAcao(f.valor);
      if (info.tipo !== "registrado" || invalidados.has(f.id)) continue;
      if (EXIGENCIA_DO_HORARIO_CLINICO[info.estado] !== "obrigatorio") continue;
      if (horarioClinicoDaTransicao(estado, f).tipo !== "nao_informado") continue;
      if (info.estado === "iniciado") {
        if (inicioPedido) continue;
        inicioPedido = true;
        pendencias.push({
          id: `horario_clinico_inicio_${instancia}`,
          rotulo: "Informar o horário de início da trombólise ou declarar desconhecido",
          dono: "reperfusao",
          campo: "ivt_inicio",
          resolvePor: RESOLVE_O_HORARIO_CLINICO,
        });
        continue;
      }
      pendencias.push({
        id: `horario_clinico_${f.id}`,
        rotulo: ROTULO_DA_PENDENCIA[info.estado] ?? ROTULO_DO_ESTADO_DA_ACAO[info.estado],
        dono: "reperfusao",
        campo: CAMPO_DO_HORARIO_CLINICO.id,
        resolvePor: RESOLVE_O_HORARIO_CLINICO,
      });
    }
  }
  return pendencias;
}
