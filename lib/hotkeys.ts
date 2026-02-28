"use client";

import { useEffect } from "react";

export const OPEN_COMMAND_PALETTE_EVENT = "starks-open-command-palette";
export const OPEN_PROJECTS_DRAWER_EVENT = "starks-open-projects-drawer";
export const APPLY_PRESET_EVENT = "starks-apply-demo-preset";

type Hotkey = {
  key: string;
  metaOrCtrl?: boolean;
  shift?: boolean;
  handler: (event: KeyboardEvent) => void;
};

export function emitOpenCommandPalette() {
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT));
}

export function emitOpenProjectsDrawer() {
  window.dispatchEvent(new Event(OPEN_PROJECTS_DRAWER_EVENT));
}

export function emitApplyPreset(payload: { styleText: string; actionText: string }) {
  window.dispatchEvent(
    new CustomEvent(APPLY_PRESET_EVENT, {
      detail: payload,
    }),
  );
}

export function useHotkeys(hotkeys: Hotkey[]) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const eventKey = typeof event.key === "string" ? event.key.toLowerCase() : "";
      if (!eventKey) return;

      hotkeys.forEach((hotkey) => {
        const matchKey = eventKey === hotkey.key.toLowerCase();
        const matchMeta = hotkey.metaOrCtrl ? event.metaKey || event.ctrlKey : true;
        const matchShift =
          typeof hotkey.shift === "boolean" ? event.shiftKey === hotkey.shift : true;

        if (matchKey && matchMeta && matchShift) {
          hotkey.handler(event);
        }
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hotkeys]);
}
