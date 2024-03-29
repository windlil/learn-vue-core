import { createRender } from "../dist/mini-vue.esm.js";

const { render } = createRender();

const vnode = {
  type: "div",
  children: [
    {
      type: "a",
      children: "这是一个a节点",
      props: {
        onClick(e) {
          console.log('点击了', e)
        }
      }
    },
    {
      type: "div",
      children: [
        {
          type: "div",
          children: "div-div",
          props: {
            id: "abc",
            class: "blue",
          },
        },
      ],
    },
  ],
};

render(vnode, document.querySelector("#app"));
