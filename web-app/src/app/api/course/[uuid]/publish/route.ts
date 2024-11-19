import { NextRequest, NextResponse } from "next/server";
import { CourseContoller } from "../../../controller/CourseContoller";

export async function POST(request: NextRequest, context: any) {
  const body: any = await request.json();
  try {
    const courseUuid = context.params.uuid;
    const result = await new CourseContoller().PublishCourse(courseUuid, body);
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
