/**
 * @jest-environment node
 */
import { POST } from "./route";
import { UnauthorizedError } from "@/lib/errors";
import { verifySiweSignature } from "@/app/server/services/auth-service";

jest.mock("@/app/server/services/auth-service", () => ({
  verifySiweSignature: jest.fn(),
  JWT_COOKIE_MAX_AGE: 604800,
}));

const verifySiweSignatureMock = verifySiweSignature as jest.Mock;

const MESSAGE = [
  "localhost:3000 wants you to sign in with your Ethereum account:",
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "",
  "Sign in to Epistimology with your Ethereum account.",
  "",
  "URI: http://localhost:3000",
  "Version: 1",
  "Chain ID: 31337",
  "Nonce: abcdef1234567890",
  "Issued At: 2026-10-04T00:00:00.000Z",
  "Expiration Time: 2026-10-11T00:00:00.000Z",
].join("\n");
const SIGNATURE = `0x${"ab".repeat(65)}`;

describe("POST /api/auth/verify", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets the session cookie on a valid signature", async () => {
    verifySiweSignatureMock.mockResolvedValue({
      address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      chainId: 31337,
      expiresAt: "2026-10-11T00:00:00.000Z",
      token: "jwt-token",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: MESSAGE, signature: SIGNATURE }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      chainId: 31337,
      expiresAt: "2026-10-11T00:00:00.000Z",
    });
    const cookie = response.cookies.get("epistimology_auth");
    expect(cookie?.value).toBe("jwt-token");
    expect(cookie?.httpOnly).toBe(true);
  });

  it("maps a bad signature to 401", async () => {
    verifySiweSignatureMock.mockRejectedValue(
      new UnauthorizedError("Invalid wallet signature"),
    );

    const response = await POST(
      new Request("http://localhost/api/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: MESSAGE, signature: SIGNATURE }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Invalid wallet signature" });
  });

  it("rejects a non-hex signature with 400", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: MESSAGE, signature: "nope" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(verifySiweSignatureMock).not.toHaveBeenCalled();
  });
});
