# Zadanie: people

Aplikacja NestJS demonstrująca integrację z **OpenRouter** i wzorzec agenta opartego na promptach i skillach.
Aplikacja uruchamiana jest jako **komenda CLI** – bez serwera HTTP.

## Struktura projektu

```
src/
├── agent/            # Moduł agenta (AgentService, AgentModule)
├── functions/        # Funkcje narzędziowe dla agentów (np. pobranie danych people.csv)
├── openrouter/       # Integracja z OpenRouter API (OpenRouterService, OpenRouterModule)
├── prompts/          # Pliki z promptami systemowymi
├── skills/           # Implementacje umiejętności (skills) agenta
├── app.module.ts
├── cli.ts            # Punkt wejścia CLI (uruchamiany przez npm run ask)
└── main.ts           # Opcjonalny entrypoint HTTP (nieużywany w trybie CLI)
```

## Konfiguracja

Skopiuj `.env.example` do `.env` i uzupełnij klucz API:

```bash
cp .env.example .env
```

Plik `.env`:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
COURSE_API_KEY=your_course_api_key_here
```

## Funkcje dla agentów

W katalogu `src/functions/` znajduje się pierwsza funkcja narzędziowa:

- `fetchPeopleData()` z pliku `src/functions/fetch-people.function.ts`
	- pobiera dane CSV z `https://hub.ag3nts.org/data/<COURSE_API_KEY>/people.csv`
	- mapuje rekordy do modelu `PersonModel` (`src/functions/models/person.model.ts`)
- `filterMenAge20To40BornInGrudziadz()` z pliku `src/functions/filter-people.function.ts`
	- filtruje osoby przez klasyfikatory: mężczyzna, wiek 20-40 w roku 2026, miejsce urodzenia `Grudziądz`

Model danych (`PersonModel`) został określony na podstawie nagłówka CSV:

- `name`
- `surname`
- `gender`
- `birthDate`
- `birthPlace`
- `birthCountry`
- `job`

Przykładowe rekordy (`people.csv`):

```csv
name,surname,gender,birthDate,birthPlace,birthCountry,job
Adam,Kowalski,M,1975-07-07,Śrem,Polska,"Buduje podstawy technologiczne dla nowoczesnych aplikacji..."
Adam,Nowak,M,1993-04-01,Starachowice,Polska,"Jego specjalność to obróbka drewna, przekształcanie go w meble..."
Adam,Wiśniewski,M,1974-05-17,Bochnia,Polska,"Jej aktywność zawodowa koncentruje się na przekazywaniu wiedzy..."
```

Przykład użycia:

```ts
import { fetchPeopleData } from './functions';

const people = await fetchPeopleData();
console.log(people[0]);
```

## Uruchomienie (CLI)

Zainstaluj zależności i uruchom pipeline komendą:

```bash
npm install
npm run ask
```

Wynik zawiera liczbę wysłanych rekordów i odpowiedź endpointu `verify`.

## Jak to działa?

Pipeline działa w tej kolejności:

1. `cli.ts` tworzy kontekst NestJS bez serwera HTTP (`NestFactory.createApplicationContext`).
2. `PeopleDataService` przy starcie aplikacji pobiera `people.csv` i zapisuje dane w pamięci.
3. `PeopleDataService` wykonuje wstępny filtr (mężczyzna, Grudziądz, wiek 20-40 w roku 2026) i przechowuje wynik w pamięci.
4. `TagJobsSkill` klasyfikuje rekordy batchami po 20 przez `OpenRouterService.chatStructured(...)` i zwraca tylko rekordy z tagiem `transport`.
	- prompt jest po angielsku,
	- do każdego tagu stosowana jest reguła >= 80% pewności.
5. `PeopleTaskService` mapuje rekordy do formatu odpowiedzi `people` (`name`, `surname`, `gender`, `born`, `city`, `tags`).
6. `VerifyService` wysyła payload na `https://hub.ag3nts.org/verify` używając `COURSE_API_KEY` z `.env`.

W projekcie kluczowe elementy są w:
- `src/people-task/people-data.service.ts`
- `src/skills/tag-jobs.skill.ts`
- `src/people-task/people-task.service.ts`
- `src/people-task/verify.service.ts`

Poprzedni opis oparty o `AgentService` i argumenty `--person/--question` nie jest już używany.

## Testy

```bash
npm run test        # unit tests
npm run test:e2e    # e2e tests
```
