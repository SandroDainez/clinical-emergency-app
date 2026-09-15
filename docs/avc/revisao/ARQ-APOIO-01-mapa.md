# ARQ-APOIO-01 · modo de apoio à decisão clínica — mapa e proposta de classificação

**Estado:** mapa só de leitura, sem código alterado. HEAD `38ee4a9` (`refactor/clinical-modules-rebuild`, enviado).
**Filosofia (autor, 2026-09-15):** o motor organiza evidência, critérios, doses, riscos e opções; o médico decide e registra.
**Categorias:**
- **1 · informação:** não impede nada.
- **2 · alerta clínico:** permite prosseguir com decisão médica registrada.
- **3 · inconsistência de dados:** o sistema não conclui até corrigir.

**Nota regulatória, em uma linha:** apoio à decisão é decisão de produto e de UX. Não é garantia de enquadramento fora de SaMD. A avaliação regulatória fica para antes de comercializar.

Na coluna «proposta», **tudo é proposta, não decisão**. As linhas marcadas **❓** precisam da sua escolha.

---

## 0 · O achado que dimensiona a rodada

**O app já não impede o médico de agir.** Hoje o portão faz três coisas: **declara** um estado («bloqueado», «não recomendada»), lista os motivos e **esconde** a pergunta «Decisão sobre prosseguir» quando está fechado. Em nenhum caso ele desativa a execução:
- no AVC, «Registrar administração» (`avc-nova-trombolise`) nunca fica desativado, e `prova-avc-fase6-portao.cjs:329` trava isso;
- nenhum campo tem `bloqueiaTerapia: true`.

A mudança, portanto, é de **semântica, linguagem e registro da decisão**, não de destravar botões. Também por isso a maior parte das travas que dizem `liberado === false` continua valendo: «sem pendências» só aparece quando não há alerta nem inconsistência.

**A exceção é a PCR.** Ali o app de fato recusa ações e avança sozinho (§6).

---

## 1 · Onde o app bloqueia, libera, indica ou contraindica

### 1.1 AVC · portão da trombólise (`avc/nucleo/portao-ivt.ts`)

São 16 estados, verificados nesta ordem: `bloqueado_seguranca` → `decisao_de_nao_prosseguir` → `nao_recomendada` → `nao_sustentada` → `saida_diagnostica_pendente` → `reconciliacao_pendente` → `resultado_pendente` → `afericao_incompleta` → `aguardando_reavaliacao` → `bloqueado_corrigivel` → `decisao_clinica_pendente` → `avaliacao_risco_beneficio_pendente` → `julgamento_individual_pendente` → `informacao_incompleta` → `sem_criterios` → `liberado`.

O comentário do tipo (`:61`) e a prova da fase 6 ainda dizem «7 estados», e o cabeçalho (`:49`) diz que não existe override. Os dois estão desatualizados.

