/**
 * CAMPO DE ESCALA — o instrumento aberto e preenchido item a item.
 *
 * ── O PEDIDO QUE ORIGINOU (autor, 2026-08-29) ──────────────────────────────
 *
 * *"Essa escala o usuário não sabe, tem que ser clicável para abrir e
 * preencher."* Pedir o TOTAL pressupõe que alguém o calculou noutro lugar — e
 * no plantão isso significa ou não preencher, ou chutar.
 *
 * ⚠️⚠️ A DEFINIÇÃO DOS ITENS ⛔ NÃO NASCE AQUI. Ela vem da calculadora, com fonte
 * (Brott 1989 + adaptação brasileira de Pontes-Neto), via `avc/conteudo/nihss`.
 * Esta camada só desenha (E-29) — e ⛔ não conhece um único corte clínico.
 *
 * ⚠️⚠️ O `help` DA ESCALA FICA ATRÁS DO ⓘ DO ITEM (2026-08-29) — relato do
 * autor: *"no NIHSS ainda tem explicações confusas"*.
 *
 * ── O QUE ESTAVA EMPILHADO EM CADA ITEM ────────────────────────────────────
 *
 *   1. o rótulo, às vezes abreviado ("NC — perguntas");
 *   2. a linha de COMO TESTAR, que eu acrescentei;
 *   3. o `help` da calculadora — regra de PONTUAÇÃO, em taquigrafia com setas
 *      ("Afasia ou estupor que impede compreender as perguntas → 2").
 *
 * Duas linhas secundárias seguidas, uma delas dizendo quase o mesmo que a outra
 * (em 5a, "manter o braço por 10 s" e "Braço a 90° sentado… por 10 s"), e a
 * terceira falando de PONTOS quando o médico ainda está tentando entender o que
 * medir. ⛔ Isso ⛔ não é explicar: é competir consigo mesmo.
 *
 * ⚠️ AGORA: visível fica **como se testa**; a regra de pontuação fica a um toque,
 * no ⓘ do próprio item. ⛔ Ela ⛔ não sumiu — e ⛔ não podia sumir: "coma pontua 2 na
 * sensibilidade e 3 na linguagem" muda o total, e ⛔ ninguém adivinha pelo rótulo.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Campo } from "../../avc/conteudo/campo";
import { CAMPO_DE_ITEM, ITENS_NIHSS } from "../../avc/conteudo/nihss";
import { comoAvaliarItem, oQueAvaliaItem } from "../../avc/conteudo/explicacoes";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { BotaoDeInfo, DetalheDoCampo } from "./campos-clinicos";

type Props = {
  campo: Campo;
  /** O total já registrado, venha da escala ou de fora dela. */
  total: number | undefined;
  /** A pontuação por item já registrada. ⚠️ Vazio ⛔ não é zero. */
  pontos: Readonly<Record<string, number>>;
  detalheAberto: boolean;
  onAlternarDetalhe: () => void;
  /** Grava a escala inteira: um fato por item, mais o total. */
  onRegistrarEscala: (pontos: Record<string, number>, total: number) => void;
  onDesfazer: (campo: string) => void;
};

