# offline-sync

Demonstrates offline-first data synchronisation using Dexie (IndexedDB), a background retry queue, and pluggable conflict resolution strategies.

## Web APIs Used

| API | Chrome | Firefox | Safari | Edge |
|-----|--------|---------|--------|------|
| IndexedDB (Dexie v4) | 24+ | 16+ | 10+ | 12+ |
| Background Sync | 49+ | ❌ | ❌ | 79+ |
| Navigator.onLine | All | All | All | All |
| Broadcast Channel | 54+ | 38+ | 15.4+ | 79+ |

## Architecture

```
React UI ──online?──▶ syncEngine ──POST/PATCH──▶ API
                           │ offline               │
                           ▼                       │
                      retryQueue ◀──conflict?──────┘
```

## How to Run

```bash
npm install
npm run dev   # http://localhost:3000
```

Open in two tabs, go offline in DevTools, make changes, go back online.
