import { useQuery } from "@tanstack/react-query";
import type { CadResult } from "@/types/cad";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface ProjectPollingState {
  id: number;
  cadResult: CadResult;
}

export function useProjectPolling(projectId: number | null) {
  return useQuery<ProjectPollingState>({
    queryKey: ["project", projectId],
    queryFn: () => apiFetch<ProjectPollingState>(`/api/projects/${projectId}`),
    enabled: projectId !== null,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;

      const hasDrawings = (data.cadResult?.cadDrawings?.length ?? 0) > 0;
      const status = data.cadResult?.status;

      if (status === "failed") return false;
      if (status === "completed" && hasDrawings) return false;
      return 3000;
    },
  });
}
