import { InitContentSlider } from "../sections/content-slider/content-slider";

export const initScrollBar = () => {};

export type ScrollbarFunctions = typeof _scrollbar;

export const _scrollbar = {
  init: (
    bar: HTMLElement,
    thumb: HTMLButtonElement,
    container: HTMLElement,
    scroll_speed = 150
  ) => {
    const state = window.Alpine.reactive({
      currentPage: Math.max(
        1,
        Math.min(
          [...container.children]?.filter(
            (child) =>
              getComputedStyle(child).display !== "none" &&
              getComputedStyle(child).scrollSnapAlign !== "none"
          ).length,
          [...container.children]
            ?.filter(
              (child) =>
                getComputedStyle(child).display !== "none" &&
                getComputedStyle(child).scrollSnapAlign !== "none"
            )
            .findIndex((child: HTMLElement) => {
              const center = container.clientWidth / 2 + container.scrollLeft;
              const start =
                container.scrollLeft +
                +getComputedStyle(container)
                  .scrollPaddingLeft.replace("px", "")
                  .replace("auto", "0");

              if (
                container.children.length >
                Math.round((container.scrollWidth / container.clientWidth) * 100) / 100
              ) {
                return (
                  child.offsetLeft - 5 <= start && child.offsetLeft + child.clientWidth > start
                );
              }
              return child.offsetLeft < center && child.offsetLeft + child.clientWidth > center;
            }) + 1
        )
      ),
      pages: [...container.children]?.filter(
        (child) =>
          getComputedStyle(child).display !== "none" &&
          getComputedStyle(child).scrollSnapAlign !== "none"
      ).length,
      width: (container.clientWidth / container.scrollWidth) * 100,
      left: ((container.scrollLeft / container.scrollWidth) * bar.clientWidth) / bar.clientWidth,
      manual_scroll: false,
      no_next_page: container?.scrollLeft + container?.clientWidth + 25 >= container?.scrollWidth,
    });

    const calculatePosition = () => {
      const children = [...(container?.children ?? [])].filter((el) => el.tagName !== "STYLE");
      state.currentPage = Math.max(
        1,
        Math.min(
          children?.filter(
            (child) =>
              getComputedStyle(child).display !== "none" &&
              getComputedStyle(child).scrollSnapAlign !== "none"
          ).length,
          children
            ?.filter(
              (child) =>
                getComputedStyle(child).display !== "none" &&
                getComputedStyle(child).scrollSnapAlign !== "none"
            )
            .findIndex((child: HTMLElement) => {
              const center = container.clientWidth / 2 + container.scrollLeft;

              const start =
                container.scrollLeft +
                +getComputedStyle(container)
                  .scrollPaddingLeft.replace("px", "")
                  .replace("auto", "0");

              if (
                children.length >
                Math.round((container.scrollWidth / container.clientWidth) * 100) / 100
              ) {
                return (
                  child.offsetLeft - 5 <= start && child.offsetLeft + child.clientWidth > start
                );
              }
              return child.offsetLeft < center && child.offsetLeft + child.clientWidth > center;
            }) + 1
        )
      );

      state.pages = children?.filter((child) => getComputedStyle(child).display !== "none").length;
      state.width = container.clientWidth / container.scrollWidth;
      state.left =
        ((container.scrollLeft / container.scrollWidth) * bar.clientWidth) / bar.clientWidth;
      state.no_next_page =
        state.currentPage === state.pages ||
        container?.scrollLeft + container?.clientWidth + 25 >= container?.scrollWidth;
    };

    const handleScrollBarClick = (
      e: PointerEvent,
      content_slider?: ReturnType<InitContentSlider>["content_slider"]
    ) => {
      const percentage =
        (e.clientX - bar.getBoundingClientRect().left) / bar.clientWidth -
        ((state.width / 2) * bar.clientWidth) / bar.clientWidth;
      if (content_slider?.state) {
        content_slider.state.block_scroll_events = true;
      }
      container.scrollTo({
        left: percentage * container.scrollWidth,
        behavior: "instant",
      });

      if (content_slider?.state) {
        content_slider.state.block_scroll_events = false;
      }

      calculatePosition();
    };

    const handleScrollThumbPointerDown = (
      e: PointerEvent,
      content_slider?: ReturnType<InitContentSlider>["content_slider"]
    ) => {
      container.style.scrollSnapType = "none";
      const startX = e.clientX;
      const startLeft = state.left * bar.clientWidth;
      document.body.classList.add("[&_*]:!cursor-grabbing");
      thumb.classList.add("active");
      if (content_slider?.state) {
        content_slider.state.block_scroll_events = true;
      }
      const handleDocumentPointerMove = (e) => {
        const percentage = Math.max(
          0,
          Math.min(1, (startLeft + e.clientX - startX) / bar.clientWidth)
        );

        container.scrollTo({
          left: percentage * container.scrollWidth,
          behavior: "instant",
        });
        calculatePosition();
      };
      const handleDocumentPointerUp = (e) => {
        removeEventListeners();
      };

      const removeEventListeners = () => {
        document.body.classList.remove("[&_*]:!cursor-grabbing");
        thumb.classList.remove("active");
        container.style.scrollSnapType = "";
        document.removeEventListener("pointermove", handleDocumentPointerMove);
        document.removeEventListener("pointerup", handleDocumentPointerUp);
        if (content_slider?.state) {
          content_slider.state.block_scroll_events = false;
        }
      };

      document.addEventListener("pointermove", handleDocumentPointerMove);
      document.addEventListener("pointerup", handleDocumentPointerUp);
    };

    const handlePrevClick = (
      e: PointerEvent,
      content_slider?: ReturnType<InitContentSlider>["content_slider"]
    ) => {
      container.style.scrollSnapType = "none";
      if (content_slider?.state) {
        content_slider.state.block_scroll_events = true;
      }
      const activeChildren = ([...container.children] as HTMLElement[])?.filter(
        (child) =>
          getComputedStyle(child).display !== "none" &&
          getComputedStyle(child).scrollSnapAlign !== "none" &&
          child.tagName !== "STYLE"
      );
      /* ?.sort((a, b) => +a.style.order - +b.style.order) as HTMLElement[];*/

      utils.scrollToX(
        scroll_speed,
        (activeChildren[
          Math.max(
            0,
            state.currentPage - 2 < 0 ? activeChildren?.length - 1 : state.currentPage - 2
          )
        ]?.offsetLeft ?? 0) -
          +getComputedStyle(container).scrollPaddingLeft.replace("px", "").replace("auto", "0"),
        container,
        () => {
          container.style.scrollSnapType = "";
          calculatePosition();
          if (content_slider?.state) {
            content_slider.state.block_scroll_events = false;
          }
        }
      );
    };

    const handleNextClick = (
      e: PointerEvent,
      content_slider?: ReturnType<InitContentSlider>["content_slider"]
    ) => {
      container.style.scrollSnapType = "none";
      if (content_slider?.state) {
        content_slider.state.block_scroll_events = true;
      }
      const activeChildren = ([...container.children] as HTMLElement[])?.filter(
        (child) =>
          getComputedStyle(child).display !== "none" &&
          getComputedStyle(child).scrollSnapAlign !== "none" &&
          child.tagName !== "STYLE"
      );
      /* ?.sort((a, b) => +a.style.order - +b.style.order) as HTMLElement[];*/
      // console.log({ content_slider, activeChildren }, state.currentPage);

      utils.scrollToX(
        scroll_speed,
        (activeChildren[
          Math.min(
            activeChildren.length - 1,
            state.currentPage === activeChildren?.length ? 0 : state.currentPage
          )
        ]?.offsetLeft ?? 0) -
          +getComputedStyle(container).scrollPaddingLeft.replace("px", "").replace("auto", "0"),
        container,
        () => {
          container.style.scrollSnapType = "";
          calculatePosition();
          if (content_slider?.state) {
            content_slider.state.block_scroll_events = false;
          }
        }
      );
    };

    container.onscroll = (e: Event) => {
      calculatePosition();
    };

    const mutationObserver = new MutationObserver((e) => {
      calculatePosition();
    });

    mutationObserver.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
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
      containerRef: container,
    };
  },
};

window._scrollbar = _scrollbar;
