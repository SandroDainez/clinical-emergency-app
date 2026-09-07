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
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { campoAparece, camposDoGrupo, valorDaOpcao } from "../../avc/conteudo/campo";
import { GRUPOS_A, PRIORIDADE_A, TODOS_OS_CAMPOS_A } from "../../avc/conteudo/superficie-a";
import { leiturasDaSuperficieA, pressaoArterialMedia } from "../../avc/nucleo/derivacoes";
import { instanciaAberta, valorNaInstancia } from "../../avc/nucleo/instancia";
import { horaDeExibicao } from "../../avc/nucleo/formato";
import { alternarItem, itensSelecionados } from "../../avc/nucleo/selecao";
import { valorAtual, type EstadoAvc } from "../../avc/nucleo/estado";
import { useEstilosDoTema, useTheme, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { ESTADOS, type EstadoClinico } from "../../design-system/estados-clinicos";
import { useTr } from "../../lib/use-tr";
import { CampoDaSuperficie, DetalheDoCampo, useDetalhes } from "./campos-clinicos";

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
import SeletorDeHora from "./seletor-de-hora";
import {
  Achados,
  Icone,
  LeiturasEmBlocos,
  LinhaDeRelogio,
  Numero,
  Recolhido,
  Secao,
  Segmentado,
  type NomeDeIcone,
} from "./ui";
import { InfoToggle } from "./sistema";
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
};

/**
 * ⚠️ O ícone de cada bloco é DECLARADO, ⛔ e ⛔ não escolhido no meio do JSX.
 * ⛔ Bloco sem ícone declarado simplesmente ⛔ não ganha um — ⛔ nada de
 * improvisar símbolo para um grupo novo.
 */
/**
 * ⚠️⚠️ A COR DO BLOCO — acrescentada em 2026-09-06.
 *
 * ⛔ Relato do autor: *"tudo muito cinza ainda, tudo fica parecido ⛔ e
 * confunde"*. ⚠️ Nas referências, cada domínio tem a sua cor de reconhecimento
 * — ⛔ e é ela que deixa o olho achar *"pressão"* ⛔ sem ler todos os títulos.
 *
 * ⚠️⚠️ ⛔ E ⛔ ISSO ⛔ NÃO É COR-COMO-ESTADO (**E-15**): ⛔ ela ⛔ não diz se está
 * bom ⛔ ou ruim, ⛔ nem muda quando o valor muda. ⛔ Ela identifica **de que
 * assunto se trata**, ⛔ e o título escrito ao lado diz o mesmo.
 *
 * ⛔ Bloco sem cor declarada fica neutro — ⛔ nada de improvisar cor nova no JSX.
 */
const COR_DO_GRUPO: Readonly<Record<string, "critical" | "info" | "success" | "warning" | "debt" | "primary">> = {
  relogios: "primary",
  "via-aerea": "info",
  respiracao: "info",
  pressao: "critical",
  glicemia: "debt",
  peso: "warning",
  crise: "warning",
};

const ICONE_DO_GRUPO: Readonly<Record<string, NomeDeIcone>> = {
  relogios: "chegada",
  "via-aerea": "viaAerea",
  respiracao: "respiracao",
  pressao: "circulacao",
  glicemia: "glicemia",
  peso: "peso",
  crise: "crise",
};

/** ⚠️ Ícone por relógio — cada marco tem o seu, ⛔ e ⛔ nenhum divide símbolo. */
const ICONE_DO_RELOGIO: Readonly<Record<string, NomeDeIcone>> = {
  hora_chegada: "chegada",
  hora_ultima_vez_bem: "ultimaVezBem",
  hora_inicio_observado: "inicioObservado",
  hora_reconhecimento: "reconhecimento",
  hora_meio_do_sono: "meioDoSono",
};

