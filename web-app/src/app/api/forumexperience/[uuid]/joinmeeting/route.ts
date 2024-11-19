import { NextRequest, NextResponse } from "next/server";
import { ZoomController } from "../../../controller/ZoomController";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: any) {
  try {
    const body = await request.json();
    const forumUuid = context.params.uuid;
    const jwt: any = await getToken({ req: request });
    const userUuid = jwt?.data.user_info.uuid;
    const result = await new ZoomController().joinMeeting(
      userUuid,
      forumUuid,
      body
    );
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err.statusCode === 422) {
      return NextResponse.json(
        { message: err.message, data: err.data },
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
