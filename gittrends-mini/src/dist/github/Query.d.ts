import Component from "./Component";
import Fragment from "./Fragment";
import HttpClient from "./HttpClient";
export default class Query {
    readonly components: Component[];
    readonly fragments: Fragment[];
    private readonly client;
    private constructor();
    static create(httpClient: HttpClient): Query;
    compose(...components: Component[]): Query;
    toString(): string;
    run(interceptor?: (args: string) => string): Promise<any>;
}
//# sourceMappingURL=Query.d.ts.map