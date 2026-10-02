# Reading Tracker — Frontend Design Standard

Design standard per il frontend del Reading Tracker (React 19 + Vite + TypeScript, shadcn/ui,
Tailwind CSS v4). Questo documento è normativo: la nuova UI deve seguirlo, e le deviazioni
devono essere discusse e registrate qui.

---

## 1. Product structure

L'applicazione è una **SPA mobile-first** per uso personale (multi-utente, ma senza multi-tenancy).
Un unico codebase, un'unica face. L'accesso è protetto da autenticazione Supabase (solo
Google OAuth).

### 1.1 Navigazione

Quattro sezioni principali, accessibili dalla **bottom navigation** (mobile-first):

| Tab | Icona | Contenuto |
|---|---|---|
| Home / Libreria | house | Banner "Continua a leggere" + griglia libri |
| Cerca | search | Ricerca testuale / ISBN / scan barcode |
| Scaffali | library | Elenco scaffali e mensole con le costole (§16) |
| Profilo | user | Statistiche, preferenze tema, logout |

La bottom nav è sempre visibile nell'app shell autenticata. Le pagine di dettaglio (libro, scaffale)
sono push-navigate sopra la tab corrente — la bottom nav resta visibile.

### 1.2 Flusso auth

```
/ (root)
  ├── non autenticato → /login (Google OAuth)
  ├── autenticato → /library (home)
  └── /auth/callback (redirect di ritorno da Google OAuth)
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
  **Eccezione**: il titolo sulle costole dei libri (§16) usa il serif di sistema (`font-serif`:
  "New York" su iOS, Georgia altrove), sempre senza font da scaricare.
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
| Costola libro | `Spine` | foto della costola o costola generata (§16) |
| Crea/modifica scaffale | `ShelfFormSheet` | nome + selettore tema (`ShelfThemePicker`) |
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
- **Google OAuth**: `supabase.auth.signInWithOAuth({ provider: 'google' })` — unico metodo di
  accesso. Il magic link è stato rimosso (incompatibile con la PWA installata su iOS: il link
  si apre in Safari, non nell'app).
- **Logout**: `supabase.auth.signOut()` + redirect a `/login`.
- **Callback route**: `/auth/callback` è il `redirectTo` di Google OAuth: supabase-js scambia
  il code della URL e la pagina attende `SIGNED_IN` per andare a `/library`.
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
- **Realtime**: in uso per le notifiche (badge sbloccati, rinnovo obiettivi, uscite libri).
  I subscription vivono in hook dedicati (`useNotificationsRealtime`) con cleanup su
  `useEffect` return.
- **Storage**: in uso solo per le foto delle costole (bucket privato `spines`, §16). Le
  copertine continuano ad arrivare dalle API esterne.
- **Keep-alive**: GitHub Action nella repo backend che fa una query ogni ~5 giorni per evitare
  la pausa del progetto free.

---

## 16. Scaffali a mensola

Gli scaffali sono l'unico concetto di "scaffale" dell'app e hanno un'unica vista: la mensola,
con i libri in piedi mostrati come costole.

- **Rotte**: `/shelves` (elenco: crea, modifica, elimina) e `/shelves/:shelfId` (mensola).
  Uno `:shelfId` inesistente o nascosto dalla RLS mostra un `EmptyState` con ritorno all'elenco.
- **Tema della mensola**: `wood` | `white` | `night` | `sage`, scelto alla creazione e
  modificabile. È **indipendente dal dark mode dell'app**: i colori sono CSS variables per
  attributo (`[data-shelf-theme="…"]` in `index.css`: `--shelf-back`, `--shelf-board`,
  `--shelf-board-light`, `--shelf-board-shadow`, `--shelf-plank-grain`, `--shelf-wall-grain`)
  e non vengono ridefiniti sotto `.dark`. Ogni tema ha il suo piano (legno, bianco, blu notte,
  salvia). Mai hex dei temi nei componenti.
- **Effetto legno** (tutti i temi): venatura generata da un SVG inline (`feTurbulence`
  stirato nel verso delle fibre) — orizzontale sui piani con fibre scure e chiare, verticale
  sulla parete a pannelli con le fughe fra le assi. Ogni tema tinge le venature con i propri
  colori (Bianco: legno sbiancato e leggero). Nessuna immagine da scaricare; per ritoccarla si
  cambiano `baseFrequency` (fittezza) e la riga alpha di `feColorMatrix` (intensità).
  La texture della parete si ripete a piastrelle: lì `stitchTiles='stitch'` e una regione del
  filtro pari alla piastrella (`x='0' y='0' width='100%' height='100%'`) sono obbligatori, senza
  si vedono le giunzioni. I piani invece stirano una sola texture su tutta la lunghezza
  (`100% 100%`): non hanno giunzioni e non vanno toccati, perché quelle due opzioni cambiano la
  densità del rumore e le venature si appiattiscono. La parete usa
  `background-attachment: local` e scorre con le mensole.
- **Cornice** (`shelf-frame`): bordo sottile dello stesso materiale dei piani del tema (6 px,
  5 px sotto i 640 px), con luce dall'alto e ombra interna. È un elemento esterno che non
  scorre: dentro c'è la parete, con lo scroll proprio, così le costole non passano sopra il
  bordo. Spessore e raggio si regolano con `--shelf-frame-width` / `--shelf-frame-radius`
  (anteprime: 4 px senza raggio, perché gli angoli li arrotonda la card; campioni: 3 px).
- **Utility della mensola** (`index.css`): `shelf-wall` (parete con luce dall'alto),
  `shelf-board` (mobile: righe impilate, gap 28 px), `shelf-books` (riga di costole allineate in
  basso, min-height 190 px / 168 px sotto i 640 px), `shelf-plank` (piano con venatura, bordo
  frontale e ombra; altezza regolabile con `--plank-height` per anteprime e campioni), `spine` e
  `spine-title` (volume, ombre, titolo verticale con ellissi). Gradienti e pseudo-elementi
  stanno lì, non nei componenti.
- **Dettaglio**: header con nome e numero di libri sotto il titolo; il mobile occupa quasi
  tutta la larghezza e riempie l'altezza fino alla bottom nav. La pagina non scrolla: scorrono
  solo le mensole dentro il mobile (`overflow-y-auto`, `overscroll-contain`). Il mobile è
  marcato `data-scroll-area`, così nella PWA il pull-to-refresh parte solo se le mensole sono
  in cima (`usePullToRefresh`).
- **Layout a flusso**: la larghezza del contenitore è misurata con `ResizeObserver`
  (`useElementWidth`); le costole riempiono una riga finché c'è spazio, poi si passa alla
  mensola successiva (`lib/shelfLayout.ts`). Niente coordinate libere: l'ordine è `position`.
  Le righe hanno altezza fissa, così la variazione d'altezza delle costole non sposta le tavole.
- **Costola generata** (`lib/spine/generated.ts`), deterministica da `book.id`:
  colore da una palette curata di 12 toni da rilegatura (mai estratto dalla copertina:
  le immagini esterne sono cross-origin), larghezza proporzionale a `page_count` (18–44 px
  all'altezza di riferimento 160 px), altezza ±8%, un libro su 8 leggermente inclinato (max
  1,2°), solo il titolo in verticale (`writing-mode: vertical-rl`, serif 11 px a 150 px di
  altezza) con ellissi, colore del testo scelto dalla luminanza. Volume e bordi in rilievo
  separano le costole anche quando il loro colore è vicino a quello della parete.
- **Foto della costola**: collegata al `library_item` (per utente), non al catalogo `books`.
  `spine_ratio` (larghezza/altezza) è salvato nel DB, così il layout riserva lo spazio prima
  che l'immagine sia scaricata.
- **Elenco**: header con titolo, sottotitolo e pulsante "+" circolare; card con anteprima a
  mini-mensola (primi 12 libri), nome, conteggio e menu ⋯ (modifica nome e tema, elimina).
  Dopo la creazione si apre il dettaglio dello scaffale.
- **Selettore tema**: griglia 2×2 di anteprime (parete, costole, piano) con la label sotto; il
  tema scelto ha bordo e testo corallo. Niente decorazioni finché non arriva la Fase 4.
- **Eliminazione**: `ConfirmDialog` con testo esplicito — i libri restano in libreria
  (`shelf_items` va in cascata, `library_items` no).
- **Aggiunta libri**: sheet con la libreria paginata, ricerca server-side e multi-selezione;
  esclude i libri già presenti. Resta valido anche il percorso da `AddBookSheet`.
- **QueryKey**: `['shelves', userId]` per l'elenco, `['shelf', userId, shelfId]` per il
  dettaglio. Le mutation sugli scaffali invalidano entrambe; aggiunta ed eliminazione di un
  libro invalidano anche queste.
