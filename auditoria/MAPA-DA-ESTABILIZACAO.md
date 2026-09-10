# Mapa da Estabilização A–E — ameaça → tratamento → reavaliação → seguir

**Levantamento de 2026-09-10.** Nenhuma implementação. Nenhum número
clínico novo: o que está aqui **já existe no repositório** ou está marcado como
**falta transcrever**.

## O contrato que este mapa serve

> *"avaliar → identificar ameaça imediata → corrigir → reavaliar → só então
> avançar"* — autor, 2026-09-10.

A Estabilização **não é tela de registro do ABCDE**. Ela conduz. Quando um
eixo mostra ameaça, o app **abre o tratamento**; quando não mostra, o
fluxo segue.

## O que o app já tem, e o padrão que ele já inventou

⚠️ O repositório **já resolveu** este problema duas vezes. Quando a AHA/ASA
reconhece a necessidade mas não operacionaliza, o projeto abre um **slot
próprio**, com **fonte complementar** e **procedência separada**:

| slot | assunto | arquivo | estado |
|---|---|---|---|
| **F-18** | Correção glicêmica **operacional** | fonte BR | ✅ transcrito |
| **F-19** | Anti-hipertensivo IV **operacional** | fonte BR | ✅ transcrito |

É exatamente o mecanismo que A e B precisam. **Não é invenção nova** —
é o padrão da casa.

---

## A · VIA AÉREA

| # | | |
|---|---|---|
| 1 | **fatos avaliados** | `consciencia_rebaixada` · `disfuncao_bulbar` |
| 2 | **critério de ameaça** | **qualitativo**, dois gatilhos nomeados: consciência rebaixada **ou** disfunção bulbar. Sem escore, sem corte |
| 3 | **conduta imediata (fonte)** | F-23 rec. 1 · **COR 1 · LOE C-LD** — *"airway support and ventilatory assistance are recommended **as needed**"* |
| 4 | **tratamento operacional** | **NÃO EXISTE NO MÓDULO.** A transcrição diz textualmente: *" Nenhuma dose, fluxo, dispositivo ou técnica de via aérea consta da fonte"* |
| 5 | **parâmetros/doses** | nenhum |
| 6 | **reavaliar** | não declarado |
| 7 | **critério de resolução** | não declarado |
| 8 | **bloqueia?** | não bloqueia (**E-49**) · hoje nem alerta com destino |

### O que falta, nomeado

**Slot novo — «Via aérea operacional na estabilização»**, fonte complementar,
procedência separada, no padrão F-18/F-19. Precisa cobrir: posicionamento e
manobras básicas, dispositivos básicos (cânula oro/nasofaríngea), aspiração,
supraglótico, indicação de via aérea definitiva, **confirmação** (capnografia) e
o que reavaliar depois.

⚠️⚠️ **A D-104 vigia esta porta.** Decisão sua de 2026-08-27: **não**
reabrir ISR/VM por aqui. O slot tem de ser **estabilização de via aérea
no AVC**, e não um módulo de intubação entrando pela lateral.

---

## B · RESPIRAÇÃO / OXIGENAÇÃO

| # | | |
|---|---|---|
| 1 | **fatos avaliados** | `hipoxia` · `spo2` · `fr` |
| 2 | **critério de ameaça** | **qualitativo** (hipóxia presente). `SpO₂ > 94 %` é **meta**, e não gatilho |
| 3 | **conduta imediata (fonte)** | F-23 rec. 2 · **COR 1 · LOE C-LD** — O₂ suplementar para manter SpO₂ > 94 %. E o **contra**: rec. 5 · **COR 3: No benefit** — sem hipóxia, O₂ não recomendado |
| 4 | **tratamento operacional** | **PARCIAL.** A **meta** existe; o **dispositivo, o fluxo e o escalonamento não** |
| 5 | **parâmetros/doses** | alvo SpO₂ > 94 % ✅ · fluxo/dispositivo |
| 6 | **reavaliar** | implícito (SpO₂), não declarado como ciclo |
| 7 | **critério de resolução** | SpO₂ > 94 % — ⚠️ derivável, mas **não** implementado como resolução |
| 8 | **bloqueia?** | não bloqueia · hoje nem alerta com destino |

