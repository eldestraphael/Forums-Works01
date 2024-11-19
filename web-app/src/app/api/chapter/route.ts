import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Chapter } from "../infrastructure/dtos/Chapter";
import { ChapterController } from "../controller/ChapterController";

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body: Chapter = await request.json();
  try {
    const jwt: any = await getToken({ req: request });
    const roleUuid = jwt?.data.user_info.role_uuid;
    const result = await new ChapterController().CreateChapter(roleUuid, body);
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

export async function GET(request: NextRequest) {
  try {
    const jwt: any = await getToken({ req: request });
    const roleUuid = jwt?.data.user_info.role_uuid;
    const result = await new ChapterController().GetAllChapters(
      request,
      roleUuid
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

export async function PUT(request: NextRequest) {
  try {
    const courseUuid = request.nextUrl.searchParams.get("uuid");
    const body: any = await request.json();
    const result = await new ChapterController().updateChapterDetailByUuid(
      courseUuid!,
      body
    );
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error: any) {
    if (error.statusCode == 422) {
      return NextResponse.json(
        { message: error.data[0] },
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

export async function DELETE(request: NextRequest) {
  try {
    const courseUuid = request.nextUrl.searchParams.get("uuid");
    const result = await new ChapterController().deleteChapterDetailByUuid(
      courseUuid!
    );
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error: any) {
    if (error.statusCode == 422) {
      return NextResponse.json(
        { message: error.data[0] },
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

export async function PATCH(request: NextRequest) {
  try {
    const courseUuid = request.nextUrl.searchParams.get("courseuuid");
    const chapterUuid = request.nextUrl.searchParams.get("chapteruuid");
    const body: any = await request.json();
    const result = await new ChapterController().updateChapterOrder(
      courseUuid!,
      chapterUuid!,
      body.new_order
    );
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error: any) {
    if (error.statusCode == 422) {
      return NextResponse.json(
        { message: error.data[0] },
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
