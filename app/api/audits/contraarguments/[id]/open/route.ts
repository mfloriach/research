import { NextResponse } from "next/server";
import { incrementContraargumentOpenCount } from "@/app/server/repositories/contraarguments";

type Props = {
  params: Promise<{ id: string }>;
};

export const POST = async (request: Request, { params }: Props) => {
  const { id: contraargumentId } = await params;

  const openCount = await incrementContraargumentOpenCount(contraargumentId);

  return NextResponse.json({ contraargumentId, openCount });
};
