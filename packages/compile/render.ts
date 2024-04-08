import { patch } from "./patch";
import { unMount } from "./circle";

export function createRender() {
  function render(vnode, container) {
    if (vnode) {
      console.log(container._vnode)
      patch(container._vnode, vnode, container);
    } else if (!vnode && container._vnode) {
      // 执行卸载操作
      unMount(container._vnode);
    }
    container._vnode = vnode;
  }

  return {
    render,
  };
}
