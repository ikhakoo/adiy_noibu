var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initDynamicProductCards = /* @__PURE__ */ __name(($el, productHandle) => {
  const product = utils.JSONParse(document.querySelector(`[data-product-data="${productHandle}"]`).innerHTML);
  const state = window.Alpine.reactive({
    product
  });
  const renderDynamicProductCards = /* @__PURE__ */ __name(async (element, primary_source, secondary_source, product_class, desktop_display_limit, mobile_display_limit) => {
    const limit = Math.max(desktop_display_limit, mobile_display_limit);
    const fallback_products = utils.JSONParse(
      element.getAttribute("data-fallback-products")
    );
    const products = [];
    switch (primary_source) {
      case "complementary": {
        state.product?.complementary_products?.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "related": {
        state.product?.related_products?.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "recently_viewed": {
        const recent_products = await Promise.all(
          window?._recent_products?.map(
            ([handle, product_id]) => _product.getHydratedProductData(handle, product_id)
          )
        );
        recent_products.forEach((prod) => {
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
        state.product?.complementary_products?.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "related": {
        state.product?.related_products?.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "recently_viewed": {
        const recent_products = await Promise.all(
          _recent_products.map(
            ([handle, product_id]) => _product.getHydratedProductData(handle, product_id)
          )
        );
        recent_products.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "manual": {
        break;
      }
    }
    const renderProducts = products?.filter((prod) => prod && prod.id !== state.product.id)?.filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i)?.filter(
      (prod, index) => prod.handle !== element.children?.[index]?.getAttribute("data-product-handle")
    )?.slice(0, limit) ?? [];
    if (!renderProducts.length) {
      return;
    }
    element.innerHTML = "";
    renderProducts.forEach((prod, i, arr) => {
      const node = document.querySelector(`[data-product-card='${product_class}']`)?.cloneNode(true);
      if (node) {
        const div = document.createElement("div");
        div.setAttribute("data-product-handle", prod.handle);
        div.setAttribute(
          "class",
          `shrink-0 max-w-full w-full h-full ${i > desktop_display_limit ? "mobile-only" : i > mobile_display_limit ? "desktop-tablet-only" : ""}`
        );
        node?.removeAttribute(`data-product-card`);
        node?.setAttribute("data-product-handle", prod.handle);
        node?.setAttribute("data-product-id", prod.id);
        node.querySelectorAll("[data-loop-item], [data-x-if], style").forEach((el) => {
          el.remove();
        });
        div.appendChild(node);
        element.appendChild(div);
      }
    });
  }, "renderDynamicProductCards");
  _product.getHydratedProductData(product.handle, product.id).then((res) => {
    state.product = state.product.handle === res.handle ? res : state.product;
  });
  return {
    state,
    renderDynamicProductCards
  };
}, "initDynamicProductCards");
window._sections["initDynamicProductCards"] = initDynamicProductCards;
