import { act, fireEvent, render, screen } from "@testing-library/react";
import { CopyButton } from "./copy-button";

describe("CopyButton", () => {
  it("copies the value to the clipboard on click", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<CopyButton value="item-id-123" label="item ID" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy item ID" }));
    });

    expect(writeText).toHaveBeenCalledWith("item-id-123");
    expect(
      await screen.findByRole("button", { name: "Copy item ID" }),
    ).toBeInTheDocument();
  });
});
