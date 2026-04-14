import ModuleIntroScreen from "./module-intro-screen";

type EapConsentScreenProps = {
  onAccept: () => void;
};

export default function EapConsentScreen({ onAccept }: EapConsentScreenProps) {
  return (
    <ModuleIntroScreen
      badge="Edema agudo de pulmão"
      title="Roteiro resumido"
      subtitle="Atendimento de ciclo curto: quadro clínico, tratamento imediato (O₂, VMNI, vasodilatador, diurético) e destino. PAM e SpO₂/FiO₂ calculados automaticamente."
      features={[
        { icon: "🫁", text: "Formulário enxuto com barra lateral em 4 etapas" },
        { icon: "📊", text: "Cálculo de PAM e relação SpO₂/FiO₂" },
        { icon: "💡", text: "Sugestões de conduta conforme pressão e oxigenação" },
      ]}
      disclaimer="Ferramenta de apoio à decisão clínica. Não substitui protocolo institucional nem julgamento médico."
      actionLabel="Iniciar atendimento"
      actionHint="Abrir roteiro de EAP"
      onAccept={onAccept}
    />
  );
}
