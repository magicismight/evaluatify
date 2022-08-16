import { hasHash, getHash, deleteHash } from './object-hash-map';
import { register, unregister } from './registry';
import {
  EvaluableArgType,
  createValueScript,
  createCallbackScript
} from './script';

const DefaultEvaluableHost = '__SMEV__';
/* istanbul ignore next */
// eslint-disable-next-line @typescript-eslint/no-invalid-this
const DefaultEnv = window ?? global ?? this;

const DefaultOptions = {
  host: DefaultEvaluableHost
};

const SingleQuoteRegExp = /'/g;
/**
 * 防止传入的 host 为一些奇怪的字符串，比如说换行和会破坏可执行脚本的引号字符
 * @param host
 * @returns
 */
function evaluatifyHost(host: string): string {
  // 用 encodeURIComponent 可解决大部分问题，但单引号得单独处理， encodeURIComponent 不 encode ~!*()'
  return encodeURIComponent(host).replace(SingleQuoteRegExp, '%27');
}

// 判断传入的值是否为基础类型，如果是基础类型可以在可执行脚本中直接表示
function getPrimitiveValue(value: unknown): string | undefined {
  const type = typeof value;

  // string 不能直接返回，需要用 JSON.stringify 的结果，
  // 如果传入的 value === 'test'，这样直接输入为可执行脚本就成了 test，
  // 这明显是不符合预期的
  if (type === 'string') {
    return JSON.stringify(value);
  }

  // bigint 需要在后面补充 n
  if (type === 'bigint') {
    return `${value}n`;
  }

  if (
    type === 'number' ||
    type === 'boolean' ||
    value === undefined ||
    value === null
  ) {
    return String(value);
  }
}

/**
 * 传入任何一个值，返回可用作访问该值的可执行脚本。
 *
 * @param value
 * @param options
 * @returns
 */
export function evaluatifyValue(
  value: unknown,
  options: {
    host?: string; // 注入到全局变量中的宿主名称
  } = DefaultOptions
): string {
  const primitiveValue = getPrimitiveValue(value);

  if (typeof primitiveValue === 'string') {
    return primitiveValue;
  }

  const host = evaluatifyHost(options.host ?? DefaultEvaluableHost);

  const hash = getHash(value);
  register(hash, value, {
    env: DefaultEnv,
    host
  });

  return createValueScript({
    hash,
    host
  });
}

/**
 * 传入一个需要序列化传递给其他环境的回调，
 * 返回该回调的可执行脚本，
 * 在其他环境中可通过类似 evaluateJavaScript 的方法执行这个 js 回调，
 * 如果传入了 args 参数列表，回调对应的参数位置会被对应的占位符替代，执行脚本时需要替换为实际传入的参数，传入的参数可为其他 evaluatify 的结果。
 *
 * @param callback
 * @param args
 * @param options
 * @returns
 */
export function evaluatifyCallback(
  callback: (...args: any[]) => any,
  args?: EvaluableArgType[],
  options: {
    host?: string; // 注入到全局变量中的宿主名称
  } = DefaultOptions
): string {
  const host = evaluatifyHost(options.host ?? DefaultEvaluableHost);

  const hash = getHash(callback);
  register(hash, callback, {
    env: DefaultEnv,
    host
  });

  return createCallbackScript({
    hash,
    args,
    host
  });
}

/**
 * 释放通过与传入 value 关联
 * @param value
 * @param options
 */
export function dealloc(
  value: unknown,
  options: {
    host: string; // 注入到全局变量中的宿主名称
  } = DefaultOptions
): void {
  const host = evaluatifyHost(options.host);
  // getHash 在没有 hash 的情况下会自动生成 hash，这里肯定是不希望这样的，所以先用 hasHash 判断一下
  const hash = hasHash(value) ? getHash(value) : undefined;

  if (hash) {
    deleteHash(value);
    unregister(hash, {
      env: DefaultEnv,
      host
    });
  }
}
