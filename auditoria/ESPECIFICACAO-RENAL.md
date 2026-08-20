<!-- ─────────────────────────────────────────────────────────────────────────
     CABEÇALHO DE ARQUIVAMENTO — acrescentado em 2026-08-20.
     Tudo abaixo da linha "DOCUMENTO ORIGINAL" é VERBATIM e não se edita.
     ───────────────────────────────────────────────────────────────────────── -->

# ESPECIFICAÇÃO DO MÓDULO RENAL — documento histórico

**Origem:** mensagem de chat do autor (Dr. Sandro Dainez).
**Recuperado e arquivado em:** 2026-08-20.
**Natureza:** documento de chat, **não derivado de código**. Até esta data ele
existia apenas na conversa, e a única pegada dele no repositório era a D-59 —
o norte do módulo mais trabalhado do app estava fora do controle de versão e
sumia junto com a sessão.

**O que este documento É:** o **NORTE** do módulo renal. Referência de intenção.

⚠️ **O QUE ELE NÃO É: uma ordem para executar.** Está escrito em modo imperativo
("RECONSTRUA o módulo…", "Crie um ramo…") porque foi escrito como pedido, na
época. Arquivá-lo não o transforma em tarefa. **Nada aqui deve ser implementado
por leitura deste arquivo** — o que vale como trabalho é o que estiver acordado
na conversa corrente.

⚠️ **ELE NÃO ESTÁ SOZINHO.** Decisões posteriores a este texto vivem em
[`ESPECIFICACAO-RENAL-EMENDAS.md`](./ESPECIFICACAO-RENAL-EMENDAS.md) (E-1 a
E-10). **Onde houver conflito, a emenda prevalece** — a disciplina é a do
retrato antes/depois: o documento é registro, a mudança vem ao lado. Quem for
trabalhar no módulo lê os dois.

---

## DOCUMENTO ORIGINAL — VERBATIM

Quero que você RECONSTRUA o módulo Insuficiência Renal Aguda / Lesão Renal Aguda (IRA/AKI) e IRA sobre Doença Renal Crônica deste aplicativo de emergências.

Este módulo atualmente está fora do padrão dos demais módulos, pouco intuitivo e organizado como conteúdo didático. NÃO quero apenas reorganização visual ou mudança de textos.

Quero transformar o módulo em um fluxo clínico real de atendimento médico, semelhante ao raciocínio utilizado à beira-leito, em formato de árvore decisória progressiva.

1. ANTES DE ALTERAR QUALQUER CÓDIGO

Primeiro:

1. Localize todos os arquivos relacionados ao módulo renal.
2. Analise sua estrutura, navegação, estados, componentes, cálculos e dependências.
3. Compare com 2–3 módulos do aplicativo que já utilizam corretamente o padrão de árvore clínica.
4. Identifique o padrão de:
   * cards;
   * perguntas;
   * botões;
   * ramificações;
   * navegação;
   * voltar;
   * conclusão;
   * alertas;
   * cálculos;
   * integração com módulos auxiliares.
5. Preserve o design system, componentes compartilhados e arquitetura do aplicativo.
6. Não modifique outros módulos desnecessariamente.

Depois faça a reconstrução.

2. OBJETIVO DO MÓDULO

O médico deve conseguir abrir o módulo diante de um paciente com:

* creatinina elevada;
* aumento recente da creatinina;
* oligúria;
* anúria;
* redução inexplicada da função renal;
* IRA já diagnosticada;
* suspeita de IRA sobre DRC;
* distúrbio hidroeletrolítico relacionado à insuficiência renal.

A partir daí o app deve conduzir o atendimento passo a passo, fazendo perguntas e abrindo somente as decisões relevantes para aquele paciente.

Não construir uma apostila.
Construir um motor de decisão clínica.

3. MACROFLUXO OBRIGATÓRIO

A árvore principal deverá seguir aproximadamente esta lógica:

ENTRADA
↓
1. Reconhecer possível IRA
↓
2. Procurar imediatamente condições com risco de morte
↓
3. Confirmar critérios e classificar a IRA
↓
4. Determinar se é IRA nova, DRC conhecida ou IRA sobre DRC
↓
5. Avaliar perfusão, volemia e contexto hemodinâmico
↓
6. Pesquisar obstrução urinária
↓
7. Investigar etiologia provável

* pré-renal/hemodinâmica;
* renal/intrínseca;
* pós-renal;
* etiologia multifatorial.
↓
8. Solicitar exames de forma dirigida
↓
9. Instituir tratamento etiológico + suporte
↓
10. Tratar complicações
↓
11. Verificar necessidade de terapia renal substitutiva
↓
12. Reavaliar resposta
↓
13. Definir destino, monitorização e seguimento

