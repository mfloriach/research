import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@/app/hooks/use-wallet";
import { useAuditSign } from "@/app/hooks/use-audit-sign";
import Editor from "@uiw/react-md-editor";
import CreateEvidencePage from "./page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
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
  (useSearchParams as jest.Mock).mockReturnValue({
    get: (): string | null => null,
  });
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
    json: async () => ({ itemId: "test-item-id" }),
  });
  global.fetch = mockFetch as unknown as typeof fetch;
});

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Evidence title"), "A valid title");
  await user.type(await screen.findByLabelText("Content editor"), "Some content");
}

describe("CreateEvidencePage", () => {
  it("disables submit when required fields are missing", () => {
    render(<CreateEvidencePage />);
    expect(screen.getByRole("button", { name: "Save evidence" })).toBeDisabled();
    expect(mockSignPayload).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("shows zod errors and never submits an invalid form", async () => {
    const user = userEvent.setup();
    render(<CreateEvidencePage />);
    await user.type(screen.getByPlaceholderText("Evidence title"), "ab");
    expect(
      await screen.findByText("Title must be between 3 and 200 characters"),
    ).toBeInTheDocument();

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(
        screen.getByText("Content must not be empty"),
      ).toBeInTheDocument();
    });
    expect(mockSignPayload).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("signs then posts a valid form and shows the signature panel", async () => {
    const user = userEvent.setup();
    render(<CreateEvidencePage />);
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: "Save evidence" }));

    await waitFor(() => {
      expect(mockSignPayload).toHaveBeenCalledWith({
        kind: "evidence",
        body: {
          title: "A valid title",
          content: "Some content",
          paragraphIds: [],
        },
      });
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/audits/evidences",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText("Evidence signed and stored")).toBeInTheDocument();
  });

  it("shows an error and never posts when the signature is rejected", async () => {
    const user = userEvent.setup();
    mockSignPayload.mockResolvedValue({
      ok: false,
      error: "Signature rejected in the wallet.",
    });
    render(<CreateEvidencePage />);
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: "Save evidence" }));

    await waitFor(() => {
      expect(
        screen.getByText("Signature rejected in the wallet. Nothing was saved."),
      ).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("surfaces API errors without navigating", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Title must be between 3 and 200 characters" }),
    });
    render(<CreateEvidencePage />);
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: "Save evidence" }));

    await waitFor(() => {
      expect(
        screen.getByText("Title must be between 3 and 200 characters"),
      ).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
