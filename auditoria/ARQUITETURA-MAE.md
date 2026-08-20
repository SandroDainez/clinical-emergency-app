<!-- ─────────────────────────────────────────────────────────────────────────
     CABEÇALHO DE ARQUIVAMENTO — acrescentado em 2026-08-20.
     Tudo abaixo da linha "DOCUMENTO ORIGINAL" é VERBATIM e não se edita.
     ───────────────────────────────────────────────────────────────────────── -->

# ARQUITETURA-MÃE — documento arquivado

**Origem:** mensagem de chat do autor (Dr. Sandro Dainez), derivada da proposta
dele na revisão da bradicardia.
**Arquivado em:** 2026-08-20.
**Natureza:** documento de chat, **não derivado de código**.

**O que este documento É:** o **CONTRATO** que todo módulo do app deve cumprir —
tipos de nó, o que cada um obriga, as travas que reprovam o build, e o que
deliberadamente NÃO se padroniza.

⚠️ **O QUE ELE NÃO É: uma ordem para executar.** Arquivar não vira tarefa.
Nenhuma trava da §7 passa a existir por este arquivamento; o que roda hoje é o
conjunto de `auditoria/INDICE-DE-TRAVAS.md`, que cobre parte disto e não o todo.
O trabalho vale quando acordado na conversa corrente.

⚠️ **ELE DESCREVE O ALVO, NÃO O ESTADO.** Na data do arquivamento o app cumpre
parte do contrato — descoberta guiada (`lib/instabilidade-guiada.ts`, sete
módulos), biblioteca compartilhada iniciada (`lib/hipercalemia.ts`), padrão
visual em SVG no código, teto de 200 caracteres por item — e NÃO cumpre outra
parte, com destaque para **`fonte` por nó** (§4 e §7.8) e para as travas §7.1 a
§7.10 como reprovação de build em todos os módulos. A distância entre alvo e
estado é trabalho a fazer, não defeito do arquivamento.

---

## DOCUMENTO ORIGINAL — VERBATIM

# ARQUITETURA-MÃE DO APP DE EMERGÊNCIAS
### O contrato que todo módulo cumpre — e o que o build reprova quando não cumpre

> Documento derivado da proposta do autor (revisão da bradicardia), com quatro acréscimos e uma
> correção de rota que estão marcados como tal. Destino: `auditoria/ARQUITETURA-MAE.md`.

---

## 1. PRINCÍPIO CENTRAL

**O app reproduz o raciocínio e as ações do atendimento real, não a sequência de páginas da
diretriz.**

A pergunta que cada tela responde não é *"qual é o próximo passo do protocolo?"* — é **"qual é a
próxima decisão que o médico precisa tomar neste paciente?"**

E a regra que sustenta tudo, porque o público-alvo é quem não tem experiência:
**o app pergunta antes de mandar, e toda pergunta tem saída para quem não sabe responder.**

---

## 2. O QUE SE PADRONIZA — E O QUE NÃO

Esta seção corrige a versão anterior do plano, que descrevia um "esqueleto de nove etapas" e podia
ser lida como gabarito de nove telas. **Estava errado.**

| Padroniza | Não padroniza |
|---|---|
| Os **tipos de nó** e o que cada um obriga | O **número** de nós |
| A **nomenclatura** dos cards | A ordem exata das etapas |
| As **regras de transição** entre nós | Quantas decisões cada módulo tem |
| O **design system** e a densidade | O conteúdo clínico |
| As **travas** que reprovam o build | O caminho de cada doença |

Bradicardia pode ter 7 nós; AVC, 15; anafilaxia, 6; sepse, 12. **Forçar todos a "Passo 1–7" piora a
medicina.** O motor tem estados internos; o médico vê só as decisões que existem naquela doença.

---

## 3. A SEQUÊNCIA LÓGICA (estados internos, não telas)

```
RECONHECER → ESTABILIZAR → CLASSIFICAR → TRATAR → INVESTIGAR → REAVALIAR → ESCALONAR → DESTINAR
```

Com duas regras que valem mais que a sequência:

- **Tratamento, investigação e diagnóstico acontecem em paralelo.** Nunca atrasar terapia
  tempo-dependente para completar investigação.
- **Qualquer deterioração muda de ramo imediatamente**, de qualquer ponto do fluxo.

---

## 4. OS TIPOS DE NÓ — e o que cada um é obrigado a carregar

Cada tela tem **uma função predominante**. Não misturar funções no mesmo card.

**`DECISÃO`** — uma pergunta, respondível olhando o paciente ou o monitor. 2 a 4 opções, cada uma
apontando um destino diferente.
→ **Obrigatório: ramo `naoSei`.** Sem ele o nó não compila.

**`DESCOBERTA`** *(acréscimo — não estava na proposta)* — o ramo do "não sei". Uma a três perguntas
menores e concretas que **devolvem a resposta à decisão original**.
→ **Obrigatório: terminar em pergunta ou ação, nunca em texto.**
→ Já existe no código: `lib/instabilidade-guiada.ts`, rodando em sete módulos.

