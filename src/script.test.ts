import { createValueScript, createCallbackScript, EvaluableArgType } from './script';

describe('@cougar-eval/script', () => {
  it('should create value getter script', () => {
    const host = '__SMEV__';
    const hash = '_CB_L1EOTEIJ_';

    expect(
      createValueScript({
        host,
        hash
      })
    ).toBe(`this['${host}']['${hash}']`);
  });

  it('should create callback script', () => {
    const host = '__SMEV__';
    const hash = '_CB_L1EOTEIJ_';

    expect(
      createCallbackScript({
        host,
        hash
      })
    ).toBe(`this['${host}']['${hash}']()`);
  });

  it('should create callback with args placeholders', () => {
    const host = '__SMEV__';
    const hash = '_CB_L1EOTEIJ_';

    expect(
      createCallbackScript({
        host,
        hash,
        args: [
          EvaluableArgType.String,
          EvaluableArgType.Number,
          EvaluableArgType.Boolean,
          EvaluableArgType.Object,
          EvaluableArgType.Evaluable
        ]
      })
    ).toBe(`this['${host}']['${hash}']('%s', %f, %b, %s, %s)`);
  });
});
