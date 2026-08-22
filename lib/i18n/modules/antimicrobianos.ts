/**
 * ES do CATÁLOGO DE ANTIMICROBIANOS.
 *
 * ⚠️ O CATÁLOGO AINDA NÃO RENDERIZA — ele é dado, e a tela continua lendo o
 * motor. As chaves entram junto com o dado, e não depois, pela mesma razão que
 * todo o resto: tradução que fica para depois é a que sai em português na tela de
 * quem escolheu espanhol, e ninguém percebe até um colega reclamar.
 */
export const ES_ANTIMICROBIANOS: Record<string, string> = {
  "Beta-lactâmico + inibidor de beta-lactamase": "Betalactámico + inhibidor de betalactamasa",
  "Glicopeptídeo": "Glucopéptido",
  "Carbapenêmico": "Carbapenémico",
  "25–30 mg/kg de ataque (peso real, máx 3 g)": "25–30 mg/kg de carga (peso real, máx 3 g)",
  "dose única de ataque": "dosis única de carga",
  "48/48h ou por nível": "48/48h o por nivel",
  "12/12h + 0,75 g pós-diálise": "12/12h + 0,75 g posdiálisis",
  "após a sessão": "tras la sesión",
  "1 g (MDR: 2 g infusão 3 h; meningite: 2 g)": "1 g (MDR: 2 g infusión 3 h; meningitis: 2 g)",
  "1 g (MDR/meningite: 2 g)": "1 g (MDR/meningitis: 2 g)",
  "500 mg–1 g (MDR/meningite: 1 g)": "500 mg–1 g (MDR/meningitis: 1 g)",
  "500 mg (MDR/meningite: 1 g)": "500 mg (MDR/meningitis: 1 g)",
  "Alvo AUC₂₄/MIC 400–600 mg·h/L (MIC 1: AUC mín 400). Vale 15–20 mcg/mL se AUC indisponível.":
    "Objetivo AUC₂₄/MIC 400–600 mg·h/L (MIC 1: AUC mín 400). Valle 15–20 mcg/mL si AUC no disponible.",
  "Diluir 1 g em ≥ 250 mL; infundir ≥ 60 min (máx 10 mg/min) — evitar síndrome do homem vermelho.":
    "Diluir 1 g en ≥ 250 mL; infundir ≥ 60 min (máx 10 mg/min) — evitar síndrome del hombre rojo.",
  "Dosar nível pré-diálise.": "Medir nivel prediálisis.",
  "MDR: 2 g em 100 mL SF → infundir em 3 h.": "MDR: 2 g en 100 mL SF → infundir en 3 h.",
  "Pseudomonas: 4,5 g em 250 mL SF → infundir em 4 h (maximiza tempo > MIC).":
    "Pseudomonas: 4,5 g en 250 mL SF → infundir en 4 h (maximiza tiempo > MIC).",
  "hemodiálise intermitente": "hemodiálisis intermitente",
  "CVVHD/CVVHDF": "CVVHD/CVVHDF",
  "SLED": "SLED",
  "⚠️ SEM DADOS NO REPOSITÓRIO para esta modalidade. Isto é ausência DECLARADA, não \"não precisa ajustar\" — e aparece na tela como tal.":
    "⚠️ SIN DATOS EN EL REPOSITORIO para esta modalidad. Es ausencia DECLARADA, no \"no necesita ajuste\" — y aparece en la pantalla como tal.",
  "Abrir a bula/prescribing information do fármaco, seção de ajuste renal, e declarar a fonte DESTA faixa — com seção e ano. ⚠️ Referência terciária (UpToDate, Sanford, Micromedex) entra como `pratica_aceita` com nome do produto e data de consulta, NUNCA como recomendação formal.":
    "Abrir el prospecto/prescribing information del fármaco, sección de ajuste renal, y declarar la fuente DE ESTA franja — con sección y año. ⚠️ Referencia terciaria (UpToDate, Sanford, Micromedex) entra como `pratica_aceita` con nombre del producto y fecha de consulta, NUNCA como recomendación formal.",
  "⚠️ SEM FONTE NO NÍVEL DA FAIXA — a ferramenta declarava «ASHP/IDSA/SIDP 2020 (vanco AUC) · UpToDate 2024 / SBI 2022» para os dez cortes juntos":
    "⚠️ SIN FUENTE EN EL NIVEL DE LA FRANJA — la herramienta declaraba «ASHP/IDSA/SIDP 2020 (vanco AUC) · UpToDate 2024 / SBI 2022» para los diez cortes juntos",
};
