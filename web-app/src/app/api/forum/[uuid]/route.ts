import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ForumController } from "@/app/api/controller/ForumController";
import { UpdateForum } from "../../infrastructure/dtos/Forum";

export async function GET(request: NextRequest, context: any) {
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const roleUuid = jwt?.data.user_info.role_uuid;
    const forumUuid = context.params.uuid;

    const result = await new ForumController().getForumByUuid(
      userId,
      roleUuid,
      forumUuid
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

export async function PATCH(request: NextRequest, context: any) {
  try {
    const jwt: any = await getToken({ req: request });
    const roleUuid = jwt?.data.user_info.role_uuid;
    const forumUuid = context.params.uuid;
    const body: UpdateForum = await request.json();

    const result = await new ForumController().updateForumByUuid(
      roleUuid,
      body,
      forumUuid!
    );
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error: any) {
    if (error.statusCode == 422) {
      return NextResponse.json(
        { message: error.message, data: error.data },
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
