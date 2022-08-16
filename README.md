# evaluatify
在 JavaScript 与 WebView 双向调用的场景中，双方通过 native bridge 交换的数据都局限于可序列化的数据，JS 环境中许多无法序列化的数据无法通过 native bridge 导致 JavaScript 和 WebView 双向调用场景受限。

evaluatify 可以将 JavaScript 环境中的任意对象存在一个临时的全局变量中，并生成一个可执行脚本供 native 调用。

## evaluatifyCallback

JS 根据传入的 callback 生成可执行脚本。

```ts
import { evaluatifyCallback } from 'evaluatify';

// evaluatifyCallback 传入任意一个 js callback，
// 返回一个可执行脚本 script,
// 将这个 script 通过 native bridge 传给 native 端，实现 callback 序列化
const script = evaluatifyCallback(function callback() {
  // anything this callback do.
});

window._NATIVE_INTERFACE_.getInitialState(script)
```

native 在收到 callback script 后可在对应的回调时机中使用 evaluateJavascript 调用。

```java
webView.evaluateJavascript(script);
```

## evaluatifyCallback 带参数

如果 native 需要在调用 JS callback 时需要传参需要怎么做呢？

JS 根据传入的 callback 生成可执行脚本，并指定该 callback 的参数列表。

```ts
import { evaluatifyCallback, EvaluableArgType } from 'evaluatify';

// 第二个参数需要定义参数列表,
// 参数列表为一个数组，数组内依次传入各参数对应的 EvaluableArgType
const script = evaluatifyCallback(function callback(id: string, data: { type: string; name: string; }) {
  // anything this callback do.
}, [EvaluableArgType.String, EvaluableArgType.Object]);

window._NATIVE_INTERFACE_.getInitialState(script)
```

native 在收到 callback script 后先使用 string format 填充对应的参数，然后使用 evaluateJavascript 调用，实现回调传参数。

```java
// 需要根据参数列表对传入的 script 字符串进行格式化，实现参数填充。
String evaluateJavascript = String.format(script, "xxx-yyy-123", JSON.toString(object));

// 执行脚本实现回调。
webView.evaluateJavascript(evaluateJavascript);
```

## EvaluableArgType

可供 evaluatifyCallback 使用的参数类型

### EvaluableArgType.String
字符串

```ts
evaluatifyCallback(function (value: string) {
  // typeof value == 'string';
}, [EvaluableArgType.String])
```

format placeholder: %s

### EvaluableArgType.Number
数字

```ts
evaluatifyCallback(function (value: number) {
  // typeof value == 'number';
}, [EvaluableArgType.Number])
```

format placeholder: %f

### EvaluableArgType.Boolean
布尔

```ts
evaluatifyCallback(function (value: boolean) {
  // typeof value == 'boolean';
}, [EvaluableArgType.Boolean])
```

format placeholder: %b

### EvaluableArgType.Evaluable
evaluatifyCallback 或者 evaluatifyValue 生成的可执行字符串，用于 evaluatifyCallback 参数嵌套。

```ts
evaluatifyCallback(function (value: string) {
  // typeof value == 'string';
  // window.eval(value);
}, [EvaluableArgType.Evaluable])
```

format placeholder: %s

### EvaluableArgType.Object
可序列化的对象

```ts
evaluatifyCallback(function (value: object) {
  // typeof value === 'object'
}, [EvaluableArgType.Object])
```

format placeholder: %s

## evaluatifyValue
将任意的 JS 值转成可执行脚本，主要作为 evaluatifyCallback 的 EvaluableArgType.Evaluable 类型传参。

## dealloc
由于 evaluatify 底层原理是将需要转为可执行脚本的值临时挂在全局变量上，所以在使用完成后需要手动从全局变量上释放对应值的引用，防止内存泄露。

# Q&A

## 使用限制
主流 webview 平台甚至 nodejs 的 native bridge 都可以使用 evaluatify 进行复杂场景的数据交换。

但 evaluatifyCallback 参数列表需要固定，类型和参数数量不能随意变动。


