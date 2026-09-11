# D-137 · O escopo da meta de PAM 90–100 foi trocado no transporte

**Aberta:** 2026-09-10 · **Ordem do autor:** correção clínica separada, com
prioridade para a meta de PAM, **medida antes de corrigida**.

## O defeito, em uma linha

O app afirma que a meta de **PAM 90–100 mmHg** vale para **"lesão cerebral
grave"**. A fonte (F-33 §4.2) atribui essa meta a **"pacientes neurológicos
agudos com hipertensão intracraniana (suspeita ou confirmada)"**.

| | texto |
|---|---|
| **F-33, p. 5** | *"Até hemostasia efetiva, deve-se tolerar PAM <65 mmHg em pacientes com sangramento ativo **e sem lesão cerebral grave**"* |
| **F-33, p. 5** | *"**Para pacientes neurológicos agudos com hipertensão intracraniana (suspeita ou confirmada) : meta de PAM 90 a 100mmHg**"* |
| **app** | *"tolerando PAM < 65 no sangramento ativo — **EXCETO em lesão cerebral grave, em que o alvo é PAM 90–100 mmHg**"* |

⚠️ **Duas linhas independentes foram fundidas em uma.** *"Sem lesão cerebral
grave"* é a **exclusão** da primeira; *"hipertensão intracraniana"* é a
**condição** da segunda. Ao fundir, a condição da segunda foi substituída pela
exclusão da primeira, e a população se ampliou.

⚠️ Hipertensão intracraniana é uma **condição** — suspeita ou confirmada, com
sinais próprios. Lesão cerebral grave é um **universo**. Nem todo paciente com
lesão cerebral grave tem hipertensão intracraniana.

---

# A MEDIÇÃO — feita antes de qualquer correção

## 1 · Onde cada afirmação aparece no runtime

Varredura sobre **todos os arquivos versionados**, excluindo `auditoria/` e
`protocols/fontes-verbatim/`, que **precisam** poder citar o texto errado para
documentar o defeito.

| # | afirmação | arquivos de runtime |
|---|---|---|
| **1** | PAM 90–100 atribuída a "lesão cerebral grave" | `lib/i18n/modules/choque-einstein.ts:46` · `protocols/guidelines_metadata.json:722` |
| **2** | classificação hemorrágica atribuída ao **ATLS** | `lib/i18n/modules/choque-einstein.ts:42` |
| **3** | "Metas hemodinâmicas **gerais**" sem o asterisco da fonte | `lib/i18n/modules/choque-einstein.ts:24` · `protocols/guidelines_metadata.json:716` |
| **4** | omissões (PAM < 60 · diurese < 30 mL/h · preparo do cálcio) | `lib/i18n/modules/choque-einstein.ts` · `protocols/guidelines_metadata.json:713,723` |

**Dois carregadores, e só dois.**

## 2 · Quais são *user-facing*

⚠️ **Nenhuma, hoje** — e a razão é estrutural, não sorte.

### Carregador A · `lib/i18n/modules/choque-einstein.ts`

É uma **tabela de tradução PT→ES**. Uma entrada só chega à tela se **algum
código emitir a chave PT** e passar por `tr()`.

| medida | resultado |
|---|---|
| arquivos que emitem *"Metas hemodinâmicas gerais: PAM…"* | **0** |
| arquivos que emitem *"Classificação do choque hemorrágico (ATLS)…"* | **0** |
| arquivos que emitem *"Metas no hemorrágico até a hemostasia…"* | **0** |

O emissor era `shock-decision-tree.ts`, **removido em `bdf02c8`**
(*remove legacy clinical modules and isolate transitional ACLS runtime*).
A tabela sobreviveu ao módulo que a alimentava.

### Carregador B · `protocols/guidelines_metadata.json`

O campo é `key_recommendations_covered`. Ele é carregado em memória
(`GuidelineStatus.guideline` é a entrada inteira), mas:

| medida | resultado |
|---|---|
| telas que renderizam `key_recommendations_covered` | **0** |
| telas que chamam `getModuleGuidelinesStatus("choque")` | **0** — só `"correcoes_eletroliticas"` e `"drogas_vasoativas"` |
| o que as telas usam do status | `isStale`, `statusLabel`, `statusColor`, e `guideline.nossa.revisadoEm` |
| o que `lib/procedencia.ts` expõe | `name`, `base`, `nossa`, `citation` — **não** as recomendações |

