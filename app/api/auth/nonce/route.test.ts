/**
 * @jest-environment node
 */
import { POST } from "./route";
import { issueSiweNonce } from "@/app/server/services/auth-service";

jest.mock("@/app/server/services/auth-service", () => ({
  issueSiweNonce: jest.fn(),
}));

const issueSiweNonceMock = issueSiweNonce as jest.Mock;

const ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

describe("POST /api/auth/nonce", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a nonce and message for a valid address", async () => {
    issueSiweNonceMock.mockResolvedValue({
      nonce: "abc123",
      message: "sign this",
      expiresAt: "2026-10-04T00:10:00.000Z",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/nonce", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address: ADDRESS }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      nonce: "abc123",
      message: "sign this",
      expiresAt: "2026-10-04T00:10:00.000Z",
    });
    expect(issueSiweNonceMock).toHaveBeenCalledWith({
      address: ADDRESS,
      chainId: 31337,
      requestUrl: "http://localhost/api/auth/nonce",
    });
  });

  it("rejects a malformed address with 400", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/nonce", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address: "0x123" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(typeof body.error).toBe("string");
    expect(issueSiweNonceMock).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON with 400", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/nonce", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not-json{",
      }),
    );

    expect(response.status).toBe(400);
    expect(issueSiweNonceMock).not.toHaveBeenCalled();
  });
});
