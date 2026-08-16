/**
 * TCE penetrante — a exclusão de escopo declarada (PD-4).
 *
 * ── COMO ISTO NASCEU ────────────────────────────────────────────────────────
 *
 * Achado lateral da sonda da D-36: ao confirmar que NÃO existe 5ª edição das
 * diretrizes de TCE grave, apareceu que a Brain Trauma Foundation publicou a
 * 2ª edição das *Guidelines for the Management of Penetrating TBI* (2025).
 *
 * O app mencionava "ferimento penetrante craniano" UMA vez — no nó de
 * neurocirurgia, como sinal de gravidade que dispensa esperar o laudo — e não
 * tinha conduta própria. ⚠️ Menção solta num app em que tudo o mais tem
 * conduta SUGERE que o assunto está tratado.
 *
 * ── FRONTEIRA, NÃO MURO ─────────────────────────────────────────────────────
 *
 * O paciente com ferimento penetrante TAMBÉM tem lesão cerebral, hipertensão
 * intracraniana, via aérea e coagulação para cuidar. Uma exclusão dura — "abra
 * a diretriz específica" — faria alguém abandonar o que este módulo tem de
 * útil, que é a maior parte do que se faz na primeira hora.
 *
 * Mesma escolha da PD-2 (pediatria): a ausência é DECLARADA, e o que continua
 * valendo é dito com todas as letras.
 *
 * ── E AS OUTRAS MENÇÕES DE "PENETRANTE" NÃO SÃO ESTE CASO ──────────────────
 *
 * Varredura feita antes de escrever. O politrauma usa "ferimento penetrante"
 * como critério de TRAUMA MAIOR (consequência imediata: sala de emergência e
 * equipe completa), e as causas reversíveis o usam como pista de tamponamento,
 * com toracotomia de ressuscitação. As duas TÊM conduta e ficam como estão.
 *
 * A exclusão é do MANEJO DO TCE PENETRANTE, não do mecanismo — escrever
 * "trauma penetrante está fora do escopo" contradiria dois módulos que o
 * tratam corretamente.
 *
 * ── FONTE DA SAÍDA ──────────────────────────────────────────────────────────
 *
 * Brain Trauma Foundation — Guidelines for the Management of Penetrating
 * Traumatic Brain Injury, 2ª edição (2025). Identificada e NÃO aberta: este
 * arquivo não reproduz nenhuma conduta dela, apenas a nomeia como o lugar
 * onde a conduta está.
 */

/**
 * ⚠️ O CRITÉRIO OPERACIONAL VEM PRIMEIRO, e a lista depois — porque é o
 * critério que se lembra sob pressão. Cinco eixos ninguém decora; uma
 * pergunta de três palavras-chave, sim.
 */
export const TCE_PENETRANTE_FRONTEIRA =
  "⚠️ FERIMENTO PENETRANTE DE CRÂNIO — ESTE MÓDULO COBRE UMA PARTE, E DIZ QUAL. O CRITÉRIO, e é só isto que você precisa lembrar: SE A CONDUTA DEPENDE DA TRAJETÓRIA, DO OBJETO OU DA DURA, ESTÁ FORA DESTE MÓDULO. SE DEPENDE DE PRESSÃO, PIC, VIA AÉREA E COAGULAÇÃO, ESTÁ AQUI E CONTINUA VALENDO. ✅ O QUE VOCÊ JÁ ESTÁ FAZENDO NÃO MUDA: ABCDE, via aérea definitiva com Glasgow ≤ 8, meta de PAS por faixa etária, SpO₂ e normocapnia, controle de PIC e PPC, reversão de anticoagulação, cabeceira e sódio — tudo isso vale igual no penetrante, e interromper é o único erro que esta ressalva pode causar. ⚠️ O QUE ESTE APP NÃO COBRE, e que é específico do penetrante: (1) ANTIBIÓTICO — a profilaxia antimicrobiana é conduta estabelecida no ferimento penetrante e NÃO é no TCE fechado; o app nomeia o eixo e não prescreve esquema, porque meia-cobertura de antibiótico é pior que nenhuma; (2) INDICAÇÃO E TÉCNICA CIRÚRGICA — desbridamento, fragmentos ósseos e metálicos, correção dural; (3) O OBJETO ENCRAVADO NÃO SE REMOVE fora do centro cirúrgico, porque ele pode estar tamponando o vaso que ele mesmo lesou; (4) IMAGEM VASCULAR — o penetrante tem risco de aneurisma traumático e de lesão de seio venoso, que o fechado não tem, e isso muda o que se pede; (5) A TRAJETÓRIA decide prognóstico e conduta de um jeito que o Glasgow sozinho não captura — bi-hemisférica, transventricular e transtentorial não são o mesmo ferimento. ➜ ONDE BUSCAR: Brain Trauma Foundation — Guidelines for the Management of Penetrating Traumatic Brain Injury, 2ª edição (2025). E acione a NEUROCIRURGIA agora, não depois da imagem.";

/**
 * ⚠️ A MENÇÃO DO NÓ DE NEUROCIRURGIA CONTINUA SENDO GATILHO DE ACIONAMENTO.
 *
 * Ela existe ali para dizer que ferimento penetrante dispensa esperar o laudo
 * da tomografia — e isso é conduta DESTE módulo, correta e mantida. O texto
 * abaixo acompanha a exclusão exatamente para impedir a leitura de que
 * "penetrante" agora só serve para mandar o médico embora.
 */
export const TCE_PENETRANTE_CONTINUA_ACIONANDO =
  "✅ E ATENÇÃO À LEITURA: o ferimento penetrante continua sendo GATILHO DE ACIONAMENTO IMEDIATO da neurocirurgia, sem esperar o laudo da tomografia — isso é conduta deste módulo e não mudou. A ressalva de escopo diz o que este app não detalha DEPOIS que a equipe já foi acionada; ela não é motivo para acionar mais tarde, nem para deixar de fazer a estabilização que está descrita aqui.";
