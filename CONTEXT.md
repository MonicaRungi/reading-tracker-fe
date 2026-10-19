# Reading Tracker — Contesto progetto per Claude Code

Leggi anche `CLAUDE.md` e `DESIGN.md` prima di procedere. Questo file risponde ai punti aperti
che Claude Code ha identificato e fornisce il contratto reale di schema e API.

---

## Cosa è

App mobile-first (PWA) per tracciare i libri letti, nome prodotto **Shelfy**. Multi-utente,
autenticazione Supabase **solo Google OAuth** (il magic link è stato rimosso: incompatibile
con la PWA installata su iOS). Stack: Vite + React 19 + TypeScript + shadcn/ui + Tailwind v4 +
TanStack Query v5 + react-router-dom v7 + supabase-js + i18next + sonner + vite-plugin-pwa.

---

## Backend

- **Supabase project URL**: `https://ekpyxrjjwbiklnmyiswu.supabase.co`
- **Publishable key**: in `VITE_SUPABASE_PUBLISHABLE_KEY` nel `.env` (non committare)
- **Region**: Frankfurt (`eu-central-1`)
- **Backend repo**: https://github.com/MonicaRungi/reading-tracker-be (migration in
  `supabase/migrations/`: sono la fonte di verità dello schema, questo file ne è un riassunto)

---

## Schema reale delle tabelle Supabase

Regola generale: RLS attiva ovunque, ogni utente vede solo le proprie righe (`auth.uid()`).
Dove il client può aggiornare solo alcune colonne, il limite è un grant per colonna.