| motivo | hoje | resolvido por | natureza | **proposta** |
|---|---|---|---|---|
| `imagem`: hemorragia na TC | segurança, impede | correção do resultado | fonte (F-16, COR 1·A) | **2, crítico ❓** |
| `imagem`: dois estudos divergentes | segurança, impede | correção do estudo errado | dado | **3** (hoje aparece como «contraindicação de segurança») |
| `imagem_nao_excluida`: sem TC, sem laudo ou só RM | classe | TC sem contraste com resultado | dado faltante | **3**: o app não afirma «hemorragia excluída» |
| `corte-inr`, `corte-aptt`, `corte-tp`, `corte-plaquetas` | segurança, impede | nada | fonte (limites F-10) | **2, crítico ❓** |
| `divergencia-<analito>` | até reconciliar | correção da coleta | dado | **3** |
| `unidade-plaquetas` | até reconciliar | registrar a unidade | dado | **3** |
| `coagulograma`: varfarina/heparina em uso | até o resultado | resultados pertinentes | fonte (Table 8) + C6 | **2** |
| `coagulograma`: suspeita «Sim» | até o resultado | resultados | fonte (rec. 10, COR 2a, condicional) | **2** |
| `coagulograma`: suspeita «Incerto» | até o resultado | resultados | adaptação do projeto | **2** |
| `condicao_resolutiva_coagulograma` | informa | — | E-47 | **1** |
| `juizo_coagulacao`: pergunta sem resposta | aguarda juízo | responder | dado faltante | **3**, com a pergunta nomeada |
| `doac` | exige julgamento | julgamento registrado | fonte («may be considered») | **2**, já é |
| `doac_hora` | aguarda juízo | horário ou «não sei» | dado faltante | **3** |
| `cmb` (>10 microssangramentos) | benefício incerto | julgamento | fonte (COR 2b) | **2**, já é; corrigir o texto «não fica bloqueada» (`derivacoes-d.ts:329`) |
| `item-<x>` da Table 8, faixa «absoluta» | impede | só desmarcar | fonte sem COR/LOE; faixa «unsupported by evidence» | **2, crítico ❓** |
| `item-<x>`, verbo «individual» | exige julgamento | julgamento | fonte | **2**, já é |
| `item-<x>`, trauma de 14 d a 3 m | risco-benefício obrigatório | julgamento | autor | **2**, já é |
| `item-<x>`, risco aumentado ou segurança desconhecida | informa | — | fonte | **1** |
| `suspeita_hsa` | destino | correção do registro | D-PEND-23 | **2** (seu exemplo) |
| `marcos_temporais`: horários incompatíveis | até reconciliar | correção do horário | dado | **3** |
| `cor3-<rec>` | veredito | nada | fonte (COR 3) | **2, crítico ❓** |
| `criterio-<id>`: déficit não incapacitante ou fora da janela | veredito | mudar a resposta; nada para o tempo | composição do projeto | **2** |
| `pressao_acima_da_meta` (185/110) | correção | nova PA abaixo da meta | fonte (F-04) | **2**, com a correção sugerida |
| `glicemia_alterada` (<60) | correção | nova glicemia | fonte (F-06) | **2** |
| `afericao_incompleta`: meia PA | correção | a outra metade | dado | **3** |
| `reavaliacao_neurologica` depois da correção | correção | exame neurológico | fonte (texto de suporte) | **2** |
| `ultima_pressao_completa` | informa | — | — | **1**. Hoje o «Limpar» conta este motivo como restritivo (`limpar-auditado.ts:30`); corrigir |

### 1.2 AVC · outros vereditos e barreiras

| barreira | hoje | **proposta** |
|---|---|---|
| **Veredito da trombólise.** `retida` (hemorragia/divergência), `nao_recomendada` (COR 3), `nao_sustentada` («Sem indicação neste caminho»), `incompleta`, `sem_criterios`, `indicada` | selo «✓ Trombólise indicada» / «✕ …» | selo passa a descrever critérios, sem veredito (§2). As categorias vêm dos motivos acima |
| **Veredito da trombectomia.** `recomendada`, `razoavel`, `nao_recomendada_sem_beneficio`, `efetividade_nao_estabelecida` | não tem portão; só informa | **1**, mudando só a linguagem |
| **Dose.** Peso ausente ou ≤0 | não calcula | **3** |
| **Dose.** Origem do peso «Não sei» | não calcula, e a mensagem culpa só o peso | **❓ 2 ou 3.** Uma opção é mostrar a dose com o alerta «origem do peso desconhecida» |
| **Dose.** Teto em 90 ou 25 mg | limita sem avisar | **1**, avisando «dose limitada ao máximo» |
| **Caminho hemorrágico.** Bloqueio fixo de trombólise e trombectomia; a aba Reperfusão some | declarado e escondido | **❓** manter a aba oculta ou mostrá-la com alerta crítico |
| **População.** Menor de 18, gestação, puerpério → `fora_do_escopo`: as telas são substituídas e a dose some | substitui a tela | **❓** proposta: acesso às telas por decisão registrada («fora do escopo validado»), com a dose adulta **não calculada** (3) |
| **Plano 48 h.** Via oral travada sem deglutição aprovada | retém | **2** |
| **Ordem causal.** Retrocesso e reabertura | já pede confirmação | já está no modelo |

---

## 2 · Linguagem visível no AVC

São **134 textos**, separados em quatro tipos:
- **(a) 40:** veredito do app;
- **(b) 49:** descrição da diretriz;
- **(c) 28:** rótulo de estado ou botão;
- **(d) 17:** mensagem de dado.

