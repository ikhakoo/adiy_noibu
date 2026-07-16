var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initAnnouncementBar = /* @__PURE__ */ __name(($el, $refs) => {
  const initialChildren = [...$el.children];
  const settings = utils.JSONParse(
    $el.getAttribute("data-settings")
  );
  let block_scroll_events = false;
  let timeout = null;
  const children = [...new Array(5)].reduce((acc, _, index) => {
    if (index === 0) {
      return initialChildren;
    }
    if (acc.length < 5) {
      acc = [
        ...acc,
        ...initialChildren.map((child) => {
          const newChild = child.cloneNode(true);
          newChild?.removeAttribute("data-block-id");
          newChild?.removeAttribute("data-shopify-editor-block");
          return newChild;
        })
      ];
    }
    return acc;
  }, [])?.map((child, index, arr) => {
    child.style.order = `${index > arr.length - 3 ? -arr.length + index : index}`;
    return child;
  });
  $el.scrollLeft = $el.clientWidth * 2;
  $el.replaceChildren(...children);
  const handleScroll = /* @__PURE__ */ __name(() => {
    if (block_scroll_events) return;
    resetIndex();
    if ($el.scrollLeft > $el.clientWidth * 3) {
      block_scroll_events = true;
      [...children].sort((a, b) => +a.style.order - +b.style.order).forEach((child, index, arr) => {
        child.style.order = `${index === 0 ? arr.length - 3 : +child.style.order - 1}`;
      });
      $el.scrollLeft = $el.scrollLeft - $el.clientWidth;
      block_scroll_events = false;
    }
    if ($el.scrollLeft < $el.clientWidth) {
      block_scroll_events = true;
      [...children].sort((a, b) => +a.style.order - +b.style.order).forEach((child, index, arr) => {
        child.style.order = `${index === arr.length - 1 ? -2 : +child.style.order + 1}`;
      });
      $el.scrollLeft = $el.scrollLeft + $el.clientWidth;
      block_scroll_events = false;
    }
  }, "handleScroll");
  const resetIndex = /* @__PURE__ */ __name(() => {
    if (!settings.display_duration || block_scroll_events) return;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      block_scroll_events = true;
      $el.classList.remove("snap-x");
      utils.scrollToX(300, $el.scrollLeft + $el.clientWidth, $el, () => {
        [...children].sort((a, b) => +a.style.order - +b.style.order).forEach((child, index, arr) => {
          child.style.order = `${index === 0 ? arr.length - 3 : +child.style.order - 1}`;
        });
        $el.scrollLeft = $el.scrollLeft - $el.clientWidth;
        block_scroll_events = false;
        $el.classList.add("snap-x");
        resetIndex();
      });
    }, settings.display_duration * 1e3);
  }, "resetIndex");
  const handleEditorBlockSelect = /* @__PURE__ */ __name((blockId) => {
    const focusChild = children.find((el) => el.getAttribute("data-block-id") === blockId);
    $el.classList.toggle("!overflow-hidden", !!focusChild);
    $el.classList.toggle("snap-x", !focusChild);
    block_scroll_events = !!focusChild;
    if (focusChild) {
      $el.scrollLeft = focusChild?.offsetLeft;
      clearTimeout(timeout);
      timeout = null;
    } else {
      if (!timeout && settings.display_duration) {
        resetIndex();
      }
    }
  }, "handleEditorBlockSelect");
  const initMarqueeAnimationBlock = /* @__PURE__ */ __name(($el2) => {
    const mobile = $el2.children[0];
    const desktop = $el2.children[1];
    if (mobile.hasAttribute("data-marquee-animation") && mobile.clientWidth && mobile.children?.length <= 1) {
      const contentRoot = mobile.children[0];
      const contentWidth = contentRoot.clientWidth;
      mobile.style.animationDuration = "15s";
      mobile.classList.add(
        ..."left-0 absolute w-[200%] overflow-hidden grid grid-flow-col gap-3 whitespace-nowrap motion-reduce:animate-slide".split(
          " "
        )
      );
      mobile.style.gridAutoColumns = `${contentWidth}px`;
      const target = 768 / (contentWidth + 12) * 2.2;
      for (let i = 0; i < target; i++) {
        const clonedItem = contentRoot.cloneNode(true);
        clonedItem.setAttribute("aria-hidden", "true");
        mobile.appendChild(clonedItem);
      }
    }
    if (desktop.hasAttribute("data-marquee-animation") && desktop.clientWidth && desktop.children?.length <= 1) {
      const contentRoot = desktop.children[0];
      const contentWidth = contentRoot.clientWidth;
      desktop.style.animationDuration = "15s";
      desktop.classList.add(
        ..."left-0 absolute w-[200%] overflow-hidden grid grid-flow-col gap-3 whitespace-nowrap motion-reduce:animate-slide".split(
          " "
        )
      );
      desktop.style.gridAutoColumns = `${contentWidth}px`;
      const target = desktop.clientWidth / (contentWidth + 12) * 2.2;
      for (let i = 0; i < target; i++) {
        const clonedItem = contentRoot.cloneNode(true);
        clonedItem.setAttribute("aria-hidden", "true");
        desktop.appendChild(clonedItem);
      }
    }
  }, "initMarqueeAnimationBlock");
  resetIndex();
  return {
    handleScroll,
    resetIndex,
    handleEditorBlockSelect,
    initMarqueeAnimationBlock
  };
}, "initAnnouncementBar");
window._sections["initAnnouncementBar"] = initAnnouncementBar;
