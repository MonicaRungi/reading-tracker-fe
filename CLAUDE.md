# CLAUDE.md — Code Organization Conventions

> Questo file definisce **solo** come il codice è distribuito e ordinato nel codebase — struttura
> delle cartelle, naming dei file e dove vive la logica. Scelte UI, theming, comportamento dei
> componenti, auth, modelli di dominio e routing appartengono a `DESIGN.md` — non duplicarli qui.

## Folder structure

```
src/
  api/<domain>/            # data layer, una cartella per dominio
    api.ts                 # funzioni che i consumer chiamano
    types.ts               # tipi del dominio
    index.ts               # barrel: export * from "./types"; export * from "./api";
  components/
    layout/                # app shell: bottom nav, route guards, layout wrapper
    shared/                # componenti domain-agnostic riusabili in ≥2 pagine
  pages/<Name>Page/
    index.tsx              # solo composizione JSX — vedi "Pages contain no logic"
    schema.ts              # schema di validazione, se la pagina possiede un form
    <Entity>Sheet.tsx      # sheet/dialog page-local (es. AddBookSheet, StatusSheet)
    hooks/
      use<Name>Data.ts     # tutta la logica data/state per questa pagina
  lib/                     # utility cross-cutting (format.ts, barcode.ts, ecc.)
  hooks/                   # hook globali (useAuth, useTheme, ecc.)
```

## Pages contain no logic — hooks do

I componenti page (`src/pages/<Name>Page/index.tsx`) devono restare snelli: solo composizione JSX.
Destructura `{ data, actions, ui }` da un page hook e passa a componenti figli. Niente `useState`,
data-fetching, URL-state, form wiring o business logic direttamente nella page.

Tutto vive in `hooks/use<Name>Data.ts`, che gestisce:

- Queries e mutations TanStack Query (queryKey, invalidazione cache)
- Stato UI locale (sheet aperto/chiuso, target corrente)
- Form wiring (validazione, submit handler) quando la pagina possiede il form
- Actions (handler passati a bottoni/sheet)

Il hook ritorna un oggetto strutturato `{ data, actions, ui }`:

- `data` — stato server/derivato per il rendering (liste, flag loading/error)
- `ui` — stato view transiorio (quale sheet è aperto, errori form)
- `actions` — handler che la page passa a bottoni e sheet

**Eccezioni**: pagine di auth puro (login, magic link callback) non sono data page e non
necessitano di questo pattern. Una pagina senza stato non ha bisogno di un hook vuoto.

## One function/component, one file

Non definire mai un secondo componente (o helper non triviale) inline dentro un file
page/component — estrailo nel suo file, anche se usato solo da quella pagina.

Regola di placement — **è riusabile in ≥2 pagine/feature?**

- Sì → `components/shared/<Component>.tsx`
- No → page-local, sibling all'`index.tsx` della pagina

Quando un componente page-local è necessario in una seconda pagina, promuovilo a
`components/shared/` — non duplicarlo.

## Component placement convention

- `components/layout/` — solo app shell: bottom nav, route guard, layout wrapper.
  Niente di domain-specific.
- `components/shared/` — componenti domain-agnostic riusabili (BookCard, StatusBadge,
  RatingStars, ProgressBar, ecc.). Estendi un componente shared esistente prima di crearne uno nuovo.
- `pages/<Name>Page/` — tutto ciò che è specifico a una pagina: composizione (`index.tsx`),
  schema di validazione (`schema.ts`), sheet/dialog page-local, e la cartella `hooks/`.

## Data layer convention (`src/api/`)

Ogni dominio ha la sua cartella: `api.ts` (funzioni che i consumer chiamano), `types.ts` (tipi),
e `index.ts` barrel (`export * from "./types"; export * from "./api";`).

I consumer importano solo dal barrel del dominio (`@/api/<domain>`), mai direttamente da `api.ts`.

Domini previsti:
- `api/books/` — ricerca, lookup ISBN, normalizzazione metadati
- `api/library/` — library_items: aggiunta, cambio stato, avanzamento, voto
- `api/shelves/` — scaffali: lista, creazione, aggiunta/rimozione libri
- `api/profile/` — profilo utente e preferenze tema
- `api/stats/` — statistiche: libri per anno/mese, pagine lette, generi, attività

Quando Supabase sostituisce eventuali mock, cambia solo il corpo delle funzioni in `api.ts` —
le firme e i tipi restano invariati, così pages, hooks e mutations non toccano nulla.

## Naming conventions

- Cartella page: `<Name>Page/` (PascalCase, suffisso `Page`)
- Page data hook: `hooks/use<Name>Data.ts`
- Sheet/dialog page-local: `<Entity>Sheet.tsx` o `<Entity>Dialog.tsx`
- Cartella dominio API: lowercase (`books/`, `library/`, `shelves/`)
- Componente shared: PascalCase, nessun prefisso page (es. `BookCard.tsx`, `StatusBadge.tsx`)

## TypeScript / lint conventions

- Strict mode attivo. Parametri non usati prefissati con `_` se la lint config lo richiede.
- Evitare `any` ai boundary del data layer (risposte Supabase, valori form).
- Non mescolare export di componenti e non-componenti in un file soggetto a fast-refresh.
- Usare `import type` per i tipi dove possibile.

---

**Tutto il resto — UI library, tema/colori, comportamento dei componenti, auth, modelli di
dominio, routing, form/validation — appartiene a `DESIGN.md`, non qui.**
