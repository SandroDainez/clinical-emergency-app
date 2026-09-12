# F-36 · Anafilaxia geral — contrato do slot

> **Aberto em 2026-09-11**, por ordem do autor, depois do fechamento documental
> do **F-35b** (ACR/AAAAI 2025, contraste iodado).
>
> ⛔ **Nada transcrito ainda.** Este arquivo é o contrato: o que o slot precisa
> responder, por que cada item está aqui, e quais fontes são candidatas.

## Por que este slot existe

O **F-35b** é consenso **específico de contraste iodado**. Ele resolve o que é
próprio do contraste — categorias de reação, pré-medicação, troca de agente,
teste cutâneo — e **declara fora do próprio escopo** partes do tratamento.

⚠️ ⛔ **F-36 não substitui o F-35b.** Onde o F-35b fala, ele manda, porque é a
fonte específica da exposição. F-36 entra **só onde o F-35b é silente ou
declaradamente fora de escopo**.

---

# O QUE ESTE SLOT DEVE RESPONDER — e só isso

Cada item abaixo nasce de uma **lacuna medida no F-35b**, com o trecho da
fonte que a cria. ⛔ Nenhum item foi inventado.

## ⚠️ Nota de enquadramento — broncoespasmo

**Confirmado com o autor em 2026-09-11:**

- ✅ o Wang 2025 **não é omisso** sobre broncodilatador;
- ✅ ele **não operacionaliza** qual agente, qual dose e qual via;
- ➜ portanto a lacuna é de **detalhamento farmacológico**, ⛔ **e não de
  princípio terapêutico**.

⚠️ A diferença muda o que o F-36 pode fazer: ele **preenche detalhe**, ⛔ e não
**decide conduta**. O princípio — broncodilatador vem **depois** da adrenalina
e **depois** da estabilização — já está fixado pelo Wang e ⛔ não se
renegocia.

---

## 1 · Broncodilatador — agente, dose e via

**O F-35b posiciona, e não especifica.** p. 5:

> "All other therapies, including antihistamines, glucocorticoids, and
> **bronchodilators should be secondarily considered after stabilization**."

| o F-35b dá | o F-35b ⛔ não dá |
|---|---|
| que broncodilatador **existe** na conduta | **qual** |
| que vem **depois** da adrenalina e da estabilização | **dose**, **via**, **repetição** |

⚠️ A pergunta do F-36 é **estreita**: agente, dose, via. ⛔ **Não** é *"o que
fazer no broncoespasmo"* — isso o F-35b já hierarquiza, e a hierarquia dele
prevalece.

## 2 · Tratamento das reações leve e moderada

**Lacuna declarada pela própria fonte**, p. 3:

> "Treatment of mild or moderate immediate reactions and non–immune mediated
> reactions varies depending on the patient's symptoms and clinical
> circumstances. **Specific recommendations are beyond the scope of this
> document**, and potential treatment algorithms can be found in the ACR
> Contrast Manual."

⚠️ A própria fonte aponta o **ACR Contrast Manual** como destino. Isso torna o
Manual um candidato de pleno direito — ver §CANDIDATAS.

## 3 · Suporte respiratório — alvo e dispositivo

**O F-35b cobre parcialmente.** p. 6:

> "**Supplemental oxygen may be necessary for patients with respiratory
> symptoms.**"

⛔ Sem alvo de saturação, sem dispositivo, sem critério de escalonamento.

## 4 · Adrenalina intravenosa — regime no refratário

**O F-35b abre a porta e não descreve o regime.** p. 6:

> "Intramuscular epinephrine is the first-line therapy for anaphylaxis, but in
> rare cases of protracted anaphylaxis, **intravenous epinephrine infusion
> (1:10 000 concentration [1 mg/10 mL]) may be necessary**."

⛔ Sem dose de partida, sem incremento, sem teto, sem critério de entrada.

⚠️⚠️ **O app já tem número aqui, e ele precisa de fonte.**
`lib/adrenalina-ev-anafilaxia.ts` traz *"iniciar 0,1 mcg/kg/min; aumentar 0,05
mcg/kg/min a cada 3 min"*, creditado a *"ASBAI 2024 / Practice Parameter
2023"* — **sem verbatim transcrito no repositório**. O F-36 é o slot que deve
fechar essa procedência.

## 5 · Volume — qual fluido e quanto

**O F-35b manda, sem quantificar.** p. 6:

> "**Fluid resuscitation should commence immediately** in patients presenting
> with hypotension, and patient positioning should be changed to supine or
> Trendelenburg."

⛔ Sem tipo de fluido, sem volume, sem velocidade.

⚠️ Conversa com o **F-34**: cristaloide é a escolha em adulto crítico em geral
(rec. 1, conditional, moderate). ⛔ Mas a anafilaxia **não é** uma das
populações nomeadas pelo F-34, então isso é **analogia**, e não transporte.

## 6 · Reação a contraste **intra-arterial**

⛔ **Fora do escopo declarado do F-35b**, que se limitou a contraste
intravenoso.

⚠️⚠️ Isto importa ao módulo por um motivo concreto: a **trombectomia usa
contraste intra-arterial**. Um paciente de AVC pode ser exposto por essa via
**depois** de já ter recebido contraste IV na angioTC.

⚠️ É possível que **nenhuma** fonte de anafilaxia geral responda isto, porque é
questão de radiologia intervencionista. Se for o caso, vira slot próprio sob a
**R-AUSENCIA**, ⛔ e não lacuna irredutível declarada sem busca.

---

# ⛔ O QUE ESTE SLOT NÃO DECIDE

