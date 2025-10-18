import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // 1. Call logout API
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
  
      if (!response.ok) throw new Error("Failed to logout");
  
      // 2. Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
  
      // 3. Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
  
      // 4. Clear IndexedDB
      if (window.indexedDB) {
        const databases = await window.indexedDB.databases();
        for (const db of databases) {
          if (db.name) window.indexedDB.deleteDatabase(db.name);
        }
      }
  
      // 5. Clear Cache Storage
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
        }
      }
  
      // 6. Reload page to ensure all in-memory state is reset
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };
  

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-black font-inter">ticktock</h1>
          <nav className="text-gray-600 font-semibold">Timesheets</nav>
        </div>

        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 text-gray-700 cursor-pointer"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <span>John Doe</span>
            <FaAngleDown />
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <IoMdLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
