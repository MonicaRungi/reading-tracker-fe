import { useQuery } from "@tanstack/react-query";
import { listLibrary } from "@/api/library";
import { useAuth } from "@/hooks/useAuth";

export function useLibraryData() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["library", userId],
    queryFn: () => listLibrary(),
    enabled: Boolean(userId),
  });

  const items = data ?? [];
  const reading = items.filter((item) => item.status === "reading");
  const grid = items.filter((item) => item.status !== "reading");

  return {
    data: { reading, grid, isLoading, isError },
  };
}
