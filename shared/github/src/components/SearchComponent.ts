/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Component } from '../Component';
import Fragment from '../Fragment';
import RepositoryFragment, { Repository, SimplifiedRepositoryFragment } from '../fragments/RepositoryFragment';

export type SearchComponentQuery = {
  minStargazers?: number;
  maxStargazers?: number;
  language?: string;
  sort?: 'stars' | 'created' | 'updated' | undefined;
  order?: 'asc' | 'desc' | undefined;
  repo?: string;
};

export class SearchComponent extends Component {
  private readonly Fragment: Repository;

  constructor(query?: SearchComponentQuery, opts?: { after?: string; first?: number; full?: boolean }) {
    super(null, 'search');
    this.Fragment = opts?.full ? RepositoryFragment : SimplifiedRepositoryFragment;
    this.includes.search = {
      textFragment: '',
      first: opts?.first,
      after: opts?.after,
      query: query ?? {},
    };
  }

  get fragments(): Fragment[] {
    return [this.Fragment];
  }

  toString(): string {
    const searchQuery = get(this.includes, 'search.query', {}) as SearchComponentQuery;

    let query = searchQuery.repo ? `repo:${searchQuery.repo}` : '';

    query += ` stars:${searchQuery.minStargazers ?? 0}..${searchQuery.maxStargazers ?? '*'}`;

    if (searchQuery.sort) query += ` sort:${searchQuery.sort}${searchQuery.order ? `-${searchQuery.order}` : ''}`;

    query += ' sort:stars-desc sort:forks-desc';

    if (searchQuery.language) query += ` language:${searchQuery.language}`;

    const args = super.argsToString({
      first: get(this.includes, 'search.first', 100),
      after: get(this.includes, 'search.after'),
      query,
    });

    return `
      ${this.alias}:search(${args}, type: REPOSITORY) {
        pageInfo { hasNextPage endCursor }
        nodes { ...${this.Fragment.code} }
      }
    `;
  }
}
