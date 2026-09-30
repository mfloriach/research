import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search } from "./search";

const search = { placeholder: "Search the dossier", label: "Search" };

function setup() {
  const setQuery = jest.fn();
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
      />
    );
  }
  render(<Harness />);
  return { setQuery };
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
});
