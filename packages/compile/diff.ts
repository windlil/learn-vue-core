import { VChildren, VNode } from "./type";
import { insertElement } from "./handle_dom";
import { patch } from "./patch";
import { unMount } from "./circle";

/**
 * 简单diff算法 需要配合唯一key
 * @param n1
 * @param n2
 * @param element
 */
export function patchChildrenUseEasyDiff(n1: VNode, n2: VNode, element: Node) {
  const oldChildren = n1.children;
  const newChildren = n2.children;
  let lastIndex = 0;
  for (let i = 0; i < newChildren.length; i++) {
    const newNode = newChildren[i];
    // 用于判断当前节点是否为新增节点
    let find = false;
    for (let j = 0; j < oldChildren.length; j++) {
      const oldNode = oldChildren[j];
      if (newNode.key === oldNode.key) {
        patch(oldNode, newNode, element);
        find = true;
        if (j < lastIndex) {
          // 移动节点
          const prevNode = newChildren[i - 1];
          if (prevNode) {
            const nextNode = prevNode.el.nextSibling;
            insertElement(newNode.el, element, nextNode);
          }
        } else {
          lastIndex = j;
        }
      }
    }
    if (!find) {
      // 当前节点是新增节点
      const prevNode = newChildren[i - 1];
      let nextNode: Node | null = null;
      if (prevNode) {
        nextNode = (prevNode.el as Node).nextSibling;
      } else {
        nextNode = element.firstChild;
      }
      patch(null, newNode, element);
    }
  }
  // 判断旧节点是否存在于新节点
  for (let i = 0; i < oldChildren.length; i++) {
    const isExistInNewChildren = (newChildren as any[]).find(
      (child) => child === oldChildren[i]
    );
    if (!isExistInNewChildren) {
      unMount(oldChildren[i]);
    }
  }
}

/**
 * 双端diff算法:对新旧节点的两端共四个节点进行比较
 */
export function patchChildrenUseDoubleDiff(
  n1: VNode,
  n2: VNode,
  container: Node
) {
  const oldChildren = getVNodeChildren(n1);
  const newChildren = getVNodeChildren(n2);
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;
  let oldStartNode = oldChildren[oldStartIndex];
  let oldEndNode = oldChildren[oldEndIndex];
  let newStartNode = newChildren[newStartIndex];
  let newEndNode = newChildren[newEndIndex];

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode.key === newStartNode.key) {
      // 旧节点队头key === 新节点队头key
      patch(newStartNode, oldStartNode, container);
      newStartNode = newChildren[++newStartIndex];
      oldStartNode = oldChildren[++oldStartIndex];
    } else if (oldEndNode.key === newEndNode.key) {
      // 旧节点队尾key === 新节点队尾key
      patch(newStartNode, oldStartNode, container);
      newStartNode = newChildren[--newStartIndex];
      oldStartNode = oldChildren[--oldStartIndex];
    } else if (oldStartNode.key === newEndNode.key) {
      // 旧节点队头key === 新节点队尾key
      patch(newStartNode, oldStartNode, container);
      insertElement(oldStartNode.el, container, oldEndNode.el.nextSibling);
      oldStartNode = oldChildren[++oldStartIndex];
      newEndNode = newChildren[--newEndIndex];
    } else if (oldEndNode.key === newStartNode.key) {
      // 旧节点队尾key === 新节点队头key
      patch(oldEndNode, newStartNode, container);
      insertElement(oldEndNode.el, container, oldStartNode.el);
      oldEndNode = oldChildren[--oldEndIndex];
      newStartNode = newChildren[++newStartIndex];
    }
  }
}

function getVNodeChildren(vnode: VNode): VChildren {
  return vnode.children;
}
