# Zadanie: people

Aplikacja NestJS demonstrująca integrację z **OpenRouter** i wzorzec agenta opartego na promptach i skillach.
Aplikacja uruchamiana jest jako **komenda CLI** – bez serwera HTTP.

## Struktura projektu

```
src/
├── agent/            # Moduł agenta (AgentService, AgentController, AgentModule)
├── openrouter/       # Integracja z OpenRouter API (OpenRouterService, OpenRouterModule)
├── prompts/          # Pliki z promptami systemowymi
├── skills/           # Implementacje umiejętności (skills) agenta
├── app.module.ts
├── cli.ts            # Punkt wejścia CLI (uruchamiany przez npm run ask)
└── main.ts
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
```

## Uruchomienie (CLI)

Zainstaluj zależności i uruchom agenta komendą:

```bash
npm install
npm run ask -- --person "Alan Turing" --question "What did he invent?"
```

Parametry:
- `--person` – imię i nazwisko osoby (domyślnie: `Unknown`)
- `--question` – pytanie do agenta (domyślnie: `Tell me about this person.`)

Wynik jest wypisywany na standardowe wyjście (stdout), np.:

```
Alan Turing was a British mathematician and computer scientist who is widely regarded as the father of theoretical computer science and artificial intelligence...
```

## Jak to działa?

1. `cli.ts` tworzy kontekst NestJS bez serwera HTTP (`NestFactory.createApplicationContext`).
2. Odczytuje argumenty `--person` i `--question` z linii poleceń.
3. `AgentService` uruchamia skill `SummarisePersonSkill`, który dostarcza dodatkowy kontekst.
4. System prompt z `src/prompts/people-agent.prompt.ts` + wynik skilla + pytanie użytkownika trafiają do modelu przez `OpenRouterService`.
5. Model zwraca odpowiedź, która jest wypisywana na stdout.

## Testy

```bash
npm run test        # unit tests
npm run test:e2e    # e2e tests
```
