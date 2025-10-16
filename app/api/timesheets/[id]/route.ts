import { calculateStatus, timesheets } from "@/utils/timesheetHelper";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      const body = await request.json();
      
      const timesheetIndex = timesheets.findIndex(ts => ts.id === parseInt(`${id}`));
      
      if (timesheetIndex === -1) {
        return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 });
      }
      
      const totalHours = body.tasks.reduce((sum: number, task: {hours: number}) => sum + task.hours, 0);
      const status = calculateStatus(totalHours);
      
      timesheets[timesheetIndex] = {
        ...timesheets[timesheetIndex],
        ...body,
        totalHours,
        status
      };
      
      return NextResponse.json(timesheets[timesheetIndex]);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to update timesheet' }, { status: 500 });
    }
  }