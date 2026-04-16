import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle2, AlertCircle, LayoutGrid } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useProcessProject, useProjectState } from "@/hooks/useProjectProcess";
import type { LayoutResult, GeomRoom } from "@/components/wizard/types";

// ── Room colours by type ───────────────────────────────────────────────────

const ROOM_COLORS: Record<string, string> = {
  stair:          "rgba(160,174,192,0.28)",
  corridor:       "rgba(255,255,255,0.07)",
  shaft:          "rgba(99,235,224,0.2)",
  garage:         "rgba(200,140,60,0.28)",
  living_room:    "rgba(255,123,0,0.28)",
  kitchen:        "rgba(251,191,36,0.28)",
  dining_room:    "rgba(252,211,77,0.22)",
  master_bedroom: "rgba(99,179,237,0.32)",
  bedroom:        "rgba(99,179,237,0.22)",
  bathroom:       "rgba(56,178,172,0.28)",
  altar_room:     "rgba(214,158,46,0.28)",
  office:         "rgba(154,117,214,0.28)",
  back_yard:      "rgba(154,230,180,0.18)",
  terrace:        "rgba(154,230,180,0.2)",
  storage:        "rgba(160,174,192,0.18)",
};
function roomColor(type: string): string {
  return ROOM_COLORS[type] ?? "rgba(255,255,255,0.08)";
}

// ── SVG floor plan ─────────────────────────────────────────────────────────

