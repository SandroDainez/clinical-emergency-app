# Matriz de regras clínicas · AVC

**Data:** 2026-09-13 · **Contrato:** p.12 de `docs/spec-avc.md`, mais força e
`contextoDaFonte` **[CORREÇÃO 12/09]**.

## ⛔ Leia antes de usar qualquer linha

- **Toda regra desta matriz está `pendente de validação médica`.** Nenhuma foi
  validada. O estado só muda com registro humano explícito: **nome, versão e
  data**, conforme o comando *"Preparar revisão médica de regra"* (p.21).
- **Nenhum critério foi completado de memória.** Onde o contrato pede critério,
  limiar, janela, dose ou contraindicação, a célula diz de onde ele deve ser
  transcrito. Não há critério, limiar ou dose neste arquivo. Os únicos números
  com unidade são os horizontes **24 h** e **48 h**, citados verbatim do próprio
  PDF (T08), e não parâmetros de regra.
- **Força e `contextoDaFonte` estão todos `pendente`.** Eles se declaram lendo a
  fonte, não se inferem pelo tipo do documento.
- **Errata:** nenhuma regra que dependa da AHA/ASA 2026 é parametrizada sem
  conferir *Stroke 2026;57(8):e461–e467*. Em 2026-09-13 a errata **não está no
  repositório** (`docs/avc/inventario.md`).
- **Slot** é ponteiro para a transcrição em `protocols/fontes-verbatim/`, e não
  prova de que a regra está correta. Os estados medidos dos slots estão na tabela
  do fim.

## O contrato de cada regra

| campo | o que exige |
|---|---|
| ID estável | não muda com tela, ordem ou texto |
| pergunta clínica | a pergunta que a regra responde |
| população | a quem se aplica, como a fonte declara |
| contexto | cenário e fase |
| entradas/unidades | observações consumidas, com unidade |
| critérios | **transcritos da fonte, com localização** |
| dados essenciais | sem eles, a regra devolve "informação essencial pendente" |
| saída | um dos resultados da p.12 |
| ausências e contradições | o que faz sem dado e com dado conflitante |
| exceções | como a fonte as declara |
| justificativa | por que a regra existe |
| fonte/localização | documento, seção e página |
| versão | da fonte e da regra |
| força | `recomendacao_formal` · `pratica_aceita` · `mecanismo_fisiologico` · `definicao` |
| `contextoDaFonte` | população e cenário **originais** da fonte, quando diferem |
| status da validação | `pendente de validação médica` até registro humano |
| casos de teste | IDs A01–A18 e os que faltarem |

**Saídas possíveis (p.12):** critérios atendidos · condição corrigível ·
contraindicação identificada · sem indicação neste caminho · inconclusivo por
falta de dados · avaliação especializada. **Separadas:** disponibilidade do
tratamento e decisão do médico.

**Nenhuma regra usa booleano simples** onde precisa distinguir "não",
"desconhecido", "não aplicável" e "pendente".

---

# Regras

Cada bloco segue o contrato. Onde o valor é o mesmo para todas, ele vale por
omissão:

> **força:** pendente · **`contextoDaFonte`:** pendente · **versão da regra:**
> 0 (rascunho) · **status:** pendente de validação médica · **critérios:** não
> escritos — transcrever da fonte com localização

## Reperfusão isquêmica

### RQ-REG-IVT-IND · Indicação de trombólise IV

| campo | valor |
|---|---|
| pergunta | há indicação de IVT para este paciente, neste caminho? |
| população | adulto com AVC isquêmico provável; **após** RQ-REG-POP |
| contexto | isquemia provável, antes da reperfusão |
| entradas | marcos temporais (RQ-T01-02), NIHSS válido, déficit incapacitante, imagem interpretada |
| dados essenciais | marco temporal utilizável; imagem sem hemorragia |
| ausências | marco desconhecido ⇒ caminho de início desconhecido, nunca descoberta como início |
| contradições | marcos opostos ⇒ reconciliação, sem escolha automática |
| fonte candidata | AHA/ASA 2026 · slots **F-02**, **F-03**, **F-17** |
| casos | A04, A05, A14 |

