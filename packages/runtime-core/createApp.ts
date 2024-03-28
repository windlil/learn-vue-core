// 明确调用顺序：createApp(App).mount('#app')
import { render } from "./renderer";
import { createVNode } from "./VNode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      const vnode = createVNode(rootComponent);

      render(vnode, rootContainer);
    },
  };
}

