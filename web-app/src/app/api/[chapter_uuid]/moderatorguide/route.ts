import { NextRequest, NextResponse } from "next/server";
import { ModeratorGuideController } from "../../controller/ModeratorGuideController";
import { ModeratorGuide } from "../../infrastructure/dtos/ModeratorGuide";

export async function POST(request: NextRequest, context: any) {
  const body: ModeratorGuide[] = await request.json();
  try {
    const chapterUuid = context.params.chapter_uuid;
    const result = await new ModeratorGuideController().createModeratorGuide(
      chapterUuid,
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

export async function GET(request: NextRequest, context: any) {
  try {
    const chapterUuid = context.params.chapter_uuid;
    const result = await new ModeratorGuideController().getModeratorGuide(
      chapterUuid
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err.statusCode == 422) {
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
