/**
 * SUPERFÍCIE G · Destino — a tela.
 *
 * ⚠️⚠️ ESTA TELA MOSTRA POUCO, ⛔ E DIZ POR QUE É POUCO.
 *
 * ⚠️ Em F o risco era despejar 17 recomendações. Aqui é o oposto: com **dois**
 * enunciados, a tentação é preencher o vazio com logística que a diretriz
 * ⛔ nunca escreveu. ⛔ Transferência, regulação e conduta pós-EVT ⛔ não estão
 * aqui **de propósito**.
 *
 * ⚠️⚠️ A DECISÃO CENTRAL: **a ausência de grau é ESCRITA, ⛔ e ⛔ não sugerida.**
 *
 * ⛔ Se a Table 7 aparecesse só com estilo mais apagado, leria como
 * *"recomendação mais fraca"* — ⛔ e ⛔ não é isso: é **outra espécie de
 * enunciado**. Estilo lê como hierarquia; texto lê como categoria. Por isso o
 * selo com a frase da ausência aparece **nos dois** blocos que vêm da tabela.
 *
 * ⛔ ⛔ E a fronteira: *"⛔ não há recurso aqui"* ⛔ NUNCA vira *"terapia ⛔ não
 * indicada"*. O contexto operacional é bloco próprio, no fim, com a frase da
 * fronteira no topo.
 */
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  DESTINOS_RECOMENDADOS,
  FATOS_OPERACIONAIS,
  LACUNA_POS_EVT,
  REGRAS_DE_DESTINO,
} from "../../avc/conteudo/superficie-g";
import {
  contextoOperacional,
  estadoPressoricoPosIvt,
  faseDaMonitorizacao,
  monitorizacaoPosIvt,
  pertinenciaDaMonitorizacao,
  saidaDeFluxo,
} from "../../avc/nucleo/derivacoes-g";
import { valorAtual, type EstadoAvc } from "../../avc/nucleo/estado";
import { ESTADOS, type EstadoClinico } from "../../design-system/estados-clinicos";
import { numeroCurto } from "../../avc/nucleo/formato";
import type { SuperficieId } from "../../avc/nucleo/tipos";
import type { Relogio } from "../../avc/nucleo/relogio";
import { sinteseDoCaso } from "../../avc/nucleo/sintese-do-caso";
import { acaoPendente } from "../../avc/conteudo/rotulos-clinicos";
import { ClinicalCard, SectionTitle, WarningCard } from "./sistema";
import { ChecklistTimeline } from "./sistema/blocos";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { useTr } from "../../lib/use-tr";
import { CabecalhoDeBloco } from "./campos-clinicos";

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onIrParaCampo: (campo: string) => void;
  /**
   * ⚠️ Abre a superfície-destino do módulo hemorrágico (PD-36). G ⛔ não decide
   * QUAL — quem decide é a Imagem (`saida.saida`); G só oferece a porta quando o
   * módulo existe.
   */
  onAbrirSuperficie: (id: SuperficieId) => void;
  /** ⚠️ Quem sabe quais pendências existem é o módulo — ⛔ não esta tela (I6). */
  pendencias: readonly { readonly id: string; readonly campo: string }[];
  relogio: Relogio;
};

/**
 * ⚠️⚠️ O SELO DA TABELA — repetido de propósito nos DOIS blocos.
 *
 * ⚠️ Decisão do autor, 2026-08-31: a repetição ⛔ não é ruído. A regra de
 * internação ⛔ e a monitorização vêm da **mesma** tabela operacional, ⛔ e o
 * médico ⛔ não pode inferir que uma ganhou grau por estar mais destacada.
 */
function SeloDaTabela() {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View style={e.selo} testID="avc-g-selo-table7">
      <Text style={e.seloTag}>{tr("TABLE 7")}</Text>
      <Text style={e.seloTexto}>{tr("a fonte não atribui COR/LOE")}</Text>
    </View>
  );
}

