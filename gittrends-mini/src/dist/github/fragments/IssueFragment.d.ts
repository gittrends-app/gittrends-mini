import Fragment from "../Fragment";
export declare class IssueFragment extends Fragment {
    code: string;
    full: boolean;
    constructor(simplified?: boolean);
    get dependencies(): Fragment[];
    get objectName(): string;
    get additionalProperties(): string;
    toString(): string;
}
declare const _default: IssueFragment;
export default _default;
export declare const SimplifiedIssueFragment: IssueFragment;
//# sourceMappingURL=IssueFragment.d.ts.map