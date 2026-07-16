import { RichtextSchema, RichtextSchema_Heading, RichtextSchema_Link, RichtextSchema_List, RichtextSchema_ListItem, RichtextSchema_Paragraph, RichtextSchema_Text } from "../@types/shopify";

export const JSONParse = <T = unknown>(object: any, origin = ""): T => {
  try {
    return JSON.parse(object);
  } catch (err) {
    return null;
  }
};

export const getImageSrcSet = (
  src: string,
  maxWidth?: 48 | 96 | 256 | 384 | 460 | 640 | 1200 | 1920 | 3840 | number
): string => {
  if (!src) {
    return "";
  }
  if (src.includes("?")) {
    return [48, 96, 256, 384, 460, 640, 1200, 1920, 3840]
      .map((number, index, arr) => {
        if (maxWidth && arr[index - 1] > maxWidth) {
          return null;
        }
        return `${src}&width=${number} ${number}w`;
      })
      ?.filter((d) => !!d)
      .join(",");
  }
  return [48, 96, 256, 384, 460, 640, 1200, 1920, 3840]
    .map((number, index, arr) => {
      if (maxWidth && arr[index - 1] > maxWidth) {
        return null;
      }
      return `${src}?width=${number} ${number}w`;
    })
    ?.filter((d) => !!d)
    .join(",");
};

export const getReviewStarGradients = (rating: number, position: 1 | 2 | 3 | 4 | 5): string => {
  return `url(#star-rating-${
    rating < position - 1
      ? 0
      : rating < position && rating > position - 1
      ? Math.floor(((rating - (position - 1)) * 100) / 25) * 25
      : 100
  })`;
};

export const pushSearchParams = ({
  update = {},
  remove = [],
  title,
}: {
  update?: { [T: string]: string | number };
  remove?: string[];
  title?: string;
}) => {
  const url = new URL(window.location.href);
  Object.entries(update).forEach(([key, value]) => {
    url.searchParams.set(key, `${value}`);
  });
  remove.forEach((key) => {
    url.searchParams.delete(key);
  });

  window.history.pushState(null, null, url);
};

export const replaceSearchParams = ({
  update = {},
  remove = [],
  title,
}: {
  update?: { [T: string]: string | number };
  remove?: string[];
  title?: string;
}) => {
  const url = new URL(window.location.href);
  Object.entries(update).forEach(([key, value]) => {
    url.searchParams.set(key, `${value}`);
  });
  remove.forEach((key) => {
    url.searchParams.delete(key);
  });

  window.history.replaceState(null, null, url);
};

export const getSiblingUrl = (handle: string) => {
  const url = new URL(window.location.href);
  url.pathname = /\/collections\/[^/]\/products\//gi.test(url.pathname)
    ? url.pathname.replace(/\/products\/[^?]*/gi, `/products/${handle}`)
    : `/products/${handle}`;
  url.searchParams.delete("variant");
  url.searchParams.delete("selling_plan");
  return url.toString();
};

export const pushUrlTarget = (id: string) => {
  const url = new URL(window.location.href);
  url.hash = id;

  window.history.replaceState(null, null, url);
};

