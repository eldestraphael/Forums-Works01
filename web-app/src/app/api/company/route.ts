import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Company } from "../infrastructure/dtos/Company";
import { CompanyContoller } from "../controller/CompanyContoller";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const jwt: any = await getToken({ req: request });
    const userId = jwt?.data.user_info.id;
    const companyId = jwt?.data.user_info.company_id;
    const roleUuid = jwt?.data.user_info.role_uuid;

    const result = await new CompanyContoller().getCompanyDetailsBasedOnSearch(
      Number(userId),
      Number(companyId),
      roleUuid,
      request
    );
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

export async function POST(request: NextRequest) {
  const body: Company = await request.json();
  try {
    const jwt: any = await getToken({ req: request });
    const roleUuid = jwt?.data.user_info.role_uuid;
    const result = await new CompanyContoller().CreateCompany(roleUuid, body);
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

export async function PATCH(request: NextRequest) {
  try {
    const companyUuid = request.nextUrl.searchParams.get("uuid");
    const body: any = await request.json();
    const result = await new CompanyContoller().updateCompany(
      body,
      companyUuid!
    );
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error: any) {
    if (error.statusCode == 422) {
      return NextResponse.json(
        { message: error.data[0] },
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

export async function PUT(request: NextRequest) {
  try {
    const companyUuid = request.nextUrl.searchParams.get("uuid");
    const body: any = await request.json();
    const result = await new CompanyContoller().updateCompanyName(
      body,
      companyUuid!
    );
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error: any) {
    if (error.statusCode == 422) {
      return NextResponse.json(
        { message: error.data[0] },
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
