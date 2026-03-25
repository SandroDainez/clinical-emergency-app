const ACLS_AUDIO_SCRIPT = {
  reconhecimento_inicial:
    "Verifique responsividade, chame ajuda e acione o código de emergência. Solicite desfibrilador",
  checar_respiracao_pulso:
    "Após checar respiração e pulso por até dez segundos, qual é a situação?",
  monitorizar_com_pulso:
    "Pulso presente. Fluxo de parada não iniciado. Continue monitorização e reavaliações",
  inicio:
    "Iniciar reanimação de alta qualidade agora. Compressões de cem a cento e vinte por minuto. Profundidade de cinco a seis centímetros. Oxigênio a cem por cento, ventilar com bolsa válvula máscara e conectar monitor ou desfibrilador o mais rápido possível para avaliar o ritmo",
  preparar_monitorizacao:
    "Oxigênio a cem por cento. Ventilar com bolsa válvula máscara nas pausas do trinta para dois se não houver via aérea avançada. Se houver via aérea avançada, manter compressões contínuas e uma ventilação a cada seis segundos. Conectar desfibrilador ou monitor para avaliar o ritmo",
  avaliar_ritmo:
    "Após conectar o monitor ou desfibrilador, qual é o ritmo? Chocável, não chocável, ou retorno da circulação espontânea?",
  tipo_desfibrilador: "Qual é o tipo de desfibrilador?",
  choque_bi_1:
    "Ritmo chocável. Carregar desfibrilador bifásico em duzentos joules, ou máxima carga disponível, e aplicar o choque agora",
  choque_mono_1:
    "Ritmo chocável. Carregar desfibrilador monofásico em 360 joules e aplicar o choque agora",
  choque_2_bifasico:
    "Aplicar o choque agora. Bifásico, usar carga equivalente ou maior que a anterior",
  choque_2_monofasico:
    "Aplicar o choque agora. Monofásico, trezentos e sessenta joules",
  choque_3_bifasico:
    "Aplicar o choque agora. Bifásico, usar carga equivalente ou maior e considerar escalonamento",
  choque_3_monofasico:
    "Aplicar o choque agora. Monofásico, trezentos e sessenta joules",
  rcp_1:
    "Retomar reanimação imediatamente por dois minutos. Se não houver via aérea avançada, manter trinta compressões para duas ventilações e ventilar nas pausas. Se houver via aérea avançada, manter compressões contínuas e uma ventilação a cada seis segundos",
  avaliar_ritmo_2:
    "Após dois minutos, reavaliar ritmo. Se houver ritmo organizado, verificar pulso. Se permanecer ritmo chocável, aplicar novo choque",
  rcp_2:
    "Retomar reanimação por dois minutos. Administrar epinefrina um miligrama agora e repetir a cada três a cinco minutos. Considerar via aérea avançada e capnografia",
  avaliar_ritmo_3:
    "Após nova reavaliação, verificar ritmo e pulso se houver ritmo organizado. Se persistir fibrilação ventricular ou taquicardia ventricular sem pulso, aplicar novo choque. Se o ritmo se tornar não chocável, seguir ramo não chocável com epinefrina seriada",
  rcp_3:
    "Retomar reanimação por dois minutos. Se persistir fibrilação ventricular ou taquicardia ventricular sem pulso refratária, administrar antiarrítmico agora. Amiodarona trezentos miligramas ou lidocaína de um a um vírgula cinco miligramas por quilo. Manter epinefrina a cada três a cinco minutos e tratar causas reversíveis",
  nao_chocavel_epinefrina:
    "Ritmo não chocável. Administrar epinefrina um miligrama o mais rápido possível e continuar reanimação por dois minutos a partir de agora",
  nao_chocavel_ciclo:
    "Continuar reanimação por dois minutos no ritmo não chocável. Repetir epinefrina a cada três a cinco minutos. Considerar via aérea avançada e capnografia",
  avaliar_ritmo_nao_chocavel:
    "Após dois minutos no ritmo não chocável, reavaliar ritmo. Se o ritmo se tornar chocável, desfibrilar. Se permanecer não chocável, continuar R C P, epinefrina seriada e busca de causas reversíveis",
  nao_chocavel_hs_ts:
    "Persistindo ritmo não chocável. Continuar reanimação, manter epinefrina a cada três a cinco minutos e revisar causas reversíveis agora. Os cinco H e cinco T",
  pos_rosc:
    "Retorno da circulação espontânea identificado. Confirmar presença de pulso. Iniciar cuidados pós parada agora",
  pos_rosc_via_aerea:
    "Ajustar via aérea, oxigenação e ventilação pós parada. Se ainda não houver intubação, verificar necessidade",
  pos_rosc_hemodinamica:
    "Avaliar hemodinâmica pós parada. Ajustar fluidos e vasoativos conforme necessário para manter pressão arterial média de pelo menos sessenta e cinco milímetros de mercúrio",
  pos_rosc_ecg:
    "Realizar eletrocardiograma de doze derivações e investigar a causa da parada",
  pos_rosc_neurologico: "Avaliar estado neurológico e controle de temperatura",
  pos_rosc_destino:
    "Definir destino do paciente após retorno da circulação. Encaminhar para unidade com suporte pós parada, idealmente unidade de terapia intensiva",
  pos_rosc_concluido:
    "Cuidados pós retorno do ritmo espontâneo iniciados. Manter monitorização contínua e reavaliar a causa da parada",
  encerrado: "Atendimento encerrado conforme decisão médica",
  reminder_reavaliar_ritmo: "Reavaliar ritmo",
  reminder_epinefrina: "Administrar epinefrina 1 mg IV IO",
  reminder_antiarritmico_1:
    "Considerar antiarrítmico: amiodarona 300 mg IV IO ou lidocaína 1 a 1,5 mg por kg IV IO",
  reminder_antiarritmico_2:
    "Se persistir ritmo chocável, considerar nova dose de antiarrítmico: amiodarona 150 mg IV IO ou lidocaína 0,5 a 0,75 mg por kg IV IO",
} as const;

export { ACLS_AUDIO_SCRIPT };
