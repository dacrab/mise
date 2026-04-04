/**
 * Unit tests for useAsyncAction and useConfirmAction hooks.
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockToast = vi.fn();
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useConfirmAction } from "@/hooks/useConfirmAction";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

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

    let execPromise!: Promise<unknown>;
    act(() => { execPromise = result.current.execute(); });
    expect(result.current.isPending).toBe(true);

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

  it("does not toast when no successMessage", async () => {
    const { result } = renderHook(() => useAsyncAction(async () => {}));
    await act(async () => { await result.current.execute(); });
    expect(mockToast).not.toHaveBeenCalled();
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

  it("wraps non-Error throws and toasts the message", async () => {
    const { result } = renderHook(() =>
      useAsyncAction(async () => { throw "string error"; })
    );
    await act(async () => { await result.current.execute(); });
    expect(mockToast).toHaveBeenCalledWith("An error occurred", "error");
  });

  it("calls onSuccess with the return value", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useAsyncAction(async () => 42, { onSuccess })
    );
    await act(async () => { await result.current.execute(); });
    expect(onSuccess).toHaveBeenCalledWith(42);
  });

  it("calls onError with an Error instance on failure", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAsyncAction(async () => { throw new Error("oops"); }, { onError })
    );
    await act(async () => { await result.current.execute(); });
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0]?.[0]?.message).toBe("oops");
  });

  it("calls onError and toasts with the resolved message on failure", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAsyncAction(
        async () => { throw new Error("oops"); },
        {
          getErrorMessage: (error) => `Mapped: ${error.message}`,
          onError,
        }
      )
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(mockToast).toHaveBeenCalledWith("Mapped: oops", "error");
  });

  it("passes arguments through to the action", async () => {
    const action = vi.fn(async (a: number, b: string) => `${a}-${b}`);
    const { result } = renderHook(() => useAsyncAction(action));
    const val = await act(async () => result.current.execute(7, "hello"));
    expect(action).toHaveBeenCalledWith(7, "hello");
    expect(val).toBe("7-hello");
  });

  it("ignores concurrent calls while pending and returns undefined", async () => {
    let resolveFn!: () => void;
    const action = vi.fn(() => new Promise<void>((res) => { resolveFn = res; }));
    const { result } = renderHook(() => useAsyncAction(action));

    // Start first call
    let p1!: Promise<unknown>;
    act(() => { p1 = result.current.execute(); });

    // Second call while pending — should be ignored
    const p2 = await act(async () => result.current.execute());

    expect(p2).toBeUndefined();
    expect(action).toHaveBeenCalledTimes(1);

    // Resolve the first call
    await act(async () => { resolveFn(); await p1; });
    expect(result.current.isPending).toBe(false);
  });

  it("allows a new call after the previous one completes", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => { await result.current.execute(); });
    await act(async () => { await result.current.execute(); });

    expect(action).toHaveBeenCalledTimes(2);
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

  it("uses latest action reference without recreating execute", async () => {
    const { result, rerender } = renderHook(({ n }) =>
      useAsyncAction(async () => n), { initialProps: { n: 1 } }
    );
    const firstExecute = result.current.execute;

    rerender({ n: 2 });
    // execute callback should be the same reference (stable)
    expect(result.current.execute).toBe(firstExecute);

    // but it should use the latest action value
    const val = await act(async () => result.current.execute());
    expect(val).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useConfirmAction
// ─────────────────────────────────────────────────────────────────────────────

describe("useConfirmAction", () => {
  it("starts with pendingId = null", () => {
    const { result } = renderHook(() => useConfirmAction(async () => {}));
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

  it("second trigger with same id executes the action and resets pendingId", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() => useConfirmAction(action));

    await act(async () => { await result.current.trigger("id1"); });
    await act(async () => { await result.current.trigger("id1"); });

    expect(action).toHaveBeenCalledWith("id1");
    expect(result.current.pendingId).toBeNull();
  });

  it("second trigger with different id re-arms without executing", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() => useConfirmAction(action));

    await act(async () => { await result.current.trigger("id1"); });
    await act(async () => { await result.current.trigger("id2"); });

    expect(action).not.toHaveBeenCalled();
    expect(result.current.pendingId).toBe("id2");
  });

  it("resets pendingId after timeout expires", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useConfirmAction(action, { timeout: 3000 })
    );

    await act(async () => { await result.current.trigger("id1"); });
    expect(result.current.pendingId).toBe("id1");

    act(() => vi.runAllTimers());
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

  it("does not toast successMessage when not provided", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() => useConfirmAction(action));

    await act(async () => { await result.current.trigger("id1"); });
    await act(async () => { await result.current.trigger("id1"); });

    // Only the confirmMessage toast on first trigger, no success toast
    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith("Tap again to confirm", "info");
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

  it("resets pendingId after failed action", async () => {
    const action = vi.fn(async () => { throw new Error("nope"); });
    const { result } = renderHook(() => useConfirmAction(action));

    await act(async () => { await result.current.trigger("id1"); });
    await act(async () => { await result.current.trigger("id1"); });

    expect(result.current.pendingId).toBeNull();
  });

  it("calls onSuccess callback after successful action", async () => {
    const onSuccess = vi.fn();
    const action = vi.fn(async () => {});
    const { result } = renderHook(() => useConfirmAction(action, { onSuccess }));

    await act(async () => { await result.current.trigger("id1"); });
    await act(async () => { await result.current.trigger("id1"); });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("does not call onSuccess when action throws", async () => {
    const onSuccess = vi.fn();
    const action = vi.fn(async () => { throw new Error("fail"); });
    const { result } = renderHook(() => useConfirmAction(action, { onSuccess }));

    await act(async () => { await result.current.trigger("id1"); });
    await act(async () => { await result.current.trigger("id1"); });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("clears existing timer and restarts it when re-triggered with new id", async () => {
    const action = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useConfirmAction(action, { timeout: 3000 })
    );

    await act(async () => { await result.current.trigger("id1"); });

    // Advance half of timeout — id1 timer still running
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.pendingId).toBe("id1");

    // Re-trigger with id2 — should clear id1 timer and start fresh
    await act(async () => { await result.current.trigger("id2"); });
    expect(result.current.pendingId).toBe("id2");

    // After the ORIGINAL timeout would have fired, pendingId still "id2"
    act(() => vi.advanceTimersByTime(1600));
    expect(result.current.pendingId).toBe("id2");

    // After a full new timeout, pendingId resets
    act(() => vi.runAllTimers());
    expect(result.current.pendingId).toBeNull();
  });

  it("uses default confirmMessage 'Tap again to confirm' when none provided", async () => {
    const { result } = renderHook(() => useConfirmAction(async () => {}));
    await act(async () => { await result.current.trigger("x"); });
    expect(mockToast).toHaveBeenCalledWith("Tap again to confirm", "info");
  });

  it("uses default errorMessage 'Action failed' when none provided", async () => {
    const action = async () => { throw new Error("x"); };
    const { result } = renderHook(() => useConfirmAction(action));
    await act(async () => { await result.current.trigger("x"); });
    await act(async () => { await result.current.trigger("x"); });
    expect(mockToast).toHaveBeenCalledWith("Action failed", "error");
  });
});
