import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import StudentsPage from "../pages/students/StudentsPage";
import FinancePage from "../pages/finance/FinancePage";

function AppRouter() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/students" replace />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/finance" element={<FinancePage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
