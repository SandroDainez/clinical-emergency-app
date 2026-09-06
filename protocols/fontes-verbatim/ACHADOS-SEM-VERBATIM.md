# ACHADOS DE FONTE AINDA SEM VERBATIM

⚠️ **ESTE ARQUIVO NÃO É FONTE.** Ele guarda achados conferidos pelo autor em
transcrição SECUNDÁRIA, para não se perderem — e para que ninguém os use como se
fossem verbatim.

**A regra é a mesma da KDIGO:** referência bibliográfica não é fonte; texto é. O
verbatim tem de sair do **PDF do documento original**, e só então vira conteúdo de
tela, com número e grau.

---

## Consenso 2024 · crises hiperglicêmicas em adultos

**Documento:** Umpierrez et al., *Diabetes Care* 2024;47:1257–1275 —
ADA/EASD/AACE/JBDS/DTS.
**Transcrição secundária usada:** *Cleve Clin J Med* 2025;92(3):152.
**Conferido pelo autor** em 2026-08-21. **PDF original: NÃO transcrito.**

- **Diagnóstico de CAD:** glicose ≥ 200 mg/dL ou diabetes prévio ·
  β-hidroxibutirato ≥ 3,0 mmol/L ou cetonúria ≥ 2+ · **pH < 7,3, bicarbonato
  < 18 mmol/L, ou ambos**
- **Gravidade:** leve **pH > 7,25**, HCO₃ ≥ 15 · moderada **pH 7,0–7,25**, HCO₃ 10 a
  < 15 · grave **pH < 7,0**, HCO₃ < 10
- **Potássio:** adiar insulina se **K < 3,5 mmol/L** na apresentação

⚠️ **NENHUM DESTES NÚMEROS PODE ENTRAR EM TELA A PARTIR DAQUI.** Eles estão neste
arquivo para sustentar a **D-72** — o achado de que a escada de presets do `dka-hhs`
mistura corte real com enchimento e **omite o 7,3**, que é o corte diagnóstico.

⚠️ **E o módulo está com a base sem ano:** a entrada `ada_dka_hhs_2024` traz
`"referencia": "American Diabetes Association — CAD e EHH", "ano": null`. O 2024
existe só no ID.

---

## AVC HEMORRÁGICO — ✅ VERBATIM TRANSCRITO (2026-09-05)

> ✅ **LACUNA FECHADA em 2026-09-05.** O autor enviou os dois PDFs primários e eles
> foram transcritos verbatim:
> - HIC → `fontes-verbatim/aha-asa-2022-hic.md` (slots **H-01…H-15**)
> - HSA → `fontes-verbatim/aha-asa-2023-hsa.md` (slots **S-01…S-08**)
>
> Registrados como FONTE_HIC / FONTE_HSA em `avc/conteudo/fontes.ts`. O texto
> abaixo permanece como **memória histórica** de por que a lacuna existiu — ⛔ não
> é mais verdade que "nenhum PDF foi transcrito".
>
> ⚠️ **Uma correção de conteúdo que a transcrição primária impôs sobre a síntese:**
> a cerebelar é **"≥15 mL" (H-11, COR 1)**, ⛔ não ">15 mL"; e a duração de "21
> dias" do nimodipino **não é número desta guideline** (S-03) — vem do ensaio de
> 1983/bula.

**Estado (histórico):** quando este bloco foi escrito, ⛔ **NENHUM PDF estava
transcrito**. Mantido para rastrear a origem da lacuna.

**O que a medição encontrou (2026-09-05).** A Superfície C (Imagem) já resolve
as três saídas — segue isquêmico · hemorragia intracraniana · suspeita de HSA —
⛔ e duas delas **saem do módulo** (E-09). Para essas duas, a tela diz, com
honestidade:

> *"Este módulo ainda não existe neste aplicativo."*
> *"A reperfusão não é iniciada sem exclusão de hemorragia. O motivo fica
> registrado, e o atendimento continua."*

⚠️ ⛔ Não é beco silencioso — é escopo declarado, ⛔ e a declaração está certa.
⚠️ **Mas ~15% dos AVCs são hemorrágicos**, ⛔ e para esses o app reconhece o
quadro ⛔ e ⛔ não conduz nada.

### ⛔ POR QUE ⛔ NÃO FOI ESCRITO NESTA RODADA

A fonte-mãe do módulo é `aha_asa_avc_isquemico_2026` — **do isquêmico**. Para o
hemorrágico faltam DOIS documentos, ⛔ e ⛔ nenhum está em `fontes-verbatim/`:

| o que falta | documento |
|---|---|
| HIC | AHA/ASA 2022 — *Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage* |
| HSA | AHA/ASA 2023 — *Guideline for the Management of Patients With Aneurysmal Subarachnoid Hemorrhage* |

⚠️⚠️ **E-30 vale aqui inteiro:** *referência bibliográfica ⛔ não é fonte; texto
é.* Escrever alvo pressórico, nimodipino, osmoterapia ⛔ ou reversão por agente
⛔ sem o verbatim seria exatamente o que a regra proíbe — ⛔ e em conteúdo onde o
erro é hemorragia ⛔ ou isquemia.

### O CONTEÚDO QUE JÁ EXISTE, ⛔ E ONDE ELE ESTÁ

⚠️ A linhagem `emergencias-2-ui-core` (aposentada em **PD-34**) tinha os dois
ramos completos, revisados, ⛔ e com as citações no texto: HIC (controle
pressórico por faixa de PAS · INTERACT2/ATACH-2 · reversão por agente ·
osmoterapia · STICH I/II) ⛔ e HSA (Hunt-Hess · Fisher · nimodipino · oclusão do
aneurisma).

Está preservado em
`~/Documents/backups-clinical-emergency/avc-fluxo-clinico-20260905.bundle`
(branch `avc-fluxo-clinico`, nós `hic_*` ⛔ e `hsa_*`).

⚠️ ⛔ **ISSO ⛔ NÃO O TORNA USÁVEL COMO ESTÁ**: aquele conteúdo cita as diretrizes,
⛔ mas ⛔ não carrega `slot` + `localizacao` (§ e página) + `verbatim` + `cor`
(classe) + `loe`, que é o contrato do módulo novo. ⚠️ Ele é **ponto de partida
para a conferência**, ⛔ e ⛔ não conteúdo pronto para portar.

### A ORDEM, QUANDO FOR A HORA

1. transcrever o PDF da AHA/ASA 2022 (HIC) para `fontes-verbatim/`;
2. transcrever o PDF da AHA/ASA 2023 (HSA);
3. abrir os slots em `avc/conteudo/fontes.ts`, ⛔ como se fez com F-01…F-23;
4. só então as superfícies — conferindo, item a item, contra o conteúdo do
   bundle, ⛔ que serve de checklist do que ⛔ não pode faltar.