export default function CampoDeEscala({
  campo,
  total,
  pontos,
  detalheAberto,
  onAlternarDetalhe,
  onRegistrarEscala,
  onDesfazer,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const [aberta, setAberta] = useState(false);
  /**
   * ⚠️ RASCUNHO: a escala inteira é um gesto só. Gravar item a item encheria a
   * trilha de estados intermediários de um exame que ainda está acontecendo —
   * e o total de um NIHSS pela metade ⛔ não é um NIHSS.
   */
  const [rascunho, setRascunho] = useState<Record<string, number>>({});
  /** Quais regras de pontuação estão abertas. ⚠️ Fechadas por padrão. */
  const [regrasAbertas, setRegrasAbertas] = useState<readonly string[]>([]);

  const emEdicao = { ...pontos, ...rascunho };
  const respondidos = ITENS_NIHSS.filter((v) => emEdicao[v.id] !== undefined).length;
  const completa = respondidos === ITENS_NIHSS.length;
  const parcial = ITENS_NIHSS.reduce((s, v) => s + (emEdicao[v.id] ?? 0), 0);

  return (
    <View style={[e.campo, total !== undefined && e.campoRespondido]} testID={`avc-campo-${campo.id}`}>
      <View style={e.topo}>
        <Text style={[e.marca, total !== undefined && e.marcaAtiva]} accessibilityElementsHidden>
          {total !== undefined ? "✓" : "○"}
        </Text>
        <Text style={e.rotulo}>{tr(campo.rotulo)}</Text>
        <BotaoDeInfo id={campo.id} onPress={onAlternarDetalhe} />
      </View>

      {detalheAberto ? <DetalheDoCampo campo={campo} /> : null}

      <View style={e.linhaDoValor}>
        <Text style={[e.valor, total === undefined && e.valorAusente]} testID={`avc-escala-valor-${campo.id}`}>
          {total === undefined ? tr("não informado") : String(total)}
        </Text>
        <Pressable
          style={e.acao}
          accessibilityRole="button"
          testID={`avc-escala-abrir-${campo.id}`}
          onPress={() => setAberta((v) => !v)}
        >
          <Text style={e.acaoTexto}>
            {aberta ? tr("Fechar escala") : total === undefined ? tr("Abrir escala") : tr("Refazer escala")}
          </Text>
        </Pressable>
        {total !== undefined ? (
          <Pressable
            style={e.acao}
            accessibilityRole="button"
            testID={`avc-limpar-${campo.id}`}
            onPress={() => {
              setRascunho({});
              onDesfazer(campo.id);
            }}
          >
            <Text style={e.acaoTexto}>{tr("Limpar")}</Text>
          </Pressable>
        ) : null}
      </View>

      {aberta ? (
        <View style={e.escala} testID={`avc-escala-${campo.id}`}>
          {ITENS_NIHSS.map((item) => (
            <View key={item.id} style={e.item} testID={`avc-escala-item-${item.id}`}>
              <View style={e.itemTopo}>
                <Text style={e.itemRotulo}>{tr(item.label)}</Text>
                {item.help ? (
                  <Pressable
                    style={e.itemInfo}
                    accessibilityRole="button"
                    aria-expanded={regrasAbertas.includes(item.id)}
                    accessibilityLabel={tr("Regra de pontuação")}
                    testID={`avc-regra-abrir-${item.id}`}
                    onPress={() =>
                      setRegrasAbertas((r) =>
                        r.includes(item.id) ? r.filter((x) => x !== item.id) : [...r, item.id]
                      )
                    }
                  >
                    <Text style={e.itemInfoTexto}>ⓘ</Text>
                  </Pressable>
                ) : null}
              </View>
              {/**
                * ⚠️ O QUE O ITEM AVALIA — vem ANTES da manobra, porque quem ⛔ não
                * usa a escala todo dia precisa saber o que está medindo antes de
                * saber como medir.
                */}
              {oQueAvaliaItem(item.id) ? (
                <Text style={e.itemOQueAvalia} testID={`avc-o-que-avalia-${item.id}`}>
                  {tr(oQueAvaliaItem(item.id) as string)}
                </Text>
              ) : null}
              {/**
                * ⚠️ COMO SE TESTA, numa linha — das instruções da própria escala.
                * ⚠️ Fica em texto secundário de propósito: a escala já tem 15
                * itens, e explicação em corpo grande devolveria a rolagem que a
                * revisão visual acabou de tirar.
                */}
              {comoAvaliarItem(item.id) ? (
                <Text style={e.itemComoAvaliar} testID={`avc-como-avaliar-${item.id}`}>
                  {tr(comoAvaliarItem(item.id) as string)}
                </Text>
              ) : null}
              {item.help && regrasAbertas.includes(item.id) ? (
                <Text style={e.itemAjuda} testID={`avc-regra-${item.id}`}>
                  {tr(item.help)}
                </Text>
              ) : null}
              <View style={e.opcoes}>
                {item.options.map((o) => {
                  const ativa = emEdicao[item.id] === o.points;
                  return (
                    <Pressable
                      key={o.label}
                      style={[e.opcao, ativa && e.opcaoAtiva]}
                      accessibilityRole="radio"
                      aria-checked={ativa}
                      testID={`avc-escala-opcao-${item.id}-${o.points}`}
                      onPress={() => setRascunho((r) => ({ ...r, [item.id]: o.points }))}
                    >
                      <Text style={[e.opcaoTexto, ativa && e.opcaoTextoAtivo]}>
                        {ativa ? "✓ " : ""}
                        {tr(o.label)} · {o.points}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          <View style={e.rodape}>
            {/**
              * ⚠️ O PARCIAL ⛔ NÃO É O TOTAL, e a tela diz isso: enquanto faltar
              * item, o número é soma do que foi respondido — ⛔ não o escore do
              * paciente. Chamá-lo de NIHSS aqui seria o mesmo defeito da barra
              * que parece medida antes de alguém medir (§0.2).
              */}
            <Text style={e.parcial} testID={`avc-escala-parcial-${campo.id}`}>
              {completa ? tr("Total") : tr("Soma parcial")}: {parcial} · {respondidos}/{ITENS_NIHSS.length}
            </Text>
            <Pressable
              style={[e.confirmar, !completa && e.confirmarInativo]}
              accessibilityRole="button"
              aria-disabled={!completa}
              disabled={!completa}
              testID={`avc-escala-confirmar-${campo.id}`}
              onPress={() => {
                onRegistrarEscala(emEdicao, parcial);
                setRascunho({});
                setAberta(false);
              }}
            >
              <Text style={e.confirmarTexto}>{tr("Confirmar escala")}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    campo: {
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      padding: ESPACO.sm, gap: ESPACO.xs,
      borderWidth: 1, borderColor: tema.cores.border,
      borderLeftWidth: 4, borderLeftColor: tema.cores.border,
    },
    campoRespondido: { borderLeftColor: tema.cores.primary },
    topo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    marca: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize, width: 16, textAlign: "center" },
    marcaAtiva: { color: tema.cores.text, fontWeight: "800" },
    rotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, flex: 1, fontWeight: "600" },

    linhaDoValor: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: ESPACO.sm },
    valor: { color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700", minWidth: 40 },
    valorAusente: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "400", fontStyle: "italic" },
    acao: {
      minHeight: TOQUE.minimo, justifyContent: "center", paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    acaoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },

    escala: { gap: ESPACO.sm, marginTop: ESPACO.xs },
    item: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      padding: ESPACO.sm, gap: ESPACO.xs,
    },
    itemTopo: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.xs },
    itemRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600", flex: 1 },
    itemInfo: {
      minWidth: TOQUE.minimo, minHeight: TOQUE.minimo,
      alignItems: "center", justifyContent: "center",
    },
    itemInfoTexto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },
    itemAjuda: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    itemComoAvaliar: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    /** ⚠️ Um degrau acima da manobra: é o que destrava quem ⛔ não conhece o item. */
    itemOQueAvalia: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    opcoes: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    opcao: {
      paddingVertical: ESPACO.xs, paddingHorizontal: ESPACO.sm,
      minHeight: TOQUE.minimo, justifyContent: "center",
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    opcaoAtiva: { backgroundColor: tema.cores.primary, borderColor: tema.cores.primary },
    opcaoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    opcaoTextoAtivo: { color: tema.cores.onPrimary, fontWeight: "700" },

    rodape: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: ESPACO.sm },
    parcial: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700", flex: 1 },
    confirmar: {
      minHeight: TOQUE.minimo, justifyContent: "center", paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.primary, borderRadius: RAIO.botao,
    },
    confirmarInativo: { opacity: 0.35 },
    confirmarTexto: { color: tema.cores.onPrimary, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700" },
  });
