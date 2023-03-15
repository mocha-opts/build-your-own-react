## 第零步：回顾 JSX to JS

首先我们先通过以下三行代码来回顾一些 React 中的基本概念。

```javascript
const element = <h1 title="foo">Hello</h1>;
const container = document.getElementById("root");
ReactDOM.render(element, container);
```

第一行代码定义了一个 React 元素。

第二行代码从 DOM 中获取了 id 为 root 的元素。

第三行代码将第一行定义的 React 元素渲染到第二行获取到的元素中去。

以上三行代码就构成了一个非常简单的 React App，让我们来看看如何通过原生的 JS 来代替以上三行代码。

```javascript
const element = <h1 title="foo">Hello</h1>;
```

先来看看第一行代码，其中的 React 元素就是通过 js 来定义的，它甚至不是合法的 JS 语法，为了用原生的 JS 来替代它，首先我们得让它变得合法。

JSX 到 JS 到转换是通过像 Babel 这样的工具来实现的，转换过程比较简单：把 js 语法中的标签 tag、属性 props、子元素 children 作为参数传入一个叫做 createElement 的函数来处理。

```javascript
const element = React.createElement("h1", { title: "foo" }, "Hello");
```

React.createElement 这个方法通过传入的参数创建了一个对象。抛开这个方法会对参数的一些验证以外，这就是它所做的全部事情。以此为基础，我们也可以简单模仿一下 React.createElement 创建的对象。

```javascript
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
};
```

我们所定义的元素是一个具有两个属性（type 和 props）的对象（当然真正的 ReactElement 可不止这两个属性，不过在这里我们只关心这两个）。

type 指的是我们想要创建的 DOM 元素类型的字符串，等同于通过 document.createElement 方法来创建 DOM 元素时传入的 tagName。type 也可以是一个函数，但是为了不造成困惑，这个等到第七步时我们再说。

props 也是一个对象，它存放的是 JSX 中设置的特性（attributes）的键与值，以及一个特殊的属性（property）children。

children 在这里是一个字符串，不过更多时候它会是一个包含许多元素的数组，这也是为什么众多的元素通过错综复杂的关系能够构建成树的原因。

```javascript
ReactDOM.render(element, container);
```

另外我们需要来处理的一个方法是 ReactDOM.render。render 是 React 来改变 DOM 的方法，这样简单的一句描述有些过于宽泛了，不过我们先可以根据这点来试着捣鼓捣鼓它是怎么改变 DOM 的。

```javascript
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
};

const node = document.createElement(element.type);
node["title"] = element.props.title;
```

首先我们根据我们创建的 element 的属性 type 来创建对应的 DOM 节点，在这里是 h1。然后我们根据元素 element 的属性为创建的节点设置属性，在这里是 title。

为了避免困扰，在这里说明一下，文中所说的元素指的是 React Element，节点指的是 DOM Element，以此来区分两者。

```javascript
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
};

const text = document.createTextNode("");
text["nodeValue"] = element.props.children;
```

然后我们来为子元素创建相应的节点。这里的话只有一个子元素，为此我们需要创建一个文本节点。之所以选择创建文本节点（textNode）而不是设置 innerText 属性，是因为这样做的话之后我们能够通过同一种方式来处理所有元素。

同时需要注意，我们在为节点设置 nodeValue 属性的这个过程，与设置节点 h1 设置 title 属性类似，就像是在设置一个文本节点的 nodeValue 为 Hello，即 props: {nodeValue: "hello"}。

```javascript
const container = document.getElementById("root");

node.appendChild(text);
container.appendChild(node);
```

最后，我们将创建的文本节点放到节点 h1 上，将节点 h1 放到 id 为 root 的节点上去。

到此为止，我们就完成了用原生的 JS 来替代 JSX 语法这一目标，完整的代码如下：

```javascript
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
};

const container = document.getElementById("root");

const node = document.createElement(element.type);
node["title"] = element.props.title;

const text = document.createTextNode("");
text["nodeValue"] = element.props.children;

node.appendChild(text);
container.appendChild(node);
```

## 第一步：createElement

```javascript
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
const container = document.getElementById("root");
ReactDOM.render(element, container);
```

