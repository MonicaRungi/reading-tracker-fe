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
| Scaffali | library | Elenco scaffali e mensole con i dorsi (§16) |
| Profilo | user | Statistiche, preferenze tema, logout |

La bottom nav è sempre visibile nell'app shell autenticata. Le pagine di dettaglio (libro, scaffale)
sono push-navigate sopra la tab corrente — la bottom nav resta visibile.
Unica eccezione: con la tastiera virtuale aperta la bottom nav si nasconde (`useVirtualKeyboard`), perché
su iOS un elemento fixed in basso salirebbe sopra la tastiera, a metà schermo.

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
- **zxing-js** (`@zxing/browser` + `@zxing/library`) per la scansione barcode da fotocamera.
- **vite-plugin-pwa** per la PWA (manifest, service worker, installabilità).

---

## 3. File and code conventions

```
src/
  api/          facade tipizzato verso Supabase e Edge Function
  components/
    ui/         primitivi shadcn (generati; non editare a mano)
    layout/     app shell (AppLayout, BottomNav, AuthGuard, AppErrorBoundary: al posto della pagina
                bianca, in caso di errore di render, mostra "Ricarica" e i dettagli dell'errore)
    shared/     componenti prodotto riusabili (BookCard, StatusBadge, Spine, …)
  hooks/        hook globali (useAuth, useTheme, useNotificationsRealtime, …)
  i18n/         setup i18next + locales/it.ts (source of truth)
  lib/          logica pura: supabase.ts, format.ts, queryClient.ts, goals.ts, spine/, …
  pages/        componenti route, una cartella per pagina
  types/        database.types.ts (generato da Supabase, alias per riga in fondo)
```

