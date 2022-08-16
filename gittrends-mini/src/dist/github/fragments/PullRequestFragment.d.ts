import Fragment from "../Fragment";
import { IssueFragment } from "./IssueFragment";
export declare class PullRequestFragment extends IssueFragment {
    code: string;
    constructor(simplified?: boolean);
    get dependencies(): Fragment[];
    get objectName(): string;
    get additionalProperties(): string;
}
declare const _default: PullRequestFragment;
export default _default;
export declare const SimplifiedPullRequest: PullRequestFragment;
//# sourceMappingURL=PullRequestFragment.d.ts.map