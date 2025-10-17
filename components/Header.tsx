import React from "react";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-black font-inter">ticktock</h1>
          <nav className="text-gray-600 font-semibold">Timesheets</nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-700">John Doe</span>
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