IMPORTANTE: diagnóstico, investigação e tratamento frequentemente acontecem simultaneamente. Não transformar essas etapas em capítulos rígidos quando clinicamente precisarem ocorrer em paralelo.

4. PRIMEIRA TELA — TRIAGEM DE GRAVIDADE

Logo no início, antes de longas investigações, verificar se existe emergência renal ou metabólica.

Perguntar/identificar:

* anúria ou oligúria importante;
* hipercalemia significativa ou alterações eletrocardiográficas;
* acidemia metabólica grave/refratária;
* edema pulmonar ou hipervolemia com repercussão;
* síndrome urêmica complicada;
* instabilidade hemodinâmica/choque;
* intoxicação potencialmente dialisável quando pertinente;
* rápida deterioração clínica.

Se houver uma dessas situações, abrir imediatamente o ramo correspondente de estabilização/tratamento.

Não obrigar o médico a percorrer toda a investigação antes de tratar uma ameaça imediata.

5. CONFIRMAÇÃO E CLASSIFICAÇÃO DA IRA

Criar fluxo para verificar:

* creatinina atual;
* creatinina basal conhecida;
* valores anteriores e intervalo entre eles;
* diurese;
* peso;
* tempo de evolução.

Classificar conforme critérios KDIGO vigentes e apresentar o estágio de IRA quando os dados permitirem.

O sistema deve:

* calcular automaticamente quando houver dados suficientes;
* explicar qual critério determinou o estágio;
* informar quando os dados forem insuficientes;
* não assumir creatinina basal fictícia;
* não inventar diurese;
* não classificar com falsa precisão.

Se creatinina basal não estiver disponível, criar ramo específico para "basal desconhecida".

6. IRA SOBRE DRC

Não tratar toda creatinina elevada como IRA.

Criar decisão específica:

Há evidência de DRC prévia?

Considerar dados como:

* creatininas anteriores;
* eTFG prévia;
* albuminúria/proteinúria conhecida;
* alterações estruturais renais;
* história conhecida de DRC;
* achados ultrassonográficos compatíveis;
* duração das alterações.

Permitir:

* IRA isolada;
* DRC sem evidência clara de agudização;
* IRA sobre DRC;
* situação indeterminada.

O módulo deve deixar explícito quando não for possível diferenciar inicialmente.

7. AVALIAÇÃO HEMODINÂMICA E DE VOLEMIA

Não utilizar a simplificação:
"creatinina alta → dar volume".

Criar ramo real de avaliação:

* PA/PAM;
* perfusão periférica;
* história de perdas;
* balanço hídrico;
* congestão;
* edema;
* estertores;
* turgência jugular quando disponível;
* sepse;
* insuficiência cardíaca;
* cirrose;
* hemorragia;
* uso de diuréticos;
* drogas que interferem na hemodinâmica renal;
* dados de POCUS quando disponíveis.

Diferenciar:

* provável hipovolemia;
* provável vasoplegia/choque distributivo;
* congestão/hipervolemia;
* baixo débito;
* estado volêmico incerto.

A conduta deve mudar conforme o fenótipo.
Não recomendar expansão volêmica indiscriminadamente.

8. EXCLUIR CAUSA PÓS-RENAL PRECOCEMENTE

Criar ramo de investigação de obstrução urinária:

* anúria;
* retenção urinária;
* sintomas prostáticos;
* neoplasias;
* cálculos;
* procedimentos urológicos;
* obstrução de sonda;
* bexigoma;
* hidronefrose;
* rim único;
* outros fatores relevantes.

Permitir avaliação por:

* checagem da sonda;
* bladder scan quando disponível;
* ultrassonografia;
* outros exames apropriados.

Se obstrução provável ou confirmada, oferecer conduta específica e critérios para avaliação urológica urgente.

9. INVESTIGAÇÃO ETIOLÓGICA DIRIGIDA

Não apresentar uma lista gigantesca de causas.
Criar perguntas progressivas que levem a hipóteses.

Pré-renal/hemodinâmica

Investigar:

* perdas;
* hemorragia;
* sepse;
* choque;
* vasodilatação;
* insuficiência cardíaca;
* cirrose;
* alterações hemodinâmicas;
* medicamentos relevantes.

Renal/intrínseca

Criar ramos conforme contexto para:

* necrose tubular aguda;
* nefrite intersticial;
* glomerulonefrite;
* doença vascular;
* rabdomiólise;
* hemólise;
* síndrome de lise tumoral;
* nefrotoxinas;
* contraste quando aplicável;
* outras etiologias relevantes.

Usar:

* história;
* medicamentos;
* EAS;
* sedimento urinário;
* proteinúria/albuminúria;
* hemograma;
* eletrólitos;
* CK;
* hemólise;
* sorologias/imunologia somente quando indicadas;
* imagem quando indicada.

Não solicitar exames indiscriminadamente.

10. EXAMES

