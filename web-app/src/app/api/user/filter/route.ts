import { NextRequest, NextResponse } from "next/server";
import { UserController } from "../../controller/UserController";
import { getToken } from "next-auth/jwt";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const roleUuid = jwt?.data.user_info.role_uuid;
    const result = await new UserController().getUserFilters(
      userId,
      roleUuid,
      request
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
