import { Fragment } from "react";
import type { ReactNode } from "react";

export type TabbedCardTab = {
  id: string;
  label: string;
  content: ReactNode;
};

export type TabbedCardProps = {
  /**
   * Radio-group name for the tab inputs. Must be unique across every card
   * rendered on the page, otherwise the two cards share one tab selection.
   */
  name: string;
  title: string;
  tabs: readonly TabbedCardTab[];
  /** Tab selected on first paint. Falls back to the first tab. */
  defaultTabId?: string;
  /** Reading surface: paper for documents, plain for ledgers. */
  tone?: "paper" | "plain";
};

/**
 * daisyUI card wrapping a daisyUI tab group.
 *
 * Tabs use radio inputs, so switching them is pure CSS and this component
 * stays a Server Component — no hydration cost.
 */
export function TabbedCard({ name, title, tabs, defaultTabId, tone = "plain" }: TabbedCardProps) {
  if (tabs.length === 0) {
    return null;
  }

  const activeId = defaultTabId ?? tabs[0].id;

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 px-3 pb-3 sm:px-4">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-balance">
          {title}
        </h2>
      </div>
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="tabs tabs-lift">
          {tabs.map((tab) => (
            <Fragment key={tab.id}>
              <input
                type="radio"
                name={name}
                className="tab"
                aria-label={tab.label}
                autoComplete="off"
                defaultChecked={tab.id === activeId}
              />
              <div
            className={`tab-content max-h-[60vh] overflow-y-auto overscroll-contain border-base-300 p-4 [scrollbar-gutter:stable] sm:p-6 lg:max-h-[70vh] ${
              tone === "paper" ? "bg-base-200" : "bg-base-100"
            }`}
          >
                {tab.content}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
