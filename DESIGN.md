# Reading Tracker — Frontend Design Standard

Design standard per il frontend del Reading Tracker (React 19 + Vite + TypeScript, shadcn/ui,
Tailwind CSS v4). Questo documento è normativo: la nuova UI deve seguirlo, e le deviazioni
devono essere discusse e registrate qui.

---

## 1. Product structure

L'applicazione è una **SPA mobile-first** per uso personale (multi-utente, ma senza multi-tenancy).
Un unico codebase, un'unica face. L'accesso è protetto da autenticazione Supabase (magic link +
Google OAuth).

### 1.1 Navigazione

Tre sezioni principali, accessibili dalla **bottom navigation** (mobile-first):

| Tab | Icona | Contenuto |
|---|---|---|
| Home / Libreria | house | Banner "Continua a leggere" + griglia libri |
| Cerca | search | Ricerca testuale / ISBN / scan barcode |
| Profilo | user | Statistiche, preferenze tema, logout |

La bottom nav è sempre visibile nell'app shell autenticata. Le pagine di dettaglio (libro, scaffale)
sono push-navigate sopra la tab corrente — la bottom nav resta visibile.

### 1.2 Flusso auth

```
/ (root)
  ├── non autenticato → /login (magic link + Google)
  ├── autenticato → /library (home)
  └── /auth/callback (magic link redirect handler)
```

Il route guard vive in `components/layout/AuthGuard.tsx` — non nelle singole pagine.

---

## 2. Technology baseline

- **React 19 + Vite + TypeScript (strict)**; path alias `@/ → src/`.
- **shadcn/ui** (radix flavor, neutral base) come unica component library. Non creare widget
  che shadcn fornisce già; aggiungere primitivi mancanti con `pnpm dlx shadcn@latest add <component>`.
- **Tailwind CSS v4** per lo styling. Niente CSS modules, niente styled-components, niente
  `style` inline tranne colori dinamici.
- **TanStack Query v5** per tutto il data access. Le queryKey seguono il pattern
  `['domain', userId, ...params]`.
- **react-router-dom v7** con layout routes. I guard vivono nei layout, non nelle pagine.
- **supabase-js** come client verso Supabase (Auth + DB). Il client è un singleton in
  `src/lib/supabase.ts`. Mai importarlo direttamente nelle pagine — solo via `src/api/`.
- **lucide-react** per le icone, dimensione default `size-5` nei controlli mobile.
- **i18next / react-i18next** per tutte le stringhe UI. `src/i18n/locales/it.ts` è la source of truth.
- **sonner** per i toast.
- **zxing-js** (o `html5-qrcode`) per la scansione barcode da fotocamera.
- **vite-plugin-pwa** per la PWA (manifest, service worker, installabilità).

---

## 3. File and code conventions

```
src/
  api/          facade tipizzato verso Supabase e Edge Function
  components/
    ui/         primitivi shadcn (generati; non editare a mano)
    layout/     app shell (AppLayout, BottomNav, AuthGuard)
    shared/     componenti prodotto riusabili (BookCard, StatusBadge, RatingStars, …)
  hooks/        hook globali (useAuth, useTheme, useBarcode)
  i18n/         setup i18next + locales/it.ts (source of truth)
  lib/          logica pura: supabase.ts, format.ts, barcode.ts, queryClient.ts
  pages/        componenti route, una cartella per pagina
  types/        tipi di dominio (mirroring tabelle Supabase)
```

- Le pagine compongono componenti shared; non definiscono primitive visive.
- I tipi in `src/types/` rispecchiano le tabelle Supabase. Quando una tabella cambia, cambia
  `src/types/` e `src/api/` — le pagine non toccano nulla.

---

## 4. Layout system

### 4.1 App shell (autenticata)

```
<AppLayout>
  <main class="pb-20">   ← padding-bottom per la bottom nav
    <Outlet />           ← contenuto della pagina corrente
  </main>
  <BottomNav />          ← fixed, 64px, sempre visibile
</AppLayout>
```

