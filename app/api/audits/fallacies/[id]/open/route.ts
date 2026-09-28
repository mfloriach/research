import { NextResponse } from "next/server";
import { incrementFallacyOpenCount } from "@/app/server/repositories/fallacies";

type Props = {
  params: Promise<{ id: string }>;
};

export const POST = async (request: Request, { params }: Props) => {
  const { id: fallacyId } = await params;

  const openCount = await incrementFallacyOpenCount(fallacyId);

  return NextResponse.json({ fallacyId, openCount });
};
