import { NextRequest, NextResponse } from "next/server";
import { ForumController } from "../../../controller/ForumController";
import { StaticMessage } from "../../../constants/StaticMessages";
import { getToken } from "next-auth/jwt";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const roleUuid = jwt?.data.user_info.role_uuid;

    const result = await new ForumController().Search(
      Number(userId),
      roleUuid,
      request
    );
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error: any) {
    if (error.status == 422) {
      return NextResponse.json(
        { message: error.data[0] },
        { status: error.statusCode }
      );
    } else if (error.statusCode) {
      return NextResponse.json(
        { message: error.message, data: null },
        { status: error.statusCode }
      );
    } else {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
