import { NextRequest, NextResponse } from "next/server";
import { ForumController } from "../../../../controller/ForumController";
import { Forum, UpdateForum } from "../../../../infrastructure/dtos/Forum";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest, context: any) {
  const body: any = await request.json();
  try {
    let companyUuid = context.params.uuid;
    let forumUuid = context.params.forumuuid;
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const result = await new ForumController().linkUsersinExistingForum(
      companyUuid,
      forumUuid,
      body
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