export const checkDomain = function (url: string) {
  if (url && url?.indexOf("//") === 0) {
    url = location.protocol + url;
  }
  return url
    .toLowerCase()
    .replace(/([a-z])?:\/\//, "$1")
    .split("/")[0];
};

export const isExternalURL = function (url: string) {
  if (!url || typeof url !== "string") {
    return false;
  }

  return (
    (url?.indexOf(":") > -1 || url?.indexOf("//") > -1) &&
    checkDomain(location.href) !== checkDomain(url)
  );
};

export const transpileRichtextMetafield = (schema: RichtextSchema) => {
  function convertSchemaToHtml(schema: RichtextSchema | RichtextSchema[]) {
    let html = ``;
    if (!Array.isArray(schema) && schema.type === "root") {
      html += convertSchemaToHtml(schema.children);
    }

    if (Array.isArray(schema)) {
      schema?.forEach((el) => {
        switch (el.type) {
          case "paragraph":
            html += buildParagraph(el);
            break;
          case "heading":
            html += buildHeading(el);
            break;
          case "list":
            html += buildList(el);
            break;
          case "list-item":
            html += buildListItem(el);
            break;
          case "link":
            html += buildLink(el);
            break;
          case "text":
            html += buildText(el);
            break;
          default:
            break;
        }
      });
    }
    return html;
  }

  function buildParagraph(el: RichtextSchema_Paragraph) {
    if (el?.children) {
      return `<p>${convertSchemaToHtml(el?.children)}</p>`;
    }
    return "";
  }

  function buildHeading(el: RichtextSchema_Heading) {
    if (el?.children) {
      return `<h${el?.level}>${convertSchemaToHtml(el?.children)}</h${el?.level}>`;
    }
    return "";
  }

  function buildList(el: RichtextSchema_List) {
    if (el?.children) {
      if (el?.listType === "ordered") {
        return `<ol>${convertSchemaToHtml(el?.children)}</ol>`;
      } else {
        return `<ul>${convertSchemaToHtml(el?.children)}</ul>`;
      }
    }
    return "";
  }

  function buildListItem(el: RichtextSchema_ListItem) {
    if (el?.children) {
      return `<li>${convertSchemaToHtml(el?.children)}</li>`;
    }
    return "";
  }

  function buildLink(el: RichtextSchema_Link) {
    return `<a href="${el?.url}" title="${el?.title}" target="${el?.target}">${convertSchemaToHtml(
      el?.children
    )}</a>`;
  }

  function buildText(el: RichtextSchema_Text) {
    if (el?.bold) {
      return `<strong>${el?.value}</strong>`;
    }
    if (el?.italic) {
      return `<em>${el?.value}</em>`;
    }
    return el?.value;
  }

  return convertSchemaToHtml(schema);
};

export const clsx = (...props: any[]): string => {
  let i = 0;
  let tmp;
  let str = "";
  const len = props.length;
  for (; i < len; i++) {
    if ((tmp = props[i])) {
      if (typeof tmp === "string") {
        str += (str && " ") + tmp;
      }
    }
  }
  return str;
};

export const shortUUID = () => {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  let firstPart: string | number = (Math.random() * 46656) | 0;
  let secondPart: string | number = (Math.random() * 46656) | 0;
  firstPart = `000${firstPart.toString(36)}`.slice(-3);
  secondPart = `000${secondPart.toString(36)}`.slice(-3);
  return firstPart + secondPart;
};

export const isEmail = (str: string | undefined | null) => {
  if (!str) return false;
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(str);
};

export const formatMoney = (cents: number | string, money_format?: string, no_rounding = true) => {
  if (!cents && cents !== 0) {
    return "";
  }
  function n(t, e) {
    return void 0 === t ? e : t;
  }

  function o(t?: any, e?: any, o?: any, i?: any) {
    if (((e = n(e, 2)), (o = n(o, ",")), (i = n(i, ".")), isNaN(t) || null === t)) return 0;
    const r = (t = (t / 100).toFixed(e)).split(".");
    return r[0].replace(/\B(?=(\d{3})+(?!\d))/g, o) + (r[1] ? i + r[1] : "");
  }

  "string" === typeof cents && (cents = cents.replace(".", ""));
  let i: any = "";
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
};

window["formatMoney"] = formatMoney;

export const roundToIndex = function (x: number, index = 0) {
  // Rounds a number to a given index around the decimal point.
  //
  // Args:
  //   x - Number to round.
  //   index - Index of the least significan digit; 0 is the decimal point.
  // Returns:
  //   rounded - Number rounded using the least signficant digit.

  const power = Math.pow(10, -index);
  return Math.round(x * power) / power;
};

type EaseInOutQuadOptions = {
  change: number;
  currentTime: number;
  duration: number;
  start: number;
};

const easeInOutQuad = ({ currentTime, start, change, duration }: EaseInOutQuadOptions) => {
  let newCurrentTime = currentTime;
  newCurrentTime /= duration / 2;

  if (newCurrentTime < 1) {
    return (change / 2) * newCurrentTime * newCurrentTime + start;
  }

  newCurrentTime -= 1;
  return (-change / 2) * (newCurrentTime * (newCurrentTime - 2) - 1) + start;
};

export const scrollToY = (
  duration: number,
  to: number,
  container: HTMLElement | Window = window,
  callback: () => void = () => {}
): void => {
  const start = container instanceof HTMLElement ? container.scrollTop : container.scrollY;

  const change = to - start;
  const startDate = new Date().getTime();

  const animateScroll = () => {
    const currentDate = new Date().getTime();
    const currentTime = currentDate - startDate;

    container.scrollTo(
      0,
      easeInOutQuad({
        currentTime,
        start,
        change,
        duration,
      })
    );

    if (currentTime < duration) {
      requestAnimationFrame(animateScroll);
    } else {
      container.scrollTo(0, to);
      callback();
    }
  };
  animateScroll();
};

export const scrollToX = (
  duration: number,
  to: number,
  container: HTMLElement | Window = window,
  callback: () => void = () => {}
): void => {
  const start = container instanceof HTMLElement ? container.scrollLeft : container.scrollX;

  const change = to - start;
  const startDate = new Date().getTime();

  const animateScroll = () => {
    const currentDate = new Date().getTime();
    const currentTime = currentDate - startDate;

    container.scrollTo(
      easeInOutQuad({
        currentTime,
        start,
        change,
        duration,
      }),
      0
    );

    if (currentTime < duration) {
      requestAnimationFrame(animateScroll);
    } else {
      container.scrollTo(to, 0);
      callback();
    }
  };
  animateScroll();
};

export const scrollToXY = (
  duration: number,
  x: number,
  y: number,
  container: HTMLElement | Window = window,
  callback: () => void = () => {}
): void => {
  const startX = container instanceof HTMLElement ? container.scrollLeft : container.scrollX;
  const startY = container instanceof HTMLElement ? container.scrollTop : container.scrollY;

  const changeX = x - startX;
  const changeY = y - startY;
  const startDate = Date.now();

  const animateScroll = () => {
    const currentDate = Date.now();
    const currentTime = currentDate - startDate;

    container.scrollTo(
      easeInOutQuad({
        currentTime,
        start: startX,
        change: changeX,
        duration,
      }),
      easeInOutQuad({
        currentTime,
        start: startY,
        change: changeY,
        duration,
      })
    );

    if (currentTime < duration) {
      requestAnimationFrame(animateScroll);
    } else {
      container.scrollTo(x, y);
      callback();
    }
  };
  animateScroll();
};

export const isElementScrollable = (element: Element) => {
  if (!element) return false;
  const isScrollableX = element.scrollWidth > element.clientWidth;
  const isScrollableY = element.scrollHeight > element.clientHeight;

  return isScrollableX || isScrollableY;
};

export function getElementPosition(element: HTMLElement) {
  const box = element.getBoundingClientRect();

  const body = document.body;
  const docEl = document.documentElement;

  const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
  const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

  const clientTop = docEl.clientTop || body.clientTop || 0;
  const clientLeft = docEl.clientLeft || body.clientLeft || 0;

  const top = box.top + scrollTop - clientTop;
  const left = box.left + scrollLeft - clientLeft;

  return { top: Math.round(top), left: Math.round(left) };
}

export const getElementOffset = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const debounce = (callback, wait = 1) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

export const findAllScrollableParents = (element: HTMLElement): (HTMLElement | Window)[] => {
  const scrollableParents = [];
  let parent = element.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.getPropertyValue("overflow-y");

    if (overflowY === "auto" || overflowY === "scroll") {
      scrollableParents.push(parent);
    }

    parent = parent.parentElement;
  }

  // Check if the document element is a scrollable container (window)
  if (document.scrollingElement) {
    scrollableParents.push(document.scrollingElement);
  }
  scrollableParents.push(window);

  return scrollableParents;
};

