import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Sparkles,
  FolderOpen,
  TrendingUp,
  CheckCircle,
  Clock,
  Shield,
  LogOut,
  ChevronDown,
} from "lucide-react";
import ProjectCard, { type Project } from "@/components/projects/ProjectCard";
import { useAuth } from "@/contexts/AuthContext";

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects", { credentials: "include" });
  if (res.status === 401) throw new Error("401");
  if (!res.ok) throw new Error("Không thể tải dự án");
  return res.json() as Promise<Project[]>;
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: "rgba(15,19,28,0.75)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded-lg" />
          <div className="skeleton h-3 w-1/2 rounded-lg" />
        </div>
        <div className="skeleton w-7 h-7 rounded-full flex-shrink-0" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
        </div>
        <div className="skeleton h-1.5 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-9 rounded-xl" />)}
      </div>
    </motion.div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="col-span-full flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto" style={{ background: "linear-gradient(135deg, rgba(255,123,0,0.12), rgba(255,72,0,0.06))", border: "1px solid rgba(255,123,0,0.2)", boxShadow: "0 0 60px rgba(255,100,0,0.12)" }}>
          <Sparkles className="w-12 h-12" style={{ color: "rgba(255,123,0,0.6)" }} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>Chưa có dự án nào</h3>
      <p className="text-sm mb-8 max-w-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Bắt đầu hành trình thiết kế nội thất đầu tiên của bạn cùng BMT Decor</p>
      <button onClick={onNew} className="glow-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm" style={{ background: "linear-gradient(135deg, #ff7b00, #ff4800)", boxShadow: "0 4px 20px rgba(255,100,0,0.35)" }}>
        <Plus className="w-4 h-4" />
        Tạo dự án đầu tiên
      </button>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  index: number;
}

function StatCard({ label, value, icon, color, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-xl p-4 flex items-center gap-3"
      style={{ background: "rgba(15,19,28,0.6)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <div className="text-lg font-bold text-white leading-none">{value}</div>
        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>{label}</div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { data: projects, isLoading, isError, error } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    retry: false,
  });

  useEffect(() => {
    if (isError && (error as Error).message === "401") {
      setLocation("/login");
    }
  }, [isError, error, setLocation]);

  const is401 = isError && (error as Error).message === "401";

  const filtered = (projects ?? []).filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAdmin = user?.role === "admin";
  const totalProjects = projects?.length ?? 0;
  const inProgress = projects?.filter((p) => p.progress < 100 && p.progress > 0).length ?? 0;
  const completed = projects?.filter((p) => p.progress === 100).length ?? 0;
  const thisMonth = projects?.filter((p) => {
    const d = new Date(p.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length ?? 0;

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen relative" style={{ background: "#0a0e16" }}>
      <div className="grid-bg" />
      <div className="absolute top-0 left-0 w-[600px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(255,100,0,0.07) 0%, transparent 60%)" }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none" style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(255,80,0,0.05) 0%, transparent 60%)" }} />

      <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-10" style={{ background: "rgba(10,14,22,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: "linear-gradient(135deg, #ff7b00, #ff4500)", boxShadow: "0 0 14px rgba(255,100,0,0.4)" }}>B</div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", background: "linear-gradient(90deg, #ffffff 0%, rgba(200,200,200,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Dự án</h1>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(255,123,0,0.15)", border: "1px solid rgba(255,123,0,0.3)", color: "#ff9500" }}>
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-sm sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type="search"
                placeholder="Tìm kiếm dự án..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input w-full pl-9 pr-4 h-9 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
            <button onClick={() => setLocation("/projects/new")} className="glow-btn flex-shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-white text-sm font-medium" style={{ background: "linear-gradient(135deg, #ff7b00, #ff4800)", boxShadow: "0 3px 14px rgba(255,100,0,0.3)" }}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:block">Tạo mới</span>
            </button>
          </div>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-2 px-3 h-9 rounded-xl transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: isAdmin ? "linear-gradient(135deg,#ff7b00,#ff4500)" : "rgba(255,255,255,0.15)" }}>
                {user?.fullName?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="hidden sm:block text-xs text-white/70 max-w-[100px] truncate">{user?.fullName ?? "Người dùng"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/40" />
            </button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 top-11 w-52 rounded-xl overflow-hidden z-50"
                style={{ background: "rgba(15,19,28,0.97)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 16px 40px rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{user?.phone}</p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(255,123,0,0.15)", color: "#ff9500" }}>
                      <Shield className="w-2.5 h-2.5" /> Quản trị viên
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors duration-150"
                  style={{ color: "rgba(255,100,100,0.85)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8" onClick={() => setShowUserMenu(false)}>
        {isAdmin && !isLoading && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(255,123,0,0.07)", border: "1px solid rgba(255,123,0,0.18)" }}>
            <Shield className="w-4 h-4 flex-shrink-0" style={{ color: "#ff9500" }} />
            <p className="text-sm" style={{ color: "rgba(255,200,100,0.85)" }}>
              Chế độ <strong>Quản trị viên</strong> — Bạn đang xem tất cả dự án của toàn bộ khách hàng
            </p>
          </motion.div>
        )}

        {!isLoading && !isError && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatCard label="Tổng dự án" value={totalProjects} icon={<FolderOpen className="w-5 h-5" />} color="#ff7b00" index={0} />
            <StatCard label="Đang thực hiện" value={inProgress} icon={<TrendingUp className="w-5 h-5" />} color="#3b82f6" index={1} />
            <StatCard label="Hoàn thành" value={completed} icon={<CheckCircle className="w-5 h-5" />} color="#22c55e" index={2} />
            <StatCard label="Mới tháng này" value={thisMonth} icon={<Clock className="w-5 h-5" />} color="#a855f7" index={3} />
          </motion.div>
        )}

        {searchQuery && !isLoading && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Kết quả cho{" "}
            <span className="font-medium" style={{ color: "#ff7b00" }}>"{searchQuery}"</span>{" "}
            — {filtered.length} dự án
          </motion.p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} index={i} />)}

          {isError && !is401 && (
            <div className="col-span-full text-center py-20">
              <p className="text-sm" style={{ color: "rgba(255,100,100,0.7)" }}>Không thể tải danh sách dự án. Vui lòng thử lại.</p>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && searchQuery && (
            <div className="col-span-full text-center py-16">
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Không tìm thấy dự án nào phù hợp với "{searchQuery}"</p>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && !searchQuery && (
            <EmptyState onNew={() => setLocation("/projects/new")} />
          )}

          {!isLoading && !isError && filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} showOwner={isAdmin} />
          ))}
        </div>
      </main>
    </div>
  );
}
