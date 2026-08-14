/**
 * Faixa de prazo persistente (D-16) — rótulos dos cronômetros de motor
 * (Anafilaxia, Ventilação, EAP, Sepse, PCR) e os dois avisos da árvore de
 * Convulsões (semMarco / subestimação).
 */
export const ES_CRONOMETRO_PERSISTENTE: Record<string, string> = {
  "Próxima dose de adrenalina IM": "Próxima dosis de adrenalina IM",
  "Gasometria de controle": "Gasometría de control",
  "Reavaliar titulação de nitroglicerina": "Reevaluar titulación de nitroglicerina",
  "Antibiótico do pacote de 1ª hora": "Antibiótico del paquete de la 1ª hora",
  "Próximo ciclo de RCP / checagem de ritmo": "Próximo ciclo de RCP / control de ritmo",
  "Sem marco de tempo registrado — o relógio não pode contar.":
    "Sin marca de tiempo registrada — el reloj no puede contar.",
  "⚠️ Início desconhecido — este número SUBESTIMA o tempo real. Na dúvida, trate pela fase mais avançada. Procure uma âncora: testemunha, horário da chamada, último momento visto bem.":
    "⚠️ Inicio desconocido — este número SUBESTIMA el tiempo real. Ante la duda, trate según la fase más avanzada. Busque un ancla: testigo, hora de la llamada, último momento visto bien.",
};
