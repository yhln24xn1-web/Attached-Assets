import type { CadDrawingItem } from "@/types/cad";

interface Props {
  drawings: CadDrawingItem[];
}

export default function Step3CadResult({ drawings }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-white/85">Kết quả bản vẽ kỹ thuật</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drawings.map((drawing) => (
          <div
            key={drawing.id}
            className="rounded-xl p-2"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <img
              src={drawing.imageUrl}
              alt={drawing.caption || drawing.floorName || "CAD drawing"}
              className="w-full rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
