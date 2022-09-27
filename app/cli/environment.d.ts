export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'test' | 'development' | 'production';
      CLI_REDIS_HOST?: string;
      CLI_REDIS_PORT?: number;
      CLI_REDIS_DB?: number;
      CLI_ACCESS_TOKEN?: string;
      CLI_API_URL?: string;
    }
  }
}