- Le pagine compongono componenti shared; non definiscono primitive visive.
- `src/types/database.types.ts` rispecchia lo schema Supabase; i tipi di dominio stanno in
  `src/api/<dominio>/types.ts` e partono dai suoi alias. Quando una tabella cambia si rigenera
  `database.types.ts` e si adatta `src/api/` — le pagine non toccano nulla.

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
- **Scroll fra le rotte** (`useScrollRestoration`, chiamato in `App.tsx`): una navigazione in
  avanti (link, tab, `navigate`) apre la pagina dall'alto; indietro/avanti del browser riporta
  alla posizione lasciata. Riguarda solo lo scroll della finestra, non le aree con scroll proprio.

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
  **Eccezione**: il titolo sui dorsi dei libri (§16) usa il serif di sistema (`font-serif`:
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

La palette è mappata sui token semantici shadcn in `src/index.css` (`:root` e `.dark`, esposti
a Tailwind v4 con `@theme inline`; non c'è `tailwind.config.ts`):

| Identità (§5.0) | Token | Chiaro | Scuro |
|---|---|---|---|
| Accento corallo | `--primary` (e `--ring`) | `#E0644A` | `#E0644A` |
| Soft corallo | `--accent` (testo: `--accent-foreground` = corallo) | `#FBE9E3` | `#3D1A12` |
| Testo primario | `--foreground` | `#1B1714` | `#F0EDE6` |
| Testo secondario | `--muted-foreground` | `#938C84` | `#9A9AA2` |
| Testo hint | `--hint` | `#B7AFA7` | `#5F5F68` |
| Background | `--background` | `#FFFFFF` | `#15161B` |
| Card/surface | `--card` | `#FAF8F6` | `#20222A` |
| Bordo | `--border` | `#EFECE9` | `#2A2C34` |
| Chip inattivo | `--chip` | `#F1EFEC` | `#20222A` |

Estensioni custom: `--hint`, `--chip`, `--status-<stato>-bg/-fg` (§5.2), `--card-shadow`.
Usare le utility Tailwind dei token (`bg-primary`, `bg-accent`, `text-muted-foreground`,
`text-hint`, `bg-card`…). Mai hex hardcoded nei componenti tranne le copertine placeholder.

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
`localStorage['rt.theme']` (applicato già da uno script in `index.html`, senza flash). Il
default è `auto` (segue `prefers-color-scheme`). Il toggle scrive anche `profiles.theme`, che
però non viene riletto: la fonte resta il dispositivo. Ogni colore custom deve definire
entrambe le mode via CSS variables (sezione 5.1).

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
- Un libro aggiunto via bottom sheet prende `started_at = today` se `reading` e
  `finished_at = today` se `read`; con `to_read`/`abandoned` le date restano `null` (l'utente
  le imposta a mano se vuole).
- Passando a `read`, le pagine non ancora registrate contano come lette oggi
  (`current_page` = totale, delta su `reading_log` via RPC `log_pages_read`).

---

## 7. Aggiunta libro (bottom sheet)

Il bottom sheet di aggiunta è il punto unico per impostare stato e scaffali:

- Si apre toccando "Aggiungi" su qualunque risultato di ricerca.
- Mostra il libro selezionato (copertina + titolo + autore).
- **Stato di lettura**: 4 card (Da leggere / In lettura / Letto / Abbandonato), selezione singola.
- **Scaffali**: pill per ogni scaffale esistente (multi-select) + "Nuovo scaffale…".
- **Promemoria di uscita** (`ReleaseReminderCard`): solo per libri con data di pubblicazione
  completa nel futuro; crea una riga in `release_reminders`.
- CTA: "Aggiungi alla mia libreria" (coral pieno).
- A ogni apertura lo stato riparte da `to_read` (default anche se si sceglie solo uno scaffale).
- Il libro va nel catalogo tramite la Edge Function `book-save` (§11), mai con insert diretto.

---

## 8. Components — canonical usage

| Bisogno | Componente | Note |
|---|---|---|
| Card libro in griglia | `BookCard` | copertina 2:3 + titolo + autore |
| Card "In lettura" (banner) | `ReadingCard` | copertina + progress + % |
| Badge stato | `StatusBadge` | mai solo colore, sempre con label |
| Stelle voto | `RatingSection` (dettaglio libro) | interattive o bloccate, 1-5 |
| Barra avanzamento | `ProgressBar` | colore accent, border-radius pieno |
| Aggiunta libro | `AddBookSheet` | bottom sheet con stati + scaffali |
| Dorso libro | `Spine` | foto del dorso o dorso generato (§16) |
| Crea/modifica scaffale | `ShelfFormSheet` | nome + selettore tema (`ShelfThemePicker`) |
| Date picker | `DatePickerSheet` | Calendar di shadcn in un bottom sheet; pillola "mese anno" che apre la griglia dei mesi (3×4) e da lì quella degli anni (12 per pagina); scegliere mese o anno torna ai giorni senza chiudere, si salva solo con Conferma |
| Ricerca | `SearchField` | campo unificato titolo/autore/ISBN |
| Scanner barcode | `BarcodeScanner` | full-width viewfinder + scan line |
| Grafico attività | `ActivitySection` (Profilo, su `BarChart`) | pagine per giorno o settimana |
| Grafico libri letti | `BooksReadSection` (Profilo, su `BarChart`) | per anno o mese |
| Grafico generi | `GenresSection` (Profilo, `GenreRow`) | barre orizzontali con % |
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
- Dopo ogni mutation che tocca libreria, avanzamento o obiettivi si chiama
  `invalidateProgressQueries` (`lib/progressQueries.ts`): prima la RPC
  `sync_goal_achievements` (il DB chiude come `achieved` gli obiettivi raggiunti e sblocca i
  badge via trigger; il client non può farlo da solo), poi invalida obiettivi e badge.
- Le pagine lette si registrano solo con la RPC `log_pages_read(p_log_date, p_delta)`: somma
  atomica su `reading_log` e su `profiles.total_pages_read`.
- **Ottimismo**: per cambio stato e aggiornamento avanzamento usare `onMutate` per aggiornare
  la cache localmente prima della risposta Supabase, con rollback su `onError`.

---

## 11. Edge Functions

Cinque Edge Function su Supabase, tutte solo per utenti loggati (401 senza JWT valido),
chiamate dai wrapper in `src/api/` via `supabase.functions.invoke(...)` (contratto completo in
`CONTEXT.md`):

| Function | Uso | Wrapper |
|---|---|---|
| `book-search` | ricerca titolo/autore/ISBN, catalogo locale prima delle fonti esterne | `api/books` `searchBooks` |
| `book-lookup` | lookup ISBN dallo scanner | `api/books` `lookupBookByIsbn` |
| `book-save` | unica scrittura del catalogo `books`: aggiunta (`{ book }`) e refresh (`{ bookId, refresh: true }`) | `api/books` `upsertBook`, `refreshBook` |
| `cover-proxy` | copertine Google Books con CORS per il canvas (§16) | `api/books` `fetchCoverBlob` |
| `import-goodreads` | import CSV (`{ csv }`) | `api/imports` → `importGoodreads` |

```ts
const { data } = await supabase.functions.invoke('book-search', {
  body: { q: 'murakami' }
})
```

Il client supabase-js inietta automaticamente il JWT dell'utente nell'header. Mai chiamare
le function con fetch diretto dal frontend — sempre via `supabase.functions.invoke`.
**Unica eccezione**: `cover-proxy` risponde con un'immagine, che `invoke` leggerebbe come
testo; `fetchCoverBlob` usa `fetch` con `Authorization: Bearer <token>` e `apikey`.
Il client non scrive mai in `books`: oltre a `book-save` c'è solo la RPC
`set_book_page_count` per correggere il numero di pagine.

---

## 12. PWA

- `vite-plugin-pwa` genera manifest e service worker.
- Manifest (`vite.config.ts`): `name`/`short_name: "Shelfy"`, `lang: "it"`,
  `display: "standalone"`, `theme_color: "#FBEDE8"`, `background_color: "#FFFFFF"`,
  `registerType: "autoUpdate"`. Il `<meta name="theme-color">` segue il tema a runtime (soft
  corallo `--accent`: `#FBE9E3` chiaro, `#3D1A12` scuro).
- Icone: `pwa-192x192.png`, `pwa-512x512.png` + `apple-touch-icon.png` per iOS.
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
- **Scritture riservate al DB**: il client non scrive `books` (§11), `notifications`,
  sblocchi di `user_badges` (solo `is_featured`), `profiles.total_pages_read` (solo
  `display_name`/`theme`), né lo stato `achieved` degli obiettivi (`sync_goal_achievements`).
- **Realtime**: in uso per le notifiche (badge sbloccati, rinnovo obiettivi, uscite libri),
  solo in-app: niente push né email. I subscription vivono in hook dedicati
  (`useNotificationsRealtime`) con cleanup su `useEffect` return.
- **Storage**: in uso solo per le foto dei dorsi (bucket privato `spines`, §16). Le
  copertine continuano ad arrivare dalle API esterne.
- **Job pianificati**: GitHub Actions nella repo backend (chiusura obiettivi, promemoria di
  uscita, pulizia dorsi orfani / `reading_log` / notifiche, keep-alive ogni 5 giorni per
  evitare la pausa del progetto free). Elenco in `CONTEXT.md`.

---

## 16. Scaffali a mensola

Gli scaffali sono l'unico concetto di "scaffale" dell'app e hanno un'unica vista: la mensola,
con i libri in piedi mostrati come dorsi.

- **Rotte**: `/shelves` (elenco: crea, modifica, elimina) e `/shelves/:shelfId` (mensola).
  Uno `:shelfId` inesistente o nascosto dalla RLS mostra un `EmptyState` con ritorno all'elenco.
- **Tema della mensola**: `wood` | `white` | `night` | `sage` | `lilac` | `terracotta`, scelto alla creazione e
  modificabile. È **indipendente dal dark mode dell'app**: i colori sono CSS variables per
  attributo (`[data-shelf-theme="…"]` in `index.css`: `--shelf-back`, `--shelf-board`,
  `--shelf-board-light`, `--shelf-board-shadow`, `--shelf-plank-grain`, `--shelf-wall-grain`)
  e non vengono ridefiniti sotto `.dark`. Ogni tema ha il suo piano (legno, bianco, blu notte,
  salvia, malva, cotto). Mai hex dei temi nei componenti.
- **Effetto legno** (tutti i temi): venatura generata da un SVG inline (`feTurbulence`
  stirato nel verso delle fibre) — orizzontale sui piani con fibre scure e chiare, verticale
  sulla parete a pannelli con le fughe fra le assi. Ogni tema tinge le venature con i propri
  colori (Bianco: legno sbiancato e leggero). Nessuna immagine da scaricare; per ritoccarla si
  cambiano `baseFrequency` (fittezza) e la riga alpha di `feColorMatrix` (intensità).
  La texture della parete si ripete a piastrelle: lì `stitchTiles='stitch'` e una regione del
  filtro pari alla piastrella (`x='0' y='0' width='100%' height='100%'`) sono obbligatori, senza
  si vedono le giunzioni. I piani invece stirano una sola texture su tutta la lunghezza
  (`100% 100%`): non hanno giunzioni e non vanno toccati, perché quelle due opzioni cambiano la
  densità del rumore e le venature si appiattiscono. La parete resta ferma
  mentre le mensole scorrono (sfondo con `background-attachment` predefinito, non `local`).
- **Cornice** (`shelf-frame`): bordo sottile dello stesso materiale dei piani del tema (6 px,
  5 px sotto i 640 px), con luce dall'alto e ombra interna. È un elemento esterno che non
  scorre: dentro c'è la parete, con lo scroll proprio, così i dorsi non passano sopra il
  bordo. Spessore e raggio si regolano con `--shelf-frame-width` / `--shelf-frame-radius`
  (anteprime: 4 px senza raggio, perché gli angoli li arrotonda la card; campioni: 3 px).
- **Utility della mensola** (`index.css`): `shelf-wall` (parete con luce dall'alto),
  `shelf-board` (mobile: righe impilate, gap 28 px), `shelf-books` (riga di dorsi allineati in
  basso, min-height 190 px / 168 px sotto i 640 px), `shelf-plank` (piano con venatura, bordo
  frontale e ombra; altezza regolabile con `--plank-height` per anteprime e campioni), `spine` e
  `spine-title` (volume, ombre, titolo verticale con ellissi). Gradienti e pseudo-elementi
  stanno lì, non nei componenti.
- **Dettaglio**: header con nome e numero di libri sotto il titolo; il mobile occupa quasi
  tutta la larghezza e riempie l'altezza fino alla bottom nav. La pagina non scrolla: scorrono
  solo le mensole dentro il mobile (`overflow-y-auto`, `overscroll-contain`). Il mobile è
  marcato `data-scroll-area`, così nella PWA il pull-to-refresh parte solo se le mensole sono
  in cima (`usePullToRefresh`). I dorsi sono `data-no-pull-refresh`: una tirata verso il
  basso che parte da un dorso è sempre uno spostamento. L'hook ascolta la fine del tocco
  anche sull'elemento di partenza, perché se viene smontato durante il gesto (un dorso che
  cambia riga) gli eventi non risalgono più fino a `window`.
- **Layout a flusso**: la larghezza del contenitore è misurata con `ResizeObserver`
  (`useElementWidth`); i dorsi riempiono una riga finché c'è spazio, poi si passa alla
  mensola successiva (`lib/shelfLayout.ts`). Niente coordinate libere: l'ordine è `position`.
  Le righe hanno altezza fissa, così la variazione d'altezza dei dorsi non sposta le tavole.
- **Dorso generato** (`lib/spine/generated.ts`), deterministica da `book.id`:
  colore da una palette curata di 12 toni da rilegatura (mai estratto dalla copertina:
  le immagini esterne sono cross-origin), larghezza proporzionale a `page_count` (18–44 px
  all'altezza di riferimento 160 px), altezza ±8%, un libro su 8 leggermente inclinato (max
  1,2°), solo il titolo in verticale (`writing-mode: vertical-rl`, serif 11 px a 150 px di
  altezza) con ellissi, colore del testo scelto dalla luminanza. Volume e bordi in rilievo
  separano i dorsi anche quando il loro colore è vicino a quello della parete.
- **Foto del dorso**: collegata al `library_item` (per utente), non al catalogo `books`.
  `spine_ratio` (larghezza/altezza) è salvato nel DB, così il layout riserva lo spazio prima
  che l'immagine sia scaricata.
  - **Dove**: dettaglio libro, accanto alla copertina e alla stessa altezza (`SpineSection`).
    Senza foto è uno spazio tratteggiato corallo (40 × 144 px, angoli come la copertina) con "+";
    con la foto mostra il dorso fotografato. Tap → `SpineCaptureSheet`, in tre tappe:
    1. **Foto del dorso**: illustrazione `spine-photo` (variante chiara e scura), tre
       consigli con la lampadina, "Scatta foto" (pieno; fotocamera nativa,
       `capture="environment"`) e "Scegli da galleria" (bordato), impilati. Con una foto già
       presente anche "Rimuovi la foto" (con conferma: torna il dorso generato).
    2. **Ritaglia il dorso**: barra propria "Annulla · titolo · Avanti" al posto della X;
       "Annulla" torna alla tappa 1. Foto su fondo scuro con i 4 angoli (`SpineCropper`),
       "Ruota a sinistra" / "Ruota a destra" (90°, gli angoli tornano al rettangolo iniziale).
       Gli angoli hanno un'area di tocco di 44 px; trascinandoli mantengono la distanza dal dito
       (non saltano sotto il dito) e una lente rotonda (`CropLoupe`, 3×) mostra il punto ingrandito
       con i lati del ritaglio e un mirino, sopra il dito o di lato vicino al bordo alto.
    3. **Scegli la resa**: titolo centrato, tre card (Originale / Migliorata predefinita /
       Vivida; quella scelta ha bordo corallo e spunta), "Salva il dorso". Se la foto sembra
       sfocata, al posto del pulsante compare l'avviso con "Rifai" / "Usa comunque". La sfocatura
       si misura con il metodo "re-blur" (`lib/spine/quality.ts`: 0 nitida … 1 sfocata, soglia 0,4),
       che non scambia la grana delle foto con poca luce né il contrasto alto per nitidezza.
  - **Pipeline** (`lib/spine/`, in un worker con ripiego sul main thread): raddrizzamento
    prospettico, miglioramento che non cambia la tinta (bilanciamento, esposizione e punti di
    nero/bianco stimati sulla foto intera; livelli, gamma e curva sulla sola luminanza),
    controllo di nitidezza, compressione WebP o JPEG sotto 512 KB (Safari produce JPEG). Le
    costanti stanno in `lib/spine/config.ts`. Si carica solo l'immagine elaborata.
  - **Storage**: bucket privato `spines`, path `{user_id}/{library_item_id}-{timestamp}.{webp|jpg}`
    (`api/spines`). Sostituzione = nuovo file + aggiornamento del libro + eliminazione del
    vecchio; se il DB fallisce il file nuovo viene tolto. Eliminando un libro si toglie prima la
    sua foto. I file rimasti orfani li elimina la GitHub Action notturna.
  - **Visualizzazione**: URL firmati (1 h) in un'unica richiesta per pagina (`useSpineUrls`,
    `staleTime` 50 min). `SpinePhoto` mostra la foto come **sfondo CSS** (utility `spine-photo` /
    `spine-photo-lying`), non come `<img>`: su iOS la pressione lunga non la ingrandisce né la
    seleziona, e prende le stesse luci e ombre del dorso generato. Il caricamento lo segue
    `useImageLoad`: segnaposto della misura della foto finché l'URL non arriva o se l'immagine non
    si carica; in quel caso chiede URL nuovi, al massimo una volta al minuto.
- **Elenco**: header con titolo, sottotitolo e pulsante "+" circolare; card con anteprima a
  mini-mensola (primi 12 libri, sempre come dorsi in piedi), nome, conteggio e menu ⋯ (modifica nome e tema, elimina).
  Dopo la creazione si apre il dettaglio dello scaffale.
- **Selettore tema**: griglia a 2 colonne (3 righe con 6 temi) di anteprime (parete, dorsi, piano) con la label sotto; il
  tema scelto ha bordo e testo corallo. Le anteprime non mostrano decorazioni.
- **Eliminazione**: `ConfirmDialog` con testo esplicito — i libri restano in libreria
  (`shelf_items` va in cascata, `library_items` no).
- **Aggiunta libri**: sheet con la libreria paginata, ricerca server-side e multi-selezione;
  esclude i libri già presenti. "Seleziona tutti" / "Deseleziona tutti" (con almeno 2 libri)
  agisce sui libri visibili, cioè quelli trovati dalla ricerca e già caricati. Resta valido anche il percorso da `AddBookSheet`.
- **Condividi lo scaffale** (menu ⋯ del dettaglio → `ShareShelfSheet`): l'immagine si ridisegna su canvas
  (`lib/shelfExport/`, 1080 px di larghezza) con le misure della mensola a schermo: la larghezza delle
  righe è misurata sulla pagina (`[data-shelf-board]`), altezze, piani e margini sono quelli del
  dispositivo, quindi le righe vanno a capo negli stessi punti; stesse pile, decorazioni e righe chiuse centrate.
  Sfondo e testi seguono il tema dell’app (chiaro: crema `--card`; scuro: `--background`), e accanto alla
  firma "Shelfy" in basso c’è l’illustrazione dei libri (`books-hero.png` o `books-hero-dark.png`); in alto
  nome e numero di libri. Colori e venature della mensola dal CSS del tema; se il browser considera "sporche" le venature SVG, l'immagine si rifà senza.
  Le copertine di Google Books (senza CORS) passano dalla Edge Function `cover-proxy` (solo utenti
  loggati, solo host di Google Books, solo immagini fino a 2 MB); Open Library e le foto dei dorsi
  (Storage) si scaricano diretti. Un'immagine che non si carica diventa dorso o copertina generati.
  Lo sheet mostra l'anteprima e poi "Condividi" (foglio del telefono, `navigator.share` con il file) o
  "Salva l'immagine" dove la condivisione di file non c'è: due tocchi, perché Safari apre il foglio
  di condivisione solo subito dopo un gesto.
- **Righe**: quelle chiuse (il blocco successivo è andato a capo) sono centrate; l'ultima, ancora da
  riempire, resta allineata a sinistra.
- **Decorazioni** (`shelf_items.item_type = 'decor'`, `decor_key`): oggetti illustrati (pianta,
  cactus, candela, busto, …) dal catalogo `lib/decor.ts`; immagini WebP con trasparenza in
  `src/assets/decor/`, a 3× l'altezza a schermo, con margini tagliati e aloni dello scontorno
  ripuliti. Ogni voce ha l'altezza rispetto a un dorso in piedi e l'eventuale parte che sporge sotto
  la base (es. foglie ricadenti, disegnate davanti al bordo del piano). Si aggiungono dal pulsante ✨
  nell'header (sheet "Decorazioni", griglia 3 colonne, un tocco = in fondo alla mensola); si spostano
  e si tolgono come i libri (con "Annulla"), ma non si aprono e stanno sempre sul piano: niente
  cassetto delle posizioni (provato "Sopra i libri", tolto perché confondeva). Le decorazioni **appese**
  (`hanging`, es. il filo di polaroid) sono alte quanto tutta la riga (`shelfRowHeight()`, uguale al
  `min-height` di `shelf-books`) e agganciate in alto: il filo, che nell'immagine parte dal bordo
  superiore, tocca il piano di sopra. Per i libri, rilasciando
  sul cassetto si salva anche lo spostamento fatto nello stesso trascinamento.
  Immagini come sfondo CSS (niente `<img>`: su iOS la pressione lunga lo ingrandirebbe). Non contano
  nel numero di libri e non compaiono nell'anteprima dell'elenco. Una chiave non più in catalogo
  resta nello scaffale (e nell'ordine) ma non si disegna.
- **Posizione del libro** (`shelf_items.display`, per scaffale): `spine` in piedi (dorso),
  `stack` sdraiato, `cover` di fronte (copertina 2:3, o copertina generata con colore e titolo del
  dorso se manca). La mensola dispone **blocchi** (`lib/shelfUnits.ts`): un dorso, una copertina o
  una pila; i sdraiati consecutivi nell'ordine formano una pila (il primo in basso) fino
  all'altezza di un dorso in piedi, poi ne comincia un'altra. Riordino e riflusso restano
  sull'ordine piatto dei libri: le pile si ricompongono da sole. Componenti condivisi
  `ShelfBookFace` (sceglie fra `Spine`, `LyingSpine`, `BookCoverFace`), usati anche dalla copia
  trascinata e dalle anteprime dell'elenco. Il client può modificare solo questa colonna di
  `shelf_items` (grant per colonna + policy).
  - **Cassetto delle posizioni** (`DisplayDrawer`): durante il trascinamento compare una
    linguetta "‹" sul bordo destro del mobile; portandoci il libro si apre un cassetto con tre
    zone di rilascio (In verticale / In orizzontale / Di fronte, con miniatura; quella attuale
    evidenziata). Rilasciato lì, il libro cambia posizione e non ordine; sopra il cassetto
    l'ordine non cambia. Il cambio è ottimistico, in fila con riordino e rimozione.
  - **Menu contestuale** (`BookDisplayMenu`, popover shadcn ancorato al libro), per mouse e
    tastiera: tasto destro o tasto menu / Maiusc+F10, stesse tre voci con la spunta.
- **Riordino senza modalità** (dettaglio scaffale): un tap su un dorso apre il libro, la
  **pressione lunga** la solleva e si trascina; al rilascio è già salvato. Niente pulsante
  "Riordina" né "Fine": una modalità non darebbe vantaggi, perché dentro il mobile scorrevole
  la pressione lunga serve comunque a distinguere il trascinamento dallo scroll. Il click
  che il browser emette subito dopo un trascinamento viene ignorato (300 ms), così il libro
  appena spostato non si apre. Da tastiera: Invio apre, Spazio prende il libro, frecce lo
  spostano, Esc annulla.
  - **Suggerimento** "Tieni premuto e trascina per riordinare" in fondo alle mensole, finché
    non si è riordinato una volta (`rt.shelfReorderHintSeen` in localStorage).
  - **Durante il trascinamento**: la copia del dorso segue il dito, sollevata e inclinata,
    con l'etichetta "Sposta" (`DragOverlay`); al suo posto un segnaposto tratteggiato
    (`--shelf-placeholder` del tema). In fondo al mobile compare la zona
    "Trascina qui per rimuovere".
  - **dnd-kit** (`@dnd-kit/core` + `sortable`): sensori mouse (5 px), touch (pressione di
    250 ms, tolleranza 5 px; dorsi con `touch-action: manipulation` e senza menu di sistema
    iOS, quindi prima dell'attivazione lo scroll resta nativo) e tastiera. Annunci e
    istruzioni per screen reader in italiano via `t()`.
  - **Riflusso dal vivo**: niente trasformazioni di dnd-kit (stirerebbero dorsi di larghezza
    diversa). L'ordine cambia subito e il layout a flusso ricompone le righe. Collisione con
    `pointerWithin` (solo sopra un dorso o la zona "rimuovi") e almeno 8 px di movimento fra
    due spostamenti: senza, al punto di a capo il riflusso si alimenta da solo all'infinito.
  - **Salvataggio**: una sola chiamata a `reorder_shelf` al rilascio, ottimistica (`onMutate`
    + rollback e toast in `onError`), in fila con le altre mutation dello scaffale (`scope`).
  - **Rimozione**: rilasciando sulla zona in fondo; ottimistica, con toast "Annulla" per 5 s
    che reinserisce il libro e lo rimette nella posizione di prima. Il libro resta in libreria.
- **QueryKey**: `['shelves', userId]` per l'elenco, `['shelf', userId, shelfId]` per il
  dettaglio. Le mutation sugli scaffali invalidano entrambe; aggiunta ed eliminazione di un
  libro invalidano anche queste.
