// app/api/timesheets/route.js
import { calculateStatus, readTimesheets } from '@/utils/timesheetHelper';
import { NextRequest, NextResponse } from 'next/server';

const timesheets = readTimesheets();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const dateRange = searchParams.get('dateRange');
  
  let filteredTimesheets = [...timesheets];
  
  // Filter by status
  if (status && status !== 'Status') {
    filteredTimesheets = filteredTimesheets.filter(ts => ts.status === status.toUpperCase());
  }
  
  // Filter by date range (simplified)
  if (dateRange && dateRange !== 'Date Range') {
    // In a real app, you'd implement date filtering logic here
    filteredTimesheets = filteredTimesheets.filter(ts => {
      if (dateRange === 'last7days') {
        // Filter for last 7 days logic
        return true;
      }
      if (dateRange === 'last30days') {
        // Filter for last 30 days logic
        return true;
      }
      return true;
    });
  }
  
  return NextResponse.json({
    timesheets: filteredTimesheets,
    total: filteredTimesheets.length
  });
}

// POST /api/timesheets - Create new timesheet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { week, dateRange, year, month, startDate, endDate, tasks } = body;
    
    const totalHours = tasks.reduce((sum: number, task: {hours: number}) => sum + task.hours, 0);
    const status = calculateStatus(totalHours);
    
    const newTimesheet = {
      id: timesheets.length + 1,
      week,
      dateRange,
      year,
      month,
      startDate,
      endDate,
      tasks,
      totalHours,
      status
    };
    
    timesheets.push(newTimesheet);
    
    return NextResponse.json(newTimesheet, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create timesheet' }, { status: 500 });
  }
}