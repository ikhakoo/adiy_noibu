import { type EditorStore } from "./editor";

export type ModalStore = {
  id: string;
  loaded: boolean;
  setId: (id: string) => void;
};

export const initModals = () => {
  const modalsContainer = document.querySelector("[data-dynamic-modals]");

  window.Alpine.store("modal", {
    id: "",
    loaded: !!modalsContainer?.children.length || window.modalsLoaded,
    setId(value: string) {
      this.id = value;
    },
  });

  const modalStore = window.Alpine.store("modal") as ModalStore;
  window.Alpine.magic("modal", () => modalStore);
  window._stores["modal"] = modalStore;
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      modalStore.setId("");
    }
  };

  window.Alpine.effect(() => {
    const blockScroll = modalStore?.id && !/^megamenu--/gi.test(modalStore?.id);
    document.body.classList.toggle("!overflow-hidden", blockScroll);

    if (modalStore?.id) {
      document.addEventListener("keydown", handleKeydown);
    }
    if (!modalStore?.id) {
      document.removeEventListener("keydown", handleKeydown);
    }
  });

  // initEvents runs on load, from an Alpine.effect, and from a body-wide
  // MutationObserver. Without a guard, handlers stack on the same triggers
  // across a session, so track bound links and skip ones already wired up.
  const boundLinks = new WeakSet<HTMLAnchorElement>();
  const initEvents = (target: Element | Document = document) => {
    target
      .querySelectorAll<HTMLAnchorElement>(
        `[href*="#modal--"], [href*="#popup--"], [href*="#drawer--"], [href*="#megamenu--"]`
      )
      .forEach((link) => {
        if (boundLinks.has(link)) {
          return;
        }
        boundLinks.add(link);
        const handle =
          link.href?.replace(/.*?#(modal|popup|drawer|megamenu)--/gi, "")?.split("?")?.[0] ?? "";
        link.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          modalStore.setId(handle);
        });

        const handleFocusKeydown = (e: KeyboardEvent) => {
          if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown") {
            modalStore.setId(handle);
          }
        };

        link.addEventListener("focus", (e) => {
          link.addEventListener("keydown", handleFocusKeydown);
        });

        link.addEventListener("blur", (e) => {
          link.removeEventListener("keydown", handleFocusKeydown);
        });
      });
  };
  const editor = window.Alpine.store("editor") as EditorStore;

  window.Alpine.effect(() => {
    if (editor?.load_section_id) {
      initEvents();
    }
  });

  const mutationObserver = new MutationObserver((e) => {
    e?.forEach((record) => {
      const nodes = [];

      if (record?.addedNodes?.length && record?.target instanceof Element) {
        initEvents(record.target);
      }
    });
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });

  initEvents();
};

declare module "alpinejs" {
  interface Magics<T> {
    $modal: ModalStore;
  }
}
