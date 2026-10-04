/**
 * @jest-environment node
 */
import { GET } from "./route";
import { POST as logoutPOST } from "../logout/route";
import { verifyAuthToken } from "@/app/server/services/auth-service";
import { cookies } from "next/headers";

jest.mock("@/app/server/services/auth-service", () => ({
  verifyAuthToken: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const verifyAuthTokenMock = verifyAuthToken as jest.Mock;
const cookiesMock = cookies as jest.Mock;

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the session for a valid cookie", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "jwt-token" }),
    });
    verifyAuthTokenMock.mockResolvedValue({
      address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      chainId: 31337,
      expiresAt: "2026-10-11T00:00:00.000Z",
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.address).toBe(
      "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    );
  });

  it("returns 401 without a cookie", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(verifyAuthTokenMock).not.toHaveBeenCalled();
  });

  it("returns 401 for an invalid token", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "stale-token" }),
    });
    verifyAuthTokenMock.mockRejectedValue(new Error("Invalid session"));

    const response = await GET();

    expect(response.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const response = await logoutPOST();
    const body = await response.json();

    expect(body).toEqual({ ok: true });
    const cookie = response.cookies.get("epistimology_auth");
    expect(cookie?.maxAge).toBe(0);
  });
});
