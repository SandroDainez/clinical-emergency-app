/**
 * TRANSFERÊNCIA ⛔ E TELECONSULTA — leitura do registro (pedido do autor, 2026-09-13;
 * T07, A12, A08, RQ-T07-02, RQ-TEL-01).
 *
 * ⚠️ REGISTRO, ⛔ E ⛔ NÃO CRITÉRIO: ⛔ nada aqui diz se o paciente deve ser transferido,
 * para onde, ⛔ nem o que o parecer concluiu. ⚠️ O que se lê é **o que a equipe
 * registrou e quando**.
 *
 * ⚠️ MARCOS SÃO EVENTOS DE UMA LINHA DO TEMPO, ⛔ E ⛔ NÃO SELETOR DE ESTADO (autor,
 * 2026-09-13, 11ª rodada). Cada marco tem DOIS horários (AC-69): o **observado** (quando
 * aconteceu; editável por correção auditada) ⛔ e o de **registro** (quando entrou no
 * sistema; preservado mesmo depois de corrigir o observado). A ordem ⛔ e o marco atual
 * seguem o observado. Correção por engano atinge ⛔ só aquele marco.
 *
 * ⚠️ ACEITE ⛔ NUNCA PRESUMIDO: só conta um «Aceite» observado depois da última recusa
 * ou cancelamento. Um marco posterior (transporte, saída, chegada) sem ele é **dito**.
 * ⚠️ «Chegada» sem «Saída» é tolerada ⛔ e **dita**.
 *
 * ⚠️ A12 — sem recurso (transferência inviável neste momento) ⛔ ou recusa/cancelamento
 * sem nova tentativa: plano local, documentação ⛔ e revisão do acesso como tarefa.
 * ⛔ Nunca terapia substituta — este módulo ⛔ é lido por portão, veredito ⛔ nem dose.
 * ⚠️ «Incerto» ⛔ não é ausente (RQ-REC-01).
 *
 * ⚠️ Nenhum campo lido aqui alcança a F (declarado em `conteudo/consumidores.ts`).
 */
import { OPCOES_DE_AJUDA } from "../conteudo/ajuda";
import { condutasExternas } from "./ajuda";
import { corrigirFato, registrarFato, valorAtual, type EstadoAvc } from "./estado";
import { eventosDePiora, MOTIVO_ENGANO } from "./deterioracao";
import type { Relogio } from "./relogio";
import type { FatoRegistrado, Pendencia } from "./tipos";

export const CAMPO_MARCO = "transf_marco";
/** ⚠️ AC-72 (autor, 2026-09-13): teleconsulta pelo mesmo modelo de marcos. */
export const CAMPO_TELE_MARCO = "tele_marco";
/** ⚠️ 15ª rodada (A07): neurocirurgia contatada pelo mesmo modelo de marcos da teleconsulta. */
export const CAMPO_NEURO_MARCO = "neuro_marco";
export const PARECER_REGISTRADO = "Parecer registrado";
export const MOTIVO_HORARIO_CORRIGIDO = "horário corrigido";

export type LeituraDaTransferencia = {
  readonly estado?: string;
  readonly emEspera: boolean;
  readonly aceiteRegistrado: boolean;
  readonly marcoSemAceite: boolean;
  readonly chegadaSemSaida: boolean;
  readonly semTransferenciaConfirmada: boolean;
};

export type MarcoDaTransferencia = {
  readonly fatoId: string;
  readonly tipo: string;
  readonly observado: number;
  readonly registradoEm: number;
  readonly horarioCorrigido: boolean;
  /** ⚠️ Só no marco «Parecer registrado» da teleconsulta. */
  readonly parecer?: { readonly texto: string; readonly autor: string };
};

