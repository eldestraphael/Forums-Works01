import { NextRequest, NextResponse } from "next/server";
import { ActionStepsController } from "../controller/ActionStepsController";

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const result = await new ActionStepsController().CreateActionSteps(body);
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

export async function PUT(request: NextRequest) {
  try {
    const actionStepsUuid = request.nextUrl.searchParams.get("uuid");
    const body: any = await request.json();
    const result =
      await new ActionStepsController().updateActionStepsDetailByUuid(
        actionStepsUuid!,
        body
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

export async function DELETE(request: NextRequest) {
  try {
    const actionStepsUuid = request.nextUrl.searchParams.get("uuid");
    const result = await new ActionStepsController().deleteActionStepsByUuid(
      actionStepsUuid!
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
