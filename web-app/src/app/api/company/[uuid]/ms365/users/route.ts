import { NextRequest, NextResponse } from "next/server";
import { CompanyContoller } from "../../../../controller/CompanyContoller";

export async function GET(request: NextRequest, context: any) {
  try {
    const companyUuid = context.params.uuid;
    const search = request.nextUrl.searchParams.get("search");
    const limit = Number(request.nextUrl.searchParams.get("limit"));
    const result = await new CompanyContoller().getAllUsersFromMS365InACompany(
      companyUuid!,
      limit,
      search
    );
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
