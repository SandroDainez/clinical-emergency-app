/**
 * Componentes base da UI 2.0.
 *
 * Todos consomem os tokens de `design-system/` e funcionam nos dois temas.
 * Nenhum deles conhece engine, rota ou estado clínico: recebem dados por props e
 * devolvem eventos. É essa fronteira que permite repaginar o app sem tocar na
 * lógica.
 *
 * Os componentes ANTIGOS continuam no lugar. A troca é tela a tela, atrás da
 * flag `UI_V2` (lib/ui-v2-flag.ts), e a remoção dos antigos é a Fase 9.
 */
export { Badge, type BadgeProps, type TomSemantico } from "./badge";
export { BottomNavigation, type BottomNavigationProps, type ItemNavegacao } from "./bottom-navigation";
export { BottomSheet, type BottomSheetProps } from "./bottom-sheet";
export { Button, type ButtonProps, type ButtonVariant } from "./button";
export { Card, type CardProps } from "./card";
export {
  CalculatorScreenHeader,
  type CalculatorScreenHeaderProps,
} from "./calculator-screen-header";
export {
  CategoricalSelector,
  type CategoricalSelectorOption,
  type CategoricalSelectorProps,
} from "./categorical-selector";
export { Chip, type ChipProps } from "./chip";
export {
  ClinicalCockpitBar,
  type ClinicalCockpitBarProps,
  type CockpitMetric,
} from "./clinical-cockpit-bar";
export {
  ClinicalObservationChip,
  type ClinicalObservationChipProps,
} from "./clinical-observation-chip";
export {
  ClinicalShellChrome,
  type ClinicalShellChromeProps,
} from "./clinical-shell-chrome";
export {
  ClinicalShellHost,
  type ClinicalShellHostProps,
} from "./clinical-shell-host";
export {
  CrisisActionBar,
  type CrisisAction,
  type CrisisActionBarProps,
} from "./crisis-action-bar";
export {
  DecisionPrompt,
  type DecisionPromptOption,
  type DecisionPromptProps,
} from "./decision-prompt";
export { FloatingButton, type FloatingButtonProps } from "./floating-button";
export {
  GuidedDiscoveryCard,
  type GuidedDiscoveryCardProps,
  type GuidedDiscoveryVisualStep,
} from "./guided-discovery-card";
export { Header, type HeaderProps } from "./header";
export { Input, type InputProps } from "./input";
export { Modal, type ModalProps } from "./modal";
export { NumericStepper, type NumericStepperProps } from "./numeric-stepper";
export { Progress, type ProgressProps } from "./progress";
export {
  ReassessmentCard,
  type ReassessmentCardProps,
  type ReassessmentOutcome,
} from "./reassessment-card";
export {
  SafetyGate,
  type SafetyGateProps,
} from "./safety-gate";
export {
  InstrucaoResumida,
  ScreenTemplate,
  type ScreenTemplateProps,
} from "./screen-template";
export { Switch, type SwitchProps } from "./switch";
export { Tag, type TagProps } from "./tag";
export { Timer, formatarTempo, type TimerProps } from "./timer";
export {
  TrackingPanel,
  type ItemDeAcompanhamento,
  type TrackingPanelProps,
} from "./tracking-panel";
export { Toast, type ToastProps } from "./toast";
