import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Activity, CheckCircle2, AlertTriangle, Bot, RefreshCw, Info, ShieldX } from "lucide-react";
import { clickEvents } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const JobClicks = () => {
  const today = clickEvents.length;
  const valid = clickEvents.filter(e => e.status === "Valid").length;
  const dup = clickEvents.filter(e => e.status === "Duplicate" || e.status === "Invalid").length;
  const bots = clickEvents.filter(e => e.status === "Bot").length;
  const selfPurchase = clickEvents.filter(e => e.status === "Self-purchase").length;

  return (
    <>
      <PageHeader
        title="Tác vụ — Ghi nhận lượt click & Cookie"
        subtitle="Tác vụ chạy hằng ngày, thống kê dữ liệu của ngày hôm trước (D-1). Tự gán cookie & lọc bot."
        actions={
          <button className="px-4 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Làm mới
          </button>
        }
      />

      <div className="bg-info/10 border border-info/30 rounded-lg p-4 mb-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-semibold text-foreground">Mô tả tác vụ — chạy hằng ngày lúc 01:00 (D-1)</div>
          <p className="text-muted-foreground mt-1">
            Khi người dùng click liên kết → ghi log: <code className="bg-muted px-1 rounded">aff_id, product_id, ip, user_agent, timestamp, source</code> và gán cookie với thời gian cookie theo cấu hình sản phẩm.
            Nếu người dùng mua hàng → ghi thêm <code className="bg-muted px-1 rounded">order_id</code> để khớp đơn chuyển đổi.
          </p>
          <div className="mt-2 text-muted-foreground space-y-1">
            <div>• <strong>Loại trừ:</strong> Tự mua (Affiliate mua qua link của chính mình) — gắn cờ để loại khỏi hoa hồng.</div>
            <div>• <strong>Click trùng:</strong> Trùng IP/click_id chỉ tính 1 lần cho 1 đơn thành công.</div>
            <div>• <strong>Phát hiện bot:</strong> User-Agent đáng nghi / mẫu bất thường.</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
        <KpiCard label="Click ghi nhận hôm nay" value={today} icon={Activity} accent="primary" />
        <KpiCard label="Hợp lệ" value={valid} icon={CheckCircle2} accent="success" />
        <KpiCard label="Trùng lặp" value={dup} icon={AlertTriangle} accent="warning" />
        <KpiCard label="Nghi bot" value={bots} icon={Bot} accent="accent" />
        <KpiCard label="Tự mua" value={selfPurchase} icon={ShieldX} accent="info" />
      </div>

      <div className="data-table-wrapper">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display font-bold">Nhật ký sự kiện — Dòng click</h3>
          <span className="text-xs text-muted-foreground">Bản chụp D-1 · Cập nhật 01:00 hằng ngày</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Mã click</th>
              <th className="text-left px-5 py-3 font-semibold">AFF ID</th>
              <th className="text-left px-5 py-3 font-semibold">Mã sản phẩm</th>
              <th className="text-left px-5 py-3 font-semibold">Mã đơn</th>
              <th className="text-left px-5 py-3 font-semibold">IP</th>
              <th className="text-left px-5 py-3 font-semibold">User Agent</th>
              <th className="text-left px-5 py-3 font-semibold">Thời gian</th>
              <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {clickEvents.slice(0, 25).map(e => (
              <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs text-primary">{e.clickId}</td>
                <td className="px-5 py-3 font-mono text-xs">{e.refCode}</td>
                <td className="px-5 py-3 font-mono text-xs">{e.productId}</td>
                <td className="px-5 py-3 font-mono text-xs">{e.orderId || <span className="text-muted-foreground">—</span>}</td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{e.ipAddress}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground truncate max-w-[200px]" title={e.userAgent}>{e.userAgent}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDateTime(e.timestamp)}</td>
                <td className="px-5 py-3 text-center">
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap",
                    e.status === "Valid" && "bg-success/10 text-success",
                    e.status === "Duplicate" && "bg-warning/10 text-warning",
                    e.status === "Invalid" && "bg-warning/10 text-warning",
                    e.status === "Bot" && "bg-destructive/10 text-destructive",
                    e.status === "Self-purchase" && "bg-info/10 text-info",
                  )}>{({Valid:"Hợp lệ",Duplicate:"Trùng lặp",Invalid:"Không hợp lệ",Bot:"Bot",["Self-purchase"]:"Tự mua"} as Record<string,string>)[e.status] || e.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default JobClicks;
