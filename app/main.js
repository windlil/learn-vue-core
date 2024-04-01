import { createRender, reactive, effect } from "../dist/mini-vue.esm.js";

const { render } = createRender();

const a = reactive({
  count: true,
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
      "div",
      {
        type: "button",
        props: {
          onClick() {
            a.count = !a.count;
            console.log(a.count);
          },
        },
        children: "button",
      },
    ],
  };
  render(vnode, document.querySelector("#app"));
});
