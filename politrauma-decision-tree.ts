import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import { ALVOS_TCE } from "./lib/alvos-tce";
import {
  INTRO_GUIADA,
  OPCAO_GUIADA,
  camposDeInstabilidade,
  roteamentoDeInstabilidade,
} from "./lib/instabilidade-guiada";
import { limiarDePasNoTce, PAS_TCE_META, PAS_TCE_POR_QUE_NAO_VALE_A_PERMISSIVA } from "./lib/pas-no-tce";
import { CALCIO_EQUIVALENCIA } from "./lib/calcio-na-parada";
import {
  DAMAGE_CONTROL_QUANDO_ABREVIAR,
  TRAUMA_CHOQUE_NEUROGENICO,
  TRAUMA_NAO_RESPONDE_QUATRO_CAUSAS,
} from "./lib/trauma-nao-responde";
import {
  NA_DUVIDA_POLITRAUMA_FONTE,
} from "./lib/na-duvida";

/**
 * Politrauma — atendimento inicial ao traumatizado grave.
 * Fiel ao ATLS (avaliação primária XABCDE com hemorragia exsanguinante primeiro),
 * protocolo de transfusão maciça 1:1:1, ácido tranexâmico (CRASH-2/CRASH-3) e
 * damage control. Doses por peso em derive().
 */

