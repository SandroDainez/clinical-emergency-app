# App Emergências | AVC — atendimento guiado · especificação v1.1

> **Origem:** PDF *App_Emergencias_Mestre_v1_1_27_paginas.pdf*, 27 páginas,
> versão 1.1 de 13/09/2026, destinatário Sandro. Convertido em 2026-09-13.
>
> **Regras desta conversão:**
>
> - o conteúdo é **verbatim**; títulos, tabelas e fluxogramas preservam o texto
>   do PDF, e só a diagramação muda;
> - as páginas 23–27 foram **mescladas nos lugares que alteram** (famílias,
>   idioma, design, PCR, calculadoras e comandos); cada trecho mesclado leva a
>   marca **[p.23–27]**;
> - as correções do autor, fornecidas por escrito, levam a marca
>   **[CORREÇÃO 12/09]** e ficam junto do trecho que alteram;
> - trechos revogados pela decisão **D-AVC-01** (`docs/decisoes.md`) permanecem
>   no texto, marcados **[REVOGADO — D-AVC-01]**;
> - o PDF não traz dose, diluição, limiar, janela nem contraindicação, e esta
>   conversão não acrescenta nenhuma.

---

## 01 · Capa

**ESPECIFICAÇÃO DE PRODUTO E ENGENHARIA / 01**

# App Emergências | AVC — atendimento guiado

## Documento mestre para construir com auxílio de IA

Fluxos • telas • dados • regras • testes • comandos de execução

**Destinatário:** Sandro
**Versão:** 1.1 | 13 de setembro de 2026
**População proposta:** adultos com suspeita de AVC no ambiente hospitalar.
**Origem:** requisitos desta conversa, sem consulta ou reutilização do app
existente. **[REVOGADO — D-AVC-01]** *O módulo é construído dentro do repositório
existente.*

### Objetivo do produto

Conduzir o médico, especialmente o menos experiente, da chegada à continuidade
do cuidado. Cada decisão deve explicar o que avaliar, o que fazer, como executar,
como verificar a resposta e como agir se houver falha ou falta de recursos.

### Natureza desta entrega

**Especificação técnica para desenvolvimento e simulação.** Não é prescrição,
protocolo institucional nem autorização para uso assistencial. Contém o desenho
funcional e o processo para completar a base clínica. Doses, diluições,
limiares, janelas e exceções não devem ser inferidos pela IA a partir deste
documento.

### Como começar

Anexe este PDF à ferramenta escolhida. Leia primeiro a atualização de escopo nas
páginas 23–27. Cole o comando mestre da página 16 e a atualização da página 27;
depois execute os comandos numerados em sequência. A cada entrega, confira os
critérios de aceite. O comando de retomada permite continuar em outra conversa
ou ferramenta sem depender da memória do chat.

---

## 02 · Mapa do documento e decisões de escopo

| Páginas | Conteúdo |
|---|---|
| 3–5 | Fluxo geral, suporte e reperfusão/recursos |
| 6–9 | Especificação das oito telas |
| 10–11 | Experiência do usuário e modelo de dados |
| 12–13 | Motor clínico, conteúdo farmacológico e arquitetura |
| 14–15 | Plano de execução e casos de aceite |
| 16–20 | Comando mestre e comandos de construção |
| 21 | Auditoria, retomada e correção |
| 22 | Pendências de validação e fontes |
| 23–27 | App multimódulo, design, PT/ES, PCR e novos comandos |

### Incluído no projeto

- Atendimento adulto, suspeita de isquemia ou hemorragia, reavaliação e
  hipóteses alternativas; reperfusão com avaliações próprias de IVT e EVT.
- Suporte inicial, módulos associados, retorno com histórico, recursos
  insuficientes, transferência e acompanhamento até 48 horas.
- Interface em português e espanhol, simulador com casos fictícios,
  rastreabilidade clínica e recuperação após interrupção.

### Limites explícitos

Pediatria, gestação/puerpério e outras populações especiais exigem caminhos
próprios validados; identificá-las e encaminhar para avaliação adequada, sem
aplicar silenciosamente regras adultas gerais. Integrações com prontuário, envio
de ordens e dispositivos não são pressupostas. Um registro local não comprova
execução no hospital.

> **[CORREÇÃO 12/09] — populações pediátrica, gestante e puérpera.**
> Identificar e encaminhar; **nunca aplicar regra adulta em silêncio**. A
> identificação é obrigatória antes de qualquer regra adulta produzir saída.

### Decisão de implementação

Começar com protótipo e simulação. Não conectar dados reais nem liberar apoio
assistencial antes dos critérios clínicos, técnicos, de privacidade e de
implantação aplicáveis. A estrutura deve prever o caminho hemorrágico desde o
começo, mesmo que o conteúdo seja produzido em uma entrega específica.

### App Emergências — famílias de módulos [p.23–27]

Ampliação de escopo aprovada pelo usuário em 13/09/2026. O AVC é o primeiro
módulo de um app de emergências médicas. As páginas 23–27 complementam o plano
anterior e prevalecem nas decisões de idioma, reutilização, design e integração
do PCR.

| Família | Estrutura e compartilhamento |
|---|---|
| Emergências guiadas | AVC, IAM/SCA, EAP, anafilaxia e outras. Compartilhar componentes, estado do atendimento, registro e padrão de orientação. Cada módulo tem regras, fases, prioridades e reavaliações próprias. |
| Procedimentos e suporte | Via aérea, ventilação e outros suportes. Podem abrir dentro do atendimento ou de forma independente. Preservar contrato de entrada, resposta e retorno. |
| PCR existente | Lógica e experiência próprias. Integrar posteriormente por adaptador, após inspeção do código fornecido. Preservar o funcionamento validado; extensão das adaptações só poderá ser estimada após essa inspeção. |
| Calculadoras e escores | Entrada → validação → resultado → interpretação e limites. Vasoativas, eletrólitos e escores não devem ser forçados às oito etapas do AVC. |

---

## 03 · Fluxo geral do atendimento

Fluxograma (cada linha é uma caixa; `→` indica a seta do PDF):

1. **Chegada: dados essenciais e relógio clínico**
2. → em paralelo:
   - **Avaliar ameaças e estabelecer suporte**
   - **Em paralelo: história, equipe, imagem e exames**
3. → **Integrar clínica, NIHSS, tempo e imagem**
4. → três saídas:
   - **Hemorragia: fluxo específico**
   - **Isquemia provável: IVT e EVT independentes** *(caixa destacada)*
   - **Dúvida: esclarecer e reavaliar**
5. → **Executar plano e organizar recursos**
6. → **Destino, transferência e passagem do caso**
7. → **Cuidados até 48 h e reavaliação contínua**

**Regra transversal:** deterioração em qualquer etapa reabre avaliação de
ameaças. O histórico, as infusões, os exames e as transferências em andamento
permanecem ativos. Suporte e investigação avançam em paralelo quando viável.
[R1]

