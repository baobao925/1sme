import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Plus, X, MessageSquareWarning, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ComplaintStatus = "open" | "processing" | "resolved" | "rejected";
type ComplaintCategory = "Hoa hồng" | "Đơn chuyển đổi" | "Rút tiền" | "Liên kết" | "Khác";

interface Reply {
  id: string;
  author: string;
  role: "Affiliate" | "Admin";
  message: string;
  at: string;
}
interface Complaint {
  id: string;
  code: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  refOrder?: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
}

const STATUS_META: Record<ComplaintStatus, { label: string; cls: string }> = {
  open:       { label: "Mới gửi",     cls: "bg-info/10 text-info" },
  processing: { label: "Đang xử lý",  cls: "bg-warning/10 text-warning" },
  resolved:   { label: "Đã xử lý",    cls: "bg-success/10 text-success" },
  rejected:   { label: "Từ chối",     cls: "bg-destructive/10 text-destructive" },
};

const INITIAL: Complaint[] = [
  { id: "C001", code: "KN-2026-0012", category: "Hoa hồng", subject: "Đơn ORD-202604-1188 không tính hoa hồng",
    description: "Khách đã thanh toán thành công ngày 28/04 nhưng đơn không hiện trong lịch sử chuyển đổi của tôi.",
    refOrder: "ORD-202604-1188", status: "processing", createdAt: "2026-04-29", updatedAt: "2026-04-30",
    replies: [
      { id: "R1", author: "Admin Hà", role: "Admin", message: "Cảm ơn bạn đã phản ánh. Bộ phận tài chính đang đối chiếu log click.", at: "2026-04-30 09:22" },
    ]},
  { id: "C002", code: "KN-2026-0009", category: "Rút tiền", subject: "Yêu cầu rút PAY-202604-003 chậm so với SLA",
    description: "Yêu cầu rút tiền đã duyệt 03/04 nhưng đến 05/04 vẫn chưa nhận được tiền vào tài khoản.",
    status: "resolved", createdAt: "2026-04-05", updatedAt: "2026-04-06",
    replies: [
      { id: "R1", author: "Admin Long", role: "Admin", message: "Đã chuyển khoản lúc 06/04 14:00 — UTR 8821xxxx. Bạn vui lòng kiểm tra.", at: "2026-04-06 14:05" },
      { id: "R2", author: "Bạn", role: "Affiliate", message: "Đã nhận đủ, cảm ơn team!", at: "2026-04-06 18:30" },
    ]},
  { id: "C003", code: "KN-2026-0004", category: "Liên kết", subject: "Deep link DL003 báo lỗi 404",
    description: "Khi share link CRM-PRO trên TikTok, người dùng click vào báo trang không tồn tại.",
    status: "rejected", createdAt: "2026-03-22", updatedAt: "2026-03-24",
    replies: [
      { id: "R1", author: "Admin Hà", role: "Admin", message: "Đã kiểm tra link vẫn hoạt động bình thường. Nguyên nhân do CDN cache phía TikTok. Đóng case.", at: "2026-03-24 10:11" },
    ]},
];