Separar em:

Exames iniciais essenciais
Solicitados na maioria dos pacientes conforme contexto.

Exames condicionais
Somente aparecer quando alguma hipótese os justificar.

Exames especializados
Somente nos ramos apropriados.

Para cada exame importante, o módulo deve responder implicitamente:
"Por que estou pedindo este exame e o que farei dependendo do resultado?"

Evitar exames que não alterem a decisão clínica.

Quando utilizar índices urinários como FENa ou FEUreia, apresentar suas limitações e contexto de interpretação. Não tratá-los como testes absolutos capazes de diferenciar etiologia sozinhos.

11. TRATAMENTO

O tratamento deve ocorrer em paralelo à investigação quando indicado.

Criar condutas específicas para:

* correção de hipovolemia quando realmente presente;
* choque;
* sepse;
* congestão/hipervolemia;
* suspensão/revisão de nefrotóxicos;
* ajuste de medicamentos conforme função renal;
* obstrução;
* distúrbios eletrolíticos;
* acidose;
* rabdomiólise quando presente;
* causas específicas identificadas.

Não utilizar dopamina em "dose renal".

Não recomendar diuréticos como tratamento da IRA com objetivo de recuperar função renal; quando indicados, devem ser contextualizados principalmente no manejo de sobrecarga volêmica.

Evitar recomendações genéricas de hidratação sem avaliação hemodinâmica.

12. HIPERCALEMIA

Se houver hipercalemia relevante, permitir chamada direta para um subfluxo específico.

Esse ramo deve considerar:

* valor do potássio;
* sintomas;
* ECG;
* velocidade de elevação;
* função renal;
* possibilidade de pseudohipercalemia;
* necessidade de estabilização de membrana;
* deslocamento intracelular;
* remoção do potássio corporal;
* monitorização;
* rechecagem;
* indicação de TRS quando refratária ou apropriada.

Se já existir módulo independente de hipercalemia no aplicativo, NÃO duplicar toda a lógica.

Criar integração contextual:
IRA → Hipercalemia → tratar → retornar automaticamente ao ponto da árvore de IRA.

13. TERAPIA RENAL SUBSTITUTIVA

Criar um nó específico:
"Existe indicação de TRS urgente?"

Não utilizar apenas números isolados de ureia ou creatinina.

Avaliar contexto clínico e complicações, incluindo:

* distúrbios eletrolíticos refratários;
* acidose grave/refratária;
* sobrecarga volêmica refratária com repercussão;
* complicações urêmicas;
* intoxicações dializáveis quando pertinentes;
* outras indicações clinicamente relevantes.

Apresentar:

* chamar nefrologia;
* preparar acesso quando indicado;
* modalidade conforme estabilidade hemodinâmica e contexto;
* necessidade de UTI quando pertinente.

Não criar um limiar fictício de creatinina ou ureia como indicação automática de diálise.

14. REAVALIAÇÃO OBRIGATÓRIA

Após as primeiras intervenções, o módulo deve perguntar novamente:

* PA/PAM/perfusão;
* diurese;
* balanço;
* creatinina;
* potássio;
* bicarbonato/pH quando indicado;
* congestão;
* resposta à intervenção;
* progressão do estágio;
* surgimento de indicação de TRS.

Criar decisões:

Melhorou
→ continuar tratamento + monitorização.

Estável
→ revisar etiologia, exames e exposição renal.

Piorou
→ reclassificar gravidade + reconsiderar diagnóstico + nefrologia/TRS/UTI conforme contexto.

15. DESTINO

Ao final, o fluxo deve ajudar a decidir entre:

* acompanhamento ambulatorial selecionado;
* observação;
* internação;
* enfermaria;
* UTI;
* avaliação nefrológica urgente;
* terapia renal substitutiva.

Criar critérios clínicos objetivos para cada situação quando sustentados por evidência.

16. FOLLOW-UP

IRA não termina simplesmente quando a creatinina melhora.

Criar orientação final para:

* reavaliação da função renal;
* revisão de medicamentos;
* monitorização de creatinina/eTFG;
* avaliação de albuminúria quando apropriada;
* reconhecimento de IRA persistente/AKD;
* risco de evolução para DRC;
* seguimento nefrológico quando indicado.

17. UX DA ÁRVORE

Cada tela deve responder a UMA decisão clínica principal.

Evitar telas com grandes blocos de texto.

Priorizar:

Pergunta clínica
↓
2–5 opções
↓
próxima decisão

Usar caixas extras apenas para:

* ALERTA;
* CONDUTA IMEDIATA;
* DOSE;
* INTERPRETAÇÃO;
* ARMADILHA;
* REAVALIAÇÃO.

O médico deve conseguir usar o módulo durante atendimento real.

Conteúdo explicativo aprofundado pode existir em botão:
"Saiba mais"
mas não deve bloquear o fluxo principal.

