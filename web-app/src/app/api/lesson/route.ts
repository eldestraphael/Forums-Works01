import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { LessonController } from "../controller/LessonController";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const body =
      data.get("body") !== null
        ? JSON.parse(data.get("body") as unknown as any)
        : {};
    const jwt: any = await getToken({ req: request });
    const result = await new LessonController().createLesson(file, body);
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
    const result = await new LessonController().getAllLessons(request);
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
    const lessonUuid = request.nextUrl.searchParams.get("uuid");
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const body =
      data.get("body") !== null
        ? JSON.parse(data.get("body") as unknown as any)
        : {};
    const result = await new LessonController().updateLesson(
      body,
      lessonUuid!,
      file
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

export async function DELETE(request: NextRequest) {
  try {
    const lessonUuid = request.nextUrl.searchParams.get("uuid");
    const result = await new LessonController().deleteLessonByUuid(lessonUuid!);
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
    const chapterUuid = request.nextUrl.searchParams.get("chapteruuid");
    const lessonUuid = request.nextUrl.searchParams.get("lessonuuid");
    const body: any = await request.json();
    const result = await new LessonController().updateLessonOrder(
      chapterUuid!,
      lessonUuid!,
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
