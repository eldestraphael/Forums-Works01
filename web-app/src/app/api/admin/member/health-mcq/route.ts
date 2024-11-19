import { NextRequest, NextResponse } from "next/server";
import { UserPerForumHealthController } from "@/app/api/controller/UserPerForumHealthController";
import { UpdateHealth } from "@/app/api/infrastructure/dtos/Health";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userPerForumUuid = request.nextUrl.searchParams.get("uuid");
    const result =
      await new UserPerForumHealthController().getUserPerForumHealthByUuid(
        userPerForumUuid!
      );
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err.statusCode == 422) {
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

export async function PATCH(request: NextRequest) {
  try {
    const userPerForumUuid = request.nextUrl.searchParams.get("uuid");
    const body: UpdateHealth = await request.json();
    const result =
      await new UserPerForumHealthController().updateUserPerForumHealthByUuid(
        userPerForumUuid!,
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
