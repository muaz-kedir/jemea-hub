import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  className?: string;
}

export const AdminLayout = ({ children, className = "" }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminSidebar />
      <main className={`ml-64 min-h-screen ${className}`}>
        {children}
      </main>
    </div>
  );
};
