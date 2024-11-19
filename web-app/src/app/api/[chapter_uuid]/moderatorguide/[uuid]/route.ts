import { NextRequest, NextResponse } from "next/server";
import { ModeratorGuideController } from "@/app/api/controller/ModeratorGuideController";

export async function GET(request: NextRequest, context: any) {
  try {
    const moderatorGuideUuid = context.params.uuid;
    const chapterUuid = context.params.chapter_uuid;

    const result = await new ModeratorGuideController().getModeratorGuideByUuid(
      chapterUuid,
      moderatorGuideUuid
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
