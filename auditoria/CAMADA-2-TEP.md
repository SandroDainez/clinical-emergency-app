# Camada 2 — Auditoria científica do módulo TEP

**Fonte:** *MedCampus — Tromboembolismo Pulmonar Agudo*, capítulo clínico v1.2,
corte científico 28/07/2026, revisão médica do Dr. Sandro Dainez.

---

> ✅ **ATUALIZADO para a v1.3.** A versão 1.3 do capítulo acrescentou a seção
> "8.1.1 Regime sistêmico documentado" e a "8.1.2 Parada cardíaca atribuível ao
> TEP", que fecham exatamente a lacuna de posologia apontada abaixo — e produziram
> o achado mais grave deste módulo (TEP-04). O texto original da v1.2 fica
> preservado para rastreabilidade.

## ⚠️ Limite de escopo da v1.2 — resolvido na v1.3

Esta fonte é **deliberadamente diferente das anteriores**: ela não traz doses.

> "Este capítulo não reproduz doses operacionais, diluições ou nomogramas porque
> apresentações, critérios de ajuste e padronização institucional precisam ser
> confirmados na bula profissional vigente do produto disponível no Brasil."

E, sobre o trombolítico, é ainda mais explícita:

> "Alteplase é medicamento de alta vigilância. Este capítulo **não apresenta dose,
> preparo ou ordem de administração**."

**Consequência direta:** os números mais críticos do módulo de TEP no app —
alteplase 100 mg em 2 h (10 mg em bólus + 90 mg em infusão) e o regime acelerado de
0,6 mg/kg até 50 mg na PCR — **NÃO foram validados**, porque a fonte não os cobre.
Continuam pendentes de uma referência que traga posologia.

---

## O módulo estava melhor do que o esperado

Antes dos achados, o que já estava certo e alinhado:

| item | situação |
|---|---|
| Classificação A–E da AHA/ACC 2026 | presente e completa, com equivalência às categorias ESC |
| Escore YEARS, inclusive na gestante | presente |
| D-dímero ajustado por idade (ADJUST-PE) | presente |
| Volume cauteloso — "sobrecarga piora a função do VD" | presente |
| Norepinefrina como vasopressor | presente, 0,1–1 mcg/kg/min |
| Evitar sedação profunda e ventilação mecânica | presente |
| VA-ECMO no choque refratário | presente |
| HBPM preferida à HNF nas categorias C–E | presente |
| DOAC preferido ao antagonista da vitamina K | presente |
| Trombólise de resgate no intermediário-alto | presente |
| Duração: 3 meses se provocado, indefinido se não provocado | presente |
| Investigar HPTEC se dispneia > 3 meses | presente |

**Uma correção minha:** reportei de início que faltavam vasopressor e cuidado com
volume. Estava errado — a busca falhou porque o app escreve **"norepinefrina"** e
"ventilação mecânica", não os termos que procurei. O conteúdo estava lá.

---

## Achados aplicados

### 🟠 TEP-01 · Faltava a razão de NÃO trombolisar o normotenso

O app fazia a conduta certa — trombólise de resgate só na deterioração — mas sem
dizer por quê. Faltava o contrapeso que a fonte destaca:

> "Não use rotineiramente no paciente normotenso apenas por disfunção do VD e
> troponina elevada: no PEITHO, a tenecteplase reduziu descompensação hemodinâmica,
> mas **aumentou hemorragia grave e AVC hemorrágico**."

**Aplicado.** Sem essa frase, um plantonista com VD dilatado e troponina positiva na
mão tem todo incentivo para trombolisar — e o app não o desencorajava.

### 🟠 TEP-02 · Filtro de veia cava ausente do módulo inteiro

Nenhuma menção. **Aplicado:** não usar de rotina junto à anticoagulação; considerar
apenas em contraindicação absoluta TEMPORÁRIA, já com plano de retirada.

Filtro colocado sem indicação é dano permanente por decisão de minutos.

### 🟡 TEP-03 · Peso e obesidade extrema

