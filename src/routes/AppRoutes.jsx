import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import LoginPage from "../pages/auth/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import RegisterPage from "../pages/auth/RegisterPage";
import MainLayout from "../components/layout/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProjectsPage from "../pages/projects/ProjectsPage";
import TasksPage from "../pages/tasks/TasksPage";
import TeamPage from "../pages/team/TeamPage";
import ProjectFormPage from "../pages/projects/ProjectFormPage";
import TaskFormPage from "../pages/tasks/TaskFormPage";
import SettingsPage from "../pages/SettingsPage/SettingsPage";
import ReportsPage from "../pages/reports/ReportsPage";
import ReportFormPage from "../pages/reports/ReportFormPage";
import ReportDetailPage from "../pages/reports/ReportDetailPage";
import FilesPage from "../pages/files/FilesPage";


const AppRoutes = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/projects/create" element={<ProjectFormPage />} />
            <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
            <Route path="/tasks/create" element={<TaskFormPage />} />
            <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/create" element={<ReportFormPage />} />
            <Route path="/reports/:id" element={<ReportDetailPage />} />

            <Route path="/files" element={<FilesPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;
