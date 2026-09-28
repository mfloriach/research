import { NextResponse } from "next/server";
import { incrementInterpretationOpenCount } from "@/app/server/repositories/interpretations";

type Props = {
  params: Promise<{ id: string }>;
};

export const POST = async (request: Request, { params }: Props) => {
  const { id: interpretationId } = await params;

  const openCount = await incrementInterpretationOpenCount(interpretationId);

  return NextResponse.json({ interpretationId, openCount });
};
