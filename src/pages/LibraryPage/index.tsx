import { BookOpen } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BookCard } from "@/components/shared/BookCard"
import { BookCardSkeleton } from "@/components/shared/BookCardSkeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { ReadingCard } from "@/components/shared/ReadingCard"
import { useLibraryData } from "./hooks/useLibraryData"

export default function LibraryPage() {
  const { t } = useTranslation()
  const { data } = useLibraryData()

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-foreground">{t("library.title")}</h1>

      {data.reading.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("library.continueReading")}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1 [scroll-snap-type:x_mandatory]">
            {data.reading.map((item) => (
              <ReadingCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-4">
        {data.isLoading &&
          Array.from({ length: 4 }).map((_, index) => <BookCardSkeleton key={index} />)}

        {!data.isLoading &&
          data.grid.map((item) => <BookCard key={item.id} item={item} />)}
      </section>

      {!data.isLoading && data.reading.length === 0 && data.grid.length === 0 && (
        <EmptyState icon={BookOpen} title={t("library.empty")} />
      )}
    </div>
  )
}
