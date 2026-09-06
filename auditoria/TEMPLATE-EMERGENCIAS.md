# TEMPLATE EMERGÊNCIAS — o padrão definido pelo AVC

> **O módulo AVC é o *Gold Standard* de UX/UI e navegação clínica do aplicativo
> Emergências.** Aprovado pelo autor em **2026-09-05**, com a suíte em `EXIT=0`
> · **320 e2e** · **8 cenários clínicos** · contraste 42/42 · zero vazamento
> técnico · zero string sem tradução.

⚠️⚠️ **A PARTIR DAQUI ⛔ NÃO EXISTE MAIS "REDESIGN MÓDULO POR MÓDULO".** Existe
**aplicação deste template**. O conteúdo clínico muda; o sistema visual,
estrutural ⛔ e de navegação ⛔ **não muda**.

---

## 1 · ESTRUTURA — os doze componentes

Todos em `components/avc/sistema/index.tsx`. ⛔ Nenhuma tela nova redesenha o que
já existe aqui.

| componente | o que faz | ⛔ o que ⛔ não é |
|---|---|---|
| `ClinicalShell` | topo fixo + conteúdo rolável + navegação fixa | ⛔ não é um contêiner genérico |
| `ClinicalHeader` | duas linhas: voltar acima, título do módulo abaixo | ⛔ não carrega cronômetro grande |
| `PatientContext` | faixa de contexto **fixa**, cresce com o atendimento | ⛔ **não é card** — ⛔ sem contorno, ⛔ sem chips |
| `PhaseNavigation` | barra rolável, fase ativa auto-visível | ⛔ **não é árvore** ⛔ e ⛔ não tem badge numérico |
| `ScreenHeader` | nome da fase + o que ela pede | ⛔ não repete o nome do módulo |
| `ClinicalCard` | a **única** caixa do sistema (`aninhado` = 2º degrau) | ⛔ não se empilha por decoração |
| `DecisionSection` | pergunta + contexto + opções, dominante | ⛔ não cria fluxo obrigatório |
| `PrimaryAction` | ação principal, rótulo que **nomeia o efeito** | ⛔ não é "Continuar" |
| `SecondaryAction` | alternativa legítima, contorno | ⛔ não compete com a principal |
| `WarningCard` | 4 níveis: `info` · `atencao` · `risco` · `bloqueio` | ⛔ vermelho ⛔ não é ênfase |
| `EmptyState` | a ausência **pertence ao campo** | ⛔ ausência ⛔ nunca é âmbar |
| `InfoToggle` | o ⓘ, **na linha do que explica**, revelação inline | ⛔ nunca modal, ⛔ nunca órfão |
| `SafetyBadge` | os 5 estados de segurança, com texto ⛔ e símbolo | ⛔ **⛔ não é decoração** — ver §5 |

---

## 2 · REGRAS VISUAIS

**Tipografia** — `design-system/tipografia-clinica.ts`. Dez papéis sobre **sete
tamanhos** (11 · 13 · 14 · 16 · 17 · 22 · 26). ⚠️ O papel se escolhe pela
**função do texto**, ⛔ e ⛔ **nunca pelo assunto dele** — a lição custou uma
regra de dosagem renderizada em 22 pt/800 ocupando seis linhas.

**Spacing** — `ESPACO` (4/8/16/24/32). ⛔ Nada fora da grade.

**Tokens** — `tema.cores`, ⛔ sempre. `primary` = **ação** · `warning`/`critical`
= **risco** · `info` = **contexto** · neutro = **estrutura**.
⛔ Cor local ⛔ é proibida; a trava reprova hex em arquivo migrado.

**Contraste** — piso **4,5:1** para texto pequeno, nos **dois temas**.
`valida-contraste` (42 pares) ⛔ e `e2e/contraste-renderizado`.

**Cards** — antes de desenhar contorno, a ordem é: *dá para remover o
contêiner? dá para resolver com espaço ⛔ e tipografia? precisa de divisor? ⛔ só
então `surfaceElevated`.* ⚠️ O objetivo é **menos caixas**, ⛔ e ⛔ não caixas mais
bonitas.

**Densidade mobile** — 375×812 é o alvo. Cromado fixo em ~10% da altura.
⛔ A decisão clínica ⛔ não pode exigir rolagem para aparecer.

---

## 3 · REGRAS DE NAVEGAÇÃO

- ⛔ **⛔ NÃO-WIZARD** (**E-11**). Qualquer fase abre de qualquer outra, em
  qualquer ordem. ⚠️ Sequência ⛔ só **dentro** de um instrumento que tem ordem
  própria (o NIHSS), ⛔ e ⛔ nunca no módulo.
- **Fase atual sempre visível** — a barra rola sozinha para trazê-la à viewport.
- **Affordance de continuidade** — o médico precisa perceber que há fases fora
  da tela. ⛔ Faixa discreta, ⛔ e ⛔ não seta grande.
- **Retorno livre ⛔ e estado preservado** — ⛔ nada se perde ao ir e voltar.
- **Próxima ação explícita** — toda decisão tem consequência visível.
- ⛔ **Nome clínico ⛔ NUNCA trunca.** Quebra em duas linhas; quem cede espaço é
  o rótulo, ⛔ e ⛔ nunca o valor.

---

## 4 · REGRAS CLÍNICAS DE UX

