/**
 * Telas e motores menores — dicionário PT → ES.
 * Referências estáticas do ACLS, árvores de decisão, mensagens de erro da tela
 * de guia, eventos do motor de PCR e rótulos avulsos de interface.
 */
export const ES_TELAS_RESTANTES: Record<string, string> = {
  // ── Módulos de referência estática do ACLS ─────────────────────────────────
  "Módulo de referência estática — Bradicardia no ACLS":
    "Módulo de referencia estática — Bradicardia en el ACLS",
  "Módulo de referência estática — Farmacologia no ACLS":
    "Módulo de referencia estática — Farmacología en el ACLS",
  "Módulo de referência estática — Cuidados Pós-PCR":
    "Módulo de referencia estática — Cuidados tras el paro cardiorrespiratorio",
  "Módulo de referência estática — Causas Reversíveis (Hs e Ts)":
    "Módulo de referencia estática — Causas reversibles (H y T)",
  "Módulo de referência estática — Ritmos no ACLS":
    "Módulo de referencia estática — Ritmos en el ACLS",
  "Módulo de referência estática — Taquicardia no ACLS":
    "Módulo de referencia estática — Taquicardia en el ACLS",
  "Módulo: Intubação em sequência rápida (ISR)":
    "Módulo: intubación de secuencia rápida",
  "Este módulo é suporte à decisão. Registre condutas no prontuário conforme protocolo local.":
    "Este módulo es un apoyo a la decisión. Registre las conductas en la historia clínica según el protocolo local.",
  "Se não segue comandos após o ROSC: manter controle de temperatura por pelo menos 36 h (AHA 2025). Prevenir febre é mandatório em todos":
    "Si no obedece órdenes tras la recuperación de la circulación espontánea: mantener el control de la temperatura durante al menos 36 h (AHA 2025). Prevenir la fiebre es obligatorio en todos",

  // ── Árvores de decisão ─────────────────────────────────────────────────────
  "Após reconhecimento diagnóstico": "Tras el reconocimiento diagnóstico",
  "Após 1ª adrenalina IM": "Tras la 1.ª adrenalina IM",
  "Após 2ª adrenalina IM": "Tras la 2.ª adrenalina IM",
  "Após pacote moderado": "Tras el paquete de medidas moderado",
  "Sintomas persistentes — 2ª dose": "Síntomas persistentes — 2.ª dosis",
  "Estabilizado — observação": "Estabilizado — observación",
  "Observação com alerta bifásico": "Observación con alerta de reacción bifásica",
  "10% da dose": "el 10% de la dosis",
  "90% da dose": "el 90% de la dosis",
  "calc. pela altura": "calc. por la talla",

  // ── Motor de PCR / eventos de sessão ───────────────────────────────────────
  "Guia ativado e compressões iniciadas": "Guía activada y compresiones iniciadas",
  "Intubação orotraqueal confirmada": "Intubación orotraqueal confirmada",
  "Via aérea avançada registrada": "Vía aérea avanzada registrada",
  "Retorno da circulação espontânea confirmado":
    "Recuperación de la circulación espontánea confirmada",
  "Segunda dose de antiarrítmico sugerida":
    "Segunda dosis de antiarrítmico sugerida",
  "Encerramento conforme decisão do médico assistente":
    "Cierre según la decisión del médico tratante",
  "Orientação do sistema": "Orientación del sistema",
  "estado desconhecido": "estado desconocido",
  "sem ação": "sin acción",
  "Comando de voz aguardando confirmação": "Comando de voz a la espera de confirmación",
  "Comando de voz não executado": "Comando de voz no ejecutado",
  "Comando de voz não reconhecido": "Comando de voz no reconocido",
  "Confirmação de voz aceita": "Confirmación por voz aceptada",
  "Confirmação de voz cancelada": "Confirmación por voz cancelada",
  "Confirmação de voz expirada": "Confirmación por voz caducada",

  // ── Tela do guia (protocol-screen) ─────────────────────────────────────────
  "Avançar etapa": "Avanzar de etapa",
  "Intubação registrada": "Intubación registrada",
  "Ritmo não chocável selecionado": "Ritmo no desfibrilable seleccionado",
  "Via aérea ameaçada / necessidade de IOT":
    "Vía aérea amenazada / necesidad de intubación",
  "Pós-intubação — parametrização de ventilação mecânica":
    "Tras la intubación — configuración de la ventilación mecánica",
  "Arquivo gerado e conteúdo copiado quando suportado.":
    "Archivo generado y contenido copiado cuando es compatible.",
  "Resumo do debrief copiado para a área de transferência.":
    "Resumen del debriefing copiado al portapapeles.",
  "Impressão indisponível": "Impresión no disponible",
  "Não foi possível abrir a janela do relatório.":
    "No se pudo abrir la ventana del informe.",
  "Falha ao atualizar causa reversível": "Error al actualizar la causa reversible",
  "Falha ao atualizar item clínico": "Error al actualizar el ítem clínico",
  "Falha ao atualizar registro clínico": "Error al actualizar el registro clínico",
  "Falha ao avançar no protocolo": "Error al avanzar en la guía",
  "Falha ao retornar etapa": "Error al retroceder de etapa",
  "Falha ao executar ação auxiliar": "Error al ejecutar la acción auxiliar",
  "Falha ao registrar conduta executada": "Error al registrar la conducta ejecutada",
  "Falha ao registrar evento de sessão clínica":
    "Error al registrar el evento de la sesión clínica",

  // ── Rótulos avulsos de interface ───────────────────────────────────────────
  "Entrar na aplicação": "Entrar en la aplicación",
  "Português": "Portugués",
  "Mostrar senha": "Mostrar la contraseña",
  "Ocultar senha": "Ocultar la contraseña",
  "Ação imediata": "Acción inmediata",
  "Estabilização primeiro (ABCDE)": "Estabilización primero (ABCDE)",
  "Navegação no módulo": "Navegación en el módulo",
  "Correções eletrolíticas com calculadoras práticas e orientação de preparo.":
    "Correcciones electrolíticas con calculadoras prácticas y orientación de preparación.",

  // ── Calculadoras clínicas (rótulos antes compostos em runtime) ─────────────
  "Função renal gravemente reduzida": "Función renal gravemente reducida",
  "Redução moderada": "Reducción moderada",
  "Função preservada": "Función conservada",
  "RASS +2 a +4 — agitação": "RASS +2 a +4 — agitación",
  "RASS −1 a −2 — sedação leve": "RASS −1 a −2 — sedación ligera",
};
