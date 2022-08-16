import Component from "../Component";
import Fragment from "../Fragment";
declare type Query = {
    minStargazers?: number;
    maxStargazers?: number;
    language?: string;
    name?: string;
    sort?: "stars" | "created" | "updated" | undefined;
    order?: "asc" | "desc" | undefined;
};
export default class SearchComponent extends Component {
    constructor(query?: Query, after?: string, first?: number);
    get fragments(): Fragment[];
    toString(): string;
}
export {};
//# sourceMappingURL=SearchComponent.d.ts.map