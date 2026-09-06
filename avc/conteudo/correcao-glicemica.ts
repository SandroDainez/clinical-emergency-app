/**
 * F-18 · CORREÇÃO GLICÊMICA NO AVC — ⛔ dados puros, ⛔ nenhuma decisão de tela.
 *
 * ── ⚠️⚠️ O PRINCÍPIO, ⛔ E ⛔ ELE ⛔ NÃO É UM NÚMERO ─────────────────────────
 *
 * > ⛔ **Glicemia ⛔ não contraindica.** ⚠️ O que decide é o **déficit persistir
 * > depois da correção**.
 *
 * ⚠️ A fonte é explícita: *"clinical deficits **should be assessed after
 * correction of glucose**"*, ⛔ e *"if symptoms of disabling stroke persist
 * despite correction to normoglycemia, administration of IVT is **recommended**
 * to improve functional outcomes"*.
 *
 * ⚠️⚠️ ⛔ ISSO INVERTE O REFLEXO COMUM: `<50` ⛔ e `>400` foram, por anos,
 * **critério de exclusão**. ⚠️ Na edição de 2026 eles definem **gravidade**, ⛔ e
 * ⛔ não exclusão — ⛔ e um app que os trate como contraindicação absoluta faria
 * o médico **deixar de trombolisar** alguém elegível.
 *
 * ── ⚠️⚠️ ⛔ E O QUE ESTE ARQUIVO ⛔ NÃO FAZ ─────────────────────────────────
 *
 * ⛔ **⛔ Não inventa valor de liberação.** ⚠️ A fonte ⛔ não estabelece `<300`,
 * `<250`, `<200` ⛔ nem `<180` como obrigatório antes da IVT (**E-31**).
 *
 * ⛔ **⛔ Não dá dose fixa de insulina.** ⚠️ ⛔ Não existe *"300 mg/dL = 10 UI"* —
 * a necessidade depende de peso, função renal, potássio, corticoide,
 * catecolaminas, CAD, EHH ⛔ e velocidade de queda.
 */

/**
 * ⚠️⚠️ OS TRÊS CORTES — ⛔ e ⛔ eles ⛔ NÃO COLAPSAM.
 *
 * ⛔ `60` ⛔ e `50` ⛔ não são "quase o mesmo": um manda **tratar**, o outro
 * define **gravidade**. ⚠️ Os valores já vivem em `derivacoes-d.ts`
 * (`CORTES_GLICEMIA`); aqui mora o **significado de cada um**.
 */
export type CorteGlicemico = {
  readonly id: string;
  readonly faixa: string;
  /**
   * ⚠️⚠️ OS LIMITES EM NÚMERO — ⛔ e ⛔ eles moram AQUI, colados na frase que os
   * escreve, ⛔ e ⛔ não numa segunda tabela no núcleo.
   *
   * ⛔ Enquanto a faixa era **⛔ só texto** (*"Acima de 180 e até 400 mg/dL"*),
   * quem precisava comparar um número tinha de redigitar 180 ⛔ e 400 em outro
   * arquivo — ⛔ duas verdades sobre o mesmo corte (**I6**), ⛔ e a que decide
   * seria a cópia.
   *
   * ⚠️ `de` é **inclusivo**, `ate` é **exclusivo**: 60 cai em *"de 60 a 180"*,
   * ⛔ e 180 cai em *"acima de 180"*. ⛔ `undefined` = ⛔ sem piso ⛔ ou sem teto.
   *
   * ⚠️⚠️ ⛔ E ⛔ NENHUM DELES É LIMIAR NOVO: ⛔ os quatro números — 50, 60, 180,
   * 400 — ⛔ já estavam escritos na `faixa` transcrita. ⛔ A trava confere que a
   * frase ⛔ e o número dizem a mesma coisa.
   */
  readonly de?: number;
  readonly ate?: number;
  /**
   * ⚠️⚠️ ⛔ ELE PEDE CONDUTA AGORA? — ⛔ e ⛔ isto ⛔ **não** é *"bloqueia a
   * trombólise"*. ⚠️ As duas coisas foram confundidas na tela, ⛔ e o resultado
   * foi uma glicemia de **579 mg/dL** desenhada com **✓ avaliado**: o eixo lia
   * a lista de **bloqueios da trombólise**, ⛔ e hiperglicemia ⛔ não bloqueia
   * trombólise — ⛔ ela ⛔ só **⛔ não é** motivo para ⛔ não reperfundir.
   *
   * ⛔ *"⛔ Não bloqueia"* ⛔ e *"⛔ não é ameaça"* são coisas diferentes, ⛔ e o
   * app afirmava a segunda a partir da primeira (**E-23**).
   */
  readonly pedeConduta: boolean;
  readonly natureza: string;
  /** ⚠️ O que fazer — ⛔ e ⛔ nunca "não trombolisar". */
  readonly conduta: string;
  /** ⛔ ⛔ O que este corte **⛔ NÃO** é. ⚠️ Dito em palavras, ⛔ e ⛔ não implícito. */
  readonly naoE: string;
  readonly fonte: string;
};

