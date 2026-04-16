import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  ChevronDown,
  Image,
  FileText,
  Video,
  File,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { UploadedFile, DocumentType, Priority, InterpretationMode } from "./types";
import {
  DOCUMENT_TYPE_LABELS,
  PRIORITY_LABELS,
  INTERPRETATION_MODE_LABELS,
} from "./constants";

interface Props {
  file: UploadedFile;
  totalFloors: number;
  onRemove: (id: string) => void;
  onUpdateMetadata: (id: string, updates: Partial<UploadedFile["metadata"]>) => void;
  isConflicting?: boolean;
}

function getFileIcon(mimeType: string, name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (mimeType.startsWith("image/")) return <Image className="w-4 h-4" />;
  if (mimeType.startsWith("video/")) return <Video className="w-4 h-4" />;
  if (ext === "dwg" || ext === "dxf") return <FileText className="w-4 h-4" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || ext === "xlsx" || ext === "xls" || ext === "csv")
    return <FileSpreadsheet className="w-4 h-4" />;
  if (mimeType.includes("pdf")) return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SEL =
  "w-full h-8 px-2.5 rounded-lg text-white text-xs outline-none transition-all duration-200 " +
  "bg-white/[0.04] border border-white/[0.08] focus:border-orange-500/50 appearance-none cursor-pointer";

export default function FileListItem({ file, totalFloors, onRemove, onUpdateMetadata, isConflicting }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [hoverTrash, setHoverTrash] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      layout
      className="rounded-xl overflow-hidden"
      style={{
        background: isConflicting ? "rgba(234,179,8,0.05)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${isConflicting ? "rgba(234,179,8,0.22)" : "rgba(255,255,255,0.07)"}`,
      }}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {file.preview ? (
          <img
            src={file.preview}
            alt={file.name}
            className="flex-shrink-0 w-8 h-8 rounded-lg object-cover"
          />
        ) : (
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,149,0,0.1)", color: "rgba(255,149,0,0.75)" }}
          >
            {getFileIcon(file.mimeType, file.name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate leading-none">{file.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-white/30">{formatSize(file.size)}</span>
            <span className="text-[10px]" style={{ color: "rgba(255,149,0,0.55)" }}>
              {DOCUMENT_TYPE_LABELS[file.metadata.documentType]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {file.status === "uploading" && <Loader2 size={14} className="animate-spin text-orange-400" />}
          {file.status === "success" && <CheckCircle2 size={14} className="text-green-500" />}
          {file.status === "error" && <AlertCircle size={14} className="text-red-400" />}
          {isConflicting && <AlertTriangle size={14} className="text-yellow-400" />}

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150 hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.3)" }}
            aria-label="Chỉnh sửa metadata"
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} />
            </motion.div>
          </button>

          <button
            type="button"
            onClick={() => onRemove(file.id)}
            onMouseEnter={() => setHoverTrash(true)}
            onMouseLeave={() => setHoverTrash(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{
              color: hoverTrash ? "#ef4444" : "rgba(255,255,255,0.22)",
              background: hoverTrash ? "rgba(239,68,68,0.1)" : "transparent",
            }}
            aria-label="Xóa file"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {file.status === "uploading" && (
        <div className="h-0.5 w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${file.progress}%` }}
            transition={{ ease: "easeOut" }}
            style={{ background: "linear-gradient(90deg, #ff9500, #ff6b00)" }}
          />
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div
              className="px-3 py-3 space-y-3 border-t"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    Loại tài liệu
                  </label>
                  <select
                    className={SEL}
                    value={file.metadata.documentType}
                    onChange={(e) => onUpdateMetadata(file.id, { documentType: e.target.value as DocumentType })}
                    style={{ colorScheme: "dark" }}
                  >
                    {(Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][]).map(([k, v]) => (
                      <option key={k} value={k} style={{ background: "#0f131c" }}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    Cách diễn giải
                  </label>
                  <select
                    className={SEL}
                    value={file.metadata.interpretationMode}
                    onChange={(e) => onUpdateMetadata(file.id, { interpretationMode: e.target.value as InterpretationMode })}
                    style={{ colorScheme: "dark" }}
                  >
                    {(Object.entries(INTERPRETATION_MODE_LABELS) as [InterpretationMode, string][]).map(([k, v]) => (
                      <option key={k} value={k} style={{ background: "#0f131c" }}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    Độ ưu tiên
                  </label>
                  <select
                    className={SEL}
                    value={file.metadata.priority}
                    onChange={(e) => onUpdateMetadata(file.id, { priority: e.target.value as Priority })}
                    style={{ colorScheme: "dark" }}
                  >
                    {(Object.entries(PRIORITY_LABELS) as [Priority, string][]).map(([k, v]) => (
                      <option key={k} value={k} style={{ background: "#0f131c" }}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    Áp dụng tầng
                  </label>
                  <label className="flex items-center gap-2 h-8 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={file.metadata.appliesToFloors === "all"}
                      onChange={(e) =>
                        onUpdateMetadata(file.id, {
                          appliesToFloors: e.target.checked ? "all" : [1],
                        })
                      }
                      className="w-3.5 h-3.5 rounded"
                      style={{ accentColor: "#ff9500" }}
                    />
                    <span className="text-xs text-white/45">Tất cả tầng</span>
                  </label>
                </div>
              </div>

              {file.metadata.appliesToFloors !== "all" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    Chọn tầng cụ thể
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: totalFloors }, (_, i) => i + 1).map((floor) => {
                      const arr = file.metadata.appliesToFloors as number[];
                      const on = arr.includes(floor);
                      return (
                        <button
                          key={floor}
                          type="button"
                          onClick={() => {
                            const current = file.metadata.appliesToFloors as number[];
                            const next = on
                              ? current.filter((x) => x !== floor)
                              : [...current, floor];
                            onUpdateMetadata(file.id, {
                              appliesToFloors: next.length ? next : [floor],
                            });
                          }}
                          className="w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-150"
                          style={{
                            background: on ? "rgba(255,149,0,0.18)" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${on ? "rgba(255,149,0,0.4)" : "rgba(255,255,255,0.08)"}`,
                            color: on ? "#ff9500" : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {floor}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  Ghi chú
                </label>
                <textarea
                  value={file.metadata.note}
                  onChange={(e) => onUpdateMetadata(file.id, { note: e.target.value })}
                  placeholder="Mô tả thêm về tài liệu này..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-white text-xs placeholder:text-white/18 outline-none resize-none transition-all duration-200 bg-white/[0.04] border border-white/[0.08] focus:border-orange-500/50"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
