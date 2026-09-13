/**
 * TRANSFERÊNCIA ⛔ E TELECONSULTA — leitura do registro (pedido do autor, 2026-09-13;
 * T07, A12, A08, RQ-T07-02, RQ-TEL-01).
 *
 * ⚠️ REGISTRO, ⛔ E ⛔ NÃO CRITÉRIO: ⛔ nada aqui diz se o paciente deve ser transferido,
 * para onde, ⛔ nem o que o parecer concluiu. ⚠️ O que se lê é **o que a equipe
 * registrou e quando**.
 *
 * ⚠️ ACEITE ⛔ NUNCA PRESUMIDO: só conta um «Aceite» registrado depois da última recusa
 * ou cancelamento. Um marco posterior (transporte, saída, chegada) sem ele é **dito**.
 *
 * ⚠️ A12 — sem recurso (transferência inviável neste momento) ⛔ ou recusa/cancelamento
 * sem nova tentativa: plano local, documentação ⛔ e revisão do acesso como tarefa.
 * ⛔ Nunca terapia substituta — este módulo ⛔ é lido por portão, veredito ⛔ nem dose.
 * ⚠️ «Incerto» ⛔ não é ausente (RQ-REC-01).
 *
 * ⚠️ Nenhum campo lido aqui alcança a F (declarado em `conteudo/consumidores.ts`).
 */
import { valorAtual, type EstadoAvc } from "./estado";
import { eventosDePiora } from "./deterioracao";
import type { FatoRegistrado, Pendencia } from "./tipos";

export type LeituraDaTransferencia = {
  readonly estado?: string;
  readonly emEspera: boolean;
  readonly aceiteRegistrado: boolean;
  readonly marcoSemAceite: boolean;
  readonly semTransferenciaConfirmada: boolean;
};

export type ItemDaLinhaDoTempo = {
  readonly id: string;
  readonly fatoId: string;
  readonly ator: "transferencia" | "teleconsulta" | "piora";
  readonly quando: number;
  readonly texto: string;
  readonly detalhe?: string;
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

function instanteAtual(estado: EstadoAvc, campo: string): number | undefined {
  const v = valorAtual(estado, campo)?.valor;
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export function leituraDaTransferencia(estado: EstadoAvc): LeituraDaTransferencia {
  const marcos = vigentes(estado, "transf_estado");
  const corrente = atual(estado, "transf_estado");
  let aceite = false;
  for (const m of marcos) {
    if (m.valor === "Aceite") aceite = true;
    if (SEM_TRANSFERENCIA.has(String(m.valor))) aceite = false;
  }
  const semRecurso = atual(estado, "transferencia_possivel") === "nao";
  return {
    estado: corrente,
    emEspera: corrente !== undefined && EM_ESPERA.has(corrente),
    aceiteRegistrado: aceite,
    marcoSemAceite: corrente !== undefined && APOS_O_ACEITE.has(corrente) && !aceite,
    semTransferenciaConfirmada:
      (corrente !== undefined && SEM_TRANSFERENCIA.has(corrente)) || (corrente === undefined && semRecurso),
  };
}

export function avaliacaoEspecializadaRegistrada(estado: EstadoAvc): AvaliacaoEspecializada | undefined {
  if (atual(estado, "tele_estado") !== "Parecer registrado") return undefined;
  const texto = atual(estado, "tele_parecer");
  if (texto === undefined) return undefined;
  return {
    texto,
    autor: atual(estado, "tele_parecer_autor"),
    quando: instanteAtual(estado, "tele_parecer_hora"),
  };
}

/** Motivo registrado DEPOIS da recusa indicada (a trilha é ordenada). */
function motivoDaRecusa(estado: EstadoAvc, recusa: FatoRegistrado): string | undefined {
  const depois = estado.fatos.slice(estado.fatos.indexOf(recusa) + 1);
  const f = [...depois].reverse().find((x) => x.campo === "transf_recusa_motivo");
  return f === undefined || vazio(f.valor) ? undefined : String(f.valor);
}

export function linhaDoTempoDoCaso(estado: EstadoAvc): readonly ItemDaLinhaDoTempo[] {
  const itens: ItemDaLinhaDoTempo[] = [];
  for (const m of vigentes(estado, "transf_estado")) {
    const frase = FRASE_DO_MARCO[String(m.valor)];
    if (frase === undefined) continue;
    itens.push({
      id: `transf-${m.id}`,
      fatoId: m.id,
      ator: "transferencia",
      quando: m.horaClinica ?? m.horaRegistro,
      texto: frase,
      detalhe:
        m.valor === "Recusa"
          ? motivoDaRecusa(estado, m)
          : m.valor === "Solicitada"
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
      texto: "Previsão do transporte (estimativa)",
      estimativa: true,
    });
  }
  const parecer = avaliacaoEspecializadaRegistrada(estado);
  for (const t of vigentes(estado, "tele_estado")) {
    const frase = FRASE_DA_TELECONSULTA[String(t.valor)];
    if (frase === undefined) continue;
    const ehParecer = t.valor === "Parecer registrado";
    itens.push({
      id: `tele-${t.id}`,
      fatoId: t.id,
      ator: "teleconsulta",
      quando: ehParecer && parecer?.quando !== undefined ? parecer.quando : t.horaClinica ?? t.horaRegistro,
      texto: frase,
      detalhe:
        ehParecer && parecer !== undefined
          ? parecer.autor === undefined ? parecer.texto : `${parecer.texto} — ${parecer.autor}`
          : undefined,
      estimativa: false,
    });
  }
  for (const ev of eventosDePiora(estado)) {
    itens.push({
      id: `piora-${ev.fatoId}`,
      fatoId: ev.fatoId,
      ator: "piora",
      quando: ev.quando,
      texto: "Paciente piorou",
      detalhe: ev.descricao,
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
    const recusa = [...vigentes(estado, "transf_estado")].reverse().find((m) => m.valor === "Recusa");
    if (recusa !== undefined && motivoDaRecusa(estado, recusa) === undefined) {
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
      campo: "transf_estado",
      resolvePor: "Registrar nova solicitação ou mudança na capacidade do serviço",
    });
  }
  return lista;
}