### RQ-REG-IVT-SEG · Segurança para trombólise IV

| campo | valor |
|---|---|
| pergunta | há impedimento, condição corrigível ou informação essencial pendente para IVT? |
| população | adulto com indicação avaliada |
| entradas | anticoagulante com fármaco, dose e última tomada; exames; antecedentes |
| ausências | última tomada desconhecida ⇒ incerteza explícita, não "sem efeito" |
| saída | impede neste contexto · corrigir e reavaliar · decisão especializada · informação pendente |
| justificativa | ausência de contraindicação não vira indicação (T05) |
| fonte candidata | AHA/ASA 2026 · slots **F-07**, **F-10** |
| casos | A03, A14 |

### RQ-REG-IVT-CORR · Condição corrigível

| campo | valor |
|---|---|
| pergunta | a condição corrigível foi corrigida? |
| entradas | **nova medida** após a intervenção |
| ausências | intervenção registrada sem nova medida ⇒ condição continua pendente |
| justificativa | medicamento administrado não prova correção (p.5) |
| fonte candidata | AHA/ASA 2026 · slots **F-04**, **F-06**; operacional **F-18**, **F-19** |
| casos | A02, A10 |

### RQ-REG-EVT · Elegibilidade para trombectomia

| campo | valor |
|---|---|
| pergunta | o paciente é candidato a EVT, ou há dúvida relevante que exige referência? |
| população | adulto com isquemia provável |
| entradas | clínica, vaso, imagem, contexto |
| justificativa | resultado **independente** do IVT; IVT impedida não bloqueia EVT |
| saída | candidato · dúvida relevante ⇒ acionar referência e verificar acesso · sem indicação |
| fonte candidata | AHA/ASA 2026 · slot **F-08** |
| casos | A08 |

### RQ-REG-IMG · Saída da imagem

| campo | valor |
|---|---|
| pergunta | a imagem interpretada abre hemorragia, isquemia provável ou dúvida? |
| entradas | exame em estado **interpretado** |
| ausências | exame só solicitado ⇒ não exclui hemorragia |
| justificativa | TC sem alteração aguda não exclui AVC (p.5) |
| fonte candidata | AHA/ASA 2026 · slot **F-16** |
| casos | A01, A07 |

## Avaliação neurológica

### RQ-REG-NIHSS · Validade do total

| campo | valor |
|---|---|
| pergunta | o total do NIHSS é válido? |
| entradas | cada item oficial com pontuação e regra de impedimento |
| ausências | item não avaliável **não vale zero**; avaliação incompleta **não gera total** |
| fonte candidata | instrumento oficial do NIHSS — **direitos de uso pendentes** |
| força | pendente — **não se infere pelo tipo do instrumento**; declarar lendo a fonte |
| casos | A06 |

### RQ-REG-INCAP · Déficit incapacitante

| campo | valor |
|---|---|
| pergunta | o déficit é incapacitante, independentemente da pontuação? |
| entradas | impacto em comunicação, marcha, visão e funções habituais |
| justificativa | NIHSS baixo não exclui incapacidade (T03) |
| fonte candidata | AHA/ASA 2026 · slot **F-17** |
| casos | A05 |

## Ameaças imediatas

### RQ-REG-AMEACA · Ameaças de via aérea, ventilação, oxigenação e perfusão

| campo | valor |
|---|---|
| pergunta | há ameaça imediata que muda a ação agora? |
| entradas | achados observáveis, com instrução de exame |
| ausências | "não sei" ⇒ perguntas menores; não avaliado ≠ ausente |
| saída | ameaça pendente até nova medida |
| fonte candidata | AHA/ASA 2026 · slot **F-23**; choque **F-32**, **F-33**, **F-34** e **F-35a** (cardiogênico); **F-35d** a **F-35h** abertos, por mecanismo |
| casos | A02, A09, A11 |

### RQ-REG-PA-IVT · Controle pressórico por diagnóstico e fase

| campo | valor |
|---|---|
| pergunta | qual o alvo pressórico **deste** diagnóstico, **nesta** fase e estratégia? |
| justificativa | não aplicar alvo genérico de normalização (T02) |
| fonte candidata | AHA/ASA 2026 · slots **F-04**, **F-05**; operacional **F-19** |
| casos | A02 |

