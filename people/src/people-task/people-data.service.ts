import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  fetchPeopleData,
  filterMenAge20To40BornInGrudziadz,
  PersonModel,
} from '../functions';

@Injectable()
export class PeopleDataService implements OnModuleInit {
  private readonly logger = new Logger(PeopleDataService.name);
  private allPeople: PersonModel[] = [];
  private prefilteredPeople: PersonModel[] = [];

  async onModuleInit(): Promise<void> {
    this.logger.log('🌐 Fetching people CSV and loading in-memory cache');

    this.allPeople = await fetchPeopleData();
    this.logger.log(`📥 Downloaded records: ${this.allPeople.length}`);

    this.prefilteredPeople = filterMenAge20To40BornInGrudziadz(this.allPeople);

    this.logger.log(
      `🧠 Cache ready. all=${this.allPeople.length}, prefiltered=${this.prefilteredPeople.length}`,
    );
  }

  getAllPeople(): PersonModel[] {
    return [...this.allPeople];
  }

  getPrefilteredPeople(): PersonModel[] {
    return [...this.prefilteredPeople];
  }
}
