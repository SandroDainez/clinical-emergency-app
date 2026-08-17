/**
 * PRALIDOXIMA — três posições atuais, nomeadas, sem o app escolher por ninguém.
 *
 * ── POR QUE O APP NÃO ESCOLHE (PD-5) ────────────────────────────────────────
 *
 * A diretriz brasileira (Conitec/MS 2018) RECOMENDA CONTRA oximas na
 * intoxicação por inibidores de colinesterase. A tentação era converter isso em
 * posição do app: "o app é brasileiro, a diretriz é nacional, pronto".
 *
 * ⚠️ E ISSO SERIA ASSUMIR O PROTOCOLO DE UM SERVIÇO QUE O APP NÃO CONHECE. Este
 * é um app genérico, para usuário geral — não é protocolo institucional. Onde as
 * fontes divergem, ele APRESENTA E ATRIBUI; a escolha é de quem está com o
 * paciente e sabe o que o serviço adota.
 *
 * ⚠️ E APAGAR A DROGA SERIA PIOR QUE ESCOLHER. A prática de dar pralidoxima é
 * corrente no Brasil, e o mesilato de pralidoxima está na RENAME — ou seja, o
 * médico pode ter a ampola na mão. Um app que simplesmente omite deixa essa
 * pessoa sem saber o que fazer com o que tem (R-45).
 *
 * ── AS TRÊS POSIÇÕES, E AS FONTES ABERTAS EM SESSÃO (2026-08-17) ────────────
 *
 * 1. CONITEC/MS 2018 (PDF de 206 páginas, lido): "Não se recomenda o uso de
 *    oximas na intoxicação por inibidores de colinesterase. Recomendação
 *    condicional contra a intervenção" — evidência de qualidade MUITO BAIXA.
 *    Cinco ensaios randomizados sem benefício em mortalidade, ventilação
 *    mecânica ou síndrome intermediária; e "há indícios de que além de não serem
 *    úteis, as oximas podem ser prejudiciais quando utilizadas em pacientes
 *    vítimas de auto-envenenamento severo". Sobre carbamatos: "as oximas também
 *    são contraindicadas".
 *
 * 2. OMS / Red de Antídotos (atualização 2025): mantém a recomendação — 1 a 2 g
 *    IV no adulto, em cerca de 30 minutos, com a advertência de que a
 *    administração rápida se associa a parada cardíaca e paralisia muscular.
 *
 * 3. Meta-análise de ensaios randomizados (PMC7117609): sem benefício
 *    demonstrado em mortalidade. E o Reino Unido retirou a pralidoxima do
 *    arsenal (Disaster Med Public Health Prep).
 *
 * ── O QUE SAIU, E POR QUE ──────────────────────────────────────────────────
 *
 * O texto anterior dizia "idealmente nas primeiras 24–48 h". ⚠️ ESSE NÚMERO NÃO
 * TEM FONTE ABERTA, e o pior não é a imprecisão: é a falsa tranquilidade. Quem
 * lê "até 48 h" adia o que as fontes sugerem fazer em HORAS.
 *
 * ⚠️ E O NÚMERO NÃO APARECE NEM PARA SER DESMENTIDO. A primeira versão do texto
 * novo o citava entre aspas ("este texto dizia 24–48 h, sem fonte") — e a trava
 * reprovou, com razão: um número na tela é RETIDO mesmo com o aviso ao lado, e
 * quem lê depressa guarda a cifra e descarta a ressalva. O texto visível diz
 * "a que este texto trazia antes"; o número fica aqui, no comentário, onde
 * serve de registro e não de referência clínica.
 *
 * O envelhecimento da acetilcolinesterase é rápido e ESPECÍFICO DE CADA
 * COMPOSTO — horas para dimetil-organofosforados, muito mais longo para dietil.
 * ⚠️ A CINÉTICA POR COMPOSTO NÃO FOI VERIFICADA POR ESTE APP, e isso está
 * declarado no texto em vez de substituído por outro número inventado.
 *
 * Nota: o trecho da diretriz brasileira que usa a palavra "envelhecimento"
 * trata da NTE da neuropatia tardia, não da acetilcolinesterase — as duas coisas
 * não foram confundidas, e a diretriz não traz a cinética de aging da AChE.
 */

export const PRALIDOXIMA_TRES_POSICOES =
  "⚠️ PRALIDOXIMA (2-PAM) — A CONDUTA MAIS CONTROVERSA DESTE NÓ, E VOCÊ PRECISA SABER DISSO ANTES DE DECIDIR. Três posições, todas atuais: ➜ A DIRETRIZ BRASILEIRA (Conitec/MS 2018) RECOMENDA CONTRA o uso de oximas na intoxicação por inibidores de colinesterase — recomendação CONDICIONAL contra, evidência de qualidade MUITO BAIXA. Cinco ensaios randomizados não mostraram benefício em mortalidade, necessidade de ventilação ou síndrome intermediária, e há indícios de que possam ser prejudiciais no autoenvenenamento grave. ⚠️ E SÃO CONTRAINDICADAS NO CARBAMATO — nele a colinesterase se reativa sozinha, e não há o que reativar. ➜ A OMS MANTÉM a recomendação: 1 a 2 g IV no adulto, em cerca de 30 minutos. ⚠️ NUNCA EM BOLUS RÁPIDO — a infusão rápida associa-se a parada cardíaca e paralisia muscular. ➜ A META-ANÁLISE DE ENSAIOS RANDOMIZADOS não encontrou benefício em mortalidade, e o Reino Unido retirou a droga do arsenal.";

export const PRALIDOXIMA_O_QUE_FAZER =
  "➜ O QUE FAZER COM ISSO, NA PRÁTICA: a ATROPINA é o tratamento, e ela não depende desta decisão — comece por ela e não a atrase esperando oxima nenhuma. Se o protocolo do seu serviço prevê pralidoxima, dê no ORGANOFOSFORADO (não no carbamato) e QUANTO ANTES: o envelhecimento da enzima é rápido e varia conforme o composto, e depois dele não há mais o que reativar. ⚠️ A CINÉTICA POR COMPOSTO NÃO FOI VERIFICADA POR ESTE APP — não confie em nenhuma janela em horas que você tenha lido — inclusive a que ESTE TEXTO trazia antes, que não tinha fonte e dava falsa tranquilidade a quem deveria estar correndo.";