export const handlelize = (str) => {
  str = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/([^\w]+|\s+)/g, "-") // Replace space and other characters by hyphen
    .replace(/--+/g, "-") // Replaces multiple hyphens by one hyphen
    .replace(/(^-+|-+$)/g, "") // Remove extra hyphens from beginning or end of the string
    .toLowerCase(); // To lowercase

  return str;
};

export const serializeForm = (formElement: HTMLFormElement) => {
  const obj = {};
  const formData = new FormData(formElement);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return obj as { [T: string]: string[] };
};

export const deepEqual = (a, b) => {
  if (a === b) return true;

  if (a && b && typeof a === "object" && typeof b === "object") {
    if (a.constructor !== b.constructor) return false;

    let length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      // eslint-disable-next-line eqeqeq
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }

    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    // eslint-disable-next-line prefer-const
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0; ) {
      const key = keys[i];

      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
};

window.clsx = clsx;

export const isVisible = (elem: HTMLElement, isParent = false) => {
  if (!(elem instanceof Element)) {
    return false;
  }
  const style = getComputedStyle(elem);
  if (style.display === "none") return false;
  if (!isParent && style.pointerEvents === "none") return false;
  if (style.visibility !== "visible") return false;
  if (+style.opacity < 0.1) return false;
  if (
    elem.offsetWidth +
      elem.offsetHeight +
      elem.getBoundingClientRect().height +
      elem.getBoundingClientRect().width ===
    0
  ) {
    return false;
  }
  if (elem.parentElement) {
    return isVisible(elem.parentElement, true);
  }
  return true;
};

