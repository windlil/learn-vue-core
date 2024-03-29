import { createRender, reactive, effect } from "../dist/mini-vue.esm.js";

const { render } = createRender();

const a = reactive({
  count: 0,
});

effect(() => {
  const vnode = {
    type: "div",
    children: [
      {
        type: "a",
        children: `a.count:${a.count}`,
        props: {
          onClick: [
            (e) => {
              console.log("1", e);
            },
            (e) => {
              console.log("2", e);
            },
          ],
        },
      },
      {
        type: "div",
        props: a.count
          ? {
              onClick() {
                console.log("父元素");
              },
            }
          : {},
        children: [
          "div",
          {
            type: "div",
            children: "div-div",
            props: {
              id: "abc",
              class: "blue",
              onClick() {
                console.log("子元素");
                a.count++;
              },
            },
          },
        ],
      },
    ],
  };
  render(vnode, document.querySelector("#app"));
});
