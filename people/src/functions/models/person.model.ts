export interface PersonModel {
  name: string;
  surname: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  birthCountry: string;
  job: string;
}

export const PEOPLE_CSV_HEADERS = [
  'name',
  'surname',
  'gender',
  'birthDate',
  'birthPlace',
  'birthCountry',
  'job',
] as const;
