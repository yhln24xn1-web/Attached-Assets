import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { CloudUpload } from "lucide-react";

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
}

export default function FileDropzone({
  onFiles,
  accept,
  maxSizeMB = 200,
  label,
  sublabel,
  disabled = false,
}: FileDropzoneProps) {
  const [isDrag, setIsDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDrag(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrag(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDrag(false);
      if (!disabled) onFiles(Array.from(e.dataTransfer.files));
    },
    [disabled, onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) onFiles(Array.from(e.target.files));
      e.target.value = "";
    },
    [onFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.005 } : {}}
      className="relative rounded-2xl border-2 border-dashed transition-all duration-300 select-none"
      style={{
        borderColor: isDrag ? "#ff9500" : "rgba(255,255,255,0.11)",
        background: isDrag ? "rgba(255,149,0,0.07)" : "rgba(255,255,255,0.02)",
        boxShadow: isDrag ? "0 0 22px rgba(255,149,0,0.22)" : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        onChange={handleChange}
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center py-8 sm:py-10 px-6 text-center pointer-events-none">
        <motion.div
          animate={{ y: isDrag ? -6 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mb-3"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: isDrag ? "rgba(255,149,0,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isDrag ? "rgba(255,149,0,0.35)" : "rgba(255,255,255,0.08)"}`,
              transition: "all 0.25s ease",
            }}
          >
            <CloudUpload
              className="w-6 h-6"
              style={{ color: isDrag ? "#ff9500" : "rgba(255,255,255,0.3)" }}
            />
          </div>
        </motion.div>

        <p
          className="text-sm font-semibold transition-colors duration-200"
          style={{ color: isDrag ? "#ff9500" : "rgba(255,255,255,0.55)" }}
        >
          {label ?? "Nhấn hoặc kéo file vào đây"}
        </p>

        <p className="hidden sm:block text-xs mt-1.5 max-w-xs mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.22)" }}>
          {sublabel ?? `JPG, PNG, PDF, DWG, MP4, XLSX — Tối đa ${maxSizeMB}MB/file`}
        </p>
        <p className="sm:hidden text-xs mt-1" style={{ color: "rgba(255,255,255,0.22)" }}>
          Nhấn để chọn file từ thiết bị
        </p>
      </div>
    </motion.div>
  );
}
