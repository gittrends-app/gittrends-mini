import Fragment from "../Fragment";
export declare class Repository extends Fragment {
    code: string;
    full: boolean;
    get dependencies(): Fragment[];
    constructor(simplified?: boolean);
    toString(): string;
}
declare const _default: Repository;
export default _default;
export declare const SimplifiedRepositoryFragment: Repository;
//# sourceMappingURL=RepositoryFragment.d.ts.map