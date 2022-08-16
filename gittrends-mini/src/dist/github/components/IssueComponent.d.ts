import Component from "../Component";
import Fragment from "../Fragment";
declare type TOptions = {
    first: number;
    after?: string;
    alias?: string;
};
export default class IssueComponent extends Component {
    protected componentName: string;
    protected extraTimelineEvents: string;
    constructor(id: string, alias?: string);
    get fragments(): Fragment[];
    includeDetails(include?: boolean): this;
    includeAssignees(include: boolean | undefined, { first, after, alias }: TOptions): this;
    includeLabels(include: boolean | undefined, { first, after, alias }: TOptions): this;
    includeParticipants(include: boolean | undefined, { first, after, alias }: TOptions): this;
    includeTimeline(include: boolean | undefined, { first, after, alias }: TOptions): this;
    toString(): string;
}
export {};
//# sourceMappingURL=IssueComponent.d.ts.map