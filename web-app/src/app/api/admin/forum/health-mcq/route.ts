import { ForumController } from "@/app/api/controller/ForumController";
import { getCurrentDate } from "@/app/api/helpers/generateCurrentDate";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const forumUuid = request.nextUrl.searchParams.get("uuid");
    const date = request.nextUrl.searchParams.get("date");
    const result = await new ForumController().forumMCQ(
      forumUuid,
      date ? date : getCurrentDate()
    );
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error: any) {
    if (error.statusCode == 422) {
      return NextResponse.json(
        { message: error.data[0] },
        { status: error.statusCode }
      );
    } else if (error.statusCode) {
      return NextResponse.json(
        { message: error.message, data: error.data },
        { status: error.statusCode }
      );
    } else {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
