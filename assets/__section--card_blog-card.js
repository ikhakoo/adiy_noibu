var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initBlogCard = /* @__PURE__ */ __name(($el, $refs, blogHandle) => {
  const random_id = utils.shortUUID();
  const blog = _blogs[blogHandle] || utils.JSONParse(
    document.querySelector(`[data-blog-data="${blogHandle}"]`)?.innerHTML
  );
  const state = window.Alpine.reactive({
    random_id,
    blog,
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
}, "initBlogCard");
const hydrateBlogCard = /* @__PURE__ */ __name(($el, card_handle, blog_handle, blog_id, classes = []) => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        const node = document.querySelector(`[data-blog-card='${card_handle}']`)?.cloneNode(true);
        if (!node && !$el.hasAttribute("data-intersected")) {
          $el.setAttribute("data-intersected", "true");
          const mo = new MutationObserver((mutation, obs) => {
            if ($el.hasAttribute("data-cards-loaded")) {
              $el.removeAttribute("data-intersected");
              const node2 = document.querySelector(`[data-blog-card='${card_handle}']`)?.cloneNode(true);
              if (node2 && $el && $el.parentNode) {
                node2?.removeAttribute(`data-blog-card`);
                node2?.setAttribute("data-blog-handle", blog_handle);
                node2?.setAttribute("data-blog-id", blog_id);
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
          node?.removeAttribute(`data-blog-card`);
          node?.setAttribute("data-blog-handle", blog_handle);
          node?.setAttribute("data-blog-id", blog_id);
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
}, "hydrateBlogCard");
window._sections["initBlogCard"] = initBlogCard;
window._sections["hydrateBlogCard"] = hydrateBlogCard;
