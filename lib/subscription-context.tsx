/**
 * Subscription context.
 *
 * Wraps the app with a provider that tracks whether the user has an active Pro
 * subscription.  The current implementation uses in-memory state (resets on
 * app restart) so that the UI can be fully built and tested without a native
 * IAP SDK.
 *
 * TODO: hydrate `isPremium` from RevenueCat on mount:
 *   const info = await Purchases.getCustomerInfo();
 *   setIsPremium(info.entitlements.active['pro'] !== undefined);
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type SubscriptionContextValue = {
  /** True when the user has an active Pro entitlement. */
  isPremium: boolean;
  /** True while a purchase / restore network call is in flight. */
  isLoading: boolean;
  /**
   * Initiate a purchase for the given product ID.
   * Returns `true` on success, `false` if the user cancelled or it failed.
   */
  purchase: (productId: string) => Promise<boolean>;
  /**
   * Restore previous purchases.
   * Returns `true` if a Pro entitlement was found and restored.
   */
  restore: () => Promise<boolean>;
  /** Internal — used by dev/admin tools to force-unlock premium. */
  _devUnlock: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue>({
  isPremium: false,
  isLoading: false,
  purchase: async () => false,
  restore: async () => false,
  _devUnlock: () => {},
});

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const purchase = useCallback(async (_productId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: replace with RevenueCat purchase flow
      // const info = await Purchases.purchaseProduct(_productId);
      // const active = info.customerInfo.entitlements.active["pro"] !== undefined;
      // setIsPremium(active);
      // return active;

      // Mock: simulate a network call, then succeed
      await new Promise<void>((res) => setTimeout(res, 1200));
      setIsPremium(true);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: replace with RevenueCat restore
      // const info = await Purchases.restorePurchases();
      // const active = info.entitlements.active["pro"] !== undefined;
      // setIsPremium(active);
      // return active;

      await new Promise<void>((res) => setTimeout(res, 1000));
      // Mock: no previous purchase found
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const _devUnlock = useCallback(() => setIsPremium((v) => !v), []);

  return (
    <SubscriptionContext.Provider
      value={{ isPremium, isLoading, purchase, restore, _devUnlock }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/** Consume the subscription state from any component. */
export function useSubscription(): SubscriptionContextValue {
  return useContext(SubscriptionContext);
}
