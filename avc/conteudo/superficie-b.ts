/**
 * CONTEÚDO DA SUPERFÍCIE B — Neurológico.
 *
 * ⛔ Dados puros. ⛔ Nenhum React, ⛔ nenhuma cor, ⛔ nenhuma decisão de tela.
 * A medicina mora aqui e a superfície apenas a renderiza (E-29).
 *
 * ── O QUE ESTA SUPERFÍCIE É, E O QUE ELA DELIBERADAMENTE NÃO É ─────────────
 *
 * É a **decomposição do déficit incapacitante** de §2.8 — sete passos, dos quais
 * esta camada entrega o primeiro (o médico informa déficits e consequências
 * funcionais por opções estruturadas) e o sexto (a decisão dele, guardada e
 * separada da leitura).
 *
 * ⛔ **NÃO é elegibilidade.** Nenhum campo daqui decide trombólise ou
 * trombectomia — isso é a Superfície F (Reperfusão), que ainda não existe. Em
 * particular, a regra do déficit leve **não incapacitante** dentro da janela
 * (**R3.9**, COR 3: No Benefit · B-R) ⛔ NÃO é implementada aqui: ela é uma
 * afirmação sobre a IVT, e afirmação sobre terapia mora onde a terapia mora.
 *
 * ⚠️⚠️ **AS DUAS MARCAS 🚫 DESTE BLOCO** (CONSOLIDACAO-CLINICA-AVC, Bloco 3):
 *   · 🚫 NIHSS **total** como classificador — *"Use of the NIHSS score alone
 *     does not suffice"*;
 *   · 🚫 **decomposição completa antes de tratar** quando o déficit já é
 *     claramente incapacitante — *"delaying IVT is potentially harmful"*.
 *
 * Por isso ⛔ nenhum campo declara `bloqueiaTerapia: true`, e a superfície toda
 * é **pulável** (**R3.10**).
 *
 * ⚠️ **E-19 na origem:** ⛔ pergunta que a fonte não sustenta não entra na
 * decomposição. Os quadros vêm da **Table 4 (p. e355)** e a pergunta funcional
 * do *Supportive Text* da rec. 1 (p. e354), ambos transcritos em **F-17**.
 * ⛔ Nenhuma categoria funcional foi acrescentada por parecer intuitiva.
 *
 * ── D-1 · O ESCOPO DA DECOMPOSIÇÃO — RESOLVIDO PELO AUTOR (2026-08-28) ─────
 *
 * A Table 4 declara a própria população: *"Among patients with NIHSS scores 0–5
 * at presentation"*. A regra decidida, e agora implementada como COMPORTAMENTO:
 *
 *   · a decomposição é **suportada apenas no contexto que a fonte sustenta**;
 *   · fora dele, o sistema ⛔ **não extrapola automaticamente** — ⛔ nenhuma
 *     leitura normativa nasce de um quadro aplicado fora da sua população;
 *   · o médico **continua registrando o julgamento final**, dentro ou fora;
 *   · o sistema ⛔ **não cria classificação normativa fora do escopo**.
 *
 * ⚠️⚠️ LIMITAR A LEITURA ⛔ NÃO É BLOQUEAR O CAMPO. Todos os onze achados
 * continuam respondíveis em qualquer contexto, a decisão continua disponível, e
 * ⛔ nada some da tela: o que muda é o que o SISTEMA se autoriza a afirmar.
 * Esconder campo seria transformar limite de evidência em limite de registro.
 *
 * ── D-5 · A CONSULTA A PACIENTE E FAMÍLIA — RESOLVIDA (2026-08-28) ─────────
 *
 * *"The clinician should make this determination in consultation with the
 * patient and available family."* A regra decidida:
 *
 *   · é **ação opcional registrável** — fica na trilha, com hora;
 *   · ⛔ **nunca requisito**, ⛔ **nunca bloqueia**, ⛔ **nunca atrasa reperfusão**.
 *
 * ⚠️ Por isso ela ⛔ não gera pendência, ⛔ não entra em nenhuma outra leitura, e
 * a prova varre TODAS as leituras com e sem consulta exigindo que ⛔ nenhuma
 * mude: uma leitura que reagisse a ela viraria requisito por dentro.
 */