export const CORTES_GLICEMICOS: readonly CorteGlicemico[] = [
  {
    id: "hipo_grave",
    faixa: "Abaixo de 50 mg/dL",
    ate: 50,
    pedeConduta: true,
    natureza: "Disglicemia grave",
    conduta: "Corrigir imediatamente, repetir a glicemia e reavaliar o déficit",
    naoE: "Não é contraindicação absoluta à trombólise",
    fonte: "F-18",
  },
  {
    id: "hipo_tratar",
    faixa: "Abaixo de 60 mg/dL",
    /**
     * ⚠️⚠️ ⛔ SEM PISO — ⛔ e a trava me obrigou a tirar o que eu havia posto.
     *
     * ⛔ Eu escrevi `de: 50` para as faixas ⛔ não se sobreporem. ⚠️ ⛔ Mas a
     * fonte **⛔ não escreve** esse piso: *"hypoglycemia (blood glucose <60
     * mg/dL) should be treated"* vale para **tudo** abaixo de 60, ⛔ inclusive
     * abaixo de 50. ⛔ O 50 é rótulo de **gravidade**, ⛔ e ⛔ não fronteira de
     * outra faixa.
     *
     * ⚠️ As faixas se sobrepõem **porque a fonte as escreve assim**, ⛔ e quem
     * resolve é a **ordem da lista**: do mais grave para o menos. ⛔ Inventar
     * uma fronteira para arrumar a estrutura é o que **E-31** proíbe.
     */
    ate: 60,
    pedeConduta: true,
    natureza: "Hipoglicemia a tratar",
    conduta: "Corrigir e reavaliar",
    naoE: "Não é bloqueio da trombólise",
    fonte: "F-06",
  },
  {
    id: "sem_bloqueio",
    faixa: "De 60 a 180 mg/dL",
    de: 60,
    ate: 180,
    pedeConduta: false,
    natureza: "Sem bloqueio glicêmico",
    conduta: "Seguir o protocolo de reperfusão",
    naoE: "Não exige correção antes da trombólise",
    fonte: "F-06",
  },
  {
    id: "hiper",
    faixa: "Acima de 180 e até 400 mg/dL",
    de: 180,
    ate: 400,
    pedeConduta: true,
    natureza: "Hiperglicemia",
    conduta: "Avaliar necessidade de tratamento, sem atrasar a reperfusão",
    naoE: "Não bloqueia a trombólise isoladamente",
    fonte: "F-06",
  },
  {
    id: "hiper_grave",
    faixa: "Acima de 400 mg/dL",
    de: 400,
    pedeConduta: true,
    natureza: "Disglicemia grave",
    conduta:
      "Corrigir, investigar cetoacidose ou estado hiperosmolar conforme o contexto, e reavaliar o déficit",
    naoE: "Não é contraindicação absoluta à trombólise",
    fonte: "F-18",
  },
];

