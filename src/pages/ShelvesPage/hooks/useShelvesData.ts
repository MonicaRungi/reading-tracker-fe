import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { listShelves } from "@/api/shelves";
import { useAuth } from "@/hooks/useAuth";
import { useShelfEditor } from "@/hooks/useShelfEditor";
import { useSpineUrls } from "@/hooks/useSpineUrls";

export function useShelvesData() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();

  const shelvesQuery = useQuery({
    queryKey: ["shelves", userId],
    queryFn: listShelves,
    enabled: Boolean(userId),
  });

  // Appena creato, lo scaffale è vuoto: si apre il dettaglio per riempirlo.
  const editor = useShelfEditor({
    onCreated: (shelfId) => navigate(`/shelves/${shelfId}`),
  });

  const shelves = useMemo(() => shelvesQuery.data ?? [], [shelvesQuery.data]);
  // URL firmati delle foto nelle anteprime di tutti gli scaffali, in un'unica richiesta
  const spinePaths = useMemo(
    () => shelves.flatMap((shelf) => shelf.preview.map((book) => book.library_item.spine_path)),
    [shelves],
  );
  const spineUrls = useSpineUrls(spinePaths);

  return {
    data: {
      shelves,
      isLoading: shelvesQuery.isLoading,
      isEmpty: shelvesQuery.isSuccess && shelves.length === 0,
      spineUrls: spineUrls.urls,
    },
    ui: editor.ui,
    actions: {
      ...editor.actions,
      openShelf: (shelfId: string) => navigate(`/shelves/${shelfId}`),
      refreshSpineUrls: spineUrls.refresh,
    },
  };
}