让我们从另外一个 React App 开始。这次，我们来尝试创建一个自己的 React 来替代真正的 React。

从实现 createElement 方法开始吧。

首先，在 JSX 转换到 JS 的这个过程中，让我们看看 createElement` 这个方法到底都做了些什么吧。

```javascript

/\*_ JSX _/
const element = (

  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)

/\*_ JS _/
const element = React.createElement(
"div",
{ id: "foo" },
React.createElement("a", null, "bar"),
React.createElement("b")
}
```

在前面我们提到过，一个元素（我们简化过的）实际上就是一个带有 type 和 props 这两个属性的对象。我们的方法唯一需要操心的就是如何去创建这个对象。

```javascript
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
}
```

在以上代码中，我们使用展开操作符... 来处理 props，使用剩余参数语法...（没错，还是这三个点，都是 ES6 语法）来处理 children，经过剩余参数语法的处理，children 就变成了一个数组。

例如，createElement("div") 返回：

```javascript
{
type: "div",
props: { children: [] }
}
createElement("div", null, a) 返回：

{
type: "div",
props: { children: [a] }
}
createElement("div", null, a, b) 返回：

{
type: "div",
props: { children: [a, b] }
}
```

需要注意的是，children 数组中的元素不一定是对象，也有可能是原始类型的值如 number 或 string。对于这种元素，我们需要封装成一个对象，并为其创建一种特殊的 type：TEXT_ELEMENT。

```javascript
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
```

需要注意真正的 React 并没有封装原始类型的值或在没有 children 时创建一个空数组，我们这样做是为了简化我们的代码，因为我们的目标是易于理解，而不是追求高性能。

```javascript

const element = React.createElement(
"div",
{ id: "foo" },
React.createElement("a", null, "bar"),
React.createElement("b")
}
```

到此为止，我们还没有替换 React.createElement 这个方法

替换 React 的第一步，给我们的库取个名字吧 🤨。

名字要听起来像 React🤔，同时也要有教学（_didactic_）的味道 🧐。

有了 💡，就叫它 Didact 吧。

```javascript

const Didact = {
createElement,
}

const element = Didact.createElement(
"div",
{ id: "foo" },
Didact.createElement("a", null, "bar"),
Didact.createElement("b")
}
```

但是我们仍然需要使用 JSX 语法，怎样才能让 babel 知道我们用的是 Didact 中的 createElement 方法而不是 React 的呢？

```javascript
/\*_ @jsx Didact.createElement _/;
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
```

在元素前面添加像这样的注释，babel 就会使用我们定义的方法去转换 JSX 了。（关于 babel 的解析规则这里就不过多深入）

最后，本节实现的 createElement 方法完整代码如下：

```javascript
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT*ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
```

## 第二步：render

```javascript
/\*\* @jsx Didact.createElement \_/;
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
const container = document.getElementById("root");
ReactDOM.render(element, container);
```

接着，让我们关注最后一行代码。是的没错，本节的目标就是实现我们自己的 render 方法以替换 ReactDOM.render。

对于现在的我们来说，我们只需要关心把元素变成节点添加到 DOM 上去。至于更新和删除，我们一步一步来，后面再考虑这些。

下面的代码就先搭好了架子，接着就只需要在 render 方法内部去实现具体的功能就好了。

```javascript
function render(element, container) {
  // TODO create dom nodes
}

const Didact = {
  createElement,
  render,
};

Didact.render(element, container);
```

首先，我们先根据元素的类型 type 来创建相应的 DOM 节点，然后将这个节点添加到容器节点 container 中。

```javascript
function render(element, container) {
  const dom = document.createElement(element.type);

  container.appendChild(dom);
}
```

当然，不要忘了子元素 children，这里采用递归的方法来处理。

```javascript
function render(element, container) {
  const dom = document.createElement(element.type);

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}
```

等等，还有文本元素呢，如果元素的类型 type 是 TEXT_ELEMENT，我们要为其创建文本节点。

```javascript
function render(element, container) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}
```

最后，节点有了，就该为其添加属性 props 了。记得需要排除 props 中的 children。

```javascript
function render(element, container) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}
```

Bingo! That’s it! 我们做到了，现在我们的库 Didact 也可以将 JSX 元素渲染成真正的 DOM 节点了。

本节实现的 render 代码如下：

```javascript
function render(element, container) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}
```

加上之前实现的完整代码如下：

```javascript
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(element, container) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);
  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });
  element.props.children.forEach((child) => render(child, dom));
  container.appendChild(dom);
}

