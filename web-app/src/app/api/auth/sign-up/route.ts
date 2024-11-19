import { NextResponse } from "next/server";
import { StaticMessage } from "../../constants/StaticMessages";
import { SignInSignUpController } from "../../controller/SignInSignUpController";
interface RequestBody {
  first_name: string;
  last_name?: string;
  email: string;
  password?: string;
  phone?: string;
  job_title: string;
  company_name: string;
}

export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  try {
    const result = await new SignInSignUpController().SignUp(body);
    return NextResponse.json(result, {
      status: 200,
    });
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