/**
 * ⚠️⚠️ ⛔ CADA ESTADO NOMEIA **A AFERIÇÃO ATUAL** — ⛔ e ⛔ nenhum deles fala do
 * período. ⛔ *"Dentro do alvo na aferição atual"* ⛔ é a frase inteira; ⛔ cortar
 * *"na aferição atual"* transformaria uma medida num período (item 2).
 */
const FRASE_DA_PA: Readonly<Record<string, string>> = {
  dentro_do_alvo: "Dentro do alvo na aferição atual",
  acima_do_alvo: "Acima do alvo na aferição atual",
  afericao_incompleta: "Aferição incompleta — complete para classificar",
  sem_pa: "Nenhuma pressão arterial registrada",
  sem_horario_ivt: "Sem o horário da trombólise, a janela não é conhecida",
  fora_da_janela: "Fora da janela de 24 horas em que esta regra se aplica",
};

/** ⚠️ ⛔ Símbolo ⛔ e palavra — ⛔ e ⛔ nenhum ✓ fora de *dentro do alvo*. */
const SIMBOLO_DA_PA: Readonly<Record<string, EstadoClinico>> = {
  dentro_do_alvo: "favoravel",
  acima_do_alvo: "corrigivel",
  afericao_incompleta: "andamento",
  sem_pa: "verificar",
  sem_horario_ivt: "verificar",
  fora_da_janela: "ausente",
};

/** ⚠️ ⛔ O que aparece no lugar do número quando ⛔ não há aferição completa. */
const SEM_VALOR_DE_PA: Readonly<Record<string, string>> = {
  afericao_incompleta: "aferição pela metade",
  sem_pa: "não informada",
  sem_horario_ivt: "—",
  fora_da_janela: "—",
};

