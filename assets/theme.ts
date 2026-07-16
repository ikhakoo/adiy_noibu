import "./polyfills";
import { initAccessibility } from "./accessibility";

import { initProductDrawer } from "./init-product-drawer";
import { initMediaGallery } from "./media-gallery";
import { initQuickView } from "./quick-view";
import { initScrollBar } from "./scrollbar";
import { initSmoothScroll } from "./smooth-scroll";
import utils from "./utils";
import { initModals } from "./modals";
import { initCart } from "./cart";
import { EditorStore } from "./editor";
import { initPageTransitions } from "./page-transitions";
import { initProductData } from "./product-data";
import { initToast } from "./toast";
import { initTooltip } from "./tooltip";
import { initBackInStockNotification } from "./back-in-stock-notification";
import { initPagination } from "./pagination";

// @ts-ignore
window.utils = utils;

export const initTheme = () => {
  if (!window.location.origin.includes("127.0.0.1") && Shopify.theme.role === "main") {
    console.log(
      "%cHEY YOU! I see you peeking into the code. This Theme is custom built by Platter.co. This site is powered Alpine.JS, Tailwind CSS & TypeScript integrated into Shopify using our proprietary development tools. https://www.platter.co/",
      "background: rgb(0,0,0);color: #fafafa;font-size: 24px;font-weight: bold;padding: 16px 10px;text-align: center;text-shadow: 2px 2px 0 rgba(45, 45, 45);"
    );
    console.log(
      "%cWe are constantly looking for talented developers. If you have Shopify theme development experience under your belt and are keen to explore an exciting tech stack in a fast paced environment. Contact us at engineering@platter.co ",
      "background: rgb(0,0,0);color: #fafafa;font-size: 24px;font-weight: bold;padding: 16px 10px;text-align: center;text-shadow: 2px 2px 0 rgba(45, 45, 45);"
    );
  }

  window.Alpine.store("editor", {
    load_section_id: "",
    unload_section_id: "",
    select_section_id: "",
    reorder_section_id: "",
    select_block_id: "",
    inspector: false,
    setValue(key: keyof typeof this, value: string | boolean) {
      this[key] = value;
    },
  });
  const editor = window.Alpine.store("editor") as EditorStore;
  window.Alpine.magic("editor", () => editor);

  initModals();
  initAccessibility();
  initQuickView();
  initProductDrawer();
  initCart();
  initProductData();
  initScrollBar();
  initTooltip();
  initToast();
  initMediaGallery();
  initBackInStockNotification();
  initSmoothScroll();
  initPageTransitions();
  initPagination();

  if (window.design_mode) {
    document.dispatchEvent(new CustomEvent("theme:init"));
  }
};

document.addEventListener("alpine:init", initTheme);
