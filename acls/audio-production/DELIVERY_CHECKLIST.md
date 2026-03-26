# Delivery Checklist

## Antes de gravar

- usar uma única voz para todas as linhas
- manter o mesmo preset de geração
- não variar emoção entre arquivos
- priorizar dicção clara
- evitar leitura corrida em doses e cargas

## Ao exportar

- formato: `mp3`
- um arquivo por linha
- sem prefixos extras
- sem sufixos de versão no nome final
- nomes exatamente iguais ao CSV

## Lista final esperada

- `assess_patient.mp3`
- `start_cpr.mp3`
- `start_cpr_nonshockable.mp3`
- `prepare_rhythm.mp3`
- `analyze_rhythm.mp3`
- `defibrillator_type.mp3`
- `shock_biphasic_initial.mp3`
- `shock_monophasic_initial.mp3`
- `prepare_shock.mp3`
- `shock_escalated.mp3`
- `epinephrine_now.mp3`
- `epinephrine_repeat.mp3`
- `antiarrhythmic_now.mp3`
- `antiarrhythmic_repeat.mp3`
- `consider_airway.mp3`
- `review_hs_ts.mp3`
- `confirm_rosc.mp3`
- `post_rosc_care.mp3`
- `post_rosc_hemodynamics.mp3`
- `post_rosc_ecg.mp3`
- `post_rosc_neuro.mp3`
- `end_protocol.mp3`

## Depois de receber o lote

1. substituir o catálogo legado por esses arquivos
2. apontar `WEB_AUDIO_CUES` só para as chaves canônicas
3. remover aliases antigos do runtime
4. revalidar sincronização de fala no ACLS
