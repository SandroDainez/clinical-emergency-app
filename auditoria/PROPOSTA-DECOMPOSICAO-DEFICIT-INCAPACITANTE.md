# PROPOSTA — decomposição de "déficit incapacitante" (§2.8)

**Natureza:** proposta de estrutura. **Atualizada em 2026-08-28** com as nove
definições do autor sobre F-17 — que já foram incorporadas à **§2.8** da
`ESPECIFICACAO-AVC.md`. O que segue aqui é a **forma da superfície**, ainda
sujeita às decisões pendentes de §4.

**Base:** slot **F-17** de `protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md`
— §4.6.1 recs. 1 e 8 (e353), *Recommendation-Specific Supportive Text* rec. 1
(e354) e **Table 4** (e355).

**Legenda**

| marca | significado |
|---|---|
| **(F)** | vem **diretamente da fonte** — existe no verbatim |
| **(T)** | **transformação estrutural do app** — não existe na fonte; é decisão de engenharia clínica |
| **(D)** | **depende de decisão do autor** — a fonte não responde |

---

## 1 · O que a proposta NÃO faz

⛔ **Não promove nenhum exemplo da Table 4 a contraindicação ou critério
absoluto** (instrução do autor, 2026-08-28). A fonte diz *guidance*, *typically*,
*may not*, e *"while always considering individual circumstances"*.

⛔ **Não usa o NIHSS total como regra substituta.** *"Use of the NIHSS score alone
does not suffice."*

⛔ **Não trata "may not be clearly disabling" como "não incapacitante"** — é
hedge, e **E-45** obriga preservá-lo.

⛔ **Não repergunta o que o NIHSS já respondeu.**

⛔ **Não inventa categoria funcional adicional por parecer intuitiva** — só entram
dimensões sustentadas pela Table 4 e pelo *Supportive Text* (**E-19**).

⛔ **Não produz `Déficit incapacitante = SIM/NÃO`** a partir da Table 4
(**E-46**).

---

## 2 · A cadeia candidata

```
  NIHSS já coletado (Superfície B)
        │
        ├─▶ [0] escopo                    (D)
        ├─▶ [1] pergunta-mãe              (F)
        ├─▶ [2] AVD — BATHE               (F) + [3] trabalho, "se aplicável"  (F/D)
        ├─▶ [4] deambular e deglutir      (F)
        ├─▶ [5] consulta paciente/família (F/D)
        ├─▶ [6] os dois quadros           (F)
        │
        ▼
   [7] leitura proposta — "potencialmente incapacitante"   (T, regra = D)
        ▼
   [8] decisão assumida: incapacitante · não incapacitante · incerto   (T, já em §2.8)
```

---

## 3 · Etapa por etapa

### [0] Escopo — a quem a decomposição se oferece

- **(F)** A Table 4 declara escopo próprio: *"Among patients with NIHSS scores
  **0–5** at presentation"*.
- **(F)** Já a rec. 1 vale *"regardless of NIHSS score"*.
- **(D-1 · ABERTA)** A fonte não diz o que fazer fora de 0–5. Duas leituras: (a) a
  decomposição só se oferece em 0–5, e acima disso o julgamento nasce da rec. 1
  sem os quadros; (b) oferece-se sempre, com a Table 4 marcada como derivada de
  população 0–5.

### [1] A pergunta-mãe — **estrutura principal do julgamento**

- **(F)** *"if the observed deficits persist, would they still be able to do basic
  activities of daily living and/or return to work (if applicable)?"*
- **(F/autor)** ✅ **D-6 RESOLVIDA:** a pergunta funcional tem **prioridade
  conceitual**. Os quadros da Table 4 são ilustração **sob** ela, não critérios
  paralelos. Redação fixada pelo autor:

  > *"Se os déficits observados persistirem, o paciente ainda conseguiria realizar
  > atividades básicas de vida diária e/ou retornar à sua atividade
  > habitual/trabalho?"*

⚠️ **Marcação de fidelidade — a redação "atividade habitual/trabalho".** É
**redação de apresentação decidida pelo autor**, e:

- ⛔ **não é verbatim** — a fonte diz *"return to work (if applicable)"*;
- ✅ **amplia operacionalmente** o alcance, para incluir pacientes **sem atividade
  laboral formal**;
- ⛔ **não altera o verbatim armazenado** (F-17) **nem a interpretação clínica da
  fonte**.


- **(T)** Vira o enunciado da superfície. ⚠️ É **contrafactual e prospectiva** —
  "se os déficits persistirem" —, não uma descrição do agora.

### [2] Atividades básicas de vida diária — BATHE

- **(F)** *"bathing/dressing, ambulating, toileting, hygiene, and eating (BATHE
  mnemonic)"* — cinco domínios, nomeados pela fonte.
- **(T)** Seleção **múltipla** tocável (a realidade admite coexistência, §7.6),
  com os três estados de resposta (**E-37**) e nada selecionado ≠ preservado
  (**E-23**).

### [3] "…and/or return to work (if applicable)"

