export type TooltipStore = {
  tooltips: Map<
    HTMLElement,
    {
      tooltip: HTMLElement;
      timeout: NodeJS.Timeout;
      handleUpdateCoordinates: () => void;
      scrollParents: (HTMLElement | Window)[];
    }
  >;
  addTooltip: (
    element: HTMLElement,
    content: string,
    position: "top" | "bottom" | "left" | "right"
  ) => void;
  removeTooltip: (element: HTMLElement) => void;
};

export const initTooltip = () => {
  const container = document.querySelector("[data-tooltip-container]");
  window.Alpine.store("tooltip", {
    tooltips: new Map(),
    async addTooltip(element, content, position = "top") {
      const currentTooltip = this.tooltips.get(element);
      if (!currentTooltip) {
        const parents = utils.findAllScrollableParents(element);
        const tooltipElement = document.createElement("div");
        tooltipElement.innerHTML = content;
        const handleUpdateCoordinates = () => {
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
        };

        this.tooltips.set(element, {
          tooltip: tooltipElement,
          timeout: null,
          handleUpdateCoordinates,
          scrollParents: parents,
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
          // addTooltip attaches a scroll listener to every scroll parent (and
          // window); tear them down here so they don't leak for the session.
          currentTooltip.scrollParents?.forEach((parent) => {
            parent.removeEventListener("scroll", currentTooltip.handleUpdateCoordinates);
          });
          this.tooltips.delete(element);
          tooltip.ontransitionend = (event) => {
            tooltip.remove();
          };
        }, 50);
      }
    },
  } as TooltipStore);
  const tooltipStore = window.Alpine.store("tooltip") as TooltipStore;
  window.Alpine.magic("tooltip", () => tooltipStore);
  window._stores["tooltip"] = tooltipStore;
};

declare module "alpinejs" {
  interface Magics<T> {
    $tooltip: TooltipStore;
  }
}