18. NAVEGAÇÃO

Manter:

* voltar uma etapa;
* retornar ao nó principal;
* visualizar dados já informados;
* editar dados;
* não perder dados ao entrar em submódulos;
* retorno automático após módulo auxiliar;
* não reiniciar o caso acidentalmente.

Sempre que possível mostrar discretamente onde o médico se encontra:
IRA > Etiologia > Intrínseca > Sedimento ativo

19. DADOS DO PACIENTE

Quando disponíveis, reutilizar dados previamente inseridos:

* idade;
* sexo;
* peso;
* creatinina;
* creatinina basal;
* diurese;
* intervalo;
* potássio;
* Na;
* ureia;
* bicarbonato;
* pH;
* PA/PAM;
* medicamentos;
* comorbidades.

Nunca pedir novamente uma informação que o aplicativo já conhece.


> ⚠️ **NOTA DE ARQUIVAMENTO — ACRESCENTADA AO LADO DA §19 (2026-08-20).**
> Não apaga nem altera uma palavra da §19 acima; fica ao lado dela.
>
> **A §19 SAIU DO ESCOPO PELA D-59, e permanentemente (emenda E-6).**
>
> Ela colide com a razão escrita em `lib/contexto-do-paciente.ts`, que
> reaproveita entre módulos apenas **peso, altura, sexo e idade** e **proíbe**
> PA, SpO₂, glicemia, lactato, pH e potássio:
>
> > *valor que muda de minuto a minuto, preenchido sozinho, é número morto que
> > ninguém tem motivo para duvidar.*
>
> A §19 pede o contrário — reutilizar creatinina, potássio, Na, ureia,
> bicarbonato, pH e PA. Criar esse registro é decisão de **arquitetura e de
> privacidade**, e o autor a excluiu do escopo em 2026-08-18.
>
> **A emenda que a substitui (E-6):** dentro do MESMO módulo, valor volátil
> reexibido adiante mostra **quando foi informado** — "K⁺ 6,8 — informado há
> 4 min". Valor que carrega a própria validade é o oposto de valor preenchido
> sozinho. *(Estado em 2026-08-20: ainda não implementada.)*

20. SEGURANÇA CLÍNICA

Não invente:

* doses;
* critérios;
* cutoffs;
* classificações;
* indicações;
* contraindicações.

Não transforme heurísticas em recomendações absolutas.

Diferencie:

* recomendação estabelecida;
* prática razoável;
* evidência limitada;
* decisão dependente do contexto.

Onde houver controvérsia, não esconda a incerteza.

21. REFERÊNCIAS

Utilize prioritariamente:

* KDIGO Acute Kidney Injury;
* KDIGO Clinical Practice Guideline for CKD 2024;
* atualização KDIGO AKI/AKD 2026 somente conforme seu status real de publicação.

ATENÇÃO:
A KDIGO 2026 AKI/AKD foi disponibilizada como Public Review Draft. Não trate recomendações de um draft como guideline definitivo sem confirmar que a versão final já foi publicada.

Se houver conflito entre material antigo do aplicativo e guideline vigente, identifique e corrija.

Não utilize blog, site comercial ou conteúdo não revisado como fonte principal para decisão clínica.

22. VALIDAÇÃO FINAL

Depois da implementação, faça uma auditoria completa simulando pelo menos estes cenários:

1. hipovolemia por perdas gastrointestinais;
2. choque séptico com IRA;
3. insuficiência cardíaca congestiva + piora de função renal;
4. obstrução urinária;
5. IRA sobre DRC;
6. necrose tubular aguda;
7. suspeita de glomerulonefrite;
8. rabdomiólise;
9. IRA + hipercalemia;
10. IRA oligúrica progressiva com necessidade de TRS;
11. creatinina elevada sem creatinina basal conhecida;
12. paciente com melhora da função renal após intervenção.

Para cada cenário verifique:

* se o caminho clínico faz sentido;
* se nenhuma etapa perigosa foi atrasada;
* se não há loop;
* se não há tela sem saída;
* se nenhum dado é solicitado desnecessariamente;
* se as recomendações são coerentes;
* se o retorno dos submódulos funciona;
* se o médico consegue chegar à conduta em poucos cliques.

Ao terminar, me entregue:

1. estrutura anterior encontrada;
2. problemas encontrados;
3. nova árvore clínica;
4. arquivos alterados;
5. cálculos implementados;
6. integrações criadas;
7. pontos clínicos que precisam de validação humana;
8. resultados dos 12 casos de teste.

NÃO faça apenas alterações cosméticas.

O objetivo é que este módulo funcione como um assistente clínico de atendimento à IRA, conduzindo o médico da apresentação inicial até diagnóstico provável, tratamento, reavaliação e destino do paciente.
