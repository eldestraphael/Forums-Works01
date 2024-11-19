import { NextRequest, NextResponse } from "next/server";
import { UserController } from "../controller/UserController";
import { getToken } from "next-auth/jwt";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const companyId = jwt?.data.user_info.company_id;
    const roleUuid = jwt?.data.user_info.role_uuid;
    const result = await new UserController().getUserDetailsBasedOnFilters(
      Number(userId),
      Number(companyId),
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

export async function PATCH(request: NextRequest) {
  try {
    const userUuid = request.nextUrl.searchParams.get("uuid");
    const body: any = await request.json();
    const result = await new UserController().updateUser(body, userUuid!);
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