export const isInViewport = (element) => {
  const { y } = element.getBoundingClientRect();
  if (y > window.innerHeight || y < 0) {
    return false;
  }
  return true;
};
export const renderBracketInputDynamicText = (content: string, object = {}) => {
  let returnValue = "";

  returnValue =
    content?.replace(/\[([^\]]*)\]/gi, (...matches) => {
      if (!matches[1]) {
        return "";
      }
      if (/^icon\./gi.test(matches[1])) {
        return matches[0];
      }
      let result =
        // @ts-ignore
        matches?.[1]?.split(".")?.reduce<any>(
          (acc, selector, index, arr) => {
            if (!selector || acc[0] === undefined || acc[0] === null) {
              if (/price$/gi.test(acc[1]) && typeof acc[0] === "number") {
                return [utils.formatMoney(acc[0]), selector];
              }
              if (/_at$/gi.test(acc[1]) && Date.parse(acc[0])) {
                return [new Date(acc[0]).toLocaleDateString(), selector];
              }
              if (typeof acc[0] === "string" && acc[0].includes("®")) {
                return [
                  acc[0].replace(/®/gi, `<sup style="font-size: 0.7em;">®</sup>`),
                  selector,
                ];
              }

              if (
                Array.isArray(acc[0]) &&
                acc[0].every((val) => typeof val === "string" || typeof val === "number")
              ) {
                return [acc[0].join(", "), selector];
              }
              return acc;
            }

            if (acc[0] && typeof acc[0] === "object" && selector in acc[0]) {
              if (/price$/gi.test(selector) && typeof acc[0][selector] === "number") {
                return [utils.formatMoney(acc[0][selector]), selector];
              }
              if (/_at$/gi.test(selector) && Date.parse(acc[0][selector])) {
                if (arr[index + 1]) {
                  return [window.dayjs(acc[0][selector])?.format(arr[index + 1]), selector];
                }
                return [new Date(acc[0][selector]).toLocaleDateString(), selector];
              }
              if (typeof acc[0][selector] === "string" && acc[0][selector].includes("®")) {
                return [
                  acc[0][selector].replace(/®/gi, `<sup style="font-size: 0.7em;">®</sup>`),
                  selector,
                ];
              }
              if (index === arr.length - 1) {
                if (
                  Array.isArray(acc[0][selector]) &&
                  acc[0][selector].every(
                    (val) => typeof val === "string" || typeof val === "number"
                  )
                ) {
                  return [acc[0][selector].join(", "), selector];
                }
              }

              return [acc[0][selector], selector];
            }
            if (selector && typeof acc[0] === "string") {
              return acc;
            }
            return ["", ""];
          },
          [object, ""]
        )?.[0] ?? "";

      if (typeof result === "string" && result?.includes("Default Title")) {
        result = result?.replace("Default Title", "");
      }
      return result;
    }) ?? "";

  return returnValue;
};

