import { NextRequest, NextResponse } from "next/server";
import { PdfsController } from "../controller/PdfsController";
import { ImagesController } from "../controller/ImagesController";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const result = await new ImagesController().getImagesList();
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
