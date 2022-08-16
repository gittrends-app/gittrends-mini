export default abstract class Fragment {
    protected static include(full: boolean, field: string): string;
    get dependencies(): Fragment[];
    abstract get code(): string;
    abstract toString(): string;
}
//# sourceMappingURL=Fragment.d.ts.map