- **(F)** A fonte inclui o retorno ao trabalho, **condicionado** a *"if
  applicable"*.
- **(autor)** A redação fixada usa **"atividade habitual/trabalho"**, que amplia o
  alcance e dispensa decidir aplicabilidade caso a caso — atividade habitual
  existe para todo paciente.
- **(D-4 · ✅ FECHADA pelo autor em 2026-08-28)** A redação ampliada **fica**, com
  a marcação de fidelidade explícita: não é verbatim, amplia operacionalmente para
  pacientes sem atividade laboral formal, e **não altera** o verbatim armazenado
  nem a interpretação clínica da fonte.

### [4] Deambulação e deglutição

- **(F)** *"To fully evaluate the level of deficits, the ability to ambulate and
  swallow independently should be assessed."*
- **(T)** Dois campos próprios, **fora** do checklist BATHE — a fonte os destaca
  como avaliação obrigatória, não como item de lista.

### [5] Consulta ao paciente e à família

- **(F)** *"The clinician should make this determination in consultation with the
  patient and available family."*
- **(D)** É **ação registrada** (com hora e ciclo de vida, §2.3) ou **texto de
  orientação**? Registrar cria rastro do processo decisório; não registrar deixa
  fora da trilha um passo que a fonte considera parte da determinação.

### [6] Os dois quadros da Table 4

- **(F)** Quatro exemplos em *"would typically be considered clearly disabling"* e
  sete em *"may not be clearly disabling in an individual patient"*.
- **(T)** Seleção múltipla, **os dois quadros visíveis juntos** — separá-los em
  telas sugeriria mutualidade que a fonte não afirma.
- **(T)** Os quatro exemplos da coluna esquerda trazem **cortes por item do
  NIHSS** (≥2 em *vision*, *best language*, *extinction and inattention*,
  *motor*). Como esses itens **já foram coletados**, o app os **lê**, e não
  repergunta — exibindo o que a escala já respondeu.
- **(F/E-45)** A redação de cada quadro preserva a força: *typically* ≠ sempre;
  *may not* ≠ não é.

### [7] A leitura do sistema — **intermediária, nunca veredito**

✅ **D-2 e D-3 RESOLVIDAS pelo autor, e por eliminação da pergunta:** o app **não
mapeia seleções em SIM/NÃO**. A pergunta "um item basta?" deixa de existir, porque
**não há conclusão binária a produzir**.

- **(F/autor)** ⛔ O app **não** produz `Déficit incapacitante = SIM/NÃO` a partir
  da Table 4.
- **(F/autor)** ✅ Produz **leitura intermediária**, do tipo:
  - *"Há achados tipicamente associados a déficit claramente incapacitante"*;
  - *"Há achados que podem não ser claramente incapacitantes isoladamente"*;
  - *"A avaliação funcional individual permanece necessária"*.
- **(T)** Derivada, recalculável, nunca gravada (§4.3), declarando insumos
  (**E-22**).

> **Apoio ao julgamento, não decisão.** ⇒ **E-46**

⚠️ **A terceira leitura não é rodapé.** *"A avaliação funcional individual
permanece necessária"* é o que impede as duas primeiras de serem lidas como
veredito — e por isso não pode ser suprimida quando as outras aparecem.

### [8] A decisão assumida

- **(F/autor)** O médico registra: `incapacitante · não incapacitante · incerto`.
- **(T)** Guardada com autor; a leitura do sistema permanece derivada e separada.
- **(F/autor)** ✅ **Divergir da leitura do sistema NÃO é erro e NÃO bloqueia o
  fluxo.** Fica registrada como **divergência clínica** (§4.5, §4.7). Nenhum
  atrito, nenhuma confirmação extra, nenhum alerta corretivo.

---

## 4 · Decisões pendentes do autor

| # | pergunta | estado |
|---|---|---|
| **D-1** | A decomposição se oferece fora de NIHSS 0–5? | ⏳ **aberta** |
| **D-2** | Um item da coluna esquerda basta para a proposta? | ✅ **dissolvida** — não há proposta binária a produzir (regra 5 do autor) |
| **D-3** | A coluna direita gera proposta negativa? | ✅ **resolvida** — gera leitura intermediária, nunca "não incapacitante" |
| **D-4** | Como se determina *"if applicable"*? | ✅ **fechada** — redação ampliada mantida, com marcação de fidelidade |
| **D-5** | A consulta a paciente/família é ação registrada? | ⏳ **aberta** |
| **D-6** | A pergunta-mãe prevalece sobre os quadros? | ✅ **resolvida** — prioridade conceitual, fixada pelo autor |
| **D-7** | O exemplo do Supportive Text (fraqueza de MI, NIHSS 2) é exibível? | 🟡 **permitido** pela regra 8 (está no texto de suporte); usar ou não é decisão de superfície |

**Nenhuma decisão aberta bloqueia mais a etapa [7]** — ela existe como leitura
intermediária. **D-1** e **D-5** afetam alcance e registro, não a viabilidade.
