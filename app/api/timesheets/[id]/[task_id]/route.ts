import { calculateStatus, readTimesheets, writeTimesheets } from "@/utils/timesheetHelper";
import { NextRequest, NextResponse } from "next/server";

interface Task {
  id: number;
  title: string;
  description: string;
  hours: number;
  date: string;
  project: string;
  typeOfWork: string;
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

// Helper to extract params from URL
const getParams = (request: NextRequest): { id: number; task_id: number } => {
  const segments = request.nextUrl.pathname.split("/");
  const id = Number(segments[segments.length - 2]);
  const task_id = Number(segments[segments.length - 1]);
  return { id, task_id };
};

export async function GET(request: NextRequest) {
  try {
    const { id, task_id } = getParams(request);

    const timesheets: Timesheet[] = readTimesheets();
    const week = timesheets.find((sheet) => sheet.id === id);

    if (!week) return NextResponse.json({ error: "Week not found" }, { status: 404 });

    const task = week.tasks.find((t) => t.id === task_id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, task_id } = getParams(request);

    const timesheets: Timesheet[] = readTimesheets();
    const weekIndex = timesheets.findIndex((sheet) => sheet.id === id);
    if (weekIndex === -1) return NextResponse.json({ error: "Week not found" }, { status: 404 });

    const week = timesheets[weekIndex];
    const taskIndex = week.tasks.findIndex((t) => t.id === task_id);
    if (taskIndex === -1) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    week.tasks.splice(taskIndex, 1);
    week.totalHours = week.tasks.reduce((sum, t) => sum + t.hours, 0);
    week.status = calculateStatus(week.totalHours) as TimesheetStatus;

    timesheets[weekIndex] = week;
    writeTimesheets(timesheets);

    return NextResponse.json({ message: "Task deleted successfully", week }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, task_id } = getParams(request);
    const body: Partial<Task> = await request.json();

    const timesheets: Timesheet[] = readTimesheets();
    const weekIndex = timesheets.findIndex((sheet) => sheet.id === id);
    if (weekIndex === -1) return NextResponse.json({ error: "Week not found" }, { status: 404 });

    const week = timesheets[weekIndex];
    const taskIndex = week.tasks.findIndex((t) => t.id === task_id);
    if (taskIndex === -1) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    week.tasks[taskIndex] = { ...week.tasks[taskIndex], ...body };
    week.totalHours = week.tasks.reduce((sum, t) => sum + t.hours, 0);
    week.status = calculateStatus(week.totalHours) as TimesheetStatus;

    timesheets[weekIndex] = week;
    writeTimesheets(timesheets);

    return NextResponse.json({ message: "Task updated successfully", task: week.tasks[taskIndex] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
