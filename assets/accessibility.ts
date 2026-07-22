export const initAccessibility = () => {
  document
    .querySelectorAll<HTMLElement>(`[role="button"], [role="link"], [data-icon-handle]`)
    .forEach((element) => {
      element.onkeydown = (event) => {
        if (
          element.role !== "link" &&
          element.role !== "button" &&
          !element.hasAttribute("data-icon-handle")
        ) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          // A bare, non-bubbling `new Event("click")` is a known Safari
          // click re-dispatch recursion vector; use a real MouseEvent.
          element.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
          );
        }
      };
    });
};