Os vereditos se concentram em **F (22), E (7), C (4), caminho hemorrágico (2), plano 48 h (2) e Paciente (3)**. A tela de laboratório não tem nenhum, e a síntese quase nenhum.

**Os que mais pesam, com a reescrita proposta** (o texto final é seu):

| hoje | proposta |
|---|---|
| ✓ Trombólise indicada | Critérios registrados compatíveis com trombólise |
| ✕ Reperfusão retida pela imagem | Alerta de segurança — hemorragia não excluída na imagem |
| ✕ A diretriz não recomenda | Segundo a AHA/ASA 2026, a trombólise não é recomendada neste cenário (COR 3) |
| ✕ Os critérios não sustentam a trombólise | Critérios registrados não compatíveis com trombólise |
| Contraindicação de segurança ativa | Alerta de segurança — critério não resolvido |
| Há condição a corrigir antes | Há critérios que exigem avaliação antes de prosseguir |
| Nada mais bloqueia a trombólise | Nenhum alerta pendente nesta tela |
| Trombólise e trombectomia isquêmicas bloqueadas: hemorragia intracraniana identificada | Alerta de segurança — hemorragia identificada na imagem; reperfusão isquêmica requer decisão médica |
| Sem indicação neste caminho | Critérios desta rota não atendidos |
| Terapia antitrombótica: retida, o tempo não a libera | Terapia antitrombótica: aguardando critério registrado |
| Requer avaliação especializada — corrigir e reavaliar… | Alerta — suspeita de HSA ativa; a reperfusão requer avaliação médica antes de prosseguir |
| Avaliação de risco e benefício obrigatória — requer decisão clínica registrada | Avaliação de risco e benefício — registrar a decisão médica |

**Ficam como estão:**
- Citações literais em inglês: os `verbo` da Table 8, os `verbatim` de F, G, HIC e HSA, `CITACAO_HIC`, `CITACAO_HSA` e `LITERAL_HSA_BULA`.
- A tabela de mitos da glicemia, que mostra de propósito a frase errada.
- As traduções (b) podem ganhar «Segundo a fonte…», mas mantêm a força da recomendação.

**Cuidado técnico: alguns textos também são valores gravados.** «Prosseguir» / «Não prosseguir», «Impedida», «Sem indicação» e «Contraindicada no momento» ficam salvos nos casos e são comparados por valor. **Proposta:** mudar só o rótulo exibido e manter o valor gravado, como na E9. Assim casos antigos e testIDs não quebram.

**Travas de redação que continuam valendo:**
- nenhum «contraindicad» no veredito nem na tela F (`prova-avc-apresentacao-f:501,526`; `fase9-evt:1019`);
- nenhum «excluí/liberad» em opção (`superficie-c:317`);
- nenhuma palavra de procedência no card;
- i18n: todo texto novo precisa do par em espanhol.

---

## 3 · Onde o app decide em vez de apresentar

**No AVC:**
- **Selo de veredito.** «indicada / não sustentada» é conclusão do app (§2).
- **Três registros de «não prosseguir» sem ligação entre si:**
  - `julgamento_individual_registrado`: o único que afeta o portão;
  - `ivt_indicacao_confirmada`: nenhuma derivação lê;
  - `ivt_nao_prosseguir_motivo`: só abre o caminho sem reperfusão.
- **Selo e frase se contradizem na F,** e a E lê `decisao_de_nao_prosseguir` como favorável enquanto a F mostra ✕.
- **«Prosseguir» tira o motivo do portão sem deixar rastro** na saída; só aparece na trilha de julgamentos.
- **O veredito chama de «impeditivo de segurança»** o que o portão chama de «decisão de não prosseguir» (`veredito-da-trombolise.ts:369-377`).
- **Puerpério com data do parto desconhecida** vira `fora_do_escopo`, não pergunta pendente.

**No resto do app:** §6.

---

## 4 · Onde já existem «prosseguir / não prosseguir», autoria e horário