> **[CORREÇÃO 12/09] — hemorragia intracraniana.** A saída *"Hemorragia: fluxo
> específico"* é **caminho próprio com entrega própria** — reversão de
> anticoagulante, alvo pressórico e indicação neurocirúrgica — e **não**
> "bloquear IVT e avisar".

---

## 04 · Intervenções e retorno ao AVC

Fluxograma:

1. **Identificar ameaça por achados observáveis**
2. → **Orientar ação com justificativa e verificações**
3. → três ramos:
   - **Via aérea / respiração:** oxigênio, intubação e resgate
   - **Circulação:** causa, suporte e metas contextuais
   - **Outras ameaças:** glicemia, convulsão, PCR
4. → **Registrar intervenção realmente executada**
5. → **Obter novos dados e avaliar resposta**
6. → duas saídas:
   - **Resposta suficiente:** retomar AVC com suporte ativo *(caixa destacada)*
   - **Resposta insuficiente:** escalonar, resgatar e pedir ajuda

### Contrato de navegação

O módulo recebe encounterId, intervenção solicitada, contexto clínico,
observações atuais e ponto de retorno. Devolve eventos, suporte ativo, resposta
medida e pendências. Usar uma pilha de navegação para chamadas sucessivas, com
retorno ao campo de origem.

Após intubação, ventilação, analgesia e sedação ficam acessíveis como cuidados
associados. Voltar não encerra automaticamente a ameaça. Um módulo indisponível
deve ser identificado como tal; não oferecer um botão que aparenta executar uma
conduta inexistente.

### PCR existente, calculadoras e continuidade [p.23–27]

#### Integração do PCR por adaptador

Quando o usuário fornecer o módulo: primeiro inventariar dependências, dados,
cronômetros, sons, registros, idiomas e fluxo real. Criar testes de
caracterização antes das mudanças. Adaptar entrada/saída, identificação, idioma
e elementos visuais compatíveis sem forçar a sequência do AVC.

Prever entrada rápida durante deterioração, preservar contexto do caso e
registrar eventos sem duplicidade. O comportamento de cronômetros ao trocar
módulo, suspender app ou retornar deve ser definido e testado. Após o episódio, a
continuidade clínica não deve ser reduzida a voltar à tela anterior; integrar o
destino apropriado e a revisão das pendências.

#### Calculadoras em dois modos

| Modo | Comportamento |
|---|---|
| Consulta independente | Usuário informa os dados e obtém resultado com fórmula, unidade, interpretação e limites. Não existe vínculo automático com paciente. |
| Dentro do atendimento | Recebe dados confirmados com horário e origem; permite revisar. Ao voltar, usuário escolhe registrar resultado ou propor ação. Cálculo nunca registra administração automaticamente. |

Compartilhar o mesmo cálculo entre acesso independente e integrado. Dados
desatualizados ou peso de tipo inadequado exigem revisão. Diferenciar conversão
matemática de decisão de indicar ou titular uma droga. Cada ferramenta declara se
é conversor, escore ou orientação terapêutica com requisitos próprios.

#### Próxima ação sem obrigar busca

O contexto oferece a calculadora ou suporte necessário diretamente no card da
conduta. Ao terminar, retorna ao mesmo atendimento. Busca e catálogo permanecem
para consulta opcional. Uma ação principal visível pode coexistir com tarefas
paralelas; não transformar o atendimento em sequência rígida.

#### Testes adicionais obrigatórios

Mesmo caso em PT/ES gera mesmo resultado; troca de idioma preserva dados; módulo
novo não altera regras do AVC; PCR preserva comportamento caracterizado; cálculo
independente e integrado coincidem; consulta solta não contamina paciente ativo;
ajuda e resgate continuam acessíveis com tela pequena e texto ampliado.

---

## 05 · Reperfusão, recursos e caminhos de saída

Fluxograma:

1. **Isquemia provável: dados integrados**
2. → dois ramos independentes:
   - **Avaliar IVT:** indicação, segurança e pendências
     → **Elegível / corrigível / impedimento / sem indicação / inconclusivo /
     avaliação especializada**
   - **Avaliar EVT:** clínica, vaso, imagem e contexto
     → **Candidato ou dúvida relevante:** acionar referência e verificar acesso
3. → **Plano médico confirmado:** há recurso e acesso viável?
4. → duas saídas:
   - **Disponível:** executar ou transferir; monitorizar durante espera *(caixa
     destacada)*
   - **Ausente ou incerto:** cuidado local possível; apoio e reavaliação do
     acesso

- Condição corrigível exige novo dado; medicamento administrado não prova
  correção. Reexecutar as regras afetadas.
- IVT e EVT têm resultados independentes. Não esperar resposta à IVT para
  organizar EVT indicada. [R2]
- Falta de recurso não é contraindicação clínica. Sem encaminhamento, manter
  plano local, monitorização e revisão das possibilidades; não inventar terapia
  substituta.
- TC sem alterações agudas não gera exclusão automática de AVC. Hemorragia abre
  um caminho específico, não apenas a mensagem "não trombolisar".

> **[CORREÇÃO 12/09] — telemedicina/telestroke.** Telemedicina e telestroke são
> **ator e estado da decisão e da transferência**, e **não item de ajuda**. O
> acionamento, a resposta e o parecer remoto entram no modelo de dados como fatos
> com horário, autor e estado, e condicionam decisão e destino.

---

## 06 · Telas 1 e 2 — chegada e estabilização

### T01 | Dados e ativação inicial

| Bloco | Requisitos |
|---|---|
| Essencial | Identificação provisória; idade; chegada; última vez normal; início presenciado; descoberta; PAS/PAD, FC, FR, SpO₂, glicemia, temperatura e consciência. |
| Complementar | Peso e origem, altura, alergias, funcionalidade prévia, déficits anteriores e fonte da história. Campos não essenciais não bloqueiam imagem. |
| Comorbidades | Hipertensão, diabetes, FA, AVC/AIT, hemorragia prévia, coronariopatia, IC, doença renal/hepática, epilepsia, câncer, coagulopatia; outras; nenhuma conhecida; desconhecido. |
| Medicamentos | Classes clicáveis e outros. Anticoagulantes abrem fármaco, dose e última tomada. Itens livres relevantes precisam de conciliação estruturada. |
| Cálculo | PAM estimada = (PAS + 2 × PAD)/3; unidade e horário. PAS/PAD preservadas. Valores inconsistentes exigem conferência. |

**Aceite:** é possível iniciar com paciente não identificado, solicitar imagem e
registrar ameaça sem preencher toda a história. Dados ausentes não recebem valores
padrão normais.

### T02 | Avaliação guiada de ameaças

Perguntar sobre proteção de via aérea, ventilação, oxigenação, perfusão,
convulsão e glicemia. Explicar como examinar cada achado. A decisão não deve
depender apenas de o usuário já saber nomear choque ou indicar intubação.

Oferecer a ação pertinente e a ficha de execução. Controle pressórico recebe
diagnóstico provável, fase e estratégia de reperfusão. Não aplicar alvo genérico
de normalização. [R1, R3]

