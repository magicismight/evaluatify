/**
 * 获取可以用作 value 赋值的 hash map record
 *
 * @param env
 * @param key
 * @returns
 */
function getEvaluableValueRecord(env: { [key: string]: any }, key: string): Record<string, unknown> {
  let record = env[key];

  if (!record) {
    record = {};
    Object.defineProperty(env, key, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: record
    });
  }

  return record;
}

/**
 * 将 value 赋值到 env['host']['hash'] 上
 *
 * @param hash
 * @param value
 * @param options
 */
export function register(
  hash: string,
  value: unknown,
  options: {
    env: { [key: string]: any };
    host: string; // 注入到全局变量中的宿主名称
  }
): void {
  const { host, env } = options;
  const evaluableValueRecord = getEvaluableValueRecord(env, host);

  Object.defineProperty(evaluableValueRecord, hash, {
    configurable: true,
    enumerable: false,
    get() {
      return value;
    }
  });
}

/**
 * register 反操作，需要释放 value 在全局变量上的引用时调用
 *
 * @param hash
 * @param options
 */
export function unregister(
  hash: string,
  options: {
    env: { [key: string]: any };
    host: string; // 注入到全局变量中的宿主名称
  }
): void {
  const { host, env } = options;
  const evaluableValueMap = getEvaluableValueRecord(env, host);
  delete evaluableValueMap[hash];
}
