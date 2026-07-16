var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initProduct = /* @__PURE__ */ __name(($el, $refs, productHandle) => {
  let scrollContainer = $refs.scrollContainer;
  let gallery = $refs.gallery;
  let thumbnails = $refs.thumbnails;
  let init = true;
  if (!scrollContainer) {
    scrollContainer = $el.querySelector(`[x-ref="scrollContainer"]`);
  }
  if (!gallery) {
    gallery = $el.querySelector(`[x-ref="gallery"]`);
  }
  if (!thumbnails) {
    thumbnails = gallery.querySelector(`[x-ref="thumbnails"]`);
  }
  const isPrimary = /^product\.?/gi.test(_stores?.router?.template) && document.querySelector(`[data-section-type="product"]`) === $el;
  const quickView = $el.hasAttribute("data-quick-view");
  const settings = utils.JSONParse($el.getAttribute("data-settings"));
  const columnElements = [gallery, $refs?.content, $refs?.thumbnails].filter(Boolean);
  const scroll_column_element = columnElements?.reduce(
    (acc, element) => acc?.scrollHeight > element?.scrollHeight ? acc : element,
    null
  );
  scroll_column_element?.classList?.remove("sticky-product-section");
  scroll_column_element?.classList?.add("relative");
  const product = utils.JSONParse(
    document.querySelector(`[data-primary-product-data="${productHandle}"]`)?.innerHTML ?? document.querySelector(`[data-product-data="${productHandle}"]`)?.innerHTML
  );
  if (isPrimary) {
    const url = new URL(window.location.href);
    const variantId = url.searchParams.get("variant");
    product.selected_variant_id = variantId ? +variantId : product.selected_variant_id;
  }
  const selected_variant = product?.variants?.find((v) => v.id === product.selected_variant_id) || product?.variants?.find(
    (v) => v.id && product.options_with_values?.every(
      (option, i) => _product.lastOptions[utils.handlelize(option?.name)] === v.options[i]
    )
  ) || product?.variants?.find(
    (v) => v.id && product.options_with_values.slice(0, product.options_with_values.length - 1)?.every(
      (option, i) => _product.lastOptions[utils.handlelize(option?.name)] === v.options[i]
    )
  ) || (product.options_with_values.length >= 3 ? product?.variants?.find(
    (v) => v.id && product.options_with_values.slice(0, product.options_with_values.length - 2)?.every(
      (option, i) => _product.lastOptions[utils.handlelize(option?.name)] === v.options[i]
    )
  ) : null) || product?.variants?.find(
    (v) => v.id && product.options_with_values?.some(
      (option, i) => _product.lastOptions[utils.handlelize(option?.name)] === v.options[i]
    )
  ) || product?.variants?.find((v) => v.id === product.selected_or_first_available_variant_id) || product?.variants?.[0];
  const selling_plan_allocations = selected_variant?.selling_plan_allocations;
  const selected_selling_plan = selling_plan_allocations?.[0]?.selling_plan;
  const selling_plan_discount_wording = +selected_selling_plan?.price_adjustments?.[0]?.value ? selected_selling_plan?.price_adjustments?.[0]?.value_type === "fixed_amount" ? `${utils.formatMoney(selected_selling_plan?.price_adjustments?.[0]?.value)} off` : selected_selling_plan?.price_adjustments?.[0]?.value_type === "percentage" ? `Save ${selected_selling_plan?.price_adjustments?.[0]?.value}%` : "" : "";
  const gallerySettings = utils.JSONParse(
    gallery?.getAttribute("data-settings")
  );
  const thumbnailSettings = utils.JSONParse(
    thumbnails?.getAttribute("data-settings")
  );
  const mediaElements = [
    ...gallery?.querySelectorAll("[data-main-product-images] [data-media-id]") ?? []
  ].map((element) => ({
    element,
    mediaId: +element.getAttribute("data-media-id"),
    metafield: element.hasAttribute("data-metafield-media"),
    media: product?.media?.find((media) => media.id === +element.getAttribute("data-media-id")) ?? product?.variants?.find(
      (v) => v.metafields?.smart?.images?.some(
        (image) => image.id === +element.getAttribute("data-media-id")
      )
    )?.metafields?.smart?.images?.find(
      (image) => image.id === +element.getAttribute("data-media-id")
    )
  }));
  const thumbnailMediaElements = [...thumbnails?.querySelectorAll("[data-media-id]") ?? []].map(
    (element) => ({
      element,
      mediaId: +element.getAttribute("data-media-id"),
      metafield: element.hasAttribute("data-metafield-media"),
      media: product?.media?.find((media) => media.id === +element.getAttribute("data-media-id")) ?? product?.variants?.find(
        (v) => v.metafields?.smart?.images?.some(
          (image) => image.id === +element.getAttribute("data-media-id")
        )
      )?.metafields?.smart?.images?.find(
        (image) => image.id === +element.getAttribute("data-media-id")
      )
    })
  );
  let discounted_price = selected_variant?.price;
  const price_adjustment = selected_selling_plan?.price_adjustments?.[0] ?? selected_variant?.selling_plan_allocations?.[0]?.selling_plan?.price_adjustments?.[0];
  if (price_adjustment?.value_type === "fixed_amount") {
    discounted_price = Math.max(discounted_price - Math.round(+price_adjustment?.value), 0);
  }
  if (price_adjustment?.value_type === "percentage") {
    discounted_price = Math.max(
      discounted_price - Math.round(+price_adjustment?.value / 100 * discounted_price),
      0
    );
  }
  const state = window.Alpine.reactive({
    element: $el,
    count: 0,
    isPrimary,
    product,
    addonProduct: product,
    selected_media_id: product?.media?.[0]?.id,
    scroll_column_element,
    show_complementary_products: true,
    properties: {},
    selected_variant,
    selling_plan_allocations,
    selected_price: discounted_price,
    selected_compare_at_price: Math.max(
      selected_variant?.compare_at_price,
      selected_variant?.price
    ),
    selected_selling_plan: null,
    selling_plan_discount_wording: "",
    isAdding: false,
    dynamic_buy_button: null,
    options: selected_variant?.options,
    quantity: 1,
    sibling_handle: "",
    disable_add_to_cart: /* @__PURE__ */ new Set(),
    required_combine_items: [],
    required_combine_quantity: 0,
    upsell_items: /* @__PURE__ */ new Map(),
    addons: /* @__PURE__ */ new Map(),
    addons_version: 0,
    bundle_total_price: 0,
    bundle_compare_at_price: 0
  });
  const card = window.Alpine.reactive({});
  const bundle = window.Alpine.reactive({});
  const addOrUpdateAddon = /* @__PURE__ */ __name(({ handle, product: product2, variant, quantity = 1, properties = {} }) => {
    if (!product2?.id || !variant?.id) return;
    state.addons.set(handle, { handle, product: product2, variant, quantity, properties });
    state.addons_version++;
  }, "addOrUpdateAddon");
  const removeAddon = /* @__PURE__ */ __name((handle) => {
    if (state.addons.delete(handle)) state.addons_version++;
  }, "removeAddon");
  const handlePopState = /* @__PURE__ */ __name((e) => {
    const url = new URL(window.location.href);
    const selling_plan_id = +url.searchParams.get("selling_plan");
    const variant_id = +url.searchParams.get("variant");
    if (!variant_id) return;
    if (state.selected_variant?.id !== variant_id) {
      state.selected_variant = state.addonProduct?.variants?.find((variant) => variant.id === variant_id) ?? state.selected_variant;
      state.options = state.selected_variant?.options;
    }
    if (selling_plan_id !== state.selected_selling_plan?.id) {
      state.selected_selling_plan = state.selected_variant?.selling_plan_allocations?.find(
        (plan) => plan.selling_plan.id === selling_plan_id
      )?.selling_plan ?? state.selected_selling_plan;
    }
  }, "handlePopState");
  const styleDynamicBuyButton = /* @__PURE__ */ __name((element) => {
    const cssClass = element.getAttribute("data-button-class");
    const previewButton = element.querySelector("[data-pre-styled-button]");
    element.style.setProperty(
      "--shopify-accelerated-checkout-button-block-size",
      getComputedStyle(previewButton)?.height
    );
    element.style.setProperty(
      "--shopify-accelerated-checkout-button-border-radius",
      getComputedStyle(previewButton)?.borderRadius
    );
    previewButton.remove();
  }, "styleDynamicBuyButton");
  const handleAddToCart = /* @__PURE__ */ __name(async (e) => {
    if (state.disable_add_to_cart.size > 0) return;
    e.preventDefault();
    e.stopPropagation();
    const random_id = utils.shortUUID();
    const properties = {};
    if (state.upsell_items.size || state.required_combine_items?.length) {
      properties["_p_id"] = `${random_id}`;
    }
    Object.entries(utils.serializeForm($el.querySelector("form")))?.forEach(([key, value]) => {
      if (key.includes("properties[") && value) {
        properties[key.replace(/^properties\[(.*)]$/gi, "$1")] = value;
      }
    });
    state.isAdding = true;
    const data = await _cart.add({
      items: [
        ...Array.from(state.addons.values()).map(({ variant, quantity = 1, properties: properties2 = {} }) => ({
          id: variant.id,
          quantity,
          properties: {
            ...properties2,
            _addon: "true"
          }
        })),
        {
          id: state.selected_variant.id,
          quantity: state.quantity,
          selling_plan: state.selected_selling_plan?.id,
          properties: {
            ...properties,
            ...state.properties
          }
        },
        ...[...state.upsell_items.values()].map((entry) => ({
          quantity: state.quantity,
          ...entry,
          properties: {
            ...entry.properties,
            _p_id_link: `${random_id}`
          }
        })),
        ...state.required_combine_items.reduce((acc, item) => {
          const itemIndex = acc.findIndex((addedItem) => addedItem.id === item.id);
          if (itemIndex !== -1) {
            acc[itemIndex].quantity += state.quantity;
            acc[itemIndex].properties["_p_quantity"] = `${acc[itemIndex].quantity}`;
            return acc;
          }
          acc.push({
            id: item.id,
            quantity: state.quantity,
            selling_plan: state.selected_selling_plan?.id ? item.selling_plan_allocations?.find(
              (plan) => plan.selling_plan?.name === state.selected_selling_plan?.name
            )?.selling_plan?.id : void 0,
            properties: {
              _p_id_link: `${random_id}`
            }
          });
          return acc;
        }, [])
      ]
    });
    state.isAdding = false;
    if (!data.cart_error) {
      _stores.modal.setId("cart-drawer");
      _stores.productDrawer.open = false;
      _stores.quickView.open = false;
    }
  }, "handleAddToCart");
  const handleBackInStockNotification = /* @__PURE__ */ __name(async (e) => {
    if (state?.selected_variant?.available) return;
    e.preventDefault();
    e.stopPropagation();
    _stores.backInStockNotification.open = true;
    _stores.backInStockNotification.product = state.addonProduct;
    _stores.backInStockNotification.selected_variant = state.selected_variant;
  }, "handleBackInStockNotification");
  const setSelectedVariant = /* @__PURE__ */ __name((id, scroll_to_variant = true) => {
    state.selected_variant = state.addonProduct.variants?.find((variant) => variant.id === id);
    state.options = state.selected_variant?.options;
    if (state.selected_selling_plan && !state.selected_variant?.selling_plan_allocations?.some(
      (plan) => plan?.selling_plan?.id === state.selected_selling_plan?.id
    )) {
      state.selected_selling_plan = state.selected_variant?.selling_plan_allocations?.[0]?.selling_plan ?? null;
    }
    if (state.addonProduct.requires_selling_plan && !state.selected_selling_plan) {
      state.selected_variant?.selling_plan_allocations?.[0]?.selling_plan ?? state.addonProduct.selling_plan_groups?.[0]?.selling_plans?.[0];
    }
    if (gallerySettings?.scroll_to_selected_variant_image && state.selected_variant?.featured_media?.id && scroll_to_variant) {
      scrollToMediaById(state.selected_variant?.featured_media?.id, false);
    }
    _product.lastOptions = {
      ..._product.lastOptions ?? {},
      ...state.addonProduct.options_with_values?.reduce((acc, option, index) => {
        acc[utils.handlelize(option?.name)] = state.options[index];
        return acc;
      }, {}) ?? {}
    };
  }, "setSelectedVariant");
  const setProductOption = /* @__PURE__ */ __name(({ index, value }) => {
    const options = [...state.options];
    options[index] = value;
    setSelectedVariant(
      state.addonProduct?.variants?.find(
        (variant) => variant.options.every((option, i) => options[i] === option)
      )?.id ?? state.addonProduct?.variants?.find((variant) => variant.options[index] === value)?.id ?? state.addonProduct?.variants?.find(({ available }) => available)?.id ?? state.addonProduct?.variants?.[0]?.id
    );
  }, "setProductOption");
  const setSellingPlan = /* @__PURE__ */ __name((selling_plan_id) => {
    state.selected_selling_plan = state.selling_plan_allocations.find(
      (allocation) => allocation.selling_plan.id === selling_plan_id
    )?.selling_plan;
    const selling_plan = state.selected_selling_plan ?? selling_plan_allocations?.[0]?.selling_plan;
    state.selling_plan_discount_wording = selling_plan?.price_adjustments?.[0]?.value ? selling_plan?.price_adjustments?.[0]?.value_type === "fixed_amount" ? `${utils.formatMoney(selling_plan?.price_adjustments?.[0]?.value)} off` : selling_plan?.price_adjustments?.[0]?.value_type === "percentage" ? `Save ${selling_plan?.price_adjustments?.[0]?.value}%` : "" : "";
  }, "setSellingPlan");
  const setSiblingProduct = /* @__PURE__ */ __name((handle, quickView2) => {
    if (handle === state.addonProduct.handle) return;
    _product.lastOptions = {
      ..._product.lastOptions ?? {},
      ...state.addonProduct.options_with_values?.reduce((acc, option, index) => {
        acc[utils.handlelize(option?.name)] = state.options[index];
        return acc;
      }, {}) ?? {}
    };
    if (quickView2) {
      _stores.quickView.renderQuickView(handle);
      return;
    }
    barba.go(utils.getSiblingUrl(handle));
  }, "setSiblingProduct");
  const setQuantity = /* @__PURE__ */ __name((quantity) => {
    state.quantity = quantity;
  }, "setQuantity");
  const handleStickyScroll = /* @__PURE__ */ __name(() => {
    [$refs.content, thumbnails, gallery].forEach((element) => {
      if (!element || !element.classList.contains("sticky-product-section")) return;
      if (state.scroll_column_element.getBoundingClientRect().bottom - 96 < element.scrollHeight - element.scrollTop) {
        element.style.maxHeight = "unset";
      } else {
        element.style.maxHeight = "";
      }
    });
  }, "handleStickyScroll");
  const scrollToMediaById = /* @__PURE__ */ __name(async (mediaId, no_variant_select = true) => {
    state.selected_media_id = mediaId;
    const image = gallery?.querySelector(`[data-media-id="${mediaId}"]`);
    if (thumbnailSettings?.select_variant_on_click && no_variant_select) {
      setSelectedVariant(
        state.addonProduct.variants.find((v) => v.featured_media?.id === mediaId)?.id || state.selected_variant?.id,
        false
      );
    }
    if (!image) return;
    await utils.delay(5);
    const header = document.querySelector(".header-sections-container");
    const offsetHeight = Math.max(0, header?.getBoundingClientRect()?.bottom ?? 0);
    const imageOffset = utils.getElementPosition(image);
    if (utils.isElementScrollable(scrollContainer)) {
      let scrollSnap = false;
      if (scrollContainer?.classList?.contains("snap-x")) {
        scrollContainer?.classList.remove("snap-x");
        scrollSnap = true;
      }
      utils.scrollToXY(
        200,
        image.offsetLeft,
        image.offsetTop,
        scrollContainer,
        () => {
          if (scrollSnap) {
            scrollContainer?.classList.add("snap-x");
          }
        }
      );
    } else {
      utils.scrollToXY(
        200,
        image.offsetLeft,
        imageOffset.top - offsetHeight - +getComputedStyle(gallery).paddingTop.replace("px", "")
      );
    }
  }, "scrollToMediaById");
  const renderComplementaryProducts = /* @__PURE__ */ __name((element, primary_source, secondary_source, product_class, limit) => {
    const fallback_products = utils.JSONParse(
      element.getAttribute("data-fallback-products")
    );
    const products = [];
    switch (primary_source) {
      case "complementary": {
        state.addonProduct?.complementary_products?.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "related": {
        state.addonProduct?.related_products?.forEach((prod) => {
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
        state.addonProduct?.complementary_products?.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "related": {
        state.addonProduct?.related_products?.forEach((prod) => {
          products.push(prod);
        });
        break;
      }
      case "manual": {
        break;
      }
    }
    state.show_complementary_products = products?.filter((prod) => prod.id !== state.addonProduct.id)?.filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i)?.length > 0;
    const children = [...element.querySelectorAll("[data-product-handle]")];
    const renderProducts = products?.filter((prod) => prod.id !== state.addonProduct.id)?.filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i)?.slice(0, limit) ?? [];
    if (!renderProducts?.filter(
      (prod, index) => prod.handle !== children?.[index]?.getAttribute("data-product-handle")
    )?.length) {
      return;
    }
    element.innerHTML = "";
    renderProducts.forEach((prod, i, arr) => {
      const node = document.querySelector(`[data-product-card='${product_class}']`)?.cloneNode(true);
      if (node) {
        node?.removeAttribute(`data-product-card`);
        node?.setAttribute("data-product-handle", prod.handle);
        node?.setAttribute("data-product-id", prod.id);
        node.querySelectorAll("[data-loop-item], [data-x-if], style").forEach((el) => {
          el.remove();
        });
        element.appendChild(node);
        if (i + 1 < arr.length) {
          const div = document.createElement("div");
          div.setAttribute("data-style-divider", ``);
          element.appendChild(div);
        }
      }
    });
  }, "renderComplementaryProducts");
  const handleImageSelection = /* @__PURE__ */ __name((filter_setting, items, variant) => {
    switch (filter_setting) {
      case "show_all_variants": {
        items?.forEach(({ element, mediaId }) => {
          element.classList.toggle(
            "hidden",
            !state.addonProduct.variants.some((v) => v?.featured_media?.id === mediaId)
          );
        });
        return;
      }
      case "inherit":
        break;
      case "show_all": {
        items?.forEach(({ element, mediaId }) => element.classList.remove("hidden"));
        return;
      }
      case "selected_variant": {
        items?.forEach(({ element, mediaId }) => {
          element.classList.toggle("hidden", variant?.featured_media?.id !== mediaId);
        });
        return;
      }
      case "variant_images_by_order": {
        let hide = true;
        items?.forEach(({ element, mediaId }) => {
          if (variant.featured_media?.id === mediaId) {
            hide = false;
            element.classList.toggle("hidden", hide);
            return;
          }
          if (state.addonProduct.variants.map((v) => v?.featured_media?.id).includes(mediaId)) {
            hide = true;
          }
          element.classList.toggle("hidden", hide);
        });
        return;
      }
      case "variant_images_by_metafield": {
        items?.forEach(({ element, mediaId, metafield }) => {
          const show = variant?.featured_media?.id === mediaId || state.selected_variant?.metafields?.smart?.images?.some((m) => m.id === mediaId);
          element.classList.toggle("hidden", !show);
          element.classList.toggle("order-first", variant?.featured_media?.id === mediaId);
        });
        return;
      }
      case "variant_images_and_unassigned": {
        items?.forEach(({ element, mediaId }) => {
          const show = variant?.featured_media?.id === mediaId || !state.addonProduct.variants.map((v) => v?.featured_media?.id).includes(mediaId);
          element.classList.toggle("hidden", !show);
          element.classList.toggle("order-first", variant?.featured_media?.id === mediaId);
        });
        return;
      }
      case "only_unassigned": {
        items?.forEach(({ element, mediaId }) => {
          const show = !state.addonProduct.variants.map((v) => v?.featured_media?.id).includes(mediaId);
          element.classList.toggle("hidden", !show);
        });
        return;
      }
      case "first_or_selected_image": {
        items?.forEach(({ element, mediaId }) => {
          element.classList.toggle("hidden", state.selected_media_id !== mediaId);
        });
        return;
      }
    }
  }, "handleImageSelection");
  const openMediaGallery = /* @__PURE__ */ __name((mediaId) => {
    const mediaItems = mediaElements?.filter(
      (item) => (getComputedStyle(item.element)?.display !== "none" || getComputedStyle(
        thumbnailMediaElements?.find((img) => img.mediaId === item.mediaId)?.element
      )?.display !== "none") && item.media
    )?.filter((a, i, arr) => arr.findIndex((b) => b.mediaId === a.mediaId) === i)?.map((item) => item.media);
    const index = mediaItems.findIndex((item) => item.id === mediaId);
    _stores.mediaGallery.openGallery({
      media: mediaItems,
      index
    });
  }, "openMediaGallery");
  const replaceVariantPlaceholders = /* @__PURE__ */ __name((text, product2, variant, shortText) => {
    const placeholders = text.match(/\[([^\]]+)\]/g);
    if (!placeholders) return text;
    let result = text;
    placeholders.forEach((placeholder) => {
      const optionName = placeholder.slice(1, -1);
      if (optionName.toLowerCase() === "name") {
        const nameValue = shortText && shortText.trim() ? shortText : product2.title;
        result = result.replace(placeholder, nameValue);
        return;
      }
      if (product2.options && product2.options.length > 0) {
        product2.options.forEach((productOptionName, index) => {
          if (productOptionName.toLowerCase() === optionName.toLowerCase()) {
            const optionValue = variant[`option${index + 1}`];
            if (optionValue) {
              result = result.replace(placeholder, optionValue);
            }
          }
        });
      }
    });
    result = result.replace(/^["']+|["']+$/g, "").replace(/\s+/g, " ").trim();
    const addonNames = Array.from(state.addons.values()).map(({ product: aProd, variant: aVar }) => {
      return aProd?.title.trim();
    }).filter(Boolean);
    if (addonNames.length) {
      result += " " + addonNames.map((n) => `+ ${n}`).join(" ");
    }
    return result;
  }, "replaceVariantPlaceholders");
  const truncateChildren = /* @__PURE__ */ __name((element, container, reCalculate = false) => {
    const children = [...container.children];
    if (children.at(-2)?.offsetLeft + children.at(-2)?.clientWidth < container.clientWidth) {
      return children.length - 1;
    }
    if (container.clientWidth === 0) {
      return container.children.length;
    }
    return children.findIndex(
      (childElement) => childElement.offsetLeft + childElement.clientWidth + element.clientWidth + +getComputedStyle(container).gap.replace("px", "") + 15 > container.clientWidth
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
        return "On Sale";
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
  const renderDynamicText = /* @__PURE__ */ __name((content) => {
    return utils.renderBracketInputDynamicText(content, state);
  }, "renderDynamicText");
  _product.getHydratedProductData(product.handle, product.id).then((res) => {
    state.addonProduct = state.addonProduct.handle === res.handle ? res : state.addonProduct;
    state.selected_variant = state.addonProduct?.variants?.find((variant) => variant.id === state.selected_variant?.id) ?? state.selected_variant;
  });
  handleStickyScroll();
  window.Alpine.effect(() => {
    state.addons_version;
    let total = state.selected_price || 0;
    let compare = state.selected_compare_at_price || 0;
    for (const { variant, quantity = 1 } of state.addons.values()) {
      const qty = Math.max(1, +quantity || 1);
      const price = variant?.price || 0;
      const cap = Math.max(variant?.compare_at_price || 0, price);
      total += price * qty;
      compare += cap * qty;
    }
    state.bundle_total_price = total;
    state.bundle_compare_at_price = compare;
    state.isPrimary = /^product\.?/gi.test(_stores.router.template) && $el?.closest("[data-content-root]")?.querySelector(`[data-section-type="product"]`) === $el;
    if (state?.isPrimary && !window.design_mode) {
      window.onpopstate = handlePopState;
      const url = new URL(window.location.href);
      const selling_plan_id = +url.searchParams.get("selling_plan") || void 0;
      const variant_id = +url.searchParams.get("variant") || void 0;
      const remove = [];
      if (!state.selected_variant?.id) {
        remove.push("variant");
      }
      if (!state.selected_selling_plan?.id) {
        remove.push("selling_plan");
      }
      if (window?.event?.type === "popstate") {
        return;
      }
      if (init || window?.event?.barba_redirect) {
        if (product?.handle !== state?.product?.handle) {
          state.addonProduct = product;
        }
        if (variant_id !== state.selected_variant?.id) {
          state.selected_variant = product?.variants?.find((v) => v.id === variant_id) || product?.variants?.find(
            (v) => v.id && product.options_with_values?.every(
              (option, i) => _product.lastOptions[utils.handlelize(option?.name)] === v.options[i]
            )
          ) || product?.variants?.find(
            (v) => v.id && product.options_with_values.slice(0, product.options_with_values.length - 1)?.every(
              (option, i) => _product.lastOptions[utils.handlelize(option?.name)] === v.options[i]
            )
          ) || (product.options_with_values.length >= 3 ? product?.variants?.find(
            (v) => v.id && product.options_with_values.slice(0, product.options_with_values.length - 2)?.every(
              (option, i) => _product.lastOptions[utils.handlelize(option?.name)] === v.options[i]
            )
          ) : null) || product?.variants?.find(
            (v) => v.id && product.options_with_values?.some(
              (option, i) => _product.lastOptions[utils.handlelize(option?.name)] === v.options[i]
            )
          ) || product?.variants?.find(
            (v) => v.id === product.selected_or_first_available_variant_id
          ) || product?.variants?.[0];
          state.selected_media_id = product?.media?.[0]?.id;
          state.properties = {};
          state.selling_plan_allocations = selling_plan_allocations;
          state.selected_price = discounted_price;
          state.selected_compare_at_price = Math.max(
            state.selected_variant?.compare_at_price,
            state.selected_variant?.price
          );
          state.dynamic_buy_button = null;
          state.options = state.selected_variant?.options;
        }
        if (selling_plan_id !== state.selected_selling_plan?.id) {
          state.selected_selling_plan = state.selected_variant.selling_plan_allocations?.find(
            (plan) => plan.selling_plan_id === selling_plan_id
          )?.selling_plan;
        }
        return;
      }
      if (selling_plan_id !== state.selected_selling_plan?.id || variant_id !== state.selected_variant?.id) {
        url.searchParams.set("selling_plan", `${state.selected_selling_plan?.id}`);
        url.searchParams.set("variant", `${state.selected_variant?.id}`);
        remove.forEach((key) => {
          url.searchParams.delete(key);
        });
        barba.history.add(url.toString(), "barba", !variant_id ? "replace" : "replace");
      }
    }
  });
  window.Alpine.effect(() => {
    if (state.dynamic_buy_button) {
      state.dynamic_buy_button.disabled = !state.selected_variant?.available;
      if (!state.dynamic_buy_button?.hasAttribute("data-no-out-of-stock")) {
        state.dynamic_buy_button.classList.toggle(
          "dynamic-buy-button-out-of-stock",
          !state.selected_variant?.available
        );
      }
    }
  });
  window.Alpine.effect(() => {
    if (quickView) {
      $refs?.thumbnails?.classList.add("!hidden");
      columnElements?.forEach((el) => {
        el.classList.remove("sticky-product-section");
        el.classList.add("quick-view-product-section", "!py-0");
        el.style.maxHeight = "";
      });
      $el.querySelectorAll("[data-block-type='breadcrumbs']").forEach((element) => {
        element.style.display = "none";
      });
      $refs.content?.classList?.add("!max-w-unset", "lg:!min-w-[45%]", "lg:h-full");
      scrollContainer?.classList?.remove(
        "product-gallery--grid",
        "product-gallery--hero-grid",
        "product-gallery--column"
      );
      scrollContainer?.classList?.add(
        "max-lg:[&_picture]:w-[unset]",
        "max-lg:[&_picture]:h-[280px]"
      );
      $refs.container?.classList?.add("lg:!p-0", "!py-0");
      gallery?.classList?.add("!max-h-full", "!h-full", "flex", "flex-col");
      Shopify?.PaymentButton?.init();
      handleImageSelection(gallerySettings?.filter_images, mediaElements, state.selected_variant);
      if (thumbnailSettings) {
        handleImageSelection(
          thumbnailSettings?.thumbnail_filter_images === "inherit" ? gallerySettings?.filter_images === "first_or_selected_image" ? "show_all_variants" : gallerySettings?.filter_images : thumbnailSettings?.thumbnail_filter_images,
          thumbnailMediaElements,
          state.selected_variant
        );
      }
      return;
    }
    handleImageSelection(gallerySettings?.filter_images, mediaElements, state.selected_variant);
    if (thumbnailSettings) {
      handleImageSelection(
        thumbnailSettings?.thumbnail_filter_images === "inherit" ? gallerySettings?.filter_images === "first_or_selected_image" ? "show_all_variants" : gallerySettings?.filter_images : thumbnailSettings?.thumbnail_filter_images,
        thumbnailMediaElements,
        state.selected_variant
      );
    }
    columnElements.forEach((element) => {
      element.classList.add("sticky-product-section");
      element.classList.remove("relative");
    });
    state.scroll_column_element = columnElements?.reduce(
      (acc, element) => acc?.scrollHeight > element?.scrollHeight ? acc : element,
      null
    );
    state.scroll_column_element?.classList?.remove("sticky-product-section");
    state.scroll_column_element?.classList?.add("relative");
  });
  window.Alpine.effect(() => {
    let discounted_price2 = state.selected_variant?.price;
    const price_adjustment2 = state.selected_selling_plan?.price_adjustments?.[0];
    if (price_adjustment2?.value_type === "fixed_amount") {
      discounted_price2 = Math.max(discounted_price2 - Math.round(+price_adjustment2?.value), 0);
    }
    if (price_adjustment2?.value_type === "percentage") {
      discounted_price2 = Math.max(
        discounted_price2 - Math.round(+price_adjustment2?.value / 100 * discounted_price2),
        0
      );
    }
    state.selected_price = discounted_price2;
    state.selected_compare_at_price = Math.max(
      state.selected_variant?.compare_at_price,
      state.selected_variant?.price
    );
    for (const { variant, quantity = 1 } of state.addons.values()) {
      const qty = Math.max(1, +quantity || 1);
      const p = variant?.price || 0;
      const cap = Math.max(variant?.compare_at_price || 0, p);
      state.selected_price += p * qty;
      state.selected_compare_at_price += cap * qty;
    }
  });
  if (state.isPrimary) {
    window.Alpine.store("main_product", {
      state,
      card,
      bundle,
      settings,
      showConditionally,
      handleAddToCart,
      handleBackInStockNotification,
      styleDynamicBuyButton,
      setSelectedVariant,
      setProductOption,
      setSiblingProduct,
      setSellingPlan,
      setQuantity,
      handleStickyScroll,
      scrollToMediaById,
      openMediaGallery,
      replaceVariantPlaceholders,
      truncateChildren,
      renderComplementaryProducts,
      hasAvailableVariant,
      getContentLabels,
      getDiscountLabel,
      renderDynamicText,
      addOrUpdateAddon,
      removeAddon
    });
    const main_product = window.Alpine.store("main_product");
    window.Alpine.magic("main_product", () => main_product);
    window._stores["main_product"] = main_product;
  }
  init = false;
  return {
    state,
    card,
    bundle,
    settings,
    showConditionally,
    handleAddToCart,
    handleBackInStockNotification,
    styleDynamicBuyButton,
    setSelectedVariant,
    setProductOption,
    setSiblingProduct,
    setSellingPlan,
    setQuantity,
    handleStickyScroll,
    scrollToMediaById,
    openMediaGallery,
    replaceVariantPlaceholders,
    truncateChildren,
    renderComplementaryProducts,
    hasAvailableVariant,
    getContentLabels,
    getDiscountLabel,
    renderDynamicText,
    addOrUpdateAddon,
    removeAddon
  };
}, "initProduct");
window._sections["initProduct"] = initProduct;
