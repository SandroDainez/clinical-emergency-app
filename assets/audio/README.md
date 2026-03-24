## Audio Web

O web usa `cueId` estável para tocar arquivos locais em `assets/audio/tts`.

Troca de voz de alta qualidade:

1. Gere um arquivo `.wav` por `cueId` mantendo exatamente os nomes abaixo.
2. Substitua os arquivos em `assets/audio/tts`.
3. Não é necessário alterar `engine.ts`.
4. Não é necessário alterar a UI se os nomes dos arquivos forem mantidos.

Cue IDs atuais:

- `reconhecimento_inicial`
- `checar_respiracao_pulso`
- `monitorizar_com_pulso`
- `inicio`
- `preparar_monitorizacao`
- `avaliar_ritmo`
- `tipo_desfibrilador`
- `choque_bi_1`
- `choque_mono_1`
- `rcp_1`
- `avaliar_ritmo_2`
- `choque_2`
- `rcp_2`
- `avaliar_ritmo_3`
- `choque_3`
- `rcp_3`
- `nao_chocavel_epinefrina`
- `nao_chocavel_ciclo`
- `avaliar_ritmo_nao_chocavel`
- `nao_chocavel_hs_ts`
- `pos_rosc`
- `pos_rosc_via_aerea`
- `pos_rosc_hemodinamica`
- `pos_rosc_ecg`
- `pos_rosc_neurologico`
- `pos_rosc_destino`
- `pos_rosc_concluido`
- `encerrado`
- `reminder_reavaliar_ritmo`
- `reminder_epinefrina`
- `reminder_antiarritmico_1`
- `reminder_antiarritmico_2`
