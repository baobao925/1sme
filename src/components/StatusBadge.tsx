import { cn } from "@/lib/utils";

export type StatusType =
  | "draft" | "pending" | "active" | "rejected" | "hold"
  | "approved" | "void" | "paid" | "failed" | "processing";

const STATUS_CONFIG: Record<StatusType, { label: string; bg: string; text: string; dot: string }> = {
  draft:      { label: "Nháp",        bg: "bg-status-draft/10",      text: "text-status-draft",      dot: "bg-status-draft" },
  pending:    { label: "Chờ duyệt",   bg: "bg-status-pending/10",    text: "text-status-pending",    dot: "bg-status-pending" },
  active:     { label: "Hoạt động",   bg: "bg-status-active/10",     text: "text-status-active",     dot: "bg-status-active" },
  rejected:   { label: "Từ chối",     bg: "bg-status-rejected/10",   text: "text-status-rejected",   dot: "bg-status-rejected" },
  hold:       { label: "Tạm giữ",     bg: "bg-status-hold/10",       text: "text-status-hold",       dot: "bg-status-hold" },
  approved:   { label: "Đã duyệt",    bg: "bg-status-approved/10",   text: "text-status-approved",   dot: "bg-status-approved" },
  void:       { label: "Đã hủy",      bg: "bg-status-void/10",       text: "text-status-void",       dot: "bg-status-void" },
  paid:       { label: "Đã thanh toán", bg: "bg-status-paid/10",     text: "text-status-paid",       dot: "bg-status-paid" },
  failed:     { label: "Thất bại",    bg: "bg-status-failed/10",     text: "text-status-failed",     dot: "bg-status-failed" },
  processing: { label: "Đang xử lý",  bg: "bg-status-processing/10", text: "text-status-processing", dot: "bg-status-processing" },
};

interface Props {
  status: StatusType;
  label?: string;
  className?: string;
}

export const StatusBadge = ({ status, label, className }: Props) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-transparent",
        cfg.bg, cfg.text, className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {label || cfg.label}
    </span>
  );
};
