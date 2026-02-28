const SOUND_PREF_KEY = "starks-sound-enabled";
const SOUND_PREF_EVENT = "starks-sound-preference";
const BLEEP_SRC = "/sfx/bleep.mp3";

let audioInstance: HTMLAudioElement | null = null;
let hasInteractionLock = false;
let setupDone = false;

function getAudio() {
  if (typeof window === "undefined") return null;
  if (!audioInstance) {
    audioInstance = new Audio(BLEEP_SRC);
    audioInstance.preload = "auto";
    audioInstance.volume = 0.11;
  }
  return audioInstance;
}

function unlockSound() {
  hasInteractionLock = true;
  getAudio();
}

export function initializeSound() {
  if (typeof window === "undefined" || setupDone) return;
  setupDone = true;

  const onFirstInteraction = () => {
    unlockSound();
    window.removeEventListener("pointerdown", onFirstInteraction);
    window.removeEventListener("keydown", onFirstInteraction);
  };

  window.addEventListener("pointerdown", onFirstInteraction, { passive: true });
  window.addEventListener("keydown", onFirstInteraction);
}

export function getSoundEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SOUND_PREF_KEY) === "1";
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOUND_PREF_KEY, enabled ? "1" : "0");
  window.dispatchEvent(new CustomEvent(SOUND_PREF_EVENT, { detail: enabled }));
}

export function onSoundPreferenceChange(callback: (enabled: boolean) => void) {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const custom = event as CustomEvent<boolean>;
    callback(typeof custom.detail === "boolean" ? custom.detail : getSoundEnabled());
  };

  window.addEventListener(SOUND_PREF_EVENT, handler as EventListener);
  return () => window.removeEventListener(SOUND_PREF_EVENT, handler as EventListener);
}

export function playBleep() {
  if (typeof window === "undefined") return;
  if (!getSoundEnabled()) return;
  if (!hasInteractionLock) return;

  const audio = getAudio();
  if (!audio) return;

  try {
    audio.currentTime = 0;
    audio.volume = 0.11;
    void audio.play().catch(() => undefined);
  } catch {
    // Missing or blocked audio should never break UI.
  }
}