export default function SuperficieA({
  estado,
  agora,
  onEscolher,
  onMedir,
  onHora,
  onDesfazer,
  onNovaMedida,
}: Props) {
  const tr = useTr();
  const foco = useFoco();
  const tema = useTheme();
  const e = useEstilosDoTema(criarEstilos);
  const detalhes = useDetalhes();
  const leituras = leiturasDaSuperficieA(estado);
  /** ⚠️ Derivação pura — ⛔ e ⛔ `undefined` quando falta uma das metades. */
  const pam = pressaoArterialMedia(estado);

  /** ⚠️ Rótulo por id — o painel de leituras nomeia os insumos que citou. */
  const rotuloDoCampo = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of TODOS_OS_CAMPOS_A) m[c.id] = c.rotulo;
    return m;
  }, []);

  /** ⚠️ Qual relógio está aberto para edição — ⛔ e o seletor é o antigo. */
  const [editando, setEditando] = useState<
    { campo: string; relogio?: string; instante: number; selecionado: boolean } | undefined
  >(undefined);

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

  /** ⚠️ "Ninguém sabe dizer" — ⛔ diferente de ⛔ não ter sido perguntado (E-02). */
  function marcadoDesconhecido(id: string): boolean {
    return String(valorAtual(estado, id)?.valor ?? "") === "nao_sei";
  }

  /**
   * ── ⚠️⚠️ O SELETOR NASCE **COLADO NO RELÓGIO QUE ELE EDITA** ────────────
   *
   * ⛔ Relato do autor, 2026-09-06: *"os botões ⛔ não funcionam"*. ⚠️ ⛔ E eles
   * funcionavam: o toque abria o seletor — **a 2.596 px**, no fim da
   * superfície, ⛔ fora de qualquer tela. ⛔ Medido, ⛔ e ⛔ não deduzido.
   *
   * ⚠️⚠️ ⛔ ABRIR ALGO QUE ⛔ NINGUÉM VÊ É O MESMO QUE ⛔ NÃO ABRIR — ⛔ e pior,
   * porque ensina o médico a ⛔ não confiar no controle.
   *
   * ⚠️⚠️ ⛔ E HÁ UMA RAZÃO **CLÍNICA** ALÉM DA ERGONÔMICA: `SeletorDeHora` ⛔ não
   * escreve o nome do marco na própria tela — ⛔ ele o entrega ⛔ só como rótulo
   * acessível, ⛔ e o comentário dele diz por quê: *"o cartão do campo, logo
   * acima, já diz de que marco se trata"*. ⛔ Renderizado no rodapé, esse
   * *"logo acima"* ⛔ deixava de existir: ⛔ o médico via um seletor **sem nome**
   * ⛔ e ⛔ nenhuma forma de saber se estava editando *última vez visto bem*
   * ⛔ ou *chegada*. ⛔ Num módulo em que o marco decide a janela, ⛔ isso ⛔ não
   * é ergonomia.
   */
  function seletorDoCampo(campoId: string) {
    if (editando?.campo !== campoId) return null;
    return (

        <SeletorDeHora
          rotulo={TODOS_OS_CAMPOS_A.find((c) => c.id === editando.campo)?.rotulo ?? editando.campo}
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
            onHora(editando.campo, editando.instante, editando.relogio);
            setEditando(undefined);
          }}
          onCancelar={() => setEditando(undefined)}
        />
    );
  }

  return (
    <View
      style={e.raiz}
      testID="avc-superficie-a-conteudo"
    >
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
            <View style={e.cabecalho} testID={`avc-bloco-${grupo.id}`}>
              {ICONE_DO_GRUPO[grupo.id] ? (
                <Icone
                  nome={ICONE_DO_GRUPO[grupo.id]}
                  tamanho={18}
                  cor={COR_DO_GRUPO[grupo.id] ? tema.cores[COR_DO_GRUPO[grupo.id]] : undefined}
                />
              ) : null}
              <Secao titulo={grupo.titulo} />
            </View>

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
            {grupo.id === "pressao" && pam !== undefined ? (
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
            {grupo.campos.some((c) => c.instanciaDe) && haMedidaAberta(grupo) ? (
              <Pressable
                style={e.novaMedida}
                accessibilityRole="button"
                testID={`avc-nova-medida-${grupo.id}`}
                onPress={() => onNovaMedida(grupo.campos.find((c) => c.instanciaDe)!.instanciaDe!)}
              >
                <Text style={e.novaMedidaTexto}>{tr("Nova medida")}</Text>
              </Pressable>
            ) : null}

            {visiveis.map((campo) => {
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

              /* ── relógios ──────────────────────────────────────────────── */
              if (campo.tipo === "hora") {
                const desconhecido = marcadoDesconhecido(campo.id);
                const instante = typeof fato?.valor === "number" ? fato.valor : undefined;
                return comEtiqueta(
                  <View key={campo.id} testID={`avc-campo-${campo.id}`}>
                    <LinhaDeRelogio
                      campo={campo.id}
                      icone={ICONE_DO_RELOGIO[campo.id] ?? "chegada"}
                      rotulo={campo.rotulo}
                      /**
                       * ⚠️ O MESMO texto de antes — `✓ HH:MM ✎` e "Informar
                       * horário" —, porque é sobre ele que a suíte afirma.
                       */
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
                      /** ⚠️ Realce ⛔ só enquanto o campo revelado segue vazio. */
                      destaque={campo.apareceQuando !== undefined && instante === undefined}
                      onPress={() =>
                        setEditando({
                          campo: campo.id,
                          relogio: campo.relogio,
                          instante: instante ?? agora,
                          /** ⚠️⚠️ Abrir ⛔ NÃO é escolher — o gate de §0.2. */
                          selecionado: instante !== undefined,
                        })
                      }
                      /**
                        * ⚠️⚠️ O ⓘ NA LINHA DO RÓTULO (PD-37) — ⛔ e ⛔ não numa
                        * linha própria embaixo. ⛔ Solto, ⛔ ele ⛔ não dizia qual
                        * relógio explicava; num campo de horário isso troca o
                        * marco temporal.
                        */
                      info={
                        <InfoToggle
                          aberto={detalhes.aberto(campo.id)}
                          onAlternar={() => detalhes.alternar(campo.id)}
                          rotuloAcessivel={`${tr(campo.rotulo)}: ver explicação`}
                          testID={`avc-info-${campo.id}`}
                        />
                      }
                    />
                    {/**
                      * ⚠️⚠️ A SUB-LINHA PERTENCE AO RELÓGIO ACIMA.
                      *
                      * ⛔ Soltas, "Sem essa informação" e o ⓘ flutuavam entre
                      * dois relógios ⛔ e pareciam pertencer ao **de baixo** —
                      * ⛔ e num campo de horário isso troca o marco.
                      */}
                    <View style={e.subLinha}>
                    {campo.aceitaDesconhecido ? (
                      <Pressable
                        style={e.desconhecidoCompacto}
                        accessibilityRole="radio"
                        /** ⚠️ `aria-checked` — ⛔ `selected` ⛔ não anuncia rádio. */
                        accessibilityState={{ checked: desconhecido }}
                        aria-checked={desconhecido}
                        accessibilityLabel={`${tr(campo.rotulo)}: ${tr("Sem essa informação")}`}
                        testID={`avc-hora-desconhecido-${campo.id}`}
                        /** ⚠️ Tocar de novo DESFAZ — corrige, ⛔ e ⛔ não apaga. */
                        onPress={() =>
                          desconhecido ? onDesfazer(campo.id) : onEscolher(campo.id, "nao_sei")
                        }
                      >
                        <Text style={[e.desconhecidoTexto, desconhecido ? e.desconhecidoOn : null]}>
                          {desconhecido ? "✓ " : ""}
                          {tr("Sem essa informação")}
                        </Text>
                      </Pressable>
                    ) : null}
                    </View>
                    {seletorDoCampo(campo.id)}
                    {/**
                      * ⚠️ A revelação vem EMBAIXO do relógio que o ⓘ explica —
                      * ⛔ inline, ⛔ e ⛔ nunca em modal: modal tiraria o médico da
                      * tela para ler uma frase.
                      */}
                    {detalhes.aberto(campo.id) ? (
                      <View style={e.explicacao} testID={`avc-explicacao-${campo.id}`}>
                        <DetalheDoCampo campo={campo} />
                      </View>
                    ) : null}
                  </View>
                );
              }

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
      gap: ESPACO.sm,
      marginTop: ESPACO.md,
    },
    /**
     * ⚠️ O ⓘ fica NA LINHA do campo. ⛔ Abaixo, ele ocupava uma faixa inteira
     * ⛔ e parecia um controle solto, ⛔ sem dono.
     */
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