export type ItemDaLinhaDoTempo = {
  readonly id: string;
  readonly fatoId: string;
  readonly ator: "transferencia" | "teleconsulta" | "piora" | "ajuda";
  readonly quando: number;
  readonly registradoEm: number;
  readonly texto: string;
  readonly detalhe?: string;
  /** ⚠️ Nota traduzível (ex.: "registrado por engano"). */
  readonly nota?: string;
  readonly estimativa: boolean;
};

export type AvaliacaoEspecializada = {
  readonly texto: string;
  readonly autor?: string;
  readonly quando?: number;
};

const EM_ESPERA = new Set(["Solicitada", "Contato realizado", "Aceite", "Transporte confirmado", "Saída"]);
const APOS_O_ACEITE = new Set(["Transporte confirmado", "Saída", "Chegada"]);
const SEM_TRANSFERENCIA = new Set(["Recusa", "Cancelada"]);

export const FRASE_DO_MARCO: Readonly<Record<string, string>> = {
  Solicitada: "Transferência solicitada",
  "Contato realizado": "Contato realizado com o destino",
  Aceite: "Aceite registrado",
  Recusa: "Recusa registrada",
  "Transporte confirmado": "Transporte confirmado",
  Saída: "Saída do paciente",
  Chegada: "Chegada ao destino",
  Cancelada: "Transferência cancelada",
};

export const FRASE_DA_TELECONSULTA: Readonly<Record<string, string>> = {
  Solicitada: "Teleconsulta solicitada",
  "Em andamento": "Teleconsulta em andamento",
  "Parecer registrado": "Avaliação especializada registrada",
  "Não disponível": "Teleconsulta não disponível",
};

function vazio(valor: unknown): boolean {
  return valor === undefined || valor === "nao_perguntado" || valor === "";
}

/** Fatos do campo que continuam valendo: ⛔ corrigidos ⛔ e «Limpar» saem. */
function vigentes(estado: EstadoAvc, campo: string): readonly FatoRegistrado[] {
  const corrigidos = new Set(estado.fatos.map((f) => f.corrigeFatoId).filter((id) => id !== undefined));
  return estado.fatos.filter((f) => f.campo === campo && !corrigidos.has(f.id) && !vazio(f.valor));
}

function atual(estado: EstadoAvc, campo: string): string | undefined {
  const f = valorAtual(estado, campo);
  return f === undefined || vazio(f.valor) ? undefined : String(f.valor);
}

/** O fato original de uma cadeia de correções (o registro de verdade). */
function raiz(estado: EstadoAvc, fato: FatoRegistrado): FatoRegistrado {
  let atualFato = fato;
  for (let i = 0; i < estado.fatos.length && atualFato.corrigeFatoId !== undefined; i++) {
    const anterior = estado.fatos.find((f) => f.id === atualFato.corrigeFatoId);
    if (anterior === undefined) break;
    atualFato = anterior;
  }
  return atualFato;
}

/* ── ações sobre os marcos ─────────────────────────────────────────────── */

export function registrarMarco(estado: EstadoAvc, tipo: string, observado: number, relogio: Relogio): EstadoAvc {
  return registrarFato(estado, { campo: CAMPO_MARCO, valor: tipo, horaClinica: observado }, relogio);
}

/**
 * ⚠️ AC-72: «Parecer registrado» exige texto ⛔ e autor (sem eles, ⛔ entra). O texto ⛔ e o
 * autor moram em fatos ligados ao marco pela instância = id do marco; ⛔ a hora é a
 * observada do próprio marco.
 */
export function registrarMarcoDeTeleconsulta(
  estado: EstadoAvc,
  tipo: string,
  observado: number,
  relogio: Relogio,
  parecer?: { readonly texto: string; readonly autor: string }
): EstadoAvc {
  return registrarMarcoComParecer(estado, { marco: CAMPO_TELE_MARCO, ...PARECER_DO_CAMPO[CAMPO_TELE_MARCO] }, tipo, observado, relogio, parecer);
}

