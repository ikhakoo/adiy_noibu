var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// assets/polyfills.ts
var supported = typeof window === "undefined" ? true : "onscrollend" in window;
if (!supported) {
  let observe = function(proto, method, handler) {
    const native = proto[method];
    proto[method] = function() {
      const args = Array.prototype.slice.apply(arguments, [0]);
      native.apply(this, args);
      args.unshift(native);
      handler.apply(this, args);
    };
  }, onAddListener = function(originalFn, type, handler, options) {
    if (type != "scroll" && type != "scrollend") return;
    const scrollport = this;
    let data = observed.get(scrollport);
    if (data === void 0) {
      let timeout = 0;
      data = {
        scrollListener: /* @__PURE__ */ __name((evt) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            if (pointers.size) {
              setTimeout(data.scrollListener, 180);
            } else {
              if (scrollport) {
                scrollport.dispatchEvent(scrollendEvent);
              }
              timeout = 0;
            }
          }, 180);
        }, "scrollListener"),
        listeners: 0
        // Count of number of listeners.
      };
      originalFn.apply(scrollport, ["scroll", data.scrollListener]);
      observed.set(scrollport, data);
    }
    data.listeners++;
  }, onRemoveListener = function(originalFn, type, handler) {
    if (type != "scroll" && type != "scrollend") return;
    const scrollport = this;
    const data = observed.get(scrollport);
    if (data === void 0) return;
    data[type]--;
    if (--data.listeners > 0) return;
    originalFn.apply(scrollport, ["scroll", data.scrollListener]);
    observed.delete(scrollport);
  };
  observe2 = observe, onAddListener2 = onAddListener, onRemoveListener2 = onRemoveListener;
  __name(observe, "observe");
  __name(onAddListener, "onAddListener");
  __name(onRemoveListener, "onRemoveListener");
  const scrollendEvent = new Event("scrollend");
  const pointers = /* @__PURE__ */ new Set();
  document.addEventListener(
    "touchstart",
    (e) => {
      for (const touch of e.changedTouches) pointers.add(touch.identifier);
    },
    { passive: true }
  );
  document.addEventListener(
    "touchend",
    (e) => {
      for (const touch of e.changedTouches) pointers.delete(touch.identifier);
    },
    { passive: true }
  );
  document.addEventListener(
    "touchcancel",
    (e) => {
      for (const touch of e.changedTouches) pointers.delete(touch.identifier);
    },
    { passive: true }
  );
  const observed = /* @__PURE__ */ new WeakMap();
  observe(Element.prototype, "addEventListener", onAddListener);
  observe(window, "addEventListener", onAddListener);
  observe(document, "addEventListener", onAddListener);
  observe(Element.prototype, "removeEventListener", onRemoveListener);
  observe(window, "removeEventListener", onRemoveListener);
  observe(document, "removeEventListener", onRemoveListener);
}
var observe2;
var onAddListener2;
var onRemoveListener2;

// assets/accessibility.ts
var initAccessibility = /* @__PURE__ */ __name(() => {
  document.querySelectorAll(`[role="button"], [role="link"], [data-icon-handle]`).forEach((element) => {
    element.onkeydown = (event) => {
      if (element.role !== "link" && element.role !== "button") {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        element.dispatchEvent(new Event("click"));
      }
    };
  });
}, "initAccessibility");

// assets/init-product-drawer.ts
var initProductDrawer = /* @__PURE__ */ __name(() => {
  window.Alpine.store("productDrawer", {
    open: false,
    product: _products[Object.keys(_products)[0]],
    openProductDrawer({ product = _products[Object.keys(_products)[0]] }) {
      this.product = product;
      this.open = true;
    }
  });
  const productDrawerStore = window.Alpine.store("productDrawer");
  window.Alpine.magic("productDrawer", () => productDrawerStore);
  window._stores["productDrawer"] = productDrawerStore;
}, "initProductDrawer");

// assets/media-gallery.ts
var initMediaGallery = /* @__PURE__ */ __name(() => {
  window.Alpine.store("mediaGallery", {
    open: false,
    media: _products[Object.keys(_products)[0]]?.media ?? [],
    index: 0,
    scrollIndex: 0,
    openGallery({ media = [], index = 0 }) {
      this.media = media;
      this.open = true;
      this.index = index;
      this.scrollIndex = index;
    }
  });
  const mediaGalleryStore = window.Alpine.store("mediaGallery");
  Alpine.effect(() => {
    if (!mediaGalleryStore.open && mediaGalleryStore.media.length) {
      mediaGalleryStore.media = [];
    }
  });
  window.Alpine.magic("mediaGallery", () => mediaGalleryStore);
  window._stores["mediaGallery"] = mediaGalleryStore;
}, "initMediaGallery");

