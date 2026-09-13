# Reading Tracker — Contesto progetto per Claude Code

Leggi anche `CLAUDE.md` e `DESIGN.md` prima di procedere. Questo file risponde ai punti aperti
che Claude Code ha identificato e fornisce il contratto reale di schema e API.

---

## Cosa è

App mobile-first (PWA) per tracciare i libri letti. Multi-utente, autenticazione Supabase
(magic link + Google OAuth). Stack: Vite + React 19 + TypeScript + shadcn/ui + Tailwind v4 +
TanStack Query v5 + react-router-dom v7 + supabase-js + i18next + sonner + vite-plugin-pwa.

---

## Backend

- **Supabase project URL**: `https://ekpyxrjjwbiklnmyiswu.supabase.co`
- **Publishable key**: in `VITE_SUPABASE_PUBLISHABLE_KEY` nel `.env` (non committare)
- **Region**: Frankfurt (`eu-central-1`)
- **Backend repo**: https://github.com/MonicaRungi/reading-tracker-be

---

## Schema reale delle tabelle Supabase

### `profiles`
```sql
id          uuid primary key references auth.users(id) on delete cascade
display_name text
theme       text not null default 'auto' check (theme in ('light','dark','auto'))
created_at  timestamptz not null default now()
```
RLS: select/update solo sul proprio profilo (`id = auth.uid()`).
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
publisher       text
description     text
genres          text[]               -- array di stringhe
source          text                 -- 'google_books' | 'open_library'
created_at      timestamptz not null default now()
```
RLS: select/insert per tutti gli autenticati. Niente update/delete per gli utenti
(la cancellazione avviene via trigger quando nessun library_item la referenzia più).

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
added_at     timestamptz not null default now()
updated_at   timestamptz not null default now()
unique (user_id, book_id)
```
RLS: select/insert/update/delete solo sulle proprie righe (`user_id = auth.uid()`).

### `shelves`
```sql
id         uuid primary key default gen_random_uuid()
user_id    uuid not null references auth.users(id) on delete cascade
name       text not null
created_at timestamptz not null default now()
unique (user_id, name)
```
RLS: select/insert/update/delete solo i propri scaffali.

### `shelf_items` (join table)
```sql
shelf_id         uuid not null references shelves(id) on delete cascade
library_item_id  uuid not null references library_items(id) on delete cascade
added_at         timestamptz not null default now()
primary key (shelf_id, library_item_id)
```
RLS: operazioni consentite solo se lo scaffale appartiene all'utente corrente
(policy con `exists (select 1 from shelves s where s.id = shelf_id and s.user_id = auth.uid())`).

### `reading_log`
```sql
user_id    uuid not null references auth.users(id) on delete cascade
log_date   date not null default current_date
pages_read int not null default 0
primary key (user_id, log_date)
```
RLS: select/insert/update solo le proprie righe.
Logica: quando l'utente aggiorna `current_page` su un `library_item`, l'app calcola il delta
(nuova pagina − vecchia pagina) e fa un upsert su `reading_log` per la data corrente.

---

## Tipi TypeScript consigliati (`src/types/`)

```ts
// src/types/book.ts
export type BookStatus = 'to_read' | 'reading' | 'read' | 'abandoned'

export interface Book {
  id: string
  isbn13: string | null
  title: string
  authors: string[] | null
  cover_url: string | null
  page_count: number | null
  published_year: number | null
  publisher: string | null
  description: string | null
  genres: string[] | null
  source: 'google_books' | 'open_library' | null
  created_at: string
}

export interface LibraryItem {
  id: string
  user_id: string
  book_id: string
  status: BookStatus
  rating: number | null        // 1-5, solo se status in ('read','abandoned')
  started_at: string | null    // formato 'YYYY-MM-DD'
  finished_at: string | null
  current_page: number
  added_at: string
  updated_at: string
  book?: Book                  // join opzionale
}

export interface Shelf {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface ShelfItem {
  shelf_id: string
  library_item_id: string
  added_at: string
}

export interface Profile {
  id: string
  display_name: string | null
  theme: 'light' | 'dark' | 'auto'
  created_at: string
}

export interface ReadingLog {
  user_id: string
  log_date: string             // formato 'YYYY-MM-DD'
  pages_read: number
}

// Formato normalizzato restituito dalle Edge Function
export interface BookMeta {
  isbn13: string | null
  title: string | null
  authors: string[] | null
  cover_url: string | null
  page_count: number | null
  published_year: number | null
  publisher: string | null
  description: string | null
  genres: string[] | null
  source: 'google_books' | 'open_library'
}
```

---

## Contratto Edge Function

Le Edge Function sono deployate su Supabase e vanno chiamate con `supabase.functions.invoke`.
Il client supabase-js inietta automaticamente il JWT dell'utente — non passare token a mano.

### `book-search`

