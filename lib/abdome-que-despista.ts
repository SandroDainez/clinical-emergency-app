/**
 * O abdome que despista — a ressalva que estava na superfície errada.
 *
 * ── O DEFEITO QUE ORIGINOU (R-48, refinamento hesitante × certo) ───────────
 *
 * A frase abaixo existia, e boa, em UM único lugar do app inteiro: dentro do
 * nó `padrao_indefinido` do abdome agudo — o nó a que se chega respondendo
 * "tenho certeza do abdome agudo, mas NÃO do padrão".
 *
 * Ou seja: o aviso de que o exame engana estava na superfície de quem JÁ
 * ADMITIU não saber, e faltava na de quem escolheu "inflamatório" com
 * convicção. E o confiante é exatamente quem precisa — porque a convicção dele
 * veio de um exame que engana.
 *
 * Busca feita no app inteiro por "ENGANA", "imunossuprimido" e "corticoide":
 * uma ocorrência, aquela.
 *
 * A regra que saiu daqui está no METODO, como refinamento do R-48: ressalva
 * sobre a limitação do PRÓPRIO JULGAMENTO tem de estar onde alguém já julgou,
 * não onde ele admitiu não saber.
 */

/**
 * A frase, agora consumida também pelos nós de padrão — onde se decide.
 * Frase inteira, sem interpolação (R-58).
 */
export const ABDOME_EXAME_ENGANA =
  "⚠️ IDOSO, DIABÉTICO, IMUNOSSUPRIMIDO, EM CORTICOIDE OU GESTANTE: O EXAME ENGANA — pode não haver defesa, febre nem leucocitose com víscera já perfurada. O corticoide apaga a resposta inflamatória, a neuropatia diabética apaga a dor, o idoso não monta febre e a gestante tem leucocitose fisiológica que tira o valor do exame. Nesses pacientes, baixe o limiar para imagem e para acionar a cirurgia — e desconfie do seu próprio exame normal, sobretudo quando ele for tranquilizador.";

/**
 * A inversão da armadilha que o módulo já citava pelo lado benigno.
 *
 * `extra_abdominal` lista "cólica renal" entre as causas não cirúrgicas — o
 * que é verdade e é justamente por isso que o rótulo é perigoso: ele existe,
 * é comum, e acomoda a dor lombar do idoso.
 */
export const AAA_SIMULA_COLICA_RENAL =
  "⚠️ E A INVERSÃO, QUE MATA: ANEURISMA DE AORTA ROTO SE APRESENTA COMO CÓLICA RENAL. Dor lombar ou em flanco de início súbito, irradiando para a virilha, com hematúria — o quadro é o mesmo, e o rótulo \"cólica renal\" é confortável porque é comum. Em quem tem mais de 60 anos, hipertenso, tabagista ou vasculopata, e sobretudo na PRIMEIRA crise de \"cólica renal\" da vida, apalpe o abdome procurando massa pulsátil e faça o ultrassom de aorta à beira do leito antes de aceitar o diagnóstico benigno.";
