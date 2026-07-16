var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initCollectionCard = /* @__PURE__ */ __name(($el, $refs, collectionHandle) => {
  const random_id = utils.shortUUID();
  const collection = _collections[collectionHandle] || utils.JSONParse(
    document.querySelector(`[data-collection-data="${collectionHandle}"]`)?.innerHTML
  );
  const state = window.Alpine.reactive({
    random_id,
    collection,
    hydrated: true
  });
  const getDynamicValue = /* @__PURE__ */ __name((content) => {
    return utils.getBracketInputDynamicValue(content, state);
  }, "getDynamicValue");
  const renderDynamicText = /* @__PURE__ */ __name((content) => {
    return utils.renderBracketInputDynamicText(content, state);
  }, "renderDynamicText");
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
  return {
    card: state,
    $el,
    getDynamicValue,
    renderDynamicText,
    getContentLabels
  };
}, "initCollectionCard");
const hydrateCollectionCard = /* @__PURE__ */ __name(($el, card_handle, collection_handle, collection_id, classes = []) => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        const node = document.querySelector(`[data-collection-card='${card_handle}']`)?.cloneNode(true);
        if (!node && !$el.hasAttribute("data-intersected")) {
          $el.setAttribute("data-intersected", "true");
          const mo = new MutationObserver((mutation, obs) => {
            if ($el.hasAttribute("data-cards-loaded")) {
              $el.removeAttribute("data-intersected");
              const node2 = document.querySelector(`[data-collection-card='${card_handle}']`)?.cloneNode(true);
              if (node2 && $el && $el.parentNode) {
                node2?.removeAttribute(`data-collection-card`);
                node2?.setAttribute("data-collection-handle", collection_handle);
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
          node?.removeAttribute(`data-collection-card`);
          node?.setAttribute("data-collection-handle", collection_handle);
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
}, "hydrateCollectionCard");
window._sections["initCollectionCard"] = initCollectionCard;
window._sections["hydrateCollectionCard"] = hydrateCollectionCard;
