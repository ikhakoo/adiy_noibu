var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initMarqueeBar = /* @__PURE__ */ __name(($el, blockSize, duration) => {
  const handleMarqueeResize = /* @__PURE__ */ __name(() => {
    if ($el.children[0]?.children.length) {
      [...new Array(Math.ceil($el.clientWidth * 2 / $el.scrollWidth) - 1 || 0) ?? []].forEach(
        (_, index) => {
          [...$el.children[0].children].forEach((child) => {
            const newChild = child.cloneNode(true);
            newChild.setAttribute("aria-hidden", "true");
            newChild.removeAttribute("data-shopify-editor-block");
            newChild.querySelectorAll("[data-shopify-editor-block]").forEach((element) => {
              element.removeAttribute("data-shopify-editor-block");
            });
            $el.children[0].appendChild(newChild);
          });
          [...$el.children[1].children].forEach((child) => {
            const newChild = child.cloneNode(true);
            newChild.removeAttribute("data-shopify-editor-block");
            newChild.querySelectorAll("[data-shopify-editor-block]").forEach((element) => {
              element.removeAttribute("data-shopify-editor-block");
            });
            $el.children[1].appendChild(newChild);
          });
        }
      );
      $el.style.setProperty(
        "--animate-duration",
        `${Math.round($el.children[0].children.length / blockSize) * +duration}`
      );
    }
  }, "handleMarqueeResize");
  return {
    handleMarqueeResize
  };
}, "initMarqueeBar");
window._sections["initMarqueeBar"] = initMarqueeBar;
