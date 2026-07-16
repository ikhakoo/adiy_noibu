var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initBundle = /* @__PURE__ */ __name(($el, $refs) => {
  const random_id = utils.shortUUID();
  const columnElements = [$refs.main_content, $refs.sidebar].filter(Boolean);
  const scroll_column_element = columnElements?.reduce(
    (acc, element) => acc?.scrollHeight > element?.scrollHeight ? acc : element
  );
  scroll_column_element?.classList?.remove("lg:sticky-product-section");
  scroll_column_element?.classList?.add("relative");
  const bundle_products = [...$el.querySelectorAll("[data-bundle-product-handle]")]?.map(
    (element) => ({
      element,
      ..._product.getHtmlProduct(element.getAttribute("data-bundle-product-handle"))
    })
  );
  const sort_values = ["day", "week", "month", "year"];
  const selling_plan_options = bundle_products?.reduce(
    (acc, product, i) => {
      product.variants.forEach((variant) => {
        variant.selling_plan_allocations.forEach((allocation) => {
          acc.push(allocation);
        });
      });
      return acc;
    },
    []
  ).filter(
    (a, i, arr) => arr.findIndex((b) => b?.selling_plan?.name === a?.selling_plan?.name) === i
  )?.sort(
    (a, b) => sort_values.findIndex((value) => new RegExp(`${value}`, "gi").test(a.selling_plan.name)) - sort_values.findIndex((value) => new RegExp(`${value}`, "gi").test(b.selling_plan.name))
  );
  const section_settings = utils.JSONParse(
    $el.getAttribute("data-section-settings")
  );
  const select_settings = utils.JSONParse(
    $el.getAttribute("data-select-settings")
  );
  const bundle_targets = utils.JSONParse($el.getAttribute("data-bundle-target")) ?? [];
  const initial_bundle_target_id = bundle_targets?.[0]?.id;
  const initial_target = {
    ...bundle_targets?.[0]
  };
  bundle_targets?.sort((a, b) => a.settings?.target - b?.settings?.target);
  const filters = utils.JSONParse(
    $el.getAttribute("data-bundle-filters")
  ) ?? [];
  const bundle_target_objects = bundle_targets?.reduce((acc, item, i) => {
    acc[item.id] = item.settings;
    return acc;
  }, {});
  const incentive_targets = utils.JSONParse(
    $el.getAttribute("data-incentive-target")
  ) ?? [];
  const bundle_type = section_settings.bundle_target_type;
  const state = window.Alpine.reactive({
    upsell_products: [],
    quiz_items: window._quiz?.products ?? [],
    items_added: window._quiz?.products?.map((product) => ({
      product,
      variant: product.variants?.find((v) => +v.id === +product?.selected_variant_id) ?? product?.variants?.[0]
    })) ?? [],
    bundle_target_titles: [],
    item_added_summary: [],
    scroll_column_element,
    bundle_target_id: initial_bundle_target_id,
    total_price: 0,
    discounted_price: 0,
    current_wording: "",
    difference_wording: "",
    target_wording: "",
    final_price: 0,
    subscription_price_before_discounts: 0,
    subscription_price: 0,
    before_discounts_price: 0,
    selling_plan_discount_wording: "",
    selling_plan_discount_wording_old: "",
    target_discount_wording: "",
    active_target_discount_wording: "",
    discount_wording: "",
    active_discount_wording: "",
    item_count: 0,
    target_difference: "",
    selling_plan_options,
    selected_selling_plan: null,
    bundle_target: initial_target?.settings,
    achieved_bundle_target: null,
    incentive_target: incentive_targets?.[0],
    selling_plan_duration: "",
    isAdding: false,
    items_added_to_cart: false,
    show_mobile_details: false,
    active_filters: [],
    addToBundle: /* @__PURE__ */ __name(() => {
    }, "addToBundle"),
    removeFromBundle: /* @__PURE__ */ __name(() => {
    }, "removeFromBundle")
  });
  const getTargetTitles = /* @__PURE__ */ __name(() => {
    return bundle_targets?.map((item) => {
      const lowestPrice = Math.min(...bundle_products.map((product) => product.price_min));
      const highestPrice = Math.max(
        ...bundle_products.map((product) => product.price_max ?? product.price)
      );
      const priceVaries = (state?.final_price || lowestPrice) !== (state?.total_price || highestPrice);
      return item.label?.trim() ? `<span class="flex gap-2 w-full items-center">${utils.unescape(
        item.label?.replace(
          "[price]",
          `<span>${utils.formatMoney(
            state?.final_price || (lowestPrice - (item?.settings?.discount_percentage ?? 0) / 100 * lowestPrice - (item?.settings?.discount_amount ?? 0)) * (section_settings?.bundle_target_type === "item_count" ? item.settings?.target : 1)
          )}</span>`
        ).replace(
          "[compare_at_price]",
          `<span class="opacity-50 line-through">${utils.formatMoney(
            state?.total_price || lowestPrice * (section_settings?.bundle_target_type === "item_count" ? item.settings?.target : 1)
          )}</span>`
        )
      )}</span>` : `<span class="flex items-center gap-2">
     ${section_settings?.bundle_target_type === "total_price" && item.settings?.target ? `<span>Spend ${utils.formatMoney(item.settings?.target)}</span>` : ""}
     ${section_settings?.bundle_target_type === "item_count" ? `<span>${item.settings?.target} ${item.settings?.target === 1 ? "item" : "items"}</span>` : ""}
     ${item?.settings?.discount_percentage > 0 && select_settings?.discount_label?.trim() ? `<span class="${select_settings?.discount_label}">${item?.settings?.discount_percentage}% off</span>` : ""}
     ${item?.settings?.discount_amount > 0 && select_settings?.discount_label?.trim() ? `<span class="${select_settings?.discount_label}">${utils.formatMoney(
        item?.settings?.discount_percentage
      )} off</span>` : ""} 
     ${select_settings?.price_content ? `<span class="flex-1 flex justify-end gap-2">
         ${select_settings?.price_content?.replace(
        "[price]",
        `<span>${utils.formatMoney(
          state?.final_price || (lowestPrice - (item?.settings?.discount_percentage ?? 0) / 100 * lowestPrice - (item?.settings?.discount_amount ?? 0)) * (section_settings?.bundle_target_type === "item_count" ? item.settings?.target : 1)
        )}</span>`
      ).replace(
        "[compare_at_price]",
        priceVaries ? `<span class="opacity-50 line-through">${utils.formatMoney(
          state?.total_price || lowestPrice * (section_settings?.bundle_target_type === "item_count" ? item.settings?.target : 1)
        )}</span>` : ""
      )}` : ""}
    </span>`?.replace(/\n/gi, "").trim();
    });
  }, "getTargetTitles");
  state.bundle_target_titles = getTargetTitles();
  window.Alpine.effect(() => {
    state.item_count = state.items_added?.length;
    state.total_price = state.items_added.reduce(
      (acc, item) => acc += item?.price_override ?? item.variant?.price,
      0
    );
    state.achieved_bundle_target = [...bundle_targets].sort((a, b) => b.settings?.target - a?.settings?.target)?.find((bundle) => bundle.settings.target <= state?.[bundle_type])?.settings;
    state.selling_plan_options = (state.item_count ? state.items_added?.map(({ product, variant }) => ({ ...product, variants: [variant] })) : bundle_products)?.reduce(
      (acc, product, i) => {
        product.variants?.forEach((variant) => {
          variant?.selling_plan_allocations?.forEach((allocation) => {
            acc.push(allocation);
          });
        });
        return acc;
      },
      []
    ).filter(
      (a, i, arr) => arr.findIndex((b) => b?.selling_plan?.name === a?.selling_plan?.name) === i
    )?.sort(
      (a, b) => sort_values.findIndex((value) => new RegExp(`${value}`, "gi").test(a.selling_plan.name)) - sort_values.findIndex((value) => new RegExp(`${value}`, "gi").test(b.selling_plan.name))
    );
    if (state.selected_selling_plan) {
      state.selected_selling_plan = state.selling_plan_options?.some(
        (item) => item.selling_plan.name === state.selected_selling_plan
      ) ? state.selected_selling_plan : selling_plan_options?.[0]?.selling_plan?.name;
    }
    if (!state.selling_plan_options?.length) {
      state.selected_selling_plan = null;
    }
    const subscription_price = state.items_added.reduce((acc, item) => {
      acc = acc + (item?.price_override ?? item.variant?.selling_plan_allocations?.find(
        (plan) => plan?.selling_plan?.name === (state.selected_selling_plan ?? state.selling_plan_options?.[0]?.selling_plan?.name)
      )?.price ?? item.variant?.price);
      return acc;
    }, 0);
    state.discounted_price = state.total_price - (state.achieved_bundle_target?.discount_amount ?? 0) - state.total_price * ((state?.achieved_bundle_target?.discount_percentage ?? 0) / 100);
    state.subscription_price_before_discounts = subscription_price;
    state.subscription_price = subscription_price - (state.achieved_bundle_target?.discount_amount ?? 0) - subscription_price * ((state?.achieved_bundle_target?.discount_percentage ?? 0) / 100);
    state.before_discounts_price = state.selected_selling_plan ? state.subscription_price_before_discounts : state.total_price;
    state.final_price = state.selected_selling_plan ? state.subscription_price : state.discounted_price;
    state.target_difference = bundle_type === "item_count" ? state.bundle_target?.target - state.item_count > 0 ? `${state.bundle_target?.target - state.item_count}` : "" : state.bundle_target?.target - state.total_price ? `${utils.formatMoney(state.bundle_target?.target - state.item_count)}` : "";
    state.target_wording = bundle_type === "item_count" ? `${state.bundle_target?.target}` : utils.formatMoney(state.bundle_target?.target);
    state.current_wording = bundle_type === "item_count" ? `${state.item_count}` : utils.formatMoney(state.total_price);
    state.difference_wording = bundle_type === "item_count" ? `${state.bundle_target?.target - state.item_count}` : utils.formatMoney(state.bundle_target?.target - state.total_price);
    state.selling_plan_discount_wording_old = state.subscription_price < state.discounted_price ? `Save ${utils.formatMoney(state.discounted_price - state.subscription_price)}` : "";
    state.selling_plan_discount_wording = state.bundle_target?.discount_amount ? `Save ${utils.formatMoney(state.bundle_target?.discount_amount)}` : state?.bundle_target?.discount_percentage ? `${state?.bundle_target?.discount_percentage}% off` : "";
    state.target_discount_wording = state.bundle_target?.discount_amount ? `Save ${utils.formatMoney(state.bundle_target?.discount_amount)}` : state?.bundle_target?.discount_percentage ? `${state?.bundle_target?.discount_percentage}% off` : "";
    state.discount_wording = `${utils.roundToIndex(
      (1 - state.final_price / state.total_price) * 100,
      0
    )}% off`;
    state.active_target_discount_wording = state.total_price > state.final_price ? state.target_discount_wording : "";
    state.active_discount_wording = state.total_price > state.final_price ? state.discount_wording : "";
    state.item_added_summary = state?.items_added?.reduce((acc, item) => {
      const addedIndex = acc.findIndex((item2) => item?.variant?.id === item2?.variant?.id);
      if (addedIndex !== -1 && item.price_override === acc[addedIndex]["price_override"]) {
        acc[addedIndex]["quantity"] += 1;
      } else {
        const selling_plan = item.variant?.selling_plan_allocations?.find(
          (plan) => plan.selling_plan?.name === state.selected_selling_plan
        );
        acc.push({
          quantity: 1,
          subscription: selling_plan?.selling_plan?.options?.at(-1)?.value,
          price: selling_plan?.price ?? item.variant?.price,
          compare_at_price: selling_plan?.compare_at_price,
          ...item
        });
      }
      return acc;
    }, []);
    state.bundle_target_titles = getTargetTitles();
  });
  window.Alpine.effect(() => {
    bundle_products.forEach((product) => {
      const showProduct = state.active_filters?.reduce(
        (acc, item) => {
          const filter = filters?.[item.index];
          if (!filter) return acc;
          let target_values = utils.getBracketInputDynamicValue(`[${filter?.filter_data_type}]`, {
            product
          });
          if (!Array.isArray(target_values) && typeof target_values === "string") {
            target_values = target_values.split(",");
          }
          if (!target_values) return acc;
          target_values = target_values?.map((val) => val.toLowerCase().trim());
          const values = filter.filter_value?.split(",").map((val) => val.toLowerCase().trim());
          if (values.some((v) => target_values.includes(v))) {
            return true;
          }
          return acc;
        },
        !state.active_filters?.length
      );
      product.element.classList.toggle("!hidden", !showProduct);
    });
    $el.querySelectorAll("[data-product-group]").forEach((group) => {
      group.classList.toggle(
        "!hidden",
        group.querySelectorAll(".\\!hidden[data-bundle-product-handle]")?.length === group.querySelectorAll("[data-bundle-product-handle]")?.length
      );
    });
  });
  const updateBundleById = /* @__PURE__ */ __name((bundle_id = state.bundle_target_id) => {
    state.bundle_target_id = bundle_id;
    if (state.bundle_target_id || state.items_added?.length) {
      state.bundle_target = bundle_targets.find((target) => {
        if (bundle_type === "item_count") {
          return target.id === state.bundle_target_id && target.settings.target >= state.items_added?.length;
        } else {
          return target.id === state.bundle_target_id;
        }
      })?.settings;
      if (!state.bundle_target && bundle_targets?.length) {
        const bundle_target = [...bundle_targets].sort((a, b) => a.settings.target - b.settings.target).find((target) => {
          if (bundle_type === "item_count") {
            return target.settings.target >= state.items_added?.length;
          } else {
            return true;
          }
        }) ?? [...bundle_targets].sort((a, b) => b.settings.target - a.settings.target)?.[0];
        state.bundle_target = bundle_target?.settings;
        state.bundle_target_id = bundle_target?.id;
      }
    }
  }, "updateBundleById");
  const addToBundle = /* @__PURE__ */ __name(({
    product,
    variant,
    price
  }) => {
    if (variant?.inventory_management && variant?.inventory_policy !== "continue") {
      const quantity_added = state.items_added.reduce((acc, item) => {
        if (item?.variant?.id === variant.id) {
          acc += 1;
        }
        return acc;
      }, 0);
      if (variant.inventory_quantity - quantity_added < 1) {
        _stores.toast.addToast({
          type: "error",
          title: "Not enough inventory",
          content: "It looks like you already added the item and the inventory limit has been reached."
        });
        return;
      }
    }
    if (section_settings.restrict_bundle_quantity === "hard_limit") {
      if (state?.[bundle_type] < state.bundle_target?.target) {
        state.items_added.push({ product, variant, price_override: price });
      }
      return;
    }
    if (section_settings.restrict_bundle_quantity === "upgrade_limit") {
      const lastBundleTarget = [...bundle_targets].sort((a, b) => a?.settings?.target - b?.settings?.target)?.at(-1);
      if (state?.[bundle_type] < lastBundleTarget?.settings?.target) {
        state.items_added.push({ product, variant, price_override: price });
      } else {
        _stores.toast.addToast({
          type: "warning",
          title: "Your Bundle is already complete!"
        });
        return;
      }
    }
    if (section_settings.restrict_bundle_quantity === "no_limit") {
      state.items_added.push({ product, variant, price_override: price });
    }
    updateBundleById();
  }, "addToBundle");
  const removeFromBundle = /* @__PURE__ */ __name(({
    product,
    variant
  }) => {
    const index = state.items_added?.findLastIndex(
      (item) => item?.variant?.id === variant?.id && item.product.id === product.id
    );
    state.items_added.splice(index, 1);
  }, "removeFromBundle");
  const setSellingPlan = /* @__PURE__ */ __name((name) => {
    state.selected_selling_plan = name;
  }, "setSellingPlan");
  const handleStickyScroll = /* @__PURE__ */ __name(() => {
    [$refs.main_content, $refs.sidebar].forEach((element) => {
      if (!element || !element.classList.contains("lg:sticky-product-section")) return;
      if (state.scroll_column_element.getBoundingClientRect().bottom - 96 < element.scrollHeight - element.scrollTop) {
        element.style.maxHeight = "unset";
      } else {
        element.style.maxHeight = "";
      }
    });
  }, "handleStickyScroll");
  const handleAddToCart = /* @__PURE__ */ __name(async (action) => {
    state.isAdding = true;
    const data = await _cart.add({
      items: state.items_added?.map((item) => {
        return {
          id: item?.variant?.id,
          properties: {
            _bundle_id: random_id,
            Bundle: state.achieved_bundle_target?.label
          },
          quantity: 1,
          selling_plan: item.variant?.selling_plan_allocations?.find(
            (plan) => plan?.selling_plan?.name === state.selected_selling_plan
          )?.selling_plan?.id
        };
      })
    });
    if (data.cart_error) {
      state.isAdding = false;
      return;
    }
    if (action === "add_to_cart") {
      _stores.modal.setId("cart-drawer");
      _stores.productDrawer.open = false;
      _stores.quickView.open = false;
    }
    if (action === "checkout") {
      document.querySelector(
        '[data-cart-drawer-checkout-form] button[name="checkout"]'
      )?.click();
      state.isAdding = false;
      state.items_added_to_cart = true;
      await utils.delay(3500);
      state.items_added_to_cart = false;
      return;
    }
    state.items_added = [];
    state.scroll_column_element = scroll_column_element;
    state.bundle_target_id = bundle_targets?.[0]?.id;
    state.total_price = 0;
    state.discounted_price = 0;
    state.final_price = 0;
    state.subscription_price = 0;
    state.selling_plan_discount_wording = "";
    state.discount_wording = "";
    state.item_count = 0;
    state.target_difference = "";
    state.selling_plan_options = selling_plan_options;
    state.selected_selling_plan = null;
    state.bundle_target = bundle_targets?.[0]?.settings;
    state.achieved_bundle_target = null;
    state.incentive_target = bundle_targets?.[0];
    state.selling_plan_duration = "";
    state.isAdding = false;
    state.show_mobile_details = false;
    state.items_added_to_cart = true;
    state.active_filters = [];
    await utils.delay(3500);
    state.items_added_to_cart = false;
  }, "handleAddToCart");
  const toggleFilter = /* @__PURE__ */ __name(async (index, value) => {
    const current_filter = state.active_filters?.findIndex(
      (filter) => filter?.value === value && filter?.index === index
    );
    if (current_filter !== -1) {
      state.active_filters.splice(current_filter, 1);
    } else {
      state.active_filters.push({ value, index });
    }
  }, "toggleFilter");
  const showConditionally = /* @__PURE__ */ __name((show_conditionally) => {
    if (!show_conditionally) {
      return true;
    }
    switch (show_conditionally) {
      case "opened":
        return state.show_mobile_details;
      case "closed":
        return !state.show_mobile_details;
      case "always": {
        return true;
      }
    }
  }, "showConditionally");
  const showBasedOnBundleState = /* @__PURE__ */ __name((show_based_on_bundle_state) => {
    if (!show_based_on_bundle_state) {
      return true;
    }
    switch (show_based_on_bundle_state) {
      case "always":
        return true;
      case "bundle_empty":
        return state[bundle_type] === 0;
      case "some_items_added":
        return state[bundle_type] > 0;
      case "items_added":
        return state[bundle_type] > 0 && state[bundle_type] < state?.bundle_target?.target;
      case "bundle_complete":
        return state[bundle_type] >= state?.bundle_target?.target;
    }
  }, "showBasedOnBundleState");
  const renderUpsellProducts = /* @__PURE__ */ __name(async (element, target_product, primary_source, secondary_source, product_class, limit) => {
    const fallback_products = utils.JSONParse(
      element.getAttribute("data-fallback-products")
    );
    const products = [];
    const complementary_products = [];
    const related_products = [];
    switch (target_product) {
      case "ai": {
        const expensive = [...state.quiz_items].sort((a, b) => b.price - a.price).slice(0, 3);
        const recent = state.quiz_items.slice(0, 2).sort((a, b) => b.price - a.price);
        [...recent, ...expensive]?.forEach((line, parentIndex) => {
          const product = state.quiz_items?.find((p) => p.handle === line.handle);
          product?.complementary_products?.forEach((item, i) => {
            if (i >= 2 || i >= 1 && parentIndex >= 2) {
              return;
            }
            complementary_products.push(item);
          });
          product?.related_products?.forEach((item, i) => {
            if (i >= 2 || i >= 1 && parentIndex >= 2) {
              return;
            }
            related_products.push(item);
          });
        });
        break;
      }
      case "most_expensive": {
        [...state.quiz_items].sort((a, b) => b.price - a.price)?.forEach((product, parentIndex) => {
          product?.complementary_products?.forEach((item, i) => {
            if (i >= 2 || i >= 1 && parentIndex >= 2) {
              return;
            }
            complementary_products.push(item);
          });
          product?.related_products?.forEach((item, i) => {
            if (i >= 2 || i >= 1 && parentIndex >= 2) {
              return;
            }
            related_products.push(item);
          });
        });
        break;
      }
      case "least_expensive": {
        [...state.quiz_items].sort((a, b) => a.price - b.price)?.forEach((product, parentIndex) => {
          product?.complementary_products?.forEach((item, i) => {
            if (i >= 2 || i >= 1 && parentIndex >= 2) {
              return;
            }
            complementary_products.push(item);
          });
          product?.related_products?.forEach((item, i) => {
            if (i >= 2 || i >= 1 && parentIndex >= 2) {
              return;
            }
            related_products.push(item);
          });
        });
        break;
      }
      case "recently_added": {
        state.quiz_items?.forEach((product, parentIndex) => {
          product?.complementary_products?.forEach((item, i) => {
            if (i >= 2 || i >= 1 && parentIndex >= 2) {
              return;
            }
            complementary_products.push(item);
          });
          product?.related_products?.forEach((item, i) => {
            if (i >= 2 || i >= 1 && parentIndex >= 2) {
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
    const renderProducts = products?.filter((prod) => !state.quiz_items.some((item) => item.id === prod.id))?.filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i)?.filter(
      (prod, index) => prod.handle !== element.children?.[index]?.getAttribute("data-product-handle")
    )?.slice(0, limit) ?? [];
    state.upsell_products = renderProducts;
    if (!renderProducts.length) {
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
      }
    });
  }, "renderUpsellProducts");
  state.addToBundle = addToBundle;
  state.removeFromBundle = removeFromBundle;
  if (window?._bundle_auto_add_items) {
    window._bundle_auto_add_items.forEach((item) => {
      addToBundle({
        product: item.product,
        variant: item.variant[0] ?? item.product?.variants?.[0]
      });
    });
    window._bundle_auto_add_items = [];
  }
  return {
    bundle: state,
    bundle_targets,
    bundle_target_objects,
    incentive_targets,
    section_settings,
    bundle_type,
    selling_plan_options,
    addToBundle,
    removeFromBundle,
    setSellingPlan,
    handleStickyScroll,
    updateBundleById,
    handleAddToCart,
    toggleFilter,
    showConditionally,
    showBasedOnBundleState,
    renderUpsellProducts
  };
}, "initBundle");
window._sections["initBundle"] = initBundle;
