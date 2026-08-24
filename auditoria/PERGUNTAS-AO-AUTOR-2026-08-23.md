# Perguntas ao autor — 2026-08-23

**Sete perguntas abertas** e cinco já respondidas, listadas no fim para o
registro.

⚠️ **Os limiares deste arquivo vêm do dado, não estão digitados aqui.** Ele é
gerado por `npm run gera:perguntas` a partir de `lib/eletrolitos/gravidade.ts`,
`lib/eletrolitos/referencias.ts` e `lib/anion-gap.ts`. A primeira versão foi
escrita à mão e envelheceu em três rodadas — ainda dizia `hipocalcemia < 7 mg/dL`
depois de o corte ter mudado. É o R-114 num documento de auditoria, que é onde
ninguém pensa em olhar.

---

# ABERTAS

## 1 · Os quatro eletrólitos que continuam sem fonte

**Destrava:** tirar oito distúrbios da pendência permanente — hoje eles não têm
como sair dela.

⚠️ **Não pergunto mais "qual a referência-base"**, e a razão é a **R-110**, que
saiu da sua própria recusa: *quando existe cutoff formal, cita-se a
sociedade/diretriz; quando não existe, classifica-se como prática aceita ou
referência de revisão — e não se inventa graduação.* Uma referência única para
doze distúrbios de origens diferentes seria exatamente o que o senhor recusou.

**Cálcio e fósforo saíram desta lista** (Society for Endocrinology e o consenso
que o senhor nomeou). Restam **sódio, potássio, magnésio e cloro**:

| distúrbio | corte hoje |
|---|---|
| hiponatremia | < 120 mEq/L |
| hipernatremia | ≥ 160 mEq/L |
| hipocalemia | < 2,5 mEq/L |
| hipercalemia | ≥ 6,5 mEq/L |
| hipomagnesemia | < 1,2 mg/dL |
| hipermagnesemia | — *(degrau único, sem corte numérico)* |
| hipocloremia | — *(degrau único, sem corte numérico)* |
| hipercloremia | — *(degrau único, sem corte numérico)* |

> **Para cada um: existe cutoff formal de sociedade?**
> Se **sim**, qual documento. Se **não**, a resposta legítima é *"prática aceita"*
> ou *"referência de revisão"* — e o número fica com essa força, declarada.

⚠️ **Magnésio segue intocado**, como o senhor pediu: os dois cortes continuam
exatamente como estavam, aguardando conferência **número a número**.

⚠️ **Hipo e hipercloremia não têm corte numérico** — viraram degrau único quando
o senhor confirmou que não têm escala de apresentação. A pergunta neles é só se a
afirmação está certa, e ela já está na lista das respondidas.

**E as referências de conduta da camada 2, todas sem fonte:**
`8–10 mEq/L` · `0,5 mEq/L/h` · `500–1000 mL` · `0,25–0,5 g/kg/dia` · `0,5–1 mL/kg/h` · `3 mL/kg/h`

---

## 2 · O verbatim da SSC 2021 — e a força que ele carrega

**Destrava:** fechar a D-82; hoje três números do critério do corticoide e da
vasopressina estão no app sem verbatim no repositório.

A frase corrigida diz *"Considerar hidrocortisona 200 mg/dia se a dose se
mantiver ≥ 0,25 por pelo menos 4 h"* e *"não esperar chegar a 0,5"*.

> **O verbatim da SSC 2021, e o grau daquele trecho.**
> ⚠️ Se o critério estiver no **texto de prática** e não na recomendação
> graduada, a força é `pratica_aceita`, não `recomendacao_formal`. O próprio
> texto do app já suspeita disso.

---

## 3 · Coronárias — qual das duas leituras vale (D-81)

**Destrava:** o espanhol e o português afirmam coisas **diferentes** sobre o
estado das diretrizes; hoje o app diz as duas.

- **PT:** *"A ACC/AHA 2025 MANTÉM STEMI/NSTEMI e incorpora só parte desse
  reconhecimento; as diretrizes australianas de 2025 adotaram a nomenclatura
  OMI. O app usa a nomenclatura corrente de propósito."*
- **ES:** *"No es nomenclatura oficial de las guías actuales, y esta app no la
  adopta como criterio."*

> **Qual das duas fica?** A outra é reescrita para dizer o mesmo.

---

