import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 56 : 220;

  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] font-sans overflow-x-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <main
        className="min-h-screen min-w-0 overflow-x-hidden transition-[margin-left] duration-200 ease-out"
        style={{
          marginLeft: `${sidebarWidth}px`,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}