/**
 * ⚠️⚠️ A PERGUNTA QUE DECIDE — ⛔ e ⛔ ela ⛔ não é sobre o número.
 *
 * ⚠️ Ela existe como conteúdo declarado porque é **o raciocínio**, ⛔ e ⛔ não
 * uma frase de tela: apagá-la deixaria a superfície mostrando cinco faixas ⛔ e
 * ⛔ nenhuma pergunta.
 */
export const PERGUNTA_QUE_DECIDE = {
  pergunta: "O déficit neurológico persiste depois de corrigir a glicemia?",
  seDesaparece:
    "A hipótese de mimetizador metabólico ganha força. Não trombolisar automaticamente, e reconsiderar o diagnóstico.",
  sePersiste:
    "Se o déficit incapacitante persiste apesar da correção, a trombólise é recomendada quando os demais critérios estiverem satisfeitos.",
  cor: "1",
  fonte: "F-18",
} as const;

/** ⚠️ O tratamento — ⛔ dose ⛔ e via, ⛔ e ⛔ nada de preparo ⛔ nem bomba. */
export type TratamentoGlicemico = {
  readonly id: string;
  readonly nome: string;
  readonly dose?: string;
  readonly quando: string;
  readonly cautela?: string;
  readonly procedencia: string;
};

export const TRATAMENTOS_GLICEMICOS: readonly TratamentoGlicemico[] = [
  {
    id: "glicose_ev",
    nome: "Glicose intravenosa a 50%",
    dose: "25 mL por via endovenosa, lentamente, o que corresponde a 12,5 g",
    quando:
      "Via preferida quando há alteração neurológica ou a deglutição não está garantida. Depois: repetir a glicemia e reavaliar o déficit",
    /**
     * ⚠️⚠️ A DIVERGÊNCIA FICA **NA TELA**, ⛔ e ⛔ não escondida na fonte: o
     * manual brasileiro de 2013 descreve outro volume. ⛔ ⛔ Nenhuma das duas é
     * "a certa" — ⛔ e o app ⛔ não escolhe entre elas por conta própria.
     */
    cautela:
      "Um manual brasileiro de 2013 descreve 30 mL de glicose a 50% diluídos em 100 mL de soro fisiológico. São opções práticas diferentes, e nenhuma delas é a única possível",
    procedencia: "Revisão clínica 2026, com a divergência do manual de 2013 registrada",
  },
  {
    id: "glicose_diluida",
    nome: "Glicose em solução mais diluída",
    quando:
      "Conforme protocolo institucional. Menor osmolaridade, menor irritação venosa e menor lesão em caso de extravasamento",
    cautela:
      "O objetivo não é uma concentração, e sim corrigir a neuroglicopenia sem produzir hiperglicemia excessiva",
    procedencia: "Protocolo institucional",
  },
  {
    id: "glicose_oral",
    nome: "Glicose por via oral",
    dose: "15 g de carboidrato de ação rápida, reavaliando em 15 minutos",
    quando: "Somente com paciente consciente e deglutição segura",
    cautela:
      "No acidente vascular cerebral agudo, não usar antes de assegurar nível de consciência, segurança da deglutição e ausência de risco de aspiração",
    procedencia: "Sociedade Americana de Diabetes, 2026",
  },
  {
    id: "glucagon",
    nome: "Glucagon",
    dose: "1 mg por via intramuscular ou subcutânea, ou 3 mg por via intranasal quando disponível",
    quando:
      "Quando não há glicose intravenosa nem via oral segura imediatamente disponíveis",
    cautela:
      "No hospital, com acesso venoso disponível, a glicose intravenosa costuma ser mais direta e previsível",
    procedencia: "Sociedade Americana de Diabetes, 2026",
  },
  {
    id: "insulina",
    nome: "Insulina regular intravenosa em infusão contínua",
    /**
     * ⛔ ⛔ SEM DOSE, ⛔ e a ausência é **a informação**: ⛔ não existe dose fixa
     * recomendada para AVC, ⛔ e escrever uma seria inventá-la.
     */
    quando:
      "Quando indicada no paciente crítico, segundo protocolo institucional validado de infusão",
    cautela:
      "Não existe dose fixa recomendada para o acidente vascular cerebral. A necessidade depende de resistência insulínica, diabetes prévio, peso, função renal, potássio, alimentação, corticoide, catecolaminas, cetoacidose, estado hiperosmolar e velocidade de queda da glicemia",
    procedencia: "Sem dose neste slot, por decisão da fonte",
  },
];

