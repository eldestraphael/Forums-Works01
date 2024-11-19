import { NextRequest, NextResponse } from "next/server";
import { MemberController } from "../../../controller/MemberController";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
      const userUuid = request.nextUrl.searchParams.get("uuid");
      const forumUuid = request.nextUrl.searchParams.get("forum");
        const result = await new MemberController().getMemberHealthDetailsByUuid(
          userUuid!,
          forumUuid!
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