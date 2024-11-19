import { NextResponse } from "next/server";
import { StaticMessage } from "../../constants/StaticMessages";
import { ResetPasswordController } from "../../controller/requestResetPasswordController";

interface RequestBody {
  email: string;
}

export async function POST(request: Request) {
  const body: RequestBody = await request.json();

  try {
    let result = await new ResetPasswordController().getOTPEmail(body.email);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err.statusCode == 422) {
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
