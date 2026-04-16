import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { architectureOptions, getFloorKey, getCategoryFromFloors } from "./constants";
import type { ArchitectureFormValues } from "./types";

interface Props {
  floors: number;
  defaultValues?: ArchitectureFormValues | null;
  onBack: () => void;
  onNext: (data: ArchitectureFormValues) => void;
}

export default function Step1Sub2Architecture({ floors, defaultValues, onBack, onNext }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultValues?.architectureId ?? null
  );
  const [selectedStyle, setSelectedStyle] = useState<string | null>(
    defaultValues?.style ?? null
  );

  const floorKey = getFloorKey(floors);
  const filtered = architectureOptions.filter((a) => a.floorKey === floorKey);

  useEffect(() => {
    if (selectedId && !filtered.find((a) => a.id === selectedId)) {
      setSelectedId(null);
      setSelectedStyle(null);
    }
  }, [floorKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedArch = filtered.find((a) => a.id === selectedId);
  const canContinue = !!selectedId && !!selectedStyle;

  function handleContinue() {
    if (!selectedArch || !selectedStyle) return;
    onNext({
      architectureId: selectedArch.id,
      architectureName: selectedArch.name,
      category: getCategoryFromFloors(floors),
      style: selectedStyle,
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">
          Chọn mẫu kiến trúc — {floors} tầng
        </p>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((arch, i) => {
            const isOn = selectedId === arch.id;
            return (
              <motion.button
                key={arch.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSelectedId(arch.id);
                  if (arch.id !== selectedId) setSelectedStyle(null);
                }}
                className="relative rounded-2xl overflow-hidden text-left flex flex-col transition-all duration-250"
                style={{
                  background: isOn ? "rgba(255,123,0,0.08)" : "rgba(255,255,255,0.03)",
                  border: isOn
                    ? "1.5px solid rgba(255,123,0,0.6)"
                    : "1.5px solid rgba(255,255,255,0.07)",
                  boxShadow: isOn
                    ? "0 0 24px rgba(255,100,0,0.22), inset 0 0 20px rgba(255,100,0,0.04)"
                    : "none",
                }}
              >
                {/* Image area */}
                <div className="relative w-full overflow-hidden" style={{ height: 96 }}>
                  <img
                    src={arch.imageUrl}
                    alt={arch.name}
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={{ transform: isOn ? "scale(1.05)" : "scale(1)" }}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {/* Dark overlay for unselected */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      background: isOn
                        ? "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(255,80,0,0.08) 100%)"
                        : "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 100%)",
                    }}
                  />
                  {/* Selected check */}
                  <AnimatePresence>
                    {isOn && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="absolute top-2 right-2 rounded-full p-0.5"
                        style={{ background: "rgba(255,100,0,0.9)", boxShadow: "0 2px 8px rgba(255,80,0,0.5)" }}
                      >
                        <CheckCircle2 size={13} className="text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Text area */}
                <div className="px-3 pt-2.5 pb-3 flex flex-col gap-1">
                  <span
                    className="text-[13px] font-semibold leading-snug"
                    style={{ color: isOn ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.62)" }}
                  >
                    {arch.name}
                  </span>
                  <span
                    className="text-[10px] leading-relaxed"
                    style={{ color: isOn ? "rgba(255,160,60,0.7)" : "rgba(255,255,255,0.22)" }}
                  >
                    {arch.interiors.slice(0, 3).join(" · ")}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Interior style picker */}
      <AnimatePresence mode="wait">
        {selectedArch && (
          <motion.div
            key={selectedArch.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3 rounded-2xl p-4"
            style={{
              background: "rgba(255,123,0,0.04)",
              border: "1px solid rgba(255,123,0,0.12)",
            }}
          >
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Phong cách nội thất cho{" "}
              <strong style={{ color: "#ff9500" }}>{selectedArch.name}</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedArch.interiors.map((style, i) => {
                const isChosen = selectedStyle === style;
                return (
                  <motion.button
                    key={style}
                    type="button"
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setSelectedStyle(style)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                    style={{
                      background: isChosen
                        ? "linear-gradient(135deg, #ff7b00, #ff4800)"
                        : "rgba(255,255,255,0.05)",
                      border: isChosen
                        ? "1px solid rgba(255,123,0,0.35)"
                        : "1px solid rgba(255,255,255,0.09)",
                      color: isChosen ? "#fff" : "rgba(255,255,255,0.5)",
                      boxShadow: isChosen ? "0 2px 14px rgba(255,100,0,0.3)" : "none",
                    }}
                  >
                    {style}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </motion.button>

        <motion.button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          whileHover={canContinue ? { scale: 1.02, boxShadow: "0 6px 28px rgba(255,100,0,0.45)" } : {}}
          whileTap={canContinue ? { scale: 0.97 } : {}}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
          style={{
            background: canContinue
              ? "linear-gradient(135deg, #ff7b00, #ff4800)"
              : "rgba(255,255,255,0.05)",
            border: canContinue ? "none" : "1px solid rgba(255,255,255,0.08)",
            color: canContinue ? "#fff" : "rgba(255,255,255,0.25)",
            boxShadow: canContinue ? "0 4px 20px rgba(255,100,0,0.3)" : "none",
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
        >
          Tiếp tục
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
