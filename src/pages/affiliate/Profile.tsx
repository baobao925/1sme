import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { currentAffiliate } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { Edit2, Phone, CreditCard, FileText, Building2, Upload, ShieldCheck, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Section = ({ title, icon: Icon, children, onEdit }: any) => (
  <div className="bg-card border border-border rounded-xl shadow-soft">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-display font-bold">{title}</h3>
      </div>
      {onEdit && (
        <button onClick={onEdit} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          <Edit2 className="w-3 h-3" /> Cập nhật
        </button>
      )}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-border last:border-0 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground text-right">{value}</span>
  </div>
);

const steps = (a: typeof currentAffiliate) => {
  const hasPayment = !!a.bank.account;
  const hasTax = !!a.tax.taxCode;
  return [
    { icon: FileText, label: "Gửi hồ sơ đăng ký", done: true, at: a.joinedAt, detail: "Đã gửi thông tin cơ bản qua biểu mẫu đăng ký." },
    { icon: Building2, label: "Thông tin kênh & ngành hàng", done: a.channels.length > 0, at: a.joinedAt, detail: "Khai báo kênh truyền thông (Facebook, Website...) để nhận link." },
    { icon: CreditCard, label: "Thông tin thanh toán", done: hasPayment, at: hasPayment ? a.joinedAt : undefined, optional: true, detail: "Cung cấp tài khoản ngân hàng hợp lệ để sàn chi trả hoa hồng định kỳ." },
    { icon: ShieldCheck, label: "Thông tin thuế & chứng từ", done: hasTax, at: hasTax ? a.joinedAt : undefined, optional: true, detail: "Tải lên tài liệu định danh (CCCD/GPKD) phục vụ việc khấu trừ thuế." },
    { icon: CheckCircle2, label: "Admin phê duyệt", done: a.status === "active", at: a.status === "active" ? a.joinedAt : undefined, detail: "Quản trị sàn xác nhận và kích hoạt toàn quyền Affiliate." },
  ];
};

const Profile = () => {
  const a = currentAffiliate;
  const onEdit = () => toast.info("Mở form cập nhật (mock)");
  const [tab, setTab] = useState("profile");
  const hasPayment = !!a.bank.account;
  const hasTax = !!a.tax.taxCode;
  const ts = steps(a);
  const completed = ts.filter(s => s.done).length;
  const progress = Math.round((completed / ts.length) * 100);

  return (
    <>
      <PageHeader title="Hồ sơ Affiliate của tôi" subtitle="Xem và cập nhật thông tin tài khoản, thanh toán và thuế" />

      <div className="bg-gradient-hero text-primary-foreground rounded-xl p-6 mb-5 shadow-medium">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-2xl font-bold font-display">
              {a.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-primary-foreground/70">{a.kind} · {a.tag}</div>
              <h2 className="text-2xl font-display font-bold">{a.name}</h2>
              <div className="text-sm text-primary-foreground/80 mt-0.5">AFF ID: {a.code} · Tham gia {formatDate(a.joinedAt)}</div>
            </div>
          </div>
          <StatusBadge status={a.status} />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Thông tin chung</TabsTrigger>
          <TabsTrigger value="paytax">
            Thanh toán & Thuế
            {(!hasPayment || !hasTax) && <span className="ml-2 w-1.5 h-1.5 bg-warning rounded-full" />}
          </TabsTrigger>
          <TabsTrigger value="registration">Trạng thái đăng ký</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <Section title="Thông tin cá nhân" icon={Phone} onEdit={onEdit}>
              <Row label="Tên profile" value={a.name} />
              <Row label="AFF ID" value={a.code} />
              <Row label="Loại Affiliate" value={`${a.kind} · ${a.tag}`} />
              <Row label="Số điện thoại" value={a.phone} />
              <Row label="Email" value={a.email} />
              <Row label="Địa chỉ liên hệ" value={a.contactAddress} />
            </Section>
            <Section title="Kênh & ngành hàng" icon={Building2} onEdit={onEdit}>
              <Row label="Kênh truyền thông" value={a.channels.join(", ")} />
              <Row label="Ngành hàng quan tâm" value={a.categories.join(", ")} />
            </Section>
          </div>
        </TabsContent>

        <TabsContent value="paytax">
          {(!hasPayment || !hasTax) && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mt-3 mb-4 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <div>
                <strong>Cần hoàn thành:</strong> Thông tin <strong>thanh toán & thuế</strong> bắt buộc phải đầy đủ trước khi tạo yêu cầu rút tiền.
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <Section title="Thông tin thanh toán" icon={CreditCard} onEdit={onEdit}>
              <Row label="Tên người nhận" value={a.bank.holder} />
              <Row label="Ngân hàng" value={a.bank.bankName} />
              <Row label="Chi nhánh" value={a.bank.branch} />
              <Row label="Số tài khoản" value={a.bank.account} />
            </Section>
            <Section title="Thuế & chứng từ" icon={FileText} onEdit={onEdit}>
              <Row label="Loại giấy tờ" value={a.tax.idType === "CCCD" ? "CCCD (Cá nhân)" : "GPKD/Giấy CN ĐKDN (Doanh nghiệp)"} />
              <Row label="Số CCCD/GPKD" value={a.tax.idNumber} />
              <Row label="Mã số thuế" value={a.tax.taxCode || "—"} />
              <Row label="Cơ quan cấp" value={a.tax.issuer || "—"} />
              <Row label="Chứng từ" value={hasTax ? "✓ Đã upload (mock)" : "Chưa upload"} />
            </Section>

            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-info" />
                <h3 className="font-display font-bold">Cập nhật chứng từ</h3>
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <div className="text-sm font-medium">Kéo thả file vào đây hoặc <span className="text-primary">click để chọn</span></div>
               <div className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG · Tối đa 5MB · {a.kind === "Cá nhân" ? "CCCD mặt trước/sau" : "GPKD + Giấy CN đăng ký thuế"}</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="registration">
          <div className="bg-card border border-border rounded-xl p-6 mt-3 mb-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wider">Tiến độ hoàn thiện</div>
                <div className="text-3xl font-display font-bold mt-1">{progress}%</div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                a.status === "active" ? "bg-success/10 text-success" :
                a.status === "rejected" ? "bg-destructive/10 text-destructive" :
                "bg-warning/10 text-warning"
              }`}>
                {a.status === "active" ? "✓ Đã được phê duyệt" : a.status === "rejected" ? "Đã bị từ chối" : "⏳ Chờ Admin phê duyệt"}
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-soft p-6">
            <h3 className="font-display font-bold mb-6">Nhật ký trạng thái hồ sơ</h3>
            <div className="relative pl-6 border-l-2 border-border/60 pb-4 space-y-8">
              {ts.map((s, i) => (
                <div key={s.label} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[35px] w-8 h-8 rounded-full flex items-center justify-center border-4 border-card ${
                    s.done ? "bg-success text-success-foreground" : "bg-muted border-border text-muted-foreground"
                  }`}>
                    {s.done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-semibold text-sm">
                        {s.label}
                        {s.optional && <span className="ml-2 text-[11px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal tracking-wide">TÙY CHỌN</span>}
                      </div>
                      <div className="text-xs text-muted-foreground ml-auto">
                        {s.done ? (s.at ? formatDate(s.at) : "Hoàn tất") : "Chưa hoàn thành"}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground/90">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {a.rejectReason && (
        <div className="mt-5 bg-destructive/10 border border-destructive/30 rounded-xl p-5">
          <div className="font-semibold text-destructive mb-1">Lý do từ chối</div>
          <p className="text-sm text-foreground">{a.rejectReason}</p>
        </div>
      )}
    </>
  );
};

export default Profile;