import type { SuperficieId } from "../nucleo/tipos";
import type { Campo, CampoDeclarado, Grupo, GrupoDeclarado } from "./campo";
import { camposDoGrupo, comCasa, NAO_SEI, SIM_NAO_INCERTO } from "./campo";
import { CAMPO_DO_PACIENTE } from "./paciente";

/**
 * ⚠️ O que se ESCREVE aqui — a **casa** ⛔ não entra: ela é carimbada por
 * `comCasa()` no fim do arquivo, uma vez, para todos os campos do módulo.
 */
export type CampoB = CampoDeclarado;

/**
 * EXAME NEUROLÓGICO — o registro do que se observa.
 *
 * ⚠️ **F-13 tem um achado negativo que governa este bloco:** a fonte recomenda
 * uma escala de GRAVIDADE para quem **já é suspeito** e ⛔ **não define o que
 * torna alguém suspeito**. "Suspeita clínica de AVC agudo" é condição
 * OPERACIONAL de entrada do módulo (R1.1), ⛔ não regra derivada — e por isso
 * ⛔ nenhuma resposta daqui exclui AVC.
 */
/**
 * ⚠️ "EVOLUÇÃO DO DÉFICIT DESDE A PRIMEIRA AVALIAÇÃO" FOI REMOVIDO em 2026-08-29,
 * por decisão do autor — e o argumento é da SEQUÊNCIA, ⛔ não do texto:
 *
 * *"Pela sequência do app, esta é a minha primeira avaliação do paciente. ⛔ Não
 * estou acompanhando a evolução, estou dando atendimento inicial."*
 *
 * ⚠️ Um campo que pergunta "desde a primeira avaliação" DENTRO da primeira
 * avaliação ⛔ não tem resposta possível — ele pressupõe um passado que o
 * atendimento ainda ⛔ não tem.
 *
 * ⚠️ A fonte fala de medida objetiva de mudança no contexto de **reavaliação
 * após reperfusão** (F-13 §Synopsis → F-15), que é outro momento e outra
 * superfície. ⛔ Ele ⛔ não volta aqui: volta lá, se voltar.
 */
export const EXAME_B: readonly CampoB[] = [
  {
    id: "deficit_focal",
    temporalidade: "afericao",
    rotulo: "Déficit neurológico focal observado",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-13",
    bloqueiaTerapia: false,
    nota: "A fonte recomenda medir o déficit com escala de gravidade, preferencialmente o NIHSS. Ela não define critério de suspeita, e esta resposta não exclui AVC.",
  },
  {
    id: "lateralidade",
    temporalidade: "afericao",
    /**
     * ⚠️⚠️ ERA "LADO PREDOMINANTE DO DÉFICIT", E ISSO ESTAVA ERRADO — correção
     * conceitual do autor, 2026-08-29.
     *
     * Dos itens motores do NIHSS dá para afirmar **lateralidade MOTORA**:
     * esquerda, direita, bilateral, ou nenhum déficit motor nesses itens. ⛔ O
     * que ⛔ NÃO dá é concluir o "lado predominante do déficit neurológico" —
     * afasia, hemianopsia e negligência importantes convivem com motor
     * praticamente normal, e a soma dos itens motores ⛔ não sabe disso.
     *
     * ⚠️ A regra que isto aplica: **o sistema diz apenas o que os dados
     * permitem**. Trocar o rótulo ⛔ não é cosmética — é a diferença entre uma
     * afirmação sustentada e uma interpretação com cara de medida.
     */
    rotulo: "Lateralidade do déficit motor",
    tipo: "escolha",
    opcoes: ["Esquerda", "Direita", "Bilateral", "Sem déficit motor nestes itens", NAO_SEI],
    ajuda: "Refere-se aos itens motores do NIHSS. Não descreve a lateralidade do AVC como um todo.",
    fonte: "F-13",
    bloqueiaTerapia: false,
    nota: "Déficits não motores — afasia, hemianopsia, negligência — têm lado e não aparecem nestes itens.",
  },
] as const;

/**
 * NIHSS — ⚠️ o instrumento ENTRA; o **total** ⛔ não classifica.
 *
 * ⚠️⚠️ A distinção é da própria fonte, e é fina: *"Use of the NIHSS score alone
 * does not suffice"* rejeita o **escore total como suficiente**, ⛔ não o
 * instrumento. A Table 4 usa cortes **por item**, e o registro AHA-GWTG foi
 * analisado *"while considering NIHSS item scores"*.
 *
 * ⚠️ E a própria fonte declara limitação: viés à esquerda e limitação na
 * circulação posterior (F-13, *Knowledge Gaps*).
 */
