import { NextRequest, NextResponse } from "next/server";
import { createRecords } from "@/app/api/controller/SeedingData";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();
    const result = await createRecords(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.statusCode === 422) {
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
