/**
 * PALETA POR ÁREA CLÍNICA — a cor do card no hub.
 *
 * ⚠️ MORAVA EM `components/module-hub.tsx` ATÉ 2026-08-18. Saiu porque a UI 2.0
 * põe o card num componente novo, e a trava de paleta (`test:paleta`) proíbe
 * hexadecimal em arquivo fora do legado: ou a cor vive aqui, ou ela seria
 * duplicada entre o hub velho e o card novo — que é o defeito que a própria
 * paleta existe para evitar.
 *
 * ── ⚠️ POR QUE A CHAVE É A ETIQUETA, E NÃO O ID DO MÓDULO ──────────────────
 *
 * Leia isto antes de "consertar" a diferença de chave entre a cor e o ícone.
 * Ela NÃO é defeito, e a semelhança com uma divergência é superficial:
 *
 *   · COR é propriedade da CATEGORIA — e a categoria é a etiqueta;
 *   · ÍCONE é propriedade do MÓDULO — e o módulo é o id.
 *
 * São dois níveis de granularidade, cada um chaveado no seu. Chavear a cor por
 * id repetiria a mesma informação em 31 lugares, que é justamente o que a fonte
 * única impede — não o que ela pede.
 *
 * E a chave por etiqueta é o que deixa o REUSO VISÍVEL, que aqui é deliberado e
 * informa PARENTESCO CLÍNICO:
 *
 *   PCR e PÓS-PCR no azul      → é o mesmo paciente, antes e depois do ROSC
 *   VIA AÉREA e ISR no roxo    → as duas SÃO via aérea
 *   ARRITMIAS e CORONARIANA no rosa → o eixo é o coração
 *
 * Ler `ISR: ROXO_VIA_AEREA` diz por que a cor é aquela. Uma tabela por id daria
 * a mesma cor sem dizer o porquê, e o parentesco viraria coincidência.
 *
 * Quem confere: `test:etiquetas` (toda etiqueta em uso tem entrada) e
 * `test:paleta` (nenhum hexadecimal novo fora deste diretório).
 */

export type Paleta = { accent: string; iconBg: string; badgeBg: string; badgeText: string };

// ⚠️ AS ETIQUETAS NOVAS NÃO TROUXERAM COR NOVA — e isso é decisão, não economia.
//
// Quando "ACLS" se partiu em PCR · ARRITMIAS · PÓS-PCR · VIA AÉREA · CONSULTA,
// a saída óbvia era inventar cinco cores. Em vez disso cada etiqueta REUSA a
// paleta da família a que pertence, e o reuso passa a informar:
//
//   · PCR e PÓS-PCR compartilham o azul  → é o mesmo paciente, antes e depois
//                                           do ROSC; quem distingue é o texto;
//   · ARRITMIAS e CORONARIANA, o rosa    → o eixo é o coração;
//   · VIA AÉREA e ISR, o roxo            → as duas SÃO via aérea, e dizer isso
//                                           pela cor é mais honesto que separar.
//
// O ganho medido: o teto de hexadecimais deste arquivo CAIU de 165 para 151 no
// mesmo bloco em que ele ganhou cinco áreas.
const AZUL_PARADA: Paleta   = { accent: "#60a5fa", iconBg: "#1e3a5f", badgeBg: "#1e3a5f", badgeText: "#93c5fd" };
const ROXO_VIA_AEREA: Paleta = { accent: "#a78bfa", iconBg: "#2e1065", badgeBg: "#2e1065", badgeText: "#c4b5fd" };
const ROSA_CARDIACO: Paleta  = { accent: "#fb7185", iconBg: "#4c0519", badgeBg: "#4c0519", badgeText: "#fda4af" };
const AMARELO_ABDOME: Paleta = { accent: "#eab308", iconBg: "#422006", badgeBg: "#422006", badgeText: "#fde68a" };
const CINZA_NEUTRO: Paleta   = { accent: "#94a3b8", iconBg: "#1e293b", badgeBg: "#1e293b", badgeText: "#64748b" };

