/**
 * ES — AVC · Paciente como FASE (briefing §3, decisão C3).
 *
 * ⚠️ Alergias viraram um bloco de seleção múltipla, e as classes de medicação
 * de uso contínuo entraram como contexto. ⛔ Nenhuma delas é lida por derivação
 * clínica — e a nota em espanhol precisa preservar exatamente isso.
 */
export const avcPacienteFaseEs: Record<string, string> = {
  "Alergias conhecidas": "Alergias conocidas",
  "Penicilina ou betalactâmicos": "Penicilina o betalactámicos",
  "Anti-inflamatório não esteroidal (AINE)": "Antiinflamatorio no esteroideo (AINE)",
  "Contraste iodado": "Contraste yodado",
  "Outras": "Otras",
  "O contraste iodado diz respeito apenas ao exame com contraste. Nenhuma delas interfere na trombólise.":
    "El contraste yodado concierne solo al examen con contraste. Ninguna de ellas interfiere en la trombólisis.",
  "Altura": "Altura",
  "Dado do paciente, guardado para o atendimento. Nenhuma recomendação do AVC depende dele.":
    "Dato del paciente, guardado para la atención. Ninguna recomendación del ACV depende de él.",
  "Registro do paciente. Nenhuma recomendação deste módulo é calculada a partir da altura.":
    "Registro del paciente. Ninguna recomendación de este módulo se calcula a partir de la altura.",
  "Outras medicações de uso contínuo": "Otros medicamentos de uso continuo",
  "Anti-hipertensivos": "Antihipertensivos",
  "Hipoglicemiantes orais": "Hipoglucemiantes orales",
  "Insulina": "Insulina",
  "Anticonvulsivantes": "Anticonvulsivantes",
  "Anticoagulantes e antiagregantes têm campo próprio acima, porque decidem conduta.":
    "Los anticoagulantes y antiagregantes tienen campo propio arriba, porque deciden conducta.",
  "Registro de contexto. Nenhuma recomendação deste módulo é calculada a partir destas classes.":
    "Registro de contexto. Ninguna recomendación de este módulo se calcula a partir de estas clases.",
};
