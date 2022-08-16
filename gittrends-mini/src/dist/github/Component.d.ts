import Fragment from "./Fragment";
declare type TIncludes = Record<string, ({
    textFragment?: string;
    first?: number;
    after?: string;
} & Record<string, any>) | false>;
export default abstract class Component {
    readonly includes: TIncludes;
    readonly id?: string | null;
    alias: string;
    protected constructor(id: string | null | undefined, alias: string);
    protected argsToString(args: Record<string, unknown>): string;
    abstract get fragments(): Fragment[];
    abstract toString(): string;
    toJSON(): {
        component: string;
        id?: string | null;
    } & Record<string, any>;
    setAlias(alias: string): this;
}
export {};
//# sourceMappingURL=Component.d.ts.map