import { NextRequest, NextResponse } from "next/server";
import { ForumController } from "../../controller/ForumController";
import { Forum, UpdateForum } from "../../infrastructure/dtos/Forum";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body: Forum = await request.json();
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const result = await new ForumController().Forum(userId, body);
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
    const userId = jwt?.data.user_info.id;
    const roleUuid = jwt?.data.user_info.role_uuid;
    const forumUuid = request.nextUrl.searchParams.get("uuid");
    const pageNumber = request.nextUrl.searchParams.get("page");
    const limit = request.nextUrl.searchParams.get("limit");
    if (forumUuid) {
      const result = await new ForumController().forumByUuid(forumUuid);
      return NextResponse.json(result, {
        status: 200,
      });
    } else if (pageNumber && limit) {
      const result = await new ForumController().getAllForum(
        userId,
        roleUuid,
        pageNumber,
        limit
      );
      return NextResponse.json(result, {
        status: 200,
      });
    }
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
    const forumUuid = request.nextUrl.searchParams.get("uuid");
    const body: UpdateForum = await request.json();
    const result = await new ForumController().updateForum(body, forumUuid!);
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
