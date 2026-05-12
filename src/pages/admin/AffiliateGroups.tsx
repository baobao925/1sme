import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { affiliateGroups as initial, affiliates } from "@/lib/mock-data";
import type { AffiliateGroup } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { Plus, Edit2, Trash2, Users, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AffiliateGroups = () => {
  const [groups, setGroups] = useState<AffiliateGroup[]>(initial);
  const [editing, setEditing] = useState<AffiliateGroup | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AffiliateGroup | null>(null);

  const openCreate = () => {
    setEditing({
      id: `G${Date.now()}`, code: `GRP-${String(groups.length + 1).padStart(3, "0")}`,
      name: "", description: "", memberIds: [], commissionBoost: 0,
      validFrom: "", validTo: "", status: "active", createdAt: new Date().toISOString().slice(0, 10),
    });
    setCreating(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) { toast.error("Vui lòng nhập tên nhóm"); return; }
    if (creating) { setGroups([editing, ...groups]); toast.success("Đã tạo nhóm"); }
    else { setGroups(groups.map(g => g.id === editing.id ? editing : g)); toast.success("Đã cập nhật nhóm"); }
    setEditing(null); setCreating(false);
  };

  const cancelGroup = (g: AffiliateGroup) => {
    setGroups(groups.map(x => x.id === g.id ? { ...x, status: "void" } : x));
    toast.success(`Đã hủy nhóm ${g.name}`);
    setConfirmDelete(null);
  };

  const toggleMember = (affId: string) => {
    if (!editing) return;
    const has = editing.memberIds.includes(affId);
    setEditing({ ...editing, memberIds: has ? editing.memberIds.filter(i => i !== affId) : [...editing.memberIds, affId] });
  };

  return (
    <>
      <PageHeader
        title="Quản lý nhóm Affiliate"
        subtitle="Phân loại affiliate theo nhóm để áp dụng cấu hình hoa hồng/thuế riêng"
        actions={
          <button onClick={openCreate} className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm nhóm
          </button>
        }
      />

      <div className="data-table-wrapper">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Mã</th>
              <th className="text-left px-5 py-3 font-semibold">Tên nhóm</th>
              <th className="text-center px-5 py-3 font-semibold">Số thành viên</th>
              <th className="text-right px-5 py-3 font-semibold">% Thưởng nhóm</th>
              <th className="text-left px-5 py-3 font-semibold">Hiệu lực</th>
              <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
              <th className="text-center px-5 py-3 font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{g.code}</td>
                <td className="px-5 py-3">
                  <div className="font-semibold">{g.name}</div>
                  <div className="text-xs text-muted-foreground">{g.description}</div>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">
                    <Users className="w-3 h-3" /> {g.memberIds.length}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-bold text-accent">+{g.commissionBoost ?? 0}%</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {g.validFrom ? formatDate(g.validFrom) : "—"} → {g.validTo ? formatDate(g.validTo) : "Không giới hạn"}
                </td>
                <td className="px-5 py-3 text-center">
                  {g.status === "active"
                    ? <span className="px-2 py-0.5 bg-success/10 text-success rounded text-xs">Hoạt động</span>
                    : <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">Đã hủy</span>}
                </td>
                <td className="px-5 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => { setEditing(g); setCreating(false); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground" title="Sửa"><Edit2 className="w-4 h-4" /></button>
                    {g.status === "active" && (
                      <button onClick={() => setConfirmDelete(g)} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground" title="Hủy nhóm"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={o => !o && (setEditing(null), setCreating(false))}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{creating ? "Thêm nhóm Affiliate" : "Chỉnh sửa nhóm"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mã nhóm"><input value={editing.code} onChange={e => setEditing({ ...editing, code: e.target.value })} className={inp} /></Field>
                <Field label="Tên nhóm *"><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className={inp} /></Field>
              </div>
              <Field label="Mô tả"><input value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} className={inp} /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="% Thưởng nhóm"><input type="number" value={editing.commissionBoost ?? 0} onChange={e => setEditing({ ...editing, commissionBoost: Number(e.target.value) })} className={inp} /></Field>
                <Field label="Hiệu lực từ"><input type="date" value={editing.validFrom ?? ""} onChange={e => setEditing({ ...editing, validFrom: e.target.value })} className={inp} /></Field>
                <Field label="Đến (tùy chọn)"><input type="date" value={editing.validTo ?? ""} onChange={e => setEditing({ ...editing, validTo: e.target.value })} className={inp} /></Field>
              </div>

              <div>
                <div className="text-xs font-semibold mb-2">Thành viên ({editing.memberIds.length} đã chọn)</div>
                <div className="border border-border rounded-md max-h-64 overflow-y-auto">
                  {affiliates.map(a => {
                    const checked = editing.memberIds.includes(a.id);
                    return (
                      <label key={a.id} className="flex items-center gap-3 px-3 py-2 border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer">
                        <input type="checkbox" checked={checked} onChange={() => toggleMember(a.id)} className="accent-primary" />
                        <div className="flex-1 text-sm">
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.code} · {a.kind} · {a.tag}</div>
                        </div>
                        {checked && <Check className="w-4 h-4 text-success" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditing(null); setCreating(false); }}>Hủy</Button>
            <Button onClick={save}>{creating ? "Tạo nhóm" : "Lưu thay đổi"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={o => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hủy nhóm Affiliate</DialogTitle></DialogHeader>
          <p className="text-sm">Bạn chắc chắn hủy nhóm <strong>{confirmDelete?.name}</strong>? Các thành viên sẽ không bị xóa nhưng nhóm sẽ ngừng hiệu lực.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Đóng</Button>
            <Button variant="destructive" onClick={() => confirmDelete && cancelGroup(confirmDelete)}>Xác nhận hủy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const inp = "w-full px-3 py-2 bg-background border border-border rounded-md text-sm";
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block"><div className="text-xs font-semibold mb-1.5">{label}</div>{children}</label>
);

export default AffiliateGroups;
