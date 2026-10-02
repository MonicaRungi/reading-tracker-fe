import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { listShelves } from "@/api/shelves";
import { useAuth } from "@/hooks/useAuth";
import { useShelfEditor } from "@/hooks/useShelfEditor";

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

  const shelves = shelvesQuery.data ?? [];

  return {
    data: {
      shelves,
      isLoading: shelvesQuery.isLoading,
      isEmpty: shelvesQuery.isSuccess && shelves.length === 0,
    },
    ui: editor.ui,
    actions: {
      ...editor.actions,
      openShelf: (shelfId: string) => navigate(`/shelves/${shelfId}`),
    },
  };
}
