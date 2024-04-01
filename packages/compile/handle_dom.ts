export function insertElement(
  element: HTMLElement,
  parent: HTMLElement,
  anchor = null
) {
  parent.insertBefore(element, anchor);
}

export function createElement(tag: string) {
  return document.createElement(tag);
}

export function setElementText(element: HTMLElement, text: string) {
  element.textContent = text;
}