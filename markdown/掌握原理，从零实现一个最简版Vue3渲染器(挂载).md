# 掌握原理，五十行代码带你实现一个最简版Vue3渲染器(挂载过程)
我们都知道Vue3依靠着虚拟DOM来帮助进行节点渲染，许多人会在面试前背一堆虚拟DOM的原因优势之类的八股题，但是很少有人会去了解一个虚拟DOM是如何转化成一个真实DOM的，甚至很多人背了一堆八股都还不知道虚拟DOM是个什么结构。

本文就带着大家来看看到底虚拟DOM是如何挂载到真实DOM的，我们将从零实现一个最简单的渲染器，本文暂时不涉及更新过程，所以diff算法不会在这里讲到。


## 一、虚拟DOM是怎么样的？
我们都知道虚拟DOM是对真实DOM的映射，所以它应该是一个JS对象结构。

 - `type:` 属性用来标识它的节点类型。
 - `props` 属性用来标识它的节点属性，包括事件绑定，样式等。
 - `children` 属性用来存储该节点的子节点。

下面是一个简单虚拟DOM示例，接下来我们要做的就是尝试将他转化成真实节点，并且挂载在真实DOM上。
```ts
const VNode = {
  type: 'ul',
  props: null,
  children: [
    {
      type: 'li',
      children: 'li-1'
    },
    {
      type: 'li',
      children: 'li-2'
    },
    {
      type: 'li',
      children: 'li-3'
    }
  ]
}
```

**目标1：**
将上面的VNode虚拟DOM对象挂载在 `app` 元素当中显示。

```html
<body>
  <div id="app"></div>
</body>

<script>
  const app = document.getElementById('app')
  // 调用渲染器
  render(VNode, app)
</script>
```

## 二、render函数
接下来我们就要先创建一个 `render` 函数。

```ts
// VNode:虚拟DOM对象，container:被挂载节点
export function render(VNode, container) {
  patch(VNode, container)
}
```
我们的后续挂载或者更新的主要逻辑都是在 `patch` 函数中实现。

## 三、patch
`patch` 是Vue3渲染过程的核心函数，它负责了挂载和更新的主要逻辑，我们要在这个函数中实现我们的挂载功能，因为本文只涉及挂载过程，所以会相对简化很多。

```ts
//n: 等待被转化的虚拟节点
export function patch(n, container) {
  const { type, children = [] } = n
  // 根据虚拟DOM提供的类型创建一个真实节点
  const el = createElement(type)
  
  if (typeof children === "string") {
    // 如果children是文本类型，直接插入到父元素
    el.textContent = children;
  } else {
    // 循环遍历当前节点子节点，为了后续的插入传入我们刚才创建的真实节点
    children.forEach((child) => patch(child, el));
  }

  // 将当前节点插入到真实节点当中
  insertElement(el, container)
}

// 创建真实节点方法
function createElement(type: string) {
  return document.createElement(type)
}

// 插入方法
function insertElement(el, parent) {
  parent.insertBefore(el, null);
}
```
当我们完成这个函数意味着我们也完成了目标1，如下图：我们成功将虚拟节点VNode挂载当我们的app元素当中。

![](D:\学习笔记2024\Snipaste_2024-04-10_17-42-49.png)

下图是我们的最终代码，不足50行：

![](D:\学习笔记2024\Snipaste_2024-04-10_17-44-46.png)

## 四、总结

真实的Vue3的渲染器要比上面的代码要复杂的多，包括对属性、事件、样式等的处理，以及 diff 算法的应用来优化更新过程，但是我们用五十行的代码疏通了这个复杂逻辑中的挂载过程，能让我们对虚拟DOM有更多了解，后续如果有时间会尝试来写一个更加完整的版本。