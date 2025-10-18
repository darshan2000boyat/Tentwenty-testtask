import {
  readTimesheets,
} from "@/utils/timesheetHelper";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Timesheet ID required" }, { status: 400 });
    }

    const timesheets = readTimesheets();
    const timesheet = timesheets.find((ts: any) => ts.id === parseInt(id));

    if (!timesheet) {
      return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });
    }

    return NextResponse.json(timesheet);
  } catch (error) {
    console.error("Failed to fetch timesheet:", error);
    return NextResponse.json({ error: "Failed to fetch timesheet" }, { status: 500 });
  }
}