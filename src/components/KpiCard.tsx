import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: number; positive?: boolean };
  accent?: "primary" | "success" | "warning" | "info" | "accent";
}

const ACCENT: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  accent: "bg-accent/10 text-accent",
};

export const KpiCard = ({ label, value, hint, icon: Icon, trend, accent = "primary" }: Props) => (
  <div className="kpi-card h-full">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide leading-snug break-words">{label}</div>
        <div className="mt-2 text-2xl font-bold font-display text-foreground break-words leading-tight">{value}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground break-words">{hint}</div>}
        {trend && (
          <div className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs font-semibold",
            trend.positive !== false ? "text-success" : "text-destructive"
          )}>
            {trend.positive !== false ? "▲" : "▼"} {Math.abs(trend.value)}%
            <span className="text-muted-foreground font-normal">vs kỳ trước</span>
          </div>
        )}
      </div>
      {Icon && (
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", ACCENT[accent])}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  </div>
);
