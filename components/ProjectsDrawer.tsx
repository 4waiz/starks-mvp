"use client";

import { useEffect, useState } from "react";
import { Folder, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { OPEN_PROJECTS_DRAWER_EVENT } from "@/lib/hotkeys";
import { playBleep } from "@/lib/sound";
import {
  createProject,
  deleteProject,
  getActiveProjectId,
  getAnalyticsSummary,
  getProjectOutputs,
  getProjects,
  renameProject,
  setActiveProjectId,
  subscribeStorageUpdates,
  type Project,
  type SavedOutput,
} from "@/lib/storage";

export function ProjectsDrawer() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProject] = useState<string | null>(null);
  const [activeOutputs, setActiveOutputs] = useState<SavedOutput[]>([]);
  const [analytics, setAnalytics] = useState({
    generationsToday: 0,
    avgExportSeconds: 0,
    activeProjects: 0,
  });
  const [newProjectName, setNewProjectName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    const refresh = () => {
      const nextActiveId = getActiveProjectId();
      setProjects(getProjects());
      setActiveProject(nextActiveId);
      setActiveOutputs(nextActiveId ? getProjectOutputs(nextActiveId) : []);
      setAnalytics(getAnalyticsSummary());
    };

    refresh();
    const unsubscribe = subscribeStorageUpdates(refresh);
    const onOpen = () => {
      refresh();
      setOpen(true);
    };

    window.addEventListener(OPEN_PROJECTS_DRAWER_EVENT, onOpen);
    return () => {
      unsubscribe();
      window.removeEventListener(OPEN_PROJECTS_DRAWER_EVENT, onOpen);
    };
  }, []);

  const onCreateProject = () => {
    const project = createProject(newProjectName || "New project");
    if (!project) {
      toast.error("Enter a project name.");
      return;
    }
    playBleep();
    setNewProjectName("");
    toast.success(`Project "${project.name}" created.`);
  };

  const onSaveRename = () => {
    if (!editingId) return;
    renameProject(editingId, editingName);
    setEditingId(null);
    setEditingName("");
    toast.success("Project renamed.");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[92vw] max-w-lg p-5">
        <SheetHeader>
          <SheetTitle>Projects workspace</SheetTitle>
          <SheetDescription>Manage local projects and saved outputs.</SheetDescription>
        </SheetHeader>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">generations today</p>
            <p className="mt-1 text-lg font-semibold text-white">{analytics.generationsToday}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">avg export time</p>
            <p className="mt-1 text-lg font-semibold text-white">{analytics.avgExportSeconds || 0}s</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">active projects</p>
            <p className="mt-1 text-lg font-semibold text-white">{analytics.activeProjects}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3">
          <label className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-white/55">create project</label>
          <div className="flex gap-2">
            <input
              value={newProjectName}
              onChange={(event) => setNewProjectName(event.target.value)}
              placeholder="e.g. Studio Roster A"
              className="h-11 w-full rounded-xl border border-white/10 bg-[#070b1d]/85 px-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/60"
            />
            <Button className="min-h-11 px-4" onClick={onCreateProject}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {projects.length ? (
            projects.map((project) => (
              <div
                key={project.id}
                className={`rounded-2xl border p-3 ${
                  activeProjectId === project.id
                    ? "border-[#8b5cf6]/55 bg-[#8b5cf6]/12"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-2 text-left"
                    onClick={() => {
                      setActiveProjectId(project.id);
                      setActiveProject(project.id);
                      setActiveOutputs(getProjectOutputs(project.id));
                      playBleep();
                    }}
                  >
                    <Folder className="mt-0.5 h-4 w-4 text-[#cdb9ff]" />
                    <div>
                      {editingId === project.id ? (
                        <input
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          className="h-8 w-full rounded-lg border border-white/15 bg-black/30 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/60"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-white">{project.name}</p>
                      )}
                      <p className="text-xs text-white/55">{project.savedOutputIds.length} saved outputs</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    {editingId === project.id ? (
                      <Button size="sm" variant="secondary" onClick={onSaveRename}>
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingId(project.id);
                          setEditingName(project.name);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        deleteProject(project.id);
                        if (editingId === project.id) {
                          setEditingId(null);
                          setEditingName("");
                        }
                        toast.success("Project deleted.");
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/20 bg-black/15 p-5 text-center text-sm text-white/60">
              No projects yet. Create your first workspace.
            </div>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/55">saved outputs</p>
          {activeOutputs.length ? (
            <div className="max-h-[180px] space-y-2 overflow-y-auto">
              {activeOutputs.map((output) => (
                <div key={output.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <p className="truncate text-sm text-white/90">{output.actionText}</p>
                  <p className="text-xs text-white/55">{output.summary}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/55">No saved outputs in this project.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
