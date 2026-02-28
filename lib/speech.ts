"use client";

type SpeechCtor = new () => SpeechRecognitionLike;

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: null | (() => void);
  onend: null | (() => void);
  onerror: null | ((event: { error?: string }) => void);
  onresult: null | ((event: SpeechResultEventLike) => void);
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechResultEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechResultLike>;
};

type CallbackConfig = {
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (message: string) => void;
};

export type SpeechController = {
  supported: boolean;
  start: () => void;
  stop: () => void;
  destroy: () => void;
};

function getSpeechCtor(): SpeechCtor | null {
  if (typeof window === "undefined") return null;
  const scopedWindow = window as Window & {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };

  return scopedWindow.SpeechRecognition ?? scopedWindow.webkitSpeechRecognition ?? null;
}

export function createSpeechController(config: CallbackConfig): SpeechController {
  const ctor = getSpeechCtor();
  if (!ctor) {
    return {
      supported: false,
      start: () => undefined,
      stop: () => undefined,
      destroy: () => undefined,
    };
  }

  const recognition = new ctor();
  recognition.lang = config.lang ?? "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    config.onStart?.();
  };

  recognition.onend = () => {
    config.onEnd?.();
  };

  recognition.onerror = (event) => {
    const message = event.error ? `Speech error: ${event.error}` : "Speech recognition failed.";
    config.onError?.(message);
  };

  recognition.onresult = (event) => {
    let interim = "";
    let finalText = "";

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const transcript = result?.[0]?.transcript?.trim();
      if (!transcript) continue;
      if (result.isFinal) {
        finalText += `${transcript} `;
      } else {
        interim += `${transcript} `;
      }
    }

    if (interim.trim()) {
      config.onInterim?.(interim.trim());
    }
    if (finalText.trim()) {
      config.onFinal?.(finalText.trim());
    }
  };

  return {
    supported: true,
    start: () => {
      try {
        recognition.start();
      } catch {
        // Browser can throw if start is called twice.
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // No-op.
      }
    },
    destroy: () => {
      try {
        recognition.abort();
      } catch {
        // No-op.
      }
    },
  };
}