export const getBracketInputDynamicValue = (content: string, object = {}) => {
  let returnValue = null;
  if (!content || typeof content !== "string") {
    return null;
  }
  content?.replace(/\[([^\]]*)\]/gi, (...matches) => {
    if (!matches[1]) {
      return returnValue;
    }
    // @ts-ignore
    returnValue = matches?.[1]?.split(".")?.reduce<any>(
      (acc, selector) => {
        if (!selector || acc[0] === undefined || acc[0] === null) {
          if (/price$/gi.test(acc[1]) && typeof acc[0] === "number") {
            return [utils.formatMoney(acc[0]), selector];
          }
          if (/_at$/gi.test(acc[1]) && Date.parse(acc[0])) {
            return [new Date(acc[0]).toLocaleDateString(), selector];
          }
          if (typeof acc[0] === "string" && acc[0].includes("®")) {
            return [acc[0].replace(/®/gi, `<sup style="font-size: 0.7em;">®</sup>`), selector];
          }
          return acc;
        }

        if (acc[0] && selector in acc[0]) {
          if (/price$/gi.test(selector) && typeof acc[0][selector] === "number") {
            return [utils.formatMoney(acc[0][selector]), selector];
          }
          if (/_at$/gi.test(selector) && Date.parse(acc[0][selector])) {
            return [new Date(acc[0][selector]).toLocaleDateString(), selector];
          }
          if (typeof acc[0][selector] === "string" && acc[0][selector].includes("®")) {
            return [
              acc[0][selector].replace(/®/gi, `<sup style="font-size: 0.7em;">®</sup>`),
              selector,
            ];
          }
          return [acc[0][selector], selector];
        }
        return ["", ""];
      },
      [object, ""]
    )?.[0];
    return "";
  });
  return returnValue ?? "";
};

export function unescape(htmlStr) {
  htmlStr = htmlStr.replace(/&lt;/g, "<");
  htmlStr = htmlStr.replace(/&gt;/g, ">");
  htmlStr = htmlStr.replace(/&quot;/g, '"');
  htmlStr = htmlStr.replace(/&#39;/g, "'");
  htmlStr = htmlStr.replace(/&amp;/g, "&");
  return htmlStr;
}

export function setUniformHeightById(id: string): void {
  // Get all elements with the specified ID
  const elements: NodeListOf<HTMLElement> = document.querySelectorAll(`[data-style-id="${id}"]`);

  // If there are no elements with the given ID, do nothing
  if (elements.length === 0) {
    return;
  }

  // Calculate the maximum height
  let maxHeight = 0;
  elements.forEach((element) => {
    // Reset height to auto to correctly measure the height if it was previously set
    element.style.height = "auto";
    const elementHeight = element.offsetHeight;
    if (elementHeight > maxHeight) {
      maxHeight = elementHeight;
    }
  });

  // Set all elements to the maximum height
  elements.forEach((element) => {
    element.style.height = `${maxHeight}px`;
  });
}

const utils = {
  clsx,
  getImageSrcSet,
  JSONParse,
  getSiblingUrl,
  unescape,
  isVisible,
  isInViewport,
  getReviewStarGradients,
  transpileRichtextMetafield,
  handlelize,
  delay,
  debounce,
  scrollToY,
  scrollToX,
  scrollToXY,
  isElementScrollable,
  checkDomain,
  isExternalURL,
  getElementPosition,
  renderBracketInputDynamicText,
  getBracketInputDynamicValue,
  deepEqual,
  getElementOffset,
  shortUUID,
  serializeForm,
  roundToIndex,
  formatMoney,
  findAllScrollableParents,
  isEmail,
  pushSearchParams,
  replaceSearchParams,
  pushUrlTarget,
  setUniformHeightById,
};

export default utils;
