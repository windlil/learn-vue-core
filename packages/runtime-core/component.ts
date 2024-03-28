export function createComponentInstance(vnode) {
  return {
    vnode,
  };
}

export function setupComponent(instance) {
  // 处理有状态的组件
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {}
