interface Props {
  isCompleted: boolean;
  onApprove: () => void;
  onRetry: () => void;
}

export default function Step3CadActions({ isCompleted, onApprove, onRetry }: Props) {
  if (isCompleted) {
    return (
      <div className="flex justify-end mt-4">
        <button
          onClick={onApprove}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #ff7b00, #ff4800)" }}
        >
          Duyệt
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end mt-4">
      <button
        onClick={onRetry}
        className="px-5 py-2 rounded-lg text-sm font-medium text-white/75 border border-white/15 hover:bg-white/5 transition-all"
      >
        Thử lại
      </button>
    </div>
  );
}
