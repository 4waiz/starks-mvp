"use client";

import type { MotionSpec } from "@/lib/motion-schema";

const PROJECTS_KEY = "starks-projects-v1";
const OUTPUTS_KEY = "starks-saved-outputs-v1";
const SHARES_KEY = "starks-shares-v1";
const ACTIVE_PROJECT_KEY = "starks-active-project-v1";
const ANALYTICS_KEY = "starks-analytics-v1";
const TOUR_KEY = "starks-demo-tour-completed-v1";
const RECENT_GENERATIONS_KEY = "starks-recent-generations-v1";
const STORAGE_EVENT = "starks-storage-update";

type AnalyticsEvent = {
  id: string;
  createdAt: string;
  exportTimeMs: number;
};

export type SavedOutput = {
  id: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
  styleText: string;
  actionText: string;
  motionSpec: MotionSpec;
};

export type Project = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  savedOutputIds: string[];
};

export type ShareRecord = {
  id: string;
  createdAt: string;
  output: SavedOutput;
};

export type RecentGeneration = {
  id: string;
  createdAt: string;
  summary: string;
  styleText: string;
  actionText: string;
  motionSpec: MotionSpec;
};

type AnalyticsState = {
  generationEvents: AnalyticsEvent[];
};

function isBrowser() {
  return typeof window !== "undefined";
}

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function emitStorageUpdate() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function todayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function subscribeStorageUpdates(callback: () => void) {
  if (!isBrowser()) return () => undefined;
  window.addEventListener(STORAGE_EVENT, callback);
  return () => window.removeEventListener(STORAGE_EVENT, callback);
}

export function getProjects() {
  return readJson<Project[]>(PROJECTS_KEY, []);
}

export function createProject(name: string) {
  const trimmed = name.trim().slice(0, 48);
  if (!trimmed) return null;

  const now = new Date().toISOString();
  const project: Project = {
    id: uid(),
    name: trimmed,
    createdAt: now,
    updatedAt: now,
    savedOutputIds: [],
  };
  const next = [project, ...getProjects()];
  writeJson(PROJECTS_KEY, next);
  setActiveProjectId(project.id);
  emitStorageUpdate();
  return project;
}

export function renameProject(projectId: string, nextName: string) {
  const trimmed = nextName.trim().slice(0, 48);
  if (!trimmed) return;
  const next = getProjects().map((project) =>
    project.id === projectId
      ? { ...project, name: trimmed, updatedAt: new Date().toISOString() }
      : project,
  );
  writeJson(PROJECTS_KEY, next);
  emitStorageUpdate();
}

export function deleteProject(projectId: string) {
  const next = getProjects().filter((project) => project.id !== projectId);
  writeJson(PROJECTS_KEY, next);
  if (getActiveProjectId() === projectId) {
    const fallback = next[0]?.id ?? null;
    if (fallback) {
      setActiveProjectId(fallback);
    } else if (isBrowser()) {
      window.localStorage.removeItem(ACTIVE_PROJECT_KEY);
    }
  }
  emitStorageUpdate();
}

export function getSavedOutputs() {
  return readJson<SavedOutput[]>(OUTPUTS_KEY, []).sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  );
}

export function getSavedOutputById(outputId: string) {
  return getSavedOutputs().find((output) => output.id === outputId) ?? null;
}

export function getRecentOutputs(limit = 5) {
  return getSavedOutputs().slice(0, limit);
}

export function getActiveProjectId() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setActiveProjectId(projectId: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
  emitStorageUpdate();
}

export function getActiveProject() {
  const activeId = getActiveProjectId();
  if (!activeId) return null;
  return getProjects().find((project) => project.id === activeId) ?? null;
}

