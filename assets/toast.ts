export type ToastStore = {
  toasts: {
    type: "plain" | "info" | "success" | "warning" | "error";
    target: "generic" | "cart";
    timestamp: number;
    title: string;
    content?: string;
    icon?: string;
    hide: number;
  }[];
  paused: boolean;
  interval: NodeJS.Timeout;
  addToast: (
    toast: Partial<ToastStore["toasts"][number]> & Pick<ToastStore["toasts"][number], "title">
  ) => void;
  pauseRemoval: () => void;
  continueRemoval: () => void;
  removeAllToasts: () => void;
  removeToast: (timestamp: number) => void;
};
export const initToast = () => {
  window.Alpine.store("toast", {
    toasts: [],
    paused: false,
    interval: null,
    addToast: function ({
      type = "plain",
      target = "generic",
      timestamp = Date.now(),
      title,
      content,
      icon,
      hide = 0,
    }) {
      const defaultIcon = {
        plain: "bolt",
        warning: "warning-triangle",
        error: "error-circle",
        info: "info-circle",
        success: "check-circle",
      }[type];

      this.toasts.push({
        type,
        target,
        timestamp,
        title,
        content,
        icon: icon || defaultIcon,
        hide,
      });
    },
    removeAllToasts: function () {
      this.toasts = [];
    },
    pauseRemoval: function () {
      this.paused = true;
      clearInterval(this.interval);
      this.interval = null;
    },
    continueRemoval: function () {
      this.paused = false;
    },
  });

  const toastStore = window.Alpine.store("toast") as ToastStore;
  window.Alpine.magic("toast", () => toastStore);

  window.Alpine.effect(() => {
    if (toastStore.toasts.length && !toastStore.interval && !toastStore.paused) {
      toastStore.interval = setInterval(() => {
        const checkTimestamp = Date.now() - 3000;
        toastStore.toasts = toastStore.toasts.map((toast) => ({
          ...toast,
          hide: toast.timestamp < checkTimestamp ? Date.now() : 0,
        }));

        if (toastStore.toasts.every((toast) => toast.hide && toast.hide > 500)) {
          toastStore.toasts = [];
        }
      }, 500);
    }
    if (toastStore.interval && !toastStore.toasts.length) {
      clearInterval(toastStore.interval);
      toastStore.interval = null;
    }
  });
  window._stores["toast"] = toastStore;
};

declare module "alpinejs" {
  interface Magics<T> {
    $toast: ToastStore;
  }
}
