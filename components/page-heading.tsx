export type PageHeadingProps = {
  title: string;
  description: string;
};

/** Page title with a supporting description clamped to two lines. */
export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="max-w-3xl space-y-2">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="line-clamp-2 text-sm leading-6 text-base-content/70 sm:text-base">
        {description}
      </p>
    </div>
  );
}
