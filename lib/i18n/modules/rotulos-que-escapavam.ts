/**
 * ES · OS RÓTULOS QUE A VARREDURA ⛔ NÃO VIA.
 *
 * ── ⚠️⚠️ COMO ELES APARECERAM ──────────────────────────────────────────────
 *
 * ⚠️ Em 2026-09-06 a varredura passou a tratar `tr("…")` como **evidência
 * posicional** — quem escreve `tr(x)` está declarando que `x` vai para a tela.
 * ⛔ Antes disso, um literal ⛔ sem acento ⛔ e ⛔ sem palavra da lista de pistas era
 * descartado como *"⛔ não parece português"*.
 *
 * ⛔ **45 rótulos** estavam nessa condição, ⛔ em 19 arquivos. ⚠️ *"Hora"*,
 * *"Minuto"*, *"Item"*, *"Insumos"*, *"Registrado"* — ⛔ todos ⛔ sem acento, ⛔ todos
 * na tela, ⛔ todos ⛔ sem tradução.
 *
 * ⚠️⚠️ ⛔ O QUE ⛔ ISSO ENSINA: o valor de *"0 ⛔ sem tradução"* está em ele
 * **significar** alguma coisa. ⛔ Com ponto cego, o zero dizia ⛔ apenas *"⛔ nada
 * que a heurística reconheça"*.
 *
 * ── ⚠️ AS SIGLAS QUE ⛔ NÃO MUDAM ───────────────────────────────────────────
 *
 * ⛔ `COR`, `LOE` ⛔ e `TABLE 7` ficam **idênticos**, ⛔ e a entrada existe assim
 * de propósito: ⚠️ são a nomenclatura da própria AHA/ASA, ⛔ e traduzi-los
 * (*"Clase"*, *"Nivel"*) afastaria o leitor do documento que ele vai conferir.
 * ⛔ Entrada de identidade ⛔ não é preguiça: é a **decisão registrada**.
 */
export const ES_ROTULOS_QUE_ESCAPAVAM: Readonly<Record<string, string>> = {
  /* ── ⚠️ nomenclatura da fonte — ⛔ NÃO se traduz ────────────────────────── */
  "COR": "COR",
  "LOE": "LOE",
  "TABLE 7": "TABLE 7",

  /* ── ⚠️ AVC · reperfusão ⛔ e destino ───────────────────────────────────── */
  "Slot": "Slot",
  "Insumos": "Insumos",
  "Pressupõe": "Presupone",
  "aplicáveis": "aplicables",
  "máx.": "máx.",
  "Fora por": "Fuera por",
  "janela vencida": "ventana vencida",
  "Fase atual": "Fase actual",
  "Pós-trombectomia": "Postrombectomía",
  "Adiar": "Aplazar",
  "A fonte trata separadamente": "La fuente lo trata por separado",
  "Fonte e rastreabilidade": "Fuente y trazabilidad",

  /* ── ⚠️ AVC · coleta ───────────────────────────────────────────────────── */
  "Hora": "Hora",
  "Minuto": "Minuto",
  "Item": "Ítem",
  "Falta responder": "Falta responder",
  "Registrado": "Registrado",
  "Nada pendente aqui": "Nada pendiente aquí",
  "a resolver aqui": "por resolver aquí",

  /* ── ⚠️ OVACE — ⛔ maiúsculas preservadas: são marcadores de etapa ──────── */
  "CONDUTA — FAZER AGORA": "CONDUCTA — HACER AHORA",
  "ETAPA ATUAL": "ETAPA ACTUAL",
  "EXECUTE AGORA": "EJECUTE AHORA",
  "INCENTIVE A TOSSE": "INCENTIVE LA TOS",
  "OBJETO EXPELIDO": "OBJETO EXPULSADO",
  "Objeto expelido": "Objeto expulsado",
  "Objeto expelido · reavaliar": "Objeto expulsado · reevaluar",
  "Observe continuamente": "Observe continuamente",
  "Piorou / voltou a obstruir": "Empeoró / volvió a obstruir",
  "TEMPO": "TIEMPO",
  "Tosse forte, fala e respira": "Tos fuerte, habla y respira",
  "●  PACIENTE PIOROU?": "●  ¿EL PACIENTE EMPEORÓ?",

  /* ── ⚠️ ACLS ⛔ e telas gerais ──────────────────────────────────────────── */
  "Sustentação": "Sustentación",
  "Referência": "Referencia",
  "Requer assinatura": "Requiere suscripción",
  "fontes declaradas, cobrindo": "fuentes declaradas, cubriendo",
  "Ver o ABCDE completo": "Ver el ABCDE completo",
};
