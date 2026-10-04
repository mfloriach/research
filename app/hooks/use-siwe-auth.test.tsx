import { act, renderHook, waitFor } from "@testing-library/react";
import { useSiweAuth } from "./use-siwe-auth";

const ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const MESSAGE = "test-message-to-sign";
const SIGNATURE = `0x${"ab".repeat(65)}`;

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status,
    json: async () => body,
  });
}

describe("useSiweAuth", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "No active session" }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("completes the nonce-sign-verify flow", async () => {
    const { result } = renderHook(() => useSiweAuth());
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    (global.fetch as jest.Mock).mockClear();
    mockFetchOnce({
      nonce: "abc",
      message: MESSAGE,
      expiresAt: "2026-10-04T00:10:00.000Z",
    });
    mockFetchOnce({
      address: ADDRESS.toLowerCase(),
      chainId: 31337,
      expiresAt: "2026-10-11T00:00:00.000Z",
    });
    const provider = {
      request: jest.fn().mockResolvedValue(SIGNATURE),
    };

    let ok = false;
    await act(async () => {
      ok = await result.current.signIn({ address: ADDRESS, provider });
    });

    expect(ok).toBe(true);
    expect(provider.request).toHaveBeenCalledWith({
      method: "personal_sign",
      params: [MESSAGE, ADDRESS],
    });
    expect(result.current.status).toBe("authenticated");
    expect(result.current.address).toBe(ADDRESS.toLowerCase());
  });

  it("reports verification failures", async () => {
    const { result } = renderHook(() => useSiweAuth());
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    (global.fetch as jest.Mock).mockClear();
    mockFetchOnce({
      nonce: "abc",
      message: MESSAGE,
      expiresAt: "2026-10-04T00:10:00.000Z",
    });
    mockFetchOnce({ error: "Invalid wallet signature" }, false, 401);
    const provider = {
      request: jest.fn().mockResolvedValue(SIGNATURE),
    };

    let ok = true;
    await act(async () => {
      ok = await result.current.signIn({ address: ADDRESS, provider });
    });

    expect(ok).toBe(false);
    expect(result.current.status).toBe("anonymous");
    expect(result.current.error).toBe("Invalid wallet signature");
  });

  it("clears state on sign out", async () => {
    const { result } = renderHook(() => useSiweAuth());
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    (global.fetch as jest.Mock).mockClear();
    mockFetchOnce({ ok: true });

    await act(async () => {
      await result.current.signOut();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
    });
    expect(result.current.status).toBe("anonymous");
    expect(result.current.address).toBeNull();
  });
});
