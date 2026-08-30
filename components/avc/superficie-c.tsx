/**
 * SUPERFÍCIE C · Imagem — a tela.
 *
 * ⛔ NENHUMA medicina nasce aqui. Campos vêm de `avc/conteudo/superficie-c.ts`,
 * leituras vêm de `avc/nucleo/derivacoes-c.ts`, e esta camada só desenha (E-29).
 *
 * ⚠️⚠️ O QUE ESTA TELA NÃO PODE FAZER, e por quê:
 *
 *   ⛔ **mandar o médico para dois lugares ao mesmo tempo.** Os fatos coexistem
 *      — tomografia com hemorragia E suspeita de HSA —, mas **destino é um só**
 *      (decisão do autor, 2026-08-29). Quem resolve a prioridade é
 *      `destinoDaImagem()`; a tela ⛔ não escolhe, ⛔ ela desenha o que veio.
 *
 *   ⛔ **cronometrar.** ⛔ Nenhuma contagem a partir do horário da tomografia,
 *      ⛔ nenhuma meta de 25 minutos, ⛔ nenhum aviso de atraso (**R2.5**, 🚫 #3):
 *      *"as rapidly as possible (eg…)"* é recomendação de protocolo
 *      institucional, ⛔ não meta deste paciente.
 *
 *   ⛔ **cobrar preenchimento.** ⛔ Nenhum campo é obrigatório, ⛔ não há barra de
 *      progresso, e ⛔ nenhuma pendência daqui retém terapia (E-49).
 *
 *   ⛔ **concluir elegibilidade.** O dossiê endovascular diz **quais dados
 *      existem** (**PD-24**) — ⛔ nunca se o paciente é candidato.
 */
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ESTUDO_C,
  EPISODIO_C,
  TODOS_OS_CAMPOS_C,
  achadosDaModalidade,
} from "../../avc/conteudo/superficie-c";
import { destinoDaImagem, estudos, leiturasDaSuperficieC } from "../../avc/nucleo/derivacoes-c";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorAtual } from "../../avc/nucleo/estado";
import { valorNaInstancia } from "../../avc/nucleo/instancia";
import {
  CabecalhoDeBloco,
  CampoDaSuperficie,
  PainelDeLeituras,
  useDetalhes,
} from "./campos-clinicos";
import { horaDeExibicao } from "../../avc/nucleo/formato";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

type Props = {
  estado: EstadoAvc;
  /** "Agora", lido pelo dono pela porta única de Q-01. ⛔ Nenhum relógio aqui. */
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onDesfazer: (campo: string) => void;
  /** ⚠️ Registro NUM ESTUDO específico — a tela sabe em qual o médico tocou. */
  onEscolherNoEstudo: (estudo: string, campo: string, valor: string) => void;
  onMedirNoEstudo: (estudo: string, campo: string, valor: number) => void;
  onHoraNoEstudo: (estudo: string, campo: string, instante: number) => void;
  onCorrigirNoEstudo: (estudo: string, campo: string, valor: string | number) => void;
  onDesfazerNoEstudo: (estudo: string, campo: string) => void;
  onNovoEstudo: () => void;
};

