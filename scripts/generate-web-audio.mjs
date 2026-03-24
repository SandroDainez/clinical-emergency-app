import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const outputDir = join(process.cwd(), "assets/audio/tts");

const cues = [
  ["reconhecimento_inicial", "Verifique responsividade. Chame ajuda. Acione o código de emergência. Solicite desfibrilador."],
  ["checar_respiracao_pulso", "Cheque respiração e pulso simultaneamente por até dez segundos."],
  ["monitorizar_com_pulso", "Pulso presente. Fluxo de parada não iniciado. Continue monitorização e reavaliações."],
  ["inicio", "Iniciar reanimação de alta qualidade agora. Compressões de cem a cento e vinte por minuto. Profundidade de cinco a seis centímetros. Sem via aérea avançada, usar trinta compressões para duas ventilações."],
  ["preparar_monitorizacao", "Oxigênio a cem por cento. Ventilar com bolsa válvula máscara nas pausas do trinta para dois se não houver via aérea avançada. Se houver via aérea avançada, manter compressões contínuas e uma ventilação a cada seis segundos. Conectar desfibrilador ou monitor para avaliar o ritmo."],
  ["avaliar_ritmo", "Após conectar o monitor ou desfibrilador, qual é o ritmo?"],
  ["tipo_desfibrilador", "Tipo de desfibrilador?"],
  ["choque_bi_1", "Ritmo chocável. Carregar desfibrilador bifásico em duzentos joules, ou máxima carga disponível, e aplicar o choque agora."],
  ["choque_mono_1", "Ritmo chocável. Carregar desfibrilador monofásico em trezentos e sessenta joules e aplicar o choque agora."],
  ["rcp_1", "Retomar reanimação imediatamente por dois minutos. Se não houver via aérea avançada, manter trinta compressões para duas ventilações e ventilar nas pausas. Se houver via aérea avançada, manter compressões contínuas e uma ventilação a cada seis segundos."],
  ["avaliar_ritmo_2", "Após dois minutos, reavaliar ritmo. Se houver ritmo organizado, verificar pulso. Se permanecer ritmo chocável, aplicar novo choque."],
  ["choque_2", "Aplicar o choque agora. Monofásico ou bifásico com carga máxima."],
  ["rcp_2", "Retomar reanimação por dois minutos e administrar epinefrina um miligrama agora. Se não houver via aérea avançada, manter trinta compressões para duas ventilações e ventilar nas pausas. Se houver via aérea avançada, manter compressões contínuas e uma ventilação a cada seis segundos."],
  ["avaliar_ritmo_3", "Após nova reavaliação, verificar ritmo e pulso se houver ritmo organizado. Se persistir fibrilação ventricular ou taquicardia ventricular sem pulso, aplicar novo choque."],
  ["choque_3", "Aplicar o choque agora. Monofásico ou bifásico com carga máxima."],
  ["rcp_3", "Retomar reanimação por dois minutos e administrar antiarrítmico agora. Amiodarona trezentos miligramas. Ou lidocaína de um a um vírgula cinco miligramas por quilo. Se não houver via aérea avançada, manter trinta compressões para duas ventilações e ventilar nas pausas. Se houver via aérea avançada, manter compressões contínuas e uma ventilação a cada seis segundos."],
  ["nao_chocavel_epinefrina", "Ritmo não chocável. Administrar epinefrina um miligrama o mais rápido possível. Retomar reanimação por dois minutos."],
  ["nao_chocavel_ciclo", "Continuar reanimação por dois minutos no ritmo não chocável. Se não houver via aérea avançada, manter trinta compressões para duas ventilações e ventilar nas pausas. Se houver via aérea avançada, manter compressões contínuas e uma ventilação a cada seis segundos."],
  ["avaliar_ritmo_nao_chocavel", "Após dois minutos no ritmo não chocável, reavaliar o ritmo. Se houver ritmo organizado, verificar pulso. Se o ritmo se tornar chocável, migrar para desfibrilação."],
  ["nao_chocavel_hs_ts", "Persistindo ritmo não chocável. Revisar causas reversíveis agora. Os cinco H e cinco T."],
  ["pos_rosc", "Retorno da circulação espontânea identificado. Confirmar presença de pulso. Iniciar cuidados pós parada agora."],
  ["pos_rosc_via_aerea", "Ajustar via aérea, oxigenação e ventilação pós parada."],
  ["pos_rosc_hemodinamica", "Avaliar hemodinâmica pós parada."],
  ["pos_rosc_ecg", "Realizar eletrocardiograma de doze derivações. Investigar a causa da parada."],
  ["pos_rosc_neurologico", "Avaliar estado neurológico e controle de temperatura."],
  ["pos_rosc_destino", "Definir destino do paciente após retorno da circulação."],
  ["pos_rosc_concluido", "Cuidados pós R O S C iniciados"],
  ["encerrado", "Atendimento encerrado conforme decisão médica"],
  ["reminder_reavaliar_ritmo", "Reavaliar ritmo"],
  ["reminder_epinefrina", "Administrar epinefrina 1 mg IV IO"],
  [
    "reminder_antiarritmico_1",
    "Considerar antiarrítmico: amiodarona 300 mg IV IO ou lidocaína 1 a 1,5 mg por kg IV IO",
  ],
  [
    "reminder_antiarritmico_2",
    "Se persistir ritmo chocável, considerar nova dose de antiarrítmico: amiodarona 150 mg IV IO ou lidocaína 0,5 a 0,75 mg por kg IV IO",
  ],
];

mkdirSync(outputDir, { recursive: true });

for (const [key, text] of cues) {
  const outputFile = join(outputDir, `${key}.wav`);

  rmSync(outputFile, { force: true });
  execFileSync("espeak-ng", ["-v", "pt-br", "-s", "155", "-w", outputFile, text], {
    stdio: "inherit",
  });
}

console.log(`Generated ${cues.length} audio files in ${outputDir}`);
