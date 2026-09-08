/**
 * SUPERFÍCIE A · Entrada e estabilização — a tela, na linguagem nova.
 *
 * ⚠️⚠️ O QUE MUDOU: **⛔ SÓ A APRESENTAÇÃO.**
 *
 * ⛔ ⛔ Nenhum fato, ⛔ nenhuma derivação, ⛔ nenhum contrato de ausência. Os
 * `testID` são **os mesmos** de propósito: eles são a superfície onde os
 * contratos clínicos estão amarrados, ⛔ e trocá-los faria a suíte parar de
 * verificar a reescrita exatamente quando ela mais precisa ser verificada.
 *
 * ── ⚠️⚠️ O QUE ESTA TELA ⛔ NÃO PODE FAZER ───────────────────────────────────
 *
 *   ⛔ **partir de um valor.** Campo intocado é **⛔ não informado** — ⛔ e ⛔ não
 *      o piso da faixa. §0.2.
 *   ⛔ **confundir apagar com zero.** Limpar o número **desfaz**; ⛔ ele ⛔ não
 *      grava 0 (E-52).
 *   ⛔ **transformar vazio em alerta.** Ausência é estado, ⛔ e ⛔ não achado.
 *   ⛔ **fabricar "agora".** O horário só existe depois de interação explícita —
 *      quem garante isso é `SeletorDeHora`, reaproveitado inteiro.
 *
 * ⚠️ O seletor de hora e a seleção múltipla continuam nos componentes antigos:
 * ⛔ eles carregam regras conquistadas a duras penas, ⛔ e reescrevê-los ⛔ não
 * era o pedido. A linguagem nova é dos relógios, das escolhas e dos números.
 */
import { useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { campoAparece, camposDoGrupo } from "../../avc/conteudo/campo";
import { GRUPOS_A, PRIORIDADE_A, TODOS_OS_CAMPOS_A } from "../../avc/conteudo/superficie-a";
import { leiturasDaSuperficieA, pressaoArterialMedia } from "../../avc/nucleo/derivacoes";
import { instanciaAberta, valorNaInstancia } from "../../avc/nucleo/instancia";
import { alternarItem, itensSelecionados } from "../../avc/nucleo/selecao";
import { valorAtual, type EstadoAvc } from "../../avc/nucleo/estado";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESTADOS, type EstadoClinico } from "../../design-system/estados-clinicos";
import { useTr } from "../../lib/use-tr";
import { CampoDaSuperficie, DetalheDoCampo, useDetalhes } from "./campos-clinicos";
import { CondutaDaPressao, CondutaGlicemica } from "./conduta-da-fonte";
import { eixoDoGrupo } from "./ui";
import { bloqueiosCorrigiveis } from "../../avc/nucleo/derivacoes-d";

/** ⚠️ O símbolo do tom — ⛔ o mesmo vocabulário do painel compartilhado. */
/**
 * ⚠️⚠️ O TOM DA LEITURA, NO ALFABETO ÚNICO — ⛔ e ⛔ ele ⛔ não é mais uma
 * tabelinha local. ⛔ Havia **três cópias** deste mapa, uma por superfície, ⛔ e
 * ⛔ nada obrigava as três a concordarem.
 *
 * ⚠️ `atencao` é situação clínica verdadeira (**corrigível**); `pendente` é
 * falta responder (**verificar**); `informativo` é respondido ⛔ sem
 * consequência — ⛔ e ⛔ ele ⛔ não ganha ✓, porque ✓ afirma que um critério
 * está atendido, ⛔ e uma leitura informativa ⛔ não afirma isso.
 */
const ESTADO_DO_TOM: Readonly<Record<string, EstadoClinico>> = {
  atencao: "corrigivel",
  pendente: "verificar",
  informativo: "medido",
};
const SIMBOLO_DO_TOM: Readonly<Record<string, string>> = {
  atencao: ESTADOS[ESTADO_DO_TOM.atencao].simbolo,
  pendente: ESTADOS[ESTADO_DO_TOM.pendente].simbolo,
  informativo: ESTADOS[ESTADO_DO_TOM.informativo].simbolo,
};
import {
  Achados,
  LeiturasEmBlocos,
  Numero,
  Recolhido,
  Secao,
  Segmentado,
} from "./ui";
import { useFoco } from "./sistema/foco";

type Props = {
  estado: EstadoAvc;
  /** "Agora", lido pelo dono pela porta única de Q-01. ⛔ Nenhum relógio aqui. */
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  /** ⚠️ Desfazer é operação de primeira classe (§7.16) — ⛔ não apaga, corrige. */
  onDesfazer: (campo: string) => void;
  onNovaMedida: (tipo: string) => void;
  /**
   * ⚠️⚠️ ⛔ A SAÍDA DO BLOCO *"Corrigir agora"* — ⛔ e ⛔ ela é **da dona da
   * navegação**, ⛔ e ⛔ não desta tela: ⛔ a Superfície A ⛔ nunca soube abrir
   * outra superfície, ⛔ e ⛔ passar a saber daria a ela duas
   * responsabilidades.
   */
  onAbrirCorrecoes: () => void;
  /**
   * ── ⚠️⚠️⚠️ O ACORDEÃO — 2026-09-08 ──────────────────────────────────────
   *
   * ⛔ ⛔ Quais eixos estão **abertos**. ⚠️ ⛔ Isto é estado de **UI**, ⛔ e por
   * isso ⛔ ele ⛔ não mora no atendimento: ⛔ abrir ⛔ e fechar ⛔ não registra
   * ⛔ nem apaga fato ⛔ nenhum.
   *
   * ⚠️ ⛔ E ⛔ ele mora **acima desta tela** ⛔ porque os **tiles A–E** — que
   * vivem no cromado do módulo — ⛔ também o comandam. ⛔ Duas cópias dariam
   * tile aberto com bloco fechado.
   */
  eixosAbertos: readonly string[];
  onAlternarEixo: (grupo: string) => void;
  /**
   * ⚠️⚠️ **Concluir** é estado de **progresso**, ⛔ e ⛔ não fato clínico:
   * ⛔ ele ⛔ não afirma normalidade, ⛔ e ⛔ mexe ⛔ só em `eixosConcluidos`.
   */
  onConcluirEixo: (eixo: string) => void;
};

