/**
 * SUPERFÍCIE F · Reperfusão — a tela.
 *
 * ⚠️⚠️ O QUE ESTA TELA ⛔ NÃO PODE FAZER:
 *
 *   ⛔ **dar veredito.** ⛔ Não existe "pode trombolisar" aqui. A fonte ⛔ não
 *      sustenta esse juízo, e o núcleo foi construído para ⛔ não produzi-lo. A
 *      tela responde *qual é o caminho mais curto até saber*, ⛔ e nada além.
 *
 *   ⛔ **dizer "contraindicado".** COR 3 da fonte é *not recommended* ou
 *      *No Benefit*. A tela repete o verbo dela e ⛔ nunca o converte.
 *
 *   ⛔ **fundir relógios.** Todo prazo aparece com o nome do seu marco. ⛔ Não há
 *      contador global, ⛔ não há "a janela".
 *
 *   ⛔ **calcular dose sem peso**, ⛔ **estimar peso**, ⛔ ou deixar o cálculo
 *      parecer administração.
 *
 * ⚠️ A ORDEM E O AGRUPAMENTO ⛔ NÃO MORAM AQUI: são regras, e regra em JSX ⛔ não
 * se prova. Vivem em `avc/nucleo/apresentacao-f`, e esta tela apenas as lê.
 */
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ACAO_DE_TROMBOLISE,
  CAMPO_AGENTE,
  TROMBOLISE_IV,
  IVT_E_EVT_EM_PARALELO,
  PRINCIPIOS_GERAIS,
} from "../../avc/conteudo/superficie-f";
import {
  FALTAS_EM_PRIMEIRO_PLANO,
  faltasAgrupadas,
  itensDaTela,
  placar,
  type Faixa,
  type ItemDaTela,
  type LeituraDeRelogio,
} from "../../avc/nucleo/apresentacao-f";
import {
  doseDerivada,
  recomendacoesDoEstado,
  type OrigemDoPeso,
} from "../../avc/nucleo/derivacoes-f";
import { valorAtual, type EstadoAvc } from "../../avc/nucleo/estado";
import { instanciasDe, valorNaInstancia } from "../../avc/nucleo/instancia";
import { numeroCurto } from "../../avc/nucleo/formato";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { CabecalhoDeBloco, CampoDaSuperficie } from "./campos-clinicos";

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onIrParaCampo: (campo: string) => void;
  onNovaTrombolise: () => void;
  onEscolherNaInstancia: (instancia: string, campo: string, valor: string) => void;
  onHoraNaInstancia: (instancia: string, campo: string, valor: number) => void;
  onDesfazerNaInstancia: (instancia: string, campo: string) => void;
};

