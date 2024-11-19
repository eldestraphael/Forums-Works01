import { NextRequest, NextResponse } from "next/server";
import { UserController } from "../../controller/UserController";
import { getToken } from "next-auth/jwt";
import { StaticMessage } from "../../constants/StaticMessages";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const jwt: any = await getToken({ req: request });

    const userUuid = jwt?.data.user_info.uuid;
    const roleUuid = jwt?.data.user_info.role_uuid;

    if (!(userUuid && roleUuid)) {
      throw {
        statusCode: 401,
        data: null,
        message: StaticMessage.UnAuthorizedUser,
      };
    }

    const result = await new UserController().getACL(userUuid, roleUuid);
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
