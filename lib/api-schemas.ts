import { z } from "zod";

export const MAX_DEBATE_TITLE_LENGTH = 200;
export const MAX_DEBATE_LABEL_LENGTH = 60;
export const MAX_DEBATE_DESCRIPTION_LENGTH = 20000;
export const MAX_SEARCH_QUERY_LENGTH = 200;

export function splitMarkdownParagraphs(markdown: string): string[] {
  return markdown
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

export const errorSchema = z
  .object({
    error: z.string().describe("Human-readable error message"),
  })
  .meta({ id: "ErrorResponse" });

export const debateInputSchema = z
  .object({
    title: z
      .string({ error: "Title must be a string" })
      .trim()
      .min(3, {
        error: `Title must be between 3 and ${MAX_DEBATE_TITLE_LENGTH} characters`,
      })
      .max(MAX_DEBATE_TITLE_LENGTH, {
        error: `Title must be between 3 and ${MAX_DEBATE_TITLE_LENGTH} characters`,
      })
      .describe("Report title, 3-200 characters"),
    label: z
      .string({ error: "Label must be a string" })
      .trim()
      .max(MAX_DEBATE_LABEL_LENGTH, {
        error: `Label must be at most ${MAX_DEBATE_LABEL_LENGTH} characters`,
      })
      .optional()
      .describe("Article label. Groups the article in the reporting view."),
    description: z
      .string({ error: "Description must be a string" })
      .trim()
      .min(1, {
        error: `Description must be between 1 and ${MAX_DEBATE_DESCRIPTION_LENGTH} characters`,
      })
      .max(MAX_DEBATE_DESCRIPTION_LENGTH, {
        error: `Description must be between 1 and ${MAX_DEBATE_DESCRIPTION_LENGTH} characters`,
      })
      .refine((value) => splitMarkdownParagraphs(value).length > 0, {
        error: "Description must not be empty",
      })
      .describe(
        "Markdown report body. Blank-line separated paragraphs become stored paragraphs.",
      ),
  })
  .meta({ id: "DebateInput" });

export type DebateInput = z.infer<typeof debateInputSchema>;

export const debateResponseSchema = z
  .object({
    articleId: z.string().describe("Created reporting article ID"),
    tab: z.string().describe("Article label the report was stored under"),
    paragraphIds: z
      .array(z.string())
      .describe("Stored paragraph IDs in document order"),
    ipfsCid: z.string().describe("IPFS CID of the pinned report envelope"),
  })
  .meta({ id: "DebateResponse" });

export const searchQuerySchema = z
  .object({
    q: z
      .string()
      .optional()
      .describe(
        `Full-text search query. Truncated server-side to ${MAX_SEARCH_QUERY_LENGTH} characters.`,
      ),
  })
  .meta({ id: "SearchQuery" });

export const searchResponseSchema = z
  .object({
    query: z.string().describe("Query after server-side truncation"),
    match: z.boolean().describe("Whether the top similarity reached 70%"),
    score: z.number().describe("Top cosine similarity score"),
    matches: z
      .array(
        z.object({
          articleId: z.string().describe("Matched article ID"),
          score: z.number().describe("Cosine similarity score"),
        }),
      )
      .describe("Top vector matches in rank order"),
    answer: z.string().describe("LLM answer for the query"),
    model: z.string().describe("LLM model that produced the answer"),
  })
  .meta({ id: "SearchResponse" });

const argumentContentSchema = z
  .object({
    title: z.string(),
    description: z.string(),
  })
  .meta({ id: "Argument" });

const reportingParagraphSchema = z
  .object({
    id: z.string(),
    text: z.string(),
    auditItemIds: z.array(z.string()),
  })
  .meta({ id: "ReportingParagraph" });

const reportingArticleSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    paragraphs: z.array(reportingParagraphSchema),
  })
  .meta({ id: "ReportingArticle" });

const reportingTabSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    items: z.array(reportingArticleSchema),
  })
  .meta({ id: "ReportingTab" });

const contentAuditItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    author: z.string().optional(),
    date: z.string().optional(),
    paragraphs: z.array(z.string()),
    openCount: z.number(),
  })
  .meta({ id: "AuditItem" });

const auditTabSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    author: z.string().optional(),
    date: z.string().optional(),
    items: z.array(contentAuditItemSchema),
  })
  .meta({ id: "AuditTab" });

export const contentResponseSchema = z
  .object({
    argument: argumentContentSchema.describe("Debated argument copy"),
    reportingCard: z
      .object({
        title: z.string(),
        tabs: z.array(reportingTabSchema),
      })
      .describe("Reporting articles grouped by tab"),
    auditCard: z
      .object({
        title: z.string(),
        tabs: z.array(auditTabSchema),
      })
      .describe("Audit items grouped by tab"),
  })
  .meta({ id: "ContentResponse" });

export const auditItemInputSchema = z
  .object({
    title: z
      .string({ error: "Title must be a string" })
      .trim()
      .min(3, { error: "Title must be between 3 and 200 characters" })
      .max(200, { error: "Title must be between 3 and 200 characters" })
      .describe("Audit item title, 3-200 characters"),
    content: z
      .string({ error: "Content must be a string" })
      .trim()
      .min(1, { error: "Content must not be empty" })
      .max(20000, { error: "Content must be between 1 and 20000 characters" })
      .refine((value) => splitMarkdownParagraphs(value).length > 0, {
        error: "Content must not be empty",
      })
      .describe(
        "Markdown body. Blank-line separated paragraphs become stored paragraphs.",
      ),
    author: z
      .string({ error: "Author must be a string" })
      .trim()
      .max(120, { error: "Author must be at most 120 characters" })
      .describe("Author display name, at most 120 characters"),
    date: z
      .string({ error: "Date must be a string" })
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        error: "Date must use YYYY-MM-DD format",
      })
      .describe("Item date in YYYY-MM-DD format"),
    paragraphIds: z
      .array(z.string().min(1))
      .optional()
      .default([])
      .describe("Reporting paragraph IDs to link this item to"),
  })
  .meta({ id: "AuditItemInput" });

export const auditItemResponseSchema = z
  .object({
    itemId: z.string().describe("Created audit item ID"),
    tab: z.string().describe("Audit tab label the item was stored under"),
    ipfsCid: z.string().describe("IPFS CID of the pinned item envelope"),
  })
  .meta({ id: "AuditItemResponse" });

export const auditOpenPathParamsSchema = z
  .object({
    id: z.string().min(1).describe("Audit item ID"),
  })
  .meta({ id: "AuditItemPathParams" });

export const evidenceOpenResponseSchema = z
  .object({
    evidenceId: z.string().describe("Evidence item ID"),
    openCount: z.number().describe("Open count after increment"),
  })
  .meta({ id: "EvidenceOpenResponse" });

export const contraargumentOpenResponseSchema = z
  .object({
    contraargumentId: z.string().describe("Contraargument item ID"),
    openCount: z.number().describe("Open count after increment"),
  })
  .meta({ id: "ContraargumentOpenResponse" });

export const interpretationOpenResponseSchema = z
  .object({
    interpretationId: z.string().describe("Interpretation item ID"),
    openCount: z.number().describe("Open count after increment"),
  })
  .meta({ id: "InterpretationOpenResponse" });

export const fallacyOpenResponseSchema = z
  .object({
    fallacyId: z.string().describe("Fallacy item ID"),
    openCount: z.number().describe("Open count after increment"),
  })
  .meta({ id: "FallacyOpenResponse" });

export const sourceOpenResponseSchema = z
  .object({
    sourceId: z.string().describe("Source item ID"),
    openCount: z.number().describe("Open count after increment"),
  })
  .meta({ id: "SourceOpenResponse" });
