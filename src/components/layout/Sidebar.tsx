import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, User, Link2, BarChart3, ShoppingCart,
  Wallet, Receipt, ListChecks, Settings2, FileSpreadsheet,
  ShieldCheck, MessageSquareWarning, Users, BookOpen, ClipboardList, MousePointerClick, History,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

const affiliateNav = [
  { section: "Bắt đầu", items: [
    { to: "/affiliate/getting-started", icon: BookOpen, label: "Hướng dẫn bắt đầu" },
  ]},
  { section: "Tổng quan", items: [
    { to: "/affiliate", icon: LayoutDashboard, label: "Tổng quan", end: true },
  ]},
  { section: "Tài khoản", items: [
    { to: "/affiliate/profile", icon: User, label: "Hồ sơ của tôi" },
    { to: "/affiliate/groups", icon: Users, label: "Nhóm của tôi" },
  ]},
  { section: "Marketing", items: [
    { to: "/affiliate/deeplinks", icon: Link2, label: "Liên kết tiếp thị" },
    { to: "/affiliate/traffic", icon: BarChart3, label: "Báo cáo lưu lượng" },
  ]},
  { section: "Doanh thu", items: [
    { to: "/affiliate/conversions", icon: ShoppingCart, label: "Lịch sử chuyển đổi" },
    { to: "/affiliate/payout", icon: Wallet, label: "Rút tiền" },
    { to: "/affiliate/statements", icon: Receipt, label: "Đối soát & chứng từ" },
  ]},
  { section: "Hỗ trợ", items: [
    { to: "/affiliate/complaints", icon: MessageSquareWarning, label: "Khiếu nại của tôi" },
  ]},
];

const adminNav = [
  { section: "Tổng quan", items: [
    { to: "/admin", icon: LayoutDashboard, label: "Tổng quan", end: true },
    { to: "/admin/click-stats", icon: MousePointerClick, label: "Thống kê click" },
  ]},
  { section: "Quản lý Affiliate", items: [
    { to: "/admin/affiliates", icon: ListChecks, label: "Xét duyệt hồ sơ" },
    { to: "/admin/affiliate-groups", icon: Users, label: "Nhóm Affiliate" },
    { to: "/admin/commission-config", icon: Settings2, label: "Cấu hình hoa hồng" },
  ]},
  { section: "Tài chính", items: [
    { to: "/admin/payouts", icon: Wallet, label: "Duyệt yêu cầu rút tiền" },
    { to: "/admin/payment-history", icon: History, label: "Lịch sử thanh toán" },
    { to: "/admin/reports", icon: FileSpreadsheet, label: "Báo cáo đối soát" },
  ]},
  { section: "Hỗ trợ", items: [
    { to: "/admin/complaints", icon: MessageSquareWarning, label: "Xử lý khiếu nại" },
  ]},
];

export const Sidebar = () => {
  const { role } = useRole();
  const nav = role === "affiliate" ? affiliateNav : adminNav;
  const { pathname } = useLocation();

  return (
    <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            {/*<ShieldCheck className="w-5 h-5 text-primary-foreground" />*/}
            <img src="../../../public/logo.png" className="rounded"/>
          </div>
          <div>
            <div className="font-display font-bold text-white text-base leading-tight">1SME</div>
            <div className="text-[11px] text-sidebar-foreground/60 leading-tight">Affiliate Hub</div>
          </div>
        </div>
      </div>

      {/* Role indicator */}
      <div className="px-5 py-3 border-b border-sidebar-border">
        <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 mb-1">Đang ở chế độ</div>
        <div className="text-sm font-semibold text-white">
          {role === "affiliate" ? "👤 Affiliate" : "🛡️ Quản trị sàn"}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {nav.map((group) => (
          <div key={group.section}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              {group.section}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-white shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/50">
        v1.0 · Bản mẫu để BA review
      </div>
    </aside>
  );
};
