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
import { campoAparece, camposDoGrupo } from "../../avc/conteudo/campo";
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
import { SETA } from "../../design-system/afordancia";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { AvisoDeApoioClinico } from "../../design-system/aviso-de-apoio-clinico";

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onDesfazer: (campo: string) => void;
  /**
   * ⚠️⚠️ ONDE OS ANTECEDENTES SE RESPONDEM — ⛔ e ⛔ não é aqui.
   *
   * ⛔ Relato do autor, 2026-09-06: as linhas *"Antecedentes intracranianos ·
   * ⛔ Não perguntado"* **pareciam botões ⛔ e ⛔ não eram**. ⚠️ Elas dizem *"Do
   * painel Paciente"* ⛔ e mostram *"⛔ Não perguntado"* — ⛔ o toque natural é ir
   * lá responder.
   *
   * ⚠️ D **lê** esses fatos ⛔ e ⛔ não os redeclara; ⛔ por isso ela ⛔ não
   * responde por eles — ⛔ ela leva a quem responde (**E-09**).
   */
  onAbrirPaciente: () => void;
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
  /**
   * ⚠️⚠️ ⛔ TODOS RECOLHÍVEIS desde 2026-09-06 — pedido do autor: *"CONTRA
   * INDICAÇÕES ABSOLUTAS E RELATIVAS CLICÁVEIS E RECOLHÍVEIS"*.
   *
   * ⛔ Antes, ⛔ só *"risco baixo"* recolhia; os outros quatro ficavam sempre
   * abertos ⛔ e a tela abria com trinta itens empilhados.
   *
   * ── ⚠️⚠️ ⛔ E POR QUE OS TÍTULOS ⛔ NÃO VIRARAM *"ABSOLUTA"* E *"RELATIVA"* ──
   *
   * ⛔ Porque a fonte ⛔ não usa essas duas palavras: ⚠️ ela grada com **verbos
   * diferentes** — *"should not be administered"*, *"likely contraindicated"*,
   * *"potentially harmful"*, *"should be avoided"* —, ⛔ e este arquivo existe
   * em parte para **⛔ não** achatá-los (**E-45**, ⛔ e a proibição escrita em
   * `superficie-d.ts`: *"⛔ NÃO EXISTE ESTADO AGREGADO 'CONTRAINDICADO'"*).
   *
   * ⚠️ Espremer os quatro verbos em dois baldes faria *"potencialmente
   * prejudicial"* ⛔ e *"⛔ não deve ser administrado"* lerem **igual** — ⛔ e é
   * exatamente a diferença entre eles que decide se o médico pondera ⛔ ou para.
   *
   * ⚠️ O primeiro grupo **é** o que a prática chama de absoluta; o quarto **é**
   * o que ela chama de relativa. ⛔ O que ⛔ não fazemos é apagar o verbo que
   * sustenta cada um.
   *
   * ⚠️⚠️ ⛔ E O PRIMEIRO NASCE **ABERTO**: ⛔ o que a fonte manda ⛔ não
   * administrar ⛔ não pode depender de um toque para aparecer.
   */
  { estado: "contraindicacao_nao_corrigivel", titulo: "A fonte diz para não administrar" },
  { estado: "risco_aumentado", titulo: "A fonte descreve risco aumentado", recolhido: true },
  { estado: "informacao_insuficiente", titulo: "A fonte declara segurança desconhecida", recolhido: true },
  { estado: "situacao_individualizada", titulo: "A fonte manda decidir caso a caso", recolhido: true },
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
  onAbrirPaciente,
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
            <Pressable
              key={g.campo}
              style={e.linha}
              accessibilityRole="button"
              accessibilityLabel={`${tr(campo?.rotulo ?? g.campo)} — ${tr("abrir o painel do paciente")}`}
              testID={`avc-d-antecedentes-${g.campo}`}
              onPress={onAbrirPaciente}
            >
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
            </Pressable>
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
                style={[e.cabecalho, e.cabecalhoTocavel]}
                accessibilityRole="button"
                aria-expanded={!fechado}
                testID={`avc-bloco-abrir-${grupo.id}`}
                onPress={() => alternar(grupo.id)}
              >
                <View style={e.cabecalhoNome} testID={`avc-bloco-${grupo.id}`}>
                  <Secao titulo={grupo.titulo} assunto={grupo.id} />
                </View>
                <View style={fechado ? null : e.giradoParaBaixo}>
                  <Icone nome="adiante" tamanho={14} />
                </View>
              </Pressable>
            ) : (
              /**
               * ⚠️ ⛔ O ícone solto saiu: ⛔ quem desenha ícone ⛔ e cor ⛔ agora é
               * o **selo do assunto**, ⛔ igual em todas as superfícies.
               */
              <View style={e.cabecalho} testID={`avc-bloco-${grupo.id}`}>
                <Secao titulo={grupo.titulo} assunto={grupo.id} />
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
              : camposDoGrupo(grupo)
                  /**
                   * ⚠️⚠️⚠️ ⛔ A CONDIÇÃO DE APARIÇÃO É **OBEDECIDA AQUI** — 2026-09-12.
                   *
                   * ⛔ Relato do autor, com captura: *"O SANGRAMENTO FOI TRATADO,
                   * O RISCO FOI REDUZIDO (QUE SANGRAMENTO? ⛔ NÃO FOI DITO
                   * SANGRAMENTO ALGUM, ISSO EU JÁ HAVIA PEDIDO CORREÇÃO ⛔ E
                   * ⛔ NÃO FOI FEITA)"*.
                   *
                   * ⚠️⚠️ ⛔ E ELA TINHA SIDO FEITA **⛔ PELA METADE**:
                   * `sangramento_tratado` declara `apareceQuando` desde
                   * 2026-09-09, ⛔ e **esta tela** ⛔ nunca chamou `campoAparece`.
                   * ⚠️ ⛔ Declarar ⛔ não é obedecer — ⛔ e quem obedece é **quem
                   * desenha o campo** (A, B ⛔ e Paciente já obedeciam).
                   *
                   * ⛔ ⛔ Perguntar *"o sangramento foi tratado?"* ⛔ a quem ⛔ não
                   * registrou sangramento ⛔ nenhum ⛔ **afirma** o sangramento
                   * dentro da pergunta.
                   */
                  .filter((campo) => campoAparece(campo, (c) => valorAtual(estado, c)?.valor))
                  .map((campo) =>
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
                      /**
                       * ⚠️ ⛔ Era `undefined` fixo — ⛔ a mesma classe do campo
                       * cego achado na Fase 5. ⛔ Aqui ⛔ ela ⛔ ainda ⛔ não
                       * mordia (⛔ os campos deste ramo ⛔ não são numéricos),
                       * ⛔ **mas o primeiro que for** ⛔ nasceria mudo.
                       */
                      numero={(() => {
                        const v = valorAtual(estado, campo.id)?.valor;
                        return typeof v === "number" ? v : undefined;
                      })()}
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
      {/**
        * ⚠️⚠️ ⛔ `recomendacao` ⛔ **⛔ uma vez**, ⛔ e ⛔ só ⛔ se a Table 8
        * ⛔ tiver ⛔ interpretado ⛔ alguma coisa. ⛔ Segurança ⛔ vazia ⛔ é
        * ⛔ tela de coleta — ⛔ e ⛔ campo de coleta ⛔ não leva disclaimer.
        */}
      <AvisoDeApoioClinico
        variante="recomendacao"
        ha={ORDEM.some(({ estado: q }) => itensPorEstado(estado, q).length > 0)}
        tr={tr}
        testID="avc-aviso-leituras"
      />

      {ORDEM.map(({ estado: qual, titulo, recolhido }) => {
        const itens = itensPorEstado(estado, qual);
        if (itens.length === 0) return null;
        const fechado = recolhido === true && !abertos.includes(qual);
        return (
          <View key={qual} style={e.grupo} testID={`avc-d-estado-${qual}`}>
            {recolhido ? (
              <Pressable
                style={[e.cabecalho, e.cabecalhoTocavel]}
                accessibilityRole="button"
                aria-expanded={!fechado}
                testID={`avc-d-abrir-${qual}`}
                onPress={() => alternar(qual)}
              >
                <View style={e.cabecalhoNome} testID={`avc-bloco-${qual}`}>
                  {/**
                    * ⚠️⚠️ ⛔ AQUI ⛔ NÃO ENTRA `SafetyBadge` — regra do autor,
                    * 2026-09-05: *"⛔ não aplique selo em todo item apenas porque
                    * existe um estado disponível"*.
                    *
                    * ⛔ Eu havia posto um. ⚠️ O título **já diz o estado em
                    * palavras** — *"A fonte diz para ⛔ não administrar"* —, ⛔ e o
                    * selo ao lado diria a mesma coisa uma segunda vez: ícone +
                    * cor + rótulo + borda para **uma** informação.
                    *
                    * ⚠️ O selo serve onde o estado ⛔ NÃO está no texto: item
                    * solto numa lista, ⛔ ou linha cujo rótulo é o nome do dado ⛔ e
                    * ⛔ não o juízo sobre ele.
                    */}
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
                {/**
                  * ⚠️⚠️ DUAS ÁREAS DE TOQUE NA MESMA LINHA — ⛔ e ⛔ isso ⛔ não é
                  * novo: é o padrão que `LinhaDeRelogio` já usa.
                  *
                  * ⛔ Relato do autor, 2026-09-06: *"essas coisas ⛔ não são
                  * utilizáveis, ⛔ não tem botão clicável, ⛔ não sei se é para
                  * ter"*. ⚠️ Era: a linha tinha cara de card ⛔ e o único
                  * controle era o ⓘ minúsculo.
                  *
                  * ⚠️ O texto leva ao **painel Paciente** — que a própria linha
                  * já nomeia como origem —, ⛔ e o ⓘ continua abrindo a
                  * explicação. ⛔ D **lê** esses fatos ⛔ e ⛔ não responde por
                  * eles (**E-09**).
                  */}
                <Pressable
                  style={e.linhaToque}
                  accessibilityRole="button"
                  accessibilityLabel={`${tr(l.curto)} — ${tr("abrir o painel do paciente")}`}
                  testID={`avc-leitura-abrir-${l.id}`}
                  onPress={onAbrirPaciente}
                >
                  <Text style={e.linhaRotulo} testID={`avc-leitura-curto-${l.id}`}>
                    {tr(l.curto)}
                  </Text>
                  <Text style={e.linhaSeta}>{SETA}</Text>
                </Pressable>
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
            style={[e.cabecalho, e.cabecalhoTocavel]}
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
    /**
     * ⚠️⚠️ ⛔ SÓ O CABEÇALHO QUE **RECOLHE** VIRA BOTÃO — 2026-09-06.
     *
     * ⛔ Pintar `cabecalho` inteiro daria cara de botão aos títulos que ⛔ não
     * fazem ⛔ nada quando tocados: ⛔ um controle mentiroso é pior que um
     * controle apagado, porque o médico toca, ⛔ nada acontece, ⛔ e ele passa a
     * desconfiar dos que **funcionam**.
     */
    cabecalhoTocavel: {
      minHeight: TOQUE.minimo,
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },

    cabecalhoNome: { flex: 1, minWidth: 0 },
    giradoParaBaixo: { transform: [{ rotate: "90deg" }] },
    grupoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    /** ⚠️ De onde o FATO vem — ⛔ e ⛔ não de quem é a autoridade bibliográfica. */
    procedencia: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },

    /**
     * ⚠️⚠️ LINHA VIROU **CARD**, ⛔ e o estado virou **selo** — 2026-09-06.
     *
     * ⛔ Relato do autor sobre a captura: *"tudo muito cinza ainda, tudo fica
     * parecido ⛔ e confunde"*. ⛔ Ele estava certo sobre o que via: o antecedente
     * ⛔ e o estado dele tinham o **mesmo tamanho ⛔ e quase o mesmo peso**, lado
     * a lado — ⛔ e a linha inteira lia como uma frase só.
     *
     * ⚠️ Agora o **antecedente** é o texto de leitura ⛔ e o **estado** é um selo
     * compacto: eles deixam de competir porque deixaram de ser a mesma coisa
     * visualmente.
     */
    linha: {
      flexDirection: "row", alignItems: "center", gap: ESPACO.sm,
      minHeight: TOQUE.minimo,
      backgroundColor: tema.cores.controlSurface,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.xs,
    },
    /** ⚠️ A área de toque do texto — ⛔ o ⓘ tem a dele, ⛔ e ⛔ elas ⛔ não se cruzam. */
    /**
     * ⚠️ Ela **navega** para o painel Paciente. ⛔ Sem corpo ⛔ e ⛔ sem seta,
     * ⛔ era um rótulo — ⛔ e ⛔ ninguém toca num rótulo.
     */
    linhaToque: {
      flex: 1,
      minWidth: 0,
      minHeight: TOQUE.minimo,
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.xs,
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      backgroundColor: tema.cores.controlSurface,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
    },
    linhaSeta: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700" },
    linhaRotulo: { flex: 1, minWidth: 0, color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize },
    /** ⚠️ Selo: menor que o rótulo, ⛔ e com moldura própria. */
    linhaEstado: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
      overflow: "hidden",
      borderRadius: RAIO.badge,
      borderWidth: 1,
      borderColor: tema.cores.border,
      backgroundColor: tema.cores.surface,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: 2,
      flexShrink: 0,
    },
    /**
     * ⚠️⚠️ ⛔ NÃO PERGUNTADO ⛔ NÃO É ALERTA — ⛔ e ⛔ não pode ser pintado.
     * ⛔ Nenhum campo desta superfície retém terapia (**E-49**), e vermelho que
     * ⛔ não é defeito ensina a ignorar vermelho.
     */
    /** ⚠️ Mais fraco que os outros dois — ⛔ e ⛔ nunca âmbar: ⛔ não é achado. */
    linhaEstadoVazio: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "600",
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
    /** ⚠️ ⛔ `wrap` ⛔ para o texto do ⓘ cair **⛔ na linha de baixo, inteiro** — ⛔ 2026-09-09. */
    itemTopo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs , flexWrap: "wrap" },
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
