import Fragment from "../Fragment";
import IssueComponent from "./IssueComponent";
export default class PullRequestComponent extends IssueComponent {
    constructor(id: string, alias?: string);
    get fragments(): Fragment[];
    includeDetails(include: boolean): this;
}
//# sourceMappingURL=PullRequestComponent.d.ts.map