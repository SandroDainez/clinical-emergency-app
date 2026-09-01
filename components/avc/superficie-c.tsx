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
 *
 * ── ⚠️⚠️ E O QUE A MIGRAÇÃO VISUAL DE 2026-09-01 ACRESCENTOU ────────────────
 *
 *   ⛔ **numerar exame como se fosse cronologia.** O título é a **modalidade**;
 *      o ordinal é identificador de instância, dito em minúscula, e a tela
 *      declara em palavras que ele ⛔ não é ordem temporal.
 *
 *   ⛔ **fazer exame recolhido parecer vazio.** Foi o defeito que a Superfície B
 *      pagou: grupo fechado mostrando "Avaliar" com o fato já na trilha. Aqui o
 *      resumo diz o que a instância guarda, ⛔ e ⛔ sem reinterpretar ⛔ nada.
 *
 *   ⛔ **transformar campo que a modalidade ⛔ não oferece em "Não".** O que a
 *      matriz ⛔ não oferece ⛔ não é contado, ⛔ não é resumido e ⛔ não vira
 *      negativa: ⛔ ele simplesmente ⛔ não pertence àquele exame.
 */
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  CAPACIDADE_C,
  ESTUDO_C,
  FRONTEIRA_OPERACIONAL_C,
  IDENTIDADE_DO_ESTUDO,
  JUIZO_C,
  ROTULO_CURTO,
  ROTULO_DE_INTERFACE,
  TODOS_OS_CAMPOS_C,
  achadosDaModalidade,
} from "../../avc/conteudo/superficie-c";
import { opcaoDoValor } from "../../avc/conteudo/campo";
import { destinoDaImagem, estudos, leiturasDaSuperficieC } from "../../avc/nucleo/derivacoes-c";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorAtual } from "../../avc/nucleo/estado";
import { valorNaInstancia } from "../../avc/nucleo/instancia";
import { CampoDaSuperficie, DetalheDoCampo, useDetalhes } from "./campos-clinicos";
import SeletorDeHora from "./seletor-de-hora";
import {
  Empilhado,
  Icone,
  LeiturasEmBlocos,
  LinhaDeAchado,
  LinhaDeRelogio,
  Recolhido,
  Secao,
  Segmentado,
} from "./ui";
import { horaDeExibicao } from "../../avc/nucleo/formato";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

/** ⚠️ O símbolo do tom — ⛔ o mesmo vocabulário do painel compartilhado. */
const SIMBOLO_DO_TOM: Readonly<Record<string, string>> = {
  atencao: "⚠",
  pendente: "?",
  informativo: "·",
};

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

/**
 * ⚠️⚠️ OS TRÊS CAMPOS QUE **IDENTIFICAM** O EXAME — e ⛔ não o descrevem.
 *
 * ⚠️ Eles aparecem em toda instância, ⛔ independentemente da modalidade, porque
 * são o que distingue uma instância da outra. Os **achados** vêm da matriz.
 */
const CAMPOS_DE_IDENTIDADE: readonly string[] = [
  "estudo_modalidade",
  "estudo_procedencia",
  "estudo_hora",
];

/** ⚠️ Escolha única longa demais para fileira — ⛔ decisão de layout, ⛔ não clínica. */
const EMPILHADOS: readonly string[] = ["estudo_modalidade", "estudo_resultado", "sitio_oclusao"];

/**
 * ⚠️⚠️ AS QUE **RECOLHEM DEPOIS DE RESPONDIDAS** — e ⛔ `estudo_resultado` ⛔ não
 * é uma delas.
 *
 * ⚠️ A modalidade recolhe porque **já é o título** da instância; o sítio recolhe
 * porque são onze opções. ⛔ O resultado da tomografia fica **aberto**: são duas
 * opções, ⛔ e é a resposta que governa a classe inteira de reperfusão — ⛔ ela
 * ⛔ não pode custar um toque para ser lida.
 */
const RECOLHIVEIS: readonly string[] = ["estudo_modalidade", "sitio_oclusao"];

/**
 * ⚠️ ⛔ Só a modalidade — ⛔ e o comentário na ramificação diz por quê. ⛔ Pôr o
 * sítio aqui devolveria 490 px de opções a toda angiotomografia.
 */
