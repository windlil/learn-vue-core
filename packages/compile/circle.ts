export function unMount(vnode) {
  const el: HTMLElement = vnode.el;
  const parent = el.parentNode;
  parent?.removeChild(el);
}