/**
 * Dobutamina — regime de dose em fonte única (D-11).
 *
 * ── O DEFEITO QUE ORIGINOU ───────────────────────────────────────────────────
 *
 * O app tinha SEIS afirmações de dose para a mesma droga:
 *
 *   2,5 (sem faixa)   Sepse — baixo débito / disfunção miocárdica
 *   2,5–5             Sepse — disfunção de VE
 *   2,5–5             Vasoativas — disfunção sistólica ao eco POC
 *   2,5–10            Sepse — disfunção miocárdica séptica
 *   2,5–10            Vasoativas — choque cardiogênico refratário
 *   2–10              TEP — baixo débito com PA mantida
 *   2–20              Pós-PCR — IC baixo com PAM adequada
 *
 * Duas coisas diferentes estavam misturadas ali:
 *
 * 1. O PISO era divergência pura. 2 × 2,5 sem nada que sustentasse a diferença —
 *    a bula manda começar em 2,5, e o 2 é arredondamento, não regime.
 *
 * 2. O TETO era o app se contradizendo consigo mesmo E com a própria fonte. A
 *    SEPSE tinha TRÊS tetos para a mesma indicação (nenhum, 5 e 10) enquanto a
 *    bula registra que frequentemente são necessários até 20. Não era o TEP nem
 *    o pós-PCR que estavam fora do padrão: era a Sepse limitando abaixo do que a
 *    própria fonte admite, de três jeitos diferentes.
 *
 *    Teto baixo demais em disfunção miocárdica séptica é INOTROPISMO
 *    INSUFICIENTE — e conservador não é automaticamente mais seguro.
 *
 * ── DUAS FONTES, DUAS AFIRMAÇÕES, NUNCA FUNDIDAS ────────────────────────────
 *
 * A DOSE vem da BULA. A INDICAÇÃO vem da DIRETRIZ. São origens diferentes e
 * precisam parecer diferentes no texto — fundir as duas numa citação só seria
 * citar diretriz para sustentar o que ela não diz (o erro do ART, D-6).
 *
 *   BULA (cloridrato de dobutamina 12,5 mg/mL, ampola 20 mL — Hipolabor/Teuto):
 *     dose usual 2,5–10 mcg/kg/min, INICIAR pela menor e titular em intervalos
 *     de poucos minutos; frequentemente até 20 são necessários para melhora
 *     hemodinâmica adequada.
 *
 *   SSC 2026 (Prescott HC et al., Crit Care Med 2026):
 *     trata da INDICAÇÃO e NÃO especifica dose nenhuma.
 *
 * ── E A FORÇA DA RECOMENDAÇÃO MUDOU EM 2026 ─────────────────────────────────
 *
 * A 2021 dizia "adicionar dobutamina ou usar adrenalina isolada". A 2026
 * REBAIXOU para o enquadramento genérico "inotrópico versus nenhum inotrópico",
 * mantendo a específica como sugestão FRACA. E registrou que os dados são
 * insuficientes para escolher entre dobutamina e milrinona.
 *
 * O app apresentava a dobutamina como A resposta. O texto agora diz o que a
 * evidência sustenta em vez de entregar confiança que ela não tem — mesmo
 * princípio aplicado ao SOFA.
 */

/**
 * ⚠️ A CAMADA NUMÉRICA EXISTE PARA SER CONFERIDA — e é o padrão certo, não uma
 * sobra.
 *
 * ── O ERRO QUE QUASE A APAGOU (2026-08-17) ──────────────────────────────────
 *
 * A varredura de "constantes de lib/ sem consumidor" a acusou de órfã, e eu a
 * apaguei. `npm run test:dobutamina` reprovou em três conferências.
 *
 * O motivo: quem a consome é a TRAVA. `scripts/valida-dobutamina.cjs` compara
 * estes números com a bula (referência EXTERNA, escrita lá de propósito) e depois
 * confere que o TEXTO exibe os mesmos valores. Sem esta constante, o texto ficaria
 * sozinho e nada verificaria se alguém mudasse "2,5–10" para outra coisa.
 *
 * ⚠️ "CONSUMIDOR" NÃO É SÓ QUEM RENDERIZA. Uma constante numérica pode existir
 * exatamente para ser conferida — e essa é a forma mais forte de proteger um
 * número clínico, não a mais fraca. A varredura excluía `scripts/` do universo,
 * e foi ela que estava errada.
 */
export const DOBUTAMINA_MCG_KG_MIN = {
  inicio: 2.5,
  usualMin: 2.5,
  usualMax: 10,
  teto: 20,
} as const;

/**
 * Os três eixos, em uma frase literal cada.
 *
 * Literais sem interpolação: template com `${}` sai da varredura de tradução
 * (D-19) e o usuário em espanhol leria português.
 */
export const DOBUTAMINA_INICIO =
  "INÍCIO: 2,5 mcg/kg/min sempre, e titular em intervalos de poucos minutos pela resposta — a bula manda começar pela menor dose, qualquer que seja a indicação.";

export const DOBUTAMINA_FAIXA_USUAL =
  "FAIXA USUAL: 2,5–10 mcg/kg/min (bula do cloridrato de dobutamina 12,5 mg/mL). É onde a maioria responde.";

export const DOBUTAMINA_ATE_20 =
  "ATÉ 20 mcg/kg/min quando necessário — a bula registra que doses até 20 são frequentemente necessárias para melhora hemodinâmica adequada. ⚠️ MAS SUBIR TEM TRÊS CUSTOS: (1) taquiarritmia e aumento do consumo miocárdico de O₂, que é a razão pela qual tetos menores foram escritos por aí; (2) PIORA DA HIPOTENSÃO por vasodilatação beta-2 — na sepse é armadilha real, porque quem sobe a dose por hipoperfusão pode derrubar a PA e agravar exatamente o que quis tratar; (3) a titulação é por MARCADORES DE PERFUSÃO — lactato, débito urinário, perfusão periférica — e NUNCA por atingir um número da faixa. Chegar a 20 não é meta.";

