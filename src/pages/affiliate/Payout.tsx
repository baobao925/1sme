import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { KpiCard } from "@/components/KpiCard";
import { Wallet, Coins, CheckCircle2, Receipt, X, Info, AlertTriangle, ShieldAlert } from "lucide-react";
import { payoutRequests, conversions, currentAffiliate, calcCumulativeTax, MIN_PAYOUT, TAX_PIT_THRESHOLD } from "@/lib/mock-data";
import { formatVND, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const Payout = () => {
  const myConv = conversions.filter(c => c.affiliateId === currentAffiliate.id);
  const myPayouts = payoutRequests.filter(p => p.affiliateId === currentAffiliate.id);

  const pending = myConv.filter(c => c.status === "pending" || c.status === "hold").reduce((s, c) => s + c.commissionAmount, 0);

  const currentPeriod = "04/2026";
  const periodPayouts = myPayouts.filter(p => p.period === currentPeriod);

  // Tổng HH trong kỳ = max(periodCommission của các payout trong kỳ) — phản ánh giá trị tích lũy mới nhất
  const periodCommission = periodPayouts.reduce((m, p) => Math.max(m, p.periodCommission), 0);

  // Đã rút trong kỳ (không tính rejected/failed)
  const withdrawnInPeriod = periodPayouts
    .filter(p => p.status !== "rejected" && p.status !== "failed")
    .reduce((s, p) => s + p.requestedAmount, 0);

  // HH khả dụng = tổng HH trong kỳ - đã rút (đơn giản hoá cho demo)
  const approved = Math.max(0, periodCommission - withdrawnInPeriod);

  // Thuế: tổng phải khấu trừ vs đã khấu trừ trong kỳ
  const taxAlreadyDeducted = periodPayouts
    .filter(p => p.status !== "rejected" && p.status !== "failed")
    .reduce((s, p) => s + p.taxAmount, 0);
  const taxRequired = currentAffiliate.kind === "Cá nhân"
    ? (periodCommission >= TAX_PIT_THRESHOLD ? Math.round(periodCommission * 0.1) : 0)
    : Math.round(periodCommission * 0.1);
  const taxRemaining = Math.max(0, taxRequired - taxAlreadyDeducted);
  const taxProgress = taxRequired > 0 ? Math.min(100, Math.round((taxAlreadyDeducted / taxRequired) * 100)) : 100;

  const taxLabel = currentAffiliate.kind === "Cá nhân" ? "PIT 10%" : "VAT 10%";
  const canRequest = approved > MIN_PAYOUT;

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(approved.toString());
  const requested = Number(amount) || 0;
  const cumPreview = calcCumulativeTax(periodCommission, taxAlreadyDeducted, requested, currentAffiliate.kind);

  return (
    <TooltipProvider delayDuration={200}>
      <PageHeader title="Rút tiền" subtitle={`Loại tài khoản: ${currentAffiliate.kind} · Khấu trừ ${taxLabel} · Kỳ ${currentPeriod}`} />

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard label="Hoa hồng tạm tính + tạm giữ" value={formatVND(pending)} icon={Coins} accent="warning" />
        <KpiCard label="Hoa hồng khả dụng" value={formatVND(approved)} icon={CheckCircle2} accent="success" />
        <KpiCard label="Đã rút trong kỳ" value={formatVND(withdrawnInPeriod)} icon={Wallet} accent="primary"
          hint={`Kỳ ${currentPeriod}`} />
        <KpiCard label={`Thuế khấu trừ tích lũy (${taxLabel})`} value={formatVND(taxAlreadyDeducted)} icon={Receipt} accent="info"
          hint={`Tổng thuế phải khấu trừ trong kỳ: ${formatVND(taxRequired)}`} />
      </div>

      {/* THEO DÕI THUẾ TRONG KỲ */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-info" />
            <h3 className="font-display font-bold">Theo dõi thuế trong kỳ {currentPeriod}</h3>
          </div>
          {taxRemaining > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/30">
              <AlertTriangle className="w-3 h-3" /> Chưa khấu trừ đủ thuế
            </span>
          )}
          {taxRemaining === 0 && taxRequired > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/30">
              ✓ Đã khấu trừ đủ
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Stat label="Tổng hoa hồng trong kỳ" value={formatVND(periodCommission)} />
          <Stat label="Thuế phải khấu trừ" value={formatVND(taxRequired)} valueClass="text-foreground" />
          <Stat label="Đã khấu trừ" value={formatVND(taxAlreadyDeducted)} valueClass="text-success" />
          <Stat label="Còn phải khấu trừ" value={formatVND(taxRemaining)}
            valueClass={taxRemaining > 0 ? "text-destructive" : "text-muted-foreground"} />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tiến độ khấu trừ thuế</span>
            <span className="font-semibold">{taxProgress}%</span>
          </div>
          <Progress value={taxProgress} className="h-2" />
        </div>
      </div>

      {/* TAX RULE BANNER */}
      {currentAffiliate.kind === "Cá nhân" && (
        <div className="bg-info/10 border border-info/30 rounded-lg p-3 mb-4 text-sm flex items-start gap-2">
          <Info className="w-4 h-4 text-info mt-0.5 shrink-0" />
          <div className="text-xs leading-relaxed">
            Thuế <strong>PIT 10%</strong> áp dụng khi tổng hoa hồng trong kỳ ≥ <strong>{formatVND(TAX_PIT_THRESHOLD)}</strong>.
            Việc chia nhỏ nhiều lần rút <strong className="text-destructive">KHÔNG giúp tránh thuế</strong>.
            Hệ thống sẽ tự động khấu trừ phần thuế còn thiếu ở các lần rút tiếp theo.
          </div>
        </div>
      )}

      {/* Action card */}
      <div className="bg-gradient-hero text-primary-foreground rounded-xl p-6 mb-5 shadow-medium">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary-foreground/70">Số dư khả dụng</div>
            <div className="text-4xl font-display font-bold mt-1">{formatVND(approved)}</div>
            <div className="text-sm text-primary-foreground/80 mt-1">
              Ngưỡng tối thiểu để rút: &gt; {formatVND(MIN_PAYOUT)} · Phát lệnh chuyển khoản ngày 15 hàng tháng
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              disabled={!canRequest}
              onClick={() => setOpen(true)}
              className="px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Wallet className="w-5 h-5" /> Yêu cầu rút tiền
            </button>
            <div className="text-[11px] text-primary-foreground/70 italic max-w-[260px] text-right">
              Thuế có thể được khấu trừ thêm dựa trên tổng hoa hồng trong kỳ.
            </div>
          </div>
        </div>
        {!canRequest && (
          <div className="mt-3 bg-white/10 rounded-md p-3 text-sm">
            ⚠️ Hoa hồng khả dụng phải lớn hơn {formatVND(MIN_PAYOUT)} mới có thể tạo yêu cầu rút tiền.
          </div>
        )}
      </div>

      {/* History */}
      <div className="data-table-wrapper">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-bold">Lịch sử yêu cầu rút tiền</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1220px]">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Mã yêu cầu</th>
                <th className="text-center px-5 py-3 font-semibold">Kỳ</th>
                <th className="text-right px-5 py-3 font-semibold">Số tiền yêu cầu</th>
                <th className="text-right px-5 py-3 font-semibold">Tổng HH trong kỳ</th>
                <th className="text-right px-5 py-3 font-semibold">
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-1">
                      Khấu trừ lần này <Info className="w-3 h-3" />
                    </TooltipTrigger>
                    <TooltipContent>Được tính dựa trên tổng thu nhập trong kỳ</TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-right px-5 py-3 font-semibold">Thực nhận</th>
                <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
                <th className="text-left px-5 py-3 font-semibold">Ngày tạo</th>
                <th className="text-left px-5 py-3 font-semibold">Ngày thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {myPayouts.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs">{p.code}</td>
                  <td className="px-5 py-3 text-center text-xs font-mono">{p.period}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatVND(p.requestedAmount)}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{formatVND(p.periodCommission)}</td>
                  <td className="px-5 py-3 text-right">
                    {p.taxAmount > 0
                      ? <span className="text-destructive font-semibold">-{formatVND(p.taxAmount)}</span>
                      : <span className="text-muted-foreground">0 đ</span>}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-primary">{formatVND(p.net)}</td>
                  <td className="px-5 py-3 text-center"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-display font-bold">Yêu cầu rút tiền · Kỳ {currentPeriod}</h3>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <label className="block">
                <div className="text-xs font-semibold mb-1.5">Số tiền rút</div>
                <input value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
                <div className="text-xs text-muted-foreground mt-1">
                  Khả dụng: {formatVND(approved)} · Ngưỡng tối thiểu: &gt; {formatVND(MIN_PAYOUT)}
                </div>
              </label>

              <div className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tổng HH trong kỳ {currentPeriod}</span><span>{formatVND(periodCommission)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Thuế phải nộp ({cumPreview.type === "None" ? "Miễn" : `${cumPreview.type} 10%`})</span>
                  <span>{formatVND(cumPreview.taxPayableTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>− Đã khấu trừ kỳ này</span><span>{formatVND(cumPreview.taxAlreadyDeducted)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span>Số tiền yêu cầu</span><strong>{formatVND(requested)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Khấu trừ thuế lần này</span>
                  <strong className={cumPreview.taxThisRequest > 0 ? "text-destructive" : "text-muted-foreground"}>
                    {cumPreview.taxThisRequest > 0 ? `-${formatVND(cumPreview.taxThisRequest)}` : "0 đ"}
                  </strong>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <span className="font-semibold">Thực nhận</span>
                  <strong className="text-primary">{formatVND(requested - cumPreview.taxThisRequest)}</strong>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground italic flex items-start gap-1.5">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                Thuế tính trên TỔNG hoa hồng trong kỳ, không phải trên từng yêu cầu rút.
              </div>

              <div>
                <div className="text-xs font-semibold mb-1.5">Tài khoản nhận</div>
                <div className="px-3 py-2 bg-muted/40 rounded-md text-sm">{currentAffiliate.bank.bankName} - {currentAffiliate.bank.account}</div>
              </div>

              <label className="block">
                <div className="text-xs font-semibold mb-1.5">Ghi chú</div>
                <textarea rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" placeholder="Tuỳ chọn..." />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Huỷ</button>
                <button
                  disabled={requested <= 0 || requested > approved}
                  onClick={() => { toast.success("Đã gửi yêu cầu rút tiền!"); setOpen(false); }}
                  className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md disabled:opacity-40">
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
};

const Stat = ({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) => (
  <div>
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className={`text-lg font-display font-bold ${valueClass}`}>{value}</div>
  </div>
);

export default Payout;
