import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { FCMTokenContoller } from "../../controller/FCMTokenContoller";
import { DleteFCMToken, FCM } from "../../infrastructure/dtos/FCM";

export async function POST(request: NextRequest) {
  const body: FCM = await request.json();
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const result = await new FCMTokenContoller().StoreFCMToken(userId, body);
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error: any) {
    if (error.statusCode == 422) {
      return NextResponse.json(
        { message: error.message, data: error.data },
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

export async function DELETE(request: NextRequest) {
  const body: DleteFCMToken = await request.json();
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const result = await new FCMTokenContoller().DeleteFCMToken(userId, body);
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error: any) {
    if (error.statusCode == 422) {
      return NextResponse.json(
        { message: error.message, data: error.data },
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
