import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { payoutRequests } from "@/lib/mock-data";
import type { PayoutRequest } from "@/lib/mock-data";
import { formatVND, formatDate } from "@/lib/format";
import { Wallet, FileText, FileSpreadsheet, Receipt, Calendar, CheckCircle2, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Chỉ hiển thị các trạng thái liên quan đến lịch sử thanh toán
const VALID_STATUSES = ["paid", "approved", "rejected"];

const PaymentHistory = () => {
  const [period, setPeriod] = useState("all");
  const [items, setItems] = useState<PayoutRequest[]>(payoutRequests);
  const [confirming, setConfirming] = useState<PayoutRequest | null>(null);
  const [rejecting, setRejecting] = useState<PayoutRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [detailView, setDetailView] = useState<PayoutRequest | null>(null);

  const periods = Array.from(new Set(items.map(p => p.period))).sort().reverse();

  const filtered = items.filter(p =>
    VALID_STATUSES.includes(p.status) &&
    (period === "all" || p.period === period)
  );

  const paidList = filtered.filter(p => p.status === "paid");
  const totalPaid = paidList.reduce((s, p) => s + p.net, 0);
  const totalTax = paidList.reduce((s, p) => s + p.taxAmount, 0);
  const count = paidList.length;

  const exportInvoice = (code: string) => toast.success(`Đã xuất hóa đơn cho ${code} (mock)`);
  const exportAll = (fmt: string) => toast.success(`Đã xuất ${fmt} lịch sử thanh toán (mock)`);

  const handleConfirm = (p: PayoutRequest) => {
    setItems(prev => prev.map(it => it.id === p.id
      ? { ...it, status: "paid", paidAt: new Date().toISOString().slice(0, 10) }
      : it
    ));
    toast.success(`Đã xác nhận thanh toán ${p.code}`);
    setConfirming(null);
  };

  const handleReject = () => {
    if (!rejecting) return;
    if (!rejectReason.trim()) { toast.error("Vui lòng nhập lý do từ chối"); return; }
    setItems(prev => prev.map(it => it.id === rejecting.id
      ? { ...it, status: "rejected", rejectReason: rejectReason.trim() }
      : it
    ));
    toast.success(`Đã từ chối thanh toán ${rejecting.code}`);
    setRejecting(null);
    setRejectReason("");
  };

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
          <table className="w-full text-sm min-w-[1400px]">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Mã thanh toán</th>
                <th className="text-left px-4 py-3 font-semibold">Affiliate</th>
                <th className="text-left px-4 py-3 font-semibold">Mã Affiliate</th>
                <th className="text-left px-4 py-3 font-semibold">Thông tin thanh toán</th>
                <th className="text-center px-4 py-3 font-semibold">Kỳ</th>
                <th className="text-right px-4 py-3 font-semibold">Số tiền YC</th>
                <th className="text-right px-4 py-3 font-semibold">Thuế</th>
                <th className="text-right px-4 py-3 font-semibold">Phí DV</th>
                <th className="text-right px-4 py-3 font-semibold">Thực nhận</th>
                <th className="text-left px-4 py-3 font-semibold">Ngày YC</th>
                <th className="text-left px-4 py-3 font-semibold">Ngày thanh toán</th>
                <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
                <th className="text-center px-4 py-3 font-semibold sticky-action">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{p.code}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{p.affiliateName}</div>
                    <div className="text-xs text-muted-foreground">{p.affiliateKind}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.affiliateCode || p.affiliateId}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {p.bankAccount || "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-mono">{p.period}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatVND(p.requestedAmount)}</td>
                  <td className="px-4 py-3 text-right text-warning">{p.taxAmount > 0 ? `-${formatVND(p.taxAmount)}` : "—"}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.serviceFee > 0 ? `-${formatVND(p.serviceFee)}` : "—"}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{formatVND(p.net)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {p.paidAt ? formatDate(p.paidAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-center sticky-action">
                    <div className="flex justify-center items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setDetailView(p)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded text-xs font-semibold whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3" /> Xem chi tiết
                      </button>
                      {/* Xuất hóa đơn cho đơn đã thanh toán */}
                      {p.status === "paid" && (
                        <button
                          onClick={() => exportInvoice(p.code)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-semibold whitespace-nowrap"
                        >
                          <FileText className="w-3 h-3" /> Hóa đơn
                        </button>
                      )}
                      {/* Xác nhận thanh toán cho đơn approved */}
                      {p.status === "approved" && (
                        <>
                          <button
                            onClick={() => setConfirming(p)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success hover:bg-success/20 rounded text-xs font-semibold whitespace-nowrap"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Xác nhận TT
                          </button>
                          <button
                            onClick={() => { setRejecting(p); setRejectReason(""); }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded text-xs font-semibold whitespace-nowrap"
                          >
                            <XCircle className="w-3 h-3" /> Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={13} className="text-center py-10 text-muted-foreground">Không có dữ liệu thanh toán</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Xác nhận thanh toán */}
      <Dialog open={!!confirming} onOpenChange={(o) => !o && setConfirming(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Xác nhận đã thanh toán
            </DialogTitle>
            <DialogDescription>
              {confirming?.code} · {confirming?.affiliateName}
            </DialogDescription>
          </DialogHeader>
          {confirming && (
            <div className="space-y-2 text-sm">
              <div className="bg-muted/40 rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Tài khoản nhận</span><strong className="font-mono">{confirming.bankAccount}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Số tiền yêu cầu</span><strong>{formatVND(confirming.requestedAmount)}</strong></div>
                <div className="flex justify-between border-t border-border pt-1.5"><span className="text-muted-foreground">Thực nhận (sau thuế + phí)</span><strong className="text-primary">{formatVND(confirming.net)}</strong></div>
              </div>
              <p className="text-xs text-muted-foreground italic">Hành động này sẽ đánh dấu yêu cầu là <strong>Đã thanh toán</strong> và ghi nhận ngày thanh toán hôm nay.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(null)}>Huỷ</Button>
            <Button className="bg-success text-success-foreground hover:bg-success/90"
              onClick={() => confirming && handleConfirm(confirming)}>
              Xác nhận đã thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Từ chối thanh toán */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && (setRejecting(null), setRejectReason(""))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Từ chối thanh toán
            </DialogTitle>
            <DialogDescription>
              {rejecting?.code} · {rejecting?.affiliateName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Lý do từ chối <span className="text-destructive">*</span></label>
            <Textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="VD: Sai thông tin tài khoản ngân hàng, thiếu giấy tờ..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejecting(null); setRejectReason(""); }}>Huỷ</Button>
            <Button variant="destructive" onClick={handleReject}>Xác nhận từ chối</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog Chi tiết yêu cầu */}
      <Dialog open={!!detailView} onOpenChange={(o) => !o && setDetailView(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu thanh toán</DialogTitle>
            <DialogDescription>
              {detailView?.code} · Kỳ {detailView?.period}
            </DialogDescription>
          </DialogHeader>
          {detailView && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Mã yêu cầu" value={<span className="font-mono text-xs">{detailView.code}</span>} />
                <DetailRow label="Affiliate" value={<span className="font-semibold">{detailView.affiliateName}</span>} />
                <DetailRow label="Mã Affiliate" value={<span className="font-mono text-xs">{detailView.affiliateCode || detailView.affiliateId}</span>} />
                <DetailRow label="Ngày tạo" value={formatDate(detailView.createdAt)} />
                <DetailRow label="Ngày thanh toán" value={detailView.paidAt ? formatDate(detailView.paidAt) : "—"} />
                <DetailRow label="Tài khoản nhận" value={<span className="font-mono text-xs">{detailView.bankAccount}</span>} />
              </div>

              <div className="border-t border-border pt-3 space-y-1.5">
                <DetailRow label="Số tiền yêu cầu" value={<strong>{formatVND(detailView.requestedAmount)}</strong>} />
                <DetailRow label="Tổng HH trong kỳ" value={formatVND(detailView.periodCommission)} />
                <DetailRow
                  label={`Khấu trừ thuế (${detailView.taxType === "None" ? "Miễn" : detailView.taxType + " 10%"})`}
                  value={
                    detailView.taxAmount > 0
                      ? <span className="text-destructive font-semibold">-{formatVND(detailView.taxAmount)}</span>
                      : <span className="text-muted-foreground">0 đ</span>
                  }
                />
                {detailView.serviceFee > 0 && (
                  <DetailRow label="Phí dịch vụ" value={<span className="text-muted-foreground">-{formatVND(detailView.serviceFee)}</span>} />
                )}
                <DetailRow
                  label="Thực nhận"
                  value={<span className="text-primary font-bold text-base">{formatVND(detailView.net)}</span>}
                />
              </div>

              <div className="border-t border-border pt-3">
                <div className="mt-2">
                  <DetailRow label="Trạng thái" value={<StatusBadge status={detailView.status} />} />
                </div>
              </div>

              {detailView.rejectReason && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 space-y-1">
                  <div className="text-xs font-semibold text-destructive">Lý do từ chối</div>
                  <div className="text-sm">{detailView.rejectReason}</div>
                </div>
              )}

              {detailView.note && (
                <div className="bg-muted/40 rounded-lg p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Ghi chú</div>
                  <div className="text-sm">{detailView.note}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-4 items-start">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="text-right">{value}</span>
  </div>
);

export default PaymentHistory;
