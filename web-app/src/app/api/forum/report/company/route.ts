import { NextRequest, NextResponse } from "next/server";
import {
  getCompanyMonthlyReport,
} from "../../../controller/HealthControllet";
import { StaticMessage } from "@/app/api/constants/StaticMessages";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  try {
    const headers = request.headers;
    const api_key = headers.get("x-api-key");
    if (process.env.API_KEY !== api_key) {
      throw {
        statusCode: 401,
        message: StaticMessage.InvalidAPIKey,
      };
    }
    const result = await getCompanyMonthlyReport();
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
