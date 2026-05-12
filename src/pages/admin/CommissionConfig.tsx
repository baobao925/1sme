import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { products, systemTaxConfig, updateSystemTaxConfig } from "@/lib/mock-data";
import { formatVND } from "@/lib/format";
import { Edit2, X, Info, Plus, Package, FolderTree, Check, XCircle, Clock, ReceiptText, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Cấu hình mặc định cho từng ngành hàng (mock)
// approvalStatus: pending | approved | rejected — workflow duyệt cấu hình
type ApprovalStatus = "pending" | "approved" | "rejected";
const INITIAL_CATEGORY_CONFIGS = [
  { category: "CRM", commissionType: "Recurring", rate: 8, recurring: { renew: 5, upgrade: 8, downgrade: 3 }, cookieTime: 30, holdPeriod: 15, productCount: 2, status: "active" as const, approvalStatus: "approved" as ApprovalStatus, submittedBy: "Admin Hà", submittedAt: "2026-03-15", approver: "TGĐ Minh" },
  { category: "Hóa đơn điện tử", commissionType: "CPS", rate: 5, recurring: null, cookieTime: 14, holdPeriod: 7, productCount: 2, status: "active" as const, approvalStatus: "approved" as ApprovalStatus, submittedBy: "Admin Hà", submittedAt: "2026-03-10", approver: "TGĐ Minh" },
  { category: "Chữ ký số", commissionType: "CPS", rate: 10, recurring: null, cookieTime: 30, holdPeriod: 7, productCount: 2, status: "active" as const, approvalStatus: "pending" as ApprovalStatus, submittedBy: "Admin Hà", submittedAt: "2026-04-28", approver: "" },
  { category: "HRM", commissionType: "Recurring", rate: 8, recurring: { renew: 6, upgrade: 8, downgrade: 4 }, cookieTime: 60, holdPeriod: 30, productCount: 1, status: "active" as const, approvalStatus: "pending" as ApprovalStatus, submittedBy: "Admin Long", submittedAt: "2026-04-29", approver: "" },
  { category: "Kế toán", commissionType: "CPS", rate: 7, recurring: null, cookieTime: 30, holdPeriod: 15, productCount: 1, status: "active" as const, approvalStatus: "rejected" as ApprovalStatus, submittedBy: "Admin Long", submittedAt: "2026-04-20", approver: "TGĐ Minh" },
];

const ALL_CATEGORIES = Array.from(new Set(products.map(p => p.category)));

const CommissionConfig = () => {
  const [tab, setTab] = useState<"product" | "category" | "tax">("category");
  const [configs, setConfigs] = useState(INITIAL_CATEGORY_CONFIGS);
  const [editId, setEditId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState<false | "category" | "product">(false);

  // States for tax config
  const [taxConfig, setTaxConfig] = useState(systemTaxConfig);

  const handleSaveTax = () => {
    updateSystemTaxConfig(taxConfig);
    toast.success("Đã cập nhật cấu hình Thuế hệ thống");
  };
  const [createCategory, setCreateCategory] = useState<string>("");
  const [reviewCategory, setReviewCategory] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const editing = products.find(p => p.id === editId);
  const editingCat = configs.find(c => c.category === editCategory);
  const reviewing = configs.find(c => c.category === reviewCategory);
  const pendingCount = configs.filter(c => c.approvalStatus === "pending").length;

  const approve = (cat: string) => {
    setConfigs(configs.map(c => c.category === cat ? { ...c, approvalStatus: "approved" as ApprovalStatus, approver: "TGĐ Minh" } : c));
    toast.success(`Đã duyệt cấu hình ngành ${cat}`);
    setReviewCategory(null);
  };
  const reject = (cat: string) => {
    if (!rejectReason.trim()) { toast.error("Vui lòng nhập lý do từ chối"); return; }
    setConfigs(configs.map(c => c.category === cat ? { ...c, approvalStatus: "rejected" as ApprovalStatus, approver: "TGĐ Minh" } : c));
    toast.success(`Đã từ chối cấu hình ngành ${cat}`);
    setReviewCategory(null);
    setRejectReason("");
  };
  const categoryProducts = products.filter(p => p.category === createCategory);

  const approvalBadge = (s: ApprovalStatus) => {
    if (s === "approved") return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success rounded text-xs font-semibold"><Check className="w-3 h-3" /> Đã duyệt</span>;
    if (s === "rejected") return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-destructive/10 text-destructive rounded text-xs font-semibold"><XCircle className="w-3 h-3" /> Từ chối</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-warning/10 text-warning rounded text-xs font-semibold"><Clock className="w-3 h-3" /> Chờ duyệt</span>;
  };

  return (
    <>
      <PageHeader
        title="Cấu hình tỷ lệ hoa hồng"
        subtitle="Thiết lập % hoa hồng theo Danh mục (mặc định cho cả ngành) hoặc theo Sản phẩm (override riêng). Hỗ trợ Recurring."
        actions={
          <button onClick={() => setOpenCreate(tab === "category" ? "category" : "product")}
            className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm mới cấu hình
          </button>
        }
      />

      {/* Tabs: Danh mục / Sản phẩm */}
      <div className="flex gap-1 border-b border-border mb-5">
        <button onClick={() => setTab("category")}
          className={cn("px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2",
            tab === "category" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <FolderTree className="w-4 h-4" /> Theo danh mục ({configs.length})
          {pendingCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-warning text-warning-foreground rounded-full text-[10px] font-bold">{pendingCount}</span>}
        </button>
        <button onClick={() => setTab("product")}
          className={cn("px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2",
            tab === "product" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Package className="w-4 h-4" /> Theo sản phẩm ({products.length})
        </button>
        <button onClick={() => setTab("tax")}
          className={cn("px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2",
            tab === "tax" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <ReceiptText className="w-4 h-4" /> Cấu hình Thuế
        </button>
      </div>

      {tab === "category" && (
        <div className="data-table-wrapper">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Ngành hàng</th>
                <th className="text-center px-5 py-3 font-semibold">Số SP</th>
                <th className="text-center px-5 py-3 font-semibold">Loại HH</th>
                <th className="text-right px-5 py-3 font-semibold">% HH</th>
                <th className="text-center px-5 py-3 font-semibold">Cookie</th>
                <th className="text-center px-5 py-3 font-semibold">Tạm giữ</th>
                <th className="text-left px-5 py-3 font-semibold">Người gửi duyệt</th>
                <th className="text-center px-5 py-3 font-semibold">Trạng thái duyệt</th>
                <th className="text-center px-5 py-3 font-semibold sticky-action">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(c => (
                <tr key={c.category} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 font-semibold">{c.category}</td>
                  <td className="px-5 py-3 text-center text-muted-foreground">{c.productCount}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      c.commissionType === "Recurring" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                    }`}>{c.commissionType === "Recurring" ? "Định kỳ" : "CPS"}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-primary">{c.rate}%</td>
                  <td className="px-5 py-3 text-center text-xs text-muted-foreground">{c.cookieTime}d</td>
                  <td className="px-5 py-3 text-center text-xs text-muted-foreground">{c.holdPeriod}d</td>
                  <td className="px-5 py-3 text-xs">
                    <div className="font-medium">{c.submittedBy}</div>
                    <div className="text-muted-foreground">{c.submittedAt}</div>
                  </td>
                  <td className="px-5 py-3 text-center">{approvalBadge(c.approvalStatus)}</td>
                  <td className="px-5 py-3 sticky-action text-center">
                    <div className="flex items-center justify-center gap-1">
                      {c.approvalStatus === "pending" && (
                        <button onClick={() => setReviewCategory(c.category)}
                          className="px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-xs font-semibold">
                          Duyệt
                        </button>
                      )}
                      <button onClick={() => setEditCategory(c.category)} className="p-1.5 hover:bg-muted rounded text-muted-foreground" title="Sửa"><Edit2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "product" && (
      <div className="data-table-wrapper">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">SKU</th>
              <th className="text-left px-5 py-3 font-semibold">Sản phẩm</th>
              <th className="text-left px-5 py-3 font-semibold">Nhà cung cấp</th>
              <th className="text-left px-5 py-3 font-semibold">Ngành hàng</th>
              <th className="text-right px-5 py-3 font-semibold">Giá bán</th>
              <th className="text-center px-5 py-3 font-semibold">Loại</th>
              <th className="text-right px-5 py-3 font-semibold">% HH (đơn gốc)</th>
              <th className="text-left px-5 py-3 font-semibold">Định kỳ (Gia hạn / Nâng cấp / Hạ cấp)</th>
              <th className="text-center px-5 py-3 font-semibold">Cookie (ngày)</th>
              <th className="text-center px-5 py-3 font-semibold">Tạm giữ (CS hoàn/hủy)</th>
              <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
              <th className="text-center px-5 py-3 font-semibold sticky-action">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-5 py-3 font-medium max-w-[200px] truncate">{p.name}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{p.vendor}</td>
                <td className="px-5 py-3 text-xs">{p.category}</td>
                <td className="px-5 py-3 text-right">{formatVND(p.price)}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    p.commissionType === "Recurring" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                  }`}>{p.commissionType === "Recurring" ? "Định kỳ" : "Đơn lẻ (CPS)"}</span>
                </td>
                <td className="px-5 py-3 text-right font-bold text-primary">{p.commissionRate}%</td>
                <td className="px-5 py-3 text-xs">
                  {p.recurring
                    ? <span className="font-mono">{p.recurring.renew}% / {p.recurring.upgrade}% / {p.recurring.downgrade}%{p.recurringMaxCycles ? ` · max ${p.recurringMaxCycles} kỳ` : ""}</span>
                    : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-5 py-3 text-center text-xs text-muted-foreground">{p.cookieTime}d</td>
                <td className="px-5 py-3 text-center text-xs text-muted-foreground">{p.holdPeriod}d</td>
                <td className="px-5 py-3 text-center"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3 sticky-action text-center">
                  <button onClick={()=>setEditId(p.id)} className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {tab === "tax" && (
        <div className="max-w-2xl bg-card border border-border rounded-xl shadow-soft overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Cấu hình Thuế khấu trừ</h3>
                <p className="text-sm text-muted-foreground">Áp dụng cho toàn bộ Affiliate trên hệ thống khi có yêu cầu rút tiền.</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Thuế thu nhập cá nhân (PIT)</h4>
              <div className="grid grid-cols-2 gap-5">
                <label className="block">
                  <div className="text-xs font-semibold mb-1.5 flex items-center gap-1 text-muted-foreground">Thuế suất (%)</div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={taxConfig.individual.rate} 
                      onChange={e => setTaxConfig({ ...taxConfig, individual: { ...taxConfig.individual, rate: Number(e.target.value) }})}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" 
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
                  </div>
                </label>
                <label className="block">
                  <div className="text-xs font-semibold mb-1.5 flex items-center gap-1 text-muted-foreground">Ngưỡng khấu trừ (VND)</div>
                  <input 
                    type="number" 
                    value={taxConfig.individual.threshold} 
                    onChange={e => setTaxConfig({ ...taxConfig, individual: { ...taxConfig.individual, threshold: Number(e.target.value) }})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" 
                  />
                  <div className="text-[10px] text-muted-foreground mt-1">Sẽ tự động truy thu các yêu cầu rút nhỏ nếu tổng hoa hồng kỳ vượt ngưỡng này.</div>
                </label>
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <h4 className="font-semibold text-foreground mb-4">Thuế giá trị gia tăng (VAT)</h4>
              <div className="grid grid-cols-2 gap-5">
                <label className="block">
                  <div className="text-xs font-semibold mb-1.5 flex items-center gap-1 text-muted-foreground">Thuế suất (%)</div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={taxConfig.enterprise.rate} 
                      onChange={e => setTaxConfig({ ...taxConfig, enterprise: { ...taxConfig.enterprise, rate: Number(e.target.value) }})}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" 
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
                  </div>
                </label>
                <label className="block">
                  <div className="text-xs font-semibold mb-1.5 flex items-center gap-1 text-muted-foreground">Ngưỡng khấu trừ (VND)</div>
                  <input 
                    type="number" 
                    value={taxConfig.enterprise.threshold} 
                    onChange={e => setTaxConfig({ ...taxConfig, enterprise: { ...taxConfig.enterprise, threshold: Number(e.target.value) }})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm cursor-not-allowed opacity-70" 
                    disabled
                  />
                  <div className="text-[10px] text-muted-foreground mt-1">Mặc định tính VAT từ 0đ đối với tài khoản Affiliate Cấp Doanh nghiệp.</div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
            <button onClick={handleSaveTax} className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors">
              <Save className="w-4 h-4" /> Lưu cấu hình
            </button>
          </div>
        </div>
      )}

      {/* Edit Category modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setEditCategory(null)}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-xl border border-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <div>
                <h3 className="font-display font-bold">Cấu hình hoa hồng theo danh mục</h3>
                <div className="text-xs text-muted-foreground mt-0.5">{editingCat.category} · {editingCat.productCount} sản phẩm</div>
              </div>
              <button onClick={() => setEditCategory(null)} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="bg-info/10 border border-info/30 rounded-lg p-3 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-info mt-0.5 shrink-0" />
                <div>Cấu hình áp dụng <strong>mặc định</strong> cho mọi sản phẩm trong ngành. Sản phẩm có cấu hình riêng sẽ được ưu tiên.</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Loại hoa hồng mặc định" required>
                  <select className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" defaultValue={editingCat.commissionType}>
                    <option>CPS</option><option>Recurring</option>
                  </select>
                </Field>
                <Field label="% Hoa hồng cho đơn gốc" required>
                  <div className="flex gap-2">
                    <input type="number" defaultValue={editingCat.rate} className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm" />
                    <span className="px-3 py-2 bg-muted text-sm rounded-md">%</span>
                  </div>
                </Field>
                <Field label="Cookie (ngày)"><input type="number" defaultValue={editingCat.cookieTime} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" /></Field>
                <Field label="Tạm giữ (ngày)"><input type="number" defaultValue={editingCat.holdPeriod} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" /></Field>
              </div>
              {editingCat.commissionType === "Recurring" && editingCat.recurring && (
                <div>
                  <h4 className="font-display font-bold text-sm mb-3">Định kỳ — % theo loại sự kiện</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <RecurField label="Gia hạn" defaultValue={editingCat.recurring.renew} color="info" />
                    <RecurField label="Nâng cấp" defaultValue={editingCat.recurring.upgrade} color="success" />
                    <RecurField label="Hạ cấp" defaultValue={editingCat.recurring.downgrade} color="warning" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-card">
              <button onClick={() => setEditCategory(null)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Huỷ</button>
              <button onClick={() => { toast.success(`Đã lưu cấu hình ngành ${editingCat.category}`); setEditCategory(null); }} className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md">Lưu cấu hình</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={()=>setEditId(null)}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-2xl border border-border max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <div>
                <h3 className="font-display font-bold">Cấu hình hoa hồng</h3>
                <div className="text-xs text-muted-foreground mt-0.5">{editing.sku} · {editing.name}</div>
              </div>
              <button onClick={()=>setEditId(null)} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="bg-muted/40 rounded-lg p-3 text-sm flex items-start gap-2">
                <Info className="w-4 h-4 text-info mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground">
                  Giá bán hiện tại: <strong className="text-foreground">{formatVND(editing.price)}</strong>.
                  Hoa hồng tính theo giá trị đơn hàng <strong>thực tế bán thành công</strong>.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Loại hoa hồng" required>
                  <select className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" defaultValue={editing.commissionType}>
                    <option>CPS</option><option>Recurring</option>
                  </select>
                </Field>
                <Field label="% Hoa hồng cho đơn gốc" required>
                  <div className="flex gap-2">
                    <input type="number" defaultValue={editing.commissionRate} className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm" />
                    <span className="px-3 py-2 bg-muted text-sm rounded-md">%</span>
                  </div>
                </Field>
                <Field label="Thời gian cookie (ngày)" required>
                  <input type="number" defaultValue={editing.cookieTime} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
                </Field>
                <Field label="Thời gian tạm giữ (ngày)" required>
                  <input type="number" defaultValue={editing.holdPeriod} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
                  <div className="text-[11px] text-muted-foreground mt-1">Theo chính sách hoàn/hủy ({editing.refundPolicyDays} ngày)</div>
                </Field>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display font-bold text-sm">Định kỳ — % hoa hồng theo loại sự kiện</h4>
                  <span className="text-xs text-muted-foreground">Áp dụng cho mọi kỳ tiếp theo của sản phẩm định kỳ</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <RecurField label="Gia hạn" defaultValue={editing.recurring?.renew ?? 0} color="info" />
                  <RecurField label="Nâng cấp" defaultValue={editing.recurring?.upgrade ?? 0} color="success" />
                  <RecurField label="Hạ cấp" defaultValue={editing.recurring?.downgrade ?? 0} color="warning" />
                </div>
                <div className="mt-3">
                  <Field label="Giới hạn số kỳ định kỳ (để trống = không giới hạn)">
                    <input type="number" defaultValue={editing.recurringMaxCycles ?? ""} placeholder="Ví dụ: 12 kỳ"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
                  </Field>
                </div>
              </div>

              <Field label="Ngày hiệu lực">
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" defaultValue="2026-04-01" className="px-3 py-2 bg-background border border-border rounded-md text-sm" />
                  <input type="date" placeholder="Ngày kết thúc" className="px-3 py-2 bg-background border border-border rounded-md text-sm" />
                </div>
              </Field>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-card">
              <button onClick={()=>setEditId(null)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Huỷ</button>
              <button onClick={()=>{toast.success("Đã lưu cấu hình"); setEditId(null);}} className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md">Lưu cấu hình</button>
            </div>
          </div>
        </div>
      )}

      {openCreate && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={()=>{setOpenCreate(false); setCreateCategory("");}}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-3xl border border-border max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h3 className="font-display font-bold">Thêm mới cấu hình hoa hồng</h3>
                <div className="text-xs text-muted-foreground mt-0.5">Chọn phạm vi áp dụng: theo Danh mục (mặc định cả ngành) hoặc theo Sản phẩm (override riêng).</div>
              </div>
              <button onClick={()=>{setOpenCreate(false); setCreateCategory("");}} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
            </div>

            {/* Tab chọn phạm vi */}
            <div className="px-5 pt-4">
              <div className="inline-flex bg-muted/60 p-1 rounded-lg">
                <button onClick={() => setOpenCreate("category")}
                  className={cn("px-4 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors",
                    openCreate === "category" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}>
                  <FolderTree className="w-3.5 h-3.5" /> Theo danh mục
                </button>
                <button onClick={() => setOpenCreate("product")}
                  className={cn("px-4 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors",
                    openCreate === "product" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}>
                  <Package className="w-3.5 h-3.5" /> Theo sản phẩm
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {openCreate === "category" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Danh mục ngành hàng" required>
                      <select
                        value={createCategory}
                        onChange={e => setCreateCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm">
                        <option value="">-- Chọn danh mục --</option>
                        {ALL_CATEGORIES.map(c => (
                          <option key={c} value={c}>{c} ({products.filter(p => p.category === c).length} sản phẩm)</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Loại hoa hồng mặc định" required>
                      <select className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"><option>CPS</option><option>Recurring</option></select>
                    </Field>
                    <Field label="% Hoa hồng cho đơn gốc" required>
                      <div className="flex gap-2">
                        <input type="number" defaultValue={5} className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm" />
                        <span className="px-3 py-2 bg-muted text-sm rounded-md">%</span>
                      </div>
                    </Field>
                    <Field label="Cookie (ngày)" required>
                      <input type="number" defaultValue={30} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
                    </Field>
                    <Field label="Tạm giữ (ngày)" required>
                      <input type="number" defaultValue={15} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
                    </Field>
                  </div>

                  {/* Danh sách sản phẩm thuộc danh mục */}
                  {createCategory && (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between">
                        <div className="text-xs font-semibold flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-primary" />
                          Sản phẩm áp dụng trong danh mục <span className="text-primary">{createCategory}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{categoryProducts.length} sản phẩm</span>
                      </div>
                      {categoryProducts.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30 text-xs text-muted-foreground">
                            <tr>
                              <th className="text-left px-4 py-2 font-semibold w-10">
                                <input type="checkbox" defaultChecked className="accent-primary" />
                              </th>
                              <th className="text-left px-4 py-2 font-semibold">SKU</th>
                              <th className="text-left px-4 py-2 font-semibold">Sản phẩm</th>
                              <th className="text-left px-4 py-2 font-semibold">Nhà cung cấp</th>
                              <th className="text-right px-4 py-2 font-semibold">Giá bán</th>
                              <th className="text-right px-4 py-2 font-semibold">% HH hiện tại</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoryProducts.map(p => (
                              <tr key={p.id} className="border-t border-border hover:bg-muted/20">
                                <td className="px-4 py-2"><input type="checkbox" defaultChecked className="accent-primary" /></td>
                                <td className="px-4 py-2 font-mono text-xs">{p.sku}</td>
                                <td className="px-4 py-2 font-medium">{p.name}</td>
                                <td className="px-4 py-2 text-xs text-muted-foreground">{p.vendor}</td>
                                <td className="px-4 py-2 text-right text-xs">{formatVND(p.price)}</td>
                                <td className="px-4 py-2 text-right font-bold text-primary">{p.commissionRate}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-6 text-center text-xs text-muted-foreground">Chưa có sản phẩm nào trong danh mục này.</div>
                      )}
                      <div className="bg-info/5 border-t border-info/20 px-4 py-2.5 text-xs text-muted-foreground flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-info mt-0.5 shrink-0" />
                        Cấu hình sẽ áp dụng <strong className="text-foreground">mặc định</strong> cho các sản phẩm được chọn. Sản phẩm có cấu hình override riêng sẽ được ưu tiên.
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-display font-bold text-sm mb-3">Định kỳ — % theo loại sự kiện (chỉ áp dụng cho sản phẩm định kỳ)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <RecurField label="Gia hạn" defaultValue={5} color="info" />
                      <RecurField label="Nâng cấp" defaultValue={8} color="success" />
                      <RecurField label="Hạ cấp" defaultValue={3} color="warning" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Sản phẩm" required>
                      <select className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm">
                        <option>-- Chọn sản phẩm --</option>
                        {products.map(p => <option key={p.id}>{p.sku} — {p.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Nhà cung cấp">
                      <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" placeholder="Tự động theo sản phẩm" disabled />
                    </Field>
                    <Field label="Loại hoa hồng" required>
                      <select className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"><option>CPS</option><option>Recurring</option></select>
                    </Field>
                    <Field label="% Hoa hồng cho đơn gốc" required>
                      <div className="flex gap-2">
                        <input type="number" defaultValue={5} className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm" />
                        <span className="px-3 py-2 bg-muted text-sm rounded-md">%</span>
                      </div>
                    </Field>
                    <Field label="Thời gian cookie (ngày)" required>
                      <input type="number" defaultValue={30} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
                    </Field>
                    <Field label="Thời gian tạm giữ (ngày)" required>
                      <input type="number" defaultValue={15} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
                    </Field>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm mb-3">Định kỳ — % theo loại sự kiện (chỉ áp dụng cho sản phẩm định kỳ)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <RecurField label="Gia hạn" defaultValue={5} color="info" />
                      <RecurField label="Nâng cấp" defaultValue={8} color="success" />
                      <RecurField label="Hạ cấp" defaultValue={3} color="warning" />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-card">
              <button onClick={()=>{setOpenCreate(false); setCreateCategory("");}} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Huỷ</button>
              <button onClick={()=>{
                toast.success(openCreate === "category" ? `Đã thêm cấu hình cho danh mục ${createCategory || "(chưa chọn)"}` : "Đã thêm cấu hình sản phẩm mới");
                setOpenCreate(false); setCreateCategory("");
              }} className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md">Tạo cấu hình</button>
            </div>
          </div>
        </div>
      )}

      {/* Review/Approve modal */}
      {reviewing && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => { setReviewCategory(null); setRejectReason(""); }}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-lg border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-display font-bold">Duyệt cấu hình hoa hồng</h3>
                <div className="text-xs text-muted-foreground mt-0.5">Ngành: <strong>{reviewing.category}</strong> · Người gửi: {reviewing.submittedBy} · {reviewing.submittedAt}</div>
              </div>
              <button onClick={() => { setReviewCategory(null); setRejectReason(""); }} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Loại hoa hồng</div><div className="font-bold">{reviewing.commissionType === "Recurring" ? "Định kỳ" : "CPS"}</div></div>
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">% HH đơn gốc</div><div className="font-bold text-primary">{reviewing.rate}%</div></div>
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Cookie</div><div className="font-bold">{reviewing.cookieTime} ngày</div></div>
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Tạm giữ</div><div className="font-bold">{reviewing.holdPeriod} ngày</div></div>
              </div>
              {reviewing.recurring && (
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-xs">
                  <div className="font-semibold mb-1">Định kỳ</div>
                  <div className="font-mono">Gia hạn {reviewing.recurring.renew}% · Nâng cấp {reviewing.recurring.upgrade}% · Hạ cấp {reviewing.recurring.downgrade}%</div>
                </div>
              )}
              <div>
                <div className="text-xs font-semibold mb-1.5">Lý do từ chối (nếu từ chối)</div>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                  placeholder="Nhập lý do nếu không duyệt..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2">
              <button onClick={() => reject(reviewing.category)}
                className="px-4 py-2 text-sm font-semibold border border-destructive/40 text-destructive hover:bg-destructive/10 rounded-md flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Từ chối
              </button>
              <button onClick={() => approve(reviewing.category)}
                className="px-5 py-2 text-sm font-semibold bg-success text-success-foreground hover:bg-success/90 rounded-md flex items-center gap-2">
                <Check className="w-4 h-4" /> Duyệt cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Field = ({ label, required, children }: any) => (
  <label className="block">
    <div className="text-xs font-semibold mb-1.5">{label}{required && <span className="text-destructive ml-0.5">*</span>}</div>
    {children}
  </label>
);

const RecurField = ({ label, defaultValue, color }: { label: string; defaultValue: number; color: string }) => {
  const colors: Record<string, string> = { info: "border-info/40 bg-info/5", success: "border-success/40 bg-success/5", warning: "border-warning/40 bg-warning/5" };
  return (
    <div className={`border rounded-lg p-3 ${colors[color]}`}>
      <div className="text-xs font-semibold mb-1.5">{label}</div>
      <div className="flex gap-2">
        <input type="number" defaultValue={defaultValue} className="flex-1 px-2 py-1.5 bg-background border border-border rounded-md text-sm" />
        <span className="px-2 py-1.5 bg-muted text-sm rounded-md">%</span>
      </div>
    </div>
  );
};

export default CommissionConfig;
