/**
 * OCLUSÃO DE GRANDE VASO — o COMO saber, quando o QUANDO já existe.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O nó `isq_trombectomia_check` pergunta "o paciente é candidato à trombectomia
 * mecânica?" com duas saídas: sim (oclusão de grande vaso) e não. Quem hesita
 * responde "não / sem grande vaso" e vai para o suporte — perdendo a
 * trombectomia num paciente que talvez a tivesse.
 *
 * ⚠️ É O MESMO PADRÃO DO RUSH NO CHOQUE: o app tem o QUANDO (se há oclusão,
 * trombectomia) e não tem o COMO SABER.
 *
 * ── FONTE ABERTA EM SESSÃO (2026-08-17) ─────────────────────────────────────
 *
 * Pooled individual patient data analysis, Neurology 2025 (PMC11984832):
 *
 *   · o NIHSS intra-hospitalar prediz oclusão melhor que as escalas
 *     pré-hospitalares — AUROC 0,86 (IC 95% 0,84–0,89), contra RACE 0,81,
 *     LAMS 0,80, G-FAST 0,80;
 *   · e o faz SEM LIMIAR DIAGNÓSTICO estabelecido — "without establishing
 *     diagnostic thresholds for LVO detection".
 *
 * ⚠️ POR ISSO O APP NÃO ESCREVE "NIHSS ≥ X". Inventar o ponto de corte que a
 * fonte se recusa a dar seria criar a versão informal de algo formalizado
 * (R-41) — e com aparência de precisão.
 *
 * ── AS ESCALAS PRÉ-HOSPITALARES: ESCOPO DECLARADO, NÃO OMISSÃO ──────────────
 *
 * RACE, LAMS, FAST-ED, C-STAT, PASS e G-FAST são validadas e NÃO cabem aqui. A
 * mesma fonte: "explicitly designed for prehospital triage […] to guide direct
 * transportation to a thrombectomy-capable stroke center […] No recommendation
 * exists for in-hospital use where CT angiography is available, as that imaging
 * directly confirms vessel occlusion."
 *
 * Usá-las numa tela intra-hospitalar com angioTC seria responder por triagem de
 * transporte uma pergunta que a imagem responde direto.
 *
 * ── O VAN, E POR QUE ELE CABE ───────────────────────────────────────────────
 *
 * VAN (Vision–Aphasia–Neglect) é o único formato binário — positivo/negativo,
 * sem pontuação — e é o que se pergunta à beira do leito: fraqueza de braço
 * MAIS um sinal cortical. A lista de sinais corticais deste texto é a DELE; a
 * lista canônica da diretriz AHA/ASA não foi aberta, e isso está declarado.
 *
 * ── E O R-48 EVITADO ────────────────────────────────────────────────────────
 *
 * ⚠️ OS QUATRO SINAIS JÁ ESTÃO COLETADOS NESTE MÓDULO. O NIHSS do app tem os
 * 15 itens, e quatro deles SÃO os corticais:
 *
 *     item 2  · Melhor olhar conjugado      → desvio do olhar
 *     item 3  · Campos visuais              → hemianopsia
 *     item 9  · Linguagem                   → afasia
 *     item 11 · Extinção / negligência      → negligência
 *
 * Então o ramo NOMEIA OS ITENS em vez de repetir a lista: quem acabou de
 * pontuar o NIHSS não reexamina o paciente — olha a própria pontuação.
 */

