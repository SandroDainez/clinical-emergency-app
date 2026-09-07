/**
 * PROBLEMAS ATIVOS — ⚠️ **⛔ uma** lista do que está aberto no atendimento.
 *
 * ── ⚠️⚠️ O QUE ORIGINOU (briefing de refatoração, §44) ─────────────────────
 *
 * > *"Criar sistema de problemas ativos durante o atendimento. Cada problema
 * >  pode ter ação direta. Isso evita que o médico tenha que procurar onde
 * >  estava o problema."* — autor, 2026-09-06
 *
 * ⛔ **O que havia:** o que está aberto vinha de **três famílias** que ⛔ não se
 * conheciam — ameaças imediatas (A/B/C/D), bloqueios corrigíveis (F-04, F-06) ⛔ e
 * seis produtores de pendência —, ⛔ e a **montagem acontecia dentro do JSX**,
 * num `useMemo` de trinta linhas com a ordem clínica escrita em comentário.
 *
 * ⚠️⚠️ ⛔ REGRA QUE MORA NO JSX ⛔ NÃO PODE SER EXECUTADA POR TRAVA ⛔ nenhuma —
 * ⛔ e foi assim que a leitura das ameaças se perdeu ⛔ uma vez neste módulo,
 * afirmando o negativo numa via aérea comprometida.
 *
 * ── ⚠️ O QUE ESTE MÓDULO ⛔ NÃO FAZ ────────────────────────────────────────
 *
 * ⛔ **⛔ Não decide medicina.** ⚠️ Ele **junta ⛔ e ordena** o que as derivações
 *    já concluíram, com as fontes delas. ⛔ Nenhum corte, ⛔ nenhum limiar ⛔ e
 *    ⛔ nenhuma frase nova nascem aqui (**E-31**).
 * ⛔ **⛔ Não bloqueia.** ⚠️ Problema aberto ordena a **atenção** (**E-49**,
 *    **E-11**). ⛔ Quem impede uma ação é o veredito da terapia.
 * ⛔ **⛔ Não inventa porta.** ⚠️ Todo problema diz **onde se resolve**
 *    (**E-26**) — ⛔ e quem ⛔ não sabe dizer ⛔ não entra na lista.
 */
import type { EstadoClinico } from "../../design-system/estados-clinicos";
import { ORDEM_DOS_ESTADOS } from "../../design-system/estados-clinicos";
import { pendenciasVigentes } from "../conteudo/superficies";
import { ameacasImediatas, estadoClinicoDoEixo } from "./ameacas-imediatas";
import { pendenciasDaImagem } from "./derivacoes-c";
import { bloqueiosCorrigiveis, pendenciasDaSeguranca } from "./derivacoes-d";
import { acoes, pendenciasOriginadasEmE } from "./derivacoes-e";
import { pendenciasDoLaboratorio } from "./derivacoes-lab";
import { pendenciasDerivadas } from "./derivacoes";
import { pendenciasAbertas, type EstadoAvc } from "./estado";
import type { Pendencia, SuperficieId } from "./tipos";

/**
 * ⚠️⚠️ ⛔ DE ONDE O PROBLEMA VEIO — ⛔ e ⛔ ele é **público** de propósito.
 *
 * ⛔ A primeira versão codificava a origem **no `id`** (`ameaca-…`,
 * `bloqueio-…`, `pendencia-…`) ⛔ e a prova conferia a ordem lendo esse
 * prefixo. ⚠️⚠️ ⛔ A mutação que trocava a ordem clínica por `localeCompare`
 * **passou verde**: `a` < `b` < `p`, ⛔ então o alfabeto dava ⛔ exatamente a
 * mesma ordem ⛔ e o teste ⛔ não discriminava ⛔ nada.
 *
 * ⚠️ Com a origem em campo próprio, a ordem deixa de ser adivinhada pelo nome —
 * ⛔ e a prova passa a medir a **regra**, ⛔ e ⛔ não uma coincidência de letras.
 */
export type OrigemDoProblema = "ameaca" | "bloqueio" | "derivada" | "campo";

export type ProblemaAtivo = {
  readonly id: string;
  readonly origem: OrigemDoProblema;
  /** ⚠️ ⛔ Do alfabeto único do app — ⛔ e ⛔ nunca um símbolo local. */
  readonly estado: EstadoClinico;
  /** ⚠️ O que é, em uma linha. */
  readonly rotulo: string;
  /** ⚠️ A frase da **fonte**, quando há. ⛔ A tela ⛔ não a redige. */
  readonly detalhe?: string;
  /** ⚠️ O que **fecha** o problema — **E-26**. */
  readonly resolvePor: string;
  /** ⚠️ Onde se resolve. ⛔ Toda saída é declarada (**E-09**). */
  readonly dono: SuperficieId;
  /** ⚠️ O campo a focar ao chegar lá, quando há um. */
  readonly campo?: string;
};

