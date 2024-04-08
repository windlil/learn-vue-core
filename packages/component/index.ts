import { VNode, componentOptions } from "../compile/type";
import { patch } from "../compile/patch";
import { effect, reactive } from "../reactive/index";

export function getData(data: object | Function) {
  if (typeof data === 'function') {
    return data()
  } else if (typeof data === 'object') {
    return data
  }
}

export function mountComponent(n: VNode, container, anchor) {
  const componentOptions = n.type;
  let { render, data } = componentOptions as componentOptions;
  data = getData(data!)
  const state = reactive(data);
  console.log(state, data);
  effect(() => {
    const subTree = render.call(state, state);
    patch(null, subTree, container, anchor);
  });
}

export function patchComponent(n1, n2, container, anchor) {}
