import ReposityComponent from "./github/components/RepositoryComponent";
import HttpClient from "./github/HttpClient";
export declare class QueryFunction {
    client: HttpClient;
    component: ReposityComponent;
    constructor(tokenAuth: string, repositoryId: string, after?: string);
    runQuery(): Promise<any>;
}
//# sourceMappingURL=QueryFunction.d.ts.map