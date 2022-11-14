import { Entity } from '@gittrends/entities';

export {};

declare global {
  type Prototype<T> = { prototype: T };
  type EntityPrototype<T> = ({ prototype: T } | { new (...args: any[]): T }) & typeof Entity<T>;
}