**Aceite:** cada ameaça permanece pendente até reavaliação; registrar
intervenção sem nova medida não produz resolução. Ações emergenciais são
acessíveis de qualquer tela.

> **[CORREÇÃO 12/09] — "não sei" e tela de ação.**
>
> - Toda decisão tem ramo **"não sei"** que leva a **perguntas menores**.
> - Toda tela de ação responde: **o que dar, quanto, via, em quanto tempo, o que
>   reavaliar e quando**.
> - Nenhum item acima de **200 caracteres**.
> - Imagem só entra se **muda a resposta**.
> - SVG para vetor, **com procedência e licença**.

---

## 07 · Telas 3 e 4 — neurologia e exames

### T03 | Exame neurológico e tempo

Sintomas clicáveis: assimetria facial, fraqueza de braço/perna com lado,
alteração sensitiva, linguagem, disartria, visão, diplopia, ataxia/desequilíbrio,
vertigem com sinais associados, consciência e cefaleia súbita. Registrar início,
persistência, flutuação e estado prévio.

NIHSS: implementar cada item oficial com instrução, alternativas e pontuação;
material padronizado, cronômetro quando útil, regras específicas para
impedimentos e registro dos confundidores. Não criar "não avaliável = zero".
Avaliação incompleta não é total válido.

Avaliar déficit incapacitante separadamente, explicando impacto sobre
comunicação, marcha, visão e funções habituais. NIHSS baixo não exclui
incapacidade. Preservar exame anterior à sedação. [R3]

**Aceite:** totais só aparecem como completos quando válidos; reavaliações não
sobrescrevem o basal. Última vez normal e descoberta não são intercambiáveis.

### T04 | Solicitação, disponibilidade e interpretação

| Item | Comportamento |
|---|---|
| Imagem | TC inicial; avaliação vascular e seleção adicional conforme caminho validado. Registrar recursos ausentes e interpretação responsável. |
| Laboratório | Catálogo contextual, com indicação e dependência da decisão; não esperar indiscriminadamente todos os resultados. |
| Estados | Não solicitado; solicitado; realizado; resultado disponível; interpretado; indisponível/cancelado com motivo. |
| Resultados | Data/hora da coleta ou aquisição e do registro; achados estruturados; laudo complementar; inconclusivo explícito. |
| Saídas | Hemorragia; isquemia provável; dúvida/outra hipótese. Apoio especializado quando necessário. |

**Aceite:** clicar "solicitar" não marca realização ou exclusão de hemorragia.
Imagem pode ser acionada antes de completar NIHSS. [R1]

---

## 08 · Telas 5 e 6 — decisão e execução

### T05 | Painéis independentes de IVT e EVT

Consumir dados já obtidos e solicitar apenas complementos relevantes. Mostrar
critérios atendidos, impedimentos, condições corrigíveis, informações essenciais
ausentes e situações especiais. Diferenciar contraindicação de ausência de
indicação.

Classificações operacionais: "impede neste contexto", "corrigir e reavaliar",
"requer decisão individual/especializada" e "informação essencial pendente". Cada
regra deve ter fonte, população, contexto e versão; não criar lista universal por
memória.

**Aceite:** desconhecido não vira negativo; ausência de contraindicação não vira
indicação. A conclusão mostra motivos e dados utilizados. Mudanças relevantes
invalidam a conclusão anterior para uso futuro, preservando seu histórico.

### T06 | Administração e resposta

| Bloco | Requisitos |
|---|---|
| Conferência | Identificação, alergias, fármaco, peso/origem, dose, via, concentração, dados críticos atuais e decisão médica. |
| Apresentação | Confirmar concentração antes de calcular volume. Dose e volume são exibidos com unidades diferentes e inequívocas. |
| Execução | Separar indicado, decidido, prescrito, preparado, iniciado, administrado/concluído, interrompido e cancelado. |
| Rastreio | Horários reais, quantidade administrada, responsável, motivo da interrupção e resposta. |
| Complicações | Deterioração neurológica, sangramento, angioedema e outras emergências abrem avaliação/resgate apropriados. [R2] |

**Aceite:** escolher fármaco não registra administração. Peso alterado depois não
modifica o evento histórico. Repetir um clique não duplica uma dose registrada. A
agenda começa a partir do evento real correspondente.

---

## 09 · Telas 7 e 8 — destino e continuidade

### T07 | Destino e transferência

Definir destino segundo necessidade e capacidade: centro de neurointervenção,
neurocirurgia, UTI ou unidade AVC com monitorização adequada. Não usar UTI como
destino automático universal. [R4]

Transferência: solicitada, contato realizado, aceite, transporte confirmado,
saída, chegada/entrega ou cancelamento. Registrar estimativas como estimativas;
não presumir aceite. Durante a espera, manter cuidados e tarefas.

Resumo: horários, exame basal e evolução, imagem, decisões IVT/EVT e
fundamentos, medicamentos realmente administrados, dispositivos e infusões,
complicações, pendências e próxima reavaliação.

> **[CORREÇÃO 12/09] — telestroke na transferência.** O estado da transferência
> inclui o **ator remoto** (telemedicina/telestroke) quando participar: contato,
> parecer e aceite remotos são fatos com horário e autor, e não se presumem.

### T08 | Plano individualizado até 48 horas

| Caminho | Conteúdo que a base clínica deverá especificar |
|---|---|
| Após IVT | Vigilância, metas, complicações, imagem de controle e critérios de revisão terapêutica. |
| Após EVT | Cuidados do procedimento, reperfusão, acesso vascular e orientações do serviço executor. |
| Sem reperfusão | Tratamento indicado para o contexto, investigação etiológica e prevenção de complicações. |
| Hemorragia | Plano próprio segundo tipo, gravidade e necessidade neurocirúrgica. |
| Transversal | Deglutição, nutrição, glicemia, temperatura, mobilidade, prevenção de TEV, dispositivos e reabilitação. |

A passagem de 24 horas não libera automaticamente antiagregantes após IVT:
integrar imagem e avaliação clínica. Não programar anticoagulação universal em 48
horas. Exames repetidos precisam de indicação. [R5, R6]

**Aceite:** plano diferente para caminhos distintos; deterioração antecipa
avaliação sem esperar tarefa agendada. Notificações de navegador não são
presumidas confiáveis em segundo plano; exibir agenda e exigir validação do
mecanismo utilizado.

> **[CORREÇÃO 12/09] — hemorragia em 48 h.** A linha *Hemorragia* é **caminho
> próprio**: reversão de anticoagulante, alvo pressórico e indicação
> neurocirúrgica são entregas desse caminho, com regra, fonte e teste próprios.

---

## 10 · Interface para quem precisa de orientação

### Hierarquia visual

| Área | O que mostrar |
|---|---|
| Cabeçalho | Paciente, relógio clínico, dados críticos e suporte atual; detalhes recolhidos. |
| Prioridade | Uma ameaça ou pendência que muda a ação, com motivo. |
| Agora | Próxima avaliação ou conduta e instruções executáveis. |
| Em andamento | Exames, infusões, reavaliações e transferência. |
| Ajuda | Como avaliar, por que agir, exemplos e erros frequentes. |
| Ações | Registrar; reavaliar; voltar; preciso de ajuda; paciente piorou. |