export const politraumaDecisionTree: DecisionTreeDefinition = {
  id: "politrauma",
  version: "2024.1",
  label: "Politrauma — atendimento inicial",
  entryNodeId: "preparo",
  derive: (v): Record<string, string> => {
    const peso = Number((v.peso ?? "").replace(",", "."));
    if (!Number.isFinite(peso) || peso <= 0) return {};
    const r0 = (n: number) => Math.round(n).toString();
    return {
      cristaloide: r0(peso * 15), // ~1 L em 70 kg (ATLS: 1 L, evitar sobrecarga)
    };
  },
  nodes: {
    preparo: {
      id: "preparo",
      type: "action",
      title: "Preparação e segurança",
      summary: "Antes do contato: equipe, EPI e material prontos.",
      actions: [
        "EPI completo (precaução universal): luvas, avental, óculos, máscara.",
        "Equipe definida com líder único; funções distribuídas (via aérea, acessos, exposição, registro).",
        "Material pronto: via aérea difícil, aspirador, torniquete, dreno de tórax, aquecedor, USG (FAST).",
        "Acionar banco de sangue e cirurgia PRECOCEMENTE se mecanismo grave ou instabilidade.",
        "Colher história AMPLA e mecanismo do trauma com a equipe pré-hospitalar.",
        "Critérios de TRAUMA MAIOR, que já na triagem definem sala de emergência e equipe completa — Glasgow < 14 ou deterioração neurológica; PAS < 90; FR < 10 ou > 29, ou necessidade de intubação pré-hospitalar.",
        "Trauma maior pela anatomia da lesão: ferimento penetrante em crânio, pescoço, tórax, abdome ou extremidades proximais ao cotovelo e ao joelho; combinação de traumas ou queimadura de 2º/3º grau; suspeita de instabilidade pélvica; fratura de dois ou mais ossos longos proximais (fêmur ou úmero); paralisia de um ou mais membros; amputação completa ou incompleta proximal ao punho ou ao tornozelo.",
      ],
      next: "x_hemorragia",
    },

    x_hemorragia: {
      id: "x_hemorragia",
      type: "decision",
      title: "X · Hemorragia exsanguinante",
      question: "Há sangramento externo maciço visível (jato, poça, membro amputado)?",
      evidence: [
        "No trauma, hemorragia exsanguinante vem ANTES da via aérea (X-ABCDE) — é a causa evitável nº 1 de morte precoce.",
        "Controle imediato: compressão direta firme → torniquete em membro → packing/curativo hemostático em junções.",
      ],
      options: [
        { id: "sim", label: "Sim — sangramento maciço", next: "controle_hemorragia" },
        { id: "nao", label: "Não", next: "a_via_aerea" },
      ],
    },

    controle_hemorragia: {
      id: "controle_hemorragia",
      type: "action",
      title: "Controle imediato da hemorragia",
      summary: "Parar o sangramento é a prioridade absoluta.",
      actions: [
        "Compressão direta firme e contínua sobre o ponto sangrante.",
        "Membro: TORNIQUETE proximal, apertar até cessar o sangramento; anotar o horário. Não afrouxar.",
        "Junções (axila/virilha/pescoço): packing com curativo hemostático + compressão.",
        "Pelve instável: cinta pélvica na altura dos grandes trocânteres.",
        "TRÍADE LETAL — hipotermia, coagulopatia e acidose metabólica. É ela que o controle de danos existe para interromper: parar a hemorragia rápido, reanimar de forma agressiva e adiar a reconstrução definitiva para depois da estabilização.",
        "Cirurgia de controle de danos: hemostasia rápida (inclusive tamponamento intratorácico ou intra-abdominal), víscera oca tratada por reparo primário ou ressecção com descontinuidade temporária, e fechamento temporário — em geral a vácuo — para evitar síndrome compartimental e manejar o débito. Reoperação depois de normalizar temperatura, coagulação e acidose.",
        "O conceito começou no abdome e hoje se aplica também a tórax, pelve e extremidades, com estabilização rápida da fratura reduzindo a resposta inflamatória.",
        "Acionar protocolo de transfusão maciça e cirurgia/hemostasia definitiva imediatamente.",
        "Ácido tranexâmico 1 g IV em 10 min (se < 3 h do trauma) → 1 g em 8 h (CRASH-2).",
      ],
      next: "a_via_aerea",
    },

    a_via_aerea: {
      id: "a_via_aerea",
      type: "decision",
      title: "A · Via aérea com proteção cervical",
      question: "A via aérea está pérvia e protegida (fala normalmente, sem estridor/obstrução)?",
      // ⚠️ ESTE `summary` NASCEU DE UM ITEM DE `evidence` (2026-08-17).
      // `ListaDeCriterios` recolhe por CONTAGEM (`itens.length <= 2` fica
      // aberto): o nó tinha TRÊS itens e estava inteiro atrás do "Ver
      // critérios". Subir o item que MUDA CONDUTA trouxe junto, de graça,
      // os outros dois — que agora aparecem sem toque.
      summary:
        "COMO SABER QUE A VIA AÉREA ESTÁ AMEAÇADA, MESMO COM O PACIENTE FALANDO: rouquidão, estridor, enfisema subcutâneo ou hematoma cervical expansivo. Qualquer um deles responde NÃO a esta pergunta.",
      evidence: [
        "IMOBILIZAÇÃO CERVICAL manual/colar durante toda a avaliação até excluir lesão.",
        "Indicações de via aérea definitiva: apneia, Glasgow ≤ 8, obstrução, trauma de face grave, risco de aspiração, queimadura de via aérea.",
      ],
      options: [
        { id: "ok", label: "Pérvia e protegida", next: "b_ventilacao" },
        { id: "ameacada", label: "Ameaçada / Glasgow ≤ 8", next: "via_aerea_definitiva" },
      ],
    },

    via_aerea_definitiva: {
      id: "via_aerea_definitiva",
      type: "action",
      title: "Via aérea definitiva",
      summary: "Intubação com estabilização cervical em linha.",
      actions: [
        "Pré-oxigenar; sequência rápida com estabilização cervical MANUAL em linha (retirar a parte anterior do colar).",
        "Escolher droga que preserve hemodinâmica: quetamina ou etomidato (evitar propofol no choque).",
        "Confirmar com capnografia (EtCO₂) — padrão-ouro.",
        "Plano de resgate definido; se falha e não ventila/não intuba: via aérea cirúrgica (cricotireoidostomia).",
        "Fixar tubo e reavaliar o posicionamento após qualquer mobilização.",
      ],
      next: "b_ventilacao",
    },

    b_ventilacao: {
      id: "b_ventilacao",
      type: "decision",
      title: "B · Ventilação e oxigenação",
      question: "Há sinais de pneumotórax hipertensivo, tórax instável ou hemotórax maciço?",
      evidence: [
        "Pneumotórax hipertensivo: hipotensão + turgência jugular + desvio de traqueia + murmúrio abolido + timpanismo. DIAGNÓSTICO CLÍNICO — não esperar radiografia.",
        "Hemotórax maciço: murmúrio abolido + macicez + choque.",
        "Tórax instável (flail chest): segmento com movimento paradoxal + contusão pulmonar.",
        "O₂ suplementar para todos; oximetria e capnografia contínuas.",
      ],
      options: [
        { id: "guiado", label: OPCAO_GUIADA, next: "b_dados" },
        { id: "sim", label: "Sim — alteração torácica grave", next: "conduta_torax" },
        { id: "nao", label: "Não", next: "c_circulacao" },
      ],
    },

    // Decomposição TORÁCICA, não a hemodinâmica: o que este nó pergunta são três
    // diagnósticos clínicos específicos, e cada um tem achados próprios que se
    // observam sem exame de imagem — o próprio enunciado diz que pneumotórax
    // hipertensivo NÃO espera radiografia.
    b_dados: {
      id: "b_dados",
      type: "input",
      title: "Vamos verificar juntos",
      intro: INTRO_GUIADA,
      fields: [
        {
          id: "murmurio",
          label: "Encostando o estetoscópio nos DOIS lados do peito: de um lado quase não entra ar?",
          presets: [
            { value: "sim", label: "Sim, um lado é bem mais fraco" },
            { value: "nao", label: "Não, parecido nos dois" },
          ],
        },
        {
          id: "percussao",
          label: "Batendo com os dedos nesse mesmo lado, o som é OCO (como tambor) ou SURDO (abafado)?",
          optional: true,
          presets: [
            { value: "oco", label: "Oco — como tambor" },
            { value: "surdo", label: "Surdo — abafado" },
            { value: "nao_avaliado", label: "Não consegui avaliar" },
          ],
        },
        {
          id: "jugular",
          label: "As veias do pescoço estão salientes, cheias, mesmo com a cabeceira elevada?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "paradoxal",
          label: "Olhando o peito de lado enquanto respira: existe um pedaço que AFUNDA quando o resto sobe?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "choque",
          label: "Está com pressão baixa, pele fria ou muito agitado/confuso?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
      ],
      next: {
        possiveis: ["conduta_torax", "b_limitrofe", "c_circulacao"],
        escolher: (v) => {
          const ladoMudo = v.murmurio === "sim";

          // Pneumotórax hipertensivo: ar sob pressão empurra o mediastino. Som
          // OCO + jugular cheia, ou lado mudo com choque, já bastam — é
          // diagnóstico clínico, e esperar imagem mata.
          const hipertensivo =
            ladoMudo && (v.percussao === "oco" || v.jugular === "sim" || v.choque === "sim");

          // Hemotórax maciço: sangue no lugar do ar — som SURDO com choque.
          const hemotorax = ladoMudo && v.percussao === "surdo";

          // Tórax instável: o segmento solto se move ao contrário do resto.
          const instavel = v.paradoxal === "sim";

          if (hipertensivo || hemotorax || instavel) return "conduta_torax";

          // Um lado mais fraco, sem nada que o qualifique, ainda pede imagem —
          // mas não é a catástrofe que se trata antes de olhar.
          if (ladoMudo) return "b_limitrofe";

          return "c_circulacao";
        },
      },
    },

    b_limitrofe: {
      id: "b_limitrofe",
      type: "action",
      title: "Um lado mais fraco, sem sinal de catástrofe — investigue sem parar o atendimento",
      summary:
        "A assimetria é real e merece explicação, mas não há o que autorize descomprimir o tórax agora.",
      actions: [
        "SEM turgência jugular, sem choque e sem som oco, não há critério de pneumotórax HIPERTENSIVO — e descomprimir sem critério cria o pneumotórax que não existia.",
        "Causas frequentes de murmúrio assimétrico no trauma: pneumotórax simples, hemotórax pequeno, contusão pulmonar, atelectasia, e o tubo orotraqueal fundo demais (seletivo à direita) em quem já foi intubado — confira a marca do tubo nos dentes antes de qualquer outra coisa.",
        "AGORA: oxigênio, oximetria e capnografia contínuas, radiografia de tórax e ultrassom à beira do leito (e-FAST). O ultrassom vê pneumotórax mais rápido e melhor que a radiografia.",
        "REAVALIAR a cada mudança e SEMPRE após intubar ou iniciar ventilação com pressão positiva: um pneumotórax simples vira hipertensivo sob pressão positiva, e isso acontece em minutos.",
        "Se surgir hipotensão, turgência jugular ou piora súbita da ventilação, é hipertensivo: descompressão imediata, sem esperar imagem.",
      ],
      next: "c_circulacao",
    },

    conduta_torax: {
      id: "conduta_torax",
      type: "action",
      title: "Conduta torácica imediata",
      summary: "Tratar antes de qualquer exame de imagem.",
      actions: [
        "Pneumotórax hipertensivo: descompressão IMEDIATA — punção no 5º EIC linha axilar média (ou 2º EIC linha hemiclavicular) → drenagem em selo d'água.",
        "Hemotórax maciço (> 1.500 mL de saída ou > 200 mL/h por 2–4 h): drenagem + acionar toracotomia.",
        "Pneumotórax aberto: curativo de três pontas → drenagem torácica definitiva.",
        "Tórax instável: analgesia eficaz, O₂, considerar ventilação; tratar a contusão pulmonar (evitar hiper-hidratação).",
        "Tamponamento cardíaco (Beck: hipotensão + turgência + bulhas abafadas): FAST → pericardiocentese/toracotomia.",
      ],
      next: "c_circulacao",
    },

    c_circulacao: {
      id: "c_circulacao",
      type: "decision",
      title: "C · Circulação e controle de hemorragia",
      question: "Há sinais de choque (PAS < 90, FC > 120, pele fria, enchimento capilar > 3 s, confusão)?",
      evidence: [
        "No trauma, choque é HEMORRÁGICO até prova em contrário — buscar sangue em 5 locais: tórax, abdome, pelve/retroperitônio, ossos longos e externo (no chão e mais 4).",
        TRAUMA_NAO_RESPONDE_QUATRO_CAUSAS,
        TRAUMA_CHOQUE_NEUROGENICO,
        "Dois acessos calibrosos (14–16 G) periféricos; se falha, acesso intraósseo.",
        "Hipotensão permissiva (PAS ~80–90) até hemostasia — EXCETO no TCE.",
        PAS_TCE_META,
        PAS_TCE_POR_QUE_NAO_VALE_A_PERMISSIVA,
      ],
      options: [
        { id: "guiado", label: OPCAO_GUIADA, next: "c_dados" },
        { id: "sim", label: "Sim — choque / instabilidade", next: "peso" },
        { id: "nao", label: "Não — hemodinamicamente estável", next: "d_neuro" },
      ],
    },

    c_dados: {
      id: "c_dados",
      type: "input",
      title: "Vamos verificar juntos",
      intro: INTRO_GUIADA,
      fields: [
        ...camposDeInstabilidade(),
        {
          // ── Por que esta pergunta existe SÓ aqui ──────────────────────────
          //
          // O limiar genérico de hipotensão é PAS < 90. No TCE a meta é ≥ 110
          // (BTF), e o genérico SUB-TRIA: um traumatizado de crânio com PAS 95
          // já está sofrendo lesão secundária e não seria marcado como
          // hipotenso.
          //
          // Não dá para o app deduzir isso do fluxo: no politrauma o passo C
          // vem ANTES do D (neuro), então quando esta pergunta é feita o TCE
          // ainda não foi identificado. Tem de ser perguntado — e é uma
          // observação de beira de leito, no espírito do resto do passo.
          //
          // O campo fica NESTA árvore, não no módulo compartilhado: os outros
          // seis consumidores não têm razão para uma pergunta sobre crânio.
          id: "traumaCraniano",
          label:
            "Bateu a cabeça, tem ferimento no crânio, ou está confuso/sonolento após o trauma?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          // ⚠️ FECHA A D-1 — e o campo é LOCAL, como o traumaCraniano.
          //
          // A dívida dizia que coletar idade exigiria um campo "que não serve
          // aos outros seis módulos que consomem camposDeInstabilidade()". A
          // auditoria conferiu: o passo NÃO é compartilhado — `traumaCraniano`
          // aparece num único arquivo do app, este. O que é compartilhado é a
          // FUNÇÃO de campos, não o passo.
          //
          // Sendo local, a idade não passa pelo contexto do paciente — e por
          // isso a D-1 fecha sem depender do contrato do canal (D-7), que
          // continua sendo dívida separada. Se algum dia precisar vir pelo
          // contexto, a condição da D-7 volta a valer.
          //
          // Só é perguntada quando há suspeita de trauma craniano: fora dele a
          // meta é a permissiva, e a idade não muda nada.
          id: "idadeParaMetaDePas",
          label: "Idade (anos) — muda a meta de pressão no trauma craniano",
          // Sem `mostrarSe` no contrato de InputField: o campo aparece sempre,
          // e o rótulo diz para que serve — quem não tem trauma craniano
          // ignora, e a derivação só o consulta quando traumaCraniano === "sim".
          // Preferi isso a estender o tipo do motor por um campo de um módulo.
          unit: "anos",
          allowCustom: true,
          customKeyboard: "numeric",
          customLabel: "Idade exata",
          presets: [
            { value: "30", label: "15–49 anos" },
            { value: "60", label: "50–69 anos" },
            { value: "75", label: "70 anos ou mais" },
          ],
        },
      ],
      next: roteamentoDeInstabilidade(
        {
          instavel: "peso",
          limitrofe: "c_limitrofe",
          estavel: "d_neuro",
          isquemicoIsolado: "c_dor_isquemica",
        },
        // Com suspeita de TCE, a meta vem ESTRATIFICADA POR IDADE (BTF). Sem
        // trauma craniano, segue o padrão de 90 — que é o certo no
        // traumatizado sem lesão cerebral, onde vale a hipotensão permissiva
        // até a hemostasia.
        //
        // ✅ D-1 FECHADA. O texto exibido e a lógica passaram a sair da mesma
        // fonte (lib/pas-no-tce): antes o texto estratificava e a derivação
        // aplicava 110 liso, e um paciente de 60 anos com PAS 105 estava na
        // meta pelo que lia e era marcado como hipotenso pela lógica.
        //
        // Sem idade informada, `limiarDePasNoTce` devolve 110 — mantendo a
        // direção de SOBRE-triagem, que é a tolerável aqui.
        (v) => (v.traumaCraniano === "sim" ? limiarDePasNoTce(v.idadeParaMetaDePas) : 90)
      ),
    },

    // Dor isquêmica ISOLADA no traumatizado, sem sinal de hipoperfusão, não é
    // choque hemorrágico — e era para lá que ia (`peso`, a via de transfusão).
    //
    // Duas leituras cabem aqui, e a segunda é a que se perde: a dor pode ser
    // consequência do trauma (contusão miocárdica, fratura de arco costal) ou
    // pode ter sido a CAUSA dele — a síncope ao volante, a queda depois do
    // aperto no peito. Nesse caso o trauma é o sintoma, e tratar só o trauma
    // deixa o infarto correndo.
    c_dor_isquemica: {
      id: "c_dor_isquemica",
      type: "action",
      title: "Dor isquêmica no trauma — o infarto pode ter vindo antes",
      summary:
        "Sem hipotensão e sem má perfusão, isto não é choque hemorrágico. Falta responder se a dor veio do trauma ou se o trauma veio da dor.",
      actions: [
        "ECG DE 12 DERIVAÇÕES e troponina agora, sem interromper o atendimento do trauma.",
        "A DOR PODE SER A CAUSA DO TRAUMA: síncope ao volante, queda de altura após dor precordial, colisão sem explicação de mecanismo. Pergunte o que aconteceu ANTES do impacto — a quem estava junto, se o paciente não puder responder.",
        "Mecanismo desproporcional ao acidente (colisão em baixa velocidade, queda da própria altura em adulto sem tropeço) reforça a suspeita de evento clínico precedendo o trauma.",
        "A dor também pode ser DO trauma: contusão miocárdica (ECG com arritmia ou alteração de ST após impacto torácico anterior), fratura de arco costal, contusão de parede. Troponina isolada não separa as duas — o contexto separa.",
        "⚠️ ANTIAGREGAÇÃO E ANTICOAGULAÇÃO NÃO são automáticas aqui: no politraumatizado, a conduta do infarto compete com o risco de sangramento. Decisão conjunta entre cirurgia do trauma e cardiologia, com a imagem do trauma já conhecida.",
        "SEGUIR o exame primário — D e E ainda não foram feitos. A dor isquêmica não suspende o ABCDE.",
      ],
      next: "d_neuro",
    },

    c_limitrofe: {
      id: "c_limitrofe",
      type: "action",
      title: "Achado isolado — no trauma, trate como choque até provar o contrário",
      summary:
        "Pressão normal não afasta hemorragia. O jovem traumatizado mantém a PA à custa de vasoconstrição e taquicardia — até não manter mais.",
      actions: [
        "Choque hemorrágico CLASSE I e II cursa com pressão sistólica NORMAL. O que muda primeiro é a pele, o enchimento capilar, a frequência e a pressão de PULSO (diferença entre sistólica e diastólica) — não a sistólica.",
        "Pele fria e pegajosa num traumatizado é hipoperfusão até prova em contrário: aqui não vale a lista de causas banais (dor, ansiedade, febre) que se aplica fora do trauma.",
        "PROCURE O SANGUE nos cinco locais: tórax, abdome, pelve/retroperitônio, ossos longos e externo — \"no chão e mais 4\". FAST e radiografias de tórax e pelve à beira do leito.",
        "Dois acessos calibrosos (14–16 G) agora, amostras para tipagem e provas cruzadas, ácido tranexâmico se dentro de 3 h do trauma.",
        "REAVALIAR a cada poucos minutos. A descompensação no trauma é tardia e abrupta: quando a sistólica cai, a perda já passou de 30% da volemia.",
      ],
      next: "peso",
    },

    peso: {
      id: "peso",
      type: "input",
      title: "Peso estimado",
      intro: "Para calcular volume e hemocomponentes.",
      fields: [
        {
          id: "peso",
          label: "Peso estimado (kg)",
          unit: "kg",
          presets: [
            { value: "50", label: "50 kg" },
            { value: "60", label: "60 kg" },
            { value: "70", label: "70 kg" },
            { value: "80", label: "80 kg" },
            { value: "90", label: "90 kg" },
            { value: "100", label: "100 kg" },
          ],
          allowCustom: true,
          customLabel: "Outro peso (kg)",
          customKeyboard: "numeric",
        },
        {
          id: "pesoOrigem",
          label: "Este peso é",
          optional: true,
          presets: [
            { value: "estimado", label: "Estimado" },
            { value: "real", label: "Real (pesado)" },
          ],
        },
      ],
      next: "reanimacao",
    },

    reanimacao: {
      id: "reanimacao",
      type: "action",
      title: "Reanimação hemostática",
      summary: "Sangue precoce, pouco cristaloide, controle da fonte.",
      actions: [
        "Cristaloide AQUECIDO {cristaloide} mL (~1 L) como ponte — NÃO usar grandes volumes (piora coagulopatia e acidose).",
        "Iniciar HEMOCOMPONENTES precocemente: protocolo de transfusão maciça em proporções iguais — concentrado de hemácias, plasma e plaquetas (1:1:1), acrescentando crioprecipitado. Repor o sangue perdido com sangue, não com cristaloide.",
        "Isso é REANIMAÇÃO DE CONTROLE DE DANOS: a estratégia nasceu da experiência militar e previne a coagulopatia grave, que por sua vez reduz a disfunção fisiológica após trauma grave.",
        "Ácido tranexâmico 1 g IV em 10 min se < 3 h do trauma → 1 g em 8 h. NÃO iniciar após 3 h: o CRASH-2 randomizou 20.211 pacientes e mostrou queda da mortalidade por todas as causas (14,5% × 16%; p = 0,0035), mas a administração tardia se associou a dano.",
        "Cálcio a cada 3–4 unidades transfundidas — o citrato do hemocomponente quela o cálcio do paciente, e a hipocalcemia da transfusão maciça piora a coagulopatia e a contratilidade.",
        CALCIO_EQUIVALENCIA,
        "Combater a tríade letal: HIPOTERMIA (aquecer paciente/fluidos), ACIDOSE, COAGULOPATIA.",
        "FAST + radiografias de tórax e pelve à beira-leito para localizar a fonte.",
        "Controle DEFINITIVO da fonte: cirurgia/angioembolização — não postergar por exames.",
      ],
      next: "fonte",
    },

    fonte: {
      id: "fonte",
      type: "decision",
      title: "Resposta à reanimação",
      question: "O paciente respondeu e estabilizou após a reanimação inicial?",
      summary: NA_DUVIDA_POLITRAUMA_FONTE,
      evidence: [
        "Respondedor transitório ou não-respondedor = sangramento ativo → sala de cirurgia / angioembolização.",
        "Instável NÃO vai para tomografia — vai para controle da fonte.",
      ],
      options: [
        { id: "responde", label: "Respondeu e manteve-se estável", next: "d_neuro" },
        { id: "nao_responde", label: "Não respondeu / resposta transitória", next: "damage_control" },
      ],
    },

    damage_control: {
      id: "damage_control",
      type: "transition",
      title: "Cirurgia de controle de danos",
      summary: "Sangramento ativo não controlado — hemostasia cirúrgica imediata.",
      disposition: "other_module",
      exitCriteria: [
        "Sala cirúrgica IMEDIATA (ou angioembolização conforme a fonte) — não retardar por tomografia.",
        DAMAGE_CONTROL_QUANDO_ABREVIAR,
        "Damage control: controlar hemorragia e contaminação, empacotar, fechar temporariamente e levar à UTI para correção fisiológica.",
        "Manter transfusão 1:1:1, aquecimento ativo e correção de cálcio.",
        "Reoperação programada em 24–48 h após reversão da tríade letal.",
      ],
      targets: [
        { moduleId: "choque", label: "Choque", reason: "Confirmar perfil e suporte hemodinâmico" },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Vasopressor após reposição volêmica adequada" },
      ],
    },

    d_neuro: {
      id: "d_neuro",
      type: "decision",
      title: "D · Avaliação neurológica",
      question: "Glasgow ≤ 13, pupilas assimétricas, déficit focal ou trauma craniano significativo?",
      // ⚠️ ESTE `summary` NASCEU DE UM ITEM DE `evidence` (2026-08-17).
      // `ListaDeCriterios` recolhe por CONTAGEM (`itens.length <= 2` fica
      // aberto): o nó tinha TRÊS itens e estava inteiro atrás do "Ver
      // critérios". Subir o item que MUDA CONDUTA trouxe junto, de graça,
      // os outros dois — que agora aparecem sem toque.
      summary:
        "⚠️ GLASGOW ≤ 8 PEDE VIA AÉREA DEFINITIVA, e ANISOCORIA É HERNIAÇÃO até prova em contrário.",
      evidence: [
        "Calcular Glasgow (abertura ocular + resposta verbal + motora) e avaliar pupilas.",
        "Sempre excluir hipoglicemia e hipóxia como causa de rebaixamento.",
      ],
      options: [
        { id: "sim", label: "Sim — alteração neurológica", next: "tce_transicao" },
        { id: "nao", label: "Não — neurológico preservado", next: "e_exposicao" },
      ],
    },

    tce_transicao: {
      id: "tce_transicao",
      type: "transition",
      title: "Trauma cranioencefálico associado",
      summary: "Priorizar perfusão cerebral e tomografia precoce.",
      disposition: "other_module",
      exitCriteria: [
        PAS_TCE_META,
        "Evitar também hipóxia: SpO₂ ≥ 90%. Hipotensão e hipóxia somam dano, e cada episódio conta.",
        "TC de crânio precoce assim que estabilizado; neurocirurgia se lesão com efeito de massa.",
        `Sinais de herniação: cabeceira 30°, normocapnia (PaCO₂ ${ALVOS_TCE.paco2}), salina hipertônica/manitol.`,
      ],
      targets: [
        { moduleId: "tce", label: "TCE — guia completo", reason: "Classificação, indicação de TC e controle da PIC" },
      ],
    },

    e_exposicao: {
      id: "e_exposicao",
      type: "action",
      title: "E · Exposição e prevenção de hipotermia",
      summary: "Expor tudo, examinar, e aquecer imediatamente.",
      actions: [
        "Despir completamente; rolamento em bloco para examinar o dorso, coluna e região perineal.",
        "AQUECER IMEDIATAMENTE: manta térmica, fluidos aquecidos, sala aquecida — hipotermia agrava coagulopatia.",
        "Adjuntos: monitorização completa, sonda gástrica e vesical (contraindicada se suspeita de lesão uretral: sangue no meato, hematoma perineal, próstata alta).",
        "Radiografias de tórax e pelve; FAST/e-FAST à beira-leito.",
        "Analgesia adequada e profilaxia antitetânica.",
      ],
      next: "secundaria",
    },

    secundaria: {
      id: "secundaria",
      type: "action",
      title: "Avaliação secundária",
      summary: "Só após a primária completa e o paciente estabilizado.",
      actions: [
        "História AMPLA: Alergias, Medicamentos, Passado, Líquidos/última refeição, Ambiente/mecanismo.",
        "Exame da cabeça aos pés, incluindo dorso, períneo, toque retal quando indicado e todos os segmentos.",
        "Reavaliar continuamente o ABCDE — qualquer deterioração exige voltar ao início da avaliação primária.",
        "Exames dirigidos: tomografia de corpo inteiro se estável e mecanismo grave.",
        "Documentar lesões, horários (torniquete, TXA) e transfusões.",
      ],
      next: "destino",
    },

    destino: {
      id: "destino",
      type: "decision",
      title: "Destino",
      question: "Há lesão grave, necessidade de cirurgia ou suporte avançado?",
      evidence: [
        "Considerar transferência precoce se o serviço não dispuser de recurso definitivo (não retardar por exames).",
      ],
      options: [
        { id: "grave", label: "Sim — lesão grave / suporte", next: "uti" },
        { id: "leve", label: "Não — trauma leve, estável", next: "observacao" },
      ],
    },

    uti: {
      id: "uti",
      type: "transition",
      title: "UTI / centro cirúrgico",
      summary: "Trauma grave com necessidade de monitorização e suporte.",
      disposition: "icu",
      exitCriteria: [
        "Corrigir a tríade letal: aquecer, corrigir acidose e coagulopatia (guiado por tromboelastometria quando disponível).",
        "Reavaliação seriada: síndrome compartimental (abdominal e de membros), lesões inicialmente despercebidas.",
        "Profilaxia de TVP assim que a hemostasia permitir; nutrição precoce; analgesia adequada.",
        "Reoperação programada se damage control.",
      ],
      targets: [
        { moduleId: "ventilacao-mecanica", label: "Ventilação mecânica", reason: "Parametrização pós-intubação / contusão pulmonar" },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Suporte hemodinâmico" },
        { moduleId: "sedoanalgesia", label: "Sedoanalgesia & BNM", reason: "Sedação e analgesia do trauma grave" },
      ],
    },

    observacao: {
      id: "observacao",
      type: "transition",
      title: "Observação e reavaliação",
      summary: "Trauma sem lesão grave identificada — vigiar deterioração tardia.",
      disposition: "observation",
      exitCriteria: [
        "Observação com reavaliação seriada — lesões abdominais e o TCE podem se manifestar tardiamente.",
        "Analgesia, profilaxia antitetânica e orientação de sinais de alarme por escrito.",
        "Retorno imediato se dor progressiva, vômitos, rebaixamento, dispneia ou distensão abdominal.",
      ],
      targets: [],
    },
  },
};
