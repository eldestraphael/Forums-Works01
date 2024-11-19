import { NextRequest, NextResponse } from "next/server";
import { VideosController } from "../controller/VideosController";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const result = await new VideosController().getVideosList();
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err.statusCode === 422) {
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
