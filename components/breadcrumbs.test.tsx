import { render, screen, waitFor } from "@testing-library/react";
import { usePathname, useSearchParams } from "next/navigation";
import { Breadcrumbs } from "./breadcrumbs";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const usePathnameMock = usePathname as jest.Mock;
const useSearchParamsMock = useSearchParams as jest.Mock;

const TITLE = "Carbon border taxes, audited";
const ID = "arg-1";

function mockArguments(titles: Record<string, string> = { [ID]: TITLE }) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      arguments: Object.entries(titles).map(([id, title]) => ({
        id,
        title,
        description: "d",
        labels: [],
        createdAt: "2026-10-01T00:00:00.000Z",
      })),
      total: Object.keys(titles).length,
    }),
  }) as unknown as typeof fetch;
}

function setup(pathname: string, query = "") {
  usePathnameMock.mockReturnValue(pathname);
  useSearchParamsMock.mockReturnValue(new URLSearchParams(query));
  return render(<Breadcrumbs />);
}

function trail(): (string | null | undefined)[] {
  return screen.getAllByRole("listitem").map((item) => item.textContent);
}

describe("Breadcrumbs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockArguments();
  });

  it("renders nothing on the landing page", () => {
    setup("/");
    expect(
      screen.queryByRole("navigation", { name: "Breadcrumb" }),
    ).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows home and the argument title on the dossier route", async () => {
    setup(`/debate/argument/${ID}`);

    expect(await screen.findByText(TITLE)).toBeInTheDocument();
    expect(trail()).toEqual(["Hot topics", TITLE]);
    expect(screen.getByRole("link", { name: "Hot topics" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("shows a generic label while the dossier title loads", async () => {
    setup(`/debate/argument/${ID}`);
    expect(screen.getByText("Argument")).toBeInTheDocument();
    expect(await screen.findByText(TITLE)).toBeInTheDocument();
  });

  it("shows home, argument and audit title on audit routes", async () => {
    setup("/debate/contraarguments/create", `argumentId=${ID}`);

    expect(await screen.findByText(TITLE)).toBeInTheDocument();
    expect(trail()).toEqual(["Hot topics", TITLE, "Contraargument"]);
    expect(screen.getByRole("link", { name: TITLE })).toHaveAttribute(
      "href",
      `/debate/argument/${ID}`,
    );
  });

  it("omits the argument crumb without context", async () => {
    setup("/debate/evidences/create");

    expect(await screen.findByText("Evidences")).toBeInTheDocument();
    expect(trail()).toEqual(["Hot topics", "Evidences"]);
  });

  it("renders the current page as a non-link span", async () => {
    setup("/debate/provenance");

    const current = await screen.findByText("Provenance");
    expect(current.tagName).toBe("SPAN");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Provenance" })).toBeNull();
  });

  it("marks only the final crumb as current", async () => {
    setup("/debate/provenance");

    await screen.findByText("Provenance");
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    expect(screen.getByText("Hot topics")).not.toHaveAttribute("aria-current");
  });

  it("is labelled as a breadcrumb region", async () => {
    setup(`/debate/argument/${ID}`);

    await waitFor(() =>
      expect(
        screen.getByRole("navigation", { name: "Breadcrumb" }),
      ).toBeInTheDocument(),
    );
  });
});
