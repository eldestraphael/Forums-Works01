import { NextRequest, NextResponse } from "next/server";
import { UploadUserController } from "../../controller/UploadUserController";

interface RequestBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const result = await new UploadUserController().uploadCsv(file);
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
