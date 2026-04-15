import ModuleIntroScreen from "./module-intro-screen";

type SepsisConsentScreenProps = {
  onAccept: () => void;
};

export default function SepsisConsentScreen({ onAccept }: SepsisConsentScreenProps) {
  return (
    <ModuleIntroScreen
      badge="Módulo Sepse"
      title="Roteiro de atendimento"
      subtitle="Guia clínico completo para atendimento de suspeita de sepse no adulto. Preencha conforme examina o paciente — cálculos automáticos, ATB por toque."
      features={[
        { icon: "🩺", text: "Anamnese, exame físico e sinais vitais por toque" },
        { icon: "📊", text: "PAM, IMC e qSOFA calculados automaticamente" },
        { icon: "💊", text: "Sugestão de ATB empírico com dose ajustada ao perfil" },
        { icon: "🏥", text: "Encaminhamento: UTI, semi-intensiva, enfermaria" },
      ]}
      disclaimer="Ferramenta de apoio à decisão clínica. Não substitui o julgamento médico. A decisão final é do profissional assistente."
      actionLabel="Iniciar atendimento"
      actionHint="Abrir roteiro de sepse"
      onAccept={onAccept}
    />
  );
}
