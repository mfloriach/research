export type PageHeadingProps = {
  title: string;
  description: string;
  labels?: readonly string[];
};

/** Page title with a supporting description clamped to two lines. */
export function PageHeading({ title, description, labels = [] }: PageHeadingProps) {
  return (
    <div className="max-w-3xl space-y-2">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="line-clamp-2 text-sm leading-6 text-base-content/70 sm:text-base">
        {description}
      </p>
      {labels.length > 0 ? (
        <ul aria-label="Argument labels" className="flex flex-wrap gap-1.5 pt-1">
          {labels.map((label) => (
            <li key={label}>
              <span className="badge badge-outline badge-sm">{label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
