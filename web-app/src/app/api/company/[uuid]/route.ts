import { NextRequest, NextResponse } from "next/server";
import { CompanyContoller } from "../../controller/CompanyContoller";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest, context: any) {
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const roleUuid = jwt?.data.user_info.role_uuid;
    const companyUuid = context.params.uuid;

    const result = await new CompanyContoller().getCompanyDetailByUuid(
      Number(userId),
      companyUuid,
      roleUuid
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