## 3 · Quais derivam alguma decisão

⚠️ **Nenhuma.** Os dois carregadores são **texto e metadado**, não derivação:

- a tabela de i18n é `Record<string, string>` consultada por `tr()`;
- `key_recommendations_covered` é `string[]` e nenhuma função de decisão o lê;
- o módulo `choque` **não tem árvore, motor nem tela** nesta branch. Sobrevivem
  o id canônico, o metadado e as traduções.

➜ Nenhum portão clínico, nenhum bloqueio 🔴🟡🟢, nenhuma meta calculada.

## 4 · Estão presentes na produção atual

⚠️⚠️ **SIM.** Medido no bundle servido, não inferido.

```
GET https://clinical-emergency-app.vercel.app/  → 200
entry-51567884b86940c3235c9ce65d78cfd2.js       → 200 · 7.480.538 bytes
```

⚠️ Os acentos vêm **escapados** (`les\xe3o cerebral grave`), e é por isso que
a primeira busca literal devolveu zero. A busca correta encontra:

| ocorrência | forma |
|---|---|
| par PT/ES da meta hemorrágica | *"…tolerando PAM < 65 no sangramento ativo — EXCETO em les\xe3o cerebral grave, em que o alvo é PAM 90–100 mmHg."* + a tradução ES |
| metadado | *"Choque hemorr\xe1gico: classes I–IV, hipotens\xe3o permissiva (PAM 50) at\xe9 a hemostasia, exceto les\xe3o cerebral grave (PAM 90–100)"* |

**Conclusão da medida:** o texto errado **é distribuído** em produção, e
**não é renderizado** em nenhuma superfície clínica ativa.

⚠️ A distinção importa e não deve ser suavizada em nenhuma direção:

- **não é** "está na tela do médico" — não está, e nenhuma superfície o alcança;
- **não é** "não existe em produção" — existe, dentro do JavaScript entregue.

### Prova complementar · HTML pré-renderizado

Nenhum dos **27** arquivos `.html` do `dist` contém as frases. Nenhuma tela de
primeira pintura as carrega.

## 5 · Quais testes/travas exigem hoje o texto incorreto

⚠️ **Nenhuma.** Varredura em `e2e/` e `scripts/`: **zero** arquivos citam
*"lesão cerebral grave"*, *"ATLS): classe"*, *"Metas hemodinâmicas gerais"* ou
*"classes I–IV"*.

A única trava que toca esses arquivos é `varredura-pt.cjs`, e ela exige apenas
que **exista par PT/ES** — não exige o conteúdo. Corrigir os dois lados juntos
a mantém verde, e **isso é uma fraqueza da rede**, não uma força: nenhuma trava
teria pegado esse erro.

➜ É a justificativa para a trava nova.

---

# CONSEQUÊNCIA PARA O DEPLOY

⚠️ **O erro não está em superfície clínica ativa.** Nenhum médico leu essa
frase no app, porque não existe tela que a mostre.

➜ A correção **não é urgência de produção**. Continua sendo correção clínica de
prioridade alta, porque o texto é a matéria-prima da reconstrução do C2: se
ficar como está, o erro entra na tela **no dia em que o módulo voltar**.

---

# A CORREÇÃO — 2026-09-10

## Regra que a governou

Restaurar **o escopo da fonte**, e não substituir por interpretação nova.
Nenhuma frase abaixo é minha: cada uma reproduz o recorte de F-33, §3.1 e §4.2.

## 1 · A meta pressórica — voltou a ser DUAS afirmações

A fonte tem duas linhas independentes, e o app agora também:

> **Meta no hemorrágico até a hemostasia:** PAM ≥ 65 mmHg. Em casos selecionados
> a hipotensão permissiva pode ser considerada, com PAM-alvo de 50 mmHg; até a
> hemostasia efetiva, tolerar PAM < 65 mmHg em sangramento ativo e **SEM lesão
> cerebral grave**.

> **Paciente neurológico agudo COM hipertensão intracraniana, suspeita ou
> confirmada:** a meta é PAM 90–100 mmHg. Escopo da fonte — **não é meta de AVC
> isquêmico nem de lesão cerebral grave em geral**.

⚠️ A segunda carrega a negativa dentro da própria afirmação. Não é redundância:
é o que impede a frase de ser relida como meta geral quando o C2 for
reconstruído.

## 2 · A atribuição da tabela de classes

