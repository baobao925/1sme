import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { conversions, currentAffiliate } from "@/lib/mock-data";
import { formatVND } from "@/lib/format";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

const Statements = () => {
  const myConv = conversions.filter(c => c.affiliateId === currentAffiliate.id);

  // Current statement (April 2026)
  const currentRevenue = myConv.filter(c => c.orderedAt.startsWith("2026-04")).reduce((s, c) => s + c.orderValue, 0);
  const currentCommission = myConv.filter(c => c.orderedAt.startsWith("2026-04") && c.status !== "void").reduce((s, c) => s + c.commissionAmount, 0);
  const currentPIT = Math.round(currentCommission * 0.1);

  return (
    <>
      <PageHeader
        title="Đối soát & chứng từ thanh toán"
        subtitle="Hóa đơn đối soát kỳ hiện tại, lịch sử thanh toán và chứng từ phí dịch vụ"
        actions={
          <button onClick={() => toast.success("Đã xuất PDF (mock)")}
            className="px-4 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-2">
            <Download className="w-4 h-4" /> Xuất PDF
          </button>
        }
      />

      {/* Current statement */}
      <div className="bg-card border border-border rounded-xl shadow-soft mb-5">
        <div className="p-5 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Hóa đơn đối soát kỳ hiện tại</div>
            <h3 className="font-display font-bold text-lg mt-0.5">Tháng 04/2026</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-warning/10 text-warning text-xs font-semibold rounded-full">Chưa khoá kỳ</span>
            <button onClick={() => toast.success("Đã xuất Excel (mock)")}
              className="px-3 py-1.5 text-xs font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
            <button onClick={() => toast.success("Đã xuất PDF (mock)")}
              className="px-3 py-1.5 text-xs font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button onClick={() => toast.success("Đã xuất CSV (mock)")}
              className="px-3 py-1.5 text-xs font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-5 gap-4">
          <Stat label="Doanh thu phát sinh" value={formatVND(currentRevenue)} />
          <Stat label="Hoa hồng hợp lệ" value={formatVND(currentCommission)} accent />
          <Stat label="PIT 10%" value={`-${formatVND(currentPIT)}`} negative />
          <Stat label="Phí dịch vụ" value="-0 đ" muted />
          <Stat label="Tổng thanh toán" value={formatVND(currentCommission - currentPIT)} highlight />
        </div>
      </div>

      {/* Past statements */}
      <div className="data-table-wrapper mt-5">
        <div className="p-5 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-display font-bold">Hóa đơn đối soát các kỳ trước</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success("Đã xuất Excel (mock)")}
              className="px-3 py-1.5 text-xs font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
            <button onClick={() => toast.success("Đã xuất CSV (mock)")}
              className="px-3 py-1.5 text-xs font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Kỳ</th>
              <th className="text-right px-5 py-3 font-semibold">Doanh thu</th>
              <th className="text-right px-5 py-3 font-semibold">Hoa hồng</th>
              <th className="text-right px-5 py-3 font-semibold">PIT</th>
              <th className="text-right px-5 py-3 font-semibold">Thực nhận</th>
              <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {[
              { p: "03/2026", rev: 184_000_000, com: 14_720_000, status: "paid" as const },
              { p: "02/2026", rev: 156_000_000, com: 12_480_000, status: "paid" as const },
              { p: "01/2026", rev: 142_000_000, com: 11_360_000, status: "paid" as const },
            ].map(s => (
              <tr key={s.p} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-semibold">{s.p}</td>
                <td className="px-5 py-3 text-right">{formatVND(s.rev)}</td>
                <td className="px-5 py-3 text-right text-primary font-semibold">{formatVND(s.com)}</td>
                <td className="px-5 py-3 text-right text-warning">-{formatVND(s.com*0.1)}</td>
                <td className="px-5 py-3 text-right font-bold">{formatVND(s.com*0.9)}</td>
                <td className="px-5 py-3 text-center"><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const Stat = ({ label, value, accent, negative, muted, highlight }: any) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className={`text-lg font-bold mt-0.5 font-display
      ${accent ? "text-primary" : ""}
      ${negative ? "text-warning" : ""}
      ${muted ? "text-muted-foreground" : ""}
      ${highlight ? "text-success text-xl" : ""}
    `}>{value}</div>
  </div>
);

export default Statements;
