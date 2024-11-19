import { NextRequest, NextResponse } from "next/server";
import { CompanyContoller } from "../../../../controller/CompanyContoller";
import { ProviderType } from "@prisma/client";

export async function GET(request: NextRequest, context: any) {
  try {
    const companyUuid = context.params.uuid;
    const search = request.nextUrl.searchParams.get("search");
    const limit = Number(request.nextUrl.searchParams.get("limit"));
    const oAuthType = request.nextUrl.searchParams.get("type");
    const result = await new CompanyContoller().getAllUsersFromOauthInACompany(
      companyUuid!,
      limit,
      search,
      oAuthType as ProviderType
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
