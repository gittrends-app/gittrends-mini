/*
 *  Author: Hudson S. Borges
 */
import { compact, isNil, uniq } from 'lodash';

import { ExtendeableError } from '@gittrends/helpers';

import { Component } from './Component';
import { HttpClientResponse } from './HttpClient';

export type RequestErrorOptions = {
  components?: Component | Component[];
  status?: number;
  data?: any;
};

export class RequestError extends ExtendeableError {
  readonly response?: { message: string; status?: number; data?: any };
  readonly components?: any[];

  static create(message: string, cause: Error, opts?: RequestErrorOptions): RequestError;
  static create(message: string, cause: Error & HttpClientResponse, opts?: RequestErrorOptions): RequestError {
    const status = `${cause.status || opts?.status}`;
    if (status) {
      if (/[24]\d{2}/.test(status)) return new GithubRequestError(message, cause, opts);
      else return new ServerRequestError(message, cause, opts);
    } else {
      return new RequestError(message, cause, opts);
    }
  }

  constructor(message: string, cause: Error, opts?: RequestErrorOptions);
  constructor(message: string, cause: Error & HttpClientResponse, opts?: RequestErrorOptions) {
    super(message, cause);
    this.response = { message: cause.message, status: cause.status || opts?.status, data: cause.data || opts?.data };
    if (opts?.components) {
      const componentArray = Array.isArray(opts?.components) ? opts?.components : [opts?.components];
      this.components = componentArray.map((component) => component.toJSON());
    }
  }
}

export class ServerRequestError extends RequestError {
  readonly type: 'BAD_GATEWAY' | 'INTERNAL_SERVER' | 'UNKNOWN';

  constructor(message: string, cause: Error, opts?: RequestErrorOptions);
  constructor(message: string, cause: Error & HttpClientResponse, opts?: RequestErrorOptions) {
    super(message, cause, opts);
    if (this.response?.status == 500) this.type = 'INTERNAL_SERVER';
    else if (this.response?.status == 502) this.type = 'BAD_GATEWAY';
    else this.type = 'UNKNOWN';
  }
}

type GithubRequestErrorType =
  | 'BLOQUED'
  | 'FORBIDDEN'
  | 'INTERNAL'
  | 'MAX_NODE_LIMIT_EXCEEDED'
  | 'NOT_FOUND'
  | 'NOT_MODIFIED'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEDOUT'
  | 'LOADING'
  | 'SOMETHING_WENT_WRONG'
  | 'UNKNOWN';

export class GithubRequestError extends RequestError {
  readonly type: GithubRequestErrorType[] = [];

  constructor(message: string, cause: Error, opts?: RequestErrorOptions);
  constructor(message: string, cause: Error & HttpClientResponse, opts?: RequestErrorOptions) {
    super(message, cause, opts);

    if (this.response?.data?.errors) {
      this.type = (
        this.response.data.errors as (unknown & {
          type?: string;
          message?: string;
        })[]
      ).map((value) => {
        if (value.type === 'FORBIDDEN') return 'FORBIDDEN';
        else if (value.type === 'INTERNAL') return 'INTERNAL';
        else if (value.type === 'NOT_FOUND') return 'NOT_FOUND';
        else if (value.type === 'MAX_NODE_LIMIT_EXCEEDED') return 'MAX_NODE_LIMIT_EXCEEDED';
        else if (value.type === 'SERVICE_UNAVAILABLE') return 'SERVICE_UNAVAILABLE';
        else if (value.message === 'timedout') return 'TIMEDOUT';
        else if (value.message === 'loading') return 'LOADING';
        else if (/^something.went.wrong.*/i.test(value.message as string)) return 'SOMETHING_WENT_WRONG';
        return 'UNKNOWN';
      });
    }
  }

  public is(type: GithubRequestErrorType): boolean {
    return this.type.length === 1 && this.type[0] === type;
  }

  public all(type: GithubRequestErrorType): boolean {
    const uniqTypes = compact(uniq(this.type));
    return uniqTypes.length === 1 && uniqTypes[0] === type;
  }

  public some(type: GithubRequestErrorType): boolean {
    return !isNil(this.type?.find((t) => t === type));
  }
}
