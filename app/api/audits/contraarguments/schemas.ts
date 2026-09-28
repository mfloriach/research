import { z } from "zod";
import {
  AuditTabNotFoundError,
  UnknownParagraphsError,
  createContraargument,
} from "@/app/server/repositories/contraarguments";

const MAX_TITLE_LENGTH = 200;
const MAX_AUTHOR_LENGTH = 120;
const MAX_CONTENT_LENGTH = 20000;

export function splitAuditParagraphs(markdown: string): string[] {
  return markdown
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}


export const auditItemSchema = z.object({
  title: z
    .string({ error: "Title must be a string" })
    .trim()
    .min(3, { error: `Title must be between 3 and ${MAX_TITLE_LENGTH} characters` })
    .max(MAX_TITLE_LENGTH, {
      error: `Title must be between 3 and ${MAX_TITLE_LENGTH} characters`,
    }),
  content: z
    .string({ error: "Content must be a string" })
    .trim()
    .min(1, { error: "Content must not be empty" })
    .max(MAX_CONTENT_LENGTH, {
      error: `Content must be between 1 and ${MAX_CONTENT_LENGTH} characters`,
    })
    .refine((value) => splitAuditParagraphs(value).length > 0, {
      error: "Content must not be empty",
    }),
  author: z
    .string({ error: "Author must be a string" })
    .trim()
    .max(MAX_AUTHOR_LENGTH, { error: `Author must be at most ${MAX_AUTHOR_LENGTH} characters` }),
  date: z
    .string({ error: "Date must be a string" })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must use YYYY-MM-DD format" }),
  paragraphIds: z.array(z.string().min(1)).optional().default([]),
});