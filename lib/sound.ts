const SOUND_PREF_KEY = "starks-sound-enabled";
const SOUND_PREF_EVENT = "starks-sound-preference";
const FALLBACK_BLEEP_SRC = "/sfx/bleep.wav";

let audioContextInstance: AudioContext | null = null;
let fallbackAudio: HTMLAudioElement | null = null;
let hasInteractionLock = false;
let setupDone = false;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioContextInstance) {
    const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) {
      audioContextInstance = new Ctor();
    }
  }
  return audioContextInstance;
}

function getFallbackAudio() {
  if (typeof window === "undefined") return null;
  if (!fallbackAudio) {
    fallbackAudio = new Audio(FALLBACK_BLEEP_SRC);
    fallbackAudio.preload = "auto";
    fallbackAudio.volume = 0.11;
  }
  return fallbackAudio;
}

function unlockSound() {
  hasInteractionLock = true;
  const context = getAudioContext();
  if (context && context.state === "suspended") {
    void context.resume().catch(() => undefined);
  }
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

  try {
    const context = getAudioContext();
    if (context) {
      if (context.state === "suspended") {
        void context.resume().catch(() => undefined);
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(860, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(520, context.currentTime + 0.08);

      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, context.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.09);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.095);
      return;
    }

    // Fallback for browsers without WebAudio support.
    const audio = getFallbackAudio();
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = 0.11;
    void audio.play().catch(() => undefined);
  } catch {
    // Sound should never break UI.
  }
}