function FloorPlanSVG({
  geometry,
  bw,
  bd,
}: {
  geometry:  GeomRoom[];
  bw:        number;
  bd:        number;
}) {
  const VIEW_W = 280;
  const VIEW_H = 220;
  const PAD    = 10;
  const scaleX = (VIEW_W - PAD * 2) / Math.max(bw, 0.01);
  const scaleY = (VIEW_H - PAD * 2) / Math.max(bd, 0.01);

  function sx(v: number) { return PAD + v * scaleX; }
  function sy(v: number) { return PAD + v * scaleY; }
  function sw(v: number) { return v * scaleX; }
  function sh(v: number) { return v * scaleY; }

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full h-full"
      style={{ maxHeight: 220 }}
    >
      {/* Boundary */}
      <rect
        x={PAD} y={PAD}
        width={sw(bw)} height={sh(bd)}
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,123,0,0.3)"
        strokeWidth={1}
        rx={2}
      />

      {geometry.map((room) => {
        const x = sx(room.x);
        const y = sy(room.y);
        const w = sw(room.width);
        const h = sh(room.height);
        if (w < 2 || h < 2) return null;

        const isStair = room.type === "stair";
        return (
          <g key={room.id}>
            <rect
              x={x} y={y} width={w} height={h}
              fill={roomColor(room.type)}
              stroke={isStair ? "rgba(255,123,0,0.5)" : "rgba(255,255,255,0.12)"}
              strokeWidth={isStair ? 1.5 : 0.8}
              rx={1}
            />
            {/* Label if room is big enough */}
            {w > 28 && h > 14 && (
              <text
                x={x + w / 2}
                y={y + h / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(8, w / 5, h / 3)}
                fill="rgba(255,255,255,0.65)"
                style={{ userSelect: "none" }}
              >
                {room.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Fake progress bar ──────────────────────────────────────────────────────

function FakeProgressBar({ running }: { running: boolean }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!running) return;
    setPct(0);
    const id = setInterval(() => {
      setPct((prev) => {
        if (prev >= 88) { clearInterval(id); return 88; }
        return prev + (prev < 30 ? 3 : prev < 60 ? 2 : 0.7);
      });
    }, 180);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div
      className="w-full h-1.5 rounded-full overflow-hidden"
      style={{ background: "rgba(255,255,255,0.08)" }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg, #ff7b00, #ff4800)" }}
        animate={{ width: `${running ? pct : 100}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

// ── Loading state UI ───────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 px-4">
      {/* Animated icon */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(255,123,0,0.08)",
            border:     "1px solid rgba(255,123,0,0.2)",
          }}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <LayoutGrid className="w-9 h-9" style={{ color: "#ff7b00" }} />
          </motion.div>
        </div>
        {/* Scanner line */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #ff7b00, transparent)" }}
          animate={{ top: ["10%", "90%", "10%"] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
        />
      </div>

      <div className="text-center space-y-1">
        <p className="text-white font-semibold text-base">AI đang phân tích và tạo mặt bằng…</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
          Quá trình này có thể mất 1–2 phút. Vui lòng không đóng trình duyệt.
        </p>
      </div>

      <div className="w-full max-w-xs">
        <FakeProgressBar running />
      </div>
    </div>
  );
}

// ── Error state UI ─────────────────────────────────────────────────────────

function ErrorState({ issues, onRetry }: { issues?: string[]; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 px-4 text-center">
      <AlertCircle className="w-10 h-10" style={{ color: "#ff4800" }} />
      <p className="text-white font-semibold">Sinh layout thất bại</p>
      {issues && issues.length > 0 && (
        <ul className="text-xs space-y-1 max-w-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          {issues.slice(0, 5).map((iss, i) => <li key={i}>• {iss}</li>)}
        </ul>
      )}
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white border transition-all hover:bg-white/5"
        style={{ border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <RefreshCw className="w-4 h-4" />
        Thử lại
      </button>
    </div>
  );
}

// ── Result state UI ────────────────────────────────────────────────────────

function ResultState({
  layout,
  onRegenerate,
  onApprove,
}: {
  layout:        LayoutResult;
  onRegenerate:  () => void;
  onApprove:     () => void;
}) {
  const [confirmRegen, setConfirmRegen] = useState(false);

  const tabValues = layout.floors.map((f) => String(f.floor));
  const [activeTab, setActiveTab] = useState(tabValues[0] ?? "0");

  const currentFloor = layout.floors.find((f) => String(f.floor) === activeTab) ?? layout.floors[0];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="overflow-x-auto flex w-full rounded-xl p-1"
          style={{
            background: "rgba(255,255,255,0.04)",
            border:     "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {layout.floors.map((f) => (
            <TabsTrigger
              key={f.floor}
              value={String(f.floor)}
              className="flex-shrink-0 text-xs rounded-lg px-3 py-1.5 transition-all data-[state=active]:text-white"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {f.floorName}
            </TabsTrigger>
          ))}
        </TabsList>

        {layout.floors.map((f) => (
          <TabsContent key={f.floor} value={String(f.floor)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={f.floor}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                {/* Floor plan SVG — takes 2 cols on desktop */}
                <div
                  className="lg:col-span-2 rounded-xl p-3 flex items-center justify-center"
                  style={{
                    background:  "rgba(255,255,255,0.03)",
                    border:      "1px solid rgba(255,123,0,0.18)",
                    boxShadow:   "0 0 20px rgba(255,100,0,0.06)",
                    minHeight:   240,
                  }}
                >
                  <FloorPlanSVG
                    geometry={f.geometry ?? []}
                    bw={layout.buildableWidth}
                    bd={layout.buildableDepth}
                  />
                </div>

                {/* Room list */}
                <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                    DANH SÁCH PHÒNG
                  </p>
                  {(f.rooms ?? []).map((room, ri) => (
                    <div key={ri}>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-white/80">{room.name}</span>
                        <span className="text-sm tabular-nums" style={{ color: "#ff7b00" }}>
                          {room.area.toFixed(1)} m²
                        </span>
                      </div>
                      {ri < f.rooms.length - 1 && (
                        <div style={{ borderTop: "1px dashed rgba(255,255,255,0.07)" }} />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>

      {/* Summary row */}
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)" }}
      >
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#22c55e" }} />
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          Mặt bằng đã được xác thực — không có phòng chồng lấn, đúng số lượng phòng.
        </p>
      </div>

      {void currentFloor /* suppress unused */}

      {/* Actions — sticky bottom on mobile, inline on desktop */}
      <div className="lg:flex lg:justify-end gap-3 hidden">
        {confirmRegen ? (
          <>
            <p className="text-xs self-center" style={{ color: "rgba(255,255,255,0.45)" }}>Xác nhận tạo lại?</p>
            <button onClick={() => setConfirmRegen(false)} className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white border border-white/10 transition-all">Huỷ</button>
            <button onClick={onRegenerate} className="px-4 py-2 rounded-lg text-sm text-white border border-white/20 hover:bg-white/5 transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Tạo lại
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setConfirmRegen(true)} className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white border border-white/10 transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Tạo lại
            </button>
            <button
              onClick={onApprove}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #ff7b00, #ff4800)", boxShadow: "0 0 18px rgba(255,100,0,0.35)" }}
            >
              <CheckCircle2 className="w-4 h-4" /> Duyệt thiết kế
            </button>
          </>
        )}
      </div>

      {/* Mobile sticky actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 flex gap-3"
        style={{ background: "rgba(10,14,22,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <button
          onClick={() => { if (!confirmRegen) { setConfirmRegen(true); } else { onRegenerate(); } }}
          className="flex-1 py-3 rounded-xl text-sm font-medium text-white/70 border border-white/15 flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          {confirmRegen ? "Xác nhận" : "Tạo lại"}
        </button>
        <button
          onClick={onApprove}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
          style={{ background: "linear-gradient(135deg, #ff7b00, #ff4800)" }}
        >
          <CheckCircle2 className="w-4 h-4" /> Duyệt
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface Props {
  projectId: number;
  onApprove: () => void;
}

export default function Step3LayoutGeneration({ projectId, onApprove }: Props) {
  const { data: project }  = useProjectState(projectId);
  const processProject     = useProcessProject(projectId);

  const status      = project?.stepStatuses?.["2"];
  const layoutResult = project?.layoutResult as LayoutResult | null | undefined;

  // Auto-trigger on mount
  useEffect(() => {
    if (status === "completed" || status === "processing") return;
    processProject.mutate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function handleRegenerate() {
    processProject.mutate();
  }

  const isProcessing = status === "processing" || processProject.isPending;
  const isFailed     = status === "failed"    && !processProject.isPending;
  const isDone       = status === "completed"  && layoutResult != null;

  return (
    <div>
      <AnimatePresence mode="wait">
        {isProcessing && !isDone && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <LoadingState />
          </motion.div>
        )}

        {isFailed && !isDone && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ErrorState
              issues={processProject.error ? [processProject.error.message] : []}
              onRetry={handleRegenerate}
            />
          </motion.div>
        )}

        {isDone && layoutResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <ResultState
              layout={layoutResult}
              onRegenerate={handleRegenerate}
              onApprove={onApprove}
            />
          </motion.div>
        )}

        {/* Fallback while waiting for first poll */}
        {!isProcessing && !isFailed && !isDone && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LoadingState />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
