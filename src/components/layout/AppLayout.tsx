import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useRole } from "@/contexts/RoleContext";

export const AppLayout = () => {
  const { isAuthenticated } = useRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
