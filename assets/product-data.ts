import { _Product_liquid } from "../@types/shopify";
import { _Product_hydrated } from "./types";
import { JSONParse } from "./utils";

export type ProductFunctions = typeof _product;

export const _product = {
  hydrateProduct: async (
    product: _Product_liquid | _Product_hydrated
  ): Promise<_Product_hydrated> => {
    if (!product?.handle && !product?.id) return null;

    if ((_products[product.handle]?.recommendations_loaded_at ?? 0) > Date.now() - 1000 * 60 * 30) {
      return _products[product.handle];
    }

    const dbKey = `_${window.Shopify.theme.id}--${product.handle}`;
    const data = await idbKeyval.get<_Product_hydrated>(dbKey);

    _products[product.handle] = {
      recommendations_loaded_at: 0,
      related_products: [],
      complementary_products: [],
      ...(data || {}),
      ...product,
      updated_at: Date.now(),
    };

    if (!data || (data.recommendations_loaded_at ?? 0) < Date.now() - 1000 * 60 * 30) {
      const [related_products, complementary_products] = await Promise.all([
        fetch(
          `/recommendations/products?product_id=${product.id}&limit=10&section_id=product-data&intent=related`
        )
          .then((res) => res.text())
          .then((text) => {
            const html = document.createElement("div");
            html.innerHTML = text;
            return utils.JSONParse<_Product_liquid[]>(
              html.querySelector("[data-product-recommendations]")?.innerHTML ?? "[]"
            );
          }),
        fetch(
          `/recommendations/products?product_id=${product.id}&limit=10&section_id=product-data&intent=complementary`
        )
          .then((res) => res.text())
          .then((text) => {
            const html = document.createElement("div");
            html.innerHTML = text;
            return utils.JSONParse<_Product_liquid[]>(
              html.querySelector("[data-product-recommendations]")?.innerHTML ?? "[]"
            );
          }),
      ]);

      _products[product.handle] = {
        ..._products[product.handle],
        related_products,
        complementary_products,
        recommendations_loaded_at: Date.now(),
        updated_at: Date.now(),
      };

      requestIdleCallback(
        async () => {
          await idbKeyval.set(dbKey, _products[product.handle]);
          [...(related_products ?? []), ...(complementary_products ?? [])]
            .filter((a, i, arr) => arr.findIndex((b) => a.handle === b.handle) === i)
            .map(async (product) => {
              const dbKey = `_${window.Shopify.theme.id}--${product.handle}`;
              _products[product.handle] = {
                recommendations_loaded_at: 0,
                related_products: [],
                complementary_products: [],
                ...((await idbKeyval?.get(dbKey)) || {}),
                ...product,
                updated_at: Date.now(),
              };
              idbKeyval?.set(dbKey, _products[product.handle]);
            });
        },
        { timeout: 5000 }
      );
    }

    return _products[product.handle];
  },
  getHtmlProduct: (handle) => {
    const product = JSONParse<_Product_hydrated>(
      document.querySelector(`[data-product-data="${handle}"]`)?.innerHTML
    );

    if (product) {
      _products[handle] = {
        recommendations_loaded_at: 0,
        complementary_products: [],
        related_products: [],
        ...(_products[handle] ?? {}),
        ...product,
        updated_at: Date.now(),
      };
      _product.saveProduct(handle);
      return _products[handle];
    }
    return null;
  },
  getCachedProduct: async (handle) => {
    const dbKey = `_${window.Shopify.theme.id}--${handle}`;
    const product = await idbKeyval.get<_Product_hydrated>(dbKey);

    if (product && (product.updated_at ?? 0) > Date.now() - 1000 * 60 * 30) {
      _products[handle] = {
        ...(_products[handle] ?? {}),
        ...product,
      };
      return _products[handle];
    }

    return null;
  },
  getFetchProduct: async (handle: string, productId: number) => {
    if (!productId) return null;
    try {
      const product = await fetch(
        `/recommendations/products?product_id=${productId}&limit=10&section_id=product-data&intent=related&with_product_data=true`
      )
        .then((res) => res.text())
        .then((text) => {
          const html = document.createElement("div");
          html.innerHTML = text;

          const product = utils.JSONParse<_Product_hydrated>(
            html.querySelector("[data-product-data]")?.innerHTML ?? "{}"
          );
          product.related_products = utils.JSONParse<_Product_liquid[]>(
            html.querySelector("[data-product-recommendations]")?.innerHTML ?? "[]"
          );

          requestIdleCallback(
            async () => {
              [...(product.related_products ?? [])]
                .filter((a, i, arr) => arr.findIndex((b) => a.handle === b.handle) === i)
                .map(async (product) => {
                  const dbKey = `_${window.Shopify.theme.id}--${product.handle}`;
                  _products[product.handle] = {
                    recommendations_loaded_at: 0,
                    related_products: [],
                    complementary_products: [],
                    ...((await idbKeyval?.get(dbKey)) || {}),
                    ...product,
                    updated_at: Date.now(),
                  };
                  idbKeyval?.set(dbKey, _products[product.handle]);
                });
            },
            { timeout: 5000 }
          );

          product.recommendations_loaded_at = Date.now();
          return product;
        });

      if (product) {
        _products[handle] = {
          recommendations_loaded_at: 0,
          complementary_products: [],
          related_products: [],
          ...(_products[handle] ?? {}),
          ...product,
          updated_at: Date.now(),
        };
        return _products[handle];
      }
      return null;
    } catch (err) {
      // console.log(err);
      return null;
    }
  },
  saveProduct: (handle) => {
    if (_products[handle]) {
      const dbKey = `_${window.Shopify.theme.id}--${handle}`;
      requestIdleCallback(
        async () => {
          await idbKeyval.set(dbKey, _products[handle]);
        },
        { timeout: 5000 }
      );
      return _products[handle];
    }
    return null;
  },
  getHydratedProductData: async (handle: string, productId: number) => {
    if (
      !_products[handle] ||
      (_products[handle]?.recommendations_loaded_at ?? 0) < Date.now() - 1000 * 60 * 30
    ) {
      _product.getHtmlProduct(handle);
    }
    if (
      !_products[handle] ||
      (_products[handle]?.recommendations_loaded_at ?? 0) < Date.now() - 1000 * 60 * 30
    ) {
      await _product.getCachedProduct(handle);
    }
    if (
      !_products[handle] ||
      (_products[handle]?.recommendations_loaded_at ?? 0) < Date.now() - 1000 * 60 * 30
    ) {
      if (productId) {
        await _product.getFetchProduct(handle, productId);
      }
      if (!productId) {
        await _product.getFetchProduct(handle, productId);
      }
    }
    if (
      !_products[handle] ||
      (_products[handle]?.recommendations_loaded_at ?? 0) < Date.now() - 1000 * 60 * 30
    ) {
      return null;
    }
    _product.saveProduct(handle);
    return _products[handle];
  },
  getProductData: async (handle: string, productId: number) => {
    if (!_products[handle]) {
      _product.getHtmlProduct(handle);
    }
    if (!_products[handle]) {
      await _product.getCachedProduct(handle);
    }
    if (!_products[handle]) {
      await _product.getFetchProduct(handle, productId);
    }
    if (!_products[handle]) {
      return null;
    }
    _product.saveProduct(handle);
    return _products[handle];
  },
  lastOptions: {},
};

window._product = _product;

export const initProductData = () => {};