### Estados visuais inequívocos

Registrado não é normal; avaliado e ausente não é desconhecido. Usar texto e ícone
além da cor. Não preencher respostas negativas por padrão. Não mostrar uma tela
global verde ou percentual que sugira segurança clínica de todo o atendimento.

### Ajuda contextual

"Preciso de ajuda" oferece: não sei avaliar; não tenho medicamento; não tenho
equipamento; não melhorou; paciente piorou. Cada opção conduz a conteúdo ou
caminho correspondente, com retorno preservado.

### Requisitos de acessibilidade e usabilidade

- Botões com área de toque confortável; teclado numérico e unidade próxima; erros
  descritos junto ao campo.
- Não depender de hover, memória da etapa anterior ou cor isolada. Contraste e
  ampliação de texto devem ser testados.
- Ajuda breve imediatamente disponível; aprofundamento recolhido. Alertas
  prioritários sem repetição excessiva.
- Testar em celular e computador. Meta de desempenho deve ser definida no
  dispositivo-alvo, sem números inventados no planejamento.

### Critério central de avaliação

Em simulação, o médico identifica a prioridade, executa a conduta corretamente,
percebe a necessidade de reavaliação e sabe quando pedir ajuda. Sentir confiança
sem reconhecer limites é um resultado indesejável.

### Design adaptado das seis referências [p.23–27]

As imagens foram examinadas como referências visuais. Seus textos, resultados e
sequências clínicas não constituem fontes de regras. Preservar sua identidade
geral sem copiar automaticamente os comportamentos mostrados.

| Referência | Adaptação recomendada |
|---|---|
| 1 \| Início | Tema escuro, cartões e retomada do atendimento. Reduzir cabeçalho, remover frase decorativa da área operacional e evitar vermelho para simples atividade. |
| 2 \| Catálogo | Busca, favoritos e ícones. Usar duas colunas ou lista em telas estreitas; não impor quatro colunas com títulos pequenos. Catálogo serve para escolher o módulo, não para procurar cada conduta durante o caso. |
| 3 \| Calculadoras | Campos com unidades e resultado evidente. Se a calculadora já está aberta, substituir "Abrir calculadora" por ação coerente. Nunca pré-preencher dados de paciente fictício em atendimento real. |
| 4 \| Atendimento AVC | Contexto compacto e card de ação. Substituir pergunta binária "é elegível?" por dados guiados e conclusão fundamentada. Mostrar pendências e conferência médica separadamente. |
| 5 \| Procedimento | Etapa visível e checklist. Pendentes não são respostas negativas; resgate acessível sem concluir checklist. Requisitos específicos dependem do procedimento. |
| 6 \| Resumo | Linha do tempo com eventos reais. Usar "passagem do caso"; não marcar "pronto" apenas porque houve preenchimento. Finalização precisa considerar tarefas e transferência. |

#### Tokens iniciais propostos

Fundo escuro #0B141B; superfície #14212B; texto #F3F7FA; texto secundário
#AEC0CF; ação azul #168FE5. Âmbar para atenção e vermelho para ameaça/erro
relevantes. Verde para confirmação específica. Contraste de cada combinação deve
ser medido antes da aprovação visual.

Reduzir neon, brilho e gradientes. Ícones não substituem texto. Prever tema claro
com a mesma hierarquia, sem inversão automática de cores. Corpo em torno de 16 px
e áreas de toque de pelo menos 44 px são metas iniciais de interface, a validar
nos dispositivos e com ampliação de texto.

> **[CORREÇÃO 12/09] — imagem e vetor.** Imagem só entra se **muda a
> resposta**; vetor em **SVG com procedência e licença** registradas.

### Português e espanhol desde a fundação [p.23–27]

Todos os módulos novos e a integração final do PCR devem oferecer português do
Brasil e espanhol. O PDF permanece em português para orientar a construção; o
requisito bilíngue aplica-se integralmente ao produto.

| Requisito | Implementação e aceite |
|---|---|
| Cobertura | Títulos, botões, campos, erros, ajuda, alertas, medicamentos explicativos, escalas, resumos e exportações em ambos os idiomas. |
| Catálogo | Textos por chaves estáveis em pt-BR e es; regras clínicas independentes do idioma. Não duplicar o motor para traduzir. |
| Troca | Mudar idioma sem reiniciar atendimento, apagar dados, alterar pontuação, dose, decisão ou cronômetros. |
| Números | Armazenar números canônicos com unidade; formatar e interpretar entrada conforme idioma. Rejeitar separadores ambíguos em vez de adivinhar. |
| Terminologia | Glossário clínico revisado; não presumir que siglas e nomes usuais sejam idênticos. Escalas exigem versões e instruções apropriadas. |
| País e serviço | Idioma não seleciona país nem muda protocolo. Disponibilidade, apresentação e adaptação local são configurações separadas. |
| Qualidade | Sem chaves cruas ou trechos misturados silenciosamente. Tradução clínica revisada e mesma versão científica nos dois idiomas. |

#### Exemplos de interface

| Português | Español |
|---|---|
| Retomar atendimento | Continuar atención |
| Próxima ação | Siguiente acción |
| Não foi possível obter | No se pudo obtener |
| Registrar realização | Registrar intervención realizada |
| Reavaliar | Reevaluar |
| Voltar ao AVC | Volver al módulo de ictus |

Exemplos de redação, sujeitos ao glossário escolhido para os países-alvo. Para
escalas e conteúdo de alto risco, tradução literal não equivale a validação. Texto
livre do usuário é preservado no original; não traduzi-lo silenciosamente como se
fosse o registro original.

---

## 11 · Dados, histórico e invariantes

| Entidade | Campos mínimos |
|---|---|
| Atendimento | ID, paciente, início, status, contexto assistencial, perfil de recursos e versão do conteúdo. |
| Observação | Tipo, valor, unidade, momento observado, momento registrado, origem, autor e estado da informação. |
| Exame | Tipo, solicitação, aquisição/coleta, resultado, interpretação, responsável e disponibilidade. |
| Decisão | Tipo, resultado, motivos, pendências, IDs das observações usadas, regra/versão, autor e horário. |
| Intervenção | Indicação, plano, execução, dose/volume quando aplicável, horários, resposta e complicações. |
| Tarefa | Ação, evento de origem, prazo/condição, estado e critério real de conclusão. |
| Transferência | Recurso necessário, contatos, aceite, transporte, marcos e plano durante espera. |
| Retorno | Atendimento, módulo/campo de origem, intervenção ativa e pilha de chamadas. |

### Invariantes obrigatórias

- Desconhecido ≠ negativo. Não avaliado ≠ ausente. Não medido ≠ normal.
- Prescrição ≠ administração. Administração ≠ resposta. Retorno ≠ resolução.
- Não sobrescrever eventos históricos; corrigir com nova versão, autor e motivo.
- Um dado novo pode exigir revisão de decisões; a decisão anterior continua
  auditável.
