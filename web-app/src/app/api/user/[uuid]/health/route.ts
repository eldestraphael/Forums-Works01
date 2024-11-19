import { NextRequest, NextResponse } from "next/server";
import { UserPerForumHealthController } from "@/app/api/controller/UserPerForumHealthController";
import { UpdateHealth } from "@/app/api/infrastructure/dtos/Health";
import { UserController } from "@/app/api/controller/UserController";

export async function GET(request: NextRequest, context: any) {
  try {
    const userUuid = context.params.uuid;
    const from = request.nextUrl.searchParams.get("from");
    const to = request.nextUrl.searchParams.get("to");
    const forumUuids = request.nextUrl.searchParams.get("forum");

    const result = await new UserController().getUserHealthDetailsByUuid(
      userUuid!,
      from!,
      to!,
      forumUuids
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
