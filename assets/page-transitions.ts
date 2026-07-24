import { ITransitionData, IViewData } from "@barba/core";
import { _Product_hydrated } from "./types";
import { delay } from "./utils";

export type RouterStore = {
  template: string;
  pathname: string;
  setValue: (key: keyof RouterStore, value: string | boolean) => void;
};

declare module "alpinejs" {
  interface Magics<T> {
    $router: RouterStore;
  }
}
const startTime = Date.now();

let initialized = false;
let firstRender = true;

export const initPageTransitions = () => {
  if (initialized) return;
  const rootContainer = document.querySelector("[data-content-root]");

  const scrollToTarget = () => {
    if (window.location.hash) {
      const target = document?.querySelector<HTMLElement>(window.location.hash);
      if (!target) return;

      if (
        utils.isElementScrollable(target.parentElement) &&
        utils.isVisible(target.parentElement) &&
        utils.isInViewport(target)
      ) {
        if (target.parentElement.scrollWidth > target.parentElement.offsetWidth) {
          utils.scrollToXY(
            260,
            target.offsetLeft,
            target.parentElement?.scrollTop,
            target.parentElement
          );
        }
        if (target.parentElement.scrollHeight > target.parentElement.offsetHeight) {
          utils.scrollToXY(
            260,
            target.parentElement?.scrollLeft,
            target.offsetTop,
            target.parentElement
          );
        }

        return;
      }

      const targetPosition =
        utils.getElementPosition(target)?.top -
        Math.max(
          0,
          document.querySelector<HTMLElement>(".header-sections-container")?.getBoundingClientRect()
            ?.bottom ?? 0
        );
      utils.scrollToY(
        260 + Math.abs(Math.round((window.scrollY - targetPosition) / 15)),
        targetPosition
      );
    }
  };

  window.Alpine.store("router", {
    pathname: rootContainer.getAttribute("data-pathname"),
    template: rootContainer.getAttribute("data-template"),
    setValue(key: keyof typeof this, value: string | boolean) {
      this[key] = value;
    },
  });

  const routerStore = window.Alpine.store("router") as RouterStore;

  window.Alpine.magic("router", () => routerStore);
  window._stores["router"] = routerStore;

  window.Alpine.effect(() => {
    // console.log(routerStore.pathname, "!@#@!#!@#");
  });

  if (window.design_mode || !window.theme_settings.layout__page_transitions) {
    // @ts-ignore
    barba.go = (href: string) => {
      if (typeof href === "string" && window.location.href !== href) {
        window.location.href = href;
      }
    };
    barba.prefetch = () => {};
  }

  barba.use(barbaPrefetch, {
    root: document.body,
    timeout: 4000,
    /* @ts-ignore */
    limit: 0,
  });

  // Background prefetch is best-effort. On slow / data-saver connections the 4s
  // fetch cap aborts most prefetches and Barba throws a "Fetch error" for each
  // one (Noibu issue #12). Wrap prefetch so those rejections never bubble up,
  // and skip prefetching entirely where it is most likely to fail or waste data.
  const _barbaPrefetch = barba.prefetch?.bind(barba);
  barba.prefetch = (href: string) => {
    if (window.design_mode) return;
    // @ts-ignore - navigator.connection is not in the TS lib but exists on Chromium.
    const conn = navigator.connection;
    if (conn && (conn.saveData || /(^|-)(slow-2g|2g)$/.test(conn.effectiveType || ""))) {
      return;
    }
    try {
      const res = _barbaPrefetch?.(href);
      if (res && typeof (res as Promise<unknown>).catch === "function") {
        (res as Promise<unknown>).catch(() => {});
      }
      return res;
    } catch (_e) {
      return;
    }
  };

  /*
   barba.prefetch = (href) => {
    return barba.prefetch(href);
  };
*/
  document.addEventListener("barba:prefetch:fulfilled", async (e: CustomEvent) => {
    if (typeof idbKeyval !== "undefined" && !window.design_mode) {
      requestIdleCallback(
        async () => {
          const url = e.detail.url?.replace(/(\/collections\/[^/]*\/)/gi, "/");

          // The entry was cached under the original (pre-rewrite) URL, so this
          // lookup is frequently a miss — bail instead of dereferencing undefined.
          const entry = barba.cache?.get(url);
          if (!entry?.request) return;

          const fetchResults = await entry.request.then((res) => ({
            data: res as unknown as { html: string },
          }));

          const div = document.createElement("div");
          div.innerHTML = fetchResults?.data?.html;
          const productData = div.querySelectorAll(`[data-product-data]`);

          productData?.forEach(async (scriptElement) => {
            const product = utils.JSONParse<_Product_hydrated>(scriptElement.innerHTML);
            if (product?.handle) {
              const dbKey = `_${window.Shopify.theme.id}--${product.handle}`;
              _products[product.handle] = {
                recommendations_loaded_at: 0,
                related_products: [],
                complementary_products: [],
                ...((await idbKeyval?.get(dbKey)) || {}),
                ...(_products[product.handle] ?? {}),
                ...product,
                updated_at: Date.now(),
              };
              await idbKeyval.set(dbKey, _products[product.handle]);
            }
          });

          await idbKeyval.set(`barba-prefetch---${startTime}-//-${url}`, fetchResults);
        },
        { timeout: 3000 }
      );
    }
  });

  if (typeof idbKeyval !== "undefined" && window.theme_settings && !window.design_mode) {
    idbKeyval
      .keys()
      .then(async (res) => {
        res.forEach(async (key: string) => {
          const [timestamp, cacheKey] = key.replace("barba-prefetch---", "").split("-//-");
          if (cacheKey && +timestamp > Date.now() - 1000 * 60 * 10) {
            barba.cache.set(
              cacheKey,
              idbKeyval.get(key).then((res) => res.data),
              "prefetch"
            );
          } else if (cacheKey && +timestamp > 0) {
            idbKeyval.del(key);
          }
        });
        await delay(100);
        barba.timeout = window.origin.includes("127.0.0.1") ? 30000 : 4000;
      })
      .catch(async (err) => {
        await delay(100);
        barba.timeout = window.origin.includes("127.0.0.1") ? 30000 : 4000;
      });
  }

  const transitionOverlay = document.querySelector("[data-transition-overlay]");
  barba.init({
    prefetchIgnore: [
      "/challenge",
      "/gift_cards",
      "/search",
      "/account",
      "/account/:any",
      "/customer_identity",
      "/customer_identity/:any",
      "/apps",
      "/apps/:any",
      "/pages/about-us",
      "/products/:any",
    ],
    cacheIgnore: [
      "/challenge",
      "/gift_cards",
      "/search",
      "/account",
      "/account/:any",
      "/customer_identity",
      "/customer_identity/:any",
      "/apps",
      "/apps/:any",
      "/pages/about-us",
      "/products/:any",
    ],
    debug: false,
    /* @ts-ignore */
    cacheFirstPage: true,
    timeout: window.origin.includes("127.0.0.1") ? 30000 : 4000, // default is 2000ms,
    transitions: [
      {
        name: "opacity-transition",
        leave: (data) => {
          transitionOverlay?.classList.add("active", "out-active");
        },
        enter: (data) => {
          const handleTransitionend = () => {
            transitionOverlay?.classList.remove("out-active");
            transitionOverlay?.removeEventListener("transitionend", handleTransitionend);
          };
          transitionOverlay?.classList.remove("active");
          transitionOverlay?.addEventListener("transitionend", handleTransitionend);
          window.scrollTo({
            top: 0,
            behavior: "instant",
          });
        },
      },
    ],
    views: [
      {
        beforeLeave: (data: IViewData) => {
          console.debug("beforeLeave", data);
          window._stores?.modal?.setId("");
          // window.Alpine.destroyTree(data.current.container);
        },
        namespace: "tmp",
        afterLeave(data: IViewData) {
          console.debug("afterLeave", data);

          routerStore.setValue(
            "pathname",
            window.location.pathname /*data.next.container.getAttribute("data-pathname")*/
          );
          if (!data?.next?.container) {
            return;
          }
          routerStore.setValue("template", data?.next?.container?.getAttribute("data-template"));
        },
        beforeEnter: (data) => {
          console.debug("beforeEnter", data);
        },
        afterEnter: (data) => {
          console.debug("afterEnter", data);

          // console.clear();
          data?.current?.container?.remove();
          window._stores["quickView"].open = false;
          window._stores?.modal?.setId("");
          const productDataContainer = data.next.container?.querySelector(
            "[data-product-data-init]"
          );

          if (productDataContainer) {
            const newScriptTag = document.createElement("script");
            newScriptTag.innerHTML = productDataContainer.innerText;
            newScriptTag.setAttribute("data-product-data-init", "");

            document.head.appendChild(newScriptTag);
          }

          if (data?.next?.container && !firstRender) {
            utils.delay(60).then(() => {
              scrollToTarget();

              const html = document.createElement("html");
              html.innerHTML = data.next?.html;

              html.querySelectorAll(".shopify-block.shopify-app-block").forEach((element) => {
                const currentElement = document.getElementById(element.id);
                currentElement.parentNode.replaceChild(element, currentElement);
              });

              html
                .querySelectorAll<HTMLScriptElement>(":not([data-content-root]) script[src]")
                .forEach((scriptElement) => {
                  const existingScript = document.head.querySelector(
                    `script[src*="${scriptElement.src.split("?")[0]?.split("/").at(-1)}"]`
                  );

                  if (!existingScript) {
                    const newScriptTag = document.createElement("script");
                    scriptElement.getAttributeNames().forEach((name) => {
                      newScriptTag.setAttribute(name, scriptElement.getAttribute(name));
                    });
                    newScriptTag.defer = true;
                    document.head.appendChild(newScriptTag);
                    // console.log(barba.cache, "barba.cache", scriptElement.src);
                  }
                });

              document
                .querySelectorAll<HTMLScriptElement>(
                  "[data-content-root] script:not(script[src][data-product-data][type='application/json'])"
                )
                .forEach((scriptElement) => {
                  const newScriptTag = document.createElement("script");
                  newScriptTag.innerHTML = scriptElement.innerHTML;
                  scriptElement.getAttributeNames().forEach((name) => {
                    newScriptTag.setAttribute(name, scriptElement.getAttribute(name));
                  });
                  scriptElement.parentNode.replaceChild(newScriptTag, scriptElement);
                });

              document
                .querySelectorAll<HTMLScriptElement>("[data-content-root] script[src]")
                .forEach((scriptElement) => {
                  const newScriptTag = document.createElement("script");
                  scriptElement.getAttributeNames().forEach((name) => {
                    newScriptTag.setAttribute(name, scriptElement.getAttribute(name));
                  });
                  newScriptTag.defer = true;
                  scriptElement.parentNode.replaceChild(newScriptTag, scriptElement);
                });
            });
          }

          document.dispatchEvent(new Event("DOMContentLoaded"));
          window.dispatchEvent(new Event("DOMContentLoaded"));
          document.dispatchEvent(new CustomEvent("pageFullyLoaded", {}));
          firstRender = false;
          Shopify?.PaymentButton?.init();
          window?.okeWidgetApi?.initAllWidgets();
          window?.yotpoWidgetsContainer?.initWidgets();

          setTimeout(() => {
            window?.okeWidgetApi?.initAllWidgets();
          }, 1000);

          setTimeout(() => {
            window?.okeWidgetApi?.initAllWidgets();
          }, 3000);
        },
      },
    ],
  });

  barba.timeout = 1;

  initialized = true;
};