const Didact = {
  createElement,
  render,
};

/\*_ @jsx Didact.createElement _/;
const element = (
  <div style="background: salmon">
    <h1>Hello World</h1>
    <h2 style="text-align:right">from Didact</h2>
  </div>
);
const container = document.getElementById("root");
Didact.render(element, container);
```

当然，你也可以在 codesandbox 上看看最终的效果怎么样。

## 第三步：Concurrent Mode

并发，听起来是不是非常地高大上？没错，本节就是要实现它！

不过，在开始之前，我们需要来解决一点问题。

```javascript
function render(element, container) {

    ...

element.props.children.forEach(child =>
render(child, dom)
)

    ...

}
```

注意以上代码，因为采用的是递归，一旦我们开始渲染，在整个元素树渲染的过程是无法停下来的。如果元素树非常复杂的话，就会占用主线程非常多的时间，从而造成阻塞。试着想一下，如果浏览器需要处理优先级更高的事件如用户输入、保持动画流畅运行，这时浏览器就不得不等到 render 方法执行完后再来处理这些事情。

既然递归会造成这么严重的问题，那我们之前为什么要采用递归的方式呢？我猜是因为 React 之前也是采用不可中断的递归的方式。（误

走远了，让我们回到正题，来将这个过程变得可中断。

首先，我们来将整个任务拆分成一个个小的任务单元 work unit，然后在每次执行完一个小的任务单元后询问一下浏览器有没有其他需要优先处理的事情。这个反复的过程我们用 requestIdleCallback 这个原生方法来实现，这个函数会在浏览器空闲的时候执行，这样的话像一些关键事件如动画和用户输入就不会被影响延迟。requestIdleCallback 同时也提供了一个类似于截止时间 deadline 的参数，如果传入的方法执行时间超过了这个时间，就会停止执行将主动权交还到浏览器手中。

注意 React 不再使用 requestIdleCallback 这个方法，因为他们为了保证兼容性自己实现了一套！不过从方法的概念上是一致的，所以我们就采用 requestIdleCallback 这个方法。

在开始这个循环之前，我们需要先指定第一个任务单元，为此我们创建了 performUnitOfWork 方法，在这个方法中需要去执行这个任务，同时最后返回下一个需要执行的任务单元 nextUnitOfWork。

```javascript
let nextUnitOfWork = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
```

## 第四步：Fibers

为了分解任务单元，我们需要一种数据结构：fiber tree。

一个 fiber 对应一个元素，同时每个 fiber 也是我们所划分出来的任务单元。

那么 fiber tree 到底是长啥样的呢？

举个 🌰，比如我们想要渲染如下一棵元素树。

```javascript
Didact.render(
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>,
  container
);
```

对应的 fiber tree 就长下面这个样子。

在 render 方法中，我们先创建 root fiber 并把它作为第一个任务单元，即第一个 nextUnitOfWork。其余的任务会在 performUnitOfWork 这个方法中去处理。对于每个 fiber 我们需要在 performUnitOfWork 这个方法中做三件事情：

将元素转换为节点并添加到 DOM 上。
为该元素的子元素 children 创建 fibers。
设置下一个任务单元 nextUnitOfWork。
fiber tree 的其中一个目标就是为了能够让设置下一个任务单元更加容易，这也是为什么每个 fiber 都需要有一个指针（逻辑上）指向第一个子元素 child，一个指针指向兄弟节点 sibling，一个指针指向父节点 parent。

当我们执行完一个 fiber 的任务时，如果它的 child 指针指向的元素不为空的话，则该元素将会被指定为 nextUnitOfWork。以上图中的 fiber tree 为例，当我们执行完标签为 div 的 fiber 的任务时，nextUnitOfWork 将会是它的 child 指针指向的标签为 h1 的 fiber。

如果一个 fiber 的 child 指针指向的元素为空，即该 fiber 不存在 child 时，我们将会指定 sibling 对应的 fiber 作为 nextUnitOfWork。还是以上图的 fiber tree 为例，标签为 p 的 fiber 没有 child，所以我们将 p 对应的 sibling，即标签为 a 的 fiber 作为 nextUnitOfWork。

如果一个 fiber 即没有 child 也没有 sibling，我们就指定 nextUnitOfWork 为该 fiber 的叔叔 uncle，即该 fiber 的父节点 parent 的兄弟节点 sibling。上图 fiber tree 中标签为 a 的 fiber 就没有 child 和 sibling，于是向上寻找最后找到了它的叔叔，标签为 h2 的 fiber。

如果该 fiber 没有叔叔呢？我们将会继续沿着 parent 向上寻找，直到找到一个存在 sibling 的 parent 或者到达根 root。如果是后者的话，那就说明我们已经执行完了本次渲染 render 的所有任务。

接着，就让我们把想法转换为代码吧。

在开始之前，我们先将 render 方法中之前的代码移除，并将移除的那部分放到方法 createDom 中去，这将会在之后用到。

原 render 方法：

```javascript
function render(element, container) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}
```

改造过后的 render 方法以及 createDom 方法：

```javascript
function createDom(fiber) {
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

function render(element, container) {
  // TODO set next unit of work
}
```

现在，让我们专注于实现 render 方法。

首先，在 render 方法中我们先把 fiber tree 的根 root 作为 nextUnitOfWork。

```javascript
function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}
```

接着当浏览器有空的时候就会调用我们的任务循环 workLoop，我们就会从根 root 开始执行任务。

```javascript
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // TODO add dom node
  // TODO create new fibers
  // TODO return next unit of work
}
```

在 performUnitOfWork 中，我们要先为传入的 fiber 创建对应的 DOM 节点。并且我们会使用 fiber.dom 属性来定位该 DOM 节点。

```javascript
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // TODO create new fibers
  // TODO return next unit of work
}
```

然后对该 fiber 的子元素 children 创建相应的 fiber。

```javascript
function performUnitOfWork(fiber) {

    ...

const elements = fiber.props.children
let index = 0
let prevSibling = null

while (index < elements.length) {
const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

}
// TODO return next unit of work
}
```

再根据是否是第一个子元素来设置 child 和 sibling。

```javascript
function performUnitOfWork(fiber) {

    ...

while (index < elements.length) {

    	...

    	if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++

}
// TODO return next unit of work
}
```

最后，我们根据之前提到的 child-sibling-uncle（parent’s sibling）的顺序来指定一下 nextUnitOfWork。

```javascript
function performUnitOfWork(fiber) {

    ...

while (index < elements.length) {
...
}

    if (fiber.child) {
    return fiber.child

}
let nextFiber = fiber
while (nextFiber) {
if (nextFiber.sibling) {
return nextFiber.sibling
}
nextFiber = nextFiber.parent
}
}
```

完整的 performUnitOfWork 方法如下：

```javascript
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}
```

## 第五步：Render and Commit Phases

这里我们又遇到了一个问题。

```javascript
function performUnitOfWork(fiber) {

    ...

    if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)

}

    ...

}
```

每次我们在处理一个元素时都需要将其新建的节点添加到 DOM 上去。但是不要忘了，浏览器能够在我们渲染完整棵 fiber tree 之前中断我们的渲染过程的。出现这种情况时，用户将会看到一个不完整的 UI 界面，那是我们不想看到的。

所以，我们要将修改 DOM 的这部分代码从 performUnitOfWork 方法中移除。

```javascript
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}
```

相对地，我们需要保持对 fiber tree 的根 root 的引用。我们将其引用命名为 wipRoot（work in progress root）。

```javascript
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let wipRoot = null;
```

一旦我们处理完了所有任务单元（可以根据 nextUnitOfWork 是否为空来判断），我们再将整棵 fiber tree 提交到 DOM 上。

```javascript
function commitRoot() {
// TODO add nodes to dom
}