- Datas completas, fuso e horários observados explícitos; não calcular janela a
  partir da descoberta quando o início é desconhecido.
- Texto livre não deve produzir uma conclusão clínica silenciosa. Um termo de
  risco encontrado pode gerar pedido de conciliação, não diagnóstico automático.

---

## 12 · Regras clínicas e ficha de medicamento

### Contrato de uma regra

Cada regra precisa de: ID estável; pergunta clínica; população; contexto;
entradas/unidades; critérios; dados essenciais; saída; comportamento para
ausências e contradições; exceções; justificativa; fonte/localização; versão;
status da validação e casos de teste.

> **[CORREÇÃO 12/09] — força e contexto da fonte.** Cada regra clínica declara
> também **força** — um de `recomendacao_formal` · `pratica_aceita` ·
> `mecanismo_fisiologico` · `definicao` — e **`contextoDaFonte`**, além de fonte,
> versão e população.

O motor deve ser independente da interface. Recebe um estado e devolve resultados
explicáveis. Não usar booleanos simples para decisões que precisam distinguir
"não", "desconhecido", "não aplicável" e "pendente".

### Resultados de elegibilidade

Critérios atendidos; condição corrigível; contraindicação identificada; sem
indicação neste caminho; inconclusivo por falta de dados; avaliação especializada.
Acrescentar separadamente disponibilidade do tratamento e decisão do médico.

### Contrato farmacológico a completar

| Grupo | Campos que devem ser validados |
|---|---|
| Seleção | Fármaco, contexto, alternativas, contraindicações e ajustes. |
| Dose | Fórmula, tipo de peso, unidade, máximo, via, repetição ou titulação. |
| Preparo | Apresentação, concentração, diluição, volume final e compatibilidades pertinentes. |
| Administração | Velocidade/duração, dispositivo e verificações necessárias. |
| Resposta | Meta, monitorização, interrupção, falha e tratamento de eventos adversos. |
| Brasil e serviço | Bula/registro, normas aplicáveis, padronização e disponibilidade real, separados. |

**Regra de construção:** sem fonte e validação de um parâmetro de alto risco,
manter o item como pendente e indisponível para recomendação assistencial.
Simulações podem usar dados fictícios claramente identificados; nunca doses
fictícias apresentadas como orientação clínica.

---

## 13 · Arquitetura e decisões técnicas

### Separação recomendada

| Camada | Responsabilidade |
|---|---|
| Interface | Componentes acessíveis e fluxo guiado, sem critérios clínicos ocultos em botões. |
| Domínio | Atendimento, observações, decisões, intervenções e invariantes. |
| Motor | Funções determinísticas e resultados com razões/pendências. |
| Conteúdo | Regras e fichas versionadas, rastreáveis e revisáveis. |
| Orquestração | Intervenções, retornos, tarefas e recursos. |
| Persistência | Salvar, recuperar, sincronizar quando houver e manter histórico. |
| Verificação | Testes clínicos, cálculos, integrações e simulação de uso. |

### Estrutura de pastas sugerida

`docs/escopo.md; docs/decisoes.md; docs/status.md; docs/risks.md; clinical/rules/;
clinical/medications/; clinical/references/; src/domain/; src/engine/;
src/workflows/; src/ui/; src/storage/; tests/clinical/; tests/calculations/;
tests/e2e/.`

### Escolhas sem dependência de fornecedor

Uma aplicação web responsiva com tipos explícitos é uma opção de partida. React e
TypeScript podem servir ao protótipo, mas a escolha final deve considerar
manutenção e ambiente da equipe. Verificar versões e documentação oficial no
momento da implementação. Este PDF não depende de comandos específicos de uma
versão de Codex, Claude Code ou Cursor.

### Offline e proteção de dados

Offline não é automático por ser PWA. Se incluído, testar disponibilidade do
conteúdo, persistência, atualização, conflito e recuperação. Antes de dados reais,
definir autenticação, autorização, proteção do armazenamento, logs, retenção e
exportação. Não enviar identificadores clínicos a ferramentas de IA ou telemetria
sem desenho apropriado e autorização.

> **[CORREÇÃO 12/09] — offline e multiusuário.** **Offline/local-first** e
> **conflito multiusuário** são **decisões de E01**, e **não opcionais**. A
> frase *"Se incluído"* acima deixa de valer: E01 só fica pronto com as duas
> decisões registradas.

### O que o AVC deixa como base [p.23–27]

Cabeçalho, contexto do paciente, unidade visual, ajuda contextual, registro de
ações, estados de dados, motor explicável, calculadoras reutilizáveis e retorno.
As oito etapas são a organização proposta para AVC; não são uma sequência
universal de todas as emergências.

### Contrato comum de módulo [p.23–27]

ID estável; família; versão; idiomas; entradas aceitas; eventos produzidos;
dependências; estado de validação; rota de entrada e retorno. Cada módulo declara
suas capacidades, sem assumir que todos tenham as mesmas etapas.

### Sequência de construção [p.23–27]

Fundação visual e bilíngue → AVC completo em simulação → validação do padrão →
segundo módulo com decisões diferentes → ajuste dos componentes compartilhados →
demais emergências. Integração do PCR na fase posterior solicitada, com contrato
previsto desde o início.

---

## 14 · Plano de execução e portões de avanço

| Entrega | Pronto quando… |
|---|---|
| E01 \| Escopo e matriz | Caminhos, limites, pendências clínicas e critérios de aceite documentados. |
| E02 \| Protótipo | Oito telas navegáveis com pacientes fictícios, ameaças e retorno. |
| E03 \| Estado e histórico | Recuperação após fechamento, unidades e marcos temporais corretos. |
| E04 \| Motor | Resultados reproduzíveis com dados presentes, ausentes e contraditórios. |
| E05 \| Intervenções | Chamada, execução, resposta e retorno preservados. |
| E06 \| Tratamentos | Regras/fármacos validados; registros reais e prevenção de duplicidade. |
| E07 \| Destino e 48 h | Cuidado durante espera, resumo e agenda contextual. |
| E08 \| Auditoria | Falhas críticas corrigidas e casos de regressão presentes. |
| E09 \| Simulação humana | Usuários executam cenários sem orientação externa indevida. |
| E10 \| Piloto | Condições clínicas, operacionais e de dados aprovadas para o cenário. |

> **[CORREÇÃO 12/09] — E01.** E01 só fica pronto com as decisões de
> **offline/local-first** e **conflito multiusuário** registradas.

### Organização com IA

Um implementador por tarefa. Um revisor independente confere mudanças e casos sem
presumir correção. Você decide os pontos clínicos e verifica o uso. A IA não assina
aprovação médica. Se usar vários agentes, delimitar arquivos e responsabilidades;
evitar alterações simultâneas no mesmo componente.

### Estimativa e controle de escopo

Estimar esforço após E01 e E02, quando quantidade de regras, medicamentos e
integrações for conhecida. Separar protótipo, simulação validada e produto
assistencial. Não prometer prazo de implantação com base apenas no número de telas.

### Primeira fatia de implementação

