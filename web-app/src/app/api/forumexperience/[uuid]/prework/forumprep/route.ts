import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ForumPrepController } from "../../../../controller/ForumPrepController";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: any) {
  const body = await request.json();
  try {
    const forumUuid = context.params.uuid;
    const jwt: any = await getToken({ req: request });
    const userUuid = jwt?.data.user_info.uuidid;
    const result = await new ForumPrepController().createUserForumPrepAnswers(
      forumUuid,
      userUuid,
      body
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.statusCode === 422) {
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
