import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

interface ProcessResult {
  status:       "processing" | "completed" | "failed";
  layoutResult: import("../components/wizard/types").LayoutResult | null;
  score?:       { total: number };
  issues?:      string[];
}

interface ProjectState {
  id:           number;
  stepStatuses: Record<string, string>;
  layoutResult: import("../components/wizard/types").LayoutResult | null;
  progress:     number;
}

/** Trigger layout generation for a project. */
export function useProcessProject(projectId: number | null) {
  const qc = useQueryClient();

  return useMutation<ProcessResult, Error>({
    mutationFn: () =>
      apiFetch<ProcessResult>(`/api/projects/${projectId}/process`, {
        method: "POST",
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

/** Poll project state every 3 seconds until layout is completed. */
export function useProjectState(projectId: number | null) {
  return useQuery<ProjectState>({
    queryKey: ["project", projectId],
    queryFn:  () => apiFetch<ProjectState>(`/api/projects/${projectId}`),
    enabled:  projectId != null,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      const status = data.stepStatuses["2"];
      if (status === "completed" || status === "failed") return false;
      return 3000;
    },
  });
}

/** Create a new project and return its ID. */
export function useCreateProject() {
  return useMutation<{ id: number }, Error, unknown>({
    mutationFn: (wizardData) =>
      apiFetch<{ id: number }>("/api/projects", {
        method: "POST",
        body:   JSON.stringify({ wizardData }),
      }),
  });
}
