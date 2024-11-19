import { StaticMessage } from "@/app/api/constants/StaticMessages";
import { ForumController } from "@/app/api/controller/ForumController";
import {
  AddForumAttendance,
  UpdateForumAttendance,
} from "@/app/api/infrastructure/dtos/Forum";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: AddForumAttendance[] = await request.json();
    const forumUuid = request.nextUrl.searchParams.get("uuid");
    const date = request.nextUrl.searchParams.get("date");
    const result = await new ForumController().attenancePerForumUser(
      forumUuid!,
      body,
      date!
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

export async function PUT(request: NextRequest) {
  try {
    const body: UpdateForumAttendance[] = await request.json();
    const forumUuid = request.nextUrl.searchParams.get("uuid");
    const date = request.nextUrl.searchParams.get("date");
    await new ForumController().deleteAttenancePerForumUser(
      forumUuid!,
      body,
      date!
    );
    const result = await new ForumController().attenancePerForumUser(
      forumUuid!,
      body,
      date!
    );
    result.message = StaticMessage.UpdateForumMCQs;
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
