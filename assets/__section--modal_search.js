var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const initSearch = /* @__PURE__ */ __name(($el, $refs, query) => {
  window.Alpine.store("search", {
    random_id: "",
    loading: false,
    query: "",
    query_count: 0,
    product_count: 0,
    collection_count: 0,
    article_count: 0,
    page_count: 0,
    products: [],
    collections: [],
    articles: [],
    pages: [],
    queries: [],
    showSearchConditionally(show_conditionally) {
      if (!show_conditionally) {
        return true;
      }
      switch (show_conditionally) {
        case "always":
          return true;
        case "search_empty":
          return this.query_count + this.product_count + this.collection_count + this.article_count + this.page_count <= 0;
        case "items_found":
          return this.query_count + this.product_count + this.collection_count + this.article_count + this.page_count >= 1;
      }
    }
  });
  const search = window.Alpine.store("search");
  window.Alpine.magic("search", () => search);
  window._stores["search"] = search;
  const random_id = utils.shortUUID();
  const url = new URL(window.location.href);
  query = query || url.searchParams.get("q");
  const searchTypes = [...$el.querySelectorAll("[data-search-results]")].reduce((acc, block) => {
    const type = block.getAttribute("data-search-results");
    acc[type.replace("_results", "")] = {
      ...utils.JSONParse(block.getAttribute("data-settings")),
      $block: block
    };
    return acc;
  }, {});
  search.random_id = random_id;
  search.query = query;
  let search_results;
  const debounceSearch = window.Alpine.debounce(async () => {
    if (search.loading) return;
    if (search.query) {
      search.loading = true;
      search_results = await fetch(
        `${Shopify.routes.root}search/suggest?section_id=predictive-search&q=${search.query}&resources[type]=${Object.keys(
          searchTypes
        ).filter((k) => k !== "query").join(",")}&resources[limit_scope]=each`
      ).then((response) => response.text()).then((results) => {
        const div = document.createElement("div");
        div.innerHTML = results;
        return utils.JSONParse(div.querySelector("[data-predictive-search]").innerHTML);
      });
      search.product_count = search_results.product_count ?? 0;
      search.collection_count = search_results.collection_count ?? 0;
      search.article_count = search_results.article_count ?? 0;
      search.page_count = search_results.page_count ?? 0;
      search.products = search_results.products ?? [];
      search.collections = search_results.collections ?? [];
      search.articles = search_results.articles ?? [];
      search.pages = search_results.pages ?? [];
      search.loading = false;
    }
  }, 300);
  const debounceSearchQuery = window.Alpine.debounce(async () => {
    if (search.loading) return;
    if (search.query) {
      const suggestions = await fetch(
        `${Shopify.routes.root}search/suggest.json?q=${search.query}&resources[type]=query&resources[limit_scope]=each`
      ).then((response) => response.json());
      search.queries = suggestions?.resources?.results?.queries ?? [];
      search.query_count = search.queries.length;
    }
  }, 100);
  Alpine.effect(() => {
    const url2 = new URL(window.location.href);
    url2.searchParams.set("q", `${search.query}`);
    if (!search.query) {
      url2.searchParams.delete("q");
    }
    barba.history.add(url2.toString(), "barba", "replace");
    debounceSearch();
    debounceSearchQuery();
  });
  Alpine.effect(() => {
    if (searchTypes["query"] && searchTypes.query.$block) {
      searchTypes.query.$block.replaceChildren(
        ...search.queries.map((query2) => {
          const button = document.createElement("button");
          button.innerHTML = query2.styled_text;
          button.onclick = () => {
            search.query = query2.text;
          };
          button.type = "button";
          button.classList.add(...searchTypes?.query?.link_class?.split(" ") ?? []);
          return button;
        })
      );
    }
  });
  Alpine.effect(() => {
    if (searchTypes["product"] && searchTypes.product.$block) {
      searchTypes.product.$block.replaceChildren(
        ...search.products.map((product) => {
          const saveProduct = search_results?.products?.find((p) => p.handle === product.handle);
          _products[saveProduct.handle] = {
            recommendations_loaded_at: 0,
            complementary_products: [],
            related_products: [],
            ..._products[saveProduct.handle] ?? {},
            ...saveProduct,
            updated_at: Date.now()
          };
          _product.saveProduct(saveProduct.handle);
          const node = document.querySelector(`[data-product-card='${searchTypes.product.product_card_class}']`)?.cloneNode(true);
          if (node) {
            node?.removeAttribute(`data-product-card`);
            node?.setAttribute("data-product-handle", saveProduct.handle);
            node?.setAttribute("data-product-id", `${saveProduct.id}`);
            node.querySelectorAll("[data-loop-item], [data-x-if], style").forEach((el) => {
              el.remove();
            });
          }
          return node;
        })
      );
    }
  });
  Alpine.effect(() => {
    if (searchTypes["collection"] && searchTypes.collection.$block) {
      searchTypes.collection.$block.replaceChildren(
        ...search.collections.map((collection) => {
          _collections[collection.handle] = collection;
          const node = document.querySelector(
            `[data-collection-card='${searchTypes.collection.collection_card_class}']`
          )?.cloneNode(true);
          if (node) {
            node?.removeAttribute(`data-collection-card`);
            node?.setAttribute("data-collection-handle", collection.handle);
            node?.setAttribute("data-collection-id", `${collection.id}`);
            node.querySelectorAll("[data-loop-item], [data-x-if], style").forEach((el) => {
              el.remove();
            });
          }
          return node;
        })
      );
    }
  });
  Alpine.effect(() => {
    if (searchTypes["article"] && searchTypes.article.$block) {
      searchTypes.article.$block.replaceChildren(
        ...search.articles.map((article) => {
          _articles[article.handle] = article;
          const node = document.querySelector(`[data-article-card='${searchTypes.article.article_card_class}']`)?.cloneNode(true);
          if (node) {
            node?.removeAttribute(`data-article-card`);
            node?.setAttribute("data-article-handle", article.handle);
            node?.setAttribute("data-article-id", `${article.id}`);
            node.querySelectorAll("[data-loop-item], [data-x-if], style").forEach((el) => {
              el.remove();
            });
          }
          return node;
        })
      );
    }
  });
  Alpine.effect(() => {
    if (searchTypes["page"] && searchTypes.page.$block) {
      searchTypes.page.$block.replaceChildren(
        ...search.pages.map((page) => {
          _pages[page.handle] = page;
          const node = document.querySelector(`[data-page-card='${searchTypes.page.page_card_class}']`)?.cloneNode(true);
          if (node) {
            node?.removeAttribute(`data-page-card`);
            node?.setAttribute("data-page-handle", page.handle);
            node?.setAttribute("data-page-id", `${page.id}`);
            node.querySelectorAll("[data-loop-item], [data-x-if], style").forEach((el) => {
              el.remove();
            });
          }
          return node;
        })
      );
    }
  });
}, "initSearch");
window._sections["initSearch"] = initSearch;
