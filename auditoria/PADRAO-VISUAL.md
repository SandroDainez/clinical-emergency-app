<!-- ─────────────────────────────────────────────────────────────────────────
     CABEÇALHO DE ARQUIVAMENTO — acrescentado em 2026-08-20.
     Tudo abaixo da linha "DOCUMENTO ORIGINAL" é VERBATIM e não se edita.
     ───────────────────────────────────────────────────────────────────────── -->

# PADRÃO VISUAL — documento arquivado

**Origem:** mensagem de chat do autor (Dr. Sandro Dainez).
**Arquivado em:** 2026-08-20.
**Natureza:** documento de chat, **não derivado de código**.
**Relação:** anexo de [`ARQUITETURA-MAE.md`](./ARQUITETURA-MAE.md), que declara
`PADRÃO VISUAL` como tipo de nó (§4). Aqui está a especificação do tipo.

**O que este documento É:** a especificação do nó de reconhecimento visual —
as duas famílias (diagnóstico × execução), o que cada painel carrega, a trava de
sensibilidade, grade e escala, onde o SVG funciona e onde ele mente, e o
inventário de ~40 painéis com a ordem de implementação.

⚠️ **O QUE ELE NÃO É: uma ordem para executar.** Arquivar não vira tarefa. O
inventário da §7 não está autorizado por este arquivamento — cada família entra
quando o módulo dela entrar, e com o aval médico da §9.

⚠️ **ELE DESCREVE O ALVO, NÃO O ESTADO.** Na data do arquivamento existe UMA
família implementada — a da hipercalemia, no renal, marcada "✅ feito" na própria
tabela. E ela **não cumpre este documento inteiro**: os traçados NÃO desenham
grade nem declaram escala (§5), e a fonte ainda não é por nó (§8.3). As outras
oito famílias de ECG, a capnografia, a via aérea e os diagramas não existem.

⚠️ **UMA CORREÇÃO DE FATO, CONFERIDA NO CÓDIGO EM 2026-08-20:** a §8.4 manda
reusar `tracado-de-ecg.ts` e `comparativo-de-padroes.tsx` e registrá-los como
biblioteca compartilhada. Eles nasceram no renal e ainda **não** estão marcados
como tal — ao contrário de `lib/hipercalemia.ts`, que já traz o aviso no
cabeçalho. Fica como pendência declarada, não como fato consumado.

---

## DOCUMENTO ORIGINAL — VERBATIM

# TIPO DE NÓ `PADRÃO VISUAL` — especificação
### Anexo à ARQUITETURA-MÃE · onde a decisão é de reconhecimento, mostra-se o normal e as alterações

---

## 1. POR QUE ISTO EXISTE

Descrever em texto um padrão que se reconhece com o olho é pedir ao usuário a tradução mais difícil
do fluxo, geralmente no ramo mais letal. "Ondas T apiculadas" não significa nada para quem não tem
repertório.

**E o normal é obrigatório na comparação.** Quem nunca viu mil ECGs não sabe que aquela T é "alta"
se não tiver a baixa ao lado. Reconhecimento de padrão sem âncora não funciona — a âncora *é* o
método.

---

## 2. DUAS FAMÍLIAS, DOIS ESQUEMAS DIFERENTES

Não confundir. Elas respondem perguntas diferentes e se desenham diferente.

### A · PADRÃO DIAGNÓSTICO — "o que estou vendo?"

O usuário compara o que está no monitor/papel com referências para **decidir**.
Estrutura: **normal (âncora) + as alterações que mudam conduta**, lado a lado, mesma escala.

### B · PADRÃO DE EXECUÇÃO — "onde e como eu faço?"

Não existe "normal vs alterado" — existe **certo, e o erro comum**.
Estrutura: a figura correta + opcionalmente o erro que se quer evitar, marcado como erro.

---

## 3. O QUE CADA PAINEL CARREGA

| Campo | Obrigatório | Observação |
|---|---|---|
| desenho (SVG) | sim | gerado em código |
| rótulo | sim | o nome do padrão |
| o que significa | sim | uma linha |
| **o que fazer** | sim | **sem isto vira atlas, não fluxo** |
| grade e escala | sim (traçados) | ver §5 |

E a tela inteira carrega:

- **A pergunta:** "O ___ do seu paciente se parece com algum destes?"
- **As saídas:** [Sim, qual] · [Não se parece com nenhum] · [Não sei dizer]
- **A trava de sensibilidade** (§4) — obrigatória.

---

## 4. ⚠️ A TRAVA CLÍNICA MAIS IMPORTANTE DESTE DOCUMENTO

**Imagem normal quase nunca exclui a doença.**

- ECG normal **não exclui** hipercalemia grave.
- ECG normal **não exclui** síndrome coronariana aguda.
- ECG normal **não exclui** tromboembolismo pulmonar.
- Capnografia normal **não exclui** obstrução parcial.

Um comparativo visual sem essa frase ensina o usuário sem experiência a fazer exatamente o que mais
mata em emergência: **usar um exame de baixa sensibilidade para descartar.** O aluno olha, não
reconhece nada, conclui "está normal, então não é isso", e vai embora.

