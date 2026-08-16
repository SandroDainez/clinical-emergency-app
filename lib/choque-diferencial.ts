/**
 * Choque — os pares que se confundem, e como o ultrassom os separa.
 *
 * ── POR QUE ESTE ARQUIVO EXISTE ─────────────────────────────────────────────
 *
 * O módulo tem os quatro tipos com confirmação e conduta próprias, e faz UMA
 * distinção perigosa muito bem: a exceção do IAM de ventrículo direito, que
 * nomeia a confusão e escreve a conduta INVERTIDA ("responde bem a volume; a
 * regra do 'evitar volume' não se aplica").
 *
 * O que faltava era o mesmo cuidado no par que mais se troca. O único texto que
 * separava tipos dizia: "extremidades FRIAS […] apontam para hipovolêmico,
 * cardiogênico OU obstrutivo" — agrupa os três e NÃO os separa entre si.
 *
 * ⚠️ E A CASCATA AGRAVA. O fluxo é hipovolemia? → obstrutivo? → cardiogênico? →
 * distributivo, com sim/não. Quem responde "não" ao obstrutivo por engano NUNCA
 * MAIS VOLTA LÁ: cai em cardiogênico e recebe a conduta inversa. Um "não" errado
 * no segundo passo é irreversível dentro do grafo.
 *
 * A saída escolhida NÃO foi mexer na cascata — o fluxo está em uso, e mudar o
 * grafo é risco sem ganho proporcional. A reversibilidade volta pelo TEXTO, e no
 * nó em que a pessoa JÁ ERROU: aviso genérico de "reavalie" não é lido; o que
 * funciona é a ressalva onde o erro acontece, com o SINAL de que se errou.
 */

/**
 * ⚠️ ESCRITO NA FORMA DA EXCEÇÃO DO IAM DE VD — que já existe no módulo e está
 * bem feita — para o texto não parecer enxerto.
 *
 * A última frase é a que devolve a reversibilidade sem tocar no grafo: dá o
 * sinal de que o ramo estava errado e o que fazer com ele.
 */
export const CHOQUE_CARDIOGENICO_EXCLUIR_OBSTRUTIVO =
  "⚠️ ANTES DE TRATAR COMO CARDIOGÊNICO, EXCLUA TAMPONAMENTO E TEP. Os três compartilham exatamente o que a beira do leito mostra — extremidades frias, jugular distendida, PVC alta e débito baixo —, e a CONDUTA É OPOSTA: no tamponamento e no TEP o volume é ponte de sobrevida; no cardiogênico congesto, afoga. Se o paciente PIORAR com diurético ou NÃO MELHORAR com inotrópico, o ramo estava errado: volte ao obstrutivo e faça o ultrassom.";

export const CHOQUE_SEPTICO_COM_HIPOVOLEMIA =
  "⚠️ DISTRIBUTIVO E HIPOVOLÊMICO ANDAM JUNTOS COM FREQUÊNCIA. O séptico perde volume por febre, taquipneia, vômito, diarreia e extravasamento capilar — e chega com os DOIS mecanismos. Tratar só a vasoplegia (vasopressor num paciente seco) ou só o volume (litros num paciente vasoplégico) deixa o paciente sem resposta, e o erro seguinte é concluir que o DIAGNÓSTICO está errado quando falta a outra metade.";

/**
 * ⚠️ O MISTO É REGRA, NÃO EXCEÇÃO — e a cascata força escolher um.
 *
 * Mesma classe do defeito do CAD/EHH: fluxo binário sobre uma realidade que
 * frequentemente é dupla. A saída não é oferecer uma quinta via "misto", que
 * não teria conduta própria — é dizer que o mecanismo DOMINANTE manda a
 * conduta, sem obrigar a negar o outro.
 */
export const CHOQUE_MISTO =
  "CHOQUE MISTO — mais de um mecanismo no mesmo paciente é COMUM: séptico que sangrou, cardiogênico que evoluiu com vasoplegia, politraumatizado com tamponamento, anafilaxia em quem já estava hipovolêmico. Este fluxo pede que você escolha UM caminho, e a escolha certa é o mecanismo DOMINANTE — o que está matando agora. Escolher um NÃO É NEGAR O OUTRO: trate o dominante pela via escolhida e o segundo em paralelo. O sinal de que há um segundo mecanismo é a resposta parcial — melhorou e parou de melhorar.";

/**
 * O ultrassom entra ancorado no par que ele resolve, não como lista de exames.
 *
 * O módulo citava POCUS/RUSH uma vez, e só para dizer QUANDO pedir. Sem o que
 * olhar e o que cada achado significa, a ressalva do par acima seria só aviso —
 * e este bloco seria só lista. Um resolve o outro.
 */
export const CHOQUE_RUSH_COMO =
  "RUSH À BEIRA DO LEITO — é o exame que separa cardiogênico de obstrutivo em minutos, e são QUATRO janelas: (1) VCI — colabável sugere hipovolêmico ou distributivo; distendida e sem variação aponta obstrutivo ou cardiogênico. (2) PERICÁRDIO — derrame com colapso de câmaras direitas fecha TAMPONAMENTO, e aí volume é ponte até a drenagem. (3) VENTRÍCULO DIREITO — dilatado, maior que o esquerdo, com septo desviado, aponta TEP ou IAM de VD; nos dois, volume ajuda e diurético piora. (4) CONTRATILIDADE do ventrículo esquerdo — ruim, com linhas B difusas no pulmão, fecha CARDIOGÊNICO congesto, e aí volume afoga. ⚠️ A pergunta que o exame responde não é qual o diagnóstico — é ESTE PACIENTE ACEITA VOLUME?";