const NASCE_ABERTO_SE_VAZIO: readonly string[] = ["estudo_modalidade"];

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
  const [estudosAbertos, setEstudosAbertos] = useState<readonly string[]>([]);
  /**
   * ⚠️⚠️ ESCOLHAS LONGAS RECOLHIDAS — ⛔ estado de TELA, ⛔ e ⛔ não clínico (E-20).
   *
   * ⚠️ Recolher ⛔ não apaga a resposta, ⛔ e abrir ⛔ não registra ⛔ nada.
   */
  const [escolhasAbertas, setEscolhasAbertas] = useState<readonly string[]>([]);
  /** ⚠️ Ver o contrato de correção: entrar ⛔ não grava, **cancelar ⛔ não grava**. */
  const [corrigindo, setCorrigindo] = useState<readonly string[]>([]);
  /** ⚠️ Qual relógio de qual instância está aberto — ⛔ e o seletor é o antigo. */
  const [editando, setEditando] = useState<
    { estudo: string; campo: string; rotulo: string; instante: number; selecionado: boolean }
    | undefined
  >(undefined);

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
    /**
     * ⚠️⚠️ COMO O PAINEL DE LEITURAS NOMEIA UM EXAME — e por que ⛔ não basta a
     * modalidade.
     *
     * ⚠️ Quando duas TCs sem contraste discordam, a leitura precisa dizer **de
     * quais duas** ela está falando. ⛔ Só a modalidade as tornaria idênticas na
     * frase; ⛔ só o ordinal ⛔ não diria que exame é. Vão os dois.
     */
    /**
     * ⚠️⚠️ PARÊNTESES, ⛔ e ⛔ NÃO `·` — medido na suíte, 2026-09-01.
     *
     * ⛔ A leitura junta os exames citados com ` · `. Com o ordinal também
     * separado por ` · `, duas TCs viravam
     * *"Tomografia… · estudo 1 · Tomografia… · estudo 2"* — quatro pedaços
     * iguais, ⛔ e ⛔ nenhuma fronteira entre um exame e o outro. ⚠️ Num alerta
     * de **divergência**, ⛔ não saber onde termina um exame é ⛔ não saber o que
     * diverge.
     */
    estudos(estado).forEach((s, i) => {
      m[s.id] = `${
        s.modalidade ? tr(s.modalidade) : tr(IDENTIDADE_DO_ESTUDO.semModalidade)
      } (${tr("estudo")} ${i + 1})`;
    });
    return m;
  }, [estado, tr]);

  function numeroGravado(id: string): number | undefined {
    const f = valorAtual(estado, id);
    return typeof f?.valor === "number" ? f.valor : undefined;
  }

  /** ⚠️ "Ninguém sabe dizer" — ⛔ diferente de ⛔ não ter sido perguntado (E-02). */
  function horaDesconhecidaNo(est: string): boolean {
    return String(valorNaInstancia(estado, est, "estudo_hora")?.valor ?? "") === "nao_sei";
  }

  /**
   * ⚠️⚠️ O RESUMO DA INSTÂNCIA RECOLHIDA — o contrato que a Superfície B pagou
   * caro para descobrir.
   *
   * ⚠️ Ele lista **⛔ só o que foi respondido**, com o rótulo curto declarado no
   * conteúdo e o **valor inteiro**, ⛔ sem reinterpretação. O que a modalidade
   * ⛔ não oferece ⛔ não entra em ⛔ nenhuma das duas contas — ⛔ nem como
   * respondido, ⛔ nem como pendente —, porque ⛔ ele ⛔ não é uma pergunta
   * daquele exame.
   */
  function resumoDoEstudo(est: string, modalidade: string | undefined) {
    const oferecidos = achadosDaModalidade(modalidade);
    const respondidos: { id: string; texto: string }[] = [];
    let porResponder = 0;
    for (const id of oferecidos) {
      const f = valorNaInstancia(estado, est, id);
      const bruto = f?.valor;
      if (bruto === undefined || bruto === "") {
        porResponder += 1;
        continue;
      }
      const curto = ROTULO_CURTO[id];
      /** ⚠️ ⛔ Sem rótulo curto declarado, o achado ⛔ não é resumido — ⛔ e não é inventado. */
      if (curto === undefined) continue;
      const campo = ESTUDO_C.find((c) => c.id === id);
      /**
       * ⚠️⚠️ O ROTULO VOLTA PELO CAMPO, ⛔ e ⛔ não por transformação de string.
       *
       * ⛔ Desfazer o slug no braço ("sem_hemorragia" → "Sem hemorragia") daria
       * uma frase parecida ⛔ e ⛔ não a **opção declarada**: o resumo passaria a
       * exibir texto que ⛔ não existe em ⛔ nenhum catálogo, ⛔ sem par em
       * espanhol ⛔ e sem dono.
       */
      const rotulo = campo ? opcaoDoValor({ ...campo, casa: "imagem" }, String(bruto)) : undefined;
      if (typeof bruto !== "number" && rotulo === undefined) continue;
      const valor = typeof bruto === "number" ? String(bruto) : tr(rotulo as string);
      respondidos.push({ id, texto: `${tr(curto)}: ${valor}` });
    }
    return { respondidos, porResponder };
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
        *
        * ⚠️ A migração visual ⛔ NÃO TOCOU NESTE BLOCO (autor, 2026-09-01:
        * *"manter a saída de fluxo como está"*). Ele já era o bloco mais bem
        * resolvido da superfície.
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
      <View style={e.grupo} testID="avc-grupo-estudos">
        <View style={e.cabecalho} testID="avc-bloco-estudos">
          <Icone nome="imagem" tamanho={14} />
          <Secao titulo="Exames de imagem" />
          {/**
            * ⚠️⚠️ O ⓘ DO BLOCO CARREGA O QUE O ORDINAL **É** — e ⛔ não a regra
            * contra o atraso, que ⛔ não pode depender de ⛔ ninguém abrir ⛔ nada.
            */}
          <Recolhido
            id="c-identidade"
            texto={IDENTIDADE_DO_ESTUDO.nota}
            aberto={detalhes.aberto("c-identidade")}
            onAlternar={() => detalhes.alternar("c-identidade")}
          />
        </View>
        {/**
          * ⚠️⚠️ **VISÍVEL, e ⛔ nunca atrás do ⓘ** — R2.3. Ela é conduta: quem
          * ⛔ não abre o ⓘ é justamente quem vai atrasar a trombólise esperando
          * a angiotomografia.
          */}
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
            (c) => CAMPOS_DE_IDENTIDADE.includes(c.id) || achados.includes(c.id)
          );
          const resumo = resumoDoEstudo(estudo.id, estudo.modalidade);

          return (
            <View key={estudo.id} style={e.estudo} testID={`avc-estudo-${estudo.id}`}>
              {/**
                * ⚠️⚠️ O CABEÇALHO DA INSTÂNCIA — decisão do autor, 2026-09-01:
                * *"modalidade = identidade clínica principal; procedência +
                * horário = contexto temporal; identificador da instância fica
                * secundário"*.
                */}
              <Pressable
                style={e.estudoTopo}
                accessibilityRole="button"
                aria-expanded={!fechado}
                testID={`avc-estudo-abrir-${estudo.id}`}
                onPress={() =>
                  setEstudosAbertos((a) =>
                    a.includes(estudo.id) ? a.filter((x) => x !== estudo.id) : [...a, estudo.id]
                  )
                }
              >
                <View style={e.estudoNome}>
                  <Text style={e.estudoTitulo} testID={`avc-estudo-cabecalho-${estudo.id}`}>
                    {estudo.modalidade
                      ? tr(estudo.modalidade)
                      : tr(IDENTIDADE_DO_ESTUDO.semModalidade)}
                  </Text>
                  {/**
                    * ⚠️⚠️ A LINHA DE IDENTIDADE — procedência, horário e o ordinal,
                    * com **"horário desconhecido" escrito por extenso** quando é
                    * o caso. ⚠️ Em branco, o desconhecimento pareceria "⛔ ainda
                    * ⛔ não preenchi", e os dois são estados diferentes (**E-37**)
                    * com consequências diferentes para a ordem entre exames.
                    *
                    * ⚠️ O ordinal fica **no fim e em minúscula** — ⛔ ele é a
                    * referência estável entre duas TCs iguais, ⛔ e ⛔ não a
                    * primeira coisa que se lê.
                    */}
                  <Text style={e.identidade} testID={`avc-estudo-identidade-${estudo.id}`}>
                    {estudo.procedencia ? tr(estudo.procedencia) : tr("procedência não informada")}
                    {" · "}
                    {estudo.horaConhecida
                      ? horaDeExibicao(estudo.hora as number, agora)
                      : estudo.horaDesconhecida
                        ? tr("horário desconhecido")
                        : tr("horário não informado")}
                    {" · "}
                    {tr("estudo")} {i + 1}
                  </Text>
                </View>
                {/**
                  * ⚠️⚠️ O MESMO GLIFO NOS DOIS ESTADOS **MENTE**.
                  *
                  * ⛔ A primeira versão desenhava `›` aberto ⛔ e fechado: o
                  * indicador de estado ⛔ não indicava estado ⛔ nenhum. ⚠️ Girado,
                  * ele aponta para baixo quando o exame está aberto — ⛔ e o
                  * `aria-expanded` do `Pressable` continua sendo a prova para
                  * quem ⛔ não vê o ícone.
                  */}
                <View style={fechado ? null : e.giradoParaBaixo}>
                  <Icone nome="adiante" tamanho={14} />
                </View>
              </Pressable>

              {/**
                * ⚠️⚠️ O RESUMO APARECE ⛔ SÓ QUANDO O EXAME ESTÁ FECHADO — e ele
                * existe para que **⛔ nenhuma instância fechada pareça vazia**.
                *
                * ⛔ Foi exatamente o defeito da Superfície B: o grupo recolhido
                * dizia "Avaliar" enquanto o fato já estava na trilha, e a tela
                * mentia sobre o que guardava.
                */}
              {fechado ? (
                <View style={e.resumo} testID={`avc-estudo-resumo-${estudo.id}`}>
                  {resumo.respondidos.length === 0 ? (
                    <Text style={e.resumoVazio}>{tr(IDENTIDADE_DO_ESTUDO.semRespostas)}</Text>
                  ) : (
                    resumo.respondidos.map((r) => (
                      <Text key={r.id} style={e.resumoItem} testID={`avc-resumo-${estudo.id}-${r.id}`}>
                        {r.texto}
                      </Text>
                    ))
                  )}
                  {/**
                    * ⚠️⚠️ **POR RESPONDER**, e ⛔ nunca "Não".
                    *
                    * ⚠️ A conta é ⛔ só sobre o que **esta modalidade oferece**.
                    * ⛔ Um campo que a modalidade ⛔ não responde ⛔ não é
                    * pendência dela — e chamá-lo de pendência empurraria o
                    * médico a pedir exame que ⛔ não responde a pergunta.
                    *
                    * ⚠️⚠️ **E ELA ⛔ NÃO APARECE NO EXAME TOTALMENTE VAZIO** —
                    * autor, 2026-09-01. ⛔ *"Nada respondido além da
                    * identificação"* ⛔ e *"2 por responder"* juntos dizem a
                    * mesma coisa duas vezes; a primeira frase já é o estado.
                    * ⚠️ ⛔ Nenhum cálculo mudou: a contagem continua idêntica,
                    * ⛔ e volta assim que existir **uma** resposta.
                    */}
                  {resumo.respondidos.length > 0 && resumo.porResponder > 0 ? (
                    <Text style={e.resumoPendente} testID={`avc-estudo-pendentes-${estudo.id}`}>
                      {resumo.porResponder} {tr("por responder")}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {fechado
                ? null
                : campos.map((campo) => {
                    const fato = valorNaInstancia(estado, estudo.id, campo.id);
                    const bruto = String(fato?.valor ?? "");
                    /** ⚠️ Correção em curso desvia a gravação — ⛔ e ⛔ não a duplica. */
                    const gravar = (c: string, v: string | number) => {
                      if (emCorrecao(estudo.id, c)) {
                        onCorrigirNoEstudo(estudo.id, c, v);
                        alternarCorrecao(estudo.id, c);
                        return;
                      }
                      if (typeof v === "number") onMedirNoEstudo(estudo.id, c, v);
                      else onEscolherNoEstudo(estudo.id, c, v);
                    };

                    /* ── o relógio do exame ──────────────────────────────── */
                    if (campo.tipo === "hora") {
                      const instante = typeof fato?.valor === "number" ? fato.valor : undefined;
                      const desconhecido = horaDesconhecidaNo(estudo.id);
                      return (
                        <View key={campo.id}>
                          <LinhaDeRelogio
                            campo={campo.id}
                            icone="chegada"
                            rotulo={campo.rotulo}
                            valor={
                              instante !== undefined
                                ? `✓ ${horaDeExibicao(instante, agora)} ✎`
                                : desconhecido
                                  ? "Sem essa informação"
                                  : "Informar horário"
                            }
                            estado={
                              instante !== undefined
                                ? "registrado"
                                : desconhecido
                                  ? "desconhecido"
                                  : "vazio"
                            }
                            onPress={() =>
                              setEditando({
                                estudo: estudo.id,
                                campo: campo.id,
                                rotulo: campo.rotulo,
                                instante: instante ?? agora,
                                /** ⚠️⚠️ Abrir ⛔ NÃO é escolher — o gate de §0.2. */
                                selecionado: instante !== undefined,
                              })
                            }
                          />
                          <View style={e.subLinha}>
                            {campo.aceitaDesconhecido ? (
                              <Pressable
                                style={e.desconhecidoCompacto}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: desconhecido }}
                                aria-checked={desconhecido}
                                accessibilityLabel={`${tr(campo.rotulo)}: ${tr("Sem essa informação")}`}
                                testID={`avc-hora-desconhecido-${campo.id}`}
                                /** ⚠️ Tocar de novo DESFAZ — corrige, ⛔ e ⛔ não apaga. */
                                onPress={() =>
                                  desconhecido
                                    ? onDesfazerNoEstudo(estudo.id, campo.id)
                                    : onEscolherNoEstudo(estudo.id, campo.id, "nao_sei")
                                }
                              >
                                <Text
                                  style={[
                                    e.desconhecidoTexto,
                                    desconhecido ? e.desconhecidoOn : null,
                                  ]}
                                >
                                  {desconhecido ? "✓ " : ""}
                                  {tr("Sem essa informação")}
                                </Text>
                              </Pressable>
                            ) : null}
                            <Recolhido
                              id={campo.id}
                              texto={campo.ajuda}
                              aberto={detalhes.aberto(`${estudo.id}-${campo.id}`)}
                              onAlternar={() => detalhes.alternar(`${estudo.id}-${campo.id}`)}
                            >
                              <DetalheDoCampo campo={{ ...campo, casa: "imagem" }} />
                            </Recolhido>
                          </View>
                        </View>
                      );
                    }

                    /* ── escolha longa recolhível: modalidade e sítio ────── */
                    if (RECOLHIVEIS.includes(campo.id) && campo.opcoes) {
                      const chave = `${estudo.id}-${campo.id}`;
                      /**
                       * ⚠️⚠️ ⛔ E "VAZIO NASCE ABERTO" ⛔ NÃO VALE PARA OS DOIS.
                       *
                       * ⚠️ A **modalidade** nasce aberta: um exame recém-criado
                       * ⛔ sem ela ⛔ não responde ⛔ nada — a matriz ⛔ não sabe o
                       * que perguntar —, e esconder a **única** pergunta que
                       * importa atrás de um toque seria absurdo. ⚠️ Respondida,
                       * recolhe: ela já é o **título** da instância, e seis
                       * opções abertas debaixo do próprio nome do exame são a
                       * mesma informação ocupando 330 px.
                       *
                       * ⛔ O **sítio** nasce **fechado**, dizendo "Não informado"
                       * — exigência do autor, 2026-09-01. ⛔ Onze opções abertas
                       * em toda angiotomografia eram 490 px de rolagem para uma
                       * pergunta que ⛔ nem sempre tem laudo para responder.
                       */
                      const aberto =
                        (NASCE_ABERTO_SE_VAZIO.includes(campo.id) && bruto === "")
                        || escolhasAbertas.includes(chave);
                      const escolhido =
                        bruto === "" ? undefined : opcaoDoValor({ ...campo, casa: "imagem" }, bruto);
                      return (
                        <View key={campo.id} style={e.pergunta} testID={`avc-campo-${campo.id}`}>
                          <View style={e.perguntaTopo}>
                            <Text style={e.perguntaTexto}>{tr(campo.rotulo)}</Text>
                            <Recolhido
                              id={campo.id}
                              texto={campo.ajuda}
                              aberto={detalhes.aberto(`${estudo.id}-${campo.id}`)}
                              onAlternar={() => detalhes.alternar(`${estudo.id}-${campo.id}`)}
                            >
                              <DetalheDoCampo campo={{ ...campo, casa: "imagem" }} />
                            </Recolhido>
                          </View>
                          {/**
                            * ⚠️⚠️ FECHADO, ELE **DIZ O QUE GUARDA** — exigência do
                            * autor, 2026-09-01: *"mostrar o valor registrado; se
                            * ⛔ não informado, dizer ⛔ não informado"*.
                            *
                            * ⛔ "Preencher" era um **convite**, ⛔ e ⛔ não um estado:
                            * lido de relance, ⛔ não distinguia *"⛔ ninguém
                            * respondeu"* de *"⛔ não dá para responder"*. E `Não
                            * sei` continua sendo **resposta**, com o ✓ e tudo —
                            * ⛔ jamais ausência.
                            */}
                          <Pressable
                            style={e.abrirEscolha}
                            accessibilityRole="button"
                            aria-expanded={aberto}
                            testID={`avc-abrir-${campo.id}`}
                            onPress={() =>
                              setEscolhasAbertas((a) =>
                                a.includes(chave) ? a.filter((x) => x !== chave) : [...a, chave]
                              )
                            }
                          >
                            <Text style={e.abrirEscolhaTexto}>
                              {aberto
                                ? tr("Fechar")
                                : escolhido !== undefined
                                  ? `✓ ${tr(escolhido)} ✎`
                                  : tr("Não informado")}
                            </Text>
                          </Pressable>
                          {aberto ? (
                            <Empilhado
                              campo={campo.id}
                              opcoes={campo.opcoes}
                              valor={bruto}
                              onEscolher={(c, v) => gravar(c, v)}
                              onDesfazer={(c) => onDesfazerNoEstudo(estudo.id, c)}
                            />
                          ) : null}
                        </View>
                      );
                    }

                    /* ── escolhas longas: uma linha por opção ────────────── */
                    if (campo.tipo === "escolha" && campo.opcoes && EMPILHADOS.includes(campo.id)) {
                      return (
                        <View key={campo.id} style={e.pergunta} testID={`avc-campo-${campo.id}`}>
                          <View style={e.perguntaTopo}>
                            <Text style={e.perguntaTexto}>{tr(campo.rotulo)}</Text>
                            <Recolhido
                              id={campo.id}
                              texto={campo.ajuda}
                              aberto={detalhes.aberto(`${estudo.id}-${campo.id}`)}
                              onAlternar={() => detalhes.alternar(`${estudo.id}-${campo.id}`)}
                            >
                              <DetalheDoCampo campo={{ ...campo, casa: "imagem" }} />
                            </Recolhido>
                          </View>
                          <Empilhado
                            campo={campo.id}
                            opcoes={campo.opcoes}
                            valor={bruto}
                            onEscolher={(c, v) => gravar(c, v)}
                            onDesfazer={(c) => onDesfazerNoEstudo(estudo.id, c)}
                          />
                        </View>
                      );
                    }

                    /* ── escolhas curtas: fileira ────────────────────────── */
                    if (campo.tipo === "escolha" && campo.opcoes && campo.opcoes.length <= 3) {
                      /**
                       * ⚠️⚠️ ACHADO usa `LinhaDeAchado`, ⛔ e a **ajuda fica
                       * VISÍVEL** como definição: a hipodensidade clara tem
                       * critério transcrito da fonte, e escondê-lo atrás do ⓘ
                       * deixaria o critério para quem já sabe (E-31).
                       */
                      const identidade = CAMPOS_DE_IDENTIDADE.includes(campo.id);
                      if (identidade) {
                        return (
                          <View key={campo.id} style={e.pergunta} testID={`avc-campo-${campo.id}`}>
                            <View style={e.perguntaTopo}>
                              <Text style={e.perguntaTexto}>{tr(campo.rotulo)}</Text>
                              <Recolhido
                                id={campo.id}
                                texto={campo.ajuda}
                                aberto={detalhes.aberto(`${estudo.id}-${campo.id}`)}
                                onAlternar={() => detalhes.alternar(`${estudo.id}-${campo.id}`)}
                              >
                                <DetalheDoCampo campo={{ ...campo, casa: "imagem" }} />
                              </Recolhido>
                            </View>
                            <Segmentado
                              campo={campo.id}
                              opcoes={campo.opcoes}
                              valor={bruto}
                              onEscolher={(c, v) => gravar(c, v)}
                              onDesfazer={(c) => onDesfazerNoEstudo(estudo.id, c)}
                            />
                          </View>
                        );
                      }
                      return (
                        <LinhaDeAchado
                          key={campo.id}
                          campo={campo.id}
                          rotulo={campo.rotulo}
                          definicao={campo.ajuda}
                          opcoes={campo.opcoes}
                          valor={bruto}
                          detalheAberto={detalhes.aberto(`${estudo.id}-${campo.id}`)}
                          onAlternarDetalhe={() => detalhes.alternar(`${estudo.id}-${campo.id}`)}
                          onEscolher={(c, v) => gravar(c, v)}
                          onDesfazer={(c) => onDesfazerNoEstudo(estudo.id, c)}
                        >
                          <DetalheDoCampo campo={{ ...campo, casa: "imagem" }} />
                        </LinhaDeAchado>
                      );
                    }

                    /**
                     * ⚠️⚠️ O ASPECTS FICA NO COMPONENTE ANTIGO — ⛔ e ⛔ não por
                     * preguiça de migrar.
                     *
                     * ⚠️ Ele carrega o contrato de **correção com rascunho**: seis
                     * toques dentro de uma correção ⛔ não são seis fatos, e ⛔ só
                     * **Confirmar** grava — **um**. ⚠️ O `Numero` do kit grava a
                     * cada dígito válido, o que é certo para uma glicemia sendo
                     * digitada ⛔ e errado para corrigir um escore já registrado.
                     *
                     * ⛔ Refazer essa regra de memória numa migração visual seria
                     * o jeito mais rápido de perdê-la.
                     *
                     * ── ⚠️⚠️ DÍVIDA VISUAL DECLARADA (⛔ não bloqueante) ──────────
                     *
                     * ⚠️ É o **único** lugar da Superfície C que ainda fala a
                     * linguagem visual antiga: cartão com moldura, **barra** e
                     * botão "Registrar N" — enquanto A e B já ⛔ não têm barra
                     * ⛔ nenhuma. ⛔ Fechá-la exige um controle numérico com
                     * **modo de correção** (rascunho + Confirmar), que o kit
                     * ainda ⛔ não tem: o `Numero` grava a cada dígito válido, o
                     * que é certo para uma glicemia sendo digitada ⛔ e escreveria
                     * **dois fatos** ao corrigir um ASPECTS de 1 para 10.
                     *
                     * ⛔ ⛔ Não trocar o controle sem construir esse modo antes.
                     */
                    return (
                      <CampoDaSuperficie
                        key={`${estudo.id}-${campo.id}`}
                        campo={{ ...campo, casa: "imagem" }}
                        casaAtual="imagem"
                        bruto={bruto}
                        numero={typeof fato?.valor === "number" ? fato.valor : undefined}
                        agora={agora}
                        detalheAberto={detalhes.aberto(`${estudo.id}-${campo.id}`)}
                        onAlternarDetalhe={() => detalhes.alternar(`${estudo.id}-${campo.id}`)}
                        emCorrecao={emCorrecao(estudo.id, campo.id)}
                        onEntrarEmCorrecao={() => alternarCorrecao(estudo.id, campo.id)}
                        onCancelarCorrecao={() => alternarCorrecao(estudo.id, campo.id)}
                        onNovaMedida={onNovoEstudo}
                        rotuloDeNovaMedida="Novo exame"
                        onEscolher={(c, v) => gravar(c, v)}
                        onMedir={(c, v) => gravar(c, v)}
                        onHora={(c, instante) => onHoraNoEstudo(estudo.id, c, instante)}
                        onDesfazer={(c) => onDesfazerNoEstudo(estudo.id, c)}
                      />
                    );
                  })}
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

      {/**
        * ⚠️ Os juízos do episódio — casa C, e ⛔ sem instância de estudo.
        *
        * ⛔ A alergia a contraste ⛔ NÃO entra aqui — ela é perguntada ⛔ só no
        * painel Paciente. Ver o comentário no grupo `juizo`.
        */}
      <View style={e.grupo} testID="avc-grupo-juizo">
        <View style={e.cabecalho} testID="avc-bloco-juizo">
          <Icone nome="neuro" tamanho={14} />
          <Secao titulo="Juízo clínico" />
        </View>
        {JUIZO_C.map((campo) => (
          <LinhaDeAchado
            key={campo.id}
            campo={campo.id}
            rotulo={campo.rotulo}
            definicao={campo.ajuda}
            opcoes={campo.opcoes ?? []}
            valor={String(valorAtual(estado, campo.id)?.valor ?? "")}
            detalheAberto={detalhes.aberto(campo.id)}
            onAlternarDetalhe={() => detalhes.alternar(campo.id)}
            onEscolher={onEscolher}
            onDesfazer={onDesfazer}
          >
            <DetalheDoCampo campo={{ ...campo, casa: "imagem" }} />
          </LinhaDeAchado>
        ))}
      </View>

      {/**
        * ⚠️⚠️ A CAPACIDADE DO SERVIÇO — bloco **separado**, **por último**, e com a
        * fronteira escrita.
        *
        * ── ⚠️⚠️ POR QUE ELE SAIU DE DENTRO DO JUÍZO CLÍNICO (autor, 2026-09-01) ──
        *
        * ⚠️ Um cabeçalho só — *"Juízo clínico e disponibilidade"* — juntava o que
        * o médico **suspeita do paciente** com o que o **serviço tem**. ⛔ São
        * espécies diferentes, ⛔ e a contaminação tem direção conhecida: *"⛔ não
        * temos angioTC"* vira *"⛔ não há indicação de imagem vascular"*.
        *
        * ⚠️ É a mesma fronteira que a Superfície G existe para ⛔ não atravessar,
        * ⛔ e a frase vem do conteúdo — ⛔ não é parafraseada aqui (**I6**).
        */}
      <View style={e.grupo} testID="avc-grupo-capacidade">
        <View style={e.cabecalho} testID="avc-bloco-capacidade">
          <Icone nome="destino" tamanho={14} />
          <Secao titulo="Capacidade deste serviço" />
        </View>
        <Text style={e.fronteira} testID="avc-fronteira-operacional">
          {tr(FRONTEIRA_OPERACIONAL_C)}
        </Text>
        {CAPACIDADE_C.map((campo) => (
          <View key={campo.id} style={e.pergunta} testID={`avc-campo-${campo.id}`}>
            <View style={e.perguntaTopo}>
              <Text style={e.perguntaTexto}>{tr(campo.rotulo)}</Text>
              <Recolhido
                id={campo.id}
                texto={campo.ajuda}
                aberto={detalhes.aberto(campo.id)}
                onAlternar={() => detalhes.alternar(campo.id)}
              >
                <DetalheDoCampo campo={{ ...campo, casa: "imagem" }} />
              </Recolhido>
            </View>
            {/**
              * ⚠️⚠️ FILEIRA, ⛔ e ⛔ não três cartões — autor, 2026-09-01.
              *
              * ⛔ Empilhadas, as três opções custavam 132 px na tela **vazia**,
              * ⛔ e essa é a tela que todo atendimento abre primeiro. ⚠️ Com o
              * rótulo de interface — *"Indisponível"* no lugar de *"Não
              * disponível neste serviço"* — a fileira cabe em uma linha ⛔ sem
              * quebrar palavra, ⛔ e o valor gravado ⛔ não muda.
              */}
            <Segmentado
              campo={campo.id}
              opcoes={campo.opcoes ?? []}
              valor={String(valorAtual(estado, campo.id)?.valor ?? "")}
              rotuloDeInterface={ROTULO_DE_INTERFACE[campo.id]}
              onEscolher={onEscolher}
              onDesfazer={onDesfazer}
            />
          </View>
        ))}
      </View>

      <LeiturasEmBlocos
        leituras={leituras}
        /**
         * ⚠️⚠️ ABERTO POR PADRÃO — o bloco "Registrado" é onde o médico vê a
         * consequência do que acabou de responder. ⛔ Fechá-lo apaga o retorno
         * no instante em que ele acontece.
         */
        aberto={!detalhes.aberto("__registrado__")}
        onAlternar={() => detalhes.alternar("__registrado__")}
        renderItem={(id) => {
          const l = leituras.find((x) => x.id === id);
          if (!l) return null;
          return (
            <View key={id} testID={`avc-leitura-${id}`}>
              <View style={e.leituraLinha}>
                <Text style={e.leituraTexto} testID={`avc-leitura-curto-${id}`}>
                  {SIMBOLO_DO_TOM[l.tom]}{" "}
                  {l.sujeito ? `${tr(l.sujeito)} — ` : ""}
                  {tr(l.curto)}
                  {/**
                    * ⚠️⚠️ A LEITURA NOMEIA OS EXAMES QUE ELA CITA — **E-30**, e
                    * ⛔ ela ⛔ não é decoração.
                    *
                    * ⛔ A primeira versão desta migração deixou esta linha para
                    * trás ao trocar de painel: com duas TCs discordantes, a
                    * tela dizia *"resultados divergentes"* ⛔ sem dizer **entre
                    * quais**. ⚠️ Com três estudos registrados, isso ⛔ não é
                    * informação — é um alerta que ⛔ ninguém consegue resolver.
                    */}
                  {l.estudos && l.estudos.length > 1
                    ? `: ${l.estudos.map((i) => rotuloDoCampo[i] ?? i).join(" · ")}`
                    : ""}
                </Text>
                <Recolhido
                  id={`leitura-${id}`}
                  texto={l.texto}
                  aberto={detalhes.aberto(`leitura-${id}`)}
                  onAlternar={() => detalhes.alternar(`leitura-${id}`)}
                />
              </View>
              {detalhes.aberto(`leitura-${id}`) ? (
                <View testID={`avc-detalhe-leitura-${id}`}>
                  <Text style={e.leituraDetalhe}>{tr(l.texto)}</Text>
                  {/** ⚠️ E-30: a fonte é propriedade da afirmação. */}
                  <Text style={e.leituraFonte}>
                    {tr("Insumos")}: {l.insumos.map((i) => tr(rotuloDoCampo[i] ?? i)).join(", ")} ·{" "}
                    {tr("slot")} {l.fonte}
                  </Text>
                  <Text style={e.leituraFonte}>
                    {tr("Apoio ao julgamento clínico. A decisão permanece do médico.")}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        }}
      />

      {/**
        * ⚠️⚠️ O SELETOR DE HORA É O MESMO — ⛔ e ⛔ não uma reimplementação.
        *
        * ⚠️ Ele carrega o teto em `agora`, o controle de data ⛔ e o gate que
        * impede "agora" de virar default silencioso.
        */}
      {editando ? (
        <SeletorDeHora
          rotulo={editando.rotulo}
          instante={editando.instante}
          selecionado={editando.selecionado}
          agora={agora}
          onMudar={(i, escolheuValor) =>
            setEditando((atual) =>
              atual === undefined
                ? atual
                : {
                    ...atual,
                    instante: i,
                    /** ⚠️ Mexer no DIA ⛔ não é escolher o horário. */
                    selecionado: escolheuValor || atual.selecionado,
                  }
            )
          }
          onConfirmar={() => {
            onHoraNoEstudo(editando.estudo, editando.campo, editando.instante);
            setEditando(undefined);
          }}
          onCancelar={() => setEditando(undefined)}
        />
      ) : null}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    grupo: { gap: ESPACO.xs },
    cabecalho: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },

    /**
     * ⚠️ Cada instância é um cartão com filete à esquerda: ele diz **onde um
     * exame começa e o outro termina** sem gastar um cabeçalho preenchido.
     */
    estudo: {
      marginTop: ESPACO.sm,
      paddingLeft: ESPACO.sm,
      borderLeftWidth: 3,
      borderLeftColor: tema.cores.border,
      gap: ESPACO.xs,
    },
    estudoTopo: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.xs,
      minHeight: TOQUE.minimo,
    },
    giradoParaBaixo: { transform: [{ rotate: "90deg" }] },
    /** ⚠️ `minWidth: 0` — ⛔ sem ele, o título longo empurra o ícone para fora. */
    estudoNome: { flex: 1, minWidth: 0 },
    estudoTitulo: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
    identidade: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
    },

    resumo: { gap: 2, paddingBottom: ESPACO.xs },
    resumoItem: { color: tema.cores.text, fontSize: TIPOGRAFIA.micro.fontSize },
    resumoVazio: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    /** ⚠️ Neutro: **⛔ não é alerta**. ⛔ Nenhum campo daqui retém terapia (E-49). */
    resumoPendente: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    pergunta: { gap: ESPACO.xs, paddingVertical: ESPACO.xs },
    perguntaTopo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    perguntaTexto: { flex: 1, color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },

    /** ⚠️ Recuada e colada ao relógio — ⛔ ela ⛔ não flutua entre dois. */
    subLinha: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      paddingLeft: ESPACO.md,
    },
    desconhecidoCompacto: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingRight: ESPACO.sm,
    },
    desconhecidoTexto: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
    },
    desconhecidoOn: { color: tema.cores.text, fontWeight: "700" },

    abrirEscolha: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
      borderWidth: 2,
      borderColor: tema.cores.border,
      borderRadius: RAIO.botao,
    },
    abrirEscolhaTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },

    novoEstudo: {
      alignSelf: "flex-start", marginTop: ESPACO.md,
      minHeight: TOQUE.minimo, justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    novoEstudoTexto: {
      color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700",
    },
    grupoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    leituraLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    leituraTexto: { flex: 1, color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    leituraDetalhe: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      marginTop: ESPACO.xs,
    },
    leituraFonte: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      marginTop: 2,
    },
    /**
     * ⚠️ A fronteira é **texto de regra**, ⛔ e ⛔ não alerta: ela ⛔ não pinta
     * vermelho ⛔ nem chama atenção — ⛔ ela delimita o que o bloco significa.
     */
    fronteira: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontStyle: "italic",
    },
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
