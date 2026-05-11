import { Bell, Search, ChevronDown, LogOut, User } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { currentAffiliate } from "@/lib/mock-data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Topbar = () => {
  const { role, setRole, mode, setMode, setIsAuthenticated } = useRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAffiliate = role === "affiliate";
  const onRegisterPage = pathname.startsWith("/affiliate/onboarding");

  const switchRole = (r: "affiliate" | "admin") => {
    setRole(r);
    setMode("app");
    navigate(r === "affiliate" ? "/affiliate" : "/admin");
  };

  const switchMode = (m: "register" | "app") => {
    setMode(m);
    if (m === "register") navigate("/affiliate/onboarding");
    else navigate("/affiliate");
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-sm">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm Affiliate, sản phẩm, đơn hàng..."
            className="w-full pl-10 pr-4 py-2 bg-muted/60 border border-transparent focus:border-primary focus:bg-background rounded-lg text-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Mode switcher (Affiliate role only) */}
        {isAffiliate && (
          <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
            <button
              onClick={() => switchMode("register")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                onRegisterPage || mode === "register"
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Đăng ký Affiliate
            </button>
            <button
              onClick={() => switchMode("app")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                !onRegisterPage && mode === "app"
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Vào trang chính
            </button>
          </div>
        )}

        {/* Role Switcher */}
        <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
          <button
            onClick={() => switchRole("affiliate")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
              role === "affiliate"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Affiliate
          </button>
          <button
            onClick={() => switchRole("admin")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
              role === "admin"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Quản trị sàn
          </button>
        </div>

        <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 pl-3 border-l border-border hover:bg-muted p-1 rounded-lg transition-colors outline-none cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
              {role === "affiliate" ? "NL" : "AD"}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold leading-tight">
                {role === "affiliate" ? currentAffiliate.name : "Quản trị sàn"}
              </div>
              <div className="text-[11px] text-muted-foreground leading-tight">
                {role === "affiliate" ? currentAffiliate.code : "admin@1sme.vn"}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAffiliate && (
              <DropdownMenuItem onClick={() => navigate("/affiliate/profile")} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" /> Hồ sơ
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => { setIsAuthenticated(false); navigate("/login"); }} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive text-sm font-semibold">
              <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
