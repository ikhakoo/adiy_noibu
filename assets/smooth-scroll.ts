import { getElementOffset, isInViewport } from "./utils";

export const initSmoothScroll = () => {
  const elements = new Set();
  const initEvents = (target: Element | Document = document) => {
    const links = target.querySelectorAll<HTMLAnchorElement>(
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
      const target = document.getElementById(id);

      if (!target) {
        return;
      }

      link.onclick = (e) => {
        // e.preventDefault();
        const target = document.getElementById(id);

        if (
          utils.isElementScrollable(target.parentElement) &&
          utils.isVisible(target.parentElement) &&
          utils.isInViewport(target)
        ) {
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

        const targetPosition =
          utils.getElementPosition(target)?.top -
          Math.max(
            0,
            document
              .querySelector<HTMLElement>(".header-sections-container")
              ?.getBoundingClientRect()?.bottom ?? 0
          );
        utils.scrollToY(
          260 + Math.abs(Math.round((window.scrollY - targetPosition) / 15)),
          targetPosition
        );
      };
    });
  };

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
};
