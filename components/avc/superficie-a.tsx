/**
 * SUPERFÍCIE A · Entrada e estabilização — a tela.
 *
 * ⛔ NENHUMA medicina nasce aqui. Campos vêm de `avc/conteudo/superficie-a.ts`,
 * leituras vêm de `avc/nucleo/derivacoes.ts`, e esta camada só desenha (E-29).
 *
 * ⚠️ O que a tela precisa mostrar sem inventar:
 *   · os três estados de resposta distinguíveis (E-37);
 *   · toda leitura com os insumos e a fonte que a produziram (E-22, E-30);
 *   · ⛔ nenhum campo obrigatório (E-49) — a superfície não trava nada.
 *
 * ⚠️ OS CONTROLES SAÍRAM DAQUI (2026-08-28) e moram em `campos-clinicos.tsx`,
 * partilhados com a Superfície B. As sete lições que a revisão de tela produziu
 * — barra em vez de só −/+, ARIA de rádio, rascunho, "não informado" que ⛔ não
 * parece número — passariam a existir em duas versões, e a próxima correção
 * acertaria uma delas. O **relógio** ficou: ele é exclusivo desta superfície.
 */
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GRUPOS_A, TODOS_OS_CAMPOS_A, type CampoA } from "../../avc/conteudo/superficie-a";
import { leiturasDaSuperficieA } from "../../avc/nucleo/derivacoes";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorAtual } from "../../avc/nucleo/estado";
import { horaDeExibicao } from "../../avc/nucleo/formato";
import {
  BotaoDeInfo,
  CabecalhoDeBloco,
  CampoDeEscolha,
  CampoDeGrandeza,
  CampoDeMultipla,
  DetalheDoCampo,
  PainelDeLeituras,
  useDetalhes,
} from "./campos-clinicos";
import SeletorDeHora from "./seletor-de-hora";
import { getPalette } from "../../design-system/paleta-de-area";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

type Props = {
  estado: EstadoAvc;
  /** "Agora", lido pelo dono pela porta única de Q-01. ⛔ Nenhum relógio aqui. */
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  /** ⚠️ Desfazer é operação de primeira classe (§7.16) — ⛔ não apaga, corrige. */
  onDesfazer: (campo: string) => void;
};

/** ⚠️ A mesma paleta de área do hub e do resumo — ⛔ nenhum hexadecimal aqui. */
const AREA_AVC = getPalette("AVC");

