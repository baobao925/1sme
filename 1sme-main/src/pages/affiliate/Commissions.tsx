import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { conversions, currentAffiliate } from "@/lib/mock-data";
import { formatVND, formatDate } from "@/lib/format";
import { Clock, CheckCircle2, XCircle, Wallet, ArrowRight } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";

const Commissions = () => {
  const all = conversions.filter(c => c.affiliateId === currentAffiliate.id);
  const sum = (st: string) => all.filter(c => c.status === st).reduce((s, c) => s + c.commissionAmount, 0);

  return (
    <>
      <PageHeader
        title="Theo dõi hoa hồng"
        subtitle="Vòng đời hoa hồng: Chờ duyệt → Tạm giữ → Đã duyệt → Đã thanh toán"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <KpiCard label="Chờ duyệt" value={formatVND(sum("pending"))} icon={Clock} accent="warning" />
        <KpiCard label="Đã duyệt" value={formatVND(sum("approved"))} icon={CheckCircle2} accent="success" />
        <KpiCard label="Đã thanh toán" value={formatVND(sum("paid"))} icon={Wallet} accent="primary" />
        <KpiCard label="Đã hủy" value={formatVND(sum("void"))} icon={XCircle} accent="info" />
      </div>

      {/* Timeline visual */}
      <div className="bg-card border border-border rounded-xl p-6 mb-5 shadow-soft">
        <h3 className="font-display font-bold mb-4">Vòng đời trạng thái hoa hồng</h3>
        <div className="flex items-center justify-between flex-wrap gap-3">
          {[
            { label: "Chờ duyệt", desc: "Đơn vừa tạo", color: "bg-status-pending" },
            { label: "Tạm giữ", desc: "Trong thời gian tạm giữ", color: "bg-status-hold" },
            { label: "Đã duyệt", desc: "Đã duyệt hợp lệ", color: "bg-status-approved" },
            { label: "Đã thanh toán", desc: "Đã chuyển khoản", color: "bg-status-paid" },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center gap-3 flex-1">
              <div className="flex flex-col items-center text-center min-w-[100px]">
                <div className={`w-12 h-12 rounded-full ${s.color} flex items-center justify-center text-white font-bold shadow-md`}>
                  {i + 1}
                </div>
                <div className="text-sm font-semibold mt-2">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
              {i < arr.length - 1 && <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg">
          💡 Đơn có thể chuyển sang <strong>Đã hủy</strong> nếu hoàn đơn hoặc vi phạm — không tính hoa hồng.
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex gap-3 flex-wrap shadow-soft">
        <select className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option>Tất cả trạng thái</option><option>Chờ duyệt</option><option>Đã duyệt</option><option>Đã thanh toán</option><option>Đã hủy</option>
        </select>
        <select className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option>Tất cả sản phẩm</option><option>CRM Cloud Pro</option><option>Chữ ký số 1 năm</option>
        </select>
        <select className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option>30 ngày qua</option><option>Tháng này</option>
        </select>
      </div>

      <div className="data-table-wrapper">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Mã đơn</th>
              <th className="text-left px-5 py-3 font-semibold">Sản phẩm</th>
              <th className="text-right px-5 py-3 font-semibold">Hoa hồng</th>
              <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
              <th className="text-left px-5 py-3 font-semibold">Ngày đơn</th>
            </tr>
          </thead>
          <tbody>
            {all.map(c => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{c.orderCode}</td>
                <td className="px-5 py-3 max-w-[280px] truncate">{c.productName}</td>
                <td className="px-5 py-3 text-right font-semibold text-primary">{formatVND(c.commissionAmount)}</td>
                <td className="px-5 py-3 text-center"><StatusBadge status={c.status} /></td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(c.orderedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Commissions;
