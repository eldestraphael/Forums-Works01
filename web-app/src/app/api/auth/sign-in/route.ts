import { NextResponse } from "next/server";
import { StaticMessage } from "../../constants/StaticMessages";
import { SignInSignUpController } from "../../controller/SignInSignUpController";

interface SignInRequestBody {
  email: string;
  password: string;
}
export async function POST(request: Request) {
  const body: SignInRequestBody = await request.json();

  try {
    const result = await new SignInSignUpController().SignIn(body);
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
