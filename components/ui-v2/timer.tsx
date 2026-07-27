import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import {
  ESPACO,
  NUMERO_TABULAR,
  TIPOGRAFIA,
} from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type TimerProps = {
  /** Tempo em segundos. Quem conta é o engine — este componente só exibe. */
  segundos: number;
  rotulo?: string;
  /** Destaque semântico: passa a cor sem mudar o valor. */
  tom?: "neutro" | "warning" | "critical";
  tamanho?: "normal" | "grande";
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const doisDigitos = (n: number) => String(Math.floor(n)).padStart(2, "0");

/** Formata segundos em mm:ss, ou hh:mm:ss quando passa de uma hora. */
export function formatarTempo(segundos: number): string {
  const total = Math.max(0, Math.floor(segundos));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${doisDigitos(h)}:${doisDigitos(m)}:${doisDigitos(s)}`
    : `${doisDigitos(m)}:${doisDigitos(s)}`;
}

/**
 * Cronômetro — apresentação apenas.
 *
 * Não conta, não agenda, não guarda estado: recebe segundos prontos. A contagem
 * pertence ao engine, e este componente jamais deve tocá-la — é a linha que
 * separa apresentação de lógica clínica.
 *
 * `tabular-nums` é obrigatório aqui: sem ele os dígitos mudam de largura a cada
 * segundo e o número treme, exatamente no elemento que o médico olha de relance
 * durante a parada.
 */
export function Timer({
  segundos,
  rotulo,
  tom = "neutro",
  tamanho = "normal",
  style,
  testID,
}: TimerProps) {
  const e = useEstilosDoTema(criarEstilos);

  return (
    <View style={[e.wrapper, style]} testID={testID}>
      {rotulo ? <Text style={e.rotulo}>{rotulo}</Text> : null}
      <Text
        style={[
          e.valor,
          tamanho === "grande" && e.grande,
          e.tom[tom],
        ]}
        // Leitores de tela dizem "zero dois dois quatro" se ler "02:24" cru.
        accessibilityLabel={acessivel(segundos)}
      >
        {formatarTempo(segundos)}
      </Text>
    </View>
  );
}

function acessivel(segundos: number): string {
  const total = Math.max(0, Math.floor(segundos));
  const m = Math.floor(total / 60);
  const s = total % 60;
  const partes: string[] = [];
  if (m > 0) partes.push(`${m} ${m === 1 ? "minuto" : "minutos"}`);
  if (s > 0 || m === 0) partes.push(`${s} ${s === 1 ? "segundo" : "segundos"}`);
  return partes.join(" e ");
}

const criarEstilos = (t: Tema) => {
  const cores = t.cores;
  return {
    ...StyleSheet.create({
      wrapper: { gap: ESPACO.xs },
      rotulo: { ...TIPOGRAFIA.micro, color: cores.textSecondary },
      valor: { ...TIPOGRAFIA.step, ...NUMERO_TABULAR, color: cores.text },
      grande: { ...TIPOGRAFIA.display, ...NUMERO_TABULAR },
    }),
    tom: StyleSheet.create({
      neutro: { color: cores.text },
      warning: { color: cores.warning },
      critical: { color: cores.critical },
    }),
  };
};