| mecanismo | afeta | autor / horário | falta para o modelo novo |
|---|---|---|---|
| `julgamento_individual_registrado` (D-139-3) | `doac`, `cmb`, itens individualizados | pela persistência; o núcleo não vê | justificativa; retrato dos critérios pendentes naquele instante; atestação de autoria (E7b) |
| `ivt_indicacao_confirmada` | nada | persistência | unificar com o de cima |
| `ivt_nao_prosseguir_motivo` / `_hora`, `evt_desfecho_*` | caminho sem reperfusão | persistência | unificar o «não prosseguir» |
| «Limpar» auditado, «Foi engano?», retrocesso confirmado | correção de dado | persistência | já está no modelo. O «Limpar» dentro de instância (laboratório, imagem) ainda não pede confirmação (`avc-modulo-screen.tsx:824`) |
| Fora do AVC: `DecisaoRegistrada` do motor antigo das árvores | nenhum protocolo ativo | **sem autor** | referência de desenho só |

---

## 5 · Proposta de arquitetura para o override médico auditado

- **Categoria em cada motivo:** `categoria: "informacao" | "alerta" | "inconsistencia"`, mais `critico?: true` nas linhas ❓ da §1. O campo `efeito` continua como está; a categoria só se soma.
- **Um único registro de decisão médica** substitui os três de hoje e amplia o julgamento do D-139-3:
  - `alvo`: um motivo ou a terapia inteira;
  - `decisao`: prosseguir / não prosseguir;
  - `justificativa`: texto, obrigatório pelo menos nos críticos ❓;
  - `criteriosPendentes`: retrato dos motivos, com rótulo e fonte, **naquele instante**;
  - `autoria atestada`: como a E7b (sessão nominal, ou nome + CRM/UF sem conta);
  - `horario`: o do registro.

  Mudar a decisão é registro novo, nunca sobrescrita.
- **O portão passa a responder três perguntas separadas:**
  - há **inconsistência** (3)? Então não há conclusão;
  - há **alertas sem decisão** (2)?
  - há **decisões médicas registradas** sobre alertas?

  Os ids internos continuam, para não quebrar travas. O que muda é a tela: a F mostra «Alertas pendentes», «Decisão médica registrada: prosseguir, apesar de: …» e «Dados a corrigir».
- **Alertas decididos não somem:** aparecem como «resolvidos por decisão médica», com o retrato.
- **Nada muda na execução:** registrar administração já é sempre possível. O que muda é o que fica registrado e o que a tela afirma.

---

## 6 · Resto do app (fora do AVC)

- **PCR: decide e recusa de verdade.**
  - Avança etapas pelo relógio (`acls/reducer.ts:2388`) e volta sozinha para RCP depois do choque (`:2282`).
  - Recusa registrar antiarrítmico antes do 3º choque e fora de FV/TV sem pulso (`:1944-1990`).
  - Trava a adrenalina por tempo (`engine.ts:437`).
  - Tem botões imperativos («Dar epinefrina», «Administrar agora»).
  - Registra as recusas como ação do «user» (`reducer.ts:278`), quando o autor foi o sistema.
- **Árvores antigas de bradicardia e taquicardia:** diante de «Não sei dizer», o app classifica o paciente como instável / limítrofe / estável e escolhe o próximo nó (`lib/instabilidade-guiada.ts:219-241`).
- **Calculadoras:** «Informe o peso» (3); «Dose excepcional… estratégia multimodal obrigatória» (só linguagem).
- **Linguagem diretiva no código ativo:** cerca de 140 textos, a maioria descrição de diretriz.
- **Aviso de apoio:**
  - O componente compartilhado já existe (`design-system/aviso-de-apoio-clinico.tsx`), mas fora do AVC só a tela de consentimento o usa.
  - Há **5 textos de aviso diferentes** escritos à mão (hub, landing, explore, privacidade, relatório da PCR).
  - Nenhum módulo tem aviso permanente.
  - **Lugar natural:** `app/modulos/[id].tsx`, que envolve os 13 módulos.

**Proposta:** a PCR entra numa rodada própria (ARQ-APOIO-02), porque recusar e avançar sozinho ali tem implicação de fluxo de reanimação diferente da do AVC.

---

## 7 · Ordem proposta

