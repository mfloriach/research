import { parseLabelsInput, reportCreateFormSchema } from "./form-schemas";

describe("parseLabelsInput", () => {
  it("splits comma-separated values and drops blanks and duplicates", () => {
    expect(parseLabelsInput("")).toEqual([]);
    expect(parseLabelsInput("Clima")).toEqual(["Clima"]);
    expect(parseLabelsInput("Clima, Policy ,Clima,, ")).toEqual([
      "Clima",
      "Policy",
    ]);
  });
});

describe("reportCreateFormSchema", () => {
  it("accepts an empty labels input", () => {
    const parsed = reportCreateFormSchema.safeParse({
      title: "A valid title",
      labels: "",
      description: "Some description",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an overlong individual label", () => {
    const parsed = reportCreateFormSchema.safeParse({
      title: "A valid title",
      labels: `Clima, ${"x".repeat(61)}`,
      description: "Some description",
    });
    expect(parsed.success).toBe(false);
  });
});