/**
 * ⚠️⚠️ OS ALVOS GLICÊMICOS — ⛔ e ⛔ eles ⛔ NÃO são porta de entrada da
 * reperfusão.
 */
export type AlvoGlicemico = {
  readonly id: string;
  readonly valor: string;
  readonly contexto: string;
  readonly cor: string;
  readonly loe: string;
  readonly fonte: string;
};

export const ALVOS_GLICEMICOS: readonly AlvoGlicemico[] = [
  {
    id: "alvo_manejo",
    valor: "De 140 a 180 mg/dL",
    contexto:
      "Alvo de tratamento da hiperglicemia persistente, com monitorização cuidadosa. Não é pré-requisito para reperfundir",
    cor: "2a",
    loe: "—",
    fonte: "F-06",
  },
  {
    /**
     * ⚠️⚠️ **COR 3 · sem benefício** — SHINE. ⛔ Hipoglicemia grave ocorreu
     * ⛔ **só** no grupo intensivo, ⛔ e ⛔ não houve ganho funcional em 90 dias.
     */
    id: "intensivo_sem_beneficio",
    valor: "Não perseguir de 80 a 130 mg/dL",
    contexto:
      "Controle intensivo não melhora o desfecho funcional do acidente vascular cerebral, e a hipoglicemia grave ocorreu apenas no grupo intensivo",
    cor: "3: No Benefit",
    loe: "—",
    fonte: "F-18",
  },
  {
    id: "gatilho_hospitalar",
    valor: "Igual ou acima de 180 mg/dL em duas medidas em 24 horas",
    contexto:
      "Gatilho para iniciar ou intensificar insulinoterapia no paciente crítico. É manejo hospitalar, e não critério de elegibilidade",
    cor: "—",
    loe: "—",
    fonte: "F-18",
  },
];

/**
 * ⚠️⚠️ ⛔ O QUE O APP ⛔ NÃO PODE DIZER — declarado como **conteúdo**, ⛔ e ⛔ não
 * ⛔ só como comentário, para que a trava possa medir ⛔ e a tela possa mostrar.
 *
 * ⚠️ Cada linha é um erro que o reflexo antigo produz naturalmente.
 */
export const ERROS_A_EVITAR: readonly { readonly errado: string; readonly correto: string }[] = [
  {
    errado: "Glicemia abaixo de 50 é contraindicação absoluta",
    correto: "É disglicemia grave. Corrigir e reavaliar o déficit",
  },
  {
    errado: "Glicemia acima de 400 é contraindicação absoluta",
    correto:
      "É disglicemia grave. Déficit incapacitante que persiste após a correção mantém a indicação",
  },
  {
    errado: "Só trombolisar quando a glicemia estiver abaixo de 180",
    correto: "De 140 a 180 é alvo de manejo, e não pré-requisito de reperfusão",
  },
  {
    errado: "Dez unidades de insulina por via endovenosa para glicemia acima de 300",
    correto: "Insulinoterapia por protocolo dinâmico validado",
  },
  {
    errado: "Meta de 80 a 130",
    correto: "Não é recomendada para melhorar o desfecho do acidente vascular cerebral",
  },
];
