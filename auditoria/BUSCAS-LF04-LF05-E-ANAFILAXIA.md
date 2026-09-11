# LF-04, LF-05 e a fonte de anafilaxia — buscas registradas

**2026-09-11.** ⛔ Nenhum documento novo foi lido. Este arquivo registra
**buscas**, pela regra **R-AUSENCIA**.

---

# 1 · ⚠️⚠️⚠️ A FONTE DE ANAFILAXIA DO APP — e ela não é o que eu disse

## O que eu afirmei, e estava errado

Eu escrevi que *"o app já tem módulo de anafilaxia com a WAO 2020, e é lá que o
broncodilatador provavelmente vive"*. ⛔ **Duas coisas erradas nessa frase.**

## 1.1 · O módulo de anafilaxia **não existe nesta branch**

Mesmo padrão do módulo `choque`: removido no commit **`bdf02c8`**
(*remove legacy clinical modules*). Sobraram as tabelas de tradução ES, e ⛔ não
o conteúdo PT.

| arquivo | estado |
|---|---|
| `lib/broncoespasmo-anafilaxia.ts` | ⛔ **removido** em `bdf02c8` |
| `lib/i18n/modules/broncoespasmo-anafilaxia.ts` | ✅ sobreviveu — ⚠️ é só a tradução |

## 1.2 · ⛔ Não existe verbatim de anafilaxia no app

`protocols/fontes-verbatim/` ⛔ **não tem** arquivo de anafilaxia.

O que existe é **metadado**, e ele se declara **síntese**:

> `"name": "Anafilaxia — síntese (WAO / EAACI / prática de emergência)"`
> `"citation": "World Allergy Organization e consensos — (…) (síntese assistencial)."`
> `"base": [{ "referencia": "World Allergy Organization — anafilaxia", "ano": null }]`
> `"url": "https://www.worldallergy.org/"`

⚠️⚠️ **`ano: null`, URL genérica, sem DOI, sem página.** ⛔ Isso **não é** a
WAO 2020 transcrita. É uma síntese nossa, atribuída à WAO em bloco.

## 1.3 · ⚠️⚠️ E o broncoespasmo vem de **StatPearls**, não da WAO

O conteúdo recuperado de `bdf02c8^:lib/broncoespasmo-anafilaxia.ts` declara a
própria procedência, e ela é **outra**:

> "Fonte: **StatPearls — Anaphylaxis** (capítulo de manejo), que trata as duas em
> contexto de anafilaxia."

⚠️ **O arquivo é exemplar na disciplina de procedência** — ele separa três
naturezas, e vale preservar isso ao reconstruir:

| afirmação | natureza declarada pelo próprio arquivo |
|---|---|
| beta-2 **e ipratrópio em primeira linha** no chiado | ✅ citação da fonte: *"inhaled beta-agonists is the first-line treatment for wheezing; albuterol alone or as ipratropium bromide/albuterol"* |
| **magnésio 2 g em 20 min** no chiado refratário | ⚠️ **indicação** da anafilaxia, **dose emprestada da asma grave** — e a fonte **avaliza** o empréstimo: *"dosage and treatment similar to severe asthma exacerbations"* |
| *"nenhum substitui ou atrasa a adrenalina"* | ⚠️⚠️ **inferência clínica**, ⛔ **não citação** — e o arquivo diz isso de si mesmo |

## 1.4 · Resposta às três perguntas do autor

| pergunta | resposta |
|---|---|
| **broncoespasmo** | ✅ o app **tem** conteúdo — beta-2 + ipratrópio em 1ª linha, magnésio no refratário. ⛔ **Mas a fonte é StatPearls**, e ⛔ não há verbatim |
| **reações que o Wang põe fora do escopo** (leve e moderada) | ⛔ **não verificado** — exigiria recuperar e ler o conteúdo do módulo removido |
| **suporte respiratório complementar** | ✅ parcialmente, pelo mesmo conteúdo |
| **conflito com o consenso de contraste?** | ⚠️ **nenhum conflito detectado** nas duas frentes que se tocam: os dois põem a **adrenalina em primeira linha**, e os dois dizem que inalatório/anti-H1 ⛔ não a substituem |

