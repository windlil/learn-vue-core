import { createRender, reactive, effect, Text } from "../dist/mini-vue.esm.js";

const { render } = createRender();

const a = reactive({
  count: true,
  b: 0,
});

const AComponent = {
  data:() => ({
    message: 'mini-vue'
  }),
  render() {
    return {
      type: 'div',
      children: `hello ${this.message}`
    }
  }
}

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
        key: 0
      },
      {
        type: "button",
        props: {
          onClick() {
            a.b++;
          },
        },
        children: "button",
        key: 1
      },
      {
        type: AComponent
      }
    ],
  };
  render(vnode, document.querySelector("#app"));
});