/**
 * A POPULAÇÃO QUE A TABLE 4 DECLARA PARA SI — ⚠️ conteúdo clínico com endereço,
 * ⛔ não constante de conveniência.
 *
 * Verbatim (F-17, p. e355): *"Among patients with **NIHSS scores 0–5 at
 * presentation**, if the observed deficits persist…"*.
 *
 * ⚠️⚠️ O QUE ELA GOVERNA: **o que o sistema se autoriza a AFIRMAR**, e ⛔ nada
 * além disso. ⛔ Não liga nem desliga campo, ⛔ não esconde nada, ⛔ não impede
 * resposta e ⛔ não impede decisão. Fora desta faixa o app registra e se cala —
 * ⛔ ele não classifica, porque a fonte ⛔ não classificou.
 */
export const POPULACAO_TABLE4 = {
  nihssMin: 0,
  nihssMax: 5,
  fonte: "F-17",
} as const;

export const NIHSS_B: readonly CampoB[] = [
  {
    id: "nihss_calculado",
    temporalidade: "afericao",
    rotulo: "NIHSS calculado aqui",
    /**
     * ⚠️⚠️ VIROU ESCALA (2026-08-29), a pedido do autor: *"essa escala o usuário
     * não sabe, tem que ser clicável para abrir e preencher"*.
     *
     * ⚠️ Este é o ÚNICO NIHSS que deriva achado: ele conhece os 15 itens. O que
     * chega de fora é outra entidade — ver `nihss_informado`.
     */
    tipo: "escala",
    faixa: { min: 0, max: 42, passo: 1 },
    /**
     * ⚠️⚠️ **E-10** — aqui o zero é RESPOSTA, ⛔ não ausência. E é o zero que mais
     * importa: a população da Table 4 é **NIHSS 0–5**.
     */
    zeroValido: true,
    fonte: "F-13",
    bloqueiaTerapia: false,
    nota: "O total sozinho não classifica o déficit. Ele entra como medida, e os itens entram na avaliação.",
  },
  {
    id: "nihss_informado",
    temporalidade: "estavel",
    /**
     * ⚠️⚠️ O NIHSS QUE CHEGA DE FORA — reaberto por decisão do autor, 2026-08-29.
     *
     * *"O paciente pode chegar da regulação, SAMU, neurologista ou outro
     * hospital com 'NIHSS 12 às 05:55'. Isso é informação útil. Só não é a mesma
     * entidade que 'NIHSS 12 calculado aqui item a item'."*
     *
     * ⛔⛔ A REGRA CRUCIAL: um total informado externamente ⛔ **NUNCA fabrica os
     * itens que ⛔ não conhecemos**. NIHSS externo 12 ⛔ não permite concluir
     * hemianopsia, afasia, negligência nem paresia — ⛔ nenhuma derivação da
     * Table 4 nasce daqui.
     *
     * ⚠️ E os dois CONVIVEM: se o exame aqui der 9, guardam-se os dois — ⛔ um ⛔ não
     * corrige o outro, porque são observações de momentos potencialmente
     * diferentes.
     */
    rotulo: "NIHSS informado por fora",
    tipo: "grandeza",
    faixa: { min: 0, max: 42, passo: 1 },
    zeroValido: true,
    ajuda: "Total trazido de fora. Não substitui o exame aqui, e não preenche nenhum achado.",
    fonte: "F-13",
    bloqueiaTerapia: false,
    nota: "Informação clínica recebida. Fica registrada com origem e horário, ao lado do que for medido aqui.",
  },
  {
    id: "nihss_informado_origem",
    temporalidade: "estavel",
    rotulo: "Quem informou o NIHSS",
    tipo: "escolha",
    /**
     * ⚠️ VOCABULÁRIO PRÓPRIO. A procedência muda a confiança sem mudar o número
     * (**E-03**) — e um total sem origem é um número órfão na trilha.
     */
    opcoes: ["SAMU", "Regulação", "Outro hospital", "Neurologista", "Outro", NAO_SEI],
    fonte: "F-13",
    bloqueiaTerapia: false,
  },
  {
    id: "nihss_informado_hora",
    temporalidade: "estavel",
    /** ⚠️ Horário do exame de FORA — ⛔ não é marco temporal do atendimento. */
    rotulo: "Horário do NIHSS informado",
    tipo: "hora",
    fonte: "F-13",
    bloqueiaTerapia: false,
    nota: "Momento em que aquele exame foi feito, que pode ser bem anterior à chegada.",
  },
] as const;

