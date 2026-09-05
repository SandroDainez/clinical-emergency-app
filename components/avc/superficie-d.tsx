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
 *
 * ── ⚠️⚠️ E O QUE A MIGRAÇÃO VISUAL DE 2026-09-01 ACRESCENTOU ────────────────
 *
 *   ⛔ **fazer "⛔ ninguém perguntou" parecer "⛔ não tem".** Era o defeito mais
 *      grave desta superfície: com *"Nenhum destes"* respondido em Paciente, D
 *      mostrava **exatamente o mesmo** que mostraria se ⛔ ninguém tivesse aberto
 *      o painel. Os três estados agora são ditos em palavras.
 *
 *   ⛔ **repetir a mesma ressalva duas vezes.** A declaração de natureza da
 *      fonte vive **uma vez**, no topo, e os grupos a herdam (**I6**).
 *
 *   ⛔ **separar os pares da fonte sem dizer que eles existem.** Agrupar por
 *      estado joga *extra-axial* e *intra-axial* para pontas opostas da tela.
 *      A linha `Relacionado na fonte` fala da **fonte**, ⛔ e ⛔ nunca do
 *      paciente: ⛔ ela ⛔ não sugere, ⛔ não cobra e ⛔ não cancela ⛔ nada.
 */
import { useState } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";

import { GRUPOS_D, CORTES_LABORATORIAIS } from "../../avc/conteudo/superficie-d";
import type { EstadoDeSeguranca } from "../../avc/conteudo/superficie-d";
import { camposDoGrupo } from "../../avc/conteudo/campo";
import { campoDoModulo } from "../../avc/conteudo/campos";
import {
  cortesLaboratoriais,
  estadoDosGruposDeAntecedentes,
  itensPorEstado,
  leiturasDaSuperficieD,
  vizinhoNaFonte,
  type EstadoDoGrupoDeAntecedentes,
} from "../../avc/nucleo/derivacoes-d";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorAtual } from "../../avc/nucleo/estado";
import { CampoDaSuperficie, DetalheDoCampo, useDetalhes } from "./campos-clinicos";
import { Icone, LinhaDeAchado, Recolhido, Secao } from "./ui";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
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
 *
 * ⚠️ `recolhido` ⛔ **só** na última: autor, 2026-09-01. ⛔ E recolher ⛔ não é
 * esconder — o cabeçalho diz **quantos** e **quais**.
 */
const ORDEM: readonly {
  estado: EstadoDeSeguranca;
  titulo: string;
  recolhido?: true;
}[] = [
  { estado: "contraindicacao_nao_corrigivel", titulo: "A fonte diz para não administrar" },
  { estado: "risco_aumentado", titulo: "A fonte descreve risco aumentado" },
  { estado: "informacao_insuficiente", titulo: "A fonte declara segurança desconhecida" },
  { estado: "situacao_individualizada", titulo: "A fonte manda decidir caso a caso" },
  { estado: "baixa_preocupacao_declarada", titulo: "A fonte declara risco baixo", recolhido: true },
];

/**
 * ⚠️⚠️ O QUE CADA ESTADO DE GRUPO DIZ — em palavras, ⛔ e ⛔ nunca por ausência.
 *
 * ⛔ *"Não perguntado"* ⛔ não é *"Nenhum registrado"*, ⛔ e ⛔ nenhum dos dois é
 * *"Não sei"*. ⚠️ As três frases existem porque as três situações têm
 * consequências diferentes para quem vai decidir sobre trombólise.
 */
