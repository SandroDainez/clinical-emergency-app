# Choque no AVC — slots ainda ABERTOS

> Este arquivo **não contém verbatim**. Ele existe para dar endereço aos slots
> que já foram identificados e ainda **não têm texto transcrito**, no mesmo
> padrão de `seguranca-definicoes-operacionais.md` e
> `imagem-definicoes-operacionais.md`.
>
> ⛔ Enquanto um slot estiver aqui, **nada que ele sustentaria pode aparecer na
> tela** (§0.5). Isso vale para nome de fármaco, dose, faixa, meta e intervalo.

## Por que existem slots abertos no C2

O F-32 (ESICM 2025 · choque circulatório e monitorização hemodinâmica) declara
de si mesmo que **não é diretriz de tratamento farmacológico**. A leitura
verbatim confirmou: a diretriz manda corrigir hipoperfusão e **não diz com
quê**. Ver `auditoria/MAPA-C2-CHOQUE.md`, Passo 5.

O que falta, portanto, não é interpretação da fonte que temos. É **outra
fonte**.

---

## F-33 · ✅ FECHADO — transcrito em 2026-09-10

O PDF foi localizado em `~/Literatura Medica` e transcrito em
`protocols/fontes-verbatim/einstein-cptw386-choque.md`.

⚠️ **O que ele fechou:** reconhecimento, classificação por mecanismo,
vasopressor de escolha por subtipo, indicação e contra-indicação de
inotrópico, conduta de volume por subtipo, gatilho de linha arterial.

⛔ **O que ele NÃO fechou, e agora está provado:** dose inicial, titulação e
tipo de fluido fora da sepse. Ver F-34 e F-35 abaixo.

---

## F-34 · Escolha do fluido de ressuscitação

| | |
|---|---|
| **documento** | European Society of Intensive Care Medicine — *Clinical Practice Guideline on fluid therapy in adult critically ill patients*, **Parte 1 (escolha do fluido)**. |
| **natureza** | diretriz de sociedade, com GRADE |
| **estado** | ⛔ **ABERTO** — PDF não obtido |
| **por que este slot existe** | o F-32 empurra explicitamente o tipo de fluido para *"other recommendations of ESICM"*; este é o documento apontado |

### Escopo declarado deste slot

⚠️ **Só escolha do fluido.** Balanceada × salina, cristaloide × albumina,
hipertônica de pequeno volume.

⛔ **Não** é slot de volume total. ⛔ **Não** é slot de meta pressórica.
⛔ **Não** é slot de vasopressor.

### ⚠️ Ao transcrever, dois cuidados

- **Separar população.** Verificar recomendação por recomendação o que vale
  para *critically ill adults in general* e o que é específico de população.
  Uma recomendação escopada a sepse **não** atravessa para o AVC, pela mesma
  regra que já barrou as metas pressóricas do F-32.
- **Não transportar TCE para AVC.** Vale aqui a mesma decisão do
  `MAPA-C2-CHOQUE.md`: trauma cranioencefálico e AVC isquêmico são populações
  diferentes, e nenhuma fonte fez essa ponte.

---

## F-35 · Dose inicial e titulação de vasopressor — ⚠️ **UMA FAMÍLIA, NÃO UMA FONTE**

**Decisão do autor, 2026-09-10:** F-35 não é um slot único. É uma **família de
slots por mecanismo**, porque o C2 entra em **choque indiferenciado** e só
depois caracteriza.

`reconhecer choque → caracterizar mecanismo provável → tratamento específico`

| sub-slot | mecanismo | estado | candidata |
|---|---|---|---|
| **F-35a** | cardiogênico | ⛔ aberto | Bloom JE, Chan W, Kaye DM, Stub D. *State of Shock: Contemporary Vasopressor and Inotrope Use in Cardiogenic Shock.* J Am Heart Assoc. 2023;12:e029787 — **ref. 11 do CPTW386.1**. Não lida. |
| **F-35b** | hipovolêmico / hemorrágico | ⛔ aberto | nenhuma |
| **F-35c** | obstrutivo | ⛔ aberto | nenhuma |
| **F-35d** | distributivo não séptico | ⛔ aberto | nenhuma |
| **—** | distributivo séptico | ⛔ **fora de escopo** | o app já tem SSC 2026 no módulo de sepse, e ⛔ não se transporta para cá |

⚠️⚠️ **Bloom 2023 não vira o F-35 inteiro.** Ele pode ser excelente para
cardiogênico e **não responde** por hipovolêmico, obstrutivo ou distributivo.
Adotá-lo como fonte única repetiria, ao contrário, o erro que a proibição do
séptico evita: um mecanismo governando todos.

### Por que a família, e não uma fonte só

A busca por diretriz de sociedade para farmacologia de **choque
indiferenciado** não encontrou documento. As diretrizes são organizadas **por
tipo de choque**. ⚠️ Isto **não** é lacuna de busca: é como a literatura está
organizada, e a arquitetura do C2 já foi ajustada a isso.

⛔ Enquanto **qualquer** sub-slot do mecanismo em questão estiver aberto, o
Passo 5 **não vira tela para aquele mecanismo**. O app pode reconhecer a
ameaça, caracterizar o mecanismo e dizer que há indicação de vasopressor.
Não pode dizer quanto.

⚠️ Isso permite fechar **por mecanismo**, e não tudo de uma vez — que é
exatamente o que a arquitetura do Passo 2 torna possível.

### A prova de que o F-33 não fecha isto

Nem o F-32 nem o F-33 trazem dose inicial ou esquema de titulação de
noradrenalina. No F-33 isso foi **medido no documento**: em 8 páginas não há um
único mcg/kg/min de dose terapêutica.

⚠️⚠️ **E há uma armadilha registrada.** O CPTW386.1 **tem** uma escalada
(noradrenalina → vasopressina → adrenalina, com corticoide ao 2º vasopressor),
mas ela vive **dentro da seção «RECOMENDAÇÕES E METAS CLÍNICAS EM PACIENTES
COM SEPSE»**. ⛔ É algoritmo de sepse, está sob proibição explícita de
transporte, e **mesmo assim não traz dose**.

### ⚠️ O que este slot NÃO autoriza no lugar

- ⛔ não usar a faixa de linha arterial (0,3–0,5 mcg/kg/min) como se fosse
  faixa de titulação — ela é gatilho de monitorização;
- ⛔ não importar a dose que o módulo de sepse já tem;
- ⛔ não deduzir dose a partir da calculadora de preparo em
  `protocols/drogas_vasoativas.json`, que responde aritmética, não indicação.
