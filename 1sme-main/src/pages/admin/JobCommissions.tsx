import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Briefcase, ShoppingCart, AlertCircle, Coins, Info } from "lucide-react";
import { conversions } from "@/lib/mock-data";
import { formatVND, formatDateTime } from "@/lib/format";

const JobCommissions = () => {
  const matched = conversions.length;
  const pendingTotal = conversions.filter(c => c.status === "pending").reduce((s, c) => s + c.commissionAmount, 0);

  return (
    <>
      <PageHeader
        title="Tác vụ — Tính & phân bổ hoa hồng tạm tính"
        subtitle="Khớp đơn hàng với mã click/cookie, tính hoa hồng theo mô hình quy đổi"
      />

      <div className="bg-info/10 border border-info/30 rounded-lg p-4 mb-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-semibold">Mô tả tác vụ</div>
          <p className="text-muted-foreground mt-1">
            Khi có đơn hàng trên cổng khách hàng → tác vụ: tìm cookie / mã click khớp theo <strong>mô hình quy đổi mặc định: Click cuối</strong>.
            Tạo đơn chuyển đổi ở trạng thái <strong>Chờ duyệt</strong> → chuyển <strong>Tạm giữ</strong> sau khi thanh toán thành công →
            chờ qua thời gian tạm giữ (theo <strong>chính sách hoàn/hủy của từng sản phẩm</strong>) → Duyệt.
          </p>
          <p className="text-muted-foreground mt-2">
            <strong>Quy tắc loại trừ:</strong> Affiliate mua qua link của chính mình (tự mua) ⇒ không tính hoa hồng.
            Click trùng IP/mã click ⇒ chỉ tính 1 lần cho 1 đơn thành công.
          </p>
          <p className="text-muted-foreground mt-2">
            <strong>Định kỳ:</strong> Với sản phẩm định kỳ, các kỳ <em>gia hạn / nâng cấp / hạ cấp</em> tiếp theo áp dụng % theo từng loại sự kiện do Quản trị cấu hình.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <KpiCard label="Đơn khớp Affiliate" value={matched} icon={ShoppingCart} accent="success" />
        <KpiCard label="Đơn không khớp" value={42} icon={AlertCircle} accent="warning" hint="Trực tiếp / không có cookie" />
        <KpiCard label="Tổng hoa hồng chờ duyệt" value={formatVND(pendingTotal)} icon={Coins} accent="primary" />
        <KpiCard label="Lượt chạy hôm nay" value={284} icon={Briefcase} accent="info" hint="Định kỳ 5 phút/lần" />
      </div>

      <div className="data-table-wrapper">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-bold">Nhật ký phân bổ hoa hồng</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Mã đơn</th>
              <th className="text-left px-5 py-3 font-semibold">Sản phẩm</th>
              <th className="text-left px-5 py-3 font-semibold">Sự kiện</th>
              <th className="text-left px-5 py-3 font-semibold">Mô hình quy đổi</th>
              <th className="text-right px-5 py-3 font-semibold">Giá trị đơn</th>
              <th className="text-right px-5 py-3 font-semibold">% HH</th>
              <th className="text-right px-5 py-3 font-semibold">Hoa hồng</th>
              <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
              <th className="text-left px-5 py-3 font-semibold">Tạm giữ đến</th>
            </tr>
          </thead>
          <tbody>
            {conversions.map(c => {
              const eventLabel: Record<string, string> = { first: "Đơn đầu", renew: "Gia hạn", upgrade: "Nâng cấp", downgrade: "Hạ cấp" };
              const evColor: Record<string, string> = { first: "bg-primary/10 text-primary", renew: "bg-info/10 text-info", upgrade: "bg-success/10 text-success", downgrade: "bg-warning/10 text-warning" };
              const ev = c.recurringEvent || "first";
              return (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{c.orderCode}</td>
                <td className="px-5 py-3 truncate max-w-[160px]">{c.affiliateName}</td>
                <td className="px-5 py-3 truncate max-w-[180px] text-xs">{c.productName}</td>
                <td className="px-5 py-3"><span className={`px-2 py-0.5 text-xs font-semibold rounded ${evColor[ev]}`}>{eventLabel[ev]}</span></td>
                <td className="px-5 py-3"><span className="px-2 py-0.5 text-xs font-semibold rounded bg-primary/10 text-primary">{c.attributionModel}</span></td>
                <td className="px-5 py-3 text-right text-xs">{formatVND(c.orderValue)}</td>
                <td className="px-5 py-3 text-right font-semibold">{c.commissionRate}%</td>
                <td className="px-5 py-3 text-right font-semibold text-primary">{formatVND(c.commissionAmount)}</td>
                <td className="px-5 py-3 text-center"><StatusBadge status={c.status} /></td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{c.holdUntil ? formatDateTime(c.holdUntil + "T00:00:00") : "—"}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default JobCommissions;
