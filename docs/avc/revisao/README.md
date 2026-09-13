# Pacotes de revisão médica — módulo AVC

**Criados em:** 2026-09-13 · **Estado:** aguardando decisão humana. Nenhum pacote decide nada.
**Regra:** o campo "Decisão humana" fica vazio até o autor preencher nome, versão e data.

| pacote | pergunta | a fonte confirma o código? |
|---|---|---|
| [AC-15-hsa.md](AC-15-hsa.md) | A suspeita clínica de HSA retém a reperfusão? | **Não.** A fonte manda excluir hemorragia **por imagem**; a retenção por suspeita clínica é adaptação local. |
| [AC-06-dose-trombolitico.md](AC-06-dose-trombolitico.md) | Como arredondar a dose do trombolítico? | **Alteplase:** a fonte não fala de arredondamento. **Tenecteplase:** a fonte **contradiz** o código, que ignora a tabela por faixa de peso da Table 7. |
| [AC-14-temperatura.md](AC-14-temperatura.md) | A temperatura deve estar no caminho isquêmico? | **Não.** O PDF tem a §4.4 com recomendação COR 1; o app removeu a temperatura dizendo que não havia fonte transcrita. |
| [AC-13-estados-da-acao.md](AC-13-estados-da-acao.md) | A ação tem 4 ou 8 estados? | A fonte não define estados; a divergência é entre a spec (8) e a decisão D2 (4). |
| [AC-03r-puerperio.md](AC-03r-puerperio.md) | Qual é a janela do puerpério? | Não conferível: a linha da Table 8 é imagem no PDF, e o app não define janela. |
| [D-139-1-juizo-coagulacao.md](D-139-1-juizo-coagulacao.md) | Juízo sobre coagulação não perguntado | Parcial: o ramo "não" é confirmado; o ramo "não perguntado" preenche lacuna. |
| [D-139-2-varfarina-heparina.md](D-139-2-varfarina-heparina.md) | Varfarina/heparina: quais exames aguardar? | Ambíguo: a fonte nomeia INR, PT e PTT, mas não diz que os três são exigidos. |
| [D-139-3-julgamento-individual.md](D-139-3-julgamento-individual.md) | Julgamento individual segura a ação? | DOAC confirmado quanto a "individual"; CMB > 10 e itens relativos são interpretação. |
| [D-139-4-deficit-incapacitante.md](D-139-4-deficit-incapacitante.md) | Janela estendida exige déficit incapacitante? | A fonte não trata disso: as recomendações de janela estendida não usam a palavra, mas também não a excluem. |

## Fontes primárias abertas nesta rodada

Os PDFs foram lidos localmente com `pdftotext`, sem acesso à rede.

| documento | arquivo local | sha256 | páginas |
|---|---|---|---|
| AHA/ASA 2026, AVC isquêmico (Prabhakaran et al., *Stroke* 2026;57:e316–e436) | `~/Literatura Medica/04-Guias e Diretrizes (avaliar)/prabhakaran-et-al-2026-…pdf` | `7380c4f2352e9757dbd5eeeacadea7d6915824967e29f7ab0a9f5b9525794ffe` | 121 (PDF p.N = página impressa e[315+N]) |
| AHA/ASA 2023, HSA aneurismática (Hoh et al., *Stroke* 2023;54:e314–e370) | `~/Literatura Medica/04-Guias e Diretrizes (avaliar)/hoh-et-al-2023-…pdf` | `3e206a9dca73fda50480d2cb575b20787a6466e8eaba4e1ea08b532016b00c73` | 57 |

**Limites da leitura:**
- **Table 8 da AHA/ASA 2026** (p. e364–e367, PDF p. 49–52) é **imagem** no PDF, e o texto dela não sai por extração. As frases citadas dessa tabela vêm só da transcrição do repositório, que foi lida visualmente, e estão marcadas assim em cada pacote.
- **Bulas brasileiras** (Actilyse, Metalyse): **nenhum PDF** foi encontrado no repositório nem no aparelho. Só existe a transcrição parcial `protocols/fontes-verbatim/bulas-br-tromboliticos.md`.
- **Cabeçalho da transcrição da AHA 2026:** `protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md` ainda diz "ESTE ARQUIVO ESTÁ VAZIO DE PROPÓSITO", mas o arquivo tem slots transcritos. É a pendência D-PEND-09.
- **Citações:** os trechos literais foram mantidos curtos. O texto integral está no PDF, na página indicada, e na linha indicada da transcrição.

## Como cada pacote separa as camadas

- **Recomendação da diretriz:** o que o texto da fonte diz, com classe e nível quando existem.
- **Adaptação local:** o que o projeto decidiu além da fonte, com o registro humano que existir.
- **Escolha de interface:** como a tela apresenta, pergunta ou retém, sem conteúdo clínico próprio.
