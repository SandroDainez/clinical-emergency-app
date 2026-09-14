/**
 * VIA AÉREA COMO CONDUTA EXTERNA — decisão do autor, 2026-09-13 (13ª rodada, opção A).
 *
 * ⚠️ ESTADO, ⛔ E ⛔ NÃO CONDUTA CLÍNICA: o que a equipe FEZ fora do app, registrado por ela.
 * ⛔ Sem fármaco, ⛔ sem dose, ⛔ sem parâmetro ventilatório. O módulo de via aérea foi
 * removido em 2026-08-27 por falta de validação ⛔ e ⛔ não foi restaurado.
 *
 * ⚠️ O que o AVC precisa hoje: saber que o paciente tem via aérea definitiva, quando, ⛔ e
 * que o exame neurológico anterior à sedação fica preservado.
 */
import type { Campo } from "./campo";
import { comCasa, SIM_NAO_NAO_SEI } from "./campo";

export const TIPOS_DE_VIA_AEREA = [
  "Intubação orotraqueal",
  "Dispositivo supraglótico",
  "Via aérea cirúrgica",
  "Outra",
  "Não sei",
] as const;

const REGISTRO = { natureza: "administrativo", fonte: "administrativo", bloqueiaTerapia: false } as const;

export const GRUPO_DA_VIA_AEREA_EXTERNA = comCasa("estabilizacao", [
  {
    id: "via-aerea-externa",
    titulo: "Via aérea · conduta externa",
    nota: "Registro do que a equipe fez fora do app. Sem fármaco, dose ou parâmetro ventilatório.",
    campos: [
      /** ⚠️ AC-76 (14ª rodada): "avançada", ⛔ "definitiva" — o tipo define se é definitiva. */
      { id: "va_avancada", rotulo: "Via aérea avançada instalada", tipo: "escolha", temporalidade: "estavel", opcoes: SIM_NAO_NAO_SEI, ...REGISTRO },
      { id: "va_tipo", rotulo: "Tipo", tipo: "escolha", temporalidade: "estavel", opcoes: TIPOS_DE_VIA_AEREA, ...REGISTRO },
      { id: "va_hora", rotulo: "Horário observado", tipo: "hora", temporalidade: "estavel", aceitaDesconhecido: true, ...REGISTRO },
      { id: "va_quem", rotulo: "Quem realizou", tipo: "texto", temporalidade: "estavel", ...REGISTRO },
      { id: "va_sedacao", rotulo: "Sedação em curso", tipo: "escolha", temporalidade: "estavel", opcoes: SIM_NAO_NAO_SEI, ...REGISTRO },
      { id: "va_ventilacao", rotulo: "Ventilação mecânica", tipo: "escolha", temporalidade: "estavel", opcoes: SIM_NAO_NAO_SEI, ...REGISTRO },
    ],
  },
]);

export const CAMPOS_DA_VIA_AEREA_EXTERNA: readonly Campo[] = GRUPO_DA_VIA_AEREA_EXTERNA.flatMap((g) => g.campos);
