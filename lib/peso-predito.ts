/**
 * PESO PREDITO E NORMALIZAÇÃO DE SEXO — fórmula fisiológica, não conteúdo de
 * módulo.
 *
 * ── ⚠️ POR QUE ISTO MUDOU DE CASA (2026-08-27) ─────────────────────────────
 *
 * Estas duas funções viviam dentro de `ventilation-decision-tree.ts`, e a
 * Calculadora Clínica — que é área preservada — importava de lá. Quando a
 * arquitetura clínica antiga foi removida, esse import teria levado a
 * calculadora junto.
 *
 * A mudança é semântica, não um conserto de import: peso predito por altura e
 * sexo é FÓRMULA, não protocolo. Ela não pertencia à árvore de ventilação — ela
 * estava lá por acidente de origem, porque foi ali que precisou existir primeiro.
 * A normalização de sexo idem: é regra de leitura de um campo que CRUZA os
 * módulos pelo contexto do paciente.
 *
 * ⚠️ CONTINUA SENDO A ÚNICA IMPLEMENTAÇÃO. O histórico abaixo explica por que
 * isso importa — duas versões davam PBW diferente para o mesmo paciente.
 */

/**
 * Sexo, normalizado — ou `null` quando não dá para afirmar.
 *
 * ── POR QUE ISTO NÃO TEM DEFAULT ─────────────────────────────────────────────
 *
 * Existiam DUAS implementações de peso predito neste app, e elas discordavam
 * exatamente onde ninguém olha: no sexo AUSENTE.
 *
 *   árvore/calculadoras:  `sexo === "feminino" ? 45,5 : 50`   → assumia HOMEM
 *   ventilation-engine:   `/^m/i.test(sex)`                    → assumia MULHER
 *
 * Mesmo paciente, mesmo app, PBW diferente: a 175 cm, 70,6 × 66,1 kg — Vt de
 * 423 × 396 mL. Nenhuma das duas avisava; as duas devolviam um número.
 *
 * E o `/^m/i` ainda classificava **"Mulher" como masculino**, porque testava a
 * INICIAL. Não era risco teórico: o campo é um `TextInput` de valor livre, com
 * os presets como botões de conveniência abaixo.
 *
 * Sexo é categoria, não prefixo, e sexo ausente é DESCONHECIDO — não é homem
 * nem mulher por omissão. Quem chama trata o `null`; ninguém chuta.
 */
export type SexoNormalizado = "masculino" | "feminino";

export function normalizarSexo(sexo: string | undefined | null): SexoNormalizado | null {
  const s = String(sexo ?? "").trim().toLowerCase();
  if (!s) return null;
  if (s === "masculino" || s === "homem") return "masculino";
  if (s === "feminino" || s === "mulher") return "feminino";
  // LETRA SOLTA É RECUSADA — e não por preciosismo.
  //
  // O EAP gravava `"m"` para MULHER (`sexo === "h" ? 50 : 45,5`); o motor de VM
  // lia `/^m/i` como MASCULINO. A mesma letra, sexos opostos, no mesmo app. E o
  // valor CRUZA os módulos: `handleSetValue` guarda `sexo` no contexto do
  // paciente e o próximo módulo pré-preenche o campo com ele — então uma
  // mulher registrada no EAP virava homem na Ventilação, com Vt 27 mL maior
  // em SARA.
  //
  // Aceitar "m" seria escolher um dos dois significados e errar o outro em
  // silêncio. Recusar faz o app perguntar de novo, uma vez, e acertar.
  return null;
}

/**
 * Peso predito (PBW) — ARDSNet, NEJM 2000;342:1301-8.
 *
 *   homem  50   + 0,91 × (altura_cm − 152,4)
 *   mulher 45,5 + 0,91 × (altura_cm − 152,4)
 *
 * Devolve `null` quando o sexo não é determinável ou a altura é implausível.
 * ESTA É A ÚNICA implementação do app — `npm run test:vm` recusa o build se
 * aparecer uma segunda.
 */
export function predictedBodyWeight(
  alturaCm: number,
  sexo: string | undefined | null
): number | null {
  const s = normalizarSexo(sexo);
  if (!s) return null;
  if (!Number.isFinite(alturaCm) || alturaCm < 120 || alturaCm > 230) return null;
  const base = s === "feminino" ? 45.5 : 50;
  return base + 0.91 * (alturaCm - 152.4);
}
