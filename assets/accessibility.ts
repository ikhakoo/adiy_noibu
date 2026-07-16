export const initAccessibility = () => {
  document
    .querySelectorAll<HTMLElement>(`[role="button"], [role="link"], [data-icon-handle]`)
    .forEach((element) => {
      element.onkeydown = (event) => {
        if (element.role !== "link" && element.role !== "button") {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          element.dispatchEvent(new Event("click"));
        }
      };
    });
};