/**
 * FUNCIONALIDADE PRÉVIA — **contexto**, ⛔ nunca porta.
 *
 * ⚠️ F-14 resolveu o slot: mRS prévio é **as duas coisas conforme a ação** — na
 * IVT é contexto (*"remain uncertain… on an individual basis"*, ⛔ sem COR/LOE),
 * na EVT é critério **como gradiente de força**. ⛔ Em nenhum dos dois é
 * contraindicação automática, e a fonte ⛔ sequer nomeia um valor de corte.
 *
 * ⚠️ **Dívida declarada:** os descritores da escala (o que significa cada grau)
 * ⛔ NÃO estão transcritos em fonte nenhuma do repositório, e ⛔ não se escrevem
 * de memória (E-31). Por isso as opções são os graus, sem descrição — a
 * alternativa seria inventar texto clínico com cara de fonte.
 */
/**
 * FUNCIONALIDADE PRÉVIA — ⚠️ **MUDOU DE CASA em 2026-08-29**, e ⛔ não mudou de
 * experiência.
 *
 * ⚠️⚠️ O mRS prévio é função basal **ANTES deste AVC**: antecedente, ⛔ não exame
 * do episódio. A casa passou a ser **Paciente**.
 *
 * ⚠️ Decisão explícita do autor: *"B continua podendo exibi-lo e permitir
 * preenchê-lo ali. Ou seja, muda a propriedade, ⛔ não necessariamente a
 * experiência que já ficou boa na B."* — mesmo id, mesmo controle recolhível,
 * mesmos descritores de F-27, mesma trilha. ⛔ Nenhuma segunda versão.
 */
export const BASAL_B: readonly CampoB[] = [];

/**
 * A PERGUNTA FUNCIONAL — ⚠️ **prioridade conceitual** sobre os quadros (§2.8-3).
 *
 * ⚠️⚠️ ESTA É A ESTRUTURA PRINCIPAL DO JULGAMENTO. Os quadros da Table 4 são
 * ilustração **sob** ela, ⛔ nunca o contrário — e é por isso que este bloco vem
 * ANTES deles na tela.
 *
 * ⚠️ **Marcação de fidelidade (E-45):** "atividade habitual/trabalho" é redação
 * de apresentação decidida pelo autor. A fonte diz *"return to work (if
 * applicable)"*; a ampliação inclui quem ⛔ não tem atividade laboral formal, e
 * ⛔ não altera o verbatim nem a interpretação clínica.
 */
export const FUNCIONAL_B: readonly CampoB[] = [
  {
    id: "funcional_avd_trabalho",
    temporalidade: "estavel",
    /**
     * ⚠️⚠️ REESCRITA PELO AUTOR (2026-08-29): *"menos protocolo falando com o
     * programador e mais médico perguntando o que precisa saber do paciente"*.
     *
     * A versão anterior carregava a estrutura da fonte dentro da pergunta —
     * "atividades básicas de vida diária e/ou retornar à sua atividade
     * habitual/trabalho". Correta e ilegível às 3h da manhã. A lista de AVD foi
     * para o ⓘ, onde se consulta; a pergunta ficou com o que se responde.
     *
     * ⚠️ ⛔ A INTERPRETAÇÃO CLÍNICA ⛔ NÃO MUDOU: continua sendo a pergunta-mãe de
     * §2.8-3, com prioridade conceitual sobre os quadros, e continua ampliando
     * *"return to work (if applicable)"* para quem ⛔ não tem atividade laboral
     * formal.
     */
    rotulo:
      "Se os déficits permanecerem, o paciente conseguiria cuidar de si e/ou voltar à sua atividade habitual ou trabalho?",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
    nota: "Considere banho e vestir-se, caminhar, usar o banheiro, higiene e alimentação. A fonte orienta que esta determinação seja feita em conversa com o paciente e a família disponível.",
  },
  {
    id: "deambulacao_independente",
    temporalidade: "estavel",
    /** ⚠️ "Caminhar sem ajuda" é o que se pergunta à beira do leito. */
    rotulo: "Consegue caminhar sem ajuda?",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
    nota: "A fonte orienta avaliar se o paciente consegue deambular de forma independente.",
  },
  {
    id: "degluticao_independente",
    temporalidade: "estavel",
    rotulo: "Consegue engolir sem ajuda?",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
    nota: "A fonte orienta avaliar a capacidade de deglutir de forma independente.",
  },
  {
    id: "consulta_paciente_familia",
    temporalidade: "estado",
    /**
     * ⚠️⚠️ "COM QUEM", E ⛔ NÃO "CONVERSOU?" — correção do autor, 2026-08-29: as
     * respostas ⛔ não são Sim/Não, elas dizem **com quem** a conversa aconteceu.
     * Uma pergunta de sim/não com opções de pessoa é a pergunta discordando das
     * próprias respostas.
     *
     * ⚠️⚠️ D-5 · AÇÃO OPCIONAL REGISTRÁVEL — ⛔ nunca requisito, ⛔ nunca bloqueia,
     * ⛔ nunca atrasa reperfusão. A regra inteira vive na spec e nas travas; ⛔ a
     * TELA ⛔ não é lugar de documentação de arquitetura, e por isso ela diz
     * apenas o que o médico precisa saber: **não impede continuar**.
     */
    rotulo: "Com quem foi discutido o impacto do déficit?",
    tipo: "escolha",
    opcoes: ["Paciente", "Família", "Paciente e família", "Não foi possível", NAO_SEI],
    fonte: "F-17",
    bloqueiaTerapia: false,
    nota: "Esta informação é registrada para documentar a avaliação funcional. Não impede continuar o atendimento.",
  },
] as const;