Percorrer as oito etapas com um paciente fictício estável, provando fluxo e
registro. Em seguida acrescentar incerteza, reavaliação, suporte, hemorragia,
recursos ausentes e complicações. Esses caminhos são necessários antes de uso
clínico, não melhorias opcionais pós-lançamento.

---

## 15 · Casos de aceite e provas de segurança

| ID / cenário | Resultado esperado |
|---|---|
| A01 \| História incompleta | Navegação e acionamento de imagem disponíveis; nenhuma inferência de normalidade. |
| A02 \| Pressão tratada sem nova medida | Condição continua pendente; não liberar decisão por medicamento administrado. |
| A03 \| Anticoagulante sem última dose | Incerteza explícita e investigação; não assumir ausência de efeito. |
| A04 \| Início desconhecido | Não substituir por descoberta; abrir caminho de avaliação apropriado. |
| A05 \| NIHSS baixo incapacitante | Não negar tratamento apenas pela pontuação. |
| A06 \| NIHSS incompleto | Sem total completo inventado. |
| A07 \| Hemorragia na imagem | Fluxo próprio e bloqueio da recomendação indevida de IVT. |
| A08 \| IVT impedida, possível EVT | Avaliação e acesso à EVT continuam. |
| A09 \| Intubação e módulos associados | Suporte registrado; retorno correto; exame basal preservado. |
| A10 \| Correção glicêmica e déficit persistente | Reavaliação neurológica e continuidade da investigação. |
| A11 \| Deterioração após tratamento | Avaliação imediata; não esperar agenda de rotina. |
| A12 \| Sem recurso ou transferência | Plano local, apoio, documentação e revisão do acesso. |
| A13 \| Fechar e reabrir | Estado e eventos recuperados sem duplicar administração. |
| A14 \| Novo dado relevante | Revisar conclusão atual; manter decisão histórica. |
| A15 \| 24 h sem imagem de controle | Não liberar automaticamente terapia dependente dessa avaliação. |
| A16 \| Concentração alterada | Recalcular volume de forma explícita; não alterar dose histórica. |
| A17 \| Clique duplo | Uma administração registrada, com identificação do evento. |
| A18 \| Dois usuários alteram o caso | Conflito detectado e conciliado; sem sobrescrita silenciosa. |

Os casos são requisitos de comportamento. Para testar decisões clínicas com
valores, completar previamente entradas e resultados esperados usando fontes e
validação médica. Acrescentar limites, unidade incorreta, virada de data e
resultados desatualizados.

---

## 16 · Comando mestre — iniciar o projeto

Copie o bloco abaixo após anexar este PDF. Os comandos são instruções em linguagem
natural para o agente, não comandos de terminal.

### Atualização do contrato — aplicar antes do C01 [p.23–27]

> Atualize o escopo para um app de emergências médicas bilíngue pt-BR/es. AVC é o
> primeiro módulo e referência de componentes, estado, registro, ajuda e retorno;
> regras e etapas permanecem específicas de cada emergência. Crie famílias para
> emergências guiadas, procedimentos/suporte, PCR existente e
> calculadoras/escores.
>
> Use as seis imagens apenas como referência visual. Adote tema escuro com
> cartões legíveis, pouco brilho, contexto compacto e uma ação principal. Reduza
> a grade em celulares. Reserve cores de alerta para estados reais. Não copie as
> decisões ou valores clínicos presentes nas imagens.
>
> Implemente internacionalização desde a fundação, incluindo erros, ajuda,
> resumos e exportações. Separe idioma, país, recursos e conteúdo clínico. Trocar
> idioma não altera dados ou resultados. Prepare tema claro equivalente.
>
> Mantenha a proibição de consultar o app anterior, exceto o módulo PCR que o
> usuário fornecer expressamente para integração futura.
> **[REVOGADO — D-AVC-01]** Não o reescreva nem presuma adaptações pequenas antes
> de inspecioná-lo. Atualize escopo, arquitetura, critérios de aceite e status
> antes da próxima entrega.

### Comando mestre

> Você atuará como implementador de um novo módulo de AVC para atendimento
> guiado. Leia integralmente o PDF anexo e use-o como especificação de produto e
> engenharia. Não consulte, copie ou adapte o app anterior. A única exceção será
> o módulo PCR fornecido expressamente para integração futura, conforme páginas
> 23–27. Trabalhe em projeto novo e isolado. **[REVOGADO — D-AVC-01]**
>
> O usuário principal é um médico com pouca experiência. O produto deve orientar
> avaliação, ação, execução, reavaliação e resgate. Implemente motor
> determinístico, conteúdo clínico separado, estados explícitos de incerteza,
> histórico e retorno entre módulos.
>
> Não invente doses, diluições, limiares, janelas, contraindicações ou exceções.
> Identifique os parâmetros ausentes e mantenha-os pendentes. Não produza
> recomendação assistencial com conteúdo não validado. Use pacientes fictícios
> durante desenvolvimento.
>
> Antes de editar: inspecione o ambiente e as instruções locais, confirme que o
> diretório é isolado e apresente o estado inicial. Crie docs/escopo.md,
> docs/decisoes.md, docs/status.md e docs/risks.md. Mapeie os requisitos deste PDF
> para entregas e casos de aceite.
>
> Execute apenas a entrega solicitada em cada comando. Faça mudanças pequenas e
> verificáveis; não reescreva áreas fora do escopo. Não solicite confirmações para
> escolhas reversíveis já autorizadas. Quando faltar decisão clínica, registre a
> pendência e avance no trabalho técnico independente dela.
>
> Ao terminar, informe: objetivo alcançado; arquivos alterados; testes executados
> e resultados reais; limitações; pendências; próximo comando. Atualize
> docs/status.md com o ponto exato de retomada. Não declare aprovação clínica,
> implantação ou teste que não ocorreu. Não publique nem conecte dados reais nesta
> fase.

### Como utilizar

Aplique primeiro a atualização da página 27 e execute C01 a C10 em ordem. Um
comando pode exigir mais de uma rodada. Não avance apenas porque o agente escreveu
"concluído": confira a entrega e seus critérios. Se houver falha, use o comando de
correção da página 21.

### Autonomia com limites claros

A IA pode construir protótipo, dados, navegação e testes de estrutura enquanto a
matriz clínica é revisada. Regras de alto risco permanecem indisponíveis para
orientação assistencial até validação. Isso evita paralisar o desenvolvimento sem
inventar condutas.

---

## 17 · C01 e C02 — especificar e prototipar

### C01 | Matriz de requisitos e decisões

> Aplique o comando mestre. Produza a especificação executável das oito telas e dos
> três fluxogramas. Para cada requisito, atribua ID, entrada, comportamento, saída,
> dependências, tratamento de desconhecidos e caso de aceite. Separe requisito de
> interface, regra clínica, cálculo, persistência e recurso assistencial.
>
> Crie a matriz de regras clínicas com campos definidos na página 12. Não complete
> critérios de memória. Pesquise apenas fontes primárias/oficiais para propostas
> clínicas; registre título, ano, localização, acesso e divergências. Marque
> proposta como pendente de validação médica.
>
> Liste as decisões ainda necessárias sem bloquear tarefas técnicas independentes.
> Entregue o mapa requisito → entrega → teste e o escopo da primeira fatia
> simulada. Não implemente o motor clínico nesta tarefa.