**Aplicado:** peso real para HBPM sem teto empírico; em IMC > 40 ou peso > 120 kg,
apixabana e rivaroxabana conforme bula, com dados menos robustos para dabigatrana e
edoxabana; não reduzir dose apenas pelo peso.

---

---

## Achados da v1.3

### 🔴 TEP-04 · O app entregava calculada a dose que a fonte proíbe apresentar

| | |
|---|---|
| **Onde** | `tep-decision-tree.ts:34` e `:173` · `acls-reversible-causes-screen.tsx:156` |
| **O app fazia** | calculava `alteplaseAccel = min(0,6 × peso, 50)` e exibia "Acelerado (PCR/colapso): alteplase {X} mg IV em 15 min (0,6 mg/kg, máx 50 mg)". Na tela de causas reversíveis do ACLS: "Alteplase **50 mg IV em bolus** durante PCR" |
| **A fonte diz** | "A diretriz de ressuscitação AHA 2025 **não estabelece uma dose única de alteplase para esse cenário**. Portanto, **não apresente 0,6 mg/kg, máximo 50 mg**, nem **50 mg em bolus** como 'dose padrão de PCR'." |
| **Avaliação** | **Divergente — proibição explícita e nominal** |
| **Risco** | **Crítico.** A fonte cita textualmente os dois números que o app usava, um em cada tela |

O agravante é o app **calcular** o valor. Número calculado tem força de
recomendação: quem lê no meio de uma parada não distingue "o app fez a conta" de
"isto está validado".

**Aplicado:** o cálculo foi removido — não existe mais `alteplaseAccel` no código —
e as duas telas passam a dizer que a AHA 2025 não fixa dose única, que regime
acelerado exige protocolo institucional validado com fonte farmacológica explícita,
e que a duração ideal da RCP após fibrinólise permanece incerta (o app afirmava
"60–90 min").

### 🟠 TEP-05 · Faltava o teto de 1,5 mg/kg abaixo de 65 kg

A fonte: "Em pacientes com peso corporal inferior a 65 kg, a dose total **não deve
exceder 1,5 mg/kg**." O app trazia os 100 mg em 2 h sem essa ressalva — mesma classe
do achado da enoxaparina na SCA: dose por regime fixo sem o teto que a protege.

**Aplicado**, junto da regra de preparo: não misturar nem administrar outro
medicamento, inclusive heparina, no mesmo frasco, solução ou acesso da alteplase.

### 🟠 TEP-06 · Reinício da heparina por número absoluto

O app dizia "reiniciar quando TTPa < 80 s". A fonte usa a regra relativa: **abaixo de
2× o limite superior da normalidade**, ajustando pelo nomograma institucional — que
não é o mesmo em todo laboratório.

**Aplicado**, com o protocolo de sangramento grave que faltava: interromper
imediatamente alteplase e heparina e acionar o protocolo de hemorragia do serviço.

---

## Avaliação do material

**É bom, e é honesto de um jeito que os outros não foram.**

A qualidade que o distingue é justamente a que mais limita o uso aqui: **ele recusa
dar dose**. Isso não é falha — é escolha editorial defensável para material
educacional, e está declarada em dois lugares. Mas significa que, para o app, esta
fonte serve para **estratégia e estratificação**, não para posologia.

O que ele faz muito bem:

1. **Ataca a linguagem imprecisa.** A armadilha contra "maciço/submaciço" sem
   definição é o tipo de coisa que só aparece em material revisado com cuidado.
2. **Distingue anatomia de fisiologia.** "TEP anatômico grande não equivale
   automaticamente a alto risco; fisiologia decide urgência."
3. **Registra a errata da diretriz.** Cita que a errata de julho de 2026 substituiu
   a Tabela 4 da AHA/ACC — nível de rastreabilidade acima do usual.
4. **Referências completas com DOI e PMID**, incluindo a diretriz brasileira de 2025
   e a Diretriz Conjunta sobre TEV de 2022.

**O que falta para o app:** uma fonte com posologia de trombolítico e
anticoagulante no TEP. Sem ela, os números que o app calcula seguem sem validação
documental.
