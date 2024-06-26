import {
  insertElement,
  createElement,
  setElementText,
  setText,
  createTextNode,
} from "./handle_dom";
import { unMount } from "./circle";
import { Text, Fragment } from "./static";
import { VNode } from "./type.d";
import { patchChildrenUseDoubleDiff, patchChildrenUseEasyDiff } from "./diff";
import { mountComponent, patchComponent } from "../component";

/**
 * 更新属性-事件
 * @param element
 * @param key
 * @param prevValue
 * @param nextValue
 */
export function patchPropsEvent(
  element: HTMLElement | any,
  key: string,
  prevValue: any,
  nextValue: any
) {
  const eventName = key.slice(2).toLocaleLowerCase();
  let invokers;

  if (element?._vei) {
    invokers = element._vei;
  } else {
    element._vei = {};
    invokers = element._vei;
  }

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
}

/**
 * 更新属性-class
 * @param element
 * @param key
 * @param prevValue
 * @param nextValue
 */
export function patchPropsClass(
  element: HTMLElement | any,
  key: string,
  prevValue: any,
  nextValue: any
) {
  for (const item of element.classList) {
    element.classList.remove(item);
  }
  element.classList.add(nextValue);
}

/**
 * 更新属性-DOM属性
 * @param element
 * @param key
 * @param prevValue
 * @param nextValue
 */
export function patchPropsDomAttribute(
  element: HTMLElement | any,
  key: string,
  prevValue: any,
  nextValue: any
) {
  const type = typeof element[key];
  if (type === "boolean" && nextValue === "") {
    element[key] = true;
  } else {
    element[key] = nextValue;
  }
}

/**
 * 更新属性MAIN
 * @param element
 * @param key
 * @param prevValue
 * @param nextValue
 */
export function patchProps(
  element: HTMLElement | any,
  key: string,
  prevValue: any,
  nextValue: any
) {
  if (/^on/.test(key)) {
    // 处理事件

    patchPropsEvent(element, key, prevValue, nextValue);
  } else if (key === "class") {
    // 处理class
    patchPropsClass(element, key, prevValue, nextValue);
  } else if (key in element) {
    // 处理DOM属性
    patchPropsDomAttribute(element, key, prevValue, nextValue);
  } else {
    // 处理HTML属性
    element.setAttribute(key, nextValue);
  }
}

/**
 *
 * @param vnode 待挂载
 * @param container 被挂载
 */
function mountElement(vnode, container: HTMLElement, anchor?: Node) {
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

  insertElement(element, container, anchor);
}

/**
 * 在没有提供key的情况下 进行更新
 * @param n1
 * @param n2
 * @param element
 */
function patchChildrenWithNoKey(n1: VNode, n2: VNode, element: Node) {
  const oldChildren = n1.children;
  const newChildren = n2.children;
  const oldChildrenLength = oldChildren.length;
  const newChildrenLength = newChildren.length;
  const commonLength = Math.min(oldChildrenLength, newChildrenLength);
  for (let i = 0; i < commonLength; i++) {
    patch(oldChildren[i], newChildren[i], element);
  }
  // 说明要新增
  if (newChildrenLength > commonLength) {
    for (let i = commonLength; i < newChildrenLength; i++) {
      patch(null, newChildren[i], element);
    }
  }
  // 旧节点要被删除
  if (oldChildrenLength > commonLength) {
    for (let i = commonLength; i < oldChildrenLength; i++) {
      unMount(oldChildren[i]);
    }
  }
}

/**
 * 更新children
 * @param n1
 * @param n2
 * @param element
 */
export function patchChildren(n1, n2, element) {
  const childrenType = typeof n2.children;
  if (childrenType === "string") {
    setElementText(element, n2.children);
  } else if (Array.isArray(n2.children)) {
    patchChildrenUseEasyDiff(n1, n2, element);

  }
}

/**
 * 更新节点
 * @param n1 老节点
 * @param n2  新节点
 */
function patchElement(n1, n2) {
  const element = (n2.el = n1.el);
  const newProps = n2.props;
  const oldProps = n1.props;

  for (const k in newProps) {
    if (newProps[k] !== oldProps[k]) {
      patchProps(element, k, oldProps[k], newProps[k]);
    }
  }
  //删除本次未定义属性
  for (const k in oldProps) {
    if (!(k in newProps)) {
      patchProps(element, k, oldProps[k], null);
    }
  }

  patchChildren(n1, n2, element);
}

export function patchStringType(n1, n2, container, anchor?: Node) {
  if (!n1) {
    // 老节点不存在 挂载
    mountElement(n2, container, anchor);
  } else {
    // 老节点存在 更新
    patchElement(n1, n2);
  }
}

export function patchText(n1, n2, container) {
  if (!n1) {
    // 如果老节点不存在

    const el = (n2.el = createTextNode(n2.children));

    insertElement(el, container);
  } else {
    const el = (n2.el = n1.el);
    if (n2.children !== n1.children) {
      setText(el, n2.children);
    }
  }
}

export function patchObject() {}

export function patchFragment(n1, n2, container) {
  if (!n1) {
    (n2.children as any[]).forEach((child) => patch(null, child, container));
  } else {
    patchChildren(n1, n2, container);
  }
}

/**
 *
 * @param n1 旧vnode
 * @param n2 新vnode
 * @param container
 */
export function patch(n1: VNode | null, n2: VNode, container, anchor?: Node) {
  // 新旧节点的类型不一致 直接卸载
  if (n1 && n1.type !== n2.type) {
    unMount(n1);
    n1 = null;
  }
  const newNodeType = typeof n2.type;

  // 常规标签
  if (newNodeType === "string") {
    patchStringType(n1, n2, container, anchor);
  } else if (newNodeType === "object") {
    // 组件类型
    if (!n1) {
      mountComponent(n2, container, anchor);
    } else {
      patchComponent(n1, n2, container, anchor);
    }
  } else if (n2.type === Text) {
    // 文本类型

    patchText(n1, n2, container);
  } else if (n2.type === Fragment) {
    // Fragment类型
    patchFragment(n1, n2, container);
  } else {
    // 其它类型
  }
}

/**
 * 更新流程：
 * patch -> patchElement -> patchProps -> patchChildren
 */