*"(ATLS)"* → *"(Cannon, N Engl J Med 2018 — a tabela referenciada pelo pathway;
NÃO é ATLS)"*, nos dois idiomas.

## 3 · A ressalva das metas gerais

A frase de metas hemodinâmicas gerais passou a terminar com a advertência do
próprio documento: *"As metas podem variar conforme o contexto clínico —
consultar também as metas específicas de cada causa de choque."*

## 4 · As omissões

A janela renal do metadado passou a trazer *"diurese < 0,5 mL/kg/h ou
< 30 mL/h"*, como na fonte.

## Arquivos tocados

| arquivo | o que mudou |
|---|---|
| `lib/i18n/modules/choque-einstein.ts` | meta dividida em duas entradas PT/ES · atribuição da tabela · ressalva das metas gerais |
| `protocols/guidelines_metadata.json` | mesma divisão em duas afirmações · atribuição · ressalva · janela renal |

⛔ Nenhum arquivo de derivação, motor ou tela foi tocado — porque nenhum
carregava a afirmação. Ver a medição, item 3.

---

# A TRAVA · `scripts/prova-escopo-da-meta-pressorica.cjs`

Registrada como `test:escopo-meta-pressorica`, ligada ao `test:all`.
O portão passou de **114** para **115** travas.

**PROMETE** · que nenhum arquivo de runtime atribua a meta de PAM 90–100 a
"lesão cerebral grave"; que toda ocorrência dessa meta nomeie "hipertensão
intracraniana"; que a classificação hemorrágica não seja atribuída ao ATLS; que
a afirmação de metas gerais carregue a ressalva da fonte.

**NÃO PROMETE** · que os números confiram com o PDF (isso é o F-33), nem que o
texto chegue ou não à tela (mede texto, não renderização).

**UNIVERSO** · todos os arquivos de texto versionados, exceto
`protocols/fontes-verbatim/`, `auditoria/` e a própria trava — isentos **pela
natureza do arquivo**: os dois primeiros precisam citar o texto errado para
transcrever a fonte e para documentar o defeito.

## ⚠️ Duas armadilhas que a construção da trava encontrou

**A faixa sozinha não identifica a afirmação.** A primeira versão casava
`90–100` e acusou `lib/i18n/modules/eclampsia.ts`, que fala de **PAD 90–100**
na pré-eclâmpsia, e uma linha de hidralazina no metadado. Silenciar isso por
pasta criaria falso negativo silencioso. A trava passou a achar a faixa e então
perguntar **qual parâmetro a governa**, olhando o último token de pressão antes
dela na linha: só PAM, MAP ou TAM contam.

**Ler o índice do git não é ler o código.** A primeira versão usava
`git show :arquivo` e mediu o estado anterior às correções — reprovaria uma
correção salva e não adicionada, e aprovaria uma adicionada e depois desfeita.
Passou a ler a árvore de trabalho.

## Mutação fiel — quatro, e as quatro mordem

Cada mutação **restaura exatamente o transporte antigo**, e não uma
aproximação.

| # | mutação | resultado |
|---|---|---|
| **M1** | refunde as duas linhas: *"tolerando PAM < 65 no sangramento ativo — EXCETO em lesão cerebral grave, em que o alvo é PAM 90–100 mmHg"* | ❌ exit 1 · 5 reprovações |
| **M2** | devolve *"(ATLS)"* à classificação hemorrágica | ❌ exit 1 |
| **M3** | remove a ressalva das metas gerais | ❌ exit 1 |
| **M4** | devolve o metadado antigo, com o escopo trocado | ❌ exit 1 |
| — | estado corrigido | ✅ exit 0 · 12/12 |

⚠️ Além dessas, a trava tem **duas conferências anti-cegueira**: reprova se
parar de encontrar a meta de 90–100 ou a afirmação de metas gerais. Uma trava
que não acha nada não está aprovando — está cega.

---

# ESTADO · ✅ FECHADA quanto ao texto

O que **não** foi resolvido, e nem deveria ser aqui:

- o módulo `choque` continua sem tela nesta branch;
- a aplicabilidade de qualquer meta ao AVC isquêmico continua **pendente de
  revisão clínica**, e este trabalho não a antecipou;
- nenhuma meta nova de AVC foi criada. O AVC continua com a rec. 38 do F-32
  (individualizar) mais a F-05 (corrigir), **sem número**.
