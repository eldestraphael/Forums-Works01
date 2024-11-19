import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { ThinkificCoursesController } from "../../../controller/ThinkificCoursesController";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {

  try {
    const pageNumber = Number(request.nextUrl.searchParams.get("page"));
    const limit = Number(request.nextUrl.searchParams.get("limit"));

    const result = await new ThinkificCoursesController().migrateCoursesFromThinkific(pageNumber, limit);
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
