/**
 * Telas de suporte — dicionário PT → ES.
 * Histórico/resumo/timeline de sessão, paywall, explore, privacidade e o
 * painel de administração. Também não tinham nenhuma chamada tr().
 *
 * Nomes de diretriz (AHA 2020, ESC 2021, SSC 2021, ADA 2022, WAO 2021,
 * ARDSnet, PADIS) e a marca do app ficam como estão.
 */
export const ES_TELAS_SUPORTE: Record<string, string> = {
  // ── Parágrafos longos (antes quebrados em várias linhas) ──────────────────
  "Acesso a todos os módulos clínicos, fármacos, doses e calculadoras — baseados nas principais diretrizes mundiais.":
    "Acceso a todos los módulos clínicos, fármacos, dosis y calculadoras — basados en las principales guías mundiales.",
  "A assinatura é cobrada automaticamente no período escolhido. Você pode cancelar a qualquer momento pela loja de aplicativos. Os preços podem variar de acordo com sua região.":
    "La suscripción se cobra automáticamente en el período elegido. Puede cancelarla en cualquier momento desde la tienda de aplicaciones. Los precios pueden variar según su región.",
  "Você tem acesso a todos os 15 módulos clínicos, incluindo Sepse, ISR, Ventilação, CAD/EHH, Anafilaxia e mais.":
    "Tiene acceso a los 15 módulos clínicos, incluidos sepsis, ISR, ventilación, CAD/EHH, anafilaxia y más.",
  "Acesse Sepse, ISR, Ventilação, CAD/EHH, Anafilaxia e mais 4 módulos premium. Baseados nas melhores diretrizes internacionais.":
    "Acceda a sepsis, ISR, ventilación, CAD/EHH, anafilaxia y 4 módulos premium más. Basados en las mejores guías internacionales.",
  "Fluxos para emergência e UTI com documentação estruturada, baseados em diretrizes AHA, ESC, ADA, WAO, ARDSnet e ACEP. Ferramenta de apoio à decisão — não substitui protocolo institucional nem julgamento clínico.":
    "Flujos para urgencias y UCI con documentación estructurada, basados en las guías AHA, ESC, ADA, WAO, ARDSnet y ACEP. Herramienta de apoyo a la decisión — no sustituye el protocolo institucional ni el juicio clínico.",

  // ══ Sessão: resumo, histórico, timeline, debrief ═══════════════════════════
  "Resumo da sessão": "Resumen de la sesión",
  "Gerando resumo...": "Generando el resumen...",
  "Falha ao gerar resumo": "Fallo al generar el resumen",
  "Não foi possível carregar resumo clínico": "No se pudo cargar el resumen clínico",
  "Nenhuma sessão ativa no momento.": "Ninguna sesión activa en este momento.",
  "Nenhum evento registrado ainda.": "Aún no se registró ningún evento.",
  "Passos confirmados": "Pasos confirmados",
  "Ritmos selecionados": "Ritmos seleccionados",
  "Medicações": "Medicación",
  "Guia aberto": "Guía abierta",
  "Guia encerrado": "Guía cerrada",

  "Histórico de sessões": "Historial de sesiones",
  "Carregando histórico...": "Cargando el historial...",
  "Não foi possível carregar histórico de sessões":
    "No se pudo cargar el historial de sesiones",
  "Não foi possível carregar o histórico.": "No se pudo cargar el historial.",
  "Nenhuma sessão registrada ainda.": "Aún no se registró ninguna sesión.",
  // ⚠️ Degradação declarada (Degrau 2): indisponível ⛔ NÃO é vazio. A segunda
  // frase é a que importa — o médico precisa saber que ⛔ nada se perdeu.
  "Histórico temporariamente indisponível. Suas sessões estão preservadas — nada foi apagado.":
    "Historial temporalmente no disponible. Tus sesiones están preservadas — no se borró nada.",
  "Histórico temporariamente indisponível. Esta sessão está preservada — nada foi apagado.":
    "Historial temporalmente no disponible. Esta sesión está preservada — no se borró nada.",
  "Em andamento": "En curso",
  "Encerrado": "Cerrada",
  "Iniciado": "Iniciada",
  "Iniciado em": "Iniciada el",
  "Encerrado em": "Cerrada el",
  "Protocolo": "Guía",

  "Linha do tempo clínica": "Línea de tiempo clínica",
  "Carregando eventos...": "Cargando los eventos...",
  "Falha ao carregar eventos": "Fallo al cargar los eventos",
  "Não foi possível carregar eventos clínicos": "No se pudieron cargar los eventos clínicos",
  "Contagem": "Recuento",
  "Joules": "Julios",

  "Detalhes da sessão": "Detalles de la sesión",
  "Sessão clínica": "Sesión clínica",
  "Carregando sessão...": "Cargando la sesión...",
  "Carregando dados da sessão...": "Cargando los datos de la sesión...",
  "Falha ao carregar sessão": "Fallo al cargar la sesión",
  "Não foi possível carregar a sessão.": "No se pudo cargar la sesión.",
  "REVISÃO OPERACIONAL": "REVISIÓN OPERATIVA",
  "Revise sessões clínicas anteriores — desfechos, duração, medicações e registros por módulo.":
    "Revise las sesiones clínicas anteriores — desenlaces, duración, medicación y registros por módulo.",

  // ══ Paywall ═══════════════════════════════════════════════════════════════
  "EMERGÊNCIA CLÍNICA PRO": "EMERGENCIA CLÍNICA PRO",
  "GRATUITO": "GRATUITO",
  "PRO": "PRO",
  "MELHOR OFERTA": "MEJOR OFERTA",
  "Mensal": "Mensual",
  "Anual": "Anual",
  "plano mensal": "plan mensual",
  "plano anual": "plan anual",
  "Cancele quando quiser": "Cancele cuando quiera",
  "Todos os módulos": "Todos los módulos",
  "Tudo do plano gratuito": "Todo lo del plan gratuito",
  "Atualizações de diretrizes incluídas": "Actualizaciones de las guías incluidas",
  "Restaurar compras anteriores": "Restaurar compras anteriores",
  "Nenhuma compra anterior encontrada.": "No se encontró ninguna compra anterior.",
  "Compra não concluída. Tente novamente.": "Compra no completada. Inténtelo de nuevo.",
  "Guia ACLS completo": "Guía ACLS completa",
  "Ritmos, fármacos e causas reversíveis": "Ritmos, fármacos y causas reversibles",
  "Bradiarritmias e taquiarritmias": "Bradiarritmias y taquiarritmias",
  "Log clínico e resumo operacional": "Registro clínico y resumen operativo",
  "Sepse & antibioticoterapia (SSC 2021)": "Sepsis y antibioticoterapia (SSC 2021)",
  "Síndrome coronariana aguda": "Síndrome coronario agudo",
  "AVC isquêmico · hemorrágico": "ACV isquémico · hemorrágico",
  "Edema agudo de pulmão (ESC 2021)": "Edema agudo de pulmón (ESC 2021)",
  "CAD / EHH — cetoacidose diabética": "CAD / EHH — cetoacidosis diabética",
  "ISR — intubação sequência rápida": "ISR — intubación de secuencia rápida",
  "Ventilação mecânica (ARDSnet · PADIS)": "Ventilación mecánica (ARDSnet · PADIS)",
  "Drogas vasoativas — cálculo de dose": "Fármacos vasoactivos — cálculo de dosis",
  "Anafilaxia (WAO 2021)": "Anafilaxia (WAO 2021)",

  // ══ Explore / navegação ═══════════════════════════════════════════════════
  "EMERGÊNCIA CLÍNICA": "EMERGENCIA CLÍNICA",
  "RECURSOS": "RECURSOS",
  "Mais recursos": "Más recursos",
  "Acesse histórico de sessões e informações sobre o app. A lista de módulos está na tela principal.":
    "Acceda al historial de sesiones y a la información sobre la app. La lista de módulos está en la pantalla principal.",
  "Histórico clínico": "Historial clínico",
  "Revise sessões anteriores — duração, desfechos, choques, medicações e registros.":
    "Revise las sesiones anteriores — duración, desenlaces, descargas, medicación y registros.",
  "Sobre este aplicativo": "Acerca de esta aplicación",
  "Desbloquear plano Pro": "Desbloquear el plan Pro",
  "Plano Pro ativo": "Plan Pro activo",
  "Ver planos →": "Ver los planes →",
  "Abrir →": "Abrir →",
  "ATIVO": "ACTIVO",
  "Simular Pro": "Simular Pro",
  "Revogar Pro": "Revocar Pro",
  "← Módulos": "← Módulos",
  "Entrar no módulo →": "Entrar al módulo →",

  // ══ Política de privacidade ═══════════════════════════════════════════════
  "Política de Privacidade": "Política de privacidad",
  "App": "App",
  "19 de junho de 2026": "19 de junio de 2026",
  "1. Responsável pelos dados": "1. Responsable de los datos",
  "2. Dados que coletamos": "2. Datos que recopilamos",
  "3. Dados que NÃO coletamos": "3. Datos que NO recopilamos",
  "4. Finalidades e base legal": "4. Finalidades y base legal",
  "5. Armazenamento e processadores": "5. Almacenamiento y encargados del tratamiento",
  "6. Compartilhamento": "6. Comunicación de datos",
  "7. Seus direitos": "7. Sus derechos",
  "8. Retenção": "8. Conservación",
  "9. Crianças": "9. Menores de edad",
  "10. Segurança": "10. Seguridad",
  "11. Aviso médico": "11. Aviso médico",
  "12. Alterações desta política": "12. Cambios en esta política",
  "13. Contato": "13. Contacto",
  "Esta Política de Privacidade descreve como o aplicativo \"Clinical Emergency Suite\" (o \"App\") trata os dados de seus usuários. O App é uma ferramenta de apoio educacional e à decisão clínica, destinada a profissionais de saúde. Ao usar o App, você concorda com esta política.":
    "Esta política de privacidad describe cómo la aplicación «Clinical Emergency Suite» (la «App») trata los datos de sus usuarios. La App es una herramienta de apoyo educativo y a la decisión clínica, dirigida a profesionales de la salud. Al usar la App, usted acepta esta política.",
  "• Conta: e-mail, senha (armazenada de forma segura/criptografada pelo provedor de autenticação) e, opcionalmente, nome.":
    "• Cuenta: correo electrónico, contraseña (almacenada de forma segura y cifrada por el proveedor de autenticación) y, de forma opcional, el nombre.",
  "• Uso do App: registros de quando você inicia um caso/guia (qual módulo, data e hora) e seu último acesso, usados para acompanhamento e melhoria do App pelo administrador.":
    "• Uso de la App: registros de cuándo inicia un caso o una guía (qué módulo, fecha y hora) y su último acceso, usados por el administrador para el seguimiento y la mejora de la App.",
  "• Microfone / comandos de voz: quando você ativa os comandos de voz, o áudio é processado para reconhecimento de fala. No aplicativo nativo, esse reconhecimento é feito pelo serviço do sistema operacional (Apple ou Google). O App não armazena gravações de áudio.":
    "• Micrófono / comandos de voz: cuando activa los comandos de voz, el audio se procesa para el reconocimiento del habla. En la aplicación nativa, ese reconocimiento lo realiza el servicio del sistema operativo (Apple o Google). La App no almacena grabaciones de audio.",
  "• Avaliações: se você optar por avaliar o App, guardamos a nota (1–5) e o comentário enviado, associados à sua conta.":
    "• Valoraciones: si decide valorar la App, guardamos la puntuación (1–5) y el comentario enviado, asociados a su cuenta.",
  "O App não solicita nem armazena dados que identifiquem pacientes. Os registros clínicos referem-se a cenários de treino/decisão e não são vinculados à identidade de nenhum paciente real.":
    "La App no solicita ni almacena datos que identifiquen a pacientes. Los registros clínicos se refieren a escenarios de entrenamiento o de decisión y no están vinculados a la identidad de ningún paciente real.",
  "Usamos os dados para: autenticar e controlar o acesso, viabilizar o funcionamento do App, acompanhar o uso de forma agregada, responder a suporte e melhorar o produto. O tratamento baseia-se na execução do serviço solicitado por você e no legítimo interesse de operar e aprimorar o App, conforme a LGPD (Lei nº 13.709/2018) e legislações aplicáveis.":
    "Usamos los datos para: autenticar y controlar el acceso, permitir el funcionamiento de la App, seguir el uso de forma agregada, responder al soporte y mejorar el producto. El tratamiento se basa en la ejecución del servicio que usted solicitó y en el interés legítimo de operar y mejorar la App, conforme a la LGPD (Ley n.º 13.709/2018) y a la legislación aplicable.",
  "Os dados são armazenados em infraestrutura do provedor Supabase, que atua como operador, em servidores que podem estar localizados fora do Brasil. O reconhecimento de voz, quando usado, é processado pelos serviços de fala da Apple ou do Google, conforme a plataforma.":
    "Los datos se almacenan en la infraestructura del proveedor Supabase, que actúa como encargado del tratamiento, en servidores que pueden estar ubicados fuera de Brasil. El reconocimiento de voz, cuando se usa, lo procesan los servicios de habla de Apple o de Google, según la plataforma.",
  "Não vendemos seus dados. Compartilhamos dados apenas com os processadores estritamente necessários ao funcionamento, ou quando exigido por lei.":
    "No vendemos sus datos. Solo los comunicamos a los encargados del tratamiento estrictamente necesarios para el funcionamiento, o cuando lo exige la ley.",
  "Mantemos os dados pelo tempo necessário às finalidades acima ou enquanto sua conta estiver ativa. Você pode pedir a exclusão a qualquer momento.":
    "Conservamos los datos durante el tiempo necesario para las finalidades anteriores o mientras su cuenta esté activa. Puede solicitar su eliminación en cualquier momento.",
  "O App destina-se a profissionais de saúde e não se dirige a menores de idade. Não coletamos intencionalmente dados de crianças.":
    "La App está destinada a profesionales de la salud y no se dirige a menores de edad. No recopilamos intencionalmente datos de menores.",
  "Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados (autenticação, controle de acesso e criptografia em trânsito). Nenhum método é 100% seguro, mas trabalhamos para reduzir riscos.":
    "Adoptamos medidas técnicas y organizativas razonables para proteger los datos (autenticación, control de acceso y cifrado en tránsito). Ningún método es 100% seguro, pero trabajamos para reducir los riesgos.",
  "O App é uma ferramenta de apoio educacional e à decisão clínica, baseada em diretrizes (ex.: AHA ACLS, SBEM). Não substitui o julgamento clínico nem a avaliação individual do paciente. A conduta e a responsabilidade pelo atendimento são sempre do profissional de saúde assistente.":
    "La App es una herramienta de apoyo educativo y a la decisión clínica, basada en guías (p. ej., AHA ACLS, SBEM). No sustituye el juicio clínico ni la evaluación individual del paciente. La conducta y la responsabilidad de la atención son siempre del profesional de la salud tratante.",
  "Podemos atualizar esta política periodicamente. A data da última atualização é indicada no topo. Mudanças relevantes serão comunicadas no App ou por e-mail.":
    "Podemos actualizar esta política periódicamente. La fecha de la última actualización se indica arriba. Los cambios relevantes se comunicarán en la App o por correo electrónico.",

  // ══ Painel de administração ═══════════════════════════════════════════════
  "Painel de administração": "Panel de administración",
  "Utilizadores": "Usuarios",
  "A carregar utilizadores…": "Cargando los usuarios…",
  "A atualizar…": "Actualizando…",
  "Erro ao carregar": "Error al cargar",
  "Tentar novamente": "Intentar de nuevo",
  "Nenhum utilizador encontrado.": "No se encontró ningún usuario.",
  "Total": "Total",
  "Ativos": "Activos",
  "Pendentes": "Pendientes",
  "Bloqueados": "Bloqueados",
  "Pagos": "Pagados",
  "Perfil": "Perfil",
  "Pagamento": "Pago",
  "Criado": "Creado",
  "Último acesso": "Último acceso",
  "Pago ✓": "Pagado ✓",
  "Não pago": "No pagado",
  "$ Marcar pago": "$ Marcar como pagado",
  "$ Marcar não pago": "$ Marcar como no pagado",
  "↑ Tornar admin": "↑ Hacer administrador",
  "↓ Remover admin": "↓ Quitar administrador",
  "✓ Liberar": "✓ Habilitar",
  "✕ Bloquear": "✕ Bloquear",
  "⏸ Pendente": "⏸ Pendiente",
};
