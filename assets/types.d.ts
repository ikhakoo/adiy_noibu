import "@total-typescript/ts-reset/filter-boolean";
import type Core from "@barba/core";
import type BarbaPrefetch from "@barba/prefetch";
import { type Alpine as alpine } from "alpinejs";
import { Pagination } from "assets/pagination";

import type * as Utils from "assets/utils";
import type * as Dayjs from "dayjs";
import type IdbKeyval from "idb-keyval";
import { type SettingsSchema } from "types/settings";
import { type _Article_liquid, _Blog_liquid, type _Collection_liquid, type _Media_liquid, _Page_liquid, type _Product_liquid, type _Variant_liquid } from "types/shopify";
import { type InitDynamicProductCards } from "../blocks/dynamic-product-cards/dynamic-product-cards";
import { type InitBundle } from "../sections/bundle/bundle";
import { type HydrateArticleCard, type InitArticleCard } from "../sections/card_article-card/card_article-card";
import { type HydrateBlogCard, type InitBlogCard } from "../sections/card_blog-card/card_blog-card";
import { type HydrateCollectionCard, type InitCollectionCard } from "../sections/card_collection-card/card_collection-card";
import { type HydrateMetaobjectCard, type InitMetaobjectCard } from "../sections/card_metaobject-card/card_metaobject-card";
import { type HydratePageCard, type InitPageCard } from "../sections/card_page-card/card_page-card";
import { type HydrateProductCard, type InitProductCard } from "../sections/card_product-card/card_product-card";
import { type InitMarqueeBar } from "../sections/content-marquee/content-marquee";
import { type InitContentSlider } from "../sections/content-slider/content-slider";
import { type InitVerticalMenu } from "../sections/modal_vertical-menu/modal_vertical-menu";
import { type InitAnnouncementBar } from "../sections/header_announcement-bar/header_announcement-bar";
import { type InitNavigationBar } from "../sections/header_navigation-bar/header_navigation-bar";
import { type InitSearch } from "../sections/modal_search/modal_search";
import { type InitProduct, MainProductStore } from "../sections/product/product";
import { type InitQuizBundle } from "../sections/quiz-bundle/quiz-bundle";
import { type CartActions, type CartStore } from "./cart";

import { type ProductDrawerStore } from "./init-product-drawer";
import { type MediaGalleryStore } from "./media-gallery";
import { type ModalStore } from "./modals";
import { type RouterStore } from "./page-transitions";
import { type ProductFunctions } from "./product-data";
import { type QuickViewStore } from "./quick-view";
import { type ScrollbarFunctions } from "./scrollbar";
import { type ToastStore } from "./toast";
import { type TooltipStore } from "./tooltip";
import { type BackInStockNotificationStore } from "./back-in-stock-notification";

export type ShopRoutes = {
  account_addresses_url: string;
  account_login_url: string;
  account_logout_url: string;
  account_recover_url: string;
  account_register_url: string;
  account_url: string;
  all_products_collection_url: string;
  cart_add_url: string;
  cart_change_url: string;
  cart_clear_url: string;
  cart_update_url: string;
  cart_url: string;
  collections_url: string;
  predictive_search_url: string;
  product_recommendations_url: string;
  root_url: string;
  search_url: string;
  file_url: string;
  asset_url: string;
};

export type ShopifyType = {
  designMode?: boolean;
  editor?: {
    select_block_id?: string;
    select_section_id?: string;
    deselect_block_id?: string;
    deselect_section_id?: string;
    reorder_section_id?: string;
    load_section_id?: string;
    unload_section_id?: string;
    inspector?: boolean;
  };
  OptionSelectors: (selector: string, options: any) => void;
  cdnHost: string;
  country: string;
  currency: {
    active: string;
    rate: string;
  };
  formatMoney: (price: number, format?: string) => string;
  image: {};
  locale: string;
  modules: boolean;
  money_format: string;
  paymentButton: {};
  routes: {
    root: string;
  };
  shop: string;
  theme: {
    handle: string;
    id: number;
    name: string;
    role: string;
    style: {
      handle?: any;
      id?: any;
    };
    theme_store_id: number;
  };

  analytics: {
    replayQueue: any[];
  };
  featureAssets: {
    "shop-js": {};
  };
  recaptchaV3: {
    siteKey: string;
  };
  PaymentButton: {
    version: string;
    init: () => void;
  };
};