export const LVO_COMO_SABER =
  "COMO SABER SE HÁ OCLUSÃO DE GRANDE VASO — E VOCÊ PROVAVELMENTE JÁ COLETOU OS SINAIS. Não reexamine o paciente: volte ao NIHSS que você acabou de pontuar. QUATRO ITENS DELE SÃO OS SINAIS CORTICAIS, e é a presença deles, somada à fraqueza de braço, que levanta a suspeita: ITEM 2 (melhor olhar conjugado) — desvio do olhar para um lado; ITEM 3 (campos visuais) — hemianopsia; ITEM 9 (linguagem) — afasia; ITEM 11 (extinção/negligência) — o paciente ignora um lado do corpo ou do espaço. ⚠️ FRAQUEZA DE BRAÇO + PELO MENOS UM DESSES QUATRO É O QUE DEFINE A SUSPEITA — é o formato VAN (visão, afasia, negligência), que é positivo ou negativo, sem pontuação a calcular. Um paciente com hemiparesia isolada e nenhum item cortical tem probabilidade bem menor; um com afasia global e desvio do olhar tem alta.";

export const LVO_NIHSS_SEM_LIMIAR =
  "⚠️ E O NIHSS ALTO CONTA — MAS NÃO EXISTE UM NÚMERO QUE DEFINA. O NIHSS medido no hospital prediz oclusão de grande vaso melhor que qualquer escala de triagem pré-hospitalar (AUROC 0,86 contra 0,80–0,81 delas), E A MESMA FONTE NÃO ESTABELECE PONTO DE CORTE para esse fim. Por isso este app não escreve \"NIHSS ≥ tanto\": seria inventar precisão que a evidência não dá. Leia o escore como PROBABILIDADE — quanto mais alto, mais provável, sobretudo quando a pontuação vem dos itens corticais e não só da força — e deixe a confirmação para a imagem.";

export const LVO_ESCALAS_FORA_DE_ESCOPO =
  "SOBRE AS ESCALAS DE TRIAGEM (RACE, LAMS, FAST-ED, C-STAT, PASS, G-FAST) — ELAS EXISTEM, SÃO VALIDADAS, E NÃO SÃO PARA ESTA TELA. Foram desenhadas para o PRÉ-HOSPITALAR: servem para decidir se a ambulância leva o paciente direto a um centro com trombectomia, contornando o hospital mais próximo. Aqui, com angioTC disponível, elas responderiam por estimativa o que a imagem responde por observação direta. ➜ Se você está numa unidade SEM angioTC, a pergunta muda: aí o que decide é o TRANSPORTE, e o contato com o centro de referência vem antes de qualquer escala.";

export const LVO_ANGIOTC_O_QUE_RESPONDE =
  "O QUE A ANGIOTC RESPONDE, E QUE O EXAME NÃO RESPONDE: se existe oclusão, QUAL vaso (carótida interna, M1 ou M2 da cerebral média, basilar), ONDE exatamente, e a extensão do trombo — que é o que o neurointervencionista precisa para decidir e para planejar o acesso. Ela também mostra a circulação colateral, que pesa no prognóstico. Peça JUNTO com a tomografia sem contraste, na mesma ida à sala: são poucos minutos a mais no mesmo aparelho, e a creatinina não precisa voltar antes — o risco de contraste é menor que o de perder a janela.";

/**
 * ⚠️ O RISCO DE "PEÇA A ANGIOTC" É VIRAR ESPERA.
 *
 * O paciente já pode estar com trombolítico correndo, e a janela da trombectomia
 * anda enquanto se aguarda laudo. Esta constante existe para que o pedido de
 * imagem não se transforme em pausa do fluxo.
 */
export const LVO_NAO_ESPERE_A_IMAGEM =
  "⚠️ E O QUE NÃO SE ESPERA PELA ANGIOTC: NÃO ESPERE O LAUDO PARA TROMBOLISAR quem já é elegível — a trombólise não depende de saber qual vaso está ocluído, e as duas terapias se somam. NÃO ESPERE para ACIONAR o centro de trombectomia: ligue com a suspeita clínica, porque a equipe leva tempo para se reunir e esse tempo corre em paralelo ao seu exame. NÃO ESPERE a creatinina. E não pare a monitorização nem os alvos pressóricos enquanto o paciente está na sala de imagem. ⚠️ A angioTC informa a DECISÃO DE QUEM VAI PUNCIONAR; ela não é pré-requisito para o que já está indicado agora.";
