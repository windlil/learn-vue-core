import { Text, Fragment } from "./static";

export function unMount(vnode) {
  if (vnode.type === Fragment) {
    vnode.children.forEach((child) => unMount(child));
    return;
  }
  const el: HTMLElement = vnode.el;
  const parent = el.parentNode;
  parent?.removeChild(el);
}
