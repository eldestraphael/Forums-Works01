import { NextRequest, NextResponse } from "next/server";
import { SurveysController } from "@/app/api/controller/SurveysController";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest, { params }: any) {
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const forumUuid = params.uuid;
    const surveyUuid = params.survey_uuid;
    const body: any = await request.json();

    const result = await new SurveysController().createUserSurvey(
      forumUuid,
      surveyUuid,
      userId,
      body
    );

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

export async function GET(request: NextRequest, { params }: any) {
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const forumUuid = params.uuid;
    const surveyUuid = params.survey_uuid;

    const result = await new SurveysController().getUserSurvey(
      forumUuid,
      surveyUuid,
      userId
    );

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
