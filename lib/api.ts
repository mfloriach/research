import { z } from "zod";

type StoreDbResult = {
  itemId: string;
  ipfsCid: string;
};

const ResultBodySchema = z.object({
  itemId: z.string().min(1),
  ipfsCid: z.string().min(1),
});

type Request = {
  method: "POST" | "GET" | "PUT" | "DELETE";
  endpoint: string;
  body: any;
  validation: z.ZodSchema;
};

async function client(req: Request): Promise<any> {
  const response = await fetch(req.endpoint, {
    method: req.method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req.body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return req.validation.parse(await response.json());
}

export async function saveEvidence(body: any): Promise<StoreDbResult> {
  return client({
    method: "POST",
    endpoint: "/api/audits/evidences",
    body,
    validation: ResultBodySchema,
  });
}

export async function saveContraargument(body: any): Promise<StoreDbResult> {
  return client({
    method: "POST",
    endpoint: "/api/audits/contraarguments",
    body,
    validation: ResultBodySchema,
  });
}

export async function saveArticle(body: any): Promise<StoreDbResult> {
  return client({
    method: "POST",
    endpoint: "/api/debates",
    body,
    validation: ResultBodySchema,
  });
}

export async function saveFallacy(body: any): Promise<StoreDbResult> {
  return client({
    method: "POST",
    endpoint: "/api/audits/fallacies",
    body,
    validation: ResultBodySchema,
  });
}

export async function saveInterpretation(body: any): Promise<StoreDbResult> {
  return client({
    method: "POST",
    endpoint: "/api/audits/interpretations",
    body,
    validation: ResultBodySchema,
  });
}

export async function saveSource(body: any): Promise<StoreDbResult> {
  return client({
    method: "POST",
    endpoint: "/api/audits/sources",
    body,
    validation: ResultBodySchema,
  });
}

const ResultOpenCountSchema = z.object({
  openCount: z.number().min(1),
});

export async function setCountArticleOpen(articleId: string): Promise<number> {
  const response = await fetch(`/api/articles/${articleId}/open`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`status ${response.status}`);
  }

  const { openCount } = (await response.json()) as { openCount: number };

  return openCount;
}
