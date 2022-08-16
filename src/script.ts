/**
 * 可供 native 端调用传给 js callback 的类型枚举
 */
export enum EvaluableArgType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Object = 'object',
  Evaluable = 'evaluable'
}

function createValueGetterScript(params: {
  hash: string;
  host: string;
}): string {
  const { hash, host } = params;

  // this['__SMEV__']['_CB_L1EOTEIJ_']
  return `this['${host}']['${hash}']`;
}

/**
 * 生成能够通过 hash 访问到对应 value 的可执行脚本，
 * 脚本末尾不能以分号 ; 结尾，因为生成的可执行脚本需要作为参数传递
 *
 * @param params
 * @returns
 */
export function createValueScript(params: {
  hash: string;
  host: string;
}): string {
  // this['__SMEV__']['_CB_L1EOTEIJ_']
  return `${createValueGetterScript(params)}`;
}

function getArgFormatPlaceholder(type: EvaluableArgType): string {
  switch (type) {
    case EvaluableArgType.String:
      return "'%s'";
    case EvaluableArgType.Number:
      return '%f';
    case EvaluableArgType.Boolean:
      return '%b';
    case EvaluableArgType.Object:
      return '%s';
    case EvaluableArgType.Evaluable:
      return '%s';
  }
}

/**
 * 生成能够通过 hash 访问到对应回调函数并对其进行调用的可执行脚本，
 * 脚本末尾不能以分号 ; 结尾，因为生成的可执行脚本需要作为参数传递
 *
 * @param params
 * @returns
 */
export function createCallbackScript(params: {
  hash: string;
  args?: EvaluableArgType[];
  host: string;
}): string {
  const { hash, host, args = [] } = params;

  // this.__SMEV__['_CB_L1EOTEIJ_']("%s")
  return `${createValueGetterScript({ hash, host })}(${args
    .map(getArgFormatPlaceholder)
    .join(', ')})`;
}
