import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  console.log(`[search] query: "${query}"`);

  return NextResponse.json({ query, logged: true });
}
