import { motion } from "framer-motion";
import { Ruler, Layers, BedDouble, Wallet, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

interface Project {
  id: number;
  title: string;
  client: string;
  progress: number;
  step: number;
  width: number;
  length: number;
  floors: number;
  bedrooms: number;
  budget: number;
  createdAt: string;
}

const STEP_NAMES: Record<number, string> = {
  1: "Tư vấn ban đầu",
  2: "Khảo sát thực địa",
  3: "Thiết kế ý tưởng",
  4: "Phê duyệt bản vẽ",
  5: "Thi công",
  6: "Hoàn thiện nội thất",
  7: "Bàn giao công trình",
};

function formatBudget(budget: number): string {
  if (budget >= 1_000_000_000) {
    return `${(budget / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (budget >= 1_000_000) {
    return `${(budget / 1_000_000).toFixed(0)} triệu`;
  }
  return budget.toLocaleString("vi-VN");
}

function getProgressColor(progress: number): string {
  if (progress >= 80) return "#22c55e";
  if (progress >= 50) return "#ff7b00";
  if (progress >= 20) return "#ff9500";
  return "#ff5500";
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [, setLocation] = useLocation();
  const stepName = STEP_NAMES[project.step] ?? "Không xác định";
  const progressColor = getProgressColor(project.progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setLocation(`/projects/${project.id}`)}
      className="project-card cursor-pointer rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
      style={{
        background: "rgba(15,19,28,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 project-card-glow pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,123,0,0.12) 0%, transparent 70%)",
          transition: "opacity 0.3s ease",
        }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-white text-base leading-snug truncate"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {project.title}
          </h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
            {project.client}
          </p>
        </div>
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,123,0,0.1)", border: "1px solid rgba(255,123,0,0.2)" }}
        >
          <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(255,123,0,0.7)" }} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "rgba(255,255,255,0.45)" }}>
            Bước {project.step}/7 — {stepName}
          </span>
          <span className="font-semibold" style={{ color: progressColor }}>
            {project.progress}%
          </span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 0.8, delay: index * 0.07 + 0.2, ease: "easeOut" }}
            style={{
              background: `linear-gradient(90deg, ${progressColor}cc, ${progressColor})`,
              boxShadow: `0 0 8px ${progressColor}66`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Ruler className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,123,0,0.7)" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            {project.width}×{project.length} m²
          </span>
        </div>

        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Layers className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,123,0,0.7)" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            {project.floors} tầng
          </span>
        </div>

        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <BedDouble className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,123,0,0.7)" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            {project.bedrooms} phòng ngủ
          </span>
        </div>

        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Wallet className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,123,0,0.7)" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            {formatBudget(project.budget)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export type { Project };
