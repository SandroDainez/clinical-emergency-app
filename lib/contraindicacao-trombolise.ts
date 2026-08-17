/**
 * CONTRAINDICAÇÕES AO TROMBOLÍTICO — três listas, dois itens comuns.
 *
 * ── A PERGUNTA QUE ORIGINOU, E A RESPOSTA QUE MUDOU O DESENHO ───────────────
 *
 * Três nós do app perguntam "há contraindicação ABSOLUTA?" com sim e não —
 * AVC (`isq_contraindicacoes`), SCA (`stemi_fibrino_check`) e TEP
 * (`ar_trombolise_check`). Nos três, quem hesita responde "não há" e
 * TROMBOLISA: é o critério do default perigoso na forma mais direta.
 *
 * A tentação era óbvia: as três listas se parecem, logo fonte única com
 * acréscimos por indicação. ⚠️ O AUTOR RECUSOU E MANDOU CONFERIR JANELA A
 * JANELA ANTES. As fontes foram abertas, e ele estava certo:
 *
 *   item                          AVC          SCA              TEP
 *   ─────────────────────────────────────────────────────────────────────────
 *   AVC isquêmico recente         3 meses      3 meses, EXCETO  3 meses (StatPearls)
 *                                              agudo em 4,5 h   6 meses (ESC 2019)
 *   cirurgia intracraniana/       3 MESES      2 MESES          "recente"
 *     intraespinhal
 *   pressão arterial              ALVO         relativa         relativa
 *                                 TRATÁVEL     > 180/110        > 180/110
 *                                 < 185/110
 *   dissecção de aorta            suspeita     suspeita         (não consta)
 *
 * DOS QUATRO ITENS QUE PARECIAM NÚCLEO, DOIS ERAM. Fundir teria criado limiar
 * errado em duas das três telas — contraindicando a mais na SCA (3 em vez de 2
 * meses para cirurgia) ou de menos no AVC.
 *
 * ── O DESENHO QUE SAIU DISSO ────────────────────────────────────────────────
 *
 * TRÊS LISTAS COMPLETAS, cada uma própria da sua indicação. Os DOIS itens
 * realmente comuns — hemorragia intracraniana prévia e sangramento ativo /
 * diátese — vêm de CONSTANTE COMPARTILHADA e aparecem inteiros nas três telas,
 * marcados como comuns.
 *
 * ⚠️ A fonte única aqui não é da LISTA, é dos DOIS ITENS. Três cópias à mão de
 * "hemorragia intracraniana prévia" é o padrão que gerou metade dos achados
 * desta auditoria, e duas linhas não são exceção à regra.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-16) ───────────────────────────────────
 *
 *  · AVC — bula do alteplase (Activase/Genentech) com as advertências AHA/ASA.
 *  · SCA — tabela de contraindicações à fibrinólise do guideline de SCA,
 *    adaptada de O'Gara et al.
 *  · TEP — StatPearls (Thrombolytic Therapy) e a síntese do ESC 2019.
 *
 * Nenhuma delas é o texto integral da diretriz primária: são bula, tabela
 * adaptada e revisão. Declarado (R-52), e por isso o app NÃO resolve a
 * divergência do TEP — ele a nomeia.
 */

/* ── OS DOIS ITENS COMUNS — fonte única, exibidos inteiros nas três telas ─── */

/**
 * ⚠️ Comum às três indicações SEM janela divergente: é sempre, e é qualquer
 * hemorragia intracraniana prévia, não só a atual.
 */
export const CI_COMUM_HEMORRAGIA_INTRACRANIANA =
  "🔒 COMUM ÀS TRÊS INDICAÇÕES — HEMORRAGIA INTRACRANIANA PRÉVIA, EM QUALQUER ÉPOCA. Não há janela: sangramento intracraniano prévio contraindica trombolítico no AVC, na síndrome coronariana e no TEP igualmente. Entram aqui a hemorragia subaracnóidea e as lesões estruturais que sangram — malformação arteriovenosa, aneurisma, neoplasia intracraniana.";

/** ⚠️ Também comum às três, também sem janela. */
export const CI_COMUM_SANGRAMENTO_ATIVO =
  "🔒 COMUM ÀS TRÊS INDICAÇÕES — SANGRAMENTO ATIVO OU DIÁTESE HEMORRÁGICA (menstruação não conta). Sangramento em curso e distúrbio de coagulação contraindicam nas três indicações, sem janela de tempo. O que muda entre elas é o LABORATÓRIO que se exige antes — e isso está na lista de cada uma.";

