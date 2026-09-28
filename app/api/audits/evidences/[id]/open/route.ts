import { NextResponse } from "next/server";
import { incrementEvidenceOpenCount } from "@/app/server/repositories/evidences";

type Props = {
  params: Promise<{ id: string }>;
};

export const POST = async (request: Request, { params }: Props) => {
  const { id: evidenceId } = await params;

  const openCount = await incrementEvidenceOpenCount(evidenceId);

  return NextResponse.json({ evidenceId, openCount });
};
