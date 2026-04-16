import { STEP3_PROGRESS_MESSAGES } from "./progressMessages";

interface Props {
  percent: number;
}

function getCurrentMessage(percent: number) {
  const sorted = [...STEP3_PROGRESS_MESSAGES].sort((a, b) => a.percent - b.percent);
  let current = sorted[0]?.text ?? "";
  for (const item of sorted) {
    if (percent >= item.percent) current = item.text;
  }
  return current;
}

export default function Step3CadProcessing({ percent }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 px-4">
      <div className="text-center space-y-1">
        <p className="text-white font-semibold text-base">{getCurrentMessage(percent)}</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
          Hệ thống đang hoàn thiện bản vẽ kỹ thuật...
        </p>
      </div>

      <div className="w-full max-w-sm">
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${percent}%`, background: "linear-gradient(90deg, #ff7b00, #ff4800)" }}
          />
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
          {percent}%
        </p>
      </div>
    </div>
  );
}
