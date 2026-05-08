import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { payoutRequests } from "@/lib/mock-data";
import { formatVND, formatDate } from "@/lib/format";
import { Wallet, FileText, FileSpreadsheet, Receipt, Calendar } from "lucide-react";
import { toast } from "sonner";

const PaymentHistory = () => {
  const [period, setPeriod] = useState("all");
  const periods = Array.from(new Set(payoutRequests.map(p => p.period))).sort().reverse();
  const filtered = payoutRequests.filter(p => period === "all" || p.period === period);

  const paidList = filtered.filter(p => p.status === "paid");
  const totalPaid = paidList.reduce((s, p) => s + p.net, 0);
  const totalTax = paidList.reduce((s, p) => s + p.taxAmount, 0);
  const count = paidList.length;

  const exportInvoice = (code: string) => toast.success(`Đã xuất hóa đơn cho ${code} (mock)`);
  const exportAll = (fmt: string) => toast.success(`Đã xuất ${fmt} lịch sử thanh toán (mock)`);

  return (
    <>
      <PageHeader
        title="Lịch sử thanh toán Affiliate"
        subtitle="Toàn bộ giao dịch thanh toán đã thực hiện · Xuất hóa đơn cho affiliate"
        actions={
          <>
            <button onClick={() => exportAll("Excel")} className="px-3 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button onClick={() => exportAll("PDF")} className="px-3 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-2">
              <FileText className="w-4 h-4" /> PDF
            </button>
          </>
        }
      />

      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border rounded-md text-sm">
            <option value="all">Tất cả kỳ</option>
            {periods.map(p => <option key={p} value={p}>Kỳ {p}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <KpiCard label="Số giao dịch đã thanh toán" value={String(count)} icon={Wallet} accent="success" />
        <KpiCard label="Tổng đã thanh toán (Net)" value={formatVND(totalPaid)} icon={Receipt} accent="primary" />
        <KpiCard label="Tổng thuế đã khấu trừ" value={formatVND(totalTax)} icon={FileText} accent="warning" />
      </div>

      <div className="data-table-wrapper">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold">Danh sách thanh toán</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Mã thanh toán</th>
                <th className="text-left px-5 py-3 font-semibold">Affiliate</th>
                <th className="text-center px-5 py-3 font-semibold">Kỳ</th>
                <th className="text-right px-5 py-3 font-semibold">Số tiền yêu cầu</th>
                <th className="text-right px-5 py-3 font-semibold">Thuế</th>
                <th className="text-right px-5 py-3 font-semibold">Phí DV</th>
                <th className="text-right px-5 py-3 font-semibold">Thực nhận</th>
                <th className="text-left px-5 py-3 font-semibold">Ngày YC</th>
                <th className="text-left px-5 py-3 font-semibold">Ngày thanh toán</th>
                <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
                <th className="text-center px-5 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs">{p.code}</td>
                  <td className="px-5 py-3"><div className="font-semibold">{p.affiliateName}</div><div className="text-xs text-muted-foreground">{p.affiliateKind}</div></td>
                  <td className="px-5 py-3 text-center text-xs font-mono">{p.period}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatVND(p.requestedAmount)}</td>
                  <td className="px-5 py-3 text-right text-warning">{p.taxAmount > 0 ? `-${formatVND(p.taxAmount)}` : "—"}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{p.serviceFee > 0 ? `-${formatVND(p.serviceFee)}` : "—"}</td>
                  <td className="px-5 py-3 text-right font-bold text-primary">{formatVND(p.net)}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                  <td className="px-5 py-3 text-center"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-center">
                    {p.status === "paid" && (
                      <button onClick={() => exportInvoice(p.code)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-semibold">
                        <FileText className="w-3 h-3" /> Xuất hóa đơn
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PaymentHistory;
