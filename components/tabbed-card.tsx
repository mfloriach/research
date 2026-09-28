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
};

/**
 * daisyUI card wrapping a daisyUI tab group.
 *
 * Tabs use radio inputs, so switching them is pure CSS and this component
 * stays a Server Component — no hydration cost.
 */
export function TabbedCard({ name, tabs, defaultTabId }: TabbedCardProps) {
  if (tabs.length === 0) {
    return null;
  }

  const activeId = defaultTabId ?? tabs[0].id;

  return (
    <section>
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
              <div className="tab-content max-h-[60vh] overflow-y-auto overscroll-contain border-base-300 bg-base-100 p-4 [scrollbar-gutter:stable] sm:p-6 lg:max-h-[70vh]">
                {tab.content}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
