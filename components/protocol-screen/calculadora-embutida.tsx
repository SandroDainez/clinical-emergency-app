import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CALC_TOOLS, type ScoreTool } from "../../clinical-calculators-engine";
import { useTr } from "../../lib/use-tr";

/**
 * Calculadora de escore EMBUTIDA num passo do fluxo, recolhida por padrão.
 *
 * ── POR QUE ELA EXISTE ───────────────────────────────────────────────────────
 *
 * O passo do AVC pedia o NIHSS e mandava o usuário abrir "Calculadoras
 * clínicas" para obtê-lo. O relato foi direto: "não adianta ter assim, tem que
 * ter a calculadora recolhível para o usuário, ele não sabe o NIHSS".
 *
 * Mandar alguém sair do fluxo no meio de uma emergência para buscar um número
 * em outro módulo é, na prática, travar o fluxo. Quem não sabe o escore
 * abandona o passo; quem sabe não precisava do desvio.
 *
 * Agora o próprio passo abre a calculadora, item a item, e escreve o total no
 * campo. O fluxo não é interrompido e nada precisa ser decorado.
 *
 * ── POR QUE GENÉRICA ─────────────────────────────────────────────────────────
 *
 * O pedido veio pelo NIHSS mas vale "para todos os tipos de calculadora". Este
 * componente recebe o ID de qualquer escore já registrado em
 * clinical-calculators-engine e monta a interface a partir das `vars` dele.
 *
 * Isso significa UMA fonte para cada escore: os pesos usados aqui são os mesmos
 * que a tela de calculadoras usa e que o script de invariantes confere contra a
 * publicação primária. Não há cópia de tabela de pontos — se houvesse, um dia as
 * duas divergiriam.
 *
 * Só escores (`kind: "score"`) entram: fórmulas como clearance e osmolalidade
 * pedem valores digitados, não escolhas, e não se resolvem com esta interface.
 */
