import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "affiliate" | "admin";
export type AppMode = "register" | "app"; // register = đang đăng ký AFF, app = đã vào dashboard

interface RoleContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  role: Role;
  setRole: (r: Role) => void;
  mode: AppMode;
  setMode: (m: AppMode) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role>("affiliate");
  const [mode, setMode] = useState<AppMode>("app");
  return <RoleContext.Provider value={{ isAuthenticated, setIsAuthenticated, role, setRole, mode, setMode }}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};
