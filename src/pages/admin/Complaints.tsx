import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { X, MessageSquareWarning, Send, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";


type ComplaintStatus = "open" | "processing" | "resolved" | "rejected";
type ComplaintCategory = "Hoa hồng" | "Đơn chuyển đổi" | "Rút tiền" | "Liên kết" | "Khác";
type Priority = "low" | "medium" | "high";

interface Reply {
  id: string; author: string; role: "Affiliate" | "Admin"; message: string; at: string;
}
interface Complaint {
  id: string; code: string; affiliateId: string; affiliateName: string;
  category: ComplaintCategory; priority: Priority; subject: string; description: string;
  refOrder?: string; status: ComplaintStatus; assignee?: string;
  createdAt: string; updatedAt: string; replies: Reply[];
}

const STATUS_META: Record<ComplaintStatus, { label: string; cls: string }> = {
  open:       { label: "Mới gửi",     cls: "bg-info/10 text-info" },
  processing: { label: "Đang xử lý",  cls: "bg-warning/10 text-warning" },
  resolved:   { label: "Đã xử lý",    cls: "bg-success/10 text-success" },
  rejected:   { label: "Từ chối",     cls: "bg-destructive/10 text-destructive" },
};
const PRIORITY_META: Record<Priority, { label: string; cls: string }> = {
  high:   { label: "Cao",       cls: "bg-destructive/10 text-destructive" },
  medium: { label: "Trung bình", cls: "bg-warning/10 text-warning" },
  low:    { label: "Thấp",      cls: "bg-muted text-muted-foreground" },
};

const INITIAL: Complaint[] = [
  { id: "C001", code: "KN-2026-0012", affiliateId: "AF001", affiliateName: "Nguyễn Thuỳ Linh",
    category: "Hoa hồng", priority: "high", subject: "Đơn ORD-202604-1188 không tính hoa hồng",
    description: "Khách đã thanh toán thành công ngày 28/04 nhưng đơn không hiện trong lịch sử chuyển đổi.",
    refOrder: "ORD-202604-1188", status: "processing", assignee: "Admin Hà",
    createdAt: "2026-04-29", updatedAt: "2026-04-30",
    replies: [{ id: "R1", author: "Admin Hà", role: "Admin", message: "Đã ghi nhận, đang đối chiếu log click.", at: "2026-04-30 09:22" }] },
  { id: "C002", code: "KN-2026-0011", affiliateId: "AF002", affiliateName: "Digital Growth Media",
    category: "Rút tiền", priority: "medium", subject: "PAY-202604-008 sai số tài khoản",
    description: "Tiền đã chuyển nhầm số TK cũ, yêu cầu hỗ trợ tra soát.",
    refOrder: "PAY-202604-008", status: "open",
    createdAt: "2026-04-30", updatedAt: "2026-04-30", replies: [] },
  { id: "C003", code: "KN-2026-0010", affiliateId: "AF005", affiliateName: "LeadMax Marketing",
    category: "Đơn chuyển đổi", priority: "low", subject: "Đơn HRM-STD bị void không rõ lý do",
    description: "Đơn ORD-202604-0921 chuyển trạng thái void mà không có thông báo.",
    refOrder: "ORD-202604-0921", status: "open",
    createdAt: "2026-04-29", updatedAt: "2026-04-29", replies: [] },
  { id: "C004", code: "KN-2026-0009", affiliateId: "AF001", affiliateName: "Nguyễn Thuỳ Linh",
    category: "Rút tiền", priority: "medium", subject: "Yêu cầu rút PAY-202604-003 chậm SLA",
    description: "Đã duyệt 03/04 nhưng đến 05/04 chưa có tiền vào tài khoản.",
    refOrder: "PAY-202604-003", status: "resolved", assignee: "Admin Long",
    createdAt: "2026-04-05", updatedAt: "2026-04-06",
    replies: [{ id: "R1", author: "Admin Long", role: "Admin", message: "Đã chuyển khoản 06/04 — UTR 8821xxxx.", at: "2026-04-06 14:05" }] },
  { id: "C005", code: "KN-2026-0004", affiliateId: "AF005", affiliateName: "LeadMax Marketing",
    category: "Liên kết", priority: "low", subject: "Deep link DL003 báo lỗi 404",
    description: "Khi share link CRM-PRO trên TikTok, click vào báo trang không tồn tại.",
    status: "rejected", assignee: "Admin Hà",
    createdAt: "2026-03-22", updatedAt: "2026-03-24",
    replies: [{ id: "R1", author: "Admin Hà", role: "Admin", message: "Đã kiểm tra link bình thường, do CDN cache TikTok.", at: "2026-03-24 10:11" }] },
];

const AdminComplaints = () => {
  const [list, setList] = useState<Complaint[]>(INITIAL);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ComplaintStatus>("all");
  const [filterCategory, setFilterCategory] = useState<"all" | ComplaintCategory>("all");
  const [search, setSearch] = useState("");

  const detail = list.find(c => c.id === openId);

  const filtered = list.filter(c =>
    (filterStatus === "all" || c.status === filterStatus) &&
    (filterCategory === "all" || c.category === filterCategory) &&
    (!search || c.code.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase()) || c.affiliateName.toLowerCase().includes(search.toLowerCase()))
  );

  const sendReply = () => {
    if (!detail || !reply.trim()) return;
    const r: Reply = { id: `R${detail.replies.length + 1}`, author: "Admin Hà", role: "Admin", message: reply,
      at: new Date().toISOString().slice(0, 16).replace("T", " ") };
    setList(list.map(c => c.id === detail.id ? { ...c, replies: [...c.replies, r], status: c.status === "open" ? "processing" : c.status, assignee: c.assignee || "Admin Hà", updatedAt: new Date().toISOString().slice(0, 10) } : c));
    setReply("");
    toast.success("Đã gửi phản hồi cho affiliate");
  };

  const setStatus = (st: ComplaintStatus) => {
    if (!detail) return;
    setList(list.map(c => c.id === detail.id ? { ...c, status: st, updatedAt: new Date().toISOString().slice(0, 10) } : c));
    toast.success(`Đã chuyển trạng thái: ${STATUS_META[st].label}`);
  };

  const counts = {
    open: list.filter(c => c.status === "open").length,
    processing: list.filter(c => c.status === "processing").length,
    resolved: list.filter(c => c.status === "resolved").length,
    rejected: list.filter(c => c.status === "rejected").length,
  };

  return (
    <>
      <PageHeader
        title="Xử lý khiếu nại"
        subtitle="Tiếp nhận, phân loại và xử lý khiếu nại từ Affiliate"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-muted-foreground">Mới gửi</div><div className="text-2xl font-display font-bold text-info mt-1">{counts.open}</div></div>
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-muted-foreground">Đang xử lý</div><div className="text-2xl font-display font-bold text-warning mt-1">{counts.processing}</div></div>
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-muted-foreground">Đã xử lý</div><div className="text-2xl font-display font-bold text-success mt-1">{counts.resolved}</div></div>
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-muted-foreground">Từ chối</div><div className="text-2xl font-display font-bold text-destructive mt-1">{counts.rejected}</div></div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3 shadow-soft">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã KN, tiêu đề, affiliate..."
            className="w-full pl-9 pr-3 py-2 bg-muted/40 rounded-md text-sm border border-transparent focus:border-primary outline-none" />
        </div>
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="all">Mọi trạng thái</option>
          <option value="open">Mới gửi</option>
          <option value="processing">Đang xử lý</option>
          <option value="resolved">Đã xử lý</option>
          <option value="rejected">Từ chối</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as any)}
          className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="all">Mọi loại</option>
          <option>Hoa hồng</option>
          <option>Đơn chuyển đổi</option>
          <option>Rút tiền</option>
          <option>Liên kết</option>
          <option>Khác</option>
        </select>
      </div>

      <div className="data-table-wrapper">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Mã KN</th>
              <th className="text-left px-5 py-3 font-semibold">Affiliate</th>
              <th className="text-left px-5 py-3 font-semibold">Loại</th>
              <th className="text-left px-5 py-3 font-semibold">Tiêu đề</th>
              <th className="text-center px-5 py-3 font-semibold">Mức độ</th>
              <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
              <th className="text-left px-5 py-3 font-semibold">Phụ trách</th>
              <th className="text-left px-5 py-3 font-semibold">Cập nhật</th>
              <th className="text-center px-5 py-3 font-semibold sticky-action">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{c.code}</td>
                <td className="px-5 py-3 text-xs font-medium">{c.affiliateName}</td>
                <td className="px-5 py-3 text-xs">{c.category}</td>
                <td className="px-5 py-3 max-w-[280px] truncate font-medium">{c.subject}</td>
                <td className="px-5 py-3 text-center"><span className={cn("px-2 py-0.5 rounded text-xs font-semibold", PRIORITY_META[c.priority].cls)}>{PRIORITY_META[c.priority].label}</span></td>
                <td className="px-5 py-3 text-center"><span className={cn("px-2 py-0.5 rounded text-xs font-semibold", STATUS_META[c.status].cls)}>{STATUS_META[c.status].label}</span></td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{c.assignee || "—"}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(c.updatedAt)}</td>
                <td className="px-5 py-3 sticky-action text-center">
                  <button onClick={() => setOpenId(c.id)} className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">Xử lý</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-muted-foreground">Không có khiếu nại phù hợp</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail / handle modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setOpenId(null)}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-3xl border border-border max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h3 className="font-display font-bold flex items-center gap-2"><MessageSquareWarning className="w-4 h-4 text-primary" /> {detail.subject}</h3>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">{detail.code} · {detail.category} · {detail.affiliateName}</div>
              </div>
              <button onClick={() => setOpenId(null)} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Trạng thái</div><div className="mt-1"><span className={cn("px-2 py-0.5 rounded text-xs font-semibold", STATUS_META[detail.status].cls)}>{STATUS_META[detail.status].label}</span></div></div>
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Mức độ</div><div className="mt-1"><span className={cn("px-2 py-0.5 rounded text-xs font-semibold", PRIORITY_META[detail.priority].cls)}>{PRIORITY_META[detail.priority].label}</span></div></div>
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Phụ trách</div><div className="font-semibold mt-1">{detail.assignee || "Chưa gán"}</div></div>
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Tham chiếu</div><div className="font-mono text-xs mt-1">{detail.refOrder || "—"}</div></div>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 text-sm">
                <div className="text-xs text-muted-foreground mb-1">Mô tả từ affiliate ({formatDate(detail.createdAt)})</div>
                {detail.description}
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lịch sử trao đổi ({detail.replies.length})</div>
                {detail.replies.length === 0 && <div className="text-xs text-muted-foreground italic">Chưa có phản hồi.</div>}
                {detail.replies.map(r => (
                  <div key={r.id} className={cn("rounded-lg p-3 text-sm", r.role === "Admin" ? "bg-info/5 border border-info/20" : "bg-primary/5 border border-primary/20 ml-6")}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold">{r.author} <span className="text-muted-foreground font-normal">· {r.role}</span></div>
                      <div className="text-[11px] text-muted-foreground">{r.at}</div>
                    </div>
                    <div>{r.message}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-xs font-semibold mb-1.5">Phản hồi gửi affiliate</div>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
                  placeholder="Nhập phản hồi..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
              </div>
            </div>
            <div className="p-5 border-t border-border flex flex-wrap justify-end gap-2 sticky bottom-0 bg-card">
              <button onClick={() => setStatus("rejected")} className="px-3 py-2 text-sm font-semibold border border-destructive/40 text-destructive hover:bg-destructive/10 rounded-md">Từ chối</button>
              <button onClick={() => setStatus("processing")} className="px-3 py-2 text-sm font-semibold border border-warning/40 text-warning hover:bg-warning/10 rounded-md">Đang xử lý</button>
              <button onClick={() => setStatus("resolved")} className="px-3 py-2 text-sm font-semibold border border-success/40 text-success hover:bg-success/10 rounded-md">Đánh dấu đã xử lý</button>
              <button onClick={sendReply} className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md flex items-center gap-2">
                <Send className="w-4 h-4" /> Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminComplaints;
