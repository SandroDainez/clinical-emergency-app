import ModuleIntroScreen from "./module-intro-screen";

type Props = { onAccept: () => void };

export default function AnafilaxiaConsentScreen({ onAccept }: Props) {
  return (
    <ModuleIntroScreen
      badge="Emergência alérgica"
      title="Anafilaxia e choque anafilático"
      subtitle="Registe o gatilho, manifestações e o que foi administrado. O assistente calcula a dose de adrenalina IM por peso e lembra a ordem correta do tratamento."
      features={[
        { icon: "⚡", text: "Dose de adrenalina IM guiada por peso" },
        { icon: "🫁", text: "Encaminhamento rápido para via aérea e ventilação quando necessário" },
        { icon: "💉", text: "Apoio para adrenalina EV e vasoativos nos casos refratários" },
      ]}
      disclaimer="Ferramenta de apoio à decisão clínica. Ajuste a conduta ao protocolo institucional e à evolução do paciente."
      actionLabel="Iniciar atendimento"
      actionHint="Abrir fluxo de anafilaxia"
      onAccept={onAccept}
    />
  );
}
