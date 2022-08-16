/* eslint-disable no-eval */
import { evaluatifyCallback, evaluatifyValue, dealloc } from './evaluatify';
import { EvaluableArgType } from './script';

describe('evaluatify', () => {
  // 用 eval 进行合法性测试
  it('should get any value', () => {
    const evaluatify = (value: any): any => window.eval(evaluatifyValue(value));

    const string = 'test';
    expect(evaluatify(string)).toBe(string);

    const number = 3.1415;
    expect(evaluatify(number)).toBe(number);

    const boolean = true;
    expect(evaluatify(boolean)).toBe(boolean);

    const object = {};
    expect(evaluatify(object)).toBe(object);

    const callback = jest.fn();
    expect(evaluatify(callback)).toBe(callback);
  });

  it('should primitive values as it is', () => {
    const stringScript = evaluatifyValue('value');
    expect(window.eval(stringScript)).toBe('value');
    expect(stringScript).toBe('"value"');

    const numberScript = evaluatifyValue(3.14);
    expect(window.eval(numberScript)).toBe(3.14);
    expect(numberScript).toBe('3.14');

    // eslint-disable-next-line
    // @ts-ignore
    const bigint = 11111111111111111111111111n;
    const bigIntScript = evaluatifyValue(bigint);
    expect(window.eval(bigIntScript)).toBe(bigint);
    expect(bigIntScript).toBe(`${bigint}n`);

    const NaNScript = evaluatifyValue(NaN);
    expect(window.eval(NaNScript)).toBeNaN();
    expect(NaNScript).toBe('NaN');

    const infinityScript = evaluatifyValue(Infinity);
    expect(isFinite(window.eval(infinityScript))).toBeFalsy();
    expect(infinityScript).toBe('Infinity');

    const booleanScript = evaluatifyValue(true);
    expect(window.eval(booleanScript)).toBe(true);
    expect(booleanScript).toBe('true');

    const undefinedScript = evaluatifyValue(undefined);
    expect(window.eval(undefinedScript)).toBeUndefined();
    expect(undefinedScript).toBe('undefined');

    const nullScript = evaluatifyValue(null);
    expect(window.eval(nullScript)).toBeNull();
    expect(nullScript).toBe('null');

    const object = {};
    const objectScript = evaluatifyValue(object);
    expect(window.eval(objectScript)).toBe(object);

    const promise = new Promise(() => {});
    const unserializableScript = evaluatifyValue(promise);
    expect(window.eval(unserializableScript)).toBe(promise);
  });

  it('should handle special strings', () => {
    const string = '\n\'"`';
    expect(window.eval(evaluatifyValue(string))).toBe(string);
  });

  it('should call callback', () => {
    const callback = jest.fn();
    window.eval(evaluatifyCallback(callback));
    expect(callback).toBeCalledTimes(1);
  });

  it("should get callback's return", () => {
    const result = {};
    const callback = jest.fn(() => result);
    expect(window.eval(evaluatifyCallback(callback))).toBe(result);
  });

  it('can be called with args', () => {
    const callback = jest.fn();

    const string = 'string';
    const number = 3.14;
    const bool = true;
    const object = { test: true };

    window.eval(
      evaluatifyCallback(callback, [
        EvaluableArgType.String,
        EvaluableArgType.Number,
        EvaluableArgType.Boolean,
        EvaluableArgType.Object
      ])
        .replace('%s', string)
        .replace('%f', String(number))
        .replace('%b', String(bool))
        .replace('%s', JSON.stringify(object))
    );

    expect(callback).toBeCalledWith(string, number, bool, object);
  });

  it('should work with nested cases', () => {
    const callback = jest.fn();

    const valueArg = { value: true };
    const value = evaluatifyValue(valueArg);

    const callbackArgReturn = { callback: true };
    const callbackArg = jest.fn(() => callbackArgReturn);

    const script = evaluatifyCallback(callback, [
      EvaluableArgType.Object,
      EvaluableArgType.Evaluable
    ]);
    // 模拟 native 传参的方式，Evaluable 需要传入 js evaluatify 后的可执行脚本
    window.eval(
      script.replace('%s', value).replace('%s', evaluatifyCallback(callbackArg))
    );

    expect(callback).toBeCalledWith(valueArg, callbackArgReturn);
  });

  it('should dealloc', () => {
    const result = {};
    const callback = jest.fn(() => result);
    const script = evaluatifyCallback(callback);
    dealloc(callback);
    expect(() => window.eval(script)).toThrowError();

    // dealloc 可以传入一个没有经过 evaluatify 的对象，不会报错什么都不会发生
    dealloc({});
  });

  it('should should any string as host name', () => {
    const wiredHostName = '任意字符串\\/~!@#$.';
    const breakHostName = '__\n__';
    const quoteHoseName = `'"\``;

    for (const host of [wiredHostName, breakHostName, quoteHoseName]) {
      const object = {};
      expect(
        window.eval(
          evaluatifyValue(object, {
            host
          })
        )
      ).toBe(object);

      const callback = jest.fn();
      window.eval(
        evaluatifyCallback(callback, [], {
          host
        })
      );
      expect(callback).toBeCalled();
    }
  });
});
