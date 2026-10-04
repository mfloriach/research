import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { AppError, HttpResponse } from "@/lib/errors";
import { parseJson } from "@/lib/parse_json";
import { AUTH_COOKIE_NAME, siweVerifyInputSchema } from "@/lib/siwe";
import {
  JWT_COOKIE_MAX_AGE,
  verifySiweSignature,
} from "@/app/server/services/auth-service";

/**
 * Verify a SIWE signature and create a session
 *
 * @description Consumes the one-time nonce, verifies the EIP-191 wallet
 * signature with `viem`, and mints a JWT stored in an `httpOnly` cookie.
 * @tag Auth
 * @requestBody SiweVerifyInput required
 * @response SiweVerifyResponse:Authenticated session
 * @response 400:ErrorResponse:Invalid input
 * @response 401:ErrorResponse:Verification failed
 * @response 500:ErrorResponse:Verification failed
 * @openapi
 */
export const POST = async (request: Request) => {
  try {
    const parsed = await parseJson(request, siweVerifyInputSchema);
    const session = await verifySiweSignature({
      message: parsed.message,
      signature: parsed.signature,
      requestUrl: request.url,
    });
    const response = NextResponse.json({
      address: session.address,
      chainId: session.chainId,
      expiresAt: session.expiresAt,
    });
    response.cookies.set(AUTH_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: JWT_COOKIE_MAX_AGE,
    });
    return response;
  } catch (error) {
    if (error instanceof HttpResponse || error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    throw error;
  }
};