### O que falta, nomeado

**Slot novo — «Oxigenoterapia e suporte ventilatório na estabilização»**: cânula
nasal → máscara → alto fluxo → VNI → VM, com faixas de fluxo e critérios de
escalonamento. Mesma vigilância da **D-104**.

⚠️ A rec. 3 (**hiperóxia normobárica**, COR 2b) **não entra**: ela exige
cinco condições simultâneas (≤6 h + NIHSS 10–20 + ASPECTS ≥6 + LVO anterior +
EVT planejada) e é a mais estreita do documento.

---

## C · CIRCULAÇÃO — duas ameaças diferentes

### C1 · HAS impeditiva da reperfusão ✅ **O ÚNICO EIXO COMPLETO HOJE**

| # | | |
|---|---|---|
| 1 | **fatos** | `pas` · `pad` (instância `pa`) |
| 2 | **ameaça** | **≥ 185 / 110 mmHg** — corte numérico explícito (F-04) |
| 3 | **conduta** | F-04 · **COR 1 · LOE B-NR** — baixar antes da IVT |
| 4 | **operacional** | ✅ **F-19** — **11 agentes** com dose e via |
| 5 | **doses** | ✅ labetalol 10–20 mg EV · nicardipino 5 mg/h · clevidipino 1–2 mg/h · esmolol · metoprolol · enalaprilato · hidralazina · nitroprussiato… |
| 6 | **reavaliar** | ✅ `resolvePor: "Uma nova aferição de pressão arterial"` — e **nova instância**, não correção |
| 7 | **resolução** | ✅ nova aferição **completa** abaixo do corte |
| 8 | **bloqueia?** | **não bloqueia navegação** (E-49) · **bloqueia o portão da IVT** (`bloqueado_corrigivel`) |

### C2 · Choque / hipotensão **FORA DO MÓDULO HOJE**

⚠️⚠️ **CORREÇÃO DE 2026-09-10** — a primeira versão deste mapa dizia que
*"nenhuma fonte transcrita dá limiar inferior"* e parou aí. Está
**incompleto**: o **reconhecimento** **já tem fonte**, e com
grau máximo.

| # | | |
|---|---|---|
| 1 | **fatos** | `pas` · `pad` · `fc` |
| 2 | **critério de ameaça** | **nenhum corte numérico** — e isso **é da fonte**, não omissão nossa |
| 3 | **conduta (fonte-mãe)** | **F-05 · §4.3 rec. 1 · COR 1 · LOE C-LD · p. e350** — *"In patients with AIS, **hypotension and hypovolemia should be corrected** to maintain systemic perfusion levels necessary to support organ function."* |
| 4 | **operacional** | **NÃO EXISTE** — a AHA/ASA manda corrigir e **não diz como**, nem a partir de quanto |
| 5 | **parâmetros** | nenhum |
| 6 | **reavaliar** | não declarado |
| 7 | **resolução** | não declarada |
| 8 | **bloqueia?** | nem alerta — uma PA de **80/46** hoje **não acende** |

⚠️ O comentário do núcleo continua correto no que afirma: *"o app
não vai passar a acender por hipotensão: nenhuma fonte transcrita aqui dá
limiar inferior, e inventá-lo seria a conduta nascendo na tela (**E-31**)"*.
O que ele **não diz** é que a **obrigação de corrigir** tem
COR 1. O buraco **não é de fonte** — é **de operacionalização**.

### ⚠️⚠️⚠️ O SLOT DE CHOQUE — decisão do autor, 2026-09-10

**Fonte-mãe do contexto:** AHA/ASA 2026 (**F-05**) — ela **já
sustenta** o reconhecimento e a obrigação de corrigir.

**Fonte complementar operacional:** **ESICM 2025 — *circulatory shock and
hemodynamic monitoring***, no padrão de F-18/F-19 (procedência separada).

