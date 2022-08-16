// 取模块执行时的时间戳作为锚点，后续的 hash 基于该锚点时间戳生成
let anchor = (Date.now() % 1000) * Math.random();

/**
 * 生成一个全局唯一的 hash
 *
 * @returns
 */
export function generateHash(): string {
  anchor += Math.random() * 1000;
  return anchor
    .toString(36)
    .toUpperCase()
    .replace(/(\w+)\.(\w+)/, '$2$1');
}
