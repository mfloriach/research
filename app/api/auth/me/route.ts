import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/siwe";
import { verifyAuthToken } from "@/app/server/services/auth-service";

/**
 * Read the current session
 *
 * @description Verifies the JWT in the `httpOnly` auth cookie and returns
 * the authenticated wallet address.
 * @tag Auth
 * @response SiweSession:Current session
 * @response 401:ErrorResponse:No valid session
 * @openapi
 */
export const GET = async () => {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "No active session" }, { status: 401 });
  }
  try {
    const session = await verifyAuthToken(token);
    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid session";
    return NextResponse.json({ error: message }, { status: 401 });
  }
};
