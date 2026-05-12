import { PageHeader } from "@/components/PageHeader";
import { auditLogs } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";
import { ScrollText, User, Server, Briefcase } from "lucide-react";

const Audit = () => {
  return (
    <>
      <PageHeader title="Nhật ký kiểm toán hệ thống" subtitle="Ghi nhận mọi thao tác trên module Affiliate" />

      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex gap-3 flex-wrap shadow-soft">
        <input placeholder="Tìm theo người thực hiện, hành động, đối tượng..." className="flex-1 min-w-[240px] px-3 py-2 bg-background border border-border rounded-md text-sm" />
        <select className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option>Tất cả vai trò</option><option>Quản trị</option><option>Hệ thống</option><option>Affiliate</option>
        </select>
        <input type="date" className="px-3 py-2 bg-background border border-border rounded-md text-sm" />
      </div>

      <div className="data-table-wrapper">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Thời gian</th>
              <th className="text-left px-5 py-3 font-semibold">Người thực hiện</th>
              <th className="text-left px-5 py-3 font-semibold">Vai trò</th>
              <th className="text-left px-5 py-3 font-semibold">Hành động</th>
              <th className="text-left px-5 py-3 font-semibold">Đối tượng</th>
              <th className="text-left px-5 py-3 font-semibold">Trước</th>
              <th className="text-left px-5 py-3 font-semibold">Sau</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map(l => {
              const Icon = l.role === "Admin" ? User : l.role === "System" ? Server : Briefcase;
              return (
                <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(l.timestamp)}</td>
                  <td className="px-5 py-3 font-mono text-xs">{l.actor}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs font-semibold">
                      <Icon className="w-3 h-3" /> {l.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium">{l.action}</td>
                  <td className="px-5 py-3 font-mono text-xs text-primary">{l.object}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{l.before || "—"}</td>
                  <td className="px-5 py-3 text-xs font-semibold">{l.after || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Audit;
