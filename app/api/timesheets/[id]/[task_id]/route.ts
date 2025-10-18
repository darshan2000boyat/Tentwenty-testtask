import { calculateStatus, readTimesheets, writeTimesheets } from "@/utils/timesheetHelper";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: { id: string;
    task_id: string } } ) {
    try {
        const { id, task_id } = await params;

  
      if (!id || !task_id) {
        return NextResponse.json(
          { error: "Missing id or task_id" },
          { status: 400 }
        );
      }
  
      const timesheets = readTimesheets();
  
      const weekIndex = timesheets.findIndex(
        (sheet: any) => sheet.id === Number(id)
      );
  
      if (weekIndex === -1) {
        return NextResponse.json({ error: "Week not found" }, { status: 404 });
      }
  
      const week = timesheets[weekIndex];
  
      const taskIndex = week.tasks.findIndex(
        (task: any) => task.id === Number(task_id)
      );
  
      if (taskIndex === -1) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
  
      week.tasks.splice(taskIndex, 1);
  
      week.totalHours = week.tasks.reduce(
        (sum: number, t: any) => sum + t.hours,
        0
      );
      week.status = calculateStatus(week.totalHours);
  
      timesheets[weekIndex] = week;
      writeTimesheets(timesheets);
  
      return NextResponse.json(
        { message: "Task deleted successfully", week },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting task:", error);
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }
  }