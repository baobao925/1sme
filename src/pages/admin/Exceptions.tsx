import { PageHeader } from "@/components/PageHeader";
import { exceptionCases } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const Exceptions = () => {
  return (
    <>
      <PageHeader title="Trường hợp ngoại lệ" subtitle="Các tình huống bất thường cần xử lý: gian lận, hoàn đơn, thanh toán lỗi..." />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {[
          { type: "Trùng lặp click", count: 1, color: "warning" },
          { type: "Lưu lượng đáng nghi", count: 1, color: "destructive" },
          { type: "Hoàn đơn sau khi đã trả", count: 1, color: "destructive" },
          { type: "Thiếu thông tin thuế", count: 1, color: "info" },
          { type: "Thanh toán thất bại", count: 1, color: "warning" },
        ].map(c => (
          <div key={c.type} className="kpi-card">
            <div className="text-xs text-muted-foreground">{c.type}</div>
            <div className={cn("text-2xl font-bold mt-1 font-display",
              c.color === "destructive" && "text-destructive",
              c.color === "warning" && "text-warning",
              c.color === "info" && "text-info"
            )}>{c.count}</div>
          </div>
        ))}
      </div>

      <div className="data-table-wrapper">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Loại</th>
              <th className="text-left px-5 py-3 font-semibold">Affiliate</th>
              <th className="text-left px-5 py-3 font-semibold">Mô tả</th>
              <th className="text-center px-5 py-3 font-semibold">Mức độ</th>
              <th className="text-left px-5 py-3 font-semibold">Thời gian</th>
              <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {exceptionCases.map(e => (
              <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn("w-4 h-4",
                      e.severity === "high" && "text-destructive",
                      e.severity === "medium" && "text-warning",
                      e.severity === "low" && "text-info"
                    )} />
                    <span className="font-medium">{e.type}</span>
                  </div>
                </td>
                <td className="px-5 py-3">{e.affiliateName}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground max-w-[320px]">{e.description}</td>
                <td className="px-5 py-3 text-center">
                  <span className={cn("px-2 py-0.5 text-xs font-semibold rounded-full",
                    e.severity === "high" && "bg-destructive/10 text-destructive",
                    e.severity === "medium" && "bg-warning/10 text-warning",
                    e.severity === "low" && "bg-info/10 text-info"
                  )}>{e.severity.toUpperCase()}</span>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDateTime(e.timestamp)}</td>
                <td className="px-5 py-3 text-center">
                  <span className={cn("px-2 py-0.5 text-xs font-semibold rounded-full",
                    e.status === "Mở" && "bg-destructive/10 text-destructive",
                    e.status === "Đang xử lý" && "bg-warning/10 text-warning",
                    e.status === "Đã đóng" && "bg-success/10 text-success"
                  )}>{e.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Exceptions;
