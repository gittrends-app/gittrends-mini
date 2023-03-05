/*
 *  Author: Hudson S. Borges
 */
import axios, { AxiosError, AxiosInstance } from 'axios';
import * as rax from 'retry-axios';

import { debug } from '@gittrends/helpers';

import { RequestError } from './RequestError';

export type HttpClientOpts = {
  protocol: string;
  host: string;
  port?: number;
  timeout?: number;
  retries?: number;
  userAgent?: string;
  authToken?: string;
};

export type HttpClientResponse = {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string | string[] | undefined>;
};

const logger = debug('http-client');

export class HttpClient {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retries: number;
  readonly client: AxiosInstance;

  private requestsCount = 0;

  constructor(private opts: HttpClientOpts | string) {
    if (typeof opts === 'string') {
      opts = {
        host: 'api.github.com',
        protocol: 'https',
        authToken: opts,
        timeout: 15000,
        retries: 5,
      };
    }

    this.timeout = opts.timeout ?? 15000;
    this.retries = opts.retries ?? 5;
    this.baseUrl = new URL(`${opts.protocol}://${opts.host}:${opts.port || ''}`).toString();

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'user-agent': opts.userAgent || '[GitTrends.app] My awesome app',
        Authorization: 'bearer ' + opts.authToken || '',
        Accept: [
          'application/vnd.github.hawkgirl-preview+json', // Dependency graph preview
          'application/vnd.github.starfox-preview+json', // Project event details preview
          'application/vnd.github.merge-info-preview+json', // Merge info preview
        ].join(', '),
      },
      timeout: this.timeout,
      validateStatus: (status) => Math.floor(status / 100) === 2,
      raxConfig: {
        retry: this.retries,
        retryDelay: 100,
        httpMethodsToRetry: ['GET', 'POST'],
        shouldRetry(err) {
          return !/^[3-5]\d{2}$/.test(`${err.response?.status}` || '');
        },
      },
    });

    rax.attach(this.client);
  }

  async request(data: string | Record<string, unknown>): Promise<HttpClientResponse> {
    const requestId = this.requestsCount++;
    logger(`request #${requestId}: requesting data (size: ${JSON.stringify(data).length}) ...`);

    return this.client
      .post('/graphql', data)
      .then(({ status, statusText, data, headers }) => {
        logger(`request #${requestId}: response received (status: ${status}, size: ${JSON.stringify(data).length})`);
        return { status, statusText, data, headers };
      })
      .catch((err: AxiosError) => {
        logger(`request #${requestId}: request error: ${err.message}`);
        return Promise.reject(RequestError.create(err, { status: err.response?.status, data: err.response?.data }));
      });
  }

  toJSON(): HttpClientOpts | string {
    return this.opts;
  }
}
