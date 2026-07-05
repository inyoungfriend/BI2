import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const MAIN_MENU = [
  { to: "/students", label: "Students" },
  { to: "/finance", label: "Finance" },
];

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="portal-shell">
      <aside className={`sidebar${isSidebarOpen ? " is-open" : ""}`}>
        <div className="brand">
          <div>
            <h1>Boston Institute</h1>
            <p>Admin Prototype</p>
          </div>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close navigation menu"
            onClick={() => setIsSidebarOpen(false)}
          >
            Close
          </button>
        </div>

        <nav className="nav-group" aria-label="Admin sections">
          {MAIN_MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? " is-active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation backdrop"
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="content-shell">
        <main className="page-content">
          <button
            type="button"
            aria-label="Open navigation menu"
            className="hamburger-toggle content-hamburger-toggle"
            onClick={() => setIsSidebarOpen(true)}
          >
            ☰
          </button>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