- ⛔ **categorias de gravidade** da reação a contraste — é o F-35b, Tabela 1;
- ⛔ **critérios de anafilaxia** — o F-35b já os traz, rec. 17;
- ⛔ **pré-medicação** e **troca de agente** — F-35b, recs. 2 a 16;
- ⛔ **teste cutâneo** e encaminhamento — F-35b, recs. 20 e 21;
- ⛔ **as lacunas de fluxo LF-01, LF-02 e LF-03** — continuar ou abortar a
  angioTC, seguir para trombectomia, reexpor a contraste. Nenhuma fonte de
  anafilaxia responde isso; são **integração de fontes necessária**, e mudar de
  fonte ⛔ não as move.

---

# CANDIDATAS — identificadas, ⛔ nenhuma lida

| # | documento | ano | natureza | acesso |
|---|---|---|---|---|
| **1** | Golden DBK, Wang J, Waserman S, et al. *Anaphylaxis: a 2023 practice parameter.* Ann Allergy Asthma Immunol. 2024;132:124–176. DOI 10.1016/j.anai.2023.09.015 | 2023/24 | *practice parameter* conjunto **AAAAI/ACAAI** | ⛔ **não aberto** |
| **2** | Cardona V, et al. *World Allergy Organization Anaphylaxis Guidance 2020.* World Allergy Organ J. 2020;13:100472. DOI 10.1016/j.waojou.2020.100472 | 2020 | *guidance* da **WAO** | ✅ aberto, versão publicada |
| **3** | Muraro A, et al. *EAACI guidelines: Anaphylaxis (2021 update).* Allergy. 2022;77:357–377. DOI 10.1111/all.15032 | 2021 | diretriz da **EAACI** | ✅ aberto, versão publicada |
| **4** | American College of Radiology. *ACR Manual on Contrast Media.* | atual | manual institucional de sociedade | a verificar |

## ⚠️⚠️ STATUS DAS CANDIDATAS — decisão do autor, 2026-09-11

| decisão | |
|---|---|
| AAAAI/ACAAI 2023 | **candidata preferencial**, ⛔ **e não fonte principal definitiva** |
| condição para virar principal | confirmar **escopo** e **cobertura dos seis itens** |
| se ⛔ não houver PDF publicado acessível | usar **WAO 2020** ou **EAACI 2021** como alternativa documental |
| ⛔ o que ⛔ não fazer | **forçar continuidade de procedência** — a preferência ⛔ não vale acesso impossível |

⚠️⚠️ Isto corrige o que eu havia escrito. Eu tratei a continuidade de
procedência como argumento **decisivo** (*"vale mais do que a facilidade de
acesso"*). ⛔ Ela é **critério de desempate**, e ⛔ não licença para deixar o
slot parado esperando um PDF que talvez não chegue.

➜ Ordem prática: **confirmar cobertura primeiro**, escolher depois. Uma fonte
preferencial que ⛔ não cobre os seis itens ⛔ não é preferencial coisa
nenhuma.

## ⚠️ Por que a nº 1 é a preferencial, apesar de fechada

O **F-35b se apoia nela explicitamente**, e mais de uma vez:

> "This is a strong recommendation from the Practice Parameters on Anaphylaxis
> from the AAAAI and the American College of Allergy, Asthma and Immunology."
> — F-35b, recs. 18 e 19

⚠️ Adotar outra fonte como principal criaria o risco de **conflito com a fonte
específica do contraste**, que declaradamente segue esta. Por isso ela é
**preferencial** — ⛔ e, pelo bloco acima, **preferência ⛔ não é obrigação**:
se o PDF publicado não for acessível, WAO 2020 ou EAACI 2021 assumem, e a
divergência com o Wang, se houver, ⛔ se registra em vez de se resolver.

⚠️ E é a mesma que o app já cita em `lib/adrenalina-ev-anafilaxia.ts` — hoje
**sem verbatim**. Fechar o F-36 com ela resolveria as duas coisas de uma vez.

## ⚠️ A nº 4 é apontada pela própria fonte

O F-35b manda ao **ACR Contrast Manual** para o tratamento de reação leve e
moderada (item 2 acima). É ponteiro explícito, ⛔ não sugestão minha.

---

# ⚠️⚠️ REGRA DE PRECEDÊNCIA — decidida antes de transcrever

Ordem do autor: *"sem transportar nada automaticamente se houver conflito com
o consenso específico de contraste."*

| situação | quem manda |
|---|---|
| o F-35b fala sobre o ponto | **F-35b** — fonte específica da exposição |
| o F-35b é **silente** | F-36 entra, declarando que entrou |
| o F-35b declara **fora de escopo** | F-36 entra, declarando que entrou |
| as duas falam e **divergem** | ⛔ **registrar a divergência explicitamente**, ⛔ **nunca resolvê-la em silêncio** |

⚠️ A última linha é a que importa. Divergência entre fonte geral e fonte
específica é **achado**, ⛔ e não problema a ser resolvido por preferência.

---

# ESTADO

| eixo | estado |
|---|---|
| **fidelidade documental** | ⛔ **nada transcrito** |
| **aplicabilidade ao AVC isquêmico** | ⛔ nem começou |
| PDF em mãos | ⛔ nenhum |

⛔ **Enquanto assim, nada que este slot sustentaria entra em tela**: nem agente
ou dose de broncodilatador, nem regime de adrenalina EV, nem volume, nem alvo
de oxigenação.

⚠️ E vale o **gate item a item**: mesmo depois de transcrita, a fonte só
fecha o slot quando **cada um dos seis itens** acima estiver marcado como
coberto ou como lacuna explícita.