O slot tem de **separar sete coisas**, e **nenhuma delas pode
ser deduzida da outra**:

| passo | o que precisa vir da fonte |
|---|---|
| **1 · reconhecimento** | critérios **clínicos de hipoperfusão**, e **não** «PAS abaixo de X» |
| **2 · tipo de choque** | como distinguir (inclusive ecocardiografia, se a fonte a usar) |
| **3 · *fluid responsiveness*** | como avaliar **antes** de infundir |
| **4 · fluidos** | quando indicados, e em que volume |
| **5 · vasopressor / inotrópico** | qual, por perfil, com dose e via |
| **6 · reavaliação** | o que se remede, e em que intervalo |
| **7 · estabilizado o suficiente** | o critério para **seguir o fluxo do AVC** |

**Duas proibições explícitas do autor:** **não** importar
automaticamente algoritmo de **sepse** para todo choque; **não** criar
limiar numérico de hipotensão por conveniência.

### O QUE EU **NÃO POSSO** FAZER SOZINHO

**Não tenho o PDF da ESICM 2025**, e o contrato do módulo proíbe
número clínico antes da transcrição verbatim **com página**. Escrever
de memória é exatamente o que produziu a definição fabricada da
hipodensidade — que sobreviveu transcrita, traduzida, renderizada e
**exigida por uma trava verde**.

⚠️ O caminho é o mesmo de **F-18**, que nasceu de *"revisão
clínica do autor, entregue em 2026-09-06"* e foi **conferida** contra
a AHA/ASA. Preciso do documento.

---

## M · METABÓLICO — hoje ele **é** o eixo D, e não deveria ser

### M1 · Hipoglicemia ✅ **completo**

| # | | |
|---|---|---|
| 1 | **fatos** | `glicemia` (instância própria desde **D-133**) |
| 2 | **ameaça** | **< 60 mg/dL** — corte explícito (F-06) |
| 3 | **conduta** | F-06 · *"hypoglycemia should be treated to avoid complications"* |
| 4 | **operacional** | ✅ **F-18** |
| 5 | **doses** | ✅ glicose EV 25 mL (12,5 g) · glicose oral 15 g · glucagon 1 mg IM/SC ou 3 mg intranasal |
| 6 | **reavaliar** | ✅ `resolvePor: "Uma nova glicemia"` + **reavaliar o déficit** (F-06 §4.6.1) |
| 7 | **resolução** | nova glicemia ≥ 60 |
| 8 | **bloqueia?** | não navega · bloqueia o portão |

### M2 · Hiperglicemia ⚠️ **parcial, e por decisão**

`> 180 mg/dL` pede conduta (`pedeConduta: true`) mas **não bloqueia**
— o conteúdo diz *" não bloqueia a trombólise isoladamente"*. Alvo
140–180 (COR 2a) e insulina existem em **F-18**; o que não existe é
**ciclo de reavaliação** — e você já confirmou que **não deve
virar bloqueio**.

---

## D · NEUROLÓGICO — a descoberta que muda o desenho

| # | | |
|---|---|---|
| 1 | **fatos** | `deficit_focal` (F-13) · `nihss_calculado` / `nihss_informado` (F-13/F-17) · `lateralidade` · `crise_no_inicio` (F-24) · `consciencia_rebaixada` (hoje mora em **A**) |
| 2 | **ameaça** | ⚠️ **só a crise convulsiva** é ameaça tratável |
| 3 | **conduta** | F-24 rec. 1 · **COR 1 · LOE C-LD** — antiepiléptico após crise **não provocada**. E o contra: rec. 2 · **COR 3: No Benefit** — **nada** de profilaxia |
| 4 | **operacional** | **F-25 · estado `ponteiro`** — *"Terapêutica anticonvulsiva"* **declarado e não transcrito** |
| 5 | **doses** | nenhuma |
| 6 | **reavaliar** | não declarado |
| 7 | **resolução** | não declarada |
| 8 | **bloqueia?** | não |