### `profiles`
```sql
id               uuid primary key references auth.users(id) on delete cascade
display_name     text
theme            text not null default 'auto' check (theme in ('light','dark','auto'))
total_pages_read int not null default 0   -- totale pagine lette (badge pagine)
created_at       timestamptz not null default now()
```
RLS: select/update solo sul proprio profilo (`id = auth.uid()`). Il client può aggiornare
**solo** `display_name` e `theme`; `total_pages_read` lo scrive solo `increment_total_pages_read`
(chiamata da `log_pages_read` e dall'import Goodreads).
Creata automaticamente da trigger `on_auth_user_created` — mai inserire manualmente.

### `books` (catalogo condiviso)
```sql
id              uuid primary key default gen_random_uuid()
isbn13          text unique          -- nullable (alcuni libri non ce l'hanno)
title           text not null
authors         text[]               -- array di stringhe
cover_url       text
page_count      int
published_year  int
published_date  text                 -- 'YYYY' | 'YYYY-MM' | 'YYYY-MM-DD' (promemoria uscita)
publisher       text
description     text
genres          text[]               -- array di stringhe
source          text                 -- 'google_books' | 'open_library' | 'goodreads'
fetched_at      timestamptz not null default now()  -- ultimo fetch dalle fonti (refresh)
created_at      timestamptz not null default now()
```
RLS: **solo select** per gli autenticati. Il client non scrive mai in `books`: aggiunta e
refresh passano dalla Edge Function `book-save` (service role), la correzione del numero di
pagine dalla RPC `set_book_page_count(p_book_id, p_page_count)` (solo libri nella propria
libreria). La cancellazione avviene via trigger quando nessun library_item la referenzia più.

### `library_items`
```sql
id           uuid primary key default gen_random_uuid()
user_id      uuid not null references auth.users(id) on delete cascade
book_id      uuid not null references books(id)
status       text not null default 'to_read'
             check (status in ('to_read','reading','read','abandoned'))
rating       int check (rating between 1 and 5)   -- nullable
             -- check: rating is null or status in ('read','abandoned')
started_at   date                                  -- nullable
finished_at  date                                  -- nullable
current_page int default 0
spine_path   text                                  -- foto dorso nel bucket 'spines'
spine_ratio  numeric(6,4) check (spine_ratio > 0)  -- larghezza / altezza della foto
             -- check: (spine_path is null) = (spine_ratio is null)
added_at     timestamptz not null default now()
updated_at   timestamptz not null default now()
unique (user_id, book_id)
```
RLS: select/insert/update/delete solo sulle proprie righe (`user_id = auth.uid()`).
La libreria paginata con ricerca usa la RPC `search_library(p_query, p_status)` (security invoker).

### `shelves`
```sql
id          uuid primary key default gen_random_uuid()
user_id     uuid not null references auth.users(id) on delete cascade
name        text not null
color_theme text not null default 'wood'
            check (color_theme in ('wood','white','night','sage','lilac','terracotta'))
created_at  timestamptz not null default now()
unique (user_id, name)
```
RLS: select/insert/update/delete solo i propri scaffali.

### `shelf_items`
```sql
id               uuid primary key default gen_random_uuid()
shelf_id         uuid not null references shelves(id) on delete cascade
library_item_id  uuid references library_items(id) on delete cascade  -- null per le decorazioni
item_type        text not null default 'book' check (item_type in ('book','decor'))
decor_key        text                -- solo per item_type = 'decor'
position         int not null default 0
display          text not null default 'spine' check (display in ('spine','stack','cover'))
added_at         timestamptz not null default now()
-- check: (item_type = 'book' and library_item_id is not null)
--     or (item_type = 'decor' and decor_key is not null)
unique (shelf_id, library_item_id) where library_item_id is not null
```
RLS: select/insert/delete consentiti solo se lo scaffale appartiene all'utente corrente
(policy con `exists (select 1 from shelves s where s.id = shelf_id and s.user_id = auth.uid())`).
Update: il client può modificare **solo** `display`. Il riordino passa dalla RPC
`reorder_shelf(p_shelf_id, p_item_ids)`.
Trigger `before insert`: se `position` è 0 o null la imposta a `max(position) + 1` dello
scaffale (accodamento). Il frontend non passa mai `position` in insert.

### `reading_log`
```sql
user_id    uuid not null references auth.users(id) on delete cascade
log_date   date not null default current_date
pages_read int not null default 0
primary key (user_id, log_date)
```
RLS: select/insert/update solo le proprie righe. Il client scrive solo via RPC
`log_pages_read` (vedi sotto). Retention 42 giorni (job settimanale `cleanup_reading_log`).

### `reading_goals`
```sql
id            uuid primary key default gen_random_uuid()
user_id       uuid not null references auth.users(id) on delete cascade
type          text not null check (type in ('books','days','pages'))
role          text not null check (role in ('primary','secondary'))
period        text not null check (period in ('year','month','week'))
target        int not null check (target > 0)
period_start  date not null
period_end    date not null           -- >= period_start
status        text not null default 'active'
              check (status in ('active','achieved','failed','archived'))
is_locked     boolean not null default false   -- true per i primary (trigger)
confirmed_at  timestamptz not null default now()
created_at    timestamptz not null default now()
updated_at    timestamptz not null default now()
-- un solo primary 'year' per utente per anno solare (indice unico parziale)
```
RLS: select/insert/update solo i propri; delete **solo dei secondari** (il primary confermato
non si cancella). Regole per il client (trigger `trg_lock_primary_goal` / `trg_goal_immutability`):
- insert: sempre `status = 'active'` e periodo non già concluso; `confirmed_at`/`created_at`
  li impone il DB; il primary nasce `is_locked = true`.
- update: si possono cambiare solo `target` (solo secondari attivi) e `status` (solo
  `active → archived` di un secondario). Tutti gli altri campi sono immutabili.
- la chiusura come `achieved` la fa solo il DB: RPC `sync_goal_achievements()` (chiusura
  "attiva", calcola il progresso lato DB) o il job notturno `close_expired_reading_goals`
  (`achieved`/`failed` a fine periodo).

### `badges` (catalogo) e `user_badges`
```sql
-- badges
id uuid pk, key text unique, category text  -- 'annual'|'books'|'pages'|'long_books'|'goals'
tier text  -- 'iniziale'|'bronzo'|'argento'|'oro' (null per gli annuali)
title text, description text, metric text, threshold int, icon_key text, created_at timestamptz

-- user_badges
user_id uuid, badge_id uuid references badges(id), unlocked_at timestamptz,
is_featured boolean not null default false, primary key (user_id, badge_id)
```
RLS: `badges` in sola lettura per tutti gli autenticati (14 badge seed + `annual_reader_<anno>`
generati al volo). `user_badges`: select dei propri; il client può aggiornare **solo**
`is_featured`. Gli sblocchi li fanno solo i trigger DB (`unlock_badge`, security definer):
libri letti e libri lunghi su `library_items`, pagine in `increment_total_pages_read`,
obiettivi e annuale su `reading_goals`. Il frontend non calcola né scrive sblocchi.

### `notifications`
```sql
id uuid pk, user_id uuid, type text  -- 'goal_renewal'|'book_release'|'badge_unlocked'
title text, body text   -- fallback: il testo lo compone il frontend da type + payload (i18n)
payload jsonb not null default '{}', read_at timestamptz, created_at timestamptz
```
RLS: select/update (segna come letta)/delete solo le proprie. **Nessuna insert dal client**:
scrivono solo i trigger e i job. Pubblicata su Supabase Realtime. Retention 30 giorni.

### `release_reminders`
```sql
id uuid pk, user_id uuid, book_id uuid references books(id) on delete cascade,
release_date date not null, created_at timestamptz, unique (user_id, book_id)
```
RLS: select/insert/delete solo i propri. Il job `fire_due_release_reminders` li trasforma in
notifiche `book_release` alla data di uscita; togliere il libro dalla libreria li cancella.

### Storage: bucket `spines`
Privato, max 512 KB, solo `image/webp` e `image/jpeg`. Path
`{user_id}/{library_item_id}-{timestamp}.{webp|jpg}`; policy su `storage.objects`: ogni utente
legge/scrive/cancella solo nella propria cartella. I file orfani li elimina il job notturno.

---

## Tipi TypeScript

Non duplicare i tipi qui. La fonte è `src/types/database.types.ts`, generato con
`supabase gen types typescript` (rigenerarlo a ogni migration): in fondo al file ci sono gli
alias per riga (`BookRow`, `LibraryItemRow`, `ReadingGoalRow`, `NotificationRow`, …). I tipi di
dominio vivono in `src/api/<dominio>/types.ts` e partono da quegli alias (es. `Book = BookRow`);
`BookMeta`, il formato normalizzato delle Edge Function, è in `src/api/books/types.ts`.

---

## Contratto Edge Function

Le Edge Function sono deployate su Supabase e vanno chiamate con `supabase.functions.invoke`
(POST con body JSON). Il client supabase-js inietta automaticamente il JWT dell'utente — non
passare token a mano. **Tutte richiedono un utente loggato**: senza JWT valido rispondono
`401 { error: 'Non autorizzato' }` (il controllo è nella function, non solo nel gateway).

### `book-search`

```ts
const { data, error } = await supabase.functions.invoke('book-search', {
  body: { q: 'murakami' }          // q = stringa libera (titolo/autore) oppure ISBN
})

// Risposta OK: BookMeta[] (array, può essere vuoto)
// Errori: 400 (q mancante), 401, 502 (fonti non disponibili)

// Logica interna:
// - Catalogo prima: un ISBN-13 già in `books` torna subito dal catalogo; in ricerca
//   testuale i risultati del catalogo vanno in testa e vincono sui doppioni
// - ISBN (10 o 13 cifre): Google Books (isbn:) e Open Library in parallelo, record uniti
// - Testo libero: Google Books (langRestrict=it) e Open Library (edizione italiana) in
//   parallelo, risultati alternati e deduplicati; 502 solo se falliscono entrambe
// - Niente arricchimento in ricerca: si completa all'aggiunta (book-save)
```

### `book-lookup`

```ts
const { data, error } = await supabase.functions.invoke('book-lookup', {
  body: { isbn: '9788806219215' }  // ISBN 10 o 13 cifre
})

// Risposta OK: BookMeta (singolo oggetto, non array)
// Errori:
//   { error: 'ISBN non valido' }    status 400  (o 'parametro isbn mancante')
//   { error: 'Non autorizzato' }    status 401
//   { error: 'Libro non trovato' }  status 404
//   { error: 'Fonti non disponibili, riprova' } status 502

// Usato dallo scanner barcode. Catalogo prima, poi fonti esterne. Non salva nulla.
```

### `book-save`

Unico punto di scrittura del catalogo `books` (service role).

```ts
// Aggiunta: riusa la riga se l'ISBN-13 è già in catalogo, altrimenti completa i campi
// vuoti con un lookup per ISBN, sceglie la copertina migliore e inserisce
await supabase.functions.invoke('book-save', { body: { book: meta } })   // → Book (riga)

// Refresh dal dettaglio: riempie solo i campi vuoti, cambia copertina solo se migliore.
// Solo per libri nella libreria dell'utente (altrimenti 403)
await supabase.functions.invoke('book-save', { body: { bookId, refresh: true } })  // → Book

// Errori: 400 (libro non valido), 401, 403, 404, 500
```

### `cover-proxy`

Copertine di Google Books (senza CORS) per l'esportazione della mensola su canvas. Unica
eccezione a `functions.invoke`: la risposta è un'immagine, quindi `fetch` diretto in
`fetchCoverBlob` (`api/books`) con `Authorization: Bearer <token>` e `apikey`.
Body `{ url }`; solo https verso `books.google.com` / `books.googleusercontent.com`, solo
immagini fino a 2 MB. Errori: 400, 401, 413, 502, 504.

### `import-goodreads`

```ts
await supabase.functions.invoke('import-goodreads', { body: { csv: text } })
// → { imported, skipped, failed, errors: { title, reason }[] }
```
CSV parsato con `@std/csv` (campi multilinea ammessi). Duplicati saltati per ISBN-13 o titolo
(libreria letta a pagine). Libri nuovi in `books` con `source = 'goodreads'`. `started_at` =
"Date Added" solo per `reading`, o per `read` se non successivo a "Date Read"; per i letti con
date e pagine note le pagine vengono distribuite su `reading_log`. Le pagine dei letti importati
vanno in `total_pages_read` (una chiamata a fine import); badge sbloccati dai trigger.

---

## Regole di dominio importanti

### Flusso a stati (DESIGN.md §6)
- `to_read` → CTA "Inizia a leggere" → `reading` (imposta `started_at = today`)
- `reading` → CTA "Ho terminato il libro" → `read` (imposta `finished_at = today`)
- `read` / `abandoned` → stati terminali, nessuna CTA
- Avanzamento (`current_page`) visibile **solo** se `status = 'reading'`
- `rating` disponibile **solo** se `status in ('read', 'abandoned')`
- "Abbandonato" e "reimposta" vivono nel menu ⋯, non nel flusso principale

### Aggiornamento `reading_log`
Quando `current_page` cambia su un `library_item` (o il libro passa a `read` con pagine non
ancora registrate), l'app calcola il delta e chiama la RPC:
```ts
await supabase.rpc('log_pages_read', {
  p_log_date: today,   // 'YYYY-MM-DD', giorno locale dell'utente
  p_delta: delta       // ignorato se <= 0
})
```
Somma atomica sulla riga del giorno (insert … on conflict do update) e incremento di
`profiles.total_pages_read` nella stessa chiamata (badge pagine). Niente più select + upsert
dal client.

### Aggiunta libro via bottom sheet
1. L'utente tocca "Aggiungi" su un risultato di ricerca.
2. Si apre `AddBookSheet` con il libro selezionato.
3. L'utente sceglie stato (default: `to_read`), scaffali opzionali ed eventualmente il
   promemoria di uscita (solo libri con data di pubblicazione completa futura).
4. On submit:
   a. Edge Function `book-save` con `{ book }` (riusa la riga se l'ISBN esiste già)
   b. Insert in `library_items` (`started_at = today` se `reading`, `finished_at = today` se `read`)
   c. Se scaffali scelti: insert in `shelf_items`
   d. Se promemoria scelto: insert in `release_reminders`
5. Invalidare `['library', userId]`, `['stats', userId]`, `['shelves', userId]` /
   `['shelf', userId]` e le query di obiettivi/badge (`invalidateProgressQueries`, che prima
   chiama `sync_goal_achievements`).

---

## Stato attuale del frontend

**MVP completo.** Tutto ciò che segue è stato implementato e verificato in sessioni successive
allo scaffolding iniziale di Claude Code (che invece lasciava mock e schermate vuote — se stai
leggendo suggerimenti "da fare" più vecchi di questa sezione, sono superati):

- Struttura cartelle secondo `CLAUDE.md` (src/api/, src/components/, src/pages/, ecc.)
- shadcn/ui, TanStack Query, react-router-dom, i18next (`src/i18n/locales/it.ts`) configurati
- supabase-js client in `src/lib/supabase.ts`
- **Auth reale**: `useAuth` collegato a `supabase.auth.getSession` + `onAuthStateChange`,
  `AuthGuard`, solo Google OAuth (magic link rimosso dal codice). `/auth/callback` resta: è il
  `redirectTo` di Google OAuth
- **PWA**: manifest configurato (nome "Shelfy"), icone reali in `public/`
  (`pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`)
- **Data layer reale** in `src/api/`: `badges`, `books` (Edge Function), `goals`, `library`,
  `notifications`, `profile`, `releaseReminders`, `shelves`, `spines`, `stats`
- **Schermate**: `BarcodeScanner`, `AddBookSheet`, Dettaglio libro (flusso a stati §6 di
  DESIGN.md) tutte implementate
- **Pagine**: `LoginPage`, `LibraryPage`, `SearchPage`, `ShelvesPage`, `ShelfDetailPage`,
  `ProfilePage`, `BookDetailPage`, `GoalsPage`, `GoalOnboardingPage`, `BadgesPage`,
  `NotificationsPage`, `GoodreadsImportPage`
- **Componenti shared**: `BookCard`, `ReadingCard`, `StatusBadge`, `ProgressBar`, `Spine`, …;
  grafici profilo page-local (`ActivitySection`, `BooksReadSection`, `GenresSection`)
- Allineamento snake_case con i tipi generati (`supabase gen types typescript`) — niente più
  mapping manuale a camelCase
- Ottimismo TanStack Query (`onMutate`/`onError`) per cambio stato e avanzamento

Se in una sessione futura risulta che qualcosa sopra non è in realtà completo/funzionante,
correggi questa sezione di conseguenza invece di fidarti ciecamente.

- **Import Goodreads**: fatto — non come bottom sheet ma come pagina dedicata
  `src/pages/GoodreadsImportPage/` (header, preview dati, stato importazione, gestione errori,
  risultato finale), raggiungibile da `ImportButton` in `ProfilePage`. L'import da StoryGraph
  non è più previsto: icona e stringa i18n sono state rimosse.
- **Obiettivi di lettura con badge**: fatto (`GoalsPage`, `GoalOnboardingPage`, `BadgesPage`).
  I badge si calcolano solo nei trigger DB; la chiusura attiva degli obiettivi passa dalla RPC
  `sync_goal_achievements`, il resto dal job notturno.
- **Scaffali a mensola** (DESIGN.md §16): fatto, tutte e quattro le fasi — vista mensola con
  temi; riordino drag & drop (`reorder_shelf`) e rimozione; foto del dorso (bucket `spines`);
  decorazioni, posizione del libro (`display`) ed esportazione della mensola come immagine.
- **Notifiche**: solo in-app (`NotificationsPage` + `useNotificationsRealtime` su Supabase
  Realtime): badge sbloccati, rinnovo obiettivi secondari, uscita libri. Niente push né email.
- **Job pianificati** (GitHub Actions nella repo backend, service role):
  - `close-reading-goals` — ogni giorno 01:00 UTC, `close_expired_reading_goals`
  - `fire-release-reminders` — ogni giorno 01:15 UTC, `fire_due_release_reminders`
  - `cleanup-orphan-spines` — ogni giorno 03:30 UTC, `list_orphan_spines` + API Storage
  - `cleanup-reading-log` — domenica 03:00 UTC, `cleanup_reading_log` (> 42 giorni) e
    `delete_old_notifications` (> 30 giorni)
  - `keepalive` — ogni 5 giorni 09:00 UTC, ping per evitare la pausa del progetto free

### Sviluppi futuri (post-MVP)

La PWA verrà dismessa a favore dell'app nativa (`shelfy-mobile`): le nuove funzionalità
vanno pensate per il mobile.

1. **Note e citazioni per libro** — appunti e passaggi salvabili legati a un `library_item`.
   Solo nell'app mobile, non nella PWA.
2. **Notifiche push** — rimandate alla fine del piano mobile.
3. **Cancellazione dell'account** — prevista via Edge Function, non ancora implementata.

---

## Mockup Figma

https://www.figma.com/design/IVLzqb8RfIYj4cchHtR1I1

Schermate disponibili (nell'ordine del file):
- **0 · Login** — sfondo pesca, Google + magic link (il magic link non è più nell'app), feature pill
- **1 · Libreria** — banner "Continua a leggere" + swipe + griglia copertine
- **2 · Cerca** — ricerca testuale/ISBN/scan, lista risultati con "Aggiungi"
- **2b · Aggiungi libro** — bottom sheet su schermata Cerca
- **2c · Scansiona** — viewfinder barcode, mirino con angoli coral, ISBN manuale
- **3 · Dettaglio** — stato In lettura: copertina grande, date, slider avanzamento,
  valutazione bloccata, CTA "Ho terminato il libro"
- **4 · Profilo** — avatar, toggle tema, stat card 2×2, grafici attività/libri/generi

---

## Note implementative

- **RLS**: il frontend non filtra mai per `user_id` nelle query Supabase — ci pensa
  automaticamente `auth.uid()` lato DB. Se una query restituisce righe vuote per un utente
  autenticato, prima sospetta la RLS (policy mancante o sbagliata) non il codice.
- **QueryKey con userId**: ogni queryKey include l'userId per evitare cache condivisa tra
  utenti diversi sullo stesso device: `['library', userId]`, `['shelves', userId]`, ecc.
- **Copertine**: arrivano come URL da Google Books / Open Library (scelte da `book-save`).
  Supabase Storage è usato solo per le foto dei dorsi (bucket privato `spines`).
- **Tema**: la fonte sul dispositivo è `localStorage['rt.theme']`, default `auto` (segue
  sistema), applicata già in `index.html` prima del render come classe `.dark` su `<html>`.
  Il toggle in Profilo salva anche `profiles.theme` (senza attendere la risposta), ma il valore
  nel DB oggi non viene mai riletto: un nuovo dispositivo parte da `auto`.
- **Safe area iOS** (PWA): usare `env(safe-area-inset-top/bottom)` per bottom nav e status
  bar per non sovrapporsi all'orario/home indicator di iPhone.
