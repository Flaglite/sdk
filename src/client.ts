import type {
  FlagBoolean,
  FlagPercentage,
  FlagRecord,
  FlagSet,
  FlagValue,
} from "./types";

const DEFAULT_API_URL = "https://api.flaglite.co";

export interface FlagLiteOptions {
  projectPublicId: string;
  apiKey: string;
  apiUrl?: string; // e.g. http://127.0.0.1:3000/api for local
  env?: string; // prod | stage | dev
  refreshInterval?: number; // ms; 0 = no polling
  onUpdate?: () => void; // optional callback when cache changes
  onError?: (err: unknown) => void;
}

export class FlagLiteClient {
  private cache = new Map<string, FlagValue>();
  private timer?: ReturnType<typeof setInterval>;
  private opts: Required<
    Pick<
      FlagLiteOptions,
      "projectPublicId" | "apiKey" | "apiUrl" | "env" | "refreshInterval"
    >
  > &
    Partial<Pick<FlagLiteOptions, "onUpdate" | "onError">>;
  private _ready: Promise<void>;
  private _resolveReady!: () => void;

  constructor(opts: FlagLiteOptions) {
    this.opts = {
      apiUrl: DEFAULT_API_URL,
      env: "prod",
      refreshInterval: 30_000,
      ...opts,
    };

    this._ready = new Promise<void>((res) => (this._resolveReady = res));

    this.fetchAndCache();

    if (this.opts.refreshInterval > 0) {
      this.timer = setInterval(
        () => this.fetchAndCache(),
        this.opts.refreshInterval
      );
    }
  }

  async ready(): Promise<void> {
    return this._ready;
  }

  async refresh(): Promise<void> {
    await this.fetchAndCache();
  }

  get(key: string): FlagValue | undefined;
  get(key: string, kind: "boolean"): FlagBoolean | undefined;
  get(key: string, kind: "percentage"): FlagPercentage | undefined;
  get(key: string, kind: "set"): FlagSet | undefined;
  get(key: string, kind?: "boolean" | "percentage" | "set"): any {
    const v = this.cache.get(key);
    return kind ? (v && v.type === kind ? v : undefined) : v;
  }
  boolean(key: string) {
    return this.get(key, "boolean")?.boolean ?? false;
  }
  percentage(key: string) {
    return this.get(key, "percentage")?.percentage ?? 0;
  }
  set(key: string) {
    return this.get(key, "set")?.set ?? [];
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  private async fetchAndCache(): Promise<void> {
    const { apiUrl, projectPublicId, env, apiKey } = this.opts;
    const base = apiUrl.replace(/\/+$/, ""); // trim trailing /
    const url = `${base}/flags/${projectPublicId}?env=${encodeURIComponent(
      env
    )}`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text();
        this.opts.onError?.(
          new Error(`[FlagLite] HTTP ${res.status}: ${txt.slice(0, 500)}`)
        );
        console.error("[FlagLite] fetch error", res.status, txt);
        this._resolveReady();
        return;
      }

      const json = (await res.json()) as FlagRecord[];
      this.cache.clear();
      for (const f of json) this.cache.set(f.key, f.value);
      this.opts.onUpdate?.();
    } catch (err) {
      this.opts.onError?.(err);
      console.error("[FlagLite] fetch failed", err);
    } finally {
      this._resolveReady();
    }
  }
}
