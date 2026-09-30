import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search } from "./search";

const search = { placeholder: "Search the dossier", label: "Search" };

function setup(onSubmitSearch?: (query: string) => void) {
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
        onSubmitSearch={(value: string) => {
          handleSubmit(value);
          onSubmitSearch?.(value);
        }}
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

  it("submits the query on Enter and closes the modal", async () => {
    const user = userEvent.setup();
    const { handleSubmit } = setup();
    await openModal(user);

    await user.type(
      screen.getByPlaceholderText("Search the dossier"),
      "clima{Enter}",
    );

    expect(handleSubmit).toHaveBeenCalledWith("clima");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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
});