/**
 * ── ⚠️⚠️⚠️ AS DUAS TABELAS DESTE BLOCO MUDARAM DE CASA — 2026-09-08 ─────────
 *
 * ⛔ `COR_DO_GRUPO` ⛔ e `ICONE_DO_GRUPO` moravam ⛔ aqui, ⛔ e ⛔ serviam ⛔ só
 * esta tela. ⚠️ Elas ⛔ agora são `ASSUNTO_DO_BLOCO`, em `./ui` — ⛔ **a mesma
 * tabela para o módulo inteiro**.
 *
 * ⚠️⚠️ ⛔ O MOTIVO ⛔ NÃO FOI ARRUMAÇÃO: ⛔ o autor voltou em 2026-09-08 com o
 * ⛔ mesmo relato de 2026-09-06 — *"está tudo da mesma cor"* — ⛔ olhando
 * ⛔ **outra** superfície. ⚠️ A correção existia ⛔ e ⛔ não alcançava as demais,
 * ⛔ porque ⛔ ela estava trancada dentro deste arquivo.
 *
 * ⚠️ ⛔ Os seis valores atravessaram **sem revisão** — ⛔ ver a nota na tabela.
 */

/**
 * ── ⚠️⚠️⚠️ O RESUMO DO EIXO RECOLHIDO — 2026-09-08 ─────────────────────────
 *
 * ⛔ ⛔ Relato do autor: *"o usuário pode preencher coisas ⛔ e depois ⛔ nem sabe
 * o que preencheu"*. ⚠️ ⛔ Um bloco fechado ⛔ sem resumo é ⛔ exatamente isso.
 *
 * ⚠️⚠️ ⛔ E ⛔ ELE ⛔ NÃO INTERPRETA ⛔ NADA: ⛔ **repete o que foi registrado**,
 * ⛔ na ordem em que os campos aparecem. ⛔ Sem juízo, ⛔ sem faixa, ⛔ sem
 * *"normal"* — ⛔ quem julga é o motor, ⛔ e ⛔ ele já fala pelo símbolo do tile.
 *
 * ⚠️ ⛔ Os rótulos são **curtos de propósito**: *"Pressão sistólica 200"* numa
 * linha de resumo empurraria o resto para fora da tela em 375 px.
 */
const ROTULO_NO_RESUMO: Readonly<Record<string, string>> = {
  spo2: "SpO₂",
  fr: "FR",
  fc: "FC",
  glasgow: "Glasgow",
  glicemia: "glicemia",
  temperatura: "T",
  consciencia_rebaixada: "Consciência rebaixada",
  disfuncao_bulbar: "Disfunção bulbar",
  hipoxia: "Hipoxemia",
  monitorizacao: "Monitorização",
  acessos: "Acessos",
};

