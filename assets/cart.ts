import { ModalCartDrawerBlocksGift_with_purchase, ModalCartDrawerBlocksUpsellProducts } from "../@types/sections";
import { _Product_hydrated, CartError, CartJson, CartJsonChanges } from "./types";
import { formatMoney } from "./utils";

export type CartStore = {
  state: CartJson;
  loading: boolean;
  isChanging: boolean;
  debounce_updates: number[];
  history: CartJson[];
  upsell_products: _Product_hydrated[];
  gift_products: _Product_hydrated[];
};

export type CartActions = ReturnType<typeof initCart>;

/* TODO: Figure out common error codes and add a TOAST based notificaiton system for issues.
 * 400 Bad request - Message: "Required parameter missing or invalid: 'line' or 'id' param is required"
 * 422
 * 429
 *  */

export const initCart = () => {
  window.Alpine.store("cart", {
    history: [structuredClone(window._cart_data)],
    state: {
      ...window._cart_data,
      items: window._cart_data?.items.map((item, index) => ({ ...item, index })) ?? [],
    },
    upsell_products: [] as _Product_hydrated[],
    gift_products: [] as _Product_hydrated[],
    loading: false,
    isChanging: false,
    debounce_updates: [] as number[],
  });
  const cart = window.Alpine.store("cart") as CartStore;
  window.Alpine.magic("cart", () => cart);
  window._stores["cart"] = cart;
  window._cart_data = cart.state;

  const get = async (): Promise<CartJson> => {
    const data = (await fetch("/cart.js")
      .then((res) => res.json())
      .catch((e) => {
        _stores.toast.addToast({
          type: "error",
          target: "cart",
          title: "Cart Error",
          content: e.statusMessage,
        });
        cart.isChanging = false;
        return window._stores["cart"].state;
      })) as CartJson | CartError;

    if ("status" in data) {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: data.message,
        content: data.description,
      });
      cart.isChanging = false;
      return window._stores["cart"].state;
    }

    cart.state = {
      ...data,
      items: data?.items.map((item, index) => ({ ...item, index })) ?? [],
      item_count: data.items
        ?.filter((item) => !item?.properties?._p_id_link)
        ?.reduce((acc, item) => (acc += item.quantity), 0),
    };
    cart.history.unshift(structuredClone(data));
    if (cart.history.length > 5) {
      cart.history.pop();
    }
    cart.isChanging = false;
    return data;
  };

  const add = async (cartItems: {
    items: {
      id: number | string;
      quantity: number;
      properties?: {
        [T: string]: string;
      };
      selling_plan?: number;
    }[];
    attributes?: {
      [T: string]: string;
    };
  }): Promise<CartJson & { cart_error?: boolean }> => {
    cart.isChanging = true;
    const data = (await fetch("/cart/add.js", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartItems),
    })
      .then((res) => res.json())
      .catch(async (e) => {
        _stores.toast.addToast({
          type: "error",
          target: "cart",
          title: "Cart Error",
          content: e.statusMessage,
        });
        return {
          ...(await get()),
          cart_error: true,
        };
      })) as { items: CartJson["items"] } | CartError;

    if ("status" in data) {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: data.message,
        content: data.description,
      });
      return {
        ...(await get()),
        cart_error: true,
      };
    }

    document.dispatchEvent(new CustomEvent("productAddedToCart", { detail: cartItems }));

    return await get();
  };

  const update = async (updates: {
    updates: { [T: string | number]: number } | number[];
    attributes?: {
      [T: string]: string;
    };
  }): Promise<CartJson> => {
    cart.isChanging = true;
    const data = (await fetch("/cart/update.js", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })
      .then((res) => res.json())
      .catch(async (e) => {
        _stores.toast.addToast({
          type: "error",
          target: "cart",
          title: "Cart Error",
          content: e.statusMessage,
        });

        return await get();
      })) as CartJson | CartError;

    if ("status" in data) {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: data.message,
        content: data.description,
      });
      return await get();
    }

    cart.state = {
      ...data,
      items: data?.items.map((item, index) => ({ ...item, index })) ?? [],
      item_count: data.items
        ?.filter((item) => !item?.properties?._p_id_link)
        ?.reduce((acc, item) => (acc += item.quantity), 0),
    };
    cart.history.unshift(structuredClone(data));
    if (cart.history.length > 5) {
      cart.history.pop();
    }

    cart.isChanging = false;
    return {
      ...data,
      items: data?.items.map((item, index) => ({ ...item, index })) ?? [],
    };
  };

  const change = async (
    cartItem:
      | {
          id: number | string;
          quantity: number;
          properties?: {
            [T: string]: string;
          };
          selling_plan?: number;
        }
      | {
          /* This is Index-1 Based (....Shopify Shenanigans ) */
          line: number;
          quantity: number;
          properties?: {
            [T: string]: string;
          };
          selling_plan?: number;
        }
  ): Promise<CartJson> => {
    cart.isChanging = true;
    const data = (await fetch("/cart/change.js", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartItem),
    })
      .then((res) => res.json())
      .catch(async (e) => {
        _stores.toast.addToast({
          type: "error",
          target: "cart",
          title: "Cart Error",
          content: e.statusMessage,
        });
        return await get();
      })) as (CartJson & CartJsonChanges) | CartError;

    if ("status" in data) {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: data.message,
        content: data.description,
      });
      return await get();
    }

    const { items_added, items_removed, ...cart_data } = data;

    cart.state = {
      ...cart_data,
      items: cart_data?.items.map((item, index) => ({ ...item, index })) ?? [],
      item_count: data.items
        ?.filter((item) => !item?.properties?._p_id_link)
        ?.reduce((acc, item) => (acc += item.quantity), 0),
    };
    cart.history.unshift(structuredClone(cart_data));
    if (cart.history.length > 5) {
      cart.history.pop();
    }
    cart.isChanging = false;
    return {
      ...cart_data,
      items: cart_data?.items.map((item, index) => ({ ...item, index })) ?? [],
    };
  };

  const clear = async (): Promise<CartJson> => {
    const data = (await fetch("/cart/clear.js", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .catch(async (e) => {
        _stores.toast.addToast({
          type: "error",
          target: "cart",
          title: "Cart Error",
          content: e.statusMessage,
        });
        return await get();
      })) as CartJson | CartError;

    if ("status" in data) {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: data.message,
        content: data.description,
      });
      return await get();
    }

    cart.state = {
      ...data,
      items: data?.items.map((item, index) => ({ ...item, index })) ?? [],
      item_count: data.items
        ?.filter((item) => !item?.properties?._p_id_link)
        ?.reduce((acc, item) => (acc += item.quantity), 0),
    };
    cart.history.unshift(structuredClone(data));
    if (cart.history.length > 5) {
      cart.history.pop();
    }
    cart.isChanging = false;
    return {
      ...data,
      items: data?.items.map((item, index) => ({ ...item, index })) ?? [],
    };
  };

  const showConditionally = (
    show_conditionally: "always" | "cart_empty" | "items_added" | undefined
  ) => {
    if (!show_conditionally) {
      return true;
    }

    switch (show_conditionally) {
      case "always": {
        return true;
      }
      case "cart_empty": {
        return !cart.state.item_count;
      }
      case "items_added": {
        return !!cart.state.item_count;
      }
    }
  };

  const updateLineItemQuantity = (quantity: number, index: number) => {
    if (
      !cart.state.items[index] ||
      cart.state.items[index]?.quantity === quantity ||
      cart.state.items.length !== _stores.cart?.history[0].items.length
    ) {
      return;
    }

    cart.state.items[index].quantity = Math.max(0, quantity);

    cart.state.item_count = cart.state.items
      ?.filter((item) => !item?.properties?._p_id_link)
      ?.reduce((acc, item) => (acc += item.quantity), 0);

    cart.state.total_price = cart.state.items.reduce(
      (acc, item) => (acc += item.price * item.quantity),
      0
    );
    cart.debounce_updates = cart.state.items.map((item) => item.quantity);
  };

  const renderUpsellProducts = async (
    element: HTMLElement,
    target_product: ModalCartDrawerBlocksUpsellProducts["settings"]["target_product"],
    primary_source: ModalCartDrawerBlocksUpsellProducts["settings"]["primary_source"],
    secondary_source: ModalCartDrawerBlocksUpsellProducts["settings"]["fallback_source"],
    product_class,
    limit
  ) => {
    const fallback_products = utils.JSONParse<_Product_hydrated[]>(
      element.getAttribute("data-fallback-products")
    );

    const lineItemProducts = await Promise.all(
      cart.state.items?.map((item) => _product.getHydratedProductData(item.handle, item.product_id))
    );

    const products = [];
    const complementary_products = [];
    const related_products = [];

    switch (target_product) {
      case "ai": {
        const expensive = [...cart.state.items]
          .sort((a, b) => b.final_price - a.final_price)
          .slice(0, 3);
        const recent = cart.state.items.slice(0, 2).sort((a, b) => b.final_price - a.final_price);

        [...recent, ...expensive]?.forEach((line, parentIndex) => {
          const product = lineItemProducts.find((p) => p.handle === line.handle);

          product?.complementary_products?.forEach((item, i) => {
            if (i >= 2 || (i >= 1 && parentIndex >= 2)) {
              return;
            }
            complementary_products.push(item);
          });
          product?.related_products?.forEach((item, i) => {
            if (i >= 2 || (i >= 1 && parentIndex >= 2)) {
              return;
            }
            related_products.push(item);
          });
        });
        break;
      }
      case "most_expensive": {
        [...cart.state.items]
          .sort((a, b) => b.final_price - a.final_price)
          ?.forEach((line, parentIndex) => {
            const product = lineItemProducts.find((p) => p.handle === line.handle);

            product?.complementary_products?.forEach((item, i) => {
              if (i >= 2 || (i >= 1 && parentIndex >= 2)) {
                return;
              }
              complementary_products.push(item);
            });
            product?.related_products?.forEach((item, i) => {
              if (i >= 2 || (i >= 1 && parentIndex >= 2)) {
                return;
              }
              related_products.push(item);
            });
          });
        break;
      }
      case "least_expensive": {
        [...cart.state.items]
          .sort((a, b) => a.final_price - b.final_price)
          ?.forEach((line, parentIndex) => {
            const product = lineItemProducts.find((p) => p.handle === line.handle);

            product?.complementary_products?.forEach((item, i) => {
              if (i >= 2 || (i >= 1 && parentIndex >= 2)) {
                return;
              }
              complementary_products.push(item);
            });
            product?.related_products?.forEach((item, i) => {
              if (i >= 2 || (i >= 1 && parentIndex >= 2)) {
                return;
              }
              related_products.push(item);
            });
          });
        break;
      }
      case "recently_added": {
        cart.state.items?.forEach((line, parentIndex) => {
          const product = lineItemProducts.find((p) => p.handle === line.handle);

          product?.complementary_products?.forEach((item, i) => {
            if (i >= 2 || (i >= 1 && parentIndex >= 2)) {
              return;
            }
            complementary_products.push(item);
          });
          product?.related_products?.forEach((item, i) => {
            if (i >= 2 || (i >= 1 && parentIndex >= 2)) {
              return;
            }
            related_products.push(item);
          });
        });
        break;
      }
    }

    switch (primary_source) {
      case "complementary": {
        complementary_products?.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "related": {
        related_products?.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "manual": {
        fallback_products.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
    }

    switch (secondary_source) {
      case "complementary": {
        complementary_products?.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "related": {
        related_products?.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "manual": {
        fallback_products.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
    }

    const renderProducts =
      products
        ?.filter((prod) => !cart.state.items.some((item) => item.product_id === prod.id))
        ?.filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i)
        ?.filter(
          (prod, index) =>
            prod.handle !== element.children?.[index]?.getAttribute("data-product-handle")
        )
        ?.slice(0, limit) ?? [];

    cart.upsell_products = renderProducts;
    if (!renderProducts.length) {
      return;
    }

    element.innerHTML = "";

    renderProducts.forEach((prod, i, arr) => {
      const div = document.createElement("div");
      div.classList.add("w-dynamic", "h-dynamic");
      const node = document
        .querySelector(`[data-product-card='${product_class}']`)
        ?.cloneNode(true) as HTMLElement;

      if (node) {
        node?.removeAttribute(`data-product-card`);
        node?.setAttribute("data-product-handle", prod.handle);
        node?.setAttribute("data-product-id", prod.id);
        node.querySelectorAll("[data-loop-item], [data-x-if], style").forEach((el) => {
          el.remove();
        });
        div.appendChild(node);
        element.appendChild(div);
        if (i + 1 < arr.length) {
          const div = document.createElement("div");
          div.setAttribute("data-style-divider", ``);
          element.appendChild(div);
        }
      }
    });
  };

  const renderGiftProducts = async (
    element: HTMLElement,
    target_type: ModalCartDrawerBlocksGift_with_purchase["settings"]["target_type"],
    target: ModalCartDrawerBlocksGift_with_purchase["settings"]["target"],
    receives_quantity: ModalCartDrawerBlocksGift_with_purchase["settings"]["receives_quantity"],
    allow_duplicates: ModalCartDrawerBlocksGift_with_purchase["settings"]["allow_duplicates"],
    product_class: ModalCartDrawerBlocksGift_with_purchase["settings"]["product_card_class"]
  ) => {
    const products = utils.JSONParse<_Product_hydrated[]>(
      element.getAttribute("data-gift-products")
    );

    cart.gift_products =
      cart.state[target_type] >= target &&
      cart?.state?.items?.reduce(
        (acc, lineItem) =>
          products.some((prod) => prod.id === lineItem.product_id)
            ? (acc += lineItem.quantity)
            : acc,
        0
      ) < receives_quantity
        ? products
            ?.filter(
              (prod) =>
                allow_duplicates || !cart.state.items.some((item) => item.product_id === prod.id)
            )
            ?.filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i)
            ?.filter(
              (prod, index) =>
                prod.handle !== element.children?.[index]?.getAttribute("data-product-handle")
            )
        : [];

    if (!cart.gift_products.length) {
      element.innerHTML = "";
      return;
    }

    element.innerHTML = "";

    cart.gift_products.forEach((prod, i, arr) => {
      const div = document.createElement("div");
      div.classList.add("w-dynamic", "h-dynamic");
      const node = document
        .querySelector(`[data-product-card='${product_class}']`)
        ?.cloneNode(true) as HTMLElement;

      if (node) {
        node?.removeAttribute(`data-product-card`);
        node?.setAttribute("data-product-handle", prod.handle);
        node?.setAttribute("data-product-id", `${prod.id}`);
        node.querySelectorAll("[data-loop-item], [data-x-if], style").forEach((el) => {
          el.remove();
        });
        div.appendChild(node);
        element.appendChild(div);
        if (i + 1 < arr.length) {
          const div = document.createElement("div");
          div.setAttribute("data-style-divider", ``);
          element.appendChild(div);
        }
      }
    });
  };

  const renderDynamicTextWithFormattedPrice = (content: string) => {
    return (
      content?.replace(/\[([^\]]*)\]/gi, (...matches) => {
        // @ts-ignore
        return matches?.[1]?.split(".").reduce<any>(
          (acc, selector) => {
            if (!selector || acc[0] === undefined || acc[0] === null) {
              if (/price$/gi.test(acc[1]) && typeof acc[0] === "number") {
                return [formatMoney(acc[0]), selector];
              }
              return acc;
            }

            if (acc[0] && selector in acc[0]) {
              if (/price$/gi.test(selector) && typeof acc[0][selector] === "number") {
                return [formatMoney(acc[0][selector]), selector];
              }
              return [acc[0][selector], selector];
            }
            return ["", ""];
          },
          [{ cart: cart.state }, ""]
        )[0];
      }) ?? ""
    );
  };

  const debounceCartUpdates = window.Alpine.debounce(async () => {
    const b = cart.history[0]?.items.map((item) => item.quantity);
    if (!utils.deepEqual(b, cart.debounce_updates) && cart.debounce_updates.length) {
      cart.loading = true;
      await update({ updates: cart.debounce_updates });
      cart.debounce_updates = [];
      cart.loading = false;
    }
  }, 650);

  window.Alpine.effect(() => {
    cart.state.item_count = cart.state.items
      ?.filter((item) => !item?.properties?._p_id_link)
      ?.reduce((acc, item) => (acc += item.quantity), 0);
    window._cart_data = cart.state;
  });

  window.Alpine.effect(() => {
    cart.state.original_pre_selling_plan_total_price = cart.state.items?.reduce((acc, item) => {
      acc +=
        item.quantity * (item?.selling_plan_allocation?.compare_at_price ?? item?.original_price);
      return acc;
    }, 0);
    cart.state.selling_plan_discount_applications = cart.state?.items?.reduce((acc, item) => {
      if (!item?.selling_plan_allocation?.selling_plan?.name) {
        return acc;
      }
      const index = acc.findIndex(
        (selling_plan) => selling_plan.name === item?.selling_plan_allocation?.selling_plan?.name
      );

      if (index !== -1) {
        acc[index].value +=
          (item?.selling_plan_allocation?.compare_at_price - item?.selling_plan_allocation?.price) *
          item?.quantity;
        return acc;
      }

      acc.push({
        name: item?.selling_plan_allocation?.selling_plan?.name,
        value:
          (item?.selling_plan_allocation?.compare_at_price - item?.selling_plan_allocation?.price) *
          item?.quantity,
      });

      return acc;
    }, []);
  });

  window.Alpine.effect(() => {
    if (cart.debounce_updates.length) {
      debounceCartUpdates();
    }
  });

  document.addEventListener("productAddedToCart", async (event: CustomEvent) => {
    const updatedCart = await get();
    if (typeof window._learnq !== "undefined") {
      const cartData = {
        total_price: updatedCart.total_price / 100,
        $value: updatedCart.total_price / 100,
        total_discount: updatedCart.total_discount,
        original_total_price: updatedCart.original_total_price / 100,
        items: updatedCart.items,
      };

      window._learnq.push(["track", "Added to Cart", cartData]);
    }
  });

  window._cart = {
    add,
    get,
    update,
    change,
    clear,
    showConditionally,
    updateLineItemQuantity,
    renderUpsellProducts,
    renderDynamicTextWithFormattedPrice,
    renderGiftProducts,
  };

  return {
    add,
    get,
    update,
    change,
    clear,
    showConditionally,
    updateLineItemQuantity,
    renderUpsellProducts,
    renderDynamicTextWithFormattedPrice,
    renderGiftProducts,
  };
};

declare module "alpinejs" {
  interface Magics<T> {
    $cart: CartStore;
  }
}
