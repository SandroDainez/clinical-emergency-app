/**
 * Adrenalina em infusão no CHOQUE — faixa e limiares, em fonte única.
 *
 * ⚠️ NÃO CONFUNDIR com os outros dois construtos da adrenalina no app, que têm
 * libs próprias (R-36):
 *   · lib/adrenalina-na-parada    — 1 mg em bolus, PCR
 *   · lib/adrenalina-ev-anafilaxia — infusão da anafilaxia refratária
 * Aqui é vasopressor contínuo no choque.
 *
 * ── O DEFEITO QUE ORIGINOU: DUAS FAIXAS PARA O MESMO CONSTRUTO ──────────────
 *
 *   sepsis-decision-tree:368  "EPINEFRINA 0,01–0,5 mcg/kg/min em choque refratário"
 *   vasoactive-engine:311     "0,01–1 mcg/kg/min (choque refratário)"
 *
 * Testado o R-36 antes de chamar de divergência: os DOIS sítios dizem "choque
 * refratário" — mesmo fármaco, mesma indicação, mesmo momento do algoritmo.
 * Não são dois regimes. É divergência, com o teto DOBRANDO entre um arquivo e
 * o outro.
 *
 * ── R-56: E NENHUM DOS DOIS NÚMEROS É TETO ─────────────────────────────────
 *
 * Aberta a fonte, os dois lados estavam errados no mesmo sentido: 0,5 e 1 são
 * limiares de CLASSIFICAÇÃO, não limites terapêuticos.
 *
 *   · "> 0,5 mcg/kg/min […] is often used in clinical trials as a threshold"
 *     de dose alta;
 *   · "doses exceeding 1 µg/kg/min were associated with a 90% mortality" —
 *     associação com prognóstico, não proibição;
 *   · EMCrit, sobre a noradrenalina: "there is no 'maximal dose'".
 *
 * Apresentar um marcador de gravidade como teto SUBDOSA quem precisa de mais —
 * e é o terceiro caso desta auditoria (teto de 2,2 g da amiodarona, PAM ≥ 80).
 *
 * A forma certa já existia no próprio app: a entrada da NORADRENALINA em
 * vasoactive-engine escreve "0,01–1 (faixa habitual); > 1 = dose alta (marcador
 * de gravidade — SOFA cardiovascular)". A adrenalina recebe o mesmo tratamento.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · EMCrit IBCC — Shock & vasoactive medications: dose baixa/inotrópica
 *    "< 0,05–0,08 ug/kg/min"; sobre a noradrenalina, "there is no maximal dose".
 *  · ACEP Critical Care — Refractory Shock (2025): "more than 0.5 mcg/kg/min of
 *    norepinephrine or epinephrine […] is often used in clinical trials as a
 *    threshold".
 *  · Therapeutic Strategies for High-Dose Vasopressor-Dependent Shock
 *    (PMC3787628): "doses exceeding 1 µg/kg/min were associated with a 90%
 *    mortality"; risco de isquemia mesentérica e digital.
 *  · ⚠️ NENHUMA delas é diretriz — são referências de terapia intensiva. A SSC
 *    2026 não estabelece faixa de adrenalina. Declarado (R-5), e a trava confere
 *    contra estas referências, não contra o app (R-21).
 */

export const ADRENALINA_CHOQUE_FAIXA =
  "ADRENALINA em infusão contínua — iniciar em 0,05 mcg/kg/min e titular pela PAM; a faixa de referência no choque vai de 0,01 a 2 mcg/kg/min. Abaixo de ~0,05 o efeito é predominantemente INOTRÓPICO; acima, vasopressor.";

/**
 * ⚠️ ESTES NÚMEROS NÃO SÃO TETO. Escrito no próprio texto porque foi assim que
 * o app os transformou em limite duas vezes, em dois arquivos diferentes.
 */
export const ADRENALINA_CHOQUE_LIMIARES =
  "⚠️ 0,5 E 1 mcg/kg/min NÃO SÃO TETO — são marcadores de gravidade. Acima de 0,5 é o limiar que os ensaios usam para chamar de DOSE ALTA; acima de 1 observou-se mortalidade em torno de 90%, o que descreve a gravidade de quem chegou lá, não uma proibição. Não existe dose máxima estabelecida. O que muda acima desses valores é a vigilância — isquemia mesentérica e digital, taquiarritmia, lactato — e a pergunta sobre causa não tratada, nunca a decisão de subdosar.";

/**
 * ⚠️ ESTA CONSTANTE ESTAVA MORTA — e a correção não foi apagá-la.
 *
 * ── O QUE A VARREDURA DO ITEM 13 ACHOU (2026-08-17) ─────────────────────────
 *
 * Ela era uma das 10 constantes de `lib/` sem nenhum consumidor. Nove saíram
 * porque o conteúdo já chegava por outra via — eram SEGUNDA REDAÇÃO. Esta não:
 *
 *   · a SEPSE afirma a ordem, e bem: "a adrenalina entra quando a PAM segue
 *     inadequada apesar de noradrenalina E VASOPRESSINA" (dentro de
 *     VASOPRESSINA_QUANDO_ASSOCIAR), mais "⚠️ COM DISFUNÇÃO CARDÍACA
 *     CONCOMITANTE — e só nesse caso — a SSC 2026 sugere noradrenalina OU
 *     adrenalina como 1ª linha";
 *   · a TELA DE VASOATIVOS dizia apenas "reservar para choque refratário a
 *     noradrenalina" — e OMITIA A VASOPRESSINA.
 *
 * ⚠️ E É NA TELA DE VASOATIVOS QUE A LEITURA ERRADA ACONTECE (R-48): ali as
 * drogas aparecem em lista, e a ordem medida é Noradrenalina → ADRENALINA →
 * Dobutamina → Dopamina → VASOPRESSINA → Milrinona. A adrenalina em segundo, a
 * vasopressina em quinto — a lista afirma, pela posição, o INVERSO do que a
 * sepse diz. A reordenação é D-49; esta frase é a metade barata, e com ela a
 * ordem visual deixa de afirmar sozinha.
 *
 * O texto foi reescrito para dizer o que a fonte do app já afirma — a mesma
 * SSC 2026 da sepse, com a condição da disfunção cardíaca DELIMITADA ("e só
 * nesse caso"), que a versão antiga insinuava sem fechar.
 */
export const ADRENALINA_CHOQUE_QUANDO =
  "QUANDO ENTRA, NO CHOQUE SÉPTICO: quando a PAM segue inadequada APESAR de noradrenalina E VASOPRESSINA — não depois da noradrenalina apenas. ⚠️ A ORDEM IMPORTA E A LISTA DESTA TELA NÃO A REFLETE: a vasopressina vem ANTES da adrenalina na escalada, mesmo aparecendo depois dela aqui. ➜ A EXCEÇÃO, DELIMITADA: com DISFUNÇÃO CARDÍACA concomitante — e só nesse caso — a SSC 2026 sugere noradrenalina OU adrenalina como 1ª linha; sem disfunção cardíaca, a 1ª linha é noradrenalina.";