/**
 * ⚠️⚠️ A ORDEM É **CLÍNICA**, ⛔ e ⛔ vem em duas camadas.
 *
 * ⚠️ Primeiro a **urgência do estado** (`ORDEM_DOS_ESTADOS`: o que impede antes
 * do que falta). ⛔ Dentro do mesmo estado, a ordem de **origem** — ⛔ e ⛔ ela
 * ⛔ não é alfabética:
 *
 *   ⚠️ **ameaça imediata** primeiro, porque é o que mata antes do protocolo;
 *   ⚠️ **bloqueio corrigível** depois, porque segura a terapia ⛔ e tem conduta;
 *   ⚠️ **pendência derivada** em seguida — ⛔ ela nasce de algo que **aconteceu**
 *      com o paciente (uma glicemia corrigida ⛔ sem exame depois), ⛔ e ⛔ não de
 *      algo que ⛔ nunca foi informado;
 *   ⚠️ **pendência de campo vazio** por último.
 *
 * ⛔ Essa ordem estava escrita em comentário dentro do JSX. ⚠️ Aqui ⛔ ela é
 * código, ⛔ e uma prova a executa.
 */
const PESO_DA_ORIGEM = {
  ameaca: 0,
  bloqueio: 1,
  derivada: 2,
  campo: 3,
} as const;

type Origem = OrigemDoProblema;

/**
 * ⚠️⚠️ AS SEIS FAMÍLIAS DE PENDÊNCIA — ⛔ e ⛔ elas moram AQUI, ⛔ e ⛔ não no JSX.
 *
 * ⛔ Esta concatenação vivia dentro de um `useMemo` da tela. ⚠️ Cada comentário
 * abaixo estava lá, ⛔ e explicava uma decisão clínica que ⛔ nenhuma trava
 * conseguia executar.
 */
function familiasDePendencia(
  estado: EstadoAvc
): readonly { readonly origem: Origem; readonly lista: readonly Pendencia[] }[] {
  return [
    { origem: "derivada", lista: pendenciasDerivadas(estado) },
    /**
     * ⚠️ As da imagem são **derivadas** ⛔ e ⛔ não passam por
     * `pendenciasAbertas()`: aquela mede campo vazio, ⛔ e aqui o campo pode
     * estar cheio com *"realizada, resultado ainda ⛔ não disponível"* — ⛔ que é
     * resposta válida (**PD-22**) ⛔ e ⛔ **não** fecha a tarefa.
     */
    { origem: "derivada", lista: pendenciasDaImagem(estado) },
    /** ⚠️ D ⛔ não possui fatos, ⛔ e possui as próprias pendências (**E-07**). */
    { origem: "derivada", lista: pendenciasDaSeguranca(estado) },
    /** ⚠️ E **origina**, ⛔ mas a dona é B — ver `pendenciasOriginadasEmE`. */
    { origem: "derivada", lista: pendenciasOriginadasEmE(estado) },
    { origem: "derivada", lista: pendenciasDoLaboratorio(estado) },
    /**
     * ⚠️ `pendenciasVigentes()` filtra as que ⛔ não têm porta: pendência cujo
     * campo ⛔ ainda ⛔ não existe é muro, ⛔ e ⛔ não tarefa (**E-26**, **I-7**).
     */
    { origem: "campo", lista: pendenciasAbertas(estado, pendenciasVigentes()) },
  ];
}

/**
 * ⚠️⚠️ AS PENDÊNCIAS DO CASO — ⛔ **⛔ uma** apuração, ⛔ e ⛔ dois consumidores.
 *
 * ⛔ A síntese do Destino (**G**) precisa das **pendências**, ⛔ e ⛔ não da lista
 * unificada: ⛔ ela fala de *"o que falta responder"*, ⛔ e ⛔ não de *"o que está
 * aberto"*. ⚠️ As duas listas saem da **mesma** apuração — ⛔ e é isso que
 * impede a segunda contagem que **I6** proíbe.
 */
export function pendenciasDoCaso(estado: EstadoAvc): readonly Pendencia[] {
  return familiasDePendencia(estado).flatMap((f) => [...f.lista]);
}

