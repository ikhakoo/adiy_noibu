import { _Product_hydrated } from "./types";

export type ProductDrawerStore = {
  open: boolean;
  product: _Product_hydrated;
  openProductDrawer: (input: { product: _Product_hydrated }) => void;
};
export const initProductDrawer = () => {
  window.Alpine.store("productDrawer", {
    open: false,
    product: _products[Object.keys(_products)[0]],
    openProductDrawer({ product = _products[Object.keys(_products)[0]] }) {
      this.product = product;
      this.open = true;
    },
  });

  const productDrawerStore = window.Alpine.store("productDrawer") as ProductDrawerStore;

  window.Alpine.magic("productDrawer", () => productDrawerStore);
  window._stores["productDrawer"] = productDrawerStore;
};
declare module "alpinejs" {
  interface Magics<T> {
    $productDrawer: ProductDrawerStore;
  }
}