export default function SuperficieC({
  estado,
  agora,
  onEscolher,
  onHora,
  onMedir,
  onDesfazer,
  onEscolherNoEstudo,
  onMedirNoEstudo,
  onHoraNoEstudo,
  onCorrigirNoEstudo,
  onDesfazerNoEstudo,
  onNovoEstudo,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  /** ⚠️ Estado de TELA — ⛔ não clínico: abrir bloco ⛔ não registra nada (E-20). */
  const [abertos, setAbertos] = useState<readonly string[]>([]);
  /** ⚠️ Estado de TELA: recolher estudo antigo ⛔ não apaga ⛔ nem registra nada. */
  const [estudosAbertos, setEstudosAbertos] = useState<readonly string[]>([]);
  /** ⚠️ Ver o contrato de correção: entrar ⛔ não grava, **cancelar ⛔ não grava**. */
  const [corrigindo, setCorrigindo] = useState<readonly string[]>([]);
  const emCorrecao = (est: string, campo: string) => corrigindo.includes(`${est}-${campo}`);
  const alternarCorrecao = (est: string, campo: string) =>
    setCorrigindo((c) =>
      c.includes(`${est}-${campo}`)
        ? c.filter((x) => x !== `${est}-${campo}`)
        : [...c, `${est}-${campo}`]
    );
  const lista = estudos(estado);
  const leituras = leiturasDaSuperficieC(estado);
  const destino = destinoDaImagem(estado);
  const detalhes = useDetalhes();

  const rotuloDoCampo = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of TODOS_OS_CAMPOS_C) m[c.id] = c.rotulo;
    /** ⚠️ E os estudos, para a divergência poder nomeá-los na tela. */
    estudos(estado).forEach((s, i) => { m[s.id] = `${tr("Exame")} ${i + 1}`; });
    return m;
  }, [estado, tr]);

  function numeroGravado(id: string): number | undefined {
    const f = valorAtual(estado, id);
    return typeof f?.valor === "number" ? f.valor : undefined;
  }

  return (
    <View style={e.raiz} testID="avc-superficie-c-conteudo">
      {/**
        * ⚠️⚠️ O DESTINO VEM ANTES DE TUDO — §7.3: hierarquia de visibilidade
        * derivada da importância clínica. Destino ⛔ não é mais um achado: é a
        * espécie que muda **de quem o paciente é** (§2.9), e lê-lo depois de
        * cinco campos seria lê-lo tarde.
        *
        * ⚠️⚠️ E É **UM** CARTÃO. Se a suspeita de HSA e a hemorragia na tomografia
        * estiverem as duas registradas, a tela mostra a saída prioritária e diz,
        * na linha de baixo, que o outro achado também está registrado — ⛔ nunca
        * dois cartões disputando para onde levar o paciente.
        */}
      {destino ? (
        <View style={e.destino} testID="avc-destino-imagem">
          <Text style={e.destinoEtiqueta}>{tr("Saída do fluxo de AVC isquêmico")}</Text>
          <Text style={e.destinoRotulo} testID={`avc-destino-${destino.saida}`}>
            {tr(destino.rotulo)}
          </Text>
          <Text style={e.destinoModulo}>{tr(destino.modulo)}</Text>
          {/**
            * ⚠️⚠️ **E-09** — destino para módulo inexistente é destino DECLARADO,
            * ⛔ nunca beco. A tela diz que o módulo ⛔ não existe **e** o que
            * acontece mesmo assim: o motivo fica registrado, e o atendimento
            * continua. Omitir a primeira frase deixaria o médico esperando por
            * uma tela que ⛔ nunca vai abrir.
            */}
          {destino.moduloExiste ? null : (
            <Text style={e.destinoNota} testID="avc-destino-modulo-inexistente">
              {tr("Este módulo ainda não existe neste aplicativo.")}
            </Text>
          )}
          <Text style={e.destinoNota}>{tr(destino.oQueAcontece)}</Text>
          {/**
            * ⚠️⚠️ A FRASE VEM INTEIRA DO CONTEÚDO, e a tela ⛔ não a compõe.
            *
            * A versão anterior imprimia `"Também registrado" + ":" + rótulo` — e
            * frase montada por concatenação **⛔ não tem chave de tradução**: cada
            * pedaço tem a sua, e a string que chega à tela ⛔ não tem nenhuma
            * (R-82). Aqui a sentença é uma só, com um par em espanhol.
            */}
          {destino.associados.map((a) => (
            <Text key={a.id} style={e.destinoTambem} testID={`avc-destino-associado-${a.id}`}>
              {tr(a.frase)}
            </Text>
          ))}
        </View>
      ) : null}

      {/**
        * ⚠️⚠️ OS ESTUDOS — cada exame é uma **instância**, e ⛔ nenhum achado existe
        * fora do estudo que o produziu.
        */}
      <View testID="avc-grupo-estudos">
        <CabecalhoDeBloco titulo="Exames de imagem" testID="avc-bloco-estudos" />
        <Text style={e.grupoNota} testID="avc-grupo-nota-estudos">
          {tr("Não atrase a trombólise por exames de imagem adicionais quando ela já estiver indicada pelos critérios aplicáveis. A tomografia necessária para excluir hemorragia não é exame adicional.")}
        </Text>

        {lista.length === 0 ? (
          <Text style={e.grupoNota} testID="avc-estudos-vazio">
            {tr("Nenhum exame de imagem registrado.")}
          </Text>
        ) : null}

        {lista.map((estudo, i) => {
          const fechado = i < lista.length - 1 && !estudosAbertos.includes(estudo.id);
          /**
           * ⚠️⚠️ A MATRIZ DECIDE O QUE ESTE ESTUDO PERGUNTA — e ⛔ nada é herdado
           * por categoria. ⛔ Sem modalidade declarada, ⛔ nenhum achado aparece: o
           * app ⛔ não sabe o que aquele exame pode responder, e ⛔ não inventa.
           */
          const achados = achadosDaModalidade(estudo.modalidade);
          const campos = ESTUDO_C.filter(
            (c) => !c.instanciaDe || c.id.startsWith("estudo_") || achados.includes(c.id)
          ).filter((c) => c.id !== "estudo_resultado" || achados.includes("estudo_resultado"));

          return (
            <View key={estudo.id} style={e.estudo} testID={`avc-estudo-${estudo.id}`}>
              <Pressable
                accessibilityRole="button"
                aria-expanded={!fechado}
                testID={`avc-estudo-abrir-${estudo.id}`}
                onPress={() =>
                  setEstudosAbertos((a) =>
                    a.includes(estudo.id) ? a.filter((x) => x !== estudo.id) : [...a, estudo.id]
                  )
                }
              >
                <CabecalhoDeBloco
                  titulo={`${tr("Exame")} ${i + 1}`}
                  testID={`avc-estudo-cabecalho-${estudo.id}`}
                  aberto={!fechado}
                />
              </Pressable>

              {/**
                * ⚠️⚠️ A LINHA DE IDENTIDADE — modalidade, procedência e horário, com
                * **"horário desconhecido" escrito por extenso** quando é o caso.
                * ⚠️ Em branco, o desconhecimento pareceria "⛔ ainda ⛔ não preenchi", e
                * os dois são estados diferentes (**E-37**) com consequências
                * diferentes para a ordem entre exames.
                */}
              <Text style={e.identidade} testID={`avc-estudo-identidade-${estudo.id}`}>
                {estudo.modalidade ? tr(estudo.modalidade) : tr("modalidade não informada")}
                {" · "}
                {estudo.procedencia ? tr(estudo.procedencia) : tr("procedência não informada")}
                {" · "}
                {estudo.horaConhecida
                  ? horaDeExibicao(estudo.hora as number, agora)
                  : estudo.horaDesconhecida
                    ? tr("horário desconhecido")
                    : tr("horário não informado")}
              </Text>

              {fechado
                ? null
                : campos.map((campo) => (
                    <CampoDaSuperficie
                      key={`${estudo.id}-${campo.id}`}
                      campo={{ ...campo, casa: "imagem" }}
                      casaAtual="imagem"
                      bruto={String(valorNaInstancia(estado, estudo.id, campo.id)?.valor ?? "")}
                      numero={(() => {
                        const f = valorNaInstancia(estado, estudo.id, campo.id);
                        return typeof f?.valor === "number" ? f.valor : undefined;
                      })()}
                      agora={agora}
                      detalheAberto={detalhes.aberto(`${estudo.id}-${campo.id}`)}
                      onAlternarDetalhe={() => detalhes.alternar(`${estudo.id}-${campo.id}`)}
                      emCorrecao={emCorrecao(estudo.id, campo.id)}
                      onEntrarEmCorrecao={() => alternarCorrecao(estudo.id, campo.id)}
                      onCancelarCorrecao={() => alternarCorrecao(estudo.id, campo.id)}
                      onNovaMedida={onNovoEstudo}
                      rotuloDeNovaMedida="Novo exame"
                      onEscolher={(c, v) => {
                        if (emCorrecao(estudo.id, c)) {
                          onCorrigirNoEstudo(estudo.id, c, v);
                          alternarCorrecao(estudo.id, c);
                          return;
                        }
                        onEscolherNoEstudo(estudo.id, c, v);
                      }}
                      onMedir={(c, v) => {
                        if (emCorrecao(estudo.id, c)) {
                          onCorrigirNoEstudo(estudo.id, c, v);
                          alternarCorrecao(estudo.id, c);
                          return;
                        }
                        onMedirNoEstudo(estudo.id, c, v);
                      }}
                      onHora={(c, instante) => onHoraNoEstudo(estudo.id, c, instante)}
                      onDesfazer={(c) => onDesfazerNoEstudo(estudo.id, c)}
                      empilhado={campo.id === "sitio_oclusao" || campo.id === "estudo_modalidade"}
                    />
                  ))}
            </View>
          );
        })}

        <Pressable
          style={e.novoEstudo}
          accessibilityRole="button"
          testID="avc-novo-estudo"
          onPress={onNovoEstudo}
        >
          <Text style={e.novoEstudoTexto}>{tr("Novo exame")}</Text>
        </Pressable>
      </View>

      {/** ⚠️ Os juízos do episódio — casa C, e ⛔ sem instância de estudo. */}
      <View style={e.grupo} testID="avc-grupo-episodio">
        <CabecalhoDeBloco titulo="Juízo clínico e disponibilidade" testID="avc-bloco-episodio" />
        {/**
          * ⛔ A alergia a contraste ⛔ NÃO entra aqui — ela é perguntada ⛔ só no
          * painel Paciente. Ver o comentário no grupo `episodio`.
          */}
        {EPISODIO_C.map((c) => ({ ...c, casa: "imagem" as const })).map((campo) => (
          <CampoDaSuperficie
            key={campo.id}
            campo={campo}
            casaAtual="imagem"
            bruto={String(valorAtual(estado, campo.id)?.valor ?? "")}
            numero={numeroGravado(campo.id)}
            agora={agora}
            detalheAberto={detalhes.aberto(campo.id)}
            onAlternarDetalhe={() => detalhes.alternar(campo.id)}
            onEscolher={onEscolher}
            onMedir={onMedir}
            onHora={onHora}
            onDesfazer={onDesfazer}
            nomeDaCasa="Paciente"
          />
        ))}
      </View>

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
    estudo: { marginTop: ESPACO.sm },
    identidade: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
      paddingBottom: ESPACO.sm,
    },
    novoEstudo: {
      alignSelf: "flex-start", marginTop: ESPACO.md,
      paddingHorizontal: ESPACO.md, paddingVertical: ESPACO.sm,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    novoEstudoTexto: {
      color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700",
    },
    grupoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    /**
     * ⚠️ A moldura do destino usa `warning`, e o SÍMBOLO ⛔ não existe sozinho: o
     * cartão traz uma etiqueta em palavras — "Saída do fluxo de AVC isquêmico" —
     * porque significado ⛔ nunca pode depender de cor (**E-39**).
     */
    destino: {
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.card,
      padding: ESPACO.md,
      gap: ESPACO.xs,
      borderWidth: 1,
      borderColor: tema.cores.border,
      borderLeftWidth: 6,
      borderLeftColor: tema.cores.warning,
    },
    destinoEtiqueta: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "700",
      letterSpacing: 1,
    },
    destinoRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.step.fontSize, fontWeight: "700" },
    destinoModulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },
    destinoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    /**
     * ⚠️⚠️ SUBORDINADA À SAÍDA, e ⛔ não perdida — exigência do autor na revisão
     * visual: *"a frase associada deve ser claramente secundária; a ação
     * principal precisa continuar inequívoca"*.
     *
     * ── O QUE FOI MEDIDO EM 375×812 (2026-08-29) ────────────────────────────
     *
     * A primeira versão era **negrito, na cor de texto cheia** — e ficava mais
     * pesada que a própria frase que explica a saída principal (13 px,
     * secundária). A hierarquia saía invertida: o fato acessório chamava mais
     * que a consequência da saída.
     *
     * ⚠️ O peso saiu; a **cor de texto ficou**. Rebaixá-la também para
     * secundária a igualaria ao rodapé do cartão, e uma suspeita de HSA ⛔ não
     * pode virar rodapé. O que a separa agora é a **regra acima**, ⛔ não a
     * ênfase — e ⛔ nenhuma delas depende de cor (**E-39**).
     */
    destinoTambem: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.caption.fontSize,
      marginTop: ESPACO.sm,
      paddingTop: ESPACO.sm,
      borderTopWidth: 1,
      borderTopColor: tema.cores.border,
    },
  });