### RQ-REG-GLIC · Glicemia

| campo | valor |
|---|---|
| pergunta | a glicemia exige correção, e o déficit persiste após corrigida? |
| justificativa | correção glicêmica com déficit persistente ⇒ reavaliação neurológica e investigação continuam |
| fonte candidata | AHA/ASA 2026 · slot **F-06**; operacional **F-18** |
| casos | A10 |

### RQ-REG-CONV · Crise convulsiva

| campo | valor |
|---|---|
| pergunta | há crise convulsiva que muda a ação? |
| fonte candidata | AHA/ASA 2026 · slots **F-24**, **F-25** |
| casos | a criar |

## Hemorragia — caminho próprio [CORREÇÃO 12/09]

### RQ-REG-HIC-REV · Reversão de anticoagulação por agente

| campo | valor |
|---|---|
| pergunta | qual reversão cabe para o agente em uso? |
| população | adulto com hemorragia intracerebral e anticoagulante |
| ausências | agente desconhecido ⇒ pendência explícita; não escolher reversor por padrão |
| fonte candidata | AHA/ASA 2022 (HIC) · slot **H-02** |
| casos | A07 |

### RQ-REG-HIC-PA · Alvo pressórico na HIC

| campo | valor |
|---|---|
| pergunta | qual o alvo pressórico na HIC para esta população? |
| fonte candidata | AHA/ASA 2022 (HIC) · slot **H-01** |
| casos | A07 |

### RQ-REG-HIC-CIR · Indicação neurocirúrgica

| campo | valor |
|---|---|
| pergunta | há indicação neurocirúrgica para esta hemorragia? |
| entradas | tipo, localização, volume, gravidade |
| fonte candidata | AHA/ASA 2022 (HIC) · slots **H-10**, **H-11** |
| casos | a criar |

### RQ-REG-HSA · Hemorragia subaracnóidea

| campo | valor |
|---|---|
| pergunta | a suspeita ou confirmação de HSA retém a reperfusão isquêmica e abre caminho próprio? |
| fonte candidata | AHA/ASA 2023 (HSA) · slots **S-01** a **S-08** |
| casos | a criar |

## Complicações da execução (T06)

> T06 · *"Deterioração neurológica, sangramento, angioedema e outras emergências
> abrem avaliação/resgate apropriados. [R2]"* Cada complicação tem regra própria:
> **uma fonte de uma complicação não se transporta para outra.**

### RQ-REG-COMP-SANG · Sangramento após trombólise

| campo | valor |
|---|---|
| pergunta | há sangramento após trombólise que exige avaliação e reversão? |
| população | adulto que recebeu trombolítico |
| contexto | após IVT |
| ausências | agente e horário da administração desconhecidos ⇒ pendência explícita |
| justificativa | complicação que abre resgate, não só registro (T06) |
| fonte candidata | **F-35c** (*Hemorragia após trombólise ou anticoagulação*) |
| ⚠️ transporte | a fonte transcrita no F-35c é de **alteplase**; ⛔ não transportar para tenecteplase sem fonte própria |
| casos | A11 |

### RQ-REG-COMP-CONTRASTE · Reação ao contraste iodado

| campo | valor |
|---|---|
| pergunta | a reação durante a imagem é anafilaxia ao contraste, e o que muda na conduta? |
| população | adulto exposto a contraste iodado na investigação |
| contexto | T04 · imagem com contraste |
| justificativa | complicação da investigação, com fonte específica da exposição |
| fonte candidata | **F-35b** (específica de contraste); **F-36** (anafilaxia geral) só onde o F-35b é silente |
| ⚠️ fluxo | continuar, interromper ou repetir a angioTC e seguir para trombectomia são **lacuna de fluxo**, não resolvida por nenhuma das duas |
| casos | a criar |

### RQ-REG-COMP-ANGIO · Angioedema após trombólise

| campo | valor |
|---|---|
| pergunta | há angioedema após trombólise que ameaça a via aérea? |
| população | adulto que recebeu trombolítico |
| justificativa | complicação citada na T06 |
| fonte candidata | **a localizar** |
| ⚠️ transporte | ⛔ **não** usar F-35b nem F-36: anafilaxia ao contraste e angioedema após trombolítico são entidades diferentes |
| casos | a criar |

