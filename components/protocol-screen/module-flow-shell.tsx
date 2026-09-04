// Compatibilidade: toda a implementação histórica permanece no arquivo legacy.
// A única exportação sobrescrita aqui é RailDeModulo, agora alinhada ao Clinical Cockpit.
export * from "./module-flow-shell-legacy";
export { RailDeModulo } from "./module-rail-cockpit";
