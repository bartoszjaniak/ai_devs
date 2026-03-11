import { Injectable } from '@nestjs/common';
import { TaggedPersonModel } from './models/tagged-person.model';

@Injectable()
export class SelectTransportSkill {
  execute(people: TaggedPersonModel[]): TaggedPersonModel[] {
    return people.filter((person) => person.tags.includes('transport'));
  }
}