```ts
// Chiamata
const { data, error } = await supabase.functions.invoke('book-search', {
  body: { q: 'murakami' }          // q = stringa libera (titolo/autore) oppure ISBN
})

// Risposta OK: BookMeta[]
// Risposta errore: { error: string } con status 400 (q mancante) o 502 (fonti non disponibili)

// Logica interna (già implementata):
// - Se q è un ISBN (10 o 13 cifre): usa sintassi isbn: su Google Books
//   + arricchimento da Open Library per publisher/description/page_count mancanti
// - Se q è testo libero: Google Books con langRestrict=it, fallback Open Library
// - Restituisce sempre BookMeta[] (array, può essere vuoto)
```

### `book-lookup`

```ts
// Chiamata
const { data, error } = await supabase.functions.invoke('book-lookup', {
  body: { isbn: '9788806219215' }  // ISBN 10 o 13 cifre
})

// Risposta OK: BookMeta (singolo oggetto, non array)
// Risposta errore:
//   { error: 'ISBN non valido' }    status 400
//   { error: 'Libro non trovato' }  status 404
//   { error: 'Fonti non disponibili, riprova' } status 502

// Usato dallo scanner barcode: riceve ISBN pulito, torna il singolo libro
```

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
Quando `current_page` cambia su un `library_item`:
```ts
const delta = newPage - oldPage
if (delta > 0) {
  // upsert su reading_log per oggi
  await supabase
    .from('reading_log')
    .upsert({
      user_id: userId,
      log_date: today,           // formato 'YYYY-MM-DD'
      pages_read: delta          // Supabase farà pages_read + delta via on conflict
    }, {
      onConflict: 'user_id,log_date',
      ignoreDuplicates: false    // aggiorna, non ignora
    })
}
```
Nota: l'upsert incrementale non funziona direttamente così con supabase-js — servirà
una funzione DB o un select+update. Alternativa semplice: select il valore attuale,
somma il delta, update.

### Aggiunta libro via bottom sheet
1. L'utente tocca "Aggiungi" su un risultato di ricerca.
2. Si apre `AddBookSheet` con il libro selezionato.
3. L'utente sceglie stato (default: `to_read`) e scaffali opzionali.
4. On submit:
   a. Upsert in `books` (se esiste già per isbn13, riusa l'esistente)
   b. Insert in `library_items`
   c. Se scaffali scelti: insert in `shelf_items`
5. Invalidare `['library', userId]` e `['shelves', userId]`.

---

## Stato attuale del frontend

Il progetto Vite è stato creato e Claude Code ha già scaffoldato:
- Struttura cartelle (src/api/, src/components/, src/pages/, ecc.)
- shadcn/ui inizializzato
- TanStack Query configurato
- react-router-dom configurato
- i18next con `src/i18n/locales/it.ts`
- supabase-js client in `src/lib/supabase.ts`
- Mock in `src/api/` per library, books, shelves, stats, profile

### Prossimi passi (in ordine)

1. **PWA** — installare `vite-plugin-pwa`, configurare manifest con icone reali
   (`public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/apple-touch-icon.png`)

2. **Auth reale** — collegare `useAuth` hook a Supabase (`supabase.auth.getSession`,
   `onAuthStateChange`), implementare pagina Login con magic link + Google OAuth,
   route `/auth/callback` per il magic link

3. **Supabase reale** — sostituire i mock con chiamate Supabase reali in `src/api/`:
   - `api/library/api.ts` — list (con join a books), add, update status/progress, rate
   - `api/shelves/api.ts` — list, create, add/remove items
   - `api/stats/api.ts` — query aggregate per grafici profilo
   - `api/books/api.ts` — wrappa le Edge Function book-search e book-lookup

4. **Schermate mancanti**:
   - `BarcodeScanner` — viewfinder con @zxing/library, scan line animata
   - `AddBookSheet` — bottom sheet stato + scaffali, chiamato da Cerca
   - Dettaglio libro — flusso a stati guidato (DESIGN.md §6)

5. **Ottimismo TanStack Query** — `onMutate/onError` per cambio stato e avanzamento
   (DESIGN.md §10)

6. **Icone PWA** — generare e mettere in `public/`:
   `pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png` (180×180)

---

## Mockup Figma

https://www.figma.com/design/IVLzqb8RfIYj4cchHtR1I1

Schermate disponibili (nell'ordine del file):
- **0 · Login** — sfondo pesca, Google + magic link, feature pill
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
- **Copertine**: arrivano come URL da Google Books / Open Library. Non usare Supabase Storage
  (non necessario nell'MVP).
- **Tema**: persistito in `localStorage['rt.theme']`, default `auto` (segue sistema).
  Applicato come classe `.dark` su `<html>`.
- **Safe area iOS** (PWA): usare `env(safe-area-inset-top/bottom)` per bottom nav e status
  bar per non sovrapporsi all'orario/home indicator di iPhone.
