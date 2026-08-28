/**
 * FORMATO DE APRESENTAÇÃO — ⛔ nada clínico aqui.
 *
 * ⚠️ POR QUE ESTE ARQUIVO EXISTE: um instante é `number` no estado, e número é o
 * que a trilha precisa. Mas `1787922516903` ⛔ NUNCA pode chegar ao médico.
 * A conversão mora aqui, num lugar só.
 *
 * ⚠️ ISTO NÃO VIOLA Q-01. A fronteira de relógio governa **ler a hora atual**;
 * ⛔ estas funções não leem hora nenhuma — recebem um instante já registrado e
 * apenas o desenham.
 */

const doisDigitos = (n: number) => String(n).padStart(2, "0");

/** `HH:mm` — a forma normal, para quem está lendo agora. */
export function horaCurta(instante: number): string {
  const d = new Date(instante);
  return `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

/** `DD/MM HH:mm` — quando o dia importa. */
export function horaComData(instante: number): string {
  const d = new Date(instante);
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)} ${horaCurta(instante)}`;
}

/**
 * A forma certa conforme a distância até a referência.
 *
 * ⚠️ Mostra a data **só quando ela muda o sentido** — um AVC que começou ontem à
 * noite e um que começou hoje de manhã ⛔ não podem aparecer iguais.
 */
export function horaDeExibicao(instante: number, referencia: number): string {
  const a = new Date(instante);
  const b = new Date(referencia);
  const mesmoDia =
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  return mesmoDia ? horaCurta(instante) : horaComData(instante);
}

/** Hora e minuto de um instante — para alimentar o seletor. */
export function partesDaHora(instante: number): { hora: number; minuto: number } {
  const d = new Date(instante);
  return { hora: d.getHours(), minuto: d.getMinutes() };
}

/**
 * Constrói um instante com hora e minuto escolhidos, ancorado no dia de
 * `referencia`.
 *
 * ⚠️ Se a hora escolhida for FUTURA em relação à referência, o instante recua um
 * dia: às 00:30, "última vez bem às 23:40" é ontem. ⛔ Tratá-lo como hoje daria
 * um decorrido negativo — e decorrido negativo vira janela impossível.
 */
export function instanteComHoraMinuto(
  referencia: number,
  hora: number,
  minuto: number
): number {
  const d = new Date(referencia);
  d.setHours(hora, minuto, 0, 0);
  const t = d.getTime();
  return t > referencia ? t - 24 * 60 * 60 * 1000 : t;
}
