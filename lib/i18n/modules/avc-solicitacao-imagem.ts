/**
 * ES — AVC: a SOLICITAÇÃO da imagem.
 *
 * ⚠️ O passo que faltava no fluxo (2026-09-06): no início do atendimento não há
 * imagem, há um pedido a fazer. Registrar o pedido ⛔ não afirma que o exame foi
 * feito, e a redação em espanhol precisa preservar essa distinção.
 */
export const avcSolicitacaoImagemEs: Record<string, string> = {
  "Solicitação da imagem": "Solicitud de la imagen",
  /** ⚠️ As ameaças imediatas — o eixo que deixou de afirmar o que não sabe. */
  "Medido": "Medido",
  "O que fazer agora": "Qué hacer ahora",
  /** ⚠️ O alfabeto de estados (C2) e os problemas ativos (§44). */
  "Favorável": "Favorable",
  "Corrigível": "Corregible",
  "Precisa verificar": "Necesita verificación",
  "Impede": "Impide",
  "Em andamento": "En curso",
  "Não avaliado": "No evaluado",
  "Avaliar e tratar a ameaça": "Evaluar y tratar la amenaza",
  "Abrir Correções — a fonte traz os agentes e as doses":
    "Abrir Correcciones — la fuente trae los agentes y las dosis",
  "Imagem solicitada às": "Imagen solicitada a las",
  "Registrar o exame": "Registrar el examen",
  "Já foi feita — registrar o exame": "Ya fue hecha — registrar el examen",
  "Registrar o pedido não afirma que o exame foi feito. O exame e o resultado são registrados abaixo, quando existirem.":
    "Registrar el pedido no afirma que el examen fue hecho. El examen y el resultado se registran abajo, cuando existan.",
  "Momento em que a imagem foi pedida. Registro operacional: não é marco de janela terapêutica e não afirma que o exame foi feito.":
    "Momento en que se pidió la imagen. Registro operativo: no es hito de ventana terapéutica y no afirma que el examen fue hecho.",
  "A fonte recomenda imagem cerebral de emergência na avaliação inicial, antes de iniciar intervenções de reperfusão. Registrar o pedido não substitui registrar o exame nem o seu resultado.":
    "La fuente recomienda imagen cerebral de emergencia en la evaluación inicial, antes de iniciar intervenciones de reperfusión. Registrar el pedido no sustituye registrar el examen ni su resultado.",
};
