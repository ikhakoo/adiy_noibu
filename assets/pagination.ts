export const initPagination = () => {};

export type PaginationFunctions = typeof _pagination;

export const _pagination = {
  init: (paginationContainer: HTMLElement, gridContainer: HTMLElement) => {
    const goToPage = async (url: URL) => {
      const dataAttribute = gridContainer
        .getAttributeNames()
        .filter((attribute) => attribute.includes("data-style"))[0];

      try {
        // Scroll to the top of container
        window.scrollTo({
          top:
            document.querySelector(`[${dataAttribute}]`)?.getBoundingClientRect().y +
            window.scrollY -
            260,
          behavior: "smooth",
        });

        const cards = gridContainer.querySelectorAll(
          "[class^=product-card--] img, [class^=collection-card--] img, [class^=article-card--] img, [class^=blog-card--] img, [class^=page-card--] img"
        );

        cards.forEach((card) => {
          card.classList.add("card-loading");
        });

        // Fetch the new page content
        const response = await fetch(url);
        const html = await response.text();

        // Parse the response and grab product grid and pagination
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const newContent = doc.querySelector(`[${dataAttribute}]`);
        const newPagination = doc.querySelector("[data-pagination]");

        // Update the current grid and pagination
        if (newContent && newPagination) {
          gridContainer.innerHTML = newContent.innerHTML;
          paginationContainer.innerHTML = newPagination.innerHTML;
        }

        // Update URL "?page=2"
        updateURL(url);
        cards.forEach((card) => {
          card.classList.remove("card-loading");
        });
      } catch (error) {
        console.error("Error loading new page:", error);
      }
    };

    const updateURL = (url: URL) => {
      const newUrl = new URL(url, window.location.origin);
      history.pushState(null, "", newUrl);
    };

    return {
      goToPage,
    };
  },
};

window._pagination = _pagination;

export type Pagination = typeof _pagination;
