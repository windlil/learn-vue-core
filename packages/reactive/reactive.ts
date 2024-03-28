import { track, trigger } from './effect'

export function reactive(target) {
  const _proxy = new Proxy(target, {
    get(target, key) {
      track(target, key as string)
      const value = Reflect.get(target, key);

      if (typeof value === 'object' && value !== null) {
        return reactive(value)
      }
      return value;
    },
    set(target, key, newValue) {
      if (newValue === target[key]) {
        trigger(target, key as string)
        return true
      };
      Reflect.set(target, key, newValue);
      trigger(target, key as string)
      return true
    },
  });
  return _proxy
}
