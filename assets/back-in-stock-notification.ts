import { _Product_liquid, _Variant_liquid } from "types/shopify";

export type BackInStockNotificationStore = {
  open: boolean;
  product: _Product_liquid;
  selected_variant: _Variant_liquid;
  setSelectedVariant: (id: string) => void;
};

export const initBackInStockNotification = () => {
  window.Alpine.store("backInStockNotification", {
    open: false,
    product: null,
    selected_variant: null,
    setSelectedVariant(id: string) {
      this.selected_variant = this.product.variants?.find((variant) => variant.id === id);
    },
  });

  const backInStockNotificationStore = window.Alpine.store(
    "backInStockNotification"
  ) as BackInStockNotificationStore;
  window.Alpine.magic("backInStockNotification", () => backInStockNotificationStore);
  window._stores["backInStockNotification"] = backInStockNotificationStore;
};

declare module "alpinejs" {
  interface Magics<T> {
    $backInStockNotificationStore: BackInStockNotificationStore;
  }
}
