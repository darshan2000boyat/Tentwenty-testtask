import {
  calculateStatus,
  readTimesheets,
  writeTimesheets,
} from "@/utils/timesheetHelper";
import { NextRequest, NextResponse } from "next/server";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface Task {
  id: number;
  title: string;
  description: string;
  hours: number;
  date: string;
  project?: string;
  typeOfWork?: string;
}

type TimesheetStatus = "COMPLETED" | "INCOMPLETE" | "MISSING";

interface Timesheet {
  id: number;
  week: number;
  dateRange: string;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  tasks: Task[];
  totalHours: number;
  status: TimesheetStatus;
}

// Type read/write helpers
const timesheets: Timesheet[] = readTimesheets() as Timesheet[];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const dateRange = searchParams.get("dateRange");

  let filteredTimesheets: Timesheet[] = [...timesheets];

  if (status && status !== "Status") {
    filteredTimesheets = filteredTimesheets.filter(
      (ts) => ts.status === (status.toUpperCase() as TimesheetStatus)
    );
  }

  if (dateRange && dateRange !== "Date Range") {
    const today = new Date();
    filteredTimesheets = filteredTimesheets.filter((ts) => {
      const startDate = new Date(ts.startDate);
      switch (dateRange) {
        case "last7days":
          return startDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "last30days":
          return startDate >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        case "last90days":
          return startDate >= new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    });
  }

  return NextResponse.json({
    timesheets: filteredTimesheets,
    total: filteredTimesheets.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: {
      title: string;
      description: string;
      hours: number;
      date: string;
      project?: string;
      typeOfWork?: string;
    } = await request.json();

    const { title, description, hours, date, project, typeOfWork } = body;

    if (!title || !description || !hours) {
      return NextResponse.json(
        { error: "Missing required task fields" },
        { status: 400 }
      );
    }

    const timesheets: Timesheet[] = readTimesheets() as Timesheet[];

    const existingWeek = timesheets.find((sheet) =>
      sheet.tasks.some((task) => task.date === date)
    );

    if (existingWeek) {
      const newTask: Task = {
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
        (sum, t) => sum + t.hours,
        0
      );
      existingWeek.status = calculateStatus(existingWeek.totalHours);

      writeTimesheets(timesheets as Timesheet[]);
      return NextResponse.json(existingWeek, { status: 200 });
    }

    const today = new Date(date || new Date());
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const friday = new Date(start);
    friday.setDate(start.getDate() + 4);

    const newWeek: Timesheet = {
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
          project,
          typeOfWork,
        },
      ],
      totalHours: hours,
      status: calculateStatus(hours),
    };

    timesheets.push(newWeek);
    writeTimesheets(timesheets as Timesheet[]);

    return NextResponse.json(newWeek, { status: 201 });
  } catch (error) {
    console.error("Error creating or updating timesheet:", error);
    return NextResponse.json(
      { error: "Failed to create or update timesheet" },
      { status: 500 }
    );
  }
}