// assets/quick-view.ts
var initQuickView = /* @__PURE__ */ __name(() => {
  window.Alpine.store("quickView", {
    open: false,
    loading: false,
    handle: "",
    dynamic_popups: [],
    container: document.querySelector("[data-quick-view-container]"),
    show_all_container: document.querySelector("[data-quick-view-show-more]"),
    loading_container: document.querySelector("[data-quick-view-loading]"),
    async renderQuickView(handle, $data, bundleButton, variantId) {
      const container = this.container;
      this.handle = handle;
      this.open = true;
      this.loading_container.classList.remove("opacity-0", "pointer-events-none");
      if (!handle || !container) return;
      const cacheKey = `${window.location.origin}/products/${handle}`;
      let cache = barba.cache.get(cacheKey);
      if (!cache?.request) {
        const keys = await idbKeyval.keys();
        const key = keys.find((key2) => key2.includes(cacheKey));
        if (key) {
          cache = barba.cache.set(
            cacheKey,
            idbKeyval?.get(key)?.then((res) => res?.data),
            "prefetch"
          );
        }
      }
      if (!cache?.request) {
        const data = fetch(cacheKey, { cache: "force-cache" }).then((res) => res.text()).then((html2) => ({
          html: html2,
          url: { hash: void 0, href: cacheKey, path: `/products/${handle}` }
        }));
        cache = barba.cache.set(cacheKey, data, "prefetch");
        document.dispatchEvent(
          new CustomEvent("barba:prefetch:fulfilled", { detail: { url: cacheKey } })
        );
      }
      let request = await cache?.request;
      let html = request?.html;
      if (!html) {
        const data = fetch(cacheKey, { cache: "force-cache" }).then((res) => res.text()).then((html2) => ({
          html: html2,
          url: { hash: void 0, href: cacheKey, path: `/products/${handle}` }
        }));
        cache = barba.cache.set(cacheKey, data, "prefetch");
        request = await cache?.request;
        html = request?.html;
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
      const sideContent = section.querySelector('[x-ref="content"]');
      sideContent.classList.add("max-h-full", "overflow-y-auto");
      section.setAttribute("data-quick-view", "true");
      this.loading_container.classList.add("opacity-0", "pointer-events-none");
      container.innerHTML = productData.outerHTML + section?.outerHTML;
      const stateElement = container.querySelector('[data-section-type="product"]');
      if ($data && bundleButton && stateElement) {
        stateElement.querySelectorAll(
          '[data-block-type="quantity_selector"], [data-block-type="complementary_products"]'
        ).forEach((el) => {
          el.remove();
        });
        stateElement.querySelectorAll(`[data-block-type="add_to_cart_button"]`).forEach((element) => {
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
    }
  });
  const quickViewStore = window.Alpine.store("quickView");
  const handleKeydown = /* @__PURE__ */ __name((e) => {
    if (e.key === "Escape") {
      quickViewStore.open = false;
    }
  }, "handleKeydown");
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
}, "initQuickView");

// assets/scrollbar.ts
var initScrollBar = /* @__PURE__ */ __name(() => {
}, "initScrollBar");
var _scrollbar = {
  init: /* @__PURE__ */ __name((bar, thumb, container, scroll_speed = 150) => {
    const state = window.Alpine.reactive({
      currentPage: Math.max(
        1,
        Math.min(
          [...container.children]?.filter(
            (child) => getComputedStyle(child).display !== "none" && getComputedStyle(child).scrollSnapAlign !== "none"
          ).length,
          [...container.children]?.filter(
            (child) => getComputedStyle(child).display !== "none" && getComputedStyle(child).scrollSnapAlign !== "none"
          ).findIndex((child) => {
            const center = container.clientWidth / 2 + container.scrollLeft;
            const start = container.scrollLeft + +getComputedStyle(container).scrollPaddingLeft.replace("px", "").replace("auto", "0");
            if (container.children.length > Math.round(container.scrollWidth / container.clientWidth * 100) / 100) {
              return child.offsetLeft - 5 <= start && child.offsetLeft + child.clientWidth > start;
            }
            return child.offsetLeft < center && child.offsetLeft + child.clientWidth > center;
          }) + 1
        )
      ),
      pages: [...container.children]?.filter(
        (child) => getComputedStyle(child).display !== "none" && getComputedStyle(child).scrollSnapAlign !== "none"
      ).length,
      width: container.clientWidth / container.scrollWidth * 100,
      left: container.scrollLeft / container.scrollWidth * bar.clientWidth / bar.clientWidth,
      manual_scroll: false,
      no_next_page: container?.scrollLeft + container?.clientWidth + 25 >= container?.scrollWidth
    });
    const calculatePosition = /* @__PURE__ */ __name(() => {
      const children = [...container?.children ?? []].filter((el) => el.tagName !== "STYLE");
      state.currentPage = Math.max(
        1,
        Math.min(
          children?.filter(
            (child) => getComputedStyle(child).display !== "none" && getComputedStyle(child).scrollSnapAlign !== "none"
          ).length,
          children?.filter(
            (child) => getComputedStyle(child).display !== "none" && getComputedStyle(child).scrollSnapAlign !== "none"
          ).findIndex((child) => {
            const center = container.clientWidth / 2 + container.scrollLeft;
            const start = container.scrollLeft + +getComputedStyle(container).scrollPaddingLeft.replace("px", "").replace("auto", "0");
            if (children.length > Math.round(container.scrollWidth / container.clientWidth * 100) / 100) {
              return child.offsetLeft - 5 <= start && child.offsetLeft + child.clientWidth > start;
            }
            return child.offsetLeft < center && child.offsetLeft + child.clientWidth > center;
          }) + 1
        )
      );
      state.pages = children?.filter((child) => getComputedStyle(child).display !== "none").length;
      state.width = container.clientWidth / container.scrollWidth;
      state.left = container.scrollLeft / container.scrollWidth * bar.clientWidth / bar.clientWidth;
      state.no_next_page = state.currentPage === state.pages || container?.scrollLeft + container?.clientWidth + 25 >= container?.scrollWidth;
    }, "calculatePosition");
    const handleScrollBarClick = /* @__PURE__ */ __name((e, content_slider) => {
      const percentage = (e.clientX - bar.getBoundingClientRect().left) / bar.clientWidth - state.width / 2 * bar.clientWidth / bar.clientWidth;
      if (content_slider?.state) {
        content_slider.state.block_scroll_events = true;
      }
      container.scrollTo({
        left: percentage * container.scrollWidth,
        behavior: "instant"
      });
      if (content_slider?.state) {
        content_slider.state.block_scroll_events = false;
      }
      calculatePosition();
    }, "handleScrollBarClick");
    const handleScrollThumbPointerDown = /* @__PURE__ */ __name((e, content_slider) => {
      container.style.scrollSnapType = "none";
      const startX = e.clientX;
      const startLeft = state.left * bar.clientWidth;
      document.body.classList.add("[&_*]:!cursor-grabbing");
      thumb.classList.add("active");
      if (content_slider?.state) {
        content_slider.state.block_scroll_events = true;
      }
      const handleDocumentPointerMove = /* @__PURE__ */ __name((e2) => {
        const percentage = Math.max(
          0,
          Math.min(1, (startLeft + e2.clientX - startX) / bar.clientWidth)
        );
        container.scrollTo({
          left: percentage * container.scrollWidth,
          behavior: "instant"
        });
        calculatePosition();
      }, "handleDocumentPointerMove");
      const handleDocumentPointerUp = /* @__PURE__ */ __name((e2) => {
        removeEventListeners();
      }, "handleDocumentPointerUp");
      const removeEventListeners = /* @__PURE__ */ __name(() => {
        document.body.classList.remove("[&_*]:!cursor-grabbing");
        thumb.classList.remove("active");
        container.style.scrollSnapType = "";
        document.removeEventListener("pointermove", handleDocumentPointerMove);
        document.removeEventListener("pointerup", handleDocumentPointerUp);
        if (content_slider?.state) {
          content_slider.state.block_scroll_events = false;
        }
      }, "removeEventListeners");
      document.addEventListener("pointermove", handleDocumentPointerMove);
      document.addEventListener("pointerup", handleDocumentPointerUp);
    }, "handleScrollThumbPointerDown");
    const handlePrevClick = /* @__PURE__ */ __name((e, content_slider) => {
      container.style.scrollSnapType = "none";
      if (content_slider?.state) {
        content_slider.state.block_scroll_events = true;
      }
      const activeChildren = [...container.children]?.filter(
        (child) => getComputedStyle(child).display !== "none" && getComputedStyle(child).scrollSnapAlign !== "none" && child.tagName !== "STYLE"
      );
      utils.scrollToX(
        scroll_speed,
        (activeChildren[Math.max(
          0,
          state.currentPage - 2 < 0 ? activeChildren?.length - 1 : state.currentPage - 2
        )]?.offsetLeft ?? 0) - +getComputedStyle(container).scrollPaddingLeft.replace("px", "").replace("auto", "0"),
        container,
        () => {
          container.style.scrollSnapType = "";
          calculatePosition();
          if (content_slider?.state) {
            content_slider.state.block_scroll_events = false;
          }
        }
      );
    }, "handlePrevClick");
    const handleNextClick = /* @__PURE__ */ __name((e, content_slider) => {
      container.style.scrollSnapType = "none";
      if (content_slider?.state) {
        content_slider.state.block_scroll_events = true;
      }
      const activeChildren = [...container.children]?.filter(
        (child) => getComputedStyle(child).display !== "none" && getComputedStyle(child).scrollSnapAlign !== "none" && child.tagName !== "STYLE"
      );
      utils.scrollToX(
        scroll_speed,
        (activeChildren[Math.min(
          activeChildren.length - 1,
          state.currentPage === activeChildren?.length ? 0 : state.currentPage
        )]?.offsetLeft ?? 0) - +getComputedStyle(container).scrollPaddingLeft.replace("px", "").replace("auto", "0"),
        container,
        () => {
          container.style.scrollSnapType = "";
          calculatePosition();
          if (content_slider?.state) {
            content_slider.state.block_scroll_events = false;
          }
        }
      );
    }, "handleNextClick");
    container.onscroll = (e) => {
      calculatePosition();
    };
    const mutationObserver = new MutationObserver((e) => {
      calculatePosition();
    });
    mutationObserver.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
    const resizeObserver = new ResizeObserver((e) => {
      calculatePosition();
    });
    resizeObserver.observe(container, { box: "content-box" });
    calculatePosition();
    return {
      handleScrollBarClick,
      handleScrollThumbPointerDown,
      handlePrevClick,
      handleNextClick,
      scrollbar: state,
      containerRef: container
    };
  }, "init")
};
window._scrollbar = _scrollbar;

// assets/smooth-scroll.ts
var initSmoothScroll = /* @__PURE__ */ __name(() => {
  const elements = /* @__PURE__ */ new Set();
  const initEvents = /* @__PURE__ */ __name((target = document) => {
    const links = target.querySelectorAll(
      `[href*="#"]:not([href*="#modal--"], [href*="#popup--"], [href*="#drawer--"], use)`
    );
    links.forEach((link) => {
      if (typeof link.href !== "string") {
        return;
      }
      if (elements.has(link)) {
        return;
      }
      elements.add(link);
      if (utils.isExternalURL(link.href)) {
        return;
      }
      const id = link?.href?.split("#")?.at(1)?.split(/[?&]/)?.at(0);
      const target2 = document.getElementById(id);
      if (!target2) {
        return;
      }
      link.onclick = (e) => {
        const target3 = document.getElementById(id);
        if (utils.isElementScrollable(target3.parentElement) && utils.isVisible(target3.parentElement) && utils.isInViewport(target3)) {
          if (target3.parentElement.scrollWidth > target3.parentElement.offsetWidth) {
            utils.scrollToXY(
              260,
              target3.offsetLeft,
              target3.parentElement?.scrollTop,
              target3.parentElement
            );
          }
          if (target3.parentElement.scrollHeight > target3.parentElement.offsetHeight) {
            utils.scrollToXY(
              260,
              target3.parentElement?.scrollLeft,
              target3.offsetTop,
              target3.parentElement
            );
          }
          return;
        }
        const targetPosition = utils.getElementPosition(target3)?.top - Math.max(
          0,
          document.querySelector(".header-sections-container")?.getBoundingClientRect()?.bottom ?? 0
        );
        utils.scrollToY(
          260 + Math.abs(Math.round((window.scrollY - targetPosition) / 15)),
          targetPosition
        );
      };
    });
  }, "initEvents");
  const mutationObserver = new MutationObserver((e) => {
    e?.forEach((record) => {
      const nodes = [];
      if (record?.addedNodes?.length && record?.target instanceof Element) {
        initEvents(record.target);
      }
    });
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
  initEvents();
}, "initSmoothScroll");

// assets/utils.ts
var JSONParse = /* @__PURE__ */ __name((object, origin = "") => {
  try {
    return JSON.parse(object);
  } catch (err) {
    return null;
  }
}, "JSONParse");
var getImageSrcSet = /* @__PURE__ */ __name((src, maxWidth) => {
  if (!src) {
    return "";
  }
  if (src.includes("?")) {
    return [48, 96, 256, 384, 460, 640, 1200, 1920, 3840].map((number, index, arr) => {
      if (maxWidth && arr[index - 1] > maxWidth) {
        return null;
      }
      return `${src}&width=${number} ${number}w`;
    })?.filter((d) => !!d).join(",");
  }
  return [48, 96, 256, 384, 460, 640, 1200, 1920, 3840].map((number, index, arr) => {
    if (maxWidth && arr[index - 1] > maxWidth) {
      return null;
    }
    return `${src}?width=${number} ${number}w`;
  })?.filter((d) => !!d).join(",");
}, "getImageSrcSet");
var getReviewStarGradients = /* @__PURE__ */ __name((rating, position) => {
  return `url(#star-rating-${rating < position - 1 ? 0 : rating < position && rating > position - 1 ? Math.floor((rating - (position - 1)) * 100 / 25) * 25 : 100})`;
}, "getReviewStarGradients");
var pushSearchParams = /* @__PURE__ */ __name(({
  update = {},
  remove = [],
  title
}) => {
  const url = new URL(window.location.href);
  Object.entries(update).forEach(([key, value]) => {
    url.searchParams.set(key, `${value}`);
  });
  remove.forEach((key) => {
    url.searchParams.delete(key);
  });
  window.history.pushState(null, null, url);
}, "pushSearchParams");
var replaceSearchParams = /* @__PURE__ */ __name(({
  update = {},
  remove = [],
  title
}) => {
  const url = new URL(window.location.href);
  Object.entries(update).forEach(([key, value]) => {
    url.searchParams.set(key, `${value}`);
  });
  remove.forEach((key) => {
    url.searchParams.delete(key);
  });
  window.history.replaceState(null, null, url);
}, "replaceSearchParams");
var getSiblingUrl = /* @__PURE__ */ __name((handle) => {
  const url = new URL(window.location.href);
  url.pathname = /\/collections\/[^/]\/products\//gi.test(url.pathname) ? url.pathname.replace(/\/products\/[^?]*/gi, `/products/${handle}`) : `/products/${handle}`;
  url.searchParams.delete("variant");
  url.searchParams.delete("selling_plan");
  return url.toString();
}, "getSiblingUrl");
var pushUrlTarget = /* @__PURE__ */ __name((id) => {
  const url = new URL(window.location.href);
  url.hash = id;
  window.history.replaceState(null, null, url);
}, "pushUrlTarget");
var checkDomain = /* @__PURE__ */ __name(function(url) {
  if (url && url?.indexOf("//") === 0) {
    url = location.protocol + url;
  }
  return url.toLowerCase().replace(/([a-z])?:\/\//, "$1").split("/")[0];
}, "checkDomain");
var isExternalURL = /* @__PURE__ */ __name(function(url) {
  if (!url || typeof url !== "string") {
    return false;
  }
  return (url?.indexOf(":") > -1 || url?.indexOf("//") > -1) && checkDomain(location.href) !== checkDomain(url);
}, "isExternalURL");
var transpileRichtextMetafield = /* @__PURE__ */ __name((schema) => {
  function convertSchemaToHtml(schema2) {
    let html = ``;
    if (!Array.isArray(schema2) && schema2.type === "root") {
      html += convertSchemaToHtml(schema2.children);
    }
    if (Array.isArray(schema2)) {
      schema2?.forEach((el) => {
        switch (el.type) {
          case "paragraph":
            html += buildParagraph(el);
            break;
          case "heading":
            html += buildHeading(el);
            break;
          case "list":
            html += buildList(el);
            break;
          case "list-item":
            html += buildListItem(el);
            break;
          case "link":
            html += buildLink(el);
            break;
          case "text":
            html += buildText(el);
            break;
          default:
            break;
        }
      });
    }
    return html;
  }
  __name(convertSchemaToHtml, "convertSchemaToHtml");
  function buildParagraph(el) {
    if (el?.children) {
      return `<p>${convertSchemaToHtml(el?.children)}</p>`;
    }
    return "";
  }
  __name(buildParagraph, "buildParagraph");
  function buildHeading(el) {
    if (el?.children) {
      return `<h${el?.level}>${convertSchemaToHtml(el?.children)}</h${el?.level}>`;
    }
    return "";
  }
  __name(buildHeading, "buildHeading");
  function buildList(el) {
    if (el?.children) {
      if (el?.listType === "ordered") {
        return `<ol>${convertSchemaToHtml(el?.children)}</ol>`;
      } else {
        return `<ul>${convertSchemaToHtml(el?.children)}</ul>`;
      }
    }
    return "";
  }
  __name(buildList, "buildList");
  function buildListItem(el) {
    if (el?.children) {
      return `<li>${convertSchemaToHtml(el?.children)}</li>`;
    }
    return "";
  }
  __name(buildListItem, "buildListItem");
  function buildLink(el) {
    return `<a href="${el?.url}" title="${el?.title}" target="${el?.target}">${convertSchemaToHtml(
      el?.children
    )}</a>`;
  }
  __name(buildLink, "buildLink");
  function buildText(el) {
    if (el?.bold) {
      return `<strong>${el?.value}</strong>`;
    }
    if (el?.italic) {
      return `<em>${el?.value}</em>`;
    }
    return el?.value;
  }
  __name(buildText, "buildText");
  return convertSchemaToHtml(schema);
}, "transpileRichtextMetafield");
var clsx = /* @__PURE__ */ __name((...props) => {
  let i = 0;
  let tmp;
  let str = "";
  const len = props.length;
  for (; i < len; i++) {
    if (tmp = props[i]) {
      if (typeof tmp === "string") {
        str += (str && " ") + tmp;
      }
    }
  }
  return str;
}, "clsx");
var shortUUID = /* @__PURE__ */ __name(() => {
  let firstPart = Math.random() * 46656 | 0;
  let secondPart = Math.random() * 46656 | 0;
  firstPart = `000${firstPart.toString(36)}`.slice(-3);
  secondPart = `000${secondPart.toString(36)}`.slice(-3);
  return firstPart + secondPart;
}, "shortUUID");
var isEmail = /* @__PURE__ */ __name((str) => {
  if (!str) return false;
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(str);
}, "isEmail");
var formatMoney = /* @__PURE__ */ __name((cents, money_format, no_rounding = true) => {
  if (!cents && cents !== 0) {
    return "";
  }
  function n(t, e) {
    return void 0 === t ? e : t;
  }
  __name(n, "n");
  function o(t, e, o2, i2) {
    if (e = n(e, 2), o2 = n(o2, ","), i2 = n(i2, "."), isNaN(t) || null === t) return 0;
    const r2 = (t = (t / 100).toFixed(e)).split(".");
    return r2[0].replace(/\B(?=(\d{3})+(?!\d))/g, o2) + (r2[1] ? i2 + r2[1] : "");
  }
  __name(o, "o");
  "string" === typeof cents && (cents = cents.replace(".", ""));
  let i = "";
  const r = /{{\s*(\w+)\s*}}/;
  const a = money_format || window.money_format || `\${{amount}}`;
  switch (a.match(r)[1]) {
    case "amount":
      i = o(cents, 2);
      break;
    case "amount_no_decimals": {
      if (no_rounding && +cents % 100 > 0) {
        i = o(cents, 2);
        break;
      }
      i = o(cents, 0);
      break;
    }
    case "amount_with_comma_separator":
      i = o(cents, 2, ".", ",");
      break;
    case "amount_with_space_separator":
      i = o(cents, 2, " ", ",");
      break;
    case "amount_with_period_and_space_separator":
      i = o(cents, 2, " ", ".");
      break;
    case "amount_no_decimals_with_comma_separator":
      i = o(cents, 0, ".", ",");
      break;
    case "amount_no_decimals_with_space_separator":
      i = o(cents, 0, " ");
      break;
    case "amount_with_apostrophe_separator":
      i = o(cents, 2, "'", ".");
      break;
    default:
      i = o(cents, 2, ",", ".");
  }
  return a.replace(r, i);
}, "formatMoney");
window["formatMoney"] = formatMoney;
var roundToIndex = /* @__PURE__ */ __name(function(x, index = 0) {
  const power = Math.pow(10, -index);
  return Math.round(x * power) / power;
}, "roundToIndex");
var easeInOutQuad = /* @__PURE__ */ __name(({ currentTime, start, change, duration }) => {
  let newCurrentTime = currentTime;
  newCurrentTime /= duration / 2;
  if (newCurrentTime < 1) {
    return change / 2 * newCurrentTime * newCurrentTime + start;
  }
  newCurrentTime -= 1;
  return -change / 2 * (newCurrentTime * (newCurrentTime - 2) - 1) + start;
}, "easeInOutQuad");
var scrollToY = /* @__PURE__ */ __name((duration, to, container = window, callback = () => {
}) => {
  const start = container instanceof HTMLElement ? container.scrollTop : container.scrollY;
  const change = to - start;
  const startDate = (/* @__PURE__ */ new Date()).getTime();
  const animateScroll = /* @__PURE__ */ __name(() => {
    const currentDate = (/* @__PURE__ */ new Date()).getTime();
    const currentTime = currentDate - startDate;
    container.scrollTo(
      0,
      easeInOutQuad({
        currentTime,
        start,
        change,
        duration
      })
    );
    if (currentTime < duration) {
      requestAnimationFrame(animateScroll);
    } else {
      container.scrollTo(0, to);
      callback();
    }
  }, "animateScroll");
  animateScroll();
}, "scrollToY");
var scrollToX = /* @__PURE__ */ __name((duration, to, container = window, callback = () => {
}) => {
  const start = container instanceof HTMLElement ? container.scrollLeft : container.scrollX;
  const change = to - start;
  const startDate = (/* @__PURE__ */ new Date()).getTime();
  const animateScroll = /* @__PURE__ */ __name(() => {
    const currentDate = (/* @__PURE__ */ new Date()).getTime();
    const currentTime = currentDate - startDate;
    container.scrollTo(
      easeInOutQuad({
        currentTime,
        start,
        change,
        duration
      }),
      0
    );
    if (currentTime < duration) {
      requestAnimationFrame(animateScroll);
    } else {
      container.scrollTo(to, 0);
      callback();
    }
  }, "animateScroll");
  animateScroll();
}, "scrollToX");
var scrollToXY = /* @__PURE__ */ __name((duration, x, y, container = window, callback = () => {
}) => {
  const startX = container instanceof HTMLElement ? container.scrollLeft : container.scrollX;
  const startY = container instanceof HTMLElement ? container.scrollTop : container.scrollY;
  const changeX = x - startX;
  const changeY = y - startY;
  const startDate = Date.now();
  const animateScroll = /* @__PURE__ */ __name(() => {
    const currentDate = Date.now();
    const currentTime = currentDate - startDate;
    container.scrollTo(
      easeInOutQuad({
        currentTime,
        start: startX,
        change: changeX,
        duration
      }),
      easeInOutQuad({
        currentTime,
        start: startY,
        change: changeY,
        duration
      })
    );
    if (currentTime < duration) {
      requestAnimationFrame(animateScroll);
    } else {
      container.scrollTo(x, y);
      callback();
    }
  }, "animateScroll");
  animateScroll();
}, "scrollToXY");
var isElementScrollable = /* @__PURE__ */ __name((element) => {
  if (!element) return false;
  const isScrollableX = element.scrollWidth > element.clientWidth;
  const isScrollableY = element.scrollHeight > element.clientHeight;
  return isScrollableX || isScrollableY;
}, "isElementScrollable");
function getElementPosition(element) {
  const box = element.getBoundingClientRect();
  const body = document.body;
  const docEl = document.documentElement;
  const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
  const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
  const clientTop = docEl.clientTop || body.clientTop || 0;
  const clientLeft = docEl.clientLeft || body.clientLeft || 0;
  const top = box.top + scrollTop - clientTop;
  const left = box.left + scrollLeft - clientLeft;
  return { top: Math.round(top), left: Math.round(left) };
}
__name(getElementPosition, "getElementPosition");
var getElementOffset = /* @__PURE__ */ __name((el) => {
  const rect = el.getBoundingClientRect(), scrollLeft = window.pageXOffset || document.documentElement.scrollLeft, scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}, "getElementOffset");
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
__name(delay, "delay");
var debounce = /* @__PURE__ */ __name((callback, wait = 1) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
}, "debounce");
var findAllScrollableParents = /* @__PURE__ */ __name((element) => {
  const scrollableParents = [];
  let parent = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.getPropertyValue("overflow-y");
    if (overflowY === "auto" || overflowY === "scroll") {
      scrollableParents.push(parent);
    }
    parent = parent.parentElement;
  }
  if (document.scrollingElement) {
    scrollableParents.push(document.scrollingElement);
  }
  scrollableParents.push(window);
  return scrollableParents;
}, "findAllScrollableParents");
var handlelize = /* @__PURE__ */ __name((str) => {
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/([^\w]+|\s+)/g, "-").replace(/--+/g, "-").replace(/(^-+|-+$)/g, "").toLowerCase();
  return str;
}, "handlelize");
var serializeForm = /* @__PURE__ */ __name((formElement) => {
  const obj = {};
  const formData = new FormData(formElement);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return obj;
}, "serializeForm");
var deepEqual = /* @__PURE__ */ __name((a, b) => {
  if (a === b) return true;
  if (a && b && typeof a === "object" && typeof b === "object") {
    if (a.constructor !== b.constructor) return false;
    let length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;
    for (i = length; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    for (i = length; i-- !== 0; ) {
      const key = keys[i];
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return a !== a && b !== b;
}, "deepEqual");
window.clsx = clsx;
var isVisible = /* @__PURE__ */ __name((elem, isParent = false) => {
  if (!(elem instanceof Element)) {
    return false;
  }
  const style = getComputedStyle(elem);
  if (style.display === "none") return false;
  if (!isParent && style.pointerEvents === "none") return false;
  if (style.visibility !== "visible") return false;
  if (+style.opacity < 0.1) return false;
  if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height + elem.getBoundingClientRect().width === 0) {
    return false;
  }
  if (elem.parentElement) {
    return isVisible(elem.parentElement, true);
  }
  return true;
}, "isVisible");
var isInViewport = /* @__PURE__ */ __name((element) => {
  const { y } = element.getBoundingClientRect();
  if (y > window.innerHeight || y < 0) {
    return false;
  }
  return true;
}, "isInViewport");
var renderBracketInputDynamicText = /* @__PURE__ */ __name((content, object = {}) => {
  let returnValue = "";
  returnValue = content?.replace(/\[([^\]]*)\]/gi, (...matches) => {
    if (!matches[1]) {
      return "";
    }
    if (/^icon\./gi.test(matches[1])) {
      return matches[0];
    }
    let result = (
      // @ts-ignore
      matches?.[1]?.split(".")?.reduce(
        (acc, selector, index, arr) => {
          if (!selector || acc[0] === void 0 || acc[0] === null) {
            if (/price$/gi.test(acc[1]) && typeof acc[0] === "number") {
              return [utils2.formatMoney(acc[0]), selector];
            }
            if (/_at$/gi.test(acc[1]) && Date.parse(acc[0])) {
              return [new Date(acc[0]).toLocaleDateString(), selector];
            }
            if (typeof acc[0] === "string" && acc[0].includes("\xAE")) {
              return [
                acc[0].replace(/®/gi, `<sup style="font-size: 0.7em;">\xAE</sup>`),
                selector
              ];
            }
            if (Array.isArray(acc[0]) && acc[0].every((val) => typeof val === "string" || typeof val === "number")) {
              return [acc[0].join(", "), selector];
            }
            return acc;
          }
          if (acc[0] && typeof acc[0] === "object" && selector in acc[0]) {
            if (/price$/gi.test(selector) && typeof acc[0][selector] === "number") {
              return [utils2.formatMoney(acc[0][selector]), selector];
            }
            if (/_at$/gi.test(selector) && Date.parse(acc[0][selector])) {
              if (arr[index + 1]) {
                return [window.dayjs(acc[0][selector])?.format(arr[index + 1]), selector];
              }
              return [new Date(acc[0][selector]).toLocaleDateString(), selector];
            }
            if (typeof acc[0][selector] === "string" && acc[0][selector].includes("\xAE")) {
              return [
                acc[0][selector].replace(/®/gi, `<sup style="font-size: 0.7em;">\xAE</sup>`),
                selector
              ];
            }
            if (index === arr.length - 1) {
              if (Array.isArray(acc[0][selector]) && acc[0][selector].every(
                (val) => typeof val === "string" || typeof val === "number"
              )) {
                return [acc[0][selector].join(", "), selector];
              }
            }
            return [acc[0][selector], selector];
          }
          if (selector && typeof acc[0] === "string") {
            return acc;
          }
          return ["", ""];
        },
        [object, ""]
      )?.[0] ?? ""
    );
    if (typeof result === "string" && result?.includes("Default Title")) {
      result = result?.replace("Default Title", "");
    }
    return result;
  }) ?? "";
  return returnValue;
}, "renderBracketInputDynamicText");
var getBracketInputDynamicValue = /* @__PURE__ */ __name((content, object = {}) => {
  let returnValue = null;
  if (!content || typeof content !== "string") {
    return null;
  }
  content?.replace(/\[([^\]]*)\]/gi, (...matches) => {
    if (!matches[1]) {
      return returnValue;
    }
    returnValue = matches?.[1]?.split(".")?.reduce(
      (acc, selector) => {
        if (!selector || acc[0] === void 0 || acc[0] === null) {
          if (/price$/gi.test(acc[1]) && typeof acc[0] === "number") {
            return [utils2.formatMoney(acc[0]), selector];
          }
          if (/_at$/gi.test(acc[1]) && Date.parse(acc[0])) {
            return [new Date(acc[0]).toLocaleDateString(), selector];
          }
          if (typeof acc[0] === "string" && acc[0].includes("\xAE")) {
            return [acc[0].replace(/®/gi, `<sup style="font-size: 0.7em;">\xAE</sup>`), selector];
          }
          return acc;
        }
        if (acc[0] && selector in acc[0]) {
          if (/price$/gi.test(selector) && typeof acc[0][selector] === "number") {
            return [utils2.formatMoney(acc[0][selector]), selector];
          }
          if (/_at$/gi.test(selector) && Date.parse(acc[0][selector])) {
            return [new Date(acc[0][selector]).toLocaleDateString(), selector];
          }
          if (typeof acc[0][selector] === "string" && acc[0][selector].includes("\xAE")) {
            return [
              acc[0][selector].replace(/®/gi, `<sup style="font-size: 0.7em;">\xAE</sup>`),
              selector
            ];
          }
          return [acc[0][selector], selector];
        }
        return ["", ""];
      },
      [object, ""]
    )?.[0];
    return "";
  });
  return returnValue ?? "";
}, "getBracketInputDynamicValue");
function unescape(htmlStr) {
  htmlStr = htmlStr.replace(/&lt;/g, "<");
  htmlStr = htmlStr.replace(/&gt;/g, ">");
  htmlStr = htmlStr.replace(/&quot;/g, '"');
  htmlStr = htmlStr.replace(/&#39;/g, "'");
  htmlStr = htmlStr.replace(/&amp;/g, "&");
  return htmlStr;
}
__name(unescape, "unescape");
function setUniformHeightById(id) {
  const elements = document.querySelectorAll(`[data-style-id="${id}"]`);
  if (elements.length === 0) {
    return;
  }
  let maxHeight = 0;
  elements.forEach((element) => {
    element.style.height = "auto";
    const elementHeight = element.offsetHeight;
    if (elementHeight > maxHeight) {
      maxHeight = elementHeight;
    }
  });
  elements.forEach((element) => {
    element.style.height = `${maxHeight}px`;
  });
}
__name(setUniformHeightById, "setUniformHeightById");
var utils2 = {
  clsx,
  getImageSrcSet,
  JSONParse,
  getSiblingUrl,
  unescape,
  isVisible,
  isInViewport,
  getReviewStarGradients,
  transpileRichtextMetafield,
  handlelize,
  delay,
  debounce,
  scrollToY,
  scrollToX,
  scrollToXY,
  isElementScrollable,
  checkDomain,
  isExternalURL,
  getElementPosition,
  renderBracketInputDynamicText,
  getBracketInputDynamicValue,
  deepEqual,
  getElementOffset,
  shortUUID,
  serializeForm,
  roundToIndex,
  formatMoney,
  findAllScrollableParents,
  isEmail,
  pushSearchParams,
  replaceSearchParams,
  pushUrlTarget,
  setUniformHeightById
};
var utils_default = utils2;

// assets/modals.ts
var initModals = /* @__PURE__ */ __name(() => {
  const modalsContainer = document.querySelector("[data-dynamic-modals]");
  window.Alpine.store("modal", {
    id: "",
    loaded: !!modalsContainer?.children.length || window.modalsLoaded,
    setId(value) {
      this.id = value;
    }
  });
  const modalStore = window.Alpine.store("modal");
  window.Alpine.magic("modal", () => modalStore);
  window._stores["modal"] = modalStore;
  const handleKeydown = /* @__PURE__ */ __name((e) => {
    if (e.key === "Escape") {
      modalStore.setId("");
    }
  }, "handleKeydown");
  window.Alpine.effect(() => {
    const blockScroll = modalStore?.id && !/^megamenu--/gi.test(modalStore?.id);
    document.body.classList.toggle("!overflow-hidden", blockScroll);
    if (modalStore?.id) {
      document.addEventListener("keydown", handleKeydown);
    }
    if (!modalStore?.id) {
      document.removeEventListener("keydown", handleKeydown);
    }
  });
  const initEvents = /* @__PURE__ */ __name((target = document) => {
    target.querySelectorAll(
      `[href*="#modal--"], [href*="#popup--"], [href*="#drawer--"], [href*="#megamenu--"]`
    ).forEach((link) => {
      const handle = link.href?.replace(/.*?#(modal|popup|drawer|megamenu)--/gi, "")?.split("?")?.[0] ?? "";
      link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        modalStore.setId(handle);
      });
      const handleFocusKeydown = /* @__PURE__ */ __name((e) => {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown") {
          modalStore.setId(handle);
        }
      }, "handleFocusKeydown");
      link.addEventListener("focus", (e) => {
        link.addEventListener("keydown", handleFocusKeydown);
      });
      link.addEventListener("blur", (e) => {
        link.removeEventListener("keydown", handleFocusKeydown);
      });
    });
  }, "initEvents");
  const editor = window.Alpine.store("editor");
  window.Alpine.effect(() => {
    if (editor?.load_section_id) {
      initEvents();
    }
  });
  const mutationObserver = new MutationObserver((e) => {
    e?.forEach((record) => {
      const nodes = [];
      if (record?.addedNodes?.length && record?.target instanceof Element) {
        initEvents(record.target);
      }
    });
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
  initEvents();
}, "initModals");

// assets/cart.ts
var initCart = /* @__PURE__ */ __name(() => {
  window.Alpine.store("cart", {
    history: [structuredClone(window._cart_data)],
    state: {
      ...window._cart_data,
      items: window._cart_data?.items.map((item, index) => ({ ...item, index })) ?? []
    },
    upsell_products: [],
    gift_products: [],
    loading: false,
    isChanging: false,
    debounce_updates: []
  });
  const cart = window.Alpine.store("cart");
  window.Alpine.magic("cart", () => cart);
  window._stores["cart"] = cart;
  window._cart_data = cart.state;
  const get = /* @__PURE__ */ __name(async () => {
    const data = await fetch("/cart.js").then((res) => res.json()).catch((e) => {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: "Cart Error",
        content: e.statusMessage
      });
      cart.isChanging = false;
      return window._stores["cart"].state;
    });
    if ("status" in data) {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: data.message,
        content: data.description
      });
      cart.isChanging = false;
      return window._stores["cart"].state;
    }
    cart.state = {
      ...data,
      items: data?.items.map((item, index) => ({ ...item, index })) ?? [],
      item_count: data.items?.filter((item) => !item?.properties?._p_id_link)?.reduce((acc, item) => acc += item.quantity, 0)
    };
    cart.history.unshift(structuredClone(data));
    if (cart.history.length > 5) {
      cart.history.pop();
    }
    cart.isChanging = false;
    return data;
  }, "get");
  const add = /* @__PURE__ */ __name(async (cartItems) => {
    cart.isChanging = true;
    const data = await fetch("/cart/add.js", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cartItems)
    }).then((res) => res.json()).catch(async (e) => {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: "Cart Error",
        content: e.statusMessage
      });
      return {
        ...await get(),
        cart_error: true
      };
    });
    if ("status" in data) {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: data.message,
        content: data.description
      });
      return {
        ...await get(),
        cart_error: true
      };
    }
    document.dispatchEvent(new CustomEvent("productAddedToCart", { detail: cartItems }));
    return await get();
  }, "add");
  const update = /* @__PURE__ */ __name(async (updates) => {
    cart.isChanging = true;
    const data = await fetch("/cart/update.js", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updates)
    }).then((res) => res.json()).catch(async (e) => {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: "Cart Error",
        content: e.statusMessage
      });
      return await get();
    });
    if ("status" in data) {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: data.message,
        content: data.description
      });
      return await get();
    }
    cart.state = {
      ...data,
      items: data?.items.map((item, index) => ({ ...item, index })) ?? [],
      item_count: data.items?.filter((item) => !item?.properties?._p_id_link)?.reduce((acc, item) => acc += item.quantity, 0)
    };
    cart.history.unshift(structuredClone(data));
    if (cart.history.length > 5) {
      cart.history.pop();
    }
    cart.isChanging = false;
    return {
      ...data,
      items: data?.items.map((item, index) => ({ ...item, index })) ?? []
    };
  }, "update");
  const change = /* @__PURE__ */ __name(async (cartItem) => {
    cart.isChanging = true;
    const data = await fetch("/cart/change.js", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cartItem)
    }).then((res) => res.json()).catch(async (e) => {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: "Cart Error",
        content: e.statusMessage
      });
      return await get();
    });
    if ("status" in data) {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: data.message,
        content: data.description
      });
      return await get();
    }
    const { items_added, items_removed, ...cart_data } = data;
    cart.state = {
      ...cart_data,
      items: cart_data?.items.map((item, index) => ({ ...item, index })) ?? [],
      item_count: data.items?.filter((item) => !item?.properties?._p_id_link)?.reduce((acc, item) => acc += item.quantity, 0)
    };
    cart.history.unshift(structuredClone(cart_data));
    if (cart.history.length > 5) {
      cart.history.pop();
    }
    cart.isChanging = false;
    return {
      ...cart_data,
      items: cart_data?.items.map((item, index) => ({ ...item, index })) ?? []
    };
  }, "change");
  const clear = /* @__PURE__ */ __name(async () => {
    const data = await fetch("/cart/clear.js", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }).then((res) => res.json()).catch(async (e) => {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: "Cart Error",
        content: e.statusMessage
      });
      return await get();
    });
    if ("status" in data) {
      _stores.toast.addToast({
        type: "error",
        target: "cart",
        title: data.message,
        content: data.description
      });
      return await get();
    }
    cart.state = {
      ...data,
      items: data?.items.map((item, index) => ({ ...item, index })) ?? [],
      item_count: data.items?.filter((item) => !item?.properties?._p_id_link)?.reduce((acc, item) => acc += item.quantity, 0)
    };
    cart.history.unshift(structuredClone(data));
    if (cart.history.length > 5) {
      cart.history.pop();
    }
    cart.isChanging = false;
    return {
      ...data,
      items: data?.items.map((item, index) => ({ ...item, index })) ?? []
    };
  }, "clear");
  const showConditionally = /* @__PURE__ */ __name((show_conditionally) => {
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
  }, "showConditionally");
  const updateLineItemQuantity = /* @__PURE__ */ __name((quantity, index) => {
    if (!cart.state.items[index] || cart.state.items[index]?.quantity === quantity || cart.state.items.length !== _stores.cart?.history[0].items.length) {
      return;
    }
    cart.state.items[index].quantity = Math.max(0, quantity);
    cart.state.item_count = cart.state.items?.filter((item) => !item?.properties?._p_id_link)?.reduce((acc, item) => acc += item.quantity, 0);
    cart.state.total_price = cart.state.items.reduce(
      (acc, item) => acc += item.price * item.quantity,
      0
    );
    cart.debounce_updates = cart.state.items.map((item) => item.quantity);
  }, "updateLineItemQuantity");
  const renderUpsellProducts = /* @__PURE__ */ __name(async (element, target_product, primary_source, secondary_source, product_class, limit) => {
    const fallback_products = utils.JSONParse(
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
        const expensive = [...cart.state.items].sort((a, b) => b.final_price - a.final_price).slice(0, 3);
        const recent = cart.state.items.slice(0, 2).sort((a, b) => b.final_price - a.final_price);
        [...recent, ...expensive]?.forEach((line, parentIndex) => {
          const product = lineItemProducts.find((p) => p.handle === line.handle);
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
        [...cart.state.items].sort((a, b) => b.final_price - a.final_price)?.forEach((line, parentIndex) => {
          const product = lineItemProducts.find((p) => p.handle === line.handle);
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
        [...cart.state.items].sort((a, b) => a.final_price - b.final_price)?.forEach((line, parentIndex) => {
          const product = lineItemProducts.find((p) => p.handle === line.handle);
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
        cart.state.items?.forEach((line, parentIndex) => {
          const product = lineItemProducts.find((p) => p.handle === line.handle);
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
    const renderProducts = products?.filter((prod) => !cart.state.items.some((item) => item.product_id === prod.id))?.filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i)?.filter(
      (prod, index) => prod.handle !== element.children?.[index]?.getAttribute("data-product-handle")
    )?.slice(0, limit) ?? [];
    cart.upsell_products = renderProducts;
    if (!renderProducts.length) {
      return;
    }
    element.innerHTML = "";
    renderProducts.forEach((prod, i, arr) => {
      const div = document.createElement("div");
      div.classList.add("w-dynamic", "h-dynamic");
      const node = document.querySelector(`[data-product-card='${product_class}']`)?.cloneNode(true);
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
          const div2 = document.createElement("div");
          div2.setAttribute("data-style-divider", ``);
          element.appendChild(div2);
        }
      }
    });
  }, "renderUpsellProducts");
  const renderGiftProducts = /* @__PURE__ */ __name(async (element, target_type, target, receives_quantity, allow_duplicates, product_class) => {
    const products = utils.JSONParse(
      element.getAttribute("data-gift-products")
    );
    cart.gift_products = cart.state[target_type] >= target && cart?.state?.items?.reduce(
      (acc, lineItem) => products.some((prod) => prod.id === lineItem.product_id) ? acc += lineItem.quantity : acc,
      0
    ) < receives_quantity ? products?.filter(
      (prod) => allow_duplicates || !cart.state.items.some((item) => item.product_id === prod.id)
    )?.filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i)?.filter(
      (prod, index) => prod.handle !== element.children?.[index]?.getAttribute("data-product-handle")
    ) : [];
    if (!cart.gift_products.length) {
      element.innerHTML = "";
      return;
    }
    element.innerHTML = "";
    cart.gift_products.forEach((prod, i, arr) => {
      const div = document.createElement("div");
      div.classList.add("w-dynamic", "h-dynamic");
      const node = document.querySelector(`[data-product-card='${product_class}']`)?.cloneNode(true);
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
          const div2 = document.createElement("div");
          div2.setAttribute("data-style-divider", ``);
          element.appendChild(div2);
        }
      }
    });
  }, "renderGiftProducts");
  const renderDynamicTextWithFormattedPrice = /* @__PURE__ */ __name((content) => {
    return content?.replace(/\[([^\]]*)\]/gi, (...matches) => {
      return matches?.[1]?.split(".").reduce(
        (acc, selector) => {
          if (!selector || acc[0] === void 0 || acc[0] === null) {
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
    }) ?? "";
  }, "renderDynamicTextWithFormattedPrice");
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
    cart.state.item_count = cart.state.items?.filter((item) => !item?.properties?._p_id_link)?.reduce((acc, item) => acc += item.quantity, 0);
    window._cart_data = cart.state;
  });
  window.Alpine.effect(() => {
    cart.state.original_pre_selling_plan_total_price = cart.state.items?.reduce((acc, item) => {
      acc += item.quantity * (item?.selling_plan_allocation?.compare_at_price ?? item?.original_price);
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
        acc[index].value += (item?.selling_plan_allocation?.compare_at_price - item?.selling_plan_allocation?.price) * item?.quantity;
        return acc;
      }
      acc.push({
        name: item?.selling_plan_allocation?.selling_plan?.name,
        value: (item?.selling_plan_allocation?.compare_at_price - item?.selling_plan_allocation?.price) * item?.quantity
      });
      return acc;
    }, []);
  });
  window.Alpine.effect(() => {
    if (cart.debounce_updates.length) {
      debounceCartUpdates();
    }
  });
  document.addEventListener("productAddedToCart", async (event) => {
    const updatedCart = await get();
    if (typeof window._learnq !== "undefined") {
      const cartData = {
        total_price: updatedCart.total_price / 100,
        $value: updatedCart.total_price / 100,
        total_discount: updatedCart.total_discount,
        original_total_price: updatedCart.original_total_price / 100,
        items: updatedCart.items
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
    renderGiftProducts
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
    renderGiftProducts
  };
}, "initCart");

// assets/page-transitions.ts
var startTime = Date.now();
var initialized = false;
var firstRender = true;
var initPageTransitions = /* @__PURE__ */ __name(() => {
  if (initialized) return;
  const rootContainer = document.querySelector("[data-content-root]");
  const scrollToTarget = /* @__PURE__ */ __name(() => {
    if (window.location.hash) {
      const target = document?.querySelector(window.location.hash);
      if (!target) return;
      if (utils.isElementScrollable(target.parentElement) && utils.isVisible(target.parentElement) && utils.isInViewport(target)) {
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
      const targetPosition = utils.getElementPosition(target)?.top - Math.max(
        0,
        document.querySelector(".header-sections-container")?.getBoundingClientRect()?.bottom ?? 0
      );
      utils.scrollToY(
        260 + Math.abs(Math.round((window.scrollY - targetPosition) / 15)),
        targetPosition
      );
    }
  }, "scrollToTarget");
  window.Alpine.store("router", {
    pathname: rootContainer.getAttribute("data-pathname"),
    template: rootContainer.getAttribute("data-template"),
    setValue(key, value) {
      this[key] = value;
    }
  });
  const routerStore = window.Alpine.store("router");
  window.Alpine.magic("router", () => routerStore);
  window._stores["router"] = routerStore;
  window.Alpine.effect(() => {
  });
  if (window.design_mode || !window.theme_settings.layout__page_transitions) {
    barba.go = (href) => {
      if (typeof href === "string" && window.location.href !== href) {
        window.location.href = href;
      }
    };
    barba.prefetch = () => {
    };
  }
  barba.use(barbaPrefetch, {
    root: document.body,
    timeout: 4e3,
    /* @ts-ignore */
    limit: 0
  });
  document.addEventListener("barba:prefetch:fulfilled", async (e) => {
    if (typeof idbKeyval !== "undefined" && !window.design_mode) {
      requestIdleCallback(
        async () => {
          const url = e.detail.url?.replace(/(\/collections\/[^/]*\/)/gi, "/");
          const entry = barba.cache?.get(url);
          if (!entry?.request) return;
          const fetchResults = await entry.request.then((res) => ({
            data: res
          }));
          const div = document.createElement("div");
          div.innerHTML = fetchResults?.data?.html;
          const productData = div.querySelectorAll(`[data-product-data]`);
          productData?.forEach(async (scriptElement) => {
            const product = utils.JSONParse(scriptElement.innerHTML);
            if (product?.handle) {
              const dbKey = `_${window.Shopify.theme.id}--${product.handle}`;
              _products[product.handle] = {
                recommendations_loaded_at: 0,
                related_products: [],
                complementary_products: [],
                ...await idbKeyval?.get(dbKey) || {},
                ..._products[product.handle] ?? {},
                ...product,
                updated_at: Date.now()
              };
              await idbKeyval.set(dbKey, _products[product.handle]);
            }
          });
          await idbKeyval.set(`barba-prefetch---${startTime}-//-${url}`, fetchResults);
        },
        { timeout: 3e3 }
      );
    }
  });
  if (typeof idbKeyval !== "undefined" && window.theme_settings && !window.design_mode) {
    idbKeyval.keys().then(async (res) => {
      res.forEach(async (key) => {
        const [timestamp, cacheKey] = key.replace("barba-prefetch---", "").split("-//-");
        if (cacheKey && +timestamp > Date.now() - 1e3 * 60 * 10) {
          barba.cache.set(
            cacheKey,
            idbKeyval.get(key).then((res2) => res2.data),
            "prefetch"
          );
        } else if (cacheKey && +timestamp > 0) {
          idbKeyval.del(key);
        }
      });
      await delay(100);
      barba.timeout = window.origin.includes("127.0.0.1") ? 3e4 : 4e3;
    }).catch(async (err) => {
      await delay(100);
      barba.timeout = window.origin.includes("127.0.0.1") ? 3e4 : 4e3;
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
      "/products/:any"
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
      "/products/:any"
    ],
    debug: true,
    /* @ts-ignore */
    cacheFirstPage: true,
    timeout: window.origin.includes("127.0.0.1") ? 3e4 : 4e3,
    // default is 2000ms,
    transitions: [
      {
        name: "opacity-transition",
        leave: /* @__PURE__ */ __name((data) => {
          transitionOverlay?.classList.add("active", "out-active");
        }, "leave"),
        enter: /* @__PURE__ */ __name((data) => {
          const handleTransitionend = /* @__PURE__ */ __name(() => {
            transitionOverlay?.classList.remove("out-active");
            transitionOverlay?.removeEventListener("transitionend", handleTransitionend);
          }, "handleTransitionend");
          transitionOverlay?.classList.remove("active");
          transitionOverlay?.addEventListener("transitionend", handleTransitionend);
          window.scrollTo({
            top: 0,
            behavior: "instant"
          });
        }, "enter")
      }
    ],
    views: [
      {
        beforeLeave: /* @__PURE__ */ __name((data) => {
          console.debug("beforeLeave", data);
          window._stores?.modal?.setId("");
        }, "beforeLeave"),
        namespace: "tmp",
        afterLeave(data) {
          console.debug("afterLeave", data);
          routerStore.setValue(
            "pathname",
            window.location.pathname
            /*data.next.container.getAttribute("data-pathname")*/
          );
          if (!data?.next?.container) {
            return;
          }
          routerStore.setValue("template", data?.next?.container?.getAttribute("data-template"));
        },
        beforeEnter: /* @__PURE__ */ __name((data) => {
          console.debug("beforeEnter", data);
        }, "beforeEnter"),
        afterEnter: /* @__PURE__ */ __name((data) => {
          console.debug("afterEnter", data);
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
              html.querySelectorAll(":not([data-content-root]) script[src]").forEach((scriptElement) => {
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
                }
              });
              document.querySelectorAll(
                "[data-content-root] script:not(script[src][data-product-data][type='application/json'])"
              ).forEach((scriptElement) => {
                const newScriptTag = document.createElement("script");
                newScriptTag.innerHTML = scriptElement.innerHTML;
                scriptElement.getAttributeNames().forEach((name) => {
                  newScriptTag.setAttribute(name, scriptElement.getAttribute(name));
                });
                scriptElement.parentNode.replaceChild(newScriptTag, scriptElement);
              });
              document.querySelectorAll("[data-content-root] script[src]").forEach((scriptElement) => {
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
          }, 1e3);
          setTimeout(() => {
            window?.okeWidgetApi?.initAllWidgets();
          }, 3e3);
        }, "afterEnter")
      }
    ]
  });
  barba.timeout = 1;
  initialized = true;
}, "initPageTransitions");

// assets/product-data.ts
var _product2 = {
  hydrateProduct: /* @__PURE__ */ __name(async (product) => {
    if (!product?.handle && !product?.id) return null;
    if ((_products[product.handle]?.recommendations_loaded_at ?? 0) > Date.now() - 1e3 * 60 * 30) {
      return _products[product.handle];
    }
    const dbKey = `_${window.Shopify.theme.id}--${product.handle}`;
    const data = await idbKeyval.get(dbKey);
    _products[product.handle] = {
      recommendations_loaded_at: 0,
      related_products: [],
      complementary_products: [],
      ...data || {},
      ...product,
      updated_at: Date.now()
    };
    if (!data || (data.recommendations_loaded_at ?? 0) < Date.now() - 1e3 * 60 * 30) {
      const [related_products, complementary_products] = await Promise.all([
        fetch(
          `/recommendations/products?product_id=${product.id}&limit=10&section_id=product-data&intent=related`
        ).then((res) => res.text()).then((text) => {
          const html = document.createElement("div");
          html.innerHTML = text;
          return utils.JSONParse(
            html.querySelector("[data-product-recommendations]")?.innerHTML ?? "[]"
          );
        }),
        fetch(
          `/recommendations/products?product_id=${product.id}&limit=10&section_id=product-data&intent=complementary`
        ).then((res) => res.text()).then((text) => {
          const html = document.createElement("div");
          html.innerHTML = text;
          return utils.JSONParse(
            html.querySelector("[data-product-recommendations]")?.innerHTML ?? "[]"
          );
        })
      ]);
      _products[product.handle] = {
        ..._products[product.handle],
        related_products,
        complementary_products,
        recommendations_loaded_at: Date.now(),
        updated_at: Date.now()
      };
      requestIdleCallback(
        async () => {
          await idbKeyval.set(dbKey, _products[product.handle]);
          [...related_products ?? [], ...complementary_products ?? []].filter((a, i, arr) => arr.findIndex((b) => a.handle === b.handle) === i).map(async (product2) => {
            const dbKey2 = `_${window.Shopify.theme.id}--${product2.handle}`;
            _products[product2.handle] = {
              recommendations_loaded_at: 0,
              related_products: [],
              complementary_products: [],
              ...await idbKeyval?.get(dbKey2) || {},
              ...product2,
              updated_at: Date.now()
            };
            idbKeyval?.set(dbKey2, _products[product2.handle]);
          });
        },
        { timeout: 5e3 }
      );
    }
    return _products[product.handle];
  }, "hydrateProduct"),
  getHtmlProduct: /* @__PURE__ */ __name((handle) => {
    const product = JSONParse(
      document.querySelector(`[data-product-data="${handle}"]`)?.innerHTML
    );
    if (product) {
      _products[handle] = {
        recommendations_loaded_at: 0,
        complementary_products: [],
        related_products: [],
        ..._products[handle] ?? {},
        ...product,
        updated_at: Date.now()
      };
      _product2.saveProduct(handle);
      return _products[handle];
    }
    return null;
  }, "getHtmlProduct"),
  getCachedProduct: /* @__PURE__ */ __name(async (handle) => {
    const dbKey = `_${window.Shopify.theme.id}--${handle}`;
    const product = await idbKeyval.get(dbKey);
    if (product && (product.updated_at ?? 0) > Date.now() - 1e3 * 60 * 30) {
      _products[handle] = {
        ..._products[handle] ?? {},
        ...product
      };
      return _products[handle];
    }
    return null;
  }, "getCachedProduct"),
  getFetchProduct: /* @__PURE__ */ __name(async (handle, productId) => {
    if (!productId) return null;
    try {
      const product = await fetch(
        `/recommendations/products?product_id=${productId}&limit=10&section_id=product-data&intent=related&with_product_data=true`
      ).then((res) => res.text()).then((text) => {
        const html = document.createElement("div");
        html.innerHTML = text;
        const product2 = utils.JSONParse(
          html.querySelector("[data-product-data]")?.innerHTML ?? "{}"
        );
        product2.related_products = utils.JSONParse(
          html.querySelector("[data-product-recommendations]")?.innerHTML ?? "[]"
        );
        requestIdleCallback(
          async () => {
            [...product2.related_products ?? []].filter((a, i, arr) => arr.findIndex((b) => a.handle === b.handle) === i).map(async (product3) => {
              const dbKey = `_${window.Shopify.theme.id}--${product3.handle}`;
              _products[product3.handle] = {
                recommendations_loaded_at: 0,
                related_products: [],
                complementary_products: [],
                ...await idbKeyval?.get(dbKey) || {},
                ...product3,
                updated_at: Date.now()
              };
              idbKeyval?.set(dbKey, _products[product3.handle]);
            });
          },
          { timeout: 5e3 }
        );
        product2.recommendations_loaded_at = Date.now();
        return product2;
      });
      if (product) {
        _products[handle] = {
          recommendations_loaded_at: 0,
          complementary_products: [],
          related_products: [],
          ..._products[handle] ?? {},
          ...product,
          updated_at: Date.now()
        };
        return _products[handle];
      }
      return null;
    } catch (err) {
      return null;
    }
  }, "getFetchProduct"),
  saveProduct: /* @__PURE__ */ __name((handle) => {
    if (_products[handle]) {
      const dbKey = `_${window.Shopify.theme.id}--${handle}`;
      requestIdleCallback(
        async () => {
          await idbKeyval.set(dbKey, _products[handle]);
        },
        { timeout: 5e3 }
      );
      return _products[handle];
    }
    return null;
  }, "saveProduct"),
  getHydratedProductData: /* @__PURE__ */ __name(async (handle, productId) => {
    if (!_products[handle] || (_products[handle]?.recommendations_loaded_at ?? 0) < Date.now() - 1e3 * 60 * 30) {
      _product2.getHtmlProduct(handle);
    }
    if (!_products[handle] || (_products[handle]?.recommendations_loaded_at ?? 0) < Date.now() - 1e3 * 60 * 30) {
      await _product2.getCachedProduct(handle);
    }
    if (!_products[handle] || (_products[handle]?.recommendations_loaded_at ?? 0) < Date.now() - 1e3 * 60 * 30) {
      if (productId) {
        await _product2.getFetchProduct(handle, productId);
      }
      if (!productId) {
        await _product2.getFetchProduct(handle, productId);
      }
    }
    if (!_products[handle] || (_products[handle]?.recommendations_loaded_at ?? 0) < Date.now() - 1e3 * 60 * 30) {
      return null;
    }
    _product2.saveProduct(handle);
    return _products[handle];
  }, "getHydratedProductData"),
  getProductData: /* @__PURE__ */ __name(async (handle, productId) => {
    if (!_products[handle]) {
      _product2.getHtmlProduct(handle);
    }
    if (!_products[handle]) {
      await _product2.getCachedProduct(handle);
    }
    if (!_products[handle]) {
      await _product2.getFetchProduct(handle, productId);
    }
    if (!_products[handle]) {
      return null;
    }
    _product2.saveProduct(handle);
    return _products[handle];
  }, "getProductData"),
  lastOptions: {}
};
window._product = _product2;
var initProductData = /* @__PURE__ */ __name(() => {
}, "initProductData");

// assets/toast.ts
var initToast = /* @__PURE__ */ __name(() => {
  window.Alpine.store("toast", {
    toasts: [],
    paused: false,
    interval: null,
    addToast: /* @__PURE__ */ __name(function({
      type = "plain",
      target = "generic",
      timestamp = Date.now(),
      title,
      content,
      icon,
      hide = 0
    }) {
      const defaultIcon = {
        plain: "bolt",
        warning: "warning-triangle",
        error: "error-circle",
        info: "info-circle",
        success: "check-circle"
      }[type];
      this.toasts.push({
        type,
        target,
        timestamp,
        title,
        content,
        icon: icon || defaultIcon,
        hide
      });
    }, "addToast"),
    removeAllToasts: /* @__PURE__ */ __name(function() {
      this.toasts = [];
    }, "removeAllToasts"),
    pauseRemoval: /* @__PURE__ */ __name(function() {
      this.paused = true;
      clearInterval(this.interval);
      this.interval = null;
    }, "pauseRemoval"),
    continueRemoval: /* @__PURE__ */ __name(function() {
      this.paused = false;
    }, "continueRemoval")
  });
  const toastStore = window.Alpine.store("toast");
  window.Alpine.magic("toast", () => toastStore);
  window.Alpine.effect(() => {
    if (toastStore.toasts.length && !toastStore.interval && !toastStore.paused) {
      toastStore.interval = setInterval(() => {
        const checkTimestamp = Date.now() - 3e3;
        toastStore.toasts = toastStore.toasts.map((toast) => ({
          ...toast,
          hide: toast.timestamp < checkTimestamp ? Date.now() : 0
        }));
        if (toastStore.toasts.every((toast) => toast.hide && toast.hide > 500)) {
          toastStore.toasts = [];
        }
      }, 500);
    }
    if (toastStore.interval && !toastStore.toasts.length) {
      clearInterval(toastStore.interval);
      toastStore.interval = null;
    }
  });
  window._stores["toast"] = toastStore;
}, "initToast");

// assets/tooltip.ts
var initTooltip = /* @__PURE__ */ __name(() => {
  const container = document.querySelector("[data-tooltip-container]");
  window.Alpine.store("tooltip", {
    tooltips: /* @__PURE__ */ new Map(),
    async addTooltip(element, content, position = "top") {
      const currentTooltip = this.tooltips.get(element);
      if (!currentTooltip) {
        const parents = utils.findAllScrollableParents(element);
        const tooltipElement = document.createElement("div");
        tooltipElement.innerHTML = content;
        const handleUpdateCoordinates = /* @__PURE__ */ __name(() => {
          const { top, left, right, width, height, bottom } = element.getBoundingClientRect();
          tooltipElement.classList.add("active");
          if (position === "top") {
            tooltipElement.style.top = `${top}px`;
            tooltipElement.style.left = `${left + width / 2}px`;
          }
          if (position === "bottom") {
            tooltipElement.style.top = `${bottom}px`;
            tooltipElement.style.left = `${left + width / 2}px`;
          }
          if (position === "left") {
            tooltipElement.style.top = `${top + height / 2}px`;
            tooltipElement.style.left = `${left}px`;
          }
          if (position === "right") {
            tooltipElement.style.top = `${top + height / 2}px`;
            tooltipElement.style.left = `${right}px`;
          }
        }, "handleUpdateCoordinates");
        this.tooltips.set(element, {
          tooltip: tooltipElement,
          timeout: null,
          handleUpdateCoordinates,
          scrollParents: parents
        });
        container.appendChild(tooltipElement);
        tooltipElement.classList.add("tooltip", `tooltip--${position}`);
        await utils.delay(1);
        handleUpdateCoordinates();
        parents.forEach((parent) => {
          parent.addEventListener("scroll", handleUpdateCoordinates);
        });
      }
      if (currentTooltip) {
        clearTimeout(currentTooltip.timeout);
        currentTooltip.timeout = null;
      }
    },
    async removeTooltip(element) {
      const currentTooltip = this.tooltips.get(element);
      if (currentTooltip) {
        const tooltip = currentTooltip.tooltip;
        currentTooltip.timeout = setTimeout(async () => {
          tooltip.classList.remove("active");
          this.tooltips.delete(element);
          tooltip.ontransitionend = (event) => {
            tooltip.remove();
          };
        }, 50);
      }
    }
  });
  const tooltipStore = window.Alpine.store("tooltip");
  window.Alpine.magic("tooltip", () => tooltipStore);
  window._stores["tooltip"] = tooltipStore;
}, "initTooltip");

// assets/back-in-stock-notification.ts
var initBackInStockNotification = /* @__PURE__ */ __name(() => {
  window.Alpine.store("backInStockNotification", {
    open: false,
    product: null,
    selected_variant: null,
    setSelectedVariant(id) {
      this.selected_variant = this.product.variants?.find((variant) => variant.id === id);
    }
  });
  const backInStockNotificationStore = window.Alpine.store(
    "backInStockNotification"
  );
  window.Alpine.magic("backInStockNotification", () => backInStockNotificationStore);
  window._stores["backInStockNotification"] = backInStockNotificationStore;
}, "initBackInStockNotification");

// assets/pagination.ts
var initPagination = /* @__PURE__ */ __name(() => {
}, "initPagination");
var _pagination = {
  init: /* @__PURE__ */ __name((paginationContainer, gridContainer) => {
    const goToPage = /* @__PURE__ */ __name(async (url) => {
      const dataAttribute = gridContainer.getAttributeNames().filter((attribute) => attribute.includes("data-style"))[0];
      try {
        window.scrollTo({
          top: document.querySelector(`[${dataAttribute}]`)?.getBoundingClientRect().y + window.scrollY - 260,
          behavior: "smooth"
        });
        const cards = gridContainer.querySelectorAll(
          "[class^=product-card--] img, [class^=collection-card--] img, [class^=article-card--] img, [class^=blog-card--] img, [class^=page-card--] img"
        );
        cards.forEach((card) => {
          card.classList.add("card-loading");
        });
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const newContent = doc.querySelector(`[${dataAttribute}]`);
        const newPagination = doc.querySelector("[data-pagination]");
        if (newContent && newPagination) {
          gridContainer.innerHTML = newContent.innerHTML;
          paginationContainer.innerHTML = newPagination.innerHTML;
        }
        updateURL(url);
        cards.forEach((card) => {
          card.classList.remove("card-loading");
        });
      } catch (error) {
        console.error("Error loading new page:", error);
      }
    }, "goToPage");
    const updateURL = /* @__PURE__ */ __name((url) => {
      const newUrl = new URL(url, window.location.origin);
      history.pushState(null, "", newUrl);
    }, "updateURL");
    return {
      goToPage
    };
  }, "init")
};
window._pagination = _pagination;

// assets/theme.ts
window.utils = utils_default;
var initTheme = /* @__PURE__ */ __name(() => {
  if (!window.location.origin.includes("127.0.0.1") && Shopify.theme.role === "main") {
    console.log(
      "%cHEY YOU! I see you peeking into the code. This Theme is custom built by Platter.co. This site is powered Alpine.JS, Tailwind CSS & TypeScript integrated into Shopify using our proprietary development tools. https://www.platter.co/",
      "background: rgb(0,0,0);color: #fafafa;font-size: 24px;font-weight: bold;padding: 16px 10px;text-align: center;text-shadow: 2px 2px 0 rgba(45, 45, 45);"
    );
    console.log(
      "%cWe are constantly looking for talented developers. If you have Shopify theme development experience under your belt and are keen to explore an exciting tech stack in a fast paced environment. Contact us at engineering@platter.co ",
      "background: rgb(0,0,0);color: #fafafa;font-size: 24px;font-weight: bold;padding: 16px 10px;text-align: center;text-shadow: 2px 2px 0 rgba(45, 45, 45);"
    );
  }
  window.Alpine.store("editor", {
    load_section_id: "",
    unload_section_id: "",
    select_section_id: "",
    reorder_section_id: "",
    select_block_id: "",
    inspector: false,
    setValue(key, value) {
      this[key] = value;
    }
  });
  const editor = window.Alpine.store("editor");
  window.Alpine.magic("editor", () => editor);
  initModals();
  initAccessibility();
  initQuickView();
  initProductDrawer();
  initCart();
  initProductData();
  initScrollBar();
  initTooltip();
  initToast();
  initMediaGallery();
  initBackInStockNotification();
  initSmoothScroll();
  initPageTransitions();
  initPagination();
  if (window.design_mode) {
    document.dispatchEvent(new CustomEvent("theme:init"));
  }
}, "initTheme");
document.addEventListener("alpine:init", initTheme);
export {
  initTheme
};

 // random_comment 