interface Step3CadActionsProps {
  hasResult: boolean;
  isRetrying: boolean;
  onRetry: () => void;
  onApprove: () => void;
}

export default function Step3CadActions({ hasResult, isRetrying, onRetry, onApprove }: Step3CadActionsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-end">
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="px-4 py-2 rounded-lg text-sm text-white/80 border border-white/20 hover:bg-white/5 disabled:opacity-50"
      >
        {isRetrying ? "Đang xử lý..." : "Yêu cầu xử lý lại"}
      </button>
      {hasResult && (
        <button
          onClick={onApprove}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #ff7b00, #ff4800)" }}
        >
          Duyệt thiết kế
        </button>
      )}
    </div>
  );
}
