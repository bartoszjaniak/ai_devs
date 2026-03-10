# AI Devs – Repozytorium Zadań

Repozytorium zawiera rozwiązania zadań z kursu **AI Devs**.

## Założenia

- Każde zadanie to osobny folder w głównym katalogu (np. `people/`).
- Każde zadanie to aplikacja oparta na **NestJS**.
- Komunikacja z modelami AI odbywa się przez **OpenRouter** (API kompatybilne z OpenAI).
- Klucz API oraz inne sekrety przechowywane są lokalnie w pliku `.env` (nie trafia do repozytorium). Szablon konfiguracji znajdziesz w `.env.example`.
- Każdy projekt zawiera katalogi:
  - `src/prompts/` – pliki z promptami używanymi przez agentów,
  - `src/skills/` – implementacje umiejętności (skills) agentowych,
  - `src/agent/` – moduł agenta łączący prompty i skille.

## Zadania

| Folder   | Opis                                               |
| -------- | -------------------------------------------------- |
| `people` | Pierwsze zadanie – przykład agenta NestJS + OpenRouter |

## Wymagania

- Node.js >= 18
- npm >= 9

## Konfiguracja

Skopiuj `.env.example` do odpowiedniego folderu zadania i uzupełnij wartości:

```bash
cp .env.example people/.env
```

Następnie uzupełnij `OPENROUTER_API_KEY` swoim kluczem z https://openrouter.ai.
