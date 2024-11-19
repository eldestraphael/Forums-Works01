import { NextRequest, NextResponse } from "next/server";
import { UserController } from "../../../controller/UserController";

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const result = await new UserController().getRolePrivileges(request);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err.statusCode === 422) {
      return NextResponse.json(
        { message: err.message, data: err.data },
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
