import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()
    return response
  } catch (error) {
    // if (error instanceof AuditItemNotFoundError) {
    //     return NextResponse.json({ error: "Audit item not found" }, { status: 404 });
    // }
    // log.error(
    //     { event: "audit.openFailed", err: error },
    //     "Failed to record contraargument open",
    // );
    return NextResponse.json({ error: "Could not record open" }, { status: 500 });
    }
}