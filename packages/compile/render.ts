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
    // 处理属性
    patchProps(
      element: HTMLElement | any,
      key: string,
      prevValue: any,
      nextValue: any
    ) {
      // 处理事件
      if (/^on/.test(key)) {
        const eventName = key.slice(2).toLocaleLowerCase();
        let invokers = element._vei ?? (element._vei = {});
        let invoker = invokers[key];
        if (nextValue) {
          // 如果存在新值
          if (!invoker) {
            // 首次挂载
            invoker = element._vei[key] = (e: Event) => {
              if (Array.isArray(invoker.value)) {
                if (e.timeStamp < invoker.attached) return;
                invoker.value.forEach((fn) => fn(e));
              } else {
                invoker.value(e);
              }
            };
            invoker.value = nextValue;
            invoker.attached = performance.now;
            element.addEventListener(eventName, invoker);
          } else {
            // 更新
            invoker.value = nextValue;
          }
        } else if (invoker) {
          // 如果值不存在 且存在invoker 说明要卸载方法
          (element as HTMLElement).removeEventListener(eventName, invoker);
        }
      } else if (key === "class") {
        // 处理class
        element.classList.add(nextValue);
      } else if (key in element) {
        // 处理DOM属性
        const type = typeof element[key];
        if (type === "boolean" && nextValue === "") {
          element[key] = true;
        } else {
          element[key] = nextValue;
        }
      } else {
        // 处理HTML属性
        element.setAttribute(key, nextValue);
      }
    },
    unMount(vnode) {
      const el: HTMLElement = vnode.el;
      const parent = el.parentNode;
      parent?.removeChild(el);
    },
    /**
     *
     * @param n1 旧节点
     * @param n2 新节点
     */
    patchElement(n1, n2) {},
  }
) {
  const {
    createElement,
    insertElement,
    setElementText,
    patchProps,
    unMount,
    patchElement,
  } = options;

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
        if (typeof child === "string") {
          setElementText(element, child);
        } else {
          patch(null, child, element);
        }
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
        patchElement(n1, n2);
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
