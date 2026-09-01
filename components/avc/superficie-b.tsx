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
import { camposDoGrupo } from "../../avc/conteudo/campo";
import {
  derivadoDaEscala,
  escalaPreenchida,
  leiturasDaSuperficieB,
  valorEfetivo,
  veioDaEscala,
} from "../../avc/nucleo/derivacoes-b";
import { CAMPO_DE_ITEM, ITENS_NIHSS } from "../../avc/conteudo/nihss";
import CampoDeEscala from "./campo-de-escala";
import {
  LinhaDeAchado,
  Procedencia,
  Recolhido,
  Secao,
  Segmentado,
} from "./ui";
import { definicaoDoAchado } from "../../avc/conteudo/explicacoes";
import { opcoesQueContam } from "../../avc/conteudo/nihss";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorAtual } from "../../avc/nucleo/estado";
import {
  CabecalhoDeBloco,
  CampoDaSuperficie,
  DetalheDoCampo,
  PainelDeLeituras,
  useDetalhes,
} from "./campos-clinicos";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

type Props = {
  estado: EstadoAvc;
  /**
   * ⚠️⚠️ "AGORA" ENTROU AQUI EM 2026-08-29, e o motivo é um DEFEITO, ⛔ não uma
   * conveniência.
   *
   * O comentário anterior dizia que B ⛔ não recebia `agora` porque *"⛔ não há
   * relógio clínico no neurológico"*. A premissa estava certa e a conclusão
   * ⛔ não: **`nihss_informado_hora` é `tipo: "hora"`** desde que o NIHSS externo
   * foi reaberto — e, sem controle de hora nesta tela, ele caía no ramo de
   * escolha e renderizava **um cartão sem opção nenhuma**. O médico via a
   * pergunta e ⛔ não tinha como respondê-la.
   *
   * ⚠️ E a premissa continua valendo: aquele campo ⛔ **não declara relógio**, e
   * por isso ⛔ não define marco nenhum. O horário de um exame feito noutro
   * serviço ⛔ não é janela terapêutica (**E-21**, **E-36**).
   */
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onDesfazer: (campo: string) => void;
  /** ⚠️ A escala inteira num gesto: um fato por item, mais o total (§3.1). */
  onEscala: (pontos: Record<string, number>, total: number) => void;
};

