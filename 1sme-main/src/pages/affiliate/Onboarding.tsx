import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Upload, Send, User, Building2, Hash, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";

const STEPS = [
  { id: 1, label: "Loại & Hồ sơ" },
  { id: 2, label: "Kênh & ngành hàng" },
  { id: 3, label: "Điều khoản" },
  { id: 4, label: "Hoàn tất" },
];

type Kind = "Cá nhân" | "Doanh nghiệp";

const CHANNELS = ["Facebook", "TikTok", "YouTube", "Website / Blog", "Email Marketing", "LinkedIn"];
const CATEGORIES = ["Hóa đơn điện tử", "CRM", "Chữ ký số", "Kế toán", "HRM"];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<Kind>("Cá nhân");
  const [channels, setChannels] = useState<string[]>(["Facebook", "TikTok"]);
  const [categories, setCategories] = useState<string[]>(["Hóa đơn điện tử", "CRM"]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeData, setAgreeData] = useState(false);
  const [submittedAffId] = useState("AFF-000189");
  const navigate = useNavigate();
  const { setMode, setRole } = useRole();

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const goDashboard = () => {
    setRole("affiliate");
    setMode("app");
    navigate("/affiliate");
  };

  const Field = ({ label, children, required, hint }: any) => (
    <label className="block">
      <div className="text-xs font-semibold text-foreground mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </div>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </label>
  );
  const input =
    "w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary outline-none";

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Standalone header for register mode */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-bold text-base leading-tight">1SME</div>
            <div className="text-[11px] text-muted-foreground leading-tight">Affiliate Hub</div>
          </div>
        </div>

        <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
          <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-card text-foreground shadow-soft">
            Đăng ký Affiliate
          </button>
          <button
            onClick={goDashboard}
            className="px-3 py-1.5 text-xs font-semibold rounded-md text-muted-foreground hover:text-foreground"
          >
            Vào trang chính
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl w-full mx-auto">
        <div className="mb-6">
          <h1 className="page-title">Đăng ký tài khoản Affiliate</h1>
          <p className="page-subtitle">
            Chỉ áp dụng cho Cá nhân & Doanh nghiệp trong nước. Hoàn tất 4 bước để được Admin xét duyệt.
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-card border border-border rounded-xl p-5 mb-5 shadow-soft">
          <div className="flex items-center justify-between overflow-x-auto">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-initial min-w-max">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                      step > s.id
                        ? "bg-success text-success-foreground"
                        : step === s.id
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-muted-foreground tracking-wider">Bước {s.id}</div>
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        step >= s.id ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-4 min-w-[20px]", step > s.id ? "bg-success" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-lg">Chọn loại Affiliate & thông tin cơ bản</h2>

              <div>
                <div className="text-xs font-semibold mb-2">
                  Loại tài khoản <span className="text-destructive">*</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(["Cá nhân", "Doanh nghiệp"] as Kind[]).map((k) => {
                    const Icon = k === "Cá nhân" ? User : Building2;
                    const active = kind === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKind(k)}
                        className={cn(
                          "border rounded-xl p-4 text-left transition-all",
                          active ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/50",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold">{k} trong nước</div>
                            {/* <div className="text-xs text-muted-foreground">
                              {k === "Cá nhân" ? "Khấu trừ PIT 10% (≥ 250k)" : "Khấu trừ VAT 10%"}
                            </div> */}
                          </div>
                          {active && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={kind === "Cá nhân" ? "Họ và tên" : "Tên doanh nghiệp"} required>
                  <input className={input} defaultValue={kind === "Cá nhân" ? "Vũ Thu Hà" : "CTY TNHH ABC"} />
                </Field>
                <Field label="Tên profile (hiển thị)" required>
                  <input
                    className={input}
                    placeholder="Tên trên kênh truyền thông"
                    defaultValue={kind === "Cá nhân" ? "Hà Vũ Marketing" : "ABC Affiliate"}
                  />
                </Field>
                <Field label="Số điện thoại liên hệ" required>
                  <input className={input} placeholder="09xx..." defaultValue="0911223344" />
                </Field>
                <Field label="Email liên hệ" required>
                  <input className={input} type="email" defaultValue="contact@example.vn" />
                </Field>
              </div>

              {/* <div className="bg-info/10 border border-info/30 rounded-lg p-3 text-xs text-foreground flex items-start gap-2">
                <Hash className="w-4 h-4 text-info mt-0.5 shrink-0" />
                <div><strong>AFF ID</strong> sẽ được hệ thống tự sinh sau khi đăng ký thành công (định dạng: <code className="bg-muted px-1 rounded">AFF-XXXXXX</code>).</div>
              </div> */}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-lg">Kênh truyền thông & ngành hàng quan tâm</h2>

              <div>
                <div className="text-xs font-semibold mb-2">
                  Kênh truyền thông chính (chọn nhiều) <span className="text-destructive">*</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CHANNELS.map((c) => (
                    <label
                      key={c}
                      className={cn(
                        "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors",
                        channels.includes(c) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={channels.includes(c)}
                        onChange={() => toggle(channels, setChannels, c)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm font-medium">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold mb-2">
                  Ngành hàng quan tâm (chọn nhiều) <span className="text-destructive">*</span>
                </div>
                {/* <div className="text-[11px] text-muted-foreground mb-2">
                  Sản phẩm trong các ngành này sẽ hiển thị ở Deep Link
                </div> */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <label
                      key={c}
                      className={cn(
                        "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors",
                        categories.includes(c) ? "border-accent bg-accent/5" : "border-border hover:border-accent/50",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={categories.includes(c)}
                        onChange={() => toggle(categories, setCategories, c)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm font-medium">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Link Facebook">
                  <input className={input} placeholder="https://facebook.com/..." />
                </Field>
                <Field label="Link TikTok">
                  <input className={input} placeholder="https://tiktok.com/@..." />
                </Field>
                <Field label="Link YouTube">
                  <input className={input} placeholder="https://youtube.com/..." />
                </Field>
                <Field label="Website / Landing page">
                  <input className={input} placeholder="https://..." />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-lg">Điều khoản tham gia chương trình</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vui lòng đọc kỹ và xác nhận đồng ý các điều khoản dưới đây.
                </p>
              </div>

              <div className="border border-border rounded-lg p-4 max-h-72 overflow-y-auto bg-muted/20 text-sm space-y-3">
                <div>
                  <strong>1. Quyền và nghĩa vụ Affiliate.</strong> Affiliate cam kết trung thực, không gian lận
                  click/đơn, không tự đặt đơn qua link của mình (self-purchase).
                </div>
                <div>
                  <strong>2. Hoa hồng & thanh toán.</strong> Hoa hồng được ghi nhận theo Last Click attribution. Thanh
                  toán theo kỳ hàng tháng (ngày 15) sau khi hết thời gian tạm giữ.
                </div>
                <div>
                  <strong>3. Thuế.</strong> 1SME khấu trừ thuế tại nguồn: PIT 10% với cá nhân (khi tổng kỳ ≥ 250.000đ),
                  VAT 10% với doanh nghiệp.
                </div>
                <div>
                  <strong>4. Vi phạm.</strong> Các hành vi gian lận traffic, bot click, lạm dụng mã giảm giá... sẽ bị từ
                  chối hoa hồng và có thể chấm dứt tài khoản.
                </div>
                <div>
                  <strong>5. Bảo mật dữ liệu.</strong> Thông tin cá nhân và giao dịch được bảo vệ theo chính sách bảo
                  mật, chỉ sử dụng cho mục đích vận hành chương trình.
                </div>
                <div>
                  <strong>6. Sửa đổi.</strong> 1SME có quyền cập nhật điều khoản và sẽ thông báo trước 7 ngày.
                </div>
              </div>

              <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary"
                />
                <span className="text-sm">
                  Tôi đã đọc, hiểu và <strong>đồng ý</strong> với{" "}
                  <a href="#" className="text-primary underline">
                    Điều khoản tham gia chương trình Affiliate
                  </a>{" "}
                  của 1SME.
                </span>
              </label>
              <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30">
                <input
                  type="checkbox"
                  checked={agreeData}
                  onChange={(e) => setAgreeData(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary"
                />
                <span className="text-sm">
                  Tôi đồng ý cho 1SME thu thập, lưu trữ và xử lý dữ liệu cá nhân theo{" "}
                  <a href="#" className="text-primary underline">
                    Chính sách bảo mật
                  </a>
                  .
                </span>
              </label>

              <div className="bg-info/10 border border-info/30 rounded-lg p-3 text-xs flex items-start gap-2">
                <Hash className="w-4 h-4 text-info mt-0.5 shrink-0" />
                <div>
                  <strong>Thông tin Thanh toán & Thuế</strong> sẽ được bổ sung sau ở tab <strong>Hồ sơ</strong> trước
                  khi bạn yêu cầu rút tiền.
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 text-center py-6">
              <div className="w-16 h-16 mx-auto bg-success/10 text-success rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">Hồ sơ đã được gửi đi!</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Hệ thống đã tự động cấp AFF ID cho bạn. Vui lòng chờ Admin xét duyệt.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-3 rounded-xl">
                <Hash className="w-4 h-4" />
                <span className="font-mono font-bold text-lg">{submittedAffId}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Trạng thái: <strong className="text-warning">CHỜ DUYỆT</strong>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  onClick={goDashboard}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-md"
                >
                  Vào dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          {step < 4 && (
            <div className="flex items-center justify-end mt-8 pt-5 border-t border-border gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-md"
                >
                  ← Quay lại
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                >
                  Tiếp tục →
                </button>
              ) : (
                <button
                  disabled={!agreeTerms || !agreeData}
                  onClick={() => {
                    toast.success(`Đã gửi hồ sơ! AFF ID đã được cấp.`);
                    setStep(4);
                  }}
                  className="px-5 py-2 text-sm font-semibold bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-40 rounded-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Gửi đăng ký
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
