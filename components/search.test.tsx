import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search, type SearchResults } from "./search";

const search = { placeholder: "Search the dossier", label: "Search" };

const idleProps = {
  status: "idle" as const,
  results: null,
  error: null,
};

function setup(
  onSubmitSearch?: (query: string) => unknown,
  extra?: Partial<Parameters<typeof Search>[0]>,
) {
  const setQuery = jest.fn();
  const handleSubmit = jest.fn();
  function Harness() {
    const [query, setInnerQuery] = useState("");
    return (
      <Search
        search={search}
        query={query}
        setQuery={(value: string) => {
          setInnerQuery(value);
          setQuery(value);
        }}
        onSubmitSearch={async (value: string) => {
          handleSubmit(value);
          await onSubmitSearch?.(value);
        }}
        {...idleProps}
        {...extra}
      />
    );
  }
  render(<Harness />);
  return { setQuery, handleSubmit };
}

async function openModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByPlaceholderText("Search"));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
}

describe("Search", () => {
  it("opens the modal when the trigger is clicked", async () => {
    const user = userEvent.setup();
    setup();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await openModal(user);

    expect(
      screen.getByPlaceholderText("Search the dossier"),
    ).toBeInTheDocument();
  });

  it("closes the modal when clicking outside", async () => {
    const user = userEvent.setup();
    setup();
    await openModal(user);

    fireEvent.click(document.querySelector(".fixed.inset-0") as HTMLElement);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the modal on Escape", async () => {
    const user = userEvent.setup();
    setup();
    await openModal(user);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the modal with the close button", async () => {
    const user = userEvent.setup();
    setup();
    await openModal(user);

    await user.click(screen.getByRole("button", { name: "Close search" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the modal open when clicking inside and forwards typing", async () => {
    const user = userEvent.setup();
    const { setQuery } = setup();
    await openModal(user);

    await user.click(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("Search the dossier"),
      "clima",
    );
    expect(setQuery).toHaveBeenLastCalledWith("clima");
  });

  it("submits the query on Enter and stays open for results", async () => {
    const user = userEvent.setup();
    const { handleSubmit } = setup();
    await openModal(user);

    await user.type(
      screen.getByPlaceholderText("Search the dossier"),
      "clima{Enter}",
    );

    expect(handleSubmit).toHaveBeenCalledWith("clima");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("ignores submit with an empty query", async () => {
    const user = userEvent.setup();
    const { handleSubmit } = setup();
    await openModal(user);

    fireEvent.submit(
      screen.getByPlaceholderText("Search the dossier").closest("form") as HTMLFormElement,
    );

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("awaits an async submit handler without closing", async () => {
    const user = userEvent.setup();
    let resolveGate!: (value: unknown) => void;
    const gate = new Promise((resolve) => {
      resolveGate = resolve;
    });
    setup(() => gate);
    await openModal(user);

    await user.type(
      screen.getByPlaceholderText("Search the dossier"),
      "clima{Enter}",
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await act(async () => {
      resolveGate(null);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows a loading state while searching", async () => {
    const user = userEvent.setup();
    setup(undefined, { status: "loading" });
    await openModal(user);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Searching the dossier…",
    );
  });

  it("shows an error state when search fails", async () => {
    const user = userEvent.setup();
    setup(undefined, { status: "error", error: "Search failed." });
    await openModal(user);

    expect(screen.getByRole("alert")).toHaveTextContent("Search failed.");
  });

  it("renders matches with views and attestations, then jumps on click", async () => {
    const user = userEvent.setup();
    const results: SearchResults = {
      matches: [
        {
          articleId: "article-1",
          title: "Article One",
          score: 0.85,
          openCount: 12,
          attestationCount: 3,
        },
        {
          articleId: "article-2",
          title: "Article Two",
          score: 0.42,
          openCount: 1,
          attestationCount: null,
        },
      ],
      answer: "An answer",
      model: "gpt-4o-mini",
    };
    setup(undefined, { status: "done", results });
    await openModal(user);

    expect(screen.getByText("An answer")).toBeInTheDocument();
    expect(screen.queryByText("85%")).toBeNull();
    expect(screen.getByLabelText("12 opens")).toHaveTextContent("12");
    expect(screen.getByLabelText("3 attestations")).toHaveTextContent("3");
    expect(screen.getByLabelText("1 opens")).toHaveTextContent("1");
    expect(
      screen.queryByLabelText("0 attestations"),
    ).toBeNull();
    const link = screen.getByRole("link", { name: /Article One/ });
    expect(link).toHaveAttribute("href", "#article-1");

    await user.click(link);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("explains an empty result set", async () => {
    const user = userEvent.setup();
    setup(undefined, {
      status: "done",
      results: { matches: [], answer: "", model: "" },
    });
    await openModal(user);

    expect(
      screen.getByText("No matches in the dossier. Try different words."),
    ).toBeInTheDocument();
  });
});
