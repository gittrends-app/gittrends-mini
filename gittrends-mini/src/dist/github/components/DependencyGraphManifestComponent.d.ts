import Component from "../Component";
import Fragment from "../Fragment";
declare type TOptions = {
    first?: number;
    after?: string;
};
export default class DependencyGraphManifestComponent extends Component {
    constructor(id: string, alias?: string);
    get fragments(): Fragment[];
    includeDetails(include?: boolean): this;
    includeDependencies(include: boolean | undefined, { after, first }: TOptions): this;
    toString(): string;
}
export {};
//# sourceMappingURL=DependencyGraphManifestComponent.d.ts.map