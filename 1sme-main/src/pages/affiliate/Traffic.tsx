import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { MousePointerClick, TrendingUp, Download } from "lucide-react";
import { clickChartData, sourceBreakdown, deepLinks, currentAffiliate } from "@/lib/mock-data";
import { formatNumber, formatPercent } from "@/lib/format";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["hsl(199 89% 35%)", "hsl(18 95% 58%)", "hsl(152 65% 38%)", "hsl(212 95% 50%)", "hsl(270 60% 55%)", "hsl(220 10% 50%)"];

const Traffic = () => {
  const myLinks = deepLinks.filter(d => d.affiliateId === currentAffiliate.id);
  const totalClicks = myLinks.reduce((s, d) => s + d.clicks, 0);
  const totalConv = myLinks.reduce((s, d) => s + d.conversions, 0);
  const cr = totalClicks > 0 ? (totalConv / totalClicks) * 100 : 0;

  return (
    <>
      <PageHeader
        title="Báo cáo lưu lượng & click"
        subtitle="Phân tích hiệu suất liên kết, nguồn lưu lượng và chuyển đổi"
        actions={
          <>
            <select className="px-3 py-2 text-sm bg-background border border-border rounded-md">
              <option>14 ngày qua</option><option>30 ngày qua</option><option>Tháng này</option><option>Tuỳ chỉnh</option>
            </select>
            <button onClick={() => toast.success("Đã xuất CSV (mock)")}
              className="px-4 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-2">
              <Download className="w-4 h-4" /> Xuất CSV
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <KpiCard label="Tổng lượt click" value={formatNumber(totalClicks)} icon={MousePointerClick} accent="primary" trend={{ value: 18 }} />
        <KpiCard label="Đơn chuyển đổi" value={formatNumber(totalConv)} icon={TrendingUp} accent="success" trend={{ value: 9 }} />
        <KpiCard label="Tỉ lệ chuyển đổi" value={formatPercent(cr)} icon={TrendingUp} accent="accent" trend={{ value: 3 }} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-soft">
          <h3 className="font-display font-bold mb-4">Click & Đơn chuyển đổi theo ngày</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={clickChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis yAxisId="l" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis yAxisId="r" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area yAxisId="l" type="monotone" dataKey="clicks" name="Lượt click" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
              <Area yAxisId="r" type="monotone" dataKey="conversions" name="Chuyển đổi" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
          <h3 className="font-display font-bold mb-4">Nguồn lưu lượng</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={sourceBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {sourceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {sourceBreakdown.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="ml-auto font-semibold">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top quốc gia */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-soft mb-5">
        <h3 className="font-display font-bold mb-4">Top quốc gia</h3>
        <div className="space-y-3 max-w-2xl">
          {[
            { c: "🇻🇳 Việt Nam", v: 86 },
            { c: "🇸🇬 Singapore", v: 7 },
            { c: "🇺🇸 United States", v: 4 },
            { c: "🇹🇭 Thailand", v: 3 },
          ].map(c => (
            <div key={c.c}>
              <div className="flex justify-between text-sm mb-1">
                <span>{c.c}</span><span className="font-semibold">{c.v}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${c.v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail table per deep link */}
      <div className="data-table-wrapper mb-5">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-bold">Chi tiết click theo Liên kết</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Sản phẩm</th>
              <th className="text-right px-5 py-3 font-semibold">Lượt click</th>
              <th className="text-right px-5 py-3 font-semibold">Đơn CĐ</th>
              <th className="text-right px-5 py-3 font-semibold">Tỉ lệ CĐ</th>
            </tr>
          </thead>
          <tbody>
            {myLinks.map(dl => (
              <tr key={dl.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 max-w-[260px] truncate font-medium">{dl.productName}</td>
                <td className="px-5 py-3 text-right">{formatNumber(dl.clicks)}</td>
                <td className="px-5 py-3 text-right font-semibold">{dl.conversions}</td>
                <td className="px-5 py-3 text-right">{formatPercent((dl.conversions/dl.clicks)*100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Traffic;