/**
 * QUADRO DA ESQUERDA — *"would **typically** be considered clearly disabling"*.
 *
 * ⚠️⚠️ ⛔ NÃO ACHATAR PARA "INCAPACITANTE". `typically` é hedge, e E-45 manda
 * preservá-lo: o título do quadro diz *Guidance*, ⛔ não *criteria*, e o
 * enunciado condiciona — *"as a guideline, while always considering individual
 * circumstances"*.
 *
 * ⚠️ Os cortes por item (`≥2`) são da própria Table 4 e vêm junto do achado
 * clínico, ⛔ nunca sozinhos: quem lê o app reconhece o quadro antes do número.
 */
export const ACHADOS_TIPICOS_B: readonly CampoB[] = [
  {
    id: "t4_hemianopsia_completa",
    temporalidade: "afericao",
    rotulo: "Hemianopsia completa (≥2 na questão de visão do NIHSS)",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
  },
  {
    id: "t4_afasia_grave",
    temporalidade: "afericao",
    rotulo: "Afasia grave (≥2 na questão de melhor linguagem do NIHSS)",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
  },
  {
    id: "t4_extincao_grave",
    temporalidade: "afericao",
    rotulo:
      "Hemi-desatenção grave ou extinção em mais de uma modalidade (≥2 na questão de extinção e desatenção do NIHSS)",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
  },
  {
    id: "t4_fraqueza_contra_gravidade",
    temporalidade: "afericao",
    rotulo:
      "Qualquer fraqueza que limite o esforço sustentado contra a gravidade (≥2 nas questões motoras do NIHSS)",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
  },
] as const;

/**
 * QUADRO DA DIREITA — *"**may not** be clearly disabling **in an individual
 * patient**"*.
 *
 * ⚠️⚠️ ⛔ ISTO NÃO É "NÃO INCAPACITANTE", e a diferença é a coluna inteira. E-45:
 * *may not be* é possibilidade, ⛔ não negação — achatar as duas colunas em
 * "incapacitante / não incapacitante" destruiria a gradação da fonte e
 * transformaria *guidance* em critério.
 */
export const ACHADOS_PODEM_NAO_B: readonly CampoB[] = [
  {
    id: "t4_afasia_leve_isolada",
    temporalidade: "afericao",
    rotulo: "Afasia leve isolada, ainda com comunicação significativa",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
  },
  {
    id: "t4_paralisia_facial_isolada",
    temporalidade: "afericao",
    rotulo: "Paralisia facial isolada",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
  },
  {
    id: "t4_fraqueza_cortical_mao",
    temporalidade: "afericao",
    rotulo: "Fraqueza cortical leve de mão, especialmente da mão não dominante",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
  },
  {
    id: "t4_perda_hemimotora_leve",
    temporalidade: "afericao",
    rotulo: "Perda hemimotora leve",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
  },
  {
    id: "t4_perda_hemissensitiva",
    temporalidade: "afericao",
    rotulo: "Perda hemissensitiva",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
  },
  {
    id: "t4_perda_hemissensitivomotora_leve",
    temporalidade: "afericao",
    rotulo: "Perda hemissensitivo-motora leve",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
  },
  {
    id: "t4_hemiataxia_leve",
    temporalidade: "afericao",
    rotulo: "Hemiataxia leve, ainda capaz de deambular",
    tipo: "escolha",
    opcoes: SIM_NAO_INCERTO,
    fonte: "F-17",
    bloqueiaTerapia: false,
  },
] as const;

