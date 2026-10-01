import { z } from "zod";

/**
 * Form-level validation for the debate create pages.
 * Mirrors what the pages accept today (author/date stay optional);
 * API request schemas live separately in `lib/api-schemas.ts` and the
 * per-route `schemas.ts` files.
 */

const MAX_TITLE_LENGTH = 200;
const MAX_LABEL_LENGTH = 60;
const MAX_AUTHOR_LENGTH = 120;
const MAX_CONTENT_LENGTH = 20000;
const MAX_DESCRIPTION_LENGTH = 20000;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const auditCreateFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, {
      message: `Title must be between 3 and ${MAX_TITLE_LENGTH} characters`,
    })
    .max(MAX_TITLE_LENGTH, {
      message: `Title must be between 3 and ${MAX_TITLE_LENGTH} characters`,
    }),
  content: z
    .string()
    .trim()
    .min(1, { message: "Content must not be empty" })
    .max(MAX_CONTENT_LENGTH, {
      message: `Content must be between 1 and ${MAX_CONTENT_LENGTH} characters`,
    }),
  author: z
    .string()
    .trim()
    .max(MAX_AUTHOR_LENGTH, {
      message: `Author must be at most ${MAX_AUTHOR_LENGTH} characters`,
    })
    .optional()
    .default(""),
  date: z
    .string()
    .trim()
    .refine((value) => value === "" || DATE_PATTERN.test(value), {
      message: "Date must use YYYY-MM-DD format",
    })
    .optional()
    .default(""),
});

export type AuditCreateFormValues = z.infer<typeof auditCreateFormSchema>;
export type AuditCreateFormInput = z.input<typeof auditCreateFormSchema>;

export function parseLabelsInput(value: string): string[] {
  return [...new Set(value.split(",").map((label) => label.trim()))].filter(
    (label) => label.length > 0,
  );
}

export const reportCreateFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, {
      message: `Title must be between 3 and ${MAX_TITLE_LENGTH} characters`,
    })
    .max(MAX_TITLE_LENGTH, {
      message: `Title must be between 3 and ${MAX_TITLE_LENGTH} characters`,
    }),
  labels: z
    .string()
    .trim()
    .refine(
      (value) =>
        parseLabelsInput(value).every(
          (label) => label.length <= MAX_LABEL_LENGTH,
        ),
      {
        message: `Each label must be at most ${MAX_LABEL_LENGTH} characters`,
      },
    )
    .optional()
    .default(""),
  description: z
    .string()
    .trim()
    .min(1, {
      message: `Description must be between 1 and ${MAX_DESCRIPTION_LENGTH} characters`,
    })
    .max(MAX_DESCRIPTION_LENGTH, {
      message: `Description must be between 1 and ${MAX_DESCRIPTION_LENGTH} characters`,
    }),
});

export type ReportCreateFormValues = z.infer<typeof reportCreateFormSchema>;
export type ReportCreateFormInput = z.input<typeof reportCreateFormSchema>;
