import { NextResponse } from "next/server";
import { AppError, HttpResponse } from "@/lib/errors";
import { parseJson } from "@/lib/parse_json";
import { siweNonceInputSchema } from "@/lib/siwe";
import { issueSiweNonce } from "@/app/server/services/auth-service";

/**
 * Issue a SIWE login nonce
 *
 * @description Creates a one-time nonce bound to the wallet address and
 * returns the exact EIP-4361 message to sign with `personal_sign`.
 * @tag Auth
 * @requestBody SiweNonceInput required
 * @response SiweNonceResponse:Nonce and message to sign
 * @response 400:ErrorResponse:Invalid input
 * @response 500:ErrorResponse:Issuing failed
 * @openapi
 */
export const POST = async (request: Request) => {
  try {
    const parsed = await parseJson(request, siweNonceInputSchema);
    const result = await issueSiweNonce({
      address: parsed.address,
      chainId: parsed.chainId,
      requestUrl: request.url,
    });
    return NextResponse.json(result);
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
