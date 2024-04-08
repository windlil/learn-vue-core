export type VChildren = VNode[];

export type componentOptions = {
  render: (...args: any) => VNode;
  data?: object | Function;
};

export type VNode = {
  type: string | componentOptions | Symbol;
  el: Node;
  children: VChildren;
  key?: number;
};
