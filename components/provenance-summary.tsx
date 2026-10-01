import type { ArticleView } from "@/app/hooks/use-content-index";

export function kindBadgeClass(kind: string): string {
  switch (kind) {
    case "Article":
      return "badge-neutral";
    case "Contraargument":
      return "badge-warning";
    case "Fallacies":
      return "badge-error";
    case "Evidences":
      return "badge-success";
    case "Sources":
      return "badge-info";
    case "Interpretation":
      return "badge-accent";
    default:
      return "badge-ghost";
  }
}

function kindBarClass(kind: string): string {
  switch (kind) {
    case "Contraargument":
      return "bg-warning";
    case "Fallacies":
      return "bg-error";
    case "Evidences":
      return "bg-success";
    case "Sources":
      return "bg-info";
    case "Interpretation":
      return "bg-accent";
    default:
      return "bg-neutral";
  }
}

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
                <>
                  <div
                    className="flex h-2.5 w-full overflow-hidden rounded-full bg-base-300"
                    role="img"
                    aria-label={`Audit mix for ${article.title}`}
                  >
                    {article.counts.map((entry) => (
                      <div
                        key={entry.tab}
                        className={kindBarClass(entry.tab)}
                        style={{ width: `${entry.percent}%` }}
                        title={`${entry.tab}: ${entry.count} (${Math.round(entry.percent)}%)`}
                      />
                    ))}
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {article.counts.map((entry) => (
                      <li
                        key={entry.tab}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <span
                          className={`badge badge-sm ${kindBadgeClass(entry.tab)}`}
                        >
                          {entry.tab}
                        </span>
                        <span className="opacity-70">
                          {entry.count} · {Math.round(entry.percent)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
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
