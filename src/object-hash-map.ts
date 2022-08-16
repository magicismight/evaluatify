import { generateHash } from './hash';

const valueMap = new Map<unknown, string>();

/**
 * 判断传入 hash 是否在 map 中
 * @param value
 * @returns
 */
export function hasHash(value: unknown): boolean {
  return valueMap.has(value);
}

/**
 * 通过传入的 value 查询对应的 hash，
 * 如果该对象没有进行的 hash 会新生成一个 hash 分配给该对象
 *
 * @param value
 * @returns
 */
export function getHash(value: unknown): string {
  const hash = valueMap.get(value);
  if (hash) {
    return hash;
  } else {
    const hash = generateHash();
    valueMap.set(value, hash);
    return hash;
  }
}

/**
 * 删除传入 hash 的引用
 *
 * @param object
 */
export function deleteHash(object: unknown): void {
  valueMap.delete(object);
}
