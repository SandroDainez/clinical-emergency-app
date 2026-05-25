import ModuleIntroScreen from "./module-intro-screen";

type Props = { onAccept: () => void };

export default function ElectrolyteConsentScreen({ onAccept }: Props) {
  return (
    <ModuleIntroScreen
      badge="Correções eletrolíticas"
      title="Calculadoras práticas para distúrbios hidroeletrolíticos"
      subtitle="Sódio, potássio, cálcio, magnésio, fósforo e cloro com resumo clínico, preparo, diluição, velocidade e equivalência prática em mL."
      features={[
        { icon: "🧮", text: "Cálculos úteis de correção com peso, alvo e estratégia de infusão" },
        { icon: "💉", text: "Dose acompanhada da apresentação prática do mercado em mL, g ou mEq" },
        { icon: "🩺", text: "Sinais clínicos, prioridades de atendimento e alertas de monitorização" },
      ]}
      disclaimer="Ferramenta de apoio clínico. Confirmar concentração disponível, função renal, acesso venoso, ECG e protocolo institucional antes de administrar qualquer reposição."
      actionLabel="Iniciar atendimento"
      actionHint="Abrir calculadora eletrolítica"
      onAccept={onAccept}
    />
  );
}
