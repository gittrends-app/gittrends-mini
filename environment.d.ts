/*
 *  Author: Hudson S. Borges
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT?: string;
    }
  }

  type TObject = Record<string, unknown>;
}

// If this file has no import/export statements (i.e. is a script)
export {};
