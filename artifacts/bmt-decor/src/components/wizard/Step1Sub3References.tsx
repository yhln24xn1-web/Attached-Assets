import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Link2, Lock, AlertTriangle, Loader2 } from "lucide-react";
import FileDropzone from "./FileDropzone";
import FileListItem from "./FileListItem";
import type { UploadedFile, ReferencesFormValues, FileMetadata, DocumentType } from "./types";
import { getDefaultMetadata, MAX_FILE_SIZE_MB } from "./constants";
import { validateSheetUrl } from "./schemas";

interface Props {
  totalFloors: number;
  defaultValues?: ReferencesFormValues | null;
  onBack: () => void;
  onNext: (data: ReferencesFormValues) => void;
}

function guessDocumentType(file: File): DocumentType {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type.toLowerCase();
  if (mime.startsWith("image/")) return "site_photo";
  if (mime.startsWith("video/")) return "video";
  if (ext === "dwg" || ext === "dxf") return "cad_file";
  if (ext === "pdf") return "current_plan";
  if (ext === "xlsx" || ext === "xls" || ext === "csv" || mime.includes("spreadsheet") || mime.includes("excel"))
    return "budget_file";
  return "other";
}

function buildUploadedFile(file: File): UploadedFile {
  const docType = guessDocumentType(file);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    url: undefined,
    status: "idle",
    progress: 0,
    error: undefined,
    metadata: getDefaultMetadata(docType),
  };
}

const INPUT =
  "w-full h-11 px-4 rounded-xl text-white text-sm placeholder:text-white/20 outline-none " +
  "transition-all duration-200 bg-white/[0.04] border border-white/[0.08] " +
  "hover:border-white/[0.14] focus:border-orange-400/60 focus:bg-white/[0.06] " +
  "focus:[box-shadow:0_0_0_2px_rgba(255,149,0,0.15),0_0_20px_rgba(255,149,0,0.07)]";

export default function Step1Sub3References({ totalFloors, defaultValues, onBack, onNext }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>(defaultValues?.files ?? []);
  const [sheetUrl, setSheetUrl] = useState(defaultValues?.sheetUrl ?? "");
  const [sheetError, setSheetError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDropFiles = useCallback((dropped: File[]) => {
    const valid: File[] = [];
    dropped.forEach((f) => {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) return;
      valid.push(f);
    });
    setFiles((prev) => [...prev, ...valid.map(buildUploadedFile)]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleUpdateMetadata = useCallback(
    (id: string, updates: Partial<FileMetadata>) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, metadata: { ...f.metadata, ...updates } } : f
        )
      );
    },
    []
  );

  const sourceDocs = files.filter(
    (f) =>
      f.metadata.interpretationMode === "layout_source" ||
      f.metadata.interpretationMode === "strict_source"
  );
  const hasConflict = sourceDocs.length > 1;

  async function handleContinue() {
    if (sheetUrl.trim() && !validateSheetUrl(sheetUrl.trim())) {
      setSheetError("URL phải là link Google Spreadsheet hợp lệ");
      return;
    }
    setSheetError("");
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 300));
    setIsProcessing(false);
    onNext({ files, sheetUrl: sheetUrl.trim() });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">
          Upload tài liệu tham khảo
        </p>
        <p className="text-xs text-white/25">
          Hình ảnh, sổ đỏ, bản vẽ hiện trạng, file DWG/PDF... — tối đa {MAX_FILE_SIZE_MB}MB/file
        </p>
      </div>

      <FileDropzone
        onFiles={handleDropFiles}
        accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,.dwg,.dxf,.xls,.xlsx,.csv,.mp4,.mov,.avi,.webm,.mkv"
        maxSizeMB={MAX_FILE_SIZE_MB}
        label="Nhấn hoặc kéo file vào đây"
        sublabel="JPG, PNG, PDF, DWG, XLSX, MP4... — Tối đa 200MB/file"
      />

      <AnimatePresence>
        {hasConflict && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{
              background: "rgba(234,179,8,0.07)",
              border: "1px solid rgba(234,179,8,0.22)",
            }}
          >
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-yellow-400" />
            <div>
              <p className="text-sm font-semibold text-yellow-300">Phát hiện xung đột nguồn</p>
              <p className="text-xs text-yellow-400/65 mt-0.5">
                Có {sourceDocs.length} file đều được đánh dấu là nguồn layout/chính xác. Hãy chỉ
                giữ 1 file làm nguồn chính; các file còn lại nên chuyển sang "Chỉ tham khảo".
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30">
              {files.length} file đã chọn — nhấn ▾ để chỉnh metadata
            </p>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {files.map((f) => (
                  <FileListItem
                    key={f.id}
                    file={f}
                    totalFloors={totalFloors}
                    onRemove={handleRemove}
                    onUpdateMetadata={handleUpdateMetadata}
                    isConflicting={
                      hasConflict &&
                      (f.metadata.interpretationMode === "layout_source" ||
                        f.metadata.interpretationMode === "strict_source")
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40 flex items-center gap-1.5">
          <Link2 size={11} />
          Link Google Sheet (nếu có)
        </label>
        <input
          type="url"
          value={sheetUrl}
          onChange={(e) => {
            setSheetUrl(e.target.value);
            if (sheetError) setSheetError("");
          }}
          placeholder="https://docs.google.com/spreadsheets/..."
          className={INPUT}
        />
        <AnimatePresence>
          {sheetError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-[11px]"
            >
              {sheetError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        <Lock size={11} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
          Tài liệu được mã hóa &amp; chỉ dùng để thiết kế cho bạn
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <ArrowLeft size={15} />
          Quay lại
        </motion.button>

        <motion.button
          type="button"
          onClick={handleContinue}
          disabled={isProcessing}
          whileHover={!isProcessing ? { scale: 1.02, boxShadow: "0 6px 28px rgba(255,149,0,0.45)" } : {}}
          whileTap={!isProcessing ? { scale: 0.97 } : {}}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm"
          style={{
            background: isProcessing
              ? "rgba(255,149,0,0.55)"
              : "linear-gradient(135deg, #ff9500, #ff6b00)",
            boxShadow: isProcessing ? "none" : "0 4px 20px rgba(255,149,0,0.3)",
            cursor: isProcessing ? "not-allowed" : "pointer",
          }}
        >
          {isProcessing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ArrowRight size={15} />
          )}
          {isProcessing ? "Đang xử lý..." : "Hoàn thành"}
        </motion.button>
      </div>
    </div>
  );
}
