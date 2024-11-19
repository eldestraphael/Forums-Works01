import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { ThinkificCoursesController } from "@/app/api/controller/ThinkificCoursesController";

export async function GET(request: NextRequest, context: any) {
  try {
    const courseUuid = context.params.course_uuid;
    const chapterUuid = context.params.chapter_uuid;

    const result =
      await new ThinkificCoursesController().migrateLessonsFromThinkific(
        courseUuid,
        chapterUuid
      );
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.statusCode === 422) {
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
