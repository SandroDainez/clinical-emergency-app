import ModuleIntroScreen from "./module-intro-screen";

type Props = { onAccept: () => void };

export default function VasoactiveConsentScreen({ onAccept }: Props) {
  return (
    <ModuleIntroScreen
      badge="Drogas vasoativas"
      title="Preparo, concentração e taxa na bomba"
      subtitle="Calculadora prática para vasopressores e inotrópicos, com diluição, concentração final, dose e taxa convertidas em tempo real."
      features={[
        { icon: "🧮", text: "Cálculo bidirecional entre dose e taxa em mL/h" },
        { icon: "🧪", text: "Diluições recomendadas e diluições personalizadas do usuário" },
        { icon: "🎯", text: "Estratégia inicial e associações hemodinâmicas por droga" },
      ]}
      disclaimer="Ferramenta de apoio ao cálculo e preparo. Confirmar apresentação da ampola, concentração final e contexto hemodinâmico antes de administrar."
      actionLabel="Iniciar atendimento"
      actionHint="Abrir calculadora de vasoativos"
      onAccept={onAccept}
    />
  );
}
