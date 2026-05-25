import ModuleIntroScreen from "./module-intro-screen";

type Props = { onAccept: () => void };

export default function RsiConsentScreen({ onAccept }: Props) {
  return (
    <ModuleIntroScreen
      badge="Via aérea avançada"
      title="ISR e intubação em sequência rápida"
      subtitle="Fluxo organizado para decisão prática: indicação, preparação, doses, passagem do tubo e plano de resgate."
      features={[
        { icon: "🫁", text: "Resumo do caso e prioridades de via aérea" },
        { icon: "💉", text: "Doses rápidas por peso para indução e bloqueio neuromuscular" },
        { icon: "🚨", text: "Fluxo operacional com falha de IOT e plano CICO" },
      ]}
      disclaimer="Ferramenta de apoio visual para via aérea crítica. Ajuste ao material disponível, à experiência da equipe e ao protocolo institucional."
      actionLabel="Iniciar atendimento"
      actionHint="Abrir fluxo de ISR"
      onAccept={onAccept}
    />
  );
}
