import { InitBundle } from "../sections/bundle/bundle";
import { InitProductCard } from "../sections/card_product-card/card_product-card";

export type QuickViewStore = {
  open: boolean;
  loading: boolean;
  handle: string;
  container: HTMLElement;
  show_all_container: HTMLElement;
  loading_container: HTMLElement;
  dynamic_popups: HTMLElement[];
  renderQuickView: (
    handle: string,
    $data?: ReturnType<InitBundle> & ReturnType<InitProductCard>,
    bundleButton?: HTMLElement,
    variantId?: number
  ) => Promise<void>;
};
export const initQuickView = () => {
  window.Alpine.store("quickView", {
    open: false,
    loading: false,
    handle: "",
    dynamic_popups: [],
    container: document.querySelector("[data-quick-view-container]"),
    show_all_container: document.querySelector("[data-quick-view-show-more]"),
    loading_container: document.querySelector("[data-quick-view-loading]"),

    async renderQuickView(handle: string, $data, bundleButton, variantId) {
      const container = this.container;
      this.handle = handle;
      this.open = true;

      this.loading_container.classList.remove("opacity-0", "pointer-events-none");
      if (!handle || !container) return;

      const cacheKey = `${window.location.origin}/products/${handle}`;

      let cache = barba.cache.get(cacheKey);

      if (!cache?.request) {
        const keys = await idbKeyval.keys();

        const key = keys.find((key: string) => key.includes(cacheKey));

        if (key) {
          cache = barba.cache.set(
            cacheKey,
            idbKeyval?.get(key)?.then((res) => res?.data),
            "prefetch"
          );
        }
      }

      if (!cache?.request) {
        const data = fetch(cacheKey, { cache: "force-cache" })
          .then((res) => res.text())
          .then((html) => ({
            html,
            url: { hash: undefined, href: cacheKey, path: `/products/${handle}` },
          }));

        // @ts-ignore
        cache = barba.cache.set(cacheKey, data, "prefetch");
        document.dispatchEvent(
          new CustomEvent("barba:prefetch:fulfilled", { detail: { url: cacheKey } })
        );
      }

      let request = await cache?.request;
      let html = (request as unknown as { html: string })?.html;
      if (!html) {
        const data = fetch(cacheKey, { cache: "force-cache" })
          .then((res) => res.text())
          .then((html) => ({
            html,
            url: { hash: undefined, href: cacheKey, path: `/products/${handle}` },
          }));

        // @ts-ignore
        cache = barba.cache.set(cacheKey, data, "prefetch");
        request = await cache?.request;
        html = (request as unknown as { html: string })?.html;
        document.dispatchEvent(
          new CustomEvent("barba:prefetch:fulfilled", { detail: { url: cacheKey } })
        );
      }

      const div = document.createElement("div");
      div.innerHTML = html;
      const productData = div.querySelector(`[data-product-data="${handle}"]`);
      div.querySelectorAll("[data-popup]").forEach((popup) => {
        document.body.appendChild(popup);
        this.dynamic_popups.push(popup);
      });
      const section = div.querySelector(`[data-content-root] [data-section-type="product"]`);
      const sideContent = section.querySelector<HTMLElement>('[x-ref="content"]');
      sideContent.classList.add("max-h-full", "overflow-y-auto");

      section.setAttribute("data-quick-view", "true");
      this.loading_container.classList.add("opacity-0", "pointer-events-none");
      container.innerHTML = productData.outerHTML + section?.outerHTML;

      const stateElement = container.querySelector('[data-section-type="product"]');

      if ($data && bundleButton && stateElement) {
        stateElement
          .querySelectorAll(
            '[data-block-type="quantity_selector"], [data-block-type="complementary_products"]'
          )
          .forEach((el) => {
            el.remove();
          });

        stateElement
          .querySelectorAll(`[data-block-type="add_to_cart_button"]`)
          .forEach((element) => {
            const clonedBundleButton = bundleButton.cloneNode(true);
            element.innerHTML = "";
            element.appendChild(clonedBundleButton);
          });

        Alpine.nextTick(() => {
          stateElement._x_dataStack?.forEach((proxyState) => {
            if (proxyState?.card && proxyState?.bundle && proxyState?.state) {
              proxyState.card = proxyState.state;
              proxyState.bundle = $data.bundle;
            }
          });
        });
      }

      if (variantId) {
        Alpine.nextTick(() => {
          stateElement._x_dataStack?.forEach((proxyState) => {
            if (proxyState?.state && proxyState.setSelectedVariant) {
              proxyState.setSelectedVariant(+variantId);
            }
          });
        });
      }

      this.show_all_container.innerHTML = `<button type="button" class="text-black" @click="$quickView.open = false; barba.go('${window.location.origin}/products/${handle}')">Show full details</a>`;
    },
  });

  const quickViewStore = window.Alpine.store("quickView") as QuickViewStore;

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      quickViewStore.open = false;
    }
  };

  window.Alpine.effect(() => {
    document.body.classList.toggle("!overflow-hidden", quickViewStore.open);

    if (quickViewStore.open) {
      document.addEventListener("keydown", handleKeydown);
    }
    if (!quickViewStore.open) {
      document.removeEventListener("keydown", handleKeydown);
      quickViewStore.dynamic_popups?.forEach((element) => {
        element.remove();
      });
      quickViewStore.dynamic_popups = [];
    }
  });
  window.Alpine.magic("quickView", () => quickViewStore);
  window._stores["quickView"] = quickViewStore;
};

declare module "alpinejs" {
  interface Magics<T> {
    $quickView: QuickViewStore;
  }
}
