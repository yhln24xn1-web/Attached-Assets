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

interface ProjectState {
  id: number;
  stepStatuses: Record<string, string>;
  cadResult?: CadResult;
}

export function useProjectPolling(projectId: number | null) {
  return useQuery<ProjectState>({
    queryKey: ["project", projectId],
    queryFn: () => {
      if (projectId == null) {
        throw new Error("Không thể polling dự án vì projectId đang trống");
      }
      return apiFetch<ProjectState>(`/api/projects/${projectId}`);
    },
    enabled: projectId != null,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      const drawings = data.cadResult?.cadDrawings ?? [];
      if (drawings.length > 0) return false;
      const status = data.cadResult?.status;
      if (status === "failed") return false;
      return 3000;
    },
  });
}
