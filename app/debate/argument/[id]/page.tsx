import { Suspense } from "react";
import { Dossier } from "./dossier";

export default async function ArgumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="flex-1">
      <div className="mx-8 py-8 sm:py-10">
        <Suspense
          fallback={<p className="text-sm opacity-70">Loading dossier…</p>}
        >
          <Dossier id={id} />
        </Suspense>
      </div>
    </main>
  );
}
