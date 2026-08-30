/**
 * SUPERFÍCIE E · Correções — a tela.
 *
 * ⚠️⚠️ O QUE ESTA TELA ⛔ NÃO PODE FAZER:
 *
 *   ⛔ **dizer que corrigiu.** ⛔ Não existe botão "corrigido" aqui. O bloqueio cai
 *      em D, lendo **uma nova aferição** em Entrada e estabilização.
 *
 *   ⛔ **prescrever.** ⛔ Nenhum fármaco, dose, via ou esquema enquanto F-19 estiver
 *      parcial. A ação é abstrata, e a fonte ⛔ não nomeia fármaco (F-04 item 9).
 *
 *   ⛔ **obrigar sequência.** Quem chegou aqui com o tratamento já correndo
 *      registra `Iniciada` direto — ⛔ sem passar por uma sugestão que o app
 *      ⛔ nunca fez.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ACAO_E, ACOES_DE_CORRECAO } from "../../avc/conteudo/superficie-e";
import { bloqueiosComAcoes } from "../../avc/nucleo/derivacoes-e";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorNaInstancia } from "../../avc/nucleo/instancia";
import { CabecalhoDeBloco, CampoDaSuperficie, useDetalhes } from "./campos-clinicos";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolherNaAcao: (acao: string, campo: string, valor: string) => void;
  onDesfazerNaAcao: (acao: string, campo: string) => void;
  onNovaAcao: (tipo: string) => void;
};

export default function SuperficieE({
  estado,
  agora,
  onEscolherNaAcao,
  onDesfazerNaAcao,
  onNovaAcao,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const detalhes = useDetalhes();
  const blocos = bloqueiosComAcoes(estado);

  return (
    <View style={e.raiz} testID="avc-superficie-e-conteudo">
      {blocos.length === 0 ? (
        <Text style={e.vazio} testID="avc-e-sem-bloqueio">
          {tr("Nenhum bloqueio corrigível registrado. Nada nesta tela espera por ação.")}
        </Text>
      ) : null}

      {blocos.map(({ bloqueio, acoes }) => {
        const acao = ACOES_DE_CORRECAO.find((a) => a.bloqueio === bloqueio.id);
        return (
          <View key={bloqueio.id} style={e.grupo} testID={`avc-e-bloqueio-${bloqueio.id}`}>
            <CabecalhoDeBloco
              titulo={acao?.rotulo ?? bloqueio.id}
              testID={`avc-e-bloco-${bloqueio.id}`}
            />
            {/* ⚠️ Português primeiro, verbatim abaixo — o mesmo contrato de D. */}
            <Text style={e.formulacao} testID={`avc-e-formulacao-${bloqueio.id}`}>
              {tr(bloqueio.formulacao)}
            </Text>
            <Text style={e.verbo} testID={`avc-e-verbo-${bloqueio.id}`}>“{bloqueio.verbo}”</Text>

            {/**
              * ⚠️⚠️ O QUE RESOLVE — e a frase diz **uma nova aferição**, ⛔ não esta
              * tela. Sem ela, registrar a ação pareceria fechar o bloqueio.
              */}
            <Text style={e.resolve} testID={`avc-e-resolve-${bloqueio.id}`}>
              {tr("O que faz este bloqueio cair")}: {tr(bloqueio.resolvePor)} —{" "}
              {tr("registrada em Entrada e estabilização")}
            </Text>

            {/**
              * ⚠️⚠️ CADA AÇÃO É UMA INSTÂNCIA: duas intervenções antes da nova
              * aferição aparecem como **duas**, e ⛔ não uma sobrescrevendo a outra.
              */}
            {acoes.map((a, i) => (
              <View key={a.instancia} style={e.acao} testID={`avc-e-acao-${a.instancia}`}>
                <Text style={e.acaoTitulo}>
                  {tr("Ação")} {i + 1}
                </Text>
                {ACAO_E.filter((c) => c.id === "acao_estado").map((campo) => (
                  <CampoDaSuperficie
                    key={`${a.instancia}-${campo.id}`}
                    campo={{ ...campo, casa: "correcoes" }}
                    casaAtual="correcoes"
                    bruto={String(valorNaInstancia(estado, a.instancia, campo.id)?.valor ?? "")}
                    numero={undefined}
                    agora={agora}
                    detalheAberto={detalhes.aberto(`${a.instancia}-${campo.id}`)}
                    onAlternarDetalhe={() => detalhes.alternar(`${a.instancia}-${campo.id}`)}
                    onEscolher={(c, v) => onEscolherNaAcao(a.instancia, c, v)}
                    onMedir={() => undefined}
                    onHora={() => undefined}
                    onDesfazer={(c) => onDesfazerNaAcao(a.instancia, c)}
                  />
                ))}
              </View>
            ))}

            {acao ? (
              <Pressable
                style={e.novaAcao}
                accessibilityRole="button"
                testID={`avc-e-nova-acao-${bloqueio.id}`}
                onPress={() => onNovaAcao(acao.rotulo)}
              >
                <Text style={e.novaAcaoTexto}>
                  {acoes.length === 0 ? tr("Registrar ação") : tr("Registrar outra ação")}
                </Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    vazio: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },
    grupo: { gap: ESPACO.sm },
    formulacao: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize },
    verbo: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
      fontStyle: "italic",
    },
    resolve: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    acao: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border, padding: ESPACO.sm, gap: ESPACO.xs,
    },
    acaoTitulo: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize, fontWeight: "700",
    },
    novaAcao: {
      alignSelf: "flex-start", paddingHorizontal: ESPACO.md, paddingVertical: ESPACO.sm,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    novaAcaoTexto: {
      color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700",
    },
  });
