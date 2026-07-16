var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initContentSlider = /* @__PURE__ */ __name((container, speed = 200, infiniteScroll = false) => {
  const random_id = utils.shortUUID();
  let breakPoints = [];
  let children = [...container.children].filter((el) => el.tagName !== "STYLE");
  const size = children.length;
  let infinite = false;
  if (infiniteScroll && !infinite) {
    if (container.scrollWidth > container.clientWidth) {
      infinite = true;
      children = [...new Array(size * 2)].map((_, index) => {
        const order = index - size;
        const child = children.at(order);
        child.style.order = `${order}`;
        if (order < 0) {
          const newChild = child.cloneNode(true);
          container.append(newChild);
          return newChild;
        }
        return child;
      })?.sort((a, b) => +a.style.order - +b.style.order);
      container.scrollLeft = children[size]?.offsetLeft;
    }
  }
  const calculateSlideCount = /* @__PURE__ */ __name((padding = state.padding, gap = state.gap, scrollWidth = container.scrollWidth, clientWidth = container.clientWidth) => {
    breakPoints = [];
    const targetElements = [...container.children]?.slice(
      0,
      Math.ceil(
        container.children?.length / +(getComputedStyle(container).getPropertyValue("grid-template-rows").split(" ").length ?? 1)
      )
    )?.filter(
      (child) => getComputedStyle(child).display !== "none" && getComputedStyle(child).scrollSnapAlign !== "none"
    );
    if (!Math.ceil((scrollWidth - padding) / (clientWidth - padding))) {
      return 0;
    }
    const breakPointIndex = [
      ...new Array(
        Math.ceil(Math.round((scrollWidth - padding) / (clientWidth - padding) * 100) / 100)
      )
    ].reduce((acc, _, index) => {
      breakPoints[index] = (clientWidth - padding) * index + index * gap;
      if (!acc && (clientWidth - padding) * index + index * gap >= scrollWidth - padding) {
        breakPoints[index] = (clientWidth - padding) * index + (index - 1) * gap;
        return index;
      }
      return acc;
    }, 0);
    if (targetElements.length) {
      return infinite ? targetElements.length / 2 : targetElements.length;
    }
    return breakPointIndex || Math.ceil(Math.round((scrollWidth - padding) / (clientWidth - padding) * 100) / 100);
  }, "calculateSlideCount");
  const state = window.Alpine.reactive({
    random_id,
    container,
    infinite,
    justify: getComputedStyle(container).justifyContent,
    slide_index: 0,
    padding: parseInt(getComputedStyle(container).paddingLeft) * 2,
    gap: parseInt(getComputedStyle(container).gap),
    slide_count: calculateSlideCount(
      parseInt(getComputedStyle(container).paddingLeft) * 2,
      parseInt(getComputedStyle(container).gap)
    ),
    children,
    block_scroll_events: false
  });
  const handleInfiniteScroll = /* @__PURE__ */ __name(() => {
    if (state.block_scroll_events || !infinite) return;
    const kids = [...state.children];
    const targetIndex = kids.findIndex(
      (kid) => kid.offsetLeft - 30 < container.scrollLeft && kid.offsetLeft + 30 > container.scrollLeft
    );
    state.block_scroll_events = true;
    state.children = [...state.children].map((child, index) => {
      const targetOrder = index - targetIndex;
      child.style.order = targetOrder >= -size && targetOrder < size ? `${targetOrder}` : targetOrder < -size ? targetOrder + size * 2 : targetOrder - size * 2;
      return child;
    })?.sort((a, b) => +a.style.order - +b.style.order);
    container.scrollLeft = state.children[size].offsetLeft;
    Alpine.nextTick(() => {
      state.block_scroll_events = false;
    });
  }, "handleInfiniteScroll");
  const handleScroll = /* @__PURE__ */ __name(() => {
    const currentIndex = breakPoints.findIndex(
      (num) => container.scrollLeft >= num - 20 && container.scrollLeft <= num + 20
    );
    const closest = breakPoints.reduce((acc, num) => {
      return Math.abs(num - container.scrollLeft) < Math.abs(acc - container.scrollLeft) ? num : acc;
    }, 0);
    const closestIndex = breakPoints.findIndex((num) => closest === num);
    const children2 = [...container.children]?.filter(
      (child) => getComputedStyle(child).display !== "none" && getComputedStyle(child).scrollSnapAlign !== "none"
    );
    if (infinite && children2?.length) {
      const targetIndex = children2?.findIndex((child) => +child.style.order === 0);
      state.slide_index = targetIndex >= children2.length / 2 ? targetIndex - children2.length / 2 : targetIndex;
      return;
    }
    state.slide_index = currentIndex !== -1 ? currentIndex : closestIndex !== -1 ? closestIndex : state.slide_index;
  }, "handleScroll");
  const handleResize = /* @__PURE__ */ __name(() => {
    state.padding = parseInt(getComputedStyle(container).paddingLeft) * 2;
    state.gap = parseInt(getComputedStyle(container).gap);
    state.slide_count = calculateSlideCount();
    if (infiniteScroll && !infinite) {
      if (container.scrollWidth > container.clientWidth) {
        infinite = true;
        children = [...new Array(size * 2)].map((_, index) => {
          const order = index - size;
          const child = children.at(order);
          child.style.order = `${order}`;
          if (order < 0) {
            const newChild = child.cloneNode(true);
            container.append(newChild);
            return newChild;
          }
          return child;
        })?.sort((a, b) => +a.style.order - +b.style.order);
        container.scrollLeft = children[size]?.offsetLeft;
      }
    }
    container.parentElement.style.setProperty("--slider-height", `${container.offsetHeight}px`);
    if (state.justify === "center") {
      container.classList.toggle("!justify-start", container.scrollWidth > container.clientWidth);
      handleScroll();
    }
  }, "handleResize");
  const scrollToIndex = /* @__PURE__ */ __name((index, scrollDuration = speed) => {
    container.classList.remove("snap-x");
    state.block_scroll_events = true;
    const children2 = [...container.children]?.filter(
      (child) => getComputedStyle(child).display !== "none" && getComputedStyle(child).scrollSnapAlign !== "none"
    );
    if (infinite && children2?.length) {
      const target = children2[index];
      utils.scrollToX(scrollDuration, target?.offsetLeft, container, () => {
        container.classList.add("snap-x");
        state.block_scroll_events = false;
        handleInfiniteScroll();
      });
      return;
    }
    utils.scrollToX(
      scrollDuration,
      (container.clientWidth - state.padding) * index + index * state.gap,
      container,
      () => {
        container.classList.add("snap-x");
        state.block_scroll_events = false;
      }
    );
  }, "scrollToIndex");
  if (state.justify === "center") {
    container.classList.toggle("!justify-start", container.scrollWidth > container.clientWidth);
    state.padding = parseInt(getComputedStyle(container).paddingLeft) * 2;
    state.gap = parseInt(getComputedStyle(container).gap);
    state.slide_count = calculateSlideCount();
    handleScroll();
  }
  return {
    content_slider: {
      state,
      handleInfiniteScroll,
      handleScroll,
      handleResize,
      scrollToIndex
    }
  };
}, "initContentSlider");
window._sections["initContentSlider"] = initContentSlider;
