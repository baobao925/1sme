import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { conversions, currentAffiliate } from "@/lib/mock-data";
import { formatVND, formatDate } from "@/lib/format";
import { Download, Eye, X, Clock, CheckCircle2, Ban, Wallet } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { toast } from "sonner";

const Conversions = () => {
  const all = conversions.filter(c => c.affiliateId === currentAffiliate.id);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = conversions.find(c => c.id === detailId);

  const filtered = statusFilter === "all" ? all : all.filter(c => c.status === statusFilter);
  const pendingTotal = all.filter(c => c.status === "pending").reduce((s, c) => s + c.commissionAmount, 0);
  const approvedTotal = all.filter(c => c.status === "approved" || c.status === "paid").reduce((s, c) => s + c.commissionAmount, 0);
  const voidTotal = all.filter(c => c.status === "void" || c.status === "rejected").reduce((s, c) => s + c.commissionAmount, 0);
  const paidTotal = all.filter(c => c.status === "paid").reduce((s, c) => s + c.commissionAmount, 0);

  // Mock thời gian: click time = order time - 2 ngày, completed = order time + holdPeriod
  const enrich = (c: typeof all[number]) => ({
    ...c,
    clickedAt: (() => { const d = new Date(c.orderedAt); d.setDate(d.getDate() - 2); return d.toISOString().slice(0, 10); })(),
    completedAt: c.holdUntil,
  });

  return (
    <>
      <PageHeader
        title="Lịch sử chuyển đổi"
        subtitle="Tất cả đơn hàng tạo ra hoa hồng từ deep link của bạn"
        actions={
          <button onClick={() => toast.success("Đã xuất lịch sử (mock)")}
            className="px-4 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-2">
            <Download className="w-4 h-4" /> Xuất file
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard label="Hoa hồng tạm tính" value={formatVND(pendingTotal)} hint={`${all.filter(c=>c.status==="pending").length} đơn chờ qua thời gian tạm giữ`} icon={Clock} accent="warning" />
        <KpiCard label="Đã ghi nhận" value={formatVND(approvedTotal)} hint={`${all.filter(c=>c.status==="approved"||c.status==="paid").length} đơn được duyệt`} icon={CheckCircle2} accent="success" />
        <KpiCard label="Đã thanh toán" value={formatVND(paidTotal)} hint="Tiền đã chuyển vào tài khoản" icon={Wallet} accent="primary" />
        <KpiCard label="Đã hủy / Từ chối" value={formatVND(voidTotal)} hint={`${all.filter(c=>c.status==="void"||c.status==="rejected").length} đơn bị hủy/từ chối`} icon={Ban} accent="accent" />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex gap-3 flex-wrap shadow-soft">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="paid">Đã thanh toán</option>
          <option value="void">Đã hủy</option>
        </select>
        <select className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option>30 ngày qua</option><option>Tháng này</option><option>Quý này</option>
        </select>
        <input type="text" placeholder="Tìm theo mã đơn / sản phẩm..."
          className="flex-1 min-w-[200px] px-3 py-2 bg-background border border-border rounded-md text-sm" />
      </div>

      {/* Table - chi tiết đơn gộp */}
      <div className="data-table-wrapper">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Chi tiết đơn hàng</th>
              <th className="text-left px-5 py-3 font-semibold">Sản phẩm</th>
              <th className="text-right px-5 py-3 font-semibold">Giá trị đơn</th>
              <th className="text-right px-5 py-3 font-semibold">% HH</th>
              <th className="text-right px-5 py-3 font-semibold">Hoa hồng</th>
              <th className="text-center px-5 py-3 font-semibold sticky-action">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const e = enrich(c);
              return (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30 align-top">
                  <td className="px-5 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs font-bold text-foreground">{c.orderCode}</code>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        <span className="inline-block w-24">Click:</span> {formatDate(e.clickedAt)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        <span className="inline-block w-24">Đặt đơn:</span> {formatDate(c.orderedAt)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        <span className="inline-block w-24">Hoàn thành:</span> {e.completedAt ? formatDate(e.completedAt) : "—"}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 max-w-[260px] truncate">{c.productName}</td>
                  <td className="px-5 py-3 text-right">{formatVND(c.orderValue)}</td>
                  <td className="px-5 py-3 text-right">{c.commissionRate}%</td>
                  <td className="px-5 py-3 text-right font-semibold text-primary">{formatVND(c.commissionAmount)}</td>
                  <td className="px-3 py-3 sticky-action text-center">
                    <button onClick={() => setDetailId(c.id)} className="p-1.5 hover:bg-muted rounded text-muted-foreground">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setDetailId(null)}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-3xl border border-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h3 className="font-display font-bold">Chi tiết đơn chuyển đổi</h3>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">{detail.orderCode}</div>
              </div>
              <button onClick={() => setDetailId(null)} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Status timeline */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Theo dõi trạng thái hoa hồng</div>
                <StatusTimeline detail={detail} />
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Thông tin đơn hàng</div>
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 rounded-lg p-4">
                  <Field label="Sản phẩm" value={detail.productName} />
                  <Field label="Giá trị đơn" value={formatVND(detail.orderValue)} />
                  <Field label="% Hoa hồng" value={`${detail.commissionRate}%`} />
                  <Field label="Hoa hồng" value={formatVND(detail.commissionAmount)} highlight />
                  <Field label="Mô hình quy đổi" value={detail.attributionModel} />
                  <Field label="Mã click" value={detail.clickId} mono />
                  <Field label="Mã giới thiệu" value={detail.refCode} mono />
                  <Field label="Ngày đơn" value={formatDate(detail.orderedAt)} />
                  <Field label="Hoàn thành (hết tạm giữ)" value={detail.holdUntil ? formatDate(detail.holdUntil) : "—"} />
                  <div>
                    <div className="text-xs text-muted-foreground">Trạng thái hiện tại</div>
                    <div className="mt-1"><StatusBadge status={detail.status} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Timeline tracking trạng thái hoa hồng theo lifecycle
const StatusTimeline = ({ detail }: { detail: any }) => {
  const orderDate = formatDate(detail.orderedAt);
  const clickDate = (() => { const d = new Date(detail.orderedAt); d.setDate(d.getDate() - 2); return formatDate(d.toISOString().slice(0,10)); })();
  const holdDate = detail.holdUntil ? formatDate(detail.holdUntil) : "—";
  const isVoid = detail.status === "void" || detail.status === "rejected";
  const isPending = detail.status === "pending";
  const isApproved = detail.status === "approved" || detail.status === "paid";
  const isPaid = detail.status === "paid";

  const steps = [
    { key: "click", label: "Click ghi nhận", date: clickDate, done: true },
    { key: "order", label: "Khách đặt đơn", date: orderDate, done: true },
    { key: "hold", label: "Tạm giữ (chờ hết chính sách hoàn/hủy)", date: holdDate, done: !isPending || isVoid, current: isPending && !isVoid },
    { key: "approved", label: isVoid ? "Bị hủy / Từ chối" : "Hoa hồng được ghi nhận", date: isVoid ? holdDate : (isApproved ? holdDate : "—"), done: isApproved || isVoid, error: isVoid },
    { key: "paid", label: "Đã thanh toán vào tài khoản", date: isPaid ? holdDate : "—", done: isPaid },
  ];

  return (
    <ol className="relative border-l-2 border-border ml-2 space-y-4">
      {steps.map((s) => (
        <li key={s.key} className="ml-4">
          <span className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ring-4 ring-background ${
            s.error ? "bg-destructive" : s.done ? "bg-success" : s.current ? "bg-warning animate-pulse" : "bg-muted-foreground/30"
          }`} />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className={`text-sm font-semibold ${s.error ? "text-destructive" : s.done ? "text-foreground" : "text-muted-foreground"}`}>
              {s.label}
              {s.current && <span className="ml-2 text-[11px] px-2 py-0.5 bg-warning/15 text-warning rounded font-semibold">Đang xử lý</span>}
            </div>
            <div className="text-xs text-muted-foreground">{s.date}</div>
          </div>
        </li>
      ))}
    </ol>
  );
};

const Field = ({ label, value, highlight, mono }: any) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className={`font-medium mt-0.5 ${highlight ? "text-primary font-bold" : ""} ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
  </div>
);

export default Conversions;
