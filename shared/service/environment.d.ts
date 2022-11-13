import { Entity } from '@gittrends/entities';

export {};

declare global {
  type Constructor<T> = { new (...args: any): T };
  type EntityConstructor<T> = { new (...args: any): T } & typeof Entity;
  type Prototype<T> = { prototype: T };
}