⚠️⚠️ ➜ **Conclusão:** o app ⛔ **não tem** fonte de anafilaxia à altura do
contrato. Tem síntese em metadado e conteúdo de StatPearls, ambos sem verbatim.
**Isso é lacuna de fonte, e ela é anterior ao F-35b.**

➜ **Proposta:** abrir **F-36 · anafilaxia (geral)**, com **WAO 2020** ou
**EAACI 2021** — as duas **abertas**, verificadas em 2026-09-10 — e ⛔ não
remendar o F-35b com conteúdo de procedência fraca.

---

# 2 · LF-04 · SANGRAMENTO EXTRACRANIANO PÓS-TROMBOLÍTICO

## Busca registrada

| | |
|---|---|
| **base** | PubMed, via E-utilities (`esearch`/`efetch`) |
| **data** | 2026-09-11 |

| estratégia | resultados |
|---|---|
| `(extracranial hemorrhage[Title] OR systemic hemorrhage[Title] OR major bleeding[Title]) AND (thrombolysis OR alteplase) AND stroke` | **8** |
| `gastrointestinal hemorrhage AND (alteplase OR tenecteplase) AND stroke` | **1** |
| `(systemic bleeding OR extracranial bleeding) AND thrombolytic AND stroke` | **29** |
| `(management OR treatment OR reversal)[Title] AND extracranial AND thrombolysis AND stroke` | **62** |

## ⚠️ O que a busca encontrou — e o que ela NÃO encontrou

**Encontrou:** o assunto **existe** na literatura, e tem estudo dedicado.

> **Romoli M, Vandelli L, Bigliardi G, et al.** *Fibrinogen Depletion
> Coagulopathy Predicts Major Bleeding After Thrombolysis for Ischemic Stroke: A
> Multicenter Study.* **Stroke. 2022;53(12):3671–3678.**
> DOI 10.1161/STROKEAHA.122.039652 · ✅ **aberto**

> **Rose D, Cavalier A, Kam W, … Yaghi S, … Mac Grory B.** *Complications of
> Intravenous Tenecteplase Versus Alteplase for the Treatment of Acute Ischemic
> Stroke: A Systematic Review and Meta-Analysis.* **Stroke. 2023;54(5):1192–1204.**
> DOI 10.1161/STROKEAHA.122.042335 · ✅ **aberto**
>
> ⚠️ Desfechos **incluem explicitamente**: *"angioedema, gastrointestinal
> hemorrhage, **other extracranial hemorrhage**"*.

⛔ **NÃO encontrou:** documento de **manejo**. Os dois são de **risco,
predição e incidência** — ⛔ nenhum diz **o que fazer** quando o paciente sangra
fora do crânio.

## Classificação

| | |
|---|---|
| **estado** | **3 · evidência não localizada** — ⚠️ **para MANEJO**, e ⛔ não para o assunto |
| **o que existe** | epidemiologia, predição e comparação de risco |
| **o que falta** | conduta |
| ⚠️ **redação obrigatória** | *"busca em PubMed, 2026-09-11, quatro estratégias, não localizou documento de manejo"* — ⛔ **nunca** *"não existe"* |

⚠️ **Pista de mecanismo, e ⛔ não autorização:** os dois achados apontam para
**depleção de fibrinogênio** como o eixo — o **mesmo** que o F-35c usa para
guiar a reversão do sangramento intracraniano. ⛔ Isso ⛔ **não** autoriza
transportar a conduta intracraniana para o extracraniano; autoriza **suspeitar**
que a decisão do autor tenha base fisiopatológica comum.

---

# 3 · LF-05 · COMPLICAÇÃO HEMORRÁGICA APÓS TENECTEPLASE

## Busca registrada

| | |
|---|---|
| **base** | PubMed, via E-utilities |
| **data** | 2026-09-11 |

| estratégia | resultados |
|---|---|
| `tenecteplase[Title] AND (hemorrhage OR bleeding OR complication*)[Title] AND stroke` | **19** |
| `tenecteplase AND (reversal OR cryoprecipitate OR fibrinogen) AND (hemorrhage OR bleeding)` | **23** |
| `tenecteplase AND symptomatic intracranial hemorrhage AND management` | **11** |

