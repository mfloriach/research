import { CollapseCard } from "@/components/collapse-card";
import type { CollapsibleItem } from "@/db/content";

export type CollapseListProps = {
  items: readonly CollapsibleItem[];
};

/** Renders a tab's worth of collapse cards. */
export function CollapseList({ items }: CollapseListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <CollapseCard
          key={item.id}
          title={item.title}
          paragraphs={item.paragraphs}
          author={item.author}
          date={item.date}
        />
      ))}
    </div>
  );
}
