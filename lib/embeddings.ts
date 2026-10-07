/**
 * Server-only sentence embeddings via `@huggingface/transformers`
 * (Xenova/all-MiniLM-L6-v2, quantized ONNX, 384 dimensions, CPU).
 * Never import this module from client components: the model loads
 * into the server process on first use (cached in ~/.cache/huggingface).
 */

export const EMBEDDING_DIMENSIONS = 384;
export const MATCH_THRESHOLD = 0.7;
export const MATCH_MODEL = "Xenova/all-MiniLM-L6-v2";

type EmbeddingPipeline = (
  input: string | string[],
  options?: { pooling?: string; normalize?: boolean },
) => Promise<{ tolist(): number[][] } | { tolist(): number[] }>;

let pipelinePromise: Promise<EmbeddingPipeline> | null = null;

async function getPipeline(): Promise<EmbeddingPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline } = await import("@huggingface/transformers");
      return (await pipeline("feature-extraction", MATCH_MODEL, {
        dtype: "q8",
      })) as unknown as EmbeddingPipeline;
    })();
  }
  return pipelinePromise;
}

/** Embed one sentence into a 384-dim unit vector. */
export async function embedText(input: string): Promise<number[]> {
  const pipe = await getPipeline();
  const output = await pipe(input, { pooling: "mean", normalize: true });
  const rows = output.tolist() as number[][];
  const vector = rows[0] ?? [];
  if (vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Unexpected embedding size ${vector.length}, expected ${EMBEDDING_DIMENSIONS}`,
    );
  }
  return vector;
}

/** Cosine similarity in [-1, 1]; inputs are expected to be normalized. */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }
  let dot = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += (a[index] ?? 0) * (b[index] ?? 0);
  }
  return dot;
}

/** Relationship verdict: similarity at or above 70% counts as a match. */
export function isMatch(score: number): boolean {
  return Number.isFinite(score) && score >= MATCH_THRESHOLD;
}

/** Text embedded for vector search: title plus paragraph bodies. */
export function articleEmbeddingText(title: string, paragraphs: string[]): string {
  return [title, ...paragraphs].join("\n\n");
}