## ⚠️ O que a busca encontrou

O melhor achado é o **mesmo** do LF-04: **Rose D et al., Stroke 2023** — revisão
sistemática e metanálise de **complicações da tenecteplase × alteplase**, com
**Yaghi S entre os autores**, o mesmo do F-35c.

⚠️ **Resultado que ela dá:** risco relativo de sICH da tenecteplase contra
alteplase de **0,89** (IC 95% 0,65–1,23; I²=0%), em 16 estudos comparativos.

⛔ **O que ela NÃO dá:** **como tratar**. É comparação de **incidência**.

## Classificação

| | |
|---|---|
| **estado** | **3 · evidência não localizada** — ⚠️ **para MANEJO** |
| ⚠️ **e um achado que muda a pergunta** | a busca ⛔ não localizou documento de manejo **específico de tenecteplase**, e ⚠️ a razão provável é que **não haja diferença que exija conduta própria** — o Rose 2023 não encontrou diferença significativa de sICH entre os dois agentes |

⚠️⚠️ **Isto reformula a LF-05.** A pergunta deixa de ser *"qual é a conduta da
hemorragia por tenecteplase?"* e passa a ser:

> ⚠️ **A ausência de conduta específica é ausência de evidência, ou é ausência
> de diferença?**

⛔ **A busca não distingue as duas**, e ⛔ a leitura do Rose 2023 **não foi
feita**. ➜ Se o autor quiser fechar, o caminho é **ler o Rose 2023** e decidir
como **estado 4 · decisão operacional derivada**, declarada como tal.

⚠️ E há um argumento **fisiopatológico** que ⛔ não fecha nada sozinho: a
reversão do F-35c é **guiada por fibrinogênio**, e ⛔ não pelo fármaco. Se a
coagulopatia medida for a mesma, a conduta guiada por ela **poderia** ser a
mesma. ⛔ **Poderia** — e essa palavra é o limite do que a busca autoriza.

---

# 4 · ⚠️⚠️⚠️ O GATE DE TRANSCRIÇÃO — novo, ordem do autor

> **"A partir de agora, toda transcrição passa por gate: contrato item a item →
> cobertura encontrada → lacuna explícita → só então «fonte transcrita»."**

| etapa | o que exige |
|---|---|
| **1 · contrato item a item** | a lista de itens **escrita antes** de abrir o PDF |
| **2 · cobertura encontrada** | conferir a transcrição **contra a lista**, item por item |
| **3 · lacuna explícita** | cada item ⛔ **não coberto** vira lacuna **nomeada**, com o tipo certo — fonte, tratamento ou fluxo |
| **4 · «fonte transcrita»** | só depois dos três |

⚠️ **Este gate nasceu de um erro real.** A conferência da lista do autor
encontrou que o **F-35c estava incompleto**: faltava a seção de monitorização
inteira, com o local de cuidado, o esquema e a meta pressórica. ⛔ Eu tinha
declarado a fonte transcrita **antes** de conferir contra a lista.

⚠️⚠️ E a frase que o gate protege, do próprio autor:

> **«fonte transcrita» ⛔ não significa «problema clínico resolvido».**

➜ Por isso **F-35b e F-35c estão com a transcrição documental FECHADA**, e os
**slots clínicos ⛔ NÃO completos**.

---

# ESTADO

| item | estado |
|---|---|
| **F-35b** · transcrição documental | ✅ fechada |
| **F-35b** · slot clínico | ⛔ **não completo** — LF-01, LF-02, LF-03 abertas |
| **F-35c** · transcrição documental | ✅ fechada após a correção |
| **F-35c** · slot clínico | ⛔ **não completo** — LF-04, LF-05 abertas |
| **LF-04** | **3 · evidência não localizada** para manejo · busca registrada |
| **LF-05** | **3 · evidência não localizada** para manejo · ⚠️ pergunta reformulada |
| **anafilaxia geral** | ⚠️ **lacuna de fonte nova** — proposta de abrir **F-36** |

⛔ Sem código e sem deploy.