## 4 · Para onde reaponto o auditor de trombolítico (D-83)

**Destrava:** a dose de trombolítico por peso está **sem auditoria** desde o
refactor `a9b16ad` — teto, monotonicidade e peso ausente deixaram de ser
conferidos.

`scripts/auditoria-doses-criticas.cjs` compilava `avc/calculators.ts` e
`coronary/calculators.ts`, apagados naquele commit. As funções não existem mais
com o mesmo nome, e escolher qual código de hoje ocupa o lugar delas é decidir
**o que auditar** — escopo, não conserto.

> **Para onde eu reaponto?**

---

## 5 · Ânion gap — dois cortes e um fator, herdados sem fonte (D-95)

**Destrava:** a interpretação do AG saiu do verde, mas os três números que a
sustentam continuam sem procedência.

Nenhum foi escolhido por mim — os três já estavam no app:

| número | onde estava | o que é |
|---|---|---|
| **> 12** | `agRef > 12` no código | corte de AG elevado |
| **< 8** | na linha de referência da própria calculadora | corte de AG baixo |
| **2,5** | `ag + 2,5 * (4 - alb)` | correção pela albumina, por 1 g/dL abaixo de 4 |

> **1.** Quais cortes de AG **alto** e **baixo** o senhor adota, e com que fonte?
> **2.** O fator **2,5** — a referência clássica é
> **Figge et al.** Confirma? O verbatim precisa ser transcrito antes de a força
> subir de `pendente`.

---

## 6 · Qual corte de hipoglicemia o app adota, e de qual fonte?

**Destrava:** o passo 0 do renal manda verificar a glicemia em toda alteração de
consciência — e **não diz onde a hipoglicemia começa**, porque o senhor não
decidiu e eu não escrevo número clínico.

⚠️ **E o app já tem DOIS cortes diferentes, nenhum com procedência** (D-103):

| onde | corte | procedência |
|---|---|---|
| `avc-decision-tree.ts` | *"tratar se **< 60 mg/dL**"* | nenhuma |
| ACLS, causas reversíveis | *"Evitar glicemia **< 70** e > 180 mg/dL"* | nenhuma |

> **Qual corte vira o gatilho de "tratar imediatamente" no passo 0, e de qual
> documento?** O ADA Standards of Care define níveis (alerta · clinicamente
> significativa · grave — esta última definida por **comprometimento cognitivo e
> não por número**). **Qual deles, e a versão do documento?**

⚠️ **E o segundo achado, que é do app inteiro:** os dois números acima estão em
módulos diferentes, dizendo coisas diferentes sobre o mesmo limiar. Se o senhor
adotar um, ele passa a valer para os dois — ou a divergência precisa ser
explicada.

⚠️ **Não há módulo nem ramo de hipoglicemia** no app (D-102 é o irmão disso: não
há fluxo de delirium). Se o corte disparar, hoje não há para onde apontar.

---

## 7 · Quando a sessão expira no meio do atendimento, o contador de segurança zera junto?

**Destrava:** hoje o contador de escalonamento vive dentro da sessão do fluxo — e
a sessão expira em **30 minutos**. Esse prazo foi escrito para outra coisa.

⚠️ **Os dois propósitos puxam para lados opostos:**

- prazo **curto** protege contra o paciente A contaminar o B (era o propósito
  original: *"meia hora depois a chance de ser outro paciente já é grande o
  bastante"*);
- prazo **longo** protege contra **perder a segunda piora**.

**E um atendimento de IRA grave dura mais de 30 minutos.** Paciente que piora no
minuto 10 e piora de novo no minuto 45: o contador zerou no meio, e **o
escalonamento nunca dispara** — falso negativo numa trava de segurança, a espécie
que não gera queixa porque ninguém percebe o aviso que não veio.

> **Quatro formas, e eu não escolhi nenhuma:**
>
> **(a)** prazo maior só para o estado de escalonamento;
> **(b)** a expiração deixa de ser silenciosa e **pergunta** ("mesmo paciente?")
> antes de zerar;
> **(c)** o estado só zera por ação explícita ("começar do início"), e o tempo
> apenas avisa;
> **(d)** fica como está, e o senhor declara que aceita o reset.

⚠️ **A (d) é resposta legítima** — mas precisa ser **declarada**, não acontecer
por omissão. Trava padrão que ninguém escolheu não é decisão, é sobra.

---

# RESPONDIDAS

Ficam aqui para o registro: o que o senhor decidiu, quando, e onde está aplicado.

## ✅ Os três distúrbios sem escala de apresentação — 2026-08-23

**Pergunta:** hiperfosfatemia, hipocloremia e hipercloremia repetiam o mesmo
texto nos dois degraus. Era preguiça de redação ou é a clínica?

**Resposta do autor:** é a clínica. Cloro é **marcador**, não doença — o paciente
não tem "sintoma de cloro"; hiperfosfatemia aguda manifesta-se **pelo que causa**
(hipocalcemia sintomática), não por si. **A tela é que estava errada**, sugerindo
uma escala de sintomas que não existe.

**Aplicado:** um degrau só, com o texto dele — *"A gravidade aqui não muda a
apresentação. O que muda a conduta é a causa e a velocidade de instalação"* (e,
na hiperfosfatemia, *"…e o cálcio associado"*). `forca: definicao`, assinado.
**Nenhum sintoma foi inventado** para preencher o degrau que saiu.

