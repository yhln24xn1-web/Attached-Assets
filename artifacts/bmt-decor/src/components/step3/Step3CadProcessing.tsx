interface Step3CadProcessingProps {
  progress: number;
  message: string;
}

export default function Step3CadProcessing({ progress, message }: Step3CadProcessingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 px-4">
      <div className="w-full max-w-lg space-y-2">
        <div className="flex items-center justify-between text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
          <span>Đang xử lý bản vẽ kỹ thuật</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #ff7b00, #ff4800)" }}
          />
        </div>
      </div>

      <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.8)" }}>
        {message}
      </p>
    </div>
  );
}
