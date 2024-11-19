import { NextRequest, NextResponse } from "next/server";
import { ZoomController } from "../../../../../controller/ZoomController";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  try {
    const forumUuid = context.params.uuid;
    const meetingUuid = context.params.meetinguuid;
    const result = await new ZoomController().getMeetingInfo(
      forumUuid,
      meetingUuid
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