export type CartError = {
  status: number;
  message: string;
  description: string;
};
export type CartJson = {
  token: string;
  note: string;
  attributes: { [T: string]: string };
  original_total_price: number;
  original_pre_selling_plan_total_price: number;
  total_price: number;
  total_discount: number;
  total_weight: number;
  item_count: number;
  items: LineItem[];
  requires_shipping: boolean;
  currency: string;
  items_subtotal_price: number;
  cart_level_discount_applications: {
    allocation_method: string;
    created_at: string;
    description: string;
    key: string;
    target_selection: string;
    target_type: string;
    title: string;
    total_allocated_amount: number;
    type: string;
    value: string;
    value_type: string;
  }[];
  selling_plan_discount_applications: { name: string; value: number }[];
};

export type CartJsonChange = {
  product_id: number;
  variant_id: number;
  id: number;
  image: string;
  price: string;
  presentment_price: number;
  quantity: number;
  title: string;
  vendor: string;
  product_type: string;
  sku: string;
  untranslated_product_title: string;
  untranslated_variant_title: string;
  view_key: string;
};

export type CartJsonChanges = {
  items_added: CartJsonChange[];
  items_removed: CartJsonChange[];
};

export type LineItem = {
  id: number;
  properties?: any;
  quantity: number;
  variant_id: number;
  key: string;
  title: string;
  price: number;
  original_price: number;
  presentment_price: number;
  discounted_price: number;
  line_price: number;
  original_line_price: number;
  total_discount: number;
  discounts: any[];
  sku: string;
  grams: number;
  vendor: string;
  taxable: boolean;
  product_id: number;
  product_has_only_default_variant: boolean;
  gift_card: boolean;
  final_price: number;
  final_line_price: number;
  url: string;
  featured_image: {
    aspect_ratio: number;
    alt: string;
    height: number;
    url: string;
    width: number;
  };
  image: string;
  handle: string;
  requires_shipping: boolean;
  product_type: string;
  product_title: string;
  product_description: string;
  variant_title: string;
  variant_options: string[];
  options_with_values: {
    name: string;
    value: string;
  }[];
  line_level_discount_allocations: {
    amount: number;
    discount_application: {
      allocation_method: string;
      created_at: string;
      description: string;
      key: string;
      target_selection: string;
      target_type: string;
      title: string;
      total_allocated_amount: number;
      type: string;
      value: string;
      value_type: string;
    };
  }[];
  line_level_total_discount: number;
  selling_plan_allocation: LineItem_SellingPlanAllocation;
};

export type LineItem_SellingPlanAllocation = {
  price_adjustments: {
    position: number;
    price: number;
  }[];
  price: number;
  compare_at_price: number;
  per_delivery_price: number;
  selling_plan: LineItem_SellingPlan;
};

export type LineItem_SellingPlan = {
  id: number;
  name: string;
  description?: any;
  options: {
    name: string;
    position: number;
    value: string;
  }[];
  recurring_deliveries: boolean;
  fixed_selling_plan: boolean;
  price_adjustments: {
    order_count?: any;
    position: number;
    value_type: string;
    value: number;
  }[];
};

export type _Product_hydrated = Omit<_Product_liquid, "variants"> & {
  selected_or_first_available_variant_id?: number;
  selected_variant_id?: number;
  updated_at: number;
  recommendations_loaded_at: number;
  related_products: _Product_liquid[];
  complementary_products: _Product_liquid[];
  variants: (_Variant_liquid & {
    metafields: {
      smart?: {
        images?: _Media_liquid[];
        color_swatch?: string | _Media_liquid;
      };
    };
  })[];
};

