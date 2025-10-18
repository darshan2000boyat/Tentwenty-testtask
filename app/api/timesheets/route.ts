import {
  calculateStatus,
  readTimesheets,
  writeTimesheets,
} from "@/utils/timesheetHelper";
import { NextRequest, NextResponse } from "next/server";
import { format, startOfWeek, endOfWeek } from "date-fns";

const timesheets = readTimesheets();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const dateRange = searchParams.get("dateRange");

  let filteredTimesheets = [...timesheets];

  if (status && status !== "Status") {
    filteredTimesheets = filteredTimesheets.filter(
      (ts) => ts.status === status.toUpperCase()
    );
  }

  if (dateRange && dateRange !== "Date Range") {
    filteredTimesheets = filteredTimesheets.filter((ts) => {
      if (dateRange === "last7days") {
        return true;
      }
      if (dateRange === "last30days") {
        return true;
      }
      return true;
    });
  }

  return NextResponse.json({
    timesheets: filteredTimesheets,
    total: filteredTimesheets.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, hours, date, project, typeOfWork } = body;

    if (!title || !description || !hours) {
      return NextResponse.json(
        { error: "Missing required task fields" },
        { status: 400 }
      );
    }

    const timesheets = readTimesheets();

    let existingWeek = timesheets.find((sheet: any) =>
      sheet.tasks.some((task: any) => task.date === date)
    );

    if (existingWeek) {
      const newTask = {
        id: existingWeek.tasks.length + 1,
        title,
        description,
        hours,
        date,
        project,
        typeOfWork,
      };

      existingWeek.tasks.push(newTask);
      existingWeek.totalHours = existingWeek.tasks.reduce(
        (sum: number, t: any) => sum + t.hours,
        0
      );
      existingWeek.status = calculateStatus(existingWeek.totalHours);

      writeTimesheets(timesheets);
      return NextResponse.json(existingWeek, { status: 200 });
    }

    const today = new Date(date || new Date());
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const friday = new Date(start);
    friday.setDate(start.getDate() + 4);

    const newWeek = {
      id: timesheets.length + 1,
      week: timesheets.length + 1,
      dateRange: `${format(start, "d MMMM")} - ${format(
        friday,
        "d MMMM, yyyy"
      )}`,
      year: today.getFullYear(),
      month: today.getMonth(),
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(friday, "yyyy-MM-dd"),
      tasks: [
        {
          id: 1,
          title,
          description,
          hours,
          date: format(today, "yyyy-MM-dd"),
        },
      ],
      totalHours: hours,
      status: calculateStatus(hours),
    };

    timesheets.push(newWeek);
    writeTimesheets(timesheets);

    return NextResponse.json(newWeek, { status: 201 });
  } catch (error) {
    console.error("Error creating or updating timesheet:", error);
    return NextResponse.json(
      { error: "Failed to create or update timesheet" },
      { status: 500 }
    );
  }
}
