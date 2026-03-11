import { PersonModel } from './models/person.model';

const MALE_LABELS = new Set(['male', 'm', 'man', 'mężczyzna', 'mezczyzna']);

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function extractBirthYear(birthDate: string): number | null {
  if (!birthDate) {
    return null;
  }

  const normalizedBirthDate = birthDate.trim();

  const isoYearMatch = normalizedBirthDate.match(/^(\d{4})[-/.]/);
  if (isoYearMatch) {
    return Number(isoYearMatch[1]);
  }

  const trailingYearMatch = normalizedBirthDate.match(/(\d{4})$/);
  if (trailingYearMatch) {
    return Number(trailingYearMatch[1]);
  }

  return null;
}

export function isMalePerson(person: PersonModel): boolean {
  return MALE_LABELS.has(normalizeText(person.gender));
}

export function isAgeBetweenInReferenceYear(
  person: PersonModel,
  minAge: number,
  maxAge: number,
  referenceYear: number,
): boolean {
  const birthYear = extractBirthYear(person.birthDate);

  if (birthYear === null) {
    return false;
  }

  const age = referenceYear - birthYear;
  return age >= minAge && age <= maxAge;
}

export function isBornInPlace(person: PersonModel, expectedBirthPlace: string): boolean {
  return normalizeText(person.birthPlace) === normalizeText(expectedBirthPlace);
}

export function filterMenAge20To40BornInGrudziadz(
  people: PersonModel[],
  referenceYear = 2026,
): PersonModel[] {
  return people.filter(
    (person) =>
      isMalePerson(person) &&
      isAgeBetweenInReferenceYear(person, 20, 40, referenceYear) &&
      isBornInPlace(person, 'Grudziądz'),
  );
}
