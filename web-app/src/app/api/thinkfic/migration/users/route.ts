import { ThinkficUserController } from "@/app/api/controller/Thinkfic/ThinkficUserController";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const pageNumber = request.nextUrl.searchParams.get("page");
    const limit = request.nextUrl.searchParams.get("limit");
    const result = await new ThinkficUserController().migrateUserFromThinkfic(
      Number(pageNumber),
      Number(limit)
    );
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err.statusCode) {
      return NextResponse.json(
        { message: err.message, data: err.data },
        { status: err.statusCode }
      );
    }
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