/**
 * A DECISÃO DO MÉDICO — §2.8 passos 4 a 7.
 *
 * ⚠️⚠️ O SISTEMA **NEM SE CALA NEM DECIDE**. A leitura é proposta e permanece
 * derivada; a decisão é **assumida**, guardada, e ⛔ nunca sobrescreve a leitura.
 *
 * ⚠️ **Divergir ⛔ não é erro** e ⛔ não bloqueia o fluxo: fica registrada como
 * divergência clínica (§4.5, §4.7).
 */
export const DECISAO_B: readonly CampoB[] = [
  {
    id: "incapacitante_assumido",
    temporalidade: "estado",
    rotulo: "Decisão do médico sobre o déficit",
    tipo: "escolha",
    /**
     * ⚠️ VOCABULÁRIO PRÓPRIO — as três respostas de §2.8-6, ⛔ não um Sim/Não.
     * "Incerto" aqui ⛔ não é "não sei responder": é a terceira decisão clínica
     * legítima, e ela ⛔ não pode virar ausência de decisão.
     */
    opcoes: ["Incapacitante", "Não incapacitante", "Incerto"],
    ajuda: "A leitura do sistema é apoio. A decisão é sua, fica registrada, e pode divergir.",
    fonte: "F-17",
    bloqueiaTerapia: false,
    nota: "Uma vez determinado que o déficit é incapacitante, a fonte diz que atrasar a trombólise é potencialmente prejudicial.",
  },
] as const;

/**
 * ⚠️ A ORDEM DESTE ARRANJO É A ORDEM DA TELA, e é clínica (§7.3).
 *
 * Exame primeiro, porque é o que se observa; NIHSS depois, como medida; a
 * funcionalidade prévia antes da pergunta funcional, porque "voltar ao que
 * fazia" ⛔ não significa nada sem saber o que ele fazia; a pergunta funcional
 * ANTES dos quadros, porque ela é a estrutura e eles são ilustração (§2.8-3); e
 * a decisão por último, porque é o fecho — ⛔ não o começo.
 *
 * ⛔ Reordenar isto por conveniência de layout é mudar prioridade clínica.
 */
const GRUPOS_B_DECLARADOS: readonly GrupoDeclarado[] = [
  { id: "exame", titulo: "Exame neurológico", campos: EXAME_B },
  { id: "nihss", titulo: "NIHSS", campos: [NIHSS_B[0]] },
  {
    id: "nihss-de-fora",
    titulo: "NIHSS trazido de fora",
    campos: NIHSS_B.slice(1),
    recolhido: true,
    nota: "Informação recebida da regulação, do SAMU ou de outro serviço. Não preenche nenhum achado.",
  },
  {
    id: "basal",
    titulo: "Funcionalidade prévia",
    campos: BASAL_B,
    /**
     * ⚠️ O mRS prévio mora em **Paciente** desde 2026-08-29 e continua **aqui**,
     * com o mesmo controle recolhível e os mesmos descritores — decisão do
     * autor: *"muda a propriedade, ⛔ não a experiência que já ficou boa na B."*
     */
    emprestados: [CAMPO_DO_PACIENTE("mrs_previo")],
  },
  {
    id: "funcional",
    titulo: "Avaliação funcional",
    campos: FUNCIONAL_B,
    nota: "Esta é a pergunta principal do julgamento. Os quadros abaixo são orientação da fonte, sob ela.",
  },
  {
    id: "achados-tipicos",
    titulo: "Achados tipicamente considerados claramente incapacitantes",
    campos: ACHADOS_TIPICOS_B,
    /**
     * ⚠️⚠️ A POPULAÇÃO DO QUADRO É NOTA, ⛔ NUNCA PORTA. A Table 4 declara
     * *"Among patients with NIHSS scores 0–5 at presentation"*, e o que a fonte
     * ⛔ não diz é o que fazer acima disso — **R3.7 / D-1**, decisão médica
     * pendente. Enquanto ela não vier, o NIHSS ⛔ não liga nem desliga campo
     * nenhum aqui: transformar a população em filtro seria inventar a regra que
     * falta.
     */
    nota: "O quadro da fonte foi criado para pacientes com NIHSS 0 a 5 na apresentação. Fora desse contexto os achados continuam registráveis, e o sistema não estende a leitura.",
  },
  {
    id: "achados-podem-nao",
    titulo: "Achados que podem não ser claramente incapacitantes neste paciente",
    campos: ACHADOS_PODEM_NAO_B,
    nota: "Podem não ser não significa não são. A fonte preserva a incerteza, e a avaliação individual permanece necessária.",
  },
  { id: "decisao", titulo: "Decisão clínica", campos: DECISAO_B },
];

