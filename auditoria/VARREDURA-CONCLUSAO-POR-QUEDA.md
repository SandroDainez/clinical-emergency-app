# Conclusão por queda — a varredura

**Medição de 2026-08-23. ⚠️ NADA FOI CORRIGIDO.** Rodar com
`npm run medir:queda`; o script não tem código de saída.

---

## O defeito, e ele nasceu aqui dentro

> *"O `restante` engolia o cálcio ionizado e devolvia 'Leve a moderada' —
> classificar por QUEDA é classificar, com a agravante de parecer conclusão e ser
> omissão."*

É a irmã clínica do **verde por ausência** (R-108): lá, um instrumento que não
rodava dizia "está tudo bem"; aqui, um caminho que não sabe classificar **diz o
grau mais brando**. E o viés tem direção: **cair no último degrau erra sempre
para o lado tranquilizador.**

---

## O universo, e por que a contagem é PISO

```
454 arquivos .ts/.tsx varridos
ACHADOS: 3  ·  ramo terminal 3 · else final 0 · default 0 · ??/|| 0 · padrão de parâmetro 0
```

⚠️ **O vocabulário de "grau brando" é digitado no script.** Ele não cobre o que
ninguém escreveu ainda, e por isso **3 é piso, não total**.

⚠️ **E a primeira versão deste instrumento acusou 9**, incluindo *"GCS 15 —
normal"* e *"RASS −1 a −2 — sedação leve"*: **degraus legítimos de escada**, onde
o brando é uma faixa MEDIDA e não uma queda. Marcar escada como defeito é o ruído
que faz alguém desligar o instrumento — o alvo passou a ser o **ramo terminal**,
aquele que responde quando nenhuma condição bateu.

⚠️ **O caso que originou a varredura não aparece na lista** porque já foi
corrigido no mesmo dia (o ionizado). A lista é o que RESTA.

---

## Os três, um a um

### 1 · `components/protocol-screen/electrolyte-calculator-screen.tsx:1270` — hipocalcemia

```ts
severe
  ? "Se Ca corrigido < 7 mg/dL, tetania, convulsão ou QT longo, a reposição IV ganha prioridade prática."
  : "Se a hipocalcemia é menos intensa e o paciente estável, o contexto e a causa definem o restante da correção."
```

**O que devolve:** *"a hipocalcemia é menos intensa e o paciente estável"* —
afirmação sobre o paciente.
**Por que é queda:** `severe` é `false` também quando **não há valor** ou quando o
médico informou **ionizado** (que não classifica por número). O ramo não diz "não
sei": diz **"é menos intensa e está estável"**.
**O que deveria devolver se a resposta honesta for "não sei":** distinguir
*"não é grave pelos critérios"* de *"não há como afirmar"* — e, no segundo caso,
dizer o que falta.
⚠️ **E há um segundo problema, independente:** o texto ainda cita **`< 7 mg/dL`**,
que **deixou de ser o corte** (agora é `< 1,9 mmol/L` ≈ 7,62). É prosa que
envelheceu ao lado do dado — R-107 por fora do dicionário.

### 2 · `…electrolyte-calculator-screen.tsx:1660` — hipofosfatemia

```ts
severe ? "…tratar como distúrbio grave…"
       : moderate ? "…entre 1 e 2 mg/dL, a decisão depende…"
                  : "Se fósforo > 2 mg/dL e quadro estável, geralmente cabe conduta menos agressiva."
```

**O que devolve:** *"fósforo > 2 mg/dL e quadro estável"*.
**Por que é queda:** o último ramo **afirma um valor** (`> 2`) que ninguém
verificou — ele é só "nem `severe` nem `moderate`", o que inclui **valor
ausente**.
**O que deveria devolver:** ou a condição verificada, ou "não há valor".

### 3 · `clinical-calculators-engine.ts:423` — ânion gap

```ts
agRef > 12 ? { tone: "orange", label: "Ânion gap ELEVADO…" }
           : { tone: "green",  label: "Ânion gap normal", … }
```

**O que devolve:** *"Ânion gap normal"*, em **verde**.
**Por que é queda:** tudo que não é `> 12` vira "normal" — **inclusive o ânion gap
BAIXO**, que não é normal e tem causas próprias.
**O que deveria devolver:** três estados (baixo · normal · elevado) ou, no
mínimo, não chamar de "normal" o que só se sabe **não ser elevado**.
⚠️ Este é o mais consequente dos três: sai com **tom verde**, que é a forma
visual de dizer "pode seguir".

---

## O que a lista mostra sobre o método

Os três têm a mesma anatomia: **o ramo final afirma um estado do paciente que
ninguém verificou.** Nenhum deles diz "não sei" — todos dizem "está bem". E os
três estão em código que **já passou por auditoria** nesta sequência.

⚠️ **Não corrigido de propósito**, e o item 1 mostra por quê: consertar a queda ali
esbarra numa decisão clínica (o que a tela deve dizer quando não há valor) e num
corte que mudou. É revisão com o autor, não conserto de ternário.
