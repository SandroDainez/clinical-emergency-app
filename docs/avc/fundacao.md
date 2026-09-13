# Fundação · o que construir antes da primeira tela

**Data:** 2026-09-13 · **Natureza:** lista de entregas. **Nada aqui está
implementado**, e nada foi implementado nesta rodada.

Cada entrega diz o que já existe para reaproveitar (medido em
`docs/avc/inventario.md`), o que falta, a regra que ela preserva e o que ela
desbloqueia nos outros módulos. As entregas são separadas: cada uma pode ser
revisada e testada sozinha.

## Pré-requisitos que só o autor resolve

Antes de qualquer das quatro, três decisões (detalhe em `docs/status.md`):

1. **Base arquitetural.** O AVC existente não roda sobre motor em grafo. Evoluí-lo
   ou reconstruí-lo muda o tamanho de RQ-FUN-04.
2. **Offline/local-first** — decisão de E01 **[CORREÇÃO 12/09]**.
3. **Conflito multiusuário** — decisão de E01 **[CORREÇÃO 12/09]**.

---

## RQ-FUN-01 · Ficha de paciente compartilhada entre módulos

### O que é

Um registro do paciente que atravessa módulos no mesmo atendimento, para o médico
não informar de novo o que o app já sabe.

### A regra que ela preserva

**Valores voláteis nunca são preenchidos sozinhos.** Sempre com horário e origem.

| tipo | exemplos (de `lib/contexto-do-paciente.ts`) | comportamento |
|---|---|---|
| estável no atendimento | peso, origem do peso, altura, sexo, idade | pode vir preenchido, com a origem visível |
| volátil | PA, FC, SpO₂, glicemia, lactato, pH, potássio, NIHSS, Glasgow | **nunca** preenchido sozinho; pode ser **exibido** com horário e origem, para o médico decidir |

A razão está escrita em `lib/contexto-do-paciente.ts`, linhas 22–28: um valor
antigo preenchido parece plausível, não gera dúvida, e leva a conduta sobre um
dado morto.

⚠️ **A decidir:** o arquivo atual proíbe reaproveitar o volátil; a formulação
nova permite exibi-lo com horário e origem. É refinamento a confirmar.

### O que já existe

- `lib/contexto-do-paciente.ts`: lista fechada de campos e a justificativa. Vive
  em memória, validade de 1 h. Único consumidor é legado.
- `avc/conteudo/paciente.ts`: identificação, basais, alergias, anticoagulante,
  medicações e antecedentes do AVC.

### O que falta

- tipo explícito para **estável × volátil**, decidido por campo;
- persistência junto do atendimento (hoje em memória), conforme a decisão E01;
- horário observado, horário registrado, origem e autor em cada valor;
- estados desconhecido · pendente · presente · ausente · não aplicável;
- mudança de peso **não** altera evento histórico já calculado.

### O que desbloqueia

| módulo | por quê |
|---|---|
| `sepse-adulto` | volume e antimicrobiano dependem de peso |
| `drogas-vasoativas` | preparo e velocidade dependem de peso |
| `isr-rapida` | doses por peso |
| `anafilaxia` | adrenalina por peso |
| `correcoes-eletroliticas` | reposições por peso |
| `tep` | anticoagulação por peso |

---

## RQ-FUN-02 · Calculadora de fórmula

### O que é

Um cálculo escrito **uma vez**, usado em dois modos (p.26): consulta independente
e dentro do atendimento.

### As regras que ela preserva

- mesmo cálculo nos dois modos; o teste confere que coincidem;
- dentro do atendimento, recebe dados **confirmados com horário e origem** e
  permite revisar;
- **cálculo nunca registra administração**;
- consulta solta **não contamina** o paciente ativo;
- diferencia conversão matemática de decisão de indicar ou titular;
- cada ferramenta declara se é **conversor**, **escore** ou **orientação
  terapêutica**;
- número canônico com unidade; separador ambíguo é erro, não palpite.

### O que já existe

- `components/avc/calculadora-de-glasgow.tsx` (específica do AVC);
- `components/protocol-screen/clinical-calculators-screen.tsx` (independente);
- `scripts/valida-calculadoras.cjs`, `scripts/mapa-de-calculadoras.cjs`,
  `auditoria/limiares-de-calculadora.json`.

### O que falta

- o componente embutido: `calculadora-embutida.tsx` **não existe**;
- a PAM estimada de T01 como função reutilizável (hoje só texto de estratégia);
- o contrato "dados confirmados com horário e origem" na entrada;
- testes de unidade, tipo de peso, arredondamento e concentração confrontados com
  casos revisados independentemente, e não com a mesma fórmula copiada.

### O que desbloqueia

| módulo | por quê |
|---|---|
| `drogas-vasoativas` | conversão dose ↔ velocidade |
| `correcoes-eletroliticas` | reposição |
| `calculadoras-clinicas` | escores com o mesmo núcleo |
| `injuria-renal-aguda` | método de TFG já tem trava própria |
| AVC | PAM estimada, dose do trombolítico por peso |

---

## RQ-FUN-03 · Contrato comum de módulo

### O que é

O que todo módulo declara para existir no app (p.23), mais a chamada e o retorno
entre módulos (p.4, C05).

### Os campos

