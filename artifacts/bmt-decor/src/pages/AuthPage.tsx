import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  User,
  Mail,
  LogIn,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, type AuthUser } from "@/contexts/AuthContext";

interface LoginForm {
  phone: string;
  password: string;
}

interface RegisterForm {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginErrors {
  phone?: string;
  password?: string;
}

interface RegisterErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface AuthResponse {
  success: boolean;
  user: AuthUser;
}

async function loginRequest(data: LoginForm): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Đăng nhập thất bại" }));
    throw new Error((err as { message: string }).message);
  }
  return res.json() as Promise<AuthResponse>;
}

async function registerRequest(
  data: Omit<RegisterForm, "confirmPassword">
): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Đăng ký thất bại" }));
    throw new Error((err as { message: string }).message);
  }
  return res.json() as Promise<AuthResponse>;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function ParticleField() {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.35 + 0.05,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-orange-400"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -40, 0], x: [0, Math.random() * 20 - 10, 0], opacity: [p.opacity, p.opacity * 1.8, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function OrbitalCore() {
  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto">
      <div style={{ width: 240, height: 240, position: "absolute", borderRadius: "50%", border: "1.5px solid rgba(255,123,0,0.35)", boxShadow: "0 0 18px rgba(255,123,0,0.15)", animation: "spin-cw 8s linear infinite" }}>
        <div style={{ position: "absolute", top: -5, left: "50%", transform: "translateX(-50%)", width: 10, height: 10, borderRadius: "50%", background: "#ff7b00", boxShadow: "0 0 16px 4px rgba(255,123,0,0.8)" }} />
      </div>
      <div style={{ width: 180, height: 180, position: "absolute", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", animation: "spin-ccw 5s linear infinite" }}>
        <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.7)", boxShadow: "0 0 10px 3px rgba(255,255,255,0.4)" }} />
      </div>
      <div className="ai-core" style={{ width: 110, height: 110, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, rgba(255,150,50,0.9) 0%, rgba(255,100,0,0.7) 40%, rgba(200,60,0,0.5) 70%, rgba(10,14,22,0.9) 100%)", position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Sparkles style={{ color: "rgba(255,220,160,0.9)", width: 32, height: 32 }} />
      </div>
    </div>
  );
}

interface FieldInputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  error?: string;
  rightEl?: React.ReactNode;
  optional?: boolean;
}

