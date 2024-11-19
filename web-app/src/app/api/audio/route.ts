import { NextRequest, NextResponse } from "next/server";
import { AudiosController } from "../controller/AudioController";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    const result = await new AudiosController().getAudiosList();
    let res = NextResponse.json(result, { "status": 200 });
    res.headers.set("Cache-Control", "no-store, max-age=0" );
    return res;
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
