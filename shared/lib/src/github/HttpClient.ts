/*
 *  Author: Hudson S. Borges
 */
import axios, { AxiosError, AxiosInstance } from 'axios';
import retry from 'axios-retry';

import { RequestError } from '../helpers/errors';

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
  headers: Record<string, string | string[]>;
};

export default class HttpClient {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retries: number;
  readonly client: AxiosInstance;

  constructor(private opts: HttpClientOpts | string) {
    if (typeof opts === 'string') {
      opts = {
        host: 'api.github.com',
        protocol: 'https',
        authToken: opts,
      };
    }

    this.timeout = opts.timeout || 15000;
    this.retries = opts.retries || 0;
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
    });

    retry(this.client, {
      retries: this.retries,
      retryCondition: ({ response }) => !/^[3-5]\d{2}$/.test(`${response?.status}` || ''),
      retryDelay: retry.exponentialDelay,
      shouldResetTimeout: true,
    });
  }

  async request(data: string | Record<string, unknown>): Promise<HttpClientResponse> {
    return this.client
      .post('/graphql', data)
      .then((response) => {
        const { status, statusText, data, headers } = response;
        return { status, statusText, data, headers };
      })
      .catch((err: AxiosError) =>
        Promise.reject(
          RequestError.create(err.message, err, { status: err.response?.status, data: err.response?.data }),
        ),
      );
  }

  toJSON(): HttpClientOpts | string {
    return this.opts;
  }
}
