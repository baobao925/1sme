import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, MousePointerClick, ShoppingCart, Coins, Wallet } from "lucide-react";
import { affiliates, conversions, deepLinks, payoutRequests, revenueChartData } from "@/lib/mock-data";
import { formatVND, formatNumber } from "@/lib/format";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const AdminDashboard = () => {
  const totalAff = affiliates.length;
  const pendingAff = affiliates.filter(a => a.status === "pending").length;
  const totalClicks = deepLinks.reduce((s, d) => s + d.clicks, 0);
  const totalConv = conversions.length;
  const totalGMV = conversions.reduce((s, c) => s + c.orderValue, 0);
  const totalCommission = conversions.reduce((s, c) => s + c.commissionAmount, 0);
  const pendingComm = conversions.filter(c => c.status === "pending").reduce((s, c) => s + c.commissionAmount, 0);
  const pendingPayout = payoutRequests.filter(p => p.status === "pending").length;

  return (
    <>
      <PageHeader
        title="Tổng quan vận hành"
        subtitle="Tổng quan vận hành chương trình Affiliate 1SME"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        <KpiCard label="Affiliate" value={totalAff} icon={Users} accent="primary" hint={`${pendingAff} chờ duyệt`} />
        <KpiCard label="Tổng lượt click" value={formatNumber(totalClicks)} icon={MousePointerClick} accent="info" trend={{ value: 14 }} />
        <KpiCard label="Đơn chuyển đổi" value={totalConv} icon={ShoppingCart} accent="success" trend={{ value: 9 }} />
        <KpiCard label="Doanh thu" value={formatVND(totalGMV)} icon={Coins} accent="accent" trend={{ value: 22 }} />
        <KpiCard label="Hoa hồng" value={formatVND(totalCommission)} icon={Wallet} accent="warning" />
      </div>

      {/* Charts + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-soft">
          <h3 className="font-display font-bold mb-4">Hoa hồng & Thanh toán 6 tháng</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${v/1_000_000}tr`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => formatVND(v)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="commission" name="Hoa hồng" fill="hsl(var(--primary))" radius={[6,6,0,0]} />
              <Bar dataKey="payout" name="Đã thanh toán" fill="hsl(var(--accent))" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
          <h3 className="font-display font-bold mb-4">Cần xử lý</h3>
          <div className="space-y-3">
            <ActionItem to="/admin/affiliates" label="Hồ sơ chờ duyệt" count={pendingAff} accent="warning" />
            <ActionItem to="/admin/commission-config" label="Cấu hình hoa hồng chờ duyệt" count={2} accent="primary" />
            <ActionItem to="/admin/payouts" label="Yêu cầu rút tiền chờ" count={pendingPayout} accent="info" />
            <ActionItem to="/admin/complaints" label="Khiếu nại cần xử lý" count={3} accent="warning" />
          </div>
        </div>
      </div>

      {/* Top performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="data-table-wrapper">
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-bold">Top Affiliate theo doanh thu</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Affiliate</th>
                <th className="text-left px-5 py-3 font-semibold">Loại</th>
                <th className="text-right px-5 py-3 font-semibold">Hoa hồng tích luỹ</th>
                <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {[...affiliates].sort((a,b)=>b.totalCommission-a.totalCommission).slice(0,5).map(a => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 font-semibold">{a.name}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{a.kind} · {a.tag}</td>
                  <td className="px-5 py-3 text-right font-bold text-primary">{formatVND(a.totalCommission)}</td>
                  <td className="px-5 py-3 text-center"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="data-table-wrapper">
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-bold">Đơn chuyển đổi mới nhất</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Mã đơn</th>
                <th className="text-left px-5 py-3 font-semibold">Affiliate</th>
                <th className="text-right px-5 py-3 font-semibold">Hoa hồng</th>
                <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {conversions.slice(0,5).map(c => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs">{c.orderCode}</td>
                  <td className="px-5 py-3 truncate max-w-[160px]">{c.affiliateName}</td>
                  <td className="px-5 py-3 text-right font-semibold text-primary">{formatVND(c.commissionAmount)}</td>
                  <td className="px-5 py-3 text-center"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const ActionItem = ({ to, label, count, accent }: any) => {
  const colors: Record<string, string> = {
    warning: "bg-warning/10 text-warning",
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <Link to={to} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
      <span className="text-sm font-medium">{label}</span>
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors[accent]}`}>{count}</span>
    </Link>
  );
};

export default AdminDashboard;
