var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// assets/utils.ts
var clsx = /* @__PURE__ */ __name((...props) => {
  let i = 0;
  let tmp;
  let str = "";
  const len = props.length;
  for (; i < len; i++) {
    if (tmp = props[i]) {
      if (typeof tmp === "string") {
        str += (str && " ") + tmp;
      }
    }
  }
  return str;
}, "clsx");
var formatMoney = /* @__PURE__ */ __name((cents, money_format, no_rounding = true) => {
  if (!cents && cents !== 0) {
    return "";
  }
  function n(t, e) {
    return void 0 === t ? e : t;
  }
  __name(n, "n");
  function o(t, e, o2, i2) {
    if (e = n(e, 2), o2 = n(o2, ","), i2 = n(i2, "."), isNaN(t) || null === t) return 0;
    const r2 = (t = (t / 100).toFixed(e)).split(".");
    return r2[0].replace(/\B(?=(\d{3})+(?!\d))/g, o2) + (r2[1] ? i2 + r2[1] : "");
  }
  __name(o, "o");
  "string" === typeof cents && (cents = cents.replace(".", ""));
  let i = "";
  const r = /{{\s*(\w+)\s*}}/;
  const a = money_format || window.money_format || `\${{amount}}`;
  switch (a.match(r)[1]) {
    case "amount":
      i = o(cents, 2);
      break;
    case "amount_no_decimals": {
      if (no_rounding && +cents % 100 > 0) {
        i = o(cents, 2);
        break;
      }
      i = o(cents, 0);
      break;
    }
    case "amount_with_comma_separator":
      i = o(cents, 2, ".", ",");
      break;
    case "amount_with_space_separator":
      i = o(cents, 2, " ", ",");
      break;
    case "amount_with_period_and_space_separator":
      i = o(cents, 2, " ", ".");
      break;
    case "amount_no_decimals_with_comma_separator":
      i = o(cents, 0, ".", ",");
      break;
    case "amount_no_decimals_with_space_separator":
      i = o(cents, 0, " ");
      break;
    case "amount_with_apostrophe_separator":
      i = o(cents, 2, "'", ".");
      break;
    default:
      i = o(cents, 2, ",", ".");
  }
  return a.replace(r, i);
}, "formatMoney");
window["formatMoney"] = formatMoney;
window.clsx = clsx;

// assets/editor.ts
document.addEventListener("theme:init", () => {
  const shopifyEvents = [
    "shopify:inspector:activate",
    "shopify:inspector:deactivate",
    "shopify:section:load",
    "shopify:section:unload",
    "shopify:section:select",
    "shopify:section:deselect",
    "shopify:section:reorder",
    "shopify:block:select",
    "shopify:block:deselect"
  ];
  shopifyEvents.forEach((eventType) => {
    document.addEventListener(
      eventType,
      (event) => {
        if (event?.detail) {
        }
        const action = event.type.replace(/shopify:(section|block):/gi, "");
        const editor = window.Alpine.store("editor");
        const resetEditor = {
          load_section_id: "",
          unload_section_id: "",
          reorder_section_id: "",
          deselect_block_id: "",
          deselect_section_id: ""
        };
        const resetEditorFn = /* @__PURE__ */ __name(() => {
          editor.load_section_id = "";
          editor.unload_section_id = "";
          editor.reorder_section_id = "";
          editor.deselect_block_id = "";
          editor.deselect_section_id = "";
        }, "resetEditorFn");
        switch (event.type) {
          case "shopify:section:load": {
            if (event.target instanceof HTMLElement) {
              const sectionElement = event.target.closest(
                "[data-shopify-editor-section]"
              );
              window.Shopify.editor = {
                ...window.Shopify.editor ?? {},
                ...resetEditor,
                load_section_id: event.detail.sectionId
              };
              resetEditorFn();
              editor.load_section_id = event.detail.sectionId;
              document.dispatchEvent(
                new CustomEvent(`editor-${action}--${event.detail.sectionId}`)
              );
              document.dispatchEvent(new CustomEvent(`editor_load`));
            }
            break;
          }
          case "shopify:section:unload": {
            if (event.target instanceof HTMLElement) {
              const sectionElement = event.target.closest(
                "[data-shopify-editor-section]"
              );
              window.Shopify.editor = {
                ...window.Shopify.editor ?? {},
                ...resetEditor,
                unload_section_id: event.detail.sectionId
              };
              resetEditorFn();
              editor.unload_section_id = event.detail.sectionId;
              document.dispatchEvent(
                new CustomEvent(`editor-${action}--${event.detail.sectionId}`)
              );
              document.dispatchEvent(new CustomEvent(`editor_unload`));
            }
            break;
          }
          case "shopify:section:select":
            window.Shopify.editor = {
              ...window.Shopify.editor ?? {},
              ...resetEditor,
              select_section_id: event.detail.sectionId
            };
            resetEditorFn();
            editor.select_block_id = "";
            editor.load_section_id = event.detail.load ? event.detail.sectionId : "";
            editor.select_section_id = event.detail.sectionId;
            document.dispatchEvent(new CustomEvent(`editor-${action}--${event.detail.sectionId}`));
            break;
          case "shopify:section:deselect":
            window.Shopify.editor = {
              ...window.Shopify.editor ?? {},
              ...resetEditor,
              select_section_id: "",
              select_block_id: "",
              deselect_section_id: event.detail.sectionId
            };
            resetEditorFn();
            editor.select_section_id = "";
            editor.select_block_id = "";
            editor.deselect_section_id = event.detail.sectionId;
            document.dispatchEvent(new CustomEvent(`editor-${action}--${event.detail.sectionId}`));
            break;
          case "shopify:section:reorder":
            window.Shopify.editor = {
              ...window.Shopify.editor ?? {},
              ...resetEditor,
              reorder_section_id: event.detail.sectionId
            };
            resetEditorFn();
            editor.reorder_section_id = event.detail.sectionId;
            document.dispatchEvent(new CustomEvent(`editor-${action}--${event.detail.sectionId}`));
            break;
          case "shopify:block:select":
            window.Shopify.editor = {
              ...window.Shopify.editor ?? {},
              ...resetEditor,
              select_block_id: event.detail.blockId
            };
            resetEditorFn();
            editor.load_section_id = event.detail.load ? event.detail.sectionId : "";
            editor.select_block_id = event.detail.blockId;
            document.dispatchEvent(new CustomEvent(`editor-${action}--${event.detail.blockId}`));
            break;
          case "shopify:block:deselect":
            window.Shopify.editor = {
              ...window.Shopify.editor ?? {},
              ...resetEditor,
              select_block_id: "",
              deselect_block_id: event.detail.blockId
            };
            resetEditorFn();
            editor.select_block_id = "";
            editor.deselect_block_id = event.detail.blockId;
            document.dispatchEvent(new CustomEvent(`editor-${action}--${event.detail.blockId}`));
            break;
          case "shopify:inspector:activate":
            window.Shopify.editor = {
              ...window.Shopify.editor ?? {},
              ...resetEditor,
              inspector: true
            };
            resetEditorFn();
            editor.inspector = true;
            break;
          case "shopify:inspector:deactivate":
            window.Shopify.editor = {
              ...window.Shopify.editor ?? {},
              ...resetEditor,
              inspector: false
            };
            editor.inspector = false;
            break;
        }
      }
    );
  });
});

 // random_comment 