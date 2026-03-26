# ACLS Audio Unification Plan

## Objetivo
Eliminar a mistura atual de:

- MP3s legados por estado
- lembretes legados por `cueId`
- fallback TTS do navegador

e migrar o ACLS para um catálogo único, canônico e regravado do zero.

## Diagnóstico

Hoje o módulo mistura dois modelos:

1. `SPEAK` canônico por intenção clínica em `acls/speech-map.ts`
2. áudio gravado legado por `cueId` em `components/web-audio-cues.ts`

Isso cria:

- duas vozes perceptíveis
- frases diferentes para a mesma ação
- risco de fala não bater com a fase atual

## Decisão

Todos os arquivos atuais de `assets/audio/final-acls/*.mp3` devem ser tratados como legados e substituídos.

Não é recomendado reaproveitar parte do lote antigo.

## Catálogo final para regravação

Fonte de verdade: `acls/canonical-audio-manifest.ts`

Chaves canônicas para o novo lote:

- `assess_patient`
- `start_cpr`
- `prepare_rhythm`
- `analyze_rhythm`
- `prepare_shock`
- `shock`
- `prepare_epinephrine`
- `epinephrine_now`
- `antiarrhythmic_now`
- `antiarrhythmic_repeat`
- `post_rosc_care`
- `end_protocol`

## Arquivos legados a descartar

Todos os itens abaixo devem ser considerados substituíveis:

- `reconhecimento_inicial.mp3`
- `checar_respiracao_pulso.mp3`
- `monitorizar_com_pulso.mp3`
- `inicio.mp3`
- `preparar_monitorizacao.mp3`
- `avaliar_ritmo.mp3`
- `tipo_desfibrilador.mp3`
- `choque_bi_1.mp3`
- `choque_mono_1.mp3`
- `rcp_1.mp3`
- `avaliar_ritmo_2.mp3`
- `choque_2.mp3`
- `choque_2_bifasico.mp3`
- `choque_2_monofasico.mp3`
- `rcp_2.mp3`
- `avaliar_ritmo_3.mp3`
- `choque_3.mp3`
- `choque_3_bifasico.mp3`
- `choque_3_monofasico.mp3`
- `rcp_3.mp3`
- `nao_chocavel_epinefrina.mp3`
- `nao_chocavel_ciclo.mp3`
- `avaliar_ritmo_nao_chocavel.mp3`
- `nao_chocavel_hs_ts.mp3`
- `pos_rosc.mp3`
- `pos_rosc_via_aerea.mp3`
- `pos_rosc_hemodinamica.mp3`
- `pos_rosc_ecg.mp3`
- `pos_rosc_neurologico.mp3`
- `pos_rosc_destino.mp3`
- `pos_rosc_concluido.mp3`
- `encerrado.mp3`
- `reminder_reavaliar_ritmo.mp3`
- `reminder_epinefrina.mp3`
- `reminder_antiarritmico_1.mp3`
- `reminder_antiarritmico_2.mp3`

## Próxima etapa técnica

Depois da regravação:

1. mapear runtime apenas para as chaves canônicas
2. remover aliases legados de `speech-map.ts`
3. trocar `WEB_AUDIO_CUES` para o novo catálogo
4. deixar TTS apenas como fallback de segurança, não como caminho normal

## Observação

Os arquivos ainda não foram apagados do repositório nesta etapa.
Isso é intencional para não quebrar o app antes da reposição pelo lote novo.
