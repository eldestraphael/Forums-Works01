import { NextRequest, NextResponse } from "next/server";
import { DashboardController } from "@/app/api/controller/DashboardController";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest, context: any) {
  try {
    const jwt: any = await getToken({ req: request });
    const forumUuid = context.params.uuid;
    const userId = jwt?.data.user_info.id;
    const companyId = jwt?.data.user_info.company_id;
    const from = request.nextUrl.searchParams.get("from");
    const to = request.nextUrl.searchParams.get("to");
    const isMobileView = true;

    let result =
      await new DashboardController().getDashboardDataBasedOnForumUuid(
        forumUuid,
        from!,
        to!,
        userId,
        companyId,
        isMobileView
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
