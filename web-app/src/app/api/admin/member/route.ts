import { NextRequest, NextResponse } from "next/server";
import { MemberController } from "../../controller/MemberController";
import { StaticMessage } from "../../constants/StaticMessages";
import { AddMember, UpdateMember } from "../../infrastructure/dtos/Member";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body: AddMember = await request.json();
  try {
    const result = await new MemberController().AddMember(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err.statusCode == 422) {
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

export async function GET(request: NextRequest) {
  try {
    const userUuid = request.nextUrl.searchParams.get("uuid");
    const query = request.nextUrl.searchParams.get("q");
    if (userUuid) {
      const result = await new MemberController().getMemberDetailsByUuid(
        userUuid
      );
      return NextResponse.json(result, { status: 200 });
    } else if (query) {
      const result = await new MemberController().searchMember(query);
      return NextResponse.json(result, { status: 200 });
    } else {
      throw {
        statusCode: 400,
        data: null,
        message: StaticMessage.InvalidInput,
      };
    }
  } catch (err: any) {
    if (err.statusCode == 422) {
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

export async function PATCH(request: NextRequest) {
  try {
    const memberUuid = request.nextUrl.searchParams.get("uuid");
    const body: UpdateMember = await request.json();
    const result = await new MemberController().updateMember(body, memberUuid!);
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
  try {
    const memberUuid = request.nextUrl.searchParams.get("uuid");
    const result = await new MemberController().deleteMember(memberUuid!);
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
