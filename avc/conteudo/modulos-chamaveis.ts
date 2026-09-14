/**
 * MÓDULOS CHAMÁVEIS A PARTIR DO AVC — contrato de navegação (C05; autor, 2026-09-13, 13ª
 * rodada, opção A).
 *
 * ⚠️ Os três destinos são INDISPONÍVEIS neste app: via aérea, ventilação mecânica ⛔ e
 * sedoanalgesia foram removidos em 2026-08-27 por falta de validação ⛔ e ⛔ não foram
 * restaurados. Cada um aparece como "indisponível neste app" ⛔ e oferece só o registro
 * estruturado da conduta externa — ⛔ nunca uma ação que aparente executar intervenção.
 *
 * ⚠️ `campos`: os campos da conduta externa que o painel do destino mostra. ⚠️
 * `cuidadosAssociados`: chamadas aninhadas (depois da via aérea, ventilação ⛔ e sedação
 * ficam acessíveis como cuidados associados — spec §04).
 *
 * ⚠️ Quando via aérea voltar como módulo do motor, `disponivel` muda ⛔ e o contrato fica.
 */
export type ModuloChamavel = {
  readonly id: "via_aerea" | "ventilacao" | "sedoanalgesia";
  readonly nome: string;
  readonly disponivel: false;
  readonly cuidadosAssociados: readonly string[];
  readonly campos: readonly string[];
};

export const MODULOS_CHAMAVEIS: readonly ModuloChamavel[] = [
  {
    id: "via_aerea",
    nome: "Via aérea",
    disponivel: false,
    cuidadosAssociados: ["ventilacao", "sedoanalgesia"],
    campos: ["va_avancada", "va_tipo", "va_hora", "va_quem", "va_sedacao", "va_ventilacao"],
  },
  { id: "ventilacao", nome: "Ventilação mecânica", disponivel: false, cuidadosAssociados: [], campos: ["va_ventilacao"] },
  { id: "sedoanalgesia", nome: "Analgesia e sedação", disponivel: false, cuidadosAssociados: [], campos: ["va_sedacao"] },
];

export function moduloChamavel(id: string): ModuloChamavel | undefined {
  return MODULOS_CHAMAVEIS.find((m) => m.id === id);
}