declare global {
  let Shopify: ShopifyType;
  let _stores: {
    toast: ToastStore;
    modal: ModalStore;
    tooltip: TooltipStore;
    router: RouterStore;
    cart: CartStore;
    backInStockNotification: BackInStockNotificationStore;
    main_product: MainProductStore;
    mediaGallery: MediaGalleryStore;
    productDrawer: ProductDrawerStore;
    quickView: QuickViewStore;
  };
  let _sections: {
    initAnnouncementBar: InitAnnouncementBar;
    initProduct: InitProduct;
    initVerticalMenu: initVerticalMenu;
    initBundle: InitBundle;
    initQuizBundle: InitQuizBundle;
    initProductCard: InitProductCard;
    hydrateProductCard: HydrateProductCard;
    initArticleCard: InitArticleCard;
    hydrateArticleCard: HydrateArticleCard;
    initBlogCard: InitBlogCard;
    hydrateBlogCard: HydrateBlogCard;
    initCollectionCard: InitCollectionCard;
    hydrateCollectionCard: HydrateCollectionCard;
    initPageCard: InitPageCard;
    hydratePageCard: HydratePageCard;
    initMetaobjectCard: InitMetaobjectCard;
    hydrateMetaobjectCard: HydrateMetaobjectCard;
    initNavigationBar: InitNavigationBar;
    initMarqueeBar: InitMarqueeBar;
    initSearch: InitSearch;
    initContentSlider: InitContentSlider;
    initDynamicProductCards: InitDynamicProductCards;
  } & {
    [T: string]: { [T: string]: any };
  };
  let _product_card_product: _Product_hydrated;
  let _products: { [handle: string]: _Product_hydrated };
  let _recent_products: [string, number][];
  let _product: ProductFunctions;
  let _scrollbar: ScrollbarFunctions;
  let _pagination: Pagination;
  let _collections: { [handle: string]: _Collection_liquid };
  let _pages: { [handle: string]: _Page_liquid };
  let _blogs: { [handle: string]: _Blog_liquid };
  let _articles: { [handle: string]: _Article_liquid };
  let _metaobjects: { [handle: string]: any };
  let _cart: CartActions;
  let _cart_data: CartJson;
  let utils: typeof Utils;
  let clsx: (typeof Utils)["clsx"];
  let barba: typeof Core;
  let barbaPrefetch: typeof BarbaPrefetch;
  let idbKeyval: typeof IdbKeyval;
  let Alpine: alpine;
  let dayjs: Dayjs;

  interface Window {
    Alpine: alpine;
    dayjs: Dayjs;
    modalsLoaded: boolean;
    _cart_data: typeof _cart_data;
    _cart: typeof _cart;
    _scrollbar: typeof _scrollbar;
    _pagination: _pagination;
    _product: typeof _product;
    _product_card_product: typeof _product_card_product;
    _products: typeof _products;
    _collections: typeof _collections;
    _pages: typeof _pages;
    _blogs: typeof _blogs;
    _articles: typeof _articles;
    _sections: typeof _sections;
    _stores: typeof _stores;
    _quiz: { [T: string]: any; products: _Product_hydrated[] };
    _bundle_auto_add_items: { product: _Product_hydrated; variant: _Variant_liquid[] }[];
    _learnq: any;
    utils: typeof Utils;
    sectionContent: {
      current: any;
    };
    Shopify: typeof Shopify;
    barba: typeof barba;
    idbKeyval: typeof IdbKeyval;
    clsx: typeof clsx;
    _recent_products: typeof _recent_products;
    google: any;
    collection?: _Collection_liquid;
    routes: ShopRoutes;
    template: string;
    theme_settings: SettingsSchema;
    design_mode: boolean;
    money_format: string;
    okeWidgetApi?: {
      initAllWidgets?: () => void;
    };
    yotpoWidgetsContainer?: {
      initWidgets?: () => void;
    };
    event?: Omit<Event, "barba_redirect"> & { barba_redirect?: boolean };
  }

  interface InputHTMLAttributes {
    autocomplete?: InputAutocomplete;
  }
}

export type InputAutocomplete =
  | "off"
  | "name"
  | "honorific-prefix"
  | "given-name"
  | "additional-name"
  | "family-name"
  | "honorific-suffix"
  | "nickname"
  | "email"
  | "username"
  | "new-password"
  | "current-password"
  | "one-time-code"
  | "organization-title"
  | "organization"
  | "street-address"
  | "address-line1"
  | "address-line2"
  | "address-line3"
  | "address-level4"
  | "address-level3"
  | "address-level2"
  | "address-level1"
  | "country"
  | "country-name"
  | "postal-code"
  | "cc-name"
  | "cc-given-name"
  | "cc-additional-name"
  | "cc-family-name"
  | "cc-number"
  | "cc-exp"
  | "cc-exp-month"
  | "cc-exp-year"
  | "cc-csc"
  | "cc-type"
  | "transaction-currency"
  | "transaction-amount"
  | "language"
  | "bday"
  | "bday-day"
  | "bday-month"
  | "bday-year"
  | "sex"
  | "tel"
  | "tel-country-code"
  | "tel-national"
  | "tel-area-code"
  | "tel-local"
  | "tel-extension"
  | "impp"
  | "url"
  | "photo";
