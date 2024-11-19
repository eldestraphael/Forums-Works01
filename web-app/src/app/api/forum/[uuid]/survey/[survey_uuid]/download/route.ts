import { NextRequest, NextResponse } from "next/server";
import { SurveysController } from "@/app/api/controller/SurveysController";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest, { params }: any) {
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const roleUuid = jwt?.data.user_info.role_uuid;
    const forumUuid = params.uuid;
    const surveyUuid = params.survey_uuid;

    const controller = new SurveysController();
    const result = await controller.downloadSurveysBySurveyId(
      userId,
      roleUuid,
      forumUuid,
      surveyUuid
    );

    return new NextResponse(result.buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename=${result.filename}`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
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
