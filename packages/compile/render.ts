export function createRender(
  options = {
    createElement(tag: string) {
      return document.createElement(tag);
    },
    insertElement(element: HTMLElement, parent: HTMLElement, anchor = null) {
      parent.insertBefore(element, anchor);
    },
    setElementText(element: HTMLElement, text: string) {
      element.textContent = text;
    },
    patchProps(
      element: HTMLElement | any,
      key: string,
      prevValue: any,
      nextValue: any
    ) {
      if (/^on/.test(key)) {
        const eventName = key.slice(2).toLocaleLowerCase();
        let invoker = element._vei;
        if (!invoker) {
          invoker = element._vei = (e) => {
            invoker.value(e);
          };
          invoker.value = nextValue;
        } else {
          invoker.value = nextValue;
        }
        prevValue && document.removeEventListener(eventName, prevValue);
        element.addEventListener(eventName, nextValue);
      }
      if (key in element) {
        const type = typeof element[key];
        if (type === "boolean" && nextValue === "") {
          element[key] = true;
        } else {
          element[key] = nextValue;
        }
      } else {
        if (key === "class") {
          element.classList.add(nextValue);
        } else {
          element.setAttribute(key, nextValue);
        }
      }
    },
    unMount(vnode) {
      const el: HTMLElement = vnode.el;
      const parent = el.parentNode;
      parent?.removeChild(el);
    },
  }
) {
  const { createElement, insertElement, setElementText, patchProps, unMount } =
    options;

  /**
   *
   * @param vnode 待挂载
   * @param container 被挂载
   */
  function mountElement(vnode, container: HTMLElement) {
    const { type, children, props } = vnode;
    const element = (vnode.el = createElement(type));

    // 如果children是字符串
    if (typeof children === "string") {
      setElementText(element, children);
    } else if (Array.isArray(children)) {
      // children是数组类型，依次创建元素，并插入到父级元素中
      children.forEach((child) => {
        patch(null, child, element);
      });
    }

    if (typeof props === "object" && props !== null) {
      for (const k in props) {
        patchProps(element, k, null, props[k]);
      }
    }
    insertElement(element, container);
  }

  /**
   *
   * @param n1 旧vnode
   * @param n2 新vnode
   * @param container
   */
  function patch(n1, n2, container) {
    // 新旧节点的类型不一致 直接卸载
    if (n1 && n1.type !== n2.type) {
      unMount(n1);
      n1 = null;
    }

    const newNodeType = typeof n2.type;

    // 常规标签
    if (newNodeType === "string") {
      if (!n1) {
        // 挂载
        mountElement(n2, container);
      } else {
        // 更新 TODO
        // patchElement(n2, container);
      }
    } else if (newNodeType === "object") {
      // 组件类型
    } else {
      // 其它类型
    }
  }

  function render(vnode, container) {
    if (vnode) {
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

export function normalizeClass(propsClass) {
  let result = "";
  for (const item in propsClass) {
  }
}
