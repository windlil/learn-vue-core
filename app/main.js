import { createRender, reactive, effect, Text } from "../dist/mini-vue.esm.js";

const { render } = createRender();

const a = reactive({
  count: true,
  b: 0,
});

effect(() => {
  const vnode = {
    type: "div",
    props: a.count
      ? {
          class: "blue",
        }
      : {
          class: "red",
        },
    children: [
      {
        type: Text,
        children: `${a.b}`,
      },
      {
        type: "button",
        props: {
          onClick() {
            a.count = !a.count;
            a.b++;
          },
        },
        children: "button",
      },
    ],
  };
  render(vnode, document.querySelector("#app"));
});