function FieldInput({ label, type, placeholder, value, onChange, icon, error, rightEl, optional }: FieldInputProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/60 text-xs font-medium uppercase tracking-widest">
        {label}
        {optional && <span className="ml-1 text-white/30 normal-case tracking-normal text-xs font-normal">(tùy chọn)</span>}
      </Label>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400/60 group-focus-within:text-orange-400 transition-colors duration-200">
          {icon}
        </div>
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="auth-input pl-11 pr-11 h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-orange-500/60 focus:ring-0 focus:bg-white/[0.06] transition-all duration-200 rounded-xl hover:border-white/[0.14] hover:bg-white/[0.05] text-sm"
        />
        {rightEl && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-red-400 text-xs">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { setUser, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) setLocation("/dashboard");
  }, [user, loading, setLocation]);

  const [loginForm, setLoginForm] = useState<LoginForm>({ phone: "", password: "" });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [registerForm, setRegisterForm] = useState<RegisterForm>({ fullName: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({});
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => { setUser(data.user); setLocation("/dashboard"); },
    onError: (err: Error) => setLoginError(err.message),
  });

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => { setUser(data.user); setLocation("/dashboard"); },
    onError: (err: Error) => setRegisterError(err.message),
  });

  function validateLogin(): boolean {
    const errs: LoginErrors = {};
    if (!loginForm.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại";
    if (!loginForm.password) errs.password = "Vui lòng nhập mật khẩu";
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateRegister(): boolean {
    const errs: RegisterErrors = {};
    if (!registerForm.fullName.trim()) errs.fullName = "Vui lòng nhập họ tên";
    if (!registerForm.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại";
    if (!registerForm.password) errs.password = "Vui lòng nhập mật khẩu";
    if (registerForm.password !== registerForm.confirmPassword) errs.confirmPassword = "Mật khẩu không khớp";
    setRegisterErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    if (!validateLogin()) return;
    loginMutation.mutate(loginForm);
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegisterError("");
    if (!validateRegister()) return;
    const { confirmPassword: _skip, ...data } = registerForm;
    registerMutation.mutate(data);
  }

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle} className="text-white/25 hover:text-orange-400 transition-colors duration-200">
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  if (loading) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center" style={{ background: "#0a0e16" }}>
      <ParticleField />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 20% 50%, rgba(255,100,0,0.08) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 40% at 80% 80%, rgba(255,80,0,0.06) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-0 items-center min-h-[90vh] lg:min-h-0">

          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="hidden lg:flex flex-col items-center justify-center px-8 py-12">
            <div className="mb-10"><OrbitalCore /></div>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-black" style={{ background: "linear-gradient(135deg, #ff7b00, #ff4500)", boxShadow: "0 0 16px rgba(255,100,0,0.5)" }}>B</div>
                <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: "rgba(255,123,0,0.8)" }}>BMT Decor</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight" style={{ background: "linear-gradient(135deg, #ffffff 0%, rgba(255,180,80,0.9) 50%, rgba(255,100,0,0.8) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Khơi nguồn<br />sáng tạo cùng<br />BMT Decor
              </h1>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
                Không gian nội thất đẳng cấp, nơi ý tưởng thiết kế gặp gỡ hiện thực.
              </p>
              <div className="flex items-center justify-center gap-6 pt-4">
                {["2K+", "15+", "99%"].map((val, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl font-bold" style={{ color: "#ff7b00" }}>{val}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{["Khách hàng", "Năm KN", "Hài lòng"][i]}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }} className="flex justify-center lg:justify-end">
            <div className="dimensional-glass w-full max-w-md rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-7 lg:hidden">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black" style={{ background: "linear-gradient(135deg, #ff7b00, #ff4500)", boxShadow: "0 0 16px rgba(255,100,0,0.4)" }}>B</div>
                <div>
                  <div className="text-white font-bold text-base leading-none">BMT Decor</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,123,0,0.7)" }}>Không gian nội thất đẳng cấp</div>
                </div>
              </div>
              <div className="hidden lg:block mb-6">
                <h2 className="text-xl font-bold text-white">Chào mừng trở lại</h2>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Đăng nhập để khám phá không gian của bạn</p>
              </div>

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="w-full mb-6 p-1 rounded-xl h-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <TabsTrigger value="login" className="flex-1 text-white/50 data-[state=active]:text-white rounded-lg py-2.5 text-sm font-medium transition-all duration-250">Đăng nhập</TabsTrigger>
                  <TabsTrigger value="register" className="flex-1 text-white/50 data-[state=active]:text-white rounded-lg py-2.5 text-sm font-medium transition-all duration-250">Đăng ký</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <FieldInput label="Số điện thoại" type="tel" placeholder="0901 234 567" value={loginForm.phone} onChange={(v) => setLoginForm((p) => ({ ...p, phone: v }))} icon={<Phone className="w-4 h-4" />} error={loginErrors.phone} />
                    <FieldInput label="Mật khẩu" type={showLoginPassword ? "text" : "password"} placeholder="••••••••" value={loginForm.password} onChange={(v) => setLoginForm((p) => ({ ...p, password: v }))} icon={<Lock className="w-4 h-4" />} error={loginErrors.password} rightEl={eyeBtn(showLoginPassword, () => setShowLoginPassword((x) => !x))} />
                    <div className="flex justify-end -mt-1">
                      <button type="button" className="text-xs transition-colors duration-200 hover:text-orange-300" style={{ color: "rgba(255,123,0,0.75)" }}>Quên mật khẩu?</button>
                    </div>
                    <AnimatePresence>
                      {loginError && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl px-3.5 py-2.5 text-red-400 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                          {loginError}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button type="submit" disabled={loginMutation.isPending} className="glow-btn w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-300 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #ff7b00, #ff4800)", boxShadow: "0 4px 20px rgba(255,100,0,0.3)" }}>
                      <LogIn className="w-4 h-4" />
                      {loginMutation.isPending ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                    <div className="relative flex items-center gap-3 my-2">
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>hoặc tiếp tục với</span>
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                    </div>
                    <button type="button" onClick={() => { window.location.href = "/api/auth/google"; }} className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.75)" }}>
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Tiếp tục với Google
                    </button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-3.5">
                    <FieldInput label="Họ và tên" type="text" placeholder="Nguyễn Văn A" value={registerForm.fullName} onChange={(v) => setRegisterForm((p) => ({ ...p, fullName: v }))} icon={<User className="w-4 h-4" />} error={registerErrors.fullName} />
                    <FieldInput label="Số điện thoại" type="tel" placeholder="0901 234 567" value={registerForm.phone} onChange={(v) => setRegisterForm((p) => ({ ...p, phone: v }))} icon={<Phone className="w-4 h-4" />} error={registerErrors.phone} />
                    <FieldInput label="Email" type="email" placeholder="example@email.com" value={registerForm.email} onChange={(v) => setRegisterForm((p) => ({ ...p, email: v }))} icon={<Mail className="w-4 h-4" />} optional />
                    <FieldInput label="Mật khẩu" type={showRegisterPassword ? "text" : "password"} placeholder="••••••••" value={registerForm.password} onChange={(v) => setRegisterForm((p) => ({ ...p, password: v }))} icon={<Lock className="w-4 h-4" />} error={registerErrors.password} rightEl={eyeBtn(showRegisterPassword, () => setShowRegisterPassword((x) => !x))} />
                    <FieldInput label="Nhập lại mật khẩu" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={registerForm.confirmPassword} onChange={(v) => setRegisterForm((p) => ({ ...p, confirmPassword: v }))} icon={<Lock className="w-4 h-4" />} error={registerErrors.confirmPassword} rightEl={eyeBtn(showConfirmPassword, () => setShowConfirmPassword((x) => !x))} />
                    <AnimatePresence>
                      {registerError && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl px-3.5 py-2.5 text-red-400 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                          {registerError}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button type="submit" disabled={registerMutation.isPending} className="glow-btn w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-300 disabled:opacity-60 mt-1" style={{ background: "linear-gradient(135deg, #ff7b00, #ff4800)", boxShadow: "0 4px 20px rgba(255,100,0,0.3)" }}>
                      <UserPlus className="w-4 h-4" />
                      {registerMutation.isPending ? "Đang xử lý..." : "Tạo tài khoản"}
                    </button>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.18)" }}>
                © 2024 BMT Decor. Mọi quyền được bảo lưu.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
