import { AxiosInstance } from "axios";
export declare type HttpClientOpts = {
    protocol: string;
    host: string;
    port?: number;
    timeout?: number;
    retries?: number;
    userAgent?: string;
    authToken?: string;
};
export declare type HttpClientResponse = {
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
    constructor(opts: HttpClientOpts);
    request(data: string | Record<string, unknown>): Promise<HttpClientResponse>;
}
//# sourceMappingURL=HttpClient.d.ts.map