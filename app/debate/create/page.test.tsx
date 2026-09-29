import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { useWallet } from "@/app/hooks/use-wallet";
import { useAuditSign } from "@/app/hooks/use-audit-sign";
import Editor from "@uiw/react-md-editor";
import CreateDebatePage from "./page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/app/hooks/use-wallet", () => ({
  useWallet: jest.fn(),
}));
jest.mock("@/app/hooks/use-audit-sign", () => ({
  useAuditSign: jest.fn(),
}));
jest.mock("@uiw/react-md-editor", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockPush = jest.fn();
const mockSignPayload = jest.fn();
const mockRecordSignature = jest.fn();
const mockFetch = jest.fn();

const signed = {
  signer: "0xabc",
  signature: "0xsig",
  message: "message",
  contentHash: "0xhash",
};

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (useWallet as jest.Mock).mockReturnValue({
    address: "0xabc",
    chainId: "0x7a69",
    isConnected: true,
  });
  (useAuditSign as jest.Mock).mockReturnValue({
    phase: "idle",
    signPayload: mockSignPayload,
    recordSignature: mockRecordSignature,
    isConnected: true,
  });
  (Editor as unknown as jest.Mock).mockImplementation(
    ({
      value,
      onChange,
    }: {
      value: string;
      onChange: (value: string | undefined) => void;
    }) => (
      <textarea
        aria-label="Content editor"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
  );
  mockSignPayload.mockResolvedValue({ ok: true, signed });
  mockRecordSignature.mockResolvedValue({ ok: true, txHash: "0xhash" });
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ articleId: "test-article-id" }),
  });
  global.fetch = mockFetch as unknown as typeof fetch;
});

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Report title"), "A valid title");
  await user.type(await screen.findByLabelText("Content editor"), "Some description");
}

describe("CreateDebatePage", () => {
  it("disables submit when required fields are missing", () => {
    render(<CreateDebatePage />);
    expect(screen.getByRole("button", { name: "Save report" })).toBeDisabled();
    expect(mockSignPayload).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("shows zod errors and never submits an invalid form", async () => {
    const user = userEvent.setup();
    render(<CreateDebatePage />);
    await user.type(screen.getByPlaceholderText("Report title"), "ab");
    expect(
      await screen.findByText("Title must be between 3 and 200 characters"),
    ).toBeInTheDocument();

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(
        screen.getByText("Description must be between 1 and 20000 characters"),
      ).toBeInTheDocument();
    });
    expect(mockSignPayload).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("signs then posts a valid form and shows the signature panel", async () => {
    const user = userEvent.setup();
    render(<CreateDebatePage />);
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: "Save report" }));

    await waitFor(() => {
      expect(mockSignPayload).toHaveBeenCalledWith({
        kind: "report",
        body: {
          title: "A valid title",
          label: "",
          description: "Some description",
        },
      });
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/debates",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText("Report signed and stored")).toBeInTheDocument();
  });

  it("shows an error and never posts when the signature is rejected", async () => {
    const user = userEvent.setup();
    mockSignPayload.mockResolvedValue({
      ok: false,
      error: "Signature rejected in the wallet.",
    });
    render(<CreateDebatePage />);
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: "Save report" }));

    await waitFor(() => {
      expect(
        screen.getByText("Signature rejected in the wallet. Nothing was saved."),
      ).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
