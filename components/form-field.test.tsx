import { render, screen } from "@testing-library/react";
import { Field, TextInput } from "./form-field";

describe("Field", () => {
  it("renders the label and children", () => {
    render(
      <Field label="Title">
        <input aria-label="title-input" />
      </Field>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("title-input")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the validation message as an alert", () => {
    render(
      <Field label="Title" error="Title must be between 3 and 200 characters">
        <input aria-label="title-input" />
      </Field>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Title must be between 3 and 200 characters");
  });
});

describe("TextInput", () => {
  it("forwards props to the input", () => {
    render(
      <TextInput placeholder="Evidence title" maxLength={200} disabled name="title" />,
    );
    const input = screen.getByPlaceholderText("Evidence title");
    expect(input).toHaveAttribute("maxLength", "200");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("name", "title");
  });
});
