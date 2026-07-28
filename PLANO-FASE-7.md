# PLANO-FASE-7.md — migrar o shell de 19 módulos

Estratégia dedicada, porque a Fase 7 não é "repetir a Fase 6 mais vezes".

---

## Por que esta fase é diferente

As Fases 3 a 6 migraram **cinco telas**, cada uma num arquivo próprio, cada uma
com um commit e a suíte completa entre elas.

A Fase 7 é dominada por **um único arquivo**:
`components/protocol-screen/acls-decision-flow-screen.tsx`, usado por **19
módulos** (ver **L-005** em `NOTAS-LOGICA.md` — o mapa da Fase 0 identificou o
shell errado, e isso só foi descoberto na Fase 6).

| | Fases 3–6 | Fase 7 |
|---|---|---|
| Unidade de mudança | 1 tela | 1 arquivo = 19 módulos |
| Estado | nenhum (telas de referência) | `DecisionTreeEngine` |
| Conteúdo visível no 1º render | tudo | só o passo atual |
| Se der errado | 1 módulo afetado | sepse, AVC, anafilaxia, coronárias… |

Os 19: sepse, anafilaxia, AVC, síndromes coronarianas, TEP, CAD/EHH, EAP,
ventilação mecânica, ISR, politrauma, TCE, crises convulsivas, intoxicações,
choque, insuficiência respiratória, abdome agudo, pré-eclâmpsia, bradicardia
ACLS e taquicardia ACLS.

---

## Os dois pré-requisitos — ✅ ambos resolvidos

### 1. A flag precisa funcionar POR MÓDULO, dentro do shell

Sem isso, migrar o shell é tudo ou nada: ou os 19 módulos mudam juntos, ou
nenhum. Validação incremental deixaria de existir.

**Resolvido, e sem tocar em nenhum dos 19 arquivos:** todos os chamadores já
passam `currentModuleSlug` (`"sepse-adulto"`, `"anafilaxia"`, …). O shell sabe
qual módulo está renderizando e pode consultar a flag individualmente:

```tsx
const emV2 = useUiV2Enabled(currentModuleSlug ?? "");
```

Verificado por teste: ligar a flag num módulo não afeta outro que usa o mesmo
shell.

### 2. O teste de paridade precisa cobrir os QUATRO tipos de passo

O teste das Fases 3 a 6 compara o **primeiro render**. Aqui isso não basta: o
conteúdo clínico só aparece conforme o médico avança, e o shell tem quatro tipos
de passo — `decision`, `action`, `input` e `transition`.

**Resolvido:** `e2e/fluxo-decisao-paridade.spec.ts` percorre a árvore escolhendo
sempre a primeira opção, passo a passo, e compara o conteúdo de **cada passo**
entre as duas versões. Roda em três módulos representativos (anafilaxia, sepse,
bradicardia), cobrindo árvores curtas, longas e com entrada de dados.

**E foi provado que ele falha quando deve.** Introduzi de propósito uma migração
que perdia a lista de evidências do passo de decisão; o teste apontou
`conteúdo perdido no passo 1 de "anafilaxia"`. Depois revertido. Um teste de
paridade que nunca viu uma divergência é um teste que ninguém sabe se funciona.

---

## Ordem de execução proposta

1. **Ligar a flag dentro do shell** (commit próprio, sem mudança visual). Só
   introduz `emV2` e o caminho alternativo vazio. Suíte verde comprova que nada
   mudou.

2. **Migrar por tipo de passo, não por módulo.** O shell tem quatro
   sub-componentes — `DecisionStep`, `ActionStep`, `InputStep`,
   `TransitionStep`. Um commit cada, com a travessia rodando entre eles.
   Migrar "por módulo" seria ilusório: o código é o mesmo para os 19.

3. **Cabeçalho e controles** por último: é onde a Fase 4 já provou haver ganho
   (o `StepHeaderBar` empilha com o cromado do módulo, como no PCR).

4. **Habilitar módulo a módulo**, começando pelos de menor risco clínico
   (abdome agudo, intoxicações), terminando nos de maior (sepse, AVC,
   anafilaxia). Cada habilitação é uma linha em `COM_CABECALHO_PROPRIO` e uma
   entrada na lista do teste de travessia.

---

## Riscos conhecidos e como estão cobertos

| Risco | Cobertura |
|---|---|
| Perder conteúdo clínico num passo | travessia passo a passo, provada por mutação |
| Quebrar a navegação da árvore | a travessia falha se o nº de passos divergir |
| Perder o alvo de 44 px nas opções | verificação de toque já existe na suíte |
| Reempilhar cabeçalho | teste de dobra do PCR + medição de topo do conteúdo |
| Hydration mismatch pela flag | `useUiV2Enabled` já resolve (L-001) |
| Contraste | `contraste-renderizado.spec.ts` mede a tela real |

## O que este plano NÃO cobre

A travessia escolhe **sempre a primeira opção**. Ela prova que o caminho
percorrido preserva o conteúdo — não que **todos** os ramos da árvore o
preservam. Cobrir a árvore inteira exigiria enumerar os caminhos a partir da
definição de cada árvore, o que é factível e vale fazer se algum ramo específico
mudar de comportamento.

É uma limitação real, e está aqui escrita para não ser confundida com cobertura
total.
