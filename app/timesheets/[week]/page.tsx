"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import Footer from "@/components/Footer";
import Navigation from "@/components/Header";
import { FaPlus } from "react-icons/fa6";
import { FiMoreHorizontal } from "react-icons/fi";
import NewEntryModal from "@/components/NewEntryModel";
import TimesheetPageClient from "@/components/TimesheetPageClient";

interface Task {
  id: number;
  title: string;
  hours: number;
  project: string;
}

interface DayEntry {
  date: string; // e.g., "2024-01-21"
  tasks: Task[];
}

const initialData: DayEntry[] = [
  {
    date: "2024-01-21",
    tasks: [
      {
        id: 1,
        title: "Homepage Development",
        hours: 4,
        project: "Project Name",
      },
      {
        id: 2,
        title: "Homepage Development",
        hours: 4,
        project: "Project Name",
      },
    ],
  },
  {
    date: "2024-01-22",
    tasks: [
      {
        id: 3,
        title: "Homepage Development",
        hours: 4,
        project: "Project Name",
      },
      {
        id: 4,
        title: "Homepage Development",
        hours: 4,
        project: "Project Name",
      },
      {
        id: 5,
        title: "Homepage Development",
        hours: 4,
        project: "Project Name",
      },
    ],
  },
  {
    date: "2024-01-23",
    tasks: [
      {
        id: 6,
        title: "Homepage Development",
        hours: 4,
        project: "Project Name",
      },
      {
        id: 7,
        title: "Homepage Development",
        hours: 4,
        project: "Project Name",
      },
    ],
  },
];

export default function TimesheetPage() {
  const [data, setData] = useState<DayEntry[]>(initialData);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const totalHours = data.reduce(
    (sum, d) => sum + d.tasks.reduce((s, t) => s + t.hours, 0),
    0
  );
  const totalTarget = 40;
  const percentage = Math.min((totalHours / totalTarget) * 100, 100);

  const handleAddTask = (date: string) => {
    setIsOpen(true);
    setData((prev) =>
      prev.map((d) =>
        d.date === date
          ? {
              ...d,
              tasks: [
                ...d.tasks,
                { id: Date.now(), title: "", hours: 0, project: "" },
              ],
            }
          : d
      )
    );
  };

  const handleTaskChange = (
    date: string,
    taskId: number,
    field: keyof Task,
    value: string | number
  ) => {
    if (field === 'hours') {
      const newTotal = data.reduce((sum, d) => 
        sum + d.tasks.reduce((s, t) => 
          t.id === taskId ? s + Number(value) : s + t.hours, 
        0), 
      0);
      
      if (newTotal > 40) {
        setErrorMessage("Total hours cannot exceed 40 hours per week");
        return;
      }
      setErrorMessage("");
    }

    setData((prev) =>
      prev.map((d) =>
        d.date === date
          ? {
              ...d,
              tasks: d.tasks.map((t) =>
                t.id === taskId ? { ...t, [field]: value } : t
              ),
            }
          : d
      )
    );
  };

  const handleDeleteTask = (date: string, taskId: number) => {
    setData((prev) =>
      prev.map((d) =>
        d.date === date
          ? { ...d, tasks: d.tasks.filter((t) => t.id !== taskId) }
          : d
      )
    );
  };

    // <div className="min-h-screen bg-gray-50">
    //   <Navigation />

    //   <main className="max-w-7xl mx-auto px-6 mt-6">
    //     {errorMessage && (
    //       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
    //         {errorMessage}
    //       </div>
    //     )}
    //     <div className="mt-10 border border-gray-200 rounded-lg shadow-sm p-6 bg-white">
    //       <Header totalHours={totalHours} percentage={percentage} />

    //       {/* Days */}
    //       {data.map((day) => (
    //         <div key={day.date} className="grid grid-cols-8 my-6">
    //           <div className="font-semibold text-gray-800 mb-2 col-span-1">
    //             {format(new Date(day.date), "MMM dd")}
    //           </div>

    //           <div className="space-y-2 col-span-7">
    //             {day.tasks.map((task) => (
    //               <div
    //                 key={task.id}
    //                 className="flex items-center justify-between border border-gray-200 rounded-md p-2"
    //               >
    //                 <span className="text-gray-900 font-semibold text-md">
    //                   {task.title}
    //                 </span>
    //                 <span className="flex items-center gap-4">
    //                   <span className="text-sm text-gray-400">
    //                     {task.hours}
    //                   </span>
    //                   <span className="bg-primary-100 text-primary-800 text-xs p-2">
    //                     {task.project}
    //                   </span>
    //                   <MoreOptions
    //                     task={task}
    //                     day={day}
    //                     selectedTaskId={selectedTaskId}
    //                     setSelectedTaskId={setSelectedTaskId}
    //                     handleDeleteTask={handleDeleteTask}
    //                   />
    //                 </span>
    //               </div>
    //             ))}

    //             <button
    //               onClick={() => handleAddTask(day.date)}
    //               className="w-full text-gray-500 hover:text-blue-600 text-sm hover:bg-primary-100 mt-2 py-2 border border-gray-300 hover:border-blue-600 border-dashed rounded-lg"
    //             >
    //               <span className="flex justify-center items-center gap-2">
    //                 {" "}
    //                 <FaPlus /> Add new task
    //               </span>
    //             </button>
    //           </div>
    //           <NewEntryModal isOpen={isOpen} setIsOpen={setIsOpen} date={day.date} />
    //         </div>
    //       ))}
    //     </div>
    //     <Footer />
    //   </main>
    // </div>
  return (
    <TimesheetPageClient week={"1"} />
  );
}

const Header = ({
  totalHours,
  percentage,
}: {
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
        21 - 28 January, 2024
      </div>
    </div>
  );
};

type MoreOptionsProps = {
  setSelectedTaskId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedTaskId: number | null;
  task: Task;
  day: DayEntry;
  handleDeleteTask: (date: string, taskId: number) => void;
};

const MoreOptions = ({
  setSelectedTaskId,
  selectedTaskId,
  task,
  day,
  handleDeleteTask,
}: MoreOptionsProps) => {
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
            <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left cursor-pointer">
              Edit
            </button>
            <button
              onClick={() => handleDeleteTask(day.date, task.id)}
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
