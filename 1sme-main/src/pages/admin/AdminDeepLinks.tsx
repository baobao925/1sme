import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { deepLinks } from "@/lib/mock-data";
import { formatDate, formatNumber } from "@/lib/format";
import { Ban, Eye } from "lucide-react";
import { toast } from "sonner";

const AdminDeepLinks = () => {
  return (
    <>
      <PageHeader title="Giám sát liên kết tiếp thị" subtitle="Toàn bộ liên kết do Affiliate tạo trên hệ thống" />

      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex gap-3 flex-wrap shadow-soft">
        <input placeholder="Tìm Affiliate / Sản phẩm / Mã giới thiệu..." className="flex-1 min-w-[240px] px-3 py-2 bg-background border border-border rounded-md text-sm" />
        <select className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option>Tất cả Affiliate</option>
          <option>Nguyễn Thuỳ Linh</option><option>Digital Growth Media</option>
        </select>
        <select className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option>Tất cả trạng thái</option><option>Hoạt động</option><option>Đã hủy</option>
        </select>
      </div>

      <div className="data-table-wrapper">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Mã giới thiệu</th>
              <th className="text-left px-5 py-3 font-semibold">Affiliate</th>
              <th className="text-left px-5 py-3 font-semibold">Sản phẩm</th>
              <th className="text-right px-5 py-3 font-semibold">Lượt click</th>
              <th className="text-right px-5 py-3 font-semibold">Đơn CĐ</th>
              <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
              <th className="text-left px-5 py-3 font-semibold">Ngày tạo</th>
              <th className="text-center px-5 py-3 font-semibold sticky-action">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {deepLinks.map(dl => (
              <tr key={dl.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs text-primary">{dl.refCode}</td>
                <td className="px-5 py-3 font-medium">{dl.affiliateName}</td>
                <td className="px-5 py-3 max-w-[220px] truncate">{dl.productName}</td>
                <td className="px-5 py-3 text-right">{formatNumber(dl.clicks)}</td>
                <td className="px-5 py-3 text-right font-semibold">{dl.conversions}</td>
                <td className="px-5 py-3 text-center"><StatusBadge status={dl.status} /></td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(dl.createdAt)}</td>
                <td className="px-5 py-3 sticky-action">
                  <div className="flex justify-center gap-1">
                    <button className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Eye className="w-4 h-4" /></button>
                    <button onClick={()=>toast.success("Đã vô hiệu hoá link vi phạm")} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground" title="Vô hiệu hoá">
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminDeepLinks;
