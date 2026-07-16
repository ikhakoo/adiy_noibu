import { _Media_liquid } from "../@types/shopify";

export type MediaGalleryStore = {
  open: boolean;
  media: _Media_liquid[];
  index: number;
  openGallery: (input: { media: _Media_liquid[]; index: number }) => void;
};

export const initMediaGallery = () => {
  window.Alpine.store("mediaGallery", {
    open: false,
    media: _products[Object.keys(_products)[0]]?.media ?? [],
    index: 0,
    scrollIndex: 0,
    openGallery({ media = [], index = 0 }) {
      this.media = media;
      this.open = true;
      this.index = index;
      this.scrollIndex = index;
    },
  });

  const mediaGalleryStore = window.Alpine.store("mediaGallery") as MediaGalleryStore;
  Alpine.effect(() => {
    if (!mediaGalleryStore.open && mediaGalleryStore.media.length) {
      mediaGalleryStore.media = [];
    }
  });
  window.Alpine.magic("mediaGallery", () => mediaGalleryStore);
  window._stores["mediaGallery"] = mediaGalleryStore;
};

declare module "alpinejs" {
  interface Magics<T> {
    $mediaGallery: MediaGalleryStore;
  }
}
