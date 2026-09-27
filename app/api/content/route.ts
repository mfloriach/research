import { NextResponse } from "next/server";
import { getContentFromDb } from "@/lib/content-db";

export async function GET() {
  try {
    const content = await getContentFromDb();
    return NextResponse.json(content);
  } catch (error) {
    console.warn("[api/content] failed to read content from MongoDB:", (error as Error).message);
    return NextResponse.json({ error: "Content unavailable" }, { status: 500 });
  }
}