**`CONDUTA — FAZER AGORA`** — só ações prioritárias: monitorização, suporte, acesso, medicação ou
procedimento imediato, exame que não espera, acionamento de equipe.
→ Máximo **7 ações visíveis**. Primeira palavra de cada linha = a ação. Zero fisiopatologia.

**`DOSE`** — o quê · dose · via · diluição quando relevante · velocidade · intervalo · dose máxima ·
contraindicação crítica · alternativa.
→ **Obrigatório: `fonte`** (referência + versão + revisadoEm).
→ **Obrigatório: apontar para um nó `REAVALIAÇÃO`.** Dose sem reavaliação declarada é dose sem
   consequência.
→ Quando dependente de peso, calculadora abre **automaticamente e pré-preenchida** — nunca vazia.

**`ALERTA`** — impede erro grave. **Só existe no ponto em que o erro é tentador**, nunca numa lista.
Aviso antes da tentação funciona; aviso arquivado, não. (Ex.: "não usar dopamina em dose renal"
pertence ao nó onde o médico está prestes a prescrevê-la.)

**`REAVALIAÇÃO`** — o que reavaliar e quando. Saídas: respondeu · resposta parcial · não respondeu ·
piorou · perdeu pulso · **não consegui avaliar**.
→ **Nunca avançar automaticamente depois de terapia crítica sem passar por aqui.**

**`CAUSA`** — só causas que mudam conduta. Pode chamar submódulo.

**`PADRÃO VISUAL`** *(acréscimo)* — traçado, curva ou posição de mão, desenhado em **SVG no código**
(sem licença, sem peso, nítido, offline). **Só entra se muda a resposta da pergunta daquela tela.**
Padrão diagnóstico ou motor entra; ilustração decorativa não.

**`DESTINO`** — alta · observação · enfermaria · semi-intensiva · UTI · centro cirúrgico ·
hemodinâmica · transferência, com o critério que justifica.
→ **Todo módulo termina num `DESTINO` alcançável.**

**`INTERRUPÇÃO`** — aresta declarada para outro módulo (§6).

**`CUSTOM`** — escotilha para o que não cabe: os relógios do PCR, calculadoras. Usar com parcimônia
e razão escrita.

---

## 5. A CAMADA 0 — correção importante

A proposta previa um bloco vermelho permanente em todos os módulos que, ao ser tocado, abre um
ABCDE completo (via aérea, respiração, circulação, neurológico, exposição, com seus itens).

**Isso recria a poluição que já foi reprovada duas vezes neste app** — vinte e tantos itens atrás de
um toque. A regra escrita pelo próprio autor se aplica a ele: *esconder atrás de um toque também não
basta; o texto continua lá, e o app não é para leitura.*

**O ABCDE não é uma tela. É o princípio que ORDENA os atalhos.** O bloco permanente abre uma lista
curta de **portas**, não de perguntas:

```
AMEAÇA IMEDIATA
  Perdeu o pulso            → PCR
  Não respira / VA ameaçada → ISR / via aérea
  Choque / hipoperfusão     → choque
  Convulsão                 → estado de mal
  Anafilaxia                → anafilaxia
  Hemorragia maciça         → hemorragia
```

A ordem da lista é A→B→C→D→E. O usuário não responde nada: ele reconhece e entra. Se o paciente está
em FV, ele não é perguntado sobre temperatura — ele toca "perdeu o pulso".

A lista é **contextual por módulo**: só aparecem as portas que fazem sentido ali.

---

## 6. A REDE CLÍNICA — e o contrato que cada aresta assina

Qualquer módulo pode chamar outro, preservando contexto e retornando à origem. Isso transforma uma
coleção de módulos numa rede — e é a melhor ideia estrutural da proposta.

**O custo que precisa estar declarado:** cada aresta é um contrato de duas pontas. Com 31 módulos, o
número de arestas possíveis é grande, e cada uma é um lugar onde o estado se perde ou o usuário fica
preso. Então:

- **As arestas são declaradas no grafo, nunca improvisadas.** Lista finita e explícita.
- Cada aresta declara: **o que preserva** · **para onde volta** · **o que mudou** ao voltar.
- Uma aresta pode ser **terminal por declaração** — o paciente entrou noutro problema e não volta.
  Terminal declarado é legítimo; terminal por esquecimento é beco sem saída.

**Correção minha, de dois dias atrás:** eu disse que "voltar ao OVACE depois do PCR é ficção".
Estava exagerado. O retorno é legítimo **quando o problema interrompido ainda existe depois do
submódulo** — e depois do ROSC de uma parada por bradicardia, a bradicardia continua sendo o
problema. O que continua valendo é o outro ponto: **o dado que muda a conduta dentro do submódulo
tem que entrar nele**, não esperar o retorno. Numa parada por obstrução, "olhar a boca a cada
abertura de via aérea" vive dentro do PCR.

---

## 7. AS TRAVAS — o que o esquema e o linter REPROVAM

