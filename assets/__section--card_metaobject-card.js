var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initMetaobjectCard = /* @__PURE__ */ __name(($el, $refs, metaobjectHandle) => {
  const random_id = utils.shortUUID();
  const metaobject = _metaobjects[metaobjectHandle] || utils.JSONParse(
    document.querySelector(`[data-metaobject-data="${metaobjectHandle}"]`)?.innerHTML
  );
  const state = window.Alpine.reactive({
    random_id,
    metaobject,
    hydrated: true
  });
  const getDynamicValue = /* @__PURE__ */ __name((content) => {
    return utils.getBracketInputDynamicValue(content, state);
  }, "getDynamicValue");
  const renderDynamicText = /* @__PURE__ */ __name((content) => {
    return utils.renderBracketInputDynamicText(content, state);
  }, "renderDynamicText");
  return {
    card: state,
    $el,
    getDynamicValue,
    renderDynamicText
  };
}, "initMetaobjectCard");
const hydrateMetaobjectCard = /* @__PURE__ */ __name(($el, card_handle, metaobject_handle, metaobject_id, classes = []) => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        const node = document.querySelector(`[data-metaobject-card='${card_handle}']`)?.cloneNode(true);
        if (!node && !$el.hasAttribute("data-intersected")) {
          $el.setAttribute("data-intersected", "true");
          const mo = new MutationObserver((mutation, obs) => {
            if ($el.hasAttribute("data-cards-loaded")) {
              $el.removeAttribute("data-intersected");
              const node2 = document.querySelector(`[data-metaobject-card='${card_handle}']`)?.cloneNode(true);
              if (node2 && $el && $el.parentNode) {
                node2?.removeAttribute(`data-metaobject-card`);
                node2?.setAttribute("data-metaobject-handle", metaobject_handle);
                node2?.setAttribute("data-metaobject-id", metaobject_id);
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
          node?.removeAttribute(`data-metaobject-card`);
          node?.setAttribute("data-metaobject-handle", metaobject_handle);
          node?.setAttribute("data-metaobject-id", metaobject_id);
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
}, "hydrateMetaobjectCard");
window._sections["initMetaobjectCard"] = initMetaobjectCard;
window._sections["hydrateMetaobjectCard"] = hydrateMetaobjectCard;