function workLoop(deadline) {

    ...

if (!nextUnitOfWork && wipRoot) {
commitRoot()
}

...
}
```

在 commitRoot 这个方法中，我们以递归的方式将所有节点添加到 DOM 上。

```javascript
function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

## 第六步：Reconciliation

目前为止，我们只是实现了添加节点到 DOM 上，删除和更新呢？

这就是本节要实现的目标，为此我们需要将本次渲染的 fiber tree 即 wipRoot 与上一次提交到 DOM 上的 fiber tree 进行比较。

那么，在每次提交阶段完成时，我们就需要保持对本次提交到 DOM 上的 fiber tree 的引用，以方便下次比较，我们将其引用命名为 currentRoot。同时，我们也为每个 fiber 添加 alternate 属性，指向旧的 fiber，即在上个提交阶段我们添加到 DOM 上的 fiber。

```javascript
function commitRoot() {
commitWork(wipRoot.child)
currentRoot = wipRoot
wipRoot = null
}

...

function render(element, container) {
wipRoot = {
dom: container,
props: {
children: [element],
},
alternate: currentRoot,
}
nextUnitOfWork = wipRoot
}

...

let currentRoot = null

...
```

接着，让我们从 performUnitOfWork 方法中抽离创建新的 fiber 那部分代码，原代码如下：

