var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initProductCard = /* @__PURE__ */ __name(($el, $refs, productHandle, productId, variantId, default_select_selling_plan = false) => {
  const random_id = utils.shortUUID();
  const settings = utils.JSONParse(
    $el.getAttribute("data-settings")
  );
  const option_blocks = utils.JSONParse(
    $el.getAttribute("data-option-blocks")
  ) ?? [];
  const product = _products[productHandle];
  if (!product) {
    _product.getProductData(productHandle, productId).then((res) => {
      updateProductState(res);
    });
  }
  if (settings?.default_variant_metafield) {
    const [namespace, key] = settings.default_variant_metafield.trim().split(".");
    const variant = product?.metafields?.[namespace]?.[key];
    variantId = variant?.id ?? product?.selected_variant_id;
  }
  const selected_variant = product?.variants?.find((v) => v.id === variantId) || product?.variants?.find((v) => v.id === product.selected_variant_id) || product?.variants?.find(
    (v) => v.id && product.options_with_values?.every(
      (option, i) => _product.lastOptions[option?.name?.toLowerCase()] === v.options[i]
    )
  ) || product?.variants?.find(
    (v) => v.id && product.options_with_values.slice(0, product.options_with_values.length - 1)?.every((option, i) => _product.lastOptions[option?.name?.toLowerCase()] === v.options[i])
  ) || product?.variants?.find(
    (v) => v.id && product.options_with_values.slice(0, product.options_with_values.length - 2)?.every((option, i) => _product.lastOptions[option?.name?.toLowerCase()] === v.options[i])
  ) || product?.variants?.find(
    (v) => v.id && product.options_with_values?.some(
      (option, i) => _product.lastOptions[option?.name?.toLowerCase()] === v.options[i]
    )
  ) || product?.variants?.find((v) => v.id === product.selected_or_first_available_variant_id) || product?.variants?.[0];
  const selling_plan_allocations = selected_variant?.selling_plan_allocations;
  const selected_selling_plan = default_select_selling_plan ? selling_plan_allocations?.[0]?.selling_plan : null;
  const selling_plan_discount_wording = +selected_selling_plan?.price_adjustments?.[0]?.value ? selected_selling_plan?.price_adjustments?.[0]?.value_type === "fixed_amount" ? `${utils.formatMoney(selected_selling_plan?.price_adjustments?.[0]?.value)} off` : selected_selling_plan?.price_adjustments?.[0]?.value_type === "percentage" ? `Save ${selected_selling_plan?.price_adjustments?.[0]?.value}%` : "" : "";
  const state = window.Alpine.reactive({
    product_handle: productHandle,
    random_id,
    hydrated: !!product,
    variant_changed: false,
    settings,
    product,
    selected_media_id: product?.media?.[0]?.id,
    properties: {},
    selected_variant,
    selling_plan_allocations,
    selected_selling_plan,
    selling_plan_discount_wording,
    isAdding: false,
    options: selected_variant?.options,
    quantity: 1,
    sibling_handle: ""
  });
  const handleAddToCart = /* @__PURE__ */ __name(async (e) => {
    const properties = {};
    Object.entries(utils.serializeForm($el.querySelector("form")))?.forEach(([key, value]) => {
      if (key.includes("properties[") && value) {
        properties[key.replace(/^properties\[(.*)]$/gi, "$1")] = value;
      }
    });
    e.preventDefault();
    e.stopPropagation();
    state.isAdding = true;
    const data = await _cart.add({
      items: [
        {
          id: state.selected_variant.id,
          quantity: state.quantity,
          selling_plan: state.selected_selling_plan?.id,
          properties: {
            ...properties,
            ...state.properties
          }
        }
      ]
    });
    state.isAdding = false;
    _stores.modal.setId("cart-drawer");
    _stores.productDrawer.open = false;
    _stores.quickView.open = false;
  }, "handleAddToCart");
  const handleBackInStockNotification = /* @__PURE__ */ __name(async (e) => {
    if (state?.selected_variant?.available) return;
    e.preventDefault();
    e.stopPropagation();
    _stores.backInStockNotification.open = true;
    _stores.backInStockNotification.product = state.product;
    _stores.backInStockNotification.selected_variant = state.selected_variant;
  }, "handleBackInStockNotification");
  const setSelectedVariant = /* @__PURE__ */ __name((id) => {
    state.selected_variant = state.product.variants?.find((variant) => variant.id === id);
    state.options = state.selected_variant.options;
    state.variant_changed = true;
    if (state.selected_selling_plan && !state.selected_variant?.selling_plan_allocations?.some(
      (plan) => plan?.selling_plan?.id === state.selected_selling_plan?.id
    )) {
      state.selected_selling_plan = state.selected_variant?.selling_plan_allocations?.[0]?.selling_plan ?? null;
    }
    if (state.product.requires_selling_plan && !state.selected_selling_plan) {
      state.selected_variant?.selling_plan_allocations?.[0]?.selling_plan ?? state.product.selling_plan_groups?.[0]?.selling_plans?.[0];
    }
    _product.lastOptions = {
      ..._product.lastOptions ?? {},
      ...state.product.options_with_values?.reduce((acc, option, index) => {
        acc[option?.name?.toLowerCase()] = state.options[index];
        return acc;
      }, {}) ?? {}
    };
  }, "setSelectedVariant");
  const setProductOption = /* @__PURE__ */ __name(({ index, value }) => {
    const options = [...state.options];
    options[index] = value;
    setSelectedVariant(
      state.product.variants?.find(
        (variant) => variant.options.every((option, i) => options[i] === option)
      )?.id ?? state.product?.variants?.find((variant) => variant.options[index] === value)?.id ?? state.product?.variants?.find(({ available }) => available)?.id ?? state.product?.variants?.[0]?.id
    );
  }, "setProductOption");
  const setSellingPlan = /* @__PURE__ */ __name((selling_plan_id) => {
    state.selected_selling_plan = state.selling_plan_allocations.find(
      (allocation) => allocation.selling_plan.id === selling_plan_id
    )?.selling_plan;
    const selling_plan = state.selected_selling_plan ?? selling_plan_allocations?.[0]?.selling_plan;
    state.selling_plan_discount_wording = selling_plan?.price_adjustments?.[0]?.value_type === "fixed_amount" ? `${utils.formatMoney(selling_plan?.price_adjustments?.[0]?.value)} off` : selling_plan?.price_adjustments?.[0]?.value_type === "percentage" ? `Save ${selling_plan?.price_adjustments?.[0]?.value}%` : "";
  }, "setSellingPlan");
  const renderDynamicText = /* @__PURE__ */ __name((content) => {
    return utils.renderBracketInputDynamicText(content, state);
  }, "renderDynamicText");
  const getDynamicValue = /* @__PURE__ */ __name((content) => {
    return utils.getBracketInputDynamicValue(content, state);
  }, "getDynamicValue");
  const getContentLabels = /* @__PURE__ */ __name((key) => {
    const labels = key.split(".").reduce((acc, selector) => {
      if (!selector || acc === void 0 || acc === null) return acc || "";
      if (acc && selector in acc) {
        return acc[selector];
      }
      return "";
    }, state);
    if (Array.isArray(labels)) {
      return labels.filter(Boolean);
    }
    return [labels].filter(Boolean);
  }, "getContentLabels");
  const getDiscountLabel = /* @__PURE__ */ __name((type) => {
    const price = state.selected_variant?.price ?? 0;
    const compare_at_price = state.selected_variant?.compare_at_price ?? 0;
    if (compare_at_price <= price) {
      return "";
    }
    switch (type) {
      case "sale": {
        return "Sale";
      }
      case "percentage": {
        return `${Math.round((compare_at_price - price) * 100 / compare_at_price)}% off`;
      }
      case "value": {
        return `Save ${utils.formatMoney(
          compare_at_price - price,
          window?.money_format?.replace(/\{(\s*)amount(\s*)}/gi, "{$1amount_no_decimals$2}")
        )}`;
      }
      default: {
        return "";
      }
    }
  }, "getDiscountLabel");
  const getVariantSwatches = /* @__PURE__ */ __name((primary_source, fallback_source, variant) => {
    const cssVariables = [];
    switch (primary_source) {
      case "title": {
        cssVariables.push(`--primary-swatch: var(--swatch-${utils.handlelize(variant.title)})`);
        break;
      }
      case "image": {
        const [src, version] = variant?.featured_media?.preview_image?.src.split("?") ?? [];
        if (!src) break;
        cssVariables.push(
          `--primary-swatch: url(${src}?width=60&height=60&${version}) center center/cover no-repeat`
        );
        break;
      }
      case "metafield": {
        const color_swatch = variant.metafields.smart.color_swatch;
        if (typeof color_swatch === "string") {
          cssVariables.push(`--primary-swatch: ${color_swatch}`);
          break;
        }
        if (color_swatch) {
          const [src, version] = color_swatch?.preview_image?.src.split("?") ?? [];
          if (!src) break;
          cssVariables.push(
            `--primary-swatch: url(${src}?width=60&height=60&${version}) center center/cover no-repeat`
          );
          cssVariables.push(`--primary-swatch: ${color_swatch}`);
        }
        break;
      }
    }
    switch (fallback_source) {
      case "title": {
        cssVariables.push(`--fallback-swatch: var(--swatch-${utils.handlelize(variant.title)})`);
        break;
      }
      case "image": {
        const [src, version] = variant?.featured_media?.preview_image?.src.split("?") ?? [];
        if (!src) break;
        cssVariables.push(
          `--fallback-swatch: url(${src}?width=60&height=60&${version}) center center/cover no-repeat`
        );
        break;
      }
      case "metafield": {
        const color_swatch = variant.metafields.smart.color_swatch;
        if (typeof color_swatch === "string") {
          cssVariables.push(`--fallback-swatch: ${color_swatch}`);
          break;
        }
        if (color_swatch) {
          const [src, version] = color_swatch?.preview_image?.src.split("?") ?? [];
          if (!src) break;
          cssVariables.push(
            `--fallback-swatch: url(${src}?width=60&height=60&${version}) center center/cover no-repeat`
          );
          cssVariables.push(`--fallback-swatch: ${color_swatch}`);
        }
        break;
      }
    }
    return `${cssVariables?.join(
      ";"
    )};background: var(--primary-swatch, var(--fallback-swatch, ${utils.handlelize(
      variant?.title
    )}))`;
  }, "getVariantSwatches");
  const getOptionIndex = /* @__PURE__ */ __name((blockId) => {
    const optionBlocks = [];
    for (let i = 0; i < (state.product?.options?.length || 0); i++) {
      const option = state.product?.options[i];
      const primaryBlock = option_blocks?.find((block) => {
        const alreadyUsed = optionBlocks.some((b) => b.id === block.block_id);
        if (alreadyUsed || !block.match_option_titles) return false;
        if (block.match_exact_word) {
          return block.match_option_titles?.split(",").includes(option);
        }
        return block.match_option_titles?.split(",").map((o) => o.toLowerCase().trim()).includes(option.toLowerCase().trim());
      });
      if (primaryBlock) {
        optionBlocks.push({ index: i, id: primaryBlock.block_id });
        continue;
      }
      const fallbackBlock = option_blocks?.find(
        (block) => !optionBlocks.some((b) => b.id === block.block_id) && !block.match_option_titles
      );
      if (fallbackBlock) {
        optionBlocks.push({ index: i, id: fallbackBlock.block_id });
      }
    }
    return optionBlocks?.find((block) => block.id === blockId)?.index ?? -1;
  }, "getOptionIndex");
  const getOptionSwatches = /* @__PURE__ */ __name((primary_source, fallback_source, value, index) => {
    const variant = state?.product?.variants?.find((variant2) => variant2.options[index] === value);
    const cssVariables = [];
    switch (primary_source) {
      case "title": {
        cssVariables.push(`--primary-swatch: var(--swatch-${utils.handlelize(value)})`);
        break;
      }
      case "image": {
        const [src, version] = variant?.featured_media?.preview_image?.src?.split("?") ?? [];
        if (!src) break;
        cssVariables.push(
          `--primary-swatch: url(${src}?width=60&height=60&${version}) center center/cover no-repeat`
        );
        break;
      }
      case "metafield": {
        const color_swatch = variant.metafields.smart.color_swatch;
        if (typeof color_swatch === "string") {
          cssVariables.push(`--primary-swatch: ${color_swatch}`);
          break;
        }
        if (color_swatch) {
          const [src, version] = color_swatch?.preview_image?.src?.split("?") ?? [];
          if (!src) break;
          cssVariables.push(
            `--primary-swatch: url(${src}?width=60&height=60&${version}) center center/cover no-repeat`
          );
          cssVariables.push(`--primary-swatch: ${color_swatch}`);
        }
        break;
      }
    }
    switch (fallback_source) {
      case "title": {
        cssVariables.push(`--fallback-swatch: var(--swatch-${utils.handlelize(value)})`);
        break;
      }
      case "image": {
        const [src, version] = variant?.featured_media?.preview_image?.src?.split("?") ?? [];
        if (!src) break;
        cssVariables.push(
          `--fallback-swatch: url(${src}?width=60&height=60&${version}) center center/cover no-repeat`
        );
        break;
      }
      case "metafield": {
        const color_swatch = variant.metafields.smart.color_swatch;
        if (typeof color_swatch === "string") {
          cssVariables.push(`--fallback-swatch: ${color_swatch}`);
          break;
        }
        if (color_swatch) {
          const [src, version] = color_swatch?.preview_image?.src?.split("?") ?? [];
          if (!src) break;
          cssVariables.push(
            `--fallback-swatch: url(${src}?width=60&height=60&${version}) center center/cover no-repeat`
          );
          cssVariables.push(`--fallback-swatch: ${color_swatch}`);
        }
        break;
      }
    }
    return `${cssVariables?.join(
      ";"
    )};background: var(--primary-swatch, var(--fallback-swatch, ${utils.handlelize(value)}))`;
  }, "getOptionSwatches");
  const truncateChildren = /* @__PURE__ */ __name((element, container) => {
    const children = [...container.children];
    if (children.at(-2)?.offsetLeft + children.at(-2)?.clientWidth < container.clientWidth) {
      return children.length - 2;
    }
    return children.findIndex(
      (childElement) => childElement.offsetLeft + childElement.clientWidth + element.clientWidth + +getComputedStyle(container).gap.replace("px", "") > container.clientWidth
    ) - 1;
  }, "truncateChildren");
  const hasAvailableVariant = /* @__PURE__ */ __name((index, value) => {
    return state?.product?.variants?.some((variant) => {
      switch (index) {
        case 0: {
          return variant.options[index] === value && variant.available;
        }
        case 1: {
          return variant.options[0] === state?.options[0] && variant.options[index] === value && variant.available;
        }
        case 2: {
          return variant.options[0] === state?.options[0] && variant.options[1] === state?.options[1] && variant.options[index] === value && variant.available;
        }
      }
      return false;
    });
  }, "hasAvailableVariant");
  const updateProductState = /* @__PURE__ */ __name((product2) => {
    if (settings?.default_variant_metafield && product2) {
      const [namespace, key] = settings.default_variant_metafield.trim().split(".");
      const variant = product2?.metafields?.[namespace]?.[key];
      product2.selected_variant_id = variant?.id ?? product2?.selected_variant_id;
    }
    const selected_variant2 = product2?.variants?.find((v) => v.id === product2.selected_variant_id) || product2?.variants?.find(
      (v) => v.id && product2.options_with_values?.every(
        (option, i) => _product.lastOptions[option?.name?.toLowerCase()] === v.options[i]
      )
    ) || product2?.variants?.find(
      (v) => v.id && product2.options_with_values.slice(0, product2.options_with_values.length - 1)?.every(
        (option, i) => _product.lastOptions[option?.name?.toLowerCase()] === v.options[i]
      )
    ) || product2?.variants?.find(
      (v) => v.id && product2.options_with_values.slice(0, product2.options_with_values.length - 2)?.every(
        (option, i) => _product.lastOptions[option?.name?.toLowerCase()] === v.options[i]
      )
    ) || product2?.variants?.find(
      (v) => v.id && product2.options_with_values?.some(
        (option, i) => _product.lastOptions[option?.name?.toLowerCase()] === v.options[i]
      )
    ) || product2?.variants?.find((v) => v.id === product2.selected_or_first_available_variant_id) || product2?.variants?.[0];
    const selling_plan_allocations2 = selected_variant2?.selling_plan_allocations;
    const selected_selling_plan2 = default_select_selling_plan ? selling_plan_allocations2?.[0]?.selling_plan : null;
    const selling_plan_discount_wording2 = +selected_selling_plan2?.price_adjustments?.[0]?.value ? selected_selling_plan2?.price_adjustments?.[0]?.value_type === "fixed_amount" ? `${utils.formatMoney(selected_selling_plan2?.price_adjustments?.[0]?.value)} off` : selected_selling_plan2?.price_adjustments?.[0]?.value_type === "percentage" ? `Save ${selected_selling_plan2?.price_adjustments?.[0]?.value}%` : "" : "";
    state.product = product2;
    state.selected_media_id = product2?.media?.[0]?.id;
    state.properties = {};
    state.selected_variant = selected_variant2;
    state.selling_plan_allocations = selling_plan_allocations2;
    state.selected_selling_plan = selected_selling_plan2;
    state.selling_plan_discount_wording = selling_plan_discount_wording2;
    state.isAdding = false;
    state.options = selected_variant2?.options;
    state.quantity = 1;
    state.sibling_handle = "";
    state.hydrated = true;
  }, "updateProductState");
  const showConditionally = /* @__PURE__ */ __name((condition) => {
    switch (condition) {
      case "always": {
        return true;
      }
      case "with_subscriptions": {
        return !!state.selected_variant?.selling_plan_allocations?.length;
      }
      case "no_subscriptions": {
        return !state.selected_variant?.selling_plan_allocations?.length;
      }
    }
  }, "showConditionally");
  return {
    card: state,
    $el,
    $refs,
    handleAddToCart,
    handleBackInStockNotification,
    setSelectedVariant,
    setProductOption,
    setSellingPlan,
    renderDynamicText,
    getDynamicValue,
    getContentLabels,
    getDiscountLabel,
    getVariantSwatches,
    getOptionIndex,
    getOptionSwatches,
    truncateChildren,
    hasAvailableVariant,
    updateProductState,
    showConditionally
  };
}, "initProductCard");
const hydrateProductCard = /* @__PURE__ */ __name(($el, card_handle, product_handle, product_id, classes = []) => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        const node = document.querySelector(`[data-product-card='${card_handle}']`)?.cloneNode(true);
        if (!node && !$el.hasAttribute("data-intersected")) {
          $el.setAttribute("data-intersected", "true");
          const mo = new MutationObserver((mutation, obs) => {
            if ($el.hasAttribute("data-cards-loaded")) {
              $el.removeAttribute("data-intersected");
              const node2 = document.querySelector(`[data-product-card='${card_handle}']`)?.cloneNode(true);
              if (node2 && $el && $el.parentNode) {
                node2?.removeAttribute(`data-product-card`);
                node2?.setAttribute("data-product-handle", product_handle);
                node2?.setAttribute("data-product-id", product_id);
                node2.querySelectorAll("[data-loop-item], [data-x-if], style").forEach((el) => {
                  el.remove();
                });
                node2.classList.add(...classes);
                $el.parentNode.replaceChild(node2, $el);
              }
              mo.disconnect();
              observer.disconnect();
            }
          });
          mo.observe($el, { attributes: true });
          return;
        }
        if (node && $el && $el.parentNode) {
          node?.removeAttribute(`data-product-card`);
          node?.setAttribute("data-product-handle", product_handle);
          node?.setAttribute("data-product-id", product_id);
          node.querySelectorAll("[data-loop-item], [data-x-if], style").forEach((el) => {
            el.remove();
          });
          node.classList.add(...classes);
          $el.parentNode.replaceChild(node, $el);
        }
        observer.disconnect();
      }
    },
    { rootMargin: "300px 300px 300px 300px" }
  );
  observer.observe($el);
}, "hydrateProductCard");
window._sections["initProductCard"] = initProductCard;
window._sections["hydrateProductCard"] = hydrateProductCard;