/** ⚠️ 15ª rodada (A07): marcos da neurocirurgia — «Parecer registrado» exige texto ⛔ autor. */
export function registrarMarcoDeNeurocirurgia(
  estado: EstadoAvc,
  tipo: string,
  observado: number,
  relogio: Relogio,
  parecer?: { readonly texto: string; readonly autor: string }
): EstadoAvc {
  return registrarMarcoComParecer(estado, { marco: CAMPO_NEURO_MARCO, ...PARECER_DO_CAMPO[CAMPO_NEURO_MARCO] }, tipo, observado, relogio, parecer);
}

const PARECER_DO_CAMPO: Readonly<Record<string, { texto: string; autor: string }>> = {
  [CAMPO_TELE_MARCO]: { texto: "tele_parecer", autor: "tele_parecer_autor" },
  [CAMPO_NEURO_MARCO]: { texto: "neuro_parecer", autor: "neuro_parecer_autor" },
};

function registrarMarcoComParecer(
  estado: EstadoAvc,
  campos: { readonly marco: string; readonly texto: string; readonly autor: string },
  tipo: string,
  observado: number,
  relogio: Relogio,
  parecer?: { readonly texto: string; readonly autor: string }
): EstadoAvc {
  const ehParecer = tipo === PARECER_REGISTRADO;
  const texto = parecer?.texto.trim() ?? "";
  const autor = parecer?.autor.trim() ?? "";
  if (ehParecer && (texto === "" || autor === "")) return estado;
  const comMarco = registrarFato(estado, { campo: campos.marco, valor: tipo, horaClinica: observado }, relogio);
  if (!ehParecer) return comMarco;
  const marcoId = comMarco.fatos[comMarco.fatos.length - 1].id;
  const comTexto = registrarFato(comMarco, { campo: campos.texto, valor: texto, instancia: marcoId }, relogio);
  return registrarFato(comTexto, { campo: campos.autor, valor: autor, instancia: marcoId }, relogio);
}

function marcoVigente(estado: EstadoAvc, fatoId: string): FatoRegistrado | undefined {
  return [...vigentes(estado, CAMPO_MARCO), ...vigentes(estado, CAMPO_TELE_MARCO), ...vigentes(estado, CAMPO_NEURO_MARCO)].find((f) => f.id === fatoId);
}

export function corrigirHorarioDoMarco(estado: EstadoAvc, fatoId: string, observado: number, relogio: Relogio): EstadoAvc {
  const alvo = marcoVigente(estado, fatoId);
  if (alvo === undefined) return estado;
  return corrigirFato(
    estado,
    { campo: alvo.campo, valor: alvo.valor, horaClinica: observado, corrigeFatoId: fatoId, motivo: MOTIVO_HORARIO_CORRIGIDO },
    relogio
  );
}

export function marcoPorEngano(estado: EstadoAvc, fatoId: string, relogio: Relogio): EstadoAvc {
  const alvo = marcoVigente(estado, fatoId);
  if (alvo === undefined) return estado;
  return corrigirFato(
    estado,
    { campo: alvo.campo, valor: "nao_perguntado", corrigeFatoId: fatoId, motivo: MOTIVO_ENGANO },
    relogio
  );
}

export function marcosDaTransferencia(estado: EstadoAvc): readonly MarcoDaTransferencia[] {
  return marcosDoCampo(estado, CAMPO_MARCO);
}

export function marcosDaTeleconsulta(estado: EstadoAvc): readonly MarcoDaTransferencia[] {
  return marcosDoCampo(estado, CAMPO_TELE_MARCO);
}

export function marcosDaNeurocirurgia(estado: EstadoAvc): readonly MarcoDaTransferencia[] {
  return marcosDoCampo(estado, CAMPO_NEURO_MARCO);
}

