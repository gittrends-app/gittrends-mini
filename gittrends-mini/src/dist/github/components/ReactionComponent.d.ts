import Component from "../Component";
import Fragment from "../Fragment";
export default class ReactionComponent extends Component {
    constructor(id: string, alias?: string);
    get fragments(): Fragment[];
    includeReactions(include: boolean | undefined, { first, after }: {
        first: number;
        after?: string;
    }): this;
    toString(): string;
}
//# sourceMappingURL=ReactionComponent.d.ts.map