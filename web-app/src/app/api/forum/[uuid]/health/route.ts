import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ForumController } from "@/app/api/controller/ForumController";

export async function GET(request: NextRequest, context: any) {
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const roleUuid = jwt?.data.user_info.role_uuid;
    const forumUuid = context.params.uuid;
    const from = request.nextUrl.searchParams.get("from");
    const to = request.nextUrl.searchParams.get("to");

    const result = await new ForumController().getForumHealthByUuid(
      userId,
      roleUuid,
      forumUuid!,
      from!,
      to!
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err.statusCode === 422) {
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
