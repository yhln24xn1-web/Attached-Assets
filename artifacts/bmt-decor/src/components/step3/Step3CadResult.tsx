import type { CadDrawingItem } from "@/types/cad";

interface Step3CadResultProps {
  drawings: CadDrawingItem[];
}

export default function Step3CadResult({ drawings }: Step3CadResultProps) {
  if (drawings.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {drawings.map((drawing) => (
        <div
          key={drawing.id}
          className="rounded-xl p-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <img
            src={drawing.imageUrl}
            alt={drawing.floorName ? `Mặt bằng ${drawing.floorName}` : "Mặt bằng kỹ thuật"}
            className="w-full rounded-lg object-cover"
          />
          <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            {drawing.floorName ?? "Bản vẽ kỹ thuật"}
          </p>
        </div>
      ))}
    </div>
  );
}
