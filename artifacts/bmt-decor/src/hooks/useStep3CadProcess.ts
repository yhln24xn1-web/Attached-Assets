import { useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

interface Step3ProcessResponse {
  ok: boolean;
  status: string;
}

export function useStep3CadProcess(projectId: number | null) {
  const qc = useQueryClient();

  return useMutation<Step3ProcessResponse, Error>({
    mutationFn: () =>
      apiFetch<Step3ProcessResponse>(`/api/projects/${projectId}/process-step-3`, {
        method: "POST",
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}
