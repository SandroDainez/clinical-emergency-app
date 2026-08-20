# Roteiro de Gravação dos Áudios — ACLS / PCR Adulto

**Como usar:** gere um arquivo `.mp3` para cada linha abaixo (voz feminina, pt-BR, tom firme e
claro de coordenador de reanimação). O **nome do arquivo deve ser exatamente** o da coluna
"Arquivo". Coloque os arquivos em `assets/audio/final-acls/` (substituindo os existentes).

Os textos estão alinhados às **Diretrizes AHA 2025 (RCP e ACE)**. Não alterar doses nem condutas.

| # | Arquivo | Texto a gravar | Quando toca no fluxo |
|---|---------|----------------|----------------------|
| 1 | `initial_recognition.mp3` | Verificar responsividade. Chamar ajuda. Acionar emergência e trazer o desfibrilador. | Reconhecimento inicial da PCR |
| 2 | `assess_patient.mp3` | Checar pulso e respiração ao mesmo tempo. No máximo dez segundos. | Checagem de pulso/respiração |
| 3 | `pulse_present_monitoring.mp3` | Pulso presente. Monitorar e reavaliar. | Pulso presente — sem PCR |
| 4 | `start_cpr.mp3` | Iniciar RCP de alta qualidade. Cem a cento e vinte compressões por minuto. Cinco a seis centímetros de profundidade. Permitir o retorno total do tórax. Trinta compressões para duas ventilações. Minimizar as interrupções. | Início da RCP |
| 5 | `resume_cpr.mp3` | Retomar a RCP imediatamente. Dois minutos. Não verificar o pulso agora. | Após choque e após cada dose; ciclos de RCP |

> ⚠️ **A GRAVAR — CUE NOVA, PENDENTE (D-63, 2026-08-20).** A AHA 2025 mudou o acesso
> vascular e o áudio ficou na redação antiga ("IV ou IO", sem preferência). O texto a
> gravar, na mesma voz das demais, é:
>
> **`vascular_access.mp3`** — *"Acesso: tentar veia primeiro. Se falhar, intraósseo."*
>
> Curto de propósito: quem ouve está com as mãos no tórax e precisa da ORDEM, não da
> graduação — classe e nível ficam na tela. ⚠️ **Enquanto o MP3 não existir, a cue NÃO
> entra em `speech-map.ts` nem no manifesto**: mudar o texto declarado sem regravar faria
> o app anunciar um comando e tocar outro, que é exatamente o defeito que
> `valida-audio-vs-texto` existe para pegar.
| 6 | `start_cpr_nonshockable.mp3` | Ritmo não chocável. Iniciar RCP e administrar epinefrina um miligrama, o mais rápido possível. | AESP / Assistolia — entrada |
| 7 | `prepare_rhythm.mp3` | Pausar a RCP para avaliar o ritmo. Pausa mínima, menos de dez segundos. | Antes de cada checagem de ritmo |
| 8 | `prepare_shock.mp3` | Carregar o desfibrilador durante as compressões. Afastar todos. | Pré-choque (pre-cue) |
| 9 | `prepare_epinephrine.mp3` | Preparar epinefrina, um miligrama. | Pré-epinefrina (pre-cue) |
| 10 | `analyze_rhythm.mp3` | Qual é o ritmo? Chocável, não chocável ou ROSC? | Decisão de ritmo |
| 11 | `defibrillator_type.mp3` | Manter a RCP. O desfibrilador é bifásico ou monofásico? | Seleção do desfibrilador |
| 12 | `shock_biphasic_initial.mp3` | Ritmo chocável. Bifásico: dose do fabricante, geralmente cento e vinte a duzentos joules. Se desconhecida, usar a carga máxima. Afastar todos. Aplicar o choque. | 1º choque bifásico |
| 13 | `shock_monophasic_initial.mp3` | Ritmo chocável. Monofásico, trezentos e sessenta joules. Afastar todos. Aplicar o choque. | 1º choque monofásico |
| 14 | `shock_escalated.mp3` | Novo choque. Mesma carga ou maior. Afastar todos. Aplicar o choque. | 2º e 3º choques |
| 15 | `epinephrine_now.mp3` | Epinefrina, um miligrama, intravenosa ou intraóssea. Agora. | Epinefrina indicada |
| 16 | `epinephrine_repeat.mp3` | Repetir epinefrina, um miligrama. Manter a cada três a cinco minutos. | Repetição de epinefrina |
| 17 | `antiarrhythmic_now.mp3` | Antiarrítmico agora. Amiodarona, trezentos miligramas. Ou lidocaína, um a um vírgula cinco miligrama por quilo. | 1ª dose de antiarrítmico |
| 18 | `antiarrhythmic_repeat.mp3` | Segunda dose de antiarrítmico. Amiodarona, cento e cinquenta miligramas. Ou lidocaína, meia dose. | 2ª dose de antiarrítmico |
| 19 | `consider_airway.mp3` | Via aérea avançada. Oxigênio para saturação entre noventa e noventa e oito por cento. Evitar a hiperventilação. | Pós-ROSC — via aérea |
| 20 | `review_hs_ts.mp3` | Revisar as causas reversíveis. Cinco agás e cinco tês. | Causas reversíveis (loop) |
| 21 | `confirm_rosc.mp3` | ROSC confirmado. Pulso presente. Iniciar os cuidados pós-parada imediatamente. | ROSC confirmado |
| 22 | `post_rosc_care.mp3` | Cuidados pós-parada. Monitorização contínua. | Pós-ROSC — geral/destino |
| 23 | `post_rosc_hemodynamics.mp3` | Hemodinâmica. Manter a PAM acima de sessenta e cinco. Volume e vasopressores se necessário. | Pós-ROSC — hemodinâmica |
| 24 | `post_rosc_ecg.mp3` | ECG de doze derivações. Supra de S T indica cateterismo de urgência. Considerar tomografia e ultrassom. | Pós-ROSC — ECG/imagem |
| 25 | `post_rosc_neuro.mp3` | Avaliação neurológica. Se não seguir comandos, controlar a temperatura entre trinta e dois e trinta e sete e meio graus por pelo menos trinta e seis horas. | Pós-ROSC — neurologia |
| 26 | `end_protocol.mp3` | Atendimento encerrado. Documentar as condutas e o desfecho. | Encerramento |

## Observações para a gravação

- **"S T"** (no item 24) deve ser lido como as letras separadas: "ésse tê" (supra de ST).
- **"agás e tês"** (item 20) refere-se aos 5 H e 5 T das causas reversíveis.
- Mantenha frases curtas e pausadas — o áudio toca em momento de estresse máximo.
- Os arquivos devem ficar em `assets/audio/final-acls/` nos **dois** projetos
  (`acls-pcr-standalone` e `clinical-emergency-app`).

Depois de colocar os arquivos, é só me avisar que eu faço o build e o deploy.