export const AREA_PALETTE: Record<string, Paleta> = {
  // ── O que era "ACLS" para nove módulos ─────────────────────────────────────
  PCR:         AZUL_PARADA,
  "PÓS-PCR":   AZUL_PARADA,
  ARRITMIAS:   ROSA_CARDIACO,
  "VIA AÉREA": ROXO_VIA_AEREA,
  CONSULTA:    CINZA_NEUTRO,
  Sepse:       { accent: "#fbbf24", iconBg: "#451a03", badgeBg: "#451a03", badgeText: "#fcd34d" },
  Vasoativos:  { accent: "#f87171", iconBg: "#450a0a", badgeBg: "#450a0a", badgeText: "#fca5a5" },
  ISR:         ROXO_VIA_AEREA,
  EAP:         { accent: "#22d3ee", iconBg: "#164e63", badgeBg: "#164e63", badgeText: "#67e8f9" },
  "CAD / EHH": { accent: "#fb923c", iconBg: "#431407", badgeBg: "#431407", badgeText: "#fdba74" },
  VM:          { accent: "#818cf8", iconBg: "#1e1b4b", badgeBg: "#1e1b4b", badgeText: "#a5b4fc" },
  Anafilaxia:  { accent: "#f472b6", iconBg: "#500724", badgeBg: "#500724", badgeText: "#f9a8d4" },
  AVC:              { accent: "#c084fc", iconBg: "#3b0764", badgeBg: "#3b0764", badgeText: "#e9d5ff" },
  TCE:              { accent: "#8b5cf6", iconBg: "#2e1065", badgeBg: "#2e1065", badgeText: "#c4b5fd" },
  "Convulsões":     { accent: "#d946ef", iconBg: "#4a044e", badgeBg: "#4a044e", badgeText: "#f0abfc" },
  CORONARIANA:      ROSA_CARDIACO,
  TEP:              { accent: "#f43f5e", iconBg: "#4c0519", badgeBg: "#4c0519", badgeText: "#fecdd3" },
  Choque:           { accent: "#ef4444", iconBg: "#450a0a", badgeBg: "#450a0a", badgeText: "#fca5a5" },
  "Insuf. resp.":   { accent: "#06b6d4", iconBg: "#083344", badgeBg: "#083344", badgeText: "#67e8f9" },
  // O rim é o vizinho retroperitoneal do abdome, e compartilha a cor por isso —
  // o mesmo critério das etiquetas do ACLS (PCR e PÓS-PCR no azul).
  Rim:              AMARELO_ABDOME,
  Politrauma:       { accent: "#f59e0b", iconBg: "#451a03", badgeBg: "#451a03", badgeText: "#fcd34d" },
  // ⚠️ EXTRAÍDA PARA CONSTANTE PARA QUE O RIM A REUSE SEM HEX NOVO.
  // A trava de paleta pegou a primeira versão: eu havia escrito os quatro
  // hexadecimais de novo para a etiqueta "Rim", e o teto do arquivo subiu de
  // 151 para 155. Reuso informa e não custa (R-78 aplicado à cor).
  "Abdome agudo":   AMARELO_ABDOME,
  "Intoxicações":   { accent: "#10b981", iconBg: "#052e16", badgeBg: "#052e16", badgeText: "#6ee7b7" },
  "Eletrólitos":    { accent: "#2dd4bf", iconBg: "#042f2e", badgeBg: "#042f2e", badgeText: "#99f6e4" },
  Calculadoras:     { accent: "#38bdf8", iconBg: "#082f49", badgeBg: "#082f49", badgeText: "#7dd3fc" },
  Sedoanalgesia:    { accent: "#6366f1", iconBg: "#312e81", badgeBg: "#312e81", badgeText: "#a5b4fc" },
  "PE / Eclâmpsia": { accent: "#e879f9", iconBg: "#4a044e", badgeBg: "#4a044e", badgeText: "#f5d0fe" },
  Módulo:      CINZA_NEUTRO,
};

/** Devolve a paleta da etiqueta; o cinza neutro é o piso, nunca um erro silencioso. */
export function getPalette(areaLabel: string): Paleta {
  return AREA_PALETTE[areaLabel] ?? CINZA_NEUTRO;
}

/**
 * ESTADO BLOQUEADO — o card de módulo que exige assinatura.
 *
 * ⚠️ A ETIQUETA ESMAECE JUNTO, e isso foi decidido OLHANDO, não argumentando.
 * Num protótipo com a flag ligada, o card bloqueado mantinha a etiqueta na cor
 * viva da área: barra cinza, ícone cinza, texto cinza — e « ARRITMIAS » amarelo.
 * Cor é o canal que se lê primeiro, e ele estava dizendo "ativo" enquanto todos
 * os outros diziam "bloqueado".
 *
 * ⚠️ E NÃO HÁ BADGE "PRO". A variante com badge foi construída e comparada: ela
 * não acrescenta um quarto sinal, ela TROCA a etiqueta pelo badge — o card
 * bloqueado deixa de dizer de que cenário é, para dizer o que o cinza e o
 * cadeado já disseram. Paga informação útil com rótulo redundante.
 */
export const PALETA_BLOQUEADA: Paleta = {
  accent: "#334155",
  iconBg: "#1e293b",
  badgeBg: "#1e293b",
  badgeText: "#5b6672",
};

/** O texto do card bloqueado — título e descritor. */
export const TEXTO_BLOQUEADO = { titulo: "#7c8795", descritor: "#5b6672" } as const;

