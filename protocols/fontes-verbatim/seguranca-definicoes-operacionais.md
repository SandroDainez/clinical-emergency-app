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

---

## F-31 · O que torna um paciente *"not eligible for EVT"* / *"cannot receive EVT"*

**Estado:** 🔴 **ABERTO** — ⛔ **sem fonte candidata**.

**Aberto em 2026-08-31**, ao modelar a Superfície F.

### As duas expressões, verbatim

§4.6.3 **rec. 2** (COR 2a · B-R), p. e359:

> *"In patients with AIS who are **not eligible for endovascular thrombectomy**
> but have salvageable ischemic penumbra…"*

§4.6.3 **rec. 3** (COR 2b · B-R), p. e359:

> *"…presenting within 4.5 to 24 hours from symptom onset or last known well, and
> who **cannot receive EVT**…"*

### ⛔ O que a fonte ⛔ NÃO diz

⚠️⚠️ **Nenhuma das duas é definida.** Varridas as duas seções, o *Synopsis* e o
*Supportive Text*, ⛔ não há critério, ⛔ não há lista, ⛔ não há remissão.

| pergunta | resposta na fonte |
|---|---|
| é ⛔ não-elegibilidade **clínica**? | ⛔ **não declarado** |
| inclui impossibilidade **técnica**? | ⛔ **não declarado** |
| indisponibilidade **operacional** conta? | ⛔ **não** — e a fonte diz o oposto para imagem |
| **atraso de transferência** entra? | ⛔ **não declarado** |
| **ausência de centro** local entra? | ⛔ **não declarado** |

⚠️ E o próprio arquivo já registrava a lacuna: *"§4.6.3 rec. 3 pressupõe `cannot
receive EVT` — a relação entre IVT estendida e elegibilidade a EVT"* → remetido a
**F-08**. ⛔ E F-08 item 9 remete **de volta** a F-03 §12. ⚠️⚠️ **Os dois slots
apontam um para o outro, e ⛔ nenhum fecha.**

### ⚠️⚠️ Por que disponibilidade ⛔ NÃO satisfaz a pré-condição

F-03 §12 é explícito, e vale como norma do módulo:

> *"O registro é de **DISPONIBILIDADE / LOCALIZAÇÃO, nunca de contraindicação
> clínica** (§6.7, **E-18**). Ausência de CTP **⛔ não torna o paciente
> inelegível** — torna aquela via de seleção **indisponível naquele serviço**, o
> que é outra espécie de estado e pode gerar **destino** (transferência), ⛔ não
> veredito de exclusão."*

⛔ ⛔ Usar *"⛔ não há centro EVT aqui"* para satisfazer *"cannot receive EVT"*
transformaria **geografia em critério clínico** — e faria o app **recomendar
trombólise estendida** por um motivo que a diretriz ⛔ nunca escreveu.

### ⛔ O que ⛔ NÃO pode ser feito enquanto este slot estiver aberto

⛔ Satisfazer a pré-condição por: disponibilidade de centro · ausência de CTP ou
RM · distância · viabilidade de transferência · avaliação clínica de elegibilidade
a EVT · ⛔ qualquer combinação disso.

### O que o app faz enquanto isso

- avalia **todos os demais critérios** das recs. 2 e 3 normalmente;
- mantém a correspondência final em **`nao_avaliavel`**, nomeando **F-31** como a
  dívida que a trava;
- ⛔ **⛔ não bloqueia** o restante da Superfície F.

### ⚠️ O que fecharia este slot

Uma fonte que declare o que satisfaz a pré-condição — por exemplo, *"patients in
whom EVT is contraindicated"* com a lista, ⛔ ou *"patients who cannot be
transferred within X hours"*. ⛔ Enquanto ⛔ nenhuma disser, a pré-condição
permanece **⛔ não determinável**.