export default function CalculadoraEmbutida({
  calculadoraId,
  onTotal,
  valorAtual,
}: {
  calculadoraId: string;
  /** Recebe o total sempre que o usuário muda uma resposta. */
  onTotal: (total: number) => void;
  /** Valor já gravado no campo, para o rodapé confirmar o que foi lançado. */
  valorAtual?: string;
}) {
  const tr = useTr();
  // NIHSS é parte do exame neurológico agudo e não deve parecer um recurso
  // opcional escondido. Ele abre por padrão; os demais escores continuam
  // recolhidos para não poluir outros fluxos.
  const [aberta, setAberta] = useState(calculadoraId === "nihss");
  const [respostas, setRespostas] = useState<Record<string, number>>({});

  const escore = useMemo(() => {
    const achada = CALC_TOOLS.find((c) => c.id === calculadoraId);
    return achada && achada.kind === "score" ? (achada as ScoreTool) : undefined;
  }, [calculadoraId]);

  if (!escore) return null;

  const respondidas = escore.vars.filter((v) => respostas[v.id] !== undefined).length;
  const completa = respondidas === escore.vars.length;
  const total = escore.vars.reduce((soma, v) => soma + (respostas[v.id] ?? 0), 0);
  const leitura = completa ? escore.interpret(total) : undefined;

  return (
    <View style={s.bloco} testID={`calculadora-${escore.id}`}>
      <Pressable
        onPress={() => setAberta((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberta }}
        testID={`calculadora-${escore.id}-alternar`}
        style={s.alternador}>
        <View style={{ flex: 1 }}>
          <Text style={s.alternadorTitulo}>
            {aberta
              ? `${tr("Fechar a calculadora")} ▴`
              : `${tr("Não sei o valor — calcular aqui")} ▾`}
          </Text>
          <Text style={s.alternadorSub}>
            {escore.name} · {escore.vars.length} {tr("itens")} · {escore.totalRange}
          </Text>
        </View>
      </Pressable>

      {aberta ? (
        <View style={s.corpo}>
          <Text style={s.aviso}>
            {tr(
              "Responda item por item. O total é lançado no campo automaticamente — não precisa somar nada.",
            )}
          </Text>

          {escore.vars.map((v) => (
            <View key={v.id} style={s.item}>
              <Text style={s.itemRotulo}>{tr(v.label)}</Text>
              {v.help ? <Text style={s.itemAjuda}>{tr(v.help)}</Text> : null}
              <View style={s.opcoes}>
                {v.options.map((o) => {
                  const ativa = respostas[v.id] === o.points;
                  return (
                    <Pressable
                      key={`${v.id}-${o.label}`}
                      onPress={() => {
                        const novas = { ...respostas, [v.id]: o.points };
                        setRespostas(novas);
                        const faltando = escore.vars.some((x) => novas[x.id] === undefined);
                        if (!faltando) {
                          onTotal(escore.vars.reduce((sm, x) => sm + (novas[x.id] ?? 0), 0));
                        }
                      }}
                      style={({ pressed }) => [
                        s.opcao,
                        ativa && s.opcaoAtiva,
                        pressed && { opacity: 0.85 },
                      ]}>
                      <Text style={[s.opcaoTexto, ativa && s.opcaoTextoAtiva]}>
                        {tr(o.label)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          <View style={s.rodape}>
            {completa ? (
              <>
                <Text style={s.totalRotulo}>{tr("Total")}</Text>
                <Text style={s.totalValor}>{total}</Text>
                {leitura ? <Text style={s.leitura}>{tr(leitura.label)}</Text> : null}
                {valorAtual !== undefined ? (
                  <Text style={s.lancado}>
                    {tr("Lançado no campo")}: {valorAtual}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={s.parcial}>
                {respondidas}/{escore.vars.length} {tr("itens respondidos")} —{" "}
                {tr("o total é lançado quando todos estiverem preenchidos")}
              </Text>
            )}
          </View>

          <Text style={s.fonte}>{escore.reference}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  bloco: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#565e6c",
    backgroundColor: "#2f3542",
    overflow: "hidden",
  },
  alternador: { paddingHorizontal: 14, paddingVertical: 12, minHeight: 44, justifyContent: "center" },
  alternadorTitulo: { fontSize: 14, fontWeight: "800", color: "#7fb3ff" },
  alternadorSub: { fontSize: 11.5, fontWeight: "600", color: "#aab6c6", marginTop: 2 },

  corpo: { paddingHorizontal: 14, paddingBottom: 14, gap: 14, borderTopWidth: 1, borderTopColor: "#565e6c", paddingTop: 12 },
  aviso: { fontSize: 12.5, lineHeight: 18, color: "#aab6c6", fontWeight: "500" },

  item: { gap: 6 },
  itemRotulo: { fontSize: 13.5, fontWeight: "700", color: "#f1f5f9", lineHeight: 19 },
  itemAjuda: { fontSize: 12, lineHeight: 17, color: "#aab6c6" },
  opcoes: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  opcao: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#565e6c",
    backgroundColor: "#383e4a",
  },
  opcaoAtiva: { backgroundColor: "#1d4ed8", borderColor: "#1d4ed8" },
  opcaoTexto: { fontSize: 13, fontWeight: "700", color: "#cbd5e1" },
  opcaoTextoAtiva: { color: "#f8fafc" },

  rodape: {
    borderTopWidth: 1,
    borderTopColor: "#565e6c",
    paddingTop: 12,
    gap: 2,
  },
  totalRotulo: { fontSize: 10.5, fontWeight: "800", color: "#aab6c6", letterSpacing: 1, textTransform: "uppercase" },
  totalValor: { fontSize: 30, fontWeight: "800", color: "#f1f5f9", letterSpacing: -0.5 },
  leitura: { fontSize: 13, fontWeight: "700", color: "#7fb3ff", lineHeight: 19 },
  lancado: { fontSize: 12, fontWeight: "600", color: "#aab6c6", marginTop: 4 },
  parcial: { fontSize: 12.5, lineHeight: 18, color: "#aab6c6", fontWeight: "600" },

  fonte: { fontSize: 10.5, lineHeight: 15, color: "#8b97a8", fontWeight: "500" },
});
