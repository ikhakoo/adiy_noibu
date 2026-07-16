import "assets/utils";

export type EditorStore = {
  load_section_id: string;
  unload_section_id: string;
  select_section_id: string;
  reorder_section_id: string;
  deselect_block_id: string;
  deselect_section_id: string;
  select_block_id: string;
  inspector: boolean;
};

declare module "alpinejs" {
  interface Magics<T> {
    $editor: EditorStore;
  }
}

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
    "shopify:block:deselect",
  ] as const;

  shopifyEvents.forEach((eventType) => {
    document.addEventListener(
      eventType,
      (event: CustomEvent<{ sectionId?: string; blockId?: string; load?: boolean }>) => {
        if (event?.detail) {
          // console.log(event.type, event.detail.blockId, event.detail);
        }

        const action = event.type.replace(/shopify:(section|block):/gi, "");
        const editor = window.Alpine.store("editor") as EditorStore;
        const resetEditor = {
          load_section_id: "",
          unload_section_id: "",
          reorder_section_id: "",
          deselect_block_id: "",
          deselect_section_id: "",
        };

        const resetEditorFn = () => {
          editor.load_section_id = "";
          editor.unload_section_id = "";
          editor.reorder_section_id = "";
          editor.deselect_block_id = "";
          editor.deselect_section_id = "";
        };
        switch (event.type as unknown as (typeof shopifyEvents)[number]) {
          case "shopify:section:load": {
            if (event.target instanceof HTMLElement) {
              const sectionElement = event.target.closest<HTMLElement>(
                "[data-shopify-editor-section]"
              );

              window.Shopify.editor = {
                ...(window.Shopify.editor ?? {}),
                ...resetEditor,
                load_section_id: event.detail.sectionId,
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
              const sectionElement = event.target.closest<HTMLElement>(
                "[data-shopify-editor-section]"
              );

              window.Shopify.editor = {
                ...(window.Shopify.editor ?? {}),
                ...resetEditor,
                unload_section_id: event.detail.sectionId,
              };
              resetEditorFn();
              editor.unload_section_id = event.detail.sectionId;
              // window.Alpine.destroyTree(sectionElement);
              document.dispatchEvent(
                new CustomEvent(`editor-${action}--${event.detail.sectionId}`)
              );
              document.dispatchEvent(new CustomEvent(`editor_unload`));
            }
            break;
          }
          case "shopify:section:select":
            window.Shopify.editor = {
              ...(window.Shopify.editor ?? {}),
              ...resetEditor,
              select_section_id: event.detail.sectionId,
            };
            resetEditorFn();
            editor.select_block_id = "";
            editor.load_section_id = event.detail.load ? event.detail.sectionId : "";
            editor.select_section_id = event.detail.sectionId;
            document.dispatchEvent(new CustomEvent(`editor-${action}--${event.detail.sectionId}`));
            break;
          case "shopify:section:deselect":
            window.Shopify.editor = {
              ...(window.Shopify.editor ?? {}),
              ...resetEditor,
              select_section_id: "",
              select_block_id: "",
              deselect_section_id: event.detail.sectionId,
            };
            resetEditorFn();
            editor.select_section_id = "";
            editor.select_block_id = "";
            editor.deselect_section_id = event.detail.sectionId;
            document.dispatchEvent(new CustomEvent(`editor-${action}--${event.detail.sectionId}`));
            break;
          case "shopify:section:reorder":
            window.Shopify.editor = {
              ...(window.Shopify.editor ?? {}),
              ...resetEditor,
              reorder_section_id: event.detail.sectionId,
            };
            resetEditorFn();
            editor.reorder_section_id = event.detail.sectionId;
            document.dispatchEvent(new CustomEvent(`editor-${action}--${event.detail.sectionId}`));
            break;
          case "shopify:block:select":
            window.Shopify.editor = {
              ...(window.Shopify.editor ?? {}),
              ...resetEditor,
              select_block_id: event.detail.blockId,
            };
            resetEditorFn();
            editor.load_section_id = event.detail.load ? event.detail.sectionId : "";
            editor.select_block_id = event.detail.blockId;
            document.dispatchEvent(new CustomEvent(`editor-${action}--${event.detail.blockId}`));
            break;
          case "shopify:block:deselect":
            window.Shopify.editor = {
              ...(window.Shopify.editor ?? {}),
              ...resetEditor,
              select_block_id: "",
              deselect_block_id: event.detail.blockId,
            };
            resetEditorFn();
            editor.select_block_id = "";
            editor.deselect_block_id = event.detail.blockId;
            document.dispatchEvent(new CustomEvent(`editor-${action}--${event.detail.blockId}`));
            break;
          case "shopify:inspector:activate":
            window.Shopify.editor = {
              ...(window.Shopify.editor ?? {}),
              ...resetEditor,
              inspector: true,
            };
            resetEditorFn();
            editor.inspector = true;
            break;
          case "shopify:inspector:deactivate":
            window.Shopify.editor = {
              ...(window.Shopify.editor ?? {}),
              ...resetEditor,
              inspector: false,
            };
            editor.inspector = false;
            break;
        }
      }
    );
  });
});
