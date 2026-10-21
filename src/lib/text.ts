/**
 * 全站统一按 Unicode code point 计数，而不是 JavaScript 的 UTF-16 code unit。
 * 这样中文、英文和 emoji 在 Web、Worker、Android 中的计数规则一致。
 */
export function countCharacters(value: string): number {
  return Array.from(value).length;
}