/**
 * A MOLDURA DA SEÇÃO do hub — o contêiner que agrupa os cards.
 *
 * ⚠️ A COESÃO DA SEÇÃO VEM DO CONTÊINER, e a distinção do cenário continua na
 * barra lateral de cada card: são CANAIS DIFERENTES, e foi assim que o protótipo
 * passou no teste do desfoque. Sem o degrau de fundo (página → seção → card) as
 * seções somem e a tela vira uma grade só.
 */
export const SECAO_DO_HUB = {
  fundo: "#181b21",
  borda: "#21252c",
  titulo: "#8892a0",
} as const;

/**
 * AS TRÊS DERIVAÇÕES DO CARD — halo, pílula e tingimento.
 *
 * ⚠️ ELAS EXISTEM PARA QUE O COMPONENTE NÃO TENHA COR NENHUMA. Halo, pílula e
 * fundo são a MESMA cor da categoria em opacidades diferentes; escrever qualquer
 * uma delas como constante nova criaria uma segunda cor a manter em sincronia —
 * que é o defeito que a paleta única existe para impedir (`test:paleta` reprova
 * hexadecimal em componente).
 *
 * ⚠️ O TINGIMENTO É 7% E NÃO SOBE — PD-10, decidido por medição: a 10% o
 * descritor cai para 4,25 e reprova o AA de texto pequeno. O orçamento de
 * contraste do card já está gasto; qualquer escurecimento posterior reprova.
 */
const TINGIMENTO = 0.07;
const PILULA = 0.17;

/** Mistura `cor` sobre `fundo` na proporção dada. Ambos em #RRGGBB. */
function mistura(cor: string, fundo: string, p: number): string {
  const hx = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [a, b] = [hx(cor), hx(fundo)];
  const c = a.map((v, i) => Math.round(v * p + b[i] * (1 - p)));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** O fundo do card: a cor da categoria a 7% sobre a superfície do tema. */
export function fundoDoCard(areaLabel: string, surface: string): string {
  return mistura(getPalette(areaLabel).accent, surface, TINGIMENTO);
}

/** A borda: a mesma cor um pouco mais presente que o fundo. */
export function bordaDoCard(areaLabel: string, linha: string): string {
  return mistura(getPalette(areaLabel).accent, linha, 0.18);
}

/** O fundo da pílula da etiqueta. */
export function fundoDaPilula(areaLabel: string, surface: string): string {
  return mistura(getPalette(areaLabel).accent, surface, PILULA);
}

/**
 * ÍCONES CHEIOS — `MaterialCommunityIcons`, que já vem em `@expo/vector-icons`.
 *
 * ⚠️ NENHUM NOME AQUI FOI ESCRITO DE MEMÓRIA: os 31 foram conferidos contra o
 * glyphmap instalado antes de entrar. Ícone inexistente não quebra o build — ele
 * renderiza um quadrado vazio, que é falha silenciosa.
 *
 * ⚠️ E O RIM NÃO TEM ÍCONE. Não existe `kidney` em nenhum conjunto instalado. A
 * escolha do médico foi TUBO DE ENSAIO, com a razão: o módulo não é sobre o
 * órgão, é sobre creatinina que subiu e paciente que parou de urinar. Um ícone
 * que fingisse ser um rim mentiria sobre o conteúdo; `water-pump` e
 * `filter-variant` foram recusados por isso (e o segundo colide com "filtrar").
 */
export const ICONE_DO_MODULO: Record<string, string> = {
  "pcr-adulto": "heart-flash",
  "bradicardia-acls": "heart-minus",
  "taquicardia-acls": "heart-plus",
  "causas-reversiveis-acls": "clipboard-list",
  "pcr-gestacao-acls": "mother-nurse",
  "pos-pcr-acls": "heart-cog",
  "ritmos-acls": "heart-pulse",
  "farmacologia-acls": "pill",
  "ovace-adulto": "account-alert",
  "sepse-adulto": "bacteria",
  "choque": "chart-line-variant",
  "avc": "brain",
  "sindromes-coronarianas": "heart",
  "tep": "lungs",
  "ventilacao-mecanica": "air-filter",
  "isr-rapida": "medical-bag",
  "edema-agudo-pulmao": "water",
  "insuficiencia-respiratoria": "lungs",
  "politrauma": "ambulance",
  "tce": "head-flash",
  "crises-convulsivas": "flash",
  "intoxicacoes-exogenas": "skull-crossbones",
  "cetoacidose-hiperosmolar": "water-percent",
  "correcoes-eletroliticas": "flask",
  "injuria-renal-aguda": "test-tube",
  "anafilaxia": "needle",
  "abdome-agudo": "stomach",
  "pre-eclampsia": "human-pregnant",
  "drogas-vasoativas": "iv-bag",
  "sedoanalgesia": "sleep",
  "calculadoras-clinicas": "calculator-variant",
};
