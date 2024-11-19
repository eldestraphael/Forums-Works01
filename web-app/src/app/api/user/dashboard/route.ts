import { NextRequest, NextResponse } from "next/server";
import { DashboardController } from "@/app/api/controller/DashboardController";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const forumUuids = request.nextUrl.searchParams.get("forum");
    const companyUuids = request.nextUrl.searchParams.get("company");
    const from = request.nextUrl.searchParams.get("from");
    const to = request.nextUrl.searchParams.get("to");
    let result =
      await new DashboardController().getDashboardData(
        from!,
        to!,
        forumUuids,
        companyUuids
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
