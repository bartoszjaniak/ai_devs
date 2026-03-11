import { PersonModel } from '../../functions';

export interface TaggedPersonModel extends PersonModel {
  tags: string[];
}