## ✅ Cálcio: sintoma primeiro, número depois — 2026-08-23

**Resposta do autor:** *"A presença de manifestações clínicas relevantes deve
prevalecer sobre uma classificação exclusivamente numérica."*

**Aplicado**, com os **três pesos** que ele separou — e o peso virou campo, não
redação:

- **define** (6): parestesia perioral e de extremidades · espasmo carpopedal ou
  tetania · Trousseau ou Chvostek · laringoespasmo ou estridor · convulsão ·
  QT prolongado e/ou arritmia
- **apoia** (1): broncoespasmo
- **exigeCompatibilidade** (2): hipotensão refratária a vasopressor · disfunção
  miocárdica aguda — ⚠️ **altamente inespecíficas no crítico**, lembradas quando
  o cálcio já está baixo, **nunca concluindo sozinhas**

## ✅ Cálcio ionizado: sem corte próprio — 2026-08-23

**Resposta do autor:** não criar faixas de gravidade para o ionizado. Usa-se o
valor medido, a **referência do laboratório** e o contexto. **Proibido converter**
o corte do total/ajustado para o ionizado.

**Aplicado:** com ionizado, **nenhum corte numérico casa** — nem o degrau de base,
porque classificar por queda é classificar. As notas de **pH** e de
**método/equipamento** aparecem na tela. E o ramo sintomático responde igual nos
três ensaios, então **quem tem o melhor exame deixou de receber a pior resposta**.

## ✅ O corte de hipocalcemia, e a unidade da fonte — 2026-08-23

**Pergunta:** o app usava `< 7 mg/dL` e a fonte diz `< 1,9 mmol/L` (≈ 7,62). Não
são o mesmo corte.

**Resposta do autor:** fidelidade à fonte. *"O valor é armazenado na unidade
original da fonte e convertido programaticamente para exibição."*

**Aplicado.** Hoje, vindo do dado:

- **hipocalcemia — grave:** < 1,9 mmol/L (≈ 7,62 mg/dL)
- **hipofosfatemia — grave:** < 0,32 mmol/L (≈ 0,99 mg/dL)

⚠️ **Mudou classificação de paciente real:** o assintomático entre 7,0 e 7,6
mg/dL, que era "leve a moderada", passou a **grave**.

## ✅ Hipercalcemia: as faixas e o 14,0 mg/dL — 2026-08-23

**Resposta do autor:** o corte canônico permanece **> 3,5 mmol/L**, armazenado na
unidade da fonte; a apresentação em mg/dL é derivada. **14,0 mg/dL exatos não
entram** em correção urgente por critério numérico isolado. **Mostrar as duas
unidades na tela.** E: *"não arredondar o valor convertido para redefinir a
lógica de classificação"* — que virou trava.

**Aplicado.** As faixas, vindas do dado:

- **Correção urgente** — > 3,5 mmol/L (≈ 14,03 mg/dL)
- **Significativa** — 3 mmol/L (≈ 12,02 mg/dL) a 3,5 mmol/L (≈ 14,03 mg/dL)
- **Leve a moderada** — degrau de base

Com o texto de conduta dele na faixa intermediária, em **campo próprio** —
porque classificação e conduta são camadas diferentes: a faixa classifica, o
texto conduz.
