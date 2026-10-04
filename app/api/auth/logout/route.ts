import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/siwe";

/**
 * End the current session
 *
 * @description Clears the `httpOnly` auth cookie holding the JWT.
 * @tag Auth
 * @response SiweLogoutResponse:Session cleared
 * @openapi
 */
export const POST = async () => {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
};