export function problemasAtivos(estado: EstadoAvc): readonly ProblemaAtivo[] {
  const brutos: ProblemaAtivo[] = [];

  /* ── ⚠️ 1 · AMEAÇAS IMEDIATAS ────────────────────────────────────────── */
  for (const a of ameacasImediatas(estado)) {
    if (a.estado !== "ameaca") continue;
    brutos.push({
      origem: "ameaca",
      id: a.id,
      estado: estadoClinicoDoEixo(a.estado),
      rotulo: a.nome,
      detalhe: a.achado,
      /**
       * ⚠️ A conduta **é** o que resolve — ⛔ e ela vem da fonte. ⛔ Sem conduta
       * declarada, o problema diz que se resolve **avaliando o eixo**, ⛔ e ⛔ não
       * inventa tratamento.
       */
      resolvePor: a.conduta ?? "Avaliar e tratar a ameaça",
      dono: (a.leva as SuperficieId | undefined) ?? "estabilizacao",
      campo: a.campo,
    });
  }

  /* ── ⚠️ 2 · BLOQUEIOS CORRIGÍVEIS ────────────────────────────────────── */
  for (const b of bloqueiosCorrigiveis(estado)) {
    brutos.push({
      origem: "bloqueio",
      id: b.id,
      /**
       * ⚠️⚠️ **`corrigivel`, ⛔ e ⛔ NÃO `impede`** — ⛔ e a distinção é do
       * briefing (**§20**): há alteração *potencialmente reversível antes da
       * trombólise*. ⛔ Ela ⛔ não impede o atendimento; ⛔ ela segura **uma** ação,
       * ⛔ e tem caminho de volta.
       */
      estado: "corrigivel",
      rotulo: b.formulacao,
      resolvePor: b.resolvePor,
      dono: "correcoes",
    });
  }

  /* ── ⚠️ 3 · PENDÊNCIAS ───────────────────────────────────────────────── */
  for (const { origem, lista } of familiasDePendencia(estado)) {
    for (const p of lista) {
      brutos.push({
        origem,
        id: p.id,
        /** ⚠️ **E-37**: falta perguntar ⛔ não é achado negativo. */
        estado: "verificar",
        rotulo: p.rotulo,
        resolvePor: p.resolvePor,
        dono: p.dono,
        campo: p.campo,
      });
    }
  }

  /* ── ⚠️ ORDENAÇÃO ────────────────────────────────────────────────────── */
  /**
   * ⚠️ `sort` do JS é estável desde ES2019 — ⛔ e é isso que preserva a ordem de
   * declaração dentro de cada empate. ⛔ Sem estabilidade, duas pendências do
   * mesmo peso trocariam de lugar a cada render.
   */
  return [...brutos].sort((x, y) => {
    const porEstado =
      ORDEM_DOS_ESTADOS.indexOf(x.estado) - ORDEM_DOS_ESTADOS.indexOf(y.estado);
    if (porEstado !== 0) return porEstado;
    return PESO_DA_ORIGEM[x.origem] - PESO_DA_ORIGEM[y.origem];
  });
}

/**
 * ── ⚠️⚠️ ⛔ QUANDO **CORREÇÕES** APARECE NA BARRA ──────────────────────────
 *
 * ⚠️ Decisão **C3** do autor: *"Correções ⛔ não deve ser fase fixa. Correções é
 * um fluxo condicional acionado diretamente pelo problema que exige correção."*
 *
 * ── ⚠️⚠️ O BURACO QUE ISTO FECHA ──────────────────────────────────────────
 *
 * ⛔ Alcançá-la **⛔ só** pelo problema tem um efeito que ⛔ só apareceu ao migrar
 * os testes: **⛔ resolvido o bloqueio, o problema some — ⛔ e Correções fica
 * inalcançável**. ⚠️ O médico perderia o registro do anti-hipertensivo que
 * ⛔ ele mesmo acabou de iniciar: a trilha continuaria lá, ⛔ e ⛔ sem porta
 * (**E-09**, **E-26**).
 *
 * ⚠️ Por isso são **duas** razões para ⛔ ela existir na barra, ⛔ e a segunda é a
 * que fecha o buraco:
 *
 *   ⛔ **há bloqueio corrigível** — ⛔ há o que corrigir agora;
 *   ⛔ **há ação registrada** — ⛔ houve o que corrigir, ⛔ e o que se fez tem de
 *      continuar visível.
 *
 * ⛔ ⛔ E ⛔ nenhuma das duas é *"sempre"*: ⛔ num atendimento ⛔ sem alteração
 * corrigível, ⛔ ela ⛔ não ocupa espaço na sequência.
 */
export function correcoesEhRelevante(estado: EstadoAvc): boolean {
  return bloqueiosCorrigiveis(estado).length > 0 || acoes(estado).length > 0;
}

/**
 * ⚠️ Quantos problemas cada superfície tem para resolver — ⛔ para a barra de
 * fases dizer **onde** está o trabalho, ⛔ sem ⛔ ninguém precisar abrir todas.
 */
export function problemasPorSuperficie(
  estado: EstadoAvc
): Readonly<Record<string, number>> {
  const conta: Record<string, number> = {};
  for (const p of problemasAtivos(estado)) conta[p.dono] = (conta[p.dono] ?? 0) + 1;
  return conta;
}