## Recursos, destino e telemedicina

### RQ-REG-REC · Falta de recurso

| campo | valor |
|---|---|
| pergunta | o tratamento indicado está disponível e acessível agora? |
| justificativa | falta de recurso **não** é contraindicação; manter plano local e reavaliar acesso (p.5) |
| saída | disponível · ausente · incerto — **separado** da indicação clínica |
| fonte candidata | princípio de engenharia do PDF; **fonte clínica a localizar** |
| casos | A12 |

### RQ-REG-DEST · Destino

| campo | valor |
|---|---|
| pergunta | qual destino atende necessidade e capacidade? |
| justificativa | UTI não é destino automático universal |
| fonte candidata | Canadian Stroke Best Practices R4 (**não transcrita**); Portaria GM/MS 665/2012 (**não aberta**) |
| casos | a criar |

### RQ-REG-TRANSF · Transferência e telestroke

| campo | valor |
|---|---|
| pergunta | a transferência está solicitada, aceita, em trânsito ou entregue — e o parecer remoto participa? |
| entradas | contatos, aceite, transporte, marcos; **ator remoto** com horário e autor |
| ausências | aceite nunca se presume; estimativa é estimativa |
| fonte candidata | Linha de Cuidado do AVC — MS (**não aberta**); Portaria GM/MS 665/2012 (**não aberta**) |
| casos | A12 |

## Continuidade e falha terapêutica

### RQ-REG-FALHA · Deterioração e resposta insuficiente

| campo | valor |
|---|---|
| pergunta | a resposta foi insuficiente, ou o paciente piorou? |
| justificativa | deterioração reabre ameaças sem esperar tarefa agendada |
| fonte candidata | Canadian Stroke Best Practices R1, R6 (**não transcritas**) |
| casos | A11 |

### RQ-REG-48H · Plano por caminho

| campo | valor |
|---|---|
| pergunta | quais cuidados cabem até 48 h **neste** caminho? |
| contexto | após IVT · após EVT · sem reperfusão · hemorragia |
| fonte candidata | AHA/ASA 2026 · slot **F-15**; Canadian Stroke Best Practices R4, R6 (**não transcritas**) |
| casos | a criar |

### RQ-REG-ANTITROMB · Antitrombótico após IVT

| campo | valor |
|---|---|
| pergunta | a terapia antitrombótica está liberada? |
| justificativa | a passagem de 24 h **sozinha** não libera; exige imagem e avaliação (T08) |
| fonte candidata | Canadian Stroke Best Practices R5 (**não transcrita**); AHA/ASA 2026 — **localização a conferir** |
| casos | A15 |

### RQ-REG-ANTICOAG-48H · Anticoagulação não universal

| campo | valor |
|---|---|
| pergunta | há anticoagulação indicada neste contexto? |
| justificativa | não programar anticoagulação universal em 48 h (T08) |
| fonte candidata | Canadian Stroke Best Practices R5, R6 (**não transcritas**) |
| casos | a criar |

## População

### RQ-REG-POP · Pediátrica, gestante e puérpera [CORREÇÃO 12/09]

| campo | valor |
|---|---|
| pergunta | o paciente pertence a população com caminho próprio? |
| entradas | idade; gestação; puerpério |
| ausências | desconhecido **também** impede saída silenciosa de regra adulta |
| saída | encaminhar para avaliação adequada; **nunca** aplicar regra adulta em silêncio |
| ordem | roda **antes** de toda regra adulta |
| fonte candidata | fonte-mãe traz orientação pediátrica, filtrada na transcrição; gestante e puérpera **a localizar** |
| casos | a criar |

## Fichas farmacológicas (contrato p.12)

Cada ficha exige, validados: **seleção** (fármaco, contexto, alternativas,
contraindicações, ajustes) · **dose** (fórmula, tipo de peso, unidade, máximo,
via, repetição ou titulação) · **preparo** (apresentação, concentração, diluição,
volume final, compatibilidades) · **administração** (velocidade/duração,
dispositivo, verificações) · **resposta** (meta, monitorização, interrupção,
falha, eventos adversos) · **Brasil e serviço** (bula/registro, normas,
padronização, disponibilidade real, separados).

