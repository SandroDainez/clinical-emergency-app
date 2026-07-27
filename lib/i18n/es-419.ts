/**
 * Dicionário PT → ES (espanhol latino-americano) do app completo.
 *
 * FASE 1 — camada de interface: navegação, hub, catálogo dos módulos,
 * rótulos de área, login/conta e avisos. O conteúdo clínico de cada módulo
 * (árvores de decisão, engines e telas) entra nas fases seguintes, módulo a
 * módulo, para manter a fidelidade da tradução clínica.
 *
 * Chave = string EXATA em português. Sem entrada → devolve o PT (nunca vazio).
 */
export const ES_STRINGS: Record<string, string> = {
  // ── Hub / navegação ────────────────────────────────────────────────────────
  "Toque para avançar": "Toque para avanzar",
  "Módulos clínicos": "Módulos clínicos",
  "Guia de emergências": "Guía de emergencias",
  "Guias": "Guías",
  "Guia": "Guía",
  "Módulo": "Módulo",
  "Módulos": "Módulos",
  "MÓDULOS ACLS": "MÓDULOS ACLS",
  "Iniciar guia ACLS →": "Iniciar guía ACLS →",
  "Voltar": "Volver",
  "Sair": "Salir",
  "Entrar": "Ingresar",
  "Início": "Inicio",
  "Histórico": "Historial",
  "Explorar": "Explorar",
  "mais": "más",
  "módulos · baseado em evidências · AHA · ESC · ADA · WAO":
    "módulos · basado en evidencia · AHA · ESC · ADA · WAO",

  // ── Grupos temáticos ───────────────────────────────────────────────────────
  "Reanimação": "Reanimación",
  "Parada cardiorrespiratória e ACLS": "Paro cardiorrespiratorio y ACLS",
  "Choque & hemodinâmica": "Choque y hemodinamia",
  "Sepse e suporte vasoativo": "Sepsis y soporte vasoactivo",
  "Via aérea & ventilação": "Vía aérea y ventilación",
  "ISR, VM, sedoanalgesia/BNM e edema agudo de pulmão":
    "ISR, VM, sedoanalgesia/BNM y edema agudo de pulmón",
  "Metabólico & alergia": "Metabólico y alergia",
  "CAD/EHH e anafilaxia": "CAD/EHH y anafilaxia",
  "Neurologia aguda": "Neurología aguda",
  "AVC, reperfusão e neuroemergência": "ACV, reperfusión y neuroemergencia",
  "Cardiovascular & respiratório": "Cardiovascular y respiratorio",
  "Síndromes coronarianas e tromboembolia pulmonar":
    "Síndromes coronarios y tromboembolia pulmonar",
  "Obstetrícia": "Obstetricia",
  "Emergências hipertensivas da gestação": "Emergencias hipertensivas del embarazo",
  "Calculadoras & escores": "Calculadoras y puntajes",
  "Peso predito, TFG, SOFA, Glasgow, Wells, HEART, NIHSS, RASS e mais":
    "Peso predicho, TFG, SOFA, Glasgow, Wells, HEART, NIHSS, RASS y más",
  "Politrauma & emergências": "Politrauma y emergencias",
  "Trauma, TCE, convulsões, intoxicações, choque, insuficiência respiratória e abdome agudo":
    "Trauma, TCE, convulsiones, intoxicaciones, choque, insuficiencia respiratoria y abdomen agudo",

  // ── Títulos dos módulos ────────────────────────────────────────────────────
  "PCR Adulto": "PCR Adulto",
  "Sepse / Choque Séptico": "Sepsis / Choque Séptico",
  "Drogas Vasoativas": "Fármacos vasoactivos",
  "Correções eletrolíticas": "Correcciones electrolíticas",
  "ISR — Via aérea": "ISR — Vía aérea",
  "Edema agudo de pulmão": "Edema agudo de pulmón",
  "CAD e estado hiperosmolar": "CAD y estado hiperosmolar",
  "Ventilação mecânica": "Ventilación mecánica",
  "Anafilaxia": "Anafilaxia",
  "AVC": "ACV",
  "Síndromes coronarianas": "Síndromes coronarios",
  "Ritmos de Parada": "Ritmos de Paro",
  "Farmacologia no ACLS": "Farmacología en ACLS",
  "Bradicardia no ACLS": "Bradicardia en ACLS",
  "Taquicardia no ACLS": "Taquicardia en ACLS",
  "Causas Reversíveis (Hs e Ts)": "Causas Reversibles (H y T)",
  "Cuidados Pós-PCR": "Cuidados Pos-PCR",
  "Tromboembolia Pulmonar": "Tromboembolia Pulmonar",
  "Pré-eclâmpsia / Eclâmpsia": "Preeclampsia / Eclampsia",
  "Sedoanalgesia & BNM": "Sedoanalgesia y BNM",
  "Calculadoras Clínicas": "Calculadoras Clínicas",
  "Politrauma": "Politrauma",
  "TCE — Trauma cranioencefálico": "TCE — Traumatismo craneoencefálico",
  "Crises convulsivas e mal epiléptico": "Crisis convulsivas y estado epiléptico",
  "Intoxicações exógenas": "Intoxicaciones exógenas",
  "Choque": "Choque",
  "Insuficiência respiratória": "Insuficiencia respiratoria",
  "Abdome agudo": "Abdomen agudo",

  // ── Rótulos de área (badges) ───────────────────────────────────────────────
  "ACLS": "ACLS",
  "Sepse": "Sepsis",
  "Vasoativos": "Vasoactivos",
  "Eletrólitos": "Electrolitos",
  "ISR": "ISR",
  "EAP": "EAP",
  "CAD / EHH": "CAD / EHH",
  "VM": "VM",
  "Sedoanalgesia": "Sedoanalgesia",
  "Cardiologia": "Cardiología",
  "TEP": "TEP",
  "PE / Eclâmpsia": "PE / Eclampsia",
  "Calculadoras": "Calculadoras",
  "TCE": "TCE",
  "Convulsões": "Convulsiones",
  "Intoxicações": "Intoxicaciones",
  "Insuf. resp.": "Insuf. resp.",

  // ── Aviso / responsabilidade ───────────────────────────────────────────────
  "⚠ Ferramenta de apoio": "⚠ Herramienta de apoyo",
  "apoio educacional e à decisão clínica": "apoyo educativo y a la decisión clínica",

  // ── Telas de referência ────────────────────────────────────────────────────
  "ACLS · Ritmos de Parada": "ACLS · Ritmos de Paro",
  "ACLS · Farmacologia": "ACLS · Farmacología",
  "ACLS · Hs e Ts": "ACLS · H y T",
  "ACLS · Pós-PCR": "ACLS · Pos-PCR",
  "ACLS · Referência": "ACLS · Referencia",
  "Padrão no monitor": "Patrón en el monitor",
  "Reconhecimento rápido": "Reconocimiento rápido",
  "Conduta": "Conducta",
  "Indicação no ACLS": "Indicación en ACLS",
  "Ritmos Chocáveis": "Ritmos Desfibrilables",
  "Ritmos Não Chocáveis": "Ritmos No Desfibrilables",
  "Fibrilação Ventricular": "Fibrilación Ventricular",
  "Assistolia": "Asistolia",
  "FC": "FC",
  "Regularidade": "Regularidad",
  "Irregular": "Irregular",
  "Indeterminada": "Indeterminada",

  // ── Login / conta ──────────────────────────────────────────────────────────
  "Entrar na plataforma": "Ingresar a la plataforma",
  "Criar conta": "Crear cuenta",
  "E-mail": "Correo electrónico",
  "Senha": "Contraseña",
  "Nome completo": "Nombre completo",
  "Política de privacidade": "Política de privacidad",
  "Já tenho conta — entrar": "Ya tengo cuenta — ingresar",
  "Não tem conta? Criar conta": "¿No tiene cuenta? Crear cuenta",
  "Informe e-mail e senha.": "Ingrese correo y contraseña.",
  "E-mail ou senha inválidos.": "Correo o contraseña inválidos.",
  "Faça login para acessar os guias e o painel administrativo.":
    "Inicie sesión para acceder a las guías y al panel administrativo.",

  // ── Card de estabilização (aparece em TODOS os módulos) ────────────────────
  "Estabilização primeiro": "Estabilización primero",
  "ABCDE antes do guia — tratar ameaça à vida AGORA":
    "ABCDE antes de la guía — tratar la amenaza vital AHORA",
  "Paciente instável? A prioridade é estabilizar — não seguir o guia enquanto houver ameaça imediata à vida. Estabilize e depois retome o fluxo.":
    "¿Paciente inestable? La prioridad es estabilizar — no seguir la guía mientras haya una amenaza vital inmediata. Estabilice y luego retome el flujo.",
  "Abrir módulo de estabilização:": "Abrir el módulo de estabilización:",
  "Via aérea": "Vía aérea",
  "Obstrução, estridor ou rebaixamento → abrir/aspirar, posicionar, considerar via aérea definitiva (IOT).":
    "Obstrucción, estridor o deterioro del sensorio → abrir/aspirar, posicionar, considerar vía aérea definitiva (intubación).",
  "Respiração": "Respiración",
  "Insuficiência respiratória / hipoxemia → O₂ alvo, VNI precoce; IOT + ventilação se falha ou exaustão.":
    "Insuficiencia respiratoria / hipoxemia → O₂ objetivo, VNI precoz; intubación + ventilación si hay falla o agotamiento.",
  "Circulação": "Circulación",
  "Choque / hipotensão → 2 acessos, volume conforme contexto, vasopressor com alvo PAM ≥ 65 mmHg. Controlar sangramento.":
    "Choque / hipotensión → 2 accesos, volumen según el contexto, vasopresor con objetivo de PAM ≥ 65 mmHg. Controlar el sangrado.",
  "Disfunção neuro": "Disfunción neurológica",
  "Glasgow ≤ 8 → proteger via aérea. Tratar hipoglicemia, convulsão e causas reversíveis.":
    "Glasgow ≤ 8 → proteger la vía aérea. Tratar la hipoglucemia, las convulsiones y las causas reversibles.",
  "Exposição / ritmo": "Exposición / ritmo",
  "Arritmia INSTÁVEL → cardioversão sincronizada ou marcapasso. Sem pulso → iniciar RCP/ACLS imediatamente.":
    "Arritmia INESTABLE → cardioversión sincronizada o marcapasos. Sin pulso → iniciar RCP/ACLS de inmediato.",
  "Parada / RCP (ACLS)": "Paro / RCP (ACLS)",
  "Via aérea / IOT (ISR)": "Vía aérea / intubación (ISR)",
  "Choque / vasopressor": "Choque / vasopresor",
  "Bradicardia instável": "Bradicardia inestable",
  "Taquicardia instável": "Taquicardia inestable",

  // ── Hub (tela inicial) ─────────────────────────────────────────────────────
  "EMERGÊNCIA": "EMERGENCIA",
  "Diretrizes atualizadas": "Directrices actualizadas",
  "GUIA PRINCIPAL": "GUIA PRINCIPAL",
  "7 módulos desbloqueados com o plano Pro — ver planos →":
    "7 módulos desbloqueados con el plan Pro — ver planes →",
  "Conteúdo de ": "Contenido de ",
  ", baseado em diretrizes vigentes. Não substitui o julgamento clínico nem a avaliação individual do paciente. A conduta e a responsabilidade pelo atendimento são sempre do profissional de saúde assistente, que deve considerar as implicações éticas e legais.":
    ", basado en directrices vigentes. No sustituye el juicio clínico ni la evaluación individual del paciente. La conducta y la responsabilidad de la atención son siempre del profesional de salud tratante, que debe considerar las implicaciones éticas y legales.",
};
