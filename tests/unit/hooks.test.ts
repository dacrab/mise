/**
 * Unit tests for useAsyncAction and useConfirmAction hooks.
 * Uses renderHook + act from @testing-library/react.
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Mock toast so hooks don't need a provider ──────────────────────────────────
const mockToast = vi.fn();
vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useConfirmAction } from "@/hooks/useConfirmAction";

beforeEach(() => {
  vi.useFakeTimers();
  mockToast.mockClear();
});
afterEach(() => {
  vi.useRealTimers();
});

// ─────────────────────────────────────────────────────────────────────────────
// useAsyncAction
// ─────────────────────────────────────────────────────────────────────────────

describe("useAsyncAction", () => {
  it("starts with isPending = false", () => {
    const { result } = renderHook(() => useAsyncAction(async () => {}));
    expect(result.current.isPending).toBe(false);
  });

  it("sets isPending true while action runs, false after", async () => {
    let resolveFn!: () => void;
    const action = () => new Promise<void>((res) => { resolveFn = res; });
    const { result } = renderHook(() => useAsyncAction(action));

    // Start execution (don't await yet)
    let execPromise: Promise<unknown>;
    act(() => { execPromise = result.current.execute(); });

    expect(result.current.isPending).toBe(true);

    // Resolve the async action
    await act(async () => { resolveFn(); await execPromise; });

    expect(result.current.isPending).toBe(false);
  });

  it("toasts successMessage on success", async () => {
    const { result } = renderHook(() =>
      useAsyncAction(async () => {}, { successMessage: "Done!" })
    );
    await act(async () => { await result.current.execute(); });
    expect(mockToast).toHaveBeenCalledWith("Done!", "success");
  });

  it("toasts errorMessage on failure", async () => {
    const { result } = renderHook(() =>
      useAsyncAction(async () => { throw new Error("boom"); }, { errorMessage: "Failed!" })
    );
    await act(async () => { await result.current.execute(); });
    expect(mockToast).toHaveBeenCalledWith("Failed!", "error");
  });

  it("toasts error.message when no errorMessage option provided", async () => {
    const { result } = renderHook(() =>
      useAsyncAction(async () => { throw new Error("raw error"); })
    );
    await act(async () => { await result.current.execute(); });
    expect(mockToast).toHaveBeenCalledWith("raw error", "error");
  });

  it("calls onSuccess with the return value", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useAsyncAction(async () => 42, { onSuccess })
    );
    await act(async () => { await result.current.execute(); });
    expect(onSuccess).toHaveBeenCalledWith(42);
  });

  it("calls onError with an Error on failure", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAsyncAction(async () => { throw new Error("oops"); }, { onError })
    );
    await act(async () => { await result.current.execute(); });
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0]?.[0]?.message).toBe("oops");
  });

  it("ignores calls while already pending (returns undefined)", async () => {
    let resolveFn!: () => void;
    const action = vi.fn(() => new Promise<void>((res) => { resolveFn = res; }));
    const { result } = renderHook(() => useAsyncAction(action));

    let p1: Promise<unknown>, p2: Promise<unknown>;
    act(() => { p1 = result.current.execute(); });
    act(() => { p2 = result.current.execute(); }); // second call while pending

    const r2 = await act(async () => { resolveFn(); return p2; });
    await act(async () => p1);

    expect(action).toHaveBeenCalledTimes(1); // only one real invocation
    expect(r2).toBeUndefined();
  });

  it("returns the action result on success", async () => {
    const { result } = renderHook(() => useAsyncAction(async () => "hello"));
    const val = await act(async () => result.current.execute());
    expect(val).toBe("hello");
  });

  it("returns undefined on failure", async () => {
    const { result } = renderHook(() =>
      useAsyncAction(async () => { throw new Error("x"); })
    );
    const val = await act(async () => result.current.execute());
    expect(val).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useConfirmAction
// ─────────────────────────────────────────────────────────────────────────────

describe("useConfirmAction", () => {
  it("starts with pendingId = null", () => {
    const { result } = renderHook(() =>
      useConfirmAction(async () => {})
    );
    expect(result.current.pendingId).toBeNull();
  });

  it("first trigger arms pendingId and shows confirmMessage toast", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useConfirmAction(action, { confirmMessage: "Are you sure?" })
    );

    await act(async () => { await result.current.trigger("id1"); });

    expect(result.current.pendingId).toBe("id1");
    expect(mockToast).toHaveBeenCalledWith("Are you sure?", "info");
    expect(action).not.toHaveBeenCalled();
  });

  it("second trigger with same id executes the action", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() => useConfirmAction(action));

    await act(async () => { await result.current.trigger("id1"); });
    await act(async () => { await result.current.trigger("id1"); });

    expect(action).toHaveBeenCalledWith("id1");
    expect(result.current.pendingId).toBeNull();
  });

  it("second trigger with different id re-arms and does not execute", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() => useConfirmAction(action));

    await act(async () => { await result.current.trigger("id1"); });
    await act(async () => { await result.current.trigger("id2"); }); // different id

    expect(action).not.toHaveBeenCalled();
    expect(result.current.pendingId).toBe("id2");
  });

  it("resets pendingId after timeout", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useConfirmAction(action, { timeout: 3000 })
    );

    await act(async () => { await result.current.trigger("id1"); });
    expect(result.current.pendingId).toBe("id1");

    act(() => { vi.advanceTimersByTime(3001); });
    expect(result.current.pendingId).toBeNull();
  });

  it("toasts successMessage after successful action", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useConfirmAction(action, { successMessage: "Deleted!" })
    );

    await act(async () => { await result.current.trigger("id1"); });
    await act(async () => { await result.current.trigger("id1"); });

    expect(mockToast).toHaveBeenCalledWith("Deleted!", "success");
  });

  it("toasts errorMessage when action throws", async () => {
    const action = vi.fn(async () => { throw new Error("nope"); });
    const { result } = renderHook(() =>
      useConfirmAction(action, { errorMessage: "Could not delete" })
    );

    await act(async () => { await result.current.trigger("id1"); });
    await act(async () => { await result.current.trigger("id1"); });

    expect(mockToast).toHaveBeenCalledWith("Could not delete", "error");
  });

  it("calls onSuccess callback after successful action", async () => {
    const onSuccess = vi.fn();
    const action = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useConfirmAction(action, { onSuccess })
    );

    await act(async () => { await result.current.trigger("id1"); });
    await act(async () => { await result.current.trigger("id1"); });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("clears existing timer when re-triggered with new id", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useConfirmAction(action, { timeout: 3000 })
    );

    await act(async () => { await result.current.trigger("id1"); });
    act(() => { vi.advanceTimersByTime(1500); }); // half timeout

    await act(async () => { await result.current.trigger("id2"); }); // re-arm with new id

    act(() => { vi.advanceTimersByTime(1600); }); // would have expired id1 timer
    expect(result.current.pendingId).toBe("id2"); // id2 timer still running

    act(() => { vi.advanceTimersByTime(1500); }); // now id2 timer expires
    expect(result.current.pendingId).toBeNull();
  });
});