### ⚠️⚠️ DÉFICIT E NIHSS **NÃO SÃO AMEAÇA A CORRIGIR**

Eles **caracterizam o AVC** e alimentam o **portão da reperfusão**
(`deficit_focal` tem 7 leituras, incluindo `portao-ivt`). **Não existe
«corrigir o déficit»** — o tratamento dele **é a reperfusão**, que é
a fase seguinte.

### E O GLASGOW NÃO TEM FONTE

`fonte: ""` · `natureza: "administrativo"` · **0 leituras** no núcleo.
A nota do próprio conteúdo: *"A escala recomendada no AVC é o NIHSS (…)
**A fonte não define corte e não usa Glasgow no AVC isquêmico.**"*
Varredura na transcrição: **zero ocorrências de «Glasgow»**.

---

## E · EXPOSIÇÃO **sem fonte, sem consumidor**

`temperatura`: `fonte: ""` · `natureza: "administrativo"` · *"Nenhuma
recomendação deste módulo é calculada a partir dele"*. O eixo **nunca
acende** — por construção. Varredura por `fever|hyperthermia|antipyretic` em
**todas** as 11 fontes verbatim: **zero**.

⚠️ Na **HIC** a fonte fala (H-06, COR 2b, tratar temperatura elevada) — mas
é **texto de recomendação**, e nem lá o valor medido alimenta
nada.

---

## Resumo: quem cumpre o contrato hoje

| eixo | ameaça | tratamento | reavaliação | resolução | completo? |
|---|---|---|---|---|---|
| **A** via aérea | ✅ F-23 | | | | **não** |
| **B** respiração | ✅ F-23 | ⚠️ só a meta | | ⚠️ derivável | **não** |
| **C1** HAS | ✅ F-04 | ✅ F-19 | ✅ | ✅ | **✅ sim** |
| **C2** choque | sem limiar | | | | **não existe** |
| **M1** hipo | ✅ F-06 | ✅ F-18 | ✅ | ✅ | **✅ sim** |
| **M2** hiper | ✅ F-06 | ⚠️ F-18 | | | parcial **por decisão** |
| **D** crise | ✅ F-24 | F-25 ponteiro | | | **não** |
| **D** déficit/NIHSS | — | — | — | — | **não é correção** |
| **E** exposição | sem fonte | | | | **não deveria ser eixo** |

**Dois de nove** cumprem o contrato inteiro. E os dois são exatamente os
que ganharam **slot operacional complementar** (F-18, F-19).

## O que falta transcrever, em ordem de dor clínica

| # | slot | assunto | por que agora |
|---|---|---|---|
| 1 | **F-25** | terapêutica anticonvulsiva | já é **ponteiro declarado**; crise é ameaça imediata com COR 1 |
| 2 | **novo** | oxigenoterapia e suporte ventilatório | hipoxemia é a ameaça mais frequente da lista |
| 3 | **novo** | via aérea operacional na estabilização | COR 1 sem nenhum operacional |
| 4 | **novo** | choque/hipotensão na estabilização | hoje **não acende** — e é ameaça à vida |

⚠️⚠️ **Nenhum deles pode ser escrito por mim de memória.** O contrato
do módulo (**§spec**) proíbe número clínico antes da transcrição
verbatim com página. O caminho é o mesmo de F-18/F-19: você escolhe
a fonte, ela é transcrita com procedência própria, e só então vira
tela.

---

# Transições entre módulos — ⚠️ **sub-rotina clínica**, e não link

**Decisão do autor, 2026-09-10.** Documentado aqui; **nenhum código**.

## A forma

```
problema detectado
  → estabilização mínima NO MÓDULO ATUAL
    → se houver indicação clínica → oferecer continuidade em módulo especializado
      → ao concluir ou sair → RETORNO ao ponto exato de origem
```

⚠️⚠️ *"O médico sai temporariamente do fluxo do AVC, resolve aquela
necessidade, e quando termina volta **exatamente** para o ponto em que
estava, com todo o estado preservado."*

## As transições previstas

