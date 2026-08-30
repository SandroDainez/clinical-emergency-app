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

/**
 * Quantas casas decimais o passo tem.
 *
 * ⚠️ É o passo que define a precisão do campo, e ⛔ não uma constante global:
 * peso anda de 1 em 1, INR de 0,1 em 0,1, e ⛔ nenhum dos dois deve saber do
 * outro.
 */
export function casasDoPasso(passo: number): number {
  return Number.isInteger(passo) ? 0 : String(passo).split(".")[1].length;
}

/**
 * Prende um valor ao passo, matando o erro de ponto flutuante.
 *
 * ⚠️⚠️ ⛔ SEM ISTO, `0.1 * 10` É `1.0000000000000002`. Num rótulo de botão isso é
 * feio; num **valor clínico gravado na trilha** é um número que ninguém digitou.
 * O `NumericStepper` já fazia isso internamente — a camada do AVC ⛔ não fazia, e
 * os degraus saíam com dezesseis casas.
 */
export function arredondaAoPasso(valor: number, passo: number): number {
  const casas = casasDoPasso(passo);
  return Number((Math.round(valor / passo) * passo).toFixed(casas));
}

/**
 * Normaliza as **casas decimais** de um valor digitado — ⚠️ e ⛔ **não** o prende
 * à grade do passo.
 *
 * ── O DEFEITO QUE ISTO FECHA (revisão visual, 2026-08-30) ─────────────────
 *
 * ⚠️⚠️ O valor digitado estava passando por `arredondaAoPasso`. Em plaquetas, com
 * passo `1000`, digitar **80** virava **0** — `Math.round(80/1000)*1000`. O
 * componente **apagava um resultado verdadeiro** e mostrava outro número no
 * lugar, com cara de medida.
 *
 * ⚠️ **A distinção que faltava:** o passo é o **incremento do ajuste**, e ⛔ não a
 * **grade dos valores possíveis**. Quem digita 1,45 informou 1,45; quem toca `+`
 * pediu "mais um passo".
 *
 * ⛔ Isto é **E-52** pelo componente numérico: valor fabricado onde havia um
 * verdadeiro.
 */
export function arredondaCasas(valor: number, passo: number): number {
  return Number(valor.toFixed(casasDoPasso(passo)));
}

/**
 * O número como o médico o lê — ⚠️ **vírgula**, e ⛔ não ponto.
 *
 * ⚠️ O app inteiro é PT-BR e ES, e `1.4` ⛔ não é como se escreve um INR em
 * ⛔ nenhum dos dois.
 */
export function numeroCurto(valor: number, passo: number): string {
  return valor.toFixed(casasDoPasso(passo)).replace(".", ",");
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
