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

/** ⚠️ Os dois instantes caem no mesmo dia do calendário? */
export function mesmoDia(a: number, b: number): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}

/**
 * Desloca o DIA preservando hora e minuto.
 *
 * ⚠️⚠️ ⛔ NÃO SOMA 24 h EM MILISSEGUNDOS. Somar `86_400_000` atravessa mudança de
 * horário de verão trocando a hora do marco — e "última vez bem às 22h" viraria
 * "às 21h" sem que ninguém tocasse no controle. `setDate` mexe no calendário, e
 * é o calendário que o médico está informando.
 */
export function deslocarDias(instante: number, dias: number): number {
  const d = new Date(instante);
  d.setDate(d.getDate() + dias);
  return d.getTime();
}

/**
 * Quantos dias de calendário este instante está ATRÁS da referência.
 *
 * ⚠️ Conta **dias de calendário**, ⛔ não períodos de 24 h: às 00:30, um marco de
 * ontem às 23:40 está a **um** dia, e ⛔ não a zero.
 */
export function diasAtras(instante: number, referencia: number): number {
  const a = new Date(instante);
  const b = new Date(referencia);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/**
 * O instante de N dias atrás, com a hora e o minuto informados.
 *
 * ⚠️⚠️ ⛔ NÃO SE FAZ COM ARITMÉTICA DE EPOCH. A primeira versão usava
 * `instante % 86_400_000` para extrair "a hora do dia" — e esse resto é a hora
 * em **UTC**, ⛔ não a do relógio de quem está olhando. Em Brasília o marco sairia
 * três horas deslocado, e num campo que decide janela terapêutica o erro ⛔ não
 * apareceria: sairia um número plausível.
 */
export function instanteEmDiaComHora(
  referencia: number,
  diasAtras: number,
  hora: number,
  minuto: number
): number {
  const d = new Date(referencia);
  d.setDate(d.getDate() - diasAtras);
  d.setHours(hora, minuto, 0, 0);
  return d.getTime();
}

/** `DD/MM` — o dia, quando o controle precisa mostrá-lo sozinho. */
export function dataCurta(instante: number): string {
  const d = new Date(instante);
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}`;
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
