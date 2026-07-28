import { StyleSheet, Text, View } from "react-native";

import { Card, ScreenTemplate, Tag } from "../ui-v2";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { useTr } from "../../lib/use-tr";
import { DRUGS, type Drug } from "./acls-pharmacology-screen";

/**
 * Farmacologia no ACLS — versão UI 2.0 (Fase 6).
 *
 * Conteúdo clínico importado de `acls-pharmacology-screen.tsx`, não copiado.
 *
 * ── Decisão de cor que vale registrar ────────────────────────────────────────
 *
 * A tela antiga pintava cada droga com uma de cinco cores de categoria
 * (`#6ee7b7`, `#93c5fd`, `#c4b5fd`, `#fca5a5`, `#fdba74`), escolhidas à mão e sem
 * significado clínico — categoria farmacológica não é gravidade.
 *
 * Aqui a categoria virou `Tag`, que é neutra por definição: o próprio componente
 * documenta que "se toda etiqueta tiver cor, a cor deixa de significar alguma
 * coisa". A cor ficou reservada para o que É sinal — o bloco de atenção usa
 * `warning`, e agora ele salta de verdade, em vez de competir com cinco tons
 * decorativos.
 *
 * Isso é diferente do que fiz nos Ritmos de Parada, onde os dois grupos recebem
 * `critical` e `primary`: ali a distinção é clínica (chocável vs não chocável) e
 * define a conduta imediata. Aqui não é.
 */