| regra | por quê |
|---|---|
| **Progressive disclosure** | 13 campos juntos fazem a pergunta que governa o fluxo competir com detalhe |
| **Ação no ponto onde a decisão acontece** | ⛔ não mandar o médico procurar no Destino o que fazer com o que ele acabou de achar |
| **Dado conhecido ⛔ não é pedido de novo** | Destino é **síntese**, ⛔ e ⛔ não a última página do formulário |
| **Pendência vira ação clínica** | `acaoPendente()` — *"Definir se o déficit é incapacitante"*, ⛔ e ⛔ não `deficit_incapacitante` |
| **Estado interno ⛔ nunca na tela** | `rotuloClinico()` + trava `valida-rotulos-clinicos` |
| ⛔ **Recomendado ⛔ ≠ realizado** | o domínio já separa (`iniciada`/`realizada`); a tela **usa** a separação |
| ⛔ **Desconhecido ⛔ ≠ contraindicado** | falta de dado é **trabalho pendente**; contraindicação é **achado** |
| **Cor ⛔ nunca sozinha** (**E-15**) | todo estado carrega texto ⛔ e/ou símbolo |

---

## 5 · ⛔ NÃO FAZER

⛔ **Card dentro de card** ⛔ sem necessidade — use o 2º degrau de superfície.
⛔ **Barra colorida preenchida por seção** — seis blocos assim dão seis pesos
iguais ⛔ e ⛔ nenhuma hierarquia.
⛔ **Hex local.** ⛔ **`fontSize`/`fontWeight` local.** As duas travas reprovam.
⛔ **Slug interno na tela.** ⛔ **Badge redundante** — ⛔ se o texto já resolve
sozinho, ⛔ o selo vira ruído: ⛔ ícone + cor + rótulo + borda para **uma**
informação.
⛔ **Tela com cara de formulário.** ⛔ **Botão genérico** onde há ação clínica
clara. ⛔ **Informação crítica abaixo da dobra** ⛔ sem necessidade.
⛔ **Duplicação de contexto.** ⛔ **Recalcular estado derivado em mais de um
lugar** (**I6**) — duas verdades divergem na primeira mudança.

---

## 6 · REGRESSÃO OBRIGATÓRIA — ⛔ os cenários ⛔ NÃO são temporários

`e2e/avc-cenarios-clinicos.spec.ts` — **8 provas que ⛔ não podem ser removidas**:

1. **A** · isquêmico precoce → reperfusão
2. **B** · LVO / trombectomia — ⛔ a tela ⛔ não conclui elegibilidade
3. **C** · hemorragia → manejo hemorrágico abre
4. **D** · anticoagulado — Segurança abre **neutra**
5. **E** · déficit leve — ⛔ nenhum veredito
6. **F** · janela estendida — horário desconhecido ⛔ não fecha ⛔ nada
7. **INTERROMPIDO** — estado sobrevive a 7 trocas de fase
8. ⛔ **⛔ nenhum vazamento** de `snake_case`/`undefined`/`NaN` em 6 superfícies

⚠️ Escritos como teste ⛔ e ⛔ não como conferência manual: percorrer à mão prova
o caminho **de hoje**; escrito, ele volta a ser percorrido a cada mudança — ⛔ e é
numa refatoração visual que um beco reaparece ⛔ sem ⛔ ninguém notar.

---

## 7 · ⚠️⚠️ O NIHSS PARCIAL ⛔ NÃO É PERDA DE ESTADO

⛔ Sair da superfície com a escala pela metade **descarta o rascunho**, ⛔ e ⛔ isso
⛔ **não é defeito**: a escala grava em **gesto único**, porque **um NIHSS pela
metade ⛔ não é um NIHSS**.

⚠️⚠️ ⛔ **⛔ NÃO "CONSERTAR" ISSO.** Persistir escala incompleta como resultado
válido faria o app publicar um escore que ⛔ ninguém mediu — ⛔ e escore é o que
decide janela ⛔ e elegibilidade. ⚠️ O que ⛔ **não** pode sumir é o **fato
registrado**, ⛔ e o cenário INTERROMPIDO prova que ele sobrevive.

---

## 8 · O QUE O JULGAMENTO VISUAL PEGOU E O TESTE ⛔ NÃO PEGARIA

⚠️ Registrado porque justifica a captura fazer parte do processo, ⛔ e ⛔ não ser
etapa opcional:

1. **`DecisionSection` invisível** — compilava, 18 testes passavam, ⛔ e ⛔ nunca
   renderizou: outro ramo capturava o campo **antes**. ⛔ Ordem de ramos ⛔ não tem
   asserção.
2. **Troca de um defeito por outro pior** — ao impedir o corte do **valor**, os
   **rótulos clínicos** passaram a truncar.
3. **Diagnóstico que eu teria errado** — um teste de microinteração quebrou ⛔ e
   parecia perda do retorno visual do botão. ⚠️ Era outra coisa: três tokens
   novos acrescentaram *swatches* na galeria, empurraram o botão para baixo da
   dobra, ⛔ e o `mouse.move` ia para fora da viewport. ⛔ **O botão ⛔ nunca deixou
   de reagir; o mouse é que deixou de alcançá-lo.**

---

## 9 · O QUE ⛔ AINDA ⛔ NÃO ESTÁ FEITO

⛔ **O tema claro ⛔ não está ligado.** O app segue fixo em `TEMAS.escuro`.
⚠️ As telas do AVC renderizam corretas no claro **⛔ sem ⛔ nenhum ajuste** — ⛔ mas
**52 arquivos fora do AVC ⛔ ainda têm hex cru** (`legado-de-cor.json`).
⛔ Ligar o claro antes de migrá-los daria *"card claro dentro de tela escura"*.

⚠️ Isso é **etapa separada** do design system global, ⛔ e ⛔ não pendência do AVC.
