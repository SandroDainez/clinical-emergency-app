/**
 * OS MÓDULOS QUE VIVEM DENTRO DO PCR ADULTO — a primeira seção do hub na UI 2.0.
 *
 * ⚠️ POR QUE ESTE ARQUIVO EXISTE, EM VEZ DE LER `constants/module-groups.ts`.
 * Aquele arquivo declara, no próprio cabeçalho, que serve a COBERTURA E
 * VALIDAÇÃO e não desenha tela — e em 2026-08-17 alguém (eu) o usou como se
 * desenhasse e relatou uma correção que não chegou a nenhum pixel. Ler dali para
 * montar seção repetiria o erro com a assinatura invertida.
 *
 * Então a tela tem a sua própria fonte, aqui, e a coerência entre as duas é
 * TRAVADA em vez de combinada: `test:secao-pcr` reprova se esta lista deixar de
 * ser exatamente o grupo "Reanimação" menos o herói.
 *
 * ⚠️ SEÇÃO É AGRUPAMENTO VISUAL, NUNCA ANINHAMENTO (PD-9). Todo card daqui
 * continua tocável direto, com o mesmo peso dos demais, e nenhum deles some da
 * lista principal — a seção agrupa o que já estava lá.
 */

/** O card-herói. Não entra na seção: ele É o módulo que a seção acompanha. */
export const ID_DO_HEROI = "pcr-adulto";

/**
 * ⚠️ O ENGASGO (OVACE) NÃO ENTRA — e esta exclusão é CLÍNICA, não conveniência.
 *
 * Ele trata um paciente CONSCIENTE, de pé, tossindo. Pô-lo sob o rótulo «dentro
 * do módulo PCR Adulto» diz que ele é parte da parada, que é o cenário em que
 * aquele módulo justamente NÃO serve — e recria, com outro desenho, o
 * aninhamento que a auditoria removeu em 2026-08-17. A razão inteira já estava
 * escrita em `constants/module-groups.ts`, no cabeçalho, quando esta seção foi
 * montada: eu a li e montei o contrário (R-85).
 *
 * Ele vive na LISTA PRINCIPAL, com a etiqueta VIA AÉREA — que é o cenário dele.
 */
export const EXCLUIDOS_DA_SECAO: readonly string[] = ["ovace-adulto"];

/** Os sete satélites, na ordem em que o médico os encontra no atendimento. */
export const IDS_DA_SECAO_PCR = [
  "bradicardia-acls",
  "taquicardia-acls",
  "causas-reversiveis-acls",
  "pcr-gestacao-acls",
  "pos-pcr-acls",
  "ritmos-acls",
  "farmacologia-acls",
] as const;

export const TITULO_DA_SECAO_PCR = "Dentro do módulo PCR Adulto";
