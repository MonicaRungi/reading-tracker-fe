import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReadingCard } from "@/components/shared/ReadingCard";
import type { LibraryItem } from "@/api/library";

export function ContinueReadingSection({ items }: { items: LibraryItem[] }) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }

  return (
    <section className="px-4 pb-2 pt-1">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-foreground">
          {t("library.continueReading")}
        </h2>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <ReadingCard
            key={item.id}
            item={item}
            fullWidth={items.length === 1}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
          />
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? "w-4 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
