var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initNavigationBar = /* @__PURE__ */ __name(($el, $refs) => {
  const toggleTransparent = /* @__PURE__ */ __name((e, instant = false) => {
    const handleTransition = /* @__PURE__ */ __name(() => {
      const { colorScheme, transparentColorScheme, transparentTemplates } = $el.dataset;
      document.body.style.setProperty(
        "--header-height-offset",
        `${utils.roundToIndex(
          $el?.parentElement?.parentElement?.getBoundingClientRect().bottom,
          -2
        )}px`
      );
      const templates = transparentTemplates.split(",").map((t) => t.trim()?.split("."));
      const transparent = templates?.some(
        ([prefix, suffix]) => _stores.router?.template?.split(".")?.[0] === prefix && (!suffix || _stores.router?.template?.split(".")?.[1] === suffix)
      );
      document.body.style.setProperty(
        "--navigation-bar-transparent-height",
        transparent ? `-${$el.clientHeight}px` : `0`
      );
      if (colorScheme === transparentColorScheme) {
        return;
      }
      if (transparent || !transparent && $el?.classList?.contains(transparentColorScheme)) {
        const makeTransparent = transparent && !_stores.modal.id.includes("megamenu-") && _stores.modal.id !== "search" && !_stores.modal.id.includes("country-selector") && window.scrollY <= 300 && e?.type !== "pointerover";
        $el?.classList?.toggle(colorScheme, !makeTransparent);
        $el?.classList?.toggle(transparentColorScheme, makeTransparent);
        $el?.classList?.toggle("navigation-bar--transparent", makeTransparent);
        $refs?.navigation_bar_background_image?.classList?.toggle("!opacity-0", makeTransparent);
      }
    }, "handleTransition");
    if (instant) {
      handleTransition();
    } else {
      Alpine.nextTick(handleTransition);
    }
  }, "toggleTransparent");
  return {
    $el,
    $refs,
    toggleTransparent
  };
}, "initNavigationBar");
window._sections["initNavigationBar"] = initNavigationBar;