/**
 * ⚠️⚠️ A CASA É CARIMBADA AQUI, e ⛔ não escrita campo a campo (2026-08-29).
 *
 * ⚠️ Um campo que declarasse a própria casa poderia declarar a casa errada — e
 * casa errada é a duplicação de fatos voltando com outro nome. Carimbada pelo
 * módulo, ela ⛔ não tem como discordar do arquivo que a define.
 */
export const GRUPOS_B: readonly Grupo[] = comCasa("neurologico", GRUPOS_B_DECLARADOS);

export const TODOS_OS_CAMPOS_B: readonly Campo[] = GRUPOS_B.flatMap((g) => [...g.campos]);

/**
 * ⚠️⚠️ O QUE A TELA DESENHA — os campos **próprios** mais os **emprestados**.
 *
 * ⚠️ As duas listas existem porque respondem perguntas diferentes:
 *   · `TODOS_OS_CAMPOS_B` responde *"de quem é o fato"* — e é ela que as
 *     travas de fonte, de bloqueio e de propriedade única varrem;
 *   · `CAMPOS_NA_TELA_B` responde *"o que o médico vê aqui"* — e é ela que
 *     a tela e o e2e usam.
 *
 * ⛔ Confundi-las devolveria a duplicação: um campo emprestado contado como
 * próprio teria **duas casas**.
 */
export const CAMPOS_NA_TELA_B: readonly Campo[] = GRUPOS_B.flatMap((g) => camposDoGrupo(g));

/** Os ids dos dois quadros — ⚠️ derivados do conteúdo, ⛔ nunca listados à mão. */
export const IDS_ACHADOS_TIPICOS = ACHADOS_TIPICOS_B.map((c) => c.id);
export const IDS_ACHADOS_PODEM_NAO = ACHADOS_PODEM_NAO_B.map((c) => c.id);

/**
 * OS CAMPOS DE VOCABULÁRIO PRÓPRIO — declarados COM MOTIVO, um a um.
 *
 * ⚠️⚠️ POR QUE ISTO EXISTE: nestes campos o valor gravado é o próprio rótulo, e
 * ⛔ nenhum deles é `"sim"`. Lido por `ternario()`, todo valor viraria `false` —
 * "Direito" e "Incapacitante" seriam indistinguíveis de "não". A prova da
 * superfície confere que ⛔ nenhuma derivação de B os lê por ali.
 *
 * ⚠️ Lista com motivo, ⛔ não gaveta: sem o porquê, a próxima pessoa acrescenta
 * um campo aqui para calar a trava (R-55).
 */
export const VOCABULARIO_PROPRIO_B: readonly { id: string; motivo: string }[] = [
  { id: "lateralidade", motivo: "lado do corpo não é resposta binária" },
  /**
   * ⚠️ `mrs_previo` SAIU desta lista em 2026-08-29: ele mudou de casa para
   * **Paciente**, e a declaração de vocabulário próprio mora com o fato, ⛔ não
   * com a tela que o desenha. Ver `VOCABULARIO_PROPRIO_P`.
   */
  { id: "nihss_informado_origem", motivo: "procedência muda a confiança sem mudar o número (E-03)" },
  { id: "incapacitante_assumido", motivo: "as três decisões de §2.8-6, e Incerto é decisão" },
  { id: "consulta_paciente_familia", motivo: "registra com quem foi a conversa, e não é sim ou não" },
] as const;

export const SUPERFICIE_B: SuperficieId = "neurologico";