function parecerDoMarco(estado: EstadoAvc, registroId: string, campoDoMarco: string): { texto: string; autor: string } | undefined {
  const campos = PARECER_DO_CAMPO[campoDoMarco] ?? PARECER_DO_CAMPO[CAMPO_TELE_MARCO];
  const ultimo = (campo: string) =>
    [...estado.fatos].reverse().find((f) => f.campo === campo && f.instancia === registroId && !vazio(f.valor));
  const texto = ultimo(campos.texto);
  const autor = ultimo(campos.autor);
  return texto === undefined || autor === undefined ? undefined : { texto: String(texto.valor), autor: String(autor.valor) };
}

function marcosDoCampo(estado: EstadoAvc, campo: string): readonly MarcoDaTransferencia[] {
  const ordem = (id: string) => estado.fatos.findIndex((f) => f.id === id);
  return vigentes(estado, campo)
    .map((f) => {
      const original = raiz(estado, f);
      return {
        fatoId: f.id,
        tipo: String(f.valor),
        observado: f.horaClinica ?? f.horaRegistro,
        registradoEm: original.horaRegistro,
        horarioCorrigido: f.id !== original.id,
        indiceDoRegistro: ordem(original.id),
        parecer: f.valor === PARECER_REGISTRADO ? parecerDoMarco(estado, original.id, campo) : undefined,
      };
    })
    .sort((a, b) => a.observado - b.observado || a.indiceDoRegistro - b.indiceDoRegistro)
    .map(({ indiceDoRegistro: _i, ...m }) => m);
}

/* ── leituras ──────────────────────────────────────────────────────────── */

export function leituraDaTransferencia(estado: EstadoAvc): LeituraDaTransferencia {
  const marcos = marcosDaTransferencia(estado);
  const corrente = marcos.length === 0 ? undefined : marcos[marcos.length - 1].tipo;
  let aceite = false;
  for (const m of marcos) {
    if (m.tipo === "Aceite") aceite = true;
    if (SEM_TRANSFERENCIA.has(m.tipo)) aceite = false;
  }
  const semRecurso = atual(estado, "transferencia_possivel") === "nao";
  return {
    estado: corrente,
    emEspera: corrente !== undefined && EM_ESPERA.has(corrente),
    aceiteRegistrado: aceite,
    marcoSemAceite: corrente !== undefined && APOS_O_ACEITE.has(corrente) && !aceite,
    chegadaSemSaida: marcos.some((m) => m.tipo === "Chegada") && !marcos.some((m) => m.tipo === "Saída"),
    semTransferenciaConfirmada:
      (corrente !== undefined && SEM_TRANSFERENCIA.has(corrente)) || (corrente === undefined && semRecurso),
  };
}

export function avaliacaoEspecializadaRegistrada(estado: EstadoAvc): AvaliacaoEspecializada | undefined {
  const pareceres = marcosDaTeleconsulta(estado).filter((m) => m.tipo === PARECER_REGISTRADO && m.parecer !== undefined);
  const ultimo = pareceres[pareceres.length - 1];
  if (ultimo === undefined || ultimo.parecer === undefined) return undefined;
  return { texto: ultimo.parecer.texto, autor: ultimo.parecer.autor, quando: ultimo.observado };
}

/** Motivo registrado DEPOIS do registro original da recusa (a trilha é ordenada). */
function motivoDaRecusa(estado: EstadoAvc, fatoIdDaRecusa: string): string | undefined {
  const recusa = estado.fatos.find((f) => f.id === fatoIdDaRecusa);
  if (recusa === undefined) return undefined;
  const depois = estado.fatos.slice(estado.fatos.indexOf(raiz(estado, recusa)) + 1);
  const f = [...depois].reverse().find((x) => x.campo === "transf_recusa_motivo");
  return f === undefined || vazio(f.valor) ? undefined : String(f.valor);
}

