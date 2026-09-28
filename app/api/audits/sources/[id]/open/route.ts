import { NextResponse } from "next/server";
import { incrementSourceOpenCount } from "@/app/server/repositories/sources";

type Props = {
  params: Promise<{ id: string }>;
};

export const POST = async (request: Request, { params }: Props) => {
  const { id: sourceId } = await params;

  const openCount = await incrementSourceOpenCount(sourceId);

  return NextResponse.json({ sourceId, openCount });
};
