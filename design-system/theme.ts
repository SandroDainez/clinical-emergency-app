import { useMemo } from "react";
import { useColorScheme } from "react-native";

import { TEMAS, type Tema } from "./tokens";

/**
 * Tema ativo (claro/escuro) para a UI 2.0.
 *
 * ⚠️ A armadilha desta camada, e o motivo deste arquivo existir:
 *
 * `StyleSheet.create` roda no import do módulo, FORA do render. Um estilo
 * montado ali congela no tema que estava ativo quando o arquivo carregou e
 * nunca mais muda — o app troca de tema e a tela continua com a cor velha.
 *
 * É o mesmo erro que já mordeu este projeto no i18n, onde `tr("literal")` fora
 * do render congelava o idioma no valor do build. A forma de não repetir é
 * derivar estilo que depende de cor DENTRO do componente, a partir do tema que
 * o hook devolve:
 *
 * ```tsx
 * function Card({ children }) {
 *   const { cores } = useTheme();
 *   const estilos = useEstilosDoTema(criarEstilos);   // memoizado por tema
 *   return <View style={estilos.card}>{children}</View>;
 * }
 *
 * const criarEstilos = (t: Tema) => StyleSheet.create({
 *   card: { backgroundColor: t.cores.surface, borderColor: t.cores.border },
 * });
 * ```
 *
 * Estilo que NÃO depende de cor (espaçamento, raio, layout) pode continuar em
 * `StyleSheet.create` no topo do arquivo — não congela nada.
 */
export function useTheme(): Tema {
  // Por que fixo no escuro em vez de seguir o sistema:
  //
  // O app hoje é escuro por inteiro (fundos #0a0f1a, StatusBar claro). Durante
  // as Fases 3 a 8 as telas migram uma por vez, então UI antiga e nova
  // convivem. Se o tema seguisse o sistema agora, quem usa o aparelho no modo
  // claro veria card claro dentro de tela escura, a cada tela migrada — pior do
  // que o ponto de partida.
  //
  // Os dois temas já estão definidos e validados em contraste, como o plano
  // pede. Ligar a troca é a Fase 9 ("Dark/Light definitivo"), quando todas as
  // telas já consomem tokens: aí esta função passa a ler a preferência do
  // usuário, com `useColorScheme()` como padrão inicial.
  const esquemaDoSistema = useColorScheme();
  void esquemaDoSistema; // lido de propósito: mantém o hook estável para a Fase 9
  return TEMAS.escuro;
}

/**
 * Cria a folha de estilos para o tema ativo, refazendo-a só quando o tema muda.
 *
 * @param criar função pura que recebe o tema e devolve o objeto de estilos
 */
export function useEstilosDoTema<T>(criar: (tema: Tema) => T): T {
  const tema = useTheme();
  return useMemo(() => criar(tema), [criar, tema]);
}

export type { Tema };
