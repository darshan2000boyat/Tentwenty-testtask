import {
  calculateStatus,
  readTimesheets,
  writeTimesheets,
} from "@/utils/timesheetHelper";
import { NextRequest, NextResponse } from "next/server";

// export async function PUT(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");
//     const body = await request.json();

//     if (!id) {
//       return NextResponse.json(
//         { error: "Timesheet ID required" },
//         { status: 400 }
//       );
//     }

//     const timesheets = readTimesheets();
//     const timesheetIndex = timesheets.findIndex(
//       (ts: any) => ts.id === parseInt(id)
//     );

//     if (timesheetIndex === -1) {
//       return NextResponse.json(
//         { error: "Timesheet not found" },
//         { status: 404 }
//       );
//     }

//     const totalHours = Array.isArray(body.tasks)
//       ? body.tasks.reduce(
//           (sum: number, task: { hours: number }) => sum + (task.hours || 0),
//           0
//         )
//       : 0;

//     const status = calculateStatus(totalHours);

//     timesheets[timesheetIndex] = {
//       ...timesheets[timesheetIndex],
//       ...body,
//       totalHours,
//       status,
//     };

//     writeTimesheets(timesheets);

//     return NextResponse.json(timesheets[timesheetIndex]);
//   } catch (error) {
//     console.error("❌ Failed to update timesheet:", error);
//     return NextResponse.json(
//       { error: "Failed to update timesheet" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // ✅ dynamic route params
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
    console.error("❌ Failed to fetch timesheet:", error);
    return NextResponse.json({ error: "Failed to fetch timesheet" }, { status: 500 });
  }
}