/**
 * Subscription tier definitions.
 *
 * FREE  → ACLS bundle (pcr-adulto + 6 reference sub-modules)
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
  "pos-pcr-acls",
]);

/** Returns true if the module is included in the free tier. */
export function isModuleFree(moduleId: string): boolean {
  return FREE_MODULE_IDS.has(moduleId);
}

/** Product identifiers — swap these for your App Store / Play Store product IDs. */
export const PRODUCT_IDS = {
  monthly: "clinical_pro_monthly",
  annual: "clinical_pro_annual",
} as const;

/** Pricing display strings — update when you integrate the store SDK. */
export const PRODUCT_PRICES = {
  monthly: "R$ 29,90/mês",
  annual: "R$ 199,90/ano",
  annualMonthly: "R$ 16,66/mês",
  annualSaving: "44% de desconto",
} as const;
