# Segurança da reperfusão — definições operacionais que a fonte-mãe ⛔ NÃO fecha

Este arquivo existe pelo mesmo motivo de `imagem-definicoes-operacionais.md`: a
fonte-mãe **usa** um critério e ⛔ **não o define**. Enquanto o slot estiver
aberto, ⛔ nada que ele sustentaria pode aparecer na tela (§0.5).

---

## F-30 · Marco temporal da exposição recente a DOAC (<48 h)

**Estado:** 🔴 **ABERTO** — ⛔ **sem fonte candidata**.

**Aberto em 2026-08-30**, por decisão do autor, ao modelar a Superfície D.

### O que a fonte diz, e o que ela ⛔ não diz

F-10 transcreve, da Table 8 (p. e365):

> *"In patients with disabling symptoms and **recent DOAC exposure (<48 hours)**
> who are within the window for alteplase/tenecteplase, the safety of IV
> thrombolysis is unknown."*

E, entre os fatores da análise individual:

> *"Benefit vs risk assessments should include considering the **timing of the
> last DOAC administration**…"*

⚠️⚠️ **A fonte ⛔ NÃO declara contra qual instante os 48 horas são medidos.** Ela
⛔ não diz *"before symptom onset"*, ⛔ não diz *"before thrombolysis"*, ⛔ não diz
*"from arrival"*. O intervalo aparece como **qualificador da exposição**, e o
horário da última dose aparece como **fator a considerar** — ⛔ nunca como conta
que alguém deva fazer.

### ⛔ O que ⛔ NÃO pode ser feito enquanto este slot estiver aberto

| ⛔ proibido | por quê |
|---|---|
| calcular o intervalo automaticamente | ⛔ não há marco declarado contra o qual calcular |
| comparar com **agora** | inventaria um relógio que a fonte ⛔ não nomeia |
| comparar com a **chegada** | idem — e **E-21** separa t₀ operacional de relógio clínico |
| comparar com o **último-visto-bem** | idem |
| comparar com o **início dos sintomas** | idem |
| comparar com o **reconhecimento** | idem |
| transformar horário conhecido em *"<48 h confirmado"* | **E-52** — classificação fabricada sobre dado real |

### O que o app faz enquanto isso

- **registra** `doac_ultima_dose` (data + hora, com o controle de data já corrigido);
- **⛔ não classifica** a exposição como `<48 h` ⛔ nem como `≥48 h`;
- deriva **situação individualizada** + **informação insuficiente**, que é
  literalmente o que a fonte declara: *"the safety … **is unknown**"*,
  *"**may be considered** after a thorough benefit vs risk analysis on an
  individual basis"*, *"**Definitive clinical trials are needed**"*;
- **declara na tela** que o marco temporal ⛔ não está definido na fonte.

### ⚠️ O que fecharia este slot

Uma fonte que declare explicitamente o instante de referência — por exemplo, uma
diretriz ou um consenso que escreva *"within 48 hours **of the last dose to the
time of thrombolysis**"*. ⛔ Enquanto ⛔ nenhuma disser isso, o intervalo permanece
**⛔ não automatizável**, e o horário permanece **fato útil sem classificação**.