export default function SuperficieB({
  estado,
  agora,
  onEscolher,
  onHora,
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
  /**
   * ⚠️⚠️ O APP ⛔ NÃO REPERGUNTA O QUE JÁ SABE — princípio fixado pelo autor em
   * 2026-08-29 e registrado como **PD-20**.
   *
   * Com a escala preenchida, os quatro achados que a Table 4 define por corte de
   * item **já estão respondidos**. Mantê-los como quatro cartões de pergunta
   * obriga o médico a revalidar o que ele acabou de medir — e revalidação
   * obrigatória é a forma mais educada de fazer alguém marcar no automático.
   *
   * ⚠️ O que ⛔ NÃO se perde: `Ajustar` abre os quatro e devolve a divergência
   * manual, que é a decisão PD-19. Recolher é sobre ⛔ não REPERGUNTAR — ⛔ nunca
   * sobre tirar do médico a palavra final.
   */
  const [ajustando, setAjustando] = useState(false);
  const derivados = escalaPreenchida(estado);
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

  /**
   * ⚠️⚠️ OS DOIS GRUPOS DE ACHADOS NASCEM RECOLHIDOS — decisão do autor,
   * 2026-09-01 — ⛔ e recolher aqui tem TRÊS condições que ⛔ não se negociam:
   *
   *   ⛔ o **hedge da fonte** continua visível com o grupo fechado;
   *   ⛔ havendo derivação do NIHSS, o **resumo** aparece mesmo fechado;
   *   ⛔ recolher ⛔ **não apaga** resposta ⛔ nenhuma.
   *
   * ⚠️ Fechado ⛔ não pode esconder que o quadro ⛔ **não é determinístico** —
   * é isso que a nota carrega, ⛔ e é por isso que ela ⛔ não vai para o ⓘ.
   */
  const GRUPOS_DE_ACHADO = GRUPOS_B.filter((g) => g.recolhido && g.id.startsWith("achados-"))
    .map((g) => g.id);

  return (
    <View style={e.raiz} testID="avc-superficie-b-conteudo">
      {GRUPOS_B.map((grupo) => {
        const deAchado = GRUPOS_DE_ACHADO.includes(grupo.id);
        const recolhivel = grupo.recolhido === true || deAchado;
        const aberto = abertos.includes(grupo.id);
        /** ⚠️ O grupo típico com a escala respondida mostra RESUMO, ⛔ não perguntas. */
        const resumindo = grupo.id === "achados-tipicos" && derivados && !ajustando;
        const fechado = recolhivel && !aberto && !resumindo;

        return (
          <View key={grupo.id} style={e.grupo} testID={`avc-grupo-${grupo.id}`}>
            {/**
              * ⚠️ FILETE no lugar da barra cheia — ⛔ e o cabeçalho segue
              * anunciando o que guarda: ⛔ ele ⛔ não mente sobre o conteúdo.
              */}
            <Pressable
              accessibilityRole={recolhivel ? "button" : undefined}
              aria-expanded={recolhivel ? aberto : undefined}
              testID={recolhivel ? `avc-bloco-abrir-${grupo.id}` : undefined}
              disabled={!recolhivel}
              onPress={() =>
                setAbertos((a) =>
                  a.includes(grupo.id) ? a.filter((x) => x !== grupo.id) : [...a, grupo.id]
                )
              }
            >
              <View style={e.cabecalho} testID={`avc-bloco-${grupo.id}`}>
                <Secao titulo={grupo.titulo} />
                {recolhivel ? (
                  <Text style={e.abrir}>{aberto ? "⌃" : "⌄"}</Text>
                ) : null}
              </View>
            </Pressable>

            {/**
              * ⚠️⚠️ A NOTA DO BLOCO É PERMANENTE — ⛔ e ⛔ NÃO vai para o ⓘ.
              *
              * ⛔ Ela carrega o hedge da fonte (*"podem ⛔ não ser"*,
              * *"considerando as circunstâncias individuais"*). Escondida, o
              * quadro seria lido como **critério** — que é exatamente o que
              * E-45 ⛔ e a Table 4 proíbem. ⚠️ Vale com o grupo fechado.
              */}
            {grupo.nota ? (
              <Text style={e.grupoNota} testID={`avc-grupo-nota-${grupo.id}`}>
                {tr(grupo.nota)}
              </Text>
            ) : null}

            {/**
              * ⚠️ O RESUMO SUBSTITUI AS PERGUNTAS, ⛔ não as apaga: `Ajustar`
              * traz as linhas de volta, com a procedência intacta.
              */}
            {resumindo ? (
              <View style={e.resumo} testID="avc-resumo-derivado">
                {grupo.campos.map((campo) => {
                  const valor = valorEfetivo(estado, campo.id);
                  const daEscala = veioDaEscala(estado, campo.id);
                  return (
                    <Text key={campo.id} style={e.resumoLinha} testID={`avc-resumo-${campo.id}`}>
                      {valor === "sim" ? "✓ " : valor === "nao" ? "— " : "? "}
                      {tr(campo.rotulo)}
                      {daEscala ? "" : ` · ${tr("Registro do médico")}`}
                    </Text>
                  );
                })}
                <Pressable
                  style={e.ajustar}
                  accessibilityRole="button"
                  testID="avc-ajustar-derivados"
                  /**
                   * ⚠️⚠️ AJUSTAR ABRE AS LINHAS — ⛔ e ⛔ não só sai do resumo.
                   *
                   * ⛔ Setando ⛔ só `ajustando`, o grupo saía do resumo ⛔ e caía
                   * no estado **recolhido**: o médico tocava "Ajustar" ⛔ e via
                   * outro botão, ⛔ não os achados. ⚠️ Dois estados de
                   * apresentação governando o mesmo bloco ⛔ e ⛔ nenhum deles
                   * sabendo do outro.
                   */
                  onPress={() => {
                    setAjustando(true);
                    setAbertos((a) => (a.includes(grupo.id) ? a : [...a, grupo.id]));
                  }}
                >
                  <Text style={e.ajustarTexto}>{tr("Ajustar")}</Text>
                </Pressable>
              </View>
            ) : null}

            {/**
              * ⚠️⚠️ RESUMO COMPACTO MESMO FECHADO, quando a escala derivou algo.
              *
              * ⛔ Fechar ⛔ não pode esconder que já **há** resposta derivada: o
              * médico precisa saber que o quadro ⛔ não está vazio antes de
              * decidir se abre.
              */}
            {deAchado && fechado ? (() => {
              /**
               * ⚠️⚠️ FECHADO ⛔ NÃO PODE ESCONDER O QUE JÁ FOI RESPONDIDO.
               *
               * ⛔ A primeira versão só resumia quando havia derivação do NIHSS.
               * ⚠️ Resultado: quem respondia um achado **à mão**, saía da B ⛔ e
               * voltava, encontrava o grupo fechado dizendo *"Avaliar"* — ⛔ o
               * fato estava na trilha, ⛔ e a tela mentia sobre o que guardava.
               *
               * ⚠️ Agora o resumo aparece para **qualquer** resposta, ⛔ e a
               * procedência de cada uma vai junto: quem veio da escala ⛔ e quem
               * é registro do médico ⛔ não se confundem ⛔ nem fechados.
               */
              const respondidos = grupo.campos
                .map((c) => ({ campo: c, valor: valorEfetivo(estado, c.id) }))
                .filter((x) => x.valor !== undefined);
              if (respondidos.length === 0) {
                return (
                  <Pressable
                    style={e.avaliar}
                    accessibilityRole="button"
                    testID={`avc-avaliar-${grupo.id}`}
                    onPress={() => setAbertos((a) => [...a, grupo.id])}
                  >
                    <Text style={e.avaliarTexto}>{tr("Avaliar")}</Text>
                  </Pressable>
                );
              }
              return (
                <View style={e.resumo} testID={`avc-resumo-fechado-${grupo.id}`}>
                  {respondidos.map(({ campo, valor }) => (
                    <Text
                      key={campo.id}
                      style={e.resumoLinha}
                      testID={`avc-resumo-${campo.id}`}
                    >
                      {valor === "sim" ? "✓ " : valor === "nao" ? "— " : "? "}
                      {tr(campo.rotulo)}
                      {veioDaEscala(estado, campo.id)
                        ? ` · ${tr("Vindo do NIHSS")}`
                        : ` · ${tr("Registro do médico")}`}
                    </Text>
                  ))}
                  <Pressable
                    style={e.ajustar}
                    accessibilityRole="button"
                    testID={`avc-avaliar-${grupo.id}`}
                    onPress={() => setAbertos((a) => [...a, grupo.id])}
                  >
                    <Text style={e.ajustarTexto}>{tr("Ajustar")}</Text>
                  </Pressable>
                </View>
              );
            })() : null}

            {fechado || resumindo ? null : (
              <>
                {camposDoGrupo(grupo).map((campo) => {
                  if (campo.tipo === "escala") {
                    return (
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
                    );
                  }

                  /* ── achados: linha compacta, TRÊS estados ─────────────── */
                  if (deAchado && campo.tipo === "escolha" && campo.opcoes) {
                    const manual = String(valorAtual(estado, campo.id)?.valor ?? "");
                    const derivado = derivadoDaEscala(estado, campo.id);
                    return (
                      <LinhaDeAchado
                        key={campo.id}
                        campo={campo.id}
                        rotulo={campo.rotulo}
                        definicao={definicaoDoAchado(campo.id)}
                        opcoes={campo.opcoes}
                        /** ⚠️ O valor EFETIVO vem do NÚCLEO — ⛔ a tela ⛔ não decide. */
                        valor={valorEfetivo(estado, campo.id) ?? ""}
                        daEscala={veioDaEscala(estado, campo.id)}
                        divergente={
                          manual !== "" && derivado !== undefined && manual !== derivado
                        }
                        /**
                         * ⚠️ Há registro do médico — ⛔ coincidindo ou ⛔ não com
                         * a derivação. ⛔ "Igual" ⛔ não significa "veio da escala".
                         */
                        manual={manual !== "" && !(manual !== derivado && derivado !== undefined)}
                        detalheAberto={detalhes.aberto(campo.id)}
                        onAlternarDetalhe={() => detalhes.alternar(campo.id)}
                        onEscolher={onEscolher}
                        onDesfazer={onDesfazer}
                        opcoesDaEscala={opcoesQueContam(campo.id)}
                      >
                        <DetalheDoCampo campo={campo} />
                      </LinhaDeAchado>
                    );
                  }

                  /* ── escolhas simples ─────────────────────────────────── */
                  if (campo.tipo === "escolha" && campo.opcoes && !campo.recolhivel) {
                    return (
                      <View key={campo.id} style={e.pergunta} testID={`avc-campo-${campo.id}`}>
                        <View style={e.perguntaTopo}>
                          <Text style={e.perguntaTexto}>{tr(campo.rotulo)}</Text>
                          <Recolhido
                            id={campo.id}
                            texto={campo.ajuda}
                            aberto={detalhes.aberto(campo.id)}
                            onAlternar={() => detalhes.alternar(campo.id)}
                          >
                            <DetalheDoCampo campo={campo} />
                          </Recolhido>
                        </View>
                        <Segmentado
                          campo={campo.id}
                          opcoes={campo.opcoes}
                          valor={valorEfetivo(estado, campo.id) ?? ""}
                          onEscolher={onEscolher}
                          onDesfazer={onDesfazer}
                        />
                        <Procedencia
                          campo={campo.id}
                          daEscala={veioDaEscala(estado, campo.id)}
                        />
                      </View>
                    );
                  }

                  /**
                   * ⚠️ Escala com descritor, grandeza, hora ⛔ e recolhíveis
                   * continuam no componente antigo: eles carregam regras de
                   * apresentação próprias, ⛔ e migrá-los ⛔ não era o pedido.
                   */
                  return (
                    <CampoDaSuperficie
                      key={campo.id}
                      campo={campo}
                      casaAtual="neurologico"
                      bruto={String(valorAtual(estado, campo.id)?.valor ?? "")}
                      numero={numeroGravado(campo.id)}
                      agora={agora}
                      detalheAberto={detalhes.aberto(campo.id)}
                      onAlternarDetalhe={() => detalhes.alternar(campo.id)}
                      onEscolher={onEscolher}
                      onMedir={onMedir}
                      onHora={onHora}
                      onDesfazer={onDesfazer}
                      derivado={derivadoDaEscala(estado, campo.id)}
                      empilhado={campo.tipo === "grau"}
                      nomeDaCasa="Paciente"
                    />
                  );
                })}
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
    cabecalho: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    abrir: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },
    /** ⚠️ O convite a avaliar — ⛔ e ele DIZ se já há derivação. */
    avaliar: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
    },
    avaliarTexto: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "600",
    },
    pergunta: { gap: ESPACO.xs, paddingVertical: ESPACO.xs },
    perguntaTopo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    perguntaTexto: { flex: 1, color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    grupo: { gap: ESPACO.xs },
    grupoTitulo: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "700", letterSpacing: 1, marginTop: ESPACO.xs,
    },
    grupoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    resumo: {
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      padding: ESPACO.sm, gap: ESPACO.xs,
      borderWidth: 1, borderColor: tema.cores.border,
      borderLeftWidth: 4, borderLeftColor: tema.cores.primary,
    },
    /** ⚠️ Símbolo antes do texto: ✓ presente · — ausente · ? sem conclusão (E-39). */
    resumoLinha: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize },
    ajustar: {
      alignSelf: "flex-start", minHeight: TOQUE.minimo, justifyContent: "center",
      paddingHorizontal: ESPACO.md, marginTop: ESPACO.xs,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    ajustarTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
  });