export function linhaDoTempoDoCaso(estado: EstadoAvc): readonly ItemDaLinhaDoTempo[] {
  const itens: ItemDaLinhaDoTempo[] = [];
  for (const m of marcosDaTransferencia(estado)) {
    const frase = FRASE_DO_MARCO[m.tipo];
    if (frase === undefined) continue;
    itens.push({
      id: `transf-${m.fatoId}`,
      fatoId: m.fatoId,
      ator: "transferencia",
      quando: m.observado,
      registradoEm: m.registradoEm,
      texto: frase,
      detalhe:
        m.tipo === "Recusa"
          ? motivoDaRecusa(estado, m.fatoId)
          : m.tipo === "Solicitada"
            ? atual(estado, "transf_destino")
            : undefined,
      estimativa: false,
    });
  }
  for (const p of vigentes(estado, "transf_previsao")) {
    if (typeof p.valor !== "number") continue;
    itens.push({
      id: `previsao-${p.id}`,
      fatoId: p.id,
      ator: "transferencia",
      quando: p.valor,
      registradoEm: p.horaRegistro,
      texto: "Previsão do transporte (estimativa)",
      estimativa: true,
    });
  }
  for (const m of marcosDaTeleconsulta(estado)) {
    const frase = FRASE_DA_TELECONSULTA[m.tipo];
    if (frase === undefined) continue;
    itens.push({
      id: `tele-${m.fatoId}`,
      fatoId: m.fatoId,
      ator: "teleconsulta",
      quando: m.observado,
      registradoEm: m.registradoEm,
      texto: frase,
      detalhe: m.parecer === undefined ? undefined : `${m.parecer.texto} — ${m.parecer.autor}`,
      estimativa: false,
    });
  }
  for (const ev of eventosDePiora(estado)) {
    const fato = estado.fatos.find((f) => f.id === ev.fatoId);
    itens.push({
      id: `piora-${ev.fatoId}`,
      fatoId: ev.fatoId,
      ator: "piora",
      quando: ev.quando,
      registradoEm: fato?.horaRegistro ?? ev.quando,
      texto: "Paciente piorou",
      detalhe: ev.descricao,
      nota: ev.engano ? MOTIVO_ENGANO : undefined,
      estimativa: false,
    });
  }
  for (const c of condutasExternas(estado)) {
    const fato = estado.fatos.find((f) => f.id === c.fatoId);
    itens.push({
      id: `ajuda-${c.fatoId}`,
      fatoId: c.fatoId,
      ator: "ajuda",
      quando: c.quando,
      registradoEm: fato?.horaRegistro ?? c.quando,
      texto: OPCOES_DE_AJUDA.find((o) => o.id === c.opcao)?.rotuloNaLinhaDoTempo ?? "Conduta externa registrada",
      detalhe: c.texto,
      estimativa: false,
    });
  }
  const ordem = (id: string) => estado.fatos.findIndex((f) => f.id === id);
  return itens.sort((a, b) => a.quando - b.quando || ordem(a.fatoId) - ordem(b.fatoId));
}

export function pendenciasDoDestino(estado: EstadoAvc): readonly Pendencia[] {
  const lista: Pendencia[] = [];
  const leitura = leituraDaTransferencia(estado);
  if (leitura.estado === "Recusa") {
    const marcos = marcosDaTransferencia(estado);
    const recusa = [...marcos].reverse().find((m) => m.tipo === "Recusa");
    if (recusa !== undefined && motivoDaRecusa(estado, recusa.fatoId) === undefined) {
      lista.push({
        id: "motivo_da_recusa",
        rotulo: "Registrar o motivo da recusa",
        dono: "destino",
        campo: "transf_recusa_motivo",
        resolvePor: "Escrever o motivo informado",
      });
    }
  }
  if (leitura.semTransferenciaConfirmada) {
    lista.push({
      id: "revisar_acesso_transferencia",
      rotulo: "Revisar o acesso à transferência",
      dono: "destino",
      campo: CAMPO_MARCO,
      resolvePor: "Registrar nova solicitação ou mudança na capacidade do serviço",
    });
  }
  return lista;
}