export default function SuperficieA({
  estado,
  agora,
  onEscolher,
  onMedir,
  onHora,
  onDesfazer,
  onNovaMedida,
  onAbrirCorrecoes,
  eixosAbertos,
  onAlternarEixo,
  onConcluirEixo,
}: Props) {
  const tr = useTr();
  const foco = useFoco();
  const e = useEstilosDoTema(criarEstilos);
  const detalhes = useDetalhes();
  const leituras = leiturasDaSuperficieA(estado);

  /**
   * ⚠️⚠️ ⛔ O RESUMO É **ECO**, ⛔ e ⛔ não leitura. ⛔ Ele lê o fato gravado ⛔ e
   * escreve ⛔ o que está lá — ⛔ nada mais.
   *
   * ⚠️ ⛔ A PA sai composta (`200/120`) ⛔ porque a **composição já existe no
   * núcleo**: `pressaoArterial()` devolve `medida: { pas, pad }`, ⛔ e a faixa
   * de ameaças ⛔ já a escreve assim. ⛔ Inventar aqui um segundo jeito de
   * escrever a mesma pressão daria duas notações para o mesmo fato.
   */
  function resumoDoEixo(grupo: (typeof GRUPOS_A)[number]): string {
    const partes: string[] = [];
    const ids = camposDoGrupo(grupo).map((c) => c.id);
    const num = (id: string) => {
      const v = valorAtual(estado, id)?.valor;
      return typeof v === "number" ? v : undefined;
    };

    if (ids.includes("pas") && ids.includes("pad")) {
      const pas = num("pas");
      const pad = num("pad");
      if (pas !== undefined && pad !== undefined) partes.push(`PA ${pas}/${pad} mmHg`);
      else if (pas !== undefined) partes.push(`PAS ${pas} mmHg`);
      else if (pad !== undefined) partes.push(`PAD ${pad} mmHg`);
    }

    for (const campo of camposDoGrupo(grupo)) {
      if (campo.id === "pas" || campo.id === "pad") continue;
      const bruto = valorAtual(estado, campo.id)?.valor;
      if (bruto === undefined || bruto === "") continue;
      const curto = tr(ROTULO_NO_RESUMO[campo.id] ?? campo.rotulo);
      if (typeof bruto === "number") {
        partes.push(`${curto} ${bruto}${campo.unidade ? ` ${tr(campo.unidade)}` : ""}`);
      } else if (campo.tipo === "multipla") {
        const itens = itensSelecionados(String(bruto));
        if (itens.length > 0) partes.push(itens.map((i) => tr(i)).join(", "));
      } else {
        partes.push(`${curto}: ${tr(String(bruto))}`);
      }
    }
    return partes.join(" · ");
  }
  /**
   * ⚠️ ⛔ A MESMA lista que o cockpit usa para acender o eixo — ⛔ e ⛔ não uma
   * segunda leitura do estado: ⛔ duas fontes sobre *"há bloqueio?"* dariam a
   * tela acesa com o bloco fechado, ⛔ ou o contrário.
   */
  const corrigiveis = bloqueiosCorrigiveis(estado);
  /** ⚠️ Derivação pura — ⛔ e ⛔ `undefined` quando falta uma das metades. */
  const pam = pressaoArterialMedia(estado);

  /** ⚠️ Rótulo por id — o painel de leituras nomeia os insumos que citou. */
  const rotuloDoCampo = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of TODOS_OS_CAMPOS_A) m[c.id] = c.rotulo;
    return m;
  }, []);

  /**
   * ⚠️⚠️ CAMPO COM INSTÂNCIA LÊ A **AFERIÇÃO ABERTA**, ⛔ e ⛔ não a trilha
   * inteira — ⛔ senão a sistólica da medida anterior apareceria na nova, a um
   * toque de virar uma aferição que ⛔ ninguém fez (E-52).
   */
  function fatoDoCampo(campo: { id: string; instanciaDe?: string }) {
    if (!campo.instanciaDe) return valorAtual(estado, campo.id);
    const aberta = instanciaAberta(estado, campo.instanciaDe);
    return aberta === undefined ? undefined : valorNaInstancia(estado, aberta, campo.id);
  }

  /** ⚠️ ⛔ Só oferece "nova medida" quando já existe uma medida para suceder. */
  function haMedidaAberta(grupo: { campos: readonly { id: string }[] }): boolean {
    return grupo.campos.some((c) => valorAtual(estado, c.id) !== undefined);
  }



  return (
    <View
      style={e.raiz}
      testID="avc-superficie-a-conteudo"
    >
      {/**
        * ── ⚠️⚠️⚠️ CORRIGIR AGORA — pedido do autor, 2026-09-08 ───────────────
        *
        * ⛔ ⛔ *"Hoje a tela identifica risco, ⛔ mas precisa ajudar o médico a
        * agir."* ⚠️ Até aqui a Estabilização acendia o eixo ⛔ e mandava
        * *"Abrir Correções"* — ⛔ a conduta com dose estava **uma navegação
        * adiante**, ⛔ no meio de um plantão.
        *
        * ⚠️⚠️ ⛔ E ⛔ NÃO É CONTEÚDO NOVO: ⛔ o desenho é o **mesmo componente**
        * que Correções desenha, lendo os **mesmos objetos** (F-19 para os
        * agentes, `TRATAMENTOS_GLICEMICOS`, `ALVOS_GLICEMICOS`,
        * `ERROS_A_EVITAR`). ⛔ Mudou Correções, muda aqui — ⛔ sem ninguém
        * lembrar de sincronizar.
        *
        * ⚠️⚠️ ⛔ E ⛔ **⛔ NADA É REGISTRADO AQUI**: ⛔ o bloco mostra ⛔ e leva.
        * ⛔ Quem grava que a correção foi feita é a **Correções**, com o gesto
        * explícito do médico — ⛔ e ⛔ é por isso que o atalho continua sendo a
        * saída (**E-09**).
        *
        * ⚠️ ⛔ Ele só existe quando **há bloqueio ativo**: ⛔ oferecer agentes
        * anti-hipertensivos a quem ⛔ não tem pressão alta seria a tela
        * ensinando a tratar o que ⛔ não existe.
        */}
      {corrigiveis.length === 0 ? null : (
        <View style={e.corrigirAgora} testID="avc-a-corrigir-agora">
          <Text style={e.corrigirTitulo}>{tr("Corrigir agora")}</Text>
          {corrigiveis.map((b) => (
            <View key={b.id} style={e.corrigirItem} testID={`avc-a-corrigir-${b.id}`}>
              {/** ⚠️ ⛔ O risco ⛔ e o alvo são a **formulação da fonte**. */}
              <Text style={e.corrigirRisco}>{tr(b.formulacao)}</Text>
              {b.id === "pressao_acima_da_meta" ? <CondutaDaPressao prefixo="avc-a-" /> : null}
              {b.id === "glicemia_alterada" ? <CondutaGlicemica prefixo="avc-a-" /> : null}
              <Pressable
                accessibilityRole="button"
                testID={`avc-a-registrar-${b.id}`}
                onPress={onAbrirCorrecoes}
                style={({ pressed }) => [e.corrigirSaida, pressed ? e.pressionado : null]}
              >
                <Text style={e.corrigirSaidaTexto}>
                  {tr("Registrar e acompanhar em Correções")}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      {/**
        * ⚠️⚠️ ESTABILIZAÇÃO PRIMEIRO — moldura de **prioridade**, ⛔ e ⛔ não conduta.
        *
        * ⛔ ⛔ Nenhuma meta, ⛔ nenhum fármaco, ⛔ nenhum limiar, ⛔ nenhum "se… então".
        */}
      {/**
        * ⚠️⚠️ LINHA, ⛔ e ⛔ NÃO CARD — decisão do autor, 2026-09-01.
        *
        * ⛔ O card ocupava ~120 px no topo de **toda** entrada, com a mesma
        * frase sempre. ⚠️ Ela continua inteira ⛔ e continua sendo a primeira
        * coisa que se lê; ⛔ o que sai é a moldura, ⛔ não o conteúdo.
        *
        * ⚠️ O título "Estabilização primeiro" saiu porque o nome da superfície
        * já está na faixa do cockpit ⛔ e aceso na barra: era o terceiro lugar
        * a dizer a mesma coisa.
        */}
      {/**
        * ⚠️⚠️ FORMA DE **AVISO INFORMATIVO** desde 2026-09-05 (PD-37) — ⛔ e ⛔ não
        * mais uma linha solta com um ⓘ ao lado.
        *
        * ⛔ Na captura, esta frase ficava **imediatamente abaixo** do nome da
        * fase, no mesmo peso ⛔ e com o seu próprio ⓘ: lia como um **segundo
        * subtítulo** da tela, ⛔ e ⛔ não como a regra clínica que ela é.
        *
        * ⚠️ É a regra mestra do app (*estabilização antes do protocolo*), ⛔ e
        * por isso ela ganha a faixa lateral de `info` — ⛔ presença declarada,
        * ⛔ sem gritar. ⛔ `atencao` seria errado: ⛔ não há nada de anormal
        * acontecendo com este paciente.
        */}
      <View style={e.prioridade} testID="avc-a-prioridade">
        <View style={e.prioridadeLinha}>
          <View style={e.prioridadeTexto}>
            <Text style={e.prioridadeFrase}>{tr(PRIORIDADE_A.frase)}</Text>
          </View>
          {/**
            * ⚠️⚠️ O PARÁGRAFO DO ABCDE SAI DA PRIMEIRA CAMADA.
            *
            * ⛔ Ele explicava a **ordem dos blocos** — informação sobre a tela,
            * ⛔ e ⛔ não sobre o paciente — ⛔ e abria a superfície com quatro
            * linhas de prosa. ⚠️ ⛔ Recolher ⛔ não é apagar: continua a um toque.
            */}
          <Recolhido
            id="a-prioridade"
            texto={PRIORIDADE_A.nota}
            aberto={detalhes.aberto("a-prioridade")}
            onAlternar={() => detalhes.alternar("a-prioridade")}
          />
        </View>
      </View>

      {GRUPOS_A.map((grupo) => {
        const visiveis = camposDoGrupo(grupo).filter((campo) =>
          campoAparece(campo, (c) => valorAtual(estado, c)?.valor)
        );
        /** ⚠️ ⛔ `undefined` = ⛔ não é eixo do ABCDE, ⛔ e ⛔ não recolhe. */
        const eixo = eixoDoGrupo(grupo.id);
        const aberto = eixo === undefined || eixosAbertos.includes(grupo.id);
        return (
          <View
            key={grupo.id}
            style={e.grupo}
            testID={`avc-grupo-${grupo.id}`}
            /**
             * ⚠️⚠️ O GRUPO REGISTRA **QUAIS CAMPOS CONTÉM** — ⛔ e ⛔ não ⛔ só a
             * si mesmo. ⚠️ Quem toca *"Pressão arterial"* ⛔ não sabe em que
             * bloco ela mora; ⛔ quem sabe é o bloco.
             */
            /**
             * ⚠️⚠️ O GRUPO ENTREGA O **NÓ**, ⛔ e ⛔ não uma posição de layout.
             *
             * ⛔ A primeira versão registrava `onLayout` — que, medido no
             * navegador, ⛔ nunca disparou nestas Views. ⚠️ O nó é medido no
             * momento do toque, ⛔ e ⛔ isso ⛔ não depende de evento anterior.
             *
             * ⚠️ Ele declara **quais campos contém**: quem toca *"Pressão
             * arterial"* ⛔ não sabe em que bloco ela mora — ⛔ quem sabe é o
             * bloco.
             */
            ref={(n) => foco.registrarGrupo(camposDoGrupo(grupo).map((c) => c.id), n)}
          >
            {/**
              * ⚠️⚠️ FILETE NO LUGAR DA BARRA CHEIA. ⛔ Com seis blocos de barra
              * preenchida, ⛔ nenhum era hierarquia — eram seis pesos iguais.
              */}
            {/**
              * ── ⚠️⚠️⚠️ O CABEÇALHO DO EIXO ABRE ⛔ E FECHA — 2026-09-08 ─────
              *
              * ⚠️ ⛔ Só os **cinco eixos**: `Monitorização e acessos` ⛔ não é
              * eixo do ABCDE, ⛔ e ⛔ continua sempre aberto — ⛔ instalar
              * monitor ⛔ e pegar acesso precede avaliar.
              */}
            {eixo === undefined ? (
              <View style={e.cabecalho} testID={`avc-bloco-${grupo.id}`}>
                <Secao titulo={grupo.titulo} assunto={grupo.id} />
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                aria-expanded={aberto}
                accessibilityLabel={`${tr(grupo.titulo)}: ${tr(aberto ? "recolher" : "abrir")}`}
                testID={`avc-eixo-abrir-${grupo.id}`}
                onPress={() => onAlternarEixo(grupo.id)}
                style={({ pressed }) => [e.cabecalho, pressed ? e.pressionado : null]}
              >
                <Secao titulo={grupo.titulo} assunto={grupo.id} />
                {/**
                  * ── ⚠️⚠️⚠️ O SELO DE CONCLUÍDO ⛔ NO CABEÇALHO — 2026-09-08 ──
                  *
                  * ⛔ ⛔ Relato do autor, em produção: *"respiração fica aberto
                  * ⛔ como se ⛔ não tivesse feito"*. ⚠️ ⛔ Um eixo concluído
                  * **aberto** ficava idêntico a um ⛔ não concluído — ⛔ o único
                  * sinal era o texto do botão ⛔ lá no fim do bloco.
                  *
                  * ⚠️ ⛔ Aqui ⛔ ele aparece **aberto ⛔ ou fechado**, ⛔ e ⛔ ao
                  * lado do nome: ⛔ é progresso, ⛔ e ⛔ por isso vem em caixa
                  * alta, ⛔ como no tile — ⛔ e ⛔ **⛔ não** diz ⛔ nada sobre o
                  * paciente.
                  */}
                {eixo !== undefined && estado.eixosConcluidos.includes(eixo) ? (
                  <Text style={e.eixoConcluido} testID={`avc-eixo-selo-${grupo.id}`}>
                    {tr("Concluída")}
                  </Text>
                ) : null}
                <Text style={e.eixoSinal}>{aberto ? "▾" : "▸"}</Text>
              </Pressable>
            )}

            {/**
              * ── ⚠️⚠️⚠️ O RESUMO DO EIXO FECHADO ───────────────────────────
              *
              * ⛔ ⛔ *"⛔ Nem sabe o que preencheu"* — ⛔ é a frase do autor, ⛔ e
              * é a razão deste bloco. ⚠️ ⛔ Ele repete o registrado, ⛔ e ⛔ não
              * interpreta.
              *
              * ⚠️⚠️ ⛔ E O ESTADO DE PROGRESSO ENTRA **DEPOIS DO PONTO**, ⛔ e
              * ⛔ nunca no lugar do dado: *"Sem dados clínicos registrados ·
              * Avaliação concluída"* diz as duas coisas ⛔ sem que uma
              * signifique a outra.
              */}
            {eixo === undefined || aberto ? null : (
              <Text style={e.eixoResumo} testID={`avc-eixo-resumo-${grupo.id}`} numberOfLines={3}>
                {[
                  resumoDoEixo(grupo) || tr("Sem dados clínicos registrados"),
                  ...(estado.eixosConcluidos.includes(eixo) ? [tr("Avaliação concluída")] : []),
                ].join(" · ")}
              </Text>
            )}

            {/**
              * ── ⚠️⚠️ A PAM — **DERIVADA**, ⛔ e ⛔ nunca digitada ────────────
              *
              * ⚠️ Decisão do autor (**item 10**): *"⛔ Nunca pedir ao usuário
              * que informe PAM se PAS ⛔ e PAD estiverem disponíveis. Se faltar
              * PAS ⛔ ou PAD, PAM fica indefinida."*
              *
              * ⛔ ⛔ Ela ⛔ **não é campo**: ⛔ não tem caixa, ⛔ não aceita toque
              * ⛔ e ⛔ não vira fato. ⚠️ Persistir a PAM criaria um **segundo
              * produtor** para algo que já se sabe de PAS ⛔ e PAD — ⛔ e ⛔ os
              * dois poderiam divergir.
              *
              * ⚠️ ⛔ E ⛔ ela ⛔ não aparece quando ⛔ não há as duas metades:
              * ⛔ ausência ⛔ não vira zero, ⛔ e ⛔ nem travessão com cara de
              * medida.
              */}
            {/**
              * ⚠️⚠️ ⛔ RECOLHIDO É **RECOLHIDO** — 2026-09-08, revisão em 375 px.
              *
              * ⛔ ⛔ A PAM ⛔ e o *"Nova medida"* ficavam ⛔ na tela com o eixo
              * fechado: ⛔ eles ⛔ não são campo, ⛔ e ⛔ escaparam do recorte.
              * ⚠️ ⛔ Um bloco *"fechado"* que continua mostrando derivada ⛔ e
              * botão de gesto ⛔ não está fechado — ⛔ e desmente o resumo
              * ⛔ logo acima.
              */}
            {!aberto ? null : grupo.id === "pressao" && pam !== undefined ? (
              <View style={e.derivada} testID="avc-pam">
                <Text style={e.derivadaRotulo}>{tr("Pressão arterial média")}</Text>
                <Text style={e.derivadaValor}>{pam}</Text>
                <Text style={e.derivadaUnidade}>{tr("mmHg")}</Text>
                {/** ⚠️ ⛔ Ela diz de onde vem — ⛔ número ⛔ sem procedência ⛔ não se audita. */}
                <Text style={e.derivadaNota}>{tr("calculada de PAS e PAD")}</Text>
              </View>
            ) : null}

            {/**
              * ⚠️⚠️ "NOVA MEDIDA" — o gesto explícito de §3.4. ⛔ Sem ele ⛔ não há
              * como distinguir *"o paciente foi medido de novo"* de *"aquele
              * valor ⛔ nunca foi verdade"*.
              */}
            {aberto && grupo.campos.some((c) => c.instanciaDe) && haMedidaAberta(grupo) ? (
              <Pressable
                style={e.novaMedida}
                accessibilityRole="button"
                testID={`avc-nova-medida-${grupo.id}`}
                onPress={() => onNovaMedida(grupo.campos.find((c) => c.instanciaDe)!.instanciaDe!)}
              >
                <Text style={e.novaMedidaTexto}>{tr("Nova medida")}</Text>
              </Pressable>
            ) : null}

            {!aberto ? null : visiveis.map((campo) => {
              const fato = fatoDoCampo(campo);
              const bruto = String(fato?.valor ?? "");

              /**
               * ⚠️⚠️ A ETIQUETA DIZ ONDE O FATO MORA — ⛔ e ⛔ não que é cópia.
               *
               * ⛔ O peso mora em **Paciente** ⛔ e é preenchido aqui. ⚠️ Sem a
               * etiqueta, quem responde aqui ⛔ e vê preenchido lá pensa que
               * respondeu duas vezes — ⛔ e a primeira coisa que faz é desconfiar
               * da tela. ⛔ A reescrita a tinha perdido.
               */
              const comEtiqueta = (conteudo: ReactNode) =>
                campo.casa === "estabilizacao" ? (
                  conteudo
                ) : (
                  <View key={campo.id} testID={`avc-emprestado-${campo.id}`}>
                    <Text style={e.origem}>
                      {tr("Do painel")} {tr("Paciente")}
                    </Text>
                    {conteudo}
                  </View>
                );

              /* ── escolhas ─────────────────────────────────────────────── */
              if (campo.tipo === "escolha" && campo.opcoes) {
                return comEtiqueta(
                  <View key={campo.id} style={e.pergunta} testID={`avc-campo-${campo.id}`}>
                    <View style={e.perguntaTopo}>
                      <Text style={e.perguntaTexto}>{tr(campo.rotulo)}</Text>
                      {/**
                        * ⚠️⚠️ O ⓘ CARREGA **TUDO** — ajuda, nota ⛔ e a FONTE.
                        *
                        * ⛔ Escolher entre `nota` e `ajuda` apagava uma delas, ⛔ e
                        * deixar de renderizar `DetalheDoCampo` apagava a
                        * procedência da afirmação (E-30).
                        */}
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
                      valor={bruto}
                      onEscolher={onEscolher}
                      onDesfazer={onDesfazer}
                    />
                  </View>
                );
              }

              /* ── números ──────────────────────────────────────────────── */
              if (campo.tipo === "grandeza" && campo.faixa) {
                return comEtiqueta(
                  <View key={campo.id} testID={`avc-campo-${campo.id}`} style={e.linhaNumero}>
                    <Numero
                      /**
                       * ⚠️⚠️ A BARRA VIVE **AQUI**, ⛔ e ⛔ não no ASPECTS.
                       *
                       * ⛔ Pedido do autor em 2026-09-06 sobre esta tela: PA,
                       * glicemia, SpO₂ ⛔ e peso têm faixas largas, ⛔ e o `+` de
                       * passo 1 é ⛔ ~150 toques até uma sistólica de 190.
                       * ⚠️ ⛔ A caixa continua sendo o caminho exato; a barra é o
                       * gesto grosso que leva perto em ⛔ um movimento.
                       */
                      comBarra
                      campo={campo.id}
                      rotulo={campo.rotulo}
                      unidade={campo.unidade}
                      faixa={campo.faixa}
                      gravado={typeof fato?.valor === "number" ? fato.valor : undefined}
                      onMedir={onMedir}
                      onDesfazer={onDesfazer}
                    />
                    <Recolhido
                      id={campo.id}
                      texto={campo.ajuda}
                      aberto={detalhes.aberto(campo.id)}
                      onAlternar={() => detalhes.alternar(campo.id)}
                    >
                      <DetalheDoCampo campo={campo} />
                    </Recolhido>
                  </View>
                );
              }

              /* ── achados (seleção múltipla) ───────────────────────────── */
              if (campo.tipo === "multipla" && campo.opcoes) {
                return comEtiqueta(
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
                    <Achados
                      campo={campo.id}
                      opcoes={campo.opcoes}
                      selecionados={itensSelecionados(bruto)}
                      onAlternar={(op) => {
                        /**
                         * ⚠️⚠️ A REGRA É `alternarItem` — ⛔ e ⛔ não esta tela.
                         * ⛔ Desmarcar o último ⛔ não grava vazio: devolve o
                         * campo a "⛔ ninguém respondeu" (§7.16).
                         */
                        const novo = alternarItem(bruto, op, campo.exclusivas ?? []);
                        if (novo === "") onDesfazer(campo.id);
                        else onEscolher(campo.id, novo);
                      }}
                    />
                  </View>
                );
              }

              /**
               * ⚠️ Qualquer tipo ⛔ não previsto continua no componente antigo.
               *
               * ⛔ As regras de exclusividade ("Nenhum desses", "Não sei") são
               * encapsuladas ⛔ e foram conquistadas com defeito real. ⛔ Reescrevê-las
               * ⛔ não era o pedido, ⛔ e refazê-las de memória seria o jeito mais
               * rápido de perdê-las.
               */
              return (
                <CampoDaSuperficie
                  key={campo.id}
                  campo={campo}
                  casaAtual="estabilizacao"
                  bruto={bruto}
                  numero={typeof fato?.valor === "number" ? fato.valor : undefined}
                  agora={agora}
                  detalheAberto={detalhes.aberto(campo.id)}
                  onAlternarDetalhe={() => detalhes.alternar(campo.id)}
                  onEscolher={onEscolher}
                  onMedir={onMedir}
                  onHora={onHora}
                  onDesfazer={onDesfazer}
                  nomeDaCasa="Paciente"
                />
              );
            })}

            {/**
              * ── ⚠️⚠️⚠️ **CONCLUIR** MORA ⛔ DENTRO DO EIXO — 2026-09-08 ─────
              *
              * ⛔ ⛔ Eram cinco botões numa fileira ⛔ no topo, longe do que
              * ⛔ eles concluíam. ⚠️ Decisão do autor: *"o botão `Concluir` fica
              * dentro do próprio eixo, no final do bloco"*.
              *
              * ⚠️⚠️ ⛔ E ⛔ ELE ⛔ NÃO CRIA FATO: ⛔ mexe ⛔ só em
              * `eixosConcluidos`, ⛔ e ⛔ **⛔ não infere normalidade** — ⛔ um
              * eixo concluído ⛔ sem dado continua dizendo *"Sem dados clínicos
              * registrados"*.
              */}
            {eixo === undefined || !aberto ? null : (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ checked: estado.eixosConcluidos.includes(eixo) }}
                accessibilityLabel={`${tr(grupo.titulo)}: ${tr(
                  estado.eixosConcluidos.includes(eixo)
                    ? "reabrir avaliação"
                    : "marcar avaliação como concluída"
                )}`}
                testID={`avc-eixo-concluir-${grupo.id}`}
                onPress={() => onConcluirEixo(eixo)}
                style={({ pressed }) => [e.concluirNoEixo, pressed ? e.pressionado : null]}
              >
                <Text style={e.concluirNoEixoTexto}>
                  {tr(estado.eixosConcluidos.includes(eixo) ? "Reabrir avaliação" : "Concluir avaliação")}
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}


      {/**
        * ⚠️⚠️ TRÊS BLOCOS NO LUGAR DA PAREDE — decisão do autor, 2026-09-01.
        *
        * ⛔ `PainelDeLeituras` é compartilhado por B, C, D ⛔ e Laboratório:
        * mudá-lo mudaria B–G. ⚠️ A renderização aqui é **apresentação pura** —
        * o texto, o tom ⛔ e a fonte vêm da leitura, ⛔ e ⛔ nada é recalculado.
        */}
      <LeiturasEmBlocos
        leituras={leituras}
        /**
         * ⚠️⚠️ ABERTO POR PADRÃO — ⛔ e a primeira versão o fechava.
         *
         * ⛔ O bloco "Registrado" é onde o médico **vê a consequência do que
         * acabou de responder**. Fechado, o feedback do registro sumia no
         * instante em que ele acontecia — ⛔ isso ⛔ não é reduzir parede, é
         * apagar retorno. ⚠️ A parede que incomodava era a de **alertas**, ⛔ e
         * ela se resolve pela hierarquia dos três blocos, ⛔ não por esconder.
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
                  {/** ⚠️ Sem o sujeito, quatro analitos dariam linhas idênticas. */}
                  {l.sujeito ? `${tr(l.sujeito)} — ` : ""}
                  {tr(l.curto)}
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
                  {/**
                    * ⚠️⚠️ A FRASE QUE DIZ DE QUEM É A DECISÃO — ⛔ e ela ⛔ não é
                    * decorativa: o painel compartilhado a carrega em TODA
                    * leitura, ⛔ e omiti-la faria a tela parecer que conclui.
                    */}
                  <Text style={e.leituraFonte}>
                    {tr("Apoio ao julgamento clínico. A decisão permanece do médico.")}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    /**
     * ⚠️ Card de prioridade: destaque **sem** cor de espécie clínica — ele ⛔ não é
     * um estado do paciente, é a ordem de leitura da tela (**E-39**).
     */
    /**
     * ⚠️ Faixa lateral `info`, ⛔ e ⛔ não caixa colorida inteira: a regra mestra
     * se declara presente, ⛔ sem competir com a decisão da tela.
     */
    /**
     * ⚠️⚠️ NEUTRA, ⛔ e ⛔ não colorida — revisto pelo autor em 2026-09-05.
     *
     * ⛔ A faixa ciano criava **mais uma categoria visual chamativa** para algo
     * que é **contexto**, ⛔ e ⛔ não ação, alerta ⛔ nem risco. ⚠️ O princípio do
     * sistema é: `primary` = ação · `warning`/`critical` = risco · `info` =
     * contexto **quando realmente ajuda a identificar** · neutro = estrutura.
     *
     * ⚠️ Aqui a identificação vem de **tipografia ⛔ e superfície**: o segundo
     * degrau separa o bloco ⛔ sem pintar a tela. ⛔ Um app cheio de faixas
     * coloridas ⛔ não tem hierarquia — tem ruído.
     */
    prioridade: {
      backgroundColor: tema.cores.controlSurface,
      borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.sm,
    },
    /** ⚠️ A revelação do ⓘ — recuada, presa ao campo acima. */
    explicacao: { paddingLeft: ESPACO.md, paddingBottom: ESPACO.sm },
    /**
     * ⚠️ O ⓘ vem NO FIM DA FRASE, ⛔ e ⛔ não numa coluna à direita: ali ele
     * ficava alinhado com o ⓘ do resumo da superfície, dois ⓘ empilhados na
     * mesma coluna — ⛔ e ⛔ nada dizia que eram conteúdos diferentes.
     */
    prioridadeLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    prioridadeTexto: { flexShrink: 1 },
    prioridadeFrase: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "600",
    },
    prioridadeNota: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
    },
    grupo: { gap: ESPACO.xs },
    cabecalho: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACO.sm,
      marginTop: ESPACO.md,
    },
    /**
     * ⚠️ O ⓘ fica NA LINHA do campo. ⛔ Abaixo, ele ocupava uma faixa inteira
     * ⛔ e parecia um controle solto, ⛔ sem dono.
     */
    corrigirAgora: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: tema.cores.warning,
      padding: ESPACO.md,
      gap: ESPACO.sm,
    },
    corrigirTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.warning },
    corrigirItem: { gap: ESPACO.xs },
    corrigirRisco: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    corrigirSaida: {
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.primary,
      paddingHorizontal: ESPACO.md,
    },
    corrigirSaidaTexto: { ...PAPEL.textoPrincipal, color: tema.cores.primary },
    pressionado: { opacity: 0.7 },
    /** ⚠️ ⛔ O sinal ⛔ não vai sozinho: o cabeçalho inteiro é o alvo do toque. */
    eixoSinal: { ...PAPEL.textoPrincipal, color: tema.cores.textSecondary },
    /** ⚠️ Progresso, ⛔ e ⛔ não clínica — ⛔ o mesmo idioma do tile. */
    eixoConcluido: {
      ...PAPEL.micro,
      color: tema.cores.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    /** ⚠️ Eco do registrado — ⛔ e por isso **secundário**, ⛔ e ⛔ não título. */
    eixoResumo: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
    concluirNoEixo: {
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.border,
      backgroundColor: tema.cores.controlSurface,
      marginTop: ESPACO.xs,
    },
    concluirNoEixoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    linhaNumero: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    /** ⚠️ Recuada e colada ao relógio — ⛔ ela ⛔ não flutua entre dois. */
    /**
     * ⚠️⚠️ ⛔ SEM PUXÃO NEGATIVO — corrigido em 2026-09-06, relato do autor:
     * *"aqui tem sobreposição de imagem"*.
     *
     * ⛔ Havia `marginTop: -ESPACO.xs`. ⚠️ Enquanto *"Sem essa informação"* era
     * **texto solto**, os 4 px para cima só o encostavam no relógio de cima — ⛔ e
     * era ⛔ exatamente o que se queria, porque a sub-linha **pertence ao relógio
     * acima**, ⛔ e ⛔ não ao de baixo.
     *
     * ⚠️⚠️ ⛔ AO GANHAR CORPO ⛔ E BORDA, o mesmo −4 px deixou de aproximar ⛔ e
     * passou a **cobrir a borda do cartão**. ⛔ É o preço escondido da
     * afordância: ⛔ toda folga negativa desenhada para um texto vira
     * sobreposição quando o texto vira caixa.
     *
     * ⚠️ O pertencimento continua dito — ⛔ e por meio que ⛔ não empilha objeto
     * sobre objeto: o **recuo à esquerda**.
     */
    subLinha: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      paddingLeft: ESPACO.md,
      marginTop: ESPACO.xs,
      marginBottom: ESPACO.sm,
    },
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
    origem: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },

    pergunta: { gap: ESPACO.xs, paddingVertical: ESPACO.xs },
    perguntaTopo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    perguntaTexto: { flex: 1, color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },

    /**
     * ⚠️⚠️ *"Sem essa informação"* É UMA **RESPOSTA**, ⛔ e ⛔ não uma legenda —
     * 2026-09-06. ⛔ Ela declara ignorância (**E-37**), que é diferente de ⛔ não
     * ter perguntado; ⛔ e uma resposta que ⛔ não parece tocável ⛔ nunca é dada.
     */
    desconhecidoCompacto: {
      minHeight: TOQUE.minimo,
      alignSelf: "flex-start",
      justifyContent: "center",
      paddingHorizontal: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    desconhecidoTexto: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
    },
    desconhecidoOn: { color: tema.cores.text, fontWeight: "700" },

    /**
     * ⚠️ A linha da **derivada** — ⛔ e ⛔ ela ⛔ não parece campo de propósito:
     * ⛔ sem caixa, ⛔ sem borda de controle, ⛔ sem alvo de toque. ⛔ O que ⛔ não
     * se digita ⛔ não pode ter cara de coisa que se digita.
     */
    derivada: {
      flexDirection: "row",
      alignItems: "baseline",
      flexWrap: "wrap",
      gap: ESPACO.xs,
      paddingVertical: ESPACO.xs,
    },
    derivadaRotulo: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    derivadaValor: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.step.fontSize,
      fontWeight: "700",
    },
    derivadaUnidade: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    derivadaNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    novaMedida: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.controlSurface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.controlBorder,
    },
    novaMedidaTexto: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "600",
    },
  });
