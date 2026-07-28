import { StyleSheet, Text, View } from "react-native";

import { Card, ScreenTemplate, Tag } from "../ui-v2";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { useTr } from "../../lib/use-tr";
import { DOMAINS, QUICK_GOALS, type Domain } from "./acls-post-rosc-screen";

/**
 * Cuidados Pós-PCR — versão UI 2.0 (Fase 6).
 *
 * Conteúdo clínico importado de `acls-post-rosc-screen.tsx`.
 *
 * ── Onde a cor ficou, e onde saiu ────────────────────────────────────────────
 *
 * A tela antiga dava um accent próprio a cada domínio (estabilização,
 * ventilação, hemodinâmica, neuro…) e mais uma cor a cada meta rápida — nove
 * tons no total, todos escolhidos à mão. Domínio clínico não é gravidade.
 *
 * A cor ficou onde há sinal de verdade: os itens marcados com `alert: true` nos
 * dados. Esse sinal já existe no conteúdo clínico, não foi inventado aqui, e é
 * ele que aponta o que não pode passar batido depois do ROSC. Com nove tons
 * competindo, esses itens não se destacavam de nada.
 */
function CartaoDeDominio({ domain }: { domain: Domain }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);

  return (
    <Card tom="primary" style={e.cartao}>
      <View style={e.cabecalho}>
        <Text style={e.icone}>{domain.icon}</Text>
        <View style={e.tituloBloco}>
          <Text style={e.titulo}>{tr(domain.title)}</Text>
          <Text style={e.subtitulo}>{tr(domain.subtitle)}</Text>
        </View>
      </View>

      <View style={e.itens}>
        {domain.items.map((item) => (
          <View key={item.label} style={[e.item, item.alert && e.itemAlerta]}>
            <View style={e.itemRotuloLinha}>
              {item.alert ? <View style={e.pontoAlerta} /> : null}
              <Text style={[e.itemRotulo, item.alert && e.itemRotuloAlerta]}>
                {tr(item.label)}
              </Text>
            </View>
            <Text style={[e.itemValor, item.alert && e.itemValorAlerta]}>
              {tr(item.value)}
            </Text>
          </View>
        ))}
      </View>

      {domain.note ? (
        <View style={e.nota}>
          <Text style={e.notaTexto}>{tr(domain.note)}</Text>
        </View>
      ) : null}
    </Card>
  );
}

export default function AclsPostRoscScreenV2({ onVoltar }: { onVoltar?: () => void }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);

  return (
    <ScreenTemplate
      titulo={tr("Cuidados Pós-PCR")}
      etapa={tr("Referência")}
      onVoltar={onVoltar}
      testID="tela-pos-pcr-v2"
    >
      <Card style={e.cartaoIntro}>
        <Tag label={tr("ACLS · Referência")} />
        <Text style={e.corpoIntro}>
          {tr(
            "Após o ROSC, a conduta sistemática nos primeiros minutos e horas é determinante para a sobrevida com boa função neurológica. Estabilize, monitore metas e transfira para UTI."
          )}
        </Text>
      </Card>

      {/* Metas imediatas: grade de valores, o formato do painel da Fase 5. */}
      <Card style={e.cartaoMetas}>
        <Text style={e.tituloMetas}>{tr("Metas imediatas")}</Text>
        <View style={e.gradeMetas}>
          {QUICK_GOALS.map((goal) => (
            <View key={goal.label} style={e.meta}>
              <Text style={e.metaRotulo}>{tr(goal.label)}</Text>
              <Text style={e.metaValor}>{goal.value}</Text>
            </View>
          ))}
        </View>
      </Card>

      {DOMAINS.map((domain) => (
        <CartaoDeDominio key={domain.id} domain={domain} />
      ))}

      <Card style={e.cartaoRodape}>
        <Text style={e.tituloRodape}>{tr("Destino: UTI o mais rápido possível")}</Text>
        <Text style={e.corpoRodape}>
          {tr(
            "O paciente pós-PCR reanimado com sucesso precisa de monitorização contínua e suporte multi-orgânico. Comunique ao intensivista: ritmo da PCR, tempo de colapso, tempo de RCP, doses de epinefrina, cardioversões e causa presumida."
          )}
        </Text>
        <View style={e.regua} />
        <Text style={e.fonte}>{tr("Baseado em AHA ACLS 2025")}</Text>
      </Card>
    </ScreenTemplate>
  );
}

const criarEstilos = (t: Tema) => {
  const c = t.cores;
  return StyleSheet.create({
    cartaoIntro: { gap: ESPACO.sm },
    corpoIntro: { ...TIPOGRAFIA.caption, color: c.textSecondary, fontWeight: "400" },

    // ── Metas imediatas ──
    cartaoMetas: { gap: ESPACO.sm },
    // Caixa alta como na versão antiga (goalsTitle) — o teste de paridade
    // compara texto renderizado.
    tituloMetas: {
      ...TIPOGRAFIA.micro,
      color: c.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    gradeMetas: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.md },
    meta: { minWidth: 96, flexGrow: 1, flexBasis: "28%", gap: 2 },
    // Caixa alta como no antigo (goalLabel / itemLabel).
    metaRotulo: {
      ...TIPOGRAFIA.micro,
      color: c.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    metaValor: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "800" },

    // ── Domínio ──
    cartao: { gap: ESPACO.md },
    cabecalho: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.sm },
    icone: { fontSize: 20, lineHeight: 26 },
    tituloBloco: { flex: 1, gap: 2 },
    titulo: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "800" },
    subtitulo: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },

    itens: { gap: ESPACO.sm },
    item: { gap: 2 },
    // Único destaque colorido do cartão, e só quando os DADOS pedem.
    itemAlerta: {
      backgroundColor: `${c.warning}1F`,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: `${c.warning}44`,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.sm,
    },
    itemRotuloLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    pontoAlerta: {
      width: 6,
      height: 6,
      borderRadius: RAIO.badge,
      backgroundColor: c.warning,
    },
    itemRotulo: {
      ...TIPOGRAFIA.micro,
      color: c.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    itemRotuloAlerta: { color: c.warning },
    itemValor: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "400" },
    itemValorAlerta: { fontWeight: "700" },

    nota: {
      borderLeftWidth: 3,
      borderLeftColor: c.border,
      paddingLeft: ESPACO.sm,
    },
    notaTexto: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },

    cartaoRodape: { gap: ESPACO.sm },
    tituloRodape: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "800" },
    corpoRodape: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },
    regua: { height: 1, backgroundColor: c.border },
    fonte: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },
  });
};
