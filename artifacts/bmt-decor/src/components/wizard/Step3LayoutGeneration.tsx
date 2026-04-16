import { useEffect, useMemo, useState } from "react";
import Step3CadProcessing from "@/components/step3/Step3CadProcessing";
import Step3CadResult from "@/components/step3/Step3CadResult";
import Step3CadActions from "@/components/step3/Step3CadActions";
import { STEP3_PROGRESS_MESSAGES } from "@/components/step3/progressMessages";
import { useStep3CadProcess } from "@/hooks/useStep3CadProcess";
import { useProjectPolling } from "@/hooks/useProjectPolling";

interface Props {
  projectId: number;
  onApprove: () => void;
}

const MAX_DURATION_MS = 10 * 60 * 1000;

function calculateProgress(startedAt: number) {
  const now = Date.now();
  const elapsed = Math.max(0, now - startedAt);
  const ratio = Math.min(elapsed / MAX_DURATION_MS, 1);

  const milestones = STEP3_PROGRESS_MESSAGES.filter((m) => m.percent < 100);
  let progress = milestones[0]?.percent ?? 1;
  for (const milestone of milestones) {
    if (ratio >= milestone.percent / 100) progress = milestone.percent;
  }

  return Math.min(progress, 90);
}

export default function Step3LayoutGeneration({ projectId, onApprove }: Props) {
  const processStep3 = useStep3CadProcess(projectId);
  const { data: project, error } = useProjectPolling(projectId);
  const drawings = project?.cadResult?.cadDrawings ?? [];
  const isDone = drawings.length > 0;

  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!project) return;
    const status = project.cadResult?.status;
    if (isDone || status === "pending_admin_cad" || status === "receiving_admin_cad") return;
    if (processStep3.isPending) return;
    processStep3.mutate();
    setStartedAt(Date.now());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, project?.id]);

  useEffect(() => {
    if (isDone) {
      setProgress(100);
      return;
    }
    if (startedAt == null) return;

    const id = setInterval(() => {
      setProgress(calculateProgress(startedAt));
    }, 1000);
    return () => clearInterval(id);
  }, [isDone, startedAt]);

  const isFailed = project?.cadResult?.status === "failed" || processStep3.isError;

  const errorMessage = useMemo(() => {
    if (processStep3.error) return processStep3.error.message;
    if (error) return error.message;
    return "";
  }, [error, processStep3.error]);

  function handleRetry() {
    setStartedAt(Date.now());
    setProgress(1);
    processStep3.mutate();
  }

  return (
    <div>
      {!isDone && <Step3CadProcessing percent={progress} />}

      {isDone && <Step3CadResult drawings={drawings} />}

      {isFailed && (
        <p className="text-xs mt-2" style={{ color: "rgba(255,130,130,0.9)" }}>
          {errorMessage || "Có lỗi trong quá trình xử lý bản vẽ kỹ thuật"}
        </p>
      )}

      <Step3CadActions isCompleted={isDone} onApprove={onApprove} onRetry={handleRetry} />
    </div>
  );
}
