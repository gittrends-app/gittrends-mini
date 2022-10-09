export {};

declare global {
  type Constructor<T> = { new (...args: any): T };
}
