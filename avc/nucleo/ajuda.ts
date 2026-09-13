/**
 * «PRECISO DE AJUDA» — registro da conduta externa (decisão do autor, 2026-09-13).
 *
 * ⚠️ A conduta externa é o que a equipe fez FORA do app, escrita por ela. ⛔ O app ⛔ a
 * executa, ⛔ a interpreta ⛔ nem a lê em derivação: ela vira fato com horário (autor
 * carimbado pela persistência) ⛔ e aparece na linha do tempo como registro da equipe.
 */
import { registrarFato, type EstadoAvc } from "./estado";
import type { Relogio } from "./relogio";

const PREFIXO = "ajuda_";

export type CondutaExterna = {
  readonly fatoId: string;
  readonly opcao: string;
  readonly texto: string;
  readonly quando: number;
};

export function registrarCondutaExterna(estado: EstadoAvc, opcao: string, texto: string, relogio: Relogio): EstadoAvc {
  const limpo = texto.trim();
  if (limpo === "") return estado;
  return registrarFato(estado, { campo: `${PREFIXO}${opcao}`, valor: limpo, horaClinica: relogio.agora() }, relogio);
}

export function condutasExternas(estado: EstadoAvc): readonly CondutaExterna[] {
  return estado.fatos
    .filter((f) => f.campo.startsWith(PREFIXO) && typeof f.valor === "string" && f.valor !== "nao_perguntado")
    .map((f) => ({
      fatoId: f.id,
      opcao: f.campo.slice(PREFIXO.length),
      texto: String(f.valor),
      quando: f.horaClinica ?? f.horaRegistro,
    }));
}