**Ausência em dose, máximo, via, preparo ou monitorização aplicável ⇒ ficha
indisponível para recomendação assistencial.**

| ID | ficha | fonte candidata | estado |
|---|---|---|---|
| RQ-FAR-01 | trombolítico | AHA/ASA 2026 **F-09**; preparo **F-20**; bulas BR | pendente de validação médica |
| RQ-FAR-02 | reversão de anticoagulante | AHA/ASA 2022 **H-02** | pendente de validação médica |
| RQ-FAR-03 | anti-hipertensivo IV | **F-19** (fontes BR) | pendente de validação médica |

---

# Registro de validação humana

| regra | versão | validado por | data | observação |
|---|---|---|---|---|
| — | — | — | — | nenhuma regra validada |

---

# Estado medido dos slots citados

Medido em `avc/conteudo/fontes.ts` em 2026-09-13, HEAD `52aa4e2`. Controle
positivo: 62 entradas de slot no arquivo. **"transcrito" é estado documental**,
e não validação médica.

| slot | estado | assunto |
|---|---|---|
| F-02 | transcrito | Janela para trombólise IV |
| F-03 | transcrito | Janela estendida e imagem avançada |
| F-04 | transcrito | Meta pressórica antes e depois da IVT |
| F-05 | transcrito | Conduta pressórica sem reperfusão |
| F-06 | transcrito | Glicemia: corte e alvo |
| F-07 | transcrito | Contraindicações à IVT |
| F-08 | transcrito | Elegibilidade para trombectomia |
| F-09 | transcrito | Trombolítico e dose por peso |
| F-10 | transcrito | Anticoagulante prévio e exames |
| F-15 | transcrito | Manejo inicial pós-reperfusão |
| F-16 | transcrito | Imagem: qual exame e o que decide |
| F-17 | transcrito | Déficit incapacitante |
| F-18 | transcrito | Correção glicêmica operacional |
| F-19 | transcrito | Anti-hipertensivo IV operacional |
| F-20 | **parcial** | Preparo do trombolítico |
| F-23 | transcrito | Via aérea, ventilação e oxigenação |
| F-24 | transcrito | Crise convulsiva no AVC |
| F-25 | **ponteiro** | Terapêutica anticonvulsiva |
| F-32 | transcrito | Choque circulatório e monitorização hemodinâmica |
| F-33 | transcrito | Choque no adulto — pathway operacional por mecanismo |
| F-34 | transcrito | Escolha do fluido de ressuscitação em adulto crítico |
| F-35a | transcrito | Choque cardiogênico — agentes vasoativos e faixas de dose |
| F-35b | transcrito | Anafilaxia por contraste iodado — reconhecer e tratar |
| F-35c | **parcial** | Hemorragia após trombólise ou anticoagulação |
| F-35d | **aberto** | Tromboembolismo pulmonar com instabilidade |
| F-35e | **aberto** | Tamponamento cardíaco — drenagem |
| F-35f | **aberto** | Pneumotórax hipertensivo — descompressão |
| F-35g | **aberto** | Hipovolemia não hemorrágica |
| F-35h | **aberto** | Crise adrenal |
| F-36 | **aberto** | Anafilaxia geral — broncodilatador, adrenalina EV e volume |
| H-01 | transcrito | HIC · PA aguda — meta e alvo pressórico |
| H-02 | transcrito | HIC · Reversão de anticoagulação por agente + doses |
| H-10 | transcrito | HIC · Cirurgia supratentorial (MIS, craniotomia, craniectomia) |
| H-11 | transcrito | HIC · Cirurgia cerebelar (≥15 mL, COR 1) |
| S-01 a S-08 | transcrito | HSA · ressangramento, aneurisma, vasoespasmo/DCI, monitorização, hidrocefalia, convulsões, complicações, sistemas de cuidado |

⚠️ **Nenhum slot da AHA/ASA 2026 foi conferido contra a errata**
*Stroke 2026;57(8):e461–e467*.

