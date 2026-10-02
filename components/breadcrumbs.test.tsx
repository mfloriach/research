import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "./breadcrumbs";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const usePathnameMock = usePathname as jest.Mock;

const TOPIC = "Carbon border taxes, audited";

function setup(pathname: string) {
  usePathnameMock.mockReturnValue(pathname);
  return render(<Breadcrumbs topic={TOPIC} />);
}

describe("Breadcrumbs", () => {
  it("starts with a static Topic label, then the topic name", () => {
    setup("/debate/provenance");
    const items = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(items[0]).toBe("Topic");
    expect(items[1]).toBe(TOPIC);
  });

  it("renders the leading label as plain text, not a link", () => {
    setup("/debate/provenance");
    const label = screen.getByText("Topic");
    expect(label.tagName).toBe("SPAN");
    expect(screen.queryByRole("link", { name: "Topic" })).toBeNull();
    expect(label).not.toHaveAttribute("aria-current");
  });

  it("links the topic name home", () => {
    setup("/debate/provenance");
    expect(
      screen.getByRole("link", { name: TOPIC }),
    ).toHaveAttribute("href", "/");
  });

  it("renders one crumb per ancestor plus the topic label and name", () => {
    setup("/debate/contraarguments/create");
    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual([
      "Topic",
      TOPIC,
      "Debate",
      "Contraargument",
      "Create",
    ]);
  });

  it("links every ancestor to its path", () => {
    setup("/debate/contraarguments/create");
    expect(screen.getByRole("link", { name: "Debate" })).toHaveAttribute(
      "href",
      "/debate",
    );
    expect(
      screen.getByRole("link", { name: "Contraargument" }),
    ).toHaveAttribute("href", "/debate/contraarguments");
  });

  it("renders the current page as a non-link span", () => {
    setup("/debate/provenance");
    const current = screen.getByText("Provenance");
    expect(current.tagName).toBe("SPAN");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Provenance" })).toBeNull();
  });

  it("distinguishes the current page with a different colour", () => {
    setup("/debate/provenance");
    expect(screen.getByText("Provenance")).toHaveClass("text-primary");
    expect(screen.getByRole("link", { name: "Debate" })).not.toHaveClass(
      "text-primary",
    );
  });

  it("marks only the final crumb as current", () => {
    setup("/debate/provenance");
    expect(
      document.querySelectorAll('[aria-current="page"]'),
    ).toHaveLength(1);
    expect(screen.getByText("Provenance")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Debate")).not.toHaveAttribute("aria-current");
  });

  it("stops after the topic name on the root route", () => {
    setup("/");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Topic")).toBeInTheDocument();
    expect(screen.getByText(TOPIC)).toHaveAttribute("aria-current", "page");
  });

  it("is labelled as a breadcrumb region", () => {
    setup("/");
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeInTheDocument();
  });
});