"use client";

import React, { use, useEffect, useState } from "react";
import { format } from "date-fns";
import Footer from "@/components/Footer";
import Navigation from "@/components/Header";
import { FaPlus } from "react-icons/fa6";
import { FiMoreHorizontal } from "react-icons/fi";
import NewEntryModal from "@/components/NewEntryModel";
import { toast } from "react-toastify";
import EditEntryModal from "./EditEntryModel";

interface Task {
  id: number;
  title: string;
  hours: number;
  project: string;
  typeOfWork: string;
  description?: string;
  dateRange?: string;
}

interface DayEntry {
  date: string; // e.g., "2024-01-21"
  tasks: Task[];
}

interface Timesheet extends Task, DayEntry {}

export default function TimesheetPageClient({ week }: { week: string }) {
  const [initialData, setInitialData] = useState<any[]>([]);
  const [data, setData] = useState<DayEntry[]>([]);
  const [date, setDate] = useState<string | null>(null);

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`/api/timesheets/${week}`);
      const timesheets = await response.json();

      setInitialData(timesheets ? [timesheets] : []);
    }
    fetchData();
  }, [week, isOpen, isEditModalOpen]);

  useEffect(() => {
    if (!initialData.length) return;

    const flattenedData: DayEntry[] = initialData.flatMap((week) => {
      const groupedByDate: Record<string, Task[]> = {};
      week.tasks.forEach((task: Timesheet) => {
        if (!groupedByDate[task.date]) groupedByDate[task.date] = [];
        groupedByDate[task.date].push({
          id: task.id,
          title: task.title,
          hours: task.hours,
          project: task.description || "",
          typeOfWork: task.typeOfWork,
        });
      });
      return Object.entries(groupedByDate)
        .map(([date, tasks]) => ({
          date,
          tasks,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    });

    setData(flattenedData);
  }, [initialData]);

  const totalHours = data.reduce(
    (sum, d) => sum + d.tasks.reduce((s, v) => s + v.hours, 0),
    0
  );

  const totalTarget = 40;
  const percentage = Math.min((totalHours / totalTarget) * 100, 100);

  const handleAddTask = (date: string) => {
    setIsOpen(true);
    setDate(date);
  };
  
  const handleEditTask = (taskId: string, date: string) => {
    setEditingTaskId(taskId);
    setIsEditModalOpen(true);
    setSelectedTaskId(null);
    setDate(date);
  };

  const handleDeleteTask = (week: string, taskId: number) => {
    fetch(`/api/timesheets/${week}/${taskId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete task");
        }
        // Refresh data after deletion and sort by date
        const updatedData = data
          .map((day) => ({
            ...day,
            tasks: day.tasks.filter((task) => task.id !== taskId),
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        setData(updatedData);
        setErrorMessage("");
        toast.success("Task deleted successfully!");
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage("Failed to delete task. Please try again.");
        toast.error("Failed to delete task. Please try again.");
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 mt-6">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {errorMessage}
          </div>
        )}
        <div className="mt-10 border border-gray-200 rounded-lg shadow-sm p-6 bg-white">
          <Header
            initialData={initialData}
            totalHours={totalHours}
            percentage={percentage}
          />

          {/* Days */}
          {data.map((day) => (
            <div key={day.date} className="grid grid-cols-8 my-6">
              <div className="font-semibold text-gray-800 mb-2 col-span-1">
                {format(new Date(day.date), "MMM dd")}
              </div>

              <div className="space-y-2 col-span-7">
                {day.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between border border-gray-200 rounded-md p-2"
                  >
                    <span className="text-gray-900 font-semibold text-md">
                      {task.title}
                    </span>
                    <span className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">
                        {task.hours}
                      </span>
                      <span className="bg-primary-100 text-primary-800 text-xs p-2">
                        {task.project}
                      </span>
                      <MoreOptions
                        task={task}
                        week={week}
                        selectedTaskId={selectedTaskId}
                        setSelectedTaskId={setSelectedTaskId}
                        handleDeleteTask={handleDeleteTask}
                        handleEditTask={handleEditTask}
                        date={day.date}
                      />
                    </span>
                  </div>
                ))}

                <button
                  onClick={() => handleAddTask(day.date)}
                  className="w-full text-gray-500 hover:text-blue-600 text-sm hover:bg-primary-100 mt-2 py-2 border border-gray-300 hover:border-blue-600 border-dashed rounded-lg"
                >
                  <span className="flex justify-center items-center gap-2">
                    {" "}
                    <FaPlus /> Add new task
                  </span>
                </button>
              </div>
              {date && (
                <NewEntryModal
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  date={date}
                  setDate={setDate}
                />
              )}
            </div>
          ))}
        </div>

        <EditEntryModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          date={date}
          setDate={setDate}
          weekId={week}
          taskId={editingTaskId || ""}
        />
        <Footer />
      </main>
    </div>
  );
}

const Header = ({
  initialData,
  totalHours,
  percentage,
}: {
  initialData: Task[];
  totalHours: number;
  percentage: number;
}) => {
  return (
    <div className="grid grid-cols-4 mb-4">
      <h2 className="col-span-3 lg:text-2xl leading-4.5 font-semibold text-gray-800">
        This week's timesheet
      </h2>

      <div className="text-black flex flex-col items-end max-h-fit">
        <span className="w-full flex justify-center lg:text-sm text-gray-900 lg:pl-24">
          {totalHours}/40 hrs
        </span>
        <span className="text-xs block text-right text-gray-500">
          {Math.round(percentage)}%
        </span>
        <div className="w-full lg:w-2/3 bg-gray-200 h-1 rounded-full mb-6 self-end">
          <div
            className="bg-orange-500 h-1 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      <div className="text-xs lg:text-sm lg:leading-1 text-gray-500 mb-8">
        {initialData.length === 0
          ? "No entries for this week yet."
          : initialData[0].dateRange}
      </div>
    </div>
  );
};

type MoreOptionsProps = {
  setSelectedTaskId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedTaskId: number | null;
  task: Task;
  week: string;
  handleDeleteTask: (week: string, taskId: number) => void;
};

const MoreOptions = ({
  setSelectedTaskId,
  selectedTaskId,
  task,
  week,
  handleDeleteTask,
  handleEditTask,
  date
}: MoreOptionsProps & { handleEditTask: (taskId: string, date: string) => void; date: string }) => {
  return (
    <div className="relative">
      <FiMoreHorizontal
        className="text-gray-500 text-md cursor-pointer"
        onClick={() =>
          setSelectedTaskId(selectedTaskId === task.id ? null : task.id)
        }
      />
      {selectedTaskId === task.id && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-md z-10">
          <div className="py-1">
            <button 
              onClick={() => handleEditTask(task.id.toString(), date)}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteTask(week, task.id)}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