```javascript
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}
```

将抽离出来的方法放到 reconcileChildren 方法中，改造后的代码如下：

```javascript
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: wipFiber,
      dom: null,
    };

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
```

在 reconcileChildren 这个方法中，我们将对旧的 fiber 与新的元素进行调和 reconclie。

我们同时迭代旧 fiber 的子元素 wipFiber.alternate 以及 elements 数组中我们想要调和的元素。

如果我们忽略同时迭代链表和数组所需要注意的那些通用代码，只关心其中最重要的部分：oldFiber 和 element，element 是本次调和我们想要渲染到 DOM 上的 fiber，oldFiber 是我们上次渲染到 DOM 上的 fiber。我们需要比较它们的差异。

```javascript
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    // TODO compare oldFiber to element

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
```

我们采用以下方式来对它们进行比较：

如果 oldFiber 和 element 的 type 一样，我们可以保留其 DOM 节点，只更新其中的属性 props。
如果它们的 type 不一样：
对于 element，我们需要创建新的 DOM 节点。
对于 oldFiber，我们需要移除旧的 DOM 节点。
在真正的 React 中，这里会使用 key 来优化调和。比如，它能够探测到数组中元素的位置是否发生变化。

```javascript
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      // TODO update the node
    }
    if (element && !sameType) {
      // TODO add this node
    }
    if (oldFiber && !sameType) {
      // TODO delete the oldFiber's node
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
```

如果 oldFiber 和 element 的 type 一致时，我们创建一个新的 fiber，其中保持原来的 DOM 不变，属性 props 采用 element.props。

```javascript
if (sameType) {
  newFiber = {
    type: oldFiber.type,
    props: element.props,
    dom: oldFiber.dom,
    parent: wipFiber,
    alternate: oldFiber,
    effectTag: "UPDATE",
  };
}
```

同时我们为新的 fiber 新增了 effectTag 属性。这个属性我们将会在后面的提交阶段用到。

对于 type 不一致的情况，我们为 element 创建新的 fiber，并将 effectTag 设置为 PLACEMENT。

```javascript
if (element && !sameType) {
  newFiber = {
    type: element.type,
    props: element.props,
    dom: null,
    parent: wipFiber,
    alternate: null,
    effectTag: "PLACEMENT",
  };
}
```

对于 oldFiber，我们需要删除对应的 node。因为不会创建新的 fiber，所以我们在旧的 fiber 上设置 effectTag 为 DELETION。

```javascript
if (oldFiber && !sameType) {
  oldFiber.effectTag = "DELETION";
  deletions.push(oldFiber);
}
```

但是在提交阶段的时候，我们操作的 fiber tree 是 wipRoot，并不需要旧的 fiber。所以我们需要记住我们需要删除的节点（通过 deletions 数组来存放）。

```javascript
function render(element, container) {
wipRoot = {
dom: container,
props: {
children: [element],
},
alternate: currentRoot,
}
deletions = []
nextUnitOfWork = wipRoot
}

...

let deletions = null

...
```

接着，我们在提交阶段更新 DOM 时，只需要操作 deletions 数组中的 fiber 就可以了。

