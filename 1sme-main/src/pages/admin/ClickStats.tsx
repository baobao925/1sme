import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { affiliates, deepLinks, conversions, clickChartData } from "@/lib/mock-data";
import { formatNumber, formatVND, formatPercent } from "@/lib/format";
import { MousePointerClick, ShoppingCart, Coins, TrendingUp, Calendar } from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { cn } from "@/lib/utils";

type RangeKey = "7d" | "14d" | "30d" | "90d";
const RANGE_LABEL: Record<RangeKey, string> = { "7d": "7 ngày", "14d": "14 ngày", "30d": "30 ngày", "90d": "90 ngày" };
const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "14d": 14, "30d": 30, "90d": 90 };

const ClickStats = () => {
  const [range, setRange] = useState<RangeKey>("14d");
  const [affFilter, setAffFilter] = useState("all");

  const chart = clickChartData.slice(-RANGE_DAYS[range]);
  const totalClicks = chart.reduce((s, d) => s + d.clicks, 0);
  const totalConv = conversions.length;
  const totalCommission = conversions.reduce((s, c) => s + c.commissionAmount, 0);
  const cr = totalClicks > 0 ? (totalConv / totalClicks) * 100 : 0;

  // By affiliate aggregation
  const byAff = affiliates
    .filter(a => a.totalCommission > 0 && (affFilter === "all" || a.id === affFilter))
    .map(a => {
      const links = deepLinks.filter(d => d.affiliateId === a.id);
      const clicks = links.reduce((s, l) => s + l.clicks, 0);
      const convs = conversions.filter(c => c.affiliateId === a.id).length;
      const commission = conversions.filter(c => c.affiliateId === a.id).reduce((s, c) => s + c.commissionAmount, 0);
      const crVal = clicks > 0 ? (convs / clicks) * 100 : 0;
      return { ...a, clicks, convs, commission, cr: crVal };
    });

  return (
    <>
      <PageHeader
        title="Thống kê lưu lượng & chuyển đổi"
        subtitle="Click → Chuyển đổi đơn → Hoa hồng theo từng Affiliate"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Tổng lượt click" value={formatNumber(totalClicks)} icon={MousePointerClick} accent="info" />
        <KpiCard label="Đơn chuyển đổi" value={formatNumber(totalConv)} icon={ShoppingCart} accent="primary" />
        <KpiCard label="Tỷ lệ chuyển đổi" value={formatPercent(cr)} icon={TrendingUp} accent="success" />
        <KpiCard label="Tổng hoa hồng" value={formatVND(totalCommission)} icon={Coins} accent="warning" />
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-soft mb-6">
        <h3 className="font-display font-bold mb-4">Lượt click {RANGE_LABEL[range]} qua</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chart}>
            <defs>
              <linearGradient id="cs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#cs)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="data-table-wrapper">
        <div className="p-5 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-display font-bold">Theo Affiliate</h3>
          <select value={affFilter} onChange={e => setAffFilter(e.target.value)}
            className="px-3 py-1.5 text-sm bg-background border border-border rounded-md">
            <option value="all">Tất cả Affiliate</option>
            {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Affiliate</th>
              <th className="text-left px-5 py-3 font-semibold">Loại</th>
              <th className="text-right px-5 py-3 font-semibold">Lượt click</th>
              <th className="text-right px-5 py-3 font-semibold">Chuyển đổi đơn</th>
              <th className="text-right px-5 py-3 font-semibold">Tỷ lệ CR</th>
              <th className="text-right px-5 py-3 font-semibold">Hoa hồng</th>
            </tr>
          </thead>
          <tbody>
            {byAff.map(a => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-semibold">{a.name}<div className="text-xs text-muted-foreground font-mono">{a.code}</div></td>
                <td className="px-5 py-3 text-xs"><span className="px-2 py-0.5 bg-secondary rounded">{a.kind}</span></td>
                <td className="px-5 py-3 text-right">{formatNumber(a.clicks)}</td>
                <td className="px-5 py-3 text-right">{a.convs}</td>
                <td className="px-5 py-3 text-right">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-bold",
                    a.cr >= 1 ? "bg-success/10 text-success" : a.cr >= 0.5 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground")}>
                    {formatPercent(a.cr)}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-semibold text-primary">{formatVND(a.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ClickStats;