| origem | gatilho clínico | destino |
|---|---|---|
| Estabilização · **A** | ameaça de via aérea **com indicação de intubação** | **ISR** |
| **ISR** concluída | via aérea definitiva estabelecida | **Ventilação mecânica** |
| pós-intubação | necessidade de sedação/analgesia contínua | **Sedação / analgesia** |
| Estabilização · **C2** | choque / hipotensão | **Drogas vasoativas / hemodinâmica** |
| Estabilização · **C1** | HAS grave, quando aplicável | **Anti-hipertensivo / vasoativas** |
| **qualquer fase** | deterioração para PCR | **PCR / ACLS** |

## As regras — e elas existem para isto não virar emaranhado

1. **O módulo de origem NUNCA depende do destino** para concluir a sua
própria lógica mínima. Se o ISR não existir, o AVC **continua
sabendo** que há ameaça de via aérea e o que fazer naquele nível.
⚠️ É a **D-104** virada do avesso: lá o link morreu e levou a
orientação junto; aqui a orientação **vive sem o link**.
2. **Transição aparece por indicação clínica real** e estado compatível —
**nunca** como menu genérico.
3. **O contexto vai junto**: peso, sinais vitais, fármacos já usados,
oxigenação, via aérea, decisões anteriores. **Sem redigitar.**
4. **Não duplicar fatos** já registrados.
5. **Transição é navegação/workflow**, e **NÃO fonte clínica**.
⚠️ Ela **não deriva nada**, do mesmo jeito que o histórico de
aferições é janela e não fonte (**D-134**).
6. **Não misturar conteúdo do destino dentro da origem** além do
mínimo de estabilização.

# O retorno — ⚠️ **obrigatório**, com checkpoint

**Decisão do autor:** *"não pode ser «abre outro módulo e se vira»"*.

## O que cada transição registra

| campo | por quê |
|---|---|
| **módulo de origem** | para onde voltar |
| **superfície/fase de origem** | voltar ao módulo **não é** voltar ao ponto |
| **ponto exato do fluxo** | scroll, eixo aberto, campo em foco |
| **motivo da saída** | o problema que **justificou** sair |
| **contexto clínico carregado** | o que foi levado, para não redigitar |
| **resultado do módulo especializado** | o que aconteceu lá |
| **estado de resolução ao retornar** | resolvido · parcial · pendente |

## As regras do retorno

- **nada de reiniciar** o módulo de origem;
- **nada de perder** scroll, fase ou pendências;
- fatos novos entram no **contexto compartilhado**;
- o workflow de retorno **não vira fonte clínica**;
- o destino **não reescreve** fatos antigos da origem — ⚠️ é a mesma
regra de *nova medida ≠ correção* (**D-133**);
- **se o problema NÃO estiver resolvido**, o AVC volta **mostrando
a pendência ainda ativa**.

## ⚠️ Exemplos, ponta a ponta

```
AVC · Estabilização → ameaça de via aérea → ISR → VM → volta à Estabilização
     e o AVC já sabe: houve intubação · qual dispositivo · via aérea confirmada
     · ventilação iniciada · sedação/vasoativas se houve · e se a ameaça
     ficou resolvida, parcial ou pendente

AVC · Estabilização → choque → vasoativas/hemodinâmica → volta ao MESMO ponto

AVC → PCR/ACLS → ROSC → volta ao fluxo do AVC no ponto clinicamente adequado
```

## ⚠️⚠️ O que já existe no repositório, e o que falta

`lib/open-clinical-module.ts` **já** abre módulo clínico com sessão
e evento — mas **só para `pcr-adulto`**, e **sem retorno**:
ele faz `router.push`, e **não registra** origem, ponto nem
motivo.

**Não existe** hoje: contexto compartilhado entre módulos, pilha
de retorno, checkpoint de ponto exato, nem estado de resolução na volta.

⚠️ É **arquitetura nova**, e ela **não deve nascer** junto com
o slot de choque: uma coisa é **conteúdo clínico**, a outra é
**workflow**. Misturá-las faria a transcrição esperar pela
navegação.