```javascript
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}
```

现在，就让我们在 commitWork 方法中根据 effectTag 来对 DOM 进行不同的操作。

如果 effectTag 是 PLACEMENT，就像之前一样，将节点直接添加到 DOM 上即可。

```javascript
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

如果 effectTag 是 DELETION，与 PLACEMENT 相反，我们将节点从 DOM 上移除。

```javascript
if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
  domParent.appendChild(fiber.dom);
} else if (fiber.effectTag === "DELETION") {
  domParent.removeChild(fiber.dom);
}
```

如果 effectTag 是 UPDATE，我们需要在已存在的 DOM 上更新改变了的属性 props。因为更新比较复杂，我们将具体的实现放在 updateDom 这个方法中。

```javascript
if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
  domParent.appendChild(fiber.dom);
} else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
  updateDom(fiber.dom, fiber.alternate.props, fiber.props);
} else if (fiber.effectTag === "DELETION") {
  domParent.removeChild(fiber.dom);
}

function updateDom(dom, prevProps, nextProps) {
  // TODO
}
```

在方法 updateDom 中，我们需要比较新旧 fiber 的属性 props，删除旧的，添加新的以及变更值发生改变的。

```javascript
const isProperty = (key) => key !== "children";
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
}
```

等等，还有一种特殊的属性我们没有处理，那就是监听事件，在 React 中合成事件有一个特点，就是以 on 开头，所以当我们在 props 中识别到监听事件时，我们需要对其特殊处理。

````javascript
const isEvent = key => key.startsWith("on")
const isProperty = key =>
key !== "children" && !isEvent(key)
如果监听事件发生了改变，我们需要将它从节点上移除。

```javascript
function updateDom(dom, prevProps, nextProps) {
//Remove old or changed event listeners
Object.keys(prevProps)
.filter(isEvent)
.filter(
key =>
!(key in nextProps) ||
isNew(prevProps, nextProps)(key)
)
.forEach(name => {
const eventType = name
.toLowerCase()
.substring(2)
dom.removeEventListener(
eventType,
prevProps[name]
)
})

    ...

}
````

然后我们新的监听事件添加到对应的节点上去。

```javascript
function updateDom(dom, prevProps, nextProps) {
//Remove old or changed event listeners
Object.keys(prevProps)
.filter(isEvent)
.filter(
key =>
!(key in nextProps) ||
isNew(prevProps, nextProps)(key)
)
.forEach(name => {
const eventType = name
.toLowerCase()
.substring(2)
dom.removeEventListener(
eventType,
prevProps[name]
)
})

    ...

    // Add event listeners

Object.keys(nextProps)
.filter(isEvent)
.filter(isNew(prevProps, nextProps))
.forEach(name => {
const eventType = name
.toLowerCase()
.substring(2)
dom.addEventListener(
eventType,
nextProps[name]
)
})

}
```

这样，我们就实现了更新和删除，让我们在 codesandbox 上看看加入了调和的 Didact 效果怎么样。

## 第七步：Function Components

接下来我们要做的就是让 Didact 支持函数组件。

首先，让我们换个 🌰，使用一个简单的函数组件，其返回一个 h1 元素。

```javascript
/\*_ @jsx Didact.createElement _/;
function App(props) {
  return <h1>Hi {props.name}</h1>;
}
const element = <App name="foo" />;
const container = document.getElementById("root");
Didact.render(element, container);
```

如果我们将以上的 JSX 转换为 JS，将会是下面这个样子：

```javascript
function App(props) {
  return Didact.createElement("h1", null, "Hi ", props.name);
}
const element = Didact.createElement(App, {
  name: "foo",
});
```

函数组件在两个方面有所不同：

函数组件的 fiber 没有与之对应的 DOM 节点。
子元素 children 来自运行的函数而不是直接从 props 里面获取。

```javascript
function performUnitOfWork(fiber) {
if (!fiber.dom) {
fiber.dom = createDom(fiber)
}

const elements = fiber.props.children
reconcileChildren(fiber, elements)

    ...

}
```

这样的话，我们需要对方法 performUnitOfWork 做出修改。

