import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // patch 创建真实节点并插入
  patch(vnode, container);
  const button = document.querySelector("#button");

}

export function patch(vnode, container) {
  // 处理组件
  processComponent(vnode, container);
}

export function processComponent(vnode, container) {
  // 挂载组件
  mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
  // 创建组件实例
  const instance = createComponentInstance(vnode);

  // 处理setup函数
  setupComponent(instance);
}