const Complaints = () => {
  const [list, setList] = useState<Complaint[]>(INITIAL);
  const [openCreate, setOpenCreate] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [form, setForm] = useState({ category: "Hoa hồng" as ComplaintCategory, subject: "", description: "", refOrder: "" });

  const detail = list.find(c => c.id === openId);

  const submit = () => {
    if (!form.subject.trim() || !form.description.trim()) { toast.error("Vui lòng nhập tiêu đề & mô tả"); return; }
    const id = `C${String(list.length + 1).padStart(3, "0")}`;
    const code = `KN-2026-${String(20 + list.length).padStart(4, "0")}`;
    const today = new Date().toISOString().slice(0, 10);
    setList([{ id, code, category: form.category, subject: form.subject, description: form.description,
      refOrder: form.refOrder || undefined, status: "open", createdAt: today, updatedAt: today, replies: [] }, ...list]);
    setForm({ category: "Hoa hồng", subject: "", description: "", refOrder: "" });
    setOpenCreate(false);
    toast.success(`Đã gửi khiếu nại ${code}`);
  };

  const reply = () => {
    if (!detail || !newReply.trim()) return;
    const r: Reply = { id: `R${detail.replies.length + 1}`, author: "Bạn", role: "Affiliate", message: newReply,
      at: new Date().toISOString().slice(0, 16).replace("T", " ") };
    setList(list.map(c => c.id === detail.id ? { ...c, replies: [...c.replies, r], updatedAt: new Date().toISOString().slice(0, 10) } : c));
    setNewReply("");
    toast.success("Đã gửi phản hồi");
  };

  const counts = {
    open: list.filter(c => c.status === "open").length,
    processing: list.filter(c => c.status === "processing").length,
    resolved: list.filter(c => c.status === "resolved").length,
  };

  return (
    <>
      <PageHeader
        title="Khiếu nại của tôi"
        subtitle="Gửi và theo dõi các yêu cầu hỗ trợ liên quan đến hoa hồng, rút tiền, liên kết..."
        actions={
          <button onClick={() => setOpenCreate(true)}
            className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tạo khiếu nại
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-muted-foreground">Mới gửi</div><div className="text-2xl font-display font-bold text-info mt-1">{counts.open}</div></div>
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-muted-foreground">Đang xử lý</div><div className="text-2xl font-display font-bold text-warning mt-1">{counts.processing}</div></div>
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-muted-foreground">Đã xử lý</div><div className="text-2xl font-display font-bold text-success mt-1">{counts.resolved}</div></div>
      </div>

      <div className="data-table-wrapper">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Mã KN</th>
              <th className="text-left px-5 py-3 font-semibold">Loại</th>
              <th className="text-left px-5 py-3 font-semibold">Tiêu đề</th>
              <th className="text-left px-5 py-3 font-semibold">Tham chiếu</th>
              <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
              <th className="text-left px-5 py-3 font-semibold">Cập nhật</th>
              <th className="text-center px-5 py-3 font-semibold sticky-action">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{c.code}</td>
                <td className="px-5 py-3 text-xs">{c.category}</td>
                <td className="px-5 py-3 max-w-[320px] truncate font-medium">{c.subject}</td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{c.refOrder || "—"}</td>
                <td className="px-5 py-3 text-center">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", STATUS_META[c.status].cls)}>{STATUS_META[c.status].label}</span>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(c.updatedAt)}</td>
                <td className="px-5 py-3 sticky-action text-center">
                  <button onClick={() => setOpenId(c.id)} className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded-md">Xem chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {openCreate && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setOpenCreate(false)}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-lg border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-display font-bold flex items-center gap-2"><MessageSquareWarning className="w-4 h-4 text-primary" /> Tạo khiếu nại mới</h3>
              <button onClick={() => setOpenCreate(false)} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-semibold mb-1.5">Loại khiếu nại <span className="text-destructive">*</span></div>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ComplaintCategory })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm">
                  {(["Hoa hồng", "Đơn chuyển đổi", "Rút tiền", "Liên kết", "Khác"] as ComplaintCategory[]).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1.5">Mã đơn / mã yêu cầu liên quan</div>
                <input value={form.refOrder} onChange={e => setForm({ ...form, refOrder: e.target.value })}
                  placeholder="VD: ORD-202604-1188 hoặc PAY-202604-003"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm font-mono" />
              </div>
              <div>
                <div className="text-xs font-semibold mb-1.5">Tiêu đề <span className="text-destructive">*</span></div>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="Mô tả ngắn vấn đề"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
              </div>
              <div>
                <div className="text-xs font-semibold mb-1.5">Mô tả chi tiết <span className="text-destructive">*</span></div>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
                  placeholder="Cung cấp thông tin càng chi tiết càng tốt: thời gian, hành vi quan sát được, screenshot..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
              </div>
              <button className="text-xs text-primary font-semibold flex items-center gap-1.5 hover:underline">
                <Paperclip className="w-3.5 h-3.5" /> Đính kèm tệp (mock)
              </button>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2">
              <button onClick={() => setOpenCreate(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Huỷ</button>
              <button onClick={submit} className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md flex items-center gap-2">
                <Send className="w-4 h-4" /> Gửi khiếu nại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setOpenId(null)}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-2xl border border-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <div>
                <h3 className="font-display font-bold">{detail.subject}</h3>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">{detail.code} · {detail.category} · Tạo {formatDate(detail.createdAt)}</div>
              </div>
              <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", STATUS_META[detail.status].cls)}>{STATUS_META[detail.status].label}</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-muted/40 rounded-lg p-3 text-sm">{detail.description}</div>
              {detail.refOrder && <div className="text-xs">Tham chiếu: <span className="font-mono text-primary">{detail.refOrder}</span></div>}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trao đổi ({detail.replies.length})</div>
                {detail.replies.length === 0 && <div className="text-xs text-muted-foreground italic">Chưa có phản hồi từ admin.</div>}
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
              {detail.status !== "resolved" && detail.status !== "rejected" && (
                <div>
                  <div className="text-xs font-semibold mb-1.5">Phản hồi của bạn</div>
                  <div className="flex gap-2">
                    <input value={newReply} onChange={e => setNewReply(e.target.value)}
                      placeholder="Nhập phản hồi..."
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm" />
                    <button onClick={reply} className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md flex items-center gap-2">
                      <Send className="w-4 h-4" /> Gửi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Complaints;