首先，我们检查 fiber 的 type 是否为 function，并以此为依据来判断是否采用不同的更新方法。

```javascript
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function updateFunctionComponent(fiber) {
  // TODO
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}
```

在 updateHostComponent 方法中使用原来的更新方式，而在 updateFunctionComponent 方法中，我们先执行这个函数去获取它的子元素。

```javascript
const element = Didact.createElement(App, {
  name: "foo",
});
```

在我们的 🌰 中，fiber.type 指的就是 App 这个函数，当我们运行它时，就能从返回值中获取子元素 h1。一旦我们获取到了子元素，就可以像之前一样来进行调和，不需要在这个方法中额外做其他事情。

```javascript
function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
```

既然现在我们会遇到没有 DOM 节点的 fiber，我们需要在 commitWork 这个方法中做出两点改变。

第一，沿着 parent 指针找到一个 DOM 节点的父节点，直到我们找到一个带有 DOM 节点的 fiber。

```javascript
function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;

  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

第二，当删除一个节点时，我们同样需要沿着 child 指针，找到一个带有 DOM 节点的 fiber。

```javascript
function commitWork(fiber) {

    ...

if (
fiber.effectTag === "PLACEMENT" &&
fiber.dom != null
) {
domParent.appendChild(fiber.dom)
} else if (
fiber.effectTag === "UPDATE" &&
fiber.dom != null
) {
updateDom(
fiber.dom,
fiber.alternate.props,
fiber.props
)
} else if (fiber.effectTag === "DELETION") {
commitDeletion(fiber, domParent)
}

...
}

function commitDeletion(fiber, domParent) {
if (fiber.dom) {
domParent.removeChild(fiber.dom)
} else {
commitDeletion(fiber.child, domParent)
}
}
```

## 第八步：Hooks

最后一步，既然我们已经有了函数组件，让我们也把 state 加进来吧。

```javascript
const Didact = {
createElement,
render,
useState,
}

/\*_ @jsx Didact.createElement _/
function Counter() {
const [state, setState] = Didact.useState(1)
return (

<h1 onClick={() => setState(c => c + 1)}>
Count: {state}
</h1>
)
}
const element = <Counter />
```

让我们以经典的计数器组件为例，每点击它一次，它的值就增加 1。

注意这里我们已经替换成了 Didact.useState 来获取并更新计数器的值。

在方法 updateFunctionComponent 中我们会调用 Counter 这个函数组件，并且在这个方法中我们还会调用 useState 方法。

```javascript
function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function useState(initial) {
  // TODO
}
```

在调用函数组件之前，我们需要先初始化几个全局变量，以便我们在 useState 方法中使用它们。

首先，我们设置 wipFiber（work in process fiber）。

同时，为了实现在同一个组件中能够调用 useState 方法多次，我们为 fiber 添加一个 hooks 数组。并且我们记录当前的 hook 索引。

```javascript
let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
```

当函数组件调用 useState 方法时，我们先检查其中是否存在旧的 hook。具体检查的方式是通过 fiber 的 alternate 属性来找到旧的 fiber，再通过 hookIndex 找到旧 fiber 上对应的 hook。

如果存在旧的 hook，我们直接从其中复制 state 到新的 hook 中。如果不存在，我们先初始化 state。

然后我们将新的 hook 添加到 fiber 的 hooks 数组中去，并让索引 hookIndex 增加 1。

最后返回 state。

```javascript
function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state];
}
```

useState 方法也应该返回一个用来更新 state 的方法，所以我们定义了 setState 方法来接受一个动作 action（比如在计数器组件中这个动作就是增加 1 的方法）。我们为 hook 新增一个队列 queue，并将 action 放入其中。

然后我们需要做的事情就跟之前我们在 render 方法中所做的类似，指定 nextUnitOfWork 为新的 wipRoot，这样 workLoop 方法就能够开启一次新的渲染阶段。

```javascript
function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
```

但我们还没有执行这个动作。

我们将会在下次渲染这个组件的时候再执行这个动作，我们会从旧的 hook 上的 queue 中获取所有的 action，并且一个一个地执行，这样做之后，我们返回的已经是更新过的 state。

```javascript
function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
```

就是这样，我们构建了自己的 React。