- **Padding pagina**: `px-4 pt-4` (16px laterale, 16px top).
- **Status bar area** (iOS PWA): `pt-safe` o `env(safe-area-inset-top)` per non sovrapporre
  l'orario di sistema.
- **Bottom nav safe area**: `pb-safe` o `env(safe-area-inset-bottom)`.
- **Spacing verticale** tra sezioni: `space-y-5` o `gap-5`.
- Niente scroll orizzontale a livello pagina.

### 4.2 Griglia

- Copertine libri: **2 colonne** fisse, proporzione `aspect-[2/3]`, border-radius `rounded-xl`.
- Banner "Continua a leggere": scroll orizzontale con snap (`overflow-x-auto scroll-snap-type-x`),
  card singola a `86%` width con peek della successiva.
- Stat card profilo: **2 colonne** (`grid-cols-2 gap-3`).
- Card "In lettura" (banner): layout orizzontale, copertina 56px + info + progress bar.

---

## 5. Color and theming

### 5.0 Identità visiva

La firma visiva dell'app:

- **Font**: sans di sistema (`font-sans`, ovvero `-apple-system, system-ui`). Nessun font esterno
  da caricare — l'app è mobile-first e deve restare leggera.
- **Accento (Corallo)**: `#E0644A` — il colore primario dell'app. Usato per CTA, chip attivi,
  barre di avanzamento, icone bottom nav attive, badge stato "In lettura".
- **Soft Corallo**: `#FBE9E3` — sfondo pill/chip attivi, card "In lettura" nel banner, sfondo hero login.
- **Testo primario**: `#1B1714` — quasi-nero caldo.
- **Testo secondario**: `#938C84` — grigio caldo per metadati, label.
- **Testo hint**: `#B7AFA7` — placeholder, date vuote.
- **Background pagina**: `#FFFFFF` (chiaro) / `#15161B` (scuro).
- **Card/surface**: `#FAF8F6` (chiaro) / `#20222A` (scuro).
- **Bordo**: `#EFECE9` (chiaro) / `#2A2C34` (scuro).
- **Chip inattivo bg**: `#F1EFEC` (chiaro) / card color (scuro).

### 5.1 Token Tailwind

Configurare in `tailwind.config.ts` / CSS variables:

```css
:root {
  --accent:       #E0644A;
  --accent-soft:  #FBE9E3;
  --tx:           #1B1714;
  --tx-sec:       #938C84;
  --tx-hint:      #B7AFA7;
  --bd:           #EFECE9;
  --card:         #FAF8F6;
}
.dark {
  --accent:       #E0644A;   /* invariato */
  --accent-soft:  #3D1A12;   /* molto scuro */
  --tx:           #F0EDE6;
  --tx-sec:       #9A9AA2;
  --tx-hint:      #5F5F68;
  --bd:           #2A2C34;
  --card:         #20222A;
}
```

Usare i token nei componenti (`text-[var(--tx)]`, `bg-[var(--card)]`…). Mai hex hardcoded nei
componenti tranne le copertine placeholder.

### 5.2 Stati di lettura (palette riservata)

I quattro stati hanno colori e label fissi:

| Stato | key DB | Label | Colore badge |
|---|---|---|---|
| Da leggere | `to_read` | Da leggere | neutro/grigio |
| In lettura | `reading` | In lettura | Corallo soft |
| Letto | `read` | Letto | verde soft |
| Abbandonato | `abandoned` | Abbandonato | grigio |

Un badge di stato non appare mai senza la sua label testuale.

### 5.3 Dark mode

Class-based (`.dark` su `<html>`), togglato nella pagina Profilo, persistito in
`localStorage['rt.theme']`. Il default è `auto` (segue `prefers-color-scheme`). Ogni colore
custom deve definire entrambe le mode via CSS variables (sezione 5.1).

---

## 6. Flusso a stati del libro

Il dettaglio libro segue un flusso guidato, non chip liberi:

