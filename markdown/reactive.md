# 好记性不如烂笔头！从零实现vue3响应式核心原理
> 尝试跟着本文来动手实现一个简单的响应式系统，并用其来完成一个小案例（effect、reactive、track、trigger...）

## 一、阶段目标
响应式系统简单的理解为当我们的响应式数据发生改变时候，其依赖的副作用函数会重新被执行。本阶段的目标是实现下面一个的一个小案例。

`index.html:`
```html
<body>
  <button id="button">点击</button>
  <div id="app"></div>
  <script src="./main.js"></script>
</body>
```
`main.js:`
```js
import { reactive, effect } from './dist/vue.esm.js'

const button = document.querySelector("#button");
const app = document.querySelector("#app");
const a = reactive({ count: 0 })

effect(() => {
  app.innerHTML = a.count
})

button?.addEventListener('click', () => {
  a.count++
})
```
`effect`是副作用函数，会影响到其它函数的执行，其内部存在对被 `reactive` 函数声明的响应式对象 `a.count` 的访问，因此，当我们的 `a.count` 数据发生变化的时候，`effect` 的回调函数会被再次执行。

**目标：**
1. `effect` 函数首次执行，app内显示文本。
2. 点击button按钮，`a.count`属性改变，app内文本重新渲染。

## 一、reactive
其实说到Vue3响应式原理，我们大多数人都知道其是依赖于 `Proxy` 代理来实现的，但是对其内部逻辑是如何实现的任然是一知半解，现在就让我们来挑战这一重要函数。

```ts
export function reactive(target) {
  // 创建代理对象
  const _proxy = new Proxy(target, {
    // 拦截对象属性访问
    get(target, key) {
      const value = Reflect.get(target, key);
      // TODO: track函数收集依赖
      return value;
    },

    // 拦截对象属性修改
    set(target, key, newValue) {
      Reflect.set(target, key, newValue);
      // TODO：trigger函数触发依赖
      return true
    },
  });

  return _proxy
}
```
通过上面的几行简单代码，我们就完成了 `reactive` 的基本架构搭建，创建并返回了一个代理对象。

接下来，我们只需要在 `get` 方法内去收集依赖，在 `set` 方法中触发收集到的依赖。

## 二、effect
在前文我们就早早提到了 `effect` 函数，作为副作用函数，它将会被我们的响应式数据进行收集以及触发。

```ts
let currentActiveEffect = null

export function effect(fn) {
  const effectFn = () => {
    currentActiveEffect = effectFn
    fn()
  }

  effectFn()
}
```
当我们执行 `effect` 函数的时候，`currentActiveEffect` 会暂存该回调函数，如果其内部存在对响应式数据的访问，那么将等待被收集，接下来就到了我们的收集依赖和触发依赖的阶段。

## 三、track、trigger
如果说 `reactive` 是响应式系统的核心模块，那么可以说 `track` 和 `trigger` 就是 `reactive` 的实现核心。

我们首先要考虑的是要采用何种结构来对副作用函数进行存储，并将属性和其对应的依赖进行一一对应。

![](D:\学习笔记2024\Vue3依赖收集结构.png)

我们可以简单的梳理一下上面的结构图。
1. 创建一个 WeakMap 结构，键为target对象，值为一个Map结构。
2. Map结构的键为对应的属性，值为一个Set结构，内部存储的是我们最终要操作的effect函数。

简单的理解：
- `track` 依赖收集的过程就是把依赖函数放入对应的Set结构的过程。
- `trigger`依赖触发的过程就是把对应Set结构的依赖函数获取到并依次执行的过程。

```ts
const bucket = new WeakMap()

// 依赖收集函数
export function track(target, key) {
  let depsMap = bucket.get(target);
  if (!depsMap) {
    depsMap = new Map();
    bucket.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  currentActiveEffect && deps.add(currentActiveEffect);
}

// 依赖触发函数
export function trigger(target, key) {
  let depsMap = bucket.get(target);
  if (!depsMap) {
    depsMap = new Map();
    bucket.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  // 依次执行收集到的依赖函数
  deps.forEach(dep => {
    dep()
  })
}
```

实现这两个函数后，我们再将其放入对应的执行位置当中：

```typescript
export function reactive(target) {
  const _proxy = new Proxy(target, {
    get(target, key) {
      const value = Reflect.get(target, key);
      // 新增
      track(target, key);
        
      return value;
    },
    set(target, key, newValue) {
      Reflect.set(target, key, newValue);
      // 新增
      trigger(target, key)
        
      return true
    },
  });

  return _proxy
}
```



## 四、最终

至此，我们已经可以采用我们自己的响应式系统来实现第一章的小案例，通过点击按钮，成功触发视图的重新渲染，如下图：

![](D:\学习笔记2024\img\响应式系统实现.png)

