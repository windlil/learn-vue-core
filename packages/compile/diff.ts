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
        console.log(newNode.key, oldNode.key);
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
    const isExistInNewChildren = (newChildren as any[]).findIndex(
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
    if (!oldStartNode) {
      oldStartNode = oldChildren[++oldStartIndex];
    } else if (!oldEndNode) {
      oldEndNode = oldChildren[--oldEndIndex];
    } else if (oldStartNode?.key === newStartNode?.key) {
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
    } else {
      // 第一轮比较都不符合复用
      // 寻找新节点队头在老节点中的索引
      let newStartNodeInOldNodeIndex = oldChildren.findIndex(
        (child) => child.key === newStartNode.key
      );
      if (newStartIndex !== -1) {
        // 如果新节点队头在老节点中存在 将老节点对应的节点插入队头
        patch(oldChildren[newStartNodeInOldNodeIndex], newStartNode, container);
        insertElement(
          oldChildren[newStartNodeInOldNodeIndex].el,
          container,
          oldStartNode.el
        );
        (oldChildren[newStartNodeInOldNodeIndex] as any) = undefined;
      } else {
        // 新节点队头在老节点中不存在 说明新增

        patch(null, newStartNode, container, oldStartNode.el);
      }
      newStartNode = newChildren[++newStartIndex];
    }
  }

  if (oldStartIndex > oldEndIndex && newStartIndex <= newEndIndex) {
    // 说明新节点列表还有节点未被处理
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      patch(null, newChildren[i], container, oldStartNode.el);
    }
  } else if (newStartIndex > newEndIndex && oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {
        unMount(oldChildren[i]);
      }
    }
  }
}

function getVNodeChildren(vnode: VNode): VChildren {
  return vnode.children;
}

/**
 * 快速diff算法 Vue3采用 会先进行前置相同节点和后置相同节点的更新
 * @param n1
 * @param n2
 * @param container
 */
export function patchChildrenUseFastDiff(
  n1: VNode,
  n2: VNode,
  container: Node
) {
  const oldChildren = n1.children;
  const newChildren = n2.children;
  let j = 0;
  let oldNode = oldChildren[j];
  let newNode = newChildren[j];
  // 更新前置相同节点
  while (oldNode.key === newNode.key) {
    patch(oldNode, newNode, container);
    j++;
    oldNode = oldChildren[j];
    newNode = newChildren[j];
  }
  // 更新后置相同节点
  let newEndIndex = newChildren.length - 1;
  let oldEndIndex = oldChildren.length - 1;
  oldNode = oldChildren[oldEndIndex];
  newNode = newChildren[newEndIndex];
  while (oldNode.key === newNode.key) {
    patch(oldNode, newNode, container);
    newEndIndex--;
    oldEndIndex--;
    oldNode = oldChildren[oldEndIndex];
    newNode = newChildren[newEndIndex];
  }

  // 新增节点 理想情况
  if (j > oldEndIndex && newEndIndex >= j) {
    const anchorIndex = newEndIndex + 1;
    const anchor =
      anchorIndex < newChildren.length ? newChildren[anchorIndex] : null;
    while (j <= newEndIndex) {
      patch(null, newChildren[j++], container, anchor?.el);
    }
  } else if (j <= oldEndIndex && j > newEndIndex) {
    // 删除节点
    while (j <= oldEndIndex) {
      unMount(oldChildren[j++]);
    }
  } else {
    // 非理想情况
    const count = newEndIndex - j + 1;
    const source = new Array(count);
    source.fill(-1);
    const keyIndex = [];
    const newStart = j;
    const oldStart = j;
    // 创建索引表 减少时间复杂度
    for (let i = newStart; i <= newEndIndex; i++) {
      keyIndex[newChildren[i].key as unknown as string] = i;
    }

    for (let i = oldStart; i <= oldEndIndex; i++) {
      oldNode = oldChildren[i];
      const k = keyIndex[oldNode.key as unknown as string];
      if (typeof k !== "undefined") {
        newNode = newChildren[k];
        patch(oldNode, newNode, container);
        source[k - newStart] = i;
      } else {
        unMount(oldNode);
      }
    }
  }
}
