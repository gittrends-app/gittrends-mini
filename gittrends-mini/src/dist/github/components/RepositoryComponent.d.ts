import Component from "../Component";
import Fragment from "../Fragment";
declare type TIncludeOpts = {
    first: number;
    after?: string;
    alias?: string;
};
export default class RepositoryComponent extends Component {
    constructor(id: string);
    get fragments(): Fragment[];
    includeDetails(include?: boolean): this;
    includeLanguages(include: boolean | undefined, { first, after, alias }: TIncludeOpts): this;
    includeTopics(include: boolean | undefined, { first, after, alias }: TIncludeOpts): this;
    includeReleases(include: boolean | undefined, { first, after, alias }: TIncludeOpts): this;
    includeTags(include: boolean | undefined, { first, after, alias }: TIncludeOpts): this;
    includeStargazers(include: boolean | undefined, { first, after, alias }: TIncludeOpts): this;
    includeWatchers(include: boolean | undefined, { first, after, alias }: TIncludeOpts): this;
    includeDependencyManifests(include: boolean | undefined, { first, after, alias }: TIncludeOpts): this;
    includeIssues(include: boolean | undefined, { after, first, alias }: TIncludeOpts): this;
    includePullRequests(include: boolean | undefined, { after, first, alias }: TIncludeOpts): this;
    toString(): string;
}
export {};
//# sourceMappingURL=RepositoryComponent.d.ts.map