1. **F1 · AVC portão e F/E:**
   - categoria nos motivos;
   - registro único de decisão médica, com retrato e atestação;
   - selo e títulos de estado reescritos, com rótulos separados dos valores gravados;
   - as inconsistências (divergência de imagem, microssangramentos, E×F, «Limpar» contando informação como restrição);
   - `test:all` e commit.
2. **F2 · linguagem restante do AVC:** C, D (traduções), plano 48 h, caminho hemorrágico, Paciente e textos órfãos de i18n com a redação mais forte («Trombólise proibida…»). Tirar «spec» da tela (`derivacoes-b.ts:800`).
3. **F3 · aviso permanente** em todos os módulos, com o seu texto, e unificação dos 5 avisos soltos no componente compartilhado.
4. **ARQ-APOIO-02 · PCR e árvores ACLS:** mapa próprio e decisões.
5. **Depois:** AC-15 blocos B/C no modelo novo («Decisão médica: encerrar investigação de HSA / manter suspeita ativa»).

## 8 · Decisões pedidas

| # | pergunta | proposta |
|---|---|---|
| **AP-1** | Hemorragia na imagem, cortes de INR/TTPa/TP/plaquetas, COR 3 e itens «absolutos» da Table 8: categoria 2 como **alerta crítico**, ou outra forma? | 2 crítico: prosseguir só com justificativa escrita e autoria atestada |
| **AP-2** | Justificativa obrigatória em **todo** override de categoria 2, ou só nos críticos? | só nos críticos; opcional nos demais |
| **AP-3** | Autoria da decisão | a mesma regra da E7b: sessão nominal, ou nome + CRM/UF sem conta; sessão anônima e aparelho não valem |
| **AP-4** | Fora do escopo (menor de 18, gestação, puerpério) | acesso às telas por decisão registrada; dose adulta não calculada (3) |
| **AP-5** | Caminho hemorrágico: a aba Reperfusão | mostrar com alerta crítico, em vez de sumir |
| **AP-6** | Origem do peso «Não sei» | mostrar a dose com alerta «origem do peso desconhecida» (2) |
| **AP-7** | Valores gravados | mudar só o rótulo exibido e manter o valor |
| **AP-8** | Texto final do selo e dos títulos (§2) | usar a coluna «proposta» como base |
| **AP-9** | PCR | rodada própria, ARQ-APOIO-02 |

## 9 · Achados fora da rodada, só registrados

- `UNLOCK_ALL_MODULES = true` (`lib/subscription.ts:29`) ligado, e textos do hub sobre o plano Pro desatualizados.
- 133 arquivos em `lib/i18n/modules` de módulos apagados.
- Flags mortas em `clinical-app.tsx:49,51`; comentários com «31 módulos».
- A tela de consentimento parece desenhar dois parágrafos de aviso (`consent-screen.tsx:61` e `:83`).

---

## 10 · Decisões do autor (2026-09-15) e a F1 implementada

| # | decisão |
|---|---|
| **AP-1** | Categoria 2 com subtipo **ALERTA CRÍTICO**: hemorragia, INR/plaquetas fora dos limites da fonte, COR 3 e equivalentes. Forte alerta baseado na fonte («Os dados registrados são incompatíveis com trombólise IV segundo a fonte selecionada»), nunca «o app proibiu». Prosseguir exige decisão médica explícita, justificativa, autoria e horário. O registro de administração ocorrida nunca é bloqueado. |
| **AP-2** | Justificativa obrigatória só em alerta crítico ou em decisão divergente de recomendação forte da fonte; nos demais, opcional. |
| **AP-3** | Toda decisão tem autoria humana identificada. Estados derivados pelo motor ficam identificados como sistema e nunca como `user`. Guardar decisão, justificativa quando aplicável, autor, horário e retrato dos critérios. |
| **AP-4** | Menor de 18 anos, gestante e puérpera fora do escopo validado: sem contraindicação automática; aviso de escopo não validado; uso como apoio, sem conclusão global. |
| **AP-5** | Reperfusão acessível no caminho hemorrágico, contextualizada como não aplicável, preservando histórico e registro de decisão. |
| **AP-6** | Peso de origem desconhecida = categoria 3. Registrar a origem; peso estimado utilizável se o médico aceitar, sempre identificado. |
| **AP-7** | Nesta rodada, só rótulos exibidos mudam; os valores persistidos ficam. |
| **AP-8** | Aviso permanente: «Apoio à decisão clínica · decisão final do médico»; expandido: «Este módulo organiza informações clínicas e critérios de fontes de referência. Não substitui avaliação, julgamento ou decisão médica.» |
| **AP-9** | PCR em rodada própria (ARQ-APOIO-02). |
| **AP-10** | Estado clínico derivado pelo sistema ≠ decisão médica registrada. O sistema calcula compatibilidade ou incompatibilidade segundo a fonte; nunca registra uma conduta como decisão do médico. |

