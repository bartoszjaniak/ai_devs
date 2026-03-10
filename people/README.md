# Zadanie: people

Aplikacja NestJS demonstrująca integrację z **OpenRouter** i wzorzec agenta opartego na promptach i skillach.

## Struktura projektu

```
src/
├── agent/            # Moduł agenta (AgentService, AgentController, AgentModule)
├── openrouter/       # Integracja z OpenRouter API (OpenRouterService, OpenRouterModule)
├── prompts/          # Pliki z promptami systemowymi
├── skills/           # Implementacje umiejętności (skills) agenta
├── app.module.ts
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

## Uruchomienie

```bash
npm install
npm run start:dev
```

## Przykład użycia agenta

```bash
curl "http://localhost:3000/agent?person=Alan+Turing&question=What+did+he+invent?"
```

Odpowiedź:
```json
{
  "person": "Alan Turing",
  "question": "What did he invent?",
  "answer": "..."
}
```

## Jak to działa?

1. `AgentController` odbiera zapytanie HTTP.
2. `AgentService` uruchamia skill `SummarisePersonSkill`, który dostarcza dodatkowy kontekst.
3. System prompt z `src/prompts/people-agent.prompt.ts` + wynik skilla + pytanie użytkownika trafiają do modelu przez `OpenRouterService`.
4. Model zwraca odpowiedź, która jest odsyłana do klienta.

## Testy

```bash
npm run test        # unit tests
npm run test:e2e    # e2e tests
```
