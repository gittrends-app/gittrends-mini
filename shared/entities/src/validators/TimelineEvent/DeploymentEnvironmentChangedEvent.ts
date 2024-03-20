import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const DeploymentEnvironmentChangedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  deployment_status: z.string(),
});

export type DeploymentEnvironmentChangedEvent = z.infer<typeof DeploymentEnvironmentChangedEventSchema>;
