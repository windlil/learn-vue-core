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
      element: HTMLElement,
      key: string,
      prevValue: any,
      nextValue: any
    ) {
      if (key in element) {
        const type = typeof element[key];
        console.dir(element, nextValue)
        if (type === "boolean" && nextValue === "") {
          element[key] = true;
        } else {
          element[key] = nextValue;
        }
      } else {
        element.setAttribute(key, nextValue);
      }
    },
  }
) {
  const { createElement, insertElement, setElementText, patchProps } = options;

  /**
   *
   * @param vnode 待挂载
   * @param container 被挂载
   */
  function mountElement(vnode, container: HTMLElement) {
    const { type, children, props } = vnode;
    const element = createElement(type);

    // 如果children是字符串
    if (typeof children === "string") {
      setElementText(element, children);
    } else if (Array.isArray(children)) {
      // children是数组类型，依次创建元素，并插入到父级元素中
      children.forEach((child) => {
        patch(null, child, element);
      });
    }

    if (typeof props === 'object' && props !== null) {
      for (const k in props) {
        patchProps(element, k, null, props[k])
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
    const { type, children } = n2;
    if (!n1) {
      // 挂载
      mountElement(n2, container);
    } else {
      // 更新
    }
  }

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else if (!vnode && container._vnode) {
      container.innerHTML = "";
    }
    container._node = vnode;
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
