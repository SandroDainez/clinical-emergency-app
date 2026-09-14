# Plano até 48 h — pacote de revisão (T08 · C08)

**Decisão do autor:** Sandro Dainez, 13/09/2026 (`docs/decisoes.md`, 14ª rodada).

**Estado:** estrutura implementada, **conteúdo pendente de validação médica**.
- Nenhum intervalo, dose, limiar ou contraindicação foi criado.
- Onde a fonte transcrita traz o dado, a tarefa aponta o slot. Onde não traz, a tarefa aparece como "conteúdo pendente de validação".

## Regras de estrutura

- **Origem real.** Cada caminho nasce de um evento registrado, com horário quando conhecido:
  - início da trombólise;
  - fim da trombectomia;
  - decisão de não reperfundir;
  - hemorragia confirmada em imagem.
- **Três declarações por tarefa:** evento de origem; prazo ou condição; critério real de conclusão (um fato registrado, nunca a passagem do tempo).
- **O tempo nunca autoriza.** Terapia dependente de imagem fica retida até o laudo (A15). Com o laudo, a condição fica atendida, mas a decisão é da equipe: o app não libera.
- **Deterioração antecipa.** Um «Paciente piorou» depois da última reavaliação muda a próxima reavaliação para "agora".
- **Cancelamento encerra o caminho.** Isso vale para trombólise cancelada antes do início, horário do evento corrigido e laudo de hemorragia corrigido. As tarefas desse caminho saem da agenda e o encerramento é dito.
- **Fuso.** Instantes são guardados em milissegundos (UTC). A tela exibe o horário local do aparelho e o intervalo relativo ("em 14 min"). O mesmo registro gera a mesma agenda em qualquer fuso.
- **Evento sem horário.** O caminho existe, mas nenhum prazo é calculado.

## Notificações em segundo plano

**Não confiáveis e não presumidas.**
- O app não tem código de notificação: nenhum service worker, nenhuma API de notificação, nenhuma tarefa em segundo plano.
- Com a aba fechada, suspensa ou o aparelho bloqueado, nada avisa que uma reavaliação venceu.
- A agenda só é recalculada quando a tela é desenhada.
- A tela diz isso no próprio bloco do plano.

## Fontes citadas

- **R4:** Canadian Stroke Best Practices, *Acute Stroke Unit Care*. Não está no repositório; não transcrita.
- **R5:** Canadian Stroke Best Practices, *Acute Antithrombotic Therapy* (atualização 2022). Não está no repositório; não transcrita.
- **R6:** Canadian Stroke Best Practices, *Inpatient Prevention and Management of Complications following Stroke*. Não está no repositório; não transcrita.
- **AHA 2026:** AHA/ASA 2026, AVC isquêmico agudo, em `protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md`.
  - "§ a localizar" significa que a busca na transcrição atual não encontrou a seção. É preciso localizá-la no PDF antes de qualquer conteúdo.

## Tarefas por caminho

| caminho | tarefa | prazo ou condição | critério de conclusão | fonte |
|---|---|---|---|---|
| trombólise | `ivt_reavaliacao` | intervalos da Table 7 por fase, até 24 h do início | PA completa **e** exame neurológico (NIHSS ou Glasgow) registrados depois do horário previsto | F-15 · Table 7 · p. e358 |
| trombólise | `ivt_imagem_controle` | 24 h do início | estudo com horário depois do início e laudo registrado | F-15 · Table 7 · p. e358 |
| trombólise | `ivt_antitromboticos` | condição: laudo da imagem de controle | retida até o laudo; depois, condição atendida e decisão da equipe | F-15 · Table 7 · p. e358; AHA 2026 §4.8 (já em `ANTITROMBOTICOS_POS_IVT`); R5 |
| trombectomia | `evt_monitorizacao` | sem prazo transcrito | conteúdo pendente de validação | F-15 · `LACUNA_POS_EVT` (a fonte não publica tabela equivalente à Table 7) |
| trombectomia | `evt_reavaliacao` | sem intervalo transcrito; piora antecipa | PA completa e exame neurológico registrados depois do evento | R4; AHA 2026 § a localizar |
| trombectomia | `evt_antitromboticos` | retida; o tempo não libera | conteúdo pendente de validação | R5; AHA 2026 §4.8 e §4.9 (não incorporados ao caminho da trombectomia) |
| não reperfundir | `sem_reperfusao_reavaliacao` | sem intervalo transcrito; piora antecipa | PA completa e exame neurológico registrados depois da decisão | R4; AHA 2026 § a localizar |
| não reperfundir | `sem_reperfusao_pressao` | condição: PA registrada depois da decisão | PA completa registrada depois da decisão | F-05 (conduta pressórica sem reperfusão, já transcrita) |
| não reperfundir | `sem_reperfusao_antitromboticos` | retida; o tempo não libera | conteúdo pendente de validação | R5; AHA 2026 §4.8 |
| hemorragia | `hemorragia_caminho_proprio` | condição: caminho próprio da hemorragia | caminho da hemorragia registrado como revisado pela equipe | superfície hemorrágica (AHA/ASA 2022 HIC; AHA/ASA 2023 HSA) |
| hemorragia | `hemorragia_reavaliacao` | sem intervalo transcrito; piora antecipa | PA completa e exame neurológico registrados depois do evento | AHA/ASA 2022 HIC § a localizar |
| hemorragia | `hemorragia_antitromboticos` | retida; o tempo não libera | conteúdo pendente de validação | R5; AHA/ASA 2022 HIC § a localizar |