function CartaoDeDroga({ drug }: { drug: Drug }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);

  return (
    <Card tom="primary" style={e.cartao}>
      <View style={e.cabecalho}>
        <View style={e.nomes}>
          <Text style={e.nome}>{tr(drug.name)}</Text>
          {drug.genericName ? (
            <Text style={e.generico}>{tr(drug.genericName)}</Text>
          ) : null}
        </View>
        <Tag label={tr(drug.category)} />
      </View>

      <View style={e.blocoIndicacao}>
        <Text style={e.rotuloBloco}>{tr("Indicação no ACLS")}</Text>
        <Text style={e.textoIndicacao}>{tr(drug.indication)}</Text>
      </View>

      <View style={e.secao}>
        <Text style={e.tituloSecao}>{tr("Dose")}</Text>
        <View style={e.tabelaDose}>
          {drug.dose.map((d) => (
            <View key={d.label} style={e.linhaDose}>
              <Text style={e.rotuloDose}>{tr(d.label)}</Text>
              <Text style={e.valorDose}>{tr(d.value)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={e.secao}>
        <Text style={e.tituloSecao}>{tr("Quando usar")}</Text>
        <View style={e.lista}>
          {drug.whenToUse.map((item, i) => (
            <View key={i} style={e.linhaPonto}>
              <View style={e.marcador} />
              <Text style={e.textoPonto}>{tr(item)}</Text>
            </View>
          ))}
        </View>
      </View>

      {drug.caution ? (
        <View style={e.blocoAtencao}>
          <Text style={e.rotuloAtencao}>{tr("⚠ Atenção")}</Text>
          <Text style={e.textoAtencao}>{tr(drug.caution)}</Text>
        </View>
      ) : null}

      {drug.source ? <Text style={e.fonte}>{tr(drug.source)}</Text> : null}
    </Card>
  );
}

export default function AclsPharmacologyScreenV2({ onVoltar }: { onVoltar?: () => void }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);

  return (
    <ScreenTemplate
      titulo={tr("Farmacologia no ACLS")}
      etapa={tr("Referência")}
      onVoltar={onVoltar}
      testID="tela-farmacologia-v2"
    >
      <Card style={e.cartaoIntro}>
        <Tag label={tr("ACLS · Referência")} />
        <Text style={e.corpoIntro}>
          {tr(
            "Drogas de emergência organizadas por indicação clínica. Use como consulta rápida durante o atendimento — dose, via e momento certo de administração."
          )}
        </Text>
        {/* Índice das drogas da tela. NÃO usa `Tag`: ela deixa o texto em caixa
            alta por definição, e aqui o nome da droga deve ler igual ao título do
            cartão logo abaixo — a versão antiga também não usava maiúscula. */}
        <View style={e.atalhos}>
          {DRUGS.map((d) => (
            <View key={d.id} style={e.atalho}>
              <Text style={e.atalhoTexto}>{tr(d.name)}</Text>
            </View>
          ))}
        </View>
      </Card>

      {DRUGS.map((drug) => (
        <CartaoDeDroga key={drug.id} drug={drug} />
      ))}

      <Card style={e.cartaoRodape}>
        <Text style={e.tituloRodape}>{tr("Lidocaína — alternativa à amiodarona")}</Text>
        <Text style={e.corpoRodape}>
          {tr("Quando amiodarona não estiver disponível: ")}
          <Text style={e.destaque}>{tr("1–1,5 mg/kg IV/IO")}</Text>
          {tr(" em bolus para FV/TV sp refratária. 2ª dose: 0,5–0,75 mg/kg. Dose máx: 3 mg/kg.")}
        </Text>
        <View style={e.regua} />
        <Text style={e.tituloRodape}>{tr("Magnésio — Torsades de Pointes")}</Text>
        <Text style={e.corpoRodape}>
          {tr("TV polimórfica com intervalo QT longo (Torsades): ")}
          <Text style={e.destaque}>{tr("1–2 g IV/IO")}</Text>
          {tr(" em bolus diluído. NÃO substitui a amiodarona para FV/TV monomórfica.")}
        </Text>
        <View style={e.regua} />
        <Text style={e.fonte}>{tr("Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025)")}</Text>
      </Card>
    </ScreenTemplate>
  );
}

const criarEstilos = (t: Tema) => {
  const c = t.cores;
  return StyleSheet.create({
    cartaoIntro: { gap: ESPACO.sm },
    corpoIntro: { ...TIPOGRAFIA.caption, color: c.textSecondary, fontWeight: "400" },
    atalhos: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    atalho: {
      paddingHorizontal: ESPACO.sm,
      paddingVertical: 2,
      borderRadius: RAIO.badge,
      borderWidth: 1,
      borderColor: `${c.primary}44`,
      backgroundColor: `${c.primary}1F`,
    },
    atalhoTexto: { ...TIPOGRAFIA.micro, color: c.primary },

    cartao: { gap: ESPACO.md },
    cabecalho: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.sm },
    nomes: { flex: 1, gap: 2 },
    nome: { ...TIPOGRAFIA.step, color: c.text },
    generico: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },

    blocoIndicacao: {
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: `${c.primary}44`,
      backgroundColor: `${c.primary}1F`,
      padding: ESPACO.md,
      gap: ESPACO.xs,
    },
    rotuloBloco: {
      ...TIPOGRAFIA.micro,
      color: c.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    textoIndicacao: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "400" },

    secao: { gap: ESPACO.xs },
    tituloSecao: {
      ...TIPOGRAFIA.micro,
      color: c.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    tabelaDose: { gap: ESPACO.xs },
    linhaDose: { flexDirection: "row", alignItems: "baseline", gap: ESPACO.sm },
    rotuloDose: { ...TIPOGRAFIA.micro, color: c.textSecondary, minWidth: 84 },
    valorDose: { flex: 1, ...TIPOGRAFIA.caption, color: c.text, fontWeight: "700" },

    lista: { gap: ESPACO.xs },
    linhaPonto: { flexDirection: "row", alignItems: "baseline", gap: ESPACO.sm },
    marcador: { width: 6, height: 6, borderRadius: RAIO.badge, backgroundColor: c.primary },
    textoPonto: { flex: 1, ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },

    // Único bloco colorido do cartão — e por isso ele é visto.
    blocoAtencao: {
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: `${c.warning}55`,
      backgroundColor: `${c.warning}1F`,
      padding: ESPACO.md,
      gap: ESPACO.xs,
    },
    // Caixa alta vem da versão antiga: o teste de paridade compara o texto
    // RENDERIZADO, e textTransform muda o que se lê na tela.
    rotuloAtencao: {
      ...TIPOGRAFIA.micro,
      color: c.warning,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    textoAtencao: { ...TIPOGRAFIA.micro, color: c.text, fontWeight: "400" },

    fonte: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },

    cartaoRodape: { gap: ESPACO.sm },
    tituloRodape: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "800" },
    corpoRodape: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },
    destaque: { fontWeight: "700", color: c.text },
    regua: { height: 1, backgroundColor: c.border },
  });
};