| Stato attuale | CTA principale | Effetto |
|---|---|---|
| `to_read` | "Inizia a leggere" | → `reading`, `started_at = today` |
| `reading` | "Ho terminato il libro" | → `read`, `finished_at = today` |
| `read` / `abandoned` | — (nessuna CTA) | stato terminale |

- La percentuale/avanzamento è visibile **solo** se `status = 'reading'`.
- Il voto (stelle) è disponibile **solo** se `status in ('read', 'abandoned')`.
- "Abbandonato" e "reimposta stato" vivono nel menu ⋯ (fuori dal flusso principale).
- Le date (`started_at`, `finished_at`) sono modificabili a mano (icona calendario → date picker).
- Un libro aggiunto via bottom sheet con stato `read`/`abandoned` ha le date `null` di default
  (l'utente le imposta a mano se vuole).

---

## 7. Aggiunta libro (bottom sheet)

Il bottom sheet di aggiunta è il punto unico per impostare stato e scaffali:

- Si apre toccando "Aggiungi" su qualunque risultato di ricerca.
- Mostra il libro selezionato (copertina + titolo + autore).
- **Stato di lettura**: 4 card (Da leggere / In lettura / Letto / Abbandonato), selezione singola.
- **Scaffali**: pill per ogni scaffale esistente (multi-select) + "Nuovo scaffale…".
- CTA: "Aggiungi alla mia libreria" (coral pieno).
- Il sheet ricorda l'ultima scelta di stato per il backfill rapido.
- Se si sceglie uno scaffale senza aver scelto uno stato, lo stato default è `to_read`.

---

## 8. Components — canonical usage

| Bisogno | Componente | Note |
|---|---|---|
| Card libro in griglia | `BookCard` | copertina 2:3 + titolo + autore |
| Card "In lettura" (banner) | `ReadingCard` | copertina + progress + % |
| Badge stato | `StatusBadge` | mai solo colore, sempre con label |
| Stelle voto | `RatingStars` | interattive o read-only, 1-5 |
| Barra avanzamento | `ProgressBar` | colore accent, border-radius pieno |
| Aggiunta libro | `AddBookSheet` | bottom sheet con stati + scaffali |
| Date picker | `DatePickerPopover` | Popover + Calendar di shadcn |
| Ricerca | `SearchBar` | campo unificato titolo/autore/ISBN |
| Scanner barcode | `BarcodeScanner` | full-width viewfinder + scan line |
| Grafico attività | `ActivityChart` | bar chart pagine/giorno o settimana |
| Grafico libri letti | `BooksChart` | bar chart per anno o mese |
| Grafico generi | `GenresChart` | barre orizzontali con % |
| Loading | `BookCardSkeleton`, `LoadingSpinner` | ogni query ha uno stato loading |
| Vuoto | `EmptyState` | mai tabella/lista silenziosa vuota |
| Errore | toast via sonner | ogni mutation dà feedback |

Bottoni: una sola azione primaria per view (`variant="default"` con bg accent); azioni
secondarie `variant="outline"`; azioni distruttive `variant="destructive"` + `AlertDialog`.

---

## 9. Auth

- **Client**: `@supabase/supabase-js`, singleton in `src/lib/supabase.ts`.
- **Session**: gestita da `useAuth()` (hook globale in `src/hooks/useAuth.ts`), che wrappa
  `supabase.auth.getSession()` e ascolta `onAuthStateChange`.
- **Magic link**: `supabase.auth.signInWithOtp({ email })` — nessuna password.
- **Google OAuth**: `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- **Logout**: `supabase.auth.signOut()` + redirect a `/login`.
- **Callback route**: `/auth/callback` gestisce il token del magic link
  (`supabase.auth.exchangeCodeForSession`).
- **Route guard**: `<AuthGuard>` in `components/layout/AuthGuard.tsx` — redirect a `/login`
  se non autenticato. Non codificare guard nelle pagine.
- Le chiamate a Supabase nelle Edge Function passano il token JWT dell'utente nell'header
  `Authorization: Bearer <token>` (supabase-js lo fa automaticamente).

---

## 10. Data fetching (TanStack Query)

- **QueryClient** configurato in `src/lib/queryClient.ts` con `staleTime: 60_000` default.
- **QueryKey convention**: `['domain', userId, ...params]`
  - es. `['library', userId]`, `['book', userId, bookId]`, `['shelves', userId]`
  - `userId` in ogni key: fondamentale per evitare cache condivisa tra utenti diversi sullo
    stesso device.
- Ogni dominio in `src/api/` esporta funzioni pure che i hook di pagina wrappano con
  `useQuery` / `useMutation`.
- Mutazioni che cambiano la libreria invalidano `['library', userId]` e
  `['stats', userId]` (le stat dipendono dai dati).
- **Ottimismo**: per cambio stato e aggiornamento avanzamento usare `onMutate` per aggiornare
  la cache localmente prima della risposta Supabase, con rollback su `onError`.

---

## 11. Edge Functions

Le due Edge Function su Supabase sono chiamate via `supabase.functions.invoke(...)`:

```ts
// Ricerca libri
const { data } = await supabase.functions.invoke('book-search', {
  body: { q: 'murakami' }
})

// Lookup ISBN (da scanner)
const { data } = await supabase.functions.invoke('book-lookup', {
  body: { isbn: '9788806219215' }
})
```

Il client supabase-js inietta automaticamente il JWT dell'utente nell'header. Mai chiamare
le function con fetch diretto dal frontend — sempre via `supabase.functions.invoke`.

---

## 12. PWA

- `vite-plugin-pwa` genera manifest e service worker.
- Manifest: `name: "Reading Tracker"`, `display: "standalone"`, `theme_color: "#E0644A"`.
- Icone: almeno 192×192 e 512×512 + `apple-touch-icon` 180×180 per iOS.
- Installazione iOS: via Safari → Condividi → Aggiungi alla schermata Home.
- Installazione Android: prompt automatico `beforeinstallprompt`.
- La fotocamera funziona anche nella PWA installata (necessario per lo scanner).

---

## 13. UX writing

- Titoli sono sostantivi ("Libreria", "Cerca", "Profilo").
- Azioni sono verbi ("Aggiungi", "Inizia a leggere", "Ho terminato il libro").
- Ogni mutation dà feedback: toast su successo, errore inline su validazione.
- **i18next / react-i18next** per tutte le stringhe UI. Nessuna stringa hardcoded nei componenti — ogni label passa per `t()`.
- `src/i18n/locales/it.ts` è la source of truth (unica lingua per ora).
- Se in futuro si aggiunge l'inglese, `en.ts` sarà tipizzato `typeof it` così una chiave mancante fa fallire il build.
- Numeri e date passano sempre per `src/lib/format.ts` — mai `toLocaleString()` inline.

---

## 14. Accessibility

- Icone interattive hanno `aria-label`; quelle decorative `aria-hidden`.
- Il colore non è mai l'unico indicatore di significato: i badge affiancano colore + testo.
- Tutti i campi form hanno `<Label htmlFor>`; campi non validi settano `aria-invalid`.
- Tutto raggiungibile da tastiera via elementi nativi o primitive Radix.

---

## 15. Supabase — note implementative

- **Variabili d'ambiente**: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` nel `.env`.
  Mai committare `.env` su Git (è in `.gitignore`).
- **RLS**: le policy garantiscono l'isolamento per utente a livello DB. Il frontend non filtra
  mai per `user_id` nelle query — ci pensa Supabase automaticamente via `auth.uid()`.
- **Realtime**: non usato nell'MVP. Se aggiunto in futuro, i subscription vanno in hook
  dedicati con cleanup su `useEffect` return.
- **Storage**: non usato nell'MVP (le copertine vengono dalle API esterne).
- **Keep-alive**: GitHub Action nella repo backend che fa una query ogni ~5 giorni per evitare
  la pausa del progetto free.
