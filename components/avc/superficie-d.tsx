/**
 * SUPERFÍCIE D · Segurança — a tela.
 *
 * ⛔ NENHUMA medicina nasce aqui.
 *
 * ⚠️⚠️ O QUE ESTA TELA ⛔ NÃO PODE FAZER:
 *
 *   ⛔ **dizer se pode trombolisar.** ⛔ Não existe veredito agregado — ⛔ nem
 *      "contraindicado", ⛔ nem "elegível". A tela mostra **um item por vez**, com
 *      o **verbo da própria fonte** (**E-43**, **E-46**).
 *
 *   ⛔ **achatar a gradação.** *should not be administered* · *likely
 *      contraindicated* · *potentially harmful* · *should be avoided* são frases
 *      diferentes, e chegam diferentes ao olho (**E-45**).
 *
 *   ⛔ **cobrar o que ⛔ não se resolve.** ⛔ Nenhuma pendência daqui retém terapia,
 *      e ⛔ só entra o que é realmente resolvível (**E-26**, **E-49**).
 *
 *   ⛔ **transformar cor em espécie.** A Table 8 tem gradiente cromático, e ele
 *      ⛔ **não** vira 🔴🟡🟢 aqui: a cor da fonte carrega **grau de opinião**, e a do
 *      app carregaria espécie clínica (**E-39**).
 */
import { useState } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";

import { GRUPOS_D } from "../../avc/conteudo/superficie-d";
import type { EstadoDeSeguranca } from "../../avc/conteudo/superficie-d";
import { camposDoGrupo } from "../../avc/conteudo/campo";
import {
  cortesLaboratoriais,
  itensPorEstado,
  leiturasDaSuperficieD,
} from "../../avc/nucleo/derivacoes-d";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorAtual } from "../../avc/nucleo/estado";
import { CabecalhoDeBloco, CampoDaSuperficie, PainelDeLeituras, useDetalhes } from "./campos-clinicos";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onDesfazer: (campo: string) => void;
};

/**
 * ⚠️⚠️ A ORDEM É CLÍNICA, e ⛔ não alfabética (§7.3): o que restringe primeiro, o
 * que a fonte declara seguro por último. ⛔ Reordenar isto é mudar prioridade.
 */
const ORDEM: readonly { estado: EstadoDeSeguranca; titulo: string }[] = [
  { estado: "contraindicacao_nao_corrigivel", titulo: "A fonte diz para não administrar" },
  { estado: "risco_aumentado", titulo: "A fonte descreve risco aumentado" },
  { estado: "informacao_insuficiente", titulo: "A fonte declara segurança desconhecida" },
  { estado: "situacao_individualizada", titulo: "A fonte manda decidir caso a caso" },
  { estado: "baixa_preocupacao_declarada", titulo: "A fonte declara risco baixo" },
];

