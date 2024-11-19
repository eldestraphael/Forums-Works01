import { NextRequest, NextResponse } from "next/server";
import { CompanyContoller } from "../../../controller/CompanyContoller";

export async function PUT(request: NextRequest, context: any) {
  try {
    const companyUuid = context.params.uuid;
    const body: any = await request.json();
    const result = await new CompanyContoller().addOauthToken(
      body,
      companyUuid!
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
