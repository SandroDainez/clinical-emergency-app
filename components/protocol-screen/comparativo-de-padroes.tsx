import { StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";

import type { ComparativoVisual } from "../../core/decision-tree/types";
import { tracadoDeEcg } from "../../design-system/tracado-de-ecg";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useTheme } from "../../design-system/theme";
import { useTr } from "../../lib/use-tr";

/**
 * COMPARATIVO DE PADRÕES — os desenhos que respondem à pergunta da tela.
 *
 * ⚠️ ESTE ARQUIVO É BIBLIOTECA COMPARTILHADA, NÃO ARQUIVO DO MÓDULO RENAL.
 * Nasceu no renal e serve a todo nó `PADRÃO VISUAL` — ECG de bradicardia,
 * taquicardia, SCA, PCR, TEP; capnografia; padrões de execução. Ver o
 * inventário em `auditoria/PADRAO-VISUAL.md`. Quem edita aqui edita a tela de
 * decisão de vários módulos.
 *
 * ── ⚠️ POR QUE ELE APARECE ABERTO ──────────────────────────────────────────
 *
 * `evidence` e `porque` vivem atrás de um toque porque EXPLICAM. Este não
 * explica: ele é o INSTRUMENTO da resposta. A pergunta é "o ECG do seu paciente
 * se parece com algum destes?" — escondido, o desenho devolveria a pergunta ao
 * texto, que é exatamente o defeito que ele existe para corrigir.
 *
 * ── CADA CARTÃO TEM TRÊS COISAS, E A TERCEIRA É A QUE IMPORTA ──────────────
 *
 * Desenho · o que é · O QUE FAZER. Um comparativo que mostra padrão e não diz
 * conduta transfere de volta ao usuário a decisão que ele veio buscar — vira
 * atlas, não guia.
 */
export default function ComparativoDePadroes({ itens }: { itens: ComparativoVisual[] }) {
  const tr = useTr();
  const { cores } = useTheme();

  if (!itens.length) return null;

  return (
    <View style={e.lista}>
      {itens.map((item) => {
        // A cor do traçado é a do texto principal: o desenho é conteúdo, não
        // decoração, e precisa do mesmo contraste que a frase ao lado.
        const xml = tracadoDeEcg(item.figura, cores.text);
        return (
          <View
            key={item.figura}
            style={[e.cartao, { backgroundColor: cores.surface, borderColor: cores.border }]}>
            {/* ⚠️ Sem desenho, o cartão continua: rótulo, significado e conduta
                seguem na tela e a ausência do traçado fica visível. Piso
                silencioso aqui seria um retângulo vazio no ramo mais letal. */}
            {xml ? (
              <View style={e.moldura} accessibilityRole="image" accessibilityLabel={tr(item.rotulo)}>
                <SvgXml xml={xml} width="100%" height={72} />
              </View>
            ) : null}
            <Text style={[e.rotulo, { color: cores.text }]}>{tr(item.rotulo)}</Text>
            <Text style={[e.significado, { color: cores.textSecondary }]}>{tr(item.significado)}</Text>
            <Text style={[e.conduta, { color: cores.critical }]}>{tr(item.conduta)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const e = StyleSheet.create({
  lista: { gap: ESPACO.sm, marginTop: ESPACO.sm },
  cartao: {
    borderWidth: 1,
    borderRadius: RAIO.card,
    padding: ESPACO.sm,
    gap: 4,
  },
  moldura: { width: "100%" },
  rotulo: { ...TIPOGRAFIA.caption, fontWeight: "700" },
  significado: TIPOGRAFIA.micro,
  conduta: { ...TIPOGRAFIA.micro, fontWeight: "800" },
});
