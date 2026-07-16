const supported = typeof window === "undefined" ? true : "onscrollend" in window;

if (!supported) {
  const scrollendEvent = new Event("scrollend");
  const pointers = new Set();

  // Track if any pointer is active
  document.addEventListener(
    "touchstart",
    (e) => {
      for (const touch of e.changedTouches) pointers.add(touch.identifier);
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      for (const touch of e.changedTouches) pointers.delete(touch.identifier);
    },
    { passive: true }
  );

  document.addEventListener(
    "touchcancel",
    (e) => {
      for (const touch of e.changedTouches) pointers.delete(touch.identifier);
    },
    { passive: true }
  );

  // Map of scroll-observed elements.
  const observed = new WeakMap();

  // Forward and observe calls to a native method.
  // eslint-disable-next-line no-inner-declarations
  function observe(proto, method, handler) {
    const native = proto[method];
    proto[method] = function () {
      // eslint-disable-next-line prefer-rest-params
      const args = Array.prototype.slice.apply(arguments, [0]);
      native.apply(this, args);
      args.unshift(native);
      handler.apply(this, args);
    };
  }

  // eslint-disable-next-line no-inner-declarations
  function onAddListener(originalFn, type, handler, options) {
    // Polyfill scrollend event on any element for which the developer listens
    // to 'scrollend' explicitly or 'scroll' (so that adding a scrollend listener
    // from within a scroll listener works).
    // eslint-disable-next-line eqeqeq
    if (type != "scroll" && type != "scrollend") return;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scrollport = this;
    let data = observed.get(scrollport);
    if (data === undefined) {
      let timeout = 0;
      data = {
        scrollListener: (evt) => {
          clearTimeout(timeout);
          // @ts-ignore
          timeout = setTimeout(() => {
            if (pointers.size) {
              // if pointer(s) are down, wait longer
              setTimeout(data.scrollListener, 180);
            } else {
              // dispatch
              if (scrollport) {
                scrollport.dispatchEvent(scrollendEvent);
              }
              timeout = 0;
            }
          }, 180);
        },
        listeners: 0, // Count of number of listeners.
      };
      originalFn.apply(scrollport, ["scroll", data.scrollListener]);
      observed.set(scrollport, data);
    }
    data.listeners++;
  }

  // eslint-disable-next-line no-inner-declarations
  function onRemoveListener(originalFn, type, handler) {
    // eslint-disable-next-line eqeqeq
    if (type != "scroll" && type != "scrollend") return;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scrollport = this;
    const data = observed.get(scrollport);

    // Mismatched addEventListener / removeEventListener
    // TODO: Should we explicitly track added listeners to prevent this?
    if (data === undefined) return;

    data[type]--;
    // If there are still listeners, nothing more to do.
    if (--data.listeners > 0) return;

    // Otherwise, remove the added listeners.
    originalFn.apply(scrollport, ["scroll", data.scrollListener]);
    observed.delete(scrollport);
  }

  observe(Element.prototype, "addEventListener", onAddListener);
  observe(window, "addEventListener", onAddListener);
  observe(document, "addEventListener", onAddListener);
  observe(Element.prototype, "removeEventListener", onRemoveListener);
  observe(window, "removeEventListener", onRemoveListener);
  observe(document, "removeEventListener", onRemoveListener);
  // TODO: Polyfill onscroll, onscrollend as well?
}