| campo | origem |
|---|---|
| ID estável; família; versão; idiomas | p.23 |
| entradas aceitas; eventos produzidos; dependências | p.23 |
| estado de validação | p.23 |
| rota de entrada e retorno | p.23 |
| `encounterId`; intervenção solicitada; contexto clínico; observações atuais; ponto de retorno | p.4 |
| devolve: eventos, suporte ativo, resposta medida, pendências | p.4 |
| pilha de navegação para chamadas sucessivas | p.4 |

### As regras que ele preserva

- **voltar ≠ resolução**; a ameaça fica pendente até reavaliação;
- módulo indisponível aparece como indisponível, e permite registrar conduta
  externa **sem simular execução**;
- exames, infusões e transferências em andamento continuam ativos durante a
  chamada;
- cada módulo declara as próprias capacidades, sem assumir as oito etapas do AVC.

### O que já existe

- `lib/modulos-canonicos.ts`: IDs canônicos, rótulos e apelidos dos módulos;
- `lib/module-return-handoff`: retorno de via aérea, usando o motor legado em
  `app/modulos/[id].tsx:78`.

### O que falta

- `encounterId`: zero ocorrências no repo;
- a pilha de retorno;
- os campos de família, idiomas, eventos, dependências e estado de validação;
- os testes de retorno aninhado, cancelamento, interrupção e recuperação.

### O que desbloqueia

| módulo | por quê |
|---|---|
| `isr-rapida` → `ventilacao-mecanica` → `sedoanalgesia` | a cadeia AVC → via aérea → pós-intubação → retorno |
| `pcr-adulto` | integração por adaptador (C12), com contrato previsto desde o início |
| `sindromes-coronarianas`, `edema-agudo-pulmao`, `anafilaxia`, `tep`, `choque` | cada emergência guiada entra pelo mesmo contrato (C11) |

---

## RQ-FUN-04 · Formato do grafo declarativo e regras do linter

### O que é

O formato em que cada emergência é escrita como **conteúdo**, lido por **um**
motor, e as regras que reprovam o build quando o conteúdo viola o contrato.

### O que já existe

- `auditoria/ARQUITETURA-MAE.md` — **arquivado**, descreve o alvo: tipos de nó
  (§4), rede clínica e contrato de aresta (§6), travas e linter (§7);
- `auditoria/ARQUITETURA-MAE-EMENDAS.md` — força da afirmação e `contextoDaFonte`;
- `core/decision-tree/types.ts:553` — `ForcaDaAfirmacao` com os quatro valores e
  `ProcedenciaDaConduta`, **no motor legado**.

⚠️ As §7.1–§7.10 da ARQUITETURA-MÃE **não foram lidas integralmente** nesta
rodada. Antes de fixar o linter, é preciso reconciliar a lista abaixo com elas.

### Regras do linter — derivadas do PDF e das correções

Cada uma reprova o build, com mutação que prove que ela morde (R-1).

| # | o linter reprova | origem |
|---|---|---|
| L-01 | decisão sem ramo **"não sei"** que leve a perguntas menores | [CORREÇÃO 12/09] |
| L-02 | tela de ação que não responde o que dar, quanto, via, em quanto tempo, o que reavaliar e quando | [CORREÇÃO 12/09] |
| L-03 | item acima de **200 caracteres** | [CORREÇÃO 12/09] |
| L-04 | regra clínica sem fonte, localização, versão, população, **força** ou **`contextoDaFonte`** | p.12 + [CORREÇÃO 12/09] |
| L-05 | `recomendacao_formal` sem classe/grau literal | EMENDAS |
| L-06 | regra `pendente de validação médica` que produz recomendação afirmativa | p.12, C04 |
| L-07 | regra adulta sem o portão de população (pediátrica, gestante, puérpera) antes | [CORREÇÃO 12/09] |
| L-08 | decisão modelada como booleano onde precisa de não · desconhecido · não aplicável · pendente | p.12 |
| L-09 | nó sem saída (caminho sem saída) | C09 |
| L-10 | aresta para outro módulo sem ponto de retorno declarado | p.4 |
| L-11 | imagem sem justificativa de que muda a resposta; SVG sem procedência e licença | [CORREÇÃO 12/09] |
| L-12 | texto de tela sem par pt-BR/es por chave estável | p.25 |
| L-13 | critério clínico dentro de componente de interface | p.13 |
| L-14 | ficha farmacológica utilizável com dose, máximo, via, preparo ou monitorização ausente | p.12 |

### O que falta

Tudo em código: o esquema, o motor que o lê, o linter e as mutações.

### O que desbloqueia

| módulo | por quê |
|---|---|
| toda emergência guiada nova | C11 passa a ser escrever conteúdo, não código |
| AVC | só se a decisão arquitetural for reconstruir sobre o motor |
| todas | L-03, L-04, L-06 e L-07 passam a valer por construção, e não por revisão |

---

## Ordem proposta

```
decisões do autor (base, E01 offline, E01 multiusuário)
   ↓
RQ-FUN-03 contrato comum de módulo      ← RQ-FUN-01 e 02 dependem do encounterId
   ↓
RQ-FUN-01 ficha compartilhada   RQ-FUN-02 calculadora
   ↓
RQ-FUN-04 grafo e linter               ← tamanho depende da decisão de base
```

**Proposta, não decisão.** A ordem muda se o autor decidir evoluir o AVC
existente sem motor em grafo.