**Aceite:** todos os caminhos do PDF mapeados, incluindo hemorragia, recursos
ausentes, falha terapêutica, retorno e 48 horas. Nenhuma pendência disfarçada como
regra aprovada.

### C02 | Protótipo navegável

> Implemente um protótipo responsivo em português e espanhol com as oito etapas. Use
> dados fictícios explicitamente marcados como simulação. Mostre cabeçalho
> compacto, prioridade, ação atual, ajuda contextual e tarefas em andamento.
>
> Implemente navegação livre sem concluir dados automaticamente; botões "Preciso de
> ajuda" e "Paciente piorou"; exemplos de desconhecido e pendente. Inclua uma
> intervenção simulada com retorno ao campo de origem e um caminho sem recurso
> local. Não insira doses fictícias ou recomendação clínica inventada.
>
> Teste o fluxo em celular e computador com a ferramenta de navegador disponível.
> Apresente capturas e descreva interações realmente verificadas. Use a stack
> existente apenas se o projeto novo já tiver uma; caso contrário, proponha e
> registre uma escolha simples antes de implementar.

**Aceite:** percurso de ponta a ponta, ajuda acessível e nenhuma dependência de
formulário integralmente preenchido.

---

## 18 · C03 e C04 — dados e motor

### C03 | Estado, eventos e recuperação

> Implemente o modelo da página 11 separado da interface. Defina tipos explícitos
> para desconhecido, pendente, presente, ausente e não aplicável conforme o dado.
> Preserve valor, unidade, horário observado, horário registrado, origem e autor.
>
> Crie histórico de observações e eventos sem sobrescrita silenciosa. Implemente
> salvamento e recuperação após fechamento. Diferencie rascunho de dado
> confirmado. Evite duplicidade de eventos por clique repetido. Planeje conflito
> entre usuários se houver colaboração; não simule suporte multiusuário
> inexistente.
>
> Adicione testes de recuperação, correção de dado, datas, unidade inválida e
> idempotência. Mantenha dados fictícios. Documente limitações reais do
> armazenamento escolhido e o que será necessário antes de usar dados de pacientes.

**Aceite:** fechar e reabrir preserva o atendimento; medida nova não apaga a
anterior; nenhum evento de administração é duplicado.

### C04 | Motor determinístico e explicável

> Implemente o contrato do motor clínico como funções independentes da interface.
> Cada resultado deve trazer status, motivos, pendências, referências às observações
> utilizadas e versão das regras. Separe elegibilidade, disponibilidade e decisão
> médica. IVT e EVT devem ter resultados independentes.
>
> Implemente apenas regras cujo conteúdo esteja explicitamente validado na matriz.
> Para as demais, crie o contrato e devolva "regra clínica pendente de validação",
> sem recomendação afirmativa. Teste a infraestrutura com regras sintéticas não
> assistenciais claramente identificadas.
>
> Uma atualização relevante deve reavaliar a conclusão e preservar a versão
> histórica. Dados desconhecidos, ausentes ou contraditórios não podem produzir
> liberação por padrão. Mostre a ligação entre cada regra implementada e seus casos
> de teste.

**Aceite:** resultados reproduzíveis; ausência de informação tratada; regras fora
dos componentes de interface; pendências clínicas transparentes.

---

## 19 · C05 e C06 — intervenções e medicamentos

### C05 | Coordenador de módulos

> Implemente chamada e retorno de intervenções com encounterId, ponto de origem e
> pilha de navegação. Faça uma simulação completa: AVC → via aérea → cuidados
> pós-intubação → ventilação/analgesia/sedação → retorno ao AVC. Não obrigue uma
> ordem burocrática que impeça cuidados simultâneos.
>
> O retorno deve transportar eventos realmente registrados, suporte atual, resposta
> e pendências. Voltar não significa intervenção concluída. Preserve exames,
> infusões e transferências em andamento. Se o módulo não estiver implementado,
> mostre indisponibilidade de forma explícita e permita registrar conduta externa,
> sem simular execução.
>
> Teste retorno aninhado, cancelamento, interrupção, recuperação após fechamento e
> deterioração durante uma intervenção. Não introduza conteúdo clínico não validado.

**Aceite:** mesmo paciente, mesmo histórico, ponto de origem correto e ameaça
pendente até reavaliação.

### C06 | Catálogo farmacológico e execução

> Crie o esquema de fichas farmacológicas da página 12 e o fluxo de execução da tela
> 6. Separe dose prescrita, preparo e administração. Concentração confirmada é
> pré-requisito para conversão em volume. Preserve a dose real histórica ao alterar
> peso ou apresentação.
>
> Somente habilite fichas com parâmetros validados e fonte rastreável. Ausências em
> dose, máximo, via, preparo ou monitorização aplicável impedem recomendação
> assistencial daquela ficha. Não preencha lacunas com suposições.
>
> Implemente testes de unidades, máximos, tipo de peso, arredondamento,
> concentração, clique duplo, interrupção e quantidade administrada. Para cada
> cálculo de alto risco, confronte com casos esperados revisados
> independentemente, não apenas com a mesma fórmula copiada do código.

**Aceite:** escolher não administra; alterar concentração não altera
silenciosamente dose; nenhuma ficha pendente aparece como utilizável.

---

## 20 · C07 a C10 — concluir e verificar

### C07 | Recursos e destino

> Implemente perfil do serviço com disponibilidade atual confirmável. Separe
> indicação clínica de acesso ao tratamento. Modele contato, aceite, transporte,
> espera, saída e entrega. Sem recurso ou transferência confirmada, mantenha plano
> local e reavaliação do acesso, usando apenas conteúdo validado. Gere resumo com
> intervenções reais e pendências. Teste os casos A08 e A12.

### C08 | Agenda até 48 horas

> Implemente tarefas vinculadas a eventos reais e ao caminho clínico. Diferencie
> IVT, EVT, ausência de reperfusão e hemorragia. Não use passagem do tempo como
> autorização isolada de medicamento. Uma condição adicional, como resultado de
> imagem, permanece exigida quando prevista na regra validada. Deterioração abre
> avaliação imediata. Teste agenda, atraso, cancelamento e fuso; documente limites
> de notificações em segundo plano.

### C09 | Auditoria independente

> Revise a implementação sem presumir correção. Leia especificação, matriz clínica,
> código e testes. Procure inferência de normalidade por ausência, critérios na
> interface, perda de retorno, decisões desatualizadas, erros de unidade, duplicação
> de dose, caminho sem saída e falsa conclusão de tarefa. Para cada achado informe
> ID, gravidade, arquivo/função, reprodução, comportamento atual/esperado e teste
> necessário. Não altere código nesta rodada. Não declare validação clínica humana.

### C10 | Simulação e preparação de piloto

