import { readTimesheets } from "@/utils/timesheetHelper";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Extract ID from URL
    const segments = request.nextUrl.pathname.split("/");
    const id = Number(segments[segments.length - 1]); // last segment is [id]

    if (!id) {
      return NextResponse.json({ error: "Timesheet ID required" }, { status: 400 });
    }

    const timesheets = readTimesheets();
    const timesheet = timesheets.find((ts: { id: number }) => ts.id === id);

    if (!timesheet) {
      return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });
    }

    return NextResponse.json(timesheet);
  } catch (error) {
    console.error("Failed to fetch timesheet:", error);
    return NextResponse.json({ error: "Failed to fetch timesheet" }, { status: 500 });
  }
}
