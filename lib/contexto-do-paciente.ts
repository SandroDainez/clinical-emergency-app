/**
 * Contexto do paciente — o que o app já sabe e não deve perguntar de novo.
 *
 * ── O PEDIDO ─────────────────────────────────────────────────────────────────
 *
 * "O app tem que se comunicar com informações que foram dadas anteriormente,
 * ele já sabe isso, tem que vir automático e não para preencher de novo."
 *
 * Dentro de um módulo os valores já persistiam entre os passos. O que faltava
 * era ATRAVESSAR módulos: informar o peso no AVC e ter de informá-lo de novo ao
 * abrir a sepse, no mesmo atendimento e no mesmo paciente.
 *
 * ── A DISTINÇÃO QUE FAZ ESTE ARQUIVO EXISTIR ─────────────────────────────────
 *
 * Nem tudo pode ser reaproveitado, e essa é a decisão clínica central aqui.
 *
 * REAPROVEITÁVEL — atributos que não mudam durante o atendimento:
 *   peso, altura, sexo, idade.
 * Um paciente não muda de altura entre dois módulos. Perguntar de novo é atrito
 * puro, e atrito em emergência custa tempo.
 *
 * NUNCA REAPROVEITADO — sinais vitais e exames:
 *   PA, FC, SpO₂, glicemia, lactato, pH, potássio, NIHSS, Glasgow.
 * Esses mudam de minuto a minuto, e é exatamente por mudarem que são medidos.
 * Preencher automaticamente uma PA de dez minutos atrás como se fosse a de
 * agora seria pior do que perguntar: o médico veria um número plausível, não
 * teria motivo para duvidar dele, e decidiria conduta sobre um dado morto.
 *
 * Por isso a lista de campos compartilhados é EXPLÍCITA e curta. Um campo novo
 * só entra aqui se alguém decidir, deliberadamente, que ele não muda durante o
 * atendimento — o padrão é não compartilhar.
 *
 * ── VOLATILIDADE ─────────────────────────────────────────────────────────────
 *
 * Vive em memória, como as sessões de fluxo: some ao fechar o app. É o
 * comportamento certo — o próximo paciente não pode herdar o peso do anterior.
 * A validade curta existe pelo mesmo motivo.
 */

/** Campos que podem ser reaproveitados entre módulos. Lista fechada. */
export const CAMPOS_COMPARTILHADOS = ["peso", "pesoOrigem", "altura", "sexo", "idade"] as const;

export type CampoCompartilhado = (typeof CAMPOS_COMPARTILHADOS)[number];

export function ehCampoCompartilhado(id: string): id is CampoCompartilhado {
  return (CAMPOS_COMPARTILHADOS as readonly string[]).includes(id);
}

type Registro = {
  valor: string;
  /** Módulo onde foi informado — mostrado ao usuário, para ele poder duvidar. */
  origem: string;
  salvoEm: number;
};

/**
 * Uma hora. Tempo de um atendimento, não de um plantão: passado isso, é mais
 * provável que seja outro paciente do que o mesmo.
 */
const VALIDADE_MS = 60 * 60 * 1000;

const contexto = new Map<string, Registro>();

export function guardarNoContexto(campo: string, valor: string, origem: string): void {
  if (!ehCampoCompartilhado(campo)) return;
  const limpo = valor.trim();
  if (!limpo) return;
  contexto.set(campo, { valor: limpo, origem, salvoEm: Date.now() });
}

export function lerDoContexto(campo: string): Registro | undefined {
  if (!ehCampoCompartilhado(campo)) return undefined;
  const r = contexto.get(campo);
  if (!r) return undefined;
  if (Date.now() - r.salvoEm > VALIDADE_MS) {
    contexto.delete(campo);
    return undefined;
  }
  return r;
}

export type ContextoPacienteSnapshotEntry = {
  campo: CampoCompartilhado;
  valor: string;
  origem: string;
  salvoEm: number;
};

export function exportContextoDoPacienteSnapshot(): ContextoPacienteSnapshotEntry[] {
  return [...contexto.entries()].map(([campo, registro]) => ({
    campo: campo as CampoCompartilhado,
    valor: registro.valor,
    origem: registro.origem,
    salvoEm: registro.salvoEm,
  }));
}

export function restoreContextoDoPacienteSnapshot(snapshot: ContextoPacienteSnapshotEntry[]): void {
  limparContextoDoPaciente();
  for (const entry of snapshot) {
    if (!ehCampoCompartilhado(entry.campo)) continue;
    if (!entry.valor.trim() || !entry.origem.trim() || !Number.isFinite(entry.salvoEm)) continue;
    contexto.set(entry.campo, { valor: entry.valor.trim(), origem: entry.origem.trim(), salvoEm: entry.salvoEm });
  }
}

/** Novo paciente: esquece tudo. */
export function limparContextoDoPaciente(): void {
  contexto.clear();
}