> Após corrigir achados, execute os casos da página 15 e verifique a jornada
> completa no navegador. Prepare roteiro de simulação para médicos, com objetivos
> observáveis e registro de erros/ajuda necessária. Liste separadamente evidências
> técnicas e aprovações humanas pendentes. Produza relatório de prontidão para
> piloto, sem publicar nem liberar uso assistencial automaticamente. Não considerar
> número de testes como prova suficiente de segurança clínica.

**Entrega final de engenharia:** código revisável, documentação atualizada, matriz
requisito/teste, resultados reais, riscos remanescentes e instruções de execução do
projeto.

### C11 | Replicar a estrutura para nova emergência [p.23–27]

> Crie o módulo [NOME] usando o contrato comum e os componentes validados no AVC.
> Mapeie suas próprias decisões, prioridades, intervenções, reavaliações e caminhos
> sem recursos com fontes adequadas. Não copie contraindicações, janelas ou etapas
> do AVC. Entregue PT/ES, casos clínicos próprios e testes de não regressão do
> núcleo compartilhado.

### C12 | Integrar o PCR quando fornecido [p.23–27]

> Inspecione o PCR fornecido sem alterar inicialmente sua lógica. Documente
> comportamento e testes de caracterização. Proponha adaptador de paciente, eventos,
> idioma, entrada, saída e continuidade. Implemente mudanças mínimas verificáveis;
> preserve cronômetros e interações críticas. Relate incompatibilidades reais, sem
> estimar esforço com base apenas na aparência.

---

## 21 · Comandos de retomada e correção

### Retomar em outra sessão ou ferramenta

> Leia o PDF mestre, as instruções do repositório e docs/status.md,
> docs/decisoes.md, docs/risks.md e a matriz de regras. Inspecione o estado real do
> código e das alterações locais. Não presuma que a conversa anterior comprova uma
> implementação.
>
> Informe qual entrega está concluída, qual está em andamento, quais testes existem
> e qual é a próxima tarefa autorizada. Continue dessa tarefa preservando alterações
> corretas. Não reinicie o projeto nem reescreva o que já funciona. Registre novas
> decisões e pendências no repositório.

### Corrigir um achado específico

> Corrija somente o achado [ID], conforme sua reprodução e comportamento esperado.
> Antes de editar, identifique a causa e as dependências. Acrescente ou ajuste um
> teste que reproduza o defeito e demonstre a correção. Verifique as decisões e os
> fluxos afetados. Não amplie o escopo nem modifique critérios clínicos sem
> fundamento validado. Entregue diff resumido, testes reais e limitações. Atualize o
> status do achado.

### Preparar revisão médica de regra

> Para cada regra pendente, apresente pergunta clínica, população, cenário, critérios
> propostos, exceções, dados necessários, conduta diante de incerteza e fonte
> primária com localização. Separe recomendação de diretriz, adaptação local e
> escolha de interface. Não trate aprovação de outra regra como aprovação desta.
> Registre a decisão humana somente quando explicitamente fornecida, com versão e
> data.

### Checklist de entrega de cada rodada

- Escopo realizado e requisitos atendidos; arquivos alterados e motivo.
- Testes executados com resultado; verificação de navegador quando houver
  interação.
- Pendências e riscos, incluindo conteúdo clínico não validado.
- Estado salvo em docs/status.md e próximo comando específico.

---

## 22 · Pendências, fontes e critério de conclusão

### O que ainda deve ser completado antes de uso assistencial

Matriz integral de critérios clínicos; doses e preparos; conteúdo oficial do NIHSS e
direitos de uso dos materiais; caminhos hemorrágicos e populações especiais; limites
de validade das medidas; regras locais de suporte e transferência; prescrições por
contexto; revisão médica documentada. Definir requisitos de privacidade,
enquadramento regulatório e implantação com avaliação apropriada, sem presumir
conformidade.

### Fontes que fundamentam os princípios clínicos do desenho

**R1.** Canadian Stroke Best Practices. Emergency Department Evaluation and
Management. Atualização 2022; remissões posteriores de EVT. *Abrir fonte oficial.*

**R2.** Canadian Stroke Best Practices. Acute Ischemic Stroke Treatment. 2022;
atualização de EVT 2025. *Abrir fonte oficial.*

**R3.** AHA/ASA. Top Things to Know: 2026 Guideline for the Early Management of
Patients With AIS. 26 jan. 2026. Resumo oficial; não substitui texto integral para
parametrização. *Abrir fonte oficial.*

> **[CORREÇÃO 12/09] — R3 passa a ser o texto integral, mais a errata.**
>
> **R3.** Prabhakaran S et al. *2026 Guideline for the Early Management of
> Patients With Acute Ischemic Stroke.* **Stroke 2026;57(8):e316–e436**,
> doi 10.1161/STR.0000000000000513, **MAIS** a errata
> **Stroke 2026;57(8):e461–e467**, doi 10.1161/STR.0000000000000530.
>
> **Nenhuma regra é parametrizada sem conferir a errata.**

**R4.** Canadian Stroke Best Practices. Acute Stroke Unit Care. *Abrir fonte
oficial.*

**R5.** Canadian Stroke Best Practices. Acute Antithrombotic Therapy. Atualização
2022; verificar novidades antes de parametrizar esquemas. *Abrir fonte oficial.*

**R6.** Canadian Stroke Best Practices. Inpatient Prevention and Management of
Complications following Stroke. *Abrir fonte oficial.*

> **[CORREÇÃO 12/09] — fontes brasileiras acrescentadas.**
>
> - Diretrizes **ABN/SBDCV** de AVC isquêmico agudo.
> - **Linha de Cuidado do AVC** (Ministério da Saúde).
> - **Portaria GM/MS 665/2012** (centros de AVC Tipo I/II/III).
>
> **Só cite após abrir a fonte e colar a frase literal com localização.** Nesta
> conversão nenhuma das três foi aberta; nenhum conteúdo delas está afirmado
> neste documento.

Fontes consultadas na elaboração desta conversa em 12/09/2026. As citações
sustentam princípios clínicos; estados de dados, telas, arquitetura e comandos são
propostas de engenharia. Não foi realizada auditoria farmacológica completa nem
validação médica desta versão.

### Quando considerar a construção concluída

O médico consegue percorrer a jornada em simulação, reconhecer prioridades,
executar e reavaliar ações, lidar com falta de recurso e entregar o caso. O motor
explica conclusões e incertezas; os dados sobrevivem a interrupções; os cálculos têm
provas independentes; não há falha crítica conhecida em aberto. A passagem de
construção para uso assistencial exige as validações específicas acima.

**Novo critério de conclusão [p.23–27]:** a plataforma e todos os módulos liberados
têm PT/ES completo; o AVC funciona como referência de experiência, sem impor sua
lógica às demais emergências. A segurança deve ser demonstrada em testes e
simulações, não prometida pela aparência.

**Próximo passo recomendado:** anexar este PDF e executar o comando mestre seguido de
C01. Este documento não autoriza publicação, integração com dados reais ou
implantação clínica automática.
