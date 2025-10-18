"use client";

import { useState, useMemo, useEffect } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Task {
  id: number;
  description: string;
  hours: number;
}

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
  status: "COMPLETED" | "INCOMPLETE" | "MISSING";
}

type TimesheetTableRow = {
  id: number;
  week: string;
  dateRange: string;
  status: string;
  action: string;
  totalHours: number;
};

export default function TimesheetsPage() {
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("Date Range");
  const [statusFilter, setStatusFilter] = useState<string>("Status");
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "Status") params.append("status", statusFilter);
      if (dateRangeFilter !== "Date Range")
        params.append("dateRange", dateRangeFilter);

      const response = await fetch(`/api/timesheets?${params}`);
      if (!response.ok) throw new Error("Failed to fetch timesheets");

      const data = await response.json();
      setTimesheets(data.timesheets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, [statusFilter, dateRangeFilter]);

  const tableData: TimesheetTableRow[] = useMemo(() => {
    return timesheets.map((timesheet) => ({
      id: timesheet.id,
      week: timesheet.week.toString(),
      dateRange: timesheet.dateRange,
      status: timesheet.status,
      totalHours: timesheet.totalHours,
      action:
        timesheet.status === "COMPLETED"
          ? "View"
          : timesheet.status === "INCOMPLETE"
          ? "Update"
          : "Create",
    }));
  }, [timesheets]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "COMPLETED":
        return "bg-success text-green-800";
      case "INCOMPLETE":
        return "bg-yellow-100 text-yellow-800";
      case "MISSING":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleActionClick = (timesheetId: number, action: string) => {
    console.log(`Action: ${action} for timesheet ${timesheetId}`);

    if (action === "View") router.push(`/timesheets/${timesheetId}`);
  };

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<TimesheetTableRow>();

    return [
      columnHelper.accessor("week", {
        header: "Week #",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("dateRange", {
        header: "Date",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span
            className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(
              info.getValue()
            )}`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("action", {
        header: "Actions",
        cell: (info) => {
          const row = info.row.original;
          return (
            <button
              onClick={() => handleActionClick(row.id, row.action)}
              className="px-4 py-2 rounded-md text-sm font-medium text-blue-700 cursor-pointer"
            >
              {info.getValue()}
            </button>
          );
        },
      }),
    ];
  }, []);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <div className="text-xl">Loading timesheets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-6 mt-6">
        <div className="bg-white text-black rounded-lg shadow-sm p-6 overflow-x-auto w-full">
          <h2 className="text-2xl font-bold mb-6">Your Timesheets</h2>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Date Range</option>
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
              <option value="last90days">Last 90 days</option>
            </select>

            <select role="combobox"  aria-label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="INCOMPLETE">Incomplete</option>
              <option value="MISSING">Missing</option>
            </select>
          </div>

          {/* Table Container */}
          <div className="border border-gray-200 rounded-xl w-full">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`
                py-3 px-6 whitespace-nowrap
                ${header.column.id === "week" ? "w-[130px]" : ""}
                ${header.column.id === "dateRange" ? "max-w-[200px]" : ""}
                ${
                  header.column.id === "status" ? "max-w-[400px] text-left" : ""
                }
                ${header.column.id === "action" ? "w-[120px] text-right" : ""}
              `}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="py-6 text-center text-gray-500"
                    >
                      No timesheets found.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`
                  py-4 px-6
                  ${cell.column.id === "status" ? "text-left" : ""}
                  ${cell.column.id === "action" ? "text-center" : ""}
                `}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[5, 10, 20].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
                .slice(0, 5)
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => table.setPageIndex(page - 1)}
                    className={`px-3 py-1 rounded-lg border ${
                      table.getState().pagination.pageIndex === page - 1
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
