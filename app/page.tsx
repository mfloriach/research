import { Suspense } from "react";
import { HotTopics } from "./hot-topics";

export default function HomePage() {
  return (
    <main className="flex-1">
      <div className="mx-8 py-8 sm:py-10">
        <Suspense
          fallback={<p className="text-sm opacity-70">Loading hot topics…</p>}
        >
          <HotTopics />
        </Suspense>
      </div>
    </main>
  );
}