export function saveOutputToProject(
  payload: Omit<SavedOutput, "id" | "createdAt" | "updatedAt"> & { id?: string },
  projectId?: string | null,
) {
  const now = new Date().toISOString();
  const existingOutputs = getSavedOutputs();
  const outputId = payload.id ?? uid();
  const existing = existingOutputs.find((item) => item.id === outputId);

  const output: SavedOutput = {
    id: outputId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    summary: payload.summary,
    styleText: payload.styleText,
    actionText: payload.actionText,
    motionSpec: payload.motionSpec,
  };

  const nextOutputs = [output, ...existingOutputs.filter((item) => item.id !== outputId)];
  writeJson(OUTPUTS_KEY, nextOutputs);

  const targetProjectId = projectId ?? getActiveProjectId();
  if (targetProjectId) {
    const nextProjects = getProjects().map((project) => {
      if (project.id !== targetProjectId) return project;
      const hasOutput = project.savedOutputIds.includes(outputId);
      return {
        ...project,
        updatedAt: now,
        savedOutputIds: hasOutput ? project.savedOutputIds : [outputId, ...project.savedOutputIds],
      };
    });
    writeJson(PROJECTS_KEY, nextProjects);
  }

  emitStorageUpdate();
  return output;
}

export function getProjectOutputs(projectId: string) {
  const project = getProjects().find((item) => item.id === projectId);
  if (!project) return [];
  const outputs = getSavedOutputs();
  return project.savedOutputIds
    .map((id) => outputs.find((output) => output.id === id))
    .filter(Boolean) as SavedOutput[];
}

export function createShareRecord(output: SavedOutput) {
  const id = Math.random().toString(36).slice(2, 10);
  const records = readJson<Record<string, ShareRecord>>(SHARES_KEY, {});
  const record: ShareRecord = {
    id,
    createdAt: new Date().toISOString(),
    output,
  };
  records[id] = record;
  writeJson(SHARES_KEY, records);
  emitStorageUpdate();
  return record;
}

export function getShareRecord(shareId: string) {
  const records = readJson<Record<string, ShareRecord>>(SHARES_KEY, {});
  return records[shareId] ?? null;
}

export function recordGenerationAnalytics(exportTimeMs: number) {
  const now = new Date().toISOString();
  const state = readJson<AnalyticsState>(ANALYTICS_KEY, { generationEvents: [] });
  const next: AnalyticsState = {
    generationEvents: [
      { id: uid(), createdAt: now, exportTimeMs },
      ...state.generationEvents,
    ].slice(0, 200),
  };
  writeJson(ANALYTICS_KEY, next);
  emitStorageUpdate();
}

export function pushRecentGeneration(generation: Omit<RecentGeneration, "id" | "createdAt">) {
  const next: RecentGeneration = {
    id: uid(),
    createdAt: new Date().toISOString(),
    ...generation,
  };
  const recents = readJson<RecentGeneration[]>(RECENT_GENERATIONS_KEY, []);
  const merged = [next, ...recents].slice(0, 20);
  writeJson(RECENT_GENERATIONS_KEY, merged);
  emitStorageUpdate();
}

export function getRecentGenerations(limit = 5) {
  return readJson<RecentGeneration[]>(RECENT_GENERATIONS_KEY, []).slice(0, limit);
}

export function getAnalyticsSummary() {
  const state = readJson<AnalyticsState>(ANALYTICS_KEY, { generationEvents: [] });
  const today = todayKey(new Date());
  const todayEvents = state.generationEvents.filter(
    (event) => todayKey(new Date(event.createdAt)) === today,
  );
  const avgExportMs =
    state.generationEvents.reduce((acc, event) => acc + event.exportTimeMs, 0) /
      (state.generationEvents.length || 1) || 0;

  return {
    generationsToday: todayEvents.length,
    avgExportSeconds: avgExportMs ? Math.round(avgExportMs / 100) / 10 : 0,
    activeProjects: getProjects().length,
  };
}

export function getTourCompleted() {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(TOUR_KEY) === "1";
}

export function setTourCompleted() {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOUR_KEY, "1");
}
