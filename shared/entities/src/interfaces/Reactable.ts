import { Reaction } from '../Reaction';
import { Repository } from '../Repository';
import { Node } from './Node';
import { RepositoryResource } from './RepositoryResource';

export interface Reactable extends RepositoryResource, Node {
  id: string;
  repository: string | Repository;
  reaction_groups: Record<string, number>;
  reactions: number | Reaction[];
}

export function isntanceOfReactable(object: any): object is Reactable {
  return (
    typeof object === 'object' &&
    ['id', 'repository', 'reaction_groups', 'reactions'].reduce((is, field) => is && field in object, true)
  );
}

// export const ReactableSchema = Joi.object<Reactable>({
//   id: Joi.string().required(),
//   repository: Joi.alternatives(Joi.string(), Repository.__schema).required(),
//   reaction_groups: Joi.object().pattern(Joi.string(), Joi.number()).required(),
//   reactions: Joi.alternatives(Joi.number(), Joi.array().items(Reaction.__schema)).required(),
// });