Não avisam. Reprovam. Regra que depende de lembrança falha — o "não sei" já era regra escrita e
sumiu do renal mesmo assim.

1. `DECISÃO` sem ramo `naoSei`.
2. `DESCOBERTA` que termina em texto em vez de devolver a resposta.
3. `DOSE` sem os campos obrigatórios, **sem `fonte`**, ou que não aponta para uma `REAVALIAÇÃO`.
4. `CONDUTA` com mais de 7 ações visíveis, ou qualquer item acima de **200 caracteres**.
5. Módulo sem `DESTINO` alcançável.
6. `INTERRUPÇÃO` sem retorno declarado **e** sem marca de terminal.
7. Nó órfão ou beco sem saída.
8. **Atribuição de fonte no nível do módulo quando as recomendações têm origens diferentes.** É o
   defeito real encontrado no renal — rodapé "KDIGO 2012" embaixo de doses que não são do KDIGO.
   Fonte é por nó.
9. Nó que abre calculadora sem que todos os insumos sejam capturáveis a montante.
10. Terapia crítica que avança sem passar por `REAVALIAÇÃO`.

**Cuidado com o proxy:** o linter mede o grafo, que é o objeto certo para as regras de conteúdo. Ele
não prova que o renderizador desenha o grafo direito, e não pega "não sei" idiota. A tela e o
julgamento médico continuam sendo o instrumento final. Se em algum momento começarmos a comemorar
linter verde, o linter virou proxy.

---

## 8. O CUSTO — e onde ele é pago

A arquitetura ficou **mais rica** que a versão anterior: o card `DOSE` sozinho tem nove campos
(contra os cinco de antes) e ganhou `fonte`. Isso é melhor medicina e **mais trabalho por nó**.

Com ~31 módulos, o gargalo não é código: é o **aval médico**. Cada dose, cada limiar, cada "trata
agora vs. colhe e espera", cada fonte, é uma afirmação que precisa de um médico — e há um só no
projeto.

Três coisas cortam esse custo, em ordem de impacto:

1. **Biblioteca compartilhada.** Os ramos se repetem: "não sei se está em choque" é o mesmo no
   renal, na sepse, no trauma, no TEP e na anafilaxia. Aprovar uma vez, valer em todo lugar.
   Já começou: `instabilidade-guiada.ts` (7 módulos) e `lib/hipercalemia.ts`.
2. **Revisar conteúdo em documento, não em tela.** A tela entra no fim, para o veredito visual — que
   continua indispensável, porque vários defeitos deste app só apareceram no print.
3. **Revisar por padrão, não por módulo.** Aprovar todos os ramos que resolvem em "colher
   gasometria" de uma vez, em vez de reencontrar a decisão 8 vezes.

---

## 9. COMO SE ESCREVE UM MÓDULO NOVO

1. **A primeira grande decisão.** Uma frase. É o que define o módulo.
2. **As portas da Camada 0** que fazem sentido ali.
3. **A varredura de gravidade** — o que mata nos próximos minutos, em ordem de letalidade, cada item
   com seu ramo de descoberta.
4. **As condutas**, cada uma com fonte e reavaliação.
5. **As causas** que mudam conduta.
6. **Os escalonamentos.**
7. **Os destinos** e o plano pós-estabilização.
8. **Os cenários de teste** — cada um percorre o grafo até um destino.

### As primeiras grandes decisões, por módulo

| Módulo | Primeira grande decisão |
|---|---|
| Bradicardia | há comprometimento cardiopulmonar? |
| Taquicardia | está causando instabilidade? |
| SCA | oclusão / STEMI ou estratégia não-ST? |
| AVC | hemorragia ou isquemia? elegível a reperfusão? |
| TEP | instável ou estável? |
| Sepse | há choque / hipoperfusão? |
| Anafilaxia | critérios clínicos + comprometimento ABC? |
| Edema pulmonar | insuficiência respiratória ou choque? |
| CAD / EHH | gravidade + K⁺ + estado volêmico |
| IRA | ameaça imediata / indicação dialítica? |
| HDA | instabilidade / hemorragia ativa? |
| Trauma | ameaça imediata no ABCDE? |
| Eclâmpsia | convulsão / hipertensão grave / complicação? |
| Intoxicação | toxíndrome + ameaça ABC? |
| OVACE | obstrução leve ou grave? responsivo? |

---

## 10. O QUE FICA DE FORA

- **O PCR não migra.** Já funciona, tem relógios e fluxo cíclico que não cabem num grafo de
  perguntas. É a exceção declarada — a escotilha `CUSTOM` existe para casos assim.
- **Não existe estado clínico compartilhado entre módulos** além de peso, altura, sexo e idade.
  Valor volátil preenchido sozinho é número morto que ninguém tem motivo para duvidar
  (`lib/contexto-do-paciente.ts`). Dentro do módulo, valor reexibido mostra **quando foi informado**.
- **Escopo adulto.** Onde a conduta pediátrica difere e não existe módulo, a entrada **diz** que não
  cobre — silêncio não é escopo.