/* ── AVC ISQUÊMICO ────────────────────────────────────────────────────────── */

export const CI_AVC_LISTA =
  "CONTRAINDICAÇÕES AO ALTEPLASE NO AVC ISQUÊMICO — confira item a item, e o que você não conseguir excluir conta como presente. ABSOLUTAS: hemorragia intracraniana atual; hemorragia subaracnóidea; sangramento interno ativo; diátese hemorrágica; cirurgia intracraniana ou intraespinhal, OU traumatismo craniano grave, nos ÚLTIMOS 3 MESES; lesão intracraniana que aumente o risco de sangramento (neoplasia, malformação arteriovenosa, aneurisma); hipertensão grave não controlada. ADVERTÊNCIAS QUE PESAM COMO CONTRAINDICAÇÃO: plaquetas < 100.000/mm³; INR > 1,7; aPTT > 40 s; TP > 15 s; heparina de baixo peso nas últimas 24 h; anticoagulante oral direto, salvo laboratório específico normal ou mais de 48 h da última dose.";

/**
 * ⚠️ A PRESSÃO NO AVC NÃO É CONTRAINDICAÇÃO — É ALVO.
 *
 * É a diferença que mais engana entre as três listas: na SCA e no TEP a
 * hipertensão grave é contraindicação RELATIVA e fica assim; no AVC ela é uma
 * meta a tratar antes de trombolisar.
 */
export const CI_AVC_PRESSAO_E_ALVO =
  "⚠️ E A PRESSÃO AQUI NÃO É CONTRAINDICAÇÃO — É ALVO. Diferente da síndrome coronariana e do TEP, onde a hipertensão grave é contraindicação relativa e permanece assim, no AVC isquêmico ela se TRATA: baixe para menos de 185/110 mmHg e trombolise. Confundir os dois transforma um paciente tratável num paciente excluído — e o módulo tem o passo do alvo pressórico logo adiante.";

/* ── SÍNDROME CORONARIANA COM SUPRA ───────────────────────────────────────── */

export const CI_SCA_LISTA =
  "CONTRAINDICAÇÕES À FIBRINÓLISE NA SCA COM SUPRA — confira item a item. ABSOLUTAS: qualquer hemorragia intracerebral prévia; lesão vascular cerebral estrutural conhecida (malformação arteriovenosa); neoplasia intracraniana maligna conhecida, primária ou metastática; AVC ISQUÊMICO NOS ÚLTIMOS 3 MESES (com a exceção logo abaixo); suspeita de dissecção de aorta; sangramento ativo ou diátese hemorrágica (exceto menstruação); trauma craniano fechado ou facial significativo nos últimos 3 MESES; cirurgia intracraniana ou intraespinhal nos últimos 2 MESES. RELATIVAS: PAS > 180 ou PAD > 110 mmHg na apresentação; hipertensão crônica grave mal controlada; AVC isquêmico prévio há MAIS de 3 meses; demência; RCP traumática ou prolongada (> 10 min); cirurgia de grande porte há menos de 3 semanas; sangramento interno recente (2 a 4 semanas); punção vascular não compressível; gravidez; úlcera péptica ativa; uso de anticoagulante oral.";

/**
 * ⚠️ A EXCEÇÃO CONTRAINTUITIVA — e ela precisa da razão escrita ao lado.
 *
 * "AVCi em 3 meses contraindica, EXCETO AVCi agudo em 4,5 h" parece erro de
 * digitação para quem lê rápido, e alguém "corrigiria" para a regra geral. A
 * razão é que ali o trombolítico trata as DUAS coisas.
 */
export const CI_SCA_EXCECAO_AVC_AGUDO =
  "⚠️ A EXCEÇÃO QUE PARECE ERRO DE DIGITAÇÃO, E NÃO É: o AVC isquêmico nos últimos 3 meses contraindica a fibrinólise — EXCETO quando o AVC isquêmico é AGUDO, dentro de 4,5 h. A razão: nessa janela o trombolítico é o tratamento DAS DUAS coisas, e não uma droga que se dá apesar do AVC. Fora da janela de 4,5 h a exceção não vale, e o AVC recente volta a ser contraindicação absoluta. ⚠️ Isto é específico da SCA — não existe na lista do AVC nem na do TEP, e não faz sentido nelas.";

/* ── TEP ──────────────────────────────────────────────────────────────────── */

