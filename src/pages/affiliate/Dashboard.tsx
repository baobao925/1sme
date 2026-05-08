import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { MousePointerClick, ShoppingCart, Coins, DollarSign, Copy, Calendar } from "lucide-react";
import { formatVND, formatNumber, formatDate, formatPercent } from "@/lib/format";
import { conversions, deepLinks, clickChartData, currentAffiliate, products, buildDeepLink } from "@/lib/mock-data";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

type RangeKey = "7d" | "14d" | "30d" | "90d";
const RANGE_LABEL: Record<RangeKey, string> = { "7d": "7 ngày", "14d": "14 ngày", "30d": "30 ngày", "90d": "90 ngày" };
const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "14d": 14, "30d": 30, "90d": 90 };

const AffiliateDashboard = () => {
  const [range, setRange] = useState<RangeKey>("14d");
  const myConversions = conversions.filter(c => c.affiliateId === currentAffiliate.id);
  const myLinks = deepLinks.filter(d => d.affiliateId === currentAffiliate.id);

  // Cắt chart theo khoảng thời gian
  const filteredChart = useMemo(() => clickChartData.slice(-RANGE_DAYS[range]), [range]);
  const totalClicks = filteredChart.reduce((s, d) => s + d.clicks, 0);
  const totalOrdersFromChart = filteredChart.reduce((s, d) => s + d.conversions, 0);
  const totalOrders = myConversions.length;
  const estCommission = myConversions
    .filter(c => c.status === "pending" || c.status === "hold" || c.status === "approved")
    .reduce((s, c) => s + c.commissionAmount, 0);
  const totalGmv = myConversions.reduce((s, c) => s + c.orderValue, 0);

  const daily = filteredChart.map((d) => {
    const orders = d.conversions;
    const avgValue = 3_500_000;
    const gmv = orders * avgValue;
    const commission = Math.round(gmv * 0.07);
    return { date: d.date, clicks: d.clicks, orders, commission, gmv };
  });

  // Group conversions theo sản phẩm + tính tỷ lệ chuyển đổi từ deepLinks tương ứng
  const productAgg: Record<string, { productId: string; productName: string; orders: number; commission: number; clicks: number }> = {};
  myConversions.forEach(c => {
    if (!productAgg[c.productId]) {
      const links = myLinks.filter(l => l.productId === c.productId);
      const clicks = links.reduce((s, l) => s + l.clicks, 0);
      productAgg[c.productId] = { productId: c.productId, productName: c.productName, orders: 0, commission: 0, clicks };
    }
    productAgg[c.productId].orders += 1;
    productAgg[c.productId].commission += c.commissionAmount;
  });
  const recentProducts = Object.values(productAgg).slice(0, 5);

  const copyLink = (productId: string) => {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    const url = buildDeepLink(p.sku, currentAffiliate.code, p.id);
    navigator.clipboard.writeText(url);
    toast.success("Đã copy deep link");
  };

  return (
    <>
      <PageHeader
        title={`Xin chào, ${currentAffiliate.name} 👋`}
        subtitle={`AFF ID: ${currentAffiliate.code} · ${currentAffiliate.kind} · ${currentAffiliate.tag} · Tham gia ${formatDate(currentAffiliate.joinedAt)}`}
        actions={
          <div className="flex items-center gap-1 bg-card border border-border rounded-md p-1">
            <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
            {(Object.keys(RANGE_LABEL) as RangeKey[]).map(k => (
              <button key={k} onClick={() => setRange(k)}
                className={cn("px-3 py-1.5 text-xs font-semibold rounded transition-colors",
                  range === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                {RANGE_LABEL[k]}
              </button>
            ))}
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label={`Tổng số lượt click (${RANGE_LABEL[range]})`} value={formatNumber(totalClicks)} icon={MousePointerClick} accent="info" trend={{ value: 8 }} />
        <KpiCard label="Số đơn hàng" value={formatNumber(totalOrders)} icon={ShoppingCart} accent="primary" trend={{ value: 12 }} />
        <KpiCard label="Hoa hồng ước tính" value={formatVND(estCommission)} icon={Coins} accent="warning" />
        <KpiCard label="Giá trị đơn hàng" value={formatVND(totalGmv)} icon={DollarSign} accent="success" trend={{ value: 24 }} />
      </div>

      {/* Click chart - full width (đã bỏ Hành động nhanh) */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-soft mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-foreground">Lượt click {RANGE_LABEL[range]} qua</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Tổng hợp tất cả liên kết của bạn · {totalOrdersFromChart} đơn ghi nhận</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={filteredChart}>
            <defs>
              <linearGradient id="colorClick" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorClick)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bảng hiệu suất hằng ngày */}
      <div className="data-table-wrapper mb-6">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-bold">Hiệu suất hằng ngày</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{RANGE_LABEL[range]} gần nhất · Tổng hợp tất cả liên kết</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Ngày</th>
                <th className="text-right px-5 py-3 font-semibold">Tổng lượt click</th>
                <th className="text-right px-5 py-3 font-semibold">Số đơn hàng</th>
                <th className="text-right px-5 py-3 font-semibold">Hoa hồng ước tính</th>
                <th className="text-right px-5 py-3 font-semibold">Giá trị đơn hàng</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.date} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium">{d.date}</td>
                  <td className="px-5 py-3 text-right">{formatNumber(d.clicks)}</td>
                  <td className="px-5 py-3 text-right">{d.orders}</td>
                  <td className="px-5 py-3 text-right font-semibold text-primary">{formatVND(d.commission)}</td>
                  <td className="px-5 py-3 text-right">{formatVND(d.gmv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion gần đây - theo sản phẩm + tỷ lệ CĐ */}
      <div className="data-table-wrapper">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-display font-bold">Đơn chuyển đổi gần đây</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Tổng hợp theo sản phẩm</p>
          </div>
          <Link to="/affiliate/conversions" className="text-sm text-primary font-semibold hover:underline">Xem tất cả →</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Sản phẩm</th>
              <th className="text-right px-5 py-3 font-semibold">Lượt click</th>
              <th className="text-right px-5 py-3 font-semibold">Số lượng đơn</th>
              <th className="text-right px-5 py-3 font-semibold">Tỷ lệ chuyển đổi</th>
              <th className="text-right px-5 py-3 font-semibold">Hoa hồng</th>
              <th className="text-center px-5 py-3 font-semibold sticky-action">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {recentProducts.map((p) => {
              const cr = p.clicks > 0 ? (p.orders / p.clicks) * 100 : 0;
              return (
                <tr key={p.productId} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 max-w-[300px] truncate font-medium">{p.productName}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{formatNumber(p.clicks)}</td>
                  <td className="px-5 py-3 text-right">{p.orders}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-bold",
                      cr >= 1 ? "bg-success/10 text-success" : cr >= 0.5 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground")}>
                      {formatPercent(cr)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-primary">{formatVND(p.commission)}</td>
                  <td className="px-5 py-3 text-center sticky-action">
                    <button onClick={() => copyLink(p.productId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded-md">
                      <Copy className="w-3.5 h-3.5" /> Lấy link
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AffiliateDashboard;
