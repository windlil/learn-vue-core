export type VChildren = VNode[]

export type VNode = {
  type: string | object | Symbol
  el: Node
  children: VChildren
  key?: number
}