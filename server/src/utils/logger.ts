export function log(tag: string, ...args: unknown[]): void {
  console.log(`[${tag}]`, ...args);
}

export function warn(tag: string, ...args: unknown[]): void {
  console.warn(`[${tag}]`, ...args);
}

export function error(tag: string, ...args: unknown[]): void {
  console.error(`[${tag}]`, ...args);
}
