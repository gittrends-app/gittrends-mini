/*
 *  Author: Hudson S. Borges
 */
export abstract class ExtendeableError extends Error {
  public readonly cause?: Error;

  constructor(message?: string, cause?: Error) {
    super(message || cause?.message);
    this.name = this.constructor.name;
    if (cause) {
      this.cause = cause;
      if (cause.stack) this.stack += `\nFrom previous: ${cause.stack.replace(/\n/g, '\n\t\t')}`;
    }
  }
}