const FRASE_DO_GRUPO: Readonly<Record<EstadoDoGrupoDeAntecedentes, string>> = {
  nao_perguntado: "Não perguntado",
  nenhum_registrado: "Nenhum registrado",
  nao_sei: "Não sei",
  com_itens: "registrados",
};

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
  const alternar = (id: string) =>
    setAbertos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const leituras = leiturasDaSuperficieD(estado);
  const cortes = cortesLaboratoriais(estado);
  const grupos = estadoDosGruposDeAntecedentes(estado);

  /**
   * ⚠️⚠️ CRUZAR O CORTE FICA À VISTA; o resto recolhe — autor, 2026-09-01.
   *
   * ⛔ Quatro linhas de "Dentro do corte" e "ainda não informado" ocupavam o
   * mesmo espaço do único analito que cruzou. ⚠️ ⛔ Nenhum é apagado: o bloco
   * recolhido diz quantos ficaram atrás dele.
   */
  const cruzam = cortes.filter((c) => c.estado === "contraindicacao_nao_corrigivel");
  const demais = cortes.filter((c) => c.estado !== "contraindicacao_nao_corrigivel");

  return (
    <View style={e.raiz} testID="avc-superficie-d-conteudo">
      {/**
        * ⚠️⚠️ A ADVERTÊNCIA DE ESPÉCIE VEM ANTES DE TUDO, e ela é da **fonte**:
        * a Table 8 ⛔ não tem classe de recomendação em célula nenhuma, e declara a
        * própria faixa mais restritiva *"unsupported by clinical evidence"*.
        * ⛔ Sem esta linha, a tela pareceria uma lista de regras (**E-48**).
        *
        * ⚠️⚠️ E ELA APARECE **UMA VEZ**. ⛔ A versão anterior a repetia, reescrita,
        * na nota do grupo logo abaixo — 440 caracteres de prosa quase idêntica
        * antes da primeira pergunta, em **duas redações que podiam divergir**.
        */}
      <Text style={e.aviso} testID="avc-d-natureza-da-fonte">
        {tr("A tabela de contraindicações da fonte não traz classe de recomendação em nenhuma célula, e a própria fonte declara a faixa mais restritiva como não sustentada por evidência clínica. Cada item aparece com o verbo da fonte.")}
      </Text>

      {/**
        * ⚠️⚠️ O QUE PACIENTE JÁ RESPONDEU — e as **três** ausências distinguidas.
        *
        * ⛔ Este bloco ⛔ não coleta ⛔ nada: ⛔ nenhum campo, ⛔ nenhum toque que
        * grave. ⚠️ Ele **lê** os três grupos de antecedentes e diz, em palavras,
        * qual é o estado de cada um — porque *"⛔ ninguém perguntou"* e *"⛔ não
        * tem"* chegavam idênticos ao olho: uma tela silenciosa.
        */}
      <View style={e.grupo} testID="avc-grupo-antecedentes">
        <View style={e.cabecalho} testID="avc-bloco-antecedentes">
          <Icone nome="paciente" tamanho={14} />
          <Secao titulo="Antecedentes que a fonte lê" />
        </View>
        {/** ⚠️ **PROCEDÊNCIA** — de onde o fato vem, e ⛔ não de quem é a fonte. */}
        <Text style={e.procedencia} testID="avc-d-procedencia-antecedentes">
          {tr("Do painel")} {tr("Paciente")}
        </Text>
        {grupos.map((g) => {
          const campo = campoDoModulo(g.campo);
          const vazio = g.estado === "nao_perguntado";
          return (
            <View key={g.campo} style={e.linha} testID={`avc-d-antecedentes-${g.campo}`}>
              <Text style={e.linhaRotulo}>{tr(campo?.rotulo ?? g.campo)}</Text>
              {/**
                * ⚠️⚠️ *"Não perguntado"* ⛔ NÃO é alerta, ⛔ e ⛔ não pode virar
                * vermelho: ⛔ nenhum campo desta superfície retém terapia
                * (**E-49**). ⚠️ Ele é **mais fraco** que os outros dois na cor,
                * ⛔ e mesmo assim está **escrito** — que é o que faltava.
                */}
              <Text
                style={[e.linhaEstado, vazio ? e.linhaEstadoVazio : null]}
                testID={`avc-d-antecedentes-estado-${g.campo}`}
              >
                {g.estado === "com_itens"
                  ? `${g.marcados} ${tr(FRASE_DO_GRUPO.com_itens)}`
                  : tr(FRASE_DO_GRUPO[g.estado])}
              </Text>
            </View>
          );
        })}
      </View>

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
                style={e.cabecalho}
                accessibilityRole="button"
                aria-expanded={!fechado}
                testID={`avc-bloco-abrir-${grupo.id}`}
                onPress={() => alternar(grupo.id)}
              >
                <View style={e.cabecalhoNome} testID={`avc-bloco-${grupo.id}`}>
                  <Secao titulo={grupo.titulo} />
                </View>
                <View style={fechado ? null : e.giradoParaBaixo}>
                  <Icone nome="adiante" tamanho={14} />
                </View>
              </Pressable>
            ) : (
              <View style={e.cabecalho} testID={`avc-bloco-${grupo.id}`}>
                <Icone nome="seguranca" tamanho={14} />
                <Secao titulo={grupo.titulo} />
              </View>
            )}
            {/**
              * ⚠️ A nota do grupo, quando existe. ⛔ A do juízo de segurança saiu
              * por ser a mesma frase do aviso acima — ver o conteúdo.
              */}
            {grupo.nota ? (
              <Text style={e.grupoNota} testID={`avc-grupo-nota-${grupo.id}`}>
                {tr(grupo.nota)}
              </Text>
            ) : null}
            {fechado
              ? null
              : camposDoGrupo(grupo).map((campo) =>
                  /**
                   * ⚠️ Três estados cabem em linha compacta; a seleção múltipla
                   * das consultas continua no componente antigo, que encapsula
                   * as regras de exclusividade ("Nenhuma", "Não sei").
                   */
                  campo.tipo === "escolha" && campo.opcoes && campo.opcoes.length <= 3 ? (
                    <LinhaDeAchado
                      key={campo.id}
                      campo={campo.id}
                      rotulo={campo.rotulo}
                      definicao={campo.ajuda}
                      opcoes={campo.opcoes}
                      valor={String(valorAtual(estado, campo.id)?.valor ?? "")}
                      detalheAberto={detalhes.aberto(campo.id)}
                      onAlternarDetalhe={() => detalhes.alternar(campo.id)}
                      onEscolher={onEscolher}
                      onDesfazer={onDesfazer}
                    >
                      <DetalheDoCampo campo={campo} />
                    </LinhaDeAchado>
                  ) : (
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
                  )
                )}
          </View>
        );
      })}

      {/**
        * ⚠️⚠️ OS ITENS INTERPRETADOS — agrupados por estado, e **cada um mostra o
        * verbo**. ⛔ Um agrupamento sem verbo seria o achatamento que E-45 proíbe:
        * *"likely contraindicated"* e *"should not be administered"* cairiam na
        * mesma caixa e sairiam com a mesma força.
        */}
      {ORDEM.map(({ estado: qual, titulo, recolhido }) => {
        const itens = itensPorEstado(estado, qual);
        if (itens.length === 0) return null;
        const fechado = recolhido === true && !abertos.includes(qual);
        return (
          <View key={qual} style={e.grupo} testID={`avc-d-estado-${qual}`}>
            {recolhido ? (
              <Pressable
                style={e.cabecalho}
                accessibilityRole="button"
                aria-expanded={!fechado}
                testID={`avc-d-abrir-${qual}`}
                onPress={() => alternar(qual)}
              >
                <View style={e.cabecalhoNome} testID={`avc-bloco-${qual}`}>
                  <Secao titulo={titulo} />
                </View>
                <View style={fechado ? null : e.giradoParaBaixo}>
                  <Icone nome="adiante" tamanho={14} />
                </View>
              </Pressable>
            ) : (
              <View style={e.cabecalho} testID={`avc-bloco-${qual}`}>
                <Secao titulo={titulo} />
              </View>
            )}

            {/**
              * ⚠️⚠️ RECOLHIDO, ELE **DIZ QUANTOS E QUAIS** — exigência do autor,
              * 2026-09-01: *"recolher ⛔ não pode esconder que existe informação
              * registrada"*. ⛔ E o resumo ⛔ não reinterpreta: ⛔ ele lista os
              * rótulos, ⛔ sem verbo encurtado ⛔ e sem juízo novo.
              *
              * ⛔ E ⛔ nada aqui usa estilo de "sem importância": é a faixa de
              * **menor preocupação declarada pela fonte**, ⛔ não irrelevância.
              */}
            {fechado ? (
              <Text style={e.resumo} testID={`avc-d-resumo-${qual}`}>
                {itens.length} {tr("registrados")}: {itens.map((i) => tr(i.rotulo)).join(" · ")}
              </Text>
            ) : (
              itens.map((i) => {
                const par = vizinhoNaFonte(i.id);
                return (
                  <View key={i.id} style={e.item} testID={`avc-d-item-${i.id}`}>
                    <View style={e.itemTopo}>
                      <Text style={e.itemRotulo}>{tr(i.rotulo)}</Text>
                      {/**
                        * ⚠️ O ⓘ carrega a **fonte**, a consulta que a fonte
                        * nomeia e a nota — ⛔ tudo o que é rastreabilidade, ⛔ e
                        * ⛔ nada do que se lê para decidir agora (**E-30**).
                        */}
                      <Recolhido
                        id={`item-${i.id}`}
                        aberto={detalhes.aberto(`item-${i.id}`)}
                        onAlternar={() => detalhes.alternar(`item-${i.id}`)}
                      >
                        <Text style={e.itemFonte}>
                          {i.fonte}
                          {i.individualizada ? ` · ${tr("decisão caso a caso")}` : ""}
                          {i.consulta ? ` · ${tr(i.consulta)}` : ""}
                        </Text>
                        {i.nota ? <Text style={e.itemNota}>{tr(i.nota)}</Text> : null}
                      </Recolhido>
                    </View>
                    {/**
                      * ⚠️⚠️ A FORMULAÇÃO CLÍNICA VEM PRIMEIRO, em português —
                      * decisão do autor: *"em emergência, o médico brasileiro
                      * ⛔ não deveria precisar traduzir `potentially harmful and
                      * should not be administered` sob pressão"*.
                      */}
                    <Text style={e.formulacao} testID={`avc-d-formulacao-${i.id}`}>
                      {tr(i.formulacao)}
                    </Text>
                    {/**
                      * ⚠️ E o VERBATIM logo abaixo, em inglês, como **autoridade**
                      * — ⛔ a tradução acompanha a fonte, e ⛔ nunca a substitui.
                      */}
                    <Text style={e.verbo} testID={`avc-d-verbo-${i.id}`}>“{i.verbo}”</Text>
                    {/**
                      * ⚠️⚠️ O PAR DA FONTE — ⛔ e a frase fala da **FONTE**.
                      *
                      * ⛔ Ela ⛔ não diz que o vizinho é verdade no paciente,
                      * ⛔ não pede conferência, ⛔ não cancela ⛔ e ⛔ não substitui
                      * o item marcado. ⚠️ Ela diz ⛔ só que a fonte trata os dois
                      * **separadamente** — que é o fato que o agrupamento por
                      * estado esconde ao jogá-los para pontas opostas da tela.
                      */}
                    {par ? (
                      <Text style={e.relacionado} testID={`avc-d-relacionado-${i.id}`}>
                        {tr("A fonte trata separadamente")}: {tr(par.vizinho)}
                      </Text>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        );
      })}

      {/**
        * ⚠️⚠️ ANTICOAGULAÇÃO — bloco PRÓPRIO, e ⛔ não mais uma linha no rodapé.
        *
        * ⛔ O DOAC vivia dentro do painel genérico de alertas, no fim da tela. ⚠️ E
        * ele carrega a dívida **F-30**: a fonte ⛔ não define o instante de
        * referência da janela de 48 h, ⛔ e o app ⛔ não calcula. ⛔ Enterrar isso
        * no rodapé fazia a dívida parecer um aviso qualquer.
        */}
      <View style={e.grupo} testID="avc-grupo-anticoagulacao">
        <View style={e.cabecalho} testID="avc-bloco-anticoagulacao">
          <Icone nome="glicemia" tamanho={14} />
          <Secao titulo="Anticoagulação e antiagregação" />
        </View>
        <Text style={e.procedencia} testID="avc-d-procedencia-anticoagulacao">
          {tr("Do painel")} {tr("Paciente")}
        </Text>
        {leituras.map((l) => {
          /**
           * ⚠️⚠️ **F-30 FICA À VISTA QUANDO HÁ EXPOSIÇÃO** — autor, 2026-09-01:
           * *"DOAC com horário e dívida F-30 claramente preservados"*.
           *
           * ⛔ Atrás do ⓘ, a dívida só apareceria para quem já desconfia. ⚠️ E o
           * momento em que ela importa é **exatamente** este: com a última dose
           * registrada, o médico pode esperar que o app diga se está dentro das
           * 48 h — ⛔ e ele ⛔ não diz, porque a fonte ⛔ não define o instante de
           * referência. ⛔ Deixar essa frase escondida é deixar a expectativa de
           * pé.
           *
           * ⚠️ ⛔ Sem exposição registrada, ⛔ nada disso é pertinente, ⛔ e a
           * linha volta a ser ⛔ só um rótulo com ⓘ — ⛔ nenhum vazio vira alerta.
           */
          const exposto =
            l.id === "doac"
            && "exposicao" in l
            && l.exposicao !== "sem_anticoagulante"
            && l.exposicao !== "nao_perguntado";
          return (
            <View key={l.id} testID={`avc-leitura-${l.id}`}>
              <View style={e.linha}>
                <Text style={e.linhaRotulo} testID={`avc-leitura-curto-${l.id}`}>
                  {tr(l.curto)}
                </Text>
                <Recolhido
                  id={`leitura-${l.id}`}
                  texto={exposto ? undefined : l.texto}
                  aberto={detalhes.aberto(`leitura-${l.id}`)}
                  onAlternar={() => detalhes.alternar(`leitura-${l.id}`)}
                />
              </View>
              {exposto ? (
                <Text style={e.dividaVisivel} testID={`avc-divida-${l.id}`}>
                  {tr(l.texto)}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {/** ⚠️ Os quatro cortes: quem cruza fica à vista, o resto recolhe. */}
      <View style={e.grupo} testID="avc-d-cortes">
        <View style={e.cabecalho} testID="avc-bloco-cortes">
          <Icone nome="laboratorio" tamanho={14} />
          <Secao titulo="Cortes laboratoriais da fonte" />
        </View>
        <Text style={e.procedencia} testID="avc-d-procedencia-cortes">
          {tr("Do painel")} {tr("Laboratório")}
        </Text>
        {cruzam.map((c) => (
          <View key={c.id} style={[e.linha, e.linhaCruza]} testID={`avc-d-corte-${c.id}`}>
            <Text style={e.linhaRotulo}>{tr(rotuloDoCorte(c.id))}</Text>
            <Text style={e.linhaCruzaTexto} testID={`avc-d-corte-estado-${c.id}`}>
              {tr("Cruza o corte da fonte")}
            </Text>
          </View>
        ))}
        {demais.length > 0 ? (
          <Pressable
            style={e.cabecalho}
            accessibilityRole="button"
            aria-expanded={abertos.includes("cortes")}
            testID="avc-d-abrir-cortes"
            onPress={() => alternar("cortes")}
          >
            <Text style={e.resumo} testID="avc-d-resumo-cortes">
              {demais.length} {tr("sem cruzar o corte ou ainda sem resultado")}
            </Text>
            <View style={abertos.includes("cortes") ? e.giradoParaBaixo : null}>
              <Icone nome="adiante" tamanho={13} />
            </View>
          </Pressable>
        ) : null}
        {abertos.includes("cortes")
          ? demais.map((c) => (
              <View key={c.id} style={e.linha} testID={`avc-d-corte-${c.id}`}>
                <Text style={e.linhaRotulo}>{tr(rotuloDoCorte(c.id))}</Text>
                {/**
                  * ⚠️⚠️ *"Ainda ⛔ não informado"* ⛔ NÃO É *"dentro do corte"*.
                  * ⚠️ ⛔ Nenhum resultado ⛔ não é resultado normal (**E-37**).
                  */}
                <Text style={e.linhaEstadoVazio} testID={`avc-d-corte-estado-${c.id}`}>
                  {c.estado === "nao_perguntado"
                    ? tr("Resultado ainda não informado")
                    : c.razao === "unidade_nao_declarada"
                      ? tr("Sem a unidade declarada, o valor não se compara ao corte")
                      : c.razao === "divergencia_entre_coletas"
                        ? tr("Coletas divergem quanto ao corte, e o aplicativo não escolhe entre elas")
                        : tr("Dentro do corte da fonte")}
                </Text>
              </View>
            ))
          : null}
      </View>
    </View>
  );
}

/**
 * ⚠️ O nome do analito vem do catálogo de cortes, ⛔ e ⛔ não de uma tabela
 * escrita aqui: a tela ⛔ não pode batizar exame (**E-29**).
 */
function rotuloDoCorte(id: string): string {
  const c = (CORTES_LABORATORIAIS as Record<string, { campo: string }>)[id];
  return campoDoModulo(c?.campo ?? id)?.rotulo ?? id;
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    aviso: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize,
    },
    grupo: { gap: ESPACO.xs },
    cabecalho: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    cabecalhoNome: { flex: 1, minWidth: 0 },
    giradoParaBaixo: { transform: [{ rotate: "90deg" }] },
    grupoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    /** ⚠️ De onde o FATO vem — ⛔ e ⛔ não de quem é a autoridade bibliográfica. */
    procedencia: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },

    linha: {
      flexDirection: "row", alignItems: "center", gap: ESPACO.sm,
      minHeight: TOQUE.minimo,
    },
    linhaRotulo: { flex: 1, minWidth: 0, color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    linhaEstado: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "700" },
    /**
     * ⚠️⚠️ ⛔ NÃO PERGUNTADO ⛔ NÃO É ALERTA — ⛔ e ⛔ não pode ser pintado.
     * ⛔ Nenhum campo desta superfície retém terapia (**E-49**), e vermelho que
     * ⛔ não é defeito ensina a ignorar vermelho.
     */
    linhaEstadoVazio: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
    },
    /** ⚠️ Filete à esquerda: quem CRUZA o corte se distingue sem virar cartão. */
    linhaCruza: {
      borderLeftWidth: 3, borderLeftColor: tema.cores.warning, paddingLeft: ESPACO.sm,
    },
    linhaCruzaTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "700" },

    resumo: { flex: 1, color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    /**
     * ⚠️ Filete, ⛔ e ⛔ não cartão com moldura: com sete itens marcados, sete
     * cartões de 213 px eram 3,7 telas de rolagem.
     */
    item: {
      paddingLeft: ESPACO.sm, paddingVertical: ESPACO.xs,
      borderLeftWidth: 3, borderLeftColor: tema.cores.border,
      gap: 2,
    },
    itemTopo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    itemRotulo: {
      flex: 1, minWidth: 0,
      color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "700",
    },
    /** ⚠️ O que o médico lê primeiro — corpo, e ⛔ não rodapé. */
    formulacao: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    /** ⚠️ Itálico e em inglês: é citação, e ⛔ não texto do app. */
    verbo: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize,
      fontStyle: "italic",
    },
    itemFonte: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    itemNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    /**
     * ⚠️ Discreta **de propósito**: ⛔ ela ⛔ não compete com o verbo, ⛔ não tem
     * cor própria ⛔ e ⛔ não traz ícone de alerta. ⛔ Um par da fonte ⛔ não é
     * achado do paciente.
     */
    relacionado: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize,
    },
    /**
     * ⚠️ Cor de DÍVIDA — ⛔ e ⛔ não `warning`: *"o app ⛔ não consegue avaliar"*
     * ⛔ não é *"há risco"*. ⛔ Pintar de alerta faria a lacuna da fonte parecer
     * achado do paciente.
     */
    dividaVisivel: {
      color: tema.cores.debt,
      fontSize: TIPOGRAFIA.micro.fontSize,
      paddingLeft: ESPACO.sm,
      borderLeftWidth: 3,
      borderLeftColor: tema.cores.debt,
    },
  });
