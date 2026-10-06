import type { ArticleView } from "@/app/hooks/use-content-index";

export const kindBadgeClassMap: Record<string, string> = {
  Article: "badge-neutral",
  Contraargument: "badge-warning",
  Fallacies: "badge-error",
  Evidences: "badge-success",
  Sources: "badge-info",
  Interpretation: "badge-accent",
};

const kindBarClassMap: Record<string, string> = {
  Contraargument: "bg-warning",
  Fallacies: "bg-error",
  Evidences: "bg-success",
  Sources: "bg-info",
  Interpretation: "bg-accent",
};

type ProvenanceSummaryProps = {
  articles: ArticleView[];
};

export function ProvenanceSummary({ articles }: ProvenanceSummaryProps) {
  if (articles.length === 0) {
    return null;
  }
  return (
    <section aria-label="Dossier summary" className="mt-8">
      <h2 className="text-center text-xl font-semibold">Dossier summary</h2>
      <p className="mt-1 text-center text-sm text-base-content/70">
        Audit-item mix per article, across all articles.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <article key={article.id} className="card bg-base-200 shadow-sm">
            <div className="card-body gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug">{article.title}</h3>
                <span className="flex shrink-0 flex-wrap justify-end gap-1">
                  {article.labels.map((label) => (
                    <span key={label} className="badge badge-outline badge-sm">
                      {label}
                    </span>
                  ))}
                </span>
              </div>
              <p className="text-sm text-base-content/70">
                {article.total}{" "}
                {article.total === 1 ? "linked item" : "linked items"}
              </p>
              {article.total > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {article.counts.map((entry) => (
                    <div key={entry.tab} className="flex items-center gap-2">
                      <span
                        className={`badge badge-sm w-32 justify-center ${kindBadgeClassMap[entry.tab] ?? "badge-neutral"}`}
                      >
                        {entry.tab}
                      </span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-base-300">
                        <div
                          className={`h-full rounded-full ${kindBarClassMap[entry.tab] ?? "bg-neutral"}`}
                          style={{ width: `${entry.percent}%` }}
                          title={`${entry.tab}: ${entry.count} (${Math.round(entry.percent)}%)`}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-xs opacity-70">
                        {entry.count} · {Math.round(entry.percent)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs opacity-60">No linked audit items.</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
