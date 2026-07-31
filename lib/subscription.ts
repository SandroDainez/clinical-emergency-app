/**
 * Subscription tier definitions.
 *
 * FREE  → ACLS bundle (pcr-adulto + 7 reference sub-modules)
 * PRO   → all 15 modules
 *
 * TODO: Replace `activate` / `restore` stubs with RevenueCat SDK calls:
 *   import Purchases from 'react-native-purchases';
 *   const info = await Purchases.purchasePackage(pkg);
 *   const isPro = info.entitlements.active['pro'] !== undefined;
 */

export const FREE_MODULE_IDS: ReadonlySet<string> = new Set([
  "pcr-adulto",
  "ritmos-acls",
  "farmacologia-acls",
  "bradicardia-acls",
  "taquicardia-acls",
  "causas-reversiveis-acls",
  "pcr-gestacao-acls",
  "pos-pcr-acls",
]);

/**
 * DEV: destrava TODOS os módulos para revisão/desenvolvimento.
 * Mude para `false` antes de lançar para restaurar o tier FREE/PRO (paywall).
 */
export const UNLOCK_ALL_MODULES = true;

/** Returns true if the module is included in the free tier. */
export function isModuleFree(moduleId: string): boolean {
  if (UNLOCK_ALL_MODULES) return true;
  return FREE_MODULE_IDS.has(moduleId);
}

/** Product identifiers — swap these for your App Store / Play Store product IDs. */
export const PRODUCT_IDS = {
  monthly: "clinical_pro_monthly",
  annual: "clinical_pro_annual",
} as const;

/**
 * Preços exibidos na tela, por idioma.
 *
 * Só texto: quem cobra de fato é a App Store / Play Store pelo PRODUCT_IDS, e é
 * lá que o valor por país precisa bater com o que está aqui. Ao integrar o SDK
 * da loja, o preço deve vir dela (já vem localizado e com a moeda certa) e estas
 * tabelas viram só fallback.
 *
 * Os valores em dólar são a conversão aproximada do preço em reais, arredondada
 * para terminação comercial. A coerência interna é mantida de propósito:
 * 39,99 ÷ 12 ≈ 3,33/mês, e 3,33 sobre 5,99 dá os mesmos 44% de desconto do
 * plano brasileiro.
 */
export type ProductPrices = {
  /** Preço do plano mensal, já com o sufixo de período. */
  monthly: string;
  /** Preço cheio do plano anual. */
  annual: string;
  /** Plano anual diluído por mês — é o número em destaque no card. */
  annualMonthly: string;
  /** Desconto do anual sobre o mensal. */
  annualSaving: string;
};

const PRICES_BY_LOCALE: Record<"pt-BR" | "es-419", ProductPrices> = {
  "pt-BR": {
    monthly: "R$ 29,90/mês",
    annual: "R$ 199,90/ano",
    annualMonthly: "R$ 16,66/mês",
    annualSaving: "44% de desconto",
  },
  "es-419": {
    monthly: "US$ 5,99/mes",
    annual: "US$ 39,99/año",
    annualMonthly: "US$ 3,33/mes",
    annualSaving: "44% de descuento",
  },
};

/** Preços no idioma informado (o do render), com fallback para português. */
export function getProductPrices(locale: string): ProductPrices {
  return locale === "es-419" ? PRICES_BY_LOCALE["es-419"] : PRICES_BY_LOCALE["pt-BR"];
}

/**
 * Preços em português. Mantido para quem lê fora do render (sem acesso ao
 * locale); em componente, prefira getProductPrices(locale) — senão o valor fica
 * preso no idioma do build, o mesmo problema que já mordeu o tr("literal").
 */
export const PRODUCT_PRICES = PRICES_BY_LOCALE["pt-BR"];
