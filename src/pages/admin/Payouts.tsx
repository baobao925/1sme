import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { payoutRequests as initialPayouts, calcCumulativeTax, systemTaxConfig } from "@/lib/mock-data";
import type { PayoutRequest } from "@/lib/mock-data";
import { formatVND, formatDate } from "@/lib/format";
import { Wallet, Banknote, ReceiptText, Check, X, Eye, Info, ShieldAlert, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const Payouts = () => {
  const [items, setItems] = useState<PayoutRequest[]>(initialPayouts);
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detail, setDetail] = useState<PayoutRequest | null>(null);
  const [approving, setApproving] = useState<PayoutRequest | null>(null);
  const [rejecting, setRejecting] = useState<PayoutRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const periods = useMemo(() => Array.from(new Set(items.map(i => i.period))).sort().reverse(), [items]);

  const filtered = items.filter(p =>
    (periodFilter === "all" || p.period === periodFilter) &&
    (statusFilter === "all" || p.status === statusFilter)
  );

  // KPIs
  const totalRequested = filtered.reduce((s, p) => s + p.requestedAmount, 0);
  const totalTax = filtered.reduce((s, p) => s + p.taxAmount, 0);
  const totalNet = filtered.reduce((s, p) => s + p.net, 0);
  const pendingCount = filtered.filter(p => p.status === "pending").length;
  const paidCount = filtered.filter(p => p.status === "paid").length;

  const handleApprove = (p: PayoutRequest) => {
    // Tính lại thuế tích lũy tại thời điểm duyệt — chống lách thuế
    const cum = calcCumulativeTax(p.periodCommission, p.taxAlreadyDeducted, p.requestedAmount, p.affiliateKind);
    setItems(prev => prev.map(it => it.id === p.id ? {
      ...it,
      taxType: cum.type,
      taxPayableTotal: cum.taxPayableTotal,
      taxAlreadyDeducted: cum.taxAlreadyDeducted,
      taxAmount: cum.taxThisRequest,
      net: it.requestedAmount - cum.taxThisRequest - it.serviceFee,
      status: "approved",
    } : it));
    toast.success(`Đã duyệt ${p.code} · Thuế khấu trừ: ${formatVND(cum.taxThisRequest)}`);
    setApproving(null);
  };

  const handleReject = () => {
    if (!rejecting) return;
    if (!rejectReason.trim()) { toast.error("Vui lòng nhập lý do từ chối"); return; }
    setItems(prev => prev.map(it => it.id === rejecting.id
      ? { ...it, status: "rejected", rejectReason: rejectReason.trim() } : it));
    toast.success(`Đã từ chối ${rejecting.code}`);
    setRejecting(null); setRejectReason("");
  };

  return (
    <TooltipProvider delayDuration={200}>
      <PageHeader
        title="Duyệt yêu cầu rút tiền"
        subtitle="Nền tảng KHÔNG giữ ví — thuế tính trên TỔNG hoa hồng trong kỳ, đã khấu trừ ở các yêu cầu trước sẽ trừ vào lần này (chống lách thuế)"
      />

      {/* Cảnh báo nguyên tắc */}
      <div className="bg-info/10 border border-info/30 rounded-lg p-3 mb-4 text-sm flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-info mt-0.5 shrink-0" />
        <div className="text-xs">
          <strong>Quy tắc thuế tích lũy:</strong> PIT 10% áp dụng khi <strong>TỔNG hoa hồng trong kỳ ≥ {formatVND(systemTaxConfig.individual.threshold)}</strong> (cá nhân).
          Mỗi yêu cầu rút sẽ khấu trừ phần thuế còn thiếu = <em>Tổng thuế phải nộp − Đã khấu trừ trước đó</em>.
          Nếu Affiliate tách nhiều yêu cầu nhỏ lẻ, hệ thống vẫn truy thu đủ ở yêu cầu kế tiếp.
        </div>
      </div>

      {/* Filters */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
          <TabsList className="bg-muted/50 border border-border h-10 px-1.5 py-1">
            <TabsTrigger value="all" className="rounded-md">Tất cả</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-md">Chờ duyệt</TabsTrigger>
            <TabsTrigger value="approved" className="rounded-md">Đã duyệt</TabsTrigger>
            <TabsTrigger value="processing" className="rounded-md">Đang xử lý</TabsTrigger>
            <TabsTrigger value="paid" className="rounded-md">Đã thanh toán</TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-md">Từ chối</TabsTrigger>
            <TabsTrigger value="failed" className="rounded-md">Thất bại</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 text-sm z-10 relative">
            <Calendar className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[180px] h-9 bg-background">
                <SelectValue placeholder="Chọn kỳ thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả kỳ</SelectItem>
                {periods.map(p => <SelectItem key={p} value={p}>Kỳ {p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Tabs>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-5">
        <KpiCard label="Tổng yêu cầu rút" value={formatVND(totalRequested)} icon={Wallet} accent="primary" />
        <KpiCard label="Tổng thuế khấu trừ" value={formatVND(totalTax)} icon={ReceiptText} accent="warning" hint="Tích lũy theo kỳ" />
        <KpiCard label="Tổng thực nhận" value={formatVND(totalNet)} icon={Banknote} accent="success" />
        <KpiCard label="Chờ duyệt" value={String(pendingCount)} icon={Eye} accent="info" />
        <KpiCard label="Đã thanh toán" value={String(paidCount)} icon={Check} accent="accent" />
      </div>

      {/* Bảng yêu cầu rút tiền */}
      <div className="data-table-wrapper">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-bold">Danh sách yêu cầu rút tiền</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cuộn ngang để xem đầy đủ các cột · Cột hành động được neo bên phải
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1700px]">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Affiliate</th>
                <th className="text-left px-4 py-3 font-semibold">Mã Affiliate</th>
                <th className="text-right px-4 py-3 font-semibold">Số tiền yêu cầu</th>
                <th className="text-right px-4 py-3 font-semibold">HH khả dụng</th>
                <th className="text-right px-4 py-3 font-semibold">Tổng HH trong kỳ</th>
                <th className="text-right px-4 py-3 font-semibold">
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-1">
                      Thuế phải nộp (kỳ) <Info className="w-3 h-3" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Tổng thuế phải nộp được tính trên TỔNG hoa hồng trong kỳ, không phải trên từng yêu cầu rút.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-right px-4 py-3 font-semibold">Đã khấu trừ trước</th>
                <th className="text-right px-4 py-3 font-semibold">Khấu trừ lần này</th>
                <th className="text-right px-4 py-3 font-semibold">Thực nhận</th>
                <th className="text-left px-4 py-3 font-semibold min-w-[200px]">Hoa hồng tương ứng</th>
                <th className="text-center px-4 py-3 font-semibold">Kỳ TT</th>
                <th className="text-left px-4 py-3 font-semibold">Ngày YC</th>
                <th className="text-left px-4 py-3 font-semibold">Ngày thanh toán</th>
                <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
                <th className="text-center px-4 py-3 font-semibold sticky-action">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const taxRemaining = p.taxPayableTotal - p.taxAlreadyDeducted;
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{p.affiliateName}</div>
                      <div className="text-xs text-muted-foreground">{p.code} · {p.affiliateKind}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.affiliateCode || p.affiliateId}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatVND(p.requestedAmount)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatVND(p.availableCommission)}</td>
                    <td className="px-4 py-3 text-right">
                      <Tooltip>
                        <TooltipTrigger className="underline decoration-dotted">
                          {formatVND(p.periodCommission)}
                        </TooltipTrigger>
                        <TooltipContent>Dùng để xét ngưỡng và tính thuế tích lũy</TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.taxType === "None" ? "text-muted-foreground" : "text-warning font-semibold"}>
                        {p.taxType === "None" ? "Miễn thuế" : formatVND(p.taxPayableTotal)}
                      </span>
                      {p.taxType !== "None" && (
                        <div className="text-[10px] text-muted-foreground">{p.taxType} 10%</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {p.taxAlreadyDeducted > 0 ? formatVND(p.taxAlreadyDeducted) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Tooltip>
                        <TooltipTrigger className="text-warning font-semibold underline decoration-dotted">
                          {p.taxAmount > 0 ? `-${formatVND(p.taxAmount)}` : "0 đ"}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          = Thuế phải nộp ({formatVND(p.taxPayableTotal)}) − Đã khấu trừ ({formatVND(p.taxAlreadyDeducted)})
                          <br />Còn lại: {formatVND(Math.max(0, taxRemaining))}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-primary">{formatVND(p.net)}</td>
                    <td className="px-4 py-3 text-xs leading-relaxed">
                      {p.mappedCommissions ? (
                        <div className="space-y-1">
                          {p.mappedCommissions.map(m => (
                            <div key={m.orderCode} className="whitespace-nowrap">
                              <span className="font-medium text-foreground">{m.orderCode}</span>: {formatVND(m.mappedAmount)} / <span className="text-muted-foreground">{formatVND(m.totalAmount)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-mono">{p.period}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={p.status} />
                      {p.rejectReason && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-destructive inline ml-1 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">{p.rejectReason}</TooltipContent>
                        </Tooltip>
                      )}
                    </td>
                    <td className="px-4 py-3 sticky-action">
                      <div className="flex justify-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => setDetail(p)}
                              className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                              <Eye className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Xem chi tiết</TooltipContent>
                        </Tooltip>
                        {p.status === "pending" && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button onClick={() => setApproving(p)}
                                  className="p-1.5 hover:bg-success/10 hover:text-success rounded text-muted-foreground">
                                  <Check className="w-4 h-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Duyệt</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button onClick={() => { setRejecting(p); setRejectReason(""); }}
                                  className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground">
                                  <X className="w-4 h-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Từ chối</TooltipContent>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={15} className="text-center py-10 text-muted-foreground">Không có yêu cầu rút tiền nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Duyệt */}
      <Dialog open={!!approving} onOpenChange={(o) => !o && setApproving(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Xác nhận duyệt yêu cầu rút tiền</DialogTitle>
            <DialogDescription>
              Hệ thống sẽ tự động tính lại thuế dựa trên TỔNG hoa hồng trong kỳ — không phải số tiền của riêng yêu cầu này.
            </DialogDescription>
          </DialogHeader>
          {approving && (() => {
            const cum = calcCumulativeTax(approving.periodCommission, approving.taxAlreadyDeducted, approving.requestedAmount, approving.affiliateKind);
            return (
              <div className="space-y-3 text-sm">
                <Row label="Affiliate" value={`${approving.affiliateName} (${approving.affiliateKind})`} />
                <Row label="Kỳ thanh toán" value={approving.period} />
                <Row label="Tổng hoa hồng trong kỳ" value={formatVND(approving.periodCommission)} />
                <Row label="Số tiền yêu cầu rút" value={formatVND(approving.requestedAmount)} bold />
                <div className="bg-muted/40 rounded-lg p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between"><span>Thuế phải nộp ({cum.type === "None" ? "Miễn" : `${cum.type} 10%`} trên kỳ)</span>
                    <strong>{formatVND(cum.taxPayableTotal)}</strong></div>
                  <div className="flex justify-between text-muted-foreground"><span>− Đã khấu trừ ở YC trước</span>
                    <strong>{formatVND(cum.taxAlreadyDeducted)}</strong></div>
                  <div className="flex justify-between text-warning border-t border-border pt-1.5"><span>Thuế khấu trừ lần này</span>
                    <strong>-{formatVND(cum.taxThisRequest)}</strong></div>
                  <div className="flex justify-between text-muted-foreground"><span>Phí dịch vụ</span>
                    <strong>{approving.serviceFee > 0 ? `-${formatVND(approving.serviceFee)}` : "0 đ"}</strong></div>
                  <div className="flex justify-between text-base border-t border-border pt-1.5">
                    <span className="font-semibold">Thực nhận</span>
                    <strong className="text-primary">{formatVND(approving.requestedAmount - cum.taxThisRequest - approving.serviceFee)}</strong>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground italic">
                  💡 Thuế được tính trên TỔNG hoa hồng trong kỳ, không phải trên yêu cầu rút này.
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproving(null)}>Huỷ</Button>
            <Button onClick={() => approving && handleApprove(approving)}>Xác nhận duyệt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Từ chối */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && (setRejecting(null), setRejectReason(""))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu rút tiền</DialogTitle>
            <DialogDescription>{rejecting?.code} · {rejecting?.affiliateName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Lý do từ chối <span className="text-destructive">*</span></label>
            <Textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="VD: Sai thông tin tài khoản ngân hàng, thiếu giấy tờ thuế..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejecting(null); setRejectReason(""); }}>Huỷ</Button>
            <Button variant="destructive" onClick={handleReject}>Xác nhận từ chối</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Chi tiết */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu rút tiền</DialogTitle>
            <DialogDescription>{detail?.code} · Kỳ {detail?.period}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <Row label="Affiliate" value={`${detail.affiliateName} (${detail.affiliateKind})`} />
              <Row label="Tài khoản nhận" value={detail.bankAccount} />
              <Row label="Ngày yêu cầu" value={formatDate(detail.createdAt)} />
              <Row label="Trạng thái" value={<StatusBadge status={detail.status} />} />
              <div className="border-t border-border pt-3 space-y-1.5">
                <Row label="Số tiền yêu cầu" value={formatVND(detail.requestedAmount)} bold />
                <Row label="HH khả dụng tại thời điểm YC" value={formatVND(detail.availableCommission)} />
                <Row label="Tổng HH trong kỳ" value={formatVND(detail.periodCommission)} />
                <Row label={`Thuế phải nộp (${detail.taxType})`} value={formatVND(detail.taxPayableTotal)} />
                <Row label="Đã khấu trừ trước" value={formatVND(detail.taxAlreadyDeducted)} />
                <Row label="Khấu trừ lần này" value={`-${formatVND(detail.taxAmount)}`} />
                <Row label="Phí dịch vụ" value={detail.serviceFee > 0 ? `-${formatVND(detail.serviceFee)}` : "0 đ"} />
                <Row label="Thực nhận" value={<span className="text-primary font-bold">{formatVND(detail.net)}</span>} />
              </div>
              {detail.rejectReason && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-xs">
                  <strong>Lý do từ chối:</strong> {detail.rejectReason}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

const Row = ({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) => (
  <div className="flex justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className={bold ? "font-semibold" : ""}>{value}</span>
  </div>
);

export default Payouts;
