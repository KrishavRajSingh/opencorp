interface UmamiTracker {
  track: (event_name: string, data?: Record<string, unknown>) => void;
  identify: (unique_id: string, data?: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

export {};
