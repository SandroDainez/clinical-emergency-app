/**
 * SUPERFÍCIE B · Neurológico — a tela.
 *
 * ⛔ NENHUMA medicina nasce aqui. Campos vêm de `avc/conteudo/superficie-b.ts`,
 * leituras vêm de `avc/nucleo/derivacoes-b.ts`, e esta camada só desenha (E-29).
 *
 * ⚠️⚠️ O QUE ESTA TELA NÃO PODE FAZER, e por quê:
 *
 *   ⛔ **cobrar preenchimento.** A decomposição é apoio, e a fonte diz que
 *      atrasar a trombólise depois de determinado que o déficit é incapacitante
 *      é potencialmente prejudicial (**R3.10**, 🚫 do Bloco 3). ⛔ Não há campo
 *      obrigatório, ⛔ não há barra de progresso, ⛔ não há "faltam N".
 *
 *   ⛔ **usar o NIHSS como porta.** ⛔ Nenhum bloco aparece, some, habilita ou
 *      desabilita em função do escore — nem o quadro cuja população declarada é
 *      NIHSS 0–5. O que a fonte ⛔ não diz sobre escores maiores é **D-1**, e
 *      inventar o filtro seria escrever a regra que falta.
 *
 *   ⛔ **concluir.** A leitura é intermediária (**E-46**); quem decide é o médico,
 *      no bloco de decisão, e divergir ⛔ não é erro.
 */
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GRUPOS_B, TODOS_OS_CAMPOS_B } from "../../avc/conteudo/superficie-b";
import { derivadoDaEscala, leiturasDaSuperficieB } from "../../avc/nucleo/derivacoes-b";
import { CAMPO_DE_ITEM, ITENS_NIHSS } from "../../avc/conteudo/nihss";
import CampoDeEscala from "./campo-de-escala";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorAtual } from "../../avc/nucleo/estado";
import {
  CabecalhoDeBloco,
  CampoDeEscolha,
  CampoDeGrandeza,
  PainelDeLeituras,
  useDetalhes,
} from "./campos-clinicos";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, TIPOGRAFIA } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

type Props = {
  estado: EstadoAvc;
  onEscolher: (campo: string, valor: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onDesfazer: (campo: string) => void;
  /** ⚠️ A escala inteira num gesto: um fato por item, mais o total (§3.1). */
  onEscala: (pontos: Record<string, number>, total: number) => void;
};

export default function SuperficieB({
  estado,
  onEscolher,
  onMedir,
  onDesfazer,
  onEscala,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  /**
   * ⚠️ Quais blocos recolhidos foram abertos. ⚠️ Estado de TELA — ⛔ não clínico:
   * abrir e fechar bloco ⛔ não registra nem apaga nada (E-20).
   */
  const [abertos, setAbertos] = useState<readonly string[]>([]);
  const leituras = leiturasDaSuperficieB(estado);
  const detalhes = useDetalhes();

  const rotuloDoCampo = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of TODOS_OS_CAMPOS_B) m[c.id] = c.rotulo;
    return m;
  }, []);

  function numeroGravado(id: string): number | undefined {
    const f = valorAtual(estado, id);
    return typeof f?.valor === "number" ? f.valor : undefined;
  }

  return (
    <View style={e.raiz} testID="avc-superficie-b-conteudo">
      {GRUPOS_B.map((grupo) => {
        const fechado = grupo.recolhido === true && !abertos.includes(grupo.id);
        return (
        <View key={grupo.id} style={e.grupo} testID={`avc-grupo-${grupo.id}`}>
          {grupo.recolhido ? (
            /**
             * ⚠️ O bloco de exceção se anuncia e fica fechado. ⛔ O cabeçalho ⛔ não
             * mente sobre o que guarda: quem precisa do dado de fora sabe onde
             * ele está, e quem está examinando o paciente ⛔ não tropeça nele.
             */
            <Pressable
              accessibilityRole="button"
              aria-expanded={!fechado}
              testID={`avc-bloco-abrir-${grupo.id}`}
              onPress={() =>
                setAbertos((a) =>
                  a.includes(grupo.id) ? a.filter((x) => x !== grupo.id) : [...a, grupo.id]
                )
              }
            >
              <CabecalhoDeBloco titulo={grupo.titulo} testID={`avc-bloco-${grupo.id}`} />
            </Pressable>
          ) : (
            <CabecalhoDeBloco titulo={grupo.titulo} testID={`avc-bloco-${grupo.id}`} />
          )}
          {/**
           * ⚠️ A NOTA DO BLOCO É PERMANENTE, ⛔ não fica atrás do ⓘ — e a razão é
           * de fidelidade: ela carrega o hedge da fonte ("orientação", "podem
           * não ser", "considerando as circunstâncias individuais"). Escondida,
           * o quadro seria lido como critério, que é exatamente o que E-45 e a
           * Table 4 proíbem.
           */}
          {grupo.nota ? (
            <Text style={e.grupoNota} testID={`avc-grupo-nota-${grupo.id}`}>
              {tr(grupo.nota)}
            </Text>
          ) : null}
          {fechado ? null : (
          <>
          {grupo.campos.map((campo) =>
            campo.tipo === "escala" ? (
              <CampoDeEscala
                key={campo.id}
                campo={campo}
                total={numeroGravado(campo.id)}
                pontos={Object.fromEntries(
                  ITENS_NIHSS.map((v) => [v.id, numeroGravado(CAMPO_DE_ITEM(v.id))]).filter(
                    ([, p]) => p !== undefined
                  ) as [string, number][]
                )}
                detalheAberto={detalhes.aberto(campo.id)}
                onAlternarDetalhe={() => detalhes.alternar(campo.id)}
                onRegistrarEscala={onEscala}
                onDesfazer={onDesfazer}
              />
            ) : campo.tipo === "grandeza" ? (
              <CampoDeGrandeza
                key={campo.id}
                campo={campo}
                gravado={numeroGravado(campo.id)}
                detalheAberto={detalhes.aberto(campo.id)}
                onAlternarDetalhe={() => detalhes.alternar(campo.id)}
                onMedir={onMedir}
                onDesfazer={onDesfazer}
              />
            ) : (
              <CampoDeEscolha
                key={campo.id}
                campo={campo}
                bruto={String(valorAtual(estado, campo.id)?.valor ?? "")}
                derivado={derivadoDaEscala(estado, campo.id)}
                // ⚠️ Descritor de escala se lê empilhado, ⛔ não em chip.
                empilhado={campo.tipo === "grau"}
                detalheAberto={detalhes.aberto(campo.id)}
                onAlternarDetalhe={() => detalhes.alternar(campo.id)}
                onEscolher={onEscolher}
                onDesfazer={onDesfazer}
              />
            )
          )}
          </>
          )}
        </View>
        );
      })}

      <PainelDeLeituras
        leituras={leituras}
        rotuloDoCampo={rotuloDoCampo}
        detalheAberto={detalhes.aberto}
        onAlternarDetalhe={detalhes.alternar}
      />
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    grupo: { gap: ESPACO.xs },
    grupoTitulo: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "700", letterSpacing: 1, marginTop: ESPACO.xs,
    },
    grupoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
  });
