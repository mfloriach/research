export type PageHeadingProps = {
  title: string;
  labels?: readonly string[];
};

/** Thesis masthead: serif headline, full description, index terms. */
export function PageHeading({ title, labels = [] }: PageHeadingProps) {
  return (
    <div className="max-w-3xl space-y-3">
      {labels.length > 0 ? (
        <p className="text-sm text-base-content/60">
          Filed under {labels.join(", ")}.
        </p>
      ) : null}
      <h1 className="font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {title}
      </h1>
    </div>
  );
}
