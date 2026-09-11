# F-35c · Hemorragia pós-trombólise — contrato de transcrição

> ⛔ **Sem verbatim.** Este arquivo fixa o combinado para quando o PDF chegar.

| eixo | estado |
|---|---|
| **fidelidade documental** | ⛔ nada transcrito — PDF não obtido |
| **aplicabilidade ao AVC** | ⚠️ **a população é exatamente a nossa** — e mesmo assim há ressalvas |

## A fonte

**Yaghi S et al.** *Treatment and Outcome of Hemorrhagic Transformation After
Intravenous Alteplase in Acute Ischemic Stroke: A Scientific Statement for
Healthcare Professionals From the American Heart Association/American Stroke
Association.* **Stroke. 2017;48(12):e343–e361.** DOI 10.1161/STR.0000000000000152.

✅ **Aberto no editor**, versão publicada. ⛔ `ahajournals.org` devolve **403** a
agente automático. ➜ Precisa vir de navegador comum:
`https://www.ahajournals.org/doi/10.1161/STR.0000000000000152`

## ⚠️ A LISTA DE TRANSCRIÇÃO — ordem do autor

| # | item | cuidado |
|---|---|---|
| 1 | **separar intracraniano de extracraniano** | ⚠️ o título é de *hemorrhagic transformation* — provavelmente **só intracraniano** |
| 2 | **declarar o agente coberto em CADA afirmação** | ⛔ regra dura, ver abaixo |
| 3 | ⛔ **não transportar alteplase → tenecteplase sem fonte** | mesma classe de erro que a **R-TCE** barra |
| 4 | **marcar a idade da fonte** | **2017** — declaração de desatualização obrigatória |
| 5 | **reversão / hemostasia** | o núcleo do slot |
| 6 | **exames** | coagulograma, fibrinogênio, o que a fonte pedir |
| 7 | **imagem** | quando repetir, qual |
| 8 | **reavaliação** | — |

## ⚠️⚠️ A REGRA DO AGENTE

O documento é de **alteplase**. O app oferece **alteplase e tenecteplase**
(F-09, F-20, Superfície F).

⛔ **Cada afirmação transcrita declara o agente.** Se a fonte só fala de
alteplase, isso é **lacuna de agente** — `LF-05`.

⚠️⚠️ **E ⛔ não se declara lacuna irredutível sem busca própria.** Ordem do
autor, 2026-09-11: a complicação hemorrágica da tenecteplase *"precisa de busca
própria antes de declarar lacuna irredutível"*. A tenecteplase tem uso
consolidado em IAM há décadas, com literatura própria de sangramento — ⛔ é
implausível que nada exista, e **eu não procurei**.

➜ Só depois da busca, e **com a busca registrada**, é que se decide entre
estado **3** (evidência não localizada) e estado **4** (decisão operacional
derivada). Ver `auditoria/LACUNA-DE-FLUXO.md`.

## ⚠️⚠️ O SANGRAMENTO EXTRACRANIANO

O paciente trombolisado também sangra **fora do crânio** — digestivo,
retroperitoneal, sítio de punção.

➜ **Ordem do autor:** se a fonte ⛔ **não cobrir**, isso vira **slot separado**,
e ⛔ **não** se fecha com diretriz de trauma — regra 1 do sangramento.

⚠️⚠️ **Mas ⛔ não concluir ausência.** Ordem do autor, 2026-09-11: o sangramento
extracraniano *"pode ter orientação em fontes de trombólise/reversão, mesmo que
Yaghi não cubra"*. ➜ Antes de declarar lacuna, **procurar** — e o app já tem
**F-20**, `bulas-br-tromboliticos.md`, que é o primeiro lugar a olhar.

Registrado como `LF-04`, estado **1 · fonte clínica incompleta**, a confirmar
na leitura.

## ⛔ O que NÃO se transporta para cá

| origem | por quê |
|---|---|
| **H-01 … H-15** (HIC espontânea, AHA/ASA 2022) | ⚠️ **HIC espontânea ≠ transformação hemorrágica pós-trombólise.** A primeira é doença; a segunda é complicação iatrogênica com coagulopatia induzida por fibrinolítico |
| diretriz de sangramento no **trauma** | regra 1 do sangramento |
| **Frontera 2016** (reversão de antitrombóticos na HIC) | população vizinha, ⛔ não equivalente · e não é aberta |