**Regra:** todo nó `PADRÃO VISUAL` declara, no texto renderizado, o que a ausência de alteração
significa e o que NÃO significa. A saída "não se parece com nenhum" nunca leva a "siga tranquilo" —
leva ao próximo passo da investigação.

E onde dois padrões mudam a conduta em direções opostas e podem ser indistinguíveis (TV × TSV com
aberrância), a tela diz **o que fazer quando não dá para diferenciar** — isso é conduta, não imagem.

---

## 5. GRADE E ESCALA — detalhe técnico que decide se funciona

"T alta" é alta **em relação a quê?** Um traçado sem referência não é comparável.

- Todo traçado de ECG desenha a **grade** (25 mm/s, 10 mm/mV) e declara a escala.
- **Todos os painéis do mesmo comparativo usam a mesma escala.** Painéis em escalas diferentes
  mentem sobre a amplitude — e amplitude é justamente o que se está comparando.
- A derivação de referência é declarada quando importa.

---

## 6. ONDE O SVG FUNCIONA — E ONDE ELE MENTE

**Funciona** onde o padrão é geométrico: traçado de ECG, curva de capnografia, esquema anatômico,
posição de mão, grau de Cormack-Lehane, diagrama de superfície corporal.

**Mente** onde o diagnóstico está na **textura, no movimento ou na cor**:

- **POCUS** — deslizamento pleural, linhas B, colapso de VCI. O achado é dinâmico; um desenho
  estático dá falsa confiança de que a pessoa saberia reconhecer.
- **Pele** — urticária × púrpura × cianose × moteamento. É cor e textura.

Nesses casos: **ou não se usa imagem, ou se usa imagem real com licença e procedência** — e isso é
decisão do autor, com custo de licenciamento e de bundle. Enquanto não for decidido, esses módulos
descrevem em texto e **não fingem** que um desenho resolve.

---

## 7. INVENTÁRIO — onde a decisão é visual

Ordem de implementação por (frequência × letalidade se errar × quanto o iniciante erra).
**Cada família entra junto com o módulo dela, não numa varredura de imagens.**

### ECG — a maior parte do valor

| Módulo | Painéis | Já existe? |
|---|---|---|
| Hipercalemia / IRA | normal · T alta e estreita · PR longo e QRS alargando · sinusoidal | ✅ feito |
| Bradicardia | sinusal · BAV 1º · Mobitz I · Mobitz II · BAV total · escape juncional/ventricular | — |
| Taquicardia | QRS estreito regular · FA (irregular) · flutter · QRS largo · torsades | — |
| SCA | normal · supra de ST · infra · T invertida · BRE novo · De Winter · Wellens · supra em aVR | — |
| SCA — derivações extras | V4R (VD) · padrão posterior (infra V1–V3 com R alto) | — |
| PCR | FV · TV sem pulso · assistolia · AESP | — |
| TEP | S1Q3T3 · sobrecarga de VD · T invertida V1–V4 ⚠️ baixa sensibilidade e especificidade | — |
| Pericardite / tamponamento | supra difuso côncavo · depressão de PR · alternância elétrica | — |
| Intoxicações | QRS largo (bloqueio de canal de sódio) · QT longo · onda de Osborn | — |

### Capnografia

Normal · obstrução ("barbatana de tubarão") · desconexão/extubação · subida súbita (ROSC) ·
reinalação. Módulos: PCR, via aérea, asma/DPOC.

### Via aérea e execução

Cormack-Lehane I–IV · POGO · reparos anatômicos da cricotireoidostomia · posição das pás ·
ponto de compressão torácica · golpes nas costas e compressões abdominais (OVACE) · acesso
intraósseo.

### Diagramas

Regra dos nove / superfície corporal queimada.

---

## 8. REGRAS QUE CONTINUAM VALENDO

1. **Imagem só entra numa tela se muda a resposta da pergunta daquela tela.** Padrão diagnóstico ou
   de execução entra; ilustração, anatomia decorativa e "material educativo" não. Sem isso, a
   imagem vira a próxima geração da poluição já reprovada.
2. **Desenhado em SVG no código** — sem licença, sem peso de bundle, nítido em qualquer densidade,
   offline, na paleta do design system.
3. **Fonte por nó**, como qualquer outra recomendação: o que o padrão significa e o que fazer têm
   procedência.
4. Reusar `tracado-de-ecg.ts` e `comparativo-de-padroes.tsx`, que nasceram no renal. **São
   biblioteca compartilhada, não arquivos do módulo renal** — registrar como tal.

---

## 9. O GARGALO, DECLARADO

**Traçado desenhado errado é pior que texto**: dá falsa confiança a quem não tem repertório para
duvidar. Todo padrão novo precisa do olho de um médico antes de entrar no app — e há um médico no
projeto.

Contando o inventário acima, são algo em torno de **40 painéis**. Isso não se aprova um por um ao
longo de meses; aprova-se **em lote, por família** (todos os de bradicardia de uma vez, todos os de
SCA de uma vez), com os painéis renderizados lado a lado numa tela só de revisão.

**Sugestão concreta:** o Claude Code gera uma página de revisão — todos os painéis de uma família,
renderizados, com rótulo e conduta —, o autor olha uma vez e marca o que sai. É o mesmo princípio de
revisar conteúdo em documento em vez de tocar por 40 telas.
