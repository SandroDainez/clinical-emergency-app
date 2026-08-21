import { StyleSheet, Text, View } from "react-native";

import type { ProcedenciaDaConduta } from "../../core/decision-tree/types";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useTheme } from "../../design-system/theme";
import { useTr } from "../../lib/use-tr";

/**
 * SELO DE FORÇA — os três níveis de afirmação, visivelmente diferentes.
 *
 * ── ⚠️ POR QUE ELE NÃO É OPCIONAL ──────────────────────────────────────────
 *
 * O campo `forca` só serve se a tela mostrar. Se uma conduta Classe 1 Nível A e
 * um adjuvante de plausibilidade fisiológica renderizam igual, o campo virou
 * metadado que só o desenvolvedor vê — e o usuário sem experiência continua sem
 * ter como distinguir os dois, que era o defeito.
 *
 * ── COMO OS TRÊS SE SEPARAM, SEM PALETA NOVA ───────────────────────────────
 *
 * Peso e cor do design system, na ordem da força:
 *
 *   recomendacao_formal    borda cheia · cor `primary`   · classe/grau na etiqueta
 *   pratica_aceita         borda cheia · `textSecondary` · tipo do documento
 *   mecanismo_fisiologico  borda + fundo `warning`       · lacuna de evidência
 *
 * ⚠️ A LACUNA DE EVIDÊNCIA APARECE JUNTO DA AÇÃO, não atrás de um toque. É a
 * informação que muda o peso do que se está prestes a fazer — esconder atrás de
 * um acordeão é o mesmo que não ter.
 *
 * ⚠️ E `contextoDaFonte` aparece SEMPRE que existir: ele é a marca de que a
 * fonte foi tomada de outro cenário. É o campo que existe por causa do pH < 7,0
 * da cetoacidose e do 126 mg/dL do diagnóstico de diabetes.
 */
/**
 * ⚠️ `afirmacao` — QUAL DAS AFIRMAÇÕES DA TELA ESTE SELO COBRE.
 *
 * Só aparece quando a tela declara mais de uma (ver `DeclaracaoDeAfirmacao`).
 * Sem ele, dois selos empilhados sob quatro ações não dizem qual cobre qual — e
 * um selo que o leitor atribui à ação errada é pior que selo nenhum: ele
 * empresta força para a linha que não a tem.
 */
export default function SeloDeForca({
  procedencia,
  afirmacao,
}: {
  procedencia?: ProcedenciaDaConduta;
  afirmacao?: string;
}) {
  const tr = useTr();
  const { cores } = useTheme();

  if (!procedencia) return null;

  const { forca, fonte, classeOuGrau, tipoDeDocumento, lacunaDeEvidencia, contextoDaFonte } =
    procedencia;

  const rotulo =
    forca === "recomendacao_formal"
      ? tr("RECOMENDAÇÃO FORMAL")
      : forca === "pratica_aceita"
        ? tr("PRÁTICA ACEITA")
        : forca === "definicao"
          ? tr("DEFINIÇÃO")
          : tr("MECANISMO FISIOLÓGICO");

  const corDaMarca =
    forca === "recomendacao_formal" || forca === "definicao"
      ? cores.primary
      : forca === "pratica_aceita"
        ? cores.textSecondary
        : cores.warning;

  // ⚠️ NA DEFINIÇÃO O DETALHE É A VERSÃO, não a classe: definição não se gradua,
  // e o que envelhece nela é a versão adotada.
  const detalhe =
    forca === "recomendacao_formal"
      ? classeOuGrau
      : forca === "pratica_aceita"
        ? tipoDeDocumento
        : forca === "definicao"
          ? procedencia.versao
          : undefined;

  return (
    <View
      style={[
        e.caixa,
        {
          borderColor: corDaMarca,
          // Só o nível mais fraco ganha fundo: é o que precisa ser notado sem ser lido.
          backgroundColor: forca === "mecanismo_fisiologico" ? cores.surface : "transparent",
        },
      ]}>
      {afirmacao ? (
        <Text style={[e.afirmacao, { color: cores.textSecondary }]} numberOfLines={2}>
          {tr(afirmacao)}
        </Text>
      ) : null}
      <View style={e.linha}>
        <Text style={[e.rotulo, { color: corDaMarca }]}>{rotulo}</Text>
        {detalhe ? (
          <Text style={[e.detalhe, { color: cores.textSecondary }]}>{tr(detalhe)}</Text>
        ) : null}
      </View>
      <Text style={[e.fonte, { color: cores.textSecondary }]}>{tr(fonte)}</Text>
      {lacunaDeEvidencia ? (
        <Text style={[e.lacuna, { color: cores.warning }]}>{tr(lacunaDeEvidencia)}</Text>
      ) : null}
      {contextoDaFonte ? (
        <Text style={[e.contexto, { color: cores.warning }]}>{tr(contextoDaFonte)}</Text>
      ) : null}
    </View>
  );
}

const e = StyleSheet.create({
  caixa: {
    borderWidth: 1,
    borderRadius: RAIO.input,
    paddingHorizontal: ESPACO.sm,
    paddingVertical: 6,
    gap: 2,
    marginTop: ESPACO.xs,
  },
  afirmacao: { ...TIPOGRAFIA.micro, fontStyle: "italic", marginBottom: 2 },
  linha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs, flexWrap: "wrap" },
  rotulo: { ...TIPOGRAFIA.micro, letterSpacing: 0.6 },
  detalhe: { ...TIPOGRAFIA.micro, fontWeight: "600" },
  fonte: { ...TIPOGRAFIA.micro, fontWeight: "500" },
  lacuna: { ...TIPOGRAFIA.micro, fontWeight: "700" },
  contexto: { ...TIPOGRAFIA.micro, fontWeight: "700" },
});
