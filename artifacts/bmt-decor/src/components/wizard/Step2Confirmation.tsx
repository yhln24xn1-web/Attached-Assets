import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Home,
  Ruler,
  Layers,
  BedDouble,
  Bath,
  Wallet,
  Building2,
  Palette,
  Paperclip,
  Link2,
  ChevronRight,
} from "lucide-react";
import { formatBudget } from "./calculation";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FloorDetail {
  bedrooms: number;
  wc:       number;
  special:  string[];
}

interface ProjectSummary {
  title:          string;
  clientName?:    string;
  landWidth:      number;
  landLength:     number;
  floors:         number;
  bedrooms:       number;
  bathrooms:      number;
  budget:         number;
  architecture?:  { name: string; image?: string };
  interiorStyle?: string;
  floorDetails?:  Record<number, FloorDetail>;
}

interface UploadedFileSummary {
  name: string;
  size: number;
}

export interface Step2ConfirmationProps {
  project:        ProjectSummary;
  chatAnswers:    Record<string, string>;
  uploadedFiles?: UploadedFileSummary[];
  sheetUrl?:      string;
  onConfirm:      () => void;
  onBack:         () => void;
  isPending?:     boolean;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function GlassCard({
  children,
  title,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background:   "rgba(17,24,39,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border:       "1px solid rgba(30,37,48,0.9)",
        boxShadow:    "0 4px 24px rgba(0,0,0,0.25)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {title}
        </span>
      </div>
      <div className="px-4 py-4">{children}</div>
    </motion.div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon:       React.ReactNode;
  label:      string;
  value:      string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(255,123,0,0.1)", color: "#ff9500" }}
      >
        {icon}
      </div>
      <span className="text-xs flex-1" style={{ color: "rgba(255,255,255,0.42)" }}>
        {label}
      </span>
      <span
        className="text-sm font-semibold text-right"
        style={{ color: highlight ? "#ff9500" : "rgba(255,255,255,0.85)" }}
      >
        {value}
      </span>
    </div>
  );
}

function InfoSection({ project }: { project: ProjectSummary }) {
  const siteArea = project.landWidth * project.landLength;
  return (
    <GlassCard title="Thông tin cơ bản">
      <InfoRow
        icon={<Home size={14} />}
        label="Tên dự án"
        value={project.title || "—"}
        highlight
      />
      {project.clientName && (
        <InfoRow icon={<Home size={14} />} label="Khách hàng" value={project.clientName} />
      )}
      <InfoRow
        icon={<Ruler size={14} />}
        label="Kích thước lô đất"
        value={`${project.landWidth}×${project.landLength}m = ${siteArea}m²`}
      />
      <InfoRow
        icon={<Layers size={14} />}
        label="Số tầng"
        value={`${project.floors} tầng`}
      />
      <InfoRow
        icon={<BedDouble size={14} />}
        label="Phòng ngủ"
        value={`${project.bedrooms} phòng`}
      />
      <InfoRow
        icon={<Bath size={14} />}
        label="Phòng tắm / WC"
        value={`${project.bathrooms} phòng`}
      />
      <InfoRow
        icon={<Wallet size={14} />}
        label="Ngân sách"
        value={formatBudget(project.budget)}
        highlight
      />
      {project.architecture && (
        <InfoRow
          icon={<Building2 size={14} />}
          label="Kiến trúc"
          value={project.architecture.name}
        />
      )}
      {project.interiorStyle && (
        <InfoRow
          icon={<Palette size={14} />}
          label="Phong cách nội thất"
          value={project.interiorStyle}
        />
      )}
    </GlassCard>
  );
}

function FloorTable({ project }: { project: ProjectSummary }) {
  const floors = Array.from({ length: project.floors }, (_, i) => i + 1);
  const bedsPerFloor = Math.floor(project.bedrooms / Math.max(project.floors - 1, 1));
  const wcPerFloor   = Math.floor(project.bathrooms / project.floors);

  function getFloorDetail(floor: number): FloorDetail {
    if (project.floorDetails?.[floor]) return project.floorDetails[floor];
    if (floor === 1) return { bedrooms: 0, wc: 1, special: ["Phòng khách", "Bếp"] };
    const isTop = floor === project.floors;
    return {
      bedrooms: bedsPerFloor || 1,
      wc:       wcPerFloor   || 1,
      special:  isTop && project.floors > 2 ? ["Phòng thờ / sân thượng"] : [],
    };
  }

  return (
    <GlassCard title="Cấu hình từng tầng">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Tầng", "Phòng ngủ", "WC", "Yêu cầu đặc biệt"].map((h) => (
                <th
                  key={h}
                  className="py-2 text-left font-semibold pb-3"
                  style={{ color: "rgba(255,255,255,0.3)", paddingRight: 12 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {floors.map((floor) => {
              const d = getFloorDetail(floor);
              return (
                <tr
                  key={floor}
                  className="transition-colors duration-150"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "rgba(255,255,255,0.03)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                  }
                >
                  <td className="py-2.5 pr-3 font-semibold" style={{ color: "#ff9500" }}>
                    Tầng {floor}
                  </td>
                  <td className="py-2.5 pr-3" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {d.bedrooms > 0 ? `${d.bedrooms} phòng` : "—"}
                  </td>
                  <td className="py-2.5 pr-3" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {d.wc > 0 ? `${d.wc} WC` : "—"}
                  </td>
                  <td className="py-2.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {d.special.length > 0 ? d.special.join(", ") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function AnswerList({ chatAnswers }: { chatAnswers: Record<string, string> }) {
  const entries = Object.entries(chatAnswers);
  if (entries.length === 0) return null;

  return (
    <GlassCard title="Yêu cầu chi tiết từ AI">
      <div>
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2">
              <ChevronRight
                size={11}
                style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }}
              />
              <span className="text-xs" style={{ color: "rgba(148,163,184,0.85)" }}>
                {key}
              </span>
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: "#ffb68a" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024)     return `${(bytes / 1_024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function FileSection({
  files,
  sheetUrl,
}: {
  files?:    UploadedFileSummary[];
  sheetUrl?: string;
}) {
  const hasFiles = files && files.length > 0;
  const hasSheet = sheetUrl && sheetUrl.trim().length > 0;
  if (!hasFiles && !hasSheet) return null;

  return (
    <GlassCard title="Tài liệu đính kèm">
      {hasFiles && (
        <div className="space-y-2 mb-3">
          {files!.map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Paperclip size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
              <span className="text-xs flex-1 truncate" style={{ color: "rgba(255,255,255,0.65)" }}>
                {f.name}
              </span>
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                {formatFileSize(f.size)}
              </span>
            </div>
          ))}
        </div>
      )}
      {hasSheet && (
        <a
          href={sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-white/5"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Link2 size={13} style={{ color: "#ff9500", flexShrink: 0 }} />
          <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
            {sheetUrl}
          </span>
        </a>
      )}
    </GlassCard>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Step2Confirmation({
  project,
  chatAnswers,
  uploadedFiles,
  sheetUrl,
  onConfirm,
  onBack,
  isPending = false,
}: Step2ConfirmationProps) {
  return (
    <div className="space-y-4">
      {/* ── Grid: basic info + floor table ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoSection project={project} />
        <div className="space-y-4">
          <FloorTable project={project} />
          <FileSection files={uploadedFiles} sheetUrl={sheetUrl} />
        </div>
      </div>

      {/* ── Chat AI answers ─────────────────────────────────────────── */}
      <AnswerList chatAnswers={chatAnswers} />

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="flex flex-col-reverse sm:flex-row gap-3 pt-2"
      >
        <motion.button
          type="button"
          onClick={onBack}
          disabled={isPending}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium sm:w-auto transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            border:     "1px solid rgba(255,255,255,0.09)",
            color:      "rgba(255,255,255,0.5)",
            opacity:    isPending ? 0.4 : 1,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </motion.button>

        <motion.button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          whileHover={
            !isPending
              ? { scale: 1.02, boxShadow: "0 0 28px rgba(255,149,0,0.55), 0 6px 24px rgba(255,100,0,0.4)" }
              : {}
          }
          whileTap={!isPending ? { scale: 0.97 } : {}}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300"
          style={{
            background:  isPending ? "rgba(255,149,0,0.4)" : "linear-gradient(135deg, #ff9500, #ff4800)",
            color:       "#fff",
            boxShadow:   isPending ? "none" : "0 4px 20px rgba(255,100,0,0.35)",
            cursor:      isPending ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Xác nhận & Sinh Layout AI
              <ChevronRight size={16} />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