**Fechamento dos caminhos sem horário transcrito.** A trombectomia, a decisão de não reperfundir e a hemorragia não têm intervalo de reavaliação transcrito.
- A agenda desses caminhos diz "sem intervalo transcrito — a equipe define".
- O app não copia os intervalos da Table 7 para eles.

## Tarefas transversais — conteúdo pendente de validação

Todas nascem do primeiro evento real registrado e ficam como "conteúdo pendente de validação". Nenhuma tem prazo.

### `degluticao`
- **Tarefa:** triagem de deglutição antes de via oral. É **trava**: via oral retida até a triagem ser registrada como realizada.
- **Critério de conclusão:** campo "Triagem de deglutição" = Realizada.
- **Limite:** o resultado da triagem não é modelado; conteúdo pendente.
- **Fontes:**
  - **R6:** *Inpatient Prevention and Management of Complications* (disfagia). Não transcrita.
  - **R4:** *Acute Stroke Unit Care*. Não transcrita.
  - **AHA 2026:** § a localizar. A transcrição atual não traz rastreio de disfagia: zero ocorrências de "dysphag"; a única de "swallow" é descrição de incapacidade (Table 4, F-17).

### `glicemia`
- **Tarefa:** glicemia.
- **Critério de conclusão:** glicemia registrada depois do evento de origem.
- **Fontes:**
  - **R6:** não transcrita.
  - **AHA 2026:** §4.5, pp. e352–e353 (F-06, transcrito). Nenhum alvo é aplicado pelo plano.

### `temperatura`
- **Tarefa:** temperatura.
- **Critério de conclusão:** temperatura registrada depois do evento de origem.
- **Fontes:**
  - **R6:** não transcrita.
  - **AHA 2026:** §4.4, p. e352 (F-38, transcrito). A recomendação não traz corte; o plano não classifica.

### `mobilizacao`
- **Tarefa:** mobilização.
- **Critério de conclusão:** campo "Mobilização avaliada pela equipe" = Avaliada.
- **Fontes:**
  - **R6** e **R4:** não transcritas.
  - **AHA 2026:** § a localizar. Zero ocorrências de "mobiliz" na transcrição atual.

### `tev`
- **Tarefa:** prevenção de tromboembolismo venoso.
- **Critério de conclusão:** campo "Prevenção de TEV avaliada pela equipe" = Avaliada.
- **Fontes:**
  - **R6** e **R5:** não transcritas.
  - **AHA 2026:** § a localizar. Não há ocorrência pertinente de "venous thromb" nem de "pneumatic" na transcrição atual.
  - Para hemorragia intracerebral, o slot H-09 já está transcrito na superfície hemorrágica; o plano só aponta.

### `dispositivos`
- **Tarefa:** dispositivos (sondas e cateteres).
- **Critério de conclusão:** campo "Dispositivos revisados pela equipe" = Revisados.
- **Fontes:**
  - **R6:** não transcrita.
  - **AHA 2026:** Table 7, p. e358 (F-15, transcrito): adiar sonda nasogástrica, sonda vesical de demora e cateter arterial se o paciente puder ser manejado com segurança sem eles. O plano não repete o conteúdo como ordem.

## Pendências para o autor

- **R4, R5, R6:** trazer os documentos ao repositório e transcrever.
- **AHA 2026 — seções a localizar no PDF:** deglutição, mobilização, TEV, reavaliação após trombectomia e após decisão de não reperfundir.
- **Registros novos (estrutura, a confirmar):**
  - «Fim da trombectomia» e «Decisão de não reperfundir», como horários da equipe;
  - os quatro registros das transversais;
  - «Caminho da hemorragia revisado».
  - Antes desta rodada, o app não tinha evento de fim de trombectomia, e "não prosseguir" existia só para trombólise, sem horário.