export default function SuperficieD({
  estado,
  agora,
  onEscolher,
  onHora,
  onMedir,
  onDesfazer,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const detalhes = useDetalhes();
  /** ⚠️ Estado de TELA: abrir bloco ⛔ não registra ⛔ nem apaga nada (E-20). */
  const [abertos, setAbertos] = useState<readonly string[]>([]);
  const leituras = leiturasDaSuperficieD(estado);
  const cortes = cortesLaboratoriais(estado);

  return (
    <View style={e.raiz} testID="avc-superficie-d-conteudo">
      {/**
        * ⚠️⚠️ A ADVERTÊNCIA DE ESPÉCIE VEM ANTES DE TUDO, e ela é da **fonte**:
        * a Table 8 ⛔ não tem classe de recomendação em célula nenhuma, e declara a
        * própria faixa mais restritiva *"unsupported by clinical evidence"*.
        * ⛔ Sem esta linha, a tela pareceria uma lista de regras (**E-48**).
        */}
      <Text style={e.aviso} testID="avc-d-natureza-da-fonte">
        {tr("A tabela de contraindicações da fonte não traz classe de recomendação em nenhuma célula, e a própria fonte declara a faixa mais restritiva como não sustentada por evidência clínica. Cada item aparece com o verbo da fonte.")}
      </Text>

      {GRUPOS_D.map((grupo) => {
        /**
         * ⚠️⚠️ O BLOCO RECOLHIDO **PRECISA RECOLHER** — a tela ignorava
         * `recolhido: true` e desenhava as sete consultas abertas, empurrando o
         * juízo de segurança para fora da primeira dobra. Achado na revisão
         * visual de 2026-08-30.
         *
         * ⛔ E ⛔ só a consulta recolhe: o juízo de segurança decide agora (§7.3).
         */
        const fechado = grupo.recolhido === true && !abertos.includes(grupo.id);
        return (
        <View key={grupo.id} style={e.grupo} testID={`avc-grupo-${grupo.id}`}>
          {grupo.recolhido ? (
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
              <CabecalhoDeBloco titulo={grupo.titulo} testID={`avc-bloco-${grupo.id}`} aberto={!fechado} />
            </Pressable>
          ) : (
            <CabecalhoDeBloco titulo={grupo.titulo} testID={`avc-bloco-${grupo.id}`} />
          )}
          {grupo.nota ? (
            <Text style={e.grupoNota} testID={`avc-grupo-nota-${grupo.id}`}>{tr(grupo.nota)}</Text>
          ) : null}
          {fechado ? null : camposDoGrupo(grupo).map((campo) => (
            <CampoDaSuperficie
              key={campo.id}
              campo={campo}
              casaAtual="seguranca"
              bruto={String(valorAtual(estado, campo.id)?.valor ?? "")}
              numero={undefined}
              agora={agora}
              detalheAberto={detalhes.aberto(campo.id)}
              onAlternarDetalhe={() => detalhes.alternar(campo.id)}
              onEscolher={onEscolher}
              onMedir={onMedir}
              onHora={onHora}
              onDesfazer={onDesfazer}
            />
          ))}
        </View>
        );
      })}

      {/**
        * ⚠️⚠️ OS ITENS INTERPRETADOS — agrupados por estado, e **cada um mostra o
        * verbo**. ⛔ Um agrupamento sem verbo seria o achatamento que E-45 proíbe:
        * *"likely contraindicated"* e *"should not be administered"* cairiam na
        * mesma caixa e sairiam com a mesma força.
        */}
      {ORDEM.map(({ estado: qual, titulo }) => {
        const itens = itensPorEstado(estado, qual);
        if (itens.length === 0) return null;
        return (
          <View key={qual} style={e.grupo} testID={`avc-d-estado-${qual}`}>
            <CabecalhoDeBloco titulo={titulo} testID={`avc-bloco-${qual}`} />
            {itens.map((i) => (
              <View key={i.id} style={e.item} testID={`avc-d-item-${i.id}`}>
                <Text style={e.itemRotulo}>{tr(i.rotulo)}</Text>
                {/**
                  * ⚠️⚠️ A FORMULAÇÃO CLÍNICA VEM PRIMEIRO, em português — decisão do
                  * autor: *"em emergência, o médico brasileiro ⛔ não deveria
                  * precisar traduzir `potentially harmful and should not be
                  * administered` sob pressão"*.
                  */}
                <Text style={e.formulacao} testID={`avc-d-formulacao-${i.id}`}>
                  {tr(i.formulacao)}
                </Text>
                {/**
                  * ⚠️ E o VERBATIM logo abaixo, em inglês, como **autoridade** —
                  * ⛔ a tradução acompanha a fonte, e ⛔ nunca a substitui.
                  */}
                <Text style={e.verbo} testID={`avc-d-verbo-${i.id}`}>“{i.verbo}”</Text>
                <Text style={e.itemFonte}>
                  {i.fonte}
                  {i.individualizada ? ` · ${tr("decisão caso a caso")}` : ""}
                  {i.consulta ? ` · ${tr(i.consulta)}` : ""}
                </Text>
                {i.nota ? <Text style={e.itemNota}>{tr(i.nota)}</Text> : null}
              </View>
            ))}
          </View>
        );
      })}

      {/** ⚠️ Os quatro cortes, ⛔ e só quando alguém os informou ou eles faltam. */}
      <View style={e.grupo} testID="avc-d-cortes">
        <CabecalhoDeBloco titulo="Cortes laboratoriais da fonte" testID="avc-bloco-cortes" />
        {cortes.map((c) => (
          <View key={c.id} style={e.item} testID={`avc-d-corte-${c.id}`}>
            <Text style={e.itemRotulo}>{tr(c.id)}</Text>
            <Text style={e.itemFonte} testID={`avc-d-corte-estado-${c.id}`}>
              {c.estado === "nao_perguntado"
                ? tr("Resultado ainda não informado")
                : c.razao === "unidade_nao_declarada"
                  ? tr("Sem a unidade declarada, o valor não se compara ao corte")
                  : c.razao === "divergencia_entre_coletas"
                    ? tr("Coletas divergem quanto ao corte, e o aplicativo não escolhe entre elas")
                    : c.estado === "contraindicacao_nao_corrigivel"
                      ? tr("Cruza o corte da fonte")
                      : tr("Dentro do corte da fonte")}
            </Text>
          </View>
        ))}
      </View>

      <PainelDeLeituras
        leituras={leituras}
        rotuloDoCampo={{}}
        detalheAberto={detalhes.aberto}
        onAlternarDetalhe={detalhes.alternar}
      />
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    aviso: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
      paddingBottom: ESPACO.sm,
    },
    grupo: { gap: ESPACO.sm },
    grupoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    item: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
      padding: ESPACO.md, gap: ESPACO.xs,
    },
    itemRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700" },
    /** ⚠️ O que o médico lê primeiro — corpo, e ⛔ não rodapé. */
    formulacao: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize },
    /** ⚠️ Itálico e em inglês: é citação, e ⛔ não texto do app. */
    verbo: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
      fontStyle: "italic",
    },
    itemFonte: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    itemNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
  });
