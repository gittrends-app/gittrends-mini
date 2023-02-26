export interface CacheAPI {
  add(key: string, value: string | Buffer, expires?: string | number): Promise<void>;
  get(key: string): Promise<string | Buffer | undefined>;
  delete(key: string): Promise<boolean>;
}

export interface CacheServiceAPI extends CacheAPI {
  close(): Promise<void>;
}
