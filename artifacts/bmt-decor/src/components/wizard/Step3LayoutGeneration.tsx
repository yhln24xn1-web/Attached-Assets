import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import Step3CadProcessing from "@/components/step3/Step3CadProcessing";
import Step3CadResult from "@/components/step3/Step3CadResult";
import Step3CadActions from "@/components/step3/Step3CadActions";
import { STEP3_PROGRESS_MESSAGES } from "@/components/step3/progressMessages";
import { useProjectPolling } from "@/hooks/useProjectPolling";
import { useStep3CadProcess } from "@/hooks/useStep3CadProcess";

const MAX_FAKE_PROGRESS_MS = 10 * 60 * 1000;

interface Props {
  projectId: number;
  onApprove: () => void;
}

function resolveProgressMessage(progress: number): string {
  const matched = [...STEP3_PROGRESS_MESSAGES]
    .reverse()
    .find((item) => progress >= item.percent);

  return matched?.text ?? STEP3_PROGRESS_MESSAGES[0].text;
}

export default function Step3LayoutGeneration({ projectId, onApprove }: Props) {
  const { data: project } = useProjectPolling(projectId);
  const processStep3 = useStep3CadProcess(projectId);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [now, setNow] = useState(Date.now());

  const cadResult = project?.cadResult;
  const drawings = cadResult?.cadDrawings ?? [];
  const hasResult = drawings.length > 0;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!project) return;

    const status = project.cadResult?.status;
    if (status === "idle" && !hasAutoStarted && !processStep3.isPending) {
      setHasAutoStarted(true);
      setStartedAt(Date.now());
      processStep3.mutate();
      return;
    }

    if (startedAt == null) {
      setStartedAt(Date.now());
    }
  }, [hasAutoStarted, processStep3, project, startedAt]);

  const progressState = useMemo(() => {
    if (hasResult) {
      return { progress: 100, message: "Hoàn tất" };
    }

    if (!startedAt) {
      return { progress: 1, message: STEP3_PROGRESS_MESSAGES[0].text };
    }

    const elapsed = now - startedAt;
    if (elapsed > MAX_FAKE_PROGRESS_MS) {
      return {
        progress: 90,
        message: "Hệ thống đang hoàn thiện bản vẽ kỹ thuật...",
      };
    }

    const ratio = Math.max(0, Math.min(1, elapsed / MAX_FAKE_PROGRESS_MS));
    const progress = Math.max(1, Math.min(90, Math.floor(1 + ratio * 89)));

    return {
      progress,
      message: resolveProgressMessage(progress),
    };
  }, [hasResult, now, startedAt]);

  const isFailed = cadResult?.status === "failed" && !processStep3.isPending;

  function handleRetry() {
    setHasAutoStarted(true);
    setStartedAt(Date.now());
    processStep3.mutate();
  }

  return (
    <div className="space-y-4">
      {isFailed && (
        <div
          className="rounded-xl p-3 flex items-center gap-2"
          style={{ background: "rgba(255,72,0,0.12)", border: "1px solid rgba(255,72,0,0.35)" }}
        >
          <AlertCircle className="w-4 h-4" style={{ color: "#ff4800" }} />
          <p className="text-sm text-white/90">Xử lý bản vẽ kỹ thuật chưa thành công, vui lòng thử lại.</p>
        </div>
      )}

      <Step3CadProcessing progress={progressState.progress} message={progressState.message} />

      {hasResult && <Step3CadResult drawings={drawings} />}

      <Step3CadActions
        hasResult={hasResult}
        isRetrying={processStep3.isPending}
        onRetry={handleRetry}
        onApprove={onApprove}
      />
    </div>
  );
}
