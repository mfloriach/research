/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { middleware } from "./middleware";
import { AUTH_COOKIE_NAME } from "@/lib/siwe";

// jose ships ESM only, which this Jest setup cannot transform out of
// node_modules; mock the boundary and test the middleware's own gating.
// Real signature verification is covered live by the auth flow.
jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
}));

const jwtVerifyMock = jwtVerify as jest.Mock;

const ADDRESS = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

function postAudit(pathname: string, cookie?: string) {
  return new NextRequest(`http://localhost${pathname}`, {
    method: "POST",
    headers: cookie ? { cookie: `${AUTH_COOKIE_NAME}=${cookie}` } : {},
  });
}

describe("middleware session gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwtVerifyMock.mockResolvedValue({ payload: { address: ADDRESS } });
  });

  it("rejects audit creators without a session with 401", async () => {
    const response = await middleware(postAudit("/api/audits/evidences"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Authentication required" });
    expect(jwtVerifyMock).not.toHaveBeenCalled();
  });

  it("rejects audit creators with an invalid token with 401", async () => {
    jwtVerifyMock.mockRejectedValue(new Error("invalid token"));

    const response = await middleware(
      postAudit("/api/audits/evidences", "not-a-jwt"),
    );

    expect(response.status).toBe(401);
  });

  it("lets audit creators with a session through", async () => {
    const response = await middleware(
      postAudit("/api/audits/evidences", "valid-token"),
    );

    // NextResponse.next(): the route runs.
    expect(response.status).toBe(200);
    expect(jwtVerifyMock).toHaveBeenCalled();
  });

  it("leaves reads public", async () => {
    const response = await middleware(
      new NextRequest("http://localhost/api/arguments"),
    );

    expect(response.status).toBe(200);
  });

  it("leaves view-count posts public", async () => {
    const response = await middleware(
      postAudit("/api/audits/evidences/some-id/open"),
    );

    expect(response.status).toBe(200);
  });

  it("leaves other creators public", async () => {
    const response = await middleware(postAudit("/api/debates"));

    expect(response.status).toBe(200);
  });
});