export default function SuperficieA({
  estado,
  agora,
  onEscolher,
  onMedir,
  onHora,
  onDesfazer,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const leituras = leiturasDaSuperficieA(estado);
  const detalhes = useDetalhes();

  /**
   * O horário sendo editado, antes de virar fato. ⛔ Nada é gravado até confirmar.
   *
   * ⚠️ `selecionado` distingue **posição do controle** de **valor escolhido**.
   * Sem ele, abrir o seletor já valeria como resposta — e "agora" viraria o
   * default silencioso de um campo que decide janela terapêutica.
   */
  const [editandoHora, setEditandoHora] = useState<
    { campo: string; instante: number; selecionado: boolean } | null
  >(null);

  const rotuloDoCampo = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of TODOS_OS_CAMPOS_A) m[c.id] = c.rotulo;
    return m;
  }, []);

  function numeroGravado(id: string): number | undefined {
    const f = valorAtual(estado, id);
    return typeof f?.valor === "number" ? f.valor : undefined;
  }

  function instanteGravado(id: string): number | undefined {
    const f = valorAtual(estado, id);
    return typeof f?.valor === "number" ? f.valor : undefined;
  }

  /** ⚠️ "Ninguém sabe dizer" — ⛔ diferente de não ter sido perguntado (E-02). */
  function marcadoDesconhecido(id: string): boolean {
    return String(valorAtual(estado, id)?.valor ?? "") === "nao_sei";
  }

  // ── RELÓGIO: linha compacta, ⛔ nunca um cartão ───────────────────────────
  function LinhaDeRelogio({ campo }: { campo: CampoA }) {
    const gravado = instanteGravado(campo.id);
    const desconhecido = marcadoDesconhecido(campo.id);
    const editando = editandoHora?.campo === campo.id;

    /**
     * ⚠️⚠️ O BOTÃO PRECISA PARECER UM BOTÃO — relato do autor usando o app em
     * 2026-08-28: *"botões ruins de selecionar, não intuitivos, tem que ficar
     * procurando onde tem que clicar"*, e *"fala última vez visto bem mas não dá
     * opção de indeterminado"*.
     *
     * ── O DEFEITO MEDIDO NA TELA ────────────────────────────────────────────
     *
     * A opção de desconhecido EXISTIA e ⛔ não se via: as duas ações eram texto
     * cinza em itálico — `registrar` e `desconhecido` — sem borda, sem fundo,
     * sem verbo. Numa tela de emergência, uma ação que ⛔ não se anuncia é uma
     * ação que ⛔ não existe: o médico lê "desconhecido" como legenda do estado
     * do campo, ⛔ não como resposta que ele pode dar.
     *
     * ⚠️ E o rótulo mudou junto: "desconhecido" descrevia o SISTEMA; **"Sem essa
     * informação"** descreve o que o médico está afirmando — que é o que E-02
     * chama de resposta com consequência própria.
     *
     * ⚠️ ⛔ NUNCA `String(instante)`: era daqui que saía o `1787922516903`.
     */
    const botaoDoValor = (
      <Pressable
        style={[e.relogioAcao, gravado !== undefined && e.relogioAcaoInformada]}
        accessibilityRole="button"
        accessibilityLabel={`${tr(campo.rotulo)}: ${
          gravado === undefined ? tr("não informado") : horaDeExibicao(gravado, agora)
        }`}
        testID={`avc-hora-${campo.id}`}
        onPress={() =>
          setEditandoHora(
            editando
              ? null
              : {
                  campo: campo.id,
                  // ⚠️ Posiciona em `agora` por ergonomia quando não há marco —
                  // ⛔ mas isso NÃO é seleção (ver `selecionado` abaixo).
                  instante: gravado ?? agora,
                  /**
                   * ⚠️ REEDITAR ⛔ NÃO É INFORMAR PELA PRIMEIRA VEZ. Se já existe
                   * um marco registrado, ele É um valor escolhido, e Confirmar
                   * nasce habilitado — exigir novo toque ali obrigaria o médico
                   * a mexer num horário correto só para reconfirmá-lo.
                   */
                  selecionado: gravado !== undefined,
                }
          )
        }
      >
        <Text style={e.relogioValor} testID={`avc-hora-valor-${campo.id}`}>
          {gravado !== undefined
            ? `✓ ${horaDeExibicao(gravado, agora)} ✎`
            : tr("Informar horário")}
        </Text>
      </Pressable>
    );

    /**
     * ⚠️⚠️ DESCONHECIDO É RESPOSTA, e precisa de um BOTÃO VISÍVEL — §7.5 item 6 e
     * **E-02**, cujo exemplo canônico é exatamente este campo.
     *
     * ⚠️ Aqui é clínico: último-visto-bem desconhecido ⛔ não é lacuna de
     * anamnese, é o cenário de seleção por imagem — ele MUDA caminho.
     *
     * ⛔ AINDA NÃO IMPLEMENTADAS: `AO ACORDAR (wake-up)` e `MESMO HORÁRIO DE
     * OUTRO EVENTO` (esta exige a cópia com linhagem de P-08). Este botão ⛔ não
     * as substitui.
     */
    const botaoDesconhecido = campo.aceitaDesconhecido ? (
      <Pressable
        style={[e.relogioAcao, desconhecido && e.relogioAcaoAtiva]}
        accessibilityRole="radio"
        aria-checked={desconhecido}
        accessibilityLabel={`${tr(campo.rotulo)}: ${tr("Sem essa informação")}`}
        testID={`avc-hora-desconhecido-${campo.id}`}
        /**
         * ⚠️⚠️ TOCAR DE NOVO DESFAZ — relato do autor, 2026-08-28: *"cliquei em
         * sem informação e não consigo desmarcar isso"*. Era verdade: a resposta
         * entrava e ⛔ não havia saída, num campo que decide caminho (o cenário de
         * seleção por imagem). ⚠️ Desfazer ⛔ não apaga: corrige, e a trilha guarda
         * as duas passagens.
         */
        onPress={() => (desconhecido ? onDesfazer(campo.id) : onEscolher(campo.id, "nao_sei"))}
      >
        <Text style={[e.relogioValor, desconhecido && e.relogioAcaoAtivaTexto]}>
          {desconhecido ? "✓ " : ""}
          {tr("Sem essa informação")}
        </Text>
      </Pressable>
    ) : null;

    /**
     * ⚠️⚠️ O RELÓGIO GANHOU A MOLDURA DOS DEMAIS CAMPOS (2026-08-28). Ele era a
     * única coisa da tela sem cartão: uma linha solta no meio de campos
     * emoldurados. ⛔ Um ritmo só na página ⛔ não é estética — é o que permite ao
     * olho parcelar a tela em unidades em vez de ler tudo como um bloco.
     */
    const respondido = gravado !== undefined || desconhecido;
    return (
      <View
        style={[e.campo, respondido && e.campoRespondido]}
        testID={`avc-campo-${campo.id}`}
      >
        {/**
         * ⚠️ O RÓTULO TEM A LINHA DELE, E AS AÇÕES TÊM A DELAS. Espremidos na
         * mesma linha, os quatro nomes de marco truncavam — e os quatro relógios
         * existem por serem DIFERENTES: truncados, viram iguais. Com as ações
         * embaixo, o botão ganha largura de verbo ("Informar horário") em vez de
         * caber só uma palavra cinza.
         */}
        <View style={e.relogioLinha}>
          <Text style={[e.marca, respondido && e.marcaAtiva]} accessibilityElementsHidden>
            {respondido ? "✓" : "○"}
          </Text>
          <Text style={e.relogioRotulo} numberOfLines={2}>
            {tr(campo.rotulo)}
          </Text>
          <BotaoDeInfo id={campo.id} onPress={() => detalhes.alternar(campo.id)} />
        </View>

        <View style={e.relogioAcoes}>
          {botaoDoValor}
          {botaoDesconhecido}
        </View>

        {detalhes.aberto(campo.id) ? <DetalheDoCampo campo={campo} /> : null}

        {editando ? (
          <SeletorDeHora
            rotulo={campo.rotulo}
            instante={editandoHora.instante}
            // ⚠️ Qualquer movimento em hora/minuto — e o "Agora" nomeado — é
            // interação explícita. ⛔ Abrir o seletor não é.
            selecionado={editandoHora.selecionado}
            agora={agora}
            onMudar={(i) => setEditandoHora({ campo: campo.id, instante: i, selecionado: true })}
            onConfirmar={() => {
              onHora(campo.id, editandoHora.instante, campo.relogio);
              setEditandoHora(null);
            }}
            onCancelar={() => setEditandoHora(null)}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={e.raiz} testID="avc-superficie-a-conteudo">
      {GRUPOS_A.map((grupo) => (
        <View key={grupo.id} style={e.grupo} testID={`avc-grupo-${grupo.id}`}>
          <CabecalhoDeBloco titulo={grupo.titulo} testID={`avc-bloco-${grupo.id}`} />
          {grupo.campos.map((campo) =>
            campo.tipo === "hora" ? (
              <LinhaDeRelogio key={campo.id} campo={campo} />
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
            ) : campo.tipo === "multipla" ? (
              <CampoDeMultipla
                key={campo.id}
                campo={campo}
                bruto={String(valorAtual(estado, campo.id)?.valor ?? "")}
                detalheAberto={detalhes.aberto(campo.id)}
                onAlternarDetalhe={() => detalhes.alternar(campo.id)}
                onEscolher={onEscolher}
                onDesfazer={onDesfazer}
              />
            ) : (
              <CampoDeEscolha
                key={campo.id}
                campo={campo}
                bruto={String(valorAtual(estado, campo.id)?.valor ?? "")}
                detalheAberto={detalhes.aberto(campo.id)}
                onAlternarDetalhe={() => detalhes.alternar(campo.id)}
                onEscolher={onEscolher}
                onDesfazer={onDesfazer}
              />
            )
          )}
        </View>
      ))}

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

    // ── relógio: mesmo cartão dos demais campos ─────────────────────────────
    campo: {
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      padding: ESPACO.sm, gap: ESPACO.xs,
      borderWidth: 1, borderColor: tema.cores.border,
      borderLeftWidth: 4, borderLeftColor: tema.cores.border,
    },
    campoRespondido: { borderLeftColor: AREA_AVC.accent },
    marca: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize, width: 16, textAlign: "center" },
    marcaAtiva: { color: tema.cores.text, fontWeight: "800" },
    relogioLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs, minHeight: TOQUE.minimo },
    relogioRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, flex: 1, minWidth: 120 },
    // ⚠️ `flexShrink` no VALOR e não no rótulo: entre encurtar "não informado"
    // e encurtar o nome do marco, quem cede é o texto genérico.
    relogioValor: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600", flexShrink: 1 },
    relogioAcoes: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
    relogioAcaoAtiva: { backgroundColor: tema.cores.primary, borderColor: tema.cores.primary },
    relogioAcaoAtivaTexto: { color: tema.cores.onPrimary, fontWeight: "700" },
    /** ⚠️ Marco já informado fica com a borda da identidade — ⛔ sem depender só dela. */
    relogioAcaoInformada: { borderColor: tema.cores.primary },
    relogioAcao: {
      minHeight: TOQUE.minimo, justifyContent: "center",
      paddingHorizontal: ESPACO.md, paddingVertical: ESPACO.sm,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
  });
