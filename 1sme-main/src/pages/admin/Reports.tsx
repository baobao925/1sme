import React, { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { affiliates, conversions, products, payoutRequests } from "@/lib/mock-data";
import { formatVND, formatNumber } from "@/lib/format";
import { FileSpreadsheet, FileText, ShoppingCart, RotateCcw, Coins, Receipt, Wallet, BarChart3, Lock, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

const Reports = () => {
  const [month, setMonth] = useState("2026-04");
  const [affFilter, setAffFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");

  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [lockStartDate, setLockStartDate] = useState("");
  const [lockEndDate, setLockEndDate] = useState("");
  const [isConfirmChecked, setIsConfirmChecked] = useState(false);
  
  const handleLockPeriod = () => {
    toast.success("Khóa kỳ đối soát thành công. Dữ liệu trong kỳ đã được cố định để phục vụ thanh toán và đối soát.");
    setIsLockDialogOpen(false);
    setIsConfirmChecked(false);
  };

  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  const affMap = Object.fromEntries(affiliates.map(a => [a.id, a]));
  const vendors = Array.from(new Set(products.map(p => p.vendor)));

  // Map conversion -> payout code
  const convToPayout: Record<string, string> = {};
  payoutRequests.forEach(p => p.conversionIds?.forEach(cid => { convToPayout[cid] = p.code; }));

  const filtered = useMemo(() => conversions.filter(c => {
    if (!c.orderedAt.startsWith(month)) return false;
    if (affFilter !== "all" && c.affiliateId !== affFilter) return false;
    if (productFilter !== "all" && c.productId !== productFilter) return false;
    const vendor = productMap[c.productId]?.vendor;
    if (vendorFilter !== "all" && vendor !== vendorFilter) return false;
    return true;
  }), [month, affFilter, productFilter, vendorFilter, productMap]);

  // Stats
  const totalOrders = filtered.length;
  const refundOrders = filtered.filter(c => c.status === "void").length;
  const validCommission = filtered.filter(c => c.status !== "void").reduce((s, c) => s + c.commissionAmount, 0);
  const gmv = filtered.reduce((s, c) => s + c.orderValue, 0);

  // Group tax by aff kind
  const taxDeducted = filtered.reduce((s, c) => {
    if (c.status === "void") return s;
    const a = affMap[c.affiliateId];
    if (!a) return s;
    return s + Math.round(c.commissionAmount * 0.1);
  }, 0);

  // Group by category for sub-totals
  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach(c => {
      const cat = productMap[c.productId]?.category ?? "—";
      if (!map[cat]) map[cat] = [];
      map[cat].push(c);
    });
    return map;
  }, [filtered, productMap]);

  // Chart data
  const chartData = useMemo(() => {
    return Object.entries(grouped).map(([cat, orders]) => {
      const catGmv = orders.reduce((s, c) => s + c.orderValue, 0);
      const catComm = orders.filter(c => c.status !== "void").reduce((s, c) => s + c.commissionAmount, 0);
      const catTax = orders.filter(c => c.status !== "void").reduce((s, c) => {
        const a = affMap[c.affiliateId];
        return s + (a ? Math.round(c.commissionAmount * 0.1) : 0);
      }, 0);
      return {
        name: cat,
        "GMV": catGmv,
        "Hoa hồng": catComm,
        "Thuế": catTax,
        "Thực chi": catComm - catTax
      };
    }).sort((a, b) => b.GMV - a.GMV);
  }, [grouped, affMap]);

  let stt = 0;

  return (
    <>
      <PageHeader
        title="Báo cáo đối soát tổng hợp"
        subtitle="Bảng tổng quan đầy đủ trường thông tin · Filter theo Affiliate / Sản phẩm / Nhà cung cấp / Tháng"
        actions={
          <>
            <Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
              <DialogTrigger asChild>
                <button className="px-3 py-2 text-sm font-semibold border border-primary text-primary hover:bg-primary/10 rounded-md flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Khóa kỳ đối soát
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-warning/20 text-warning flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <DialogTitle className="text-center text-xl">Xác nhận khóa kỳ đối soát</DialogTitle>
                  <DialogDescription className="text-center text-base">
                    Thông báo việc cố định dữ liệu hoa hồng và thanh toán
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Từ ngày <span className="text-destructive">*</span></label>
                      <input type="date" value={lockStartDate} onChange={(e) => setLockStartDate(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Đến ngày <span className="text-destructive">*</span></label>
                      <input type="date" value={lockEndDate} onChange={(e) => setLockEndDate(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>

                  {/* Warning Box */}
                  <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
                    <p className="font-semibold text-warning-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Hiện vẫn còn dữ liệu chưa hoàn tất xử lý:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-warning-foreground/80">
                      <li><span className="font-bold">{conversions.filter(c => c.status === "hold").length}</span> hoa hồng đang tạm giữ</li>
                      <li><span className="font-bold">{payoutRequests.filter(p => ["pending", "processing"].includes(p.status)).length}</span> yêu cầu thanh toán đang xử lý</li>
                    </ul>
                  </div>

                  {/* Info Text */}
                  <div className="text-sm text-muted-foreground space-y-2 bg-muted/30 p-4 rounded-lg border border-border">
                    <p>Bạn vẫn có thể khóa kỳ, tuy nhiên các phát sinh sau đó sẽ được chuyển sang kỳ tiếp theo.</p>
                    <p className="font-semibold mt-2 text-foreground">Sau khi khóa kỳ:</p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li>Không thể thay đổi trạng thái hoa hồng của các đơn hàng trong kỳ</li>
                      <li>Không thể cập nhật lại số liệu đối soát hoặc tính toán lại hoa hồng</li>
                      <li>Không thể thêm/xóa đơn hàng khỏi kỳ đối soát</li>
                      <li>Các yêu cầu thanh toán sẽ được thực hiện dựa trên số liệu đã khóa</li>
                    </ul>
                    <p className="mt-2">Các phát sinh hoàn trả/điều chỉnh sau thời điểm khóa kỳ sẽ được ghi nhận vào kỳ đối soát tiếp theo.</p>
                  </div>

                  {/* Summary Section */}
                  <div>
                    <h4 className="font-semibold mb-3">Thống kê dữ liệu tổng hợp kỳ</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-card border border-border p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1">Tổng đơn chuyển đổi</p>
                        <p className="font-semibold">{formatNumber(totalOrders)}</p>
                      </div>
                      <div className="bg-card border border-border p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1">Tổng doanh thu</p>
                        <p className="font-semibold text-success">{formatVND(gmv)}</p>
                      </div>
                      <div className="bg-card border border-border p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1">Tổng hoa hồng hợp lệ</p>
                        <p className="font-semibold text-primary">{formatVND(validCommission)}</p>
                      </div>
                      <div className="bg-card border border-border p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1">Thuế PIT tạm khấu trừ</p>
                        <p className="font-semibold text-warning">{formatVND(taxDeducted)}</p>
                      </div>
                      <div className="bg-card border border-border p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1">Tổng thực chi dự kiến</p>
                        <p className="font-semibold text-accent">{formatVND(validCommission - taxDeducted)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-start space-x-3 bg-primary/5 p-4 rounded-lg border border-primary/20 mt-4">
                    <Checkbox id="confirm-lock" checked={isConfirmChecked} onCheckedChange={(checked) => setIsConfirmChecked(!!checked)} className="mt-1" />
                    <label htmlFor="confirm-lock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                      Tôi xác nhận đã kiểm tra số liệu đối soát và đồng ý khóa kỳ thanh toán.
                    </label>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <button onClick={() => setIsLockDialogOpen(false)} className="px-4 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-md transition-colors">
                    Hủy
                  </button>
                  <button 
                    onClick={handleLockPeriod} 
                    disabled={!isConfirmChecked || !lockStartDate || !lockEndDate} 
                    className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Xác nhận khóa kỳ
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <button onClick={() => toast.success("Đã xuất Excel (mock)")} className="px-3 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button onClick={() => toast.success("Đã xuất PDF (mock)")} className="px-3 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-2">
              <FileText className="w-4 h-4" /> PDF
            </button>
          </>
        }
      />

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex flex-wrap gap-3 shadow-soft">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-md text-sm" />
        <select value={affFilter} onChange={e => setAffFilter(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="all">Tất cả Affiliate</option>
          {affiliates.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
        </select>
        <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="all">Tất cả Sản phẩm</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
        </select>
        <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="all">Tất cả Nhà cung cấp</option>
          {vendors.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Dashboard KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <KpiCard label="Đơn chuyển đổi" value={formatNumber(totalOrders)} icon={ShoppingCart} accent="primary" />
        <KpiCard label="Đơn hoàn trả" value={formatNumber(refundOrders)} icon={RotateCcw} accent="warning" />
        <KpiCard label="Doanh thu (GMV)" value={formatVND(gmv)} icon={Coins} accent="success" />
        <KpiCard label="Hoa hồng hợp lệ" value={formatVND(validCommission)} icon={Coins} accent="primary" />
        <KpiCard label="Khấu trừ thuế" value={formatVND(taxDeducted)} icon={Receipt} accent="warning" />
        <KpiCard label="Thực chi" value={formatVND(validCommission - taxDeducted)} icon={Wallet} accent="accent" />
      </div>

      {/* Chart Section */}
      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 mb-5 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold">Biểu đồ Doanh thu & Chi phí theo Ngành hàng</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={{ stroke: "hsl(var(--border))" }} 
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={val => `${(val / 1000000).toFixed(1)} tr`} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }} 
                  tickLine={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: "hsl(var(--muted)/0.4)" }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                  formatter={(val: number) => formatVND(val)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
                <Bar dataKey="GMV" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Hoa hồng" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Thuế" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} stackId="stack" maxBarSize={60} />
                <Bar dataKey="Thực chi" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} stackId="stack" maxBarSize={60} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Unified table - grouped by category with subtotals */}
      <div className="data-table-wrapper">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-bold">Bảng đối soát chi tiết</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Nhóm theo danh mục · Tổng phụ theo nhóm · Dòng tổng cuối</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1700px]">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-3 font-semibold">STT</th>
                <th className="text-left px-3 py-3 font-semibold">Mã đơn</th>
                <th className="text-left px-3 py-3 font-semibold">Mã AFF</th>
                <th className="text-left px-3 py-3 font-semibold">Affiliate</th>
                <th className="text-left px-3 py-3 font-semibold">Mã SP</th>
                <th className="text-left px-3 py-3 font-semibold">Sản phẩm</th>
                <th className="text-left px-3 py-3 font-semibold">Mã NCC</th>
                <th className="text-left px-3 py-3 font-semibold">Nhà cung cấp</th>
                <th className="text-right px-3 py-3 font-semibold">GMV</th>
                <th className="text-right px-3 py-3 font-semibold">Hoa hồng</th>
                <th className="text-right px-3 py-3 font-semibold">Khấu trừ thuế</th>
                <th className="text-center px-3 py-3 font-semibold">Trạng thái</th>
                <th className="text-left px-3 py-3 font-semibold">Mã thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([cat, rows]) => {
                const subGmv = rows.reduce((s, r) => s + r.orderValue, 0);
                const subCom = rows.filter(r => r.status !== "void").reduce((s, r) => s + r.commissionAmount, 0);
                const subTax = Math.round(subCom * 0.1);
                return (
                  <React.Fragment key={cat}>
                    <tr className="bg-primary/5 border-t border-border">
                      <td colSpan={13} className="px-3 py-2 font-bold text-primary text-xs uppercase tracking-wider">📂 Danh mục: {cat}</td>
                    </tr>
                    {rows.map(c => {
                      stt++;
                      const p = productMap[c.productId];
                      const vendor = p?.vendor ?? "—";
                      const aff = affMap[c.affiliateId];
                      const tax = c.status !== "void" ? Math.round(c.commissionAmount * 0.1) : 0;
                      return (
                        <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                          <td className="px-3 py-2 text-muted-foreground">{stt}</td>
                          <td className="px-3 py-2 font-mono text-xs">{c.orderCode}</td>
                          <td className="px-3 py-2 font-mono text-xs">{aff?.code}</td>
                          <td className="px-3 py-2">{c.affiliateName}</td>
                          <td className="px-3 py-2 font-mono text-xs">{p?.sku}</td>
                          <td className="px-3 py-2 max-w-[220px] truncate">{c.productName}</td>
                          <td className="px-3 py-2 font-mono text-xs">{p?.id}</td>
                          <td className="px-3 py-2">{vendor}</td>
                          <td className="px-3 py-2 text-right">{formatVND(c.orderValue)}</td>
                          <td className="px-3 py-2 text-right text-primary font-semibold">{c.status === "void" ? "—" : formatVND(c.commissionAmount)}</td>
                          <td className="px-3 py-2 text-right text-warning">{tax > 0 ? `-${formatVND(tax)}` : "—"}</td>
                          <td className="px-3 py-2 text-center text-xs">
                            {c.status === "void" ? <span className="text-destructive">Hoàn trả</span> : c.status === "paid" ? <span className="text-success">Đã TT</span> : <span className="text-muted-foreground">{c.status}</span>}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">{convToPayout[c.id] ?? "—"}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-muted/40 border-t border-border font-semibold text-xs">
                      <td colSpan={8} className="px-3 py-2 text-right">Tổng nhóm "{cat}":</td>
                      <td className="px-3 py-2 text-right">{formatVND(subGmv)}</td>
                      <td className="px-3 py-2 text-right text-primary">{formatVND(subCom)}</td>
                      <td className="px-3 py-2 text-right text-warning">-{formatVND(subTax)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </React.Fragment>
                );
              })}
              {/* Grand total */}
              <tr className="bg-primary/10 border-t-2 border-primary font-bold">
                <td colSpan={8} className="px-3 py-3 text-right uppercase">TỔNG CUỐI ({totalOrders} đơn · {refundOrders} hoàn)</td>
                <td className="px-3 py-3 text-right">{formatVND(gmv)}</td>
                <td className="px-3 py-3 text-right text-primary">{formatVND(validCommission)}</td>
                <td className="px-3 py-3 text-right text-warning">-{formatVND(taxDeducted)}</td>
                <td colSpan={2} className="px-3 py-3 text-right text-success">Net: {formatVND(validCommission - taxDeducted)}</td>
              </tr>
              {filtered.length === 0 && (
                <tr><td colSpan={13} className="text-center py-10 text-muted-foreground">Không có dữ liệu trong khoảng lọc</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Reports;
