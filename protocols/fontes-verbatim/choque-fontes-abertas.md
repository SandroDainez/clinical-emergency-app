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

## F-35 · Dose inicial e titulação de vasopressor

| | |
|---|---|
| **documento** | ⛔ nenhum adotado. **Candidata anotada, não lida:** Bloom JE, Chan W, Kaye DM, Stub D. *State of Shock: Contemporary Vasopressor and Inotrope Use in Cardiogenic Shock.* J Am Heart Assoc. 2023;12:e029787 — **referência 11 do próprio CPTW386.1** |
| **estado** | ⛔ **ABERTO** |

### Por que continua aberto, agora com prova

Nem o F-32 nem o F-33 trazem dose inicial ou esquema de titulação de
noradrenalina. No F-33 isso foi **medido no documento**: em 8 páginas não há um
único mcg/kg/min de dose terapêutica.

⚠️⚠️ **E há uma armadilha registrada.** O CPTW386.1 **tem** uma escalada
(noradrenalina → vasopressina → adrenalina, com corticoide ao 2º vasopressor),
mas ela vive **dentro da seção «RECOMENDAÇÕES E METAS CLÍNICAS EM PACIENTES
COM SEPSE»**. ⛔ É algoritmo de sepse, está sob proibição explícita de
transporte, e **mesmo assim não traz dose**. A busca por diretriz de sociedade para farmacologia de
**choque indiferenciado** não encontrou documento: as diretrizes existentes são
organizadas **por tipo de choque**, e a de choque séptico está sob proibição
explícita de transporte automático.

⚠️ Isto **não** é lacuna de busca. É como a literatura está organizada, e a
consequência arquitetural já foi aceita: **o mecanismo decide o tratamento**,
então a dose provavelmente virá de uma fonte por subtipo, não de uma fonte
única de choque.

⛔ Enquanto este slot estiver aberto, o Passo 5 do C2 **não vira tela**. O app
pode reconhecer a ameaça, classificar o mecanismo e dizer que há indicação de
vasopressor. Não pode dizer quanto.

### ⚠️ O que este slot NÃO autoriza no lugar

- ⛔ não usar a faixa de linha arterial (0,3–0,5 mcg/kg/min) como se fosse
  faixa de titulação — ela é gatilho de monitorização;
- ⛔ não importar a dose que o módulo de sepse já tem;
- ⛔ não deduzir dose a partir da calculadora de preparo em
  `protocols/drogas_vasoativas.json`, que responde aritmética, não indicação.