export const CI_TEP_LISTA =
  "CONTRAINDICAÇÕES À TROMBÓLISE NO TEP — confira item a item. ABSOLUTAS: doença intracraniana estrutural; hemorragia intracraniana; sangramento ativo; cirurgia cerebral ou de coluna recente; traumatismo craniano recente com fratura ou lesão encefálica; diátese hemorrágica; AVC isquêmico recente (a janela diverge entre as fontes — veja abaixo). RELATIVAS: PAS > 180 ou PAD > 110 mmHg; sangramento não intracraniano recente; cirurgia ou procedimento invasivo recente; AVC isquêmico há mais de 3 meses; anticoagulação em curso; RCP traumática; pericardite ou derrame pericárdico; retinopatia diabética; gravidez; idade > 65 anos; baixo peso corporal.";

/**
 * ⚠️ AUSÊNCIA DECLARADA COM AUTORIA (R-13) — e o autor exigiu dizer QUEM diz o
 * quê, não só que divergem.
 *
 * Quem decide com um paciente de 4 meses de AVC precisa saber que a discordância
 * é entre StatPearls e ESC, para escolher conforme o que o serviço segue.
 */
export const CI_TEP_JANELA_DIVERGE =
  "⚠️ A JANELA DO AVC ISQUÊMICO RECENTE DIVERGE ENTRE AS FONTES, E ESTE APP NÃO ESCOLHE POR VOCÊ: o StatPearls (Thrombolytic Therapy) usa 3 MESES como contraindicação absoluta, e coloca o AVC de mais de 3 meses entre as relativas; o ESC 2019 de embolia pulmonar usa 6 MESES. Um paciente com AVC isquêmico há 4 meses é ABSOLUTAMENTE contraindicado por uma fonte e não pela outra. Decida pela referência que o seu serviço adota, registre qual usou — e, se houver tempo, discuta com quem vai assumir o paciente. ➜ Nas outras duas indicações deste app a janela é 3 meses, sem divergência.";

/* ── O QUE VALE PARA AS TRÊS ──────────────────────────────────────────────── */

/**
 * O ramo existe porque o default sob dúvida é trombolisar. Esta é a frase que
 * fecha os três — e ela diz o que fazer com a dúvida que sobrar.
 */
export const CI_O_QUE_FAZER_COM_A_DUVIDA =
  "⚠️ E O QUE FAZER COM O QUE VOCÊ NÃO CONSEGUIU EXCLUIR: item que você não consegue afastar conta como PRESENTE até que alguém o afaste — não como ausente porque ninguém perguntou. Isso não significa desistir da reperfusão: significa que o caminho passa a ser o alternativo (na SCA, transferir para angioplastia primária; no AVC, avaliar trombectomia; no TEP, embolectomia ou tratamento dirigido por cateter), e que a decisão precisa de quem vai assumir o paciente. Ligar para o serviço de referência AGORA custa minutos; trombolisar quem tinha contraindicação absoluta custa o desfecho.";

/**
 * ⚠️ O PRAZO QUE ESCOLHE A REPERFUSÃO — subido para a superfície visível.
 *
 * A medição de `evidence` × visível encontrou este alerta recolhido, e ele é da
 * classe cujo custo é irreversível: o relógio decide entre ICP e fibrinólise, e
 * quem não vê o relógio escolhe pelo que tem à mão.
 */
export const STEMI_RELOGIO_DECIDE =
  "⏱ O RELÓGIO É QUEM ESCOLHE A REPERFUSÃO: ICP primária se o tempo porta-balão for ≤ 120 min (meta ≤ 90 min em centro com hemodinâmica). Acima disso, e com início ≤ 12 h, o caminho é FIBRINÓLISE — com meta de até 10 min entre o diagnóstico e a agulha. ⚠️ E o relógio conta do PRIMEIRO CONTATO MÉDICO, não da chegada à sala de hemodinâmica: os detalhes de onde ele começa estão abaixo.";

export const STEMI_RELATIVA_PESA_O_TEMPO =
  "⚠️ COM CONTRAINDICAÇÃO RELATIVA E SEM ABSOLUTA, QUEM DECIDE É O TEMPO ATÉ A ICP: se a transferência para hemodinâmica for viável em ≤ 120 min, ela é preferível — a relativa deixa de importar. Se não for, a conta é entre o risco de sangramento e o de não reperfundir, e ela pende para reperfundir quanto maior o infarto e mais precoce o quadro.";
