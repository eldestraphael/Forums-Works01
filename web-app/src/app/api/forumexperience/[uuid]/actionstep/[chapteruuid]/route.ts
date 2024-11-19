import { NextRequest, NextResponse } from "next/server";
import { UserForumPreWorkController } from "@/app/api/controller/UserForumPreWorkController";
import { getToken } from "next-auth/jwt";
import { ActionStepsController } from "@/app/api/controller/ActionStepsController";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  try {
    const forumUuid = context.params.uuid;
    const chapterUuid = context.params.chapteruuid;
    const jwt: any = await getToken({ req: request });
    const userUuid = jwt?.data.user_info.uuid;
    const previousChapter =
      request.nextUrl.searchParams.get("previous_chapter");

    const result =
      await new ActionStepsController().getMessagesByForumAndActionStep(
        forumUuid!,
        chapterUuid!,
        userUuid,
        Number(previousChapter)
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

export async function POST(request: NextRequest, context: any) {
  const body = await request.json();
  try {
    const forumUuid = context.params.uuid;
    const chapterUuid = context.params.chapteruuid;
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const result = await new ActionStepsController().storeActionStepTransaction(
      userId,
      forumUuid,
      chapterUuid,
      body.message
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