export default function SuperficieG({
  estado,
  agora,
  onEscolher,
  onIrParaCampo,
  onAbrirSuperficie,
  pendencias,
  relogio,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);

  const pertinencia = useMemo(() => pertinenciaDaMonitorizacao(estado), [estado]);
  const tabela = useMemo(() => monitorizacaoPosIvt(estado), [estado]);
  const fase = useMemo(() => faseDaMonitorizacao(estado, agora), [estado, agora]);
  /**
   * ⚠️⚠️ ⛔ O CONTROLE PRESSÓRICO VEM PRONTO DO NÚCLEO — Fase 8, 2026-09-07.
   *
   * ⛔ A tela ⛔ não compara número ⛔ nenhum: `<` ⛔ ou `≤`, as duas metades, a
   * janela de 24 h ⛔ e o contexto ⛔ são decisão clínica, ⛔ e vivem em
   * `estadoPressoricoPosIvt()` — ⛔ com prova de fronteira.
   */
  const pressao = useMemo(() => estadoPressoricoPosIvt(estado, agora), [estado, agora]);
  const saida = useMemo(() => saidaDeFluxo(estado), [estado]);
  const contexto = useMemo(() => contextoOperacional(estado), [estado]);
  /**
   * ⚠️⚠️ A SÍNTESE — ⛔ e ⛔ ela ⛔ não pergunta ⛔ nada (PD-37).
   *
   * ⚠️ Destino deixou de ser *"a última página do formulário"*: ⛔ ele ⛔ não tem
   * campo próprio ⛔ e ⛔ não repete o que o médico já viu. Ele responde
   * *"com tudo o que o sistema já sabe, o que eu preciso saber ⛔ e fazer agora?"*
   */
  const sintese = useMemo(
    () => sinteseDoCaso(estado, relogio, pendencias),
    [estado, relogio, pendencias]
  );

  return (
    <View style={e.raiz} testID="avc-superficie-g-conteudo">
      {/* ── 0 · A SÍNTESE DO CASO — o que o sistema já sabe ─────────────── */}
      {sintese.situacao.length > 0 ? (
        <View style={e.grupo} testID="avc-g-sintese-situacao">
          <SectionTitle testID="avc-g-bloco-situacao">Situação atual</SectionTitle>
          <ClinicalCard testID="avc-g-situacao">
            {sintese.situacao.map((l) => (
              <Text key={l.id} style={e.sinteseLinha} testID={`avc-g-situacao-${l.id}`}>
                {tr(l.texto)}
              </Text>
            ))}
          </ClinicalCard>
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ INDICADO ⛔ ≠ REALIZADO — ⛔ e a tela diz qual é qual **em palavra**.
        *
        * ⛔ Ler *"Tenecteplase"* ⛔ e entender *"já foi administrada"* é o pior
        * erro que esta superfície poderia induzir. ⚠️ A natureza vem do domínio
        * (`iniciada`/`realizada`), ⛔ e ⛔ não de suposição da tela.
        */}
      {sintese.condutas.length > 0 ? (
        <View style={e.grupo} testID="avc-g-sintese-conduta">
          <SectionTitle testID="avc-g-bloco-conduta">Conduta</SectionTitle>
          {/**
            * ⚠️⚠️ A LINHA DO TEMPO DAS REFERÊNCIAS — ⛔ e ⛔ ela ⛔ não achata a
            * distinção que esta superfície existe para manter.
            *
            * ⚠️ **Realizada** ganha o círculo verde com ✓ ⛔ e o horário; ⛔
            * **indicada** fica com o círculo vazio ⛔ e a palavra *"indicada"*.
            * ⛔ Marcar as duas como feitas seria transformar *"trombólise
            * indicada"* em *"trombólise administrada"* — o pior erro possível
            * aqui, ⛔ e agora ele seria cometido **pelo desenho**.
            */}
          <ChecklistTimeline
            testID="avc-g-conduta"
            itens={sintese.condutas.map((c) => ({
              id: c.id,
              titulo: c.texto,
              detalhe: c.natureza === "realizada" ? "Administrada" : "Indicada, ainda não administrada",
              estado: c.natureza === "realizada" ? ("feito" as const) : ("pendente" as const),
              horario: c.horario,
            }))}
          />
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ A ÁREA MAIS IMPORTANTE DA SUPERFÍCIE (autor, 2026-09-05): ⛔ não é
        * texto genérico de diretriz — é **o próximo passo deste paciente**.
        */}
      {sintese.proximaAcao.length > 0 ? (
        <View style={e.grupo} testID="avc-g-sintese-proxima">
          <SectionTitle testID="avc-g-bloco-proxima">Próxima ação</SectionTitle>
          {sintese.proximaAcao.map((l) => (
            <WarningCard
              key={l.id}
              nivel="atencao"
              titulo={l.texto}
              testID={`avc-g-proxima-${l.id}`}
            />
          ))}
        </View>
      ) : null}

      {/**
        * ⚠️ Pendência dita como **ação clínica**, ⛔ e ⛔ nunca como nome de campo
        * — `acaoPendente()` é a fonte única (`rotulos-clinicos.ts`).
        */}
      {sintese.pendencias.length > 0 ? (
        <View style={e.grupo} testID="avc-g-sintese-pendencias">
          <SectionTitle testID="avc-g-bloco-pendencias">Pendências</SectionTitle>
          {/**
            * ⚠️ Círculo **vazio**, ⛔ e ⛔ nunca âmbar: pendência é trabalho
            * ⛔ ainda ⛔ não feito, ⛔ e ⛔ não um achado ruim (**E-37**).
            */}
          <ChecklistTimeline
            testID="avc-g-pendencias"
            itens={sintese.pendencias.map((p) => ({
              id: p.id,
              titulo: acaoPendente(p.campo),
              estado: "pendente" as const,
            }))}
          />
        </View>
      ) : null}

      {/* ── 1 · recomendação graduada ──────────────────────────────────── */}
      <View style={e.grupo} testID="avc-g-recomendados">
        <CabecalhoDeBloco titulo={tr("Recomendação da diretriz")} testID="avc-g-bloco-rec" />
        {DESTINOS_RECOMENDADOS.map((d) => (
          <View key={d.id} style={e.rec} testID={`avc-g-rec-${d.id}`}>
            <Text style={e.grau} testID={`avc-g-grau-${d.id}`}>
              {tr("COR")} {d.cor} · {tr("LOE")} {d.loe}
            </Text>
            <Text style={e.titulo}>{tr(d.rotulo)}</Text>
            {/** ⚠️ Verbatim em inglês — ⛔ verbatim ⛔ não se traduz (§6.14). */}
            <Text style={e.verbo}>“{d.verbo}”</Text>
            {d.nota ? <Text style={e.nota}>{tr(d.nota)}</Text> : null}
            <Text style={e.fonte}>
              {d.localizacao} · {tr("slot")} {d.slot}
            </Text>
          </View>
        ))}
      </View>

      {/* ── 2 · regra operacional da Table 7 ───────────────────────────── */}
      <View style={e.grupo} testID="avc-g-operacionais">
        <CabecalhoDeBloco titulo={tr("Conduta operacional da tabela")} testID="avc-g-bloco-op" />
        {REGRAS_DE_DESTINO.map((r) => (
          <View key={r.id} style={e.op} testID={`avc-g-op-${r.id}`}>
            <SeloDaTabela />
            {/**
              * ⚠️⚠️ O **"OU"** É DA FONTE. ⛔ *"intensive care OR stroke unit"* —
              * exigir UTI pediria recurso mais escasso do que o enunciado pede.
              */}
            <Text style={e.titulo}>{tr(r.texto)}</Text>
            <Text style={e.fonte}>
              {r.localizacao} · {tr(r.populacao)}
            </Text>
          </View>
        ))}
      </View>

      {/**
        * ⚠️⚠️ 3 · MONITORIZAÇÃO — ⛔ SÓ QUANDO HÁ CONTEXTO PÓS-IVT.
        *
        * ⛔ Exibi-la a quem ⛔ não recebeu trombólise faria a Table 7 parecer
        * conduta geral do AVC. ⚠️ E o bloco ⛔ **não some** quando falta o
        * horário: o paciente continua em contexto pós-trombólise.
        */}
      {pertinencia.pertinente && tabela ? (
        <View style={e.grupo} testID="avc-g-monitorizacao">
          <CabecalhoDeBloco
            titulo={tr("Monitorização pós-trombólise")}
            testID="avc-g-bloco-monitorizacao"
          />
          <View style={e.mon}>
            <SeloDaTabela />

            {/**
              * ⚠️⚠️ FASE ⛔ NÃO É PERTINÊNCIA. Os três estados, ⛔ e ⛔ nenhum
              * deles apaga o contexto.
              */}
            {fase?.tipo === "fase" ? (
              <View style={e.faixaAtiva} testID="avc-g-fase-atual">
                <View style={e.faixaEsq}>
                  <Text style={e.faixaRotulo}>{tr("Fase atual")}</Text>
                  <Text style={e.faixaValor}>
                    {tabela.oQueSeMede.map((x) => tr(x)).join(" · ")}
                  </Text>
                </View>
                <Text style={e.faixaNumero}>
                  {fase.aCadaMin} {tr("min")}
                </Text>
              </View>
            ) : fase?.tipo === "sem_horario" ? (
              <Pressable
                style={e.faixaPendente}
                accessibilityRole="button"
                testID="avc-g-fase-sem-horario"
                onPress={() => onIrParaCampo(fase.campo)}
              >
                <View style={e.faixaEsq}>
                  <Text style={e.faixaRotuloPendente}>{tr("Contexto pós-trombólise")}</Text>
                  <Text style={e.faixaValor}>
                    {pertinencia.motivo === "iniciada"
                      ? tr("Trombólise iniciada")
                      : tr("Trombólise realizada")}
                  </Text>
                </View>
                <Text style={e.faixaPendenteTexto}>
                  {tr("falta o horário de início — toque para registrar")}
                </Text>
              </Pressable>
            ) : (
              /**
               * ⚠️⚠️ ⛔ 24 h ENCERRAM A TABELA, ⛔ E ⛔ NÃO A PERTINÊNCIA.
               *
               * ⛔ O contexto pós-trombólise continua afirmado na tela: quem
               * recebeu trombólise segue tendo recebido.
               */
              <View style={e.faixaFora} testID="avc-g-fase-fora">
                <View style={e.faixaEsq}>
                  <Text style={e.faixaRotuloFora}>{tr("Contexto pós-trombólise")}</Text>
                  <Text style={e.faixaValor}>
                    {pertinencia.motivo === "iniciada"
                      ? tr("Trombólise iniciada")
                      : tr("Trombólise realizada")}
                  </Text>
                </View>
                <Text style={e.faixaForaTexto}>{tr("fora da janela da tabela")}</Text>
              </View>
            )}

            {/**
              * ── ⚠️⚠️ ⛔ O CONTROLE PRESSÓRICO — ⛔ A MEDIDA, ⛔ E ⛔ NÃO O PERÍODO ──
              *
              * ⚠️ Regra do autor, 2026-09-07 (**item 2**): ⛔ uma PA adequada
              * **agora** ⛔ não autoriza escrever *"controlada por 24 h"*
              * ⛔ nem *"controle mantido"*. ⚠️ ⛔ Afirmar manutenção exigiria a
              * **série inteira** do período, ⛔ e o app ⛔ não a tem.
              *
              * ⛔ ⛔ Por isso o rótulo diz **"na aferição atual"** — ⛔ e ⛔ ele
              * ⛔ não é enfeite: ⛔ é o que separa um estado de medida de uma
              * afirmação sobre a evolução.
              */}
            {pressao ? (
              <View style={e.pa} testID={`avc-g-pa-${pressao.estado}`}>
                <View style={e.paLinha}>
                  <Text style={e.paRotulo}>{tr("PA atual")}</Text>
                  <Text style={e.paValor} testID="avc-g-pa-valor">
                    {pressao.pas !== undefined && pressao.pad !== undefined
                      ? `${pressao.pas}/${pressao.pad} mmHg`
                      : tr(SEM_VALOR_DE_PA[pressao.estado] ?? "—")}
                  </Text>
                </View>
                <Text style={e.paEstado} testID="avc-g-pa-estado">
                  {ESTADOS[SIMBOLO_DA_PA[pressao.estado]].simbolo}{" "}
                  {tr(FRASE_DA_PA[pressao.estado])}
                </Text>
                {/**
                  * ⚠️⚠️ ⛔ A REGRA VIGENTE, ⛔ COM CONTEXTO ⛔ E GRAU — ⛔ e ⛔ nunca
                  * *"Meta PA"* (item 1). ⛔ O número sozinho apagaria **quando**
                  * ⛔ ele vale, ⛔ e ⛔ há quatro estatutos pressóricos diferentes.
                  */}
                <Text style={e.paRegra} testID="avc-g-pa-regra">
                  {tr(pressao.alvo.frase)} · {tr(pressao.contexto)} · {tr("COR")}{" "}
                  {pressao.cor} · {tr("LOE")} {pressao.loe}
                </Text>
              </View>
            ) : null}

            {/**
              * ⚠️⚠️ AS TRÊS FASES SEMPRE VISÍVEIS — decisão do autor.
              *
              * ⚠️ Ver 15 → 30 → 60 ajuda a antecipar o que vem. ⛔ Sem horário,
              * ⛔ nenhuma fica ativa; ⛔ e ⛔ nenhuma some.
              */}
            <View style={e.fases} testID="avc-g-fases">
              {tabela.fases.map((f) => {
                const ativa = fase?.tipo === "fase" && fase.deHoras === f.deHoras;
                return (
                  <View
                    key={f.deHoras}
                    style={[e.faseCel, ativa ? e.faseCelAtiva : null]}
                    testID={`avc-g-fase-${f.deHoras}${ativa ? "-ativa" : ""}`}
                  >
                    <Text style={[e.faseHoras, ativa ? e.faseTextoAtivo : null]}>
                      {numeroCurto(f.deHoras, 1)}–{numeroCurto(f.ateHoras, 1)} {tr("h")}
                    </Text>
                    <Text style={[e.faseMin, ativa ? e.faseTextoAtivo : null]}>{f.aCadaMin}</Text>
                  </View>
                );
              })}
            </View>

            {/**
              * ⚠️⚠️ GATILHOS DE DETERIORAÇÃO EM **LISTA**, ⛔ e ⛔ não em
              * parágrafo — decisão do autor, 2026-08-31.
              *
              * ⛔ Em texto corrido o olho passa por cima, ⛔ e isto é conteúdo de
              * **resposta rápida**. ⚠️ A consequência fica SEPARADA abaixo.
              */}
            <View style={e.deterioracao} testID="avc-g-deterioracao">
              <Text style={e.deterioracaoTitulo}>{tr("Sinais de deterioração")}</Text>
              {tabela.deterioracao.sinais.map((s) => (
                <Text key={s} style={e.sinal} testID={`avc-g-sinal-${s}`}>
                  · {tr(s)}
                </Text>
              ))}
              <View style={e.condutas} testID="avc-g-condutas">
                {tabela.deterioracao.condutas.map((c) => (
                  <Text key={c} style={e.conduta}>
                    → {tr(c)}
                  </Text>
                ))}
              </View>
            </View>

            <View style={e.linha}>
              <Text style={e.linhaChave}>{tr("Adiar")}</Text>
              <Text style={e.linhaValor}>
                {tabela.adiar.itens.map((x) => tr(x)).join(", ")} — {tr(tabela.adiar.condicao)}
              </Text>
            </View>
            <View style={e.linha}>
              <Text style={e.linhaChave}>{tr("Imagem de controle")}</Text>
              <Text style={e.linhaValor}>{tr(tabela.imagemDeControle.texto)}</Text>
            </View>
            <View style={e.linha}>
              <Text style={e.linhaChave}>{tr("Pressão arterial")}</Text>
              <Text style={e.linhaValor}>
                {tr("Acima de")} {tabela.gatilhoPressorico.origem.pas}/
                {tabela.gatilhoPressorico.origem.pad}: {tr(tabela.gatilhoPressorico.conduta)}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ 4 · A LACUNA PÓS-EVT — compacta, ⛔ e ⛔ sem número ⛔ nenhum.
        *
        * ⛔ Ela informa a ausência ⛔ e ⛔ não a preenche. ⛔ Copiar o esquema
        * pós-IVT por analogia é o que **E-31** proíbe.
        */}
      <View style={e.lacuna} testID="avc-g-lacuna-pos-evt">
        <Text style={e.lacunaTitulo}>{tr("Pós-trombectomia")}</Text>
        <Text style={e.lacunaTexto}>{tr(LACUNA_POS_EVT.texto)}</Text>
      </View>

      {/**
        * ⚠️⚠️ 5 · SAÍDA DE FLUXO — produzida em **Imagem**, ⛔ e ⛔ não aqui.
        *
        * ⛔ G ⛔ não decide se há hemorragia: quem lê imagem é C. Reimplementar
        * daria duas respostas para a mesma pergunta (I6).
        */}
      {saida ? (
        <View style={e.grupo} testID="avc-g-saida">
          <CabecalhoDeBloco titulo={tr("Saída de fluxo")} testID="avc-g-bloco-saida" />
          <View style={e.saidaCartao} testID={`avc-g-saida-${saida.saida}`}>
            <Text style={e.titulo}>{tr(saida.modulo)}</Text>
            <Text style={e.nota}>{tr(saida.oQueAcontece)}</Text>
            <Text style={e.fonte}>
              {tr("produzido em Imagem")}
              {saida.moduloExiste ? "" : ` · ${tr("o módulo ainda não existe")}`}
            </Text>
            {/**
              * ⚠️ A PORTA PARA O MÓDULO HEMORRÁGICO (PD-36). Só aparece quando o
              * módulo existe. G ⛔ não escolhe qual — a Imagem já decidiu em
              * `saida.saida`; aqui só se traduz o destino para a superfície.
              */}
            {saida.moduloExiste ? (
              <Pressable
                style={e.saidaBotao}
                accessibilityRole="button"
                accessibilityLabel={tr("Abrir o catálogo de recomendações deste módulo")}
                testID={`avc-g-abrir-${saida.saida}`}
                onPress={() =>
                  onAbrirSuperficie(saida.saida === "hemorragia_intracraniana" ? "hic" : "hsa")
                }
              >
                <Text style={e.saidaBotaoTexto}>{tr("Abrir recomendações")}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ 6 · CONTEXTO OPERACIONAL — POR ÚLTIMO, ⛔ E SEPARADO.
        *
        * ⛔ ⛔ ⛔ **⛔ NENHUMA resposta daqui chega à Superfície F.** A frase da
        * fronteira fica no topo do bloco, ⛔ e ⛔ não escondida numa nota: é ela
        * que impede geografia de virar critério clínico (F-03 §12).
        */}
      <View style={e.operacional} testID="avc-g-contexto-operacional">
        <Text style={e.operacionalTitulo}>{tr("Capacidade deste serviço")}</Text>
        <Text style={e.operacionalFronteira}>
          {tr(
            "Contexto operacional. Não altera indicação clínica nem elegibilidade a nenhuma terapia."
          )}
        </Text>
        {FATOS_OPERACIONAIS.map((f) => {
          const bruto = String(valorAtual(estado, f.id)?.valor ?? "");
          const lido = contexto.find((l) => l.id === f.id);
          return (
            <View key={f.id} style={e.pergunta} testID={`avc-g-fato-${f.id}`}>
              <Text style={e.perguntaTexto}>{tr(f.rotulo)}</Text>
              <View style={e.opcoes}>
                {f.opcoes.map((op) => {
                  const marcada = bruto === valorGravado(op);
                  return (
                    <Pressable
                      key={op}
                      style={[e.opcao, marcada ? e.opcaoAtiva : null]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: marcada }}
                      testID={`avc-g-opcao-${f.id}-${valorGravado(op)}`}
                      onPress={() => onEscolher(f.id, valorGravado(op))}
                    >
                      <Text style={[e.opcaoTexto, marcada ? e.opcaoTextoAtivo : null]}>
                        {tr(op)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {/**
                * ⚠️ A nota aparece ⛔ só quando o recurso foi negado — ⛔ e é ela
                * que nomeia o que aquilo é: indisponibilidade **operacional**.
                */}
              {lido?.estado === "indisponivel" ? (
                <Text style={e.operacionalNota} testID={`avc-g-nota-${f.id}`}>
                  {tr(f.nota)}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/**
 * ⚠️ O valor que a tela GRAVA — ⛔ e ⛔ não o rótulo.
 *
 * ⛔ O estado ⛔ nunca guarda `"Sim"`. Escrever o rótulo aqui repetiria o defeito
 * que a Superfície F já pagou: a leitura comparava rótulo, o estado tinha slug,
 * ⛔ e ⛔ nada funcionava ⛔ enquanto as provas passavam.
 */
function valorGravado(opcao: string): string {
  if (opcao === "Sim") return "sim";
  if (opcao === "Não") return "nao";
  return "nao_sei";
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    grupo: { gap: ESPACO.sm },

    /** ⚠️ Recomendação graduada — borda cheia, cor de identidade. */
    rec: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.primary,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    grau: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    titulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
    verbo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontStyle: "italic",
    },
    nota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    fonte: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    /**
     * ⚠️⚠️ Regra de tabela — borda TRACEJADA e fundo recuado. ⛔ Mas o que
     * carrega a distinção é o SELO em texto, ⛔ e ⛔ não estes pixels.
     */
    op: {
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    selo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    seloTag: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
      borderWidth: 1,
      borderColor: tema.cores.border,
      borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.xs,
    },
    seloTexto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    /** ⚠️ ⛔ O bloco pressórico — ⛔ densidade da tabela, ⛔ e ⛔ sem cara de veredito. */
    pa: { gap: 2, paddingVertical: ESPACO.xs },
    paLinha: { flexDirection: "row", alignItems: "baseline", gap: ESPACO.xs },
    paRotulo: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    paValor: { ...PAPEL.metrica, color: tema.cores.text, flexShrink: 1 },
    paEstado: { ...PAPEL.textoPrincipal, color: tema.cores.text, flexShrink: 1 },
    /** ⚠️ ⛔ A regra vigente quebra em linhas — ⛔ cortada, ⛔ ela perde o contexto. */
    paRegra: { ...PAPEL.legenda, color: tema.cores.textSecondary, flexShrink: 1 },
    mon: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.sm,
    },
    faixaEsq: { flex: 1, gap: 2 },
    faixaRotulo: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    faixaRotuloPendente: {
      color: tema.cores.warning,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    faixaRotuloFora: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    faixaValor: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize, fontWeight: "600" },
    faixaAtiva: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.primary,
      padding: ESPACO.sm,
    },
    faixaNumero: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.step.fontSize,
      fontWeight: "700",
    },
    faixaPendente: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.warning,
      padding: ESPACO.sm,
    },
    faixaPendenteTexto: {
      color: tema.cores.warning,
      fontSize: TIPOGRAFIA.micro.fontSize,
      flexShrink: 1,
      textAlign: "right",
    },
    faixaFora: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
    },
    faixaForaTexto: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      flexShrink: 1,
      textAlign: "right",
    },

    fases: { flexDirection: "row", gap: ESPACO.xs },
    faseCel: {
      flex: 1,
      alignItems: "center",
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      paddingVertical: ESPACO.xs,
    },
    faseCelAtiva: { borderColor: tema.cores.primary },
    faseHoras: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    faseMin: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
    faseTextoAtivo: { color: tema.cores.primary },

    deterioracao: {
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.warning,
      padding: ESPACO.sm,
      gap: 2,
    },
    deterioracaoTitulo: {
      color: tema.cores.warning,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
      marginBottom: ESPACO.xs,
    },
    /** ⚠️ Uma linha por sinal — ⛔ parágrafo corrido esconde o quarto item. */
    sinal: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    condutas: {
      marginTop: ESPACO.xs,
      paddingTop: ESPACO.xs,
      borderTopWidth: 1,
      borderTopColor: tema.cores.border,
      gap: 2,
    },
    conduta: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "600",
    },

    linha: { gap: 2 },
    linhaChave: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    linhaValor: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },

    lacuna: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.debt,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    lacunaTitulo: {
      color: tema.cores.debt,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    lacunaTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },

    sinteseLinha: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    saidaCartao: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    saidaBotao: {
      marginTop: ESPACO.xs,
      minHeight: TOQUE.minimo,
      backgroundColor: tema.cores.primary,
      borderRadius: RAIO.botao,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
    },
    saidaBotaoTexto: {
      color: tema.cores.onPrimary,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },

    operacional: {
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.sm,
    },
    operacionalTitulo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    operacionalFronteira: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      paddingBottom: ESPACO.xs,
      borderBottomWidth: 1,
      borderBottomColor: tema.cores.border,
    },
    pergunta: { gap: ESPACO.xs },
    perguntaTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    opcoes: { flexDirection: "row", gap: ESPACO.xs },
    opcao: {
      flex: 1,
      alignItems: "center",
      paddingVertical: ESPACO.sm,
      backgroundColor: tema.cores.controlSurface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.controlBorder,
    },
    opcaoAtiva: { borderColor: tema.cores.textSecondary },
    opcaoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    opcaoTextoAtivo: { fontWeight: "700" },
    operacionalNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
  });
