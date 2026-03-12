# S1E2 - Find Him (NestJS CLI + OpenRouter Responses)

Minimalna aplikacja CLI oparta o NestJS (bez endpointow HTTP i bez testow).

Po uruchomieniu przekazujesz pytanie jako argument CLI, a agent zwraca odpowiedz w ustrukturyzowanym formacie JSON:

```json
{
	"answer": "...",
	"confidence": 0.0
}
```

## Cel

- lekki boilerplate NestJS CLI,
- integracja z OpenRouter endpointem `https://openrouter.ai/api/v1/responses`,
- odpowiedz modelu wymuszona przez JSON schema (`answer`, `confidence`).

## Wymagania

- Node.js >= 18
- npm >= 9

## Konfiguracja

Projekt czyta zmienne srodowiskowe z:

1. `S1E2_findhim/.env`
2. `../.env` (czyli glowny `.env` repo)

W tym repo mozesz korzystac z glownego pliku `.env` z kluczami:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (opcjonalnie, domyslnie `openai/gpt-4o-mini`)

## Instalacja

```bash
cd S1E2_findhim
npm install
```

## Uzycie

Zadanie pytania w CLI:

```bash
npm run ask -- "Krotko opisz czym jest NestJS"
```

Przykladowy output:

```json
{
	"answer": "NestJS to framework Node.js do budowy skalowalnych aplikacji server-side.",
	"confidence": 0.91
}
```

## Przydatne komendy

```bash
# kompilacja TypeScript
npm run build

# uruchomienie po buildzie
npm run start -- "Krotko opisz czym jest NestJS"
```

## Struktura

- `src/cli.ts` - wejscie CLI i odczyt pytania z argumentow
- `src/app.module.ts` - konfiguracja NestJS i env
- `src/agent/agent.service.ts` - prosty agent wywolujacy model
- `src/openrouter/openrouter.service.ts` - klient OpenRouter `responses`
- `src/prompts/agent.prompt.ts` - prompt systemowy

## Uwagi

- Brak pytania w argumencie CLI zwraca usage i kod wyjscia `1`.
- Brak `OPENROUTER_API_KEY` zwraca czytelny blad.
