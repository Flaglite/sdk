import { afterEach, expect, test, vi } from "vitest";
import { FlagLiteClient } from "../client";

afterEach(() => {
  vi.restoreAllMocks();
});

test("caches flags on fetch", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { key: "beta-ui", value: { boolean: true } },
        { key: "rollout", value: { percentage: 25 } },
      ],
    })
  );

  const sdk = new FlagLiteClient({
    apiUrl: "http://localhost:3000/api",
    projectPublicId: "abc",
    apiKey: "dummy",
    refreshInterval: 0,
  });

  await new Promise((r) => setTimeout(r, 0));

  expect(sdk.get("beta-ui")).toEqual({ boolean: true });
  expect(sdk.get("rollout")).toEqual({ percentage: 25 });

  sdk.stop();
});
