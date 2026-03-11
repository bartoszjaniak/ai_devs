import axios from 'axios';
import { PEOPLE_CSV_HEADERS, PersonModel } from './models/person.model';

const PEOPLE_COLUMNS_COUNT = PEOPLE_CSV_HEADERS.length;

function parseCsvLine(line: string): string[] {
  const columns: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      columns.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  columns.push(current.trim());
  return columns;
}

export function mapPeopleCsvToModel(csvContent: string): PersonModel[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const dataLines = lines.slice(1);

  return dataLines
    .map((line) => parseCsvLine(line))
    .filter((columns) => columns.length >= PEOPLE_COLUMNS_COUNT)
    .map((columns) => ({
      name: columns[0],
      surname: columns[1],
      gender: columns[2],
      birthDate: columns[3],
      birthPlace: columns[4],
      birthCountry: columns[5],
      job: columns[6],
    }));
}

export async function fetchPeopleData(
  courseApiKey: string = process.env.COURSE_API_KEY ?? '',
): Promise<PersonModel[]> {
  if (!courseApiKey) {
    throw new Error('Missing COURSE_API_KEY. Add it to your .env file.');
  }

  const url = `https://hub.ag3nts.org/data/${courseApiKey}/people.csv`;
  const response = await axios.get<string>(url, { responseType: 'text' });

  return mapPeopleCsvToModel(response.data);
}
