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
export { Chip, type ChipProps } from "./chip";
export { FloatingButton, type FloatingButtonProps } from "./floating-button";
export { Header, type HeaderProps } from "./header";
export { Input, type InputProps } from "./input";
export { Modal, type ModalProps } from "./modal";
export { NumericStepper, type NumericStepperProps } from "./numeric-stepper";
export { Progress, type ProgressProps } from "./progress";
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
