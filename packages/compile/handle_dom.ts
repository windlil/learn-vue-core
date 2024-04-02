export function insertElement(
  element: Node,
  parent: Node,
  anchor?: Node | null
) {
  if (!anchor) anchor = null
  parent.insertBefore(element, anchor);
}

export function createElement(tag: string) {
  return document.createElement(tag);
}

export function setElementText(element: HTMLElement, text: string) {
  element.textContent = text;
}

export function setText(element: Node, text) {
  element.nodeValue = text
}

export function createTextNode(text) {
  return document.createTextNode(text)
}