export default function SuperficieF({
  estado,
  agora,
  onEscolher,
  onIrParaCampo,
  onNovaTrombolise,
  onEscolherNaInstancia,
  onHoraNaInstancia,
  onDesfazerNaInstancia,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const [abertos, setAbertos] = useState<readonly string[]>([]);
  const alternar = (id: string) =>
    setAbertos((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  /**
   * ⚠️ Minutos desde um campo de hora. ⛔ Devolve `undefined` — ⛔ nunca zero —
   * quando o marco ⛔ não foi registrado: zero é uma contagem, ausência ⛔ não é.
   */
  const minutosDesdeCampo = useMemo(
    () => (campo: string) => {
      const f = valorAtual(estado, campo);
      const v = f?.valor;
      return typeof v === "number" && Number.isFinite(v)
        ? Math.max(0, Math.round((agora - v) / 60000))
        : undefined;
    },
    [estado, agora]
  );

  const itens = useMemo(
    () => itensDaTela(recomendacoesDoEstado(estado), minutosDesdeCampo),
    [estado, minutosDesdeCampo]
  );
  const faltas = useMemo(() => faltasAgrupadas(itens), [itens]);
  const naFaixa = (f: Faixa) => itens.filter((i) => i.faixa === f);

  const acoes = naFaixa("acao_com_relogio");
  const aplicaveis = naFaixa("aplicavel");
  const aUmDado = naFaixa("a_um_dado");
  const alertas = naFaixa("alerta_cor3");
  const semFonte = naFaixa("sem_fonte");
  const fora = naFaixa("fora");

  /** ⚠️ ⛔ Nenhum relógio correndo em recomendação ⛔ nenhuma — ⛔ nem uma. */
  const nenhumRelogioCorre = !itens.some((i) => i.relogios.some((r) => r.estado === "correndo"));

  const agente = String(valorAtual(estado, CAMPO_AGENTE.id)?.valor ?? "");
  /**
   * ⚠️⚠️ A ORIGEM DO PESO É TRADUZIDA UMA VEZ, AQUI, ⛔ e o rótulo da TELA
   * continua sendo **a palavra do campo** — ⛔ não a nossa.
   */
  const pesoBruto = valorAtual(estado, "peso")?.valor;
  const origemBruta = String(valorAtual(estado, "peso_origem")?.valor ?? "");
  const origem: OrigemDoPeso | undefined =
    origemBruta === "Estimado pela equipe"
      ? "estimado"
      : origemBruta === "Informado pelo paciente ou família"
        ? "informado"
        : undefined;
  const agenteDose =
    agente === "Alteplase" ? "alteplase" : agente === "Tenecteplase" ? "tenecteplase" : undefined;
  const dose =
    agenteDose !== undefined
      ? doseDerivada(agenteDose, typeof pesoBruto === "number" ? pesoBruto : undefined, origem)
      : undefined;

  return (
    <View style={e.raiz} testID="avc-superficie-f-conteudo">
      {/**
        * ⚠️⚠️ A FAIXA DE PARALELISMO ⛔ NUNCA SAI DA TELA.
        *
        * ⛔ Esconder uma das raias faria o médico ler sequência ou exclusão onde
        * a fonte grada COR 1 · LOE A que ⛔ **não** há nenhuma das duas.
        */}
      <View style={e.paralelo} testID="avc-f-paralelismo">
        <Text style={e.paraleloGrau}>
          {tr("COR")} {IVT_E_EVT_EM_PARALELO.cor} · {tr("LOE")} {IVT_E_EVT_EM_PARALELO.loe}
        </Text>
        <Text style={e.paraleloTexto}>
          {tr("Trombólise e trombectomia correm em paralelo — uma não atrasa a outra.")}
        </Text>
      </View>

      {/* ── as duas raias, compactas, sempre visíveis ───────────────────── */}
      <View style={e.raias} testID="avc-f-raias">
        <Raia titulo={tr("Trombólise")} itens={itens} terapia="ivt" testID="avc-f-raia-ivt" />
        <Raia titulo={tr("Trombectomia")} itens={itens} terapia="evt" testID="avc-f-raia-evt" />
      </View>

      {/**
        * ⚠️⚠️ ⛔ NENHUM RELÓGIO CORRENDO — e isso precisa APARECER.
        *
        * ⚠️ Sem este aviso, a tela do paciente vazio ⛔ não mostra relógio
        * ⛔ nenhum, ⛔ e o dado mais urgente do AVC fica invisível até que outra
        * coisa apareça. Encontrado na revisão em largura de celular.
        *
        * ⛔ E ele ⛔ **não** é um contador global: ⛔ não traz número, ⛔ não traz
        * janela ⛔ e ⛔ não soma marcos. É um convite a registrar **os marcos**,
        * no plural — que é o oposto de fundi-los em "a janela".
        */}
      {nenhumRelogioCorre ? (
        <Pressable
          style={e.semRelogio}
          accessibilityRole="button"
          testID="avc-f-sem-relogio"
          onPress={() => onIrParaCampo("hora_ultima_vez_bem")}
        >
          <Text style={e.semRelogioTitulo}>{tr("Nenhum relógio iniciado")}</Text>
          <Text style={e.semRelogioTexto}>
            {tr("Registrar os marcos de tempo em Entrada e estabilização.")}
          </Text>
        </Pressable>
      ) : null}

      {/* ── 1 · ação com relógio correndo ────────────────────────────────── */}
      {acoes.length > 0 ? (
        <View style={e.grupo} testID="avc-f-faixa-acao">
          <CabecalhoDeBloco titulo={tr("Com prazo correndo")} testID="avc-f-bloco-acao" />
          {acoes.map((i) => (
            <Cartao key={i.leitura.id} item={i} aberto={abertos.includes(i.leitura.id)}
              onAlternar={() => alternar(i.leitura.id)} onIrParaCampo={onIrParaCampo} />
          ))}
        </View>
      ) : null}

      {/* ── 2 · aplicável sem prazo correndo ─────────────────────────────── */}
      {aplicaveis.length > 0 ? (
        <View style={e.grupo} testID="avc-f-faixa-aplicavel">
          <CabecalhoDeBloco titulo={tr("Aplicáveis a este paciente")} testID="avc-f-bloco-aplicavel" />
          {aplicaveis.map((i) => (
            <Cartao key={i.leitura.id} item={i} aberto={abertos.includes(i.leitura.id)}
              onAlternar={() => alternar(i.leitura.id)} onIrParaCampo={onIrParaCampo} />
          ))}
        </View>
      ) : null}

      {/* ── 3 · a um dado de fechar ──────────────────────────────────────── */}
      {aUmDado.length > 0 ? (
        <View style={e.grupo} testID="avc-f-faixa-um-dado">
          <CabecalhoDeBloco titulo={tr("Falta um dado para fechar")} testID="avc-f-bloco-um-dado" />
          {aUmDado.map((i) => (
            <Cartao key={i.leitura.id} item={i} aberto={abertos.includes(i.leitura.id)}
              onAlternar={() => alternar(i.leitura.id)} onIrParaCampo={onIrParaCampo} />
          ))}
        </View>
      ) : null}

      {/* ── 4 · alerta COR 3, só quando a população bate ─────────────────── */}
      {alertas.length > 0 ? (
        <View style={e.grupo} testID="avc-f-faixa-cor3">
          <CabecalhoDeBloco titulo={tr("Alertas para este contexto")} testID="avc-f-bloco-cor3" />
          {alertas.map((i) => (
            <Cartao key={i.leitura.id} item={i} aberto={abertos.includes(i.leitura.id)}
              onAlternar={() => alternar(i.leitura.id)} onIrParaCampo={onIrParaCampo} />
          ))}
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ 5 · O AGRUPAMENTO PELA FALTA — a decisão central da tela.
        *
        * ⛔ Uma linha por **dado**, ⛔ e ⛔ não por recomendação. A frase clínica é
        * o que se lê; a contagem fica pequena, porque "abre 11" é informação de
        * arquitetura, ⛔ e ⛔ não de medicina.
        */}
      {faltas.length > 0 ? (
        <View style={e.grupo} testID="avc-f-faltas">
          <CabecalhoDeBloco titulo={tr("O que falta colher")} testID="avc-f-bloco-faltas" />
          {(abertos.includes("__faltas__")
            ? faltas
            : faltas.slice(0, FALTAS_EM_PRIMEIRO_PLANO)
          ).map((f) => (
            <Pressable
              key={f.insumo}
              style={e.falta}
              accessibilityRole="button"
              testID={`avc-f-falta-${f.insumo}`}
              disabled={f.campos.length === 0}
              onPress={() => (f.campos[0] ? onIrParaCampo(f.campos[0]) : undefined)}
            >
              <View style={e.faltaTexto}>
                <Text style={e.faltaMotivo}>{tr(f.motivo)}</Text>
                <Text style={e.faltaQuantas} testID={`avc-f-falta-quantas-${f.insumo}`}>
                  {f.quantas === 1
                    ? tr("1 recomendação depende deste dado")
                    : `${f.quantas} ${tr("recomendações dependem deste dado")}`}
                </Text>
              </View>
              <Text style={e.faltaSeta}>›</Text>
            </Pressable>
          ))}
          {faltas.length > FALTAS_EM_PRIMEIRO_PLANO ? (
            <Pressable
              style={e.foraBotao}
              accessibilityRole="button"
              testID="avc-f-faltas-resto"
              onPress={() => alternar("__faltas__")}
            >
              <Text style={e.foraTexto}>
                {abertos.includes("__faltas__")
                  ? tr("Recolher os demais dados")
                  : `${faltas.length - FALTAS_EM_PRIMEIRO_PLANO} ${tr("outros dados destravam menos")}`}
              </Text>
              <Text style={e.faltaSeta}>{abertos.includes("__faltas__") ? "⌃" : "⌄"}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ 6 · DÍVIDA DE FONTE — visível, ⛔ e COMPACTA.
        *
        * ⛔ Ocupar meia tela para dizer que o app ⛔ não sabe transformaria a
        * dívida em protagonista. Marcador curto; a explicação abre ao toque.
        */}
      {semFonte.length > 0 ? (
        <View style={e.grupo} testID="avc-f-sem-fonte">
          {semFonte.map((i) => {
            const aberto = abertos.includes(i.leitura.id);
            return (
              <Pressable
                key={i.leitura.id}
                style={e.divida}
                accessibilityRole="button"
                testID={`avc-f-divida-${i.leitura.id}`}
                onPress={() => alternar(i.leitura.id)}
              >
                <View style={e.dividaTopo}>
                  <Text style={e.dividaMarcador}>{tr("Critério não definido pela fonte")}</Text>
                  <Text style={e.dividaGrau}>
                    {tr("COR")} {i.leitura.cor} · {i.leitura.terapia === "ivt" ? tr("Trombólise") : tr("Trombectomia")}
                  </Text>
                </View>
                <Text style={e.dividaPopulacao}>{tr(i.leitura.populacao)}</Text>
                {aberto ? (
                  <View style={e.dividaDetalhe} testID={`avc-f-divida-detalhe-${i.leitura.id}`}>
                    <Text style={e.dividaTexto}>
                      {tr(
                        "A diretriz não define este critério, então o app não conclui por você. Isto não é dado faltando do paciente, e não é falha do app."
                      )}
                    </Text>
                    <Text style={e.dividaSlot}>
                      {tr("Slot")} {i.leitura.travadaPor} · {i.leitura.localizacao}
                    </Text>
                    <Relogios relogios={i.relogios} onIrParaCampo={onIrParaCampo} />
                  </View>
                ) : (
                  <Text style={e.dividaAbrir}>{tr("Toque para entender por quê")}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/* ── agente e dose ────────────────────────────────────────────────── */}
      <View style={e.grupo} testID="avc-f-agente">
        <CabecalhoDeBloco titulo={tr(CAMPO_AGENTE.rotulo)} testID="avc-f-bloco-agente" />
        <View style={e.opcoes}>
          {CAMPO_AGENTE.opcoes.map((op) => {
            const on = agente === op;
            return (
              <Pressable
                key={op}
                style={[e.opcao, on ? e.opcaoAtiva : null]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                testID={`avc-f-agente-${op}`}
                onPress={() => onEscolher(CAMPO_AGENTE.id, op)}
              >
                <Text style={[e.opcaoTexto, on ? e.opcaoTextoAtivo : null]}>{tr(op)}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={e.agenteNota}>{tr(CAMPO_AGENTE.nota)}</Text>

        {/**
          * ⚠️⚠️ O CÁLCULO ⛔ NÃO É A ADMINISTRAÇÃO — e a tela diz isso ⛔ antes de
          * mostrar qualquer número. ⛔ Sem peso ⛔ não há dose: o app ⛔ não estima.
          */}
        <View style={e.dose} testID="avc-f-dose">
          <Text style={e.doseRotulo}>{tr("Cálculo de dose — não é administração")}</Text>
          {dose ? (
            <>
              <Text style={e.doseValor} testID="avc-f-dose-valor">
                {dose.totalMg} {tr("mg")}
              </Text>
              <Text style={e.doseSub}>
                {tr(dose.agente === "alteplase" ? "Alteplase" : "Tenecteplase")}{" "}
                {dose.mgPorKg} {tr("mg/kg")} · {tr("máx.")} {dose.maximoMg} {tr("mg")}
              </Text>
              <Text style={e.doseSub} testID="avc-f-dose-origem">
                {tr("peso")} {dose.pesoKg} {tr("kg")} — {tr(origemBruta)}
              </Text>
            </>
          ) : (
            <Text style={e.doseVazia} testID="avc-f-dose-vazia">
              {tr(
                "Sem peso registrado e sem agente escolhido, não há dose. O app não estima peso."
              )}
            </Text>
          )}
        </View>
      </View>

      {/**
        * ⚠️⚠️ A AÇÃO DE TROMBÓLISE — ⛔ DECIDIR ⛔ NÃO É ADMINISTRAR.
        *
        * ⚠️ A cadeia é: recomendação → decisão do agente → **ação** → monitorização
        * (Superfície G). ⛔ Sem esta ação registrada, a Table 7 ⛔ nunca aparece —
        * ⛔ e o app ⛔ não presume trombólise porque um critério ficou aplicável.
        *
        * ⚠️⚠️ O agente aqui é o **efetivamente utilizado**, ⛔ e ⛔ não corrige o
        * agente em consideração: os dois podem divergir, ⛔ e a trilha guarda os dois.
        */}
      <View style={e.grupo} testID="avc-f-acao-trombolise">
        <CabecalhoDeBloco titulo={tr("Trombólise administrada")} testID="avc-f-bloco-acao-ivt" />
        {instanciasDe(estado, TROMBOLISE_IV).map((inst, i) => (
          <View key={inst} style={e.cartao} testID={`avc-f-trombolise-${inst}`}>
            <Text style={e.grau}>
              {tr("Administração")} {i + 1}
            </Text>
            {ACAO_DE_TROMBOLISE.map((campo) => (
              <CampoDaSuperficie
                key={`${inst}-${campo.id}`}
                campo={{ ...campo, casa: "reperfusao" }}
                casaAtual="reperfusao"
                bruto={String(valorNaInstancia(estado, inst, campo.id)?.valor ?? "")}
                numero={
                  typeof valorNaInstancia(estado, inst, campo.id)?.valor === "number"
                    ? (valorNaInstancia(estado, inst, campo.id)?.valor as number)
                    : undefined
                }
                agora={agora}
                detalheAberto={false}
                onAlternarDetalhe={() => undefined}
                onEscolher={(c, v) => onEscolherNaInstancia(inst, c, v)}
                onMedir={() => undefined}
                onHora={(c, v) => onHoraNaInstancia(inst, c, v)}
                onDesfazer={(c) => onDesfazerNaInstancia(inst, c)}
              />
            ))}
          </View>
        ))}
        <Pressable
          style={e.opcao}
          accessibilityRole="button"
          testID="avc-nova-trombolise"
          onPress={onNovaTrombolise}
        >
          <Text style={e.opcaoTexto}>{tr("Registrar administração")}</Text>
        </Pressable>
      </View>

      {/**
        * ⚠️⚠️ PRINCÍPIO GERAL — ⛔ NÃO recebe veredito de correspondência.
        *
        * ⛔ Ele ⛔ não afirma que se aplica a este paciente; pressupõe elegibilidade
        * ⛔ e diz respeito à condução do tratamento. Fica embaixo, com procedência.
        */}
      <View style={e.grupo} testID="avc-f-principios">
        <CabecalhoDeBloco titulo={tr("Princípio geral")} testID="avc-f-bloco-principios" />
        {PRINCIPIOS_GERAIS.map((g) => (
          <View key={g.id} style={e.principio} testID={`avc-f-principio-${g.id}`}>
            <Text style={e.grau}>
              {tr("COR")} {g.cor} · {tr("LOE")} {g.loe}
            </Text>
            <Text style={e.verbo}>“{g.verbo}”</Text>
            <Text style={e.principioPressupoe}>
              {tr("Pressupõe")}: {tr(g.pressupoe)}. {tr("Não afirma corresponder a este caso.")}
            </Text>
            <Text style={e.fonte}>{g.localizacao}</Text>
          </View>
        ))}
      </View>

      {/* ── 7 · fora da população, recolhidas ────────────────────────────── */}
      {fora.length > 0 ? (
        <View style={e.grupo} testID="avc-f-fora">
          <Pressable
            style={e.foraBotao}
            accessibilityRole="button"
            testID="avc-f-fora-abrir"
            onPress={() => alternar("__fora__")}
          >
            <Text style={e.foraTexto}>
              {fora.length}{" "}
              {fora.length === 1
                ? tr("recomendação não corresponde a este paciente")
                : tr("recomendações não correspondem a este paciente")}
            </Text>
            <Text style={e.faltaSeta}>{abertos.includes("__fora__") ? "⌃" : "⌄"}</Text>
          </Pressable>
          {abertos.includes("__fora__")
            ? fora.map((i) => (
                <View key={i.leitura.id} style={e.foraItem} testID={`avc-f-fora-${i.leitura.id}`}>
                  <Text style={e.foraPopulacao}>{tr(i.leitura.populacao)}</Text>
                  {/**
                    * ⚠️ DIZ **POR QUE** SAIU. "Não corresponde" sem o motivo é o app
                    * pedindo confiança cega.
                    */}
                  <Text style={e.foraMotivo}>
                    {tr("Fora por")}: {i.leitura.incompativeis.map((x) => tr(x)).join(", ")}
                  </Text>
                </View>
              ))
            : null}
        </View>
      ) : null}
    </View>
  );
}

/* ── raia compacta ──────────────────────────────────────────────────────── */

function Raia({
  titulo,
  itens,
  terapia,
  testID,
}: {
  titulo: string;
  itens: readonly ItemDaTela[];
  terapia: "ivt" | "evt";
  testID: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const p = placar(itens, terapia);
  const aplicaveis = p.acao_com_relogio + p.aplicavel;
  const potenciais = p.a_um_dado + p.potencial_recolhida;

  return (
    <View style={e.raia} testID={testID}>
      <Text style={e.raiaTitulo}>{titulo}</Text>
      <View style={e.raiaLinha}>
        <Text style={e.raiaNumeroAplicavel} testID={`${testID}-aplicaveis`}>{aplicaveis}</Text>
        <Text style={e.raiaRotulo}>{tr("aplicáveis")}</Text>
      </View>
      <View style={e.raiaLinha}>
        <Text style={e.raiaNumeroPotencial} testID={`${testID}-potenciais`}>{potenciais}</Text>
        <Text style={e.raiaRotulo}>{tr("potenciais")}</Text>
      </View>
      {p.sem_fonte > 0 ? (
        <View style={e.raiaLinha}>
          <Text style={e.raiaNumeroDivida} testID={`${testID}-sem-fonte`}>{p.sem_fonte}</Text>
          <Text style={e.raiaRotulo}>{tr("sem critério na fonte")}</Text>
        </View>
      ) : null}
    </View>
  );
}

/* ── cartão de recomendação ─────────────────────────────────────────────── */

function Cartao({
  item,
  aberto,
  onAlternar,
  onIrParaCampo,
}: {
  item: ItemDaTela;
  aberto: boolean;
  onAlternar: () => void;
  onIrParaCampo: (campo: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const { leitura } = item;
  const alerta = item.faixa === "alerta_cor3";

  return (
    <Pressable
      style={[e.cartao, alerta ? e.cartaoAlerta : null]}
      accessibilityRole="button"
      testID={`avc-f-rec-${leitura.id}`}
      onPress={onAlternar}
    >
      <Text style={[e.grau, alerta ? e.grauAlerta : null]}>
        {tr("COR")} {leitura.cor} · {tr("LOE")} {leitura.loe} ·{" "}
        {leitura.terapia === "ivt" ? tr("Trombólise") : tr("Trombectomia")}
      </Text>
      <Text style={e.populacao}>{tr(leitura.populacao)}</Text>
      {/**
        * ⚠️⚠️ O VERBO DA FONTE, EM INGLÊS, ⛔ SEM TRADUÇÃO E ⛔ SEM CONVERSÃO.
        * ⛔ *not recommended* ⛔ nunca vira "contraindicado" (§6.14, E-45).
        */}
      <Text style={e.verbo}>“{leitura.verbo}”</Text>

      <Relogios relogios={item.relogios} onIrParaCampo={onIrParaCampo} />

      {leitura.faltam.length > 0 ? (
        <Text style={e.falta1} testID={`avc-f-rec-falta-${leitura.id}`}>
          {tr("Falta")}: {leitura.faltam.map((x) => tr(x)).join(", ")}
        </Text>
      ) : null}

      {aberto ? (
        <View style={e.detalhe} testID={`avc-f-rec-detalhe-${leitura.id}`}>
          {leitura.sustentam.length > 0 ? (
            <Text style={e.sustentam}>
              {tr("Sustentam")}: {leitura.sustentam.map((x) => tr(x)).join(", ")}
            </Text>
          ) : null}
          <Text style={e.fonte}>
            {leitura.localizacao} · {tr("slot")} {leitura.slot}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/* ── relógios ───────────────────────────────────────────────────────────── */

function Relogios({
  relogios,
  onIrParaCampo,
}: {
  relogios: readonly LeituraDeRelogio[];
  onIrParaCampo: (campo: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  if (relogios.length === 0) return null;

  return (
    <>
      {relogios.map((r, i) => (
        /**
         * ⚠️⚠️ TODO PRAZO MOSTRA O NOME DO SEU RELÓGIO — E-36.
         *
         * ⛔ Uma recomendação pode ter DOIS relógios simultâneos, com marcos e
         * faixas diferentes. Eles aparecem empilhados, ⛔ nunca fundidos.
         */
        <View key={`${r.marco}-${r.campo ?? i}`} style={e.relogio} testID={`avc-f-relogio-${r.marco}-${i}`}>
          <View style={e.relogioEsq}>
            <Text style={e.relogioMarco}>{tr(r.rotulo)}</Text>
            {/**
              * ⚠️ Vírgula, ⛔ e ⛔ não ponto: `4.5 h` ⛔ não é como se escreve
              * meia hora em PT-BR ⛔ nem em ES. O formatador já existia no app.
              */}
            <Text style={e.relogioFaixa}>
              {typeof r.deHoras === "number" ? `${numeroCurto(r.deHoras, 0.1)}–` : ""}
              {numeroCurto(r.ateHoras, r.ateHoras % 1 === 0 ? 1 : 0.1)} {tr("h")}
            </Text>
          </View>
          {r.estado === "correndo" ? (
            <Text
              style={[e.relogioTempo, (r.restantesMin ?? 0) <= 60 ? e.relogioApertado : null]}
              testID={`avc-f-relogio-tempo-${r.marco}-${i}`}
            >
              {formatarRestante(r.restantesMin ?? 0, tr)}
            </Text>
          ) : r.estado === "sem_campo" ? (
            /** ⚠️⚠️ A fonte nomeia o marco ⛔ e o app ⛔ não tem onde guardá-lo. */
            <Text style={e.relogioSemCampo} testID={`avc-f-relogio-sem-campo-${r.marco}`}>
              {tr("marco sem campo no app")}
            </Text>
          ) : (
            <Pressable
              accessibilityRole="button"
              testID={`avc-f-relogio-registrar-${r.marco}`}
              onPress={() => (r.campo ? onIrParaCampo(r.campo) : undefined)}
            >
              <Text style={e.relogioSemMarco}>{tr("registrar o marco")}</Text>
            </Pressable>
          )}
        </View>
      ))}
    </>
  );
}

/**
 * ⚠️ Janela vencida ⛔ não some ⛔ e ⛔ não vira zero — ela diz que venceu, porque
 * a recomendação continua existindo e a decisão continua sendo do médico.
 */
function formatarRestante(min: number, tr: (pt: string) => string): string {
  if (min <= 0) return tr("janela vencida");
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${m} ${tr("min")}`;
}

/* ── estilos ────────────────────────────────────────────────────────────── */

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },

    paralelo: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.primary,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    paraleloGrau: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    paraleloTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },

    raias: { flexDirection: "row", gap: ESPACO.sm },
    raia: {
      flex: 1,
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    raiaTitulo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    raiaLinha: { flexDirection: "row", alignItems: "baseline", gap: ESPACO.xs },
    raiaNumeroAplicavel: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.step.fontSize,
      fontWeight: "700",
    },
    raiaNumeroPotencial: {
      color: tema.cores.warning,
      fontSize: TIPOGRAFIA.step.fontSize,
      fontWeight: "700",
    },
    raiaNumeroDivida: {
      color: tema.cores.debt,
      fontSize: TIPOGRAFIA.step.fontSize,
      fontWeight: "700",
    },
    raiaRotulo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    grupo: { gap: ESPACO.sm },

    semRelogio: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    semRelogioTitulo: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
    semRelogioTexto: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
    },

    cartao: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    cartaoAlerta: { borderColor: tema.cores.warning },
    grau: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    grauAlerta: { color: tema.cores.warning },
    populacao: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
    verbo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontStyle: "italic",
    },
    falta1: { color: tema.cores.warning, fontSize: TIPOGRAFIA.caption.fontSize },
    detalhe: { gap: ESPACO.xs, paddingTop: ESPACO.xs },
    sustentam: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    fonte: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    relogio: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      padding: ESPACO.xs,
    },
    relogioEsq: { flex: 1 },
    relogioMarco: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "600",
    },
    relogioFaixa: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    relogioTempo: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
    relogioApertado: { color: tema.cores.warning },
    relogioSemMarco: { color: tema.cores.primary, fontSize: TIPOGRAFIA.micro.fontSize },
    relogioSemCampo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    falta: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.warning,
      padding: ESPACO.sm,
    },
    faltaTexto: { flex: 1, gap: ESPACO.xs },
    /** ⚠️ A frase clínica é a grande; a contagem é a pequena. */
    faltaMotivo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
    faltaQuantas: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    faltaSeta: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },

    divida: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.debt,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    dividaTopo: { flexDirection: "row", justifyContent: "space-between", gap: ESPACO.xs },
    dividaMarcador: {
      color: tema.cores.debt,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
      flex: 1,
    },
    dividaGrau: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    dividaPopulacao: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    dividaAbrir: { color: tema.cores.debt, fontSize: TIPOGRAFIA.micro.fontSize },
    dividaDetalhe: { gap: ESPACO.xs, paddingTop: ESPACO.xs },
    dividaTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    dividaSlot: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    opcoes: { flexDirection: "row", gap: ESPACO.xs },
    opcao: {
      flex: 1,
      alignItems: "center",
      paddingVertical: ESPACO.sm,
      paddingHorizontal: ESPACO.xs,
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
    },
    opcaoAtiva: { borderColor: tema.cores.primary },
    opcaoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    opcaoTextoAtivo: { color: tema.cores.primary, fontWeight: "700" },
    agenteNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },

    dose: {
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    doseRotulo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    doseValor: { color: tema.cores.text, fontSize: TIPOGRAFIA.title.fontSize, fontWeight: "700" },
    doseSub: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    doseVazia: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },

    principio: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    principioPressupoe: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
    },

    foraBotao: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
    },
    foraTexto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize, flex: 1 },
    foraItem: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    foraPopulacao: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    foraMotivo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
  });
