/**
 * CONSUMIDORES DECLARADOS — ⚠️ **quem pode influenciar o quê**.
 *
 * ── ⚠️⚠️ A REGRA, NAS PALAVRAS DO AUTOR (2026-09-07) ──────────────────────
 *
 * > *"Um campo só pode influenciar uma derivação clínica se essa dependência
 * >  estiver **explicitamente declarada ⛔ e testada**."*
 *
 * ── ⚠️⚠️ ⛔ ELA CORRIGE UMA PROPOSTA MINHA QUE ESTAVA ERRADA ───────────────
 *
 * ⛔ Eu ia travar *"⛔ nenhuma derivação do AVC lê campo global"*. ⚠️ O autor
 * apontou o furo: ⛔ isso proibiria **o peso de alimentar a dose do
 * trombolítico** — ⛔ que é ⛔ exatamente para o que ⛔ ele existe.
 *
 * ⚠️ Escopo diz **de quem é o dado**; ⛔ e ⛔ quem pode lê-lo é **isto aqui**.
 *
 * ── ⚠️ O QUE ESTA LISTA ⛔ NÃO É ───────────────────────────────────────────
 *
 * ⛔ **⛔ Não é documentação.** ⚠️ `prova-avc-consumidores` a **executa**: varre
 *    o núcleo ⛔ e reprova quem lê um campo global ⛔ sem estar declarado aqui.
 * ⛔ **⛔ Não decide medicina.** ⚠️ Ela ⛔ não diz *como* o consumidor lê — ⛔ diz
 *    ⛔ apenas que a dependência foi **decidida**, ⛔ e ⛔ não que apareceu.
 * ⛔ **⛔ Não cobre campo de módulo.** ⚠️ Fato que nasce ⛔ e morre no AVC ⛔ não
 *    atravessa fronteira ⛔ nenhuma — ⛔ e declarar tudo esvaziaria a lista de
 *    significado.
 */

/**
 * ⚠️ Os arquivos do núcleo onde uma leitura é legítima, ⛔ campo a campo.
 *
 * ⚠️⚠️ **Lista vazia é uma declaração**, ⛔ e ⛔ não um esquecimento: ⛔ ela diz
 * *"⛔ nenhuma derivação deste módulo consome este dado"*, ⛔ e a trava a
 * executa. ⛔ Quando `altura` ganhar um consumidor — IMC, peso predito —,
 * ⛔ ele entra aqui **antes** do código que o lê.
 */
