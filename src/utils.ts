export const debug = false

export const log = (msg: string, obj?: Record<string, unknown>) => {
  if (debug) {
    console.log("teleport: " + msg, obj || "");
  }
}

export const error = (msg: string, object: Record<string, unknown>) => {
  console.error("teleport-error: " + msg, object);
}

export const getElByClass = (className: string) => {
  const el = document.querySelector(`*[class*="${className}"]`);
  if (!el) {
    log(`did not find element with "${className}" class`);
  }
  return el;
}

export const getElByDataAttribute = (attribute: string, value: string, scope: HTMLElement | Document = document): HTMLElement | null => {
  const el = scope.querySelector<HTMLElement>(`[data-${attribute}="${value}"]`);
  if (!el) {
    log(`did not find element with "data-${attribute}=${value}"`);
  }
  return el;
}

export const getAllElByClass = (className: string): NodeListOf<HTMLElement> | null => {
  const elements = document.querySelectorAll<HTMLElement>(`*[class*="${className}"]`);
  if (!elements) {
    log(`did not find any elements with "${className}" class`);
  }
  return elements;
}

export const getAllElementsByDataAttribute = (attribute: string, value: string, scope = document): NodeListOf<HTMLElement> => {
  const elements = scope.querySelectorAll<HTMLElement>(`[data-${attribute}="${value}"]`);
  if (!elements) {
    log(
      `did not find any elements with "data-${attribute}=${value}"`
    );
  }
  return elements;
}

export const appendStylesToDOM = (styles: string, identifier: string) => {
  const styleTag = document.createElement('style')
  styleTag.setAttribute(`data-${identifier}`, identifier);
  styleTag.innerHTML = styles.trim();
  document.head.append(styleTag)
}
