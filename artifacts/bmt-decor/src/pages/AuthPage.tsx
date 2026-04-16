import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, EyeOff, Phone, Lock, User, Mail, LogIn, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  message: string;
}

async function loginRequest(data: LoginForm): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Đăng nhập thất bại" }));
    throw new Error(err.message || "Đăng nhập thất bại");
  }
  return res.json();
}

async function registerRequest(data: Omit<RegisterForm, "confirmPassword">): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Đăng ký thất bại" }));
    throw new Error(err.message || "Đăng ký thất bại");
  }
  return res.json();
}

function GlowOrb({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
    />
  );
}

export default function AuthPage() {
  const [, setLocation] = useLocation();

  const [loginForm, setLoginForm] = useState<LoginForm>({ phone: "", password: "" });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({});
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: () => {
      setLocation("/dashboard");
    },
    onError: (err: Error) => {
      setLoginError(err.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      setLocation("/dashboard");
    },
    onError: (err: Error) => {
      setRegisterError(err.message);
    },
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
    if (registerForm.password !== registerForm.confirmPassword)
      errs.confirmPassword = "Mật khẩu không khớp";
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

  function handleGoogleLogin() {
    window.location.href = "/api/auth/google";
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0f1115]">
      <GlowOrb className="w-96 h-96 bg-orange-500 -top-24 -left-24" />
      <GlowOrb className="w-80 h-80 bg-orange-400 bottom-0 right-0 translate-x-1/3 translate-y-1/3" />
      <GlowOrb className="w-64 h-64 bg-orange-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-2xl border border-white/10 p-8 shadow-2xl"
          style={{
            background: "rgba(22, 25, 30, 0.80)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <div className="mb-7 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 mb-4">
              <span className="text-white text-2xl font-black tracking-tight">B</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">BMT Decor</h1>
            <p className="text-sm text-white/40 mt-1">Không gian nội thất đẳng cấp</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full mb-6 bg-white/5 border border-white/10 p-1 rounded-xl h-auto">
              <TabsTrigger
                value="login"
                className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-orange-500 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
              >
                Đăng nhập
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-orange-500 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
              >
                Đăng ký
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="tel"
                      placeholder="0901 234 567"
                      value={loginForm.phone}
                      onChange={(e) => setLoginForm((p) => ({ ...p, phone: e.target.value }))}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500 focus:ring-orange-500/30 focus:ring-2 transition-all duration-200 hover:border-white/20"
                    />
                  </div>
                  {loginErrors.phone && (
                    <p className="text-red-400 text-xs mt-1">{loginErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm((p) => ({ ...p, password: e.target.value }))
                      }
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500 focus:ring-orange-500/30 focus:ring-2 transition-all duration-200 hover:border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-red-400 text-xs mt-1">{loginErrors.password}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {loginError && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-400 text-sm">
                    {loginError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-200 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>

                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-xs">hoặc</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5 transition-all duration-200 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-white/20"
                >
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Tiếp tục với Google
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={registerForm.fullName}
                      onChange={(e) =>
                        setRegisterForm((p) => ({ ...p, fullName: e.target.value }))
                      }
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500 focus:ring-orange-500/30 focus:ring-2 transition-all duration-200 hover:border-white/20"
                    />
                  </div>
                  {registerErrors.fullName && (
                    <p className="text-red-400 text-xs mt-1">{registerErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="tel"
                      placeholder="0901 234 567"
                      value={registerForm.phone}
                      onChange={(e) =>
                        setRegisterForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500 focus:ring-orange-500/30 focus:ring-2 transition-all duration-200 hover:border-white/20"
                    />
                  </div>
                  {registerErrors.phone && (
                    <p className="text-red-400 text-xs mt-1">{registerErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">
                    Email{" "}
                    <span className="text-white/30 text-xs font-normal">(tùy chọn)</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500 focus:ring-orange-500/30 focus:ring-2 transition-all duration-200 hover:border-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm((p) => ({ ...p, password: e.target.value }))
                      }
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500 focus:ring-orange-500/30 focus:ring-2 transition-all duration-200 hover:border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="text-red-400 text-xs mt-1">{registerErrors.password}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Nhập lại mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerForm.confirmPassword}
                      onChange={(e) =>
                        setRegisterForm((p) => ({
                          ...p,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500 focus:ring-orange-500/30 focus:ring-2 transition-all duration-200 hover:border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {registerErrors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      {registerErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {registerError && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-400 text-sm">
                    {registerError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-200 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {registerMutation.isPending ? "Đang đăng ký..." : "Tạo tài khoản"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-white/20 text-xs mt-6">
            © 2024 BMT Decor. Mọi quyền được bảo lưu.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
