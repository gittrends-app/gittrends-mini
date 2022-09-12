/*
 *  Author: Hudson S. Borges
 */
import axios, { AxiosError, AxiosInstance } from 'axios';
import retry from 'axios-retry';
import * as AxiosLogger from 'axios-logger';

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

  constructor(opts: HttpClientOpts | string) {
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
      },
      timeout: this.timeout,
      validateStatus: (status) => Math.floor(status / 100) === 2,
    });
    this.client.interceptors.request.use(AxiosLogger.requestLogger);
    this.client.interceptors.response.use((response) => {
      // write down your request intercept.
      return AxiosLogger.responseLogger(response, {
        data: false
      });
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
      .then(({ status, statusText, data, headers }) => ({
        status,
        statusText,
        data,
        headers,
      }))
      .catch((error: AxiosError) => {
        const { status, statusText, data, headers } = error.response || {};
        return Promise.reject(Object.assign(new Error(), { status, statusText, data, headers }));
      });
  }
}