**Linguagem (autor):** «override» nunca aparece na tela. Na tela: «Registrar decisão médica», «Prosseguir após avaliação médica». Cadeia: fonte → estado derivado → decisão.

### F1 · portão da trombólise e telas E/F (implementada)

- **Categoria em cada motivo** (`categoriaDoMotivo`), mais a marca de crítico. Os críticos são hemorragia na imagem, cortes laboratoriais, COR 3 e item absoluto da Table 8.
- **Decisão médica registrada** (`avc/nucleo/decisao-medica.ts`):
  - usa a mesma instância e os mesmos valores do julgamento do D-139-3;
  - acompanham a decisão: justificativa, médico responsável, registro profissional e retrato dos critérios;
  - na tela, pede o que falta sem botão cinza.
- **Estado derivado intacto (AP-10).** A exceção é o julgamento do D-139-3, que já era o próprio critério da fonte.
- **E e F:** títulos e selos reescritos, categoria escrita em cada motivo, trilha com todos os dados da decisão, E e F coerentes.

**Recuo em relação à proposta do §1:** estudos de imagem divergentes seguem alerta crítico em `bloqueado_seguranca`, não «dados a corrigir». Com dois resultados possíveis, toda divergência inclui um achado de hemorragia, e a prova dos críticos (caso 5) é regressão permanente.

**Leitura da AP-8:** o texto respondido é o aviso permanente do módulo, que entra na F3. O selo de veredito da F seguiu a §2, na redação da AP-1.

**Ficam para a F2:** AP-4, AP-5, AP-6; a unificação de `ivt_indicacao_confirmada` e `ivt_nao_prosseguir_motivo` com a decisão médica (hoje ainda sem atestação); os textos de D (microssangramentos «não fica bloqueada»); o «Limpar» que conta informação como restrição e o «Limpar» sem confirmação dentro de instância.

### F1 · as quatro invariantes conferidas antes do commit (autor, 2026-09-15)

| # | invariante | como está garantida |
|---|---|---|
| 1 | A decisão médica não altera nem apaga o alerta derivado da fonte | prova: estado, liberação, rótulo, categoria, criticidade e ordem dos motivos iguais antes e depois de «prosseguir»; e2e: o alerta de HSA continua visível depois do registro |
| 2 | «Prosseguir após avaliação médica» não transforma «incompatível» em «compatível» | prova: o veredito da trombólise (tipo e critérios) igual antes e depois; `liberado` continua `false`. Avaliação da fonte, decisão médica e registro são dimensões separadas |
| 3 | Médico, identificação, CRM/UF, retrato ou justificativa ausentes deixam a decisão incompleta | o fato grava a origem da identificação («Sessão autenticada» ou «Atestação»); `requisitosFaltantes` é a mesma regra na tela, antes de gravar, e na leitura; a tela mostra «Decisão médica incompleta — falta: …» |
| 4 | Mudar a decisão cria novo registro e preserva o anterior | prova: dois fatos; o primeiro reconstruível com médico, CRM, identificação, justificativa, critérios e horário; o segundo sem herdar nada |

### Pendência formal da F2 · julgamentos antigos do D-139-3 sem atestação

Julgamentos gravados antes da F1 (DOAC, microssangramentos, itens individualizados) não têm médico, identificação nem retrato. **Na F1 continuam com o efeito de antes** e aparecem na trilha como decisão incompleta. Mudar isso é decisão clínica e de persistência, com duas opções a escolher:
- **Compatibilidade legada:** continuam valendo como antes, marcados como `legado_sem_atestacao_completa`.
- **Revalidação:** passam a exigir nova decisão médica completa antes de liberar.

