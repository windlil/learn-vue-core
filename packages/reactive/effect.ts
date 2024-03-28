const bucket = new WeakMap<object, Map<string, Set<any>>>();
let activeEffect: any = null;
const effectStack: any[] = [];

export function effect(fn: any, options: any = {}): any {
  const effectFn = () => {
    activeEffect = effectFn;
    effectStack.push(activeEffect);
    const reuslt = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return reuslt;
  };
  effectFn.options = options;
  if (effectFn.options?.lazy) {
    return effectFn;
  }
  effectFn();
}

export function track(target: object, key: string) {
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
  activeEffect && deps.add(activeEffect);
}

export function trigger(target: object, key: string) {
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
  deps.forEach((dep) => {
    if (dep.options?.scheduler) {
      dep.options.scheduler(dep);
    } else {
      if (dep !== activeEffect) dep();
    }
  });
}

// 采用 effect.lazy 来实现
export function computed(getter) {
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true;
    },
  });
  let dirty = true;
  let value;
  const obj = {
    get value() {
      if (dirty) {
        value = (effectFn as any)();
      }
      return value;
    },
  };

  return obj;
}

/**
 * @param source 被观察的值
 * @param fn 观察值改变时候触发的回调函数
 * @returns 停止观察函数
 */
export function watch(
  source,
  fn,
  options: {
    immediate?: boolean;
  } = {}
) {
  let newValue, oldValue;
  if (typeof source === "function") source = source();
  const scheduler = () => {
    newValue = effectFn();
    fn(newValue, oldValue);
    oldValue = newValue;
  };
  const effectFn = effect(() => traverse(source), {
    lazy: true,
    scheduler,
  });
  const { immediate } = options
  // immediate： 是否立即执行
  if (immediate) {
    scheduler()
  } else {
    oldValue = effectFn()
  }
}

function traverse(obj, usedSet = new Set()) {
  if (typeof obj !== "object" || usedSet.has(obj)) return;
  // 避免循环引用
  usedSet.add(obj);
  // 保证每个值都被引用到
  for (const k in obj) {
    traverse(obj[k], usedSet);
  }
  return obj;
}

