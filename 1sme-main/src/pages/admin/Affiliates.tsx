import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { affiliates } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { Eye, X, Check, Ban, ScrollText } from "lucide-react";
import { toast } from "sonner";

const Affiliates = () => {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [filter, setFilter] = useState({ type: "all", status: "all" });
  const detail = affiliates.find(a => a.id === detailId);

  const filtered = affiliates.filter(a =>
    (filter.type === "all" || a.kind === filter.type) &&
    (filter.status === "all" || a.status === filter.status)
  );

  return (
    <>
      <PageHeader
        title="Xét duyệt hồ sơ Affiliate"
        subtitle="Phê duyệt hoặc từ chối hồ sơ đăng ký mới"
      />

      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex gap-3 flex-wrap shadow-soft">
        <select value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})}
          className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="all">Tất cả loại</option>
          <option value="Cá nhân">Cá nhân</option><option value="Doanh nghiệp">Doanh nghiệp</option>
        </select>
        <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}
          className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option><option value="active">Hoạt động</option><option value="rejected">Từ chối</option>
        </select>
        <input type="date" className="px-3 py-2 bg-background border border-border rounded-md text-sm" />
      </div>

      <div className="data-table-wrapper">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Mã</th>
              <th className="text-left px-5 py-3 font-semibold">Họ tên</th>
              <th className="text-left px-5 py-3 font-semibold">Loại</th>
              <th className="text-left px-5 py-3 font-semibold">Liên hệ</th>
              <th className="text-left px-5 py-3 font-semibold">Ngành hàng</th>
              <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
              <th className="text-left px-5 py-3 font-semibold">Ngày tạo</th>
              <th className="text-center px-5 py-3 font-semibold sticky-action">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{a.code}</td>
                <td className="px-5 py-3 font-semibold">{a.name}</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">{a.kind}</span>
                  <span className="ml-1 px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">{a.tag}</span>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{a.email}<br/>{a.phone}</td>
                <td className="px-5 py-3 text-xs">{a.categories.join(", ")}</td>
                <td className="px-5 py-3 text-center"><StatusBadge status={a.status} /></td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(a.joinedAt)}</td>
                <td className="px-5 py-3 sticky-action">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => setDetailId(a.id)} className="p-1.5 hover:bg-muted rounded text-muted-foreground" title="Chi tiết">
                      <Eye className="w-4 h-4" />
                    </button>
                    {a.status === "pending" && (
                      <>
                        <button onClick={() => toast.success(`Đã phê duyệt ${a.code}`)} className="p-1.5 hover:bg-success/10 hover:text-success rounded text-muted-foreground" title="Phê duyệt">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setRejectId(a.id)} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground" title="Từ chối">
                          <Ban className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={()=>setDetailId(null)}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-3xl border border-border max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <div>
                <h3 className="font-display font-bold text-lg">{detail.name}</h3>
                <div className="text-xs text-muted-foreground mt-0.5">{detail.code} · {detail.kind} · {detail.tag} · <StatusBadge status={detail.status} /></div>
              </div>
              <button onClick={()=>setDetailId(null)} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-5">
              <Section title="Thông tin cá nhân">
                <KV k="Email" v={detail.email} />
                <KV k="SĐT" v={detail.phone} />
                <KV k="Loại Affiliate" v={`${detail.kind} · ${detail.tag}`} />
                <KV k="Địa chỉ" v={detail.contactAddress} />
                <KV k="Ngày tạo" v={formatDate(detail.joinedAt)} />
              </Section>
              <Section title="Kênh truyền thông & ngành hàng">
                <KV k="Kênh" v={detail.channels.join(", ")} />
                <KV k="Ngành hàng" v={detail.categories.join(", ")} />
                {detail.channelLinks?.facebook && <KV k="Facebook" v={detail.channelLinks.facebook} />}
                {detail.channelLinks?.tiktok && <KV k="TikTok" v={detail.channelLinks.tiktok} />}
                {detail.channelLinks?.youtube && <KV k="YouTube" v={detail.channelLinks.youtube} />}
                {detail.channelLinks?.website && <KV k="Website" v={detail.channelLinks.website} />}
              </Section>
              <Section title="Thanh toán">
                <KV k="Người nhận" v={detail.bank.holder} />
                <KV k="Ngân hàng" v={detail.bank.bankName} />
                <KV k="Chi nhánh" v={detail.bank.branch} />
                <KV k="Số TK" v={detail.bank.account} />
              </Section>
              <Section title="Thuế & chứng từ">
                <KV k="Loại giấy tờ" v={detail.tax.idType === "CCCD" ? "CCCD (Cá nhân)" : "GPKD/Giấy CN ĐKDN (Doanh nghiệp)"} />
                <KV k="Số giấy tờ" v={detail.tax.idNumber} />
                <KV k="Mã số thuế" v={detail.tax.taxCode || "—"} />
                <KV k="Cơ quan cấp" v={detail.tax.issuer || "—"} />
                <KV k="Chứng từ" v={detail.tax.idType === "CCCD" ? "✓ CCCD_front.jpg, CCCD_back.jpg" : "✓ GPKD.pdf, ChungNhanThue.pdf"} />
              </Section>
              <div className="bg-muted/40 rounded-lg p-3 text-xs">
              <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                  <ScrollText className="w-3.5 h-3.5" /> Nhật ký kiểm toán
                </div>
                <div>{formatDate(detail.joinedAt)} — Affiliate gửi đăng ký</div>
                {detail.status === "active" && <div>{formatDate(detail.joinedAt)} — admin@b2bmart.vn phê duyệt</div>}
                {detail.status === "rejected" && <div className="text-destructive">{formatDate(detail.joinedAt)} — admin@b2bmart.vn từ chối: {detail.rejectReason}</div>}
              </div>
            </div>
            {detail.status === "pending" && (
              <div className="p-5 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-card">
                <button onClick={() => { setRejectId(detail.id); }} className="px-4 py-2 text-sm font-semibold border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-md">
                  Từ chối
                </button>
                <button onClick={() => { toast.success(`Phê duyệt ${detail.code}`); setDetailId(null); }} className="px-5 py-2 text-sm font-semibold bg-success text-success-foreground rounded-md">
                  Phê duyệt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setRejectId(null)}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-md border border-border" onClick={e=>e.stopPropagation()}>
            <div className="p-5 border-b border-border">
              <h3 className="font-display font-bold">Từ chối hồ sơ</h3>
            </div>
            <div className="p-5 space-y-3">
              <label className="block">
                <div className="text-xs font-semibold mb-1.5">Lý do từ chối</div>
                <textarea rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                  placeholder="Hồ sơ thiếu mã số thuế, vui lòng bổ sung..." />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={()=>setRejectId(null)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Huỷ</button>
                <button onClick={()=>{ toast.success("Đã từ chối hồ sơ"); setRejectId(null); setDetailId(null); }}
                  className="px-5 py-2 text-sm font-semibold bg-destructive text-destructive-foreground rounded-md">
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Section = ({ title, children }: any) => (
  <div>
    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-muted/30 rounded-lg p-3">{children}</div>
  </div>
);
const KV = ({ k, v }: any) => (
  <div className="text-sm py-1">
    <span className="text-muted-foreground text-xs">{k}: </span><span className="font-medium">{v}</span>
  </div>
);

export default Affiliates;