export const CONSUMIDORES: Readonly<Record<string, readonly string[]>> = {
  /**
   * ⚠️ O peso alimenta a dose por quilo. ⛔ `derivacoes.ts` traz a leitura ⛔ e a
   * procedência; `derivacoes-f.ts` monta o insumo do cálculo.
   */
  peso: ["derivacoes.ts", "derivacoes-f.ts", "apresentacao-f.ts"],
  peso_origem: ["derivacoes.ts", "apresentacao-f.ts"],

  /**
   * ⚠️⚠️ **⛔ NENHUM** — ⛔ e ⛔ isto é a decisão do autor, ⛔ escrita:
   *
   * > *"altura pode ser coletada; pode persistir; pode futuramente ser
   * >  reutilizada; **⛔ não altera ⛔ nenhuma derivação atual do AVC**;
   * >  ⛔ nenhuma decisão ⛔ ou problema ativo pode surgir a partir dela."*
   */
  altura: [],

  /**
   * ⚠️ A idade entra na elegibilidade ⛔ e no veredito — ⛔ e ⛔ ela é do
   * paciente, ⛔ não do atendimento.
   */
  idade: ["derivacoes.ts", "derivacoes-b.ts", "derivacoes-f.ts", "apresentacao-f.ts"],

  /**
   * ⚠️⚠️ **⛔ NENHUM** — ⛔ as classes gerais são contexto. ⛔ Quem decide conduta
   * é `anticoagulante_em_uso` ⛔ e `antiagregante_em_uso`, que têm campo
   * próprio ⛔ e semântica que o motor usa: agente, classe, última dose,
   * janela, coagulograma.
   *
   * ⛔ ⛔ Um chip *"anticoagulantes"* ⛔ não sustenta ⛔ nenhuma dessas regras —
   * ⛔ e é ⛔ por isso que ⛔ eles ⛔ não foram fundidos (**§55** ⛔ não se aplica:
   * ⛔ são fatos diferentes).
   */
  medicacoes_em_uso: [],

  /**
   * ── ⚠️⚠️ ⛔ A TRAVA PEGOU O MEU PRÓPRIO CÓDIGO (2026-09-07) ──────────────
   *
   * ⛔ Eu escrevi a regra *"⛔ nenhuma derivação lê campo ⛔ sem slot de fonte"*
   * ⛔ e, na mesma sessão, fiz `ameacas-imediatas.ts` ler `temperatura` para
   * desenhar o eixo **E**. ⚠️ A trava reprovou — ⛔ e ⛔ estava certa: ⛔ a
   * dependência existe.
   *
   * ⚠️⚠️ ⛔ E A REGRA DO AUTOR ⛔ NÃO ERA *"⛔ não pode ler"*, ⛔ e sim: *"um campo
   * só pode influenciar uma derivação se essa dependência estiver
   * **explicitamente declarada ⛔ e testada**"*. ⛔ Então ⛔ ela se declara aqui.
   *
   * ⚠️⚠️ ⛔ E O QUE IMPEDE ISSO DE VIRAR ESCAPE FÁCIL: ⛔ o eixo **E ⛔ nunca
   * acende**. ⛔ Sem corte transcrito, ⛔ ele ⛔ só sabe dizer `medido` ⛔ ou
   * `nao_avaliado` — ⛔ e há prova nomeada para isso
   * (*"temperatura 39 °C fica medida, ⛔ e ⛔ NÃO vira ameaça"*). ⛔ Ler para
   * **exibir** ⛔ não é derivar conduta.
   */
  temperatura: ["ameacas-imediatas.ts"],

  /**
   * ⚠️ ⛔ Os outros sinais vitais da Fase 3 ⛔ ainda ⛔ não são lidos por
   * ⛔ ninguém — ⛔ e a lista vazia é a declaração disso, executada.
   */
  fc: [],
  fr: [],
  glasgow: [],
  monitorizacao: [],
  acessos: [],

  /**
   * ⚠️ O único campo **⛔ não clínico** do módulo — nome ⛔ ou identificador
   * local. ⛔ Ele ⛔ nunca teve consumidor, ⛔ e a condição do autor ao aprová-lo
   * foi ⛔ exatamente essa: *"dado pessoal ⛔ não tem efeito sobre conduta"*.
   */
  identificacao: [],

  /**
   * ── ⚠️⚠️ ⛔ O aPTT ⛔ E O TP **TÊM** CONSUMIDOR — ⛔ e ⛔ eu mapeei errado ────
   *
   * ⛔ O mapeamento da Fase 5 disse *"⛔ ninguém os lê"*, ⛔ e o autor decidiu
   * declará-los `[]` ⛔ e tirá-los do primeiro plano. ⚠️ ⛔ A varredura estava
   * errada: ⛔ ela procurava o literal `"aptt"` nos arquivos do núcleo, ⛔ e a
   * leitura é **pela chave do objeto** —
   * `Object.keys(CORTES_LABORATORIAIS).map(corteDoAnalito)`.
   *
   * ⚠️⚠️ ⛔ É A MESMA ROTA INDIRETA DOS `t4_*`, ⛔ e ⛔ eu ⛔ não apliquei aqui a
   * correção que ⛔ já tinha escrito lá. ⛔ A trava passou verde pelo mesmo
   * buraco, ⛔ duas vezes.
   *
   * ── ⚠️⚠️ ⛔ E ⛔ ELES ⛔ NÃO SÃO SECUNDÁRIOS: A FONTE OS NOMEIA ─────────────
   *
   * ⛔ **F-10**, ⛔ na **mesma frase** que INR ⛔ e plaquetas:
   *
   * > *"patients with platelets <100,000/mm³, INR>1.7, **aPTT>40s, or PT>15s**
   * >  … is unknown though may substantially increase risk of harm ⛔ and
   * >  should not be administered"*
   *
   * ⚠️ ⛔ Os quatro cortes vêm juntos. ⛔ Pôr dois num bloco *"outros
   * resultados"* esconderia metade de uma frase de segurança da trombólise —
   * ⛔ e ⛔ é ⛔ por isso que **§50** manda preservar a regra clínica ⛔ e
   * sinalizar o conflito ⛔ **antes** de alterar.
   */
  /**
   * ⚠️ ⛔ Os quatro andam juntos porque a **frase** os traz juntos. ⛔ Declarar
   * dois ⛔ e deixar dois de fora seria a trava medindo meia regra.
   *
   * ⛔ `plaquetas` também é lida por `derivacoes-lab.ts` — ⛔ ali para a
   * comparabilidade entre coletas (unidade declarada), ⛔ e ⛔ não para o corte.
   */
  plaquetas: ["derivacoes-d.ts", "derivacoes-lab.ts"],
  plaquetas_unidade: ["derivacoes-d.ts", "derivacoes-lab.ts"],
  inr: ["derivacoes-d.ts"],
  aptt: ["derivacoes-d.ts"],
  tp: ["derivacoes-d.ts"],

  /**
   * ── ⚠️⚠️ OS ONZE ACHADOS DA TABLE 4 — ⛔ ter fonte ⛔ NÃO é ter autorização ──
   *
   * ⚠️ A regra do autor, 2026-09-07:
   *
   * > *"⛔ Não permitir que um arquivo do núcleo simplesmente comece a ler
   * >  `t4_*` porque o campo já possui fonte. Fonte + consumidor declarado +
   * >  prova são requisitos distintos."*
   *
   * ⛔ Os `t4_*` ⛔ não são globais ⛔ e ⛔ não são ⛔ sem fonte — ⛔ eles têm
   * **F-17, Table 4** —, ⛔ e ⛔ por isso escapavam das duas travas que já
   * existiam. ⚠️ Estar nesta lista é o que **arma** a trava sobre ⛔ eles.
   *
   * ── ⚠️⚠️ ⛔ E A LISTA ⛔ NÃO PÔDE SAIR VAZIA (**§50**) ──────────────────────
   *
   * ⛔ O pedido dizia `consumidores clínicos permitidos = []`. ⚠️ A varredura
   * mostrou que **`derivacoes-b.ts` já os lê**, ⛔ e com a fonte que autoriza:
   * ⛔ os cortes `≥2` por item são da própria Table 4, transcritos.
   *
   * ⚠️ Declarar `[]` ⛔ não travaria ⛔ nada — ⛔ ela **apagaria** `achadosDosQuadros`
   * ⛔ e a divergência do §2.8, ⛔ que o mesmo autor mandou **preservar** ⛔ na
   * mesma mensagem. ⛔ Então a lista diz a verdade: ⛔ um consumidor, ⛔ o que já
   * existia. ⚠️ O efeito pedido fica inteiro — ⛔ o **próximo** arquivo que
   * ⛔ tentar ler ⛔ reprova.
   *
   * ── ⚠️⚠️ ⛔ E O QUE ESSE CONSUMIDOR ⛔ NÃO FAZ ─────────────────────────────
   *
   * ⛔ `achadosDosQuadros()` devolve `veredito: false` ⛔ e
   * `conclusao: "desconhecido"` em **⛔ todas** as saídas — ⛔ há prova nomeada
   * (*"os quadros ⛔ nunca emitem veredito"*). ⛔ Marcar um `t4_*` ⛔ não responde
   * `deficit_focal`, ⛔ não decide incapacitância ⛔ e ⛔ não toca elegibilidade.
   *
   * ⚠️ ⛔ E a leitura corre no sentido **inverso** do que a regra teme: quem
   * alimenta quem é o **NIHSS → `t4_*`** (`achadoDerivado`), ⛔ e ⛔ não o
   * contrário.
   *
   * ── ⚠️ ⛔ QUANDO ISTO MUDAR ────────────────────────────────────────────────
   *
   * ⛔ Se algum `t4_*` passar a alimentar incapacitância, elegibilidade,
   * reperfusão ⛔ ou ⛔ qualquer veredito, o caminho é o do autor, ⛔ nessa ordem:
   * ⛔ **fonte que autoriza → consumidor declarado aqui → derivação → prova
   * discriminatória → mutação**. ⛔ Ler primeiro ⛔ e declarar depois é
   * ⛔ exatamente o que esta lista ⛔ não deixa.
   */
  t4_hemianopsia_completa: ["derivacoes-b.ts"],
  t4_afasia_grave: ["derivacoes-b.ts"],
  t4_extincao_grave: ["derivacoes-b.ts"],
  t4_fraqueza_contra_gravidade: ["derivacoes-b.ts"],
  t4_afasia_leve_isolada: ["derivacoes-b.ts"],
  t4_paralisia_facial_isolada: ["derivacoes-b.ts"],
  t4_fraqueza_cortical_mao: ["derivacoes-b.ts"],
  t4_perda_hemimotora_leve: ["derivacoes-b.ts"],
  t4_perda_hemissensitiva: ["derivacoes-b.ts"],
  t4_perda_hemissensitivomotora_leve: ["derivacoes-b.ts"],
  t4_hemiataxia_leve: ["derivacoes-b.ts"],
};
