import { NextRequest, NextResponse } from "next/server";
import { DashboardController } from "@/app/api/controller/DashboardController";

export async function GET(request: NextRequest, context: any) {
  try {
    const forumUuid = context.params.uuid;
    const forumUuids = request.nextUrl.searchParams.get("forum");
    const from = request.nextUrl.searchParams.get("from");
    const to = request.nextUrl.searchParams.get("to");
    let result =
      await new DashboardController().getDashboardDataBasedOnForumUuid(
        forumUuid,
        from!,
        to!,
      );
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err.statusCode == 422) {
      return NextResponse.json(
        { message: err.data[0] },
        { status: err.statusCode }
      );
    } else if (err.statusCode) {
      return NextResponse.json(
        { message: err.message, data: err.data },
        { status: err.statusCode }
      );
    } else {
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
  }
}
