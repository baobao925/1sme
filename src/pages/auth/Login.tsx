import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Mail, Lock, LogIn } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();
  const { setRole, setMode, setIsAuthenticated } = useRole();
  const [email, setEmail] = useState("affiliate@1sme.vn");
  const [pwd, setPwd] = useState("123456");
  const [as, setAs] = useState<"affiliate" | "admin">("affiliate");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pwd) { toast.error("Nhập đầy đủ email & mật khẩu"); return; }
    setRole(as); setMode("app"); setIsAuthenticated(true);
    toast.success("Đăng nhập thành công");
    navigate(as === "affiliate" ? "/affiliate" : "/admin");
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-large p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-bold text-lg">1SME</div>
            <div className="text-xs text-muted-foreground">Affiliate Hub · Đăng nhập</div>
          </div>
        </div>

        <div className="flex bg-muted/60 p-1 rounded-lg mb-5">
          <button onClick={() => setAs("affiliate")} className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${as === "affiliate" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}>👤 Affiliate</button>
          <button onClick={() => setAs("admin")} className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${as === "admin" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}>🛡️ Admin</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <div className="text-xs font-semibold mb-1.5">Email</div>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm" />
            </div>
          </label>
          <label className="block">
            <div className="text-xs font-semibold mb-1.5">Mật khẩu</div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input value={pwd} onChange={e => setPwd(e.target.value)} type="password"
                className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm" />
            </div>
          </label>

          <div className="flex justify-between text-xs">
            <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="accent-primary" /> Nhớ tôi</label>
            <button type="button" onClick={() => setForgotOpen(true)} className="text-primary font-semibold">Quên mật khẩu?</button>
          </div>

          <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-md flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" /> Đăng nhập
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          Chưa có tài khoản? <Link to="/affiliate/onboarding" className="text-primary font-semibold">Đăng ký Affiliate</Link>
        </div>
        <div className="mt-2 text-center text-xs">
          <Link to="/affiliate/getting-started" className="text-muted-foreground hover:text-primary">📖 Hướng dẫn bắt đầu</Link>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quên mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập email bạn đã đăng ký để nhận liên kết khôi phục mật khẩu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <label className="block">
              <div className="text-xs font-semibold mb-1.5">Email</div>
              <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} type="email" placeholder="Ví dụ: mail@company.com"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>Huỷ</Button>
            <Button onClick={() => {
              if(!forgotEmail) return toast.error("Vui lòng nhập email");
              toast.success("Đã gửi email khôi phục!");
              setForgotOpen(false);
              setForgotEmail("");
            }}>Gửi liên kết</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
