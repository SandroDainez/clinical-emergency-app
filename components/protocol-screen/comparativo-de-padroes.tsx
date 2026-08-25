import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";

import type { ComparativoVisual } from "../../core/decision-tree/types";
import { tracadoDeEcg } from "../../design-system/tracado-de-ecg";
import { IMAGENS_ECG_REFERENCIA } from "./imagens-ecg-referencia";
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
export default function ComparativoDePadroes({
  itens,
  grande,
  selecionado,
  onSelect,
}: {
  itens: ComparativoVisual[];
  /**
   * MOLDURA MAIOR, MOLDURA MENOR (Design System V2 v3, piloto coronarianas).
   *
   * ⚠️ OPCIONAL, PADRÃO `false` — nenhum dos outros consumidores (renal,
   * bradicardia, taquicardia) passa esta prop, então continuam exatamente do
   * tamanho de hoje. Só quando um chamador passa `grande` o traçado cresce
   * (72px → 108px de altura) e a moldura encolhe, para reconhecimento rápido
   * em decisão de imagem — pedido explícito do autor após a v3 do design
   * system: "reduzir molduras/bordas que comprimem o traçado".
   */
  grande?: boolean;
  /** Id do item (figura) marcado como selecionado — realce mínimo, sem ícone extra. */
  selecionado?: string;
  /**
   * O CARD VIRA O PRÓPRIO BOTÃO (2026-08-24, ver `ComparativoVisual.optionId`)
   * — OPCIONAL. Quando fornecido, cada item com `optionId` fica tocável e
   * chama `onSelect(optionId)`. Ausente = cartão só ilustra (comportamento de
   * sempre); nenhum consumidor que não passar isto muda.
   */
  onSelect?: (optionId: string) => void;
}) {
  const tr = useTr();
  const { cores } = useTheme();

  if (!itens.length) return null;

  // ⚠️ FOTO REAL MUDA O LAYOUT (Bloco 4, 2026-08-24) — a grade de cartões
  // 148px foi desenhada para o traçado sintético pequeno. Uma foto de
  // referência real precisa ser "o elemento principal da decisão" (pedido
  // explícito do autor): cartão de largura cheia, um por linha, não miniatura
  // ao lado de outra.
  const algumaImagemReal = itens.some((i) => i.imagemReal);

  return (
    <View style={[e.lista, grande && !algumaImagemReal ? e.listaGrande : null]}>
      {itens.map((item) => {
        const fonteImagemReal = item.imagemReal ? IMAGENS_ECG_REFERENCIA[item.imagemReal] : undefined;
        // A cor do traçado é a do texto principal: o desenho é conteúdo, não
        // decoração, e precisa do mesmo contraste que a frase ao lado.
        const xml = fonteImagemReal ? null : tracadoDeEcg(item.figura, cores.text);
        const sel = selecionado === item.figura;
        const conteudo = (
          <>
            {/* ⚠️ Sem desenho, o cartão continua: rótulo, significado e conduta
                seguem na tela e a ausência do traçado fica visível. Piso
                silencioso aqui seria um retângulo vazio no ramo mais letal. */}
            {fonteImagemReal ? (
              <View
                style={[e.molduraImagemReal, { backgroundColor: cores.surface }]}
                accessibilityRole="image"
                accessibilityLabel={tr(item.rotulo)}>
                <Image source={fonteImagemReal} style={e.imagemReal} resizeMode="contain" />
              </View>
            ) : xml ? (
              <View style={e.moldura} accessibilityRole="image" accessibilityLabel={tr(item.rotulo)}>
                <SvgXml xml={xml} width="100%" height={grande ? 108 : 72} />
              </View>
            ) : null}
            <Text style={[e.rotulo, { color: cores.text }]}>{tr(item.rotulo)}</Text>
            {grande && !fonteImagemReal ? null : (
              <Text style={[e.significado, { color: cores.textSecondary }]}>{tr(item.significado)}</Text>
            )}
            <Text style={[e.conduta, { color: cores.critical }]}>{tr(item.conduta)}</Text>
          </>
        );
        const estiloCartao = [
          e.cartao,
          grande && !fonteImagemReal ? e.cartaoGrande : null,
          fonteImagemReal ? e.cartaoImagemReal : null,
          { backgroundColor: cores.surface, borderColor: cores.border },
          sel ? { borderColor: cores.critical, borderWidth: 2 } : null,
        ];
        if (onSelect && item.optionId) {
          return (
            <Pressable
              key={item.figura}
              accessibilityRole="button"
              accessibilityLabel={tr(item.rotulo)}
              onPress={() => onSelect(item.optionId!)}
              style={({ pressed }) => [...estiloCartao, pressed && e.cartaoPressionado]}>
              {conteudo}
            </Pressable>
          );
        }
        return (
          <View key={item.figura} style={estiloCartao}>
            {conteudo}
          </View>
        );
      })}
    </View>
  );
}

const e = StyleSheet.create({
  lista: { gap: ESPACO.sm, marginTop: ESPACO.sm },
  listaGrande: { flexDirection: "row", flexWrap: "wrap" },
  cartao: {
    borderWidth: 1,
    borderRadius: RAIO.card,
    padding: ESPACO.sm,
    gap: 4,
  },
  cartaoGrande: { width: 148, borderWidth: 0 },
  cartaoImagemReal: { width: "100%" },
  cartaoPressionado: { opacity: 0.7 },
  moldura: { width: "100%" },
  molduraImagemReal: { width: "100%", borderRadius: RAIO.card, overflow: "hidden" },
  imagemReal: { width: "100%", height: 150 },
  rotulo: { ...TIPOGRAFIA.caption, fontWeight: "700" },
  significado: TIPOGRAFIA.micro,
  conduta: { ...TIPOGRAFIA.micro, fontWeight: "800" },
});
