/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Actor } from './Actor';
import { IssueOrPull } from './Issue';

export class PullRequest extends IssueOrPull {
  type!: 'PullRequest';
  additions!: number;
  base_ref?: { name?: string; target?: string };
  base_ref_name!: string;
  base_ref_oid!: string;
  base_repository?: string;
  can_be_rebased!: boolean;
  changed_files!: number;
  closing_issues_references!: number;
  commits!: number;
  deletions!: number;
  head_ref?: { name?: string; target?: string } | string;
  head_ref_name!: string;
  head_ref_oid!: string;
  head_repository_owner?: string;
  head_repository?: string | Actor;
  is_cross_repository!: boolean;
  is_draft!: boolean;
  maintainer_can_modify!: boolean;
  merge_commit?: string;
  merge_state_status!: string;
  mergeable!: string;
  merged!: boolean;
  merged_at?: Date;
  merged_by?: string | Actor;
  permalink?: string;
  potential_merge_commit?: string;
  review_decision?: string;
  review_requests!: number;
  reviews!: number;
  suggested_reviewers!: Array<{ is_author: boolean; is_commenter: boolean; reviewer: string | Actor }>;

  public static get __schema(): Joi.ObjectSchema<PullRequest> {
    return super.__schema
      .append<PullRequest>({
        type: Joi.string().valid('PullRequest').required(),
        additions: Joi.number().required(),
        base_ref: Joi.object({ name: Joi.string(), target: Joi.string() }),
        base_ref_name: Joi.string().required(),
        base_ref_oid: Joi.string().required(),
        base_repository: Joi.string(),
        can_be_rebased: Joi.boolean().required(),
        changed_files: Joi.number().required(),
        closing_issues_references: Joi.number().required(),
        commits: Joi.number().required(),
        deletions: Joi.number().required(),
        head_ref: Joi.alternatives(Joi.string(), Joi.object({ name: Joi.string(), target: Joi.string() })),
        head_ref_name: Joi.string().required(),
        head_ref_oid: Joi.string().required(),
        head_repository_owner: Joi.alternatives(Joi.string(), Actor.__schema),
        head_repository: Joi.string(),
        is_cross_repository: Joi.boolean().required(),
        is_draft: Joi.boolean().required(),
        maintainer_can_modify: Joi.boolean().required(),
        merge_commit: Joi.string(),
        merge_state_status: Joi.string().required(),
        mergeable: Joi.string().required(),
        merged: Joi.boolean().required(),
        merged_at: Joi.date(),
        merged_by: Joi.alternatives(Joi.string(), Actor.__schema),
        permalink: Joi.string(),
        potential_merge_commit: Joi.string(),
        review_decision: Joi.string(),
        review_requests: Joi.number().required(),
        reviews: Joi.number().required(),
        suggested_reviewers: Joi.array()
          .items(
            Joi.object({
              is_author: Joi.boolean().required(),
              is_commenter: Joi.boolean().required(),
              reviewer: Joi.alternatives(Joi.string(), Actor.__schema).required(),
            }),
          )
          .required(),
      })
      .custom((value) => Object.assign(new PullRequest(), value));
  